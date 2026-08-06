'use client';

import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { COPY, ROUTES, formatMoney, type ProductItem } from '@winpilot/client-content';
import { useToast } from '@winpilot/ui';
import { ConfirmDialog } from '@/app/_components/ConfirmDialog';
import { addToCart as putInCart } from '@/app/_components/cart-store';

/**
 * 상품 구매 조작 — **옵션 선택 · 수량 · 장바구니 · 바로 구매**.
 *
 * 옵션이 있는 상품은 **고르기 전에는 담을 수 없다.** 고르지 않아도 담기면 어느 색·어느 사이즈를
 * 담았는지 아무도 모르는 줄이 장바구니에 생긴다.
 *
 * 재고 0 인 옵션은 눌리지 않는다. 눌러 놓고 마지막에 막으면, 그 전까지의 선택이 전부 헛수고가 된다.
 *
 * ## 어드민 연동
 * - 옵션(색상·사이즈·재고) ← `b2c-admin` 상품 등록의 **옵션** 섹션 (store `PRODUCT_OPTIONS`)
 * - 판매 상태(판매중·판매중지 등) ← 상품 목록의 **판매 상태** 열
 * - 적립금·배송 문구 ← 상품 등록의 적립·배송 정책 (store 가 계산해 넘긴 값)
 * - 담아서 주문하면 어드민의 **'판매'** 목록에 주문으로 나타난다 (엔티티 `order`)
 */
