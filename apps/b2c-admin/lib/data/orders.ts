/**
 * 판매(주문) 시드 데이터 — **프론트엔드 전용**.
 * 목록과 상세가 같은 배열을 본다.
 */
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
];

export function findOrder(id: string): OrderRecord | undefined {
  return ORDERS.find((order) => order.id === id);
}

export const PAY_TONE: Record<PayState, string> = {
  결제완료: 'bg-signal-ok/12 text-signal-ok',
  결제취소: 'bg-signal-danger/12 text-signal-danger',
  환불완료: 'bg-surface text-ink-muted',
};

export const SHIP_TONE: Record<ShipState, string> = {
  배송준비: 'bg-surface text-ink-muted',
  배송중: 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
  배송완료: 'bg-signal-ok/12 text-signal-ok',
  교환요청: 'bg-signal-danger/12 text-signal-danger',
  교환완료: 'bg-surface text-ink-muted',
};
