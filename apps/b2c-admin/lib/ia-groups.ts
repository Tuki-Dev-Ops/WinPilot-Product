// `@/` 별칭 대신 상대 경로를 쓴다 — 이 모듈은 Next 밖(문서 생성 스크립트)에서도 읽힌다.
import { pages } from '../pages.manifest';
import { ADMIN_MENU } from './navigation/admin-menu';

/**
 * IA 묶음 — **사이드바 섹션이 곧 갈래**다.
 *
 * 갈래를 여기서 새로 정하지 않고 `admin-menu.ts` 의 섹션 id 를 그대로 쓴다. 따로 정하면
 * 메뉴에 항목을 하나 더했을 때 메뉴와 도면이 갈라지고, 그때부터 도면은 조용히 옛것이 된다.
 * 갈래 이름도 여기 적지 않는다 — `labelOf()` 가 메뉴에서 읽는다.
 *
 * 여기 적는 것은 메뉴가 **모르는 것**뿐이다: 목록에서만 들어가는 화면(등록·상세)의 한글 이름,
 * 화면끼리의 이동, 값이 오는 곳, 그리고 그 갈래에서만 지켜야 하는 것.
 *
 * ## 화면 이름을 한글로 다시 적는 이유
 * 매니페스트의 `name` 은 Figma 페이지 이름이라 영문이다(`Product Create`). 도면과 왼쪽 목록은
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
  /** `admin-menu.ts` 의 섹션 id. 이름은 메뉴에서 읽으므로 여기 적지 않는다. */
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
   * (`@winpilot/store`), 어드민에만 있는 시드(`lib/data/*`), 그리고 주소의 질의문자열뿐이다.
   * 있지도 않은 API 를 도면에 그리면 그 도면을 보고 만드는 사람이 서버를 찾는다.
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
    data: ['lib/data/analytics.ts', 'lib/data/orders.ts', '@winpilot/store · inquiries'],
    notes: [
      '카드를 누르면 그 수치를 만든 조건이 그대로 걸린 목록으로 간다 — 수치와 목록이 다른 값을 말하면 카드를 믿지 않게 된다.',
      '볼 것이 없어도 카드를 숨기지 않고 0 을 적는다. 사라진 카드는 값이 0 인지 기능이 없어진 것인지 알 수 없다.',
    ],
  },
  {
    id: 'user',
    purpose: '누가 들어와 있고 누가 운영하는지를 가른다.',
    screens: [
      { screen: 'users', ko: '사용자' },
      { screen: 'users-admins', ko: '관리자' },
      { screen: 'users-grades', ko: '등급' },
    ],
    edges: [],
    data: ['화면 안 시드 (사용자·관리자 목록)'],
    notes: [
      '세 화면이 각자 1뎁스다 — 사용자와 관리자는 보는 사람이 다르고, 등급은 규칙이라 목록 안에 두면 찾지 못한다.',
      '사용자 추가·수정은 목록 위 모달에서 끝난다. 화면을 따로 두면 목록으로 돌아오는 길이 한 번 더 늘어난다.',
      '등급은 누적 결제금액으로 자동 산정한다 — 여기서 정하는 것은 경계값이다.',
    ],
  },
  {
    id: 'product',
    purpose: '파는 것을 만들고, 팔린 것을 처리한다.',
    screens: [
      { screen: 'products-categories', ko: '카테고리' },
      { screen: 'products', ko: '상품 목록' },
      { screen: 'products-new', ko: '상품 등록' },
      { screen: 'products-detail', ko: '상품 상세' },
      { screen: 'products-sales', ko: '판매 목록' },
      { screen: 'products-sales-detail', ko: '판매 상세' },
      { screen: 'products-reviews', ko: '리뷰' },
      { screen: 'products-coupons', ko: '쿠폰' },
    ],
    edges: [
      ['products-categories', 'products'],
      ['products', 'products-new'],
      ['products', 'products-detail'],
      ['products-sales', 'products-sales-detail'],
    ],
    data: [
      '@winpilot/store · products',
      '@winpilot/store · categories',
      '@winpilot/store · product-options',
      '@winpilot/store · reviews',
      '@winpilot/store · coupons',
      'lib/data/orders.ts',
    ],
    notes: [
      '분류를 먼저 만들어야 상품에 붙는다 — 그래서 카테고리가 목록보다 앞에 온다.',
      '어드민 메뉴의 `판매` 와 고객 화면의 `주문` 은 같은 자원이다. 주문번호가 양쪽에서 같은 값이라 장애 상황에서 서로 통한다.',
      '리뷰는 등록 흐름이 없다 — 고객이 쓴 것을 숨기거나 되살릴 뿐이다.',
      '상품 등록은 저장한 뒤에도 숨김이다. 올리자마자 팔리면 값·재고를 확인할 틈이 없다.',
    ],
  },
  {
    id: 'inquiry',
    purpose: '고객이 보낸 것을 받아 답한다.',
    screens: [
      { screen: 'inquiries', ko: '문의 목록' },
      { screen: 'inquiries-settings', ko: '문의 설정' },
    ],
    edges: [['inquiries-settings', 'inquiries']],
    data: ['@winpilot/store · inquiries'],
    notes: [
      '설정에서 켠 항목이 곧 고객 문의 양식의 항목이다 — 설정을 고치면 다음 문의부터 담겨 들어온다.',
      '문의 내용과 답변은 목록 위 모달에서 읽고 쓴다. 답하는 동안 목록을 잃지 않게 한다.',
      '상태 이름(접수·처리중·답변완료·보류)은 고객 화면과 글자까지 같다.',
    ],
  },
  {
    id: 'content',
    purpose: '고객이 읽는 글을 만들고 고친다.',
    screens: [
      { screen: 'contents-notices', ko: '공지사항' },
      { screen: 'contents-notices-new', ko: '공지 등록' },
      { screen: 'contents-notices-detail', ko: '공지 상세' },
      { screen: 'contents-faqs', ko: 'FAQ' },
      { screen: 'contents-news', ko: '뉴스' },
      { screen: 'contents-news-new', ko: '뉴스 등록' },
      { screen: 'contents-news-detail', ko: '뉴스 상세' },
      { screen: 'contents-portfolios', ko: '포트폴리오' },
      { screen: 'contents-portfolios-new', ko: '포트폴리오 등록' },
      { screen: 'contents-portfolios-detail', ko: '포트폴리오 상세' },
    ],
    edges: [
      ['contents-notices', 'contents-notices-new'],
      ['contents-notices', 'contents-notices-detail'],
      ['contents-news', 'contents-news-new'],
      ['contents-news', 'contents-news-detail'],
      ['contents-portfolios', 'contents-portfolios-new'],
      ['contents-portfolios', 'contents-portfolios-detail'],
    ],
    data: ['@winpilot/store · contents'],
    notes: [
      '네 갈래가 같은 목록·폼 뼈대를 함께 쓴다(`app/contents/_components/`). 갈래마다 폼을 새로 만들면 저장·검증이 네 벌이 된다.',
      'FAQ 만 등록·수정이 목록 위 모달에서 끝난다 — 문답 한 쌍이라 글이 짧고, 화면을 옮기는 값이 더 크다.',
      '뉴스는 요약과 원문 링크만 관리한다. 본문 전체는 언론사 쪽에 있어 우리가 들고 있을 것이 아니다.',
      '숨김으로 둔 글은 고객 화면에서 주소로 들어와도 열리지 않는다.',
    ],
  },
  {
    id: 'banner',
    purpose: '지금 밀고 있는 것을 고객 화면 맨 앞에 세운다.',
    screens: [
      { screen: 'banners', ko: '메인 비주얼' },
      { screen: 'banners-new', ko: '배너 등록' },
      { screen: 'banners-detail', ko: '배너 상세' },
      { screen: 'banners-popups', ko: '팝업' },
      { screen: 'banners-popups-new', ko: '팝업 등록' },
      { screen: 'banners-popups-detail', ko: '팝업 상세' },
    ],
    edges: [
      ['banners', 'banners-new'],
      ['banners', 'banners-detail'],
      ['banners-popups', 'banners-popups-new'],
      ['banners-popups', 'banners-popups-detail'],
    ],
    data: ['@winpilot/store · banners'],
    notes: [
      '메인 비주얼과 팝업은 나가는 자리가 달라 목록을 나눈다 — 한 목록에 섞으면 어느 것이 어디에 뜨는지 매번 열어 봐야 한다.',
      '노출 기간이 지난 것은 고객 화면 목록에 아예 오지 않는다. 화면에서 숨기는 것과 받지 않는 것은 다르다.',
      '올릴 그림의 비율이 자리마다 다르다 — 비율이 어긋난 그림은 저장 전에 막는다.',
    ],
  },
  {
    id: 'company',
    purpose: '우리가 누구인지를 고객 화면에 내보낸다.',
    screens: [
      { screen: 'company-about', ko: '회사 소개' },
      { screen: 'company-history', ko: '연혁' },
    ],
    edges: [],
    data: ['@winpilot/store · company'],
    notes: [
      '회사 소개는 단일 자원이라 목록이 없다 — 한 벌뿐인 값에 목록을 두면 빈 목록만 남는다.',
      '연혁 항목은 목록 위 모달에서 더하고 고친다. 한 줄짜리 값이라 화면을 옮길 것이 없다.',
      '사업자 정보는 여기가 아니라 설정 > 공급자 정보에 있다 — 푸터가 읽는 값이라 회사 소개와 나가는 자리가 다르다.',
    ],
  },
  {
    id: 'analytics',
    purpose: '무엇이 얼마나 팔리고 어디를 많이 보는지 읽는다.',
    screens: [
      { screen: 'statistics', ko: '통계 홈' },
      { screen: 'statistics-periods', ko: '기간별 분석' },
      { screen: 'statistics-pages', ko: '많이 방문한 페이지' },
      { screen: 'statistics-revenue', ko: '매출' },
    ],
    edges: [
      ['statistics', 'statistics-periods'],
      ['statistics', 'statistics-pages'],
      ['statistics', 'statistics-revenue'],
    ],
    data: ['lib/data/analytics.ts', 'lib/data/industry.ts'],
    notes: [
      '읽기만 하는 갈래다 — 여기서 고쳐지는 값이 없다.',
      '차트는 전부 인라인 SVG 다. 비트맵은 Figma 에서 벡터로 복원되지 않는다.',
      '기간·필터는 아직 화면 안에만 있고 주소에 남지 않는다 — 같은 조건을 남에게 보여 주려면 말로 설명해야 한다는 뜻이다.',
    ],
  },
  {
    id: 'settings',
    purpose: '고객 화면 어디에나 걸리는 값을 한자리에서 정한다.',
    screens: [
      { screen: 'settings-supplier', ko: '공급자 정보' },
      { screen: 'settings-seo', ko: 'SEO 정보' },
      { screen: 'settings-terms', ko: '서비스 이용약관 정보' },
      { screen: 'settings-privacy', ko: '개인정보 처리방침 정보' },
    ],
    edges: [],
    data: ['@winpilot/store · policies', '@winpilot/store · company'],
    notes: [
      '네 화면 모두 목록이 없는 단일 자원이다 — 고쳐 저장하는 것이 전부다.',
      '약관·처리방침 본문을 템플릿에 박아 두지 않는 이유: 글을 고칠 때마다 배포를 해야 한다.',
      'OAuth·PG 설정은 여기 없다. 사내 어드민으로 옮겼다 — 고객사가 직접 만지면 로그인·결제가 멈춘다.',
    ],
  },
  {
    id: 'support',
    purpose: '이 콘솔에서 못 바꾸는 것을 스페이스플래닝에 묻는다.',
    screens: [{ screen: 'support', ko: '고객 지원' }],
    edges: [],
    data: ['@winpilot/store · support'],
    notes: [
      '위쪽 문의 갈래와 자원이 다르다 — 그쪽은 고객이 이 고객사에게, 여기는 이 고객사가 스페이스플래닝에게 보낸다.',
      '설정 바로 아래에 둔다. 설정에서 만지다 막히는 일이 곧 여기서 묻는 일이고, OAuth·PG 는 아예 이 콘솔에 없다.',
      '보낸 문의는 사내 어드민의 문의 목록에 그대로 선다. 값이 한 곳이라 답이 어긋나지 않는다.',
    ],
  },
  {
    id: 'system',
    label: '시스템',
    purpose: '메뉴에 없지만 주소가 있는 화면 — 들어오는 문과 끝나는 자리.',
    screens: [
      { screen: 'login', ko: '로그인' },
      { screen: 'result', ko: '처리 결과' },
      { screen: 'components', ko: '컴포넌트' },
    ],
    edges: [],
    data: ['주소 질의문자열 (state·kind)'],
    notes: [
      '사이드바에 항목이 없다. 그래도 도면에는 그린다 — 메뉴에 없다고 화면이 없는 것은 아니고, 그 사실을 모르면 같은 화면을 새로 만들려 든다.',
      '처리 결과는 완료·실패가 한 화면이다(`/result?state=…`). 404·오류와 같은 `StatusScreen` 을 쓰고 배치만 다르다.',
      '컴포넌트 면은 고객사에 노출되지 않는 개발 도구다 — 추출 대상에서도 뺀다(`devOnlyRoutes`).',
    ],
  },
];

