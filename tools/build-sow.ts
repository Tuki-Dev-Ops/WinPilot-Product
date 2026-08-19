import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { FEATURES, type ViewId } from '@winpilot/spec';
import { FNB_BRAND } from '@winpilot/store';
import { pages as clientPages } from '../apps/fnb-client-a/pages.manifest';
import { pages as adminPages } from '../apps/fnb-admin/pages.manifest';
import {
  SCREEN_SPECS as clientSpecs,
  COMMON_NON_FUNCTIONAL as clientCommon,
  type ScreenSpec,
} from '../apps/fnb-client-a/lib/screen-specs';
import { SCREEN_SPECS as adminSpecs } from '../apps/fnb-admin/lib/screen-specs';
import { IA_GROUPS as clientIa } from '../apps/fnb-client-a/lib/ia-groups';
import { IA_GROUPS as adminIa } from '../apps/fnb-admin/lib/ia-groups';
import { FNB_MENU } from '../apps/fnb-admin/lib/navigation/fnb-menu';
import { formal, formalAction } from './lib/polite';

/**
 * F&B 한 쌍의 **업무 범위 정의서**를 만든다 — 기획 · UI 디자인 · Front-End · Back-End.
 *
 * ## 왜 Depth 로 적는가
 * 범위를 줄글이나 수량표로만 적으면 "화면 47개" 까지는 합의되는데 **그 화면 안에 무엇이
 * 들어가는가**에서 갈린다. 인수 자리에서 다투는 것은 늘 그 안쪽이다.
 *
 * 그래서 앱 → 갈래 → 화면 → 세부 항목 네 단으로 편다. 같은 값이 이어지는 칸은 `rowspan`
 * 으로 묶어 나무처럼 읽히게 한다. 줄마다 앱 이름을 되풀이하면 어디서 갈래가 바뀌는지 눈에
 * 들어오지 않는다.
 *
 * 네 갈래가 보는 것이 다르다 — 기획은 **왜 있고 무엇을 하기로 했는가**, UI 디자인은
 * **무엇으로 이루어졌는가**, Front-End 는 **화면에서 어떻게 도는가**, Back-End 는 **서버가
 * 무엇을 맡아야 하는가**. 넷을 한 표에 넣으면 어느 줄이 누구의 일인지 알 수 없어진다.
 *
 * BX(로고 · BI · 패키지 · 촬영)는 제공하지 않는다. 갈래를 두지 않고 범위 밖 표에만 적는다 —
 * 빈 갈래를 세워 두면 나중에 채우기로 한 것으로 읽힌다.
 *
 * ## 내용을 손으로 적지 않는다
 * 손으로 옮겨 적으면 화면이 하나 늘 때 고칠 곳이 둘이 되고, 실제로는 한쪽만 고친다. 그러면
 * 계약 자리에서 코드와 문서가 다른 말을 한다.
 *
 * 여기 줄은 전부 저장소에서 읽은 것이다 — 화면 등록부 · IA 묶음 · 화면 명세 · 기능
 * 레지스트리. `pnpm sow:build` 를 다시 돌리면 지금 코드와 맞는 문서가 나온다.
 *
 * ## 범위 밖은 0 이 아니라 —
 * 서버 · 결제 · 촬영처럼 이 과업에 없는 것에 `0` 을 적으면 **하기로 했는데 아직 안 한 것**
 * 으로 읽힌다. 따로 표를 두고 왜 없는지를 적는다.
 *
 * ## HTML 로 내는 이유
 * 받는 쪽이 바로 인쇄해 PDF 로 만들 수 있어야 한다. 워드나 한글 파일은 만드는 쪽의 글꼴과
 * 여백에 기대므로 열 때마다 다르게 보인다. HTML 은 `@page` 와 `break-inside` 로 **끊기는
 * 자리를 지정할 수 있다.** 파일 하나로 끝나고 밖에서 받아 오는 것이 없어 메일로 보내도
 * 그대로 열린다.
 *
 * ```
 * pnpm sow:build
 * ```
 */

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 명세가 마크다운으로 적혀 있어 강조 표기를 태그로 바꾼다. */
const rich = (s: string): string =>
  esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

/**
 * 기능 정의 칸 — 한 줄이면 문단, 여럿이면 목록. 여럿을 한 문장으로 이으면 어디서 끊기는지
 * 보이지 않는다.
 *
 * 명세는 만드는 사람끼리 읽는 해라체로 적혀 있다. 밖으로 내보내는 문서이므로 여기서
 * 합쇼체로 올린다 — 원본을 고치지 않는 까닭은 `lib/polite.ts` 에 적었다.
 */
const note = (value: string | readonly string[], voice: (text: string) => string = formal): string => {
  const line = (text: string): string => rich(voice(text));
  if (typeof value === 'string') return line(value);
  if (value.length === 1) return line(value[0]);
  return `<ul>${value.map((text) => `<li>${line(text)}</li>`).join('')}</ul>`;
};

/* ── 저장소에서 읽은 값 ─────────────────────────────────────── */

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

const componentCount = (dir: string): number =>
  walk(dir).filter((p) => p.endsWith('.tsx') && p.includes('_components')).length;

const featuresOf = (view: ViewId) => FEATURES.filter((one) => view in one.views);

