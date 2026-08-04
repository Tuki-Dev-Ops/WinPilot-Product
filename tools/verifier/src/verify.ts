import {
  ALLOWED_NON_TEXT_DIFF_PIXELS,
  PIXEL_TOLERANCE,
  nativeCoverage,
  type UIRDocument,
} from '@winpilot/uir';
import { attributeClusters, diffImages, type DiffResult } from './diff';
import type { Bitmap } from './image';
import { buildAaMask, collectLineRegions, measureLine, type LineRegion } from './mask';

export type LineViolation = {
  nodeId: string;
  cid?: string;
  text: string;
  metric: 'coverage' | 'centroidX' | 'centroidY' | 'bounds';
  delta: number;
  limit: number;
};

export type VerifyResult = {
  pass: boolean;
  failures: string[];
  dimensions: { baseline: string; actual: string; match: boolean };
  diff: DiffResult | null;
  regions: LineRegion[];
  lineViolations: LineViolation[];
  linesChecked: number;
  maxCentroidDelta: number;
  coverage: { total: number; native: number; ratio: number };
};

/**
 * B. 픽셀 검증 — 글리프 안티에일리어싱 잔차만 허용한다.
 *
 * 판정은 두 갈래다.
 *   B-1  AA 허용 마스크 '밖'의 diff 가 0 이어야 한다.  (텍스트 외 전 영역 완전 일치)
 *   B-2  마스크 '안'은 줄 단위 잉크 지표로 "정말 AA 차이일 뿐인지" 를 따진다.
 *
 * B-2 가 이 설계의 핵심이다. 순수한 AA 차이는 경계 픽셀 명암이 양쪽으로 상쇄되어
 * 잉크 무게중심을 거의 움직이지 못하지만, 글자가 1px 밀리거나 폰트가 대체되면
 * 즉시 임계를 넘는다 — 예외가 구멍이 되지 않게 막는 장치다.
 */
export function verifyDocument(document: UIRDocument, baseline: Bitmap, actual: Bitmap): VerifyResult {
  const failures: string[] = [];
  const dimensions = {
    baseline: `${baseline.width}×${baseline.height}`,
    actual: `${actual.width}×${actual.height}`,
    match: baseline.width === actual.width && baseline.height === actual.height,
  };

  const coverage = nativeCoverage(document.root);

  if (!dimensions.match) {
    failures.push(`이미지 크기 불일치 — baseline ${dimensions.baseline} / actual ${dimensions.actual}`);
    return {
      pass: false,
      failures,
      dimensions,
      diff: null,
      regions: [],
      lineViolations: [],
      linesChecked: 0,
      maxCentroidDelta: 0,
      coverage,
    };
  }

  const regions = collectLineRegions(document, baseline);
  const aaMask = buildAaMask(baseline, regions, PIXEL_TOLERANCE.aaMaskDilationPx);
  const diff = diffImages(baseline, actual, aaMask);
  attributeClusters(diff.clusters, document);

  // B-1
  if (diff.outsideMaskDiff > ALLOWED_NON_TEXT_DIFF_PIXELS) {
    failures.push(
      `B-1 텍스트 외 영역 diff ${diff.outsideMaskDiff}px (허용 ${ALLOWED_NON_TEXT_DIFF_PIXELS}) — 군집 ${diff.clusters.length}개`,
    );
  }

  // B-2
  const lineViolations: LineViolation[] = [];
  let maxCentroidDelta = 0;

  for (const region of regions) {
    const before = measureLine(baseline, region);
    const after = measureLine(actual, region);
    if (before.coverage <= 0) continue;

    const record = (metric: LineViolation['metric'], delta: number, limit: number) => {
      if (delta <= limit) return;
      const violation: LineViolation = { nodeId: region.nodeId, text: region.text, metric, delta, limit };
      if (region.cid) violation.cid = region.cid;
      lineViolations.push(violation);
    };

    const coverageDelta = Math.abs(after.coverage - before.coverage) / before.coverage;
    record('coverage', coverageDelta, PIXEL_TOLERANCE.inkCoverageRatio);

    const dx = Math.abs(after.centroidX - before.centroidX);
    const dy = Math.abs(after.centroidY - before.centroidY);
    maxCentroidDelta = Math.max(maxCentroidDelta, dx, dy);
    record('centroidX', dx, PIXEL_TOLERANCE.inkCentroidPx);
    record('centroidY', dy, PIXEL_TOLERANCE.inkCentroidPx);

    if (before.bounds && after.bounds) {
      const boundsDelta = Math.max(
        Math.abs(after.bounds.x0 - before.bounds.x0),
        Math.abs(after.bounds.y0 - before.bounds.y0),
        Math.abs(after.bounds.x1 - before.bounds.x1),
        Math.abs(after.bounds.y1 - before.bounds.y1),
      );
      record('bounds', boundsDelta, PIXEL_TOLERANCE.inkBoundsPx);
    } else if (before.bounds !== after.bounds) {
      record('bounds', Infinity, PIXEL_TOLERANCE.inkBoundsPx);
    }
  }

  if (lineViolations.length > 0) {
    failures.push(`B-2 잉크 지표 위반 ${lineViolations.length}건 — 글자가 밀렸거나 폰트가 다릅니다`);
  }

  return {
    pass: failures.length === 0,
    failures,
    dimensions,
    diff,
    regions,
    lineViolations,
    linesChecked: regions.length,
    maxCentroidDelta,
    coverage,
  };
}
