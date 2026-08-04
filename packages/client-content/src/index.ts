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
  findProduct,
  formatMoney,
  productsInCategory,
  productsWithTag,
  visibleProducts,
  type NavChild,
  type NavItem,
} from './content';