type IaLike = {
  id: string;
  label?: string;
  screens: readonly { screen: string; ko: string }[];
  /** 이 갈래의 화면이 읽고 쓰는 곳 — Back-End 단의 원본이 된다 */
  data: readonly string[];
};

/** 어드민 갈래는 이름을 사이드바에서 읽는다 — 도면과 메뉴가 다른 말을 하지 않게. */
const menuLabel = (id: string): string => FNB_MENU.find((one) => one.id === id)?.label ?? id;

type App = {
  label: string;
  dir: string;
  view: ViewId;
  pages: readonly { id: string; name: string; route: string }[];
  specs: readonly ScreenSpec[];
  ia: readonly IaLike[];
  /** 갈래 이름을 어디서 읽는가 — 고객 사이트는 직접 적고, 콘솔은 메뉴가 이긴다 */
  groupLabel: (group: IaLike) => string;
  /** 값을 쌓는 화면이 있는가 */
  readOnly: boolean;
};

const APPS: App[] = [
  {
    label: '고객 사이트',
    dir: 'fnb-client-a',
    view: 'fnb-client',
    pages: clientPages,
    specs: clientSpecs,
    ia: clientIa,
    groupLabel: (group) => group.label ?? group.id,
    readOnly: true,
  },
  {
    label: '운영 콘솔',
    dir: 'fnb-admin',
    view: 'fnb-admin',
    pages: adminPages,
    specs: adminSpecs,
    ia: adminIa,
    groupLabel: (group) => group.label ?? menuLabel(group.id),
    readOnly: false,
  },
];

const N = {
  screenClient: clientPages.length,
  screenAdmin: adminPages.length,
  screens: clientPages.length + adminPages.length,
  features: FEATURES.filter((one) => 'fnb-client' in one.views || 'fnb-admin' in one.views).length,
  featureClient: featuresOf('fnb-client').length,
  featureAdmin: featuresOf('fnb-admin').length,
  compClient: componentCount('apps/fnb-client-a/app'),
  compAdmin: componentCount('apps/fnb-admin/app'),
  common: clientCommon.length,
};

/* ── 나무 ──────────────────────────────────────────────────── */

type Item = {
  name: string;
  note: string | readonly string[];
  /** 기능 목록인가 — `…공지사항으로` 처럼 자리만 가리키고 끝나는 줄의 뜻이 달라진다 */
  action?: boolean;
};
type ScreenNode = { ko: string; route: string; items: Item[] };
type GroupNode = { label: string; screens: ScreenNode[] };
type AppNode = { label: string; groups: GroupNode[] };

/**
 * 앱 → 갈래 → 화면 → 세부 항목 나무를 만든다.
 *
 * 어느 갈래에도 들지 않는 화면이 있다(고객 사이트의 홈이 그렇다 — 일곱 갈래가 모두 거기서
 * 갈라지므로 어느 하나에 넣을 수 없다). 그런 화면은 마지막에 `공통` 으로 모은다. 빠뜨리면
 * 표의 화면 수가 등록부와 달라지고, 그 차이는 아무도 눈치채지 못한다.
 */
type Ctx = {
  spec: ScreenSpec;
  /** 이 갈래가 읽고 쓰는 곳 */
  data: readonly string[];
  route: string;
  /** 읽기만 하는 화면인가 — 서버가 열어야 할 연산이 갈린다 */
  readOnly: boolean;
};

const tree = (pick: (ctx: Ctx) => Item[]): AppNode[] =>
  APPS.map((app) => {
    const byId = new Map(app.specs.map((one) => [one.screen, one]));
    const pageById = new Map(app.pages.map((one) => [one.id, one]));
    const placed = new Set<string>();

    const node = (id: string, ko: string, data: readonly string[]): ScreenNode | null => {
      const page = pageById.get(id);
      const spec = byId.get(id);
      if (!page || !spec) return null;
      placed.add(id);
      /*
        고객 사이트는 읽기만 한다 — 창업 상담 신청 한 곳만 값을 쌓는다. 그 하나 때문에
        사이트 전체를 쓰기 가능으로 두면 서버가 열지 않아도 될 연산까지 명세에 오른다.
      */
      const readOnly = app.readOnly && !page.route.endsWith('/apply');
      const items = pick({ spec, data, route: page.route, readOnly });
      return items.length > 0 ? { ko, route: page.route, items } : null;
    };

    const groups: GroupNode[] = [];
    for (const group of app.ia) {
      const screens = group.screens
        .map((one) => node(one.screen, one.ko, group.data))
        .filter((one) => one !== null);
      if (screens.length > 0) groups.push({ label: app.groupLabel(group), screens });
    }

    const loose = app.pages
      .filter((page) => !placed.has(page.id))
      .map((page) => node(page.id, page.name, []))
      .filter((one) => one !== null);
    if (loose.length > 0) groups.push({ label: '공통', screens: loose });

    /*
      세울 항목이 하나도 없어 표에서 빠진 화면을 알린다. 범위 문서에서 화면이 사라지는 것은
      범위가 줄어든 것으로 읽히는데, 조용히 빠지면 만든 사람도 모른다.
    */
    const shown = new Set(groups.flatMap((group) => group.screens.map((screen) => screen.route)));
    const dropped = app.pages.filter((page) => !shown.has(page.route));
    if (dropped.length > 0) {
      console.warn(`  [빠짐] ${app.dir} — ${dropped.map((one) => one.id).join(', ')}`);
    }

    return { label: app.label, groups };
  });

