import type { Metadata } from 'next';
import { CONTENT, COPY, ROUTES, SLOT, cid, productsWithTag } from '@winpilot/client-content';
import { CategoryExplorer } from './_components/CategoryExplorer';
import { HeroCarousel } from './_components/HeroCarousel';
import { HomeShortcuts } from './_components/HomeShortcuts';
import { ProductRailSection } from './_components/ProductRailSection';
import { SiteShell } from './_components/SiteShell';

/**
 * Feature: `site.home` · B2C Client (템플릿 A) · route `/`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * **템플릿 A 의 홈 배치**
 *   1. 히어로 — 어드민 배너가 무한히 흐르는 캐러셀
 *   2. 바로가기 타일 + 쿠폰 띠
 *   3. 신상품 — 카테고리 탭, 한 줄
 *   4. 베스트 — 카테고리 탭, 한 줄, 순위 배지
 *   5. 카테고리 탐색 — 좌 분류 · 우 상품
 *
 * 공지·회사 소개는 홈에서 뺐다. 헤더의 고객지원·회사소개로 들어가는 길이 이미 있는데
 * 홈에 또 두면 첫 화면이 '무엇을 파는가' 대신 '회사 이야기' 로 채워진다.
 *
 * ## 어드민 연동
 * - 히어로 배너 ← `b2c-admin` 배너 > 메인 비주얼 (`/banners`) — 노출 기간이 지난 것은 오지 않는다
 * - 신상품 · 베스트 줄 ← 상품 > 상품 목록의 자동 분류 태그 (store `productTags`)
 * - 카테고리 탐색 ← 상품 > 카테고리 (`/products/categories`)
 * - 회사명 · 로고 ← 설정 > 공급자 정보 (`/settings/supplier`)
 */
export const metadata: Metadata = {
  title: CONTENT.seo.title,
  description: CONTENT.seo.description,
  robots: { index: CONTENT.seo.indexable, follow: CONTENT.seo.indexable },
  openGraph: { title: CONTENT.seo.ogTitle, description: CONTENT.seo.ogDescription },
};

export default function SiteHomePage() {
  const banners = [...CONTENT.banners].sort((a, b) => a.order - b.order);

  return (
    <SiteShell>
      <HeroCarousel banners={banners} />

      <HomeShortcuts />

      <ProductRailSection
        title={COPY.home.newArrivalsTitle}
        titleHref={ROUTES.productsByTag('NEW')}
        products={productsWithTag('NEW')}
        emptyText={COPY.product.empty}
        slotId={SLOT.newArrivals}
        cidValue={cid('product.list', 'SiteNewArrivals')}
      />

      <ProductRailSection
        eyebrow="Category Best"
        title={COPY.home.bestTitle}
        titleHref={ROUTES.productsByTag('BEST')}
        products={productsWithTag('BEST')}
        ranked
        emptyText={COPY.product.empty}
        slotId={SLOT.bestSellers}
        cidValue={cid('product.list', 'SiteBestSellers')}
      />

      <section
        id={SLOT.categoryExplorer}
        data-ssot-cid={cid('category.list', 'SiteCategoryExplorer')}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold tracking-tight">{COPY.home.categoryTitle}</h2>
            <p className="text-sm text-ink-muted">{COPY.home.categoryDescription}</p>
          </div>
          <a href={ROUTES.products} className="shrink-0 whitespace-nowrap text-sm text-brand-700 dark:text-brand-300">
            {COPY.home.more}
          </a>
        </div>
        <CategoryExplorer />
      </section>
    </SiteShell>
  );
}
