import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 템플릿 문서.
 *
 * 문서는 `docs/` 폴더의 마크다운이고, 파일 이름이 곧 주소다 — `docs/ia.md` → `/ia`.
 * 문서를 따로 배포하거나 위키에 올리지 않는 이유는, 화면과 문서가 **같은 레포에서 같이 바뀌어야**
 * 어긋나지 않기 때문이다. 문서를 고치지 않고 화면만 고치면 주소를 열었을 때 바로 드러난다.
 *
 * 파일을 읽는 것은 **빌드 시점**이다. 서버 API 가 아니라 정적 생성 입력이므로
 * 프론트엔드 전용 규칙과 어긋나지 않는다.
 */
const DOCS_DIR = join(process.cwd(), 'docs');

/** 주소에 그대로 쓰이는 문서 이름과 화면에 보이는 제목 */
export const DOC_TITLES: Record<string, string> = {
  path: 'Path 정의서',
  naming: '명명규칙 정의서',
  flow: 'Flow Chart',
  ia: 'IA',
  component: '컴포넌트 정의서',
  design: '디자인 시스템',
  feature: '기능 명세서',
  'non-functional': '비기능 명세서',
};

export type DocEntry = { slug: string; title: string };

export function listDocs(): DocEntry[] {
  const files = readdirSync(DOCS_DIR).filter((name) => name.endsWith('.md'));
  return files
    .map((name) => name.replace(/\.md$/, ''))
    .map((slug) => ({ slug, title: DOC_TITLES[slug] ?? slug }))
    .sort((a, b) => a.title.localeCompare(b.title, 'ko'));
}

export function readDoc(slug: string): string | null {
  // 주소에서 온 값으로 파일을 찾으므로, 등록된 이름만 허용한다 — 경로를 거슬러 올라가지 못하게.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    return readFileSync(join(DOCS_DIR, `${slug}.md`), 'utf8');
  } catch {
    return null;
  }
}

export function docTitle(slug: string): string {
  return DOC_TITLES[slug] ?? slug;
}
