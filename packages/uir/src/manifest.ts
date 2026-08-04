import { z } from 'zod';

/**
 * 요구사항 1.2 의 페이지 순번·이름을 결정하는 유일한 출처.
 * Figma 페이지명은 이 스펙 외의 어떤 것도 참조하지 않는다.
 */
export const PageSpecSchema = z.object({
  order: z.number().int().positive(),
  /** Figma `pluginData` 에 저장되는 추적 키. 사용자가 페이지명을 바꿔도 이 값으로 매칭한다. */
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, '소문자·숫자·하이픈만 허용'),
  /** Figma 페이지명에 그대로 들어가는 표시 이름 (예: 'Index') */
  name: z.string().min(1),
  route: z.string().startsWith('/'),
  /**
   * 동적 라우트(`/products/[productId]`)를 실제로 열어 볼 URL.
   *
   * `route` 는 기능 레지스트리·라우트 탐색과 맞춰야 하므로 대괄호 형태 그대로 두고,
   * 브라우저가 방문할 주소만 여기에 따로 적는다. 없으면 `route` 를 그대로 연다.
   */
  sampleUrl: z.string().startsWith('/').optional(),
});
export type PageSpec = z.infer<typeof PageSpecSchema>;

export const BreakpointSpecSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  label: z.string().min(1),
  width: z.number().int().positive(),
});
export type BreakpointSpec = z.infer<typeof BreakpointSpecSchema>;

/** 등록된 페이지 중 가장 큰 순번. 패딩 자릿수의 기준이다. */
export function maxOrder(pages: readonly PageSpec[]): number {
  return pages.reduce((max, page) => Math.max(max, page.order), 1);
}

/**
 * Figma 페이지명 생성 규칙 — `{순번}. {이름}` (예: `1. Index`).
 *
 * 패딩 자릿수는 **페이지 개수가 아니라 가장 큰 순번**을 따른다.
 * 순번은 뷰별 대역(Client 1–49 / Admin 50–99)으로 띄엄띄엄 부여되므로,
 * 개수를 기준으로 잡으면 페이지 2개(1번·50번)일 때 폭이 1이 되어
 * `50. …` 이 `1. …` 과 나란히 놓이고 문자열 정렬이 뒤집힌다.
 */
export function figmaPageName(spec: PageSpec, maxOrderValue: number): string {
  const width = String(Math.max(maxOrderValue, 1)).length;
  return `${String(spec.order).padStart(width, '0')}. ${spec.name}`;
}

/** order 오름차순 정렬. 플러그인은 이 순서로 `figma.root.insertChild` 를 호출한다. */
export function sortPages(pages: readonly PageSpec[]): PageSpec[] {
  return [...pages].sort((a, b) => a.order - b.order);
}

/**
 * 매니페스트 무결성 검사. 오류 메시지 배열을 반환하며, 빈 배열이면 정상이다.
 * 추출기와 플러그인 양쪽이 시작 시점에 호출한다.
 */
export function validateManifest(pages: readonly PageSpec[]): string[] {
  const errors: string[] = [];
  const seen = { order: new Map<number, string>(), id: new Set<string>(), route: new Set<string>() };

  for (const page of pages) {
    const parsed = PageSpecSchema.safeParse(page);
    if (!parsed.success) {
      errors.push(`[${page.id ?? '?'}] 스펙 위반: ${parsed.error.issues.map((i) => i.message).join(', ')}`);
      continue;
    }
    const dup = seen.order.get(page.order);
    if (dup !== undefined) errors.push(`order ${page.order} 중복: '${dup}' 와 '${page.id}'`);
    seen.order.set(page.order, page.id);

    if (seen.id.has(page.id)) errors.push(`id '${page.id}' 중복`);
    seen.id.add(page.id);

    if (seen.route.has(page.route)) errors.push(`route '${page.route}' 중복`);
    seen.route.add(page.route);
  }

  // order 에 구멍이 있는 것은 정상이다 — 뷰별 대역(Client 1–49 / Admin 50–99)을 쓰기 때문이며,
  // 대역을 띄워두어야 중간에 페이지를 끼울 때 전체 번호를 다시 매기지 않아도 된다.
  // (docs/spec/04-ia.md §4.5) 따라서 연속성은 검사하지 않고 중복만 막는다.

  return [...new Set(errors)];
}

/**
 * 매니페스트에 등록되지 않은 라우트를 찾는다.
 * 페이지를 만들고 등록을 잊는 사고를 구조적으로 막기 위해 추출기가 이 결과로 실패한다.
 */
export function findUnregisteredRoutes(
  discoveredRoutes: readonly string[],
  pages: readonly PageSpec[],
  devOnlyRoutes: readonly string[] = [],
): string[] {
  const registered = new Set(pages.map((p) => p.route));
  const excluded = new Set(devOnlyRoutes);
  return discoveredRoutes.filter((route) => !registered.has(route) && !excluded.has(route));
}
