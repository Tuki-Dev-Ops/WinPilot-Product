import { z } from 'zod';
import { CornerRadiusSchema, EffectSchema, PaintSchema, StrokeSpecSchema } from './paint';
import { AssetHashSchema, BlendModeSchema, Matrix2x3Schema, RectSchema } from './primitives';
import { TextSpecSchema } from './text';

/** 폴백 래스터로 강등되는 사유. 리포트의 개선 백로그가 된다. */
export const FallbackReasonSchema = z.enum([
  'elliptical-radius',
  'per-side-border-color',
  'css-filter',
  'transform-rotate',
  'transform-skew',
  'transform-3d',
  'clip-path',
  'mask',
  'text-stroke',
  /** `::before` / `::after` 는 DOM 에 없어 기하를 잴 수 없다 */
  'pseudo-element',
  /**
   * 그라디언트. Figma 의 `gradientTransform` 매핑은 실제 Figma 에서 검증하기 전까지
   * 네이티브로 내보내지 않는다 — 검증 불가능한 행렬 연산은 조용히 틀린 파이프라인을 만든다.
   * Phase 3 에서 플러그인과 함께 승격한다.
   */
  'gradient',
  'backdrop-filter',
  'unknown',
]);
export type FallbackReason = z.infer<typeof FallbackReasonSchema>;

/**
 * Figma 네이티브 노드로 표현 불가능한 요소의 탈출구.
 * 해당 영역만 크롭한 브라우저 렌더 PNG 를 그 자리에 배치하므로 **픽셀 diff 는 정의상 0** 이 된다.
 * 품질은 diff 가 아니라 '네이티브 커버리지' 지표로 따로 측정한다.
 */
export const FallbackSchema = z.object({
  reason: FallbackReasonSchema,
  detail: z.string(),
  rasterHash: AssetHashSchema,
});
export type Fallback = z.infer<typeof FallbackSchema>;

/**
 * 이 노드를 Figma **컴포넌트**로 만든다 (`data-ssot-component`).
 *
 * 같은 `name` 을 가진 노드가 여러 개면 `variant` 를 축으로 ComponentSet 으로 묶인다.
 * 한 화면은 한 상태만 렌더하므로, 변형을 모두 뽑으려면 상태를 나란히 그려두는
 * 컴포넌트 갤러리 페이지가 필요하다 (`/ssot/components`).
 */
export const ComponentDefSchema = z.object({
  name: z.string().min(1),
  /** 예: `{ State: 'Error' }` → Figma 컴포넌트명 `State=Error` */
  variant: z.record(z.string()).optional(),
});
export type ComponentDef = z.infer<typeof ComponentDefSchema>;

/**
 * 이 노드를 Figma 컴포넌트 속성에 연결한다.
 *
 * - `TEXT`    → 노드의 `characters` 를 속성으로 노출 (인스턴스마다 문구 교체)
 * - `BOOLEAN` → 노드의 `visible` 을 속성으로 노출 (인스턴스마다 표시/숨김)
 *
 * 한 노드가 둘 다 가질 수 있다 — 오류 메시지처럼 "보일지"와 "무슨 문구인지"가
 * 함께 바뀌는 요소가 대표적이다.
 */
export const ComponentPropertySchema = z.object({
  text: z.string().min(1).optional(),
  boolean: z.string().min(1).optional(),
});
export type ComponentProperty = z.infer<typeof ComponentPropertySchema>;

const UIRNodeBase = z.object({
  /** 태그+인덱스 경로 해시. 재실행 간 안정적이어야 diff 리포트를 비교할 수 있다. */
  id: z.string().min(1),
  tag: z.string().min(1),

  /** `data-ssot-cid` — 책임 컴포넌트 식별자. diff 발생 시 원인 컴포넌트를 지목하는 데 쓴다. */
  cid: z.string().optional(),
  variant: z.record(z.string()).optional(),

  rect: RectSchema,
  transform: Matrix2x3Schema.optional(),

  /**
   * CSS 페인팅 순서를 평탄화한 정수. **DOM 순서가 아니다.**
   * stacking context / z-index / position / opacity<1 / transform 을 모두 해석한 결과이며,
   * 플러그인은 이 값으로만 형제 순서를 정렬한다 (Figma 는 배열 뒤쪽이 위).
   */
  paintIndex: z.number().int().min(0),

  fills: z.array(PaintSchema),
  stroke: StrokeSpecSchema.optional(),
  radius: CornerRadiusSchema,
  effects: z.array(EffectSchema),
  opacity: z.number().min(0).max(1),
  blendMode: BlendModeSchema,
  /** CSS `overflow: hidden` → Figma `clipsContent` */
  clip: z.boolean(),
  /**
   * `visibility: hidden` 은 자리를 차지하되 그려지지 않는다.
   * 이 값을 넘기지 않으면 Figma 에서 그대로 보여 픽셀이 어긋난다.
   */
  visible: z.boolean(),

  component: ComponentDefSchema.optional(),
  property: ComponentPropertySchema.optional(),

  text: TextSpecSchema.optional(),
  /** `<svg>` outerHTML — 플러그인이 `figma.createNodeFromSvg()` 에 그대로 투입한다. */
  svg: z.string().optional(),

  fallback: FallbackSchema.optional(),
});

export type UIRNode = z.infer<typeof UIRNodeBase> & { children: UIRNode[] };

export const UIRNodeSchema: z.ZodType<UIRNode> = UIRNodeBase.extend({
  children: z.lazy(() => z.array(UIRNodeSchema)),
});

/** 트리를 깊이 우선으로 순회한다 (부모 → 자식). */
export function* walk(node: UIRNode): Generator<UIRNode> {
  yield node;
  for (const child of node.children) yield* walk(child);
}

export function countNodes(root: UIRNode): number {
  let n = 0;
  for (const _ of walk(root)) n += 1;
  return n;
}

/** 네이티브 커버리지 = 폴백이 아닌 노드 비율. 게이트가 아닌 품질 지표다. */
export function nativeCoverage(root: UIRNode): { total: number; native: number; ratio: number } {
  let total = 0;
  let native = 0;
  for (const node of walk(root)) {
    total += 1;
    if (!node.fallback) native += 1;
  }
  return { total, native, ratio: total === 0 ? 1 : native / total };
}
