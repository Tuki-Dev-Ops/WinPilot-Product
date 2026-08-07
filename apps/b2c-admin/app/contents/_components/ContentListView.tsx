'use client';

import { useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { AdminBulkBar } from '@/app/_components/AdminBulkBar';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import { AdminListPager } from '@/app/_components/AdminListPager';
import { ALL_VALUE, Checkbox, ListToolbar, PageHeading, RowActions, RowIconButton, RowSelectCell, useToast, type ListFilterField } from '@winpilot/ui';

export type ContentColumn<T> = {
  id: string;
  label: string;
  /**
   * 12칸 그리드에서 차지할 칸 수.
   *
   * 체크박스·순번이 1칸, 관리가 2칸을 이미 쓰므로 **열 합은 9를 넘으면 안 된다** —
   * 넘으면 관리 열이 다음 줄로 밀려 표가 두 줄로 접힌다.
   */
  span: number;
  align?: 'left' | 'center' | 'right';
  render: (item: T) => ReactNode;
};

/** 열이 쓸 수 있는 칸 수 (12 - 체크박스 1 - 관리 2) */
export const CONTENT_COLUMN_BUDGET = 9;

export type ContentListViewProps<T> = {
  /** 화면 머리에 서는 이름 — 사이드바 메뉴에 적힌 것과 같은 말을 쓴다 */
  title: string;
  /** 머리의 한 줄 설명. 화면에 그대로 나가는 글이라 `~하세요` 체로 적는다 */
  description: string;
  entityLabel: string;
  items: T[];
  onItemsChange: (next: T[]) => void;

  idOf: (item: T) => string;
  /**
   * 한 줄을 가리키는 **짧은 이름**. 낭독기가 읽는 말이고 확인 창·토스트에도 그대로 실린다.
   *
   * 제목처럼 한 눈에 들어오는 값을 준다. 본문·설명처럼 긴 글을 넘기면 안 된다 —
   * 리뷰 목록이 `item.body` 를 넘기고 있어서 삭제 단추 하나를 읽는 데 리뷰 한 편이
   * 통째로 낭독됐다. 실수로 긴 값이 와도 표가 무너지지 않도록 아래에서 잘라 쓴다.
   */
  labelOf: (item: T) => string;
  visibleOf: (item: T) => boolean;
  /** 검색 대상 문자열 — 여러 필드를 이어 붙여 넘긴다 */
  searchIn: (item: T) => string;

  columns: Array<ContentColumn<T>>;

  searchId: string;
  searchHint: string;
  actionLabel: string;
  onAction: () => void;
  onOpen: (item: T) => void;

  filters?: ListFilterField[];
  matchesFilters?: (item: T, values: Record<string, string>) => boolean;
};

const TAB_VISIBLE: Record<string, boolean | null> = { all: null, shown: true, hidden: false };
const TAB_LABEL: Record<string, string> = { all: '전체', shown: '노출', hidden: '숨김' };



const ALIGN: Record<'left' | 'center' | 'right', string> = {
  left: '',
  center: 'lg:text-center lg:justify-center',
  right: 'lg:text-right lg:justify-end',
};

/**
 * 칸 수는 표로 적어 둔다.
 * `lg:col-span-${n}` 처럼 조립하면 Tailwind 가 그 클래스를 찾지 못해 CSS 가 만들어지지 않는다.
 */
const SPAN: Record<number, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
};

/**
 * 콘텐츠 목록 공통 화면 — 공지사항 · 뉴스 · 포트폴리오가 함께 쓴다.
 *
 * 세 화면은 열만 다르고 나머지(탭·검색·필터·선택·삭제·페이저)가 같다.
 * 각자 만들면 세 벌이 조금씩 어긋나므로 열만 받아서 하나로 그린다.
 */
