import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { OrderListView } from './_components/OrderListView';

/**
 * Feature: `order.list` · B2C Admin · route `/products/sales`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '상품 | 판매 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminOrderListPage() {
  return (
    <AdminShell sectionId="product" trail={['상품', '판매']} activeChildId="product-sales">
      <OrderListView />
    </AdminShell>
  );
}
