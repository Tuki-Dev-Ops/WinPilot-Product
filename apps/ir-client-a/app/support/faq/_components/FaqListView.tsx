'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SiteFaq } from '@winpilot/store';
import { SupportBrowser } from '@/app/support/_components/SupportBrowser';

/**
 * FAQ — **공지사항과 같은 목록**.
 *
 * 갈래 · 검색은 `SupportBrowser` 가, 결과는 여기가 그린다. 공지사항과 **줄 모양까지 같다** —
 * 위에 얇은 선, 줄마다 갈래 · 제목 · 화살표, 눌러 펼치면 아래에 본문.
 *
 * ## `<details>` 를 걷어냈다
 * 브라우저가 주는 접기 요소는 공짜로 얻는 것이 많았다(키보드 · Ctrl+F). 그런데 CS CENTER 안의
 * 세 목록 가운데 여기만 그것을 써서, **줄 높이와 여백이 공지사항과 미묘하게 달랐다.** 화면을
 * 옮길 때 눈에 걸리는 것은 그 미묘한 차이다.
 *
 * 잃은 것을 대신한다 — 단추에 `aria-expanded` 를 달아 낭독기가 펼침 상태를 읽고, 키보드는
 * 원래 단추라 그대로 된다. 접힌 답이 Ctrl+F 에 걸리지 않는 것만 남는데, 이 화면에는 **답까지
 * 훑는 검색창**이 이미 있어 그 자리를 메운다.
 *
 * ## 한 번에 하나만 펼친다
 * 공지사항과 같다. 여럿을 펼쳐 두면 화면이 길어져 다음 물음이 어디 있는지 다시 찾아야 한다.
 *
 * ## 첫 줄을 열어 둔다
 * 전부 접어 두면 제목만 늘어선 줄이 되고, 처음 온 사람은 **펼칠 수 있다는 것조차** 모른 채
 * 지나간다. 맨 위 하나만 열어 두면 나머지도 같은 것임을 알아본다.
 */
export function FaqListView({ faqs, groups }: { faqs: SiteFaq[]; groups: SiteFaq['group'][] }) {
  const [opened, setOpened] = useState<string | null>(faqs[0]?.id ?? null);

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
        <ul className="border-t border-border-strong">
          {rows.map((one) => {
            const open = one.id === opened;

            return (
              <li key={one.id} className="border-b border-border">
                <h2>
                  <button
                    type="button"
                    onClick={() => setOpened(open ? null : one.id)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-4 px-1 py-5 text-left transition-colors duration-150 hover:text-brand"
                  >
                    <span className="shrink-0 text-xs text-ink-faint">{one.group}</span>

                    <span className="min-w-0 flex-1 text-base font-medium leading-relaxed">
                      {one.question}
                    </span>

                    <ChevronDown
                      aria-hidden
                      strokeWidth={1.8}
                      className={`size-4 shrink-0 text-ink-faint transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </h2>

                {open && (
                  <div className="flex flex-col gap-4 px-1 pb-7 pt-1">
                    <p className="text-sm leading-relaxed text-ink-muted">{one.answer}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </SupportBrowser>
  );
}
