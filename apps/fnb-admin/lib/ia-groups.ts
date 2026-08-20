// `@/` 별칭 대신 상대 경로를 쓴다 — 이 모듈은 Next 밖(문서 생성 스크립트)에서도 읽힌다.
import { pages } from '../pages.manifest';
import { FNB_MENU } from './navigation/fnb-menu';

/**
 * IA 묶음 — **사이드바 섹션이 곧 갈래**다.
 *
 * 갈래를 여기서 새로 정하지 않고 `fnb-menu.ts` 의 섹션 id 를 그대로 쓴다. 따로 정하면 메뉴에
 * 항목을 하나 더했을 때 메뉴와 도면이 갈라지고, 그때부터 도면은 조용히 옛것이 된다. 갈래 이름도
 * 여기 적지 않는다 — `labelOf()` 가 메뉴에서 읽는다.
 *
 * 여기 적는 것은 메뉴가 **모르는 것**뿐이다: 목록에서만 들어가는 화면(등록·상세)의 한글 이름,
 * 화면끼리의 이동, 값이 오는 곳, 그리고 그 갈래에서만 지켜야 하는 것.
 *
 * ## 화면 이름을 한글로 다시 적는 이유
 * 매니페스트의 `name` 은 Figma 페이지 이름이라 영문이다(`Menu Create`). 도면과 왼쪽 목록은
 * 사람이 읽는 것이므로 한글로 적는다. 두 벌이 되는 것을 막기 위해 `screen` 은 반드시 매니페스트에
 * 있는 id 여야 하며, 어긋나면 `unknownScreens()` 가 알려 준다.
 *
 * ## 고객 화면 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 고객 화면에 나타나지 않는다.
 */
export type IaScreen = {
  /** `pages.manifest.ts` 의 id */
  screen: string;
  /** 도면·목록에 보이는 한글 이름 */
  ko: string;
};

export type IaGroup = {
  /** `fnb-menu.ts` 의 섹션 id. 이름은 메뉴에서 읽으므로 여기 적지 않는다. */
  id: string;
  /** 사이드바에 없는 갈래만 이름을 적는다 — 있는 것은 메뉴 이름이 이긴다 */
  label?: string;
  /** 이 갈래가 있는 이유 — 한 문장 */
  purpose: string;
  screens: IaScreen[];
  /** 갈래 안의 이동 — `[출발 screen, 도착 screen]` */
  edges: Array<[string, string]>;
  /**
   * 이 갈래의 화면이 읽고 쓰는 곳 — 도면에서 원통으로 그린다.
   *
   * 이 프로젝트에는 서버가 없다. 어드민이 만지는 것은 고객 화면과 함께 쓰는 시드
   * (`@winpilot/store`)와 주소의 질의문자열뿐이다. 있지도 않은 API 를 도면에 그리면 그 도면을
   * 보고 만드는 사람이 서버를 찾는다.
   */
  data: string[];
  /** 이 갈래에서만 지켜야 하는 것 */
  notes: string[];
};

