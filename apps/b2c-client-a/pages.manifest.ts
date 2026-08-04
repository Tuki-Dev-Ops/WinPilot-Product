import type { BreakpointSpec, PageSpec } from '@winpilot/uir';

/**
 * B2C Client 템플릿 A — Figma 페이지 순번·이름의 유일한 출처.
 *
 * **템플릿 A~F 는 이 목록을 그대로 공유한다.** 라우트와 페이지 이름이 같아야
 * "같은 화면의 다른 배치" 로 비교할 수 있고, 문서·스크린샷도 짝이 맞는다.
 * 다른 것은 레이아웃뿐이다 (packages/client-content 의 ids.ts 참고).
 */
export const pages: PageSpec[] = [
  { order: 1, id: 'index', name: 'Index', route: '/' },

  // 10번대 — 상품
  { order: 10, id: 'products', name: 'Product List', route: '/products' },
  {
    order: 11,
    id: 'products-detail',
    name: 'Product Detail',
    route: '/products/[productId]',
    sampleUrl: '/products/P-1042',
  },

  // 20번대 — 콘텐츠
  { order: 20, id: 'notices', name: 'Notices', route: '/notices' },
  {
    order: 21,
    id: 'notices-detail',
    name: 'Notice Detail',
    route: '/notices/[noticeId]',
    sampleUrl: '/notices/N-1024',
  },
  { order: 22, id: 'faqs', name: 'FAQ', route: '/faqs' },
  { order: 23, id: 'faqs-detail', name: 'FAQ Detail', route: '/faqs/[faqId]', sampleUrl: '/faqs/FQ-101' },
  { order: 24, id: 'news', name: 'News', route: '/news' },
  { order: 25, id: 'news-detail', name: 'News Detail', route: '/news/[newsId]', sampleUrl: '/news/W-2041' },
  { order: 26, id: 'portfolios', name: 'Portfolios', route: '/portfolios' },

  // 30번대 — 주문·장바구니·알람 (내 정보)
  { order: 30, id: 'cart', name: 'Cart', route: '/cart' },
  { order: 31, id: 'alarms', name: 'Alarms', route: '/alarms' },
  { order: 32, id: 'orders', name: 'Orders', route: '/orders' },
  {
    order: 33,
    id: 'orders-detail',
    name: 'Order Detail',
    route: '/orders/[orderId]',
    sampleUrl: '/orders/S-24081',
  },

  { order: 34, id: 'mypage', name: 'My Page', route: '/mypage' },
  { order: 36, id: 'mypage-inquiries', name: 'My Page Inquiries', route: '/mypage/inquiries' },
  { order: 37, id: 'mypage-coupons', name: 'My Page Coupons', route: '/mypage/coupons' },

  // 40번대 — 로그인·회원가입
  { order: 40, id: 'login', name: 'Login', route: '/login' },
  { order: 41, id: 'signup', name: 'Signup', route: '/signup' },

  // 50번대 — 회사·문의
  { order: 50, id: 'company', name: 'Company', route: '/company' },
  { order: 52, id: 'company-history', name: 'Company History', route: '/company/history' },
  { order: 51, id: 'contact', name: 'Contact', route: '/contact' },

  // 60번대 — 약관
  { order: 60, id: 'terms', name: 'Terms', route: '/terms' },
  { order: 61, id: 'privacy', name: 'Privacy', route: '/privacy' },
];

/** 확정 — 이 3개 너비로만 캡처한다. */
export const breakpoints: BreakpointSpec[] = [
  { id: 'desktop', label: 'Desktop', width: 1440 },
  { id: 'tablet', label: 'Tablet', width: 768 },
  { id: 'mobile', label: 'Mobile', width: 375 },
];

/** 문서 화면은 고객용이 아니라 개발·설계용이므로 추출 대상에서 뺀다. */
export const devOnlyRoutes: string[] = ['/docs'];
