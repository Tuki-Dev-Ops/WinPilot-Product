import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PIXEL_TOLERANCE, baselineFileName, parseUIRDocument, type UIRDocument } from '@winpilot/uir';
import { Bitmap } from './image';
import { collectLineRegions, inkCoverage } from './mask';
import { verifyDocument } from './verify';

/**
 * 판정기 자기검증.
 *
 * Figma 출력이 없어도 **판정 로직 자체는 검증할 수 있다.**
 * 실제 baseline 과 UIR 을 가져다 의도적으로 변형한 뒤, 판정기가 옳게 반응하는지 본다.
 * 통과만 하는 검사기는 검사기가 아니므로, "허용해야 할 것"과 "잡아야 할 것"을 모두 넣는다.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '../../..');
const ARTIFACTS = resolve(REPO_ROOT, 'artifacts');

type Scenario = {
  name: string;
  description: string;
  expectPass: boolean;
  build: (baseline: Bitmap, document: UIRDocument) => Bitmap;
};

/** 이미지를 오른쪽으로 1px 민다 — 글자가 밀린 상황. */
function shiftRight(baseline: Bitmap): Bitmap {
  const shifted = baseline.clone();
  for (let y = 0; y < baseline.height; y += 1) {
    for (let x = baseline.width - 1; x >= 0; x -= 1) {
      shifted.set(x, y, x === 0 ? baseline.at(0, y) : baseline.at(x - 1, y));
    }
  }
  return shifted;
}

/**
 * 글리프 경계 픽셀만 흔든다 — 서로 다른 래스터라이저가 만들어내는 AA 차이의 모사.
 * 부호를 번갈아 주어 잉크 무게중심이 한쪽으로 쏠리지 않게 한다(실제 AA 차이의 성질).
 */
function jitterAntiAliasing(baseline: Bitmap, document: UIRDocument, amount: number): Bitmap {
  const jittered = baseline.clone();
  const regions = collectLineRegions(document, baseline);

  for (const region of regions) {
    for (let y = region.box.y0; y < region.box.y1; y += 1) {
      for (let x = region.box.x0; x < region.box.x1; x += 1) {
        const coverage = inkCoverage(baseline, x, y, region.fg, region.bg);
        if (coverage <= 0.05 || coverage >= 0.95) continue;
        const sign = (x + y) % 2 === 0 ? 1 : -1;
        const pixel = baseline.at(x, y);
        jittered.set(x, y, {
          r: Math.min(255, Math.max(0, pixel.r + sign * amount)),
          g: Math.min(255, Math.max(0, pixel.g + sign * amount)),
          b: Math.min(255, Math.max(0, pixel.b + sign * amount)),
          a: pixel.a,
        });
      }
    }
  }
  return jittered;
}

/** 텍스트가 아닌 곳의 픽셀 하나만 바꾼다 — 마스크 밖 diff 는 1픽셀도 허용하지 않는다. */
function pokeNonTextPixel(baseline: Bitmap, document: UIRDocument): Bitmap {
  const poked = baseline.clone();
  const regions = collectLineRegions(document, baseline);
  const inRegion = (x: number, y: number) =>
    regions.some((r) => x >= r.box.x0 - 2 && x < r.box.x1 + 2 && y >= r.box.y0 - 2 && y < r.box.y1 + 2);

  for (let y = 0; y < baseline.height; y += 1) {
    for (let x = 0; x < baseline.width; x += 1) {
      if (inRegion(x, y)) continue;
      const pixel = baseline.at(x, y);
      poked.set(x, y, { r: 255 - pixel.r, g: 255 - pixel.g, b: 255 - pixel.b, a: pixel.a });
      return poked;
    }
  }
  return poked;
}

/** 서브픽셀 이동 — 이웃 픽셀과 섞어 0.5px 밀린 상황을 만든다. */
function shiftHalfPixel(baseline: Bitmap): Bitmap {
  const shifted = baseline.clone();
  for (let y = 0; y < baseline.height; y += 1) {
    for (let x = baseline.width - 1; x >= 1; x -= 1) {
      const here = baseline.at(x, y);
      const left = baseline.at(x - 1, y);
      shifted.set(x, y, {
        r: Math.round((here.r + left.r) / 2),
        g: Math.round((here.g + left.g) / 2),
        b: Math.round((here.b + left.b) / 2),
        a: Math.round((here.a + left.a) / 2),
      });
    }
  }
  return shifted;
}

