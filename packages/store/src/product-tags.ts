/**
 * 상품 자동 분류 — NEW · BEST.
 *
 * 사람이 붙이지 않는다. 등록일과 누적 판매량에서 **계산**한다.
 * 손으로 붙이는 순간 떼는 것을 잊게 되고, 반년 전 상품에 NEW 가 남는다.
 *
 * 기준일(`today`)은 화면이 스스로 읽지 않고 서버 컴포넌트에서 내려받는다 —
 * 서버가 그린 HTML 과 브라우저가 계산한 값이 어긋나면 hydration 이 깨진다.
 */
export type ProductTag = 'NEW' | 'BEST';

/** 등록 후 이 일수 안이면 NEW */
export const NEW_WITHIN_DAYS = 7;

/** 누적 판매량이 이 이상이면 BEST */
export const BEST_MIN_SALES = 100;

export const TAG_RULE_TEXT = `등록 ${NEW_WITHIN_DAYS}일 이내 NEW · 누적 판매 ${BEST_MIN_SALES}건 이상 BEST`;

/** `YYYY-MM-DD` 두 개의 날짜 차이(일). 시각·표준시를 섞지 않으려고 UTC 자정으로 맞춘다. */
export function daysBetween(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return Number.POSITIVE_INFINITY;
  return Math.round((end - start) / 86_400_000);
}

export function isNewProduct(createdAt: string, today: string): boolean {
  const age = daysBetween(createdAt, today);
  return age >= 0 && age < NEW_WITHIN_DAYS;
}

export function isBestProduct(salesCount: number): boolean {
  return salesCount >= BEST_MIN_SALES;
}

export function productTags(
  product: { createdAt: string; salesCount: number },
  today: string,
): ProductTag[] {
  const tags: ProductTag[] = [];
  if (isNewProduct(product.createdAt, today)) tags.push('NEW');
  if (isBestProduct(product.salesCount)) tags.push('BEST');
  return tags;
}

/** 오늘 날짜를 `YYYY-MM-DD` 로. 서버 컴포넌트에서 한 번만 호출한다. */
export function todayStamp(): string {
  const now = new Date();
  const pad = (value: number) => `${value}`.padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/*
 * `TAG_TONE` 은 `apps/b2c-admin/lib/data/product-tags.ts` 로 내렸다 — 이유는
 * `banners.ts` 의 `SCHEDULE_TONE` 과 같다. 태그가 무엇인지(`productTags()`)는 두 화면이
 * 같아야 하지만, 그것을 무슨 색으로 그릴지는 화면이 정한다.
 */
