import { pages as clientPages } from '../../apps/fnb-client-a/pages.manifest';
import { pages as adminPages } from '../../apps/fnb-admin/pages.manifest';
import {
  SCREEN_SPECS as clientSpecs,
  COMMON_NON_FUNCTIONAL,
  type ScreenSpec,
} from '../../apps/fnb-client-a/lib/screen-specs';
import { SCREEN_SPECS as adminSpecs } from '../../apps/fnb-admin/lib/screen-specs';
import { IA_GROUPS as clientIa } from '../../apps/fnb-client-a/lib/ia-groups';
import { IA_GROUPS as adminIa } from '../../apps/fnb-admin/lib/ia-groups';
import { FNB_MENU } from '../../apps/fnb-admin/lib/navigation/fnb-menu';

/**
 * F&B 두 앱의 화면을 **한 벌로 정리한 것**. 업무 범위 정의서와 기능 명세서가 함께 읽는다.
 *
 * ## 왜 가운데에 두나
 * 두 문서가 같은 화면을 다루는데 각자 매니페스트를 읽으면, 기능 ID 를 붙이는 규칙이 두 벌이
 * 된다. 그러면 범위 정의서의 `MENU-003` 과 기능 명세서의 `MENU-003` 이 다른 화면을
 * 가리키게 되고, 그 어긋남은 서로 다른 문서를 나란히 놓고 대조하기 전에는 드러나지 않는다.
 *
 * ## 기능 ID
 * 주제별 앞자리에 세 자리 일련번호를 붙인다 — `MENU-001`. 번호는 **고객 사이트 먼저,
 * 그다음 운영 콘솔** 순서다. 같은 주제를 양쪽에서 다루는 화면이 많아 주제를 앞세우는 편이
 * 찾기 쉽고, 어느 쪽 화면인지는 명세의 「서비스 구분」이 말한다.
 *
 * 앞자리는 받은 규칙(MENU · STORE · FRANCHISE · SUPPORT · MARKETING · BANNER · ADMIN ·
 * SETTING)을 그대로 쓰되, 그 여덟으로 담기지 않는 화면이 있어 넷을 더했다 — HOME · BRAND ·
 * INTERIOR · LEGAL. 없는 앞자리에 억지로 밀어 넣으면 `SUPPORT-007` 이 법적 고지가 되어
 * 목록에서 찾을 수 없게 된다.
 */

export type AppKind = 'client' | 'admin';

export type Screen = {
  /** 매니페스트의 id */
  id: string;
  /** 기능 ID — 두 문서가 같은 값을 쓴다 */
  featureId: string;
  /** 사람이 읽는 화면 이름 */
  name: string;
  route: string;
  app: AppKind;
  appLabel: string;
  /** 사용자 유형 — 권한 표의 근거가 된다 */
  actor: string;
  /** IA 갈래 */
  group: string;
  /** 1Depth > 2Depth > 3Depth */
  menuPath: string;
  /** 값을 쌓지 않는 화면인가 */
  readOnly: boolean;
  spec: ScreenSpec;
  /** 이 갈래가 읽고 쓰는 곳 */
  data: readonly string[];
};

/** 화면 id 앞부분으로 주제를 가른다. 먼저 걸리는 것이 이긴다 — 차례가 규칙이다. */
const PREFIX: [RegExp, string][] = [
  [/^dashboard$/, 'ADMIN'],
  [/^settings-admins/, 'ADMIN'],
  [/^settings/, 'SETTING'],
  [/^franchise-cost$/, 'FRANCHISE'],
  [/^banners/, 'BANNER'],
  [/^menus?/, 'MENU'],
  [/^marketing/, 'MARKETING'],
  [/^stores?/, 'STORE'],
  [/^(inquiries|franchise)/, 'FRANCHISE'],
  [/^support/, 'SUPPORT'],
  [/^(faqs?|notices?)/, 'SUPPORT'],
  [/^interior/, 'INTERIOR'],
  [/^(terms|privacy|legal)/, 'LEGAL'],
  [/^brand/, 'BRAND'],
  [/^home$/, 'HOME'],
];

const subjectOf = (id: string): string => PREFIX.find(([test]) => test.test(id))?.[1] ?? 'ETC';

type Source = {
  app: AppKind;
  appLabel: string;
  actor: string;
  readOnly: boolean;
  pages: readonly { id: string; name: string; route: string }[];
  specs: readonly ScreenSpec[];
  ia: readonly {
    id: string;
    label?: string;
    screens: readonly { screen: string; ko: string }[];
    data: readonly string[];
  }[];
  groupLabel: (group: { id: string; label?: string }) => string;
};

/** 콘솔 갈래는 이름을 사이드바에서 읽는다 — 문서와 메뉴가 다른 말을 하지 않게. */
const menuLabel = (id: string): string => FNB_MENU.find((one) => one.id === id)?.label ?? id;

