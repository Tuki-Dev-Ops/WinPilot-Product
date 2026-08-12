import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FEATURES } from '../packages/spec/src/features';
import { VIEW_META, type ViewId } from '../packages/spec/src/types';

/**
 * 레지스트리에 적힌 컴포넌트 이름이 **실제 파일에도 그 이름으로 있는지** 본다.
 *
 * `spec:check` 는 레지스트리 안에서의 규칙(접두어·금지어·경로 꼬리)만 본다. 그래서 등록만
 * 해 두고 파일은 다른 이름으로 만들어도 통과한다 — 그때부터 문서와 코드가 갈라진다.
 *
 * ## 앱 폴더를 여기 적어 두지 않는다
 * 한때 `APP_DIR` 이라는 표가 여기 있었다. `Record<ViewId, string>` 인데 **세 줄뿐**이어서,
 * 뷰가 넷 늘어난 날 새 뷰는 `undefined/app/...` 을 읽으러 갔다. 그러면 이 검사기는 새로 연
 * 네 앱의 화면 전부를 `MISSING FILE` 로 세는데, **그것이 진짜 누락과 구분되지 않는다.**
 *
 * `VIEW_META[view].app` 이 같은 값을 이미 들고 있었다. 두 벌로 두었던 것이 문제였다.
 */
let bad = 0;
let checked = 0;

for (const feature of FEATURES) {
  for (const [view, binding] of Object.entries(feature.views) as Array<[ViewId, { route: string; component: string; status: string }]>) {
    if (binding.status !== 'implemented') continue;

    const local = binding.route.replace(VIEW_META[view].routePrefix, '') || '/';
    const file = join('apps', VIEW_META[view].app, 'app', local === '/' ? '' : local, 'page.tsx');

    let source: string;
    try {
      source = readFileSync(file, 'utf8');
    } catch {
      console.log(`MISSING FILE  ${feature.id} · ${view} → ${file}`);
      bad += 1;
      continue;
    }

    checked += 1;
    const found = source.match(/export default (?:async )?function ([A-Za-z0-9_]+)/);
    if (!found) {
      console.log(`NO DEFAULT    ${feature.id} · ${view} → ${file}`);
      bad += 1;
      continue;
    }
    if (found[1] !== binding.component) {
      console.log(`NAME DRIFT    ${feature.id} · ${view} → 레지스트리 '${binding.component}' · 파일 '${found[1]}'`);
      bad += 1;
    }
  }
}

console.log(`\n검사 ${checked}건 · 어긋남 ${bad}건`);
