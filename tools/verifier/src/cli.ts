import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VIEWS, VIEW_META, type ViewId } from '@winpilot/spec';
import { baselineFileName, parseUIRDocument } from '@winpilot/uir';
import { Bitmap } from './image';
import { renderReport, type ReportEntry } from './report';
import { verifyDocument } from './verify';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '../../..');
const ARTIFACTS = resolve(REPO_ROOT, 'artifacts');

function arg(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return fallback;
  return process.argv[index + 1] ?? fallback;
}

function gitCommit(): string {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function main(): void {
  const requested = arg('app', '');
  if (!requested || !VIEWS.includes(requested as ViewId)) {
    throw new Error(`--app 을 지정하세요 — 사용 가능: ${VIEWS.join(', ')}`);
  }
  const app = VIEW_META[requested as ViewId].app;

  const actualDir = resolve(REPO_ROOT, arg('actual', `artifacts/${app}/actual`));
  const outDir = resolve(REPO_ROOT, arg('out', `artifacts/${app}/report`));
  const uirDir = resolve(ARTIFACTS, app, 'uir');

  if (!existsSync(uirDir)) {
    throw new Error(`artifacts/${app}/uir 가 없습니다 — 먼저 pnpm ssot:extract --app ${requested} 를 실행하세요.`);
  }
  if (!existsSync(actualDir)) {
    throw new Error(
      `Figma 출력 폴더가 없습니다: ${actualDir}\n` +
        'Figma 플러그인의 "PNG 내보내기" 로 받은 파일들을 이 폴더에 두세요 (--actual 로 경로 지정 가능).',
    );
  }

  const entries: ReportEntry[] = [];
  let anyFail = false;

  for (const file of readdirSync(uirDir).filter((name) => name.endsWith('.json')).sort()) {
    const document = parseUIRDocument(JSON.parse(readFileSync(join(uirDir, file), 'utf8')));
    const name = baselineFileName(document.page.id, document.breakpoint.id);
    const baselinePath = resolve(ARTIFACTS, app, 'baseline', name);
    const actualPath = join(actualDir, name);
    const label = `${document.page.order}. ${document.page.name} — ${document.breakpoint.label} ${document.breakpoint.width}`;

    if (!existsSync(actualPath)) {
      console.log(`[verify] ${label.padEnd(44)} SKIP — Figma 출력 없음 (${name})`);
      continue;
    }

    const baseline = Bitmap.load(baselinePath);
    const actual = Bitmap.load(actualPath);
    const result = verifyDocument(document, baseline, actual);
    entries.push({ label, result, baseline, actual });

    if (!result.pass) anyFail = true;
    console.log(
      `[verify] ${label.padEnd(44)} ${result.pass ? 'PASS' : 'FAIL'} · ` +
        `마스크밖 ${result.diff?.outsideMaskDiff ?? '-'}px · AA후보 ${result.diff?.insideMaskDiff ?? '-'}px · ` +
        `무게중심 최대 ${result.maxCentroidDelta.toFixed(3)}px`,
    );
    for (const failure of result.failures) console.log(`[verify]     · ${failure}`);
  }

  if (entries.length === 0) {
    throw new Error('비교할 대상이 없습니다 — Figma 플러그인에서 PNG 를 내보낸 뒤 다시 실행하세요.');
  }

  mkdirSync(outDir, { recursive: true });
  const html = renderReport(entries, { generatedAt: new Date().toISOString(), commit: gitCommit() });
  writeFileSync(join(outDir, 'index.html'), html, 'utf8');
  writeFileSync(
    join(outDir, 'report.json'),
    JSON.stringify(
      entries.map((entry) => ({
        label: entry.label,
        pass: entry.result.pass,
        failures: entry.result.failures,
        outsideMaskDiff: entry.result.diff?.outsideMaskDiff ?? null,
        insideMaskDiff: entry.result.diff?.insideMaskDiff ?? null,
        maxCentroidDelta: entry.result.maxCentroidDelta,
        lineViolations: entry.result.lineViolations,
        nativeCoverage: entry.result.coverage,
      })),
      null,
      2,
    ),
    'utf8',
  );

  console.log('');
  console.log(`[verify] 리포트 → artifacts/report/index.html`);
  console.log(`[verify] 판정: ${anyFail ? 'SYNC FAIL' : 'SYNC PASS — 요구사항 1.2 충족'}`);
  if (anyFail) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(`\n[verify] 실패: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
