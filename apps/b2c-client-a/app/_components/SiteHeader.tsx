import { ACCOUNT, CONTENT, COPY, ROUTES, SLOT, buildNav, cid, unreadAlarms } from '@winpilot/client-content';

/**
 * 템플릿 A 헤더 — **두 줄**로 나눈다.
 *
 *   윗줄 : 로고 · 오른쪽 끝에 작은 유틸리티 링크(로그인 · 회원가입 / 주문 내역 · 이름)
 *   아랫줄: 브랜드명 · 주 메뉴 · 검색 · 아이콘
 *
 * 한 줄에 다 넣으면 메뉴가 늘어날수록 로고와 로그인이 서로 밀어낸다. 자주 쓰는 것(메뉴·검색·장바구니)을
 * 아래에 크게 두고, 가끔 쓰는 것(로그인·회원가입)을 위에 작게 두면 둘 다 자리를 지킨다.
 *
 * 세부 메뉴는 **CSS 만으로** 펼친다(`group-hover` · `group-focus-within`).
 * 자바스크립트로 열면 추출 시점의 DOM 에는 닫힌 상태만 남아 Figma 에 세부 메뉴가 아예 없다.
 *
 * 메뉴 구성과 강조 여부는 `@winpilot/client-content` 의 `buildNav()` 에서 온다 — 템플릿이 정하지 않는다.
 */
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="8.75" cy="8.75" r="5.25" />
      <path d="M12.75 12.75 L17 17" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M10 16.5 C10 16.5 3 12.4 3 7.9 A3.4 3.4 0 0 1 10 6.1 A3.4 3.4 0 0 1 17 7.9 C17 12.4 10 16.5 10 16.5 Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlarmIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5.5 8 a4.5 4.5 0 0 1 9 0 v3.5 l1.5 2 h-12 l1.5 -2 z" strokeLinejoin="round" />
      <path d="M8.25 16 a1.9 1.9 0 0 0 3.5 0" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2.5 3.5 h2 l2 8.5 h8 l2 -6.5 h-11" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.5" cy="16" r="1.2" />
      <circle cx="14" cy="16" r="1.2" />
    </svg>
  );
}

export function SiteHeader() {
  const { supplier } = CONTENT;
  const nav = buildNav();
  const unread = unreadAlarms();

  const iconLink = 'grid size-10 place-items-center rounded-lg text-ink hover:bg-surface';

  return (
    <header id={SLOT.header} data-ssot-cid={cid('site.home', 'SiteHeader')} className="border-b border-border bg-canvas">
      {/* 윗줄 — 로고와 유틸리티 */}
      <div className="mx-auto flex w-full max-w-350 items-center gap-6 px-6 pt-4">
        {/* 로고는 어드민 공급자 정보에서 온다 — 없으면 회사명을 글자로 쓴다. */}
        <a href={ROUTES.home} className="flex shrink-0 items-center">
          {supplier.logoUrl ? (
            // 어드민이 올린 로고는 objectURL 일 수 있어 next/image 최적화 대상이 아니다.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={supplier.logoUrl} alt={supplier.companyName} className="h-7 w-auto" />
          ) : (
            <span className="whitespace-nowrap text-[17px] font-bold tracking-tight">
              {supplier.companyName || COPY.brandFallback}
            </span>
          )}
        </a>

        <div className="ml-auto flex shrink-0 items-center gap-3 text-xs text-ink-muted">
          {ACCOUNT.signedIn ? (
            <>
              <a href={ROUTES.orders} className="whitespace-nowrap hover:text-ink">
                {COPY.header.myOrders}
              </a>
              <span className="text-border-strong">|</span>
              <span className="whitespace-nowrap font-medium text-ink">{ACCOUNT.name}</span>
            </>
          ) : (
            <>
              <a href={ROUTES.login} className="whitespace-nowrap hover:text-ink">
                {COPY.header.login}
              </a>
              <span className="text-border-strong">|</span>
              <a href={ROUTES.signup} className="whitespace-nowrap hover:text-ink">
                {COPY.header.signup}
              </a>
            </>
          )}
        </div>
      </div>

      {/* 아랫줄 — 주 메뉴와 도구 */}
      <div className="mx-auto flex w-full max-w-350 items-center gap-6 px-6 py-3">
        <a href={ROUTES.home} className="shrink-0 whitespace-nowrap text-xl font-bold tracking-tight">
          {supplier.companyName || COPY.brandFallback}
        </a>
        <span className="hidden h-4 w-px shrink-0 bg-border lg:block" />

        <nav className="hidden min-w-0 flex-1 items-center gap-x-7 lg:flex">
          {nav.map((item) => (
            <div key={item.id} className="group relative">
              <a
                href={item.href}
                className={`flex h-10 shrink-0 items-center whitespace-nowrap text-[15px] font-medium ${
                  item.emphasis ? 'text-brand-700 dark:text-brand-300' : 'text-ink'
                }`}
              >
                {item.label}
              </a>

              {item.children.length > 0 && (
                <div className="absolute left-0 top-full z-50 hidden min-w-44 rounded-lg border border-border bg-canvas py-2 shadow-lg group-focus-within:block group-hover:block">
                  {item.children.map((child) => (
                    <a
                      key={child.id}
                      href={child.href}
                      className="block whitespace-nowrap px-4 py-2 text-sm text-ink-muted hover:bg-surface hover:text-ink"
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {/*
            검색은 상품 목록의 필터로 간다 — 별도 화면을 만들면 정렬·빈 상태를 두 벌로 관리하게 된다.
            GET 폼이라 자바스크립트 없이도 동작하고, 추출 시점에도 구조가 그대로 남는다.
          */}
          <form action={ROUTES.products} method="get" className="relative hidden items-center sm:flex">
            <input
              name="q"
              type="search"
              aria-label={COPY.header.searchHint}
              placeholder=" "
              className="peer h-10 w-56 rounded-full bg-surface pl-4 pr-10 text-sm text-ink"
            />
            <span className="pointer-events-none absolute left-4 text-sm text-ink-faint peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden">
              {COPY.header.searchHint}
            </span>
            <button
              type="submit"
              aria-label={COPY.header.search}
              className="absolute right-1 grid size-8 place-items-center rounded-full text-ink-muted hover:text-ink"
            >
              <SearchIcon />
            </button>
          </form>

          <a href={ROUTES.products} aria-label={COPY.header.wishlist} className={iconLink}>
            <HeartIcon />
          </a>

          <a href={ROUTES.alarms} aria-label={COPY.header.alarm} className={`relative ${iconLink}`}>
            <AlarmIcon />
            {/* 읽지 않은 알람 수 — 숫자를 보여야 '몇 개나 밀렸는지' 가 전달된다. */}
            {unread > 0 && (
              <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-signal-danger px-1 text-[10px] font-medium tabular-nums text-white">
                {unread}
              </span>
            )}
          </a>

          <a href={ROUTES.cart} aria-label={COPY.header.cart} className={iconLink}>
            <CartIcon />
          </a>
        </div>
      </div>

      {/* lg 미만에서는 세부 메뉴를 펼칠 자리가 없다 — 최상위만 가로로 흘린다. */}
      <nav className="flex items-center gap-x-5 overflow-x-auto border-t border-border px-6 py-2 lg:hidden">
        {nav.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={`shrink-0 whitespace-nowrap text-sm ${
              item.emphasis ? 'font-medium text-brand-700 dark:text-brand-300' : 'text-ink-muted'
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
