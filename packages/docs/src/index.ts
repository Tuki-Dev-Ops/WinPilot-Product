import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 문서 읽기 — **파일 경로가 곧 주소**다.
 *
 *   docs/FSD/products/products.fsd.md     → /docs/fsd/products
 *   docs/NFS/responsive/responsive.nfs.md → /docs/nfs/responsive
 *   docs/page-view/products/index.md      → /docs/page-view/products
 *
 * 세 앱이 같은 규칙을 쓴다. 앱마다 읽는 코드를 두면 한쪽만 고쳐져 문서 주소가 갈라진다.
 *
 * 파일을 읽는 것은 **빌드 시점**이다. 서버 API 가 아니라 정적 생성 입력이므로
 * 프론트엔드 전용 규칙과 어긋나지 않는다.
 *
 * ## 폴더 이름은 대문자, 주소는 소문자
 * 폴더는 기획 문서의 관례를 따라 `FSD`·`NFS` 로 두고, 주소는 소문자만 쓴다(`docs/path.md` §2).
 * 둘을 잇는 곳이 여기 한 군데뿐이라야 리눅스(대소문자를 가림)와 윈도(가리지 않음)에서
 * 같은 주소가 나온다.
 */
export const DOC_DIRS = {
  fsd: 'FSD',
  nfs: 'NFS',
  'page-view': 'page-view',
} as const;

export type DocSection = keyof typeof DOC_DIRS;

/** 문서 뿌리 — Next 는 앱 폴더에서 돌므로 `cwd` 가 곧 그 앱이다. */
function docsRoot(): string {
  return join(process.cwd(), 'docs');
}

/** 주소에서 온 값으로 파일을 찾으므로 이름 모양을 먼저 본다 — 경로를 거슬러 올라가지 못하게. */
function safe(part: string): boolean {
  return /^[a-z0-9-]+$/.test(part);
}

export type DocEntry = {
  /** 주소에 쓰이는 이름 (소문자) */
  slug: string;
  /** 파일에 적힌 이름 — 대소문자가 섞일 수 있다 */
  file: string;
  /** 문서 첫 제목 */
  title: string;
};

/** 파일 첫 줄의 `# 제목` 을 읽는다. 없으면 이름을 그대로 쓴다. */
function titleOf(source: string, fallback: string): string {
  const line = source.split('\n').find((row) => row.startsWith('# '));
  return line ? line.slice(2).trim() : fallback;
}

