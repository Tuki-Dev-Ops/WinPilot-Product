'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { COPY, ROUTES, formatMoney } from '@winpilot/client-content';

/**
 * 목록 필터 서랍 — **왼쪽에서 밀려 나오고, 뒤 화면은 어둡게 덮는다.**
 *
 * 위 탭은 분류만 다루는데 조건이 늘면(태그·분류·가격) 탭 줄이 접혀 읽히지 않는다.
 * 그래서 조건 전체는 서랍에 모으고, 목록 옆에는 아이콘 하나만 둔다.
 *
 * **고르는 즉시 목록을 바꾸지 않는다.** 값 하나를 누를 때마다 화면이 넘어가면 조건을 두세 개
 * 걸려던 사람은 서랍을 매번 다시 열어야 한다. 서랍 안에서 다 고른 뒤 `적용하기` 를 눌러야
 * 목록으로 간다 — 그때 조건은 전부 **주소**가 되어 새로고침·공유·뒤로가기에서 살아남는다.
 *
 * 열리는 동작은 토큰의 `animate-drawer-in`(220ms)을 쓴다. 값을 여기서 정하면 앱마다 다른
 * 지속시간이 생긴다. 모션 감소를 켠 사용자에게는 토큰 쪽에서 일괄로 꺼진다.
 *
 * ## 어드민 연동
 * - 카테고리 · 하위 카테고리 ← `b2c-admin` 상품 > 카테고리 (`/products/categories`)
 * - 분류 칩(신상품 · 베스트) ← 상품 등록 시 자동 분류되는 태그 (store `productTags`)
 * - 가격 범위의 기준값 ← 상품 등록의 **판매가** (store `PRODUCTS.price`)
 */
export type FilterChoice = { value: string; label: string };

export type ProductFilterDrawerProps = {
  tags: FilterChoice[];
  roots: FilterChoice[];
  /** 1Depth 아이디 → 그 아래 2Depth 목록. 고른 분류에 맞는 줄만 그린다 */
  subsByRoot: Record<string, FilterChoice[]>;
  /** 지금 주소에 걸려 있는 값들 */
  current: { tag: string; category: string; sub: string; q: string; min: string; max: string };
  /** 지금 걸린 조건 수 — 아이콘 옆 숫자로 보여 준다 */
  activeCount: number;
  /** 지금 목록에 있는 상품의 가격 폭 — 안내 문구로 쓴다 */
  priceFloor: number;
  priceCeil: number;
};

function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 5.5h14M5.5 10h9M8.5 14.5h3" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5.5 5.5 L14.5 14.5 M14.5 5.5 L5.5 14.5" strokeLinecap="round" />
    </svg>
  );
}

