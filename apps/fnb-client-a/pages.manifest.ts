import type { BreakpointSpec, PageSpec } from '@winpilot/uir';

/**
 * F&B Client 템플릿 A — Figma 페이지 순번·이름의 유일한 출처.
 *
 * 차례는 **헤더에 선 일곱 갈래 그대로**다: 브랜드 → 메뉴 → 인테리어 → 마케팅 → 매장안내 →
 * 창업안내 → 고객센터. 그 뒤에 헤더에 없는 것(법적 고지)이 붙는다.
 *
 * 인테리어와 마케팅이 창업안내 아래가 아니라 최상위인 이유는 `lib/navigation.ts` 머리말에 있다 —
 * 매니페스트에는 **주소가 있는 화면**이 전부 올라온다.
 */
export const pages: PageSpec[] = [
  { order: 1, id: 'home', name: 'Home', route: '/' },

  // 10번대 — 브랜드
  { order: 10, id: 'brand', name: 'Brand', route: '/brand' },

  // 20번대 — 메뉴
  { order: 20, id: 'menu', name: 'Menu', route: '/menu' },
  {
    order: 21,
    id: 'menu-detail',
    name: 'Menu Detail',
    route: '/menu/[itemId]',
    sampleUrl: '/menu/sukhoe-whole',
  },

  // 25번대 — 인테리어 · 마케팅. 헤더에서 메뉴와 매장 사이에 선다.
  { order: 25, id: 'interior', name: 'Interior', route: '/interior' },
  { order: 26, id: 'marketing', name: 'Marketing', route: '/marketing' },

  // 30번대 — 매장
  { order: 30, id: 'stores', name: 'Store Finder', route: '/stores' },

  // 40번대 — 창업. 상담 신청까지가 한 흐름이라 붙여 둔다.
  { order: 40, id: 'franchise', name: 'Franchise', route: '/franchise' },
  { order: 41, id: 'franchise-apply', name: 'Franchise Apply', route: '/franchise/apply' },
  { order: 42, id: 'franchise-faq', name: 'Franchise FAQ', route: '/franchise/faq' },

  // 50번대 — 고객지원
  { order: 50, id: 'support-notices', name: 'Notices', route: '/support/notices' },
  { order: 51, id: 'support-faq', name: 'FAQ', route: '/support/faq' },

  // 60번대 — 법적 고지. 푸터에서만 열리는 자리라 헤더에는 없다.
  { order: 60, id: 'terms', name: 'Terms', route: '/terms' },
  { order: 61, id: 'privacy', name: 'Privacy', route: '/privacy' },
];

/** 확정 — 이 3개 너비로만 캡처한다. */
export const breakpoints: BreakpointSpec[] = [
  { id: 'desktop', label: 'Desktop', width: 1440 },
  { id: 'tablet', label: 'Tablet', width: 768 },
  { id: 'mobile', label: 'Mobile', width: 375 },
];

/** 추출 대상에서 제외할 개발 전용 라우트 */
export const devOnlyRoutes: string[] = [];
