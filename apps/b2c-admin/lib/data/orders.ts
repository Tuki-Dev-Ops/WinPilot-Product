/**
 * 저장된 값은 @winpilot/store 한 곳에만 있다.
 *
 * **주문은 원래 이 파일이 시드를 들고 있었다.** 고객 화면(`packages/client-content`)도 자기
 * 배열을 따로 들고 있어서, 여기서 송장을 넣어도 고객 화면에는 영영 나타나지 않았다.
 * 경위는 `packages/store/src/orders.ts` 머리말과 `docs/spec/09-view-linkage.md` §3 에 있다.
 */
import type { BadgeTone } from '@winpilot/ui';
import type { PayState, ShipState } from '@winpilot/store';

export {
  COURIERS,
  ORDERS,
  findOrder,
  ordersOf,
  type OrderRecord,
  type OrderSummary,
  type PayState,
  type ShipState,
} from '@winpilot/store';

export const PAY_TONE: Record<PayState, BadgeTone> = {
  결제완료: 'ok',
  결제취소: 'danger',
  환불완료: 'neutral',
};

export const SHIP_TONE: Record<ShipState, BadgeTone> = {
  배송준비: 'neutral',
  배송중: 'brand',
  배송완료: 'ok',
  교환요청: 'danger',
  교환완료: 'neutral',
};