function Group({
  title,
  options,
  value,
  onSelect,
}: {
  title: string;
  options: FilterChoice[];
  value: string;
  onSelect: (next: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-medium text-ink-faint">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value || 'all'}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(option.value)}
              className={`flex h-9 shrink-0 items-center whitespace-nowrap rounded border px-3.5 text-sm transition-colors duration-150 ${
                active
                  ? 'border-ink bg-ink font-medium text-white'
                  : 'border-border-strong text-ink-muted hover:text-ink'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function ProductFilterDrawer({
  tags,
  roots,
  subsByRoot,
  current,
  activeCount,
  priceFloor,
  priceCeil,
}: ProductFilterDrawerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [tag, setTag] = useState(current.tag);
  const [category, setCategory] = useState(current.category);
  const [sub, setSub] = useState(current.sub);
  const [min, setMin] = useState(current.min);
  const [max, setMax] = useState(current.max);

  const subs = useMemo(() => (category ? (subsByRoot[category] ?? []) : []), [category, subsByRoot]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  /** 서랍을 열 때마다 지금 주소의 값으로 되돌린다 — 적용하지 않고 닫은 선택이 남으면 안 된다. */
  const openDrawer = () => {
    setTag(current.tag);
    setCategory(current.category);
    setSub(current.sub);
    setMin(current.min);
    setMax(current.max);
    setOpen(true);
  };

  const apply = () => {
    const query = new URLSearchParams();
    if (tag) query.set('tag', tag);
    if (category) query.set('category', category);
    // 2Depth 는 고른 1Depth 안에서만 뜻이 있다 — 짝이 맞지 않으면 싣지 않는다.
    if (category && sub) query.set('sub', sub);
    if (current.q) query.set('q', current.q);
    if (min) query.set('min', min);
    if (max) query.set('max', max);

    const search = query.toString();
    setOpen(false);
    router.push(search ? `${ROUTES.products}?${search}` : ROUTES.products);
  };

  const reset = () => {
    setTag('');
    setCategory('');
    setSub('');
    setMin('');
    setMax('');
  };

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        aria-expanded={open}
        className="flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded border border-border-strong px-3.5 text-sm text-ink-muted hover:text-ink"
      >
        <FilterIcon />
        {COPY.product.filter}
        {activeCount > 0 && (
          <span className="grid size-5 place-items-center rounded-full bg-ink text-[11px] font-medium leading-none tabular-nums text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label={COPY.product.filter} className="fixed inset-0 z-50 flex">
          {/* 뒤 화면을 덮어 어둡게 — 서랍이 열려 있는 동안 목록은 조작 대상이 아니다. */}
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setOpen(false)}
            className="absolute inset-0 animate-overlay-in bg-black/45"
          />

          <div className="relative flex h-full w-full max-w-88 animate-drawer-in flex-col gap-6 overflow-y-auto rounded-r border-r border-border bg-canvas px-6 py-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold tracking-tight">{COPY.product.filter}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="grid size-9 shrink-0 place-items-center rounded text-ink-muted hover:bg-surface"
              >
                <CloseIcon />
              </button>
            </div>

            <Group title={COPY.product.filterTag} options={tags} value={tag} onSelect={setTag} />

            <Group
              title={COPY.product.filterCategory}
              options={roots}
              value={category}
              onSelect={(next) => {
                setCategory(next);
                // 대분류를 바꾸면 앞 분류의 2Depth 는 더 이상 유효하지 않다.
                setSub('');
              }}
            />

            <Group
              title={COPY.product.filterSubCategory}
              options={subs.length > 0 ? [{ value: '', label: '전체' }, ...subs] : []}
              value={sub}
              onSelect={setSub}
            />

            <section className="flex flex-col gap-3">
              <h3 className="text-xs font-medium text-ink-faint">{COPY.product.filterPrice}</h3>

              <div className="flex items-center gap-2">
                <span className="relative flex min-w-0 flex-1 items-center">
                  <input
                    type="number"
                    min={0}
                    value={min}
                    onChange={(event) => setMin(event.target.value)}
                    aria-label={COPY.product.filterPriceMin}
                    placeholder=" "
                    className="peer h-10 w-full rounded border border-border-strong bg-surface px-3 text-sm tabular-nums"
                  />
                  {/* placeholder 는 추출되지 않는다 — 겹쳐 둔 글자가 자리를 지킨다. */}
                  <span className="pointer-events-none absolute left-3 text-sm text-ink-faint peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden">
                    {COPY.product.filterPriceMin}
                  </span>
                </span>
                <span className="shrink-0 text-sm text-ink-faint">~</span>
                <span className="relative flex min-w-0 flex-1 items-center">
                  <input
                    type="number"
                    min={0}
                    value={max}
                    onChange={(event) => setMax(event.target.value)}
                    aria-label={COPY.product.filterPriceMax}
                    placeholder=" "
                    className="peer h-10 w-full rounded border border-border-strong bg-surface px-3 text-sm tabular-nums"
                  />
                  <span className="pointer-events-none absolute left-3 text-sm text-ink-faint peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden">
                    {COPY.product.filterPriceMax}
                  </span>
                </span>
              </div>

              <p className="text-xs text-ink-faint">
                {formatMoney(priceFloor)} ~ {formatMoney(priceCeil)}
                {COPY.product.priceUnit} 사이의 상품이 있습니다.
              </p>
            </section>

            <div className="mt-auto flex flex-col gap-2">
              <button
                type="button"
                onClick={apply}
                className="h-11 w-full shrink-0 whitespace-nowrap rounded bg-brand-500 text-sm font-medium text-white hover:bg-brand-600"
              >
                {COPY.product.applyFilter}
              </button>
              <button
                type="button"
                onClick={reset}
                className="h-11 w-full shrink-0 whitespace-nowrap rounded border border-border-strong text-sm text-ink-muted"
              >
                {COPY.product.resetFilter}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
