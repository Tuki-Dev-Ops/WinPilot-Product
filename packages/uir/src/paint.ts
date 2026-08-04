import { z } from 'zod';
import { AssetHashSchema, BlendModeSchema, Matrix2x3Schema, RgbaSchema, Vector2Schema } from './primitives';

export const GradientStopSchema = z.object({
  /** 0–1 정규화 위치 */
  position: z.number().min(0).max(1),
  color: RgbaSchema,
});
export type GradientStop = z.infer<typeof GradientStopSchema>;

export const SolidPaintSchema = z.object({
  type: z.literal('SOLID'),
  color: RgbaSchema,
  opacity: z.number().min(0).max(1),
  blendMode: BlendModeSchema,
  visible: z.boolean(),
});

export const GradientPaintSchema = z.object({
  type: z.enum(['GRADIENT_LINEAR', 'GRADIENT_RADIAL', 'GRADIENT_ANGULAR', 'GRADIENT_DIAMOND']),
  /**
   * CSS 각도(0deg = 위쪽, 시계방향)를 Figma 그라디언트 핸들 좌표계로 변환한 결과.
   * 변환 책임은 추출기에 있다 — 플러그인은 이 행렬을 그대로 대입만 한다.
   */
  gradientTransform: Matrix2x3Schema,
  gradientStops: z.array(GradientStopSchema).min(2),
  opacity: z.number().min(0).max(1),
  blendMode: BlendModeSchema,
  visible: z.boolean(),
});

export const ImagePaintSchema = z.object({
  type: z.literal('IMAGE'),
  assetHash: AssetHashSchema,
  /** CSS `object-fit` / `background-size` 대응 */
  scaleMode: z.enum(['FILL', 'FIT', 'CROP', 'TILE']),
  /** scaleMode === 'CROP' 일 때의 크롭 행렬 */
  imageTransform: Matrix2x3Schema.optional(),
  /** scaleMode === 'TILE' 일 때의 배율 */
  scalingFactor: z.number().optional(),
  opacity: z.number().min(0).max(1),
  blendMode: BlendModeSchema,
  visible: z.boolean(),
});

/**
 * 페인트 배열의 순서 규약: **Figma 기준(마지막이 위)**.
 * CSS 다중 배경은 첫 번째가 위이므로 추출기가 역순으로 뒤집어 담는다.
 */
export const PaintSchema = z.union([SolidPaintSchema, GradientPaintSchema, ImagePaintSchema]);
export type Paint = z.infer<typeof PaintSchema>;

export const ShadowEffectSchema = z.object({
  type: z.enum(['DROP_SHADOW', 'INNER_SHADOW']),
  color: RgbaSchema,
  offset: Vector2Schema,
  /** CSS blur-radius 를 Figma radius 로 환산한 값 */
  radius: z.number().min(0),
  spread: z.number(),
  blendMode: BlendModeSchema,
  visible: z.boolean(),
});

export const BlurEffectSchema = z.object({
  /** LAYER_BLUR ← `filter: blur()` · BACKGROUND_BLUR ← `backdrop-filter: blur()` */
  type: z.enum(['LAYER_BLUR', 'BACKGROUND_BLUR']),
  radius: z.number().min(0),
  visible: z.boolean(),
});

export const EffectSchema = z.union([ShadowEffectSchema, BlurEffectSchema]);
export type Effect = z.infer<typeof EffectSchema>;

/**
 * Figma 스트로크는 **두께만 사면 개별**이고 색은 단일이다.
 * CSS 가 사면에 다른 색을 쓰면 단일 스트로크로 표현할 수 없으므로
 * `perSideColors` 가 채워지고, 플러그인은 이 노드를 4개 사각형으로 분해한다.
 */
export const StrokeSpecSchema = z.object({
  color: RgbaSchema,
  align: z.enum(['INSIDE', 'OUTSIDE', 'CENTER']),
  weights: z.object({
    top: z.number().min(0),
    right: z.number().min(0),
    bottom: z.number().min(0),
    left: z.number().min(0),
  }),
  dashPattern: z.array(z.number()).optional(),
  perSideColors: z.tuple([RgbaSchema, RgbaSchema, RgbaSchema, RgbaSchema]).optional(),
});
export type StrokeSpec = z.infer<typeof StrokeSpecSchema>;

/** 코너별 반경 [TL, TR, BR, BL]. 타원형 반경은 Figma가 표현 불가 → 폴백으로 강등된다. */
export const CornerRadiusSchema = z.tuple([
  z.number().min(0),
  z.number().min(0),
  z.number().min(0),
  z.number().min(0),
]);
export type CornerRadius = z.infer<typeof CornerRadiusSchema>;
