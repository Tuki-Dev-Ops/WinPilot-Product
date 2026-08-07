import type { BreakpointSpec, PageSpec } from '@winpilot/uir';

/**
 * IR Admin — Figma 페이지 순번·이름의 유일한 출처.
 *
 * 목록 하나에 등록(`/new`)과 상세(`/[id]`)가 붙는다. 상세는 주소에 값이 들어가므로
 * `sampleUrl` 로 실제로 열리는 주소를 함께 적는다 — 없으면 캡처가 `[noticeId]` 라는 글자
 * 그대로를 열어 404 를 찍는다.
 *
 * 대역 순서는 사이드바 메뉴 순서와 같다 — 대시보드(1) · 문의(10) · 콘텐츠(20) · 제품(30) ·
 * 솔루션(40) · 회사(50) · 배너(60) · 통계(70) · IR(80) · 설정(90). 대역을 띄우는 이유는 중간에
 * 화면을 하나 끼울 때 전체 번호를 다시 매기지 않기 위해서다.
 *
 * ## 5번대(홈페이지)가 사라진 이유
 * `/site/services` · `/site/solutions` · `/site/media` · `/site/legal` 넷은 메뉴를 새로 세우면서
 * 갈음되었다 — 각각 솔루션 설정 · 솔루션 목록 · 콘텐츠 뉴스 · 설정 약관/처리방침이 **같은 값을**
 * 다룬다. 두 자리를 남겨 두면 한쪽에서 고친 것이 다른 쪽에 없는 것으로 보인다.
 */
