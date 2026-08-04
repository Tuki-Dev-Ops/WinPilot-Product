import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { CouponListView } from './_components/CouponListView';

/**
 * Feature: `coupon.list` · B2C Admin · route `/products/coupons`
 *
 * 고객 화면의 쿠폰함(`/mypage/coupons`)과 **같은 목록**이다 — 값은 store `COUPONS` 하나뿐이다.
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '상품 | 쿠폰 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminCouponListPage() {
  return (
    <AdminShell sectionId="product" trail={['상품', '쿠폰']} activeChildId="product-coupon">
      <CouponListView />
    </AdminShell>
  );
}
