import { COPY, ROUTES, discountRate, formatMoney, type ProductItem } from '@winpilot/client-content';
import { ProductArt } from './ProductArt';

/**
 * 상품 타일 — **고객 화면의 유일한 상품 카드**다. 목록·신상품·베스트·카테고리 탐색이 같이 쓴다.
 *
 * 카드가 자리마다 다르면 같은 상품이 화면마다 다른 값을 보여 주게 된다. 그래서 하나로 두고,
 * 자리에 따라 달라지는 것은 순위 뱃지 하나뿐이다.
 *
 * 사진이 없으면 **벡터 그림**을 그린다(`ProductArt`) — 회색 네모에 이름만 적어 두면 목록 전체가
 * 한 덩어리로 보이고, 무엇이 있는지 훑어지지 않는다.
 *
 * 마우스를 올리면 그림만 살짝 커진다. 카드 전체를 움직이면 옆 카드와의 간격이 흔들려 줄이
 * 출렁이는 것처럼 보인다.
 *
 * ## 어드민 연동
 * - 이름 · 판매가 · 정가 · 재고 ← `b2c-admin` 상품 > 상품 목록 (store `PRODUCTS`)
 * - 대표 이미지 ← 상품 등록의 이미지 업로드 (`imageUrl`, 없으면 벡터 그림)
 * - 배송 문구 ← 상품 등록의 배송 정책 (무료 · 조건부 무료 · 유료)
 * - NEW · BEST ← 등록일과 판매량으로 자동 분류되는 태그 (store `productTags`)
 */
export function ProductTile({ product, rank }: { product: ProductItem; rank?: number }) {
  const rate = discountRate(product.price, product.listPrice);
  const soldOut = product.stock === 0;

  return (
    <a href={ROUTES.productDetail(product.id)} className="group flex w-full flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
        {product.imageUrl ? (
          // 어드민이 올린 사진은 objectURL 일 수 있어 next/image 최적화 대상이 아니다.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt=""
            className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <ProductArt
            kind={product.art.kind}
            from={product.art.from}
            to={product.art.to}
            ink={product.art.ink}
            className="size-full transition-transform duration-300 ease-out group-hover:scale-105"
          />
        )}

        {rank !== undefined && (
          <span className="absolute left-2.5 top-2.5 grid size-7 place-items-center rounded bg-ink text-xs font-bold text-white">
            {rank}
          </span>
        )}

        {/* 관심 상품 — 카드를 눌러 상세로 가는 것과 섞이지 않게 이미지 안쪽 끝에 둔다. */}
        <span
          aria-hidden="true"
          className="absolute bottom-2.5 right-2.5 grid size-7 place-items-center rounded-full text-white/90"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path
              d="M10 16.5 C10 16.5 3 12.4 3 7.9 A3.4 3.4 0 0 1 10 6.1 A3.4 3.4 0 0 1 17 7.9 C17 12.4 10 16.5 10 16.5 Z"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        {soldOut && (
          <span className="absolute inset-0 grid place-items-center bg-ink/60 text-sm font-medium text-white">
            {COPY.product.soldOut}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {/* 두 줄까지만 — 이름 길이가 제각각이라 자르지 않으면 카드 높이가 들쭉날쭉해진다. */}
        <p className="line-clamp-2 text-sm leading-snug text-ink transition-colors duration-150 group-hover:text-brand-700 dark:group-hover:text-brand-300">{product.name}</p>

        <p className="flex items-baseline gap-1.5">
          {rate > 0 && <span className="text-base font-bold tabular-nums text-signal-danger">{rate}%</span>}
          <span className="text-base font-bold tabular-nums">{formatMoney(product.price)}</span>
        </p>

        {product.benefitPrice > 0 && (
          <p className="flex items-center gap-1 text-xs font-medium text-signal-danger">
            최대혜택가 {formatMoney(product.benefitPrice)}
            <span aria-hidden="true">›</span>
          </p>
        )}

        <p className="flex items-center gap-1.5 text-xs text-ink-faint">
          <span>{product.shippingText}</span>
          {product.shippingNote && (
            <>
              <span className="text-border-strong">|</span>
              <span>{product.shippingNote}</span>
            </>
          )}
        </p>
      </div>
    </a>
  );
}
