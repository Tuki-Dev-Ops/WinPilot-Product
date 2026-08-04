import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { pages, breakpoints } from '../apps/b2c-client-a/pages.manifest';

/**
 * 화면 캡처 — **정상 화면과 예외 화면을 같은 방식으로** 찍는다.
 *
 * 문서에 글만 있으면 "이 화면이 지금 어떻게 생겼는지" 는 결국 사람이 열어 봐야 안다.
 * 캡처를 문서 옆에 두면 화면이 바뀐 것과 문서가 남은 것이 눈으로 드러난다.
 *
 * **예외 화면을 함께 찍는 것이 핵심이다.** 성공 화면만 모아 두면 빈 목록·404·실패처럼
 * 실제로 자주 보이는 상태가 아무 데도 남지 않는다.
 *
 * 찍기 전에 애니메이션을 멈춘다 — 캐러셀이 도는 중에 찍으면 같은 화면을 두 번 찍어도
 * 다른 그림이 나와 비교가 되지 않는다.
 *
 * 실행: 개발 서버를 띄운 뒤 `pnpm docs:capture` (기본 http://localhost:3310)
 */
const BASE = process.env.CAPTURE_BASE ?? 'http://localhost:3310';
const OUT = join('apps', 'b2c-client-a', 'docs', 'page-view');
/*
  그림은 `public/` 아래에 둔다 — 문서(`docs/`)는 빌드 때 읽는 글이고, 그림은 브라우저가
  주소로 받아 가는 것이다. 같은 폴더에 두면 문서 폴더가 배포물에 섞인다.
*/
const IMAGES = join('apps', 'b2c-client-a', 'public', 'page-view');

/** 정상 화면 밖의 상태들. `screen` 은 매니페스트 id 이고, 없는 id 면 따로 문서를 만든다. */
const EXCEPTIONS: Array<{ screen: string; id: string; label: string; url: string; note: string }> = [
  {
    screen: 'products',
    id: 'products--empty',
    label: '검색 결과 없음',
    url: '/products?q=%EC%97%86%EB%8A%94%EC%83%81%ED%92%88',
    note: '조건에 맞는 것이 없을 때. 목록 자리를 비우지 않고 한 줄로 알린다.',
  },
  {
    screen: 'products',
    id: 'products--filtered',
    label: '분류·가격 적용',
    url: '/products?category=C-01&min=30000&max=200000',
    note: '조건이 주소에 남아 새로고침·공유에서 살아남는다.',
  },
  {
    screen: 'products-detail',
    id: 'products-detail--soldout',
    label: '품절 옵션 포함',
    // 대표 화면(P-1042)과 **다른 상품**을 쓴다 — 같은 주소를 찍으면 같은 그림이 두 장 남는다.
    url: '/products/P-1040',
    note: '재고 0 옵션(아이보리 K)은 누를 수 없고 취소선으로 표시한다.',
  },
  {
    screen: 'orders-new',
    id: 'orders-new--empty',
    label: '결제할 것이 없음',
    url: '/orders/new',
    note: '장바구니가 비어 있으면 결제 단추가 잠긴다.',
  },
  {
    screen: 'result',
    id: 'result--done',
    label: '완료',
    url: '/result?state=done&kind=order&id=S-24801',
    note: '흐름이 끝난 뒤. 성공은 체크 모양으로 알린다.',
  },
  {
    screen: 'result',
    id: 'result--failed',
    label: '실패',
    url: '/result?state=failed&kind=order',
    note: '같은 화면이 문구와 아이콘만 바꾼다.',
  },
  {
    screen: 'result',
    id: 'result--signup',
    label: '가입 완료',
    url: '/result?state=done&kind=signup',
    note: '무엇이 끝났는지에 따라 돌아갈 곳이 달라진다.',
  },
  {
    screen: '404',
    id: '404',
    label: '없는 주소',
    url: '/this-page-does-not-exist',
    note: '주소가 없는 화면이라 매니페스트에는 올리지 않는다.',
  },
];

type Shot = { id: string; label: string; url: string; note: string; screen: string };

const shots: Shot[] = [
  ...pages.map((page) => ({
    id: page.id,
    label: page.name,
    url: page.sampleUrl ?? page.route,
    note: '정상 화면',
    screen: page.id,
  })),
  ...EXCEPTIONS,
];

async function main() {
  mkdirSync(IMAGES, { recursive: true });

  const browser = await chromium.launch();
  const results: Record<string, Array<{ file: string; width: number; label: string }>> = {};

  for (const shot of shots) {
    for (const breakpoint of breakpoints) {
      const context = await browser.newContext({
        viewport: { width: breakpoint.width, height: 900 },
        deviceScaleFactor: 1,
        // 캡처는 사람이 보는 그림이 아니라 비교용이다 — 움직임을 끄고 같은 조건에서 찍는다.
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();

      try {
        await page.goto(`${BASE}${shot.url}`, { waitUntil: 'networkidle', timeout: 30_000 });
        // 전환이 남아 있으면 프레임마다 그림이 달라진다.
        await page.addStyleTag({
          content: '*,*::before,*::after{animation:none !important;transition:none !important}',
        });
        await page.waitForTimeout(150);

        const file = `${shot.id}-${breakpoint.id}.png`;
        await page.screenshot({ path: join(IMAGES, file), fullPage: true });

        results[shot.id] ??= [];
        results[shot.id].push({ file, width: breakpoint.width, label: breakpoint.label });
        console.log(`✓ ${shot.id} · ${breakpoint.label}`);
      } catch (error) {
        console.log(`✗ ${shot.id} · ${breakpoint.label} — ${(error as Error).message.split('\n')[0]}`);
      } finally {
        await context.close();
      }
    }
  }

  await browser.close();

  // 화면별 문서 — 정상 화면과 그 화면의 예외를 한 장에 모은다.
  const byScreen = new Map<string, Shot[]>();
  for (const shot of shots) {
    const list = byScreen.get(shot.screen) ?? [];
    list.push(shot);
    byScreen.set(shot.screen, list);
  }

  for (const [screen, list] of byScreen) {
    const page = pages.find((item) => item.id === screen);
    const title = page?.name ?? screen;
    const route = page?.route ?? list[0]?.url ?? '';

    const body = list
      .map((shot) => {
        const files = results[shot.id] ?? [];
        const images = files
          .map((entry) => `**${entry.label} ${entry.width}px**\n\n![${shot.label} ${entry.label}](/page-view/${entry.file})`)
          .join('\n\n');
        return `## ${shot.label}\n\n${shot.note}\n\n\`${shot.url}\`\n\n${images || '_캡처 실패_'}`;
      })
      .join('\n\n');

    /*
      매니페스트에 없는 화면(404)은 명세도 없다 — 링크를 걸면 눌렀을 때 다시 404 로 간다.
      화면 캡처 문서에서 없는 문서로 보내는 것만큼 문서를 못 믿게 만드는 것이 없다.
    */
    const related = page
      ? `\n## 관련 문서\n\n- [기능 명세](/feature/${screen})\n- [비기능 명세](/non-functional/${screen})\n`
      : '';

    const doc = `# 화면 캡처 — ${title}

> 화면: \`${route}\` · id \`${screen}\`
> 생성: \`pnpm docs:capture\` (개발 서버가 떠 있어야 한다)
> 이 파일은 **생성물**이다. 캡처를 다시 뜨면 덮어쓴다.

${body}
${related}`;
    writeFileSync(join(OUT, `${screen}.md`), doc, 'utf8');
  }

  console.log(`\n캡처 ${Object.keys(results).length}개 화면 · 문서 ${byScreen.size}장`);
}

void main();
