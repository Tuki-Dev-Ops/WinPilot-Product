import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { PNG } from 'pngjs';
import type { Rect } from '@winpilot/uir';

/** 콘텐츠 해시로 자산을 저장한다. 같은 바이트는 한 번만 쓰인다 → 재실행 시 결과가 동일하다. */
export class AssetStore {
  private readonly dir: string;
  private readonly seen = new Set<string>();

  constructor(dir: string) {
    this.dir = dir;
    mkdirSync(dir, { recursive: true });
  }

  save(buffer: Buffer, extension: string): string {
    const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 32);
    const file = join(this.dir, `${hash}${extension}`);
    if (!this.seen.has(hash) && !existsSync(file)) {
      writeFileSync(file, buffer);
    }
    this.seen.add(hash);
    return hash;
  }

  get count(): number {
    return this.seen.size;
  }
}

export function extensionFor(url: string): string {
  const clean = url.split('?')[0] ?? url;
  const ext = extname(clean).toLowerCase();
  return /^\.(png|jpe?g|webp|avif|gif|svg)$/.test(ext) ? ext : '.bin';
}

export type CropResult = {
  buffer: Buffer;
  /** 실제로 잘라낸 정수 픽셀 영역. 폴백 노드의 rect 는 이 값으로 스냅된다. */
  rect: Rect;
};

/**
 * baseline PNG 에서 영역을 잘라낸다.
 *
 * 폴백 래스터를 **baseline 과 같은 버퍼에서** 잘라내는 것이 핵심이다.
 * 따로 스크린샷을 찍으면 래스터라이저 상태 차이로 1픽셀이 어긋날 수 있는데,
 * 같은 픽셀을 재사용하면 그 영역의 diff 가 정의상 0 이 된다.
 */
export function cropFromPng(source: PNG, rect: Rect): CropResult | null {
  const x = Math.max(0, Math.floor(rect.x));
  const y = Math.max(0, Math.floor(rect.y));
  const right = Math.min(source.width, Math.ceil(rect.x + rect.w));
  const bottom = Math.min(source.height, Math.ceil(rect.y + rect.h));
  const width = right - x;
  const height = bottom - y;
  if (width <= 0 || height <= 0) return null;

  const target = new PNG({ width, height });
  PNG.bitblt(source, target, x, y, width, height, 0, 0);

  return {
    buffer: PNG.sync.write(target),
    rect: { x, y, w: width, h: height },
  };
}

export function decodePng(buffer: Buffer): PNG {
  return PNG.sync.read(buffer);
}
