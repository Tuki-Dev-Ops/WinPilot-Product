'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import type { SiteFaq } from '@/lib/data/site';

/**
 * FAQ — **갈래 · 검색 · 접히는 목록**.
 *
 * ## 답을 접어 두는 이유
 * 물음 스물에 답을 전부 펴 두면 화면이 길어져 **훑는 것 자체가 일**이 된다. 접어 두면 물음만
 * 스무 줄이라 한눈에 지나가고, 걸리는 것 하나만 펴 보게 된다.
 *
 * `<details>` 를 쓴다. 직접 만들면 키보드로 여는 일과 브라우저 안 찾기(Ctrl+F)가 함께 깨지는데,
 * 이 요소는 둘 다 브라우저가 해 준다 — 접힌 답도 찾기에 걸린다.
 *
 * ## 검색이 답까지 훑는다
 * 물음의 말과 찾는 사람의 말이 다르다. `견적` 을 치는 사람의 물음은 `도입 비용은 어떻게
 * 되나요` 로 적혀 있고, 그 말은 답 안에 있다.
 */
export function FaqListView({ faqs, groups }: { faqs: SiteFaq[]; groups: SiteFaq['group'][] }) {
  const [group, setGroup] = useState<SiteFaq['group'] | '전체'>('전체');
  const [keyword, setKeyword] = useState('');

  /** 갈래마다 몇 개인지. 고르기 전에 보여야 하므로 **거르기 전 전체**를 센다. */
  const counts = useMemo(() => {
    const box: Record<string, number> = { 전체: faqs.length };
    for (const one of faqs) box[one.group] = (box[one.group] ?? 0) + 1;
    return box;
  }, [faqs]);

  const rows = useMemo(() => {
    const word = keyword.trim().toLowerCase();
    return faqs.filter((one) => {
      if (group !== '전체' && one.group !== group) return false;
      if (!word) return true;
      return [one.question, one.answer].some((value) => value.toLowerCase().includes(word));
    });
  }, [faqs, group, keyword]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(['전체', ...groups] as const).map((one) => (
            <button
              key={one}
              type="button"
              onClick={() => setGroup(one)}
              aria-current={one === group}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors duration-150 ${
                one === group ? 'bg-ink font-semibold text-canvas' : 'bg-surface text-ink-muted hover:text-ink'
              }`}
            >
              {one}
              <span className="font-mono text-xs tabular-nums opacity-60">{counts[one] ?? 0}</span>
            </button>
          ))}
        </div>

        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border px-3 py-2 sm:max-w-72">
          <Search aria-hidden className="size-4 shrink-0 text-ink-faint" strokeWidth={1.8} />
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="물음 · 답 검색"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
          />
          <span className="sr-only">FAQ 검색</span>
        </label>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-border px-6 py-12 text-center text-sm text-ink-muted">
          조건에 맞는 물음이 없습니다. 찾으시는 것이 없으면 문의를 남겨 주세요.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {rows.map((one) => (
            <details key={one.id} className="group border-b border-border last:border-b-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 transition-colors duration-150 hover:bg-surface">
                <span className="flex min-w-0 items-baseline gap-3">
                  <span className="shrink-0 text-xs text-ink-faint">{one.group}</span>
                  <span className="min-w-0 text-sm font-medium">{one.question}</span>
                </span>
                {/* 열리면 화살표가 돈다 — 접힌 것과 펴진 것을 색만으로 가르면 훑을 때 놓친다. */}
                <ChevronDown
                  aria-hidden
                  className="size-4 shrink-0 text-ink-faint transition-transform duration-200 group-open:rotate-180"
                  strokeWidth={1.6}
                />
              </summary>
              <p className="border-t border-border bg-surface px-6 py-5 text-sm leading-loose text-ink-muted">
                {one.answer}
              </p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
