import type { Metadata } from 'next';
import { ACCOUNT, CONTENT, COPY } from '@winpilot/client-content';
import { SiteShell } from '@/app/_components/SiteShell';
import { MyPageHeading, MyPageShell } from '@/app/_components/MyPageShell';
import { OrderListView } from './_components/OrderListView';

/**
 * Feature: `order.list` · B2C Client (템플릿 A) · route `/orders`
 *
 * 마이페이지 안쪽 화면이다 — 왼쪽 aside 를 그대로 두고 오른쪽만 주문 목록으로 바꾼다.
 * 경로를 `/mypage/orders` 로 옮기지 않는 이유는 주문이 마이페이지에 딸린 것이 아니라
 * **독립된 자원**이기 때문이다(어드민의 '판매' 와 같은 것).
 *
 * ## 어드민 연동
 * - 어드민 메뉴의 **'판매'** 목록(`/products/sales`)과 같은 자원 — 주문번호가 양쪽에서 같다
 * - 어드민은 모든 주문을, 여기서는 내 주문만 본다
 */
export const metadata: Metadata = { title: `${COPY.order.title} — ${CONTENT.seo.title}` };

export default function OrderListPage() {
  return (
    <SiteShell>
      <MyPageShell>
        <MyPageHeading title={COPY.order.title} meta={`총 ${ACCOUNT.orders.length}건`} />
        <OrderListView orders={ACCOUNT.orders} />
      </MyPageShell>
    </SiteShell>
  );
}
