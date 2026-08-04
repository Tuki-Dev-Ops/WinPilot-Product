import { CONTENT, COPY, ROUTES } from '@winpilot/client-content';
import {
  BestIcon,
  CompanyIcon,
  ContactIcon,
  FaqIcon,
  NewIcon,
  NewsIcon,
  NoticeIcon,
  PortfolioIcon,
  categoryIcon,
} from './ShortcutIcons';

/**
 * 히어로 아래 두 줄 — **바로가기 타일**과 **쿠폰 띠**.
 *
 * 타일은 어드민의 1Depth 카테고리와 고정 바로가기를 이어 붙인다. 카테고리를 추가하면
 * 여기에도 바로 나타난다 — 손으로 적어 두면 어드민에서 늘린 분류가 홈에서 빠진다.
 *
 * 쿠폰 띠는 **고정 안내**다. 기간마다 바뀌는 것은 배너로 올리고, 첫 구매 혜택처럼 늘 있는 것은
 * 여기 둔다. 누르면 자세한 내용이 적힌 공지로 간다 — 혜택 조건은 공지가 원본이다.
 */
const COUPON_NOTICE_ID = 'N-1024';

export function HomeShortcuts() {
  const roots = CONTENT.categories.filter((category) => !category.parentId);

  const tiles = [
    ...roots.map((category) => ({
      id: category.id,
      label: category.name,
      href: ROUTES.productsByCategory(category.id),
      icon: categoryIcon(category.name),
    })),
    { id: 'new', label: COPY.nav.newArrivals, href: ROUTES.productsByTag('NEW'), icon: <NewIcon /> },
    { id: 'best', label: COPY.nav.best, href: ROUTES.productsByTag('BEST'), icon: <BestIcon /> },
    { id: 'portfolios', label: COPY.nav.portfolios, href: ROUTES.portfolios, icon: <PortfolioIcon /> },
    { id: 'notices', label: COPY.nav.notices, href: ROUTES.notices, icon: <NoticeIcon /> },
    { id: 'faqs', label: COPY.nav.faqs, href: ROUTES.faqs, icon: <FaqIcon /> },
    { id: 'news', label: COPY.nav.news, href: ROUTES.news, icon: <NewsIcon /> },
    { id: 'company', label: COPY.nav.company, href: ROUTES.company, icon: <CompanyIcon /> },
    { id: 'contact', label: COPY.nav.contact, href: ROUTES.contact, icon: <ContactIcon /> },
  ];

  return (
    <div className="flex flex-col gap-10">
      <nav aria-label={COPY.home.quickNavLabel} className="flex flex-wrap items-start justify-center gap-x-6 gap-y-6">
        {tiles.map((tile) => (
          <a key={tile.id} href={tile.href} className="flex w-20 shrink-0 flex-col items-center gap-2">
            <span className="grid size-16 place-items-center rounded-2xl bg-surface text-ink">{tile.icon}</span>
            <span className="w-full truncate text-center text-xs text-ink">{tile.label}</span>
          </a>
        ))}
      </nav>

      <a
        href={ROUTES.noticeDetail(COUPON_NOTICE_ID)}
        className="flex items-center gap-4 rounded-lg bg-[#faf7ec] px-8 py-5 dark:bg-surface"
      >
        <span className="min-w-0 flex-1 text-center text-base">
          <strong className="font-bold">
            {CONTENT.supplier.companyName} {COPY.home.couponTitle}
          </strong>
          <span className="ml-3 text-sm text-ink-muted">{COPY.home.couponAction}</span>
        </span>
        <span aria-hidden="true" className="shrink-0 text-ink-muted">
          ›
        </span>
      </a>
    </div>
  );
}
