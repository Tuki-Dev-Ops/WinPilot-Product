/**
 * 주문 시드 — **어드민과 고객 화면이 같은 배열을 본다.**
 *
 * ## 왜 여기로 옮겼나
 * 전에는 주문만 두 벌이었다.
 *
 * ```
 * apps/b2c-admin/lib/data/orders.ts       ORDERS 6건
 * packages/client-content/src/account.ts  ACCOUNT.orders 3건
 * ```
 *
 * 겹치는 3건은 글자까지 같았지만 **손으로 맞춰 둔 복사본**이었고, 어긋나도 막는 장치가
 * 없었다. 어드민의 송장 등록(`TrackingModal`)과 교환 접수(`ExchangeModal`)가
 * `shipState`·`courier`·`trackingNumber` 를 바꾸는데, 고객 화면은 다른 배열을 읽으므로
 * **바뀐 값이 영영 나타나지 않았다.**
 *
 * 다른 자원 열둘은 이미 이 패키지를 함께 보고 있었다(`docs/spec/09-view-linkage.md`).
 * 주문만 그 손질을 못 받은 상태였다.
 *
 * ## 두 화면이 보는 모양이 다르다
 * 어드민은 구매자 정보까지 봐야 하고(`buyerName`·`buyerPhone`·`address`·`payMethod`),
 * 고객은 자기 주문이라 그것을 다시 보여 줄 이유가 없다. 그래서 **원본은 넓게 두고**
 * 고객이 보는 좁은 모양은 `ordersOf()` 가 뽑아 준다 — `couponsOf()` · `inquiriesOf()` 와
 * 같은 방식이다.
 */
import { optionLabelOf } from './product-options';

export type PayState = '결제완료' | '결제취소' | '환불완료';
export type ShipState = '배송준비' | '배송중' | '배송완료' | '교환요청' | '교환완료';

export type OrderRecord = {
  /** 주문번호 */
  id: string;
  orderedAt: string;
  productId: string;
  productName: string;
  /** 옵션 코드 — lib/data/product-options.ts */
  optionId: string;
  /** 교환으로 사이즈를 바꾼 경우 원래 옵션 */
  exchangedFromOptionId?: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  address: string;
  quantity: number;
  amount: number;
  payMethod: string;
  payState: PayState;
  shipState: ShipState;
  courier: string;
  trackingNumber: string;
  memo: string;
};

export const COURIERS = ['CJ대한통운', '한진택배', '롯데택배', '우체국택배', '로젠택배'];