/**
 * 나무를 표로 편다 — **화면 하나가 묶음 하나**다.
 *
 * 처음에는 1Depth 를 앱 전체로 묶었다. 그러자 133줄이 한 칸이 되어 글자가 표 한가운데
 * 놓였고, 인쇄하면 그 칸이 여러 쪽에 걸치면서 **앞쪽 몇 장은 1Depth 가 통째로 비었다.**
 * 칸을 나누는 선은 종이 위에서 끊기지만 글자는 한 번만 찍히기 때문이다.
 *
 * 그래서 세 단을 모두 화면 단위로 묶는다. 같은 앱 이름이 화면마다 되풀이되지만, 어느 쪽을
 * 펴도 그 줄이 어느 앱 · 어느 갈래의 것인지 읽힌다. 되풀이가 빈칸보다 낫다.
 */
const rows = (apps: AppNode[]): string => {
  const out: string[] = [];
  for (const app of apps) {
    for (const group of app.groups) {
      for (const screen of group.screens) {
        const span = screen.items.length;
        screen.items.forEach((item, index) => {
          const cells =
            index === 0
              ? [
                  `<td class="d1" rowspan="${span}">${esc(app.label)}</td>`,
                  `<td class="d2" rowspan="${span}">${esc(group.label)}</td>`,
                  `<td class="d3" rowspan="${span}">${esc(screen.ko)}<span class="route">${esc(screen.route)}</span></td>`,
                ]
              : [];
          cells.push(`<td class="d4">${esc(item.name)}</td>`);
          cells.push(`<td class="memo">${note(item.note, item.action ? formalAction : formal)}</td>`);
          out.push(`<tr${index === 0 ? ' class="head"' : ''}>${cells.join('')}</tr>`);
        });
      }
    }
  }
  return out.join('');
};

const table = (title: string, lead: string, apps: AppNode[]): string => `
<h2 class="band">${esc(title)}</h2>
<p class="lead">${rich(lead)}</p>
<table class="depth">
  <thead>
    <tr>
      <th style="width:64px">1Depth</th>
      <th style="width:78px">2Depth</th>
      <th style="width:104px">3Depth</th>
      <th style="width:150px">4Depth</th>
      <th>기능 정의</th>
    </tr>
  </thead>
  <tbody>${rows(apps)}</tbody>
</table>`;

/* ── 세 갈래 ───────────────────────────────────────────────── */

/**
 * 기획 — 화면이 **왜 있고 무엇을 하기로 했는가**.
 *
 * 세부 기능 목록을 Front-End 와 겹쳐 싣는다. 겹치는 것이 낭비로 보이지만, 기획 단에서는
 * **무엇을 하기로 했는가**를 정하고 Front-End 단에서는 **그것이 화면에서 어떻게 도는가**를
 * 적는다. 앞의 것이 빠지면 구현이 기획을 앞질러도 알아챌 방법이 없다.
 */
const PLAN = tree(({ spec }) => {
  const items: Item[] = [{ name: '화면 목적', note: spec.purpose }];
  if (spec.effect) items.push({ name: '기대 효과', note: spec.effect });
  items.push({ name: `세부 기능 정의 ${spec.actions.length}건`, note: spec.actions, action: true });
  if (spec.policy?.length) items.push({ name: '운영 정책', note: spec.policy });
  return items;
});

/**
 * UI 디자인 — 화면이 **무엇으로 이루어졌는가**. 영역 하나가 한 줄이다.
 *
 * 영역이 아직 안 적힌 화면도 한 줄은 세운다. 빈 배열을 그대로 두면 그 화면이 표에서 사라지고,
 * 범위 문서에서 화면이 사라지는 것은 곧 **범위가 줄어든 것**으로 읽힌다.
 */
const DESIGN = tree(({ spec }) =>
  spec.areas?.length
    ? spec.areas.map((area) => ({
        name: area.area,
        note: area.when ? `${area.purpose} · 표시 조건: ${area.when}` : area.purpose,
      }))
    : [{ name: '화면 디자인', note: '구성 영역이 아직 명세에 적히지 않았습니다.' }],
);

/**
 * Front-End — 세부 기능이 **화면에서 어떻게 도는가**. 기능 하나가 한 줄이다.
 *
 * 4Depth 에 기능 번호를 매긴다. 검토 회신에서 "세 번째 줄" 이라고 부르면 줄이 하나 늘거나
 * 빠진 뒤에는 서로 다른 것을 가리키게 된다. 번호는 화면 안에서만 이어진다.
 *
 * 단추가 적힌 기능은 눌렀을 때 · 성공했을 때 · 실패했을 때를 함께 적는다. 기능 이름만으로는
 * 실패가 어떻게 보이는지 알 수 없고, 그 자리가 인수 때 다투는 자리다.
 */
