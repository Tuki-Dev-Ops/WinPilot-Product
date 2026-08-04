import type { Metadata } from 'next';
import {
  CONTENT,
  COPY,
  ROUTES,
  productsInCategory,
  productsWithTag,
  visibleProducts,
} from '@winpilot/client-content';
import { ProductTile } from '@/app/_components/ProductTile';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';

/**
 * Feature: `product.list` · B2C Client (템플릿 A) · route `/products`
 *
 * 신상품·베스트·카테고리는 **이 화면의 필터**다. 경로를 따로 두지 않는 이유는 같은 자원이기
 * 때문이다 — 화면을 나누면 정렬·페이징·빈 상태를 세 벌로 관리하게 되고 곧 서로 달라진다.
 */
export const metadata: Metadata = { title: `${COPY.product.listTitle} — ${CONTENT.seo.title}` };

type Search = { tag?: string; category?: string; q?: string };

export default async function ProductListPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { tag, category, q } = await searchParams;

  const roots = CONTENT.categories.filter((item) => !item.parentId);
  const activeCategory = roots.find((item) => item.id === category);
  const activeTag = tag === 'NEW' || tag === 'BEST' ? tag : undefined;

  const keyword = (q ?? '').trim().toLowerCase();
  const base = activeTag
    ? productsWithTag(activeTag)
    : activeCategory
      ? productsInCategory(activeCategory.id)
      : visibleProducts();

  // 검색어는 다른 필터 위에 겹쳐 건다 — 분류를 고른 채로 그 안에서 찾는 일이 흔하다.
  const products = keyword ? base.filter((item) => item.name.toLowerCase().includes(keyword)) : base;

  const title = keyword
    ? `'${q}' 검색 결과`
    : activeTag
      ? activeTag === 'NEW'
        ? COPY.home.newArrivalsTitle
        : COPY.home.bestTitle
      : (activeCategory?.name ?? COPY.product.listTitle);

  const chips = [
    { key: 'all', label: COPY.product.listTitle, href: ROUTES.products, active: !activeTag && !activeCategory },
    {
      key: 'new',
      label: COPY.home.newArrivalsTitle,
      href: ROUTES.productsByTag('NEW'),
      active: activeTag === 'NEW',
    },
    {
      key: 'best',
      label: COPY.home.bestTitle,
      href: ROUTES.productsByTag('BEST'),
      active: activeTag === 'BEST',
    },
    ...roots.map((item) => ({
      key: item.id,
      label: item.name,
      href: ROUTES.productsByCategory(item.id),
      active: activeCategory?.id === item.id,
    })),
  ];

  return (
    <SiteShell>
      <PageTitle title={title} />

      {/* 지금 무엇으로 걸러진 목록인지 보여준다 — 제목만으로는 되돌릴 방법이 없다. */}
      <nav className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <a
            key={chip.key}
            href={chip.href}
            className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm ${
              chip.active
                ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                : 'bg-surface text-ink-muted'
            }`}
          >
            {chip.label}
          </a>
        ))}
      </nav>

      {products.length === 0 ? (
        <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">{COPY.product.empty}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductTile key={product.id} product={product} />
          ))}
        </div>
      )}
    </SiteShell>
  );
}
