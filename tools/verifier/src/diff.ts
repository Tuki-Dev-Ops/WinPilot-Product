import { walk, type UIRDocument, type UIRNode } from '@winpilot/uir';
import { Bitmap, samePixel } from './image';
import type { PixelBox } from './mask';

export type DiffCluster = {
  box: PixelBox;
  pixels: number;
  /** 이 영역을 그린 책임 노드 */
  nodeId?: string;
  cid?: string;
  tag?: string;
};

export type DiffResult = {
  totalDiff: number;
  outsideMaskDiff: number;
  insideMaskDiff: number;
  clusters: DiffCluster[];
  heatmap: Bitmap;
};

/**
 * 완전 일치 비교. 임계값을 두지 않는다 — 텍스트 밖은 diff 0 이 기준이고,
 * 텍스트 안의 허용 여부는 마스크와 잉크 지표(§9-B2)가 따로 판정한다.
 */
export function diffImages(baseline: Bitmap, actual: Bitmap, aaMask: Uint8Array, maxClusters = 200): DiffResult {
  const { width, height } = baseline;
  const heatmap = baseline.clone();
  const differing = new Uint8Array(width * height);

  let totalDiff = 0;
  let outsideMaskDiff = 0;
  let insideMaskDiff = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      // 히트맵 바탕은 baseline 을 옅게 깐다.
      const h = heatmap.index(x, y);
      heatmap.data[h] = 255 - Math.round((255 - (heatmap.data[h] ?? 0)) * 0.25);
      heatmap.data[h + 1] = 255 - Math.round((255 - (heatmap.data[h + 1] ?? 0)) * 0.25);
      heatmap.data[h + 2] = 255 - Math.round((255 - (heatmap.data[h + 2] ?? 0)) * 0.25);
      heatmap.data[h + 3] = 255;

      if (samePixel(baseline, actual, x, y)) continue;

      totalDiff += 1;
      const inside = aaMask[y * width + x] === 1;
      if (inside) {
        insideMaskDiff += 1;
        // 마스크 안(허용 후보) = 주황
        heatmap.set(x, y, { r: 255, g: 168, b: 0, a: 255 });
      } else {
        outsideMaskDiff += 1;
        differing[y * width + x] = 1;
        // 마스크 밖(무조건 실패) = 빨강
        heatmap.set(x, y, { r: 255, g: 0, b: 64, a: 255 });
      }
    }
  }

  // 마스크 밖 diff 만 군집화한다 — 원인 노드를 지목해야 하는 것은 이쪽뿐이다.
  const clusters: DiffCluster[] = [];
  const stack: number[] = [];

  for (let y = 0; y < height && clusters.length < maxClusters; y += 1) {
    for (let x = 0; x < width && clusters.length < maxClusters; x += 1) {
      if (differing[y * width + x] !== 1) continue;

      let x0 = x;
      let y0 = y;
      let x1 = x + 1;
      let y1 = y + 1;
      let pixels = 0;

      stack.push(y * width + x);
      differing[y * width + x] = 2;

      while (stack.length > 0) {
        const index = stack.pop();
        if (index === undefined) break;
        const cx = index % width;
        const cy = (index - cx) / width;
        pixels += 1;
        x0 = Math.min(x0, cx);
        y0 = Math.min(y0, cy);
        x1 = Math.max(x1, cx + 1);
        y1 = Math.max(y1, cy + 1);

        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            const nIndex = ny * width + nx;
            if (differing[nIndex] !== 1) continue;
            differing[nIndex] = 2;
            stack.push(nIndex);
          }
        }
      }

      clusters.push({ box: { x0, y0, x1, y1 }, pixels });
    }
  }

  clusters.sort((a, b) => b.pixels - a.pixels);
  return { totalDiff, outsideMaskDiff, insideMaskDiff, clusters, heatmap };
}

/**
 * diff 군집 → UIR 노드 역매핑.
 *
 * 군집 중심을 포함하는 노드 중 **가장 깊은(= 가장 작은) 것**을 원인으로 지목한다.
 * 리포트에서 "어느 뷰의 어느 기능의 어느 요소"까지 짚으려면 이 단계가 필요하다.
 */
export function attributeClusters(clusters: DiffCluster[], document: UIRDocument): void {
  const nodes: UIRNode[] = [];
  for (const node of walk(document.root)) nodes.push(node);

  for (const cluster of clusters) {
    const cx = (cluster.box.x0 + cluster.box.x1) / 2;
    const cy = (cluster.box.y0 + cluster.box.y1) / 2;

    let best: UIRNode | undefined;
    let bestArea = Infinity;
    for (const node of nodes) {
      const { x, y, w, h } = node.rect;
      if (cx < x || cy < y || cx > x + w || cy > y + h) continue;
      const area = w * h;
      if (area < bestArea) {
        bestArea = area;
        best = node;
      }
    }

    if (best) {
      cluster.nodeId = best.id;
      cluster.tag = best.tag;
      if (best.cid) cluster.cid = best.cid;
    }
  }
}
