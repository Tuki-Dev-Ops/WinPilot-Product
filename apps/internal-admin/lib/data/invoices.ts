/**
 * 구매 · 유지보수 비용 — **프론트엔드 전용** 시드.
 *
 * 사내 어드민은 청구를 **집행하지 않고 안내만** 한다. 실제 결제·세금계산서는 회계가 처리하며,
 * 여기서는 고객사에 무엇을 얼마에 팔았고 유지보수가 언제까지인지를 한눈에 보여준다.
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
