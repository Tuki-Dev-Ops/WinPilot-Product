import type { BreakpointSpec, PageSpec } from '@winpilot/uir';

/**
 * IR Client 템플릿 A — Figma 페이지 순번·이름의 유일한 출처.
 *
 * 차례는 **처음 온 사람의 순서**다: 회사가 무엇인지(ABOUT) → 무엇을 파는지(SOLUTION·PRODUCT) →
 * 무슨 일이 있었나(공시) → 숫자(재무·주가·배당) → 누가 갖고 있나(주주) → 자료(자료실·일정) →
 * 막혔을 때 갈 곳(CS CENTER).
 *
 * IR 갈래가 헤더에 없고 푸터에만 있는 이유는 `lib/navigation.ts` 머리말에 적어 두었다 —
 * 매니페스트에는 **주소가 있는 화면**이 전부 올라온다.
 */
export const pages: PageSpec[] = [
  { order: 1, id: 'home', name: 'Home', route: '/' },

  // 2번대 — 회사 (ABOUT)
  { order: 2, id: 'about', name: 'About', route: '/about' },
  { order: 3, id: 'about-history', name: 'History', route: '/about/history' },
  { order: 4, id: 'about-certifications', name: 'Certifications', route: '/about/certifications' },

  // 5번대 — 솔루션 · 제품
  { order: 5, id: 'solutions-erp', name: 'Cloud ERP', route: '/solutions/erp' },
  { order: 6, id: 'solutions-mes', name: 'Cloud MES', route: '/solutions/mes' },
  { order: 7, id: 'solutions-crm', name: 'Cloud CRM', route: '/solutions/crm' },
  { order: 8, id: 'solutions-dxp', name: 'Cloud DXP', route: '/solutions/dxp' },
  { order: 9, id: 'products', name: 'Products', route: '/products' },

  // 10번대 — 공시
  { order: 10, id: 'disclosures', name: 'Disclosures', route: '/disclosures' },
  {
    order: 11,
    id: 'disclosures-detail',
    name: 'Disclosure Detail',
    route: '/disclosures/[disclosureId]',
    sampleUrl: '/disclosures/D-2026-014',
  },

  // 20번대 — 숫자
  { order: 20, id: 'financials', name: 'Financials', route: '/financials' },
  { order: 21, id: 'stock', name: 'Stock', route: '/stock' },
  { order: 22, id: 'dividends', name: 'Dividends', route: '/dividends' },

  // 30번대 — 주주
  { order: 30, id: 'meetings', name: 'Meetings', route: '/meetings' },
  { order: 31, id: 'meetings-voting', name: 'Electronic Voting', route: '/meetings/voting' },
  { order: 32, id: 'governance', name: 'Governance', route: '/governance' },

  // 40번대 — 자료
  { order: 40, id: 'library', name: 'IR Library', route: '/library' },
  { order: 41, id: 'schedules', name: 'IR Schedules', route: '/schedules' },

  // 50번대 — 알림 · 문의
  { order: 50, id: 'subscribe', name: 'Subscribe', route: '/subscribe' },

  // 60번대 — 고객지원 (CS CENTER)
  { order: 60, id: 'support-contact', name: 'Contact', route: '/support/contact' },
  { order: 61, id: 'support-notices', name: 'Notices', route: '/support/notices' },
  { order: 62, id: 'support-news', name: 'Support News', route: '/support/news' },
  { order: 63, id: 'support-faq', name: 'FAQ', route: '/support/faq' },
  { order: 64, id: 'support-directions', name: 'Directions', route: '/support/directions' },
];

/** 확정 — 이 3개 너비로만 캡처한다. */
export const breakpoints: BreakpointSpec[] = [
  { id: 'desktop', label: 'Desktop', width: 1440 },
  { id: 'tablet', label: 'Tablet', width: 768 },
  { id: 'mobile', label: 'Mobile', width: 375 },
];

/** 추출 대상에서 제외할 개발 전용 라우트 */
export const devOnlyRoutes: string[] = [];
