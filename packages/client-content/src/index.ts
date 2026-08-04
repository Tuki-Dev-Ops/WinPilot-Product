/**
 * 고객 화면 템플릿(A~F)이 공유하는 콘텐츠 계약.
 *
 * 템플릿은 **배치만** 정하고, 값과 이름은 전부 여기서 가져간다.
 * 자세한 이유는 `types.ts` 와 `ids.ts` 의 주석에 있다.
 */
export * from './types';
export {
  ACCOUNT,
  ORDER_STATE_TONE,
  SHIP_STATE_TONE,
  cartTotal,
  findOrder,
  myCoupons,
  myInquiries,
  openCoupons,
  TODAY,
  unreadAlarms,
  type Account,
  type AlarmItem,
  type CartLine,
  type OrderState,
  type OrderSummary,
  type ShipState,
} from './account';
export { SLOT, COPY, ROUTES, cid, type SlotId } from './ids';
export {
  CONTENT,
  buildNav,
  categoryPath,
  discountRate,
  findNotice,
  findNews,
  findFaq,
  findProduct,
  formatMoney,
  productsInCategory,
  productsWithTag,
  visibleProducts,
  type NavChild,
  type NavItem,
} from './content';

/* 쿠폰·문의 기록의 타입과 판정은 store 가 정의한다 — 고객 화면이 다시 세우지 않는다. */
export {
  couponAmountText,
  couponState,
  productArt,
  type ProductArtKind,
  pathLabel,
  type CouponRecord,
  type CouponState,
  type InquiryRecord,
  type InquiryState,
} from '@winpilot/store';
