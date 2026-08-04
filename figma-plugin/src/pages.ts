import { figmaPageName, maxOrder, sortPages, type PageSpec } from '@winpilot/uir';

const PAGE_ID_KEY = 'ssot:pageId';

/**
 * 페이지 매칭은 **이름이 아니라 pluginData** 로 한다.
 * 사용자가 Figma 에서 페이지 이름을 바꿔도 같은 페이지를 계속 추적해야
 * 재실행 때 중복 페이지가 생기지 않는다.
 */
function findPage(pageId: string): PageNode | undefined {
  for (const page of figma.root.children) {
    if (page.getPluginData(PAGE_ID_KEY) === pageId) return page;
  }
  return undefined;
}

export type PageSyncResult = {
  created: number;
  reused: number;
  archived: string[];
};

/**
 * 매니페스트 순서대로 페이지를 만들고 이름을 `{순번}. {이름}` 으로 강제한 뒤,
 * 루트에 order 오름차순으로 재삽입한다 (요구사항 1.2).
 */
export async function syncPages(specs: PageSpec[]): Promise<{ pages: Map<string, PageNode>; result: PageSyncResult }> {
  // 동적 페이지 로딩 문서에서는 전체 페이지를 먼저 읽어야 root.children 을 만질 수 있다.
  const dynamic = figma as unknown as { loadAllPagesAsync?: () => Promise<void> };
  if (typeof dynamic.loadAllPagesAsync === 'function') {
    await dynamic.loadAllPagesAsync();
  }

  const ordered = sortPages(specs);
  const width = maxOrder(ordered);
  const pages = new Map<string, PageNode>();
  const result: PageSyncResult = { created: 0, reused: 0, archived: [] };

  for (const spec of ordered) {
    let page = findPage(spec.id);
    if (page) {
      result.reused += 1;
    } else {
      page = figma.createPage();
      page.setPluginData(PAGE_ID_KEY, spec.id);
      result.created += 1;
    }

    page.name = figmaPageName(spec, width);
    for (const child of page.children) child.remove();
    pages.set(spec.id, page);
  }

  // 매니페스트에 없는 페이지는 지우지 않는다 — 사용자의 작업물일 수 있다.
  // 대신 접두어로 표시하고 뒤로 밀어낸다.
  const managed = new Set(pages.values());
  for (const page of figma.root.children) {
    if (managed.has(page)) continue;
    if (!page.name.startsWith('_archive/')) {
      page.name = `_archive/${page.name}`;
      result.archived.push(page.name);
    }
  }

  // 물리 정렬: order 오름차순으로 루트 앞쪽부터 재삽입한다.
  ordered.forEach((spec, index) => {
    const page = pages.get(spec.id);
    if (page) figma.root.insertChild(index, page);
  });

  return { pages, result };
}
