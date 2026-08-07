'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import { ChevronLeft } from 'lucide-react';
import { ALL_VALUE, Badge, ListToolbar, PageHeading, RowActions, RowIconButton, RowSelectCell, SelectAllCell, useToast, type ListFilterField } from '@winpilot/ui';
import type { CategoryFormInput, CategoryFormMode } from '@/lib/validation/category-record';
import { CategoryFormModal, type CategoryRecord } from './CategoryFormModal';
import { AdminVisibilityBadge, visibilityLabel } from '@/app/_components/AdminVisibilityBadge';

/** 프론트엔드 전용 — 서버 없이 이 배열이 목록의 원본이다. */
const INITIAL_CATEGORIES: CategoryRecord[] = [
  { id: 'C-01', name: '리빙', parentId: '', visible: true, productCount: 128 },
  { id: 'C-02', name: '주방', parentId: 'C-01', visible: true, productCount: 54 },
  { id: 'C-03', name: '침구', parentId: 'C-01', visible: true, productCount: 31 },
  { id: 'C-04', name: '수납', parentId: 'C-01', visible: false, productCount: 43 },
  { id: 'C-05', name: '패션', parentId: '', visible: true, productCount: 214 },
  { id: 'C-06', name: '아우터', parentId: 'C-05', visible: true, productCount: 88 },
  { id: 'C-07', name: '상의', parentId: 'C-05', visible: true, productCount: 126 },
  { id: 'C-08', name: '아웃도어', parentId: '', visible: false, productCount: 42 },
];

const TAB_VISIBLE: Record<string, boolean | null> = { all: null, shown: true, hidden: false };
const TAB_LABEL: Record<string, string> = { all: '전체', shown: '노출', hidden: '숨김' };



function nextCategoryId(categories: CategoryRecord[]): string {
  const max = categories.reduce((biggest, item) => Math.max(biggest, Number(item.id.replace('C-', ''))), 0);
  return `C-${`${max + 1}`.padStart(2, '0')}`;
}


type FormTarget = { mode: CategoryFormMode; depth: 1 | 2; record: CategoryRecord | null; parentId: string };