const SCENARIOS: Scenario[] = [
  {
    name: '동일',
    description: 'actual = baseline. 아무 차이도 없어야 한다.',
    expectPass: true,
    build: (baseline) => baseline.clone(),
  },
  {
    name: 'AA 잔차만',
    description: `글리프 경계 픽셀만 ±6 흔듦. 허용되어야 한다.`,
    expectPass: true,
    build: (baseline, document) => jitterAntiAliasing(baseline, document, 6),
  },
  {
    name: 'AA 잔차 (약)',
    description: '글리프 경계 픽셀만 ±3 흔듦. 허용되어야 한다.',
    expectPass: true,
    build: (baseline, document) => jitterAntiAliasing(baseline, document, 3),
  },
  {
    name: '글자 흐려짐',
    description: '글자 픽셀을 배경 쪽으로 30% 이동 — 색·굵기 이상. 커버리지 지표가 잡아야 한다.',
    expectPass: false,
    build: (baseline, document) => {
      const faded = baseline.clone();
      for (const region of collectLineRegions(document, baseline)) {
        for (let y = region.box.y0; y < region.box.y1; y += 1) {
          for (let x = region.box.x0; x < region.box.x1; x += 1) {
            if (inkCoverage(baseline, x, y, region.fg, region.bg) <= 0.05) continue;
            const pixel = baseline.at(x, y);
            faded.set(x, y, {
              r: Math.round(pixel.r * 0.7 + region.bg.r * 0.3),
              g: Math.round(pixel.g * 0.7 + region.bg.g * 0.3),
              b: Math.round(pixel.b * 0.7 + region.bg.b * 0.3),
              a: pixel.a,
            });
          }
        }
      }
      return faded;
    },
  },
  {
    name: '0.5px 이동',
    description: '서브픽셀 이동. 임계를 느슨하게 잡아도 이건 잡혀야 한다.',
    expectPass: false,
    build: (baseline) => shiftHalfPixel(baseline),
  },
  {
    name: '1px 이동',
    description: '전체를 오른쪽으로 1px. 무게중심이 임계를 넘어 반드시 잡혀야 한다.',
    expectPass: false,
    build: (baseline) => shiftRight(baseline),
  },
  {
    name: '텍스트 밖 1픽셀',
    description: '텍스트가 아닌 픽셀 하나만 반전. B-1 이 잡아야 한다.',
    expectPass: false,
    build: (baseline, document) => pokeNonTextPixel(baseline, document),
  },
];

function main(): void {
  const index = process.argv.indexOf('--app');
  const app = index === -1 ? 'b2c-client' : (process.argv[index + 1] ?? 'b2c-client');
  const uirDir = resolve(ARTIFACTS, app, 'uir');
  if (!existsSync(uirDir)) throw new Error(`artifacts/${app}/uir 가 없습니다 — 먼저 추출을 실행하세요.`);

  const files = readdirSync(uirDir).filter((name) => name.endsWith('.json')).sort();
  const target = files[0];
  if (!target) throw new Error('UIR 문서가 없습니다.');

  const document = parseUIRDocument(JSON.parse(readFileSync(join(uirDir, target), 'utf8')));
  const baselinePath = resolve(ARTIFACTS, app, 'baseline', baselineFileName(document.page.id, document.breakpoint.id));
  const baseline = Bitmap.load(baselinePath);

  console.log(`판정기 자기검증 — ${target}  (${baseline.width}×${baseline.height})`);
  console.log(
    `임계: 마스크밖 diff 0 · 무게중심 ${PIXEL_TOLERANCE.inkCentroidPx}px · ` +
      `커버리지 ${PIXEL_TOLERANCE.inkCoverageRatio * 100}% · 바운즈 ${PIXEL_TOLERANCE.inkBoundsPx}px`,
  );
  console.log('');

  let failed = 0;
  for (const scenario of SCENARIOS) {
    const actual = scenario.build(baseline, document);
    const result = verifyDocument(document, baseline, actual);
    const ok = result.pass === scenario.expectPass;
    if (!ok) failed += 1;

    console.log(
      `${ok ? '  OK  ' : ' FAIL '} ${scenario.name.padEnd(16)} ` +
        `기대 ${scenario.expectPass ? 'PASS' : 'FAIL'} / 실제 ${result.pass ? 'PASS' : 'FAIL'}  ` +
        `마스크밖 ${result.diff?.outsideMaskDiff ?? '-'}px · AA후보 ${result.diff?.insideMaskDiff ?? '-'}px · ` +
        `무게중심 최대 ${result.maxCentroidDelta.toFixed(4)}px · 위반 ${result.lineViolations.length}건`,
    );
    const byMetric = new Map<string, { count: number; max: number }>();
    for (const violation of result.lineViolations) {
      const entry = byMetric.get(violation.metric) ?? { count: 0, max: 0 };
      entry.count += 1;
      entry.max = Math.max(entry.max, violation.delta === Infinity ? 999 : violation.delta);
      byMetric.set(violation.metric, entry);
    }
    const breakdown =
      byMetric.size > 0
        ? Array.from(byMetric).map(([metric, entry]) => `${metric} ${entry.count}건(최대 ${entry.max.toFixed(4)})`).join(' · ')
        : '없음';

    console.log(`       ${scenario.description}`);
    console.log(`       위반 내역: ${breakdown}`);
  }

  console.log('');
  console.log(
    failed === 0
      ? `자기검증 통과 — ${SCENARIOS.length}/${SCENARIOS.length}`
      : `자기검증 실패 — ${failed}/${SCENARIOS.length} 시나리오가 기대와 다름`,
  );
  if (failed > 0) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(`\n[selftest] 실패: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
