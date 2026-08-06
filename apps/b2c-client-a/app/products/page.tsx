import { Search } from 'lucide-react';
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
import { ProductFilterDrawer } from './_components/ProductFilterDrawer';

/**
 * Feature: `product.list` · B2C Client (템플릿 A) · route `/products`
 *
 * 신상품·베스트·카테고리는 **이 화면의 필터**다. 경로를 따로 두지 않는 이유는 같은 자원이기
 * 때문이다 — 화면을 나누면 정렬·페이징·빈 상태를 세 벌로 관리하게 되고 곧 서로 달라진다.
 *
 * 분류는 **두 줄**로 나눈다. 윗줄이 1Depth, 아랫줄이 그 안의 2Depth 다. 한 줄에 다 늘어놓으면
 * 어느 것이 어느 것에 속하는지 보이지 않고, 분류가 늘어날수록 줄이 접혀 읽을 수 없게 된다.
 * 두 줄 모두 **주소로 남는다**(`?category=`·`?sub=`) — 목록의 상태는 공유·새로고침·뒤로가기에서
 * 살아남아야 한다.
 *
 * ## 어드민 연동
 * - 상품 · 가격 · 재고 ← `b2c-admin` 상품 > 상품 목록 (store `PRODUCTS`)
 * - 1Depth · 2Depth 탭 ← 상품 > 카테고리 (`/products/categories`)
 * - 신상품 · 베스트 ← 상품 등록 시 자동 분류되는 태그 (store `productTags`)
 * - 숨김 처리한 상품(`visible: false`)은 여기 오지 않는다
 */
export const metadata: Metadata = { title: `${COPY.product.listTitle} — ${CONTENT.seo.title}` };

/** 헤더와 같은 돋보기 — 획 굵기·크기까지 맞춰야 두 자리가 한 기능으로 읽힌다. */
function SearchIcon() {
  return (
    <Search aria-hidden className="size-5" strokeWidth={1.5} />
  );
}

type Search = { tag?: string; category?: string; sub?: string; q?: string; min?: string; max?: string };

/** 탭 주소 — 있는 값만 붙인다. 빈 인자가 주소에 남으면 같은 목록이 서로 다른 주소를 갖는다. */
function listHref(params: Search): string {
  const query = new URLSearchParams();
  if (params.tag) query.set('tag', params.tag);
  if (params.category) query.set('category', params.category);
  if (params.sub) query.set('sub', params.sub);
  if (params.q) query.set('q', params.q);
  if (params.min) query.set('min', params.min);
  if (params.max) query.set('max', params.max);
  const search = query.toString();
  return search ? `${ROUTES.products}?${search}` : ROUTES.products;
}