export const ORDERS: OrderRecord[] = [
  {
    id: 'S-24081',
    orderedAt: '2026-08-03 09:12',
    productId: 'P-1042',
    productName: '리넨 오버셔츠',
    optionId: 'O-1042-BE-M',
    buyerName: '김서연',
    buyerPhone: '01043215678',
    buyerEmail: 'seoyeon.kim@example.com',
    address: '서울특별시 성동구 왕십리로 000, 000동 000호',
    quantity: 1,
    amount: 49000,
    payMethod: '신용카드',
    payState: '결제완료',
    shipState: '배송준비',
    courier: '',
    trackingNumber: '',
    memo: '부재 시 경비실에 맡겨 주세요.',
  },
  {
    id: 'S-24080',
    orderedAt: '2026-08-02 21:44',
    productId: 'P-1040',
    productName: '워시드 코튼 침구 세트',
    optionId: 'O-1040-CH-Q',
    buyerName: '박지훈',
    buyerPhone: '01088776655',
    buyerEmail: 'jihoon.park@example.com',
    address: '경기도 성남시 분당구 판교로 000, 000호',
    quantity: 1,
    amount: 128000,
    payMethod: '간편결제',
    payState: '결제완료',
    shipState: '배송중',
    courier: 'CJ대한통운',
    trackingNumber: '512034877901',
    memo: '',
  },
  {
    id: 'S-24079',
    orderedAt: '2026-08-01 13:05',
    productId: 'P-1039',
    productName: '접이식 캠핑 체어',
    optionId: 'O-1039-OL',
    buyerName: '이하늘',
    buyerPhone: '01033334444',
    buyerEmail: 'haneul.lee@example.com',
    address: '부산광역시 해운대구 센텀중앙로 000',
    quantity: 2,
    amount: 108000,
    payMethod: '계좌이체',
    payState: '결제완료',
    shipState: '배송완료',
    courier: '한진택배',
    trackingNumber: '338120045512',
    memo: '',
  },
  {
    id: 'S-24078',
    orderedAt: '2026-07-31 18:30',
    productId: 'P-1041',
    productName: '휴대용 커피 그라인더',
    optionId: 'O-1041-SV',
    buyerName: '정민우',
    buyerPhone: '01055667788',
    buyerEmail: 'minwoo.jung@example.com',
    address: '대전광역시 유성구 대학로 000',
    quantity: 1,
    amount: 78000,
    payMethod: '신용카드',
    payState: '결제완료',
    shipState: '교환요청',
    courier: '롯데택배',
    trackingNumber: '790011234455',
    memo: '색상이 사진과 다릅니다.',
  },
  {
    id: 'S-24077',
    orderedAt: '2026-07-30 10:02',
    productId: 'P-1042',
    productName: '리넨 오버셔츠',
    optionId: 'O-1042-NV-L',
    buyerName: '최유진',
    buyerPhone: '01012349876',
    buyerEmail: 'yujin.choi@example.com',
    address: '인천광역시 연수구 송도과학로 000',
    quantity: 1,
    amount: 49000,
    payMethod: '간편결제',
    payState: '결제취소',
    shipState: '배송준비',
    courier: '',
    trackingNumber: '',
    memo: '고객 요청 취소',
  },
  {
    id: 'S-24076',
    orderedAt: '2026-07-29 15:48',
    productId: 'P-1040',
    productName: '워시드 코튼 침구 세트',
    optionId: 'O-1040-IV-Q',
    buyerName: '한도현',
    buyerPhone: '01099887766',
    buyerEmail: 'dohyun.han@example.com',
    address: '광주광역시 서구 상무중앙로 000',
    quantity: 1,
    amount: 128000,
    payMethod: '신용카드',
    payState: '결제완료',
    shipState: '교환완료',
    courier: 'CJ대한통운',
    trackingNumber: '512034099120',
    memo: '',
  },

  /*
    아래 둘은 **시드를 합치면서 더한 것**이다.

    고객 화면은 김서연의 주문으로 `S-24081`·`S-24079`·`S-24077` 셋을 보여 주고 있었는데,
    어드민 시드에서 뒤의 둘은 **이하늘·최유진의 주문**이었다. 두 배열이 서로를 모르는 동안
    고객 화면이 남의 주문을 자기 것으로 보여 주고 있었던 셈이다 — 손으로 맞춘 복사본이라
    아무도 대조하지 못했다.

    합치고 나니 김서연의 주문이 하나뿐이라 화면이 비었고, 상태 다양성(배송완료·결제취소)도
    사라졌다. 남의 주문을 다시 김서연에게 옮기는 대신 **김서연의 주문을 더한다** — 어드민
    목록은 여러 사람의 주문이 섞여 있어야 실제와 닮는다.
  */
  {
    id: 'S-24075',
    orderedAt: '2026-07-28 11:20',
    productId: 'P-1039',
    productName: '접이식 캠핑 체어',
    optionId: 'O-1039-OL',
    buyerName: '김서연',
    buyerPhone: '01043215678',
    buyerEmail: 'seoyeon.kim@example.com',
    address: '서울 성동구 성수일로 10, 3층',
    quantity: 2,
    amount: 108000,
    payMethod: '신용카드',
    payState: '결제완료',
    shipState: '배송완료',
    courier: '한진택배',
    trackingNumber: '338120045512',
    memo: '',
  },
  {
    id: 'S-24074',
    orderedAt: '2026-07-26 09:41',
    productId: 'P-1042',
    productName: '리넨 오버셔츠',
    optionId: 'O-1042-NV-L',
    buyerName: '김서연',
    buyerPhone: '01043215678',
    buyerEmail: 'seoyeon.kim@example.com',
    address: '서울 성동구 성수일로 10, 3층',
    quantity: 1,
    amount: 49000,
    payMethod: '신용카드',
    // 결제를 취소한 주문 — 고객 화면에서 취소가 어떻게 보이는지 확인할 자리가 필요하다.
    payState: '결제취소',
    shipState: '배송준비',
    courier: '',
    trackingNumber: '',
    memo: '',
  },
];

export function findOrder(id: string): OrderRecord | undefined {
  return ORDERS.find((order) => order.id === id);
}

/** 고객 화면이 보는 좁은 모양 — 자기 주문이라 구매자 정보를 다시 보여 주지 않는다. */
export type OrderSummary = {
  id: string;
  orderedAt: string;
  productId: string;
  productName: string;
  /** 옵션 코드가 아니라 **사람이 읽는 말** — 고객에게 `O-1042-BE-M` 은 뜻이 없다 */
  optionLabel: string;
  quantity: number;
  amount: number;
  payState: PayState;
  shipState: ShipState;
  courier: string;
  trackingNumber: string;
};

/**
 * 그 사람의 주문만, 최근 것부터.
 *
 * 어드민이 송장을 넣거나 교환을 접수하면 `ORDERS` 가 바뀌고, 이 함수를 거쳐 고객 화면에도
 * 그대로 나타난다 — 두 벌이던 시절에는 나타나지 않던 것이다.
 */
export function ordersOf(email: string): OrderSummary[] {
  return ORDERS.filter((order) => order.buyerEmail === email)
    .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt))
    .map((order) => ({
      id: order.id,
      orderedAt: order.orderedAt,
      productId: order.productId,
      productName: order.productName,
      optionLabel: optionLabelOf(order.optionId),
      quantity: order.quantity,
      amount: order.amount,
      payState: order.payState,
      shipState: order.shipState,
      courier: order.courier,
      trackingNumber: order.trackingNumber,
    }));
}
