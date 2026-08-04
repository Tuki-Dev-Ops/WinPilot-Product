import { z } from 'zod';
import { BreakpointSpecSchema, PageSpecSchema } from './manifest';
import { UIRNodeSchema } from './node';
import { AssetHashSchema } from './primitives';

/**
 * UIR 스키마 버전. 추출기와 플러그인이 이 패키지를 **공유 의존**하므로
 * 스키마를 바꾸면 양쪽이 동시에 깨진다 — 조용한 불일치가 발생할 수 없다.
 */
export const SCHEMA_VERSION = '1.0' as const;

/**
 * 문서가 요구하는 폰트. 플러그인은 생성 전에 이 목록이 Figma 에 모두 존재하는지 검사하고,
 * 하나라도 없으면 **생성을 중단한다** (폰트 대체가 일어나면 전 페이지 검증이 무너지므로).
 */
export const FontRefSchema = z.object({
  family: z.string().min(1),
  /** Figma 폰트 스타일명 ('Regular', 'Bold' …) */
  style: z.string().min(1),
  weight: z.number().int(),
  italic: z.boolean(),
  /** 셀프호스팅 woff2 자산 해시 */
  assetHash: AssetHashSchema.optional(),
});
export type FontRef = z.infer<typeof FontRefSchema>;

export const CaptureMetaSchema = z.object({
  commit: z.string(),
  builtAt: z.string(),
  extractorVersion: z.string(),
  userAgent: z.string(),
  /** UIR 과 baseline PNG 가 동일 브라우저 세션에서 나왔음을 보증하는 값 */
  sessionId: z.string(),
});
export type CaptureMeta = z.infer<typeof CaptureMetaSchema>;

export const UIRDocumentSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  page: PageSpecSchema,
  breakpoint: BreakpointSpecSchema,
  viewport: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    /** Figma 익스포트 1x 와 정합을 맞추기 위해 DPR 은 1 로 고정한다. */
    dpr: z.literal(1),
  }),
  fonts: z.array(FontRefSchema),
  root: UIRNodeSchema,
  capture: CaptureMetaSchema,
});
export type UIRDocument = z.infer<typeof UIRDocumentSchema>;

/** `artifacts/uir/{pageId}@{bpId}.json` — 추출기·검증기·플러그인이 공유하는 경로 규칙 */
export function uirFileName(pageId: string, breakpointId: string): string {
  return `${pageId}@${breakpointId}.json`;
}

/** `artifacts/baseline/{pageId}@{bpId}.png` */
export function baselineFileName(pageId: string, breakpointId: string): string {
  return `${pageId}@${breakpointId}.png`;
}

export function parseUIRDocument(input: unknown): UIRDocument {
  return UIRDocumentSchema.parse(input);
}