export function CategoryListView() {
  const toast = useToast();
  const [categories, setCategories] = useState<CategoryRecord[]>(INITIAL_CATEGORIES);
  const [activeTabId, setActiveTabId] = useState('all');
  const [search, setSearch] = useState('');
  /**
   * 지금 펼친 대분류. **처음에는 아무것도 고르지 않았다.**
   *
   * 전에는 첫 대분류(`C-01`)를 미리 골라 두고 오른쪽 2Depth 판을 늘 띄웠다. 그러면 들어오자마자
   * 판 둘이 서고, 그중 하나는 **내가 고른 적 없는 것**의 하위 목록이다 — 무엇을 보고 있는지
   * 알려면 왼쪽에서 어느 줄이 켜져 있는지 먼저 찾아야 했다.
   *
   * 지금은 대분류를 누르기 전까지 2Depth 판이 아예 없다. 화면에 있는 것이 하나뿐이니
   * **다음에 할 일이 하나로 정해진다** — 대분류를 고르는 것.
   */
  const [selectedRootId, setSelectedRootId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormTarget | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CategoryRecord | null>(null);
  const [pendingSave, setPendingSave] = useState<
    { mode: CategoryFormMode; depth: 1 | 2; name: string; visible: boolean } | null
  >(null);

  const roots = useMemo(() => categories.filter((item) => !item.parentId), [categories]);
  const childrenOf = (rootId: string) => categories.filter((item) => item.parentId === rootId);

  const filterFields = useMemo<ListFilterField[]>(
    () => [
      {
        id: 'children',
        label: '하위 분류 (대분류만)',
        options: [
          { value: 'yes', label: '있음' },
          { value: 'no', label: '없음' },
        ],
      },
      {
        id: 'products',
        label: '상품 수',
        options: [
          { value: 'none', label: '없음 (0개)' },
          { value: 'few', label: '1 ~ 99개' },
          { value: 'many', label: '100개 이상' },
        ],
      },
    ],
    [],
  );

  const matchesFilters = (item: CategoryRecord) => {
    // 하위 분류 조건은 대분류에만 뜻이 있다.
    const children = filters.children ?? ALL_VALUE;
    if (children !== ALL_VALUE && !item.parentId) {
      if (childrenOf(item.id).length > 0 !== (children === 'yes')) return false;
    }

    const products = filters.products ?? ALL_VALUE;
    if (products !== ALL_VALUE) {
      if (products === 'none' && item.productCount !== 0) return false;
      if (products === 'few' && (item.productCount === 0 || item.productCount >= 100)) return false;
      if (products === 'many' && item.productCount < 100) return false;
    }

    return true;
  };

  const matches = (item: CategoryRecord) => {
    const wanted = TAB_VISIBLE[activeTabId];
    if (wanted !== null && wanted !== undefined && item.visible !== wanted) return false;
    if (!matchesFilters(item)) return false;
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;
    return item.name.toLowerCase().includes(keyword) || item.id.toLowerCase().includes(keyword);
  };

  // 대분류는 자기 자신이 걸리거나 하위 중 하나라도 걸리면 남긴다 — 하위를 찾을 때 상위가 사라지면 못 찾는다.
  /*
    고르는 칸. **일괄로 할 일이 아직 없어 선택 줄(일괄 작업 막대)은 그리지 않는다** — 지우는 일은
    줄마다의 휴지통이 이미 맡고 있고, 대분류를 여럿 한꺼번에 지우면 그 아래 세부 분류와 상품이
    어디로 가는지 물어볼 자리가 없다. 그래도 칸은 둔다: 표마다 맨 왼쪽이 같은 자리여야 한다.
  */
  const [pickedRoots, setPickedRoots] = useState<string[]>([]);
  const [pickedChildren, setPickedChildren] = useState<string[]>([]);

  const visibleRoots = useMemo(
    () => roots.filter((root) => matches(root) || childrenOf(root.id).some(matches)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, activeTabId, search],
  );

  const selectedRoot = useMemo(
    () => categories.find((item) => item.id === selectedRootId) ?? null,
    [categories, selectedRootId],
  );

  const visibleChildren = useMemo(
    () => (selectedRoot ? childrenOf(selectedRoot.id).filter((item) => matches(item) || matches(selectedRoot)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, selectedRootId, activeTabId, search],
  );

  /*
    필터 때문에 고른 대분류가 목록에서 사라지면 **선택을 놓는다.**

    전에는 첫 번째로 옮겼는데, 그러면 거른 결과와 상관없이 2Depth 가 계속 떠 있고 그 안의 값은
    방금 거른 조건과 무관하다. 놓아 버리면 화면이 다시 "대분류를 고르세요" 로 돌아간다.
  */
  useEffect(() => {
    if (selectedRootId === null) return;
    if (!visibleRoots.some((root) => root.id === selectedRootId)) setSelectedRootId(null);
  }, [visibleRoots, selectedRootId]);

  const tabs = useMemo(
    () =>
      Object.keys(TAB_VISIBLE).map((id) => {
        const wanted = TAB_VISIBLE[id];
        return {
          id,
          label: TAB_LABEL[id] ?? id,
          count: wanted === null || wanted === undefined ? categories.length : categories.filter((item) => item.visible === wanted).length,
        };
      }),
    [categories],
  );

  const submit = (input: CategoryFormInput) => {
    if (!form) return;
    const next = { name: input.name.trim(), visible: input.visible };
    const depthLabel = form.depth === 1 ? '대분류' : '세부 분류';

    // 같은 상위 아래 이름이 겹치면 목록에서 구분이 안 된다.
    const duplicate = categories.some(
      (item) =>
        item.parentId === form.parentId && item.name === next.name && item.id !== (form.record?.id ?? ''),
    );
    if (duplicate) {
      toast.error({ message: `이미 있는 ${depthLabel} 이름입니다.`, detail: `'${next.name}' 은(는) 같은 위치에 이미 있습니다.` });
      return;
    }

    // 카테고리는 고객 화면 메뉴를 바꾼다 — 반영 전에 한 번 더 확인한다.
    setPendingSave({ mode: form.mode, depth: form.depth, ...next });
  };

  const applySave = () => {
    const next = pendingSave;
    if (!next || !form) return;
    setPendingSave(null);

    const depthLabel = next.depth === 1 ? '대분류' : '세부 분류';

    if (next.mode === 'create') {
      const id = nextCategoryId(categories);
      setCategories((previous) => [
        ...previous,
        { id, parentId: form.parentId, productCount: 0, name: next.name, visible: next.visible },
      ]);
      if (next.depth === 1) setSelectedRootId(id);
      toast.success({ message: `${depthLabel}를 추가했습니다.`, detail: `${next.name} · ${id}` });
    } else if (form.record) {
      const targetId = form.record.id;
      setCategories((previous) =>
        previous.map((item) => (item.id === targetId ? { ...item, name: next.name, visible: next.visible } : item)),
      );
      toast.success({ message: `${depthLabel}를 저장했습니다.`, detail: `${next.name} · ${targetId}` });
    }
    setForm(null);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const target = pendingDelete.id;
    const isRoot = !pendingDelete.parentId;
    const childCount = childrenOf(target).length;

    // 대분류를 지우면 그 하위도 함께 사라진다 — 상위 없는 하위가 남으면 목록이 깨진다.
    setCategories((previous) => previous.filter((item) => item.id !== target && item.parentId !== target));
    setPendingDelete(null);
    toast.success({
      message: `${isRoot ? '대분류' : '세부 분류'}를 삭제했습니다.`,
      detail: isRoot && childCount > 0
        ? `${pendingDelete.name} · 세부 분류 ${childCount}개도 함께 삭제되었습니다.`
        : `${pendingDelete.name} · ${target}`,
    });
  };

  const deleteIsRoot = pendingDelete ? !pendingDelete.parentId : false;

  return (
    <>
      <PageHeading title="카테고리" description="상품을 묶는 분류를 관리하세요." />

      <ListToolbar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        searchId="category-search"
        searchLabel="카테고리 검색"
        searchHint="카테고리명, 카테고리 코드로 검색"
        searchValue={search}
        onSearchChange={setSearch}
        actionLabel="대분류 추가"
        onAction={() => setForm({ mode: 'create', depth: 1, record: null, parentId: '' })}
        filters={filterFields}
        filterValues={filters}
        onFilterChange={(id, value) => setFilters((previous) => ({ ...previous, [id]: value }))}
        onFilterReset={() => {
          setFilters({});
          toast.info('필터를 초기화했습니다.');
        }}
      />

      {/*
        판 **하나만** 선다. 대분류를 고르기 전에는 1Depth, 고르고 나면 2Depth 다.

        전에는 둘을 나란히 놓았다(왼쪽에서 고르고 오른쪽에서 본다). 그런데 목록을 한 줄에 하나씩
        세우고 나니 두 판이 각각 화면의 절반만 쓰게 됐고, **한 줄에 든 것은 이름과 코드뿐인데
        폭은 반**이라 오른쪽이 늘 비었다.

        하나씩 갈아 끼우면 그 판이 화면을 다 쓴다. 대신 **어디에 있는지**를 잃으므로 2Depth 머리에
        돌아가는 길을 둔다 — 나란히 놓을 때는 왼쪽 목록 자체가 그 역할을 했다.
      */}
      <div className="flex flex-col gap-6">
        {/*
          1Depth — 누르면 오른쪽에 그 하위가 펼쳐진다.

          ## 열두 칸 격자를 걷어냈다
          전에는 두 판이 각각 `순번 · 이름 · 상품 · 상태 · 관리` 다섯 열짜리 표였다. 그런데 이
          화면은 **표 둘을 나란히 놓은 화면**이고, 열이 다섯이면 판 하나가 32rem 을 넘게 먹는다.
          이름이 잘리거나 코드가 아래로 접혔고, 무엇보다 **왼쪽에서 고르고 오른쪽에서 본다**는
          이 화면의 뼈대가 열에 파묻혔다.

          지금은 한 줄에 하나씩만 선다 — 이름과 코드가 한 덩어리, 오른쪽 끝에 상품 수와 상태.
          고르는 일이 먼저인 목록에서 필요한 것은 그것뿐이고, 나머지는 눌러서 연 상세에 있다.

          두 판을 반씩 나눈 것도 그래서다(`lg:w-1/2`). 한쪽이 넓을 이유가 없어졌다.
        */}
        {!selectedRoot && (
        <section
          data-ssot-cid="b2c-admin/category.list#AdminCategoryRootPanel"
          className="w-full overflow-hidden rounded-xl border border-border bg-canvas"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold">1Depth · 대분류</h2>
            <button
              type="button"
              onClick={() => setForm({ mode: 'create', depth: 1, record: null, parentId: '' })}
              className="h-8 rounded-lg bg-brand-500 px-3 text-sm font-medium text-white hover:bg-brand-600"
            >
              추가
            </button>
          </div>

          {visibleRoots.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-ink-muted">조건에 맞는 대분류가 없습니다.</p>
          ) : (
            <>
              {/*
                머리 줄에는 **전체 선택과 이름만** 남는다. 오른쪽에 서는 상품 수·상태는 값 자체가
                무엇인지 말하므로(숫자, `노출`/`숨김`) 머리글이 없어도 읽힌다 — 열이 다섯일 때는
                자리를 맞추려고 필요했지만, 한 줄에 하나씩 서는 지금은 줄만 늘린다.
              */}
              <div className="flex items-center gap-3 border-b border-border px-5 py-3 text-xs text-ink-faint">
                <SelectAllCell
                  checked={visibleRoots.length > 0 && pickedRoots.length === visibleRoots.length}
                  indeterminate={pickedRoots.length > 0}
                  onChange={(checked) => setPickedRoots(checked ? visibleRoots.map((one) => one.id) : [])}
                />
                <span>카테고리명</span>
              </div>

              <div className="flex flex-col">
                {visibleRoots.map((root, index) => {
                  const active = root.id === selectedRootId;
                  return (
                    <div
                      key={root.id}
                      onClick={() => setSelectedRootId(root.id)}
                      className={`group flex cursor-pointer items-center gap-3 border-b border-border px-5 py-3.5 transition-colors duration-100 last:border-b-0 ${
                        active ? 'bg-brand-50 dark:bg-brand-900' : 'hover:bg-surface'
                      }`}
                    >
                      <RowSelectCell
                        checked={pickedRoots.includes(root.id)}
                        onChange={(checked) =>
                          setPickedRoots((previous) =>
                            checked ? [...previous, root.id] : previous.filter((one) => one !== root.id),
                          )
                        }
                        label={`${root.name} 선택`}
                        index={index}
                      />

                      {/* 이름이 먼저, 코드와 하위 수가 그 아래 한 줄. 둘은 같은 것에 딸린 값이라 붙여 둔다. */}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-medium ${active ? 'text-brand-700 dark:text-brand-200' : ''}`}
                        >
                          {root.name}
                        </p>
                        <p className="truncate font-mono text-xs text-ink-faint">
                          {root.id} · 하위 {childrenOf(root.id).length} · 상품 {root.productCount}
                        </p>
                      </div>

                      <AdminVisibilityBadge visible={root.visible} />

                      <RowActions>
                        <RowIconButton
                          icon="view"
                          label={`${root.name} 상세`}
                          onClick={() => setForm({ mode: 'edit', depth: 1, record: root, parentId: '' })}
                        />
                        <RowIconButton
                          icon="delete"
                          tone="danger"
                          label={`${root.name} 삭제`}
                          onClick={() => setPendingDelete(root)}
                        />
                      </RowActions>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
        )}

        {/*
          2Depth — **대분류를 고른 뒤에만** 선다. 그때는 1Depth 가 사라지고 이 판이 화면을 다 쓴다.
        */}
        {selectedRoot && (
        <section
          data-ssot-cid="b2c-admin/category.list#AdminCategoryChildPanel"
          className="w-full min-w-0 overflow-hidden rounded-xl border border-border bg-canvas"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
            {/*
              돌아가는 길을 **제목 자리에** 둔다. 오른쪽 위 `추가` 옆에 두면 만드는 단추와 나가는
              단추가 나란히 서서, 급할 때 둘을 헷갈린다.
            */}
            <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setSelectedRootId(null)}
                className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-ink-muted transition-colors duration-150 hover:bg-surface hover:text-ink"
              >
                <ChevronLeft aria-hidden className="size-4" strokeWidth={1.6} />
                대분류
              </button>
              <span className="shrink-0 text-ink-faint">/</span>
              <span className="min-w-0 truncate">{selectedRoot.name}</span>
            </h2>
            <button
              type="button"
              disabled={!selectedRoot}
              onClick={() =>
                selectedRoot && setForm({ mode: 'create', depth: 2, record: null, parentId: selectedRoot.id })
              }
              className="h-8 shrink-0 rounded-lg bg-brand-500 px-3 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              추가
            </button>
          </div>

          {visibleChildren.length === 0 ? (
            <p className="px-5 py-16 text-center text-sm text-ink-muted">
              {selectedRoot.name} 아래에 세부 분류가 없습니다. 오른쪽 위 추가를 눌러 만드세요.
            </p>
          ) : (
            <>
              {/* 1Depth 와 같은 모양이다 — 같은 목록인데 줄 모양이 다르면 읽는 법을 두 번 배워야 한다. */}
              <div className="flex items-center gap-3 border-b border-border px-5 py-3 text-xs text-ink-faint">
                <SelectAllCell
                  checked={visibleChildren.length > 0 && pickedChildren.length === visibleChildren.length}
                  indeterminate={pickedChildren.length > 0}
                  onChange={(checked) => setPickedChildren(checked ? visibleChildren.map((one) => one.id) : [])}
                />
                <span>카테고리명</span>
              </div>

              <div className="flex flex-col">
                {visibleChildren.map((child, index) => (
                  <div
                    key={child.id}
                    onClick={() => setForm({ mode: 'edit', depth: 2, record: child, parentId: selectedRoot.id })}
                    className="group flex cursor-pointer items-center gap-3 border-b border-border px-5 py-3.5 transition-colors duration-100 last:border-b-0 hover:bg-surface"
                  >
                    <RowSelectCell
                      checked={pickedChildren.includes(child.id)}
                      onChange={(checked) =>
                        setPickedChildren((previous) =>
                          checked ? [...previous, child.id] : previous.filter((one) => one !== child.id),
                        )
                      }
                      label={`${child.name} 선택`}
                      index={index}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{child.name}</p>
                      <p className="truncate font-mono text-xs text-ink-faint">
                        {child.id} · 상품 {child.productCount}
                      </p>
                    </div>

                    <AdminVisibilityBadge visible={child.visible} />

                    <RowActions>
                      <RowIconButton
                        icon="view"
                        label={`${child.name} 상세`}
                        onClick={() => setForm({ mode: 'edit', depth: 2, record: child, parentId: selectedRoot.id })}
                      />
                      <RowIconButton
                        icon="delete"
                        tone="danger"
                        label={`${child.name} 삭제`}
                        onClick={() => setPendingDelete(child)}
                      />
                    </RowActions>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
        )}
      </div>

      <CategoryFormModal
        open={form !== null}
        mode={form?.mode ?? 'create'}
        depth={form?.depth ?? 1}
        record={form?.record ?? null}
        {...(form?.depth === 2 && selectedRoot ? { parentName: selectedRoot.name } : {})}
        onClose={() => setForm(null)}
        onSubmit={submit}
      />

      <AdminConfirmModal
        open={pendingSave !== null}
        elevated
        tone="brand"
        title={pendingSave?.mode === 'create' ? '카테고리 추가' : '카테고리 저장'}
        description={
          pendingSave?.depth === 1
            ? '대분류를 저장합니다. 고객 화면의 카테고리 메뉴가 바로 바뀝니다.'
            : '세부 분류를 저장합니다. 상품 등록 화면의 선택지가 바로 바뀝니다.'
        }
        confirmLabel={pendingSave?.mode === 'create' ? '추가' : '저장'}
        summary={
          pendingSave
            ? [
                { label: '구분', value: pendingSave.depth === 1 ? '1Depth · 대분류' : '2Depth · 세부 분류' },
                ...(pendingSave.depth === 2 && selectedRoot ? [{ label: '상위', value: selectedRoot.name }] : []),
                { label: '이름', value: pendingSave.name },
                { label: '노출', value: visibilityLabel(pendingSave.visible) },
              ]
            : []
        }
        onConfirm={applySave}
        onClose={() => setPendingSave(null)}
      />

      <AdminConfirmModal
        open={pendingDelete !== null}
        title={deleteIsRoot ? '대분류 삭제' : '세부 분류 삭제'}
        description={
          deleteIsRoot
            ? `'${pendingDelete?.name}' 을 삭제합니다. 아래 세부 분류도 함께 삭제됩니다.`
            : `'${pendingDelete?.name}' 을 삭제합니다. 되돌릴 수 없습니다.`
        }
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
