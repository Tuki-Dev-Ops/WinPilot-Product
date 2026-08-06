/**
 * **사내 콘솔의 권한** — 우리 직원이 이 콘솔에서 고객사를 어디까지 만지는가.
 *
 * 고객사 콘솔의 권한은 `@winpilot/store` 에 있다. 두 앱(`internal-admin` · `b2c-admin`)이
 * 같은 것을 읽어야 하기 때문이다 — 우리가 정한 것과 고객사가 보는 것이 어긋나면, 그 어긋남은
 * 고객사가 "안 된다" 고 전화할 때 처음 드러난다.
 *
 * 사내 권한을 올리지 않는 이유는 반대다. **이 콘솔 하나만 쓴다.** 공유 패키지에 올리면
 * 고객사 쪽 번들에 우리 내부 자원 이름이 실린다.
 *
 * ## 두 권한이 잘못 열렸을 때 벌어지는 일이 다르다
 * 사내 권한이 새면 **다른 고객사의 키**가 보인다. 고객사 권한이 새면 그 고객사 안에서만
 * 문제가 된다. 같은 표에 담지 않는 이유가 이것이다.
 */
export {
  ACTION_LABEL,
  ACTION_NOTE,
  CONSOLE_DOMAINS,
  CONSOLE_GROUPS,
  CONSOLE_NOTE,
  CONSOLE_RESOURCES,
  CONSOLE_ROLES,
  TENANT_GROUPS,
  TENANT_RESOURCES,
  TENANT_ROLES,
  diffRoles,
  grantCount,
  hasPermission,
  permissionKey,
  type ConsoleDomain,
  type PermissionAction,
  type PermissionResource,
  type RoleTemplate,
} from '@winpilot/store';

import {
  CONSOLE_DOMAINS,
  CONSOLE_ROLES,
  TENANT_RESOURCES,
  permissionKey,
  type ConsoleDomain,
  type PermissionResource,
  type RoleTemplate,
} from '@winpilot/store';

/**
 * 역할 id 하나로 **어느 도메인의 무엇인지**를 찾는다.
 *
 * 상세 화면의 주소가 `/subscriptions/roles/{roleId}` 뿐이라 도메인이 주소에 없다. 주소에
 * 도메인을 함께 적으면 같은 역할이 `/B2C/tenant-cs` 와 `/tenant-cs` 두 주소로 열려, 어느 쪽을
 * 북마크했느냐에 따라 다른 화면을 보게 된다. id 가 이미 도메인마다 다른 접두어(`tenant-` ·
 * `b2b-` · `ir-`)를 갖고 있으므로 찾아 오는 편이 주소를 늘리는 것보다 낫다.
 */
export function findConsoleRole(roleId: string): { domain: ConsoleDomain; role: RoleTemplate } | undefined {
  for (const domain of CONSOLE_DOMAINS) {
    const role = CONSOLE_ROLES[domain].find((one) => one.id === roleId);
    if (role) return { domain, role };
  }
  return undefined;
}

/* ── 사내 콘솔 (internal-admin) ───────────────────────────────────── */

