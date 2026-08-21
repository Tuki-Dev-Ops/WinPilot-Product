import { writeFileSync } from 'node:fs';
import { FEATURES, VIEW_META, type ViewId } from '@winpilot/spec';
import { pages as b2cClientPages } from '../apps/b2c-client-a/pages.manifest';
import { pages as b2cAdminPages } from '../apps/b2c-admin/pages.manifest';
import { pages as internalPages } from '../apps/internal-admin/pages.manifest';
import { pages as irAdminPages } from '../apps/ir-admin/pages.manifest';
import { pages as irClientPages } from '../apps/ir-client-a/pages.manifest';
import { pages as fnbAdminPages } from '../apps/fnb-admin/pages.manifest';
import { pages as fnbClientPages } from '../apps/fnb-client-a/pages.manifest';
import { SCREEN_SPECS as b2cClientSpecs } from '../apps/b2c-client-a/lib/screen-specs';
import { SCREEN_SPECS as b2cAdminSpecs } from '../apps/b2c-admin/lib/screen-specs';
import { SCREEN_SPECS as internalSpecs } from '../apps/internal-admin/lib/screen-specs';
import { SCREEN_SPECS as irAdminSpecs } from '../apps/ir-admin/lib/screen-specs';
import { SCREEN_SPECS as irClientSpecs } from '../apps/ir-client-a/lib/screen-specs';
import { SCREEN_SPECS as fnbAdminSpecs } from '../apps/fnb-admin/lib/screen-specs';
import { SCREEN_SPECS as fnbClientSpecs } from '../apps/fnb-client-a/lib/screen-specs';

/**
 * 저장소 첫 화면(`README.md`)을 **명세에서 뽑아** 만든다.
 *
 * ## 왜 손으로 안 쓰나
 * 이 글의 알맹이는 숫자와 목록이다 — 앱이 몇 벌이고 화면이 몇 개이며 그 화면이 각각 무엇을
 * 하는가. 손으로 옮겨 적으면 화면이 하나 늘 때 고칠 곳이 둘이 되고, 실제로는 한쪽만 고친다.
 *
 * 이번에도 그 일이 있었다. IR 사이트에서 화면 열하나를 지웠을 때 그 수가 여러 문서에 적혀
 * 있었다면 어디는 서른이고 어디는 열아홉으로 남았을 것이다.
 *
 * ## 떼어 낸 저장소의 README 와 같은 차례로 둔다
 * `spaceplanning-client` · `spaceplanning-admin` 이 배경 → 목적 → 범위 → 기능 명세서 →
 * 디렉토리 순으로 서 있다. 여기만 다른 차례로 두면 세 저장소를 오가는 사람이 매번 찾는
 * 자리가 달라진다.
 *
 * ```
 * pnpm readme:build
 * ```
 */

type Row = { id: string; name: string; route: string };
type Spec = { screen: string; purpose: string };

type App = {
  dir: string;
  label: string;
  view: ViewId;
  role: string;
  pages: readonly Row[];
  specs: readonly Spec[];
};

const APPS: App[] = [
  {
    dir: 'b2c-client-a',
    label: 'B2C 쇼핑몰',
    view: 'b2c-client',
    role: '고객 화면',
    pages: b2cClientPages,
    specs: b2cClientSpecs,
  },
  { dir: 'b2c-admin', label: 'B2C 콘솔', view: 'b2c-admin', role: '운영 콘솔', pages: b2cAdminPages, specs: b2cAdminSpecs },
  {
    dir: 'ir-client-a',
    label: 'IR 회사 홈페이지',
    view: 'ir-client',
    role: '고객 화면',
    pages: irClientPages,
    specs: irClientSpecs,
  },
  { dir: 'ir-admin', label: 'IR 콘솔', view: 'ir-admin', role: '운영 콘솔', pages: irAdminPages, specs: irAdminSpecs },
  {
    dir: 'fnb-client-a',
    label: 'F&B 브랜드 사이트',
    view: 'fnb-client',
    role: '고객 화면',
    pages: fnbClientPages,
    specs: fnbClientSpecs,
  },
  { dir: 'fnb-admin', label: 'F&B 콘솔', view: 'fnb-admin', role: '운영 콘솔', pages: fnbAdminPages, specs: fnbAdminSpecs },
  {
    dir: 'internal-admin',
    label: '사내 콘솔',
    view: 'internal-admin',
    role: '사내 전용',
    pages: internalPages,
    specs: internalSpecs,
  },
];

