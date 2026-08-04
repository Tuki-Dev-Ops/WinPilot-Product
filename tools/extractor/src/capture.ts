import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { EXTRACT_SCRIPT } from './page-script';
import type { RawDocument } from './types';

/**
 * 캡처 뷰포트 높이는 **900px 고정**이다.
 *
 * 스크롤 위치가 0 이면 `getBoundingClientRect()` 의 좌표가 곧 문서 좌표이므로,
 * 기하 측정을 위해 뷰포트를 늘릴 필요가 없다. 대신 `100vh` 같은 뷰포트 상대 단위가
 * 실행마다 달라지지 않도록 높이를 못 박는다.
 */
export const CAPTURE_VIEWPORT_HEIGHT = 900;

/** 렌더 결과를 실행마다 흔들리게 만드는 요소를 전부 죽인다. */
const DETERMINISM_CSS = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    animation-duration: 0s !important;
    transition-duration: 0s !important;
    caret-color: transparent !important;
  }
  html { scroll-behavior: auto !important; }
  ::-webkit-scrollbar { display: none !important; }
  html { scrollbar-width: none !important; }
`;

export type PageCapture = {
  raw: RawDocument;
  /** 전체 페이지 PNG. baseline 이자 폴백 크롭의 원본이다. */
  screenshot: Buffer;
  fetchAsset: (url: string) => Promise<Buffer | null>;
  dispose: () => Promise<void>;
};

export async function launchBrowser(): Promise<Browser> {
  return chromium.launch();
}

async function prepareContext(browser: Browser, width: number, colorScheme: 'light' | 'dark'): Promise<BrowserContext> {
  const context = await browser.newContext({
    viewport: { width, height: CAPTURE_VIEWPORT_HEIGHT },
    deviceScaleFactor: 1,
    colorScheme,
    reducedMotion: 'reduce',
    // 캡처 결과가 로케일·타임존에 흔들리지 않도록 고정한다.
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  });

  await context.addInitScript(() => {
    const scope = globalThis as unknown as Record<string, unknown>;
    // tsx(esbuild) 의 keepNames 헬퍼 — page.evaluate 직렬화 시 필요하다.
    scope['__name'] ??= (fn: unknown) => fn;

    // 난수는 고정 시드로 대체한다. 같은 커밋이면 같은 픽셀이 나와야 한다.
    let seed = 0x2f6e2b1;
    Math.random = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
  });

  return context;
}

async function settle(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready);

  // 지연 로딩을 깨우기 위해 끝까지 훑고 맨 위로 돌아온다.
  await page.evaluate(async () => {
    const step = Math.max(window.innerHeight, 400);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    }
    window.scrollTo(0, 0);
  });

  await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.images)
        .filter((image) => !image.complete)
        .map((image) => image.decode().catch(() => undefined)),
    );
  });

  await page.evaluate(() => document.fonts.ready);

  // 레이아웃이 가라앉을 때까지 두 프레임 기다린다.
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)));
      }),
  );

  const scrollY = await page.evaluate(() => window.scrollY);
  if (scrollY !== 0) {
    throw new Error(`캡처 직전 스크롤 위치가 0 이 아님 (${scrollY}) — 문서 좌표계가 어긋난다`);
  }
}

export async function capturePage(
  browser: Browser,
  url: string,
  width: number,
  colorScheme: 'light' | 'dark' = 'light',
): Promise<PageCapture> {
  const context = await prepareContext(browser, width, colorScheme);
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => consoleErrors.push(String(error)));

  const response = await page.goto(url, { waitUntil: 'networkidle' });
  if (!response || !response.ok()) {
    await context.close();
    throw new Error(`${url} 응답 실패 (status ${response?.status() ?? 'none'})`);
  }

  await page.addStyleTag({ content: DETERMINISM_CSS });
  await settle(page);

  const raw = (await page.evaluate(EXTRACT_SCRIPT)) as RawDocument;
  const screenshot = await page.screenshot({ fullPage: true, animations: 'disabled' });

  if (consoleErrors.length > 0) {
    raw.diagnostics.notes.push(...consoleErrors.map((error) => `페이지 예외: ${error}`));
  }

  return {
    raw,
    screenshot,
    fetchAsset: async (assetUrl: string) => {
      try {
        const assetResponse = await context.request.get(assetUrl);
        if (!assetResponse.ok()) return null;
        return await assetResponse.body();
      } catch {
        return null;
      }
    },
    dispose: () => context.close(),
  };
}
