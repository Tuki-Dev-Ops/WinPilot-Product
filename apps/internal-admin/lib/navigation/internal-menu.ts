/**
 * Internal Admin 내비게이션 정의.
 *
 * 이 앱은 **우리 회사가 고객사를 관리하는 도구**다. B2C Client/Admin 을 쓰는 고객사의
 * 계정·도메인·OAuth·PG 를 대신 설정하고, 구매·유지보수 비용을 안내한다.
 *
 * 고객사 담당자가 아니라 **우리 직원만** 들어오는 화면이므로 B2C Admin 과 레포를 나눈다 —
 * 같은 배포에 두면 권한 하나만 잘못 열려도 고객사가 다른 고객사의 설정을 보게 된다.
 *
 * 규칙은 B2C Admin 과 같다 (docs/spec/04-ia.md §4.4):
 *  - 사이드바는 최상위만, 세부는 본문 왼쪽 상단 보조 메뉴에.
 */
export type InternalMenuChild = {
  id: string;
  label: string;
  href: string;
  ready?: boolean;
};

export type InternalMenuItem = InternalMenuChild & {
  children?: InternalMenuChild[];
};

export const INTERNAL_MENU: readonly InternalMenuItem[] = [
  { id: 'dashboard', label: '대시보드', href: '/', ready: true },
  {
    id: 'tenant',
    label: '고객사',
    href: '/tenants',
    ready: true,
    children: [
      { id: 'tenant-list', label: '목록', href: '/tenants', ready: true },
    ],
  },
  {
    id: 'integration',
    label: '연동',
    href: '/integrations/oauth',
    ready: true,
    children: [
      { id: 'integration-oauth', label: 'OAuth 정보', href: '/integrations/oauth', ready: true },
      { id: 'integration-payment', label: 'PG 정보', href: '/integrations/payment', ready: true },
    ],
  },
  {
    id: 'invoice',
    label: '요금',
    href: '/invoices',
    ready: true,
    children: [{ id: 'invoice-list', label: '구매 · 유지보수', href: '/invoices', ready: true }],
  },
];

export function findInternalSection(id: string): InternalMenuItem | undefined {
  return INTERNAL_MENU.find((item) => item.id === id);
}

/** 아직 만들지 않은 화면은 링크를 걸지 않는다. */
export function linkFor(item: InternalMenuChild): string {
  return item.ready ? item.href : '#none';
}
