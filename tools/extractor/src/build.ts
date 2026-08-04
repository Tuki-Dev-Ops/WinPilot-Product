import type { PNG } from 'pngjs';
import {
  SCHEMA_VERSION,
  UIRDocumentSchema,
  type BreakpointSpec,
  type CaptureMeta,
  type PageSpec,
  type Paint,
  type UIRDocument,
  type UIRNode,
} from '@winpilot/uir';
import { AssetStore, cropFromPng, extensionFor } from './assets';
import type { RawDocument, RawNode, RawPaint } from './types';

export type BuildContext = {
  page: PageSpec;
  breakpoint: BreakpointSpec;
  capture: CaptureMeta;
  assets: AssetStore;
  baseline: PNG;
  fetchAsset: (url: string) => Promise<Buffer | null>;
};

export type BuildResult = {
  document: UIRDocument;
  stats: {
    nodes: number;
    fallbacks: number;
    images: number;
    missingAssets: string[];
  };
};

export async function buildDocument(raw: RawDocument, context: BuildContext): Promise<BuildResult> {
  const missingAssets: string[] = [];
  let images = 0;
  let fallbacks = 0;
  let nodes = 0;

  const resolvePaints = async (paints: RawPaint[]): Promise<Paint[]> => {
    const resolved: Paint[] = [];
    for (const paint of paints) {
      if (paint.type !== 'IMAGE') {
        resolved.push(paint);
        continue;
      }
      const bytes = await context.fetchAsset(paint.src);
      if (!bytes) {
        missingAssets.push(paint.src);
        continue;
      }
      const hash = context.assets.save(bytes, extensionFor(paint.src));
      images += 1;
      const { src: _src, ...rest } = paint;
      resolved.push({ ...rest, assetHash: hash });
    }
    return resolved;
  };

  const convert = async (node: RawNode): Promise<UIRNode> => {
    nodes += 1;

    const converted: UIRNode = {
      id: node.id,
      tag: node.tag,
      rect: node.rect,
      paintIndex: node.paintIndex,
      fills: await resolvePaints(node.fills),
      radius: node.radius,
      effects: node.effects,
      opacity: node.opacity,
      blendMode: node.blendMode,
      clip: node.clip,
      visible: node.visible,
      children: [],
    };

    if (node.cid) converted.cid = node.cid;
    if (node.variant) converted.variant = node.variant;
    if (node.component) converted.component = node.component;
    if (node.property) converted.property = node.property;
    if (node.transform) converted.transform = node.transform;
    if (node.stroke) converted.stroke = node.stroke;
    if (node.text) converted.text = node.text;
    if (node.svg) converted.svg = node.svg;

    if (node.fallback) {
      const crop = cropFromPng(context.baseline, node.rect);
      if (crop) {
        const hash = context.assets.save(crop.buffer, '.png');
        // 래스터는 정수 픽셀 경계로만 존재하므로 rect 를 크롭 영역에 스냅한다.
        converted.rect = crop.rect;
        converted.fills = [];
        converted.stroke = undefined;
        converted.effects = [];
        converted.fallback = { reason: node.fallback.reason, detail: node.fallback.detail, rasterHash: hash };
        fallbacks += 1;
      } else {
        // 잘라낼 픽셀이 없으면(화면 밖 등) 폴백이 의미 없다 — 일반 노드로 남긴다.
        converted.fallback = undefined;
      }
    }

    for (const child of node.children) {
      converted.children.push(await convert(child));
    }
    return converted;
  };

  const root = await convert(raw.root);

  const document: UIRDocument = UIRDocumentSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    page: context.page,
    breakpoint: context.breakpoint,
    viewport: { width: raw.viewport.width, height: raw.viewport.height, dpr: 1 },
    fonts: raw.fonts,
    root,
    capture: context.capture,
  } satisfies UIRDocument);

  return { document, stats: { nodes, fallbacks, images, missingAssets } };
}

/**
 * 결정론 검사용 정규화.
 *
 * `capture` 는 실행 시각·세션 ID 를 담고 있어 매번 달라진다.
 * 그 부분만 제외하고 비교해야 "같은 커밋이면 같은 UIR" 을 확인할 수 있다.
 */
export function stableJson(document: UIRDocument): string {
  const { capture: _capture, ...rest } = document;
  return JSON.stringify(rest);
}
