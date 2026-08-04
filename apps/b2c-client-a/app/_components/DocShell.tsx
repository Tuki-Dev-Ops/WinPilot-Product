import type { ReactNode } from 'react';
import { docTabs } from '@/lib/docs';
import { SiteShell } from './SiteShell';

/**
 * 문서 공통 뼈대 — **맨 위 탭**으로 문서 갈래를 옮긴다.
 *
 * 문서가 열 장을 넘어가면 왼쪽 목록만으로는 지금 어느 갈래를 보고 있는지 잃어버린다.
 * 탭은 늘 같은 자리에 있고, 고른 것만 밑줄로 표시한다.
 *
 * ## 어드민 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
 */
export function DocShell({ active, children }: { active: string; children: ReactNode }) {
  return (
    <SiteShell>
      <nav aria-label="문서" className="flex flex-wrap items-center gap-x-6 border-b border-border">
        {docTabs().map((tab) => {
          const on = tab.href === active;
          return (
            <a
              key={tab.href}
              href={tab.href}
              aria-current={on ? 'page' : undefined}
              className={`-mb-px shrink-0 whitespace-nowrap border-b-2 pb-3 pt-1 text-sm transition-colors duration-150 ${
                on ? 'border-ink font-bold text-ink' : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </a>
          );
        })}
      </nav>

      {children}
    </SiteShell>
  );
}
