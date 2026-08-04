import type { Metadata } from 'next';
import { CONTENT, COPY, myCoupons, openCoupons } from '@winpilot/client-content';
import { SiteShell } from '@/app/_components/SiteShell';
import { MyPageHeading, MyPageShell } from '@/app/_components/MyPageShell';
import { CouponListView } from './_components/CouponListView';

/**
 * Feature: `coupon.list` · B2C Client (템플릿 A) · route `/mypage/coupons`
 *
 * 내 쿠폰과 받을 수 있는 쿠폰을 탭으로 나눈다 — 까닭은 `CouponListView` 주석에 있다.
 *
 * ## 어드민 연동
 * - 쿠폰 이름 · 할인 · 조건 · 기간 ← store `COUPONS` (어드민 쿠폰 화면이 생기면 그 화면이 원본이 된다)
 * - 사용 여부 ← 주문에서 쿠폰을 쓸 때 기록된다 (어드민 메뉴의 **'판매'** 상세)
 */
export const metadata: Metadata = { title: `${COPY.mypage.coupons} — ${CONTENT.seo.title}` };

export default function CouponListPage() {
  return (
    <SiteShell>
      <MyPageShell>
        <MyPageHeading title={COPY.mypage.coupons} />
        <CouponListView mine={myCoupons()} open={openCoupons()} />
      </MyPageShell>
    </SiteShell>
  );
}
