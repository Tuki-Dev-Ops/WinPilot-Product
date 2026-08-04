import type { Metadata } from 'next';
import { ACCOUNT, CONTENT, COPY } from '@winpilot/client-content';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';
import { CartView } from './_components/CartView';

/**
 * Feature: `cart.list` · B2C Client (템플릿 A) · route `/cart`
 *
 * 목록·수량·삭제는 눌러서 바뀌므로 클라이언트 컴포넌트에 둔다. 이 파일은 값을 넘겨주기만 한다.
 *
 * ## 어드민 연동
 * - 담긴 상품의 이름·가격·재고 ← `b2c-admin` 상품 > 상품 목록 (store `PRODUCTS`)
 * - 여기서 만들어진 주문은 어드민의 **'판매'** 목록(`/products/sales`)에 나타난다
 */
export const metadata: Metadata = { title: `${COPY.cart.title} — ${CONTENT.seo.title}` };

export default function CartListPage() {
  return (
    <SiteShell>
      <PageTitle title={COPY.cart.title} />
      <CartView initialLines={ACCOUNT.cart} />
    </SiteShell>
  );
}
