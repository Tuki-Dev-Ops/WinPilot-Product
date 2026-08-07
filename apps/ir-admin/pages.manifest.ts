import type { BreakpointSpec, PageSpec } from '@winpilot/uir';

/**
 * IR Admin — Figma 페이지 순번·이름의 유일한 출처.
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
  { order: 11, id: 'inquiries-settings', name: 'Inquiry Settings', route: '/inquiries/settings' },

  // 20번대 — 콘텐츠
  { order: 20, id: 'contents-notices', name: 'Notices', route: '/contents/notices' },
  { order: 21, id: 'contents-news', name: 'News', route: '/contents/news' },
  { order: 22, id: 'contents-faqs', name: 'FAQ', route: '/contents/faqs' },

  // 30번대 — 제품
  { order: 30, id: 'products', name: 'Products', route: '/products' },
  { order: 31, id: 'products-settings', name: 'Product Settings', route: '/products/settings' },

  // 40번대 — 솔루션
  { order: 40, id: 'solutions', name: 'Solutions', route: '/solutions' },
  { order: 41, id: 'solutions-settings', name: 'Solution Settings', route: '/solutions/settings' },

  // 50번대 — 회사
  { order: 50, id: 'company-about', name: 'Company Profile', route: '/company/about' },
  { order: 51, id: 'company-history', name: 'Milestones', route: '/company/history' },
  { order: 52, id: 'company-credentials', name: 'Credentials', route: '/company/credentials' },

  // 60번대 — 배너
  { order: 60, id: 'banners', name: 'Hero Banners', route: '/banners' },
  { order: 61, id: 'banners-popups', name: 'Popups', route: '/banners/popups' },

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
