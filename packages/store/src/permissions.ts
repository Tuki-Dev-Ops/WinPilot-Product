/**
 * 고객사 콘솔의 **권한 카탈로그** — B2C · B2B · IR 세 도메인.
 *
 * ## 도메인마다 자원이 다르다
 * 파는 것이 다르면 만질 것도 다르다. B2C 에 `주문` 이 있는 자리에 B2B 는 `견적`·`발주` 가
 * 있고, IR 에는 애초에 파는 것이 없어 `공시`·`재무` 가 그 자리를 차지한다. 한 표에 섞으면
 * IR 고객사 화면에 `환불` 이 뜨고, 그때부터 "이건 왜 있냐" 를 말로 설명하게 된다.
 *
 * 그래서 `CONSOLE_RESOURCES` · `CONSOLE_ROLES` 는 **도메인이 열쇠인 표**다. 화면은 탭 하나로
 * 갈아 끼우고, 자원 목록을 화면이 알 필요가 없다.
 *
 * ## 왜 공유 패키지인가
 * 두 앱이 같은 것을 읽는다.
 *
 * - `internal-admin` `/subscriptions/roles` — 우리가 **고객사에게 무엇을 주는지** 정한다
 * - `b2c-admin` `/users/admins` — 고객사 직원이 **내 역할이 무엇을 여는지** 본다
 *
 * 두 벌로 두면 우리가 정한 것과 고객사가 보는 것이 어긋나고, 그 어긋남은 고객사가
 * "안 된다" 고 전화할 때 처음 드러난다.
 *
 * **사내 권한은 여기 없다.** 그것은 `internal-admin` 하나만 쓰므로 그 앱에 둔다
 * (`apps/internal-admin/lib/data/permissions.ts`).
 *
 * ## 이름은 `자원:동작` 으로 적는다
 * 업계에서 굳은 모양이다(`product:write` · `order:refund`). 이름만 보고 무엇을 여는지
 * 읽히고, 서버가 붙으면 그대로 검사 키가 된다.
 *
 * **원자 권한을 마흔 개 늘어놓지 않는다.** `자원 하나 × 동작 서넛` 으로 묶어 고를 때 판단할
 * 것을 줄인다. 카페24가 메뉴마다 '상세 설정' 을 여는 방식도 결국 같은 묶음이다.
 *
 * ## 동작을 넷으로 가른 이유
 * `manage` 를 `write` 와 한 칸에 묶으면 상품을 고치는 사람에게 결제 모드를 바꾸는 힘까지
 * 함께 준다. **되돌릴 수 없는 일은 언제나 한 칸 더 위에 둔다.**
 *
 * ## 출처
 * - https://workos.com/blog/how-to-design-multi-tenant-rbac-saas (`자원:동작` · 템플릿 역할 · 테넌트 스코프)
 * - https://www.descope.com/blog/post/rbac-providers-b2b-saas (기본 역할 3~4단)
 * - https://support.cafe24.com/hc/ko/articles/18280025795865 (메뉴별 권한 · 상세 설정)
 */

export type PermissionAction = 'read' | 'write' | 'delete' | 'manage';

export const ACTION_LABEL: Record<PermissionAction, string> = {
  read: '조회',
  write: '등록·수정',
  delete: '삭제',
  manage: '설정 변경',
};

export const ACTION_NOTE: Record<PermissionAction, string> = {
  read: '목록과 상세를 봅니다.',
  write: '새로 만들고 고칩니다.',
  delete: '지웁니다. 되돌릴 수 없습니다.',
  manage: '그 자원의 규칙 자체를 바꿉니다. 되돌리기 어렵습니다.',
};

export type PermissionResource = {
  /** `자원:동작` 의 앞부분 */
  key: string;
  label: string;
  /** 표에서 묶는 갈래 */
  group: string;
  /** 이 자원이 실제로 갖는 동작만 적는다 — 없는 칸을 그리면 왜 못 누르는지를 찾게 된다 */
  actions: PermissionAction[];
  note: string;
};

