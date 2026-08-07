'use client';

import { ChevronDown } from 'lucide-react';
import type { SiteFaq } from '@winpilot/store';
import { SupportBrowser } from '@/app/support/_components/SupportBrowser';

/**
 * FAQ — **갈래 · 검색 · 접히는 목록**.
 *
 * 공지사항 · 뉴스와 같은 틀이다(`SupportBrowser`) — 왼쪽에 갈래, 오른쪽에 검색과 결과. 전에는
 * 갈래가 위쪽 알약 줄이었는데, 옆 화면들과 고르는 자리가 달라 **화면을 옮길 때마다 눈이 다시
 * 헤맸다.**
 *
 * ## 답을 접어 두는 이유
 * 물음 스물에 답을 전부 펴 두면 화면이 길어져 **훑는 것 자체가 일**이 된다. 접어 두면 물음만
 * 스무 줄이라 한눈에 지나가고, 걸리는 것 하나만 펴 보게 된다.
 *
 * `<details>` 를 쓴다. 직접 만들면 키보드로 여는 일과 브라우저 안 찾기(Ctrl+F)가 함께 깨지는데,
 * 이 요소는 둘 다 브라우저가 해 준다 — 접힌 답도 찾기에 걸린다. 공지는 한 번에 하나만 펴야
 * 해서 손으로 만들었지만, FAQ 는 둘을 나란히 두고 견주는 일이 있어 여럿이 열려도 된다.
 *
 * ## 검색이 답까지 훑는다
 * 물음의 말과 찾는 사람의 말이 다르다. `견적` 을 치는 사람의 물음은 `도입 비용은 어떻게
 * 되나요` 로 적혀 있고, 그 말은 답 안에 있다.
 */
export function FaqListView({ faqs, groups }: { faqs: SiteFaq[]; groups: SiteFaq['group'][] }) {
  return (
    <SupportBrowser
      items={faqs}
      facets={groups}
      facetOf={(one) => one.group}
      searchLabel="FAQ 검색"
      searchPlaceholder="물음 · 답"
      searchIn={(one) => [one.question, one.answer]}
      empty="조건에 맞는 물음이 없습니다. 찾으시는 것이 없으면 문의를 남겨 주세요."
    >
      {(rows) => (
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
    </SupportBrowser>
  );
}