function read(path: string): string | null {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

/**
 * 한 갈래의 문서 목록.
 *
 * **문서 하나가 폴더 하나다.** 폴더 이름이 곧 주소이고, 본문은 그 안의 마크다운 한 장이다.
 *
 *   FSD/products/products.fsd.md   → /docs/fsd/products
 *   NFS/responsive/responsive.nfs.md → /docs/nfs/responsive
 *   page-view/products/index.md    → /docs/page-view/products
 *
 * 파일로 늘어놓지 않는 이유: 화면 하나에 딸리는 것이 명세 한 장으로 끝나지 않는다. 캡처는
 * 이미 여러 장이고, 흐름도·조사 기록처럼 나중에 붙는 것도 그 화면의 것이다. 폴더가 있으면
 * 그때 옆에 넣으면 되고, 파일로 두면 그 순간 이름 규칙을 새로 만들어야 한다.
 *
 * 안의 파일 이름은 가리지 않는다 — `index.md` 든 `products.fsd.md` 든 폴더에 한 장만 있으면
 * 그것이 본문이다. 이름을 강제하면 갈래마다 규칙이 늘어난다.
 */
function bodyIn(dir: string, folder: string): string | null {
  const inside = readdirSync(join(dir, folder)).filter((name) => name.endsWith('.md'));
  if (inside.length === 0) return null;

  // 여러 장이면 `index.md` 를 먼저 보고, 없으면 이름순 첫 장을 본다.
  const pick = inside.includes('index.md') ? 'index.md' : inside.sort()[0];
  return pick ? join(dir, folder, pick) : null;
}

export function listSection(section: DocSection): DocEntry[] {
  const dir = join(docsRoot(), DOC_DIRS[section]);
  if (!existsSync(dir)) return [];

  const entries: DocEntry[] = [];

  for (const name of readdirSync(dir)) {
    const slug = name.toLowerCase();
    if (!safe(slug)) continue;

    const path = statSync(join(dir, name)).isDirectory() ? bodyIn(dir, name) : null;
    if (!path) continue;

    entries.push({ slug, file: name, title: titleOf(read(path) ?? '', name) });
  }

  return entries.sort((a, b) => a.slug.localeCompare(b.slug));
}

/** 갈래 안의 문서 한 장. 주소는 소문자이므로 실제 폴더 이름은 목록에서 찾아 맞춘다. */
export function readSectionDoc(section: DocSection, slug: string): string | null {
  if (!safe(slug)) return null;

  const entry = listSection(section).find((item) => item.slug === slug);
  if (!entry) return null;

  const dir = join(docsRoot(), DOC_DIRS[section]);
  const path = bodyIn(dir, entry.file);
  return path ? read(path) : null;
}

/** `docs/` 바로 아래의 한 장짜리 문서 — `/docs/ia` 처럼 갈래가 없는 것. */
export function readDoc(name: string): string | null {
  if (!/^[a-zA-Z0-9-]+$/.test(name)) return null;
  return read(join(docsRoot(), `${name}.md`));
}

/**
 * 이 문서 묶음을 **다시 만들 때** 쓰는 지시문.
 *
 * ## 왜 공유 패키지에 있나
 * 일곱 앱의 `/docs/prompt` 가 이 글을 그린다. 한때 앱마다 한 벌씩, **여든한 줄이 일곱 벌**
 * 들어 있었다. 그 상태에서 라우트가 셋 늘었는데(`/docs/path` · `/docs/coding-conventions` ·
 * `/docs/admin-mapping`) 일곱 벌 중 **한 벌도 고쳐지지 않았다** — 고칠 곳이 일곱이면 아무도
 * 고치지 않는다.
 *
 * 프롬프트 자체가 "특정 도메인에 묶이지 않는 문서 체계여야 한다" 고 말하고 있으므로,
 * 제품마다 다를 이유도 없다.
 */
export const DOCS_GENERATION_PROMPT = `# 역할
이 웹 애플리케이션의 시니어 프론트엔드 엔지니어이자 15년차 서비스 기획자로서,
문서(/docs)를 앱 안의 **진짜 라우트**로 만든다. 특정 도메인에 묶이지 않는 문서 체계여야 한다.

# 원칙
- 문서는 외부 산출물이 아니라 App Router 안의 페이지다. 서버 컴포넌트 우선 + generateMetadata.
- 문서 layout 에 robots noindex 를 건다. 사내 문서다.
- **없는 화면을 적지 않는다.** 있을 법한데 없는 것은 "가정" 절에 적는다.
- 서버·DB·권한·로그·구현 세부는 적지 않는다. 기획자가 읽는 문서다.

# 라우트
/docs                    개요
/docs/ia                 정보 구조
/docs/flow-chart         흐름도
/docs/fsd                기능 명세서 (화면 하나가 문서 하나)
/docs/nfs                비기능 명세서 (정책 하나가 문서 하나)
/docs/page-view          화면 캡처
/docs/components         컴포넌트 미리보기
/docs/design-system      디자인 시스템
/docs/path               주소 정의서
/docs/coding-conventions 명명규칙 정의서
/docs/admin-mapping      어드민 연동 (사내 콘솔은 /docs/deployment-mapping)
/docs/prompt             이 프롬프트

# 도면 규칙
- Mermaid 로 그리고 선은 전부 직각으로 돌린다:
  %%{init:{'flowchart':{'curve':'step','nodeSpacing':32,'rankSpacing':46},'theme':'neutral'}}%%
- 간선 라벨에 따옴표를 쓰지 않는다: -->|yes| (O), -->|"yes"| (X)
- 실선 = 정상, 점선(-.->) = 예외, 마름모({}) = 갈림길, 원통([( )]) = 값이 오는 곳.
- Mermaid 는 브라우저 전용이므로 클라이언트 컴포넌트의 useEffect 안에서 동적 import 한다.
- 카드마다 원본을 <details> 로 접어 두고, 누르면 전체 화면으로 확대한다
  (100% = 원래 크기 · +/−/리셋 · X·ESC·배경 클릭으로 닫기 · 여는 동안 body 스크롤 잠금).
- **카드 폭에 맞춰 줄이지 않는다.** 줄인 도면은 글자가 뭉개져 아무것도 읽히지 않는다.

# 기능 명세(FSD) — 화면마다 14절
1 문서 정보 · 2 목적과 배경 · 3 화면 구성 · 4 데이터 항목 · 5 기능 명세 · 6 버튼과 이벤트
7 사용자 시나리오 · 8 예외 처리 · 9 검증 규칙 · 10 화면 상태 · 11 UX 정책 · 12 화면 정책
13 인수 조건(Given/When/Then) · 14 향후 확장
해당 없는 절은 비워 두지 말고 **N/A 라고 적는다** — 빈 절은 "아직 안 정했다" 로도 읽힌다.

# 비기능 명세(NFS) — 정책마다 6절
목적 · 적용 범위 · 정책 · 세부 기준(표) · 예외 · 점검 항목
접근성 · 브라우저 · 반응형 · UX · 검증 · 오류 문구 · 업로드 · 검색 · 정렬 · 페이징 · 알림 ·
개인정보 · 날짜 · 언어 · 용어 · 유지보수 · 공통 정책
아직 쓰지 않는 것도 "현재 미사용" 이라 적고 기준은 정해 둔다.

# 가장 중요한 것
명세는 **생성물**이어야 한다. 원본을 코드 안(lib/screen-specs.ts) 한 곳에 두고 스크립트가
문서를 펼친다. 손으로 적으면 화면을 고칠 때 문서가 남고, 남은 문서는 곧 거짓말이 된다.

원본이 화면을 따라가는지는 \`pnpm docs:check\` 가 세고, 문서를 펼치는 것은
\`pnpm docs:build\` 다. 생성물은 커밋한다 — 받는 사람이 스크립트를 돌리지 않아도 읽혀야 한다.

# 제출
빌드 · 타입검사 · 이름 검사(\`pnpm spec:check\`) · 컴포넌트 싱크(\`pnpm sync:check\`) ·
문서 커버리지(\`pnpm docs:check\`) 가 모두 통과해야 한다.
`;

/*
  파일을 읽어서 그리는 조각 둘.

  `./ui` 가 아니라 여기 있는 이유: 이 둘은 `listSection()` 을 부르므로 `node:fs` 에 묶인다.
  받은 값만 그리는 `DocHeader` 셋과 진입점을 갈라 두어야, 브라우저로 가는 번들에 파일 읽기가
  섞이지 않는다.
*/
export { PROJECT_PURPOSE } from './purpose';
export { SectionList } from './SectionList';
export { ScreenShots, ScreenShotView, type ScreenShot } from './ScreenShots';
export { SectionNav } from './SectionNav';
export type { NavGroup, NavLink } from './nav';
