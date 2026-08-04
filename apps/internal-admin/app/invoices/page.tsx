import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { todayStamp } from '@/lib/data/tenants';
import { InvoiceListView } from './_components/InvoiceListView';

/**
 * Feature: `invoice.list` · Internal Admin · route `/invoices`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '요금 | 구매 · 유지보수 — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default function InternalInvoiceListPage() {
  return (
    <InternalShell sectionId="invoice" trail={['요금', '구매 · 유지보수']} activeChildId="invoice-list">
      {/* 기준일은 서버에서 정한다 — 화면이 스스로 읽으면 서버·브라우저 값이 어긋난다. */}
      <InvoiceListView today={todayStamp()} />
    </InternalShell>
  );
}
