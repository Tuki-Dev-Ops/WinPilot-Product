/**
 * 문서가 **화면을 따라가고 있는가**를 세 앱에서 한 번에 본다.
 *
 * ## 왜 검사기로 두는가
 * 화면을 하나 더하면 손대야 하는 곳이 넷이다 — 매니페스트 · IA 갈래 · 흐름 · 기능 명세.
 * 그중 하나를 빠뜨려도 **앱은 멀쩡히 돌고**, 빠진 사실은 문서를 열어 본 사람이 "이 화면은
 * 왜 없지" 라고 물을 때에야 드러난다. `spec:check` 는 기능 ↔ 라우트만 보므로 그 자리를
 * 잡지 못한다.
 *
 * 그래서 세 갈래를 한자리에서 센다.
 *
 * - **갈래 없는 화면** — 매니페스트에 있는데 IA 에 없다. 도면이 화면을 따라가지 못한 자리
 * - **없는 화면 참조** — IA 에는 있는데 매니페스트에 없다. 지운 화면이 도면에 남은 자리
 * - **흐름 없는 화면** — 밟는 차례가 적히지 않은 화면
 * - **명세 없는 화면** — 기능 명세(FSD)가 없는 화면
 *
 * 판정에서 빼는 것은 **화면이 아닌 id** 뿐이다(캡처 너비 `desktop`·`tablet`·`mobile`).
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');

const APPS = ['b2c-client-a', 'b2c-admin', 'internal-admin'] as const;

/** 캡처 너비는 매니페스트에 함께 적히지만 화면이 아니다. */
const NOT_SCREENS = new Set(['desktop', 'tablet', 'mobile']);

/**
 * 파일에서 id 를 긁는다.
 *
 * 모듈을 import 하지 않고 글자로 읽는 이유: 이 파일들은 Next 별칭(`@/`)과 앱별 설정에 묶여
 * 있어, 검사기 하나가 세 앱의 모듈을 동시에 불러오려면 앱마다 다른 해석기를 태워야 한다.
 * 여기서 필요한 것은 **id 목록** 하나뿐이다.
 */
function idsIn(file: string, pattern: RegExp): string[] {
  let source: string;
  try {
    source = readFileSync(file, 'utf8');
  } catch {
    return [];
  }
  return [...source.matchAll(pattern)].map((match) => match[1] as string);
}

let gaps = 0;

for (const app of APPS) {
  const base = resolve(ROOT, 'apps', app);

  const manifest = idsIn(resolve(base, 'pages.manifest.ts'), /id: '([a-z0-9-]+)'/g).filter(
    (id) => !NOT_SCREENS.has(id),
  );
  const ia = new Set(idsIn(resolve(base, 'lib/ia-groups.ts'), /screen: '([a-z0-9-]+)'/g));
  const flow = new Set(idsIn(resolve(base, 'lib/flow-specs.ts'), /screen: '([a-z0-9-]+)'/g));
  const spec = new Set(idsIn(resolve(base, 'lib/screen-specs.ts'), /screen: '([a-z0-9-]+)'/g));

  const real = new Set(manifest);
  const missingIa = manifest.filter((id) => !ia.has(id));
  const missingFlow = manifest.filter((id) => !flow.has(id));
  const missingSpec = manifest.filter((id) => !spec.has(id));
  const unknown = [...ia].filter((id) => !real.has(id));

  const found = missingIa.length + missingFlow.length + missingSpec.length + unknown.length;
  gaps += found;

  console.log(`[${app}] 화면 ${manifest.length}개 — 빈 곳 ${found}건`);
  if (missingIa.length > 0) console.log(`   IA 갈래 없음: ${missingIa.join(', ')}`);
  if (missingFlow.length > 0) console.log(`   흐름 없음: ${missingFlow.join(', ')}`);
  if (missingSpec.length > 0) console.log(`   기능 명세 없음: ${missingSpec.join(', ')}`);
  if (unknown.length > 0) console.log(`   없는 화면을 가리킴: ${unknown.join(', ')}`);
}

console.log('');
console.log(`검사 결과 — 빈 곳 ${gaps}건`);
if (gaps > 0) process.exitCode = 1;
