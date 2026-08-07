'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, type MouseEvent } from 'react';
import { AdminBulkBar } from '@/app/_components/AdminBulkBar';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import { AdminListPager } from '@/app/_components/AdminListPager';
import { ALL_VALUE, Badge, Checkbox, ListToolbar, PageHeading, RowActionGroup, RowSelectCell, useToast, type BadgeTone, type ListFilterField } from '@winpilot/ui';
import { CATEGORIES, rootCategories } from '@/lib/data/categories';
import { productTags } from '@/lib/data/product-tags';
import { PRODUCTS, type ProductRecord } from '@/lib/data/products';
import { formatAmount, parseAmount } from '@/lib/validation/product-record';
import { ProductTagBadges } from './ProductTagBadges';

const TAB_STATE: Record<string, string | null> = { all: null, selling: '판매중', waiting: '판매대기', stopped: '판매중지' };
const TAB_LABEL: Record<string, string> = { all: '전체', selling: '판매중', waiting: '판매대기', stopped: '판매중지' };

const STATE_TONE: Record<string, BadgeTone> = {
  판매중: 'ok',
  판매대기: 'neutral',
  판매중지: 'danger',
};



function categoryPath(product: ProductRecord): string {
  const root = CATEGORIES.find((item) => item.id === product.categoryRootId)?.name;
  const child = CATEGORIES.find((item) => item.id === product.categoryChildId)?.name;
  return [root, child].filter(Boolean).join(' · ') || '미분류';
}

/**
 * 상품 목록 — 여기서 행을 열면 `/products/{상품코드}` 상세로 간다.
 *
 * 사용자·카테고리와 달리 모달이 아니라 **별도 화면**이다. 이미지·가격·배송·적립까지
 * 한 화면에 들어가야 해서 모달 폭으로는 감당이 안 된다.
 */