const featureCount = (view: ViewId): number => FEATURES.filter((one) => view in one.views).length;

const screens = APPS.reduce((sum, one) => sum + one.pages.length, 0);

const overview = APPS.map(
  (app) =>
    `| ${app.label} | \`apps/${app.dir}\` | ${app.role} | ${VIEW_META[app.view].port} | ${app.pages.length} | ${featureCount(app.view)} |`,
).join('\n');

const detail = APPS.map((app) => {
  const byId = new Map(app.specs.map((one) => [one.screen, one]));
  const rows = app.pages
    .map((page) => `| \`${page.route}\` | ${page.name} | ${byId.get(page.id)?.purpose ?? '—'} |`)
    .join('\n');

  return `### ${app.label} — \`apps/${app.dir}\` · 화면 ${app.pages.length}개

| 주소 | 화면 | 목적 |
|---|---|---|
${rows}`;
}).join('\n\n');

const doc = `# WinPilot Product

세 업종의 웹 화면을 한 저장소에서 만듭니다. 고객이 보는 사이트 셋과 그 내용을 고치는 운영
콘솔 셋, 그리고 그 셋을 함께 들여다보는 사내 콘솔 하나입니다.

## 프로젝트 배경

같은 업종의 사이트를 새로 만들 때마다 화면을 처음부터 그리고, 색과 간격을 화면마다 다시
정하고, 명세를 따로 쓰는 일이 되풀이되었습니다. 그렇게 만든 결과물은 두어 달 뒤 같은 회색이
네 가지가 되고, 문서는 화면을 따라오지 못한 채 남습니다.

이 저장소는 그 되풀이를 줄이려고 시작했습니다. 업종마다 **템플릿 한 벌**을 갖추고, 색과
간격은 한 파일에서만 정하며, 명세는 화면 등록부에서 펼쳐 냅니다. 어긋남은 사람이 기억하지
않고 검사가 잡습니다.

## 프로젝트 목적

- 업종마다 **고객 화면과 운영 콘솔을 한 쌍**으로 갖춥니다. 사이트만 만들면 문구 한 줄을 고치는 데 개발자와 배포가 필요합니다.
- 콘솔과 사이트가 **같은 값 한 곳**을 읽습니다. 두 벌로 두면 "콘솔에서 본 값과 사이트에 뜬 값이 다르다" 가 되고, 그때부터 어느 쪽이 맞는지 아무도 답할 수 없습니다.
- 색과 글자, 간격의 **원본을 한 파일**에 둡니다. 앱에서 색을 직접 선언하는 순간 디자인 시스템이 두 벌이 됩니다.
- 명세를 **화면 등록부에서 생성**합니다. 생성된 문서를 고치면 다음 실행 때 지워지는데, 고칠 곳이 하나여야 두 문서가 서로 다른 말을 하지 않습니다.
- 어긋남의 **종류마다 검사를 따로** 둡니다. 하나가 나머지를 대신하지 못합니다.

목적과 배경을 더 자세히 적은 글이 앱 안에 있습니다 — 아무 앱이나 띄운 뒤 \`/docs/purpose\`.

## 업무 범위

앱 **${APPS.length}벌**, 화면 **${screens}개**, 기능 **${FEATURES.length}가지**입니다.

| 앱 | 폴더 | 성격 | 포트 | 화면 | 기능 |
|---|---|---|---|---|---|
${overview}

기능 수를 앱마다 따로 세는 데에는 이유가 있습니다. 하나의 기능이 고객 화면과 운영 콘솔
양쪽에 걸리면 실제로 만들어야 할 화면은 둘이기 때문입니다. 그래서 앱별 합계
(${APPS.reduce((sum, one) => sum + featureCount(one.view), 0)})는 기능 가짓수(${FEATURES.length})보다 큽니다.

### 하는 것

| 항목 | 내용 |
|---|---|
| 화면 | 위 표의 ${screens}개. 문서 화면(\`/docs/**\`)도 실제 라우트입니다 |
| 문서 | 목적과 배경 · 전체 범위 · IA · 흐름도 · 기능 명세 · 비기능 명세 · 화면 사진 |
| 디자인 | 색과 글자, 간격을 담은 토큰 한 벌(\`packages/tokens\`). 일곱 앱이 이것만 바라봅니다 |
| 검사 | 이름 · 문서 · 값의 출처 · 가로 넘침 · 화면 무게 |
| Figma 연동 | 화면을 다시 Figma 로 뽑는 추출기와 플러그인(\`tools/extractor\` · \`figma-plugin\`) |

### 하지 않는 것

| 항목 | 지금 상태 |
|---|---|
| 서버 · API | 두지 않았습니다. 값은 \`packages/store\` 한 곳에 있습니다 |
| 데이터베이스 | 같은 이유로 두지 않았습니다. 서버가 붙더라도 바뀌는 것은 store 가 값을 어디서 받아 오는가뿐입니다 |
| 로그인 · 권한 | 화면까지만 있습니다. 입력한 값은 어디로도 전송되지 않습니다 |
| 결제 | 화면까지만 있습니다. PG 연동은 사내 콘솔의 설정 화면으로만 존재합니다 |
| 메일 · 알림 발송 | 없습니다. 문의와 구독은 값을 받는 양식까지 만들었습니다 |
| 배포 · 운영 | 아직입니다. 지금은 개발 서버로 띄워 확인하는 단계입니다 |

범위를 이야기할 때 가장 자주 나오는 질문이라 함께 적었습니다. 적어 두지 않으면 있는 것으로
읽히기 때문입니다.

## 기능 명세서

화면 하나가 문서 한 장입니다. 목적과 배경, 구성, 데이터 항목, 기능, 버튼, 시나리오, 예외,
검증, 상태, 정책, 인수 조건까지 열네 절로 적혀 있고, 앱을 띄운 뒤 \`/docs/fsd\` 에서
보실 수 있습니다.

아래 표는 \`apps/*/pages.manifest.ts\` 와 \`lib/screen-specs.ts\` 에서 뽑은 것입니다. 화면을
더하면 그 두 곳만 고치면 되고, 문서는 \`pnpm docs:build\` 가 다시 펼칩니다.

${detail}

## 디렉토리

\`\`\`
WinPilot-Product/
├─ apps/                     앱 ${APPS.length}벌
│  └─ <앱>/
│     ├─ app/                화면 (Next App Router)
│     │  └─ docs/            문서 화면 — 목적 · 범위 · IA · 명세 · 화면 사진
│     ├─ lib/                화면 명세 · IA · 흐름 · 내비게이션
│     ├─ docs/               생성된 명세와 화면 사진 목록
│     ├─ public/             사진과 영상
│     └─ pages.manifest.ts   화면 등록부 — 여기 없는 화면은 검사에 잡히지 않습니다
├─ packages/                 앱들이 나눠 쓰는 조각
├─ tools/                    검사기와 문서 생성기
├─ figma-plugin/             화면을 Figma 로 옮기는 플러그인
└─ docs/                     저장소 전체에 걸리는 규칙과 정책
\`\`\`

| 패키지 | 무엇 |
|---|---|
| \`@winpilot/store\` | 화면에 나오는 값. 서버가 없어 이 패키지가 그 자리를 대신합니다 |
| \`@winpilot/ui\` | 버튼 · 입력 · 표처럼 화면을 가리지 않고 쓰는 조각 |
| \`@winpilot/tokens\` | 색 · 글자 · 간격. 값의 원본이 이 한 곳입니다 |
| \`@winpilot/docs\` | 문서 화면을 그리는 조각과 공통 문서 |
| \`@winpilot/spec\` | 기능 레지스트리 — 이름과 주소의 규칙 |
| \`@winpilot/uir\` | IR · F&B 계열에서 쓰는 조각 |
| \`@winpilot/geo\` | 행정구역 경계 데이터 |
| \`@winpilot/client-content\` | 고객 화면이 읽는 모양으로 값을 옮겨 담는 층 |

## 시작하기

\`\`\`bash
pnpm install

pnpm dev:client       # 쇼핑몰        http://localhost:3310
pnpm dev:admin        # B2C 콘솔      http://localhost:3301
pnpm dev:ir           # IR 홈페이지    http://localhost:3304
pnpm dev:ir-admin     # IR 콘솔       http://localhost:3303
pnpm dev:fnb          # F&B 사이트     http://localhost:3305
pnpm dev:fnb-admin    # F&B 콘솔      http://localhost:3306
pnpm dev:internal     # 사내 콘솔      http://localhost:3302
\`\`\`

\`pnpm -r dev\` 로 한 번에 띄우지 않습니다 — 하나가 죽으면 나머지가 함께 내려가고, 어느 것이
먼저 죽었는지 로그에 남지 않습니다.

## 검사

\`\`\`bash
pnpm spec:check      # 이름과 주소, 매니페스트가 레지스트리와 맞는지
pnpm sync:check      # 레지스트리에 적힌 컴포넌트 이름이 실제 파일에도 그대로인지
pnpm docs:check      # 화면은 있는데 문서가 비어 있는 자리가 있는지
pnpm bind:check      # 화면이 적어 둔 값의 출처가 아직 남아 있는지
pnpm overflow:check  # 네 가지 너비에서 가로로 넘치는 곳이 있는지 (개발 서버 필요)
pnpm weight:check    # 화면 하나가 실제로 몇 바이트를 내려받는지 (빌드 후 next start 기준)
pnpm typecheck       # 전체 워크스페이스 타입 검사
pnpm build           # 전체 빌드
\`\`\`

검사를 여럿 두는 것은 하나가 나머지를 대신하지 못하기 때문입니다. 실제로 운영 콘솔에서 화면
열 개를 지웠을 때 고객 화면 열일곱 곳이 이미 없어진 메뉴를 계속 가리키고 있었는데, 그 시점에
나머지 검사는 모두 통과 상태였습니다. \`bind:check\` 는 그 일을 겪고 나서 만들었습니다.

## 문서 만들기

\`\`\`bash
pnpm docs:build      # 화면 등록부에서 기능 · 비기능 명세와 전체 범위를 펼칩니다
pnpm pages:shoot     # 앱마다 화면 사진을 한 장씩 찍습니다 (개발 서버 필요)
pnpm readme:build    # 이 파일을 다시 만듭니다
\`\`\`

본 README 는 **생성 문서**입니다. 화면 목록과 집계 수치를 직접 작성하면 화면 추가 시 수정
대상이 두 곳이 되며, 일부만 갱신되는 문제가 발생합니다.

## 분리 배포 저장소

IR 한 쌍은 별도 저장소로도 배포합니다.

| 저장소 | 포함 범위 |
|---|---|
| \`spaceplanning-ai/spaceplanning-client\` | \`apps/ir-client-a\` 와 해당 앱이 사용하는 패키지 5개 |
| \`spaceplanning-ai/spaceplanning-admin\` | \`apps/ir-admin\` 과 해당 앱이 사용하는 패키지 7개 |

공유 패키지가 3개 저장소에 동일한 사본으로 포함됩니다. \`@winpilot/store\` 는 사이트와 콘솔이
**동일한 데이터를 조회하는 것을 전제**로 설계한 패키지이므로 원본 저장소를 먼저 확정해야
합니다. 양쪽에서 개별 수정하면 본 저장소가 방지하려는 데이터 불일치가 발생합니다.
`;

writeFileSync('README.md', doc, 'utf8');
console.log(`README.md — 앱 ${APPS.length} · 화면 ${screens} · 기능 ${FEATURES.length}`);
