/**
 * 통계 — 매출과 회원. **프론트엔드 전용** 시드.
 *
 * 여기 매출은 **우리가 고객사에게 받는 돈**이다. B2C Admin 의 매출(고객사가 고객에게 파는
 * 돈)과 방향이 반대라 같은 말이라도 다른 자원이다.
 *
 * 회원은 **고객사 사이트에 가입한 사람 수**다. 개인을 들여다보는 화면이 아니라 규모만
 * 읽는 화면이라 이름·이메일 같은 값을 두지 않는다 — 없는 값은 새어 나갈 수도 없다.
 *
 * 차트는 전부 인라인 SVG 로 그린다. 비트맵은 Figma 에서 벡터로 복원되지 않는다.
 */
export type MonthPoint = {
  /** `YYYY-MM` */
  month: string;
  /** 그 달에 받은 금액 (원) */
  amount: number;
  /** 그 달에 청구한 건수 */
  count: number;
};

/** 최근 12개월. 표와 차트가 같은 배열을 읽어야 두 곳의 값이 갈리지 않는다. */
export const REVENUE_MONTHS: MonthPoint[] = [
  { month: '2025-09', amount: 24_500_000, count: 8 },
  { month: '2025-10', amount: 22_800_000, count: 8 },
  { month: '2025-11', amount: 26_100_000, count: 9 },
  { month: '2025-12', amount: 31_400_000, count: 11 },
  { month: '2026-01', amount: 48_700_000, count: 12 },
  { month: '2026-02', amount: 27_300_000, count: 10 },
  { month: '2026-03', amount: 35_900_000, count: 12 },
  { month: '2026-04', amount: 29_600_000, count: 11 },
  { month: '2026-05', amount: 28_200_000, count: 10 },
  { month: '2026-06', amount: 33_100_000, count: 11 },
  { month: '2026-07', amount: 30_400_000, count: 10 },
  { month: '2026-08', amount: 25_000_000, count: 9 },
];

export type RevenueKind = '구축' | '유지보수' | '추가 개발' | '호스팅';

/** 무엇으로 버는지. 유지보수가 얇으면 한 번 팔고 끝나는 장사가 된다. */
export const REVENUE_BY_KIND: Array<{ kind: RevenueKind; amount: number }> = [
  { kind: '유지보수', amount: 146_400_000 },
  { kind: '구축', amount: 128_000_000 },
  { kind: '추가 개발', amount: 52_300_000 },
  { kind: '호스팅', amount: 16_300_000 },
];

/** 고객사별 누적 — 한 곳에 매출이 쏠려 있으면 그 한 곳이 떠날 때 회사가 흔들린다. */
export const REVENUE_BY_TENANT: Array<{ tenantId: string; amount: number }> = [
  { tenantId: 'T-101', amount: 142_700_000 },
  { tenantId: 'T-102', amount: 138_300_000 },
  { tenantId: 'T-103', amount: 62_000_000 },
];

export type MemberPoint = {
  month: string;
  /** 그달 말 기준 누적 회원 수 (모든 고객사 합계) */
  total: number;
  /** 그달에 새로 가입한 수 */
  joined: number;
  /** 그달에 탈퇴한 수 */
  left: number;
};

export const MEMBER_MONTHS: MemberPoint[] = [
  { month: '2025-09', total: 31_400, joined: 1_820, left: 240 },
  { month: '2025-10', total: 33_100, joined: 1_940, left: 240 },
  { month: '2025-11', total: 35_400, joined: 2_530, left: 230 },
  { month: '2025-12', total: 38_900, joined: 3_710, left: 210 },
  { month: '2026-01', total: 41_200, joined: 2_580, left: 280 },
  { month: '2026-02', total: 43_000, joined: 2_090, left: 290 },
  { month: '2026-03', total: 45_600, joined: 2_880, left: 280 },
  { month: '2026-04', total: 47_300, joined: 1_990, left: 290 },
  { month: '2026-05', total: 49_100, joined: 2_110, left: 310 },
  { month: '2026-06', total: 51_400, joined: 2_600, left: 300 },
  { month: '2026-07', total: 53_200, joined: 2_120, left: 320 },
  { month: '2026-08', total: 54_600, joined: 1_710, left: 310 },
];

/** 고객사별 회원 규모 — 플랜의 상한에 얼마나 가까운지가 다음 계약의 근거가 된다. */
export const MEMBERS_BY_TENANT: Array<{ tenantId: string; members: number; limit: number }> = [
  { tenantId: 'T-101', members: 31_800, limit: 200_000 },
  { tenantId: 'T-102', members: 18_400, limit: 30_000 },
  { tenantId: 'T-103', members: 4_400, limit: 5_000 },
];

export function formatMoney(value: number): string {
  return value.toLocaleString('ko-KR');
}

export function formatPeople(value: number): string {
  return value.toLocaleString('ko-KR');
}

/** 앞 달 대비 증감률(%). 소수 한 자리까지만 — 그보다 잘게 보여 줘도 판단이 달라지지 않는다. */
export function changeRate(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/**
 * 막대 하나의 높이 비율(0~1).
 *
 * 최댓값을 100% 로 잡는다. 0 을 바닥으로 두지 않으면 작은 차이가 커 보여 없는 추세를 읽는다.
 */
export function ratioOf(value: number, values: readonly number[]): number {
  const max = Math.max(...values, 1);
  return value / max;
}
