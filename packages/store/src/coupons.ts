/**
 * 쿠폰 — **저장된 값은 여기 한 곳에만 있다.**
 *
 * 아직 어드민에 쿠폰 화면이 없다. 그래도 시드를 store 에 두는 이유는, 화면이 생겼을 때
 * 옮길 것이 없어야 하기 때문이다. 고객 화면이 자기 시드를 들고 있으면 어드민 화면을 만드는
 * 순간 값이 두 벌이 되고, 그 시점에는 어느 쪽이 맞는지 알 수 없다.
 *
 * `ownerEmail` 이 비어 있으면 **누구나 받을 수 있는 쿠폰**이고, 값이 있으면 그 사람에게
 * 발급된 쿠폰이다.
 */
export type CouponRecord = {
  id: string;
  name: string;
  /** 정액이면 원 단위, 정률이면 퍼센트 */
  kind: '정액' | '정률';
  value: number;
  /** 이 금액 이상 살 때만 쓸 수 있다. 0 이면 제한 없음 */
  minAmount: number;
  /** 정률 쿠폰의 최대 할인 금액. 0 이면 제한 없음 */
  maxDiscount: number;
  startAt: string;
  endAt: string;
  ownerEmail: string;
  used: boolean;
};

export const COUPONS: CouponRecord[] = [
  {
    id: 'CP-8801',
    name: '신규 가입 15% 할인',
    kind: '정률',
    value: 15,
    minAmount: 30_000,
    maxDiscount: 20_000,
    startAt: '2026-07-01',
    endAt: '2026-08-31',
    ownerEmail: 'seoyeon.kim@example.com',
    used: false,
  },
  {
    id: 'CP-8802',
    name: '여름 결산 5,000원 할인',
    kind: '정액',
    value: 5_000,
    minAmount: 50_000,
    maxDiscount: 0,
    startAt: '2026-08-01',
    endAt: '2026-08-15',
    ownerEmail: 'seoyeon.kim@example.com',
    used: false,
  },
  {
    id: 'CP-8803',
    name: '첫 주문 감사 3,000원',
    kind: '정액',
    value: 3_000,
    minAmount: 0,
    maxDiscount: 0,
    startAt: '2026-06-01',
    endAt: '2026-07-31',
    ownerEmail: 'seoyeon.kim@example.com',
    used: true,
  },
  {
    id: 'CP-8804',
    name: '리빙 카테고리 10%',
    kind: '정률',
    value: 10,
    minAmount: 20_000,
    maxDiscount: 10_000,
    startAt: '2026-08-01',
    endAt: '2026-09-30',
    ownerEmail: '',
    used: false,
  },
];

/** 쿠폰 상태 — 쓴 것, 기간이 지난 것, 지금 쓸 수 있는 것. `today` 는 'YYYY-MM-DD'. */
export type CouponState = '사용 가능' | '사용 완료' | '기간 만료';

export function couponState(coupon: CouponRecord, today: string): CouponState {
  if (coupon.used) return '사용 완료';
  if (coupon.endAt && coupon.endAt < today) return '기간 만료';
  return '사용 가능';
}

/** 한 사람의 쿠폰함 — 쓸 수 있는 것이 위로 온다. */
export function couponsOf(email: string, today: string): CouponRecord[] {
  const rank: Record<CouponState, number> = { '사용 가능': 0, '사용 완료': 1, '기간 만료': 2 };
  return COUPONS.filter((coupon) => coupon.ownerEmail === email).sort(
    (a, b) => rank[couponState(a, today)] - rank[couponState(b, today)] || a.endAt.localeCompare(b.endAt),
  );
}

/** 아직 아무에게도 발급되지 않은 쿠폰 — '쿠폰 받기' 탭에 놓인다. 기간이 지난 것은 뺀다. */
export function claimableCoupons(today: string): CouponRecord[] {
  return COUPONS.filter((coupon) => !coupon.ownerEmail && coupon.endAt >= today).sort((a, b) =>
    a.endAt.localeCompare(b.endAt),
  );
}

/** 할인 문구 — '15%' / '5,000원'. 두 종류를 한 줄로 읽히게 한다. */
export function couponAmountText(coupon: CouponRecord): string {
  return coupon.kind === '정률' ? `${coupon.value}%` : `${coupon.value.toLocaleString('ko-KR')}원`;
}