/** 가격 입력값 — 숫자가 아니면 조건이 없는 것으로 본다. 잘못된 값으로 목록을 비우지 않는다. */
function priceOf(value: string | undefined): number | undefined {
  const parsed = Number(value);
  return value && Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export default async function ProductListPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { tag, category, sub, q, min, max } = await searchParams;

  const roots = CONTENT.categories.filter((item) => !item.parentId);
  const activeRoot = roots.find((item) => item.id === category);
  const children = activeRoot
    ? CONTENT.categories.filter((item) => item.parentId === activeRoot.id)
    : [];
  // 2Depth 는 고른 1Depth 안에서만 뜻이 있다 — 짝이 맞지 않는 값은 없는 것으로 본다.
  const activeChild = children.find((item) => item.id === sub);
  const activeTag = tag === 'NEW' || tag === 'BEST' ? tag : undefined;

  const keyword = (q ?? '').trim().toLowerCase();
  const base = activeTag
    ? productsWithTag(activeTag)
    : activeRoot
      ? productsInCategory(activeRoot.id)
      : visibleProducts();

  const scoped = activeChild ? base.filter((item) => item.categoryChildId === activeChild.id) : base;

  // 검색어는 다른 필터 위에 겹쳐 건다 — 분류를 고른 채로 그 안에서 찾는 일이 흔하다.
  const searched = keyword ? scoped.filter((item) => item.name.toLowerCase().includes(keyword)) : scoped;

  const minPrice = priceOf(min);
  const maxPrice = priceOf(max);
  const products = searched.filter(
    (item) => (minPrice === undefined || item.price >= minPrice) && (maxPrice === undefined || item.price <= maxPrice),
  );

  // 안내에 쓰는 가격 폭은 **가격 조건을 걸기 전** 목록에서 잰다 — 걸고 나서 재면 방금 좁힌
  // 범위가 그대로 다시 표시되어 더 넓힐 여지가 있는지 알 수 없다.
  const prices = searched.map((item) => item.price);
  const priceFloor = prices.length > 0 ? Math.min(...prices) : 0;
  const priceCeil = prices.length > 0 ? Math.max(...prices) : 0;

  const title = keyword
    ? `'${q}' 검색 결과`
    : activeTag
      ? activeTag === 'NEW'
        ? COPY.home.newArrivalsTitle
        : COPY.home.bestTitle
      : (activeChild?.name ?? activeRoot?.name ?? COPY.product.listTitle);

  /* 윗줄 — 전체 · 신상품 · 베스트 · 1Depth 카테고리. 고른 것은 밑줄로 표시한다. */
  const depth1 = [
    { key: 'all', label: '전체', href: listHref({ q, min, max }), active: !activeTag && !activeRoot },
    {
      key: 'new',
      label: COPY.home.newArrivalsTitle,
      href: listHref({ tag: 'NEW', q, min, max }),
      active: activeTag === 'NEW',
    },
    {
      key: 'best',
      label: COPY.home.bestTitle,
      href: listHref({ tag: 'BEST', q, min, max }),
      active: activeTag === 'BEST',
    },
    ...roots.map((item) => ({
      key: item.id,
      label: item.name,
      href: listHref({ category: item.id, q, min, max }),
      active: activeRoot?.id === item.id,
    })),
  ];

  /* 아랫줄 — 고른 1Depth 의 하위 분류. 없으면 줄 자체를 그리지 않는다. */
  const depth2 = activeRoot
    ? [
        { key: 'all', label: '전체', href: listHref({ category: activeRoot.id, q, min, max }), active: !activeChild },
        ...children.map((item) => ({
          key: item.id,
          label: item.name,
          href: listHref({ category: activeRoot.id, sub: item.id, q, min, max }),
          active: activeChild?.id === item.id,
        })),
      ]
    : [];

  return (
    <SiteShell>
      <PageTitle title={title} />

      {/* 지금 무엇으로 걸러진 목록인지 보여준다 — 제목만으로는 되돌릴 방법이 없다. */}
      <nav aria-label={COPY.product.listTitle} className="flex flex-col border-b border-border">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-1">
          {depth1.map((tab) => (
            <a
              key={tab.key}
              href={tab.href}
              aria-current={tab.active ? 'page' : undefined}
              className={`-mb-px shrink-0 whitespace-nowrap border-b-2 pb-3 pt-1 text-[15px] transition-colors duration-150 ${
                tab.active ? 'border-ink font-bold text-ink' : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {depth2.length > 1 && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 py-3">
            {depth2.map((tab) => (
              <a
                key={tab.key}
                href={tab.href}
                aria-current={tab.active ? 'page' : undefined}
                className={`shrink-0 whitespace-nowrap text-sm transition-colors duration-150 ${
                  tab.active ? 'font-bold text-ink' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {tab.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/*
        왼쪽은 목록을 좁히는 손잡이, 오른쪽은 그 결과다. 개수를 왼쪽에 두면 조작하는 것과
        조작의 결과가 같은 자리에서 섞여 어느 쪽이 원인인지 읽히지 않는다.
      */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form action={ROUTES.products} className="flex flex-wrap items-center gap-2">
          {/* 지금 고른 분류를 검색에 그대로 얹는다 — 검색했다고 분류가 풀리면 되짚어야 한다. */}
          {activeTag && <input type="hidden" name="tag" value={activeTag} />}
          {activeRoot && <input type="hidden" name="category" value={activeRoot.id} />}
          {activeChild && <input type="hidden" name="sub" value={activeChild.id} />}
          {min && <input type="hidden" name="min" value={min} />}
          {max && <input type="hidden" name="max" value={max} />}

          {/*
            헤더의 검색과 **같은 모양·같은 자리**다 — 알약 배경에 오른쪽 끝 돋보기가 보내는 단추다.
            같은 일을 하는 것이 화면마다 다르게 생기면 매번 어디를 눌러야 하는지 다시 찾게 된다.

            placeholder 글자는 DOM 텍스트가 아니라 추출되지 않는다 — 겹쳐 둔 글자가 자리를 지킨다
            (docs/spec/05-component.md).
          */}
          <div className="relative flex items-center">
            <input
              name="q"
              type="search"
              defaultValue={q ?? ''}
              aria-label={COPY.product.searchLabel}
              placeholder=" "
              className="peer h-10 w-56 rounded bg-surface pl-4 pr-10 text-sm text-ink"
            />
            <span className="pointer-events-none absolute left-4 text-sm text-ink-faint peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden">
              {COPY.product.searchPlaceholder}
            </span>
            <button
              type="submit"
              aria-label={COPY.product.searchLabel}
              className="absolute right-1 grid size-8 place-items-center rounded text-ink-muted hover:text-ink"
            >
              <SearchIcon />
            </button>
          </div>

          {/*
            조건을 한 자리에 모아 두는 서랍. 위 탭과 같은 값을 가리키지만 태그·하위 분류까지
            함께 놓여 지금 무엇이 걸려 있는지 한눈에 보인다.
          */}
          <ProductFilterDrawer
            tags={[
              { value: '', label: '전체' },
              { value: 'NEW', label: COPY.home.newArrivalsTitle },
              { value: 'BEST', label: COPY.home.bestTitle },
            ]}
            roots={[{ value: '', label: '전체' }, ...roots.map((item) => ({ value: item.id, label: item.name }))]}
            subsByRoot={Object.fromEntries(
              roots.map((root) => [
                root.id,
                CONTENT.categories
                  .filter((item) => item.parentId === root.id)
                  .map((item) => ({ value: item.id, label: item.name })),
              ]),
            )}
            current={{
              tag: activeTag ?? '',
              category: activeRoot?.id ?? '',
              sub: activeChild?.id ?? '',
              q: q ?? '',
              min: min ?? '',
              max: max ?? '',
            }}
            activeCount={[activeTag, activeRoot, activeChild, keyword, min, max].filter(Boolean).length}
            priceFloor={priceFloor}
            priceCeil={priceCeil}
          />
        </form>

        <p className="shrink-0 whitespace-nowrap text-sm text-ink-muted">
          총 <span className="font-medium tabular-nums text-ink">{products.length}</span>개
        </p>
      </div>

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