/* ── 고객사 콘솔 (b2c-admin) ──────────────────────────────────────── */

export const TENANT_RESOURCES: PermissionResource[] = [
  {
    key: 'product',
    label: '상품',
    group: '판매',
    actions: ['read', 'write', 'delete'],
    note: '상품·옵션·재고를 다룹니다.',
  },
  {
    key: 'category',
    label: '카테고리',
    group: '판매',
    actions: ['read', 'write', 'delete'],
    note: '상품을 묶는 분류를 다룹니다.',
  },
  {
    key: 'order',
    label: '주문',
    group: '판매',
    actions: ['read', 'write'],
    note: '주문을 확인하고 송장을 넣습니다.',
  },
  {
    key: 'order.refund',
    label: '환불·취소',
    group: '판매',
    actions: ['manage'],
    note: '결제를 취소하고 환불합니다. 돈이 나갑니다.',
  },
  {
    key: 'review',
    label: '리뷰',
    group: '판매',
    actions: ['read', 'write'],
    note: '고객이 남긴 리뷰의 노출을 정합니다.',
  },
  {
    key: 'member',
    label: '회원',
    group: '고객',
    actions: ['read', 'write'],
    note: '가입한 회원을 확인하고 상태를 바꿉니다.',
  },
  {
    key: 'member.privacy',
    label: '개인정보 열람',
    group: '고객',
    actions: ['read'],
    note: '연락처·주소 전체를 봅니다. 가리지 않은 값입니다.',
  },
  {
    key: 'grade',
    label: '회원 등급',
    group: '고객',
    actions: ['read', 'manage'],
    note: '등급 기준과 할인율을 정합니다.',
  },
  {
    key: 'coupon',
    label: '쿠폰',
    group: '고객',
    actions: ['read', 'write', 'delete'],
    note: '쿠폰을 만들고 발급 대상을 정합니다.',
  },
  {
    key: 'inquiry',
    label: '문의',
    group: '고객',
    actions: ['read', 'write'],
    note: '고객 문의에 답합니다.',
  },
  {
    key: 'content',
    label: '공지 · FAQ · 뉴스',
    group: '콘텐츠',
    actions: ['read', 'write', 'delete'],
    note: '고객 화면에 나가는 글을 씁니다.',
  },
  {
    key: 'banner',
    label: '배너 · 팝업',
    group: '마케팅',
    actions: ['read', 'write', 'delete'],
    note: '메인 비주얼과 팝업을 겁니다.',
  },
  {
    key: 'seo',
    label: 'SEO',
    group: '마케팅',
    actions: ['read', 'write'],
    note: '검색 제목·설명을 고칩니다.',
  },
  {
    key: 'analytics',
    label: '통계',
    group: '분석',
    actions: ['read'],
    note: '매출·방문 추이를 봅니다.',
  },
  {
    key: 'staff',
    label: '운영자 계정',
    group: '설정',
    actions: ['read', 'manage'],
    note: '어드민에 들어오는 직원을 추가하고 역할을 줍니다.',
  },
  {
    key: 'policy',
    label: '약관 · 공급자 정보',
    group: '설정',
    actions: ['read', 'write'],
    note: '법으로 표시해야 하는 항목을 고칩니다.',
  },
];

/** `자원:동작` 한 마디. 서버가 붙으면 그대로 검사 키가 된다. */
export function permissionKey(resource: string, action: PermissionAction): string {
  return `${resource}:${action}`;
}

export type RoleTemplate = {
  id: string;
  label: string;
  /** 이 역할을 누구에게 주는지 — 이름만으로는 고를 수 없다 */
  note: string;
  /** 가진 권한. `자원:동작` 목록 */
  grants: string[];
  /**
   * 지울 수 없는 역할인지. 계정이 하나도 없는 콘솔이 생기지 않게 막는다 —
   * 최고 권한 역할을 지우면 아무도 권한을 되돌릴 수 없다.
   */
  fixed?: boolean;
};

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

