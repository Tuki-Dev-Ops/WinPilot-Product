/**
 * 이 파일은 값을 갖지 않는다 — 저장된 값은 `@winpilot/store` 한 곳에만 있다.
 *
 * 고객 화면의 쿠폰함(`/mypage/coupons`)과 결제 화면이 같은 목록을 본다. 어드민이 시드를
 * 따로 들면 운영자가 만든 쿠폰이 고객 화면에 나타나지 않는다.
 */
export {
  COUPONS,
  couponAmountText,
  couponState,
  couponsOf,
  claimableCoupons,
  type CouponRecord,
  type CouponState,
} from '@winpilot/store';

/** 상태 뱃지 색 — 어드민에서만 쓴다. 고객 화면은 다른 색 체계를 쓴다. */
export const COUPON_STATE_TONE: Record<string, string> = {
  '사용 가능': 'bg-signal-ok/12 text-signal-ok',
  '사용 완료': 'bg-surface text-ink-muted',
  '기간 만료': 'bg-signal-danger/12 text-signal-danger',
};
