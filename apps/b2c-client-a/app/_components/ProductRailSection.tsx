'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { CONTENT, type ProductItem } from '@winpilot/client-content';
import { ProductTile } from './ProductTile';

/**
 * 탭은 **값만** 넘긴다 — 함수는 서버에서 클라이언트로 건너가지 못한다.
 * 어느 상품이 걸리는지는 이 컴포넌트가 카테고리 목록을 보고 판정한다.
 */
export type RailTab = { id: string; label: string; categoryId?: string };

export type ProductRailSectionProps = {
  eyebrow?: string;
  title: string;
  titleHref?: string;
  /** 비우면 어드민의 1Depth 카테고리로 자동 구성한다 */
  tabs?: RailTab[];
  products: ProductItem[];
  /** 순위 배지를 붙일지 — 베스트에서만 뜻이 있다 */
  ranked?: boolean;
  emptyText: string;
  slotId: string;
  cidValue: string;
  children?: ReactNode;
};

/** 한 줄에 놓는 카드 수. 이보다 많으면 다음 장으로 넘긴다. */
const PER_PAGE = 6;

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12.5 4 L6.5 10 L12.5 16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M7.5 4 L13.5 10 L7.5 16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * 한 줄로 흐르는 상품 줄과 아래 인디케이터.
 *
 * **가로 스크롤바를 쓰지 않는다.** 스크롤바는 브라우저마다 모양과 위치가 다르고 터치 기기에서는
 * 아예 보이지 않아 "더 있다" 는 사실이 전달되지 않는다. 장 단위로 밀고 몇 장 중 몇 번째인지를
 * 아래에 적어 두면 어느 기기에서나 같게 읽힌다.
 */
export function PagedProductRow({
  products,
  perPage,
  ranked = false,
}: {
  products: ProductItem[];
  perPage: number;
  ranked?: boolean;
}) {
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(products.length / perPage));
  const safePage = Math.min(page, pageCount - 1);
  const columns = perPage >= 6 ? 'lg:grid-cols-6' : perPage >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3';

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="w-full overflow-hidden">
        {/* 장 단위로 밀어낸다 — 카드 하나씩 흐르게 하면 몇 장 남았는지 셀 수 없다. */}
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${safePage * 100}%)` }}
        >
          {Array.from({ length: pageCount }, (_, pageIndex) => (
            <div key={pageIndex} className={`grid w-full shrink-0 grid-cols-2 gap-5 sm:grid-cols-3 ${columns}`}>
              {products.slice(pageIndex * perPage, (pageIndex + 1) * perPage).map((product, position) => (
                <ProductTile
                  key={product.id}
                  product={product}
                  {...(ranked ? { rank: pageIndex * perPage + position + 1 } : {})}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
            disabled={safePage === 0}
            aria-label="이전"
            className="grid size-9 place-items-center rounded-full border border-border-strong text-ink-muted disabled:opacity-40"
          >
            <ChevronLeft />
          </button>

          <p className="text-sm tabular-nums">
            <span className="font-medium">{safePage + 1}</span>
            <span className="mx-1.5 text-ink-faint">/</span>
            <span className="text-ink-muted">{pageCount}</span>
          </p>

          <button
            type="button"
            onClick={() => setPage((current) => Math.min(current + 1, pageCount - 1))}
            disabled={safePage === pageCount - 1}
            aria-label="다음"
            className="grid size-9 place-items-center rounded-full border border-border-strong text-ink-muted disabled:opacity-40"
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * 상품 한 줄 — 신상품·베스트가 같이 쓴다.
 *
 * **한 줄만 보여준다.** 넘치는 것은 줄바꿈하지 않고 옆으로 밀어 다음 장에서 본다.
 * 줄바꿈으로 두 줄이 되면 화면이 세로로 길어져 아래 구획이 밀려나고, 무엇이 인기 있는지도
 * 흐려진다 — 이 자리의 목적은 '많이 보여주기' 가 아니라 '먼저 볼 것을 고르기' 다.
 */
export function ProductRailSection({
  eyebrow,
  title,
  titleHref,
  tabs,
  products,
  ranked = false,
  emptyText,
  slotId,
  cidValue,
  children,
}: ProductRailSectionProps) {
  const resolvedTabs = useMemo(() => tabs ?? categoryTabs(), [tabs]);
  const [tabId, setTabId] = useState(resolvedTabs[0]?.id ?? '');

  const activeTab = resolvedTabs.find((tab) => tab.id === tabId) ?? resolvedTabs[0];
  const visible = useMemo(() => {
    const categoryId = activeTab?.categoryId;
    if (!categoryId) return products;
    const childIds = CONTENT.categories
      .filter((category) => category.parentId === categoryId)
      .map((category) => category.id);
    return products.filter(
      (product) => product.categoryRootId === categoryId || childIds.includes(product.categoryChildId),
    );
  }, [activeTab, products]);

  return (
    <section id={slotId} data-ssot-cid={cidValue} className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        {eyebrow && <p className="text-sm font-bold text-signal-danger">{eyebrow}</p>}
        {titleHref ? (
          <a href={titleHref} className="flex items-center gap-2 text-[26px] font-bold tracking-tight">
            {title}
            <span aria-hidden="true" className="text-xl">
              ›
            </span>
          </a>
        ) : (
          <h2 className="text-[26px] font-bold tracking-tight">{title}</h2>
        )}
      </div>

      {resolvedTabs.length > 1 && (
        <div role="tablist" aria-label={title} className="flex flex-wrap items-center justify-center gap-2">
          {resolvedTabs.map((tab) => {
            const active = tab.id === (activeTab?.id ?? '');
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTabId(tab.id)}
                className={`h-9 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm transition-colors duration-150 ${
                  active
                    ? 'border-ink bg-ink font-medium text-white'
                    : 'border-border-strong text-ink hover:border-ink-faint'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="w-full rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">{emptyText}</p>
      ) : (
        // 탭을 바꾸면 줄을 새로 만든다 — 3장을 보던 중 탭만 바꾸면 빈 장이 남는다.
        <PagedProductRow key={activeTab?.id ?? 'all'} products={visible} perPage={PER_PAGE} ranked={ranked} />
      )}

      {children}
    </section>
  );
}

/** 카테고리 탭 — 어드민의 1Depth 카테고리에서 만든다. '전체' 가 앞에 붙는다. */
function categoryTabs(): RailTab[] {
  return [
    { id: 'all', label: '전체' },
    ...CONTENT.categories
      .filter((category) => !category.parentId)
      .map((category) => ({ id: category.id, label: category.name, categoryId: category.id })),
  ];
}
