import type { Metadata } from 'next';
import { ACCOUNT, CONTENT, COPY, ROUTES, SLOT, cartTotal, cid, formatMoney } from '@winpilot/client-content';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';

/**
 * Feature: `cart.list` · B2C Client (템플릿 A) · route `/cart`
 *
 * 담아 둔 사이에 품절된 줄은 **숨기지 않고 표시**한다. 합계에서만 빼면 결제 단계에서
 * 갑자기 막히고, 왜 막혔는지 알 수 없다.
 */
export const metadata: Metadata = { title: `${COPY.cart.title} — ${CONTENT.seo.title}` };

export default function CartListPage() {
  const lines = ACCOUNT.cart;
  const total = cartTotal(lines);
  const orderable = lines.filter((line) => line.stock > 0).length;

  return (
    <SiteShell>
      <PageTitle title={COPY.cart.title} />

      {lines.length === 0 ? (
        <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">{COPY.cart.empty}</p>
      ) : (
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
                  <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-surface text-[10px] text-ink-faint">
                    {line.productName}
                  </span>

                  <div className="min-w-0 flex-1">
                    <a href={ROUTES.productDetail(line.productId)} className="truncate text-sm font-medium">
                      {line.productName}
                    </a>
                    <p className="truncate text-xs text-ink-muted">{line.optionLabel}</p>
                    {soldOut && <p className="mt-1 text-xs text-signal-danger">{COPY.cart.soldOutLine}</p>}
                  </div>

                  <span className="shrink-0 whitespace-nowrap text-xs text-ink-muted">
                    {COPY.cart.quantity} {line.quantity}
                  </span>
                  <span className={`shrink-0 whitespace-nowrap text-sm tabular-nums ${soldOut ? 'text-ink-faint line-through' : ''}`}>
                    {formatMoney(line.price * line.quantity)}
                    {COPY.product.priceUnit}
                  </span>
                  <button
                    type="button"
                    className="shrink-0 whitespace-nowrap rounded-lg border border-border-strong px-3 py-1.5 text-xs text-ink-muted"
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
              disabled={orderable === 0}
              className="h-12 w-full shrink-0 whitespace-nowrap rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600 disabled:bg-surface disabled:text-ink-faint"
            >
              {COPY.cart.checkout}
            </button>
          </aside>
        </div>
      )}
    </SiteShell>
  );
}
