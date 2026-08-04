import { ACCOUNT, CONTENT, COPY, ROUTES, SLOT, buildNav, cid, unreadAlarms } from '@winpilot/client-content';

/**
 * 템플릿 A 헤더 — **한 줄**이다.
 *
 *   로고(회사명) · 주 메뉴 · 검색 · 아이콘(관심·알람·장바구니·마이페이지)
 *
 * 로고만 있는 윗줄을 따로 두지 않는다 — 로그인한 사람에게는 그 줄에 아무것도 남지 않아
 * 빈 띠가 되고, 로그인·회원가입은 아바타 자리에서 이어진다.
 *
 * ## 어드민 연동
 * - 회사명 · 로고 ← `b2c-admin` 설정 > 공급자 정보 (`/settings/supplier`)
 * - 메뉴 구성 · 상품 아래 카테고리 ← 상품 > 카테고리 (`buildNav()` 가 조립한다)
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

/**
 * 아바타 — 회색 원판 **안에 표정만** 둔다.
 *
 * 얼굴 윤곽선을 따로 그리면 원판 테두리와 두 겹이 되어 지저분해진다. 배경이 얼굴이다.
 */
function AvatarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M7 8v.05M13 8v.05" strokeLinecap="round" />
      <path d="M6.4 12a4.3 4.3 0 0 0 7.2 0" strokeLinecap="round" />
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
                /* 강조 메뉴(신상품·베스트)는 색과 **굵기**를 함께 올린다 — 색만으로는 색각 이상 사용자가 놓친다. */
                className={`flex h-10 shrink-0 items-center whitespace-nowrap text-[15px] ${
                  item.emphasis ? 'font-bold text-brand-700 dark:text-brand-300' : 'font-medium text-ink'
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
              className="peer h-10 w-56 rounded bg-surface pl-4 pr-10 text-sm text-ink"
            />
            <span className="pointer-events-none absolute left-4 text-sm text-ink-faint peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden">
              {COPY.header.searchHint}
            </span>
            <button
              type="submit"
              aria-label={COPY.header.search}
              className="absolute right-1 grid size-8 place-items-center rounded text-ink-muted hover:text-ink"
            >
              <SearchIcon />
            </button>
          </form>

          {/*
            관심 상품과 알람은 **로그인한 사람에게만** 둔다. 비회원에게는 담을 곳도, 받을 알람도
            없어서 눌러도 빈 화면이 나온다 — 아이콘이 있으면 없는 기능을 있는 것처럼 보인다.
          */}
          {ACCOUNT.signedIn && (
            <>
              <a href={ROUTES.products} aria-label={COPY.header.wishlist} className={iconLink}>
                <HeartIcon />
              </a>

              <a href={ROUTES.alarms} aria-label={COPY.header.alarm} className={`relative ${iconLink}`}>
                <AlarmIcon />
                {/* 읽지 않은 알람 수 — 숫자를 보여야 '몇 개나 밀렸는지' 가 전달된다. */}
                {unread > 0 && (
                  <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-signal-danger px-1 text-[10px] font-medium leading-none tabular-nums text-white">
                    {unread}
                  </span>
                )}
              </a>
            </>
          )}

          {/* 장바구니는 비회원도 담을 수 있어 늘 둔다. */}
          <a href={ROUTES.cart} aria-label={COPY.header.cart} className={iconLink}>
            <CartIcon />
          </a>

          {ACCOUNT.signedIn ? (
            /*
              아바타 — 누르면 **마이페이지 · 로그아웃** 이 걸린 작은 메뉴가 열린다.
              로그아웃을 여기 두는 이유는, 나가는 길이 화면 어디에도 없으면 마이페이지까지
              들어가야 찾을 수 있기 때문이다.

              메뉴는 주 메뉴와 같이 **CSS 만으로** 편다(`group-hover` · `group-focus-within`).
              자바스크립트로 열면 추출 시점의 DOM 에는 닫힌 상태만 남아 Figma 에 메뉴가 아예 없다.
              아바타 사진은 아직 없으므로 기본 얼굴을 그린다 — 빈 원을 두면 무엇을 누르는지 알 수 없다.
            */
            <div className="group relative">
              <button
                type="button"
                aria-label={COPY.header.mypage}
                aria-haspopup="menu"
                className="grid size-10 place-items-center rounded-lg text-ink hover:bg-surface"
              >
                <span className="grid size-7 place-items-center rounded-full bg-border text-ink-muted">
                  <AvatarIcon />
                </span>
              </button>

              <div
                role="menu"
                className="absolute right-0 top-full z-50 hidden min-w-36 rounded-lg border border-border bg-canvas py-2 shadow-lg group-focus-within:block group-hover:block"
              >
                {[
                  { href: ROUTES.mypage, label: COPY.header.mypage },
                  { href: ROUTES.home, label: COPY.mypage.logout },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    className="block whitespace-nowrap px-4 py-2 text-sm text-ink-muted hover:bg-surface hover:text-ink"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ) : (
            /*
              비회원에게는 아바타 대신 **로그인 · 회원가입** 을 글자 그대로 둔다. 얼굴 그림은
              '내 계정' 을 뜻하는데 아직 계정이 없어, 무엇을 누르는 자리인지 전해지지 않는다.
            */
            <div className="ml-1 flex shrink-0 items-center gap-2">
              <a
                href={ROUTES.login}
                className="flex h-9 shrink-0 items-center whitespace-nowrap rounded border border-border-strong px-3.5 text-sm text-ink"
              >
                {COPY.header.login}
              </a>
              <a
                href={ROUTES.signup}
                className="flex h-9 shrink-0 items-center whitespace-nowrap rounded bg-ink px-3.5 text-sm font-medium text-white"
              >
                {COPY.header.signup}
              </a>
            </div>
          )}
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
