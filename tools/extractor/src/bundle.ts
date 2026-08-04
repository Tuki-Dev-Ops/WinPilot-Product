import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { walk, type BreakpointSpec, type PageSpec, type UIRDocument } from '@winpilot/uir';

/**
 * Figma 플러그인이 먹는 단일 번들.
 *
 * 플러그인 샌드박스는 로컬 파일 시스템에 접근할 수 없고, 서버를 띄우면 CORS·포트·방화벽이
 * 따라붙는다. 그래서 UIR 문서와 자산(이미지·폴백 래스터)을 **한 파일에 담아** 사용자가
 * 드래그 앤 드롭 한 번으로 넣게 한다.
 */
export type FigmaBundle = {
  bundleVersion: '1.0';
  commit: string;
  generatedAt: string;
  pages: PageSpec[];
  breakpoints: BreakpointSpec[];
  documents: UIRDocument[];
  assets: Record<string, { mimeType: string; base64: string }>;
};

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

function collectAssetHashes(documents: UIRDocument[]): Set<string> {
  const hashes = new Set<string>();
  for (const document of documents) {
    for (const node of walk(document.root)) {
      for (const paint of node.fills) {
        if (paint.type === 'IMAGE') hashes.add(paint.assetHash);
      }
      if (node.fallback) hashes.add(node.fallback.rasterHash);
    }
  }
  return hashes;
}

export function writeFigmaBundle(options: {
  documents: UIRDocument[];
  pages: PageSpec[];
  breakpoints: BreakpointSpec[];
  assetsDir: string;
  outPath: string;
  commit: string;
  generatedAt: string;
}): { bytes: number; assets: number; missing: string[] } {
  const hashes = collectAssetHashes(options.documents);
  const assets: FigmaBundle['assets'] = {};
  const missing: string[] = [];

  const files = existsSync(options.assetsDir) ? readdirSync(options.assetsDir) : [];
  const byHash = new Map(files.map((file) => [file.slice(0, file.length - extname(file).length), file]));

  for (const hash of hashes) {
    const file = byHash.get(hash);
    if (!file) {
      missing.push(hash);
      continue;
    }
    const bytes = readFileSync(join(options.assetsDir, file));
    assets[hash] = {
      mimeType: MIME_BY_EXT[extname(file).toLowerCase()] ?? 'application/octet-stream',
      base64: bytes.toString('base64'),
    };
  }

  const bundle: FigmaBundle = {
    bundleVersion: '1.0',
    commit: options.commit,
    generatedAt: options.generatedAt,
    pages: options.pages,
    breakpoints: options.breakpoints,
    documents: options.documents,
    assets,
  };

  const json = JSON.stringify(bundle);
  mkdirSync(dirname(options.outPath), { recursive: true });
  writeFileSync(options.outPath, json, 'utf8');

  return { bytes: Buffer.byteLength(json), assets: Object.keys(assets).length, missing };
}
