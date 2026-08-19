import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { pages as b2cClientPages } from '../apps/b2c-client-a/pages.manifest';
import { pages as b2cAdminPages } from '../apps/b2c-admin/pages.manifest';
import { pages as internalPages } from '../apps/internal-admin/pages.manifest';
import { pages as irAdminPages } from '../apps/ir-admin/pages.manifest';
import { pages as irClientPages } from '../apps/ir-client-a/pages.manifest';
import { pages as fnbAdminPages } from '../apps/fnb-admin/pages.manifest';
import { pages as fnbClientPages } from '../apps/fnb-client-a/pages.manifest';

/**
 * 화면마다 한 장 — `apps/<앱>/docs/pages/<화면>.jpg`.
 *
 * ## `docs/page-view` 와 무엇이 다른가
 * 그쪽은 **한 화면을 세 너비로** 찍고 설명을 붙인 문서다(데스크톱 · 태블릿 · 모바일). 화면
 * 하나를 깊게 들여다보는 자리라 세 앱만 갖고 있다.
 *
 * 여기는 **앱 전체를 한눈에** 훑는 자리다. 화면 하나가 사진 한 장이고 일곱 앱이 다 갖는다 —
 * "이 콘솔에 무슨 화면이 있더라" 를 물었을 때 폴더만 열면 답이 되는 것이 목적이다.
 *
 * ## 사진은 `public/pages`, 목록은 `docs/pages`
 * 처음에는 사진도 `docs/pages` 에 두었다. 폴더 하나만 열면 되니 그편이 낫다고 봤는데, 그러면
 * **웹에서 볼 수 없다** — Next 는 `public/` 아래만 주소로 내보낸다. 문서 화면(`/docs/pages`)이
 * 그 사진을 열지 못하면 저장소를 클론한 사람만 볼 수 있는 자료가 된다.
 *
 * 그래서 사진은 `public/pages/{화면}.jpg` 에 두고, `docs/pages/README.md` 가 상대 경로로
 * 그것을 가리킨다. 저장소에서 폴더를 여는 사람과 브라우저로 보는 사람이 같은 사진을 본다.
 *
 * ## JPEG 로 찍는다
 * PNG 로 두면 스크롤이 긴 화면 한 장이 수 MB 다. 이 사진들은 **무엇이 있는지 알아보는 용도**라
 * 글자가 읽힐 만큼만 있으면 된다.
 *
 * ## 팝업을 닫고 찍는다
 * IR 사이트는 첫 진입에 안내 팝업이 뜬다. 그대로 찍으면 서른 장이 전부 같은 팝업에 가린
 * 화면이 된다. `오늘 하루 보지 않기` 를 한 번 눌러 두고 시작한다.
 *
 * ```
 * pnpm pages:shoot                    # 일곱 앱 전부
 * pnpm pages:shoot -- --app=b2c-admin
 * ```
 *
 * 개발 서버가 떠 있어야 한다.
 */

type Target = {
  app: string;
  port: number;
  pages: readonly { id: string; name: string; route: string; sampleUrl?: string }[];
};

/** 찍는 너비. 데스크톱 하나다 — 좁은 화면은 `overflow:check` 가 따로 본다. */
const WIDTH = 1440;

const TARGETS: Target[] = [
  { app: 'b2c-admin', port: 3301, pages: b2cAdminPages },
  { app: 'internal-admin', port: 3302, pages: internalPages },
  { app: 'ir-admin', port: 3303, pages: irAdminPages },
  { app: 'ir-client-a', port: 3304, pages: irClientPages },
  { app: 'fnb-client-a', port: 3305, pages: fnbClientPages },
  { app: 'fnb-admin', port: 3306, pages: fnbAdminPages },
  { app: 'b2c-client-a', port: 3310, pages: b2cClientPages },
];

