import type { BreakpointSpec, PageSpec } from '@winpilot/uir';

/**
 * IR Admin — Figma 페이지 순번·이름의 유일한 출처.
 *
 * 대역 순서는 사이드바 메뉴 순서와 같다 — 대시보드 · 홈페이지(5) · 공시(10) · 재무(20) ·
 * 주주(30) · 자료(40) · 설정(70). 대역을 띄우는 이유는 중간에 화면을 하나 끼울 때 전체 번호를 다시
 * 매기지 않기 위해서다.
 */
export const pages: PageSpec[] = [
  { order: 1, id: 'dashboard', name: 'Dashboard', route: '/' },

  // 5번대 — 홈페이지
  { order: 5, id: 'site-services', name: 'Site Services', route: '/site/services' },
  { order: 6, id: 'site-solutions', name: 'Site Solutions', route: '/site/solutions' },
  { order: 7, id: 'site-media', name: 'Site Media', route: '/site/media' },
  { order: 8, id: 'site-legal', name: 'Site Legal', route: '/site/legal' },

  // 10번대 — 공시
  { order: 10, id: 'disclosures', name: 'Disclosures', route: '/disclosures' },
  { order: 11, id: 'disclosures-dart', name: 'DART Integration', route: '/disclosures/dart' },

  // 20번대 — 재무
  { order: 20, id: 'financials', name: 'Financials', route: '/financials' },
  { order: 21, id: 'financials-stock', name: 'Stock Integration', route: '/financials/stock' },
  { order: 22, id: 'financials-dividends', name: 'Dividends', route: '/financials/dividends' },

  // 30번대 — 주주
  { order: 30, id: 'shareholders-meetings', name: 'Meetings', route: '/shareholders/meetings' },
  { order: 31, id: 'shareholders-governance', name: 'Governance', route: '/shareholders/governance' },

  // 40번대 — 자료
  { order: 40, id: 'library', name: 'IR Library', route: '/library' },
  { order: 41, id: 'library-schedules', name: 'IR Schedules', route: '/library/schedules' },
  { order: 42, id: 'library-notifications', name: 'Subscribers', route: '/library/notifications' },

  // 70번대 — 설정
  { order: 70, id: 'settings-locales', name: 'Locales', route: '/settings/locales' },

  /*
    처리 결과(완료·실패). 404·오류 화면은 주소가 없는 Next 약속 파일이라 여기 올리지 않는다 —
    매니페스트는 **주소가 있는 화면**의 목록이다.
  */
  { order: 90, id: 'result', name: 'Result', route: '/result', sampleUrl: '/result?state=done' },
];

/** 확정 — 이 3개 너비로만 캡처한다. */
export const breakpoints: BreakpointSpec[] = [
  { id: 'desktop', label: 'Desktop', width: 1440 },
  { id: 'tablet', label: 'Tablet', width: 768 },
  { id: 'mobile', label: 'Mobile', width: 375 },
];

/** 추출 대상에서 제외할 개발 전용 라우트 */
export const devOnlyRoutes: string[] = [];
