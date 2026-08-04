import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { IA_GROUPS } from './ia-groups';

/**
 * 템플릿 문서.
 *
 * 문서는 `docs/` 폴더의 마크다운이고, **파일 경로가 곧 주소**다.
 *
 *   docs/flow.md                → /flow
 *   docs/ia/purchase.md         → /ia/purchase
 *   docs/feature/products.md    → /feature/products
 *
 * 문서를 따로 배포하거나 위키에 올리지 않는 이유는, 화면과 문서가 **같은 레포에서 같이 바뀌어야**
 * 어긋나지 않기 때문이다. 문서를 고치지 않고 화면만 고치면 주소를 열었을 때 바로 드러난다.
 *
 * 파일을 읽는 것은 **빌드 시점**이다. 서버 API 가 아니라 정적 생성 입력이므로
 * 프론트엔드 전용 규칙과 어긋나지 않는다.
 *
 * ## 문서에는 세 가지 모양이 있다
 * - **한 장** (`DOC_TITLES`) — 그대로 그린다.
 * - **화면별 묶음** (`DOC_GROUPS`) — 화면이 26개라 카드 목록과 왼쪽 목록으로 고른다.
 * - **갈래 묶음** (`TAB_GROUPS`) — 갈래가 예닐곱이라 **상단 탭**으로 고른다. 탭은 한눈에 다
 *   보여서 "무엇이 있는지" 를 먼저 알려 준다. 화면별 묶음에 탭을 쓰면 26개가 줄바꿈되어 넘친다.
 *
 * ## 어드민 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
 */
const DOCS_DIR = join(process.cwd(), 'docs');

/** 한 장짜리 문서 — 주소에 그대로 쓰이는 이름과 화면에 보이는 제목 */
export const DOC_TITLES: Record<string, string> = {
  flow: 'Flow Chart',
  path: 'Path 정의서',
  naming: '명명규칙 정의서',
  'admin-sync': '어드민 연동 명세',
  'non-functional-rules': '비기능 규칙',
  component: '컴포넌트 정의서',
  design: '디자인 시스템',
};

/** 화면별로 갈라지는 문서 묶음 — 폴더 하나가 묶음 하나다 */
export const DOC_GROUPS: Record<string, string> = {
  feature: '기능 명세서',
  'non-functional': '비기능 명세서',
  'page-view': 'Page View',
};

/** 갈래를 상단 탭으로 가르는 묶음. 묶음 자체(`/ia`)는 `index.md` 를 그린다. */
export const TAB_GROUPS: Record<string, string> = {
  ia: 'IA',
};

export type DocEntry = { slug: string; title: string };
export type NavLink = { href: string; label: string };

/**
 * 왼쪽 문서 목록.
 *
 * 탭이 아니라 세로 목록인 이유: 문서가 열한 장이라 탭으로 두면 좁은 너비에서 두 줄로 접히고,
 * 접힌 줄은 "더 있다" 는 것을 알려 주지 못한다. 목록은 위에서 아래로 다 보인다.
 * 갈래 나눔(구조·화면별·규칙)은 읽는 순서다 — 무엇이 있는지 → 화면 하나하나 → 지켜야 할 것.
 */
export function docNav(): Array<{ title: string; items: NavLink[] }> {
  return [
    {
      title: '구조',
      items: [
        { href: '/docs', label: '전체' },
        { href: '/ia', label: 'IA' },
        { href: '/flow', label: 'Flow Chart' },
      ],
    },
    {
      title: '화면별',
      items: [
        { href: '/feature', label: '기능 명세서' },
        { href: '/non-functional', label: '비기능 명세서' },
        { href: '/page-view', label: 'Page View' },
      ],
    },
    {
      title: '규칙',
      items: [
        { href: '/admin-sync', label: '어드민 연동' },
        { href: '/path', label: 'Path' },
        { href: '/naming', label: '명명규칙' },
        { href: '/non-functional-rules', label: '비기능 규칙' },
        { href: '/component', label: '컴포넌트' },
        { href: '/design', label: '디자인' },
      ],
    },
  ];
}

/**
 * 갈래 묶음의 상단 탭. 맨 앞은 늘 `전체` 다 — 갈래로 나눠 놓아도 전체를 보고 싶은 때가 있다.
 *
 * 탭 목록을 화면에 적지 않고 갈래 원본에서 읽는다. 적으면 갈래를 하나 늘렸을 때 문서는 생기고
 * 탭은 그대로여서 주소를 아는 사람만 볼 수 있게 된다.
 */
export function groupTabs(group: string): NavLink[] {
  if (group !== 'ia') return [];
  return [
    { href: '/ia', label: '전체' },
    ...IA_GROUPS.map((item) => ({ href: `/ia/${item.id}`, label: item.label })),
  ];
}

export function listDocs(): DocEntry[] {
  return Object.keys(DOC_TITLES)
    .filter((slug) => existsSync(join(DOCS_DIR, `${slug}.md`)))
    .map((slug) => ({ slug, title: DOC_TITLES[slug] ?? slug }));
}

/** 묶음 안의 문서들. 파일 이름은 화면 id 라 매니페스트 순서를 따로 주지 않는다. */
export function listGroupDocs(group: string): DocEntry[] {
  const dir = join(DOCS_DIR, group);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.replace(/\.md$/, ''))
    .map((slug) => ({ slug, title: slug }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

/** 주소에서 온 값으로 파일을 찾으므로 이름 모양을 먼저 본다 — 경로를 거슬러 올라가지 못하게. */
function safe(part: string): boolean {
  return /^[a-z0-9-]+$/.test(part);
}

export function readDoc(slug: string, group?: string): string | null {
  if (!safe(slug)) return null;
  if (group && !safe(group)) return null;

  try {
    return readFileSync(group ? join(DOCS_DIR, group, `${slug}.md`) : join(DOCS_DIR, `${slug}.md`), 'utf8');
  } catch {
    return null;
  }
}

export function docTitle(slug: string): string {
  return DOC_TITLES[slug] ?? DOC_GROUPS[slug] ?? TAB_GROUPS[slug] ?? slug;
}
