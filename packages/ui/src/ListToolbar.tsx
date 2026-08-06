'use client';

import { ListFilter, Search } from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import { Button } from './Button';
import { Dropdown } from './Dropdown';

export type ListToolbarTab = {
  id: string;
  label: string;
  count: number;
};

/**
 * 필터 한 칸. `ALL_VALUE` 를 고르면 그 조건은 적용하지 않는다.
 * 목록마다 거는 조건이 달라 툴바는 모양만 알고 뜻은 각 화면이 정한다.
 */
export type ListFilterField = {
  id: string;
  label: string;
  options: Array<{ value: string; label: string }>;
};

/** 필터를 걸지 않은 상태 */
export const ALL_VALUE = 'all';

export type ListToolbarProps = {
  /** 비우면 탭 줄을 그리지 않는다 */
  tabs?: ListToolbarTab[];
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;

  searchId: string;
  /** 화면에 보이지 않는 접근성 라벨 */
  searchLabel: string;
  /** 입력란 안에 보이는 안내 문구 */
  searchHint: string;
  searchValue: string;
  onSearchChange: (value: string) => void;

  /** 비우면 등록 단추를 그리지 않는다 */
  actionLabel?: string;
  onAction?: () => void;

  filterLabel?: string;
  filters?: ListFilterField[];
  filterValues?: Record<string, string>;
  onFilterChange?: (id: string, value: string) => void;
  onFilterReset?: () => void;
};

function SearchIcon() {
  return (
    <Search aria-hidden className="size-4" strokeWidth={1.5} />
  );
}

function FilterIcon() {
  return (
    <ListFilter aria-hidden className="size-4" strokeWidth={1.5} />
  );
}

/**
 * 목록 화면 공통 툴바 — **두 어드민이 같은 것을 쓴다.**
 *
 * 윗줄  — 상태 탭 (왼쪽) · 등록 단추 (오른쪽)
 * 아랫줄 — 검색 · 필터
 *
 * 왼쪽(찾기)과 오른쪽(만들기)을 가른 이유: 둘은 방향이 반대인 일이라 한쪽에 모아 두면
 * 누를 것을 고르는 데 한 번 더 생각하게 된다. 등록을 표 아래에 두지 않는 이유도 같다 —
 * 목록이 길면 등록하러 갈 때마다 끝까지 스크롤해야 하고, 표가 비면 단추가 붕 떠 보인다.
 *
 * 탭에 **건수를 함께** 적는다. 눌러 보기 전에 몇 건인지 알아야 어디를 볼지 정한다.
 *
 * 탭도 등록도 없는 목록(운영자가 새로 만들지 않는 것)에서는 **윗줄 자체를 그리지 않는다.**
 * 누를 수 없는 단추를 두면 왜 안 되는지를 찾게 되고, 빈 줄을 남기면 자리만 차지한다.
 *
 * 안내 문구를 `placeholder` 로 넣지 않는다. placeholder 는 DOM 텍스트 노드가 아니라
 * 추출되지 않고 Figma 에서 빈 상자로 나온다 (`docs/component.md`). 대신 실제 텍스트 노드를
 * 겹쳐 두고, 입력이 시작되거나 포커스가 오면 CSS 로만 숨긴다.
 *
 * 버튼에는 `shrink-0 whitespace-nowrap` 을 건다 — 좁은 폭에서 flex 가 버튼을 눌러
 * 글자가 잘리거나 두 줄로 접히는 것을 막는다.
 */
