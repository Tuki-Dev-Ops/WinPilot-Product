import { chromium, type Page } from 'playwright';
import { pages as b2cClientPages } from '../apps/b2c-client-a/pages.manifest';
import { pages as b2cAdminPages } from '../apps/b2c-admin/pages.manifest';
import { pages as internalPages } from '../apps/internal-admin/pages.manifest';
import { pages as irAdminPages } from '../apps/ir-admin/pages.manifest';
import { pages as irClientPages } from '../apps/ir-client-a/pages.manifest';
import { pages as fnbAdminPages } from '../apps/fnb-admin/pages.manifest';
import { pages as fnbClientPages } from '../apps/fnb-client-a/pages.manifest';

/**
 * 화면 하나가 **실제로 내려받는 바이트**를 재는 검사.
 *
 * ## 왜 코드를 세는 것으로는 부족한가
 * 무게는 파일 크기의 합이 아니다. 번들러가 안 쓰는 것을 털어 내고, 같은 조각을 여러 화면이
 * 나눠 쓰고, `next/image` 는 원본이 아니라 화면 폭에 맞춰 다시 만든 것을 내려보낸다. 그래서
 * `public/` 의 사진이 289KB 라는 사실만으로는 **손님이 289KB 를 받는지** 알 수 없다.
 *
 * 실제로 띄우고 응답 본문의 길이를 더한다. 여기서 나온 수만 사실이다.
 *
 * ## 무엇을 재기로 했나
 * 종류별로 나눠 잰다 — 자바스크립트 · 스타일 · 사진 · 영상. 합계 하나로 두면 **사진이 커진
 * 것과 코드가 커진 것이 같은 수로 섞여**, 그 수가 넘었을 때 어디를 봐야 하는지 알 수 없다.
 *
 * ## 왜 예산이 화면 갈래마다 다른가
 * `/docs/**` 는 그림을 그리는 도구(mermaid)를 함께 내려받는다. 제품 화면과 같은 잣대로 재면
 * 문서 화면은 늘 빨간 줄이고, 그러면 **아무도 이 검사를 보지 않게 된다.** 갈래를 나눠 두면
 * 각자의 잣대에서 넘쳤는지가 보인다.
 *
 * ## 예산은 지금 값에서 뽑았다
 * 좋아 보이는 수를 적어 두지 않았다. 고치기 전 실제로 잰 값에서 **숨 쉴 자리만큼 올려** 잡은
 * 것이다 — 지금 통과하지 못하는 예산은 첫날부터 무시되고, 지금 값보다 훨씬 큰 예산은 무엇이
 * 늘어도 걸리지 않는다.
 *
 * 처음에는 IR 사이트 하나만 재고 잡은 값이었다. 나머지 여섯을 빌드해 같은 방법으로 재 보니
 * **일곱이 다 같은 자리에 모였다.**
 *
 * | 앱 | 가장 무거운 화면 | JS |
 * |---|---|---|
 * | b2c-client-a | `/` | 619KB |
 * | ir-client-a | `/` | 642KB |
 * | ir-admin | `/inquiries/settings` | 612KB |
 * | b2c-admin | `/products/new` | 603KB |
 * | internal-admin | `/settings/staff` | 597KB |
 * | fnb-client-a | `/stores` | 590KB |
 * | fnb-admin | `/menus/sukhoe-whole` | 589KB |
 *
 * 589 에서 642 사이에 일곱이 모두 들어온다. 그 대부분이 React 와 Next 의 실행기라서다 —
 * 앱이 하는 일과 거의 무관하게 깔리는 바닥이고, **우리가 얹은 몫은 50KB 남짓**이다. 예산
 * 700 은 그 바닥에 그만큼의 여유를 더한 값이고, 넘겼다면 새로 들인 라이브러리나 위로 올라간
 * `'use client'` 경계를 보면 된다.
 *
 * 앱마다 예산을 따로 두지 않은 것도 이 때문이다. 값이 갈리지 않는데 일곱 벌로 적어 두면,
 * 하나만 늘려 놓고 잊는 날이 온다.
 *
 * ```
 * pnpm weight:check                     # 일곱 앱 전부
 * pnpm weight:check -- --app=ir-client-a
 * pnpm weight:check -- --app=ir-client-a --port=3404   # 빌드 결과를 재는 자리
 * ```
 *
 * 서버가 떠 있어야 한다. **개발 서버로 재면 수가 크게 나온다** — 개발 빌드는 압축을 하지
 * 않고 새로 고침 도구를 함께 내려보낸다. 예산은 `next build` 결과 기준이므로, 판단은
 * `next start` 로 띄운 뒤에 한다.
 */

