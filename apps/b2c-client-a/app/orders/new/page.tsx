import type { Metadata } from 'next';
import { CONTENT, COPY, findProduct, type CartLine } from '@winpilot/client-content';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';
import { CheckoutView } from './_components/CheckoutView';

/**
 * Feature: `order.create` · B2C Client (템플릿 A) · route `/orders/new`
 *
 * 결제 화면이다. 경로를 `/checkout` 으로 두지 않은 이유는 여기서 만드는 것이 **주문**이고,
 * 자원을 새로 만드는 화면의 경로 규칙이 `/{자원}/new` 이기 때문이다(`packages/spec`).
 * 화면에 적히는 말은 '결제' 이되, 주소와 이름은 자원을 따른다.
 *
 * 무엇을 결제할지는 두 갈래로 들어온다.
 *   - 상품 상세에서 바로 구매: `?productId=…&optionId=…&qty=…`
 *   - 장바구니에서 주문: 인자 없이 들어오면 브라우저에 담긴 것을 읽는다
 *
 * ## 어드민 연동
 * - 상품·가격·옵션 재고 ← `b2c-admin` 상품 > 상품 목록·옵션 (store `PRODUCTS`·`PRODUCT_OPTIONS`)
 * - 결제를 마치면 어드민 메뉴의 **'판매'** 목록(`/products/sales`)에 주문으로 나타난다
 *   (엔티티 `order` — 워딩만 다르고 자원은 하나다)
 */
export const metadata: Metadata = { title: `결제 — ${CONTENT.seo.title}` };

type Search = { productId?: string; optionId?: string; qty?: string };

export default async function OrderCreatePage({ searchParams }: { searchParams: Promise<Search> }) {
  const { productId, optionId, qty } = await searchParams;

  // 상품 상세에서 바로 온 경우에만 줄을 미리 만든다. 장바구니 쪽은 브라우저에서 읽는다.
  const product = productId ? findProduct(productId) : undefined;
  const option = product?.options.find((item) => item.id === optionId);
  const quantity = Math.max(Number(qty) || 1, 1);

  const lines: CartLine[] = product
    ? [
        {
          productId: product.id,
          productName: product.name,
          optionLabel: option ? [option.color, option.size].filter(Boolean).join(' / ') : '',
          quantity: Math.min(quantity, option ? option.stock : product.stock),
          price: product.price,
          stock: option ? option.stock : product.stock,
        },
      ]
    : [];

  return (
    <SiteShell>
      <PageTitle title="결제" description={COPY.cart.checkout} />
      <CheckoutView initialLines={lines} />
    </SiteShell>
  );
}
