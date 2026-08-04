import { findBannedWords, isCanonical } from './glossary';
import {
  ACTION_ROUTE_TAIL,
  DYNAMIC_SEGMENT_PATTERN,
  FEATURE_ID_PATTERN,
  STATIC_SEGMENT_PATTERN,
  expectedComponentName,
  splitCollectionAndTail,
  splitRoute,
  stripViewPrefix,
} from './naming';
import { ACTIONS, VIEWS, VIEW_META, type FeatureSpec, type Issue, type ViewId } from './types';

export type ManifestEntry = { id: string; route: string };

export type ValidateInput = {
  features: readonly FeatureSpec[];
  /** 검사 대상 앱의 매니페스트. 앱(=뷰)마다 따로 돌린다. */
  manifest: readonly ManifestEntry[];
  /** 매니페스트를 제공한 뷰 */
  view: ViewId;
  devOnlyRoutes: readonly string[];
};

export function validateSpec({ features, manifest, view: manifestView, devOnlyRoutes }: ValidateInput): Issue[] {
  const issues: Issue[] = [];
  const push = (severity: Issue['severity'], code: string, where: string, message: string) =>
    issues.push({ severity, code, where, message });

  const seenIds = new Set<string>();
  /**
   * 라우트 중복은 **뷰 단위**로 본다.
   * 뷰마다 레포가 다르고 각자 자기 도메인의 루트를 가지므로,
   * `b2c-client` 의 `/` 와 `b2c-admin` 의 `/` 는 서로 다른 화면이며 충돌이 아니다.
   */
  const routeOwners = new Map<string, string>();
  const routeKey = (view: ViewId, route: string) => `${view}::${route}`;

  for (const feature of features) {
    const at = `feature '${feature.id}'`;

    if (!FEATURE_ID_PATTERN.test(feature.id)) {
      push('error', 'ID_FORMAT', at, `Feature ID 형식 위반 — 소문자와 점만 사용 (예: 'product.create')`);
    }
    if (seenIds.has(feature.id)) {
      push('error', 'ID_DUPLICATE', at, 'Feature ID 중복');
    }
    seenIds.add(feature.id);

    if (!ACTIONS.includes(feature.action)) {
      push('error', 'ACTION_UNKNOWN', at, `표준 동작 어휘가 아님 — 허용: ${ACTIONS.join(', ')}`);
    }
    if (!feature.id.endsWith(`.${feature.action}`)) {
      push('error', 'ID_ACTION_MISMATCH', at, `Feature ID 끝이 action('${feature.action}') 과 다름`);
    }
    if (!feature.id.includes(`${feature.entity}.`)) {
      push('error', 'ID_ENTITY_MISMATCH', at, `Feature ID 에 entity('${feature.entity}') 가 없음`);
    }

    if (!isCanonical(feature.entity)) {
      const banned = findBannedWords(feature.entity);
      if (banned.length > 0) {
        push('error', 'TERM_BANNED', at, `금지 용어 '${banned[0]?.found}' → '${banned[0]?.canonical}' 를 쓸 것`);
      } else {
        push('warn', 'TERM_UNREGISTERED', at, `entity '${feature.entity}' 가 용어 사전에 없음 — glossary.ts 에 등록할 것`);
      }
    }

    const boundViews = VIEWS.filter((view) => feature.views[view]);

    /*
      짝을 이루는 뷰끼리만 누락을 따진다.
      B2C Client 와 B2C Admin 은 같은 자원을 양쪽에서 다루므로 한쪽만 있으면 의심스럽다.
      반면 사내 어드민은 고객사를 관리하는 **다른 제품**이라, 상품·로그인 같은 기능이
      없는 것이 정상이다. 여기까지 짝을 맞추라고 경고하면 진짜 누락이 그 안에 묻힌다.
    */
    const pairedViews = VIEWS.filter((view) => VIEW_META[view].pairGroup === 'b2c');
    const boundPaired = pairedViews.filter((view) => feature.views[view]);
    const isPairedFeature = boundPaired.length > 0;

    if (boundViews.length === 0) {
      push('error', 'VIEW_EMPTY', at, '뷰 바인딩이 하나도 없음');
    } else if (isPairedFeature && boundPaired.length < pairedViews.length && !feature.singleViewByDesign) {
      const missing = pairedViews.filter((view) => !feature.views[view]);
      push(
        'warn',
        'VIEW_PARTIAL',
        at,
        `${missing.join(', ')} 뷰에 바인딩 없음 — 설계상 맞다면 singleViewByDesign: true 를 붙일 것`,
      );
    }

    for (const view of VIEWS) {
      const binding = feature.views[view];
      if (!binding) continue;
      const where = `${at} · ${view}`;

      const expected = expectedComponentName(view, feature);
      if (binding.component !== expected) {
        push('error', 'COMPONENT_NAME', where, `컴포넌트명이 규칙과 다름 — 기대 '${expected}', 실제 '${binding.component}'`);
      }
      for (const hit of findBannedWords(binding.component)) {
        push('error', 'TERM_BANNED', where, `컴포넌트명에 금지 용어 '${hit.found}' → '${hit.canonical}'`);
      }

      validateRoute(view, feature, binding.route, where, push);

      const key = routeKey(view, binding.route);
      const owner = routeOwners.get(key);
      if (owner) {
        push('error', 'ROUTE_DUPLICATE', where, `${view} 뷰에서 라우트 '${binding.route}' 가 '${owner}' 와 중복`);
      }
      routeOwners.set(key, feature.id);
    }
  }

  // 레지스트리 ↔ pages.manifest 대조 — 넘겨받은 뷰의 것만 본다.
  const manifestRoutes = new Set(manifest.map((entry) => entry.route));
  const excluded = new Set(devOnlyRoutes);

  for (const feature of features) {
    const binding = feature.views[manifestView];
    if (!binding || binding.status !== 'implemented') continue;
    if (!manifestRoutes.has(binding.route)) {
      push(
        'error',
        'MANIFEST_MISSING',
        `${feature.id} · ${manifestView}`,
        `구현 완료인데 ${manifestView} 의 pages.manifest.ts 에 없음 → Figma 페이지가 생성되지 않는다`,
      );
    }
  }

  for (const entry of manifest) {
    if (excluded.has(entry.route)) continue;
    if (!routeOwners.has(routeKey(manifestView, entry.route))) {
      push('warn', 'MANIFEST_ORPHAN', `manifest '${entry.id}'`, `라우트 '${entry.route}' 가 기능 레지스트리에 없음`);
    }
  }

  return issues;
}

