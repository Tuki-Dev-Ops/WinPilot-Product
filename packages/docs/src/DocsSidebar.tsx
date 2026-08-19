import type { NavGroup } from './nav';

/**
 * 문서 사이드바 — **그리기만 한다.**
 *
 * `/docs/fsd/products` 처럼 한 마디 더 들어간 주소에서도 `/docs/fsd` 가 켜져야 한다 —
 * 정확히 같은 주소만 켜면 명세 한 장을 열자마자 왼쪽이 전부 꺼진다.
 *
 * 좁은 화면에서는 **가로로 한 줄 흐른다.** 세로 목록을 그대로 두면 본문이 목록 아래로 밀려
 * 문서를 열 때마다 스크롤을 내려야 한다.
 *
 * ## 지금 주소를 스스로 읽지 않는다
 * 한때 이 안에서 `usePathname()` 을 불렀다. 그러면 이 파일이 `next` 에 묶이는데, 이 저장소의
 * 공유 패키지는 **`next` 를 의존하지 않기로** 되어 있다(`packages/ui` 가 같은 규칙을 지킨다).
 * 프레임워크가 바뀌는 날 공유 패키지부터 막히기 때문이다.
 *
 * 그래서 주소는 **받는다.** 앱마다 여덟 줄짜리 client 겹(`DocsSidebar`)이 `usePathname()` 을
 * 읽어 넘긴다 — layout 은 화면이 바뀌어도 다시 그려지지 않으므로, 그 겹은 반드시 client 여야
 * 한다. 서버에서 넘기면 사이드바만 옛 자리에 남는다.
 */
export function DocsSidebarView({ groups, pathname }: { groups: NavGroup[]; pathname: string }) {
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
 ? 'bg-brand-50 font-medium text-brand-700'
                      : 'text-ink-muted hover:bg-surface hover:text-ink'
                  }`}
                >
                  <span className="min-w-0 truncate">{item.label}</span>
                  {item.hint && <span className="shrink-0 font-mono text-2xs text-ink-faint">{item.hint}</span>}
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