export const IA_GROUPS: IaGroup[] = [
  {
    id: 'dashboard',
    purpose: '오늘 손대야 할 것을 한 화면에 모아 보낸다.',
    screens: [{ screen: 'dashboard', ko: '대시보드' }],
    edges: [],
    data: ['@winpilot/store · fnb (문의 · 가맹점 · 메뉴 · 배너 · 팝업 · 공지)'],
    notes: [
      '카드를 누르면 그 수치를 만든 조건이 그대로 걸린 목록으로 간다 — 수치와 목록이 다른 값을 말하면 카드를 믿지 않게 된다.',
      '매출 숫자를 두지 않는다. 매장 매출은 POS 와 배달앱이 갖고 있어, 옮겨 오면 두 곳의 숫자가 다른 상태가 만들어진다.',
      '색이 붙는 카드는 둘뿐이다 — 답하지 않은 창업 문의와 셋을 넘긴 팝업. 늘 붉으면 붉은 것이 뜻을 잃는다.',
    ],
  },
  {
    id: 'register',
    purpose: '손님이 보는 것을 만들고 고친다 — 매일 손대는 자리.',
    screens: [
      { screen: 'menus', ko: '메뉴 목록' },
      { screen: 'menus-detail', ko: '메뉴 상세' },
      { screen: 'menus-new', ko: '메뉴 등록' },
      { screen: 'menus-categories', ko: '메뉴 카테고리' },
      { screen: 'marketing', ko: '마케팅 글 목록' },
      { screen: 'marketing-detail', ko: '마케팅 글 상세' },
      { screen: 'marketing-new', ko: '마케팅 글 등록' },
      { screen: 'stores', ko: '가맹점 목록' },
      { screen: 'stores-detail', ko: '가맹점 상세' },
      { screen: 'stores-new', ko: '가맹점 등록' },
    ],
    edges: [
      ['menus', 'menus-new'],
      ['menus', 'menus-detail'],
      ['menus', 'menus-categories'],
      ['marketing', 'marketing-new'],
      ['marketing', 'marketing-detail'],
      ['stores', 'stores-new'],
      ['stores', 'stores-detail'],
    ],
    data: [
      '@winpilot/store · MENU_ITEMS · MENU_CATEGORIES',
      '@winpilot/store · MARKETING_POSTS · MARKETING_CHANNELS',
      '@winpilot/store · STORES',
    ],
    notes: [
      '셋 다 새로 만드는 화면(`/new`)이 있고, 셋 다 공개를 끈 채로 열린다 — 등록하다 만 것이 사이트에 바로 서는 것이 이 종류 콘솔의 가장 흔한 사고다.',
      '등록과 상세가 같은 폼이다. 화면을 둘로 나누면 칸이 하나 늘 때 두 곳을 고쳐야 하고, 그러다 등록에만 없는 칸이 생긴다.',
      '메뉴 카테고리는 메뉴 목록과 별도 화면으로 구성한다. 카테고리는 개별 데이터가 아니라 분류 기준이므로 목록에 포함하면 탐색이 어려워진다.',
      '가맹점은 휴점도 목록에 남긴다. 사이트에서만 빠진다 — 목록에서까지 사라지면 그 매장의 주소와 번호를 어디서도 찾을 수 없다.',
    ],
  },
  {
    id: 'franchise',
    purpose: '차리려는 사람이 남긴 것을 받고, 그 사람이 읽을 것을 적는다.',
    screens: [
      { screen: 'inquiries', ko: '창업 문의 목록' },
      { screen: 'inquiries-detail', ko: '창업 문의 상세' },
      { screen: 'franchise-faqs', ko: '창업 FAQ 목록' },
      { screen: 'franchise-faqs-detail', ko: '창업 FAQ 상세' },
      { screen: 'franchise-faqs-new', ko: '창업 FAQ 등록' },
      { screen: 'franchise-cost', ko: '창업 비용 · 절차' },
    ],
    edges: [
      ['inquiries', 'inquiries-detail'],
      ['franchise-faqs', 'franchise-faqs-new'],
      ['franchise-faqs', 'franchise-faqs-detail'],
    ],
    data: [
      '@winpilot/store · FRANCHISE_INQUIRIES',
      '@winpilot/store · FNB_FAQS (audience = 창업)',
      '@winpilot/store · FRANCHISE_COSTS · FRANCHISE_STEPS · INTERIOR_PER_PYEONG',
    ],
    notes: [
      '창업 문의만 등록 화면이 없다. 손님이 남기는 것이라 본사가 대신 적을 자리가 아니다.',
      '이 콘솔에서 늦으면 밖에 표가 나는 것은 창업 문의뿐이다 — 사이트가 하루 안에 연락한다고 적어 두었으므로, 답하지 않은 건수가 곧 지키지 못한 약속의 개수다.',
      '비용 · 절차는 목록이 아니라 값 한 벌을 고치는 폼이라 등록이 없다. 평당 단가 하나에서 인테리어 화면의 세 값이 함께 나온다.',
    ],
  },
  {
    id: 'support',
    purpose: '드시러 오시는 분이 읽을 것을 적는다.',
    screens: [
      { screen: 'support-faqs', ko: '고객센터 FAQ 목록' },
      { screen: 'support-faqs-detail', ko: '고객센터 FAQ 상세' },
      { screen: 'support-faqs-new', ko: '고객센터 FAQ 등록' },
      { screen: 'support-notices', ko: '공지사항 목록' },
      { screen: 'support-notices-detail', ko: '공지사항 상세' },
      { screen: 'support-notices-new', ko: '공지사항 등록' },
    ],
    edges: [
      ['support-faqs', 'support-faqs-new'],
      ['support-faqs', 'support-faqs-detail'],
      ['support-notices', 'support-notices-new'],
      ['support-notices', 'support-notices-detail'],
    ],
    data: ['@winpilot/store · FNB_FAQS (audience = 손님)', '@winpilot/store · FNB_NOTICES'],
    notes: [
      'FAQ 가 창업 갈래에도 하나 있다. 같은 목록을 `audience` 로 갈라 보는 것인데, 답하는 사람이 다르기 때문이다 — 창업 물음은 가맹 담당이, 손님 물음은 매장 담당이 답한다.',
      '갈래는 화면이 정해서 넘긴다. 고를 수 있게 두면 창업 화면에서 만든 글이 손님 목록에 선다.',
      '공지는 고정(pinned)이 날짜를 이긴다. 켜 두고 잊으면 반년 지난 글이 홈 띠 첫 줄에 남아, 등록 화면이 이미 고정된 글이 몇인지 알려 준다.',
    ],
  },
  {
    id: 'banner',
    purpose: '사이트 위에 얹히는 것을 걸고 내린다.',
    screens: [
      { screen: 'banners-main', ko: '메인 비주얼 목록' },
      { screen: 'banners-main-detail', ko: '메인 비주얼 상세' },
      { screen: 'banners-main-new', ko: '메인 비주얼 등록' },
      { screen: 'banners-popups', ko: '팝업 목록' },
      { screen: 'banners-popups-detail', ko: '팝업 상세' },
      { screen: 'banners-popups-new', ko: '팝업 등록' },
    ],
    edges: [
      ['banners-main', 'banners-main-new'],
      ['banners-main', 'banners-main-detail'],
      ['banners-popups', 'banners-popups-new'],
      ['banners-popups', 'banners-popups-detail'],
    ],
    data: ['@winpilot/store · FNB_BANNERS · FNB_POPUPS · bannerState()'],
    notes: [
      '상태를 사람이 켜지 않고 날짜가 정한다 — 개점 행사가 끝난 다음 날 아무도 안 끄기 때문이다. 그래도 숨김은 따로 있다: 기간과 상관없이 지금 당장 내려야 하는 일이 있다.',
      '오늘을 조각 안에서 구하지 않고 화면이 정해서 넘긴다. 미리 만들어 두는 화면이라 그 값이 빌드한 날에 굳는다.',
      '팝업은 읽는 것을 막는다 — 배너와 나눠 두는 까닭이다. `하루 감추기` 를 끄면 올 때마다 뜨고, 그것이 읽지 않고 닫는 습관을 만든다.',
    ],
  },
  {
    id: 'settings',
    purpose: '자주 바뀌지 않는 것 — 브랜드가 누구인지와 누가 들어오는지.',
    screens: [
      { screen: 'settings-brand', ko: '브랜드 정보' },
      { screen: 'settings-admins', ko: '관리자 목록' },
      { screen: 'settings-admins-detail', ko: '관리자 상세' },
      { screen: 'settings-admins-new', ko: '관리자 등록' },
    ],
    edges: [
      ['settings-admins', 'settings-admins-new'],
      ['settings-admins', 'settings-admins-detail'],
    ],
    data: ['@winpilot/store · FNB_BRAND · FNB_ADMINS · ADMIN_ROLES'],
    notes: [
      '브랜드명은 고칠 수 없다. 이름이 바뀌면 로고 · 간판 · 사업자등록증이 함께 바뀌는 일이라, 글자만 고칠 수 있게 두면 사이트에만 새 이름이 선다.',
      '고객 문의와 창업 상담 연락처를 분리하여 관리한다. 단일 번호로 운영하면 창업 문의가 매장 응대 담당자에게 연결된다.',
      '마지막 남은 대표의 권한을 내리거나 정지하는 것만 막는다 — 그러면 관리자를 늘릴 수 있는 사람이 없어져 개발자가 값을 직접 고쳐야 풀린다.',
      '한때 `공급자 관리` 가 있었다. 식자재 납품업체 목록이었는데, 이 콘솔의 다른 화면이 전부 사이트에 나가는 값을 다루는 것과 성격이 달라 걷어냈다.',
    ],
  },
];

