import { NUMERIC_EPSILON, walk, type UIRDocument, type UIRNode } from '@winpilot/uir';
import type { MaterializeContext } from './materialize';
import type { Mismatch } from './types';

/**
 * A. 수치 검증 — 허용오차 0.
 *
 * 만든 노드를 **다시 읽어** UIR 과 대조한다. 스크린샷도 네트워크도 필요 없고,
 * 픽셀을 찍기 전에 실패를 잡으므로 원인 특정이 압도적으로 빠르다.
 *
 * `1e-4` 는 Figma 내부 부동소수 직렬화 오차만 흡수하기 위한 값이다.
 * 추출 단계에서 좌표를 반올림하지 않았으므로 이보다 큰 차이는 전부 진짜 오류다.
 */
export function verifyDocument(
  document: UIRDocument,
  frame: FrameNode,
  context: MaterializeContext,
  limit = 200,
): Mismatch[] {
  const mismatches: Mismatch[] = [];
  const origin = frame.absoluteBoundingBox;
  if (!origin) return mismatches;

  const push = (node: UIRNode, attribute: string, expected: unknown, actual: unknown) => {
    if (mismatches.length >= limit) return;
    const entry: Mismatch = {
      nodeId: node.id,
      attribute,
      expected: String(expected),
      actual: String(actual),
    };
    if (node.cid) entry.cid = node.cid;
    mismatches.push(entry);
  };

  const near = (a: number, b: number) => Math.abs(a - b) <= NUMERIC_EPSILON;

  for (const node of walk(document.root)) {
    if (node.id === document.root.id) continue;

    const created = context.created.get(node.id);
    if (!created) {
      push(node, 'exists', 'node', 'missing');
      continue;
    }

    const box = (created as SceneNode & LayoutMixin).absoluteBoundingBox;
    if (box) {
      const x = box.x - origin.x;
      const y = box.y - origin.y;
      if (!near(x, node.rect.x)) push(node, 'rect.x', node.rect.x, x);
      if (!near(y, node.rect.y)) push(node, 'rect.y', node.rect.y, y);
      if (!near(box.width, node.rect.w)) push(node, 'rect.w', node.rect.w, box.width);
      if (!near(box.height, node.rect.h)) push(node, 'rect.h', node.rect.h, box.height);
    }

    const blend = created as SceneNode & BlendMixin;
    if (typeof blend.opacity === 'number' && !near(blend.opacity, node.opacity)) {
      push(node, 'opacity', node.opacity, blend.opacity);
    }

    const corner = created as SceneNode & Partial<RectangleNode>;
    if (typeof corner.topLeftRadius === 'number') {
      const expected = node.radius;
      if (!near(corner.topLeftRadius ?? 0, expected[0])) push(node, 'radius.tl', expected[0], corner.topLeftRadius);
      if (!near(corner.topRightRadius ?? 0, expected[1])) push(node, 'radius.tr', expected[1], corner.topRightRadius);
      if (!near(corner.bottomRightRadius ?? 0, expected[2]))
        push(node, 'radius.br', expected[2], corner.bottomRightRadius);
      if (!near(corner.bottomLeftRadius ?? 0, expected[3]))
        push(node, 'radius.bl', expected[3], corner.bottomLeftRadius);
    }

    if (node.text && created.type === 'TEXT') {
      const text = created;
      if (text.characters !== node.text.characters) {
        push(node, 'characters', JSON.stringify(node.text.characters), JSON.stringify(text.characters));
      }

      const lineHeight = text.lineHeight;
      if (typeof lineHeight === 'object' && lineHeight.unit === 'PIXELS') {
        if (!near(lineHeight.value, node.text.lineHeightPx)) {
          push(node, 'lineHeight', node.text.lineHeightPx, lineHeight.value);
        }
      } else {
        push(node, 'lineHeight.unit', 'PIXELS', typeof lineHeight === 'object' ? lineHeight.unit : lineHeight);
      }

      const expectedLines = node.text.lineBoxes.length;
      const measuredLines = Math.max(1, Math.round(text.height / node.text.lineHeightPx));
      if (measuredLines !== expectedLines) push(node, 'lineCount', expectedLines, measuredLines);

      const first = node.text.runs[0];
      if (first) {
        const size = text.getRangeFontSize(0, Math.min(1, text.characters.length));
        if (typeof size === 'number' && !near(size, first.fontSizePx)) {
          push(node, 'fontSize', first.fontSizePx, size);
        }
        const font = text.getRangeFontName(0, Math.min(1, text.characters.length));
        if (typeof font === 'object' && (font.family !== first.fontFamily || font.style !== first.fontStyle)) {
          push(node, 'fontName', `${first.fontFamily} ${first.fontStyle}`, `${font.family} ${font.style}`);
        }
      }
    }
  }

  return mismatches;
}
