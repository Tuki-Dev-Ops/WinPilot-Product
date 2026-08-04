import { walk, type UIRDocument } from '@winpilot/uir';
import { Bitmap, type Rgba8 } from './image';

export type PixelBox = { x0: number; y0: number; x1: number; y1: number };

export type LineRegion = {
  nodeId: string;
  cid?: string;
  text: string;
  box: PixelBox;
  /** 글자 색 (UIR 런에서 가져온다) */
  fg: Rgba8;
  /** 배경 색 (baseline 의 해당 영역 최빈값으로 추정) */
  bg: Rgba8;
};

export type LineMetrics = {
  /** 잉크 커버리지 합 — 색·굵기 이상을 잡는다 */
  coverage: number;
  /** 잉크 무게중심 — 글자 밀림·폰트 대체를 잡는다 */
  centroidX: number;
  centroidY: number;
  /** 잉크 바운딩박스 — 줄바꿈·자간 이상을 잡는다 */
  bounds: PixelBox | null;
};

function clampBox(box: PixelBox, width: number, height: number): PixelBox {
  return {
    x0: Math.max(0, Math.min(width, box.x0)),
    y0: Math.max(0, Math.min(height, box.y0)),
    x1: Math.max(0, Math.min(width, box.x1)),
    y1: Math.max(0, Math.min(height, box.y1)),
  };
}

/** 영역의 최빈 색. 텍스트가 얹힌 바탕색을 추정한다. */
function modalColor(bitmap: Bitmap, box: PixelBox): Rgba8 {
  const counts = new Map<number, number>();
  for (let y = box.y0; y < box.y1; y += 1) {
    for (let x = box.x0; x < box.x1; x += 1) {
      const i = bitmap.index(x, y);
      const key =
        ((bitmap.data[i] ?? 0) << 24) |
        ((bitmap.data[i + 1] ?? 0) << 16) |
        ((bitmap.data[i + 2] ?? 0) << 8) |
        (bitmap.data[i + 3] ?? 0);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  let bestKey = 0;
  let bestCount = -1;
  for (const [key, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      bestKey = key;
    }
  }

  return {
    r: (bestKey >>> 24) & 0xff,
    g: (bestKey >>> 16) & 0xff,
    b: (bestKey >>> 8) & 0xff,
    a: bestKey & 0xff,
  };
}

/**
 * UIR 의 텍스트 줄 박스를 픽셀 영역으로 바꾼다.
 *
 * 글리프 위·아래로 1px 여유를 준다 — 줄 박스는 폰트 메트릭 기준이라
 * 실제 잉크가 살짝 벗어나는 경우가 있다.
 */
export function collectLineRegions(document: UIRDocument, baseline: Bitmap): LineRegion[] {
  const regions: LineRegion[] = [];

  for (const node of walk(document.root)) {
    const spec = node.text;
    if (!spec) continue;

    const first = spec.runs[0];
    if (!first) continue;

    const fg: Rgba8 = {
      r: Math.round(first.fill.r * 255),
      g: Math.round(first.fill.g * 255),
      b: Math.round(first.fill.b * 255),
      a: Math.round(first.fill.a * 255),
    };

    for (const line of spec.lineBoxes) {
      const box = clampBox(
        {
          x0: Math.floor(line.x) - 1,
          y0: Math.floor(line.y) - 1,
          x1: Math.ceil(line.x + line.w) + 1,
          y1: Math.ceil(line.y + line.h) + 1,
        },
        baseline.width,
        baseline.height,
      );
      if (box.x1 <= box.x0 || box.y1 <= box.y0) continue;

      const region: LineRegion = {
        nodeId: node.id,
        text: spec.characters,
        box,
        fg,
        bg: modalColor(baseline, box),
      };
      if (node.cid) region.cid = node.cid;
      regions.push(region);
    }
  }

  return regions;
}

/**
 * 픽셀의 잉크 커버리지 추정치 (0–1).
 *
 * 배경색 → 글자색 벡터에 픽셀을 정사영한다. 안티에일리어싱된 경계 픽셀은
 * 그 사이 어딘가에 놓이므로 부분 커버리지로 잡힌다.
 */
export function inkCoverage(bitmap: Bitmap, x: number, y: number, fg: Rgba8, bg: Rgba8): number {
  const dr = fg.r - bg.r;
  const dg = fg.g - bg.g;
  const db = fg.b - bg.b;
  const denominator = dr * dr + dg * dg + db * db;
  if (denominator < 1) return 0;

  const i = bitmap.index(x, y);
  const pr = (bitmap.data[i] ?? 0) - bg.r;
  const pg = (bitmap.data[i + 1] ?? 0) - bg.g;
  const pb = (bitmap.data[i + 2] ?? 0) - bg.b;

  const projected = (pr * dr + pg * dg + pb * db) / denominator;
  return Math.min(1, Math.max(0, projected));
}

export function measureLine(bitmap: Bitmap, region: LineRegion): LineMetrics {
  let total = 0;
  let sumX = 0;
  let sumY = 0;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;

  for (let y = region.box.y0; y < region.box.y1; y += 1) {
    for (let x = region.box.x0; x < region.box.x1; x += 1) {
      const coverage = inkCoverage(bitmap, x, y, region.fg, region.bg);
      if (coverage <= 0) continue;
      total += coverage;
      sumX += coverage * (x + 0.5);
      sumY += coverage * (y + 0.5);
      if (coverage > 0.5) {
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x + 1);
        y1 = Math.max(y1, y + 1);
      }
    }
  }

  return {
    coverage: total,
    centroidX: total > 0 ? sumX / total : 0,
    centroidY: total > 0 ? sumY / total : 0,
    bounds: Number.isFinite(x0) ? { x0, y0, x1, y1 } : null,
  };
}

/**
 * AA 허용 마스크 — 잉크 픽셀을 `dilation` 만큼 팽창시킨 영역.
 * **이 밖에서 diff 가 1픽셀이라도 나면 실패다.**
 */
export function buildAaMask(baseline: Bitmap, regions: LineRegion[], dilation: number): Uint8Array {
  const mask = new Uint8Array(baseline.width * baseline.height);

  for (const region of regions) {
    for (let y = region.box.y0; y < region.box.y1; y += 1) {
      for (let x = region.box.x0; x < region.box.x1; x += 1) {
        if (inkCoverage(baseline, x, y, region.fg, region.bg) > 0.02) {
          mask[y * baseline.width + x] = 1;
        }
      }
    }
  }

  if (dilation <= 0) return mask;

  const dilated = new Uint8Array(mask);
  for (let y = 0; y < baseline.height; y += 1) {
    for (let x = 0; x < baseline.width; x += 1) {
      if (mask[y * baseline.width + x] !== 1) continue;
      for (let dy = -dilation; dy <= dilation; dy += 1) {
        for (let dx = -dilation; dx <= dilation; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= baseline.width || ny >= baseline.height) continue;
          dilated[ny * baseline.width + nx] = 1;
        }
      }
    }
  }
  return dilated;
}
