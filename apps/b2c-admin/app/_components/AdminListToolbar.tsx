'use client';

import { useState, type ChangeEvent } from 'react';
import { Dropdown } from '@winpilot/ui';

export type AdminListTab = {
  id: string;
  label: string;
  count: number;
};

/**
 * 필터 한 칸. `ALL_VALUE` 를 고르면 그 조건은 적용하지 않는다.
 * 목록마다 거는 조건이 달라 툴바는 모양만 알고 뜻은 각 화면이 정한다.
 */
export type AdminFilterField = {
  id: string;
  label: string;
  options: Array<{ value: string; label: string }>;
};

/** 필터를 걸지 않은 상태 */
export const ALL_VALUE = 'all';

export type AdminListToolbarProps = {
  tabs: AdminListTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;

  searchId: string;
  /** 화면에 보이지 않는 접근성 라벨 */
  searchLabel: string;
  /** 입력란 안에 보이는 안내 문구 */
  searchHint: string;
  searchValue: string;
  onSearchChange: (value: string) => void;

  actionLabel: string;
  onAction: () => void;

  filterLabel?: string;
  filters?: AdminFilterField[];
  filterValues?: Record<string, string>;
  onFilterChange?: (id: string, value: string) => void;
  onFilterReset?: () => void;
};

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.6 10.6 L14 14" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2.5 4 h11 M4.5 8 h7 M6.5 12 h3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 목록 화면 공통 툴바.
 *
 * 윗줄  — 상태 탭 (왼쪽) · 주요 액션 (오른쪽)
 * 아랫줄 — 검색 · 필터
 *
 * 안내 문구를 `placeholder` 로 넣지 않는다. placeholder 는 DOM 텍스트 노드가 아니라
 * 추출되지 않고 Figma 에서 빈 상자로 나온다 (docs/spec/05-component.md).
 * 대신 실제 텍스트 노드를 겹쳐 두고, 입력이 시작되거나 포커스가 오면 CSS 로만 숨긴다.
 *
 * 버튼에는 `shrink-0 whitespace-nowrap` 을 건다 — 좁은 폭에서 flex 가 버튼을 눌러
 * 글자가 잘리거나 두 줄로 접히는 것을 막는다.
 */
export function AdminListToolbar({
  tabs,
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
}: AdminListToolbarProps) {
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value);

  const activeCount = filters.filter((field) => (filterValues[field.id] ?? ALL_VALUE) !== ALL_VALUE).length;
  // 필터를 건 채로 접어 두면 목록이 왜 비었는지 알 수 없다 — 조건이 걸려 있으면 펼친 채로 시작한다.
  const [open, setOpen] = useState(activeCount > 0);

  return (
    <div className="flex flex-col gap-4">
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
                onClick={() => onTabChange(tab.id)}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
                  active
                    ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                    : 'bg-surface text-ink-muted'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-xs tabular-nums text-ink-faint">{tab.count}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onAction}
          className="h-9 shrink-0 whitespace-nowrap rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600"
        >
          {actionLabel}
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex min-w-0 flex-1 items-center">
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