export const pages: PageSpec[] = [
  { order: 1, id: 'dashboard', name: 'Dashboard', route: '/' },

  // 10번대 — 문의
  { order: 10, id: 'inquiries', name: 'Inquiries', route: '/inquiries' },
  {
    order: 11,
    id: 'inquiries-detail',
    name: 'Inquiry Detail',
    route: '/inquiries/[inquiryId]',
    sampleUrl: '/inquiries/S-2041',
  },
  { order: 12, id: 'inquiries-settings', name: 'Inquiry Settings', route: '/inquiries/settings' },

  // 20번대 — 콘텐츠
  { order: 20, id: 'contents-notices', name: 'Notices', route: '/contents/notices' },
  { order: 21, id: 'contents-notices-new', name: 'Notice Create', route: '/contents/notices/new' },
  {
    order: 22,
    id: 'contents-notices-detail',
    name: 'Notice Detail',
    route: '/contents/notices/[noticeId]',
    sampleUrl: '/contents/notices/N-004',
  },
  { order: 23, id: 'contents-news', name: 'News', route: '/contents/news' },
  { order: 24, id: 'contents-news-new', name: 'News Create', route: '/contents/news/new' },
  {
    order: 25,
    id: 'contents-news-detail',
    name: 'News Detail',
    route: '/contents/news/[newsId]',
    sampleUrl: '/contents/news/MC-005',
  },
  { order: 26, id: 'contents-faqs', name: 'FAQ', route: '/contents/faqs' },
  { order: 27, id: 'contents-faqs-new', name: 'FAQ Create', route: '/contents/faqs/new' },
  {
    order: 28,
    id: 'contents-faqs-detail',
    name: 'FAQ Detail',
    route: '/contents/faqs/[faqId]',
    sampleUrl: '/contents/faqs/F-01',
  },

  // 30번대 — 제품
  { order: 30, id: 'products', name: 'Products', route: '/products' },
  {
    order: 31,
    id: 'products-detail',
    name: 'Product Detail',
    route: '/products/[productId]',
    sampleUrl: '/products/mes',
  },
  { order: 32, id: 'products-settings', name: 'Product Settings', route: '/products/settings' },

  // 40번대 — 솔루션
  { order: 40, id: 'solutions', name: 'Solutions', route: '/solutions' },
  {
    order: 41,
    id: 'solutions-detail',
    name: 'Solution Detail',
    route: '/solutions/[solutionId]',
    sampleUrl: '/solutions/erp',
  },
  { order: 42, id: 'solutions-settings', name: 'Solution Settings', route: '/solutions/settings' },

  // 50번대 — 회사
  { order: 50, id: 'company-about', name: 'Company Profile', route: '/company/about' },
  { order: 51, id: 'company-history', name: 'Milestones', route: '/company/history' },
  { order: 52, id: 'company-history-new', name: 'Milestone Create', route: '/company/history/new' },
  {
    order: 53,
    id: 'company-history-detail',
    name: 'Milestone Detail',
    route: '/company/history/[milestoneId]',
    sampleUrl: '/company/history/M-012',
  },
  { order: 54, id: 'company-credentials', name: 'Credentials', route: '/company/credentials' },
  {
    order: 55,
    id: 'company-credentials-new',
    name: 'Credential Create',
    route: '/company/credentials/new',
  },
  {
    order: 56,
    id: 'company-credentials-detail',
    name: 'Credential Detail',
    route: '/company/credentials/[credentialId]',
    sampleUrl: '/company/credentials/C-001',
  },

  // 60번대 — 배너
  { order: 60, id: 'banners', name: 'Hero Banners', route: '/banners' },
  { order: 61, id: 'banners-new', name: 'Banner Create', route: '/banners/new' },
  {
    order: 62,
    id: 'banners-detail',
    name: 'Banner Detail',
    route: '/banners/[bannerId]',
    sampleUrl: '/banners/B-003',
  },
  { order: 63, id: 'banners-popups', name: 'Popups', route: '/banners/popups' },
  { order: 64, id: 'banners-popups-new', name: 'Popup Create', route: '/banners/popups/new' },
  {
    order: 65,
    id: 'banners-popups-detail',
    name: 'Popup Detail',
    route: '/banners/popups/[popupId]',
    sampleUrl: '/banners/popups/B-002',
  },

  // 70번대 — 통계
  { order: 70, id: 'statistics', name: 'Statistics', route: '/statistics' },
  { order: 71, id: 'statistics-period', name: 'Period Analysis', route: '/statistics/period' },
  { order: 72, id: 'statistics-pages', name: 'Page Visits', route: '/statistics/pages' },

  // 80번대 — IR (투자자 화면이 아직 이 값들을 내보낸다)
  { order: 80, id: 'disclosures', name: 'Disclosures', route: '/disclosures' },
  { order: 81, id: 'disclosures-dart', name: 'DART Integration', route: '/disclosures/dart' },
  { order: 82, id: 'financials', name: 'Financials', route: '/financials' },
  { order: 83, id: 'financials-stock', name: 'Stock Integration', route: '/financials/stock' },
  { order: 84, id: 'financials-dividends', name: 'Dividends', route: '/financials/dividends' },
  { order: 85, id: 'shareholders-meetings', name: 'Meetings', route: '/shareholders/meetings' },
  { order: 86, id: 'shareholders-governance', name: 'Governance', route: '/shareholders/governance' },
  { order: 87, id: 'library', name: 'IR Library', route: '/library' },
  { order: 88, id: 'library-schedules', name: 'IR Schedules', route: '/library/schedules' },
  { order: 89, id: 'library-notifications', name: 'Subscribers', route: '/library/notifications' },

  // 90번대 — 설정
  { order: 90, id: 'settings-supplier', name: 'Supplier Info', route: '/settings/supplier' },
  { order: 91, id: 'settings-seo', name: 'SEO', route: '/settings/seo' },
  { order: 92, id: 'settings-terms', name: 'Terms', route: '/settings/terms' },
  { order: 93, id: 'settings-privacy', name: 'Privacy Policy', route: '/settings/privacy' },
  { order: 94, id: 'settings-locales', name: 'Locales', route: '/settings/locales' },

  /*
    처리 결과(완료·실패). 404·오류 화면은 주소가 없는 Next 약속 파일이라 여기 올리지 않는다 —
    매니페스트는 **주소가 있는 화면**의 목록이다.
  */
  { order: 99, id: 'result', name: 'Result', route: '/result', sampleUrl: '/result?state=done' },
];

/** 확정 — 이 3개 너비로만 캡처한다. */
export const breakpoints: BreakpointSpec[] = [
  { id: 'desktop', label: 'Desktop', width: 1440 },
  { id: 'tablet', label: 'Tablet', width: 768 },
  { id: 'mobile', label: 'Mobile', width: 375 },
];

/** 추출 대상에서 제외할 개발 전용 라우트 */
export const devOnlyRoutes: string[] = [];
