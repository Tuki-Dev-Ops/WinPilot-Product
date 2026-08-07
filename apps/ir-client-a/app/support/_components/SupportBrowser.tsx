'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Search } from 'lucide-react';

/**
 * CS CENTER 목록 화면의 **공통 틀** — 왼쪽에 갈래, 오른쪽에 검색과 결과.
 *
 * ## 왜 한 틀로 묶었나
 * 공지사항 · 뉴스 · FAQ 는 하는 일이 같다. "여럿 중에서 갈래로 좁히고, 말로 한 번 더 좁히고,
 * 남은 것을 본다." 그런데 화면마다 따로 만들어 두었더니 **갈래가 어디 붙는지가 셋 다 달랐다** —
 * 하나는 왼쪽 세로줄, 하나는 위쪽 알약, 하나는 없었다. CS CENTER 안을 오가는 사람은 화면을
 * 옮길 때마다 고르는 자리를 다시 찾아야 했다.
 *
 * 문의하기도 같은 틀이다(왼쪽에 갈래, 오른쪽에 양식). 그래서 CS CENTER 넷이 한 배치를 쓴다.
 *
 * ## 결과는 화면이 그린다
 * 여기서 하는 일은 **거르는 것까지**다. 뉴스는 격자로, 공지와 FAQ 는 접히는 줄로 서는데 그건
 * 각 화면이 자기 값에 맞게 정할 일이다. 결과 모양까지 여기서 정하면 셋 중 하나를 바꿀 때마다
 * 나머지 둘을 함께 건드리게 된다.
 *
 * ## 갈래 수를 거르기 전 기준으로 센다
 * 옆에 붙는 숫자는 **고르기 전** 전체를 센 것이다. 거른 뒤로 세면 검색어를 치는 순간 모든
 * 갈래가 0 이 되고, 그러면 다른 갈래에 답이 있는지 없는지 알 수 없어 검색어를 지워 가며
 * 하나씩 눌러 보게 된다.
 */
export function SupportBrowser<T>({
  items,
  facetOf,
  facets,
  facetTitle = '갈래',
  searchLabel,
  searchPlaceholder,
  searchIn,
  empty,
  children,
}: {
  items: T[];
  /** 이 줄이 어느 갈래에 드는가 */
  facetOf: (item: T) => string;
  /**
   * 보여 줄 갈래와 그 차례.
   *
   * 값에서 뽑지 않고 받는 이유: 그 기간에 한 건도 없는 갈래가 **목록에서 사라지면** 그 갈래가
   * 아예 없는 것으로 읽힌다. 0 이라고 적혀 있는 편이 낫다.
   */
  facets: readonly string[];
  facetTitle?: string;
  /** 검색 상자의 이름. 화면에는 보이지 않고 읽어 주는 기계에만 들린다 */
  searchLabel: string;
  searchPlaceholder: string;
  /** 무엇을 훑을지. 제목만 훑으면 찾는 사람의 말과 적힌 말이 달라 걸리지 않는다 */
  searchIn: (item: T) => string[];
  empty: ReactNode;
  children: (rows: T[]) => ReactNode;
}) {
  const [facet, setFacet] = useState('전체');
  const [keyword, setKeyword] = useState('');

  const counts = useMemo(() => {
    const box: Record<string, number> = { 전체: items.length };
    for (const one of items) {
      const key = facetOf(one);
      box[key] = (box[key] ?? 0) + 1;
    }
    return box;
  }, [items, facetOf]);

  const rows = useMemo(() => {
    const word = keyword.trim().toLowerCase();
    return items.filter((one) => {
      if (facet !== '전체' && facetOf(one) !== facet) return false;
      if (!word) return true;
      return searchIn(one).some((value) => value.toLowerCase().includes(word));
    });
  }, [items, facet, keyword, facetOf, searchIn]);

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
      {/* 좁은 화면에서는 갈래가 가로로 눕는다 — 세로로 두면 결과가 한참 아래로 밀린다. */}
      <aside className="shrink-0 lg:w-52">
        <p className="mb-3 text-xs font-medium text-ink-faint">{facetTitle}</p>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          {['전체', ...facets].map((one) => (
            <button
              key={one}
              type="button"
              onClick={() => setFacet(one)}
              aria-current={one === facet}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                one === facet ? 'bg-surface font-semibold text-ink' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {one}
              <span className="font-mono text-xs tabular-nums text-ink-faint">{counts[one] ?? 0}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border px-3 py-2 sm:max-w-80">
            <Search aria-hidden className="size-4 shrink-0 text-ink-faint" strokeWidth={1.8} />
            <input
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
            />
            <span className="sr-only">{searchLabel}</span>
          </label>

          <p className="shrink-0 text-sm text-ink-muted">
            총 <span className="font-mono tabular-nums text-ink">{rows.length}</span>건
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-xl border border-border px-6 py-12 text-center text-sm text-ink-muted">
            {empty}
          </p>
        ) : (
          children(rows)
        )}
      </div>
    </div>
  );
}
