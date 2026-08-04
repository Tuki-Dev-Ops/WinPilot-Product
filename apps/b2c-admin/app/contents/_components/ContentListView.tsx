'use client';

import { useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { AdminBulkBar } from '@/app/_components/AdminBulkBar';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import { AdminListPager } from '@/app/_components/AdminListPager';
import { AdminListToolbar, ALL_VALUE, type AdminFilterField } from '@/app/_components/AdminListToolbar';
import { Checkbox, useToast } from '@winpilot/ui';

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
  entityLabel: string;
  items: T[];
  onItemsChange: (next: T[]) => void;

  idOf: (item: T) => string;
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

  filters?: AdminFilterField[];
  matchesFilters?: (item: T, values: Record<string, string>) => boolean;
};

const TAB_VISIBLE: Record<string, boolean | null> = { all: null, shown: true, hidden: false };
const TAB_LABEL: Record<string, string> = { all: '전체', shown: '노출', hidden: '숨김' };

// shrink-0 · whitespace-nowrap — 좁은 폭에서 flex 가 버튼을 눌러 글자가 접히는 것을 막는다.
const ACTION_BUTTON = 'h-8 shrink-0 whitespace-nowrap rounded-lg border px-3 text-sm transition-colors duration-150';

/** 행 클릭으로 상세가 열리므로, 행 안의 컨트롤은 자기 동작만 하도록 전파를 끊는다. */
const stopRowClick = (event: MouseEvent) => event.stopPropagation();

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

  // 열 예산을 넘기면 표가 조용히 두 줄로 접힌다 — 화면을 만들 때 바로 알도록 개발 중에만 알린다.
  if (process.env.NODE_ENV !== 'production') {
    const used = columns.reduce((sum, column) => sum + column.span, 0);
    if (used > CONTENT_COLUMN_BUDGET) {
      console.warn(
        `[ContentListView] ${entityLabel}: 열 합 ${used} 이 예산 ${CONTENT_COLUMN_BUDGET} 을 넘습니다 — 관리 열이 다음 줄로 밀립니다.`,
      );
    }
  }

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
    const labels = items.filter((item) => targets.has(idOf(item))).map(labelOf);
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
      <AdminListToolbar
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

          <span className="lg:col-span-2 lg:text-right">관리</span>
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
                  className="grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 transition-colors duration-100 last:border-b-0 hover:bg-surface lg:grid-cols-12 lg:items-center lg:gap-y-0"
                >
                  <div className="flex items-center gap-3 lg:col-span-1" onClick={stopRowClick}>
                    <Checkbox
                      checked={selectedIds.includes(id)}
                      onChange={(checked) =>
                        setSelectedIds((previous) =>
                          checked ? [...previous, id] : previous.filter((item2) => item2 !== id),
                        )
                      }
                      label={`${labelOf(item)} 선택`}
                    />
                    <span className="w-6 text-center font-mono text-sm tabular-nums text-ink-faint">{index + 1}</span>
                  </div>

                  {columns.map((column) => (
                    <div
                      key={column.id}
                      className={`flex min-w-0 items-center gap-2 ${SPAN[column.span] ?? 'lg:col-span-2'} ${ALIGN[column.align ?? 'left']}`}
                    >
                      <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">{column.label}</span>
                      <div className="min-w-0 flex-1">{column.render(item)}</div>
                    </div>
                  ))}

                  <div className="flex items-center gap-2 lg:col-span-2 lg:justify-end" onClick={stopRowClick}>
                    <button
                      type="button"
                      onClick={() => onOpen(item)}
                      className={`${ACTION_BUTTON} border-border-strong text-ink-muted hover:border-ink-faint`}
                    >
                      조회
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete([id])}
                      className={`${ACTION_BUTTON} border-border-strong text-signal-danger hover:border-signal-danger`}
                    >
                      삭제
                    </button>
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