const FRONT = tree(({ spec }) => {
  const buttons = spec.buttons ?? [];
  const items: Item[] = spec.actions.map((action, index) => {
    const button = buttons.find((one) => action.includes(one.label));
    const lines = [action];
    if (button) {
      lines.push(`누르면 ${button.onClick}`);
      if (button.onSuccess) lines.push(`성공 시 ${button.onSuccess}`);
      if (button.onFail) lines.push(`실패 시 ${button.onFail}`);
    }
    return { name: `기능 ${String(index + 1).padStart(2, '0')}`, note: lines, action: true };
  });
  if (spec.guards.length > 0) items.push({ name: '제약 · 예외 처리', note: spec.guards });
  if (spec.nonFunctional.length > 0) items.push({ name: '비기능 요건', note: spec.nonFunctional });
  return items;
});

const PUBLIC_ACCESS = '누구나 읽습니다. 로그인을 요구하지 않으며, 쓰기 연산은 열지 않습니다.';
const ADMIN_ACCESS = '인증된 운영자만 호출합니다. 개인정보가 담긴 창업 문의는 권한을 따로 나누기를 권고합니다.';

/**
 * 화면 주소에서 **서버가 해야 할 일**을 읽는다.
 *
 * 주소 규칙이 곧 연산이다 — `/menus` 는 목록, `/menus/[itemId]` 는 단건, `/menus/new` 는
 * 등록. 이 규칙은 화면 등록부가 강제하므로(`spec:check`) 주소를 보고 연산을 말할 수 있다.
 *
 * 화면마다 손으로 적지 않는 까닭은 늘 같다 — 화면이 하나 늘 때 고칠 곳이 둘이 되면 한쪽만
 * 고치게 된다.
 */
const operations = (route: string, readOnly: boolean): string[] => {
  if (readOnly) {
    return route.includes('[')
      ? ['단건 조회 — 주소의 식별자로 하나를 찾아 내려보냅니다. 없거나 공개가 꺼진 것은 404 로 답합니다.']
      : ['목록 조회 — 공개 상태인 것만, 정해진 차례대로 내려보냅니다.'];
  }
  if (route.endsWith('/new')) {
    return [
      '등록 — 받은 값을 검증한 뒤 새로 만듭니다. 식별자는 서버가 발급합니다.',
      '중복 확인 — 같은 값이 이미 있는지 저장 전에 확인합니다.',
    ];
  }
  if (route.includes('[')) {
    return [
      '단건 조회 — 주소의 식별자로 하나를 찾습니다. 없으면 404 로 답합니다.',
      '수정 — 받은 값을 검증한 뒤 덮어씁니다. 바뀐 항목만 이력에 남깁니다.',
      '삭제 — 목록에서 즉시 감춘 뒤, 데이터 정책의 파기 기준에 따라 지웁니다.',
      '상태 변경 — 공개 · 고정 등 노출을 가르는 값을 따로 바꿉니다.',
    ];
  }
  return [
    '목록 조회 — 검색어 · 조건 · 정렬 · 쪽 나눔을 받습니다.',
    '건수 집계 — 조건에 걸린 전체 건수를 함께 내려보냅니다. 쪽 나눔이 이 값을 씁니다.',
    '일괄 처리 — 여러 건을 골라 상태를 바꾸거나 지웁니다.',
  ];
};

/**
 * Back-End — 서버가 **무엇을 맡아야 하는가**.
 *
 * 본 과업에는 서버가 없다. 그렇다고 이 칸을 비워 두면 뒤에 서버를 맡는 사람이 화면을 눌러
 * 보며 필요한 것을 짐작해야 하고, 짐작은 늘 어긋난다. 그래서 **지금 화면이 실제로 필요로
 * 하는 것**에서 서버의 일을 끌어내 적는다.
 *
 * 끌어낸 것과 확정된 것을 섞지 않는다 — 보존 기간처럼 발주처가 정해야 하는 값은 뒤의
 * 「데이터 정책」에 `권고` 로 따로 모았다. 여기 적힌 것을 정해진 값으로 읽으면 안 된다.
 */
const BACK = tree(({ spec, data, route, readOnly }) => {
  const items: Item[] = [
    { name: '데이터 연산', note: operations(route, readOnly) },
    { name: '권한', note: readOnly ? PUBLIC_ACCESS : ADMIN_ACCESS },
  ];
  if (data.length > 0) items.push({ name: '대상 데이터', note: data });
  if (spec.fields?.length) {
    items.push({
      name: `항목 정의 ${spec.fields.length}건`,
      note: spec.fields.map(
        (one) =>
          `${one.name} · ${one.type}${one.required ? ' · 필수' : ''}${one.rule ? ` · ${one.rule}` : ''}`,
      ),
    });
  }
  if (spec.validations?.length) items.push({ name: '저장 전 검증', note: spec.validations });
  if (readOnly && spec.admin.length > 0) items.push({ name: '값의 출처', note: spec.admin });
  return items;
});

/* ── 데이터 정책 ───────────────────────────────────────────── */

