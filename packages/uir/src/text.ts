import { z } from 'zod';
import { RectSchema, RgbaSchema } from './primitives';

/**
 * 스타일이 균일한 문자 구간. `[start, end)` 는 `TextSpec.characters` 기준 코드유닛 오프셋.
 * Figma 에서는 `setRangeFontName` / `setRangeFills` 등으로 적용된다.
 */
export const TextRunSchema = z.object({
  start: z.number().int().min(0),
  end: z.number().int().min(0),
  fontFamily: z.string().min(1),
  /** Figma 폰트 스타일명 ('Regular', 'Bold', 'SemiBold' …). weight/italic 조합에서 해석한다. */
  fontStyle: z.string().min(1),
  fontWeight: z.number().int(),
  italic: z.boolean(),
  fontSizePx: z.number().positive(),
  /** CSS `em`/`%` 는 추출 시 px 로 환산 — Figma 에는 px 단위로만 넣는다. */
  letterSpacingPx: z.number(),
  fill: RgbaSchema,
  decoration: z.enum(['NONE', 'UNDERLINE', 'STRIKETHROUGH']),
  textCase: z.enum(['ORIGINAL', 'UPPER', 'LOWER', 'TITLE']),
});
export type TextRun = z.infer<typeof TextRunSchema>;

export const TextSpecSchema = z.object({
  characters: z.string(),
  runs: z.array(TextRunSchema).min(1),
  align: z.enum(['LEFT', 'CENTER', 'RIGHT', 'JUSTIFIED']),
  verticalAlign: z.enum(['TOP', 'CENTER', 'BOTTOM']),
  /** `%`/`AUTO` 금지 — 브라우저가 계산한 px 값 */
  lineHeightPx: z.number().positive(),
  letterSpacingPx: z.number(),
  paragraphSpacingPx: z.number(),
  /**
   * 브라우저가 계산한 실제 줄 박스 (`Range.getClientRects()`).
   *
   * 1. Figma 가 만든 노드의 줄 수를 이 배열 길이와 검산한다 (수치 검증 §9-A).
   * 2. 불일치 시 문단을 줄 단위 TextNode 로 분해하고 각 줄을 이 좌표에 절대 배치한다 (적응형 줄 분리 §7).
   * 3. 픽셀 검증에서 잉크 무게중심을 계산하는 단위이기도 하다 (§9-B2).
   */
  lineBoxes: z.array(RectSchema).min(1),
});
export type TextSpec = z.infer<typeof TextSpecSchema>;
