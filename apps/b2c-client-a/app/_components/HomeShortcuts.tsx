import { CONTENT, COPY, ROUTES } from '@winpilot/client-content';
import { ShortcutRow } from './ShortcutRow';
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
 * 여기 둔다. 누르면 **쿠폰함**으로 간다 — 안내를 읽는 것이 목적이 아니라 받는 것이 목적이라,
 * 공지로 보내면 받으러 한 번 더 옮겨 가야 한다.
 *
 * ## 어드민 연동
 * - 타일의 분류 ← `b2c-admin` 상품 > 카테고리 (`/products/categories`)
 * - 회사명 ← 설정 > 공급자 정보 (`/settings/supplier`)
 */

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
      {/* 좁은 화면에서도 한 줄로 둔다 — 줄바꿈으로 쌓이면 아래 구획이 화면 밖으로 밀린다. */}
      <ShortcutRow tiles={tiles} label={COPY.home.quickNavLabel} />

      <a
        href={ROUTES.mypageCoupons}
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
