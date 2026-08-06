/**
 * Internal Admin 내비게이션 정의.
 *
 * 이 앱은 **우리 회사가 고객사를 관리하는 도구**다. B2C Client/Admin 을 쓰는 고객사의
 * 구독·연동·요금을 대신 정하고, 여기서 정한 값이 **고객사의 배포**에 반영된다.
 *
 * 고객사 담당자가 아니라 **우리 직원만** 들어오는 화면이므로 B2C Admin 과 레포를 나눈다 —
 * 같은 배포에 두면 권한 하나만 잘못 열려도 고객사가 다른 고객사의 설정을 보게 된다.
 *
 * 규칙은 B2C Admin 과 같다 (docs/spec/04-ia.md §4.4):
 *  - 사이드바는 최상위만, 세부는 본문 왼쪽 상단 보조 메뉴에.
 *
 * ## 갈래를 이렇게 나눈 이유
 * 고객사 하나를 두고 묻는 것이 넷이다 — **누구인가**(1 고객사) · **무엇을 샀나**(2 구독) ·
 * **무엇을 붙였나**(4 연동) · **얼마를 받나**(6 결제). 3 문의는 그 넷 어디로도 들어오는
 * 말이라 갈래를 따로 두었고, 5 통계는 넷을 합쳐 읽는 자리다.
 *
 * ## 7 설정을 따로 둔 이유
 * - **7.1 관리자**는 2.2 `권한` 과 성격이 다르다. 2.2 는 **고객사가 자기 콘솔에서 쓰는**
 *   권한이고, 7.1 은 **이 콘솔에 들어오는 우리 직원**이다. 한 갈래에 두면 고객사 권한을
 *   고치러 들어온 사람이 직원 계정을 만지게 된다.
 * - **7.2 알림**은 5·6 이 만들어 내는 신호(만료 임박·연체)를 받을 곳이 필요해서 둔다.
 *   신호를 내는 화면마다 알림 조건을 박아 두면 같은 규칙이 화면 수만큼 늘어난다.
 * - **7.3 기준 값**은 플랜 이름·문의 분류처럼 **여러 화면이 함께 쓰는 목록**이다. 화면마다
 *   박아 두면 두 벌이 되고, 그때부터 어느 쪽이 맞는지 알 수 없다.
 *
 * 라우트의 원본은 `@winpilot/spec` 의 features.ts 다. 여기 `href` 는 그 라우트를 옮겨 적은
 * 것이며, 어긋나면 `pnpm spec:check` 가 잡는다.
 */
export type InternalMenuChild = {
  id: string;
  label: string;
  href: string;
  ready?: boolean;
};

export type InternalMenuItem = InternalMenuChild & {
  children?: InternalMenuChild[];
  /**
   * 이 항목 **앞에 가는 선**을 그을지.
   *
   * 위치를 셸에 박지 않고 메뉴가 들고 있는 이유: 선이 필요한 까닭은 "마지막 항목이라서" 가
   * 아니라 **성격이 다르기 때문**이다(7 설정은 고객사가 아니라 이 콘솔 자신의 값을 다룬다 —
   * 위 머리말 참고). 자리로 판단하면 갈래가 하나 늘어나는 날 선이 엉뚱한 곳에 남는다.
   */
  separatedBefore?: boolean;
};