/**
 * 갈래를 넘는 이동.
 *
 * 사이드바 도면에는 **긋지 않는다** — 여섯 갈래에 이 선을 다 그으면 도면이 그물이 되어 아무것도
 * 읽히지 않는다. 화면 하나를 볼 때(`/docs/ia/{화면}`)만 그 화면에 닿는 선을 꺼내 그린다.
 *
 * 사이드바에서 어느 갈래로나 갈 수 있는 길은 여기 적지 않는다. 어느 화면에서나 같으므로 적어
 * 두면 화면 수만큼 되풀이되고, 정작 그 화면에만 있는 길이 묻힌다.
 */
export type CrossEdge = {
  from: string;
  to: string;
  /** 어떤 길로 넘어가는가 */
  how: string;
};

export const CROSS_EDGES: CrossEdge[] = [
  { from: 'dashboard', to: 'inquiries', how: '답하지 않은 창업 문의 카드에서' },
  { from: 'dashboard', to: 'inquiries-detail', how: '답을 기다리는 문의를 바로 열어' },
  { from: 'dashboard', to: 'stores', how: '문 여는 가맹점 카드에서' },
  { from: 'dashboard', to: 'menus', how: '내려 둔 메뉴 카드에서' },
  { from: 'dashboard', to: 'banners-main', how: '걸린 배너 카드에서' },
  { from: 'dashboard', to: 'banners-popups', how: '뜨는 팝업 카드에서' },
  { from: 'dashboard', to: 'support-notices', how: '사이트에 걸린 공지 줄에서' },
];

