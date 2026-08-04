import { CONTENT, COPY, ROUTES, SLOT, buildNav, cid } from '@winpilot/client-content';
import { HeaderAccount } from './HeaderAccount';

/**
 * 템플릿 A 헤더 — **한 줄**이다.
 *
 *   로고(회사명) · 주 메뉴 · 검색 · 아이콘(관심·알람·장바구니·마이페이지)
 *
 * 로고만 있는 윗줄을 따로 두지 않는다 — 로그인한 사람에게는 그 줄에 아무것도 남지 않아
 * 빈 띠가 되고, 로그인·회원가입은 오른쪽 끝에서 이어진다.
 *
 * 오른쪽 아이콘 묶음은 로그인 여부에 따라 달라져 `HeaderAccount` 로 떼어 놓았다 —
 * 그 부분만 클라이언트라, 로고·메뉴·검색은 서버가 그린 그대로 남는다.
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

export function SiteHeader() {
  const { supplier } = CONTENT;
  const nav = buildNav();

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

          <HeaderAccount />
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
