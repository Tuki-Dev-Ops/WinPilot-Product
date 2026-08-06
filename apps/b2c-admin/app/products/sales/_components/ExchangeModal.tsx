'use client';

import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { exchangeableOptions, findOption, optionLabel } from '@/lib/data/product-options';
import type { OrderRecord } from '@/lib/data/orders';
import { Button, Modal } from '@winpilot/ui';

export type ExchangeModalProps = {
  open: boolean;
  order: OrderRecord | null;
  onClose: () => void;
  onSubmit: (nextOptionId: string) => void;
};

function ArrowIcon() {
  return (
    <ArrowRight aria-hidden className="size-4" strokeWidth={1.5} />
  );
}

/**
 * 교환 — **같은 상품 · 같은 색상에서 사이즈만** 바꾼다.
 *
 * 상품이나 색상까지 바꿀 수 있게 하면 금액과 재고가 달라져 교환이 아니라 새 주문이 된다.
 * 그래서 여기서는 고를 수 있는 것이 사이즈뿐이며, 그 목록은
 * `exchangeableOptions` 가 정한다 (lib/data/product-options.ts).
 *
 * 재고가 없는 사이즈도 화면에는 남긴다 — 왜 못 고르는지 보이지 않으면
 * 담당자가 목록을 몇 번씩 다시 확인하게 된다.
 */
export function ExchangeModal({ open, order, onClose, onSubmit }: ExchangeModalProps) {
  const [selected, setSelected] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected('');
    setTouched(false);
  }, [open, order?.id]);

  const current = order ? findOption(order.optionId) : undefined;
  const candidates = order ? exchangeableOptions(order.optionId) : [];
  const available = candidates.filter((option) => option.selectable);
  const error = touched && !selected ? '교환할 사이즈를 선택해 주세요.' : '';

  const submit = () => {
    setTouched(true);
    if (!selected) return;
    onSubmit(selected);
  };

  return (
    <Modal
      open={open}
      title="교환"
      description="같은 색상의 다른 사이즈로만 교환할 수 있습니다."
      onClose={onClose}
      footer={
        <>
          <Button tone="secondary" onClick={onClose}>
            취소
          </Button>
          <Button onClick={submit} disabled={available.length === 0}>
            교환 접수
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <dl className="flex flex-col gap-2 rounded-lg bg-surface px-4 py-3">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="shrink-0 text-xs text-ink-faint">주문번호</dt>
            <dd className="font-mono text-sm">{order?.id}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="shrink-0 text-xs text-ink-faint">상품</dt>
            <dd className="min-w-0 truncate text-right text-sm">{order?.productName}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="shrink-0 text-xs text-ink-faint">색상</dt>
            <dd className="text-sm">{current?.color ?? '-'}</dd>
          </div>
        </dl>

        {candidates.length === 0 ? (
          <p className="rounded-lg bg-signal-danger/12 px-4 py-3 text-sm leading-relaxed text-signal-danger">
            이 상품은 사이즈 옵션이 없어 교환할 수 없습니다. 결제 취소 후 다시 주문해야 합니다.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">사이즈</span>

              <div className="flex items-center gap-3">
                <span className="flex h-11 min-w-16 shrink-0 items-center justify-center rounded-lg bg-surface px-3 text-sm font-medium">
                  {current?.size || '-'}
                </span>
                <span className="shrink-0 text-ink-faint">
                  <ArrowIcon />
                </span>

                <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                  {candidates.map((option) => {
                    const active = option.id === selected;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={!option.selectable}
                        onClick={() => setSelected(option.id)}
                        className={`flex h-11 shrink-0 flex-col items-center justify-center whitespace-nowrap rounded-lg border px-4 text-sm transition-colors duration-150 ${
                          active
                            ? 'border-brand-500 bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                            : 'border-border-strong text-ink hover:border-ink-faint'
                        } disabled:cursor-not-allowed disabled:border-border disabled:text-ink-faint disabled:hover:border-border`}
                      >
                        {option.size}
                        <span className="text-3xs tabular-nums text-ink-faint">
                          {option.selectable ? `재고 ${option.stock}` : '품절'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && <p className="text-sm text-signal-danger">{error}</p>}
              {available.length === 0 && (
                <p className="text-sm text-signal-danger">
                  교환할 수 있는 사이즈가 모두 품절입니다.
                </p>
              )}
            </div>

            {selected && (
              <p className="rounded-lg bg-surface px-4 py-3 text-sm leading-relaxed">
                <span className="text-ink-muted">{optionLabel(current)}</span>
                <span className="mx-2 text-ink-faint">→</span>
                <span className="font-medium">{optionLabel(findOption(selected))}</span>
                <span className="mt-1 block text-xs text-ink-muted">
                  접수하면 배송 상태가 &lsquo;교환요청&rsquo; 으로 바뀝니다.
                </span>
              </p>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
