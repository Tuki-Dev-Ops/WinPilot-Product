import type { Metadata } from 'next';
import {
  ACCOUNT,
  CONTENT,
  COPY,
  ORDER_STATE_TONE,
  ROUTES,
  SHIP_STATE_TONE,
  SLOT,
  cid,
  formatMoney,
} from '@winpilot/client-content';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';

/**
 * Feature: `order.list` · B2C Client (템플릿 A) · route `/orders`
 *
 * 어드민의 '판매' 목록과 **같은 자원**이다 — 주문번호(S-2408x)가 양쪽에서 같다.
 * 어드민은 모든 주문을, 여기서는 내 주문만 본다.
 */
export const metadata: Metadata = { title: `${COPY.order.title} — ${CONTENT.seo.title}` };

export default function OrderListPage() {
  const orders = ACCOUNT.orders;

  return (
    <SiteShell>
      <PageTitle title={COPY.order.title} />

      {orders.length === 0 ? (
        <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">{COPY.order.empty}</p>
      ) : (
        <section
          id={SLOT.orderList}
          data-ssot-cid={cid('order.list', 'SiteOrderList')}
          className="flex flex-col overflow-hidden rounded-xl border border-border"
        >
          {orders.map((order) => (
            <a
              key={order.id}
              href={ROUTES.orderDetail(order.id)}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-5 py-4 last:border-b-0 hover:bg-surface"
            >
              <span className="shrink-0 font-mono text-sm text-ink-muted">{order.id}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {order.productName}
                <span className="ml-1.5 text-ink-muted">· {order.optionLabel}</span>
              </span>
              <span className="shrink-0 text-sm tabular-nums">
                {formatMoney(order.amount)}
                {COPY.product.priceUnit}
              </span>
              <span
                className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATE_TONE[order.payState]}`}
              >
                {order.payState}
              </span>
              <span
                className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${SHIP_STATE_TONE[order.shipState]}`}
              >
                {order.shipState}
              </span>
            </a>
          ))}
        </section>
      )}
    </SiteShell>
  );
}
