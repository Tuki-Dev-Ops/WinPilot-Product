'use client';

import type { ReactNode } from 'react';

/**
 * 목록 위 한 줄 — **왼쪽은 찾기, 오른쪽은 만들기**.
 *
 *   [ 검색창 ....................... ] [ 필터 ]              [ + 고객사 등록 ]
 *   ───────────────────────────────────────────────────────────────────────
 *   표
 *
 * 둘을 좌우로 갈라 두는 이유: **방향이 반대인 일**이다. 같은 쪽에 모아 두면 누를 것을 고르는
 * 데 한 번 더 생각하게 된다. 등록을 표 아래나 화면 맨 아래에 두지 않는 이유도 같다 — 목록이
 * 길면 등록하러 갈 때마다 끝까지 스크롤해야 하고, 자료가 없어 표가 비었을 때는 단추가 화면
 * 위쪽에 붕 떠 보인다.
 *
 * 배치는 B2C Admin 의 `AdminListToolbar` 와 같은 결이고, 컨트롤 높이도 그쪽 규칙(`h-9`)을
 * 따른다. 조각을 옮겨 오지 않고 이 앱 안에서 만드는 것은 뷰 하나가 곧 레포 하나이기 때문이다
 * (`docs/component.md` §5).
 *
 * **읽기만 하는 목록에는 `action` 을 주지 않는다.** 운영자가 새로 만들지 않는 자료(통계·연체·
 * 이탈·문의)에까지 단추를 그려 두면, 누를 수 없는 이유를 찾느라 시간을 쓴다. 자리를 비워 두되
 * 없는 단추를 그리지 않는다.
 */
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.6 10.6 L14 14" strokeLinecap="round" />
    </svg>
  );
}

export type InternalToolbarProps = {
  searchId: string;
  /** 스크린리더가 읽는 이름 */
  searchLabel: string;
  /** 눈으로 읽는 안내 문구. `placeholder` 속성이 아니라 실제 텍스트 노드다 */
  searchHint: string;
  search: string;
  onSearch: (next: string) => void;
  /** 검색 오른쪽에 붙는 거르개 — 칩 묶음이나 드롭다운 */
  filters?: ReactNode;
  /**
   * 오른쪽 끝 등록 단추.
   *
   * 글자에 **무엇을 만드는지** 적는다(`등록` 이 아니라 `고객사 등록`). 목록마다 만드는 것이
   * 다른데 단추 글자가 같으면, 화면을 옮겼을 때 무엇이 생길지 모른 채 누른다.
   */
  action?: { label: string; onClick: () => void };
};

export function InternalToolbar({
  searchId,
  searchLabel,
  searchHint,
  search,
  onSearch,
  filters,
  action,
}: InternalToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
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
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          className="peer h-9 w-full min-w-0 rounded-lg border border-border-strong bg-canvas pl-9 pr-3 text-sm text-ink"
        />

        {/*
          안내 문구를 `placeholder` 속성으로 넣지 않는다. placeholder 는 DOM 텍스트 노드가
          아니라 추출되지 않고 Figma 에서 빈 상자로 나온다 (`docs/component.md` §5.1).
        */}
        <span className="pointer-events-none absolute left-9 text-sm text-ink-faint peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden">
          {searchHint}
        </span>
      </div>

      {/*
        좁은 화면에서는 검색이 한 줄을 다 쓰고 필터와 등록이 그 아래 한 줄로 내려간다.
        그때도 등록은 오른쪽 끝이다 — `ml-auto` 가 그 자리를 지킨다.
      */}
      {(filters || action) && (
        <div className="flex shrink-0 items-center gap-2">
          {filters}
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="ml-auto h-9 shrink-0 whitespace-nowrap rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-600"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 값 하나를 고르는 칩 묶음.
 *
 * 드롭다운 대신 칩을 쓰는 자리는 **선택지가 대여섯 개 이하**일 때다. 지금 무엇이 걸려 있는지
 * 열어 보지 않고 알 수 있어야 목록을 잘못 읽지 않는다. 그보다 많아지면 `Dropdown` 을 쓴다.
 */
export function InternalChips({
  label,
  options,
  value,
  onChange,
  allLabel = '전체',
}: {
  /** 스크린리더가 읽는 묶음 이름 */
  label: string;
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
  allLabel?: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex min-w-0 flex-wrap items-center gap-2">
      {['all', ...options].map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={`h-9 shrink-0 whitespace-nowrap rounded-lg border px-3 text-sm transition-colors duration-150 ${
            value === option
              ? 'border-brand-500 bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
              : 'border-border-strong text-ink-muted hover:border-ink-faint'
          }`}
        >
          {option === 'all' ? allLabel : option}
        </button>
      ))}
    </div>
  );
}
