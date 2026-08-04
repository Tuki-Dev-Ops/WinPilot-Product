import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 템플릿 문서.
 *
 * 문서는 `docs/` 폴더의 마크다운이고, **파일 경로가 곧 주소**다.
 *
 *   docs/ia.md                  → /ia
 *   docs/feature/products.md    → /feature/products
 *
 * 문서를 따로 배포하거나 위키에 올리지 않는 이유는, 화면과 문서가 **같은 레포에서 같이 바뀌어야**
 * 어긋나지 않기 때문이다. 문서를 고치지 않고 화면만 고치면 주소를 열었을 때 바로 드러난다.
 *
 * 파일을 읽는 것은 **빌드 시점**이다. 서버 API 가 아니라 정적 생성 입력이므로
 * 프론트엔드 전용 규칙과 어긋나지 않는다.
 *
 * ## 어드민 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
 */
const DOCS_DIR = join(process.cwd(), 'docs');

/** 한 장짜리 문서 — 주소에 그대로 쓰이는 이름과 화면에 보이는 제목 */
export const DOC_TITLES: Record<string, string> = {
  ia: 'IA',
  flow: 'Flow Chart',
  path: 'Path 정의서',
  naming: '명명규칙 정의서',
  'admin-sync': '어드민 연동 명세',
  component: '컴포넌트 정의서',
  design: '디자인 시스템',
  'non-functional-rules': '비기능 규칙',
};

/** 화면별로 갈라지는 문서 묶음 — 폴더 하나가 묶음 하나다 */
export const DOC_GROUPS: Record<string, string> = {
  feature: '기능 명세서',
  'non-functional': '비기능 명세서',
  'page-view': 'Page View',
};

export type DocEntry = { slug: string; title: string };

/** 상단 탭 — 왼쪽부터 읽는 순서다: 구조 → 흐름 → 화면별 명세 → 규칙 */
export function docTabs(): Array<{ href: string; label: string }> {
  return [
    { href: '/docs', label: '전체' },
    { href: '/ia', label: 'IA' },
    { href: '/flow', label: 'Flow Chart' },
    { href: '/feature', label: '기능 명세서' },
    { href: '/non-functional', label: '비기능 명세서' },
    { href: '/page-view', label: 'Page View' },
    { href: '/admin-sync', label: '어드민 연동' },
    { href: '/path', label: 'Path' },
    { href: '/naming', label: '명명규칙' },
    { href: '/component', label: '컴포넌트' },
    { href: '/design', label: '디자인' },
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
  return DOC_TITLES[slug] ?? DOC_GROUPS[slug] ?? slug;
}
