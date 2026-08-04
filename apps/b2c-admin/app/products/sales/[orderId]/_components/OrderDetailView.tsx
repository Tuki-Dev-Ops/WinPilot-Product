'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import { useToast } from '@winpilot/ui';
import { PAY_TONE, SHIP_TONE, type OrderRecord } from '@/lib/data/orders';
import { canExchange, findOption, optionLabelOf } from '@/lib/data/product-options';
import { formatAmount } from '@/lib/validation/product-record';
import { ExchangeModal } from '../../_components/ExchangeModal';
import { TrackingModal, type TrackingInput } from '../../_components/TrackingModal';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-canvas">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      </div>
      <dl className="flex flex-col gap-4 px-6 py-5">{children}</dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="w-28 shrink-0 text-xs text-ink-faint">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm leading-relaxed">{children}</dd>
    </div>
  );
}

type PendingAction = 'cancel';

/**
 * 판매 상세 — 목록에서 행을 눌러 들어온다.
 *
 * 주문 내용은 고치지 않는다. 여기서 할 수 있는 일은 목록의 아래 막대와 같은 세 가지
 * (운송장 등록 · 결제 취소 · 교환) 뿐이며, **프론트엔드 전용**이라 이 화면 안에서만 반영된다.
 */
export function OrderDetailView({ order: initial }: { order: OrderRecord }) {
  const router = useRouter();
  const toast = useToast();
  const [order, setOrder] = useState(initial);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [exchangeOpen, setExchangeOpen] = useState(false);

  const option = findOption(order.optionId);
  const exchangeable = canExchange(order.optionId);

  const openExchange = () => {
    if (!exchangeable) {
      toast.error({
        message: '교환할 수 있는 사이즈가 없습니다.',
        detail: option?.size
          ? `${order.productName} · ${option.color} — 다른 사이즈가 모두 품절입니다.`
          : `${order.productName} — 사이즈 옵션이 없는 상품입니다.`,
      });
      return;
    }
    setExchangeOpen(true);
  };

  const applyExchange = (nextOptionId: string) => {
    const from = order.optionId;
    setOrder((previous) => ({
      ...previous,
      optionId: nextOptionId,
      exchangedFromOptionId: from,
      shipState: '교환요청',
    }));
    setExchangeOpen(false);
    toast.success({
      message: '교환 요청을 접수했습니다.',
      detail: `${optionLabelOf(from)} → ${optionLabelOf(nextOptionId)}`,
    });
  };

  const applyTracking = (input: TrackingInput) => {
    setOrder((previous) => ({
      ...previous,
      courier: input.courier,
      trackingNumber: input.trackingNumber,
      shipState: '배송중',
    }));
    setTrackingOpen(false);
    toast.success({
      message: '운송장 번호를 등록했습니다.',
      detail: `${input.courier} · ${input.trackingNumber}`,
    });
  };

  const applyPendingAction = () => {
    if (order.payState !== '결제완료') {
      setPendingAction(null);
      toast.error({ message: '결제를 취소하지 못했습니다.', detail: `현재 상태: ${order.payState}` });
      return;
    }
    setOrder((previous) => ({ ...previous, payState: '결제취소' }));
    setPendingAction(null);
    toast.success({ message: '결제를 취소했습니다.', detail: `${order.id} · ${formatAmount(order.amount)}원` });
  };

  const goToList = () => {
    toast.info('판매 목록으로 이동합니다.');
    router.push('/products/sales');
  };

  return (
    <>
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Section title="주문 정보">
            <Row label="주문번호">
              <span className="font-mono">{order.id}</span>
            </Row>
            <Row label="주문일시">
              <span className="font-mono tabular-nums text-ink-muted">{order.orderedAt}</span>
            </Row>
            <Row label="결제 상태">
              <span
                className={`inline-block shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${PAY_TONE[order.payState]}`}
              >
                {order.payState}
              </span>
            </Row>
            <Row label="배송 상태">
              <span
                className={`inline-block shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${SHIP_TONE[order.shipState]}`}
              >
                {order.shipState}
              </span>
            </Row>
          </Section>

          <Section title="상품">
            <Row label="상품명">{order.productName}</Row>
            <Row label="옵션">
              <span className="text-ink-muted">{optionLabelOf(order.optionId)}</span>
              {order.exchangedFromOptionId && (
                <span className="ml-2 text-xs text-ink-faint">
                  (교환 전 {optionLabelOf(order.exchangedFromOptionId)})
                </span>
              )}
            </Row>
            <Row label="교환 가능">
              {exchangeable ? (
                <span className="text-ink-muted">같은 색상({option?.color})의 다른 사이즈로 교환할 수 있습니다.</span>
              ) : (
                <span className="text-signal-danger">
                  {option?.size ? '다른 사이즈가 모두 품절입니다.' : '사이즈 옵션이 없는 상품입니다.'}
                </span>
              )}
            </Row>
            <Row label="상품 코드">
              <button
                type="button"
                onClick={() => {
                  toast.info('상품 상세로 이동합니다.');
                  router.push(`/products/${order.productId}`);
                }}
                className="font-mono text-brand-700 underline underline-offset-2 dark:text-brand-300"
              >
                {order.productId}
              </button>
            </Row>
            <Row label="수량">
              <span className="tabular-nums">{order.quantity}개</span>
            </Row>
            <Row label="결제금액">
              <span className="font-medium tabular-nums">{formatAmount(order.amount)}원</span>
              <span className="ml-2 text-xs text-ink-muted">{order.payMethod}</span>
            </Row>
          </Section>

          <Section title="구매자 · 배송지">
            <Row label="구매자">{order.buyerName}</Row>
            <Row label="연락처">
              <span className="font-mono tabular-nums text-ink-muted">{order.buyerPhone}</span>
            </Row>
            <Row label="이메일">
              <span className="font-mono text-ink-muted">{order.buyerEmail}</span>
            </Row>
            <Row label="배송지">{order.address}</Row>
            <Row label="배송 메모">
              <span className={order.memo ? '' : 'text-ink-faint'}>{order.memo || '없음'}</span>
            </Row>
          </Section>

          <Section title="배송">
            <Row label="택배사">
              <span className={order.courier ? '' : 'text-ink-faint'}>{order.courier || '미등록'}</span>
            </Row>
            <Row label="운송장 번호">
              <span className={order.trackingNumber ? 'font-mono tabular-nums' : 'text-ink-faint'}>
                {order.trackingNumber || '미등록'}
              </span>
            </Row>
          </Section>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-3 rounded-xl border border-border bg-canvas px-6 py-6 xl:w-80">
          <h2 className="text-base font-semibold tracking-tight">처리</h2>
          <p className="text-xs leading-relaxed text-ink-muted">
            목록에서 여러 건을 골라 한 번에 처리할 수도 있습니다.
          </p>

          <button
            type="button"
            onClick={() => setTrackingOpen(true)}
            className="mt-2 h-11 w-full shrink-0 whitespace-nowrap rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600"
          >
            운송장 번호 등록
          </button>
          <button
            type="button"
            onClick={() => setPendingAction('cancel')}
            className="h-11 w-full shrink-0 whitespace-nowrap rounded-lg border border-border-strong text-sm text-signal-danger transition-colors duration-150 hover:border-signal-danger"
          >
            결제 취소
          </button>
          <button
            type="button"
            onClick={openExchange}
            className="h-11 w-full shrink-0 whitespace-nowrap rounded-lg border border-border-strong text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint"
          >
            교환
          </button>
          <button
            type="button"
            onClick={goToList}
            className="h-11 w-full shrink-0 whitespace-nowrap rounded-lg border border-border-strong text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint"
          >
            목록으로
          </button>
        </aside>
      </div>

      <TrackingModal
        open={trackingOpen}
        count={1}
        onClose={() => setTrackingOpen(false)}
        onSubmit={applyTracking}
      />

      <ExchangeModal
        open={exchangeOpen}
        order={order}
        onClose={() => setExchangeOpen(false)}
        onSubmit={applyExchange}
      />

      <AdminConfirmModal
        open={pendingAction !== null}
        tone="danger"
        title="결제 취소"
        description="이 주문의 결제를 취소합니다. 되돌릴 수 없습니다."
        confirmLabel="결제 취소"
        summary={[
          { label: '주문번호', value: order.id },
          { label: '상품', value: `${order.productName} · ${optionLabelOf(order.optionId)}` },
          { label: '구매자', value: order.buyerName },
          { label: '결제금액', value: `${formatAmount(order.amount)}원` },
        ]}
        onConfirm={applyPendingAction}
        onClose={() => setPendingAction(null)}
      />
    </>
  );
}
