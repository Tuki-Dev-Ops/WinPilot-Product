/**
 * 청구 내역 — **프론트엔드 전용** 시드.
 *
 * 사내 어드민은 청구를 **집행하지 않고 안내만** 한다. 실제 결제·세금계산서는 회계가 처리하며,
 * 여기서는 고객사에 무엇을 얼마에 팔았고 언제까지 받아야 하는지를 한눈에 보여준다.
 *
 * 목록은 **예정일(`/billing/due`)과 연체(`/billing/overdue`)로 갈라 놓는다.** 한 목록에 섞으면
 * 급한 것이 묻히기 때문이고, 그것 말고 다른 이유는 없다 — 자원은 하나이므로 시드도 하나다.
 */
export type InvoiceKind = '구축' | '유지보수' | '추가 개발' | '호스팅';
export type InvoiceState = '견적' | '청구' | '수납' | '연체';

export type InvoiceRecord = {
  id: string;
  tenantId: string;
  kind: InvoiceKind;
  title: string;
  /** 원 단위 */
  amount: number;
  issuedAt: string;
  dueAt: string;
  state: InvoiceState;
  /** 유지보수처럼 매달 반복되는 항목인지 */
  recurring: boolean;
  memo: string;
};

export const INVOICE_KINDS: InvoiceKind[] = ['구축', '유지보수', '추가 개발', '호스팅'];
export const INVOICE_STATES: InvoiceState[] = ['견적', '청구', '수납', '연체'];

export const INVOICES: InvoiceRecord[] = [
  {
    id: 'IV-2041',
    tenantId: 'T-101',
    kind: '유지보수',
    title: '2026년 8월 유지보수',
    amount: 1_200_000,
    issuedAt: '2026-08-01',
    dueAt: '2026-08-31',
    state: '청구',
    recurring: true,
    memo: '',
  },
  {
    id: 'IV-2040',
    tenantId: 'T-101',
    kind: '추가 개발',
    title: '팝업스토어 랜딩 추가',
    amount: 4_500_000,
    issuedAt: '2026-07-20',
    dueAt: '2026-08-19',
    state: '수납',
    recurring: false,
    memo: '',
  },
  {
    id: 'IV-2039',
    tenantId: 'T-102',
    kind: '유지보수',
    title: '2026년 8월 유지보수',
    amount: 800_000,
    issuedAt: '2026-08-01',
    dueAt: '2026-08-31',
    state: '청구',
    recurring: true,
    memo: '',
  },
  {
    id: 'IV-2038',
    tenantId: 'T-103',
    kind: '유지보수',
    title: '2026년 7월 유지보수',
    amount: 500_000,
    issuedAt: '2026-07-01',
    dueAt: '2026-07-31',
    state: '연체',
    recurring: true,
    memo: '담당자 변경으로 지연되고 있습니다.',
  },
  {
    id: 'IV-2037',
    tenantId: 'T-102',
    kind: '구축',
    title: 'B2C Client · Admin 구축',
    amount: 28_000_000,
    issuedAt: '2026-01-15',
    dueAt: '2026-02-14',
    state: '수납',
    recurring: false,
    memo: '',
  },
  {
    id: 'IV-2042',
    tenantId: 'T-101',
    kind: '유지보수',
    title: '2026년 9월 유지보수',
    amount: 1_200_000,
    issuedAt: '2026-08-25',
    dueAt: '2026-09-30',
    state: '견적',
    recurring: true,
    memo: '',
  },
  {
    id: 'IV-2043',
    tenantId: 'T-102',
    kind: '호스팅',
    title: '2026년 3분기 호스팅',
    amount: 1_800_000,
    issuedAt: '2026-08-01',
    dueAt: '2026-09-15',
    state: '청구',
    recurring: false,
    memo: '',
  },
  {
    id: 'IV-2036',
    tenantId: 'T-103',
    kind: '추가 개발',
    title: '주문서 양식 변경',
    amount: 2_400_000,
    issuedAt: '2026-06-10',
    dueAt: '2026-07-09',
    state: '연체',
    recurring: false,
    memo: '세금계산서 재발행을 기다리고 있습니다.',
  },
];

export const INVOICE_TONE: Record<InvoiceState, string> = {
  견적: 'bg-surface text-ink-muted',
  청구: 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
  수납: 'bg-signal-ok/12 text-signal-ok',
  연체: 'bg-signal-danger/12 text-signal-danger',
};

export function formatAmount(value: number): string {
  return value.toLocaleString('ko-KR');
}

export function invoicesOf(tenantId: string): InvoiceRecord[] {
  return INVOICES.filter((invoice) => invoice.tenantId === tenantId);
}

/** 아직 받지 못한 금액 — 청구·연체만 센다. 견적은 확정이 아니고 수납은 끝난 것이다. */
export function outstanding(items: readonly InvoiceRecord[]): number {
  return items
    .filter((invoice) => invoice.state === '청구' || invoice.state === '연체')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
}

/**
 * 기한이 지났는가.
 *
 * 상태가 `연체` 로 적혀 있지 않아도 기한이 지나면 연체다 — 상태 값은 사람이 나중에 고치는
 * 것이라, 그것만 믿으면 아직 `청구` 로 남아 있는 건이 어느 목록에도 오지 않는다.
 */
export function isLate(invoice: InvoiceRecord, today: string): boolean {
  if (invoice.state === '수납' || invoice.state === '견적') return false;
  return invoice.state === '연체' || invoice.dueAt < today;
}

/** 예정 목록 — 아직 기한이 남은 것. 견적도 함께 본다: 곧 확정될 돈이라 미리 알아야 한다. */
export function dueInvoices(today: string, items: readonly InvoiceRecord[] = INVOICES): InvoiceRecord[] {
  return items
    .filter((invoice) => invoice.state !== '수납' && !isLate(invoice, today))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}

/** 연체 목록 — 기한이 지난 것. 오래된 것이 위로 온다. */
export function overdueInvoices(today: string, items: readonly InvoiceRecord[] = INVOICES): InvoiceRecord[] {
  return items.filter((invoice) => isLate(invoice, today)).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}

/** 며칠 지났는지. 음수면 아직 남은 날이다. */
export function daysFrom(dueAt: string, today: string): number {
  return Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${dueAt}T00:00:00Z`)) / 86_400_000);
}

/**
 * 연체 구간 — 얼마나 지났는지에 따라 손대는 방법이 다르다.
 *
 * 30일까지는 담당자에게 알리면 들어오고, 60일을 넘으면 계약을 다시 봐야 한다. 구간을 나누지
 * 않으면 목록이 그저 길어지기만 하고 무엇부터 손댈지가 보이지 않는다.
 */
export type OverdueBucket = '30일 이내' | '60일 이내' | '60일 초과';

export function overdueBucket(dueAt: string, today: string): OverdueBucket {
  const late = daysFrom(dueAt, today);
  if (late <= 30) return '30일 이내';
  if (late <= 60) return '60일 이내';
  return '60일 초과';
}

export const OVERDUE_BUCKETS: OverdueBucket[] = ['30일 이내', '60일 이내', '60일 초과'];

export const OVERDUE_TONE: Record<OverdueBucket, string> = {
  '30일 이내': 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
  '60일 이내': 'bg-signal-danger/12 text-signal-danger',
  '60일 초과': 'bg-signal-danger/12 text-signal-danger',
};
