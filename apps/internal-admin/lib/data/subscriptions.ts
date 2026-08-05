/**
 * 구독 — 플랜과 권한. **프론트엔드 전용** 시드.
 *
 * 두 자원을 한 파일에 두는 이유: **플랜이 권한을 켠다.** 어떤 권한이 어느 플랜부터
 * 열리는지가 두 값 사이의 관계이므로, 파일을 나누면 그 관계가 어느 쪽에도 살지 않는다.
 *
 * 여기 `권한` 은 **고객사가 자기 콘솔에서 쓰는** 것이다. 이 콘솔에 들어오는 우리 직원의
 * 권한은 `settings.ts` 에 있다 — 보는 사람이 달라 갈래를 나눴다.
 */
export type PlanRecord = {
  id: string;
  /** 화면과 계약서에 그대로 적히는 이름 — 기준 값(`/settings/codes`)의 플랜 목록과 같은 말이다 */
  name: string;
  /** 월 구독료 (원) */
  monthly: number;
  /** 이 플랜으로 쓸 수 있는 배포 수 */
  deployments: number;
  /** 고객사 사이트에 가입할 수 있는 회원 수 상한 */
  memberLimit: number;
  /** 켜지는 권한 id 목록 */
  roles: string[];
  /** 지금 이 플랜을 쓰는 고객사 수 */
  tenants: number;
  /** 새 계약에 팔 수 있는지 — 끈 플랜은 쓰던 고객사만 남는다 */
  sellable: boolean;
  note: string;
};

export type RoleRecord = {
  id: string;
  name: string;
  /** 이 권한이 여는 것 — 한 문장 */
  grants: string;
  /** 이 권한이 켜지는 최소 플랜 id */
  from: string;
  /** 고객사가 끌 수 있는지. 끄지 못하는 것은 제품이 도는 데 필요한 권한이다 */
  optional: boolean;
};

export const ROLES: RoleRecord[] = [
  {
    id: 'R-01',
    name: '상품 관리',
    grants: '상품·카테고리·옵션을 만들고 고친다.',
    from: 'P-BASIC',
    optional: false,
  },
  {
    id: 'R-02',
    name: '주문 처리',
    grants: '주문 상태를 바꾸고 운송장을 넣는다.',
    from: 'P-BASIC',
    optional: false,
  },
  {
    id: 'R-03',
    name: '콘텐츠 편집',
    grants: '공지·FAQ·뉴스·포트폴리오를 쓴다.',
    from: 'P-BASIC',
    optional: true,
  },
  {
    id: 'R-04',
    name: '통계 열람',
    grants: '매출·방문·기간별 분석을 본다.',
    from: 'P-STANDARD',
    optional: true,
  },
  {
    id: 'R-05',
    name: '쿠폰 발행',
    grants: '쿠폰을 만들고 대상을 정한다.',
    from: 'P-STANDARD',
    optional: true,
  },
  {
    id: 'R-06',
    name: '운영자 초대',
    grants: '자기 회사 사람을 어드민에 부른다.',
    from: 'P-STANDARD',
    optional: true,
  },
  {
    id: 'R-07',
    name: '약관 개정',
    grants: '이용약관·개인정보 처리방침을 고친다.',
    from: 'P-ENTERPRISE',
    optional: true,
  },
  {
    id: 'R-08',
    name: '자료 내려받기',
    grants: '주문·회원 목록을 파일로 받는다.',
    from: 'P-ENTERPRISE',
    optional: true,
  },
];

export const PLANS: PlanRecord[] = [
  {
    id: 'P-BASIC',
    name: '베이직',
    monthly: 500_000,
    deployments: 1,
    memberLimit: 5_000,
    roles: ['R-01', 'R-02', 'R-03'],
    tenants: 1,
    sellable: true,
    note: '고객 화면 한 벌만 쓰는 고객사.',
  },
  {
    id: 'P-STANDARD',
    name: '스탠다드',
    monthly: 800_000,
    deployments: 2,
    memberLimit: 30_000,
    roles: ['R-01', 'R-02', 'R-03', 'R-04', 'R-05', 'R-06'],
    tenants: 1,
    sellable: true,
    note: '고객 화면과 어드민을 함께 쓰는 기본 구성.',
  },
  {
    id: 'P-ENTERPRISE',
    name: '엔터프라이즈',
    monthly: 1_200_000,
    deployments: 4,
    memberLimit: 200_000,
    roles: ['R-01', 'R-02', 'R-03', 'R-04', 'R-05', 'R-06', 'R-07', 'R-08'],
    tenants: 1,
    sellable: true,
    note: '약관을 직접 고치고 자료를 내려받는 고객사.',
  },
  {
    id: 'P-LEGACY',
    name: '스타터(종료)',
    monthly: 300_000,
    deployments: 1,
    memberLimit: 1_000,
    roles: ['R-01', 'R-02'],
    tenants: 0,
    sellable: false,
    // 팔지 않는 플랜을 지우지 않는 이유 — 쓰던 고객사의 계약서에 이 이름이 적혀 있다.
    note: '2025년에 판매를 멈췄습니다. 지우지 않는 이유는 계약서에 이 이름이 남아 있어서입니다.',
  },
];

export function findPlan(id: string): PlanRecord | undefined {
  return PLANS.find((plan) => plan.id === id);
}

export function findRole(id: string): RoleRecord | undefined {
  return ROLES.find((role) => role.id === id);
}

/** 이 권한을 켜 주는 플랜들. 권한 목록에서 "얼마부터 되나" 를 바로 읽게 한다. */
export function plansWith(roleId: string): PlanRecord[] {
  return PLANS.filter((plan) => plan.roles.includes(roleId));
}

export const PLAN_STATE_TONE: Record<'판매 중' | '판매 종료', string> = {
  '판매 중': 'bg-signal-ok/12 text-signal-ok',
  '판매 종료': 'bg-surface text-ink-muted',
};

export function formatWon(value: number): string {
  return value.toLocaleString('ko-KR');
}

export function formatCount(value: number): string {
  return value.toLocaleString('ko-KR');
}
