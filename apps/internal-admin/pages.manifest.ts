import type { BreakpointSpec, PageSpec } from '@winpilot/uir';

/**
 * Internal Admin — Figma 페이지 순번·이름의 유일한 출처.
 *
 * 이 앱은 자기 레포(`winpilot-internal-admin`)와 자기 Figma 파일을 갖는다.
 * 사내 전용이라 고객사에 노출되지 않으며, B2C Admin 과 배포도 분리한다.
 *
 * 대역 순서는 사이드바 메뉴 순서와 같다 — 대시보드 · 고객사(10) · 연동(20) · 요금(30).
 */
export const pages: PageSpec[] = [
  { order: 1, id: 'dashboard', name: 'Dashboard', route: '/' },

  // 10번대 — 고객사
  { order: 10, id: 'tenants', name: 'Tenants', route: '/tenants' },
  {
    order: 11,
    id: 'tenants-detail',
    name: 'Tenant Detail',
    route: '/tenants/[tenantId]',
    sampleUrl: '/tenants/T-101',
  },

  // 20번대 — 연동
  { order: 20, id: 'integrations-oauth', name: 'Integration OAuth', route: '/integrations/oauth' },
  { order: 21, id: 'integrations-payment', name: 'Integration Payment', route: '/integrations/payment' },

  // 30번대 — 요금
  { order: 30, id: 'invoices', name: 'Invoices', route: '/invoices' },
];

/** 확정 — 이 3개 너비로만 캡처한다. */
export const breakpoints: BreakpointSpec[] = [
  { id: 'desktop', label: 'Desktop', width: 1440 },
  { id: 'tablet', label: 'Tablet', width: 768 },
  { id: 'mobile', label: 'Mobile', width: 375 },
];

/** 추출 대상에서 제외할 개발 전용 라우트 */
export const devOnlyRoutes: string[] = [];
