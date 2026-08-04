import type {
  Effect as UirEffect,
  Paint as UirPaint,
  Rect,
  Rgba,
  StrokeSpec,
  UIRDocument,
  UIRNode,
} from '@winpilot/uir';
import { base64ToBytes } from './base64';
import type { FigmaBundle } from './types';

export type MaterializeContext = {
  images: Map<string, string>;
  warnings: string[];
  created: Map<string, SceneNode>;
  counts: { nodes: number; text: number; fallback: number; lineCountMismatch: number };
};

export function createContext(): MaterializeContext {
  return {
    images: new Map(),
    warnings: [],
    created: new Map(),
    counts: { nodes: 0, text: 0, fallback: 0, lineCountMismatch: 0 },
  };
}

// ── 폰트 ────────────────────────────────────────────────────────────────

function fontKey(font: FontName): string {
  return `${font.family}|${font.style}`;
}

export function collectFonts(bundle: FigmaBundle): FontName[] {
  const fonts = new Map<string, FontName>();
  const add = (family: string, style: string) => {
    const font = { family, style };
    fonts.set(fontKey(font), font);
  };

  for (const document of bundle.documents) {
    for (const font of document.fonts) add(font.family, font.style);
    const stack: UIRNode[] = [document.root];
    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) continue;
      if (node.text) {
        for (const run of node.text.runs) add(run.fontFamily, run.fontStyle);
      }
      for (const child of node.children) stack.push(child);
    }
  }

  return Array.from(fonts.values());
}

/**
 * 필요한 폰트를 전부 미리 읽는다.
 *
 * 하나라도 없으면 **생성을 시작하지 않는다.** Figma 가 임의의 폰트로 대체해 버리면
 * 그 순간 전 페이지의 텍스트 기하가 어긋나고, 픽셀 검증은 무의미해진다.
 */
export async function loadFonts(fonts: FontName[]): Promise<{ loaded: FontName[]; missing: FontName[] }> {
  const loaded: FontName[] = [];
  const missing: FontName[] = [];
  for (const font of fonts) {
    try {
      await figma.loadFontAsync(font);
      loaded.push(font);
    } catch {
      missing.push(font);
    }
  }
  return { loaded, missing };
}

// ── 페인트 · 효과 ────────────────────────────────────────────────────────

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function toRGB(color: Rgba): RGB {
  return { r: clamp01(color.r), g: clamp01(color.g), b: clamp01(color.b) };
}

function toPaint(paint: UirPaint, context: MaterializeContext): Paint | null {
  if (paint.type === 'SOLID') {
    return {
      type: 'SOLID',
      color: toRGB(paint.color),
      // UIR 은 알파를 색에 담고, Figma 는 페인트 opacity 로 분리한다.
      opacity: clamp01(paint.color.a * paint.opacity),
      blendMode: paint.blendMode as BlendMode,
      visible: paint.visible,
    };
  }

  if (paint.type === 'IMAGE') {
    const hash = context.images.get(paint.assetHash);
    if (!hash) {
      context.warnings.push(`이미지 자산 누락: ${paint.assetHash}`);
      return null;
    }
    return {
      type: 'IMAGE',
      imageHash: hash,
      scaleMode: paint.scaleMode,
      opacity: clamp01(paint.opacity),
      blendMode: paint.blendMode as BlendMode,
      visible: paint.visible,
    };
  }

  // 그라디언트는 추출기가 폴백 래스터로 강등하므로 여기 도달하지 않는다.
  context.warnings.push(`아직 지원하지 않는 페인트: ${paint.type}`);
  return null;
}

function toEffect(effect: UirEffect): Effect | null {
  if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
    return {
      type: effect.type,
      color: { ...toRGB(effect.color), a: clamp01(effect.color.a) },
      offset: effect.offset,
      radius: effect.radius,
      spread: effect.spread,
      visible: effect.visible,
      blendMode: effect.blendMode as BlendMode,
    };
  }
  return { type: effect.type, radius: effect.radius, visible: effect.visible } as Effect;
}

