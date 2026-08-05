import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { todayStamp } from '@/lib/data/tenants';
import { InvoiceListView } from './_components/InvoiceListView';

/**
 * Feature: `invoice.list` · Internal Admin · route `/billing/due`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 앞으로 받을 것만 본다. 기한이 지난 것은 연체(`/billing/overdue`)로 갈라 놓는다 —
 * 한 목록에 섞으면 급한 것이 묻힌다. 자원은 하나이므로 시드도 하나다.
 */
export const metadata: Metadata = {
  title: '결제 | 예정일 — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default function InternalInvoiceListPage() {
  return (
    <InternalShell sectionId="billing" trail={['결제', '예정일']} activeChildId="billing-due">
      {/* 기준일은 서버에서 정한다 — 화면이 스스로 읽으면 서버·브라우저 값이 어긋난다. */}
      <InvoiceListView today={todayStamp()} />
    </InternalShell>
  );
}
