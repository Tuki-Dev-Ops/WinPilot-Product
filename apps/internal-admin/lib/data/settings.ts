/**
 * 설정 — 사내 계정 · 알림 · 기준 값. **프론트엔드 전용** 시드.
 *
 * 셋 다 **이 콘솔 자신의 값**이라 한 파일에 둔다. 고객사에 붙는 값(구독·연동·청구)과 달리
 * 고객사를 고르지 않으며, 여기서 정한 것은 이 콘솔을 쓰는 우리에게만 걸린다.
 *
 * ## 7.1 사내 계정과 2.2 권한의 차이
 * 2.2 `권한`(`subscriptions.ts`)은 **고객사가 자기 콘솔에서 쓰는** 권한이고, 여기 `사내 계정`은
 * **이 콘솔에 들어오는 우리 직원**이다. 보는 사람도 여는 문도 달라 한 갈래에 두지 않는다.
 */

/* ── 사내 계정 ───────────────────────────────────────────────────────── */

/**
 * 이 콘솔에서의 직급.
 *
 * 셋으로 끊는 기준은 **되돌릴 수 없는 일을 누가 하느냐**다. 실결제 전환·플랜 변경처럼
 * 되돌리기 어려운 것은 `관리자` 만 하고, `담당` 은 자기가 맡은 고객사만, `조회` 는 읽기만 한다.
 */
export type StaffRank = '관리자' | '담당' | '조회';

export type StaffRecord = {
  id: string;
  name: string;
  email: string;
  /** 소속 — 누구에게 물어야 하는지가 목록에서 바로 보여야 한다 */
  team: string;
  rank: StaffRank;
  /** 맡은 고객사 id 목록. 관리자는 전부라 비워 둔다 */
  tenants: string[];
  lastSignedInAt: string;
  active: boolean;
};

export const STAFF_RANKS: StaffRank[] = ['관리자', '담당', '조회'];

export const STAFF: StaffRecord[] = [
  {
    id: 'S-01',
    name: '박현우',
    email: 'hyunwoo.park@winpilot.test',
    team: '기술지원',
    rank: '관리자',
    tenants: [],
    lastSignedInAt: '2026-08-05 09:41',
    active: true,
  },
  {
    id: 'S-02',
    name: '정소미',
    email: 'somi.jung@winpilot.test',
    team: '고객성공',
    rank: '담당',
    tenants: ['T-101', 'T-103'],
    lastSignedInAt: '2026-08-05 08:57',
    active: true,
  },
  {
    id: 'S-03',
    name: '임재훈',
    email: 'jaehoon.lim@winpilot.test',
    team: '고객성공',
    rank: '담당',
    tenants: ['T-102'],
    lastSignedInAt: '2026-08-04 18:20',
    active: true,
  },
  {
    id: 'S-04',
    name: '서다은',
    email: 'daeun.seo@winpilot.test',
    team: '경영지원',
    rank: '조회',
    tenants: [],
    lastSignedInAt: '2026-07-31 14:03',
    active: true,
  },
  {
    id: 'S-05',
    name: '노기훈',
    email: 'kihoon.noh@winpilot.test',
    team: '기술지원',
    rank: '담당',
    tenants: [],
    lastSignedInAt: '2026-05-12 11:22',
    active: false,
  },
];

export const RANK_TONE: Record<StaffRank, string> = {
  관리자: 'bg-signal-ok/12 text-signal-ok',
  담당: 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
  조회: 'bg-surface text-ink-muted',
};

/** 직급이 여는 것 — 목록 옆에 적어 두어야 무엇을 주는 것인지 알고 고른다. */
export const RANK_GRANTS: Record<StaffRank, string> = {
  관리자: '모든 고객사. 실결제 전환·플랜 변경처럼 되돌리기 어려운 일까지 한다.',
  담당: '맡은 고객사만. 연동 값을 고치되 실결제 전환은 하지 못한다.',
  조회: '읽기만 한다. 저장 단추가 아예 보이지 않는다.',
};

/* ── 알림 ────────────────────────────────────────────────────────────── */

/**
 * 알림 규칙.
 *
 * 신호를 만드는 곳(통계·결제·연동)과 받는 곳을 나눈 이유는, 신호를 내는 화면마다 알림 조건을
 * 박아 두면 같은 규칙이 화면 수만큼 늘어나기 때문이다. 늘어난 규칙은 한 번에 고쳐지지 않는다.
 */
export type AlarmChannel = '메일' | '사내 메신저' | '알림 없음';

export type AlarmRule = {
  id: string;
  /** 무엇이 일어났을 때 */
  event: string;
  /** 그 신호를 내는 화면 — 어디를 고치면 이 알림이 달라지는지 */
  source: string;
  /** 며칠 전/후에 알릴지. 0 이면 그 자리에서 */
  offsetDays: number;
  channel: AlarmChannel;
  /** 받을 사람 — 사내 계정의 직급으로 고른다 */
  audience: StaffRank;
  enabled: boolean;
};

