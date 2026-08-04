'use client';

import { useEffect, useMemo, useState } from 'react';
import { COPY, ROUTES, SLOT, cartTotal, cid, findProduct, formatMoney, type CartLine } from '@winpilot/client-content';
import { useToast } from '@winpilot/ui';
import { ConfirmDialog } from '@/app/_components/ConfirmDialog';
import { ProductArt } from '@/app/_components/ProductArt';
import { readCart, writeCart } from '@/app/_components/cart-store';

/**
 * 장바구니 — **수량·삭제·주문이 실제로 동작한다.**
 *
 * 프론트엔드 전용이라 화면 안에서만 바뀐다. 그래도 눌렀을 때 화면이 반응해야 무엇을 만들지가
 * 전달되고, 확인 창과 안내 문구가 어느 자리에 필요한지도 드러난다.
 *
 * 담아 둔 사이에 품절된 줄은 **숨기지 않고 표시**한다. 합계에서만 빼면 결제 단계에서
 * 갑자기 막히고, 왜 막혔는지 알 수 없다.
 *
 * ## 어드민 연동
 * - 상품명·가격·재고 ← `b2c-admin` 상품 > 상품 목록 (store `PRODUCTS` · `PRODUCT_OPTIONS`)
 * - 여기서 만들어지는 주문은 어드민 메뉴에서 **'판매'** 로 불린다(`/products/sales`) —
 *   워딩만 다르고 자원은 하나다(엔티티 `order`).
 */
type Removing = { productId: string; optionLabel: string; productName: string } | null;

/** 줄에 그릴 그림 — 상품 쪽 값과 같은 것을 쓴다. 장바구니가 따로 정하면 카드와 그림이 갈린다. */
function art(productId: string) {
  return findProduct(productId)?.art;
}

