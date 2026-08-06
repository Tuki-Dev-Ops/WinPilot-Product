import type { BreakpointSpec, PageSpec } from '@winpilot/uir';

/**
 * Internal Admin — Figma 페이지 순번·이름의 유일한 출처.
 *
 * 이 앱은 자기 레포(`winpilot-internal-admin`)와 자기 Figma 파일을 갖는다.
 * 사내 전용이라 고객사에 노출되지 않으며, B2C Admin 과 배포도 분리한다.
 *
 * 대역 순서는 사이드바 메뉴 순서와 같다 — 대시보드 · 고객사(10) · 구독(20) · 문의(30) ·
 * 연동(40) · 통계(50) · 결제(60) · 설정(70). 대역을 띄우는 이유는 중간에 화면을 하나 끼울 때
 * 전체 번호를 다시 매기지 않기 위해서다.
 */
export const pages: PageSpec[] = [
  { order: 1, id: 'dashboard', name: 'Dashboard', route: '/' },

  /*
    10번대 — 고객사.

    차례는 보조 메뉴와 같고, 그 차례는 시간 순이다: 아직 고객사가 아닌 곳(파이프라인)에서
    시작해 무엇을 했고(활동) 누구와 했는지(담당자)를 지나 떠난 곳(이탈)에서 끝난다.
  */
  { order: 10, id: 'tenants', name: 'Tenants', route: '/tenants' },
  { order: 11, id: 'tenants-pipeline', name: 'Pipeline', route: '/tenants/pipeline' },
  { order: 12, id: 'tenants-activities', name: 'Activities', route: '/tenants/activities' },
  { order: 13, id: 'tenants-contacts', name: 'Contacts', route: '/tenants/contacts' },
  { order: 14, id: 'tenants-churned', name: 'Churned Tenants', route: '/tenants/churned' },
  /*
    상세는 메뉴에 항목이 없다 — 목록에서만 들어간다. 그래도 매니페스트에는 올린다:
    주소가 있는 화면이고, 빠뜨리면 Figma 에도 명세에도 자리가 생기지 않는다.
  */
  {
    order: 15,
    id: 'tenants-detail',
    name: 'Tenant Detail',
    route: '/tenants/[tenantId]',
    sampleUrl: '/tenants/T-101',
  },

  // 20번대 — 구독
  { order: 20, id: 'subscriptions-plans', name: 'Plans', route: '/subscriptions/plans' },
  { order: 21, id: 'subscriptions-roles', name: 'Roles', route: '/subscriptions/roles' },
  /* 목록에서만 들어간다 — 상세를 매니페스트에서 빠뜨리면 명세에도 Figma 에도 자리가 없다. */
  {
    order: 22,
    id: 'subscriptions-roles-detail',
    name: 'Role Detail',
    route: '/subscriptions/roles/[roleId]',
    sampleUrl: '/subscriptions/roles/tenant-operator',
  },

  // 30번대 — 문의
  { order: 30, id: 'inquiries', name: 'Inquiries', route: '/inquiries' },

  // 40번대 — 연동
  { order: 40, id: 'integrations-pg', name: 'Integration PG', route: '/integrations/pg' },
  { order: 41, id: 'integrations-oauth', name: 'Integration OAuth', route: '/integrations/oauth' },
  { order: 42, id: 'integrations-plugin', name: 'Integration Plugin', route: '/integrations/plugin' },
  { order: 43, id: 'integrations-dns', name: 'Integration DNS / SSL', route: '/integrations/dns' },

  // 50번대 — 통계
  { order: 50, id: 'statistics-revenue', name: 'Revenue', route: '/statistics/revenue' },
  { order: 51, id: 'statistics-members', name: 'Members', route: '/statistics/members' },

  // 60번대 — 결제
  { order: 60, id: 'billing-due', name: 'Billing Due', route: '/billing/due' },
  { order: 61, id: 'billing-overdue', name: 'Billing Overdue', route: '/billing/overdue' },

  // 70번대 — 설정
  { order: 70, id: 'settings-staff', name: 'Staff', route: '/settings/staff' },
  { order: 71, id: 'settings-notifications', name: 'Notifications', route: '/settings/notifications' },
  { order: 72, id: 'settings-codes', name: 'Codes', route: '/settings/codes' },

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

/** 추출 대상에서 제외할 개발 전용 라우트 */
export const devOnlyRoutes: string[] = [];
