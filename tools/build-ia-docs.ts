import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pages } from '../apps/b2c-client-a/pages.manifest';
import { IA_GROUPS, ROOT, ungrouped, unknownScreens, type IaGroup } from '../apps/b2c-client-a/lib/ia-groups';

/**
 * IA 문서를 **갈래별로 펼친다** — 한 장짜리 도면을 손으로 고치지 않는다.
 *
 * 원본은 `apps/b2c-client-a/lib/ia-groups.ts` 하나이고, 이 스크립트가 그것을 `/ia` 의 전체
 * 도면과 `docs/ia/*.md` 갈래 문서로 만든다. 화면을 하나 늘렸을 때 고칠 곳이 한 군데여야
 * 도면이 화면을 따라온다.
 *
 * 실행: `pnpm docs:build`
 */
const DOCS = join('apps', 'b2c-client-a', 'docs', 'ia');

const routeOf = new Map(pages.map((page) => [page.id, page.route]));
const nameOf = new Map(pages.map((page) => [page.id, page.name]));

/** mermaid 노드 이름 — 하이픈은 노드 구분자와 섞이므로 밑줄로 바꾼다. */
function node(screen: string): string {
  return screen.toUpperCase().replace(/-/g, '_');
}

function label(screen: string, ko: string): string {
  return `${node(screen)}["${ko} ${routeOf.get(screen) ?? ''}"]`;
}

function subgraph(group: IaGroup): string {
  const lines = [`  subgraph ${group.id}["${group.label}"]`, '    direction TB'];
  for (const screen of group.screens) lines.push(`    ${label(screen.screen, screen.ko)}`);
  for (const [from, to] of group.edges) lines.push(`    ${node(from)} --> ${node(to)}`);
  lines.push('  end');
  return lines.join('\n');
}

/** 갈래 안의 화면 표 — 이름·경로와 그 화면의 명세로 가는 길. */
function screenTable(group: IaGroup): string {
  const rows = group.screens.map((screen) => {
    const route = routeOf.get(screen.screen) ?? '';
    const spec = `[기능](/feature/${screen.screen}) · [비기능](/non-functional/${screen.screen}) · [캡처](/page-view/${screen.screen})`;
    return `| ${screen.ko} | \`${route}\` | ${nameOf.get(screen.screen) ?? ''} | ${spec} |`;
  });
  return ['| 화면 | 경로 | Figma 페이지 | 명세 |', '|---|---|---|---|', ...rows].join('\n');
}