export const INTERNAL_MENU: readonly InternalMenuItem[] = [
  // 대시보드는 갈래가 아니라 **오늘 손댈 것**을 모아 보내는 자리라 번호를 갖지 않는다.
  { id: 'dashboard', label: '대시보드', href: '/', ready: true },
  {
    id: 'tenant',
    label: '고객사',
    href: '/tenants',
    ready: true,
    /*
      갈래를 조금 CRM 처럼 잡는다.

      고객 목록은 **지금 상태**만 보여 주고 **어떻게 여기까지 왔는지**가 없었다. 그래서 계약이
      끊길 때가 되어서야 이탈에서 처음 알게 되는데, 그때는 되돌릴 수 없다. 파이프라인·활동·
      담당자가 그 사이의 관계를 남긴다.

      차례는 시간 순이다 — 아직 고객사가 아닌 곳(파이프라인)에서 시작해, 그동안 무엇을 했고
      (활동) 누구와 했는지(담당자)를 지나, 떠난 곳(이탈)에서 끝난다.
    */
    children: [
      { id: 'tenant-list', label: '고객', href: '/tenants', ready: true },
      // 운영 단계에 들어간 것이 곧 위 목록이다 — 같은 자료를 표와 단계별 칸으로 다르게 본다.
      { id: 'tenant-pipeline', label: '파이프라인', href: '/tenants/pipeline', ready: true },
      { id: 'tenant-activity', label: '활동', href: '/tenants/activities', ready: true },
      { id: 'tenant-contact', label: '담당자', href: '/tenants/contacts', ready: true },
      // 떠난 고객사를 목록에서 지우지 않는다 — 왜 떠났는지가 다음 계약에서 쓰인다.
      { id: 'tenant-churn', label: '이탈', href: '/tenants/churned', ready: true },
    ],
  },
  {
    id: 'subscription',
    label: '구독',
    href: '/subscriptions/plans',
    ready: true,
    children: [
      { id: 'subscription-plan', label: '플랜', href: '/subscriptions/plans', ready: true },
      { id: 'subscription-role', label: '권한', href: '/subscriptions/roles', ready: true },
    ],
  },
  // 세부가 하나뿐이라 자식을 두지 않는다 — 항목이 하나인 보조 메뉴는 자리만 차지한다.
  { id: 'inquiry', label: '문의', href: '/inquiries', ready: true },
  {
    id: 'integration',
    label: '연동',
    href: '/integrations/pg',
    ready: true,
    children: [
      { id: 'integration-pg', label: 'PG', href: '/integrations/pg', ready: true },
      { id: 'integration-oauth', label: 'OAuth', href: '/integrations/oauth', ready: true },
      { id: 'integration-plugin', label: 'Plugin', href: '/integrations/plugin', ready: true },
      { id: 'integration-dns', label: 'DNS / SSL', href: '/integrations/dns', ready: true },
    ],
  },
  {
    id: 'analytics',
    label: '통계',
    href: '/statistics/revenue',
    ready: true,
    children: [
      { id: 'analytics-revenue', label: '매출', href: '/statistics/revenue', ready: true },
      { id: 'analytics-member', label: '회원', href: '/statistics/members', ready: true },
    ],
  },
  {
    id: 'billing',
    label: '결제',
    href: '/billing/due',
    ready: true,
    children: [
      // 같은 청구 목록을 예정일과 연체로 가른다 — 한 목록에 섞으면 급한 것이 묻힌다.
      { id: 'billing-due', label: '예정일', href: '/billing/due', ready: true },
      { id: 'billing-overdue', label: '연체', href: '/billing/overdue', ready: true },
    ],
  },
  {
    id: 'settings',
    label: '설정',
    href: '/settings/staff',
    ready: true,
    // 1~6 은 고객사를 두고 묻는 것이고, 7 은 이 콘솔 자신의 값이다. 그 경계를 선으로 긋는다.
    separatedBefore: true,
    children: [
      { id: 'settings-staff', label: '관리자', href: '/settings/staff', ready: true },
      { id: 'settings-alarm', label: '알림', href: '/settings/notifications', ready: true },
      { id: 'settings-code', label: '기준 값', href: '/settings/codes', ready: true },
    ],
  },
];

export function findInternalSection(id: string): InternalMenuItem | undefined {
  return INTERNAL_MENU.find((item) => item.id === id);
}

/** 아직 만들지 않은 화면은 링크를 걸지 않는다. */
export function linkFor(item: InternalMenuChild): string {
  return item.ready ? item.href : '#none';
}
