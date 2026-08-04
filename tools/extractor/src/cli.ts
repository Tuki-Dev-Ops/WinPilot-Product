import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { VIEWS, VIEW_META, type ViewId } from '@winpilot/spec';
import {
  baselineFileName,
  findUnregisteredRoutes,
  nativeCoverage,
  uirFileName,
  type BreakpointSpec,
  type PageSpec,
  type UIRDocument,
} from '@winpilot/uir';
import { AssetStore, decodePng } from './assets';
import { buildDocument, stableJson } from './build';
import { writeFigmaBundle } from './bundle';
import { capturePage, launchBrowser } from './capture';
import { discoverRoutes } from './routes';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '../../..');

function arg(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return fallback;
  return process.argv[index + 1] ?? fallback;
}

const flag = (name: string) => process.argv.includes(`--${name}`);

function gitCommit(): string {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

type ManifestModule = {
  pages?: PageSpec[];
  breakpoints?: BreakpointSpec[];
  devOnlyRoutes?: string[];
};

/** 앱(=뷰=레포) 하나를 추출한다. 앱마다 아티팩트도 Figma 번들도 따로 나온다. */
async function extractApp(view: ViewId, options: { commit: string; builtAt: string }): Promise<void> {
  const meta = VIEW_META[view];
  const appRoot = resolve(REPO_ROOT, 'apps', meta.app);
  const artifacts = resolve(REPO_ROOT, 'artifacts', meta.app);
  const baseUrl = arg('url', `http://localhost:${meta.port}`).replace(/\/$/, '');

  const manifest = (await import(pathToFileURL(resolve(appRoot, 'pages.manifest.ts')).href)) as ManifestModule;
  const breakpointsAll = manifest.breakpoints ?? [];
  const onlyBreakpoint = arg('bp', '');
  const breakpoints = onlyBreakpoint ? breakpointsAll.filter((bp) => bp.id === onlyBreakpoint) : breakpointsAll;
  if (breakpoints.length === 0) throw new Error(`${meta.app}: 브레이크포인트가 없습니다`);

  const adhocRoute = arg('adhoc', '');
  let pages: PageSpec[];
  if (adhocRoute) {
    pages = [{ order: 1, id: 'adhoc', name: 'Adhoc', route: adhocRoute }];
    console.log(`[${meta.app}] 애드혹 모드 — ${adhocRoute}`);
  } else {
    pages = manifest.pages ?? [];
    const discovered = discoverRoutes(resolve(appRoot, 'app'));
    const unregistered = findUnregisteredRoutes(discovered, pages, manifest.devOnlyRoutes ?? []);
    if (unregistered.length > 0) {
      console.error(`[${meta.app}] 매니페스트에 없는 라우트: ${unregistered.join(', ')}`);
      if (!flag('allow-unregistered')) {
        throw new Error(`${meta.app}: pages.manifest.ts 에 등록하거나 devOnlyRoutes 에 추가하세요`);
      }
    }
    if (pages.length === 0) {
      console.log(`[${meta.app}] 등록된 페이지가 없습니다.`);
      return;
    }
  }

  const browser = await launchBrowser();
  const assets = new AssetStore(resolve(artifacts, 'assets'));
  const documents: UIRDocument[] = [];
  const verifyDeterminism = flag('verify-determinism');

  try {
    for (const page of pages) {
      for (const breakpoint of breakpoints) {
        // 동적 라우트는 대괄호 그대로는 열 수 없다 — sampleUrl 이 실제 방문 주소다.
        const url = `${baseUrl}${page.sampleUrl ?? page.route}`;
        const label = `${page.id}@${breakpoint.id}`;
        process.stdout.write(`[${meta.app}] ${label.padEnd(22)} ${url} (${breakpoint.width}px) … `);

        const capture = await capturePage(browser, url, breakpoint.width);
        const baseline = decodePng(capture.screenshot);
        const built = await buildDocument(capture.raw, {
          page,
          breakpoint,
          assets,
          baseline,
          fetchAsset: capture.fetchAsset,
          capture: {
            commit: options.commit,
            builtAt: options.builtAt,
            extractorVersion: '0.2.0',
            userAgent: 'chromium',
            sessionId: `${options.commit.slice(0, 8)}-${meta.app}-${label}`,
          },
        });

        const uirPath = resolve(artifacts, 'uir', uirFileName(page.id, breakpoint.id));
        const baselinePath = resolve(artifacts, 'baseline', baselineFileName(page.id, breakpoint.id));
        mkdirSync(dirname(uirPath), { recursive: true });
        mkdirSync(dirname(baselinePath), { recursive: true });
        writeFileSync(uirPath, `${JSON.stringify(built.document, null, 2)}\n`, 'utf8');
        writeFileSync(baselinePath, capture.screenshot);
        documents.push(built.document);

        const coverage = nativeCoverage(built.document.root);
        console.log(
          `노드 ${built.stats.nodes} · 폴백 ${built.stats.fallbacks} · 커버리지 ${(coverage.ratio * 100).toFixed(1)}% · ${capture.raw.viewport.width}×${capture.raw.viewport.height}`,
        );
        for (const note of capture.raw.diagnostics.notes) console.log(`[${meta.app}]   note: ${note}`);

        if (verifyDeterminism) {
          const second = await capturePage(browser, url, breakpoint.width);
          const secondBuilt = await buildDocument(second.raw, {
            page,
            breakpoint,
            assets,
            baseline: decodePng(second.screenshot),
            fetchAsset: second.fetchAsset,
            capture: {
              commit: options.commit,
              builtAt: options.builtAt,
              extractorVersion: '0.2.0',
              userAgent: 'chromium',
              sessionId: 'determinism-check',
            },
          });
          const same = stableJson(built.document) === stableJson(secondBuilt.document);
          console.log(`[${meta.app}]   결정론 검사: ${same ? 'PASS' : 'FAIL — 실행마다 결과가 다름'}`);
          if (!same) process.exitCode = 1;
          await second.dispose();
        }

        await capture.dispose();
      }
    }
  } finally {
    await browser.close();
  }

  const bundle = writeFigmaBundle({
    documents,
    pages,
    breakpoints,
    assetsDir: resolve(artifacts, 'assets'),
    outPath: resolve(artifacts, 'figma', 'bundle.json'),
    commit: options.commit,
    generatedAt: options.builtAt,
  });
  console.log(
    `[${meta.app}] Figma 번들 → artifacts/${meta.app}/figma/bundle.json  (${(bundle.bytes / 1024 / 1024).toFixed(2)} MB · 자산 ${bundle.assets}개)`,
  );
  console.log('');
}

async function main(): Promise<void> {
  const requested = arg('app', '');
  if (requested && !VIEWS.includes(requested as ViewId)) {
    throw new Error(`알 수 없는 앱: '${requested}' — 사용 가능: ${VIEWS.join(', ')}`);
  }
  const targets: ViewId[] = requested ? [requested as ViewId] : [...VIEWS];

  const commit = gitCommit();
  const builtAt = new Date().toISOString();

  for (const view of targets) {
    await extractApp(view, { commit, builtAt });
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n[extract] 실패: ${message}`);
  if (/ECONNREFUSED|net::ERR|응답 실패/.test(message)) {
    console.error('[extract] 해당 앱의 개발 서버가 떠 있어야 합니다 →  pnpm dev:client / pnpm dev:admin');
  }
  process.exitCode = 1;
});
