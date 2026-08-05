'use client';

import { usePathname } from 'next/navigation';
import type { NavGroup } from '@/lib/docs-nav';

/**
 * 문서 사이드바.
 *
 * 어느 문서를 보고 있는지는 **주소가 정한다.** layout 은 화면이 바뀌어도 다시 그려지지 않으므로
 * 활성 표시를 화면에서 넘겨받으면 사이드바만 옛 자리에 남는다. 그래서 여기서 주소를 읽는다.
 *
 * `/docs/fsd/products` 처럼 한 마디 더 들어간 주소에서도 `/docs/fsd` 가 켜져야 한다 —
 * 정확히 같은 주소만 켜면 명세 한 장을 열자마자 왼쪽이 전부 꺼진다.
 *
 * 좁은 화면에서는 **가로로 한 줄 흐른다.** 세로 목록을 그대로 두면 본문이 목록 아래로 밀려
 * 문서를 열 때마다 스크롤을 내려야 한다.
 */
export function DocsSidebar({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname() ?? '/docs';

  const isOn = (href: string) => (href === '/docs' ? pathname === '/docs' : pathname.startsWith(href));

  return (
    <nav
      aria-label="문서"
      className="-mx-5 flex shrink-0 gap-6 overflow-x-auto px-5 pb-2 lg:mx-0 lg:w-56 lg:flex-col lg:gap-7 lg:overflow-visible lg:px-0 lg:pb-0"
    >
      {groups.map((group) => (
        <div key={group.title} className="flex shrink-0 flex-col gap-1 lg:shrink">
          <p className="px-2.5 text-xs font-medium uppercase tracking-widest text-ink-faint">{group.title}</p>

          <div className="flex gap-1 lg:flex-col">
            {group.items.map((item) => {
              const on = isOn(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={on ? 'page' : undefined}
                  className={`flex shrink-0 items-center justify-between gap-2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm transition-colors duration-150 ${
                    on
                      ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                      : 'text-ink-muted hover:bg-surface hover:text-ink'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {item.hint && <span className="shrink-0 font-mono text-[11px] text-ink-faint">{item.hint}</span>}
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
