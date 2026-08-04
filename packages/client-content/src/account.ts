/**
 * 로그인한 사용자의 데이터 — **프론트엔드 전용** 데모 시드.
 *
 * `SiteContent` 와 분리한 이유: 저기는 **어드민이 설정한 것**이고, 여기는 **사용자마다 다른 것**이다.
 * 한 덩어리로 두면 "어드민에서 바꾸면 모든 템플릿에 반영된다" 는 계약의 뜻이 흐려진다.
 *
 * 주문 번호는 어드민의 판매 시드(`apps/b2c-admin/lib/data/orders.ts`)와 **같은 값**을 쓴다 —
 * 어드민 메뉴에는 '판매', 고객 화면에는 '주문' 으로 적히지만 자원은 하나이고 엔티티는 `order` 다.
 */
import { claimableCoupons, couponsOf, inquiriesOf, todayStamp } from '@winpilot/store';

export type OrderState = '결제완료' | '결제취소' | '환불완료';
export type ShipState = '배송준비' | '배송중' | '배송완료' | '교환요청' | '교환완료';

export type OrderSummary = {
  id: string;
  orderedAt: string;
  productId: string;
  productName: string;
  optionLabel: string;
  quantity: number;
  amount: number;
  payState: OrderState;
  shipState: ShipState;
  courier: string;
  trackingNumber: string;
};

export type CartLine = {
  productId: string;
  productName: string;
  optionLabel: string;
  quantity: number;
  price: number;
  /** 담을 당시의 재고 — 0 이면 주문할 수 없다 */
  stock: number;
};

export type AlarmItem = {
  id: string;
  kind: '주문' | '공지' | '혜택';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href: string;
};

export type Account = {
  signedIn: boolean;
  /** 가입할 때 발급되는 회원 번호 — 어드민 사용자 목록의 아이디와 같은 값이다 */
  memberId: string;
  name: string;
  email: string;
  /** 화면에 드러나는 이름. 비워 두면 가입 시 임의로 만들어 준다 */
  nickname: string;
  /** 내 정보 수정 화면이 쓰는 값 — 문의 기록의 연락처와 같은 사람이다 */
  countryCode: string;
  phone: string;
  address: string;
  addressDetail: string;
  postalCode: string;
  /** 광고성 정보 수신 동의 — 선택 항목이다 */
  marketing: boolean;
  grade: string;
  reward: number;
  orders: OrderSummary[];
  cart: CartLine[];
  alarms: AlarmItem[];
};