export function findGroup(id: string): IaGroup | undefined {
  return IA_GROUPS.find((group) => group.id === id);
}

/** 화면이 속한 갈래. */
export function groupOf(screen: string): IaGroup | undefined {
  return IA_GROUPS.find((group) => group.screens.some((item) => item.screen === screen));
}

/** 갈래 이름 — 사이드바에 있는 것은 메뉴가 이긴다. 두 곳에 적으면 메뉴를 고칠 때 도면이 남는다. */
export function labelOf(group: IaGroup): string {
  return FNB_MENU.find((section) => section.id === group.id)?.label ?? group.label ?? group.id;
}

/**
 * 화면의 한글 이름.
 *
 * 매니페스트의 `name` 은 Figma 페이지 이름이라 영문이다. 사람이 읽는 자리에는 한글을 먼저 쓰고,
 * 갈래에 적히지 않은 화면만 매니페스트 이름으로 돌아간다.
 */
export function koOf(screen: string): string {
  const found = IA_GROUPS.flatMap((group) => group.screens).find((item) => item.screen === screen);
  return found?.ko ?? pages.find((page) => page.id === screen)?.name ?? screen;
}

/**
 * 왼쪽 세움대에 세울 화면 목록 — **매니페스트 순서**를 따른다.
 *
 * 매니페스트 순번은 사이드바 메뉴 순서와 같게 매겨 둔 값이라(`pages.manifest.ts` 머리말),
 * 그대로 세우면 세움대와 사이드바가 같은 차례로 읽힌다.
 */
export function screenNavItems(): Array<{ slug: string; label: string }> {
  return pages.map((page) => ({ slug: page.id, label: koOf(page.id) }));
}

/** 매니페스트에 있는데 어느 갈래에도 들지 않은 화면. 도면이 화면을 따라가지 못한 자리다. */
export function ungrouped(): string[] {
  const held = new Set(IA_GROUPS.flatMap((group) => group.screens.map((item) => item.screen)));
  return pages.filter((page) => !held.has(page.id)).map((page) => page.id);
}

/** 갈래에는 적혀 있는데 매니페스트에 없는 화면. 지운 화면이 도면에 남은 자리다. */
export function unknownScreens(): string[] {
  const real = new Set(pages.map((page) => page.id));
  // 갈래를 넘는 선도 함께 본다 — 한쪽 끝이 사라진 선은 도면에서 허공으로 뻗는다.
  const named = [
    ...IA_GROUPS.flatMap((group) => group.screens.map((item) => item.screen)),
    ...CROSS_EDGES.flatMap((edge) => [edge.from, edge.to]),
  ];
  return [...new Set(named)].filter((screen) => !real.has(screen));
}
