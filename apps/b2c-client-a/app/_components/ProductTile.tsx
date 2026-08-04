import { COPY, ROUTES, discountRate, formatMoney, type ProductItem } from '@winpilot/client-content';

/**
 * 상품 타일 — 신상품·베스트 줄에서 쓰는 카드.
 *
 * `ProductCard` 와 나눈 이유: 저쪽은 목록 격자에서 쓰는 카드라 카테고리·태그를 보여주고,
 * 이 타일은 **한 줄로 흐르는 자리**라 순위·혜택가처럼 비교에 쓰이는 것만 남긴다.
 * 한 컴포넌트에 옵션을 잔뜩 달면 어느 화면에서 무엇이 보이는지 아무도 모르게 된다.
 */
export function ProductTile({ product, rank }: { product: ProductItem; rank?: number }) {
  const rate = discountRate(product.price, product.listPrice);
  const soldOut = product.stock === 0;

  return (
    <a href={ROUTES.productDetail(product.id)} className="flex w-full flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
        <span className="grid size-full place-items-center px-4 text-center text-xs text-ink-faint">
          {product.name}
        </span>

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
        <p className="line-clamp-2 text-sm leading-snug text-ink">{product.name}</p>

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
