import { chromium, type Page } from 'playwright';
import { pages as b2cAdminPages } from '../apps/b2c-admin/pages.manifest';
import { pages as internalPages } from '../apps/internal-admin/pages.manifest';
import { pages as irAdminPages } from '../apps/ir-admin/pages.manifest';
import { pages as irClientPages } from '../apps/ir-client-a/pages.manifest';

/**
 * 화면이 **가로로 넘치는지** 실제로 띄워 보고 재는 검사.
 *
 * ## 왜 코드를 훑는 것으로는 부족한가
 * `min-w-0` 이 빠진 자리를 문자열로 찾을 수는 있다. 그런데 넘침은 **한 요소의 잘못이 아니라
 * 조합의 결과**다 — 격자 칸은 기본이 `min-width: auto` 라 안에 든 긴 글자가 칸을 밀어내고,
 * 그 칸이 줄을 밀고, 줄이 페이지를 민다. 어느 자리에서 시작됐는지는 띄워 봐야 안다.
 *
 * 그래서 실제 브라우저에서 `<body>` 의 `scrollWidth > clientWidth` 를 재고, 넘쳤을 때는
 * **자르는 상자 밖에서 가장 오른쪽까지 뻗은 요소**를 함께 적는다.
 *
 * ## 좁은 폭을 함께 재는 이유
 * 어드민은 1280 이상에서 만들지만 실제로는 노트북 1366 과 태블릿 가로 1024 에서 많이 본다.
 * 그 폭에서 목록의 칸이 하나 접히면서 넘치는 일이 잦다.
 *
 * ```
 * pnpm overflow:check            # 다섯 앱 전부
 * pnpm overflow:check -- --app=b2c-admin
 * ```
 *
 * 개발 서버가 떠 있어야 한다(`pnpm dev`).
 */

type Target = { app: string; port: number; routes: string[] };

/** 잴 폭. 어드민이 실제로 쓰이는 자리다. */
const WIDTHS = [1280, 1024, 768, 390];

/**
 * 넘침으로 셀 최소 폭(px).
 *
 * 1px 은 테두리 반올림으로도 난다. 그것까지 잡으면 매번 붉은 줄이 뜨고, 그러면 아무도 이
 * 검사를 보지 않게 된다.
 */
const SLACK = 2;

const TARGETS: Target[] = [
  { app: 'b2c-admin', port: 3301, routes: b2cAdminPages.map((one) => one.sampleUrl ?? one.route) },
  { app: 'internal-admin', port: 3302, routes: internalPages.map((one) => one.sampleUrl ?? one.route) },
  { app: 'ir-admin', port: 3303, routes: irAdminPages.map((one) => one.sampleUrl ?? one.route) },
  { app: 'ir-client-a', port: 3304, routes: irClientPages.map((one) => one.sampleUrl ?? one.route) },
];

/**
 * 넘쳤을 때 **정말로 페이지를 민 요소**를 찾아 준다.
 *
 * ## 가장 오른쪽 요소를 그냥 고르면 틀린다
 * 처음에는 오른쪽 끝이 가장 먼 요소를 집었다. 그랬더니 매번 **넓은 표**를 가리켰는데, 그 표는
 * 이미 `overflow-x-auto` 상자 안에 들어 있어 잘리고 있었다 — 화면 밖으로 뻗은 것은 맞지만
 * 페이지를 민 것은 아니다. 엉뚱한 자리를 고치러 가게 만드는 안내였다.
 *
 * 그래서 **자르는 조상이 하나라도 있으면 건너뛴다.** 남는 것이 실제로 페이지를 민 것이다.
 */
async function widestElement(page: Page): Promise<string> {
  /*
    브라우저 안에서 도는 코드는 **문자열로 건너간다.** 그래서 여기서는 `tsx` 가 손대지 않는
    평범한 자바스크립트만 쓴다 — 타입 주석도, 화살표 함수도 두지 않는다. 둘 다 변환기가
    도우미 함수(`__name`)를 끼워 넣는데, 그 도우미는 브라우저 쪽에 없어 그 자리에서 멈춘다.

    ## 무엇을 고르는가
    처음에는 오른쪽 끝이 가장 먼 요소를 집었다. 그랬더니 매번 **넓은 표**를 가리켰는데, 그
    표는 이미 `overflow-x-auto` 상자 안에서 잘리고 있었다 — 화면 밖으로 뻗은 것은 맞지만
    페이지를 민 것은 아니다. 엉뚱한 자리를 고치러 가게 만드는 안내였다.

    그래서 **자르는 조상이 하나라도 있으면 건너뛴다.** 남는 것이 실제로 페이지를 민 것이다.
  */
  return page.evaluate(`(function () {
    var limit = document.documentElement.clientWidth;
    var worst = { right: limit, label: '(자르는 상자 밖에서는 찾지 못함)' };
    var nodes = document.body.querySelectorAll('*');

    for (var i = 0; i < nodes.length; i += 1) {
      var node = nodes[i];
      var box = node.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      if (box.right <= worst.right) continue;

      var clipped = false;
      for (var at = node.parentElement; at && at !== document.documentElement; at = at.parentElement) {
        var overflow = getComputedStyle(at).overflowX;
        if (overflow === 'hidden' || overflow === 'auto' || overflow === 'scroll') { clipped = true; break; }
      }
      if (clipped) continue;

      var cls = typeof node.className === 'string' ? node.className.trim() : '';
      var shown = cls ? '.' + cls.split(/\s+/).slice(0, 3).join('.') : '';
      worst = { right: box.right, label: node.tagName.toLowerCase() + shown };
    }

    return worst.label + ' — 오른쪽 끝 ' + Math.round(worst.right) + 'px (화면 ' + limit + 'px)';
  })()`);
}

async function main(): Promise<void> {
  const only = process.argv.find((one) => one.startsWith('--app='))?.slice('--app='.length);
  const targets = only ? TARGETS.filter((one) => one.app === only) : TARGETS;

  if (targets.length === 0) {
    console.error(`알 수 없는 앱: ${only}`);
    process.exit(1);
  }

  const browser = await chromium.launch();
  let broken = 0;
  let checked = 0;

  for (const target of targets) {
    console.log(`\n[${target.app}] 화면 ${target.routes.length}개 · 폭 ${WIDTHS.join(' · ')}`);

    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });

      for (const route of target.routes) {
        const url = `http://localhost:${target.port}${route}`;

        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 20_000 });
        } catch {
          console.log(`  ? ${width} ${route} — 열지 못함(개발 서버가 떠 있는지 확인)`);
          continue;
        }

        checked += 1;
        /*
          재는 것은 `<body>` 다. `<html>` 을 재면 **개발 서버가 붙이는 것**까지 함께 잡힌다 —
          Next 의 개발 도구 조각이 `<html>` 아래에 붙어 있어, 화면은 멀쩡한데 90px 이 넘친 것으로
          나왔다. 실제로 `body.scrollWidth` 는 화면 폭과 같았다.

          `<body>` 는 우리가 그린 것만 담으므로, 여기서 넘치면 그것은 우리 잘못이다.
        */
        const over = await page.evaluate('document.body.scrollWidth - document.body.clientWidth');

        if (over > SLACK) {
          broken += 1;
          console.log(`  ✗ ${width}px ${route} — ${over}px 넘침`);
          console.log(`      ${await widestElement(page)}`);
        }
      }

      await page.close();
    }
  }

  await browser.close();

  console.log(`\n검사 ${checked}건 — 넘침 ${broken}건`);
  if (broken > 0) process.exit(1);
}

void main();
