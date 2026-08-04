import { chromium } from 'playwright';

export type ColorScheme = 'light' | 'dark';

export type ResolvedColor = {
  /** #rrggbb 또는 알파가 1 미만이면 #rrggbbaa */
  hex: string;
  /** Figma 규약과 동일한 0–1 정규화 RGBA */
  rgba: { r: number; g: number; b: number; a: number };
};

export type ThemeSnapshot = {
  scheme: ColorScheme;
  rootFontSizePx: number;
  /** :root 의 모든 커스텀 프로퍼티 — 브라우저가 계산한 원본 문자열 */
  vars: Record<string, string>;
  /** 그중 유효한 CSS 색인 것만 sRGB 8bit 로 해석한 결과 */
  colors: Record<string, ResolvedColor>;
  /** line-height 로 대입 가능한 값을 브라우저가 계산한 배수 (`calc(2 / 1.5)` → 1.333…) */
  ratios: Record<string, number>;
};

/**
 * 색 변환을 **브라우저에게 시킨다.**
 *
 * Tailwind v4 기본 팔레트는 oklch 로 정의되어 있고 Chromium 은 이를 `lab(...)` 로 계산해 돌려준다.
 * 이런 최신 색 문법(lab / oklch / color-mix / color())을 JS 로 직접 파싱하려 들면 파서를 하나 더
 * 유지해야 하고, 그 파서가 브라우저와 미세하게 다르게 반올림하는 순간 픽셀 검증이 깨진다.
 *
 * 대신 1x1 캔버스에 실제로 칠하고 픽셀을 읽는다. 결과는 정의상 '화면에 칠해지는 바로 그 sRGB 8bit'
 * 이므로 브라우저와 어긋날 수 없고, 우리가 비교하는 baseline PNG 와도 같은 정밀도다.
 */
const READ_THEME = () => {
  const cs = getComputedStyle(document.documentElement);

  const vars: Record<string, string> = {};
  for (let i = 0; i < cs.length; i += 1) {
    const prop = cs[i];
    if (prop && prop.startsWith('--')) {
      vars[prop] = cs.getPropertyValue(prop).trim();
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const colors: Record<string, { hex: string; rgba: { r: number; g: number; b: number; a: number } }> = {};

  if (ctx) {
    for (const [name, value] of Object.entries(vars)) {
      if (!value) continue;

      // 유효성 판정: 서로 다른 두 센티널에 같은 값을 대입해 본다.
      // 유효한 색이면 둘 다 정규화된 동일 문자열이 되고, 무효하면 센티널이 그대로 남아 서로 다르다.
      ctx.fillStyle = '#000000';
      ctx.fillStyle = value;
      const a = ctx.fillStyle;
      ctx.fillStyle = '#ffffff';
      ctx.fillStyle = value;
      const b = ctx.fillStyle;
      if (a !== b) continue;

      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      const [r = 0, g = 0, bl = 0, al = 255] = [d[0], d[1], d[2], d[3]];

      const h = (n: number) => n.toString(16).padStart(2, '0');
      const hex = al === 255 ? `#${h(r)}${h(g)}${h(bl)}` : `#${h(r)}${h(g)}${h(bl)}${h(al)}`;

      colors[name] = { hex, rgba: { r: r / 255, g: g / 255, b: bl / 255, a: al / 255 } };
    }
  }

  // 단위 없는 비율(line-height 등)은 `calc(2 / 1.5)` 처럼 계산식으로 나온다.
  // 계산기를 직접 만들지 않고, font-size 100px 프로브의 line-height 로 대입해 브라우저가 계산하게 한다.
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden;font-size:100px;';
  document.body.appendChild(probe);

  const ratios: Record<string, number> = {};
  for (const [name, value] of Object.entries(vars)) {
    if (!value) continue;

    probe.style.lineHeight = '1';
    probe.style.lineHeight = value;
    const first = getComputedStyle(probe).lineHeight;

    probe.style.lineHeight = '3';
    probe.style.lineHeight = value;
    const second = getComputedStyle(probe).lineHeight;

    // 무효한 값이면 대입이 무시되어 각 센티널(100px / 300px)이 그대로 남는다.
    if (first !== second) continue;

    const px = Number.parseFloat(first);
    if (!Number.isNaN(px)) ratios[name] = px / 100;
  }
  probe.remove();

  return { vars, colors, ratios, rootFontSizePx: Number.parseFloat(cs.fontSize) };
};

export async function snapshotTheme(url: string, scheme: ColorScheme): Promise<ThemeSnapshot> {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      colorScheme: scheme,
      reducedMotion: 'reduce',
    });
    /**
     * tsx(esbuild) 는 `keepNames` 로 이름 붙은 함수를 `__name(fn, '이름')` 으로 감싼다.
     * page.evaluate 는 함수를 소스 문자열로 직렬화해 브라우저에서 실행하므로, 그 헬퍼가
     * 페이지 쪽에 없어 ReferenceError 가 난다. 함수를 그대로 돌려주는 항등 헬퍼만 심어주면 된다.
     * (전역 하나만 추가할 뿐 DOM·레이아웃에는 영향이 없다.)
     */
    await context.addInitScript(() => {
      const scope = globalThis as unknown as Record<string, unknown>;
      scope['__name'] ??= (fn: unknown) => fn;
    });

    const page = await context.newPage();

    const response = await page.goto(url, { waitUntil: 'networkidle' });
    if (!response || !response.ok()) {
      throw new Error(`${url} 응답 실패 (status ${response?.status() ?? 'none'})`);
    }
    await page.evaluate(() => document.fonts.ready);

    const result = await page.evaluate(READ_THEME);
    return { scheme, ...result };
  } finally {
    await browser.close();
  }
}
