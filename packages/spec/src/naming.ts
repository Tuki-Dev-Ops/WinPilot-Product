import { VIEW_META, type ActionId, type FeatureSpec, type ViewId } from './types';

/** `<entity>.<action>` 또는 `<domain>.<entity>.<action>` */
export const FEATURE_ID_PATTERN = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;

/** 정적 경로 세그먼트 — kebab-case */
export const STATIC_SEGMENT_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** 동적 경로 세그먼트 — Next.js 규약 + `Id` 접미 강제 (`[productId]`) */
export const DYNAMIC_SEGMENT_PATTERN = /^\[[a-z][a-zA-Z0-9]*Id\]$/;

export function pascal(input: string): string {
  return input
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * 뷰별 페이지 컴포넌트명.
 *
 * client: `ProductCreatePage` · admin: `AdminProductCreatePage`
 * 접두어 하나만 다르게 두는 이유 — 파일 검색 한 번으로 같은 기능의 두 구현을 나란히 찾을 수 있어야 한다.
 */
export function expectedComponentName(view: ViewId, feature: FeatureSpec): string {
  return `${VIEW_META[view].componentPrefix}${pascal(feature.entity)}${pascal(feature.action)}Page`;
}

/**
 * UIR 노드에 붙는 책임 컴포넌트 식별자 (`data-ssot-cid`).
 * 픽셀 diff 가 났을 때 어느 뷰의 어느 기능인지 이 값 하나로 특정된다.
 */
export function cid(view: ViewId, featureId: string): string {
  return `${view}/${featureId}`;
}

export function i18nKey(featureId: string): string {
  return `feature.${featureId}`;
}

export function testId(view: ViewId, featureId: string, part?: string): string {
  return part ? `${view}:${featureId}:${part}` : `${view}:${featureId}`;
}

/** Figma 프레임 이름 (페이지 이름은 pages.manifest 의 `{순번}. {이름}` 규칙을 따른다) */
export function figmaFrameName(view: ViewId, feature: FeatureSpec): string {
  return `${VIEW_META[view].label} / ${feature.label.en}`;
}

/**
 * 동작별 경로 꼬리 규칙.
 * 경로를 자동 생성하지는 않는다 — 복수형 변환은 언어별 예외가 많아 기계가 틀린다.
 * 대신 **선언된 경로가 이 규칙과 맞는지 검사**한다.
 */
export const ACTION_ROUTE_TAIL: Readonly<Partial<Record<ActionId, RegExp>>> = {
  list: /^$/,
  detail: /^\/\[[a-z][a-zA-Z0-9]*Id\]$/,
  create: /^\/new$/,
  edit: /^\/\[[a-z][a-zA-Z0-9]*Id\]\/edit$/,
  search: /^\/search$/,
  /**
   * `settings` 에는 경로 제약을 두지 않는다.
   * 설정 화면은 컬렉션이 아니라 단일 자원이라 `/settings/seo` 처럼 설정 네임스페이스
   * 아래로 묶이는 편이 자연스럽고, 컬렉션 꼬리 규칙을 그대로 적용하면 오히려 어긋난다.
   */
};

export function splitRoute(route: string): string[] {
  return route.split('/').filter(Boolean);
}

/** 뷰 네임스페이스를 제거한 나머지 경로 */
export function stripViewPrefix(view: ViewId, route: string): string | null {
  const prefix = VIEW_META[view].routePrefix;
  if (!prefix) return route;
  if (route === prefix) return '/';
  return route.startsWith(`${prefix}/`) ? route.slice(prefix.length) : null;
}

/** 경로에서 컬렉션 기준 경로와 동작 꼬리를 분리한다. */
export function splitCollectionAndTail(localRoute: string, action: ActionId): { base: string; tail: string } {
  const tailPattern = ACTION_ROUTE_TAIL[action];
  if (!tailPattern) return { base: localRoute, tail: '' };

  const segments = splitRoute(localRoute);
  // 꼬리 길이는 규칙에서 역산한다: list=0, create/search/settings=1, detail=1, edit=2
  const tailLength = action === 'edit' ? 2 : action === 'list' ? 0 : 1;
  const base = `/${segments.slice(0, Math.max(segments.length - tailLength, 0)).join('/')}`;
  const tail = tailLength === 0 ? '' : `/${segments.slice(segments.length - tailLength).join('/')}`;
  return { base: base === '/' ? '/' : base, tail };
}
