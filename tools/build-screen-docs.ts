import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pages } from '../apps/b2c-client-a/pages.manifest';
import { COMMON_NON_FUNCTIONAL, SCREEN_SPECS, findSpec } from '../apps/b2c-client-a/lib/screen-specs';

/**
 * 화면별 명세서를 **만들어 낸다** — 손으로 26 × 2 장을 적지 않는다.
 *
 * 원본은 `apps/b2c-client-a/lib/screen-specs.ts` 하나이고, 이 스크립트가 그것을
 * `docs/feature/*.md` 와 `docs/non-functional/*.md` 로 펼친다. 문서를 손으로 적으면
 * 화면을 고칠 때 문서가 남고, 남은 문서는 곧 거짓말이 된다.
 *
 * 폴더 이름을 한글로 두지 않는 이유: 파일 이름이 곧 주소이고(`/feature/products`),
 * 주소는 소문자 영문·숫자·하이픈만 쓴다(`docs/path.md` §2). 화면에 보이는 제목은 한글이다.
 *
 * 실행: `pnpm docs:build`
 */
const DOCS = join('apps', 'b2c-client-a', 'docs');

function bullet(items: string[], empty: string): string {
  if (items.length === 0) return `_${empty}_\n`;
  return items.map((item) => `- ${item}`).join('\n') + '\n';
}

function featureDoc(screen: string, name: string, route: string): string {
  const spec = findSpec(screen);
  if (!spec) return '';

  return `# 기능 명세 — ${name}

> 화면: [\`${route}\`](${route}) · id \`${screen}\`
> 원본: \`apps/b2c-client-a/lib/screen-specs.ts\` · 생성: \`pnpm docs:build\`
> 이 파일은 **생성물**이다. 고칠 것은 원본이고, 여기서 고치면 다음 생성 때 지워진다.

## 목적

${spec.purpose}

## 할 수 있는 일

${bullet(spec.actions, '읽기만 하는 화면이다.')}
## 막는 것

${bullet(spec.guards, '따로 막는 것이 없다.')}
## 어드민 연동

${bullet(spec.admin, '어드민이 정하는 값이 없다.')}
전체 대응표는 [어드민 연동 명세](/admin-sync)에 있다.

## 관련 문서

- [비기능 명세](/non-functional/${screen})
- [화면 캡처](/page-view/${screen})
- [IA](/ia) · [Flow Chart](/flow)
`;
}

function nonFunctionalDoc(screen: string, name: string, route: string): string {
  const spec = findSpec(screen);
  if (!spec) return '';

  return `# 비기능 명세 — ${name}

> 화면: [\`${route}\`](${route}) · id \`${screen}\`
> 원본: \`apps/b2c-client-a/lib/screen-specs.ts\` · 생성: \`pnpm docs:build\`

## 이 화면의 조건

${bullet(spec.nonFunctional, '이 화면만의 조건은 없다 — 아래 공통 조건만 지킨다.')}
## 모든 화면의 공통 조건

${bullet(COMMON_NON_FUNCTIONAL, '')}
## 판정 방법

| 조건 | 어떻게 보는가 |
|---|---|
| 너비별 레이아웃 | \`pnpm ssot:extract\` 가 세 너비로 캡처한다 |
| 추출 가능 여부 | 추출 결과에 그 글자가 있는지 확인한다 |
| 수치·픽셀 일치 | \`pnpm ssot:verify\` (수치 ε=1e-4 → 픽셀 비교) |
| 이름 일치 | \`pnpm spec:check\` · \`pnpm sync:check\` |

## 관련 문서

- [기능 명세](/feature/${screen})
- [화면 캡처](/page-view/${screen})
`;
}

mkdirSync(join(DOCS, 'feature'), { recursive: true });
mkdirSync(join(DOCS, 'non-functional'), { recursive: true });

let written = 0;
const missing: string[] = [];

for (const page of pages) {
  const spec = findSpec(page.id);
  if (!spec) {
    missing.push(page.id);
    continue;
  }

  writeFileSync(join(DOCS, 'feature', `${page.id}.md`), featureDoc(page.id, page.name, page.route), 'utf8');
  writeFileSync(
    join(DOCS, 'non-functional', `${page.id}.md`),
    nonFunctionalDoc(page.id, page.name, page.route),
    'utf8',
  );
  written += 1;
}

const orphan = SCREEN_SPECS.filter((spec) => !pages.some((page) => page.id === spec.screen)).map((spec) => spec.screen);

console.log(`명세 ${written}개 화면 × 2장 생성`);
if (missing.length > 0) console.log(`명세 없음: ${missing.join(', ')}`);
if (orphan.length > 0) console.log(`화면 없음(명세만 있음): ${orphan.join(', ')}`);
