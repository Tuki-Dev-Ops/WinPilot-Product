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