/*
 * 역할은 **템플릿**이다 — 고객사가 처음부터 만들지 않고 이 셋에서 골라 고친다.
 * 자유롭게 만들게 두면 이름만 다른 역할이 열 개 생기고, 그때부터 누가 무엇을 할 수 있는지
 * 아무도 답하지 못한다.
 */

export const TENANT_ROLES: RoleTemplate[] = [
  {
    id: 'tenant-owner',
    label: '최고 관리자',
    note: '모든 것을 합니다. 운영자를 추가하고 환불까지 합니다.',
    fixed: true,
    grants: TENANT_RESOURCES.flatMap((one) =>
      one.actions.map((action) => permissionKey(one.key, action)),
    ),
  },
  {
    id: 'tenant-operator',
    label: '운영',
    note: '상품·주문·콘텐츠를 다룹니다. 환불과 운영자 추가는 하지 못합니다.',
    grants: [
      ...all(TENANT_RESOURCES, ['product', 'category', 'order', 'review', 'content', 'banner', 'seo']),
      permissionKey('member', 'read'),
      permissionKey('member', 'write'),
      permissionKey('coupon', 'read'),
      permissionKey('coupon', 'write'),
      permissionKey('inquiry', 'read'),
      permissionKey('inquiry', 'write'),
      permissionKey('grade', 'read'),
      permissionKey('analytics', 'read'),
      permissionKey('policy', 'read'),
      permissionKey('staff', 'read'),
    ],
  },
  {
    id: 'tenant-merchandiser',
    label: '상품 심사',
    note: '상품과 카테고리만 다룹니다. 주문과 회원은 보지 못합니다.',
    grants: [
      ...all(TENANT_RESOURCES, ['product', 'category']),
      permissionKey('review', 'read'),
      permissionKey('analytics', 'read'),
    ],
  },
  {
    id: 'tenant-cs',
    label: 'CS',
    note: '문의와 주문을 봅니다. 개인정보 전체를 보되 상품은 고치지 못합니다.',
    grants: [
      permissionKey('order', 'read'),
      permissionKey('order', 'write'),
      permissionKey('inquiry', 'read'),
      permissionKey('inquiry', 'write'),
      permissionKey('review', 'read'),
      permissionKey('review', 'write'),
      permissionKey('member', 'read'),
      permissionKey('member.privacy', 'read'),
      permissionKey('coupon', 'read'),
      permissionKey('product', 'read'),
    ],
  },
];

export function hasPermission(role: RoleTemplate, resource: string, action: PermissionAction): boolean {
  return role.grants.includes(permissionKey(resource, action));
}

/** 두 역할의 **차이**만 뽑는다. 비슷한 역할이 늘어나는 것을 막으려면 차이가 보여야 한다. */
export function diffRoles(a: RoleTemplate, b: RoleTemplate): { onlyA: string[]; onlyB: string[] } {
  const setB = new Set(b.grants);
  const setA = new Set(a.grants);
  return {
    onlyA: a.grants.filter((one) => !setB.has(one)),
    onlyB: b.grants.filter((one) => !setA.has(one)),
  };
}

/** 표에서 갈래를 묶는 순서. */
export const TENANT_GROUPS = ['판매', '고객', '콘텐츠', '마케팅', '분석', '설정'] as const;

/* ── B2B 콘솔 ─────────────────────────────────────────────────────────
   자원 이름은 플랜 기능 카탈로그(`internal-admin` 의 `plan-features.ts` B2B 갈래)와 같은
   말을 쓴다. 계약서에 '여신 한도' 라고 적고 권한 화면에 '크레딧' 이라고 적으면, 같은 것을
   두 이름으로 부르게 된다. */

