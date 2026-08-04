'use client';

import { useMemo, useState } from 'react';
import { CONTENT, COPY, productsInCategory, type CategoryNode } from '@winpilot/client-content';
import { PagedProductRow } from './ProductRailSection';

/**
 * 카테고리 탐색 — **왼쪽에서 1Depth 를 고르고, 오른쪽 위에서 2Depth 를 좁힌다.**
 *
 * 카테고리를 고를 때마다 화면을 옮기지 않는 이유는 둘러보는 동작이기 때문이다.
 * 옮겨 버리면 뒤로 가기를 눌러 가며 비교하게 된다.
 *
 * 2Depth 는 **누를 수 있어야** 뜻이 있다. 이름만 늘어놓으면 무엇을 위한 줄인지 알 수 없다.
 *
 * ## 어드민 연동
 * - 1Depth · 2Depth ← `b2c-admin` 상품 > 카테고리 (`/products/categories`)
 * - 숨김으로 둔 카테고리는 오지 않는다 (`visible: false`)
 */
export function CategoryExplorer() {
  const roots: CategoryNode[] = CONTENT.categories.filter((category) => !category.parentId);
  const [rootId, setRootId] = useState(roots[0]?.id ?? '');
  const [childId, setChildId] = useState('all');

  const children = useMemo(
    () => CONTENT.categories.filter((category) => category.parentId === rootId),
    [rootId],
  );

  const products = useMemo(() => {
    const inRoot = rootId ? productsInCategory(rootId) : [];
    if (childId === 'all') return inRoot;
    return inRoot.filter((product) => product.categoryChildId === childId);
  }, [rootId, childId]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <nav className="flex w-full shrink-0 gap-2 overflow-x-auto lg:w-56 lg:flex-col lg:overflow-visible">
        {roots.map((category) => {
          const active = category.id === rootId;
          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setRootId(category.id);
                // 대분류를 바꾸면 앞 분류의 2Depth 는 더 이상 유효하지 않다.
                setChildId('all');
              }}
              className={`flex shrink-0 items-center justify-between gap-3 whitespace-nowrap rounded-lg px-4 py-3 text-left text-sm transition-colors duration-150 ${
                active
                  ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                  : 'text-ink-muted hover:bg-surface'
              }`}
            >
              {category.name}
              <span className="shrink-0 text-xs tabular-nums text-ink-faint">
                {productsInCategory(category.id).length}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        {children.length > 0 && (
          <div role="tablist" aria-label={COPY.home.categoryTitle} className="flex flex-wrap items-center gap-2">
            {[{ id: 'all', name: '전체' }, ...children].map((child) => {
              const active = child.id === childId;
              return (
                <button
                  key={child.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setChildId(child.id)}
                  className={`h-8 shrink-0 whitespace-nowrap rounded-full px-3.5 text-xs transition-colors duration-150 ${
                    active ? 'bg-ink font-medium text-white' : 'bg-surface text-ink-muted hover:text-ink'
                  }`}
                >
                  {child.name}
                </button>
              );
            })}
          </div>
        )}

        {products.length === 0 ? (
          <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">{COPY.product.empty}</p>
        ) : (
          <PagedProductRow key={`${rootId}-${childId}`} products={products} perPage={3} />
        )}
      </div>
    </div>
  );
}