async function main(): Promise<void> {
  const only = process.argv.find((one) => one.startsWith('--app='))?.slice('--app='.length);
  const targets = only ? TARGETS.filter((one) => one.app === only) : TARGETS;

  if (targets.length === 0) {
    console.error(`알 수 없는 앱: ${only}`);
    process.exit(1);
  }

  const browser = await chromium.launch();
  let shot = 0;
  let missed = 0;

  for (const target of targets) {
    const out = join('apps', target.app, 'docs', 'pages');
    const shots = join('apps', target.app, 'public', 'pages');
    /*
      찍기 전에 폴더를 비운다. 화면을 지웠을 때 옛 사진이 남으면, 폴더를 열어 본 사람이
      **없는 화면을 있는 것으로** 읽는다.
    */
    rmSync(out, { recursive: true, force: true });
    rmSync(shots, { recursive: true, force: true });
    mkdirSync(out, { recursive: true });
    mkdirSync(shots, { recursive: true });

    const page = await browser.newPage({ viewport: { width: WIDTH, height: 900 } });
    const rows: string[] = [];

    /* 팝업은 한 번만 닫으면 그 뒤로 안 뜬다 — 브라우저가 기억한다. */
    try {
      await page.goto(`http://localhost:${target.port}/`, { waitUntil: 'networkidle', timeout: 30_000 });
      const skip = await page.$('text=오늘 하루 보지 않기');
      if (skip) await skip.click();
      await page.waitForTimeout(300);
    } catch {
      /* 홈이 없는 앱은 그냥 넘어간다 — 팝업도 없다. */
    }

    for (const one of target.pages) {
      const url = `http://localhost:${target.port}${one.sampleUrl ?? one.route}`;

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
        /*
          끝까지 굴린 뒤 위로 돌아온다. 스크롤에 맞춰 나타나는 칸(`Reveal`)이 있어, 그냥
          찍으면 그 칸들이 **투명한 채로** 찍힌다.
        */
        await page.evaluate(async () => {
          /*
            **부드러운 스크롤을 꺼 두고** 굴린다. 이 사이트는 `html` 에 `scroll-smooth` 가
            걸려 있어, 연속으로 굴리면 앞의 움직임이 끝나기 전에 다음 것이 시작되며 서로를
            취소한다 — 끝까지 갔다고 생각한 자리가 실은 몇백 픽셀이고, 되돌아온 자리도 맨 위가
            아니다. 그러면 사진의 맨 위가 배너가 아니라 **화면 중간**이 된다.
          */
          const root = document.documentElement;
          const had = root.style.scrollBehavior;
          root.style.scrollBehavior = 'auto';

          for (let y = 0; y < document.body.scrollHeight; y += 700) {
            window.scrollTo(0, y);
            await new Promise((done) => setTimeout(done, 90));
          }
          window.scrollTo(0, 0);
          await new Promise((done) => setTimeout(done, 120));

          root.style.scrollBehavior = had;
        });
        await page.waitForTimeout(500);

        await page.screenshot({ path: join(shots, `${one.id}.jpg`), fullPage: true, type: 'jpeg', quality: 78 });
        rows.push(`| \`${one.id}\` | ${one.name} | \`${one.route}\` | ![](../../public/pages/${one.id}.jpg) |`);
        shot += 1;
      } catch {
        missed += 1;
        rows.push(`| \`${one.id}\` | ${one.name} | \`${one.route}\` | (열지 못함) |`);
        console.log(`  ? ${target.app} ${one.route} — 열지 못함`);
      }
    }

    await page.close();

    const doc = [
      `# ${target.app} — 화면 사진`,
      '',
      `\`pnpm pages:shoot -- --app=${target.app}\` 로 다시 찍는다. 폴더는 찍을 때마다 비우고 새로 채운다.`,
      '',
      `너비 ${WIDTH}px · 화면 전체 · JPEG`,
      '',
      `사진 파일은 \`apps/${target.app}/public/pages/\` 에 있다 — 웹에서 \`/docs/pages\` 로도 볼 수 있게 하려면 그 아래여야 한다.`,
      '',
      '| 화면 id | 이름 | 주소 | 사진 |',
      '|---|---|---|---|',
      ...rows,
      '',
    ].join('\n');

    writeFileSync(join(out, 'README.md'), doc, 'utf8');
    console.log(`[${target.app}] ${target.pages.length}개 → ${out}`);
  }

  await browser.close();
  console.log(`\n찍은 화면 ${shot}개 — 열지 못함 ${missed}개`);
}

void main();