export const ALARM_CHANNELS: AlarmChannel[] = ['메일', '사내 메신저', '알림 없음'];

export const ALARM_RULES: AlarmRule[] = [
  {
    id: 'A-01',
    event: '유지보수 종료가 다가옴',
    source: '고객사 · 고객',
    offsetDays: 30,
    channel: '메일',
    audience: '담당',
    enabled: true,
  },
  {
    id: 'A-02',
    event: '청구 기한이 다가옴',
    source: '결제 · 예정일',
    offsetDays: 7,
    channel: '사내 메신저',
    audience: '담당',
    enabled: true,
  },
  {
    id: 'A-03',
    event: '청구 기한이 지남',
    source: '결제 · 연체',
    offsetDays: 1,
    channel: '메일',
    audience: '관리자',
    enabled: true,
  },
  {
    id: 'A-04',
    event: '연체가 60일을 넘김',
    source: '결제 · 연체',
    offsetDays: 60,
    channel: '메일',
    audience: '관리자',
    enabled: true,
  },
  {
    id: 'A-05',
    event: '회원 수가 플랜 상한의 90% 를 넘김',
    source: '통계 · 회원',
    offsetDays: 0,
    channel: '사내 메신저',
    audience: '담당',
    enabled: true,
  },
  {
    id: 'A-06',
    event: 'DNS 레코드가 불일치로 바뀜',
    source: '연동 · DNS',
    offsetDays: 0,
    channel: '사내 메신저',
    audience: '관리자',
    enabled: true,
  },
  {
    id: 'A-07',
    event: '장애 문의가 들어옴',
    source: '문의',
    offsetDays: 0,
    channel: '사내 메신저',
    audience: '담당',
    enabled: true,
  },
  {
    id: 'A-08',
    event: '고객사가 이탈로 넘어감',
    source: '고객사 · 이탈',
    offsetDays: 0,
    channel: '메일',
    audience: '관리자',
    enabled: false,
  },
];

/* ── 기준 값 ─────────────────────────────────────────────────────────── */

/**
 * 여러 화면이 함께 쓰는 목록.
 *
 * 플랜 이름은 구독·고객사·이탈·매출 네 화면에 나오고, 문의 분류는 문의 목록과 알림 규칙에
 * 나온다. 화면마다 박아 두면 이름 하나를 고칠 때 네 곳을 찾아다녀야 하고, 한 곳을 빠뜨리면
 * 같은 값이 두 이름으로 보인다.
 */
export type CodeGroup = {
  id: string;
  name: string;
  /** 이 목록을 읽는 화면들 — 여기를 고치면 어디가 달라지는지 */
  usedBy: string[];
  values: string[];
  /** 화면이 코드로 들고 있어 이 화면에서 늘릴 수 없는 목록 */
  locked: boolean;
  note: string;
};

export const CODE_GROUPS: CodeGroup[] = [
  {
    id: 'C-PLAN',
    name: '플랜 이름',
    usedBy: ['구독 · 플랜', '고객사 · 고객', '고객사 · 이탈', '통계 · 매출'],
    values: ['베이직', '스탠다드', '엔터프라이즈', '스타터(종료)'],
    locked: false,
    note: '계약서에 그대로 적히는 말이라 팔지 않는 플랜도 지우지 않는다.',
  },
  {
    id: 'C-INQUIRY',
    name: '문의 분류',
    usedBy: ['문의', '설정 · 알림'],
    values: ['장애', '기능 요청', '결제', '계약', '기타'],
    locked: false,
    note: '고객사가 문의를 보낼 때 고르는 목록과 같다.',
  },
  {
    id: 'C-CHURN',
    name: '이탈 사유',
    usedBy: ['고객사 · 이탈'],
    values: ['가격', '기능 부족', '내부 사정', '경쟁사 이동', '연락 두절'],
    locked: false,
    note: '다음 계약의 조건을 정하는 값이라 자유 입력으로 두지 않는다.',
  },
  {
    id: 'C-INVOICE',
    name: '청구 항목',
    usedBy: ['결제 · 예정일', '결제 · 연체', '통계 · 매출'],
    values: ['구축', '유지보수', '추가 개발', '호스팅'],
    locked: false,
    note: '',
  },
  {
    id: 'C-STATE',
    name: '청구 상태',
    usedBy: ['결제 · 예정일', '결제 · 연체'],
    values: ['견적', '청구', '수납', '연체'],
    locked: true,
    note: '화면이 상태마다 다르게 그리므로 이 목록은 코드가 들고 있다 — 늘리려면 화면을 함께 고쳐야 한다.',
  },
  {
    id: 'C-DEPLOY',
    name: '배포 종류',
    usedBy: ['고객사 · 고객', '연동 · DNS'],
    values: ['B2C Client', 'B2C Admin'],
    locked: true,
    note: '제품 이름이라 여기서 늘릴 값이 아니다.',
  },
];