export const ACCOUNT: Account = {
  signedIn: true,
  memberId: 'U-10241',
  name: '김서연',
  email: 'seoyeon.kim@example.com',
  nickname: '푸른바람2417',
  countryCode: '+82',
  phone: '01043215678',
  address: '서울 성동구 성수일로 10',
  addressDetail: '3층',
  postalCode: '04780',
  marketing: true,
  grade: 'VIP',
  reward: 12_400,

  orders: [
    {
      id: 'S-24081',
      orderedAt: '2026-08-03 09:12',
      productId: 'P-1042',
      productName: '리넨 오버셔츠',
      optionLabel: '베이지 / M',
      quantity: 1,
      amount: 49_000,
      payState: '결제완료',
      shipState: '배송준비',
      courier: '',
      trackingNumber: '',
    },
    {
      id: 'S-24079',
      orderedAt: '2026-08-01 13:05',
      productId: 'P-1039',
      productName: '접이식 캠핑 체어',
      optionLabel: '올리브',
      quantity: 2,
      amount: 108_000,
      payState: '결제완료',
      shipState: '배송완료',
      courier: '한진택배',
      trackingNumber: '338120045512',
    },
    {
      id: 'S-24077',
      orderedAt: '2026-07-30 10:02',
      productId: 'P-1042',
      productName: '리넨 오버셔츠',
      optionLabel: '네이비 / L',
      quantity: 1,
      amount: 49_000,
      payState: '결제취소',
      shipState: '배송준비',
      courier: '',
      trackingNumber: '',
    },
  ],

  cart: [
    {
      productId: 'P-1040',
      productName: '워시드 코튼 침구 세트',
      optionLabel: '차콜 / Q',
      quantity: 1,
      price: 128_000,
      stock: 4,
    },
    {
      productId: 'P-1042',
      productName: '리넨 오버셔츠',
      optionLabel: '베이지 / L',
      quantity: 1,
      price: 49_000,
      // 담아 둔 사이에 품절된 경우 — 화면이 이 사실을 숨기면 결제 단계에서 막힌다.
      stock: 0,
    },
  ],

  alarms: [
    {
      id: 'AL-901',
      kind: '주문',
      title: '주문이 접수되었습니다',
      body: 'S-24081 · 리넨 오버셔츠',
      createdAt: '2026-08-03 09:13',
      read: false,
      href: '/orders/S-24081',
    },
    {
      id: 'AL-900',
      kind: '공지',
      title: '추석 연휴 배송 일정 안내',
      body: '연휴 기간 배송이 순차적으로 지연될 수 있습니다.',
      createdAt: '2026-08-01 10:00',
      read: false,
      href: '/notices/N-1024',
    },
    {
      id: 'AL-899',
      kind: '주문',
      title: '배송이 완료되었습니다',
      body: 'S-24079 · 접이식 캠핑 체어',
      createdAt: '2026-08-02 14:22',
      read: true,
      href: '/orders/S-24079',
    },
  ],
};

export function findOrder(id: string): OrderSummary | undefined {
  return ACCOUNT.orders.find((order) => order.id === id);
}

export function cartTotal(lines: readonly CartLine[] = ACCOUNT.cart): number {
  // 품절 줄은 합계에서 뺀다 — 결제할 수 없는 금액을 보여주면 결제 단계에서 숫자가 달라진다.
  return lines
    .filter((line) => line.stock > 0)
    .reduce((sum, line) => sum + line.price * line.quantity, 0);
}

export function unreadAlarms(items: readonly AlarmItem[] = ACCOUNT.alarms): number {
  return items.filter((item) => !item.read).length;
}

export const ORDER_STATE_TONE: Record<OrderState, string> = {
  결제완료: 'bg-signal-ok/12 text-signal-ok',
  결제취소: 'bg-signal-danger/12 text-signal-danger',
  환불완료: 'bg-surface text-ink-muted',
};

export const SHIP_STATE_TONE: Record<ShipState, string> = {
  배송준비: 'bg-surface text-ink-muted',
  배송중: 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
  배송완료: 'bg-signal-ok/12 text-signal-ok',
  교환요청: 'bg-signal-danger/12 text-signal-danger',
  교환완료: 'bg-surface text-ink-muted',
};

/**
 * 내가 보낸 문의 — **어드민이 보는 그 기록**이다.
 *
 * 고객 화면이 따로 문의 시드를 들면, 어드민에서 답변을 달아도 고객 화면에는 영영 '답변 대기'
 * 로 남는다. store 의 기록을 이메일로 걸러 그대로 쓴다.
 */
export function myInquiries(email: string = ACCOUNT.email) {
  return inquiriesOf(email);
}

/** 내 쿠폰함. 오늘 날짜 기준으로 쓸 수 있는 것이 위로 온다. */
export function myCoupons(email: string = ACCOUNT.email) {
  return couponsOf(email, todayStamp());
}

/** 아직 받지 않은 쿠폰 — 쿠폰함의 '쿠폰 받기' 탭이 쓴다. */
export function openCoupons() {
  return claimableCoupons(todayStamp());
}

/** 오늘 날짜 — 쿠폰 상태 판정에 쓴다. 화면마다 다른 '오늘' 을 쓰면 상태가 어긋난다. */
export const TODAY = todayStamp();
