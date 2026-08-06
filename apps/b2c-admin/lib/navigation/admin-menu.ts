/**
 * Admin View 내비게이션 정의.
 *
 * 규칙 (docs/spec/04-ia.md §4.4):
 *  - **사이드바는 최상위만** 노출한다. 세부 뎁스를 사이드바에 펼치면 자원 수가 늘수록 무너진다.
 *  - 세부 메뉴는 본문 **왼쪽 상단의 보조 aside** 에 그 섹션의 것만 표시한다.
 *
 * 라우트·컴포넌트명의 원본은 `@winpilot/spec` 의 features.ts 다.
 * 여기 `href` 는 그 라우트를 옮겨 적은 것이며, 어긋나면 `pnpm spec:check` 가 잡는다.
 */
export type AdminMenuChild = {
  id: string;
  label: string;
  href: string;
  ready?: boolean;
};

export type AdminMenuItem = AdminMenuChild & {
  children?: AdminMenuChild[];
  /**
   * 이 항목 위에 선을 하나 긋는다 — **성격이 다른 갈래가 시작되는 자리**에만 쓴다.
   *
   * 위쪽은 전부 고객에게 나가는 것(상품 · 콘텐츠 · 배너)을 다루고, 설정부터는 사이트 자체의
   * 값이다. 선이 없으면 스무 개 남짓한 항목이 한 덩어리로 읽혀 어디까지가 파는 일이고
   * 어디부터가 사이트 관리인지 매번 이름으로 판단하게 된다.
   */
  separatedBefore?: boolean;
};

export const ADMIN_MENU: readonly AdminMenuItem[] = [
  { id: 'dashboard', label: '대시보드', href: '/', ready: true },
  {
    id: 'user',
    label: '사용자',
    href: '/users',
    ready: true,
    children: [
      { id: 'user-list', label: '사용자', href: '/users', ready: true },
      { id: 'user-admin', label: '관리자', href: '/users/admins', ready: true },
      { id: 'user-grade', label: '등급', href: '/users/grades', ready: true },
    ],
  },
  {
    id: 'product',
    label: '상품',
    href: '/products/categories',
    ready: true,
    children: [
      { id: 'product-category', label: '카테고리', href: '/products/categories', ready: true },
      // 등록은 목록에서 들어간다 — 목록(/products) → 상세(/products/{code}) 구성이다.
      { id: 'product-create', label: '등록', href: '/products', ready: true },
      { id: 'product-sales', label: '판매', href: '/products/sales', ready: true },
      { id: 'product-review', label: '리뷰', href: '/products/reviews', ready: true },
      { id: 'product-coupon', label: '쿠폰', href: '/products/coupons', ready: true },
    ],
  },
  {
    id: 'inquiry',
    label: '문의',
    href: '/inquiries',
    ready: true,
    children: [
      { id: 'inquiry-list', label: '목록', href: '/inquiries', ready: true },
      { id: 'inquiry-settings', label: '설정', href: '/inquiries/settings', ready: true },
    ],
  },
  {
    id: 'content',
    label: '콘텐츠',
    href: '/contents/notices',
    ready: true,
    children: [
      { id: 'content-notice', label: '공지사항', href: '/contents/notices', ready: true },
      { id: 'content-faq', label: 'FAQ', href: '/contents/faqs', ready: true },
      { id: 'content-news', label: '뉴스', href: '/contents/news', ready: true },
      { id: 'content-portfolio', label: '포트폴리오', href: '/contents/portfolios', ready: true },
    ],
  },
  {
    id: 'banner',
    label: '배너',
    href: '/banners',
    ready: true,
    children: [
      { id: 'banner-visual', label: '메인 비주얼', href: '/banners', ready: true },
      { id: 'banner-popup', label: '팝업', href: '/banners/popups', ready: true },
    ],
  },
  {
    id: 'company',
    label: '회사',
    href: '/company/about',
    ready: true,
    children: [
      { id: 'company-about', label: '소개', href: '/company/about', ready: true },
      { id: 'company-history', label: '연혁', href: '/company/history', ready: true },
    ],
  },
  {
    id: 'analytics',
    label: '통계',
    href: '/statistics',
    ready: true,
    children: [
      { id: 'analytics-home', label: '홈', href: '/statistics', ready: true },
      { id: 'analytics-periods', label: '기간별 분석', href: '/statistics/periods', ready: true },
      { id: 'analytics-pages', label: '많이 방문한 페이지', href: '/statistics/pages', ready: true },
      { id: 'analytics-revenue', label: '매출', href: '/statistics/revenue', ready: true },
    ],
  },
  {
    id: 'settings',
    label: '설정',
    href: '/settings/supplier',
    ready: true,
    separatedBefore: true,
    children: [
      { id: 'settings-supplier', label: '공급자 정보', href: '/settings/supplier', ready: true },
      { id: 'settings-seo', label: 'SEO 정보', href: '/settings/seo', ready: true },
      { id: 'settings-terms', label: '서비스 이용약관 정보', href: '/settings/terms', ready: true },
      { id: 'settings-privacy', label: '개인정보 처리방침 정보', href: '/settings/privacy', ready: true },
      // OAuth · PG 는 사내 어드민(internal-admin)으로 옮겼다 — 고객사가 직접 만지면 로그인·결제가 멈춘다.
    ],
  },
  /*
    고객 지원 — **우리(스페이스플래닝)에게 묻는 자리**다.

    설정 바로 아래에 두는 이유: 위에서 만지다 막히는 일이 곧 여기서 묻는 일이다. 특히 설정의
    OAuth · PG 는 이 콘솔에서 아예 만질 수 없게 사내 어드민으로 옮겨 두었는데(위 주석),
    그러면 **막힌 사람이 갈 곳이 화면에 있어야 한다.** 없으면 메일 주소를 찾아 나가게 되고,
    그렇게 들어온 문의는 어느 목록에도 쌓이지 않는다.

    `문의`(위쪽 갈래)와 헷갈리지 않게 이름을 갈랐다 — 그쪽은 **고객이 고객사에게** 보낸 것이고
    여기는 **고객사가 우리에게** 보내는 것이다.
  */
  { id: 'support', label: '고객 지원', href: '/support', ready: true },
];

export function findAdminSection(id: string): AdminMenuItem | undefined {
  return ADMIN_MENU.find((item) => item.id === id);
}

/** 아직 만들지 않은 화면은 링크를 걸지 않는다. */
export function linkFor(item: AdminMenuChild): string {
  return item.ready ? item.href : '#none';
}
