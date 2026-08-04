import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { snapshotTheme } from './browser';
import { readOwnedTokenNames } from './classify';
import { buildDtcg } from './dtcg';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '../../..');

function arg(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return fallback;
  return process.argv[index + 1] ?? fallback;
}

async function main(): Promise<void> {
  const url = arg('url', 'http://localhost:3300/');
  const outPath = resolve(REPO_ROOT, arg('out', 'artifacts/tokens/tokens.json'));
  // 토큰은 앱이 아니라 공유 패키지가 소유한다 — 어느 앱을 읽어도 값은 같다.
  const cssPath = resolve(REPO_ROOT, 'packages/tokens/theme.css');

  console.log(`[tokens] 소스        ${url}`);
  console.log(`[tokens] 소유권 기준 ${cssPath.slice(REPO_ROOT.length + 1)}`);

  const [light, dark] = await Promise.all([snapshotTheme(url, 'light'), snapshotTheme(url, 'dark')]);

  const lightKeys = new Set(Object.keys(light.vars));
  const darkKeys = new Set(Object.keys(dark.vars));
  const asymmetric = [...lightKeys].filter((k) => !darkKeys.has(k)).concat([...darkKeys].filter((k) => !lightKeys.has(k)));
  if (asymmetric.length > 0) {
    console.warn(`[tokens] 경고: 라이트/다크에서 변수 집합이 다릅니다 → ${asymmetric.join(', ')}`);
  }

  const owned = readOwnedTokenNames(cssPath);
  const { document, stats } = buildDtcg(light, dark, owned, url);

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');

  console.log('');
  console.log(`[tokens] 토큰 ${stats.total}개 → ${outPath.slice(REPO_ROOT.length + 1)}`);
  console.log(`[tokens]   그룹별      ${Object.entries(stats.byGroup).map(([g, n]) => `${g}:${n}`).join('  ')}`);
  console.log(`[tokens]   출처        project:${stats.bySource.project}  tailwind-default:${stats.bySource['tailwind-default']}`);
  console.log(`[tokens]   모드 의존   ${stats.modeDependent}개 (라이트/다크 값이 다름)`);

  if (stats.skipped.length > 0) {
    console.log(`[tokens]   해석 실패   ${stats.skipped.length}개`);
    for (const item of stats.skipped) console.log(`[tokens]     · ${item}`);
  }

  if (stats.total === 0) {
    throw new Error('토큰이 하나도 추출되지 않았습니다 — 분류 규칙 또는 소스 URL 을 확인하세요.');
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n[tokens] 실패: ${message}`);
  if (/ECONNREFUSED|net::ERR|응답 실패/.test(message)) {
    console.error('[tokens] 개발 서버가 떠 있어야 합니다 →  pnpm dev   (기본 http://localhost:3300)');
  }
  process.exitCode = 1;
});