const SOURCES: Source[] = [
  {
    app: 'client',
    appLabel: '고객 사이트',
    actor: '비회원',
    readOnly: true,
    pages: clientPages,
    specs: clientSpecs,
    ia: clientIa,
    groupLabel: (group) => group.label ?? group.id,
  },
  {
    app: 'admin',
    appLabel: '관리자',
    actor: '관리자',
    readOnly: false,
    pages: adminPages,
    specs: adminSpecs,
    ia: adminIa,
    groupLabel: (group) => group.label ?? menuLabel(group.id),
  },
];

/**
 * 화면을 한 줄로 편다.
 *
 * 갈래에 들지 않는 화면이 있다 — 고객 사이트의 홈이 그렇다. 일곱 갈래가 모두 거기서
 * 갈라지므로 어느 하나에 넣을 수 없다. 그런 화면은 `공통` 으로 모은다. 빠뜨리면 문서의
 * 화면 수가 등록부와 달라지고, 그 차이는 아무도 눈치채지 못한다.
 */
const collect = (): Screen[] => {
  const rows: Omit<Screen, 'featureId'>[] = [];

  for (const source of SOURCES) {
    const specById = new Map(source.specs.map((one) => [one.screen, one]));
    const pageById = new Map(source.pages.map((one) => [one.id, one]));
    const placed = new Set<string>();

    const push = (id: string, ko: string, group: string, data: readonly string[]): void => {
      const page = pageById.get(id);
      const spec = specById.get(id);
      if (!page || !spec) return;
      placed.add(id);
      rows.push({
        id,
        name: ko,
        route: page.route,
        app: source.app,
        appLabel: source.appLabel,
        actor: source.actor,
        group,
        menuPath: `${source.appLabel} > ${group} > ${ko}`,
        /* 고객 사이트에서 값을 쌓는 곳은 창업 상담 신청 하나다. */
        readOnly: source.readOnly && !page.route.endsWith('/apply'),
        spec,
        data,
      });
    };

    for (const group of source.ia) {
      const label = source.groupLabel(group);
      for (const one of group.screens) push(one.screen, one.ko, label, group.data);
    }
    for (const page of source.pages) {
      if (!placed.has(page.id)) push(page.id, page.name, '공통', []);
    }
  }

  /* 주제별로 번호를 매긴다. rows 가 이미 고객 → 콘솔 차례라 그대로 세면 된다. */
  const seen = new Map<string, number>();
  return rows.map((row) => {
    const subject = subjectOf(row.id);
    const next = (seen.get(subject) ?? 0) + 1;
    seen.set(subject, next);
    return { ...row, featureId: `${subject}-${String(next).padStart(3, '0')}` };
  });
};

export const SCREENS: Screen[] = collect();

export const CLIENT_SCREENS = SCREENS.filter((one) => one.app === 'client');
export const ADMIN_SCREENS = SCREENS.filter((one) => one.app === 'admin');

export { COMMON_NON_FUNCTIONAL };
export type { ScreenSpec };

/**
 * 콘솔 메뉴 이름(`등록 > 메뉴`)에서 그 메뉴가 여는 주소를 찾는다.
 *
 * 고객 화면의 명세에 적힌 값의 출처는 **메뉴 이름**이지 화면 이름이 아니다. 화면 이름으로
 * 짝지으려다 여러 건을 놓쳤다 — `창업 > 비용 · 절차`(메뉴)와 `창업 > 창업 비용 · 절차`
 * (화면)는 어느 쪽도 다른 쪽의 앞부분이 아니다. 메뉴를 거쳐 주소로 잇는다.
 */
const MENU_HREF = new Map<string, string>(
  FNB_MENU.flatMap((section) => [
    [section.label, section.href] as [string, string],
    ...(section.children ?? []).map(
      (child) => [`${section.label} > ${child.label}`, child.href] as [string, string],
    ),
  ]),
);

/** `등록 > 메뉴 (목록 · 등록 · 상세)` · `등록 > 메뉴 > 메뉴 묶음` — 둘 다 `등록 > 메뉴` 로 줄인다. */
const menuHrefOf = (binding: string): string | undefined => {
  const clean = binding.replace(/\s*[(（].*$/, '').trim();
  const parts = clean.split('>').map((one) => one.trim());
  return MENU_HREF.get(parts.slice(0, 2).join(' > ')) ?? MENU_HREF.get(parts[0] ?? '');
};

const under = (route: string, href: string): boolean => route === href || route.startsWith(`${href}/`);

/**
 * 콘솔에서 값을 고치면 **어느 고객 화면이 달라지는가**.
 *
 * 고객 화면마다 값이 오는 콘솔 메뉴가 적혀 있다. 그것을 뒤집으면 콘솔 화면별 영향 범위가
 * 나온다. 손으로 적으면 화면이 하나 늘 때 한쪽만 고쳐지므로 뒤집어서 만든다.
 */
export const impactOf = (admin: Screen): { screen: Screen; via: string }[] =>
  CLIENT_SCREENS.flatMap((client) => {
    const via = client.spec.admin.find((one) => {
      const href = menuHrefOf(one);
      return href !== undefined && under(admin.route, href);
    });
    return via ? [{ screen: client, via }] : [];
  });