/**
 * 서버를 맡는 쪽이 **정해 놓고 시작해야 하는 것**들.
 *
 * 기능은 화면에서 끌어낼 수 있지만 보존 기간과 파기 시점은 화면에 드러나지 않는다. 그런데
 * 이것을 안 정하고 만들면 나중에 "언제 지우기로 했더라" 를 물을 곳이 없고, 개인정보가 담긴
 * 창업 문의는 그 물음이 곧 위험이 된다.
 *
 * **여기 적힌 기간은 전부 `권고` 다.** 근거로 삼은 법령을 함께 적었지만, 실제 값은 발주처가
 * 정한다. 지어낸 수를 확정된 값처럼 적어 두면 그것이 그대로 굳는다.
 */
const POLICY: [string, string, string][] = [
  [
    '수집',
    '수집 항목',
    '창업 상담 신청에서 받는 값 — 성함 · 연락처 · 지역 · 예산 · 하고 싶은 말. 실제 항목은 Back-End 표의 「항목 정의」와 같습니다.',
  ],
  [
    '수집',
    '수집 근거',
    '정보주체의 동의입니다. 신청 화면에 동의 여부를 따로 받는 칸이 있으며, 동의하지 않으면 접수되지 않습니다.',
  ],
  [
    '수집',
    '최소 수집',
    '상담에 필요하지 않은 값은 받지 않습니다. 항목을 늘릴 때에는 동의 문구도 함께 고쳐야 합니다.',
  ],
  [
    '보유',
    '보유 · 이용 기간',
    '**권고 — 상담 종료 후 3년.** 「전자상거래 등에서의 소비자보호에 관한 법률」 시행령이 소비자 불만 · 분쟁 처리 기록을 3년간 보존하도록 하는 것을 근거로 삼았습니다. 발주처 확인이 필요합니다.',
  ],
  [
    '보유',
    '기간의 기산점',
    '접수일이 아니라 **상담이 끝난 날**부터 셉니다. 접수일 기준으로 하면 상담이 길어진 건이 진행 중에 지워집니다.',
  ],
  [
    '삭제',
    '정보주체의 삭제 요청',
    '요청을 받으면 지체 없이 지웁니다. **권고 — 접수 후 10일 이내**, 「개인정보 보호법」의 열람 · 정정 · 삭제 처리 기한을 따랐습니다. 처리 결과를 요청인에게 알립니다.',
  ],
  [
    '삭제',
    '운영자의 삭제',
    '목록에서는 즉시 감추되 바로 지우지 않습니다. **권고 — 감춘 뒤 30일 보관 후 완전 삭제.** 잘못 지운 것을 되돌릴 창구가 없으면 운영자가 삭제 단추를 못 누릅니다.',
  ],
  [
    '삭제',
    '삭제 대상의 범위',
    '본문뿐 아니라 첨부 · 검색 색인 · 캐시에 남은 사본까지 함께 지웁니다. 한 곳만 지우면 검색 결과에는 계속 뜹니다.',
  ],
  [
    '소멸',
    '보유 기간 만료',
    '기간이 지난 값은 **자동으로 파기**합니다. 사람이 지우기로 하면 잊습니다. **권고 — 하루 한 번 정해진 시각에 도는 일괄 처리**로 그날 만료된 것을 처리합니다.',
  ],
  [
    '소멸',
    '미처리 문의의 자동 종결',
    '연락이 닿지 않아 멈춘 문의를 열린 채로 두면 처리 건수가 실제와 달라집니다. **권고 — 마지막 접촉일로부터 1년이 지나면 「종결」로 자동 전환**하고, 그때부터 보유 기간을 셉니다.',
  ],
  [
    '소멸',
    '파기 방법',
    '전자적 파일은 복구할 수 없는 방법으로 지웁니다. 출력물이 있다면 파쇄하거나 소각합니다.',
  ],
  [
    '소멸',
    '파기 기록',
    '무엇을 언제 몇 건 파기했는지 남깁니다. 개인정보 자체는 남기지 않고 건수와 시각만 남깁니다.',
  ],
  [
    '이력',
    '변경 이력',
    '등록 · 수정 · 삭제마다 **누가 · 언제 · 무엇을 바꿨는지**를 남깁니다. 값이 왜 이렇게 되어 있는지를 나중에 물을 곳이 여기뿐입니다. **권고 — 1년 보관.**',
  ],
  [
    '이력',
    '접근 기록',
    '개인정보가 담긴 창업 문의를 **열어 본 기록**을 남깁니다. 바꾼 기록만으로는 누가 들여다봤는지 알 수 없습니다.',
  ],
  [
    '권한',
    '운영자 권한',
    '콘솔은 인증된 운영자만 씁니다. **권고 — 창업 문의는 권한을 따로 나눕니다.** 메뉴 값을 고치는 일과 손님의 연락처를 보는 일은 같은 무게가 아닙니다.',
  ],
  [
    '권한',
    '권한 회수',
    '퇴사 · 담당 변경 시 계정을 즉시 막습니다. 콘솔에 운영자 관리 화면이 있으므로 그 화면에서 처리합니다.',
  ],
  [
    '보안',
    '전송 구간',
    '사이트와 콘솔 모두 HTTPS 로만 엽니다. 창업 문의는 개인정보가 오가는 길입니다.',
  ],
  [
    '보안',
    '저장 시 암호화',
    '**권고 — 연락처는 암호화해 저장**하고, 목록에서는 일부를 가려 보여 줍니다. 목록 화면은 여러 사람이 함께 보는 자리입니다.',
  ],
  [
    '백업',
    '백업 주기 · 보관',
    '**권고 — 하루 한 번, 30일 보관.** 백업본에도 같은 파기 정책이 걸립니다. 본체에서 지운 값이 백업에 남아 있으면 지운 것이 아닙니다.',
  ],
];

