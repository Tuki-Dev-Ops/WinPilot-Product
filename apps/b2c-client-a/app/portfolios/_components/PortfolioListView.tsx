'use client';

import { useMemo, useState } from 'react';
import { COPY, type PortfolioItem } from '@winpilot/client-content';
import { ProductArt } from '@/app/_components/ProductArt';

/**
 * 포트폴리오 목록 — **상단 탭으로 연도를 좁히고, 상품 목록과 같은 격자로 늘어놓는다.**
 *
 * 탭을 연도로 나눈 이유는 포트폴리오를 볼 때의 첫 질문이 "요즘도 하고 있나" 이기 때문이다.
 * 고객사 이름으로 나누면 회사가 늘어날수록 탭 줄이 끝없이 길어진다.
 *
 * 격자와 카드 모양은 상품 목록과 같다 — 둘 다 '여럿을 훑어 하나를 고르는' 화면이라
 * 배치가 달라야 할 이유가 없고, 다르게 두면 카드 크기와 여백이 화면마다 갈라진다.
 *
 * ## 어드민 연동
 * - 목록 · 제목 · 본문 · 고객사 · 기간 ← `b2c-admin` 콘텐츠 > 포트폴리오 (`/contents/portfolios`)
 * - 탭의 연도는 등록한 **기간**의 앞 네 자리에서 뽑는다 — 따로 입력받지 않는다
 * - 카드 설명은 본문에서 서식을 걷어낸 평문이다 (계약 단계의 `summary`)
 */
function yearOf(period: string): string {
  const found = period.match(/\d{4}/);
  return found ? found[0] : '기타';
}

export function PortfolioListView({ items }: { items: PortfolioItem[] }) {
  const [year, setYear] = useState('all');

  const years = useMemo(() => [...new Set(items.map((item) => yearOf(item.period)))].sort().reverse(), [items]);
  const visible = year === 'all' ? items : items.filter((item) => yearOf(item.period) === year);

  const tabs = [
    { id: 'all', label: '전체', count: items.length },
    ...years.map((value) => ({
      id: value,
      label: value,
      count: items.filter((item) => yearOf(item.period) === value).length,
    })),
  ];

  return (
    <>
      {/* 상품 목록의 1Depth 탭과 같은 모양 — 고른 것은 칩이 아니라 밑줄로 표시한다. */}
      <nav aria-label={COPY.portfolio.listTitle} className="flex flex-wrap items-center gap-x-7 border-b border-border">
        {tabs.map((tab) => {
          const on = tab.id === year;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={on}
              onClick={() => setYear(tab.id)}
              className={`-mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 pb-3 pt-1 text-[15px] transition-colors duration-150 ${
                on ? 'border-ink font-bold text-ink' : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {tab.label}
              <span className={`text-xs tabular-nums ${on ? 'text-ink-muted' : 'text-ink-faint'}`}>{tab.count}</span>
            </button>
          );
        })}
      </nav>

      {visible.length === 0 ? (
        <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">{COPY.portfolio.empty}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {visible.map((item) => (
            <article key={item.id} className="group flex w-full flex-col gap-3">
              <div className="aspect-square overflow-hidden rounded-lg bg-surface">
                <ProductArt
                  kind={item.art.kind}
                  from={item.art.from}
                  to={item.art.to}
                  ink={item.art.ink}
                  className="size-full transition-transform duration-300 ease-out group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="min-w-0 truncate text-xs text-ink-faint">
                  {item.client} · {item.period}
                </p>
                {/* 제목도 두 줄까지만 — 길이가 제각각이라 자르지 않으면 카드 높이가 들쭉날쭉해진다. */}
                <h2 className="line-clamp-2 text-sm font-medium leading-snug">{item.title}</h2>
                <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">{item.summary}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