type Budget = { js: number; css: number; image: number };

type Target = { app: string; port: number; routes: string[] };

/** KB. 화면 갈래마다 다른 잣대를 쓴다. */
const BUDGET: { product: Budget; docs: Budget } = {
  /*
    제품 화면. 자바스크립트 700 중 570 남짓은 React 와 Next 의 실행기라 **우리가 줄일 수 있는
    자리가 아니다.** 예산이 넘쳤다면 그 130 이 늘어난 것이고, 그때 볼 곳은 새로 들인 라이브러리나
    화면 위로 올라간 `'use client'` 경계다.

    사진 400 은 `next/image` 를 쓴 화면의 값에서 잡았다. 이 수를 넘겼다면 대개 원본을 그대로
    내려보내는 `<img>` 가 하나 섞인 것이다.
  */
  product: { js: 700, css: 120, image: 400 },
  /*
    문서 화면. 그림(mermaid)과 코드 강조기를 함께 받는다. 둘 다 **문서를 여는 사람만** 받는
    조각이라 제품 화면의 예산에는 들지 않는다.
  */
  docs: { js: 1600, css: 120, image: 400 },
};

const TARGETS: Target[] = [
  { app: 'b2c-admin', port: 3301, routes: b2cAdminPages.map((one) => one.sampleUrl ?? one.route) },
  { app: 'internal-admin', port: 3302, routes: internalPages.map((one) => one.sampleUrl ?? one.route) },
  { app: 'ir-admin', port: 3303, routes: irAdminPages.map((one) => one.sampleUrl ?? one.route) },
  { app: 'ir-client-a', port: 3304, routes: irClientPages.map((one) => one.sampleUrl ?? one.route) },
  { app: 'fnb-client-a', port: 3305, routes: fnbClientPages.map((one) => one.sampleUrl ?? one.route) },
  { app: 'fnb-admin', port: 3306, routes: fnbAdminPages.map((one) => one.sampleUrl ?? one.route) },
  { app: 'b2c-client-a', port: 3310, routes: b2cClientPages.map((one) => one.sampleUrl ?? one.route) },
];

type Weight = { js: number; css: number; image: number; media: number };

/**
 * 한 화면이 받은 바이트를 종류별로 더한다.
 *
 * ## `content-length` 를 믿지 않는다
 * 처음에는 응답 머리의 `content-length` 를 더했다. 그런데 개발 서버도 빌드 서버도 대개
 * **조각내어 보내기**(chunked)를 써서 그 머리가 없다 — 모든 화면이 0KB 로 나왔고, 그 0 은
 * 가볍다는 뜻처럼 보였다. 본문을 받아 길이를 재면 그런 일이 없다.
 *
 * ## 영상은 예산에 넣지 않는다
 * 첫 화면의 배경 영상은 한 편이 2MB 를 넘는다. 예산에 넣으면 그 화면 하나 때문에 잣대를
 * 크게 잡아야 하고, 그러면 나머지 화면에서 **무엇이 늘어도 걸리지 않는다.** 대신 함께 적어
 * 두어 눈에는 남게 한다.
 */
