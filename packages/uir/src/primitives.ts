import { z } from 'zod';

/**
 * 뷰포트 기준 절대 좌표. **반올림하지 않는다.**
 * 반올림은 픽셀 diff의 최대 원인이므로 브라우저가 계산한 부동소수를 그대로 보존한다.
 */
export const RectSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
});
export type Rect = z.infer<typeof RectSchema>;

/** 채널당 0–1 정규화 (Figma RGBA 규약). CSS 0–255 는 추출 시 환산한다. */
export const RgbaSchema = z.object({
  r: z.number().min(0).max(1),
  g: z.number().min(0).max(1),
  b: z.number().min(0).max(1),
  a: z.number().min(0).max(1),
});
export type Rgba = z.infer<typeof RgbaSchema>;

export const Vector2Schema = z.object({ x: z.number(), y: z.number() });
export type Vector2 = z.infer<typeof Vector2Schema>;

/**
 * Figma `relativeTransform` 과 동일한 행 우선 2x3 아핀 행렬.
 * `[[a, c, e], [b, d, f]]` — CSS `matrix(a, b, c, d, e, f)` 와 성분 순서가 다르므로 주의.
 */
export const Matrix2x3Schema = z.tuple([
  z.tuple([z.number(), z.number(), z.number()]),
  z.tuple([z.number(), z.number(), z.number()]),
]);
export type Matrix2x3 = z.infer<typeof Matrix2x3Schema>;

export const IDENTITY_MATRIX: Matrix2x3 = [
  [1, 0, 0],
  [0, 1, 0],
];

/** Figma BlendMode 집합. CSS `mix-blend-mode` 는 대부분 1:1 대응된다. */
export const BlendModeSchema = z.enum([
  'PASS_THROUGH',
  'NORMAL',
  'DARKEN',
  'MULTIPLY',
  'LINEAR_BURN',
  'COLOR_BURN',
  'LIGHTEN',
  'SCREEN',
  'LINEAR_DODGE',
  'COLOR_DODGE',
  'OVERLAY',
  'SOFT_LIGHT',
  'HARD_LIGHT',
  'DIFFERENCE',
  'EXCLUSION',
  'HUE',
  'SATURATION',
  'COLOR',
  'LUMINOSITY',
]);
export type BlendMode = z.infer<typeof BlendModeSchema>;

/** 콘텐츠 해시. 이미지·폰트·폴백 래스터는 `artifacts/assets/{hash}` 에 저장된다. */
export const AssetHashSchema = z.string().regex(/^[a-f0-9]{16,64}$/, 'sha256 hex (16–64자)');
export type AssetHash = z.infer<typeof AssetHashSchema>;