export function ProductPurchase({ product }: { product: ProductItem }) {
  const toast = useToast();
  const router = useRouter();
  const colors = [...new Set(product.options.map((option) => option.color))];
  const hasSize = product.options.some((option) => option.size);

  const [colorName, setColorName] = useState('');
  const [optionId, setOptionId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);

  const selected = hasSize
    ? product.options.find((option) => option.id === optionId)
    : product.options.find((option) => option.color === colorName);
  const soldOut = product.stock === 0;
  const onSale = product.saleState === '판매중';
  const needsOption = product.options.length > 0;
  const optionLabel = selected ? [selected.color, selected.size].filter(Boolean).join(' / ') : '';

  /** 담기·구매 앞에서 같은 것을 검사한다 — 한쪽만 막으면 다른 길로 같은 문제가 들어온다. */
  const blocked = (): string => {
    if (soldOut) return '품절된 상품입니다.';
    if (!onSale) return `지금은 살 수 없습니다 — ${product.saleState}`;
    if (needsOption && !colorName) return `${COPY.product.optionColor}을 먼저 골라 주세요.`;
    if (needsOption && !selected) return `${COPY.product.optionSize}를 골라 주세요.`;
    if (selected && quantity > selected.stock) return `남은 수량은 ${selected.stock}개입니다.`;
    return '';
  };

  const changeQuantity = (delta: number) => {
    const next = quantity + delta;
    if (next < 1) return;

    const limit = selected ? selected.stock : product.stock;
    if (next > limit) {
      toast.error({ message: '재고보다 많이 담을 수 없습니다', detail: `남은 수량 ${limit}개` });
      return;
    }
    setQuantity(next);
  };

  const addToCart = () => {
    const reason = blocked();
    if (reason) {
      toast.error({ message: '장바구니에 담지 못했습니다', detail: reason });
      return;
    }

    // 실제로 담는다 — 장바구니 화면과 헤더 개수가 이 값을 읽는다.
    const { added, quantity: total } = putInCart({
      productId: product.id,
      productName: product.name,
      optionLabel,
      quantity,
      price: product.price,
      stock: selected ? selected.stock : product.stock,
    });

    if (added <= 0) {
      toast.error({ message: '더 담을 수 없습니다', detail: `이미 ${total}개가 담겨 있습니다 (남은 수량 만큼)` });
      return;
    }

    toast.success({
      message: '장바구니에 담았습니다',
      detail: `${product.name}${optionLabel ? ` · ${optionLabel}` : ''} · ${added}개 (장바구니 ${total}개)`,
    });
  };

  const buyNow = () => {
    const reason = blocked();
    if (reason) {
      toast.error({ message: '주문할 수 없습니다', detail: reason });
      return;
    }
    setBuying(true);
  };

  /*
    확인 창에서 '구매하기' 를 누르면 **결제 화면으로 옮긴다.**
    여기서 바로 주문을 만들면 배송지·결제수단·쿠폰을 고를 자리가 없어, 확인 창 하나로
    결제가 끝나 버린다 — 되돌릴 수 없는 일을 확인 창 안에서 마치면 안 된다.
  */
  const confirmBuy = () => {
    setBuying(false);
    router.push(ROUTES.checkout({ productId: product.id, optionId: selected?.id, quantity }));
  };

  return (
    <>
      {product.options.length > 0 && (
        <div className="flex flex-col gap-4">
          {/*
            **색을 고른 다음 사이즈를 고른다.** 색×사이즈를 한 번에 늘어놓으면 색이 네 가지만
            되어도 스무 개가 넘는 칸이 생겨 무엇을 고르는 중인지 잃어버린다.

            품절은 두 겹으로 알린다: 누를 수 없게 하고(`disabled`) 취소선을 긋는다. 색만 흐리게
            두면 색각 이상 사용자가 놓치고, 눌리기만 하면 마지막 단계에서야 막힌다.
          */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              {COPY.product.optionColor}
              <span className="ml-1 text-signal-danger">*</span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {colors.map((color) => {
                // 그 색의 사이즈가 전부 0 이면 색 자체를 고를 수 없다.
                const empty = product.options
                  .filter((option) => option.color === color)
                  .every((option) => option.stock === 0);
                const active = color === colorName;

                return (
                  <button
                    key={color}
                    type="button"
                    disabled={empty}
                    aria-pressed={active}
                    onClick={() => {
                      setColorName(color);
                      // 색을 바꾸면 사이즈와 수량을 되돌린다 — 앞 색의 선택이 남으면 없는 조합이 만들어진다.
                      setOptionId('');
                      setQuantity(1);
                    }}
                    className={`flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg border px-4 text-sm transition-colors duration-150 ${
                      empty
                        ? 'border-border text-ink-faint line-through'
                        : active
                          ? 'border-ink bg-ink font-medium text-white'
                          : 'border-border-strong text-ink hover:border-ink-faint'
                    }`}
                  >
                    {color}
                    {empty && <span className="ml-1.5 text-xs">{COPY.product.soldOut}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {hasSize && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">
                {COPY.product.optionSize}
                <span className="ml-1 text-signal-danger">*</span>
              </span>

              {colorName ? (
                <div className="flex flex-wrap items-center gap-2">
                  {product.options
                    .filter((option) => option.color === colorName)
                    .map((option) => {
                      const empty = option.stock === 0;
                      const active = option.id === optionId;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          disabled={empty}
                          aria-pressed={active}
                          onClick={() => {
                            setOptionId(option.id);
                            setQuantity(1);
                          }}
                          className={`flex h-10 min-w-14 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border px-3 text-sm transition-colors duration-150 ${
                            empty
                              ? 'border-border text-ink-faint line-through'
                              : active
                                ? 'border-ink bg-ink font-medium text-white'
                                : 'border-border-strong text-ink hover:border-ink-faint'
                          }`}
                        >
                          {option.size}
                        </button>
                      );
                    })}
                </div>
              ) : (
                // 색을 고르기 전에는 사이즈 칸을 비워 둔다 — 어느 색의 사이즈인지 알 수 없기 때문이다.
                <p className="rounded-lg bg-surface px-4 py-3 text-xs text-ink-muted">{COPY.product.pickColorFirst}</p>
              )}
            </div>
          )}

          {selected && (
            <p className="text-xs text-ink-muted">
              {COPY.product.option} {optionLabel} · 남은 수량{' '}
              <span className="tabular-nums">{selected.stock}</span>개
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <span className="shrink-0 text-sm text-ink-muted">{COPY.cart.quantity}</span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => changeQuantity(-1)}
            aria-label="수량 줄이기"
            className="grid size-9 place-items-center rounded-lg border border-border-strong text-ink-muted"
          >
            <MinusIcon />
          </button>
          <span className="w-10 text-center text-sm tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => changeQuantity(1)}
            aria-label="수량 늘리기"
            className="grid size-9 place-items-center rounded-lg border border-border-strong text-ink-muted"
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-4 border-t border-border pt-4">
        <span className="shrink-0 text-sm text-ink-muted">{COPY.cart.total}</span>
        <span className="text-xl font-bold tabular-nums">
          {formatMoney(product.price * quantity)}
          {COPY.product.priceUnit}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={addToCart}
          disabled={soldOut || !onSale}
          className="h-12 flex-1 shrink-0 whitespace-nowrap rounded-lg border border-border-strong text-sm font-medium text-ink disabled:border-border disabled:text-ink-faint"
        >
          {COPY.product.addToCart}
        </button>
        <button
          type="button"
          onClick={buyNow}
          disabled={soldOut || !onSale}
          className="h-12 flex-1 shrink-0 whitespace-nowrap rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600 disabled:bg-surface disabled:text-ink-faint"
        >
          {soldOut ? COPY.product.soldOut : onSale ? COPY.product.buy : product.saleState}
        </button>
      </div>

      <ConfirmDialog
        open={buying}
        title="바로 주문할까요?"
        description="주문 내역에서 진행 상황을 볼 수 있습니다."
        confirmLabel={COPY.product.buy}
        tone="brand"
        onConfirm={confirmBuy}
        onClose={() => setBuying(false)}
        summary={[
          { label: '상품', value: product.name },
          ...(optionLabel ? [{ label: COPY.product.option, value: optionLabel }] : []),
          { label: COPY.cart.quantity, value: `${quantity}개` },
          {
            label: COPY.cart.total,
            value: `${formatMoney(product.price * quantity)}${COPY.product.priceUnit}`,
          },
        ]}
      />
    </>
  );
}

/* 수량 부호는 글자가 아니라 선으로 그린다 — 글꼴에 따라 굵기와 위치가 흔들린다. */
function MinusIcon() {
  return (
    <Minus aria-hidden className="size-3.5" strokeWidth={1.6} />
  );
}

function PlusIcon() {
  return (
    <Plus aria-hidden className="size-3.5" strokeWidth={1.6} />
  );
}