function bullets(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

const MERMAID_INIT =
  '%%{init: {"flowchart": {"curve": "step", "nodeSpacing": 55, "rankSpacing": 65, "useMaxWidth": true}} }%%';

const HEADER = `> 원본: \`apps/b2c-client-a/lib/ia-groups.ts\` · 생성: \`pnpm docs:build\`
> 이 파일은 **생성물**이다. 고칠 것은 원본이고, 여기서 고치면 다음 생성 때 지워진다.
> 검사: \`pnpm spec:check\` (등록·명명) · \`pnpm sync:check\` (레지스트리 이름과 파일 이름)`;

function groupDoc(group: IaGroup): string {
  return `# IA — ${group.label}

${HEADER}

${group.purpose}

## 화면 나무

\`\`\`mermaid
${MERMAID_INIT}
flowchart TD
  ${label(ROOT.screen, ROOT.ko)}
${subgraph(group)}
  ${node(ROOT.screen)} --> ${group.id}
\`\`\`

## 화면

${screenTable(group)}

## 이 갈래의 규칙

${bullets(group.notes)}
`;
}

/*
  전체 문서의 글은 갈래 하나에 딸린 것이 아니라 **IA 전체를 설명하는 말**이라 여기 둔다.
  갈래마다 달라지는 것(도면·화면·규칙)만 원본에서 읽어 온다.
*/
function indexDoc(): string {
  const tabs = IA_GROUPS.map(
    (group) => `| [${group.label}](/ia/${group.id}) | ${group.screens.length}개 | ${group.purpose} |`,
  ).join('\n');

  return `# IA — B2C Client 템플릿 A

${HEADER}

지금 이 템플릿에 **실제로 있는 화면**의 구조다. 계획이 아니라 현황이다.
갈래별 도면과 규칙은 위 탭에서 본다.

## 1. 갈래

| 갈래 | 화면 | 하는 일 |
|---|---|---|
${tabs}

## 2. 화면 나무

\`\`\`mermaid
${MERMAID_INIT}
flowchart TD
  ${label(ROOT.screen, ROOT.ko)}

${IA_GROUPS.map(subgraph).join('\n\n')}

${IA_GROUPS.map((group) => `  ${node(ROOT.screen)} --> ${group.id}`).join('\n')}
\`\`\`

선은 **직각(step)** 으로 그린다 — 곡선으로 두면 갈래가 많아질수록 어느 선이 어디로 가는지
따라가기 어렵다. 같은 이유로 묶음을 먼저 나누고 홈에서 묶음으로만 잇는다. 화면끼리의 선은
묶음 안에서만 그어 선이 서로 넘지 않게 한다.

갈래를 넘는 이동(상품 상세 → 결제 같은 것)은 도면에 긋지 않고 그 갈래의 규칙에 적는다.
전부 그으면 도면이 그물이 되어 아무것도 읽히지 않는다.

## 3. 헤더 메뉴 (\`buildNav()\`)

메뉴 구성은 템플릿이 정하지 않는다. \`@winpilot/client-content\` 의 \`buildNav()\` 하나를
A~F 가 함께 쓰고, 템플릿은 **배치만** 정한다.

| 1Depth | 2Depth | 비고 |
|---|---|---|
| 회사소개 | 회사 소개 · 연혁 · 포트폴리오 | |
| 신상품 | — | 강조(굵게·브랜드색) |
| 베스트 | — | 강조 |
| 상품 | 어드민의 **1Depth 카테고리** | 카테고리를 늘리면 여기도 늘어난다 |
| 고객지원 | 공지사항 · FAQ · 뉴스 · 문의하기 | 고객지원 화면의 aside 와 같은 네 갈래 |

오른쪽 도구는 로그인 여부로 갈린다.

| 상태 | 오른쪽에 놓이는 것 |
|---|---|
| 로그인 | 검색 · 관심 · 알람(읽지 않은 수) · 장바구니 · 아바타(마이페이지 · 로그아웃) |
| 비회원 | 검색 · 장바구니 · **로그인** 단추 |

비회원에게 관심·알람을 감추는 이유: 담을 곳도 받을 알람도 없어 눌러도 빈 화면이 나온다.
장바구니는 비회원도 담을 수 있어 늘 둔다.

## 4. 두 개의 aside

목록을 갈래로 나눠 보는 화면은 **왼쪽 aside + 오른쪽 main** 한 뼈대를 쓴다.
상세로 들어가도 aside 는 그대로 두고 main 만 바뀐다.

| 뼈대 | 갈래 | 파일 |
|---|---|---|
| [고객지원](/ia/support) | 공지사항 · FAQ · 뉴스 · 문의하기 | \`app/_components/SupportShell.tsx\` |
| [마이페이지](/ia/mypage) | 내 정보 수정 · 주문 내역 · 문의 내역 · 쿠폰함 | \`app/_components/MyPageShell.tsx\` |

## 5. 깊이

| 깊이 | 예 | 규칙 |
|---|---|---|
| 1 | \`/products\` · \`/notices\` · \`/mypage\` | 목록·단일 화면 |
| 2 | \`/products/[productId]\` · \`/mypage/coupons\` | 상세·갈래 |
| 3 | *(없음)* | 3뎁스를 만들지 않는다 — 돌아올 길이 길어진다 |

## 6. 상태 화면

404 · 오류 · 완료 · 실패는 **한 컴포넌트**(\`packages/ui\` 의 \`StatusScreen\`)를 세 앱이 같이 쓴다.

| 화면 | 배치 | 자리 |
|---|---|---|
| 404 (\`not-found.tsx\`) | \`hero\` — 화면 전체, 오른쪽에 큰 도형 | 헤더 밖 |
| 오류 (\`error.tsx\`) | \`hero\` | 헤더 밖 |
| 완료·실패 ([\`/result\`](/ia/purchase)) | \`center\` — 결과 아이콘 · 안내 · 단추 | 헤더와 푸터 사이 |
`;
}

// 도면과 화면이 어긋나면 문서를 만들지 않는다 — 어긋난 채로 만들면 그 문서가 거짓말을 한다.
const unknown = unknownScreens();
if (unknown.length > 0) {
  console.error(`매니페스트에 없는 화면이 갈래에 있다: ${unknown.join(', ')}`);
  process.exit(1);
}

mkdirSync(DOCS, { recursive: true });
writeFileSync(join(DOCS, 'index.md'), indexDoc(), 'utf8');
for (const group of IA_GROUPS) writeFileSync(join(DOCS, `${group.id}.md`), groupDoc(group), 'utf8');

console.log(`IA 갈래 ${IA_GROUPS.length}개 + 전체 1장 생성`);

const missing = ungrouped();
if (missing.length > 0) console.log(`갈래 없음(화면만 있음): ${missing.join(', ')}`);
