'use client';

import { useState } from 'react';
import { CONTENT, COPY, productsInCategory, type CategoryNode } from '@winpilot/client-content';
import { PagedProductRow } from './ProductRailSection';

/**
 * 카테고리 탐색 — **왼쪽에서 분류를 고르고 오른쪽에 상품이 깔린다.**
 *
 * 카테고리를 고를 때마다 화면을 옮기지 않는 이유는, 둘러보는 동작이기 때문이다.
 * 옮겨 버리면 뒤로 가기를 눌러 가며 비교하게 된다. 깊게 보려는 사람을 위해
 * 각 분류에는 목록 화면으로 가는 링크를 함께 둔다.
 *
 * 고른 분류는 **1Depth** 다 — 그 아래 2Depth 상품까지 함께 나온다 (`productsInCategory`).
 */
export function CategoryExplorer() {
  const roots: CategoryNode[] = CONTENT.categories.filter((category) => !category.parentId);
  const [activeId, setActiveId] = useState(roots[0]?.id ?? '');

  const products = activeId ? productsInCategory(activeId) : [];
  const children = CONTENT.categories.filter((category) => category.parentId === activeId);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <nav className="flex w-full shrink-0 gap-2 overflow-x-auto lg:w-56 lg:flex-col lg:overflow-visible">
        {roots.map((category) => {
          const isActive = category.id === activeId;
          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveId(category.id)}
              className={`flex shrink-0 items-center justify-between gap-3 whitespace-nowrap rounded-lg px-4 py-3 text-left text-sm transition-colors duration-150 ${
                isActive
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

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {children.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {children.map((child) => (
              <span
                key={child.id}
                className="shrink-0 whitespace-nowrap rounded-full bg-surface px-3 py-1 text-xs text-ink-muted"
              >
                {child.name}
              </span>
            ))}
          </div>
        )}

        {products.length === 0 ? (
          <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">{COPY.product.empty}</p>
        ) : (
          <PagedProductRow products={products} perPage={3} />
        )}

      </div>
    </div>
  );
}
