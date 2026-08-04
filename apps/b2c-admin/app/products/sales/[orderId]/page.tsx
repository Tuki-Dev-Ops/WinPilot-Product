import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/app/_components/AdminShell';
import { findOrder, ORDERS } from '@/lib/data/orders';
import { OrderDetailView } from './_components/OrderDetailView';

/**
 * Feature: `order.detail` · B2C Admin · route `/products/sales/{orderId}`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '상품 | 판매 | 상세페이지 — WinPilot Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 시드 주문만 존재하므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return ORDERS.map((order) => ({ orderId: order.id }));
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = findOrder(orderId);
  if (!order) notFound();

  return (
    <AdminShell sectionId="product" trail={['상품', '판매', '상세페이지']} activeChildId="product-sales">
      <OrderDetailView order={order} />
    </AdminShell>
  );
}