export const INTERNAL_RESOURCES: PermissionResource[] = [
  {
    key: 'tenant',
    label: '고객사',
    group: '고객사',
    actions: ['read', 'write', 'delete'],
    note: '고객사를 등록하고 계약 정보를 고칩니다.',
  },
  {
    key: 'pipeline',
    label: '파이프라인',
    group: '고객사',
    actions: ['read', 'write'],
    note: '도입 단계를 옮기고 예상 금액을 적습니다.',
  },
  {
    key: 'activity',
    label: '활동 기록',
    group: '고객사',
    actions: ['read', 'write'],
    note: '고객사와 오간 기록을 남깁니다.',
  },
  {
    key: 'contact',
    label: '고객사 담당자',
    group: '고객사',
    actions: ['read', 'write', 'delete'],
    note: '고객사 쪽 연락처를 관리합니다.',
  },
  {
    key: 'plan',
    label: '플랜',
    group: '구독',
    actions: ['read', 'manage'],
    note: '요금과 기능 구성을 정합니다. 계약 금액이 바뀝니다.',
  },
  {
    key: 'role',
    label: '고객사 권한',
    group: '구독',
    actions: ['read', 'manage'],
    note: '고객사가 자기 콘솔에서 쓰는 권한을 정합니다.',
  },
  {
    key: 'inquiry',
    label: '문의',
    group: '응대',
    actions: ['read', 'write'],
    note: '고객사가 보낸 문의에 답합니다.',
  },
  {
    key: 'integration',
    label: '연동 값',
    group: '연동',
    actions: ['read', 'write'],
    note: 'PG·OAuth·플러그인·DNS 키를 넣습니다.',
  },
  {
    key: 'integration.live',
    label: '실결제 전환',
    group: '연동',
    actions: ['manage'],
    note: '테스트를 실결제로 넘깁니다. 고객의 카드에서 실제로 돈이 빠집니다.',
  },
  {
    key: 'billing',
    label: '청구',
    group: '정산',
    actions: ['read', 'write'],
    note: '청구를 만들고 기한을 정합니다.',
  },
  {
    key: 'analytics',
    label: '통계',
    group: '정산',
    actions: ['read'],
    note: '매출·회원 추이를 봅니다.',
  },
  {
    key: 'staff',
    label: '관리자 계정',
    group: '설정',
    actions: ['read', 'manage'],
    note: '이 콘솔에 들어오는 직원을 추가하고 직급을 줍니다.',
  },
  {
    key: 'code',
    label: '기준 값',
    group: '설정',
    actions: ['read', 'write'],
    note: '여러 화면이 함께 쓰는 목록을 고칩니다.',
  },
];

/** 그 자원의 모든 동작을 편다 — 표를 손으로 늘어놓지 않기 위한 도우미다. */
function all(resources: PermissionResource[], keys: string[]): string[] {
  return resources
    .filter((one) => keys.includes(one.key))
    .flatMap((one) => one.actions.map((action) => permissionKey(one.key, action)));
}

/** 읽기만 편다. */
function readOnly(resources: PermissionResource[]): string[] {
  return resources
    .filter((one) => one.actions.includes('read'))
    .map((one) => permissionKey(one.key, 'read'));
}

export const INTERNAL_ROLES: RoleTemplate[] = [
  {
    id: 'internal-owner',
    label: '관리자',
    note: '모든 고객사. 실결제 전환·플랜 변경처럼 되돌리기 어려운 일까지 합니다.',
    fixed: true,
    grants: INTERNAL_RESOURCES.flatMap((one) =>
      one.actions.map((action) => permissionKey(one.key, action)),
    ),
  },
  {
    id: 'internal-manager',
    label: '담당',
    note: '맡은 고객사만. 연동 값을 고치되 실결제 전환과 플랜 변경은 하지 못합니다.',
    grants: [
      ...all(INTERNAL_RESOURCES, ['tenant', 'pipeline', 'activity', 'contact', 'inquiry', 'billing']),
      ...all(INTERNAL_RESOURCES, ['integration']),
      permissionKey('plan', 'read'),
      permissionKey('role', 'read'),
      permissionKey('analytics', 'read'),
      permissionKey('code', 'read'),
      permissionKey('staff', 'read'),
    ],
  },
  {
    id: 'internal-viewer',
    label: '조회',
    note: '읽기만 합니다. 저장 단추가 아예 보이지 않습니다.',
    grants: readOnly(INTERNAL_RESOURCES),
  },
];

export const INTERNAL_GROUPS = ['고객사', '구독', '응대', '연동', '정산', '설정'] as const;

// `TENANT_RESOURCES` 는 재수출만 하고 이 파일에서는 쓰지 않는다.
void TENANT_RESOURCES;
