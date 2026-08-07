'use client';

import { Ban, Repeat, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type MouseEvent } from 'react';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import { AdminListPager } from '@/app/_components/AdminListPager';
import { AdminSelectionBar } from '@/app/_components/AdminSelectionBar';
import { ALL_VALUE, Badge, Checkbox, ListToolbar, PageHeading, RowActionGroup, RowSelectCell, useToast, type ListFilterField } from '@winpilot/ui';
import { COURIERS, ORDERS, PAY_TONE, SHIP_TONE, type OrderRecord } from '@/lib/data/orders';
import { canExchange, findOption, optionLabelOf } from '@/lib/data/product-options';
import { formatAmount } from '@/lib/validation/product-record';
import { ExchangeModal } from './ExchangeModal';
import { TrackingModal, type TrackingInput } from './TrackingModal';

const TAB_SHIP: Record<string, string | null> = {
  all: null,
  ready: '배송준비',
  shipping: '배송중',
  done: '배송완료',
  exchange: '교환요청',
};
const TAB_LABEL: Record<string, string> = {
  all: '전체',
  ready: '배송준비',
  shipping: '배송중',
  done: '배송완료',
  exchange: '교환요청',
};



function TruckIcon() {
  return (
    <Truck aria-hidden className="size-[15px]" strokeWidth={1.4} />
  );
}

function CancelIcon() {
  return (
    <Ban aria-hidden className="size-[15px]" strokeWidth={1.4} />
  );
}

function ExchangeIcon() {
  return (
    <Repeat aria-hidden className="size-[15px]" strokeWidth={1.4} />
  );
}

type PendingAction = 'cancel';

/**
 * 판매(주문) 목록.
 *
 * 체크박스로 고른 건에 대한 동작은 화면 아래 가운데 막대에 모은다 (`AdminSelectionBar`).
 * 행을 누르면 `/products/sales/{주문번호}` 상세로 간다.
 *
 * **프론트엔드 전용** — 상태 변경은 이 화면의 로컬 상태에만 반영된다.
 */
