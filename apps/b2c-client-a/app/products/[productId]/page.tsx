import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  CONTENT,
  COPY,
  ROUTES,
  SLOT,
  averageRating,
  categoryPath,
  cid,
  discountRate,
  findProduct,
  formatMoney,
  reviewsOf,
} from '@winpilot/client-content';
import { SiteShell } from '@/app/_components/SiteShell';
import { BackLink } from '@winpilot/ui';
import { ProductArt } from '@/app/_components/ProductArt';
import { ProductDetailTabs } from '@/app/products/_components/ProductDetailTabs';
import { ProductPurchase } from '@/app/products/_components/ProductPurchase';

/**
 * Feature: `product.detail` · B2C Client (템플릿 A) · route `/products/{productId}`
 *
 * **템플릿 A 배치**: 왼쪽 이미지 · 오른쪽 구매 정보 2단, 아래에 상세 설명 전폭.
 * 값은 전부 계약에서 온다 — 적립금·배송 문구는 어드민이 계산해 넘긴 것을 그대로 쓴다.
 *
 * ## 어드민 연동
 * - 상품명·가격·정가·상세 설명 ← `b2c-admin` 상품 > 상품 등록 (store `PRODUCTS`)
 * - NEW · BEST 뱃지 ← 등록일과 판매량으로 자동 분류되는 태그 (store `productTags`)
 * - 옵션·수량·구매 단추는 `ProductPurchase` 가 다룬다 (옵션은 상품 등록의 **옵션** 섹션)
 * - 카테고리 경로 ← 상품 > 카테고리 (`/products/categories`)
 * - 상세 설명 · 리뷰는 `ProductDetailTabs` 가 다룬다
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

  return (
    <SiteShell>
      {/*
        되돌아가는 길을 **맨 위로** 올렸다. 아래에도 목록 링크가 있었는데, 상세는 사진·옵션·
        리뷰로 길어 그 링크가 첫 화면에 보이지 않는다 — 돌아가려면 끝까지 스크롤해야 했다.
      */}
      <BackLink href={ROUTES.products} label={COPY.product.listTitle} />

      <section
        id={SLOT.productDetail}
        data-ssot-cid={cid('product.detail', 'SiteProductDetail')}
        className="grid grid-cols-1 gap-8 lg:grid-cols-2"
      >
        {/* 사진이 없으면 목록 카드와 **같은 그림**을 크게 그린다 — 다른 그림이면 같은 상품으로 안 읽힌다. */}
        <div className="aspect-square overflow-hidden rounded-xl bg-surface">
          {product.imageUrl ? (
            // 어드민이 올린 사진은 objectURL 일 수 있어 next/image 최적화 대상이 아니다.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <ProductArt
              kind={product.art.kind}
              from={product.art.from}
              to={product.art.to}
              ink={product.art.ink}
              className="size-full"
            />
          )}
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

          <ProductPurchase product={product} />
        </div>
      </section>

      <ProductDetailTabs
        description={product.description}
        reviews={reviewsOf(product.id)}
        average={averageRating(product.id)}
      />

    </SiteShell>
  );
}
