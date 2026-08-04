import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const HERE = dirname(fileURLToPath(import.meta.url));
const watch = process.argv.includes('--watch');

mkdirSync(resolve(HERE, 'dist'), { recursive: true });

const options = {
  entryPoints: [resolve(HERE, 'src/code.ts')],
  outfile: resolve(HERE, 'dist/code.js'),
  bundle: true,
  format: 'iife',
  // Figma 플러그인 샌드박스(QuickJS 기반)는 최신 문법을 전부 지원하지 않는다.
  target: 'es2017',
  logLevel: 'info',
};

copyFileSync(resolve(HERE, 'src/ui.html'), resolve(HERE, 'dist/ui.html'));

if (watch) {
  const context = await esbuild.context(options);
  await context.watch();
  console.log('[figma-plugin] watch 중 — Figma 에서 플러그인을 다시 실행하면 반영됩니다');
} else {
  await esbuild.build(options);
  console.log('[figma-plugin] 빌드 완료 → dist/code.js, dist/ui.html');
}
