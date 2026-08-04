import type { ReactNode } from 'react';
import { docNav } from '@/lib/docs';
import { SiteShell } from './SiteShell';

/**
 * 문서 공통 뼈대 — **왼쪽 목록**으로 문서 갈래를 옮긴다.
 *
 * 탭으로 두었더니 문서가 열한 장이라 좁은 너비에서 두 줄로 접혔고, 접힌 줄은 "더 있다" 는 것을
 * 알려 주지 못했다. 세로 목록은 위에서 아래로 다 보이고, 문서를 더 늘려도 모양이 무너지지 않는다.
 *
 * lg 미만에서는 목록이 **가로로 한 줄 흐른다** — 좁은 화면에서 세로 목록을 그대로 두면
 * 본문이 목록 아래로 밀려 열 때마다 스크롤을 내려야 한다.
 *
 * ## 어드민 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
 */
export function DocShell({ active, children }: { active: string; children: ReactNode }) {
  const groups = docNav();

  return (
    <SiteShell>
      <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        <nav
          aria-label="문서"
          className="-mx-4 flex shrink-0 gap-6 overflow-x-auto px-4 pb-2 lg:mx-0 lg:w-44 lg:flex-col lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {groups.map((group) => (
            <div key={group.title} className="flex shrink-0 flex-col gap-1 lg:shrink">
              <p className="px-2 text-xs font-medium uppercase tracking-widest text-ink-faint">{group.title}</p>
              <div className="flex gap-1 lg:flex-col">
                {group.items.map((item) => {
                  const on = item.href === active;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      aria-current={on ? 'page' : undefined}
                      className={`shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm transition-colors duration-150 ${
                        on
                          ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                          : 'text-ink-muted hover:bg-surface hover:text-ink'
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="flex min-w-0 flex-1 flex-col gap-6">{children}</div>
      </div>
    </SiteShell>
  );
}

/**
 * 갈래 탭 — 묶음 안에서 갈래를 고른다(`/ia` · `/ia/purchase`).
 *
 * 왼쪽 목록이 "어느 문서" 라면 이 탭은 "그 문서의 어느 갈래" 다. 둘을 같은 자리에 두면
 * 지금 보고 있는 것이 문서인지 갈래인지 구분되지 않는다.
 */
export function DocTabs({ tabs, active }: { tabs: Array<{ href: string; label: string }>; active: string }) {
  if (tabs.length === 0) return null;

  return (
    <nav aria-label="갈래" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
      <div className="flex min-w-max items-center gap-x-5 border-b border-border">
        {tabs.map((tab) => {
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
      </div>
    </nav>
  );
}