/**
 * 세 칸짜리 표를 편다 — 첫 칸이 이어지면 묶는다.
 *
 * 「구분」이 줄마다 되풀이되면 어디서 갈래가 바뀌는지 눈으로 셈해야 한다. 화면별 표와 달리
 * 여기는 갈래가 서너 줄로 짧아 인쇄해도 한 쪽 안에 들어가므로, 묶어도 빈칸이 생기지 않는다.
 */
const grouped = (list: readonly [string, string, string][]): string =>
  list
    .map(([area, what, why], index) => {
      const first = list[index - 1]?.[0] !== area;
      /* 같은 이름이 떨어져서 두 번 나올 때를 대비해 **이어지는 만큼만** 센다. */
      let span = 0;
      while (list[index + span]?.[0] === area) span += 1;
      const head = first ? `<td class="d1" rowspan="${span}">${esc(area)}</td>` : '';
      return `<tr${first ? ' class="head"' : ''}>${head}<td class="d4">${rich(what)}</td><td class="memo">${note(why)}</td></tr>`;
    })
    .join('');

const policyRows = grouped(POLICY);

const countRows = (apps: AppNode[]): number =>
  apps.reduce(
    (sum, app) =>
      sum +
      app.groups.reduce(
        (inner, group) => inner + group.screens.reduce((last, screen) => last + screen.items.length, 0),
        0,
      ),
    0,
  );

/* ── 범위 밖 ───────────────────────────────────────────────── */

const OUT: [string, string, string][] = [
  ['BX', '로고 · BI 가이드 제작', '**BX 는 제공하지 않는 서비스입니다.** 로고는 원본 파일을 받아 그대로 씁니다 — 눈으로 보고 다시 그린 로고는 그 브랜드의 표장이 아닙니다.'],
  ['BX', '패키지 · 인쇄물 · 편집 디자인', 'BX 범위이므로 제공하지 않습니다. 본 과업은 웹 화면에 한정합니다.'],
  ['BX', 'SNS · 프로모션 콘텐츠 디자인', '같은 이유로 제공하지 않습니다.'],
  ['BX', '제품 · 모델 촬영 · 영상 제작', '메뉴 사진과 영상은 발주처가 제공합니다.'],
  ['기획', '경쟁사 분석 · 시장 조사', '발주처가 제공하는 브랜드 기준을 따릅니다.'],
  ['UI 디자인', '시안 파일 (PSD · AI)', '디자인은 실제로 동작하는 화면으로 인도합니다. 별도 시안 파일은 만들지 않습니다.'],
  ['Back-End', '서버 · 데이터베이스 **구현**', '**정의는 본 문서에 포함되고, 구현은 포함되지 않습니다.** 「Back-End」와 「데이터 정책」 두 표가 뒤에 맡는 쪽의 착수 명세가 됩니다.'],
  ['Back-End', 'API 개발 · 배포', '같은 구분입니다. 화면이 필요로 하는 연산 · 권한 · 항목 · 검증은 정의해 두었습니다.'],
  ['Back-End', '회원 · 로그인 · 권한 **구현**', '화면까지만 만듭니다. 입력한 값은 지금은 어디로도 전송되지 않습니다.'],
  ['Back-End', '온라인 주문 · 결제', '**정의도 하지 않습니다.** 이 브랜드는 주문을 전화와 매장 방문으로 받습니다.'],
  ['Back-End', '메일 · 문자 발송', '정의하지 않습니다. 창업 문의는 값을 받는 양식까지 제공합니다.'],
  ['Back-End', '지도 · 예약 · POS 등 외부 연동', '정의하지 않습니다. 지도는 화면에서 지도 SDK 를 직접 부릅니다.'],
  ['운영', '서버 구성 · 배포 · 호스팅', '인수 시점의 산출물은 소스와 문서입니다.'],
  ['운영', '취약점 진단 · 보안 점검', '포함하지 않습니다. 「데이터 정책」의 보안 항목은 점검이 아니라 설계 기준입니다.'],
  ['운영', '콘텐츠 제작 · 등록 대행', '메뉴 사진과 문구는 발주처가 제공하며, 등록은 콘솔에서 직접 하십니다.'],
];


const outRows = grouped(OUT);

/**
 * 만든 날. 문서가 생성물이라 **언제 기준인가**가 곧 유효기간이다 — 날짜가 없으면 받는 쪽이
 * 지난 판을 최신으로 읽는다.
 */