export function OrderListView() {
  const router = useRouter();
  const toast = useToast();

  const [orders, setOrders] = useState<OrderRecord[]>(ORDERS);
  const [activeTabId, setActiveTabId] = useState('all');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [exchangeOrder, setExchangeOrder] = useState<OrderRecord | null>(null);

  const filterFields = useMemo<ListFilterField[]>(
    () => [
      {
        id: 'pay',
        label: '결제 상태',
        options: [
          { value: '결제완료', label: '결제완료' },
          { value: '결제취소', label: '결제취소' },
          { value: '환불완료', label: '환불완료' },
        ],
      },
      {
        id: 'courier',
        label: '택배사',
        options: [
          { value: 'none', label: '미등록' },
          ...COURIERS.map((name) => ({ value: name, label: name })),
        ],
      },
      {
        id: 'method',
        label: '결제 수단',
        options: [...new Set(orders.map((order) => order.payMethod))].map((method) => ({
          value: method,
          label: method,
        })),
      },
    ],
    [orders],
  );

  const matchesFilters = (order: OrderRecord) => {
    const pay = filters.pay ?? ALL_VALUE;
    if (pay !== ALL_VALUE && order.payState !== pay) return false;

    const courier = filters.courier ?? ALL_VALUE;
    if (courier !== ALL_VALUE) {
      if (courier === 'none' ? order.courier !== '' : order.courier !== courier) return false;
    }

    const method = filters.method ?? ALL_VALUE;
    if (method !== ALL_VALUE && order.payMethod !== method) return false;

    return true;
  };

  const tabs = useMemo(
    () =>
      Object.keys(TAB_SHIP).map((id) => {
        const state = TAB_SHIP[id];
        return {
          id,
          label: TAB_LABEL[id] ?? id,
          count: state ? orders.filter((order) => order.shipState === state).length : orders.length,
        };
      }),
    [orders],
  );

  const visible = useMemo(() => {
    const state = TAB_SHIP[activeTabId];
    const keyword = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (state && order.shipState !== state) return false;
      if (!matchesFilters(order)) return false;
      if (!keyword) return true;
      return (
        order.id.toLowerCase().includes(keyword) ||
        order.productName.toLowerCase().includes(keyword) ||
        order.buyerName.toLowerCase().includes(keyword) ||
        order.trackingNumber.includes(keyword)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, activeTabId, search, filters]);

  // 선택은 화면에 보이는 것만 대상으로 한다 — 탭이나 검색으로 가려진 건이 함께 바뀌면 안 된다.
  const visibleIds = visible.map((order) => order.id);
  const selectedVisible = selectedIds.filter((id) => visibleIds.includes(id));
  const allChecked = visible.length > 0 && selectedVisible.length === visible.length;
  const selectedOrders = orders.filter((order) => selectedVisible.includes(order.id));

  const summaryOf = (orderList: OrderRecord[]) => {
    const names = orderList.map((order) => `${order.id} ${order.productName}`);
    return names.length > 2 ? `${names.slice(0, 2).join(', ')} 외 ${names.length - 2}건` : names.join(', ');
  };

  /**
   * 교환은 한 건씩만 받는다.
   *
   * 교환은 사이즈를 **고르는** 일이라 건마다 답이 다르다. 여러 건에 같은 사이즈를
   * 밀어 넣으면 색상도 상품도 다른 주문에 엉뚱한 옵션이 붙는다.
   */
  const openExchange = () => {
    if (selectedOrders.length !== 1) {
      toast.error({
        message: '교환은 한 번에 한 건만 처리할 수 있습니다.',
        detail: `현재 ${selectedOrders.length}건이 선택되어 있습니다. 한 건만 남겨 주세요.`,
      });
      return;
    }

    const target = selectedOrders[0];
    if (!target) return;

    if (!canExchange(target.optionId)) {
      const option = findOption(target.optionId);
      toast.error({
        message: '교환할 수 있는 사이즈가 없습니다.',
        detail: option?.size
          ? `${target.productName} · ${option.color} — 다른 사이즈가 모두 품절입니다.`
          : `${target.productName} — 사이즈 옵션이 없는 상품입니다.`,
      });
      return;
    }

    setExchangeOrder(target);
  };

  const applyExchange = (nextOptionId: string) => {
    const target = exchangeOrder;
    if (!target) return;

    const from = target.optionId;
    setOrders((previous) =>
      previous.map((order) =>
        order.id === target.id
          ? { ...order, optionId: nextOptionId, exchangedFromOptionId: from, shipState: '교환요청' }
          : order,
      ),
    );
    setExchangeOrder(null);
    setSelectedIds([]);
    toast.success({
      message: '교환 요청을 접수했습니다.',
      detail: `${target.id} · ${optionLabelOf(from)} → ${optionLabelOf(nextOptionId)}`,
    });
  };

  const applyTracking = (input: TrackingInput) => {
    const targets = new Set(selectedVisible);
    setOrders((previous) =>
      previous.map((order) =>
        targets.has(order.id)
          ? { ...order, courier: input.courier, trackingNumber: input.trackingNumber, shipState: '배송중' }
          : order,
      ),
    );
    setTrackingOpen(false);
    setSelectedIds([]);
    toast.success({
      message: `운송장 번호를 ${targets.size}건에 등록했습니다.`,
      detail: `${input.courier} · ${input.trackingNumber}`,
    });
  };

  const applyPendingAction = () => {
    const targets = new Set(selectedVisible);
    const affected = orders.filter((order) => targets.has(order.id));

    // 이미 취소된 건을 또 취소하면 안 된다.
    const already = affected.filter((order) => order.payState !== '결제완료');
    setOrders((previous) =>
      previous.map((order) =>
        targets.has(order.id) && order.payState === '결제완료' ? { ...order, payState: '결제취소' } : order,
      ),
    );
    setPendingAction(null);
    setSelectedIds([]);

    const changed = affected.length - already.length;
    if (changed === 0) {
      toast.error({
        message: '결제를 취소하지 못했습니다.',
        detail: '선택한 건은 이미 결제완료 상태가 아닙니다.',
      });
      return;
    }
    toast.success({
      message: `결제를 ${changed}건 취소했습니다.`,
      detail:
        already.length > 0
          ? `${summaryOf(affected)} · 이미 취소된 ${already.length}건은 건너뛰었습니다.`
          : summaryOf(affected),
    });
  };

  return (
    <>
      <PageHeading title="판매" description="들어온 주문과 배송 상태를 확인하세요." />

      <ListToolbar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        searchId="sale-search"
        searchLabel="판매 검색"
        searchHint="주문번호, 상품명, 구매자, 운송장 번호로 검색"
        searchValue={search}
        onSearchChange={setSearch}
        actionLabel="상품 목록"
        onAction={() => {
          toast.info('상품 목록으로 이동합니다.');
          router.push('/products');
        }}
        filters={filterFields}
        filterValues={filters}
        onFilterChange={(id, value) => setFilters((previous) => ({ ...previous, [id]: value }))}
        onFilterReset={() => {
          setFilters({});
          toast.info('필터를 초기화했습니다.');
        }}
      />

      <section
        data-ssot-cid="b2c-admin/order.list#AdminSaleListTable"
        className="overflow-hidden rounded-xl border border-border bg-canvas"
      >
        <div className="hidden gap-4 border-b border-border px-5 py-3 text-xs text-ink-faint lg:grid lg:grid-cols-12 lg:items-center">
          <span className="flex items-center gap-3 lg:col-span-1">
            <Checkbox
              checked={allChecked}
              indeterminate={selectedVisible.length > 0}
              onChange={(checked) => setSelectedIds(checked ? visibleIds : [])}
              label="전체 선택"
            />
            <span className="w-6 text-center">순번</span>
          </span>
          <span className="lg:col-span-4">주문번호 · 상품</span>
          <span className="lg:col-span-2">구매자</span>
          <span className="lg:col-span-1 lg:text-right">결제금액</span>
          <span className="lg:col-span-1 lg:text-center">결제</span>
          <span className="lg:col-span-1 lg:text-center">배송</span>
          <span className="lg:col-span-2 lg:text-center">관리</span>
        </div>

        {visible.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-ink-muted">조건에 맞는 판매 건이 없습니다.</p>
        ) : (
          <div className="flex flex-col">
            {visible.map((order, index) => (
              <div
                key={order.id}
                onClick={() => router.push(`/products/sales/${order.id}`)}
                className="group grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 transition-colors duration-100 last:border-b-0 hover:bg-surface lg:grid-cols-12 lg:items-center lg:gap-y-0"
              >
                <RowSelectCell
                  checked={selectedIds.includes(order.id)}
                  onChange={(checked) =>
                    setSelectedIds((previous) =>
                      checked ? [...previous, order.id] : previous.filter((id) => id !== order.id),
                    )
                  }
                  label={`${order.id} 선택`}
                  index={index}
                />

                <div className="min-w-0 lg:col-span-4">
                  <p className="min-w-0 truncate text-sm font-medium">
                    {order.productName} <span className="text-ink-muted">· {optionLabelOf(order.optionId)}</span>
                    {order.exchangedFromOptionId && (
                      <span className="ml-1.5 text-xs font-normal text-ink-faint">
                        (교환 전 {optionLabelOf(order.exchangedFromOptionId)})
                      </span>
                    )}
                  </p>
                  <p className="font-mono text-xs text-ink-faint">
                    {order.id} · {order.orderedAt}
                    {order.trackingNumber && ` · ${order.courier} ${order.trackingNumber}`}
                  </p>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-2">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">구매자</span>
                  <span className="min-w-0 truncate text-sm">{order.buyerName}</span>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-1 lg:justify-end">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">결제금액</span>
                  <span className="text-sm tabular-nums">{formatAmount(order.amount)}원</span>
                </div>

                <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">결제</span>
                  <Badge tone={PAY_TONE[order.payState]}>
                    {order.payState}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">배송</span>
                  <Badge tone={SHIP_TONE[order.shipState]}>
                    {order.shipState}
                  </Badge>
                </div>

                <div className="lg:col-span-2">
                  <RowActionGroup
                    label={`주문 ${order.id} 상세`}
                    onView={() => router.push(`/products/sales/${order.id}`)}
                    onEdit={() => router.push(`/products/sales/${order.id}`)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <AdminListPager total={visible.length} page={1} pageSize={Math.max(visible.length, 1)} />
      </section>

      <AdminSelectionBar
        count={selectedVisible.length}
        onClear={() => setSelectedIds([])}
        actions={[
          {
            id: 'tracking',
            label: '운송장 번호 등록',
            tone: 'brand',
            icon: <TruckIcon />,
            onClick: () => setTrackingOpen(true),
          },
          {
            id: 'cancel',
            label: '결제 취소',
            tone: 'danger',
            icon: <CancelIcon />,
            onClick: () => setPendingAction('cancel'),
          },
          {
            id: 'exchange',
            label: '교환',
            icon: <ExchangeIcon />,
            onClick: openExchange,
          },
        ]}
      />

      <TrackingModal
        open={trackingOpen}
        count={selectedVisible.length}
        onClose={() => setTrackingOpen(false)}
        onSubmit={applyTracking}
      />

      <ExchangeModal
        open={exchangeOrder !== null}
        order={exchangeOrder}
        onClose={() => setExchangeOrder(null)}
        onSubmit={applyExchange}
      />

      <AdminConfirmModal
        open={pendingAction !== null}
        tone="danger"
        title="결제 취소"
        description="선택한 주문의 결제를 취소합니다. 되돌릴 수 없습니다."
        confirmLabel="결제 취소"
        summary={[
          { label: '대상', value: `${selectedVisible.length}건` },
          { label: '주문', value: summaryOf(selectedOrders) || '-' },
          {
            label: '합계 금액',
            value: `${formatAmount(selectedOrders.reduce((sum, order) => sum + order.amount, 0))}원`,
          },
        ]}
        onConfirm={applyPendingAction}
        onClose={() => setPendingAction(null)}
      />
    </>
  );
}