export const B2B_RESOURCES: PermissionResource[] = [
  {
    key: 'account',
    label: '거래처',
    group: '거래처',
    actions: ['read', 'write', 'delete'],
    note: '거래처를 등록하고 사업자 정보를 고칩니다.',
  },
  {
    key: 'account.approval',
    label: '거래처 승인',
    group: '거래처',
    actions: ['manage'],
    note: '가입 신청을 받아들입니다. 승인하면 그 자리에서 단가가 보입니다.',
  },
  {
    key: 'account.grade',
    label: '거래처 등급',
    group: '거래처',
    actions: ['read', 'manage'],
    note: '등급을 나누고 등급별 노출 범위를 정합니다.',
  },
  {
    key: 'price.account',
    label: '거래처별 단가',
    group: '가격',
    actions: ['read', 'write', 'manage'],
    note: '거래처마다 다른 값을 겁니다. 매출이 그대로 달라집니다.',
  },
  {
    key: 'price.tier',
    label: '수량별 단가',
    group: '가격',
    actions: ['read', 'write'],
    note: '수량 구간마다 할인율을 겁니다.',
  },
  {
    key: 'quote',
    label: '견적',
    group: '거래',
    actions: ['read', 'write', 'delete'],
    note: '견적을 내고 유효기간을 정합니다.',
  },
  {
    key: 'purchase',
    label: '발주',
    group: '거래',
    actions: ['read', 'write'],
    note: '들어온 발주를 확인하고 출고를 잡습니다.',
  },
  {
    key: 'bulk',
    label: '대량 등록',
    group: '거래',
    actions: ['read', 'manage'],
    note: '엑셀로 상품·단가를 한꺼번에 올립니다. 잘못 올리면 전 거래처 값이 바뀝니다.',
  },
  {
    key: 'credit',
    label: '여신 한도',
    group: '정산',
    actions: ['read', 'manage'],
    note: '외상 한도를 정합니다. 한도를 올리면 회수 위험이 함께 올라갑니다.',
  },
  {
    key: 'receivable',
    label: '미수금',
    group: '정산',
    actions: ['read', 'write'],
    note: '남은 대금을 확인하고 입금을 맞춥니다.',
  },
  {
    key: 'tax',
    label: '세금계산서',
    group: '정산',
    actions: ['read', 'manage'],
    note: '계산서를 끊고 국세청에 보냅니다. 발행 뒤에는 취소 절차를 따로 밟습니다.',
  },
  {
    key: 'erp',
    label: 'ERP 연동',
    group: '연동',
    actions: ['read', 'manage'],
    note: '기간계와 주고받는 키와 주기를 바꿉니다.',
  },
  {
    key: 'contract',
    label: '전자계약',
    group: '연동',
    actions: ['read', 'write'],
    note: '거래 약정서를 보내고 서명 상태를 확인합니다.',
  },
  {
    key: 'staff',
    label: '운영자 계정',
    group: '설정',
    actions: ['read', 'manage'],
    note: '어드민에 들어오는 직원을 추가하고 역할을 줍니다.',
  },
  {
    key: 'policy',
    label: '약관 · 공급자 정보',
    group: '설정',
    actions: ['read', 'write'],
    note: '법으로 표시해야 하는 항목을 고칩니다.',
  },
];

export const B2B_ROLES: RoleTemplate[] = [
  {
    id: 'b2b-owner',
    label: '최고 관리자',
    note: '모든 것을 합니다. 여신 한도와 운영자 추가까지 합니다.',
    fixed: true,
    grants: B2B_RESOURCES.flatMap((one) => one.actions.map((action) => permissionKey(one.key, action))),
  },
  {
    id: 'b2b-sales',
    label: '영업',
    note: '거래처와 단가·견적을 다룹니다. 여신 한도와 세금계산서는 만지지 못합니다.',
    grants: [
      ...all(B2B_RESOURCES, ['account', 'quote', 'price.tier', 'contract']),
      permissionKey('account.approval', 'manage'),
      permissionKey('account.grade', 'read'),
      permissionKey('price.account', 'read'),
      permissionKey('price.account', 'write'),
      permissionKey('purchase', 'read'),
      permissionKey('credit', 'read'),
      permissionKey('receivable', 'read'),
    ],
  },
  {
    id: 'b2b-finance',
    label: '정산',
    note: '여신·미수금·세금계산서를 맡습니다. 단가는 보되 고치지 못합니다.',
    grants: [
      ...all(B2B_RESOURCES, ['credit', 'receivable', 'tax']),
      permissionKey('account', 'read'),
      permissionKey('account.grade', 'read'),
      permissionKey('price.account', 'read'),
      permissionKey('price.tier', 'read'),
      permissionKey('quote', 'read'),
      permissionKey('purchase', 'read'),
      permissionKey('contract', 'read'),
    ],
  },
  {
    id: 'b2b-fulfillment',
    label: '출고',
    note: '발주를 확인하고 출고를 잡습니다. 값과 돈은 보지 못합니다.',
    grants: [
      permissionKey('purchase', 'read'),
      permissionKey('purchase', 'write'),
      permissionKey('account', 'read'),
      permissionKey('quote', 'read'),
    ],
  },
];