export function CartView({ initialLines }: { initialLines: CartLine[] }) {
  const toast = useToast();
  /*
    서버에서 그릴 때는 시드로 시작하고, 브라우저에 올라온 뒤 실제로 담긴 것으로 맞춘다.
    처음부터 저장분을 읽으면 서버가 그린 것과 달라 하이드레이션이 어긋난다.
  */
  const [lines, setLines] = useState(initialLines);

  useEffect(() => setLines(readCart()), []);

  /** 화면에서 바뀐 것을 저장까지 밀어 둔다 — 저장하지 않으면 다른 화면에서 되돌아간다. */
  const commit = (next: CartLine[]) => {
    setLines(next);
    writeCart(next);
  };
  const [removing, setRemoving] = useState<Removing>(null);
  const [ordering, setOrdering] = useState(false);

  const total = useMemo(() => cartTotal(lines), [lines]);
  const orderable = lines.filter((line) => line.stock > 0).length;

  const changeQuantity = (line: CartLine, delta: number) => {
    const next = line.quantity + delta;

    if (next < 1) {
      toast.error({ message: '수량을 더 줄일 수 없습니다', detail: '빼려면 삭제를 눌러 주세요.' });
      return;
    }
    if (next > line.stock) {
      toast.error({
        message: '재고보다 많이 담을 수 없습니다',
        detail: `${line.productName} · 남은 수량 ${line.stock}개`,
      });
      return;
    }

    commit(
      lines.map((item) =>
        item.productId === line.productId && item.optionLabel === line.optionLabel
          ? { ...item, quantity: next }
          : item,
      ),
    );
    toast.info({ message: '수량을 바꿨습니다', detail: `${line.productName} · ${next}개` });
  };

  const remove = () => {
    if (!removing) return;
    commit(
      lines.filter(
        (item) => !(item.productId === removing.productId && item.optionLabel === removing.optionLabel),
      ),
    );
    toast.success({ message: '장바구니에서 뺐습니다', detail: `${removing.productName} · ${removing.optionLabel}` });
    setRemoving(null);
  };

  const checkout = () => {
    setOrdering(false);
    // 주문한 줄은 장바구니에서 빠진다 — 남겨 두면 같은 것을 두 번 주문하게 된다.
    commit(lines.filter((line) => line.stock === 0));
    toast.success({
      message: '주문이 접수되었습니다',
      detail: `${orderable}건 · ${formatMoney(total)}${COPY.product.priceUnit}`,
    });
  };

  if (lines.length === 0) {
    return <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">{COPY.cart.empty}</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <section
          id={SLOT.cartList}
          data-ssot-cid={cid('cart.list', 'SiteCartList')}
          className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border"
        >
          {lines.map((line) => {
            const soldOut = line.stock === 0;
            return (
              <div
                key={`${line.productId}-${line.optionLabel}`}
                className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-b-0"
              >
                <span className="size-16 shrink-0 overflow-hidden rounded-lg bg-surface">
                  {art(line.productId) && (
                    <ProductArt
                      kind={art(line.productId)!.kind}
                      from={art(line.productId)!.from}
                      to={art(line.productId)!.to}
                      ink={art(line.productId)!.ink}
                      className="size-full"
                    />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <a href={ROUTES.productDetail(line.productId)} className="truncate text-sm font-medium">
                    {line.productName}
                  </a>
                  <p className="truncate text-xs text-ink-muted">{line.optionLabel}</p>
                  {soldOut && <p className="mt-1 text-xs text-signal-danger">{COPY.cart.soldOutLine}</p>}
                </div>

                {/* 수량은 빼기·더하기로만 바꾼다 — 직접 입력하면 재고를 넘는 값이 들어와 매번 되돌려야 한다. */}
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => changeQuantity(line, -1)}
                    disabled={soldOut}
                    aria-label={`${line.productName} 수량 줄이기`}
                    className="grid size-8 place-items-center rounded-lg border border-border-strong text-sm text-ink-muted disabled:opacity-40"
                  >
                    <MinusIcon />
                  </button>
                  <span className="w-8 text-center text-sm tabular-nums">{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => changeQuantity(line, 1)}
                    disabled={soldOut}
                    aria-label={`${line.productName} 수량 늘리기`}
                    className="grid size-8 place-items-center rounded-lg border border-border-strong text-sm text-ink-muted disabled:opacity-40"
                  >
                    <PlusIcon />
                  </button>
                </div>

                <span
                  className={`w-24 shrink-0 whitespace-nowrap text-right text-sm tabular-nums ${soldOut ? 'text-ink-faint line-through' : ''}`}
                >
                  {formatMoney(line.price * line.quantity)}
                  {COPY.product.priceUnit}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setRemoving({
                      productId: line.productId,
                      optionLabel: line.optionLabel,
                      productName: line.productName,
                    })
                  }
                  className="shrink-0 whitespace-nowrap rounded-lg border border-border-strong px-3 py-1.5 text-xs text-ink-muted hover:text-ink"
                >
                  {COPY.cart.remove}
                </button>
              </div>
            );
          })}
        </section>

        <aside className="flex w-full shrink-0 flex-col gap-4 rounded-xl border border-border px-6 py-5 lg:w-80">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-ink-muted">{COPY.cart.total}</span>
            <span className="text-lg font-bold tabular-nums">
              {formatMoney(total)}
              {COPY.product.priceUnit}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOrdering(true)}
            disabled={orderable === 0}
            className="h-12 w-full shrink-0 whitespace-nowrap rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600 disabled:bg-surface disabled:text-ink-faint"
          >
            {COPY.cart.checkout}
          </button>
        </aside>
      </div>

      <ConfirmDialog
        open={Boolean(removing)}
        title="장바구니에서 뺄까요?"
        description="뺀 상품은 되돌릴 수 없습니다. 다시 담으려면 상품 화면에서 담아 주세요."
        confirmLabel={COPY.cart.remove}
        tone="danger"
        onConfirm={remove}
        onClose={() => setRemoving(null)}
        summary={
          removing
            ? [
                { label: '상품', value: removing.productName },
                { label: COPY.product.option, value: removing.optionLabel },
              ]
            : undefined
        }
      />

      <ConfirmDialog
        open={ordering}
        title="주문할까요?"
        description="품절된 줄은 제외하고 주문합니다."
        confirmLabel={COPY.cart.checkout}
        tone="brand"
        onConfirm={checkout}
        onClose={() => setOrdering(false)}
        summary={[
          { label: '주문 수량', value: `${orderable}건` },
          { label: COPY.cart.total, value: `${formatMoney(total)}${COPY.product.priceUnit}` },
        ]}
      />
    </>
  );
}

/* 수량 단추의 부호는 글자가 아니라 선으로 그린다 — 글꼴에 따라 −/+ 의 굵기와 위치가 흔들린다. */
function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 7h8" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 7h8M7 3v8" strokeLinecap="round" />
    </svg>
  );
}