export function ListToolbar({
  tabs = [],
  activeTabId,
  onTabChange,
  searchId,
  searchLabel,
  searchHint,
  searchValue,
  onSearchChange,
  actionLabel,
  onAction,
  filterLabel = '필터',
  filters = [],
  filterValues = {},
  onFilterChange,
  onFilterReset,
}: ListToolbarProps) {
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value);

  const activeCount = filters.filter((field) => (filterValues[field.id] ?? ALL_VALUE) !== ALL_VALUE).length;
  // 필터를 건 채로 접어 두면 목록이 왜 비었는지 알 수 없다 — 조건이 걸려 있으면 펼친 채로 시작한다.
  const [open, setOpen] = useState(activeCount > 0);

  const hasTabs = tabs.length > 0;
  const hasAction = Boolean(actionLabel);

  return (
    <div className="flex flex-col gap-4">
      {/*
        윗줄은 **탭이 있을 때만** 그린다. 탭 없이 등록만 있는 목록에서 윗줄을 세우면 단추 하나가
        줄 하나를 차지해 위가 비어 보이고, 눈이 위·아래를 두 번 훑게 된다. 그때는 아래 검색 줄의
        오른쪽 끝에 붙인다.
      */}
      {hasTabs && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="상태 필터" className="flex flex-wrap items-center gap-2">
              {tabs.map((tab) => {
                const active = tab.id === activeTabId;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => onTabChange?.(tab.id)}
                    className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded px-3 py-1.5 text-sm ${
                      active
                        ? 'bg-ink font-medium text-white'
                        : 'bg-surface text-ink-muted'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-xs tabular-nums ${active ? 'text-white/70' : 'text-ink-faint'}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
          </div>

          {hasAction && (
            <Button onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/*
          남는 폭을 전부 먹지 않게 상한을 둔다. 검색어는 길어야 스무 자 남짓인데 입력란만
          화면 끝까지 늘어나면 빈 칸이 대부분이고, 옆의 필터 단추가 멀리 밀려 한 눈에 들어오지
          않는다. 좁은 화면(sm 미만)에서는 한 줄을 다 쓴다 — 거기서는 줄일 이유가 없다.
        */}
        <div className="relative flex min-w-0 flex-1 items-center sm:max-w-96">
          <span className="pointer-events-none absolute left-3 flex items-center text-ink-faint">
            <SearchIcon />
          </span>

          <input
            id={searchId}
            name={searchId}
            type="search"
            aria-label={searchLabel}
            placeholder=" "
            value={searchValue}
            onChange={handleSearch}
            className="peer h-9 w-full min-w-0 rounded-lg border border-border-strong bg-canvas pl-9 pr-3 text-sm text-ink"
          />

          <span className="pointer-events-none absolute left-9 text-sm text-ink-faint peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden">
            {searchHint}
          </span>
        </div>

        {filters.length > 0 && (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((previous) => !previous)}
            className={`flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-4 text-sm transition-colors duration-150 ${
              activeCount > 0
                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                : 'border-border-strong bg-canvas text-ink-muted hover:border-ink-faint'
            }`}
          >
            <FilterIcon />
            {filterLabel}
            {activeCount > 0 && (
              <span className="rounded-full bg-brand-500 px-1.5 text-xs font-medium tabular-nums text-white">
                {activeCount}
              </span>
            )}
          </button>
        )}

        {/*
          탭이 없으면 등록이 이 줄의 오른쪽 끝에 선다. sm 미만에서 쌓일 때도 마지막이고 너비를 채운다.

          자리를 잡는 클래스(`w-full`·`sm:ml-auto`)는 **단추가 아니라 이 감싸개**가 갖는다.
          단추가 자기 자리를 알면 다른 자리에 세울 때마다 예외가 하나씩 는다.
        */}
        {!hasTabs && hasAction && (
          <div className="w-full sm:ml-auto sm:w-auto">
            <Button block onClick={onAction}>
              {actionLabel}
            </Button>
          </div>
        )}
      </div>

      {filters.length > 0 && open && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-canvas px-5 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filters.map((field) => (
              <div key={field.id} className="flex min-w-0 flex-col gap-2">
                <span className="text-xs text-ink-faint">{field.label}</span>
                <Dropdown
                  id={`filter-${field.id}`}
                  label={`${field.label} 전체`}
                  options={[{ value: ALL_VALUE, label: '전체' }, ...field.options]}
                  value={filterValues[field.id] ?? ALL_VALUE}
                  onChange={(next) => onFilterChange?.(field.id, next)}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-xs text-ink-muted">
              {activeCount > 0 ? `조건 ${activeCount}개 적용 중` : '적용된 조건이 없습니다.'}
            </p>
            <button
              type="button"
              disabled={activeCount === 0}
              onClick={onFilterReset}
              className="h-8 shrink-0 whitespace-nowrap rounded-lg border border-border-strong px-3 text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint disabled:opacity-50"
            >
              초기화
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