async function weigh(page: Page, url: string): Promise<Weight | null> {
  const got: Weight = { js: 0, css: 0, image: 0, media: 0 };

  /*
    본문을 받아 오는 일은 **비동기**다. 처음에는 `void response.body().then(...)` 로 던져 두고
    페이지만 기다렸는데, 그러면 더하기가 끝나기 전에 값을 읽어 **모든 화면이 0KB** 로 나왔다.
    그 0 은 가볍다는 뜻처럼 보여서, 검사가 통과하는 것으로 읽혔다 — 재는 도구가 조용히 틀리는
    것이 가장 나쁘다. 약속을 모아 두고 끝까지 기다린다.
  */
  const pending: Promise<void>[] = [];

  const onResponse = (response: import('playwright').Response) => {
    const kind = response.request().resourceType();
    if (kind !== 'script' && kind !== 'stylesheet' && kind !== 'image' && kind !== 'media') return;

    pending.push(
      response
        .body()
        .then((body) => {
          if (kind === 'script') got.js += body.length;
          else if (kind === 'stylesheet') got.css += body.length;
          else if (kind === 'image') got.image += body.length;
          else got.media += body.length;
        })
        .catch(() => {
          /* 캐시에서 온 응답은 본문을 다시 주지 않는다. 이미 받은 적이 있다는 뜻이라 뺀다. */
        }),
    );
  };

  page.on('response', onResponse);

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    /* 지연 로딩된 사진이 뒤늦게 오는 자리가 있다. 그 몫까지 세어야 화면의 무게가 된다. */
    await page.waitForTimeout(800);
  } catch {
    page.off('response', onResponse);
    return null;
  }

  page.off('response', onResponse);
  await Promise.all(pending);
  return got;
}

const kb = (bytes: number): number => Math.round(bytes / 1024);

/** `/docs` 아래는 문서 화면이다 — 잣대가 다르다. */
const budgetOf = (route: string): Budget => (route.startsWith('/docs') ? BUDGET.docs : BUDGET.product);

async function main(): Promise<void> {
  const only = process.argv.find((one) => one.startsWith('--app='))?.slice('--app='.length);
  const port = process.argv.find((one) => one.startsWith('--port='))?.slice('--port='.length);
  const targets = only ? TARGETS.filter((one) => one.app === only) : TARGETS;

  if (targets.length === 0) {
    console.error(`알 수 없는 앱: ${only}`);
    process.exit(1);
  }

  const browser = await chromium.launch();
  let over = 0;
  let checked = 0;

  for (const target of targets) {
    const at = port ? Number(port) : target.port;
    console.log(`\n[${target.app}] 화면 ${target.routes.length}개 · 포트 ${at}`);

    let worst = { route: '', js: 0 };
    let media = 0;

    for (const route of target.routes) {
      /*
        화면마다 **새 문맥**을 연다. `newPage` 만 새로 열면 문맥이 같아 앞 화면이 받아 둔
        조각이 캐시에서 나오고, 그때 뒤 화면은 자바스크립트 0KB 로 잡힌다 — 실제로는 같은
        것을 받는 화면인데 첫 화면만 무거운 것으로 보인다.
      */
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      const got = await weigh(page, `http://localhost:${at}${route}`);
      await context.close();

      if (!got) {
        console.log(`  ? ${route} — 열지 못함(서버가 떠 있는지 확인)`);
        continue;
      }

      checked += 1;
      media += got.media;
      if (kb(got.js) > worst.js) worst = { route, js: kb(got.js) };

      const budget = budgetOf(route);
      const broke: string[] = [];
      if (kb(got.js) > budget.js) broke.push(`JS ${kb(got.js)}KB > ${budget.js}KB`);
      if (kb(got.css) > budget.css) broke.push(`CSS ${kb(got.css)}KB > ${budget.css}KB`);
      if (kb(got.image) > budget.image) broke.push(`이미지 ${kb(got.image)}KB > ${budget.image}KB`);

      if (broke.length > 0) {
        over += 1;
        console.log(`  ✗ ${route} — ${broke.join(' · ')}`);
      }
    }

    if (worst.route) console.log(`  가장 무거운 화면: ${worst.route} — JS ${worst.js}KB`);
    if (media > 0) console.log(`  영상 합계: ${kb(media)}KB (예산 밖 · 눈에만 남긴다)`);
  }

  await browser.close();

  console.log(`\n검사 ${checked}건 — 예산 넘김 ${over}건`);
  if (over > 0) process.exit(1);
}

void main();
