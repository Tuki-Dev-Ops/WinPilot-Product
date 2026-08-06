import type { BreakpointSpec, PageSpec } from '@winpilot/uir';

/**
 * B2C Admin — Figma 페이지 순번·이름의 유일한 출처.
 *
 * 이 앱은 자기 레포(`winpilot-b2c-admin`)와 자기 Figma 파일을 갖는다.
 * 레포가 분리되어 있으므로 라우트에 `/admin` 접두어를 붙이지 않는다 —
 * 경로 기반 배포가 필요하면 Next 의 `basePath` 로 처리한다.
 *
 * 순번은 메뉴 섹션별로 대역을 띄운다. 중간에 화면을 끼울 때
 * 전체 번호를 다시 매기지 않기 위해서다 (docs/spec/04-ia.md §4.5).
 *
 * 대역 순서는 **사이드바 메뉴 순서와 같다** — Figma 페이지 목록과 어드민 메뉴가
 * 다른 순서로 보이면 같은 화면을 두 곳에서 다르게 찾게 된다.
 * 대시보드 · 사용자(10) · 상품(20) · 문의(30) · 콘텐츠(40) · 배너(50) · 회사(60) · 통계(65) · 설정(70)
 */
export const pages: PageSpec[] = [
  { order: 1, id: 'dashboard', name: 'Dashboard', route: '/' },
  { order: 2, id: 'login', name: 'Login', route: '/login' },

  // 10번대 — 사용자
  { order: 10, id: 'users', name: 'Users', route: '/users' },
  { order: 11, id: 'users-admins', name: 'Users Staff', route: '/users/admins' },
  { order: 12, id: 'users-grades', name: 'Users Grades', route: '/users/grades' },

  // 20번대 — 상품
  { order: 20, id: 'products-categories', name: 'Product Categories', route: '/products/categories' },
  { order: 21, id: 'products', name: 'Product List', route: '/products' },
  { order: 22, id: 'products-new', name: 'Product Create', route: '/products/new' },
  {
    order: 23,
    id: 'products-detail',
    name: 'Product Detail',
    route: '/products/[productId]',
    sampleUrl: '/products/P-1042',
  },
  { order: 24, id: 'products-sales', name: 'Product Sales', route: '/products/sales' },
  {
    order: 25,
    id: 'products-sales-detail',
    name: 'Product Sale Detail',
    route: '/products/sales/[orderId]',
    sampleUrl: '/products/sales/S-24081',
  },

  // 30번대 — 문의
  { order: 30, id: 'inquiries', name: 'Inquiries', route: '/inquiries' },
  { order: 31, id: 'inquiries-settings', name: 'Inquiry Settings', route: '/inquiries/settings' },

  // 40번대 — 콘텐츠
  { order: 40, id: 'contents-notices', name: 'Content Notices', route: '/contents/notices' },
  { order: 41, id: 'contents-notices-new', name: 'Content Notice Create', route: '/contents/notices/new' },
  {
    order: 42,
    id: 'contents-notices-detail',
    name: 'Content Notice Detail',
    route: '/contents/notices/[noticeId]',
    sampleUrl: '/contents/notices/N-1024',
  },
  { order: 43, id: 'contents-faqs', name: 'Content FAQ', route: '/contents/faqs' },
  { order: 44, id: 'contents-news', name: 'Content News', route: '/contents/news' },
  { order: 45, id: 'contents-news-new', name: 'Content News Create', route: '/contents/news/new' },
  {
    order: 46,
    id: 'contents-news-detail',
    name: 'Content News Detail',
    route: '/contents/news/[newsId]',
    sampleUrl: '/contents/news/W-2041',
  },
  { order: 47, id: 'contents-portfolios', name: 'Content Portfolios', route: '/contents/portfolios' },
  {
    order: 48,
    id: 'contents-portfolios-new',
    name: 'Content Portfolio Create',
    route: '/contents/portfolios/new',
  },
  {
    order: 49,
    id: 'contents-portfolios-detail',
    name: 'Content Portfolio Detail',
    route: '/contents/portfolios/[portfolioId]',
    sampleUrl: '/contents/portfolios/F-3012',
  },

  // 50번대 — 배너
  { order: 50, id: 'banners', name: 'Banners', route: '/banners' },
  { order: 51, id: 'banners-new', name: 'Banner Create', route: '/banners/new' },
  {
    order: 52,
    id: 'banners-detail',
    name: 'Banner Detail',
    route: '/banners/[bannerId]',
    sampleUrl: '/banners/B-501',
  },
  { order: 53, id: 'banners-popups', name: 'Banner Popups', route: '/banners/popups' },
  { order: 54, id: 'banners-popups-new', name: 'Banner Popup Create', route: '/banners/popups/new' },
  {
    order: 55,
    id: 'banners-popups-detail',
    name: 'Banner Popup Detail',
    route: '/banners/popups/[popupId]',
    sampleUrl: '/banners/popups/P-801',
  },

  // 60번대 — 회사
  { order: 60, id: 'company-about', name: 'Company About', route: '/company/about' },
  { order: 61, id: 'company-history', name: 'Company History', route: '/company/history' },

  // 65번대 — 통계
  { order: 65, id: 'statistics', name: 'Statistics Home', route: '/statistics' },
  { order: 66, id: 'statistics-periods', name: 'Statistics Periods', route: '/statistics/periods' },
  { order: 67, id: 'statistics-pages', name: 'Statistics Pages', route: '/statistics/pages' },
  { order: 68, id: 'statistics-revenue', name: 'Statistics Revenue', route: '/statistics/revenue' },

  // 70번대 — 설정
  { order: 70, id: 'settings-supplier', name: 'Settings Supplier', route: '/settings/supplier' },
  { order: 71, id: 'settings-seo', name: 'Settings SEO', route: '/settings/seo' },
  { order: 72, id: 'settings-terms', name: 'Settings Terms', route: '/settings/terms' },
  { order: 73, id: 'settings-privacy', name: 'Settings Privacy', route: '/settings/privacy' },

  // 80번대 — 고객 지원 (우리에게 묻는 자리)
  { order: 80, id: 'support', name: 'Support', route: '/support' },

  // 100번대 — 시스템·디자인 시스템 면
  { order: 23, id: 'products-reviews', name: 'Product Reviews', route: '/products/reviews' },
  { order: 24, id: 'products-coupons', name: 'Product Coupons', route: '/products/coupons' },

  { order: 100, id: 'components', name: 'Components', route: '/ssot/components' },
  /*
    처리 결과(완료·실패). 404·오류 화면은 주소가 없는 Next 약속 파일이라 여기 올리지 않는다 —
    매니페스트는 **주소가 있는 화면**의 목록이고, 세 화면 모두 같은 `StatusScreen` 을 쓴다.
  */
  { order: 90, id: 'result', name: 'Result', route: '/result', sampleUrl: '/result?state=done' },
];

/** 확정 — 이 3개 너비로만 캡처한다. */
export const breakpoints: BreakpointSpec[] = [
  { id: 'desktop', label: 'Desktop', width: 1440 },
  { id: 'tablet', label: 'Tablet', width: 768 },
  { id: 'mobile', label: 'Mobile', width: 375 },
];

/** 추출 대상에서 제외할 개발 전용 라우트 (`/ssot` 는 파이프라인 상태판) */
export const devOnlyRoutes: string[] = ['/ssot'];
