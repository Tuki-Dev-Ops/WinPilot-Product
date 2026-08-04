import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 문서 읽기 — **파일 경로가 곧 주소**다.
 *
 *   docs/FSD/products.md            → /docs/fsd/products
 *   docs/NFS/Responsive.md          → /docs/nfs/responsive
 *   docs/page-view/products/index.md → /docs/page-view/products
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
 * `page-view` 는 화면 하나가 폴더 하나이고 본문은 그 안의 `index.md` 다 — 그림이 화면마다
 * 여러 장이라 한 폴더에 모아 두지 않으면 파일 이름으로 화면을 가려내야 한다.
 * `FSD`·`NFS` 는 문서 하나가 파일 하나다.
 */
export function listSection(section: DocSection): DocEntry[] {
  const dir = join(docsRoot(), DOC_DIRS[section]);
  if (!existsSync(dir)) return [];

  const entries: DocEntry[] = [];

  for (const name of readdirSync(dir)) {
    const isFolder = existsSync(join(dir, name, 'index.md'));
    const isFile = name.endsWith('.md');
    if (!isFolder && !isFile) continue;

    const file = isFolder ? name : name.replace(/\.md$/, '');
    const slug = file.toLowerCase();
    if (!safe(slug)) continue;

    const source = read(isFolder ? join(dir, name, 'index.md') : join(dir, name)) ?? '';
    entries.push({ slug, file, title: titleOf(source, file) });
  }

  return entries.sort((a, b) => a.slug.localeCompare(b.slug));
}

/** 갈래 안의 문서 한 장. 주소는 소문자이므로 실제 파일 이름은 목록에서 찾아 맞춘다. */
export function readSectionDoc(section: DocSection, slug: string): string | null {
  if (!safe(slug)) return null;

  const entry = listSection(section).find((item) => item.slug === slug);
  if (!entry) return null;

  const dir = join(docsRoot(), DOC_DIRS[section]);
  return read(join(dir, entry.file, 'index.md')) ?? read(join(dir, `${entry.file}.md`));
}

/** `docs/` 바로 아래의 한 장짜리 문서 — `/docs/ia` 처럼 갈래가 없는 것. */
export function readDoc(name: string): string | null {
  if (!/^[a-zA-Z0-9-]+$/.test(name)) return null;
  return read(join(docsRoot(), `${name}.md`));
}