export function ProductListView({ today }: { today: string }) {
  const router = useRouter();
  const toast = useToast();
  const [products, setProducts] = useState<ProductRecord[]>(PRODUCTS);
  const [activeTabId, setActiveTabId] = useState('all');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);

  const filterFields = useMemo<ListFilterField[]>(
    () => [
      {
        id: 'category',
        label: '대분류',
        options: rootCategories(CATEGORIES).map((item) => ({ value: item.id, label: item.name })),
      },
      {
        id: 'stock',
        label: '재고',
        options: [
          { value: 'out', label: '품절 (0개)' },
          { value: 'low', label: '부족 (10개 미만)' },
          { value: 'enough', label: '여유 (10개 이상)' },
        ],
      },
      {
        id: 'tag',
        label: '자동 분류',
        options: [
          { value: 'NEW', label: 'NEW' },
          { value: 'BEST', label: 'BEST' },
          { value: 'none', label: '분류 없음' },
        ],
      },
      {
        id: 'visible',
        label: '노출',
        options: [
          { value: 'shown', label: '노출' },
          { value: 'hidden', label: '숨김' },
        ],
      },
    ],
    [],
  );

  const matchesFilters = (product: ProductRecord) => {
    const category = filters.category ?? ALL_VALUE;
    if (category !== ALL_VALUE && product.categoryRootId !== category) return false;

    const stock = filters.stock ?? ALL_VALUE;
    if (stock !== ALL_VALUE) {
      const count = parseAmount(product.stock);
      if (stock === 'out' && count !== 0) return false;
      if (stock === 'low' && (count === 0 || count >= 10)) return false;
      if (stock === 'enough' && count < 10) return false;
    }

    const tag = filters.tag ?? ALL_VALUE;
    if (tag !== ALL_VALUE) {
      const tags = productTags(product, today);
      if (tag === 'none' ? tags.length > 0 : !tags.includes(tag as 'NEW' | 'BEST')) return false;
    }

    const visible = filters.visible ?? ALL_VALUE;
    if (visible !== ALL_VALUE && product.visible !== (visible === 'shown')) return false;

    return true;
  };

  const tabs = useMemo(
    () =>
      Object.keys(TAB_STATE).map((id) => {
        const state = TAB_STATE[id];
        return {
          id,
          label: TAB_LABEL[id] ?? id,
          count: state ? products.filter((product) => product.saleState === state).length : products.length,
        };
      }),
    [products],
  );

  const visible = useMemo(() => {
    const state = TAB_STATE[activeTabId];
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => {
      if (state && product.saleState !== state) return false;
      if (!matchesFilters(product)) return false;
      if (!keyword) return true;
      return (
        product.name.toLowerCase().includes(keyword) ||
        product.id.toLowerCase().includes(keyword) ||
        categoryPath(product).toLowerCase().includes(keyword)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, activeTabId, search, filters, today]);

  // 선택은 화면에 보이는 것만 대상으로 한다 — 탭이나 검색으로 가려진 항목이 함께 지워지면 안 된다.
  const visibleIds = visible.map((product) => product.id);
  const selectedVisible = selectedIds.filter((id) => visibleIds.includes(id));
  const allChecked = visible.length > 0 && selectedVisible.length === visible.length;

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const targets = new Set(pendingDelete);
    const names = products.filter((product) => targets.has(product.id)).map((product) => product.name);
    setProducts((previous) => previous.filter((product) => !targets.has(product.id)));
    setSelectedIds((previous) => previous.filter((id) => !targets.has(id)));
    setPendingDelete(null);
    toast.success({
      message: `상품 ${targets.size}건을 삭제했습니다.`,
      detail: names.length > 2 ? `${names.slice(0, 2).join(', ')} 외 ${names.length - 2}건` : names.join(', '),
    });
  };

  return (
    <>
      <PageHeading title="등록" description="판매할 상품을 등록하고 진열을 관리하세요." />

      <ListToolbar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        searchId="product-search"
        searchLabel="상품 검색"
        searchHint="상품명, 상품 코드, 카테고리로 검색"
        searchValue={search}
        onSearchChange={setSearch}
        actionLabel="상품 등록"
        onAction={() => {
          toast.info('상품 등록 화면으로 이동합니다.');
          router.push('/products/new');
        }}
        filters={filterFields}
        filterValues={filters}
        onFilterChange={(id, value) => setFilters((previous) => ({ ...previous, [id]: value }))}
        onFilterReset={() => {
          setFilters({});
          toast.info('필터를 초기화했습니다.');
        }}
      />

      <AdminBulkBar
        count={selectedVisible.length}
        onClear={() => setSelectedIds([])}
        onDelete={() => setPendingDelete(selectedVisible)}
      />

      <section
        data-ssot-cid="b2c-admin/product.list#AdminProductListTable"
        className="overflow-hidden rounded-xl border border-border bg-canvas"
      >
        <div className="hidden gap-4 border-b border-border px-5 py-3 text-xs text-ink-faint lg:grid lg:grid-cols-12 lg:items-center">
          <span className="flex items-center gap-3 lg:col-span-1">
            <Checkbox
              checked={allChecked}
              indeterminate={selectedVisible.length > 0}
              onChange={(checked) => setSelectedIds(checked ? visibleIds : [])}
              label="전체 선택"
            />
            <span className="w-6 text-center">순번</span>
          </span>
          <span className="lg:col-span-4">상품명 · 코드</span>
          <span className="lg:col-span-2">카테고리</span>
          <span className="lg:col-span-1 lg:text-right">판매가</span>
          <span className="lg:col-span-1 lg:text-right">재고</span>
          <span className="lg:col-span-1 lg:text-center">상태</span>
          <span className="lg:col-span-2 lg:text-center">관리</span>
        </div>

        {visible.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-ink-muted">조건에 맞는 상품이 없습니다.</p>
        ) : (
          <div className="flex flex-col">
            {visible.map((product, index) => (
              <div
                key={product.id}
                onClick={() => router.push(`/products/${product.id}`)}
                className="group grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 transition-colors duration-100 last:border-b-0 hover:bg-surface lg:grid-cols-12 lg:items-center lg:gap-y-0"
              >
                <RowSelectCell
                  checked={selectedIds.includes(product.id)}
                  onChange={(checked) =>
                    setSelectedIds((previous) =>
                      checked ? [...previous, product.id] : previous.filter((id) => id !== product.id),
                    )
                  }
                  label={`${product.name} 선택`}
                  index={index}
                />

                <div className="flex min-w-0 items-center gap-3 lg:col-span-4">
                  {/* 목록 썸네일 — 업로드된 이미지는 브라우저 메모리에만 있어 목록에서는 자리표시자로 둔다. */}
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface text-3xs text-ink-faint">
                    이미지
                  </span>
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <p className="min-w-0 truncate text-sm font-medium">{product.name}</p>
                      <ProductTagBadges tags={productTags(product, today)} size="sm" />
                    </div>
                    <p className="font-mono text-xs text-ink-faint">
                      {product.id} · {product.createdAt}
                      {!product.visible && <span className="ml-2 text-ink-faint">숨김</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-2">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">카테고리</span>
                  <span className="min-w-0 truncate text-sm text-ink-muted">{categoryPath(product)}</span>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-1 lg:justify-end">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">판매가</span>
                  <span className="text-sm tabular-nums">{formatAmount(parseAmount(product.price))}원</span>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-1 lg:justify-end">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">재고</span>
                  <span
                    className={`text-sm tabular-nums ${
                      parseAmount(product.stock) === 0 ? 'text-signal-danger' : 'text-ink-muted'
                    }`}
                  >
                    {formatAmount(parseAmount(product.stock))}
                  </span>
                </div>

                <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">상태</span>
                  <Badge tone={STATE_TONE[product.saleState] ?? 'neutral'}>
                    {product.saleState}
                  </Badge>
                </div>

                <div className="lg:col-span-2">
                  <RowActionGroup
                    label={product.name}
                    onView={() => router.push(`/products/${product.id}`)}
                    onEdit={() => router.push(`/products/${product.id}`)}
                    onDelete={() => setPendingDelete([product.id])}
                  />
                </div>

              </div>
            ))}
          </div>
        )}

        <AdminListPager total={visible.length} page={1} pageSize={Math.max(visible.length, 1)} />
      </section>

      <AdminConfirmModal
        open={pendingDelete !== null}
        title="상품 삭제"
        description={
          pendingDelete && pendingDelete.length > 1
            ? `선택한 상품 ${pendingDelete.length}건을 삭제합니다. 되돌릴 수 없습니다.`
            : '이 상품을 삭제합니다. 되돌릴 수 없습니다.'
        }
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
