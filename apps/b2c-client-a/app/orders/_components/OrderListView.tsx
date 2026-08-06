'use client';

import { useMemo, useState } from 'react';
import { cid, COPY, formatMoney, ORDER_STATE_TONE, ROUTES, SHIP_STATE_TONE, SLOT, type OrderSummary } from '@winpilot/client-content';
import { SectionTabs } from '@/app/_components/SectionTabs';
import { Badge } from '@winpilot/ui';

/**
 * 주문 내역 — **배송 상태 탭으로 나눠 본다.**
 *
 * 주문이 쌓이면 지금 오고 있는 것과 이미 받은 것이 섞여 어느 것을 눌러야 할지 알기 어렵다.
 * 상태별 건수가 탭에 적혀 있으면 목록을 열기 전에 무엇이 남았는지 알 수 있다.
 *
 * ## 어드민 연동
 * - 어드민 메뉴의 **'판매'** 목록(`/products/sales`)과 같은 자원이다 — 주문번호(S-2408x)가 양쪽에서 같다
 * - 결제 상태 · 배송 상태 이름은 어드민 화면과 글자까지 같다 (엔티티 `order`)
 * - 운송장 번호는 운영자가 판매 상세에서 등록한 값이다
 */
const SHIP_STATES = ['배송준비', '배송중', '배송완료', '교환요청', '교환완료'] as const;

export function OrderListView({ orders }: { orders: OrderSummary[] }) {
  const [tabId, setTabId] = useState('all');

  const tabs = useMemo(
    () => [
      { id: 'all', label: '전체', count: orders.length },
      // 한 건도 없는 상태는 탭에서 뺀다 — 늘 0 인 탭이 줄지어 있으면 탭 줄만 길어진다.
      ...SHIP_STATES.filter((state) => orders.some((order) => order.shipState === state)).map((state) => ({
        id: state,
        label: state,
        count: orders.filter((order) => order.shipState === state).length,
      })),
    ],
    [orders],
  );

  const visible = tabId === 'all' ? orders : orders.filter((order) => order.shipState === tabId);

  return (
    <>
      <SectionTabs tabs={tabs} activeId={tabId} onSelect={setTabId} label={COPY.order.title} />

      {visible.length === 0 ? (
        <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">{COPY.order.empty}</p>
      ) : (
        <section
          id={SLOT.orderList}
          data-ssot-cid={cid('order.list', 'SiteOrderList')}
          className="flex flex-col overflow-hidden rounded-xl border border-border"
        >
          {visible.map((order) => (
            <a
              key={order.id}
              href={ROUTES.orderDetail(order.id)}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-5 py-4 transition-colors duration-150 last:border-b-0 hover:bg-surface"
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
              <Badge tone={ORDER_STATE_TONE[order.payState]}>
                {order.payState}
              </Badge>
              <Badge tone={SHIP_STATE_TONE[order.shipState]}>
                {order.shipState}
              </Badge>
            </a>
          ))}
        </section>
      )}
    </>
  );
}
