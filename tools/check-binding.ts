import * as store from '@winpilot/store';
import { SCREEN_SPECS as irClientSpecs } from '../apps/ir-client-a/lib/screen-specs';
import { SCREEN_SPECS as fnbClientSpecs } from '../apps/fnb-client-a/lib/screen-specs';
import { SCREEN_SPECS as b2cClientSpecs } from '../apps/b2c-client-a/lib/screen-specs';
import { IR_MENU } from '../apps/ir-admin/lib/navigation/ir-menu';
import { FNB_MENU } from '../apps/fnb-admin/lib/navigation/fnb-menu';
import { ADMIN_MENU } from '../apps/b2c-admin/lib/navigation/admin-menu';
import { INTERNAL_MENU } from '../apps/internal-admin/lib/navigation/internal-menu';

/**
 * 손님 화면이 적어 둔 **값의 출처**가 실재하는지 재는 검사.
 *
 * ## 무엇이 어긋났었나
 * 화면마다 `admin: ['IR > 공시', ...]` 처럼 **어느 어드민 화면이 이 값을 고치는지**를 적어
 * 둔다. 그 문자열은 사람이 손으로 적는 것이라, **어드민 메뉴가 바뀌어도 따라오지 않는다.**
 *
 * 실제로 그 일이 났다. IR 어드민에서 `IR` 갈래 열 화면과 `문제 · 해법` 갈래를 지웠는데,
 * 손님 화면 열일곱이 여전히 그 화면들을 가리키고 있었다 — 문서를 보고 값을 고치러 간 사람은
 * **없는 메뉴를 찾게 된다.** 코드도 타입도 통과하고, 기존 검사 넷도 다 초록이었다.
 *
 * ## 두 가지 모양만 허락한다
 * | 모양 | 뜻 | 무엇을 검사하나 |
 * |---|---|---|
 * | `묶음 > 항목` | 그 어드민 화면이 이 값을 고친다 | 그 메뉴가 **지금** 있는가 |
 * | `store: 이름` | 고치는 화면이 없다. 값은 시드에 있다 | 그 이름이 `@winpilot/store` 에 **실제로** 있는가 |
 *
 * 두 번째 모양을 둔 이유: 어드민 화면이 없는 값이 실제로 있다. 그때 `admin` 을 비워 두면
 * **아직 안 적은 것**과 구별되지 않고, 아무 말이나 적어 두면 그것이 맞는지 아무도 모른다.
 * 값의 이름을 적게 하면 기계가 확인할 수 있다.
 *
 * ## 다른 콘솔을 가리키는 자리가 있다
 * 결제(PG)와 소셜 로그인(OAuth) 설정은 **사내 관리자**가 갖는다. 손님 화면이 그것을 가리킬
 * 때는 `사내 어드민 > 연동 > PG` 처럼 앞에 콘솔 이름을 적고, 나머지를 그쪽 메뉴에서 찾는다.
 *
 * ## 뒤에 붙은 설명은 봐준다
 * 실제로 적혀 있는 것들이 이렇다 — `콘텐츠 > FAQ (분류 이름 포함)` · `문의 > 목록(Path
 * /contact)`. 앞쪽은 메뉴 경로이고 뒤쪽은 **무엇이 어디로 가는지**를 덧붙인 말이다. 그 말이
 * 있어서 문서가 쓸모 있는 것이라, 정확히 일치하는 것만 허락하면 유용한 주석을 지우게 된다.
 *
 * 그래서 **메뉴 경로로 시작하는가**만 본다. 이 규칙으로도 잡으려던 것은 그대로 잡힌다 —
 * 지워진 `IR > 공시` 는 어떤 메뉴로도 시작하지 않는다.
 *
 * ## 반대쪽은 재지 않는다
 * "아무도 안 가리키는 어드민 화면" 도 셀 수 있지만 세지 않는다. 운영자만 보는 화면(통계 ·
 * 설정 일부)이 정상적으로 그렇고, 그것을 어긋남으로 세면 **늘 빨간 줄이 남아** 이 검사를
 * 아무도 안 보게 된다.
 *
 * ```
 * pnpm bind:check
 * ```
 */

type MenuLike = readonly {
  label: string;
  children?: readonly { label: string }[];
}[];

type Pair = { app: string; specs: readonly { screen: string; admin: readonly string[] }[]; menu: MenuLike };

const PAIRS: Pair[] = [
  { app: 'ir-client-a', specs: irClientSpecs, menu: IR_MENU },
  { app: 'fnb-client-a', specs: fnbClientSpecs, menu: FNB_MENU },
  { app: 'b2c-client-a', specs: b2cClientSpecs, menu: ADMIN_MENU },
];

/** `묶음 > 항목` 을 전부 펼쳐 둔다. 묶음 자체가 화면인 것(`대시보드`)도 담는다. */
function pathsOf(menu: MenuLike): Set<string> {
  const found = new Set<string>();

  for (const section of menu) {
    found.add(section.label);
    for (const child of section.children ?? []) {
      found.add(`${section.label} > ${child.label}`);
      /* 목록에서 들어가는 화면은 메뉴에 없다 — 그 갈래를 가리키는 것까지는 맞다고 본다. */
      found.add(`${section.label} > (목록에서 진입)`);
    }
  }

  return found;
}

const STORE_NAMES = new Set(Object.keys(store));
const INTERNAL = pathsOf(INTERNAL_MENU);

function main(): void {
  let checked = 0;
  let broken = 0;

  for (const pair of PAIRS) {
    const menu = pathsOf(pair.menu);
    console.log(`\n[${pair.app}] 화면 ${pair.specs.length}개`);

    for (const spec of pair.specs) {
      for (const one of spec.admin) {
        checked += 1;

        if (one.startsWith('store: ')) {
          const name = one.slice('store: '.length).trim();
          if (!STORE_NAMES.has(name)) {
            broken += 1;
            console.log(`  ✗ ${spec.screen} — @winpilot/store 에 \`${name}\` 이 없다`);
          }
          continue;
        }

        if (!one.includes(' > ')) {
          broken += 1;
          console.log(`  ✗ ${spec.screen} — \`${one}\` 은 \`묶음 > 항목\` 도 \`store: 이름\` 도 아니다`);
          continue;
        }

        /* 다른 콘솔을 가리키는 자리 — 앞의 이름을 떼고 그쪽 메뉴에서 찾는다. */
        const CROSS = '사내 어드민 > ';
        const where = one.startsWith(CROSS) ? INTERNAL : menu;
        const path = one.startsWith(CROSS) ? one.slice(CROSS.length) : one;

        /* 정확히 같거나, **메뉴 경로로 시작하면** 맞다고 본다(뒤는 덧붙인 설명이다). */
        if (![...where].some((known) => path === known || path.startsWith(known))) {
          broken += 1;
          console.log(`  ✗ ${spec.screen} — 어드민에 \`${one}\` 메뉴가 없다`);
        }
      }
    }
  }

  console.log(`\n검사 ${checked}건 — 어긋남 ${broken}건`);
  if (broken > 0) process.exit(1);
}

main();