/**
 * 갈래를 넘는 이동.
 *
 * 사이드바 도면에는 **긋지 않는다** — 아홉 갈래에 이 선을 다 그으면 도면이 그물이 되어
 * 아무것도 읽히지 않는다. 화면 하나를 볼 때(`/docs/ia/{화면}`)만 그 화면에 닿는 선을 꺼내 그린다.
 *
 * 사이드바에서 어느 갈래로나 갈 수 있는 길은 여기 적지 않는다. 어느 화면에서나 같으므로
 * 적어 두면 화면 수만큼 되풀이되고, 정작 그 화면에만 있는 길이 묻힌다.
 */
export type CrossEdge = {
  from: string;
  to: string;
  /** 어떤 길로 넘어가는가 */
  how: string;
};

export const CROSS_EDGES: CrossEdge[] = [
  { from: 'login', to: 'dashboard', how: '로그인을 마치면 대시보드로' },
  { from: 'dashboard', to: 'products-sales', how: '처리 대기 카드에서 오늘 보낼 주문으로' },
  { from: 'dashboard', to: 'inquiries', how: '처리 대기 카드에서 답하지 않은 문의로' },
  { from: 'dashboard', to: 'statistics', how: '매출 추이 카드에서 통계로' },
  { from: 'dashboard', to: 'statistics-pages', how: '많이 본 페이지 카드에서 전체 보기로' },
  { from: 'dashboard', to: 'products', how: '재고가 얕은 상품 줄에서 상품 목록으로' },
  { from: 'dashboard', to: 'products-detail', how: '재고가 얕은 상품을 바로 열어' },
  { from: 'dashboard', to: 'products-sales-detail', how: '처리 대기 주문을 바로 열어' },
  { from: 'dashboard', to: 'banners', how: '기간이 끝나 가는 배너 줄에서' },
  { from: 'dashboard', to: 'banners-detail', how: '기간이 끝나 가는 배너를 바로 열어' },
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
  return ADMIN_MENU.find((section) => section.id === group.id)?.label ?? group.label ?? group.id;
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
