import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ACCOUNT, cid, CONTENT, COPY, findOrder, formatMoney, ORDER_STATE_TONE, ROUTES, SHIP_STATE_TONE, SLOT } from '@winpilot/client-content';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';
import { Badge } from '@winpilot/ui';

/**
 * Feature: `order.detail` · B2C Client (템플릿 A) · route `/orders/{orderId}`
 *
 * 어드민의 판매 상세와 **같은 주문**을 다른 눈으로 본다 — 어드민은 처리를,
 * 여기서는 상태 확인을 한다. 그래서 운송장은 보여주되 바꾸는 버튼은 없다.
 *
 * ## 어드민 연동
 * - 어드민 메뉴의 **'판매'** 상세(`/products/sales/[orderId]`)와 같은 자원이다 (엔티티 `order`)
 * - 운송장·택배사 ← 운영자가 판매 상세에서 등록한 값
 * - 결제 상태 · 배송 상태 이름은 어드민 화면과 글자까지 같다
 */
export const metadata: Metadata = { title: `${COPY.order.detail} — ${CONTENT.seo.title}` };

export function generateStaticParams() {
  return ACCOUNT.orders.map((order) => ({ orderId: order.id }));
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <dt className="shrink-0 text-xs text-ink-faint">{label}</dt>
      <dd className="min-w-0 text-right text-sm">{children}</dd>
    </div>
  );
}

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = findOrder(orderId);
  if (!order) notFound();

  return (
    <SiteShell>
      <PageTitle
        title={COPY.order.detail}
        description={order.id}
        back={{ href: ROUTES.orders, label: COPY.order.title }}
      />

      <section
        id={SLOT.orderDetail}
        data-ssot-cid={cid('order.detail', 'SiteOrderDetail')}
        className="flex flex-col gap-6 lg:flex-row lg:items-start"
      >
        <dl className="flex min-w-0 flex-1 flex-col rounded-xl border border-border px-6 py-4">
          <Row label={COPY.order.orderNumber}>
            <span className="font-mono">{order.id}</span>
          </Row>
          <Row label={COPY.order.orderedAt}>
            <span className="font-mono tabular-nums text-ink-muted">{order.orderedAt}</span>
          </Row>
          <Row label={COPY.product.listTitle}>
            <a href={ROUTES.productDetail(order.productId)} className="text-brand-700 dark:text-brand-300">
              {order.productName}
            </a>
          </Row>
          <Row label={COPY.product.option}>
            <span className="text-ink-muted">{order.optionLabel}</span>
          </Row>
          <Row label={COPY.order.quantity}>
            <span className="tabular-nums">{order.quantity}</span>
          </Row>
          <Row label={COPY.order.amount}>
            <span className="font-medium tabular-nums">
              {formatMoney(order.amount)}
              {COPY.product.priceUnit}
            </span>
          </Row>
          <Row label={COPY.order.tracking}>
            {order.trackingNumber ? (
              <span className="font-mono tabular-nums text-ink-muted">
                {order.courier} {order.trackingNumber}
              </span>
            ) : (
              <span className="text-ink-faint">-</span>
            )}
          </Row>
        </dl>

        <aside className="flex w-full shrink-0 flex-col gap-3 rounded-xl border border-border px-6 py-5 lg:w-72">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-ink-faint">{COPY.order.payState}</span>
            <Badge tone={ORDER_STATE_TONE[order.payState]}>
              {order.payState}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-ink-faint">{COPY.order.shipState}</span>
            <Badge tone={SHIP_STATE_TONE[order.shipState]}>
              {order.shipState}
            </Badge>
          </div>
          <a
            href={ROUTES.orders}
            className="mt-2 flex h-11 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-border-strong text-sm text-ink-muted"
          >
            {COPY.order.title}
          </a>
        </aside>
      </section>
    </SiteShell>
  );
}
