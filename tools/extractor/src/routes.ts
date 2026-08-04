import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const PAGE_FILES = new Set(['page.tsx', 'page.ts', 'page.jsx', 'page.js']);

/**
 * Next.js App Router 디렉터리에서 실제 라우트를 찾아낸다.
 *
 * 매니페스트에 등록되지 않은 라우트를 검출하는 것이 목적이다 —
 * 페이지를 만들고 등록을 잊으면 Figma 에 그 페이지가 영영 생기지 않는데,
 * 아무도 그 사실을 모른 채 "싱크 100%" 리포트를 받게 된다.
 */
export function discoverRoutes(appDir: string): string[] {
  const routes: string[] = [];

  const walk = (dir: string, segments: string[]): void => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.isFile() && PAGE_FILES.has(entry.name)) {
        routes.push(`/${segments.join('/')}` === '/' ? '/' : `/${segments.join('/')}`);
      }
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const name = entry.name;

      // 비라우트 디렉터리
      if (name.startsWith('_') || name.startsWith('.') || name === 'node_modules') continue;
      // 라우트 그룹 `(marketing)` 은 URL 에 나타나지 않는다
      if (name.startsWith('(') && name.endsWith(')')) {
        walk(join(dir, name), segments);
        continue;
      }
      // 병렬 라우트 `@modal` 은 별도 URL 이 아니다
      if (name.startsWith('@')) continue;

      walk(join(dir, name), [...segments, name]);
    }
  };

  walk(appDir, []);
  return [...new Set(routes)].sort();
}