function applyStroke(target: RectangleNode | FrameNode, stroke: StrokeSpec, context: MaterializeContext): void {
  // 사면 색이 다르면 단일 스트로크로 표현할 수 없다 → 호출자가 4개 사각형으로 분해한다.
  if (stroke.perSideColors) return;

  const paint: SolidPaint = {
    type: 'SOLID',
    color: toRGB(stroke.color),
    opacity: clamp01(stroke.color.a),
    blendMode: 'NORMAL',
    visible: true,
  };
  target.strokes = [paint];
  target.strokeAlign = stroke.align;
  target.strokeTopWeight = stroke.weights.top;
  target.strokeRightWeight = stroke.weights.right;
  target.strokeBottomWeight = stroke.weights.bottom;
  target.strokeLeftWeight = stroke.weights.left;
  if (stroke.dashPattern) target.dashPattern = stroke.dashPattern;
  if (stroke.weights.top === 0 && stroke.weights.right === 0 && stroke.weights.bottom === 0 && stroke.weights.left === 0) {
    context.warnings.push('두께가 0 인 스트로크');
  }
}

/** 사면 색이 다른 테두리를 4개의 사각형으로 분해한다. CSS 상 테두리는 자식보다 아래에 그려진다. */
function buildPerSideBorders(node: UIRNode, stroke: StrokeSpec): RectangleNode[] {
  const [top, right, bottom, left] = stroke.perSideColors ?? [];
  const { w, h } = node.rect;
  const weights = stroke.weights;

  const make = (color: Rgba | undefined, x: number, y: number, width: number, height: number): RectangleNode | null => {
    if (!color || color.a === 0 || width <= 0 || height <= 0) return null;
    const rectangle = figma.createRectangle();
    rectangle.name = 'border';
    rectangle.resize(Math.max(width, 0.01), Math.max(height, 0.01));
    rectangle.x = x;
    rectangle.y = y;
    rectangle.fills = [
      { type: 'SOLID', color: toRGB(color), opacity: clamp01(color.a), blendMode: 'NORMAL', visible: true },
    ];
    return rectangle;
  };

  return [
    make(top, 0, 0, w, weights.top),
    make(bottom, 0, h - weights.bottom, w, weights.bottom),
    make(left, 0, 0, weights.left, h),
    make(right, w - weights.right, 0, weights.right, h),
  ].filter((item): item is RectangleNode => item !== null);
}

// ── 텍스트 ──────────────────────────────────────────────────────────────

function createText(node: UIRNode, context: MaterializeContext): TextNode | null {
  const spec = node.text;
  if (!spec) return null;

  const first = spec.runs[0];
  if (!first) return null;

  const text = figma.createText();
  text.fontName = { family: first.fontFamily, style: first.fontStyle };
  text.characters = spec.characters;

  // 자동 리사이즈는 Figma 나름의 계산을 하므로 끄고, 브라우저가 잰 크기를 그대로 쓴다.
  text.textAutoResize = 'NONE';
  text.textAlignHorizontal = spec.align;
  text.textAlignVertical = spec.verticalAlign;
  text.lineHeight = { unit: 'PIXELS', value: spec.lineHeightPx };
  text.letterSpacing = { unit: 'PIXELS', value: spec.letterSpacingPx };
  text.paragraphSpacing = spec.paragraphSpacingPx;

  const length = spec.characters.length;
  for (const run of spec.runs) {
    const start = Math.max(0, Math.min(run.start, length));
    const end = Math.max(start, Math.min(run.end, length));
    if (end <= start) continue;

    text.setRangeFontName(start, end, { family: run.fontFamily, style: run.fontStyle });
    text.setRangeFontSize(start, end, run.fontSizePx);
    text.setRangeLetterSpacing(start, end, { unit: 'PIXELS', value: run.letterSpacingPx });
    text.setRangeFills(start, end, [
      {
        type: 'SOLID',
        color: toRGB(run.fill),
        opacity: clamp01(run.fill.a),
        blendMode: 'NORMAL',
        visible: true,
      },
    ]);
    text.setRangeTextCase(start, end, run.textCase);
    text.setRangeTextDecoration(start, end, run.decoration);
  }

  text.resize(Math.max(node.rect.w, 0.01), Math.max(node.rect.h, 0.01));

  // 줄 수 검산 — Figma 의 줄바꿈 알고리즘은 브라우저와 다르다.
  // 여기서 어긋나면 그 차이는 AA 잔차가 아니라 구조 붕괴이므로 반드시 잡아야 한다.
  const expectedLines = spec.lineBoxes.length;
  const measuredLines = Math.max(1, Math.round(text.height / spec.lineHeightPx));
  if (measuredLines !== expectedLines) {
    context.counts.lineCountMismatch += 1;
    context.warnings.push(
      `줄 수 불일치 (${node.id}): 브라우저 ${expectedLines}줄 / Figma ${measuredLines}줄 — "${spec.characters.slice(0, 24)}"`,
    );
  }

  return text;
}

