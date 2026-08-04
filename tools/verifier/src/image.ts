import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';

export type Rgba8 = { r: number; g: number; b: number; a: number };

export class Bitmap {
  readonly width: number;
  readonly height: number;
  readonly data: Buffer;

  constructor(png: PNG) {
    this.width = png.width;
    this.height = png.height;
    this.data = png.data;
  }

  static load(path: string): Bitmap {
    return new Bitmap(PNG.sync.read(readFileSync(path)));
  }

  static from(width: number, height: number, data: Buffer): Bitmap {
    const png = new PNG({ width, height });
    data.copy(png.data);
    return new Bitmap(png);
  }

  clone(): Bitmap {
    return Bitmap.from(this.width, this.height, Buffer.from(this.data));
  }

  index(x: number, y: number): number {
    return (y * this.width + x) << 2;
  }

  at(x: number, y: number): Rgba8 {
    const i = this.index(x, y);
    return { r: this.data[i] ?? 0, g: this.data[i + 1] ?? 0, b: this.data[i + 2] ?? 0, a: this.data[i + 3] ?? 0 };
  }

  set(x: number, y: number, color: Rgba8): void {
    const i = this.index(x, y);
    this.data[i] = color.r;
    this.data[i + 1] = color.g;
    this.data[i + 2] = color.b;
    this.data[i + 3] = color.a;
  }

  toPng(): PNG {
    const png = new PNG({ width: this.width, height: this.height });
    this.data.copy(png.data);
    return png;
  }

  toBuffer(): Buffer {
    return PNG.sync.write(this.toPng());
  }
}

/** 두 픽셀이 완전히 같은가. 픽셀 검증은 임계값 없이 '완전 일치'를 요구한다. */
export function samePixel(a: Bitmap, b: Bitmap, x: number, y: number): boolean {
  const i = a.index(x, y);
  return (
    a.data[i] === b.data[i] &&
    a.data[i + 1] === b.data[i + 1] &&
    a.data[i + 2] === b.data[i + 2] &&
    a.data[i + 3] === b.data[i + 3]
  );
}

export function luminance(color: Rgba8): number {
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}