export function ContentListView<T>({
  title,
  description,
  entityLabel,
  items,
  onItemsChange,
  idOf,
  labelOf,
  visibleOf,
  searchIn,
  columns,
  searchId,
  searchHint,
  actionLabel,
  onAction,
  onOpen,
  filters,
  matchesFilters,
}: ContentListViewProps<T>) {
  const toast = useToast();

  /*
    열 예산을 넘기면 표가 조용히 두 줄로 접힌다 — 관리 열이 다음 줄로 밀려 머리글과 아이콘이
    따로 논다.

    **경고만으로는 못 막았다.** 리뷰와 쿠폰이 열 합 11 로 두 줄이 된 채 남아 있었는데,
    `console.warn` 은 개발자 도구를 열어야 보이고 화면은 멀쩡히 그려지기 때문이다. 그래서
    개발 중에는 **표 위에 눈에 보이는 줄**로도 알린다 — 화면을 만든 사람이 반드시 지나가는 자리다.

    타입으로 막지 못하는 이유: 배열 원소의 `span` 합은 리터럴 타입으로 계산할 수 있으나,
    그러려면 화면마다 `as const` 를 강제해야 하고 열을 조건부로 넣는 곳에서 무너진다.
  */
  const used = columns.reduce((sum, column) => sum + column.span, 0);
  const overBudget = used > CONTENT_COLUMN_BUDGET;
  if (process.env.NODE_ENV !== 'production' && overBudget) {
    console.warn(
      `[ContentListView] ${entityLabel}: 열 합 ${used} 이 예산 ${CONTENT_COLUMN_BUDGET} 을 넘습니다 — 관리 열이 다음 줄로 밀립니다.`,
    );
  }

  /*
    줄 이름은 **낭독기가 읽고 확인 창에도 실리는 말**이라 길이를 여기서 막는다.
    화면마다 `labelOf` 를 잘 넘기기를 바라는 것으로는 부족하다 — 리뷰 목록이 본문을 통째로
    넘기고 있었고, 타입이 `string` 이라 아무도 막지 못했다. 넘기는 쪽을 고치더라도
    다음에 또 긴 값이 올 수 있으므로 받는 쪽에서 한 번 더 자른다.
  */
  const nameOf = (item: T) => {
    const raw = labelOf(item).replace(/\s+/g, ' ').trim();
    return raw.length > 40 ? `${raw.slice(0, 40)}…` : raw;
  };

  const [activeTabId, setActiveTabId] = useState('all');
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);

  const tabs = useMemo(
    () =>
      Object.keys(TAB_VISIBLE).map((id) => {
        const wanted = TAB_VISIBLE[id];
        return {
          id,
          label: TAB_LABEL[id] ?? id,
          count:
            wanted === null || wanted === undefined
              ? items.length
              : items.filter((item) => visibleOf(item) === wanted).length,
        };
      }),
    [items, visibleOf],
  );

  const visible = useMemo(() => {
    const wanted = TAB_VISIBLE[activeTabId];
    const keyword = search.trim().toLowerCase();
    return items.filter((item) => {
      if (wanted !== null && wanted !== undefined && visibleOf(item) !== wanted) return false;
      if (matchesFilters && !matchesFilters(item, filterValues)) return false;
      if (!keyword) return true;
      return searchIn(item).toLowerCase().includes(keyword);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, activeTabId, search, filterValues]);

  // 선택은 화면에 보이는 것만 대상으로 한다 — 탭이나 검색으로 가려진 항목이 함께 지워지면 안 된다.
  const visibleIds = visible.map(idOf);
  const selectedVisible = selectedIds.filter((id) => visibleIds.includes(id));
  const allChecked = visible.length > 0 && selectedVisible.length === visible.length;

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const targets = new Set(pendingDelete);
    const labels = items.filter((item) => targets.has(idOf(item))).map(nameOf);
    onItemsChange(items.filter((item) => !targets.has(idOf(item))));
    setSelectedIds((previous) => previous.filter((id) => !targets.has(id)));
    setPendingDelete(null);
    toast.success({
      message: `${entityLabel} ${targets.size}건을 삭제했습니다.`,
      detail: labels.length > 2 ? `${labels.slice(0, 2).join(', ')} 외 ${labels.length - 2}건` : labels.join(', '),
    });
  };

  return (
    <>
      <PageHeading title={title} description={description} />

      <ListToolbar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        searchId={searchId}
        searchLabel={`${entityLabel} 검색`}
        searchHint={searchHint}
        searchValue={search}
        onSearchChange={setSearch}
        actionLabel={actionLabel}
        onAction={onAction}
        {...(filters ? { filters } : {})}
        filterValues={filterValues}
        onFilterChange={(id, value) => setFilterValues((previous) => ({ ...previous, [id]: value }))}
        onFilterReset={() => {
          setFilterValues({});
          toast.info('필터를 초기화했습니다.');
        }}
      />

      {/* 개발 중에만 뜬다. 배포된 화면에는 나가지 않는다. */}
      {process.env.NODE_ENV !== 'production' && overBudget && (
        <p className="rounded-lg bg-signal-danger/12 px-4 py-3 text-sm leading-relaxed text-signal-danger">
          [개발] {entityLabel} 목록의 열 합이 {used} 로 예산 {CONTENT_COLUMN_BUDGET} 을 넘습니다 —
          관리 열이 다음 줄로 밀립니다. 열의 `span` 을 줄여 주세요.
        </p>
      )}

      <AdminBulkBar
        count={selectedVisible.length}
        onClear={() => setSelectedIds([])}
        onDelete={() => setPendingDelete(selectedVisible)}
      />

      <section className="overflow-hidden rounded-xl border border-border bg-canvas">
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

          {columns.map((column) => (
            <span key={column.id} className={`${SPAN[column.span] ?? 'lg:col-span-2'} ${ALIGN[column.align ?? 'left']}`}>
              {column.label}
            </span>
          ))}

          <span className="lg:col-span-2 lg:text-center">관리</span>
        </div>

        {visible.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-ink-muted">조건에 맞는 {entityLabel}이(가) 없습니다.</p>
        ) : (
          <div className="flex flex-col">
            {visible.map((item, index) => {
              const id = idOf(item);
              return (
                <div
                  key={id}
                  onClick={() => onOpen(item)}
                  className="group grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 transition-colors duration-100 last:border-b-0 hover:bg-surface lg:grid-cols-12 lg:items-center lg:gap-y-0"
                >
                  <RowSelectCell
                    checked={selectedIds.includes(id)}
                    onChange={(checked) =>
                      setSelectedIds((previous) =>
                        checked ? [...previous, id] : previous.filter((item2) => item2 !== id),
                      )
                    }
                    label={`${nameOf(item)} 선택`}
                    index={index}
                  />

                  {columns.map((column) => (
                    <div
                      key={column.id}
                      className={`flex min-w-0 items-center gap-2 ${SPAN[column.span] ?? 'lg:col-span-2'} ${ALIGN[column.align ?? 'left']}`}
                    >
                      <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">{column.label}</span>
                      {/*
                        `flex` 를 붙이는 것이 중요하다. 열이 그리는 것은 대개 `<span className="truncate">`
                        인데, 이 감싸개가 **블록**이면 그 span 이 inline 으로 남고 `text-overflow: ellipsis`
                        는 inline 요소에 걸리지 않는다 — 글이 잘리지 않고 옆 열을 밀어낸다.
                        flex 로 두면 자식이 블록화되어 `truncate` 가 실제로 먹는다.
                      */}
                      <div className="flex min-w-0 flex-1">{column.render(item)}</div>
                    </div>
                  ))}

                  <div className="lg:col-span-2">
                    <RowActions>
                      <RowIconButton
                        icon="view"
                        label={`${nameOf(item)} 조회`}
                        onClick={() => onOpen(item)}
                      />
                      <RowIconButton
                        icon="delete"
                        tone="danger"
                        label={`${nameOf(item)} 삭제`}
                        onClick={() => setPendingDelete([id])}
                      />
                    </RowActions>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <AdminListPager total={visible.length} page={1} pageSize={Math.max(visible.length, 1)} />
      </section>

      <AdminConfirmModal
        open={pendingDelete !== null}
        title={`${entityLabel} 삭제`}
        description={
          pendingDelete && pendingDelete.length > 1
            ? `선택한 ${entityLabel} ${pendingDelete.length}건을 삭제합니다. 되돌릴 수 없습니다.`
            : `이 ${entityLabel}을(를) 삭제합니다. 되돌릴 수 없습니다.`
        }
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}

export { ALL_VALUE };