// ── 노드 생성 ────────────────────────────────────────────────────────────

function applyCommon(target: SceneNode, node: UIRNode, parentRect: Rect): void {
  const layout = target as SceneNode & LayoutMixin;
  layout.x = node.rect.x - parentRect.x;
  layout.y = node.rect.y - parentRect.y;

  const blend = target as SceneNode & BlendMixin;
  blend.opacity = node.opacity;
  if (node.blendMode !== 'PASS_THROUGH') blend.blendMode = node.blendMode as BlendMode;

  // `visibility: hidden` 은 자리를 차지하되 그려지지 않는다. 이걸 옮기지 않으면 Figma 에서 보인다.
  if (!node.visible) target.visible = false;
}

function applyBox(target: RectangleNode | FrameNode, node: UIRNode, context: MaterializeContext): void {
  const fills: Paint[] = [];
  for (const paint of node.fills) {
    const converted = toPaint(paint, context);
    if (converted) fills.push(converted);
  }
  target.fills = fills;

  target.topLeftRadius = node.radius[0];
  target.topRightRadius = node.radius[1];
  target.bottomRightRadius = node.radius[2];
  target.bottomLeftRadius = node.radius[3];

  const effects: Effect[] = [];
  for (const effect of node.effects) {
    const converted = toEffect(effect);
    if (converted) effects.push(converted);
  }
  target.effects = effects;

  if (node.stroke) applyStroke(target, node.stroke, context);
}

function nodeName(node: UIRNode): string {
  if (node.cid) return `${node.tag} · ${node.cid}`;
  if (node.text) return node.text.characters.slice(0, 24).replace(/\n/g, ' ') || node.tag;
  return node.tag;
}