function validateRoute(
  view: ViewId,
  feature: FeatureSpec,
  route: string,
  where: string,
  push: (severity: Issue['severity'], code: string, where: string, message: string) => void,
): void {
  const prefix = VIEW_META[view].routePrefix;
  const local = stripViewPrefix(view, route);

  if (local === null) {
    push('error', 'ROUTE_PREFIX', where, `${view} 뷰의 라우트는 '${prefix}' 로 시작해야 함 — 실제 '${route}'`);
    return;
  }

  for (const segment of splitRoute(local)) {
    const ok = STATIC_SEGMENT_PATTERN.test(segment) || DYNAMIC_SEGMENT_PATTERN.test(segment);
    if (!ok) {
      push(
        'error',
        'ROUTE_SEGMENT',
        where,
        `세그먼트 '${segment}' 규칙 위반 — 정적은 kebab-case, 동적은 [xxxId] 형태`,
      );
    }
  }

  const tailPattern = ACTION_ROUTE_TAIL[feature.action];
  if (tailPattern) {
    const { tail } = splitCollectionAndTail(local, feature.action);
    if (!tailPattern.test(tail)) {
      push(
        'error',
        'ROUTE_TAIL',
        where,
        `action '${feature.action}' 의 경로 꼬리가 규칙과 다름 — 기대 ${tailPattern}, 실제 '${tail || '(없음)'}'`,
      );
    }
  }
}