export const B2B_GROUPS = ['거래처', '가격', '거래', '정산', '연동', '설정'] as const;

/* ── IR 콘솔 ──────────────────────────────────────────────────────────
   공시는 **올리는 것과 내보내는 것을 가른다.** 자료를 준비하는 사람과 그것을 회사 이름으로
   내보내는 사람이 같으면, 검토 없이 나간 한 줄이 바로 공시가 된다.
   출처: 한국거래소 KIND(https://kind.krx.co.kr/) · 금융감독원 DART(https://dart.fss.or.kr/) */

export const IR_RESOURCES: PermissionResource[] = [
  {
    key: 'disclosure',
    label: '공시 원고',
    group: '공시',
    actions: ['read', 'write', 'delete'],
    note: '공시 글을 쓰고 고칩니다. 아직 나가지는 않습니다.',
  },
  {
    key: 'disclosure.publish',
    label: '공시 게시',
    group: '공시',
    actions: ['manage'],
    note: '회사 이름으로 내보냅니다. 나간 뒤에는 정정 공시로만 고칩니다.',
  },
  {
    key: 'dart',
    label: 'DART 연동',
    group: '공시',
    actions: ['read', 'manage'],
    note: '전자공시를 끌어오는 키와 주기를 바꿉니다.',
  },
  {
    key: 'financial',
    label: '재무 정보',
    group: '재무',
    actions: ['read', 'write'],
    note: '요약 재무와 분기 실적을 올립니다.',
  },
  {
    key: 'stock',
    label: '주가 연동',
    group: '재무',
    actions: ['read', 'manage'],
    note: '시세를 받아 오는 곳과 지연 표시를 정합니다.',
  },
  {
    key: 'dividend',
    label: '배당 정보',
    group: '재무',
    actions: ['read', 'write'],
    note: '배당 이력과 기준일을 적습니다.',
  },
  {
    key: 'meeting',
    label: '주주총회',
    group: '주주',
    actions: ['read', 'write'],
    note: '소집 공고와 안건을 올립니다.',
  },
  {
    key: 'governance',
    label: '지배구조',
    group: '주주',
    actions: ['read', 'write'],
    note: '이사회와 주주 구성을 적습니다.',
  },
  {
    key: 'library',
    label: 'IR 자료실',
    group: '자료',
    actions: ['read', 'write', 'delete'],
    note: '실적 발표 자료와 사업보고서를 올립니다.',
  },
  {
    key: 'schedule',
    label: 'IR 일정',
    group: '자료',
    actions: ['read', 'write'],
    note: '기업설명회와 실적 발표 일정을 겁니다.',
  },
  {
    key: 'notify',
    label: '알림 발송',
    group: '자료',
    actions: ['manage'],
    note: '구독한 투자자에게 메일을 보냅니다. 보낸 것은 거두지 못합니다.',
  },
  {
    key: 'locale',
    label: '국문 · 영문',
    group: '운영',
    actions: ['read', 'write'],
    note: '두 언어의 글을 짝지어 관리합니다.',
  },
  {
    key: 'inquiry',
    label: 'IR 문의',
    group: '운영',
    actions: ['read', 'write'],
    note: '투자자 문의에 답합니다.',
  },
  {
    key: 'staff',
    label: '운영자 계정',
    group: '설정',
    actions: ['read', 'manage'],
    note: '어드민에 들어오는 직원을 추가하고 역할을 줍니다.',
  },
];