async function createNode(node: UIRNode, parentRect: Rect, context: MaterializeContext): Promise<SceneNode | null> {
  context.counts.nodes += 1;

  // 1) 폴백 래스터 — baseline PNG 에서 잘라낸 그 픽셀을 그대로 놓는다.
  if (node.fallback) {
    const hash = context.images.get(node.fallback.rasterHash);
    const rectangle = figma.createRectangle();
    rectangle.name = `${node.tag} · fallback(${node.fallback.reason})`;
    rectangle.resize(Math.max(node.rect.w, 0.01), Math.max(node.rect.h, 0.01));
    if (hash) {
      rectangle.fills = [{ type: 'IMAGE', imageHash: hash, scaleMode: 'FILL', opacity: 1, visible: true }];
    } else {
      context.warnings.push(`폴백 래스터 누락: ${node.fallback.rasterHash} (${node.id})`);
      rectangle.fills = [];
    }
    applyCommon(rectangle, node, parentRect);
    context.counts.fallback += 1;
    context.created.set(node.id, rectangle);
    return rectangle;
  }

  // 2) SVG — 플러그인이 파싱하지 않고 Figma 에 그대로 넘긴다.
  if (node.svg) {
    let frame: FrameNode;
    try {
      frame = figma.createNodeFromSvg(node.svg);
    } catch (error) {
      context.warnings.push(`SVG 파싱 실패 (${node.id}): ${String(error)}`);
      return null;
    }
    frame.name = nodeName(node);
    if (frame.width > 0 && node.rect.w > 0) {
      const scale = node.rect.w / frame.width;
      if (Math.abs(scale - 1) > 1e-4) frame.rescale(scale);
      if (Math.abs(frame.height - node.rect.h) > 0.5) {
        context.warnings.push(`SVG 종횡비 불일치 (${node.id}): ${frame.height} vs ${node.rect.h}`);
      }
    }
    applyCommon(frame, node, parentRect);
    context.created.set(node.id, frame);
    return frame;
  }

  // 3) 텍스트
  if (node.text) {
    const text = createText(node, context);
    if (!text) return null;
    text.name = nodeName(node);
    applyCommon(text, node, parentRect);
    context.counts.text += 1;
    context.created.set(node.id, text);
    return text;
  }

  const needsFrame = node.children.length > 0 || node.clip || Boolean(node.stroke?.perSideColors);

  // 4) 자식 없는 박스는 사각형이면 충분하다. 노드 수가 곧 플러그인 실행 시간이다.
  if (!needsFrame) {
    const rectangle = figma.createRectangle();
    rectangle.name = nodeName(node);
    rectangle.resize(Math.max(node.rect.w, 0.01), Math.max(node.rect.h, 0.01));
    applyBox(rectangle, node, context);
    applyCommon(rectangle, node, parentRect);
    context.created.set(node.id, rectangle);
    return rectangle;
  }

  // 5) 컨테이너
  const frame = figma.createFrame();
  frame.name = nodeName(node);
  frame.resize(Math.max(node.rect.w, 0.01), Math.max(node.rect.h, 0.01));
  frame.layoutMode = 'NONE';
  frame.clipsContent = node.clip;
  applyBox(frame, node, context);
  applyCommon(frame, node, parentRect);

  // 사면 이색 테두리는 자식보다 먼저(=아래) 깔린다.
  if (node.stroke?.perSideColors) {
    for (const border of buildPerSideBorders(node, node.stroke)) frame.appendChild(border);
  }

  for (const child of node.children) {
    const created = await createNode(child, node.rect, context);
    if (created) frame.appendChild(created);
  }

  context.created.set(node.id, frame);
  return frame;
}

// ── 문서 → 프레임 ────────────────────────────────────────────────────────

export function registerImages(bundle: FigmaBundle, context: MaterializeContext): void {
  for (const hash of Object.keys(bundle.assets)) {
    const asset = bundle.assets[hash];
    if (!asset) continue;
    try {
      const image = figma.createImage(base64ToBytes(asset.base64));
      context.images.set(hash, image.hash);
    } catch (error) {
      context.warnings.push(`이미지 생성 실패 (${hash}): ${String(error)}`);
    }
  }
}

export async function materializeDocument(
  document: UIRDocument,
  page: PageNode,
  originX: number,
  context: MaterializeContext,
): Promise<FrameNode> {
  const root = document.root;
  const frame = figma.createFrame();
  frame.name = `${document.breakpoint.label} ${document.breakpoint.width}`;
  frame.resize(Math.max(root.rect.w, 1), Math.max(root.rect.h, 1));
  frame.layoutMode = 'NONE';
  frame.clipsContent = true;
  frame.x = originX;
  frame.y = 0;

  const fills: Paint[] = [];
  for (const paint of root.fills) {
    const converted = toPaint(paint, context);
    if (converted) fills.push(converted);
  }
  frame.fills = fills;

  page.appendChild(frame);

  for (const child of root.children) {
    const created = await createNode(child, root.rect, context);
    if (created) frame.appendChild(created);
  }

  return frame;
}
