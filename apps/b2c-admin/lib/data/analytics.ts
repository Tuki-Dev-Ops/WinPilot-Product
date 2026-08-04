/**
 * 통계 시드 데이터 — **프론트엔드 전용**.
 *
 * 숫자는 다른 화면의 시드와 어긋나지 않게 맞춰 둔다. 대시보드가 상품 5건이라 하는데
 * 상품 목록에 4건만 있으면, 보는 사람은 어느 쪽을 믿어야 할지 알 수 없다.
 */
export type DailyPoint = {
  /** `YYYY-MM-DD` */
  date: string;
  orders: number;
  /** 원 단위 매출 */
  revenue: number;
  visitors: number;
  signups: number;
};

/** 최근 14일. 오래된 날이 먼저 온다 — 차트가 왼쪽에서 오른쪽으로 흐른다. */
export const DAILY: DailyPoint[] = [
  { date: '2026-07-21', orders: 96, revenue: 7_420_000, visitors: 2_140, signups: 31 },
  { date: '2026-07-22', orders: 104, revenue: 8_010_000, visitors: 2_280, signups: 35 },
  { date: '2026-07-23', orders: 88, revenue: 6_640_000, visitors: 1_980, signups: 27 },
  { date: '2026-07-24', orders: 112, revenue: 9_120_000, visitors: 2_460, signups: 38 },
  { date: '2026-07-25', orders: 131, revenue: 10_880_000, visitors: 2_910, signups: 44 },
  { date: '2026-07-26', orders: 142, revenue: 11_540_000, visitors: 3_120, signups: 49 },
  { date: '2026-07-27', orders: 118, revenue: 9_360_000, visitors: 2_540, signups: 36 },
  { date: '2026-07-28', orders: 101, revenue: 7_980_000, visitors: 2_210, signups: 30 },
  { date: '2026-07-29', orders: 109, revenue: 8_640_000, visitors: 2_350, signups: 33 },
  { date: '2026-07-30', orders: 124, revenue: 9_920_000, visitors: 2_680, signups: 41 },
  { date: '2026-07-31', orders: 137, revenue: 11_060_000, visitors: 2_980, signups: 46 },
  { date: '2026-08-01', orders: 151, revenue: 12_480_000, visitors: 3_310, signups: 52 },
  { date: '2026-08-02', orders: 116, revenue: 9_240_000, visitors: 2_520, signups: 34 },
  { date: '2026-08-03', orders: 128, revenue: 10_240_000, visitors: 2_740, signups: 46 },
];

export type PageView = {
  /** 고객 화면 경로 */
  path: string;
  label: string;
  views: number;
  /** 방문자당 머문 시간(초) */
  avgSeconds: number;
  /** 한 페이지만 보고 떠난 비율 (0~1) */
  bounceRate: number;
};

export const PAGE_VIEWS: PageView[] = [
  { path: '/', label: '홈', views: 18_420, avgSeconds: 48, bounceRate: 0.32 },
  { path: '/products', label: '상품 목록', views: 12_180, avgSeconds: 96, bounceRate: 0.21 },
  { path: '/products/[productId]', label: '상품 상세', views: 9_640, avgSeconds: 142, bounceRate: 0.18 },
  { path: '/contents/notices', label: '공지사항', views: 3_210, avgSeconds: 64, bounceRate: 0.44 },
  { path: '/company/about', label: '회사 소개', views: 2_480, avgSeconds: 71, bounceRate: 0.51 },
  { path: '/contact', label: '문의하기', views: 1_940, avgSeconds: 118, bounceRate: 0.27 },
  { path: '/contents/portfolios', label: '포트폴리오', views: 1_620, avgSeconds: 88, bounceRate: 0.39 },
  { path: '/contents/faqs', label: 'FAQ', views: 1_180, avgSeconds: 74, bounceRate: 0.46 },
];

export type ChannelShare = { name: string; visitors: number };

export const CHANNELS: ChannelShare[] = [
  { name: '검색', visitors: 12_840 },
  { name: '직접 유입', visitors: 8_210 },
  { name: 'SNS', visitors: 5_460 },
  { name: '광고', visitors: 3_180 },
  { name: '기타', visitors: 1_240 },
];

/** 카테고리별 매출 — 상품 카테고리 시드와 같은 이름을 쓴다. */
export const CATEGORY_REVENUE: Array<{ name: string; revenue: number; orders: number }> = [
  { name: '패션', revenue: 48_600_000, orders: 612 },
  { name: '리빙', revenue: 39_200_000, orders: 448 },
  { name: '아웃도어', revenue: 14_800_000, orders: 186 },
];

export const PERIODS = [
  { id: '7d', label: '최근 7일', days: 7 },
  { id: '14d', label: '최근 14일', days: 14 },
] as const;

export type PeriodId = (typeof PERIODS)[number]['id'];

export function pointsFor(periodId: PeriodId): DailyPoint[] {
  const period = PERIODS.find((item) => item.id === periodId) ?? PERIODS[0];
  return DAILY.slice(-period.days);
}

export function sum(points: readonly DailyPoint[], key: keyof Omit<DailyPoint, 'date'>): number {
  return points.reduce((total, point) => total + point[key], 0);
}

/**
 * 앞 구간 대비 증감률.
 * 같은 길이의 직전 구간과 비교한다 — 7일을 30일과 비교하면 늘 늘어난 것처럼 보인다.
 */
export function changeRate(periodId: PeriodId, key: keyof Omit<DailyPoint, 'date'>): number | null {
  const period = PERIODS.find((item) => item.id === periodId) ?? PERIODS[0];
  const current = DAILY.slice(-period.days);
  const previous = DAILY.slice(-period.days * 2, -period.days);
  if (previous.length < period.days) return null;

  const before = sum(previous, key);
  if (before === 0) return null;
  return (sum(current, key) - before) / before;
}

export function formatAmount(value: number): string {
  return value.toLocaleString('ko-KR');
}

/** 큰 금액은 만/억 단위로 줄여야 축 눈금이 읽힌다. */
export function shortAmount(value: number): string {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}억`;
  if (value >= 10_000) return `${Math.round(value / 10_000)}만`;
  return `${value}`;
}

export function formatRate(rate: number | null): string {
  if (rate === null) return '비교 구간 없음';
  const sign = rate > 0 ? '+' : '';
  return `${sign}${(rate * 100).toFixed(1)}%`;
}