export const IR_ROLES: RoleTemplate[] = [
  {
    id: 'ir-owner',
    label: '최고 관리자',
    note: '모든 것을 합니다. 공시를 내보내고 운영자를 추가합니다.',
    fixed: true,
    grants: IR_RESOURCES.flatMap((one) => one.actions.map((action) => permissionKey(one.key, action))),
  },
  {
    id: 'ir-officer',
    label: '공시 책임자',
    note: '검토를 마친 공시를 회사 이름으로 내보냅니다. 알림 발송까지 합니다.',
    grants: [
      ...all(IR_RESOURCES, ['disclosure', 'financial', 'dividend', 'meeting', 'governance', 'library', 'schedule', 'locale']),
      permissionKey('disclosure.publish', 'manage'),
      permissionKey('notify', 'manage'),
      permissionKey('dart', 'read'),
      permissionKey('stock', 'read'),
      permissionKey('inquiry', 'read'),
      permissionKey('inquiry', 'write'),
    ],
  },
  {
    id: 'ir-manager',
    label: 'IR 담당',
    note: '자료를 준비합니다. 내보내는 것은 공시 책임자가 합니다.',
    grants: [
      ...all(IR_RESOURCES, ['disclosure', 'financial', 'dividend', 'meeting', 'governance', 'library', 'schedule', 'locale']),
      permissionKey('dart', 'read'),
      permissionKey('stock', 'read'),
      permissionKey('inquiry', 'read'),
      permissionKey('inquiry', 'write'),
    ],
  },
  {
    id: 'ir-viewer',
    label: '조회',
    note: '보기만 합니다. 감사·법무처럼 확인만 필요한 자리에 줍니다.',
    grants: readOnly(IR_RESOURCES),
  },
];

export const IR_GROUPS = ['공시', '재무', '주주', '자료', '운영', '설정'] as const;

/* ── 도메인으로 묶기 ──────────────────────────────────────────────── */

/** 고객사가 계약한 콘솔 갈래. 플랜의 `PlanDomain` 과 같은 셋이다. */
export type ConsoleDomain = 'B2C' | 'B2B' | 'IR';

export const CONSOLE_DOMAINS: readonly ConsoleDomain[] = ['B2C', 'B2B', 'IR'] as const;

export const CONSOLE_NOTE: Record<ConsoleDomain, string> = {
  B2C: '일반 소비자에게 파는 쇼핑몰입니다. 상품·주문·회원을 누가 만지는지 정합니다.',
  B2B: '사업자 간 거래입니다. 단가와 여신을 누가 만지는지가 가장 민감합니다.',
  IR: '투자자 대상 공시 사이트입니다. 자료를 만드는 사람과 내보내는 사람을 가릅니다.',
};

export const CONSOLE_RESOURCES: Record<ConsoleDomain, PermissionResource[]> = {
  B2C: TENANT_RESOURCES,
  B2B: B2B_RESOURCES,
  IR: IR_RESOURCES,
};

export const CONSOLE_ROLES: Record<ConsoleDomain, RoleTemplate[]> = {
  B2C: TENANT_ROLES,
  B2B: B2B_ROLES,
  IR: IR_ROLES,
};

export const CONSOLE_GROUPS: Record<ConsoleDomain, readonly string[]> = {
  B2C: TENANT_GROUPS,
  B2B: B2B_GROUPS,
  IR: IR_GROUPS,
};

/**
 * 역할이 실제로 여는 `자원:동작` 수. 자원 목록에 없는 키는 세지 않는다 —
 * 자원이 빠진 뒤 남은 권한이 숫자만 부풀리면, 목록에서 두 역할의 크기를 잘못 견주게 된다.
 */
export function grantCount(role: RoleTemplate, resources: PermissionResource[]): number {
  return resources.reduce(
    (sum, resource) => sum + resource.actions.filter((action) => hasPermission(role, resource.key, action)).length,
    0,
  );
}