const today = new Date().toLocaleDateString('ko-KR', { dateStyle: 'long' });

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>F&amp;B 업무 범위 정의서</title>
<style>
  /*
    인쇄를 먼저 생각한 판이다. 화면에서 예쁘게 보이는 것보다, A4 로 뽑았을 때 줄이 페이지
    사이에서 잘리지 않는 것이 중요하다.
  */
  @page { size: A4; margin: 14mm 12mm 16mm; }

  :root {
    --ink: #1a1c20;
    --muted: #5a6070;
    --faint: #939aa6;
    --line: #c9ced7;
    --band: #eceef2;
    --head: #f5f6f8;
    --d1: #f2f4f7;
    --d2: #f7f8fa;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    padding: 26px 22px 56px;
    background: #fff;
    color: var(--ink);
    font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", system-ui, sans-serif;
    font-size: 9.5pt;
    line-height: 1.6;
    /* 한글은 낱말 한가운데서 끊긴다. 띄어쓰기 단위로만 끊게 한다. */
    word-break: keep-all;
    overflow-wrap: break-word;
  }

  .sheet { max-width: 200mm; margin: 0 auto; }

  .title-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
  }
  h1 { font-size: 17pt; margin: 0; letter-spacing: -0.02em; }
  h1 .dim { color: var(--faint); font-weight: 600; }
  .date { color: var(--muted); font-size: 9pt; font-style: italic; white-space: nowrap; }

  table { width: 100%; border-collapse: collapse; margin: 0 0 18px; }
  th, td { border: 1px solid var(--line); padding: 4px 7px; vertical-align: middle; }

  .ident th { width: 100px; background: var(--head); text-align: center; font-weight: 600; }

  .common { margin-bottom: 18px; }
  .common th { background: var(--band); text-align: center; font-weight: 700; font-size: 10pt; padding: 5px; }
  .common td { padding: 10px 14px; }
  .common ol { margin: 0; padding-left: 18px; color: var(--muted); }
  .common li { margin: 2px 0; }
  .common li strong { color: var(--ink); }

  h2.band {
    background: var(--band);
    border: 1px solid var(--line);
    border-bottom: none;
    text-align: center;
    font-size: 11pt;
    font-weight: 700;
    letter-spacing: 0.3em;
    padding: 6px;
    margin: 22px 0 0;
    break-after: avoid;
  }
  p.lead {
    border: 1px solid var(--line);
    border-top: none;
    margin: 0;
    padding: 7px 12px;
    color: var(--muted);
    font-size: 9pt;
    break-after: avoid;
  }

  .depth thead th { background: var(--head); text-align: center; font-weight: 600; }
  .depth thead tr { break-inside: avoid; break-after: avoid; }
  .depth tbody tr { break-inside: avoid; }
  /* 화면이 바뀌는 자리에만 굵은 선. 앱 이름이 되풀이되므로 묶음의 경계는 선이 알려 준다. */
  .depth tbody tr.head > td { border-top: 1.4px solid #9aa1ad; }

  /*
    1·2·3Depth 는 rowspan 으로 묶여 여러 줄에 걸친다. 가운데 정렬해야 묶인 범위가 눈에 보인다.
    위로 붙이면 어디까지가 그 갈래인지 알 수 없다.
  */
  td.d1, td.d2, td.d3 { text-align: center; vertical-align: middle; }
  td.d1 { background: var(--d1); font-weight: 700; }
  td.d2 { background: var(--d2); font-weight: 600; }
  td.d3 { font-weight: 600; line-height: 1.4; }
  td.d3 .route {
    display: block;
    color: var(--faint);
    font-weight: 400;
    font-size: 8pt;
    font-family: "Consolas", "D2Coding", ui-monospace, monospace;
    word-break: break-all;
  }
  td.d4 { font-weight: 500; }
  td.memo { color: var(--muted); font-size: 9pt; }
  td.memo ul { margin: 0; padding-left: 15px; }
  td.memo li { margin: 1px 0; }

  code {
    font-family: "Consolas", "D2Coding", ui-monospace, monospace;
    font-size: 0.92em;
    background: #f1f3f6;
    padding: 0.5px 3px;
    border-radius: 3px;
  }

  @media print {
    body { padding: 0; }
  }
</style>
</head>
<body>
<div class="sheet">

<div class="title-row">
  <h1>${esc(FNB_BRAND.name)} <span class="dim">업무 범위 정의서</span></h1>
  <div class="date">${esc(today)}</div>
</div>

<table class="common">
  <tr><th>공통사항</th></tr>
  <tr><td>
    <ol>
      <li><strong>대상</strong> — F&amp;B 고객 사이트(<code>apps/fnb-client-a</code>)와 운영 콘솔(<code>apps/fnb-admin</code>) 한 쌍입니다. 손님이 보는 사이트와, 그 내용을 고치는 콘솔입니다.</li>
      <li><strong>범위 기준</strong> — 화면 ${N.screens}개(고객 ${N.screenClient} · 콘솔 ${N.screenAdmin}) · 기능 ${N.features}가지 · 컴포넌트 ${N.compClient + N.compAdmin}개입니다.</li>
      <li>본 문서의 내용은 <strong>현재 구현된 것을 읽어 만든 값</strong>입니다. 예정이 아니라 저장소의 화면 등록부 · IA 묶음 · 화면 명세 · 기능 레지스트리에서 기계로 뽑았습니다. 범위가 바뀌면 다시 만들어 갱신합니다.</li>
      <li>표는 <strong>앱 → 갈래 → 화면 → 세부 항목</strong> 네 단으로 읽습니다. 화면 하나가 한 묶음이며, 같은 값이 이어지는 칸은 묶어 두었습니다.</li>
      <li>네 갈래가 보는 것이 다릅니다 — <strong>기획</strong>은 왜 있고 무엇을 하기로 했는가, <strong>UI 디자인</strong>은 무엇으로 이루어졌는가, <strong>Front-End</strong>는 화면에서 어떻게 도는가, <strong>Back-End</strong>는 서버가 무엇을 맡아야 하는가.</li>
      <li><strong>Back-End 는 정의만 하고 구현하지 않습니다.</strong> 뒤에 맡는 쪽이 화면을 눌러 보며 짐작하지 않도록, 지금 화면이 실제로 필요로 하는 연산 · 권한 · 항목 · 검증을 끌어내 적었습니다. 「데이터 정책」의 보존 · 삭제 · 소멸 기준이 함께 착수 명세가 됩니다.</li>
      <li>「데이터 정책」에서 <strong>권고</strong>라고 적은 기간과 값은 <strong>확정된 것이 아닙니다.</strong> 근거로 삼은 법령을 함께 적었으나 실제 값은 발주처가 정합니다.</li>
      <li><strong>BX(로고 · BI · 패키지 · 촬영 · SNS 콘텐츠)는 제공하지 않습니다.</strong> 자세한 것은 마지막 「범위 밖」 표에 있습니다.</li>
      <li>메뉴 사진과 문구 등 <strong>콘텐츠는 발주처가 제공</strong>합니다. 본 과업은 받은 값을 화면에 세우는 일까지입니다.</li>
      <li><strong>현 단계에는 서버와 데이터베이스가 없습니다.</strong> 화면이 읽는 값은 공유 패키지 한 곳에 있으며, 콘솔에서 고친 값은 브라우저 안에서만 유지됩니다. 양식에 입력한 값은 전송되지 않습니다.</li>
      <li>화면은 <strong>1280 · 1024 · 768 · 390</strong> 네 너비에서 가로 스크롤 없이 동작합니다. 저장소의 검사 도구가 이를 자동으로 확인합니다.</li>
      <li>범위를 더하거나 빼는 일은 <strong>화면 등록부와 화면 명세를 고치는 것</strong>으로 시작하며, 본 문서와 기능 명세서가 함께 갱신됩니다. 문서만 고치거나 코드만 고치는 변경은 받지 않습니다.</li>
    </ol>
  </td></tr>
</table>

${table('기 획', '페이지마다 **왜 있는가**와 **무엇을 하기로 했는가**를 적습니다. 목적 · 기대 효과 · 세부 기능 정의 · 그 화면에서만 지키는 운영 정책입니다.', PLAN)}
${table('U I 디 자 인', '페이지마다 **무엇으로 이루어졌는가**를 적습니다. 구성 영역 하나가 한 줄이며, 언제 보이는지가 정해진 영역은 표시 조건을 함께 적었습니다. 네 너비(1280 · 1024 · 768 · 390) 반응형으로 만듭니다.', DESIGN)}
${table('F r o n t - E n d', '페이지마다 **세부 기능이 화면에서 어떻게 도는가**를 적습니다. 기능 하나가 한 줄이고, 단추가 있는 기능은 눌렀을 때 · 성공했을 때 · 실패했을 때를 함께 적었습니다.', FRONT)}
${table('B a c k - E n d', '페이지마다 **서버가 무엇을 맡아야 하는가**를 적습니다. **정의는 본 문서에 포함되고 구현은 포함되지 않습니다** — 뒤에 맡는 쪽이 화면을 눌러 보며 짐작하지 않도록, 지금 화면이 실제로 필요로 하는 연산 · 권한 · 대상 데이터 · 항목 · 검증을 끌어내 적었습니다. 보존과 파기 기준은 다음 「데이터 정책」에 있습니다.', BACK)}

<h2 class="band">데 이 터 정 책</h2>
<p class="lead">서버를 맡는 쪽이 <strong>정해 놓고 시작해야 하는 것</strong>들입니다. 기능은 화면에서 끌어낼 수 있지만 보존 기간과 파기 시점은 화면에 드러나지 않습니다. <strong>「권고」라고 적은 값은 확정된 것이 아니며</strong>, 근거로 삼은 법령을 함께 적었습니다.</p>
<table class="depth">
  <thead>
    <tr><th style="width:64px">구분</th><th style="width:150px">항목</th><th>정의 · 기준</th></tr>
  </thead>
  <tbody>${policyRows}</tbody>
</table>

<h2 class="band">범 위 밖</h2>
<p class="lead">아래는 <strong>이번 과업에 포함하지 않습니다.</strong> 적어 두지 않으면 포함된 것으로 읽히기 때문에 따로 둡니다.</p>
<table class="depth">
  <thead>
    <tr><th style="width:64px">갈래</th><th style="width:200px">항목</th><th>사유 · 지금 상태</th></tr>
  </thead>
  <tbody>${outRows}</tbody>
</table>

</div>
</body>
</html>
`;

const out = 'FnB-업무범위정의서.html';
writeFileSync(out, html, 'utf8');
console.log(
  `${out} — 화면 ${N.screens} · 기획 ${countRows(PLAN)}줄 · UI 디자인 ${countRows(DESIGN)}줄 · Front-End ${countRows(FRONT)}줄 · Back-End ${countRows(BACK)}줄`,
);
