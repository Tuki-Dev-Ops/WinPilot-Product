import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  CONTENT,
  COPY,
  ROUTES,
  SLOT,
  categoryPath,
  cid,
  discountRate,
  findProduct,
  formatMoney,
} from '@winpilot/client-content';
import { PageTitle, RichBody, SiteShell } from '@/app/_components/SiteShell';

/**
 * Feature: `product.detail` · B2C Client (템플릿 A) · route `/products/{productId}`
 *
 * **템플릿 A 배치**: 왼쪽 이미지 · 오른쪽 구매 정보 2단, 아래에 상세 설명 전폭.
 * 값은 전부 계약에서 온다 — 적립금·배송 문구는 어드민이 계산해 넘긴 것을 그대로 쓴다.
 */
export const metadata: Metadata = { title: `${COPY.product.listTitle} — ${CONTENT.seo.title}` };

export function generateStaticParams() {
  return CONTENT.products.map((product) => ({ productId: product.id }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const product = findProduct(productId);
  if (!product) notFound();

  const rate = discountRate(product.price, product.listPrice);
  const soldOut = product.stock === 0;
  const colors = [...new Set(product.options.map((option) => option.color))];
  const hasSize = product.options.some((option) => option.size);

  return (
    <SiteShell>
      <section
        id={SLOT.productDetail}
        data-ssot-cid={cid('product.detail', 'SiteProductDetail')}
        className="grid grid-cols-1 gap-8 lg:grid-cols-2"
      >
        <div className="flex aspect-square items-center justify-center rounded-xl bg-surface">
          <span className="text-sm text-ink-faint">{product.name}</span>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            {product.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${
                      tag === 'NEW'
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                        : 'bg-signal-danger/12 text-signal-danger'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-sm text-ink-faint">{categoryPath(product)}</p>
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          </div>

          <div className="flex flex-col gap-1">
            {rate > 0 && (
              <span className="text-sm text-ink-faint line-through">
                {COPY.product.listPriceLabel} {formatMoney(product.listPrice)}
                {COPY.product.priceUnit}
              </span>
            )}
            <div className="flex items-baseline gap-2">
              {rate > 0 && <span className="text-xl font-bold tabular-nums text-signal-danger">{rate}%</span>}
              <span className="text-2xl font-bold tabular-nums">
                {formatMoney(product.price)}
                {COPY.product.priceUnit}
              </span>
            </div>
          </div>

          <dl className="flex flex-col gap-2 rounded-xl bg-surface px-5 py-4">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="shrink-0 text-xs text-ink-faint">{COPY.product.reward}</dt>
              <dd className="text-sm tabular-nums text-brand-700 dark:text-brand-300">
                {formatMoney(product.reward)}
                {COPY.product.priceUnit}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="shrink-0 text-xs text-ink-faint">{COPY.product.shipping}</dt>
              <dd className="min-w-0 truncate text-right text-sm text-ink-muted">{product.shippingText}</dd>
            </div>
          </dl>

          {/* 옵션 — 색상별로 묶어 보여준다. 재고 0 인 사이즈는 고를 수 없다는 것이 보여야 한다. */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">{COPY.product.option}</span>
            {colors.map((color) => (
              <div key={color} className="flex flex-wrap items-center gap-2">
                <span className="w-16 shrink-0 text-sm text-ink-muted">{color}</span>
                {product.options
                  .filter((option) => option.color === color)
                  .map((option) => (
                    <span
                      key={option.id}
                      className={`flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg border px-3 text-sm ${
                        option.stock > 0
                          ? 'border-border-strong text-ink'
                          : 'border-border text-ink-faint line-through'
                      }`}
                    >
                      {hasSize ? option.size : color}
                    </span>
                  ))}
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={soldOut || product.saleState !== '판매중'}
            className="h-12 w-full shrink-0 whitespace-nowrap rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600 disabled:bg-surface disabled:text-ink-faint"
          >
            {soldOut ? COPY.product.soldOut : product.saleState === '판매중' ? COPY.product.buy : product.saleState}
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold tracking-tight">{COPY.product.detail}</h2>
        {product.description ? (
          <RichBody html={product.description} />
        ) : (
          <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">
            {COPY.product.detailEmpty}
          </p>
        )}
      </section>

      <a href={ROUTES.products} className="w-fit text-sm text-brand-700 dark:text-brand-300">
        {COPY.product.listTitle}
      </a>
    </SiteShell>
  );
}
