import { Fragment, type ReactNode } from 'react';
import { INTERNAL_MENU, findInternalSection, linkFor } from '@/lib/navigation/internal-menu';

export type InternalShellProps = {
  /** 현재 최상위 섹션 id — 사이드바 활성 표시와 보조 메뉴 선택에 쓴다 */
  sectionId: string;
  /**
   * 현재 위치를 나타내는 경로.
   * 예: `['연동', 'OAuth 정보']` → `연동 | OAuth 정보`
   * 마지막 항목이 현재 화면이며 강조된다.
   */
  trail: string[];
  /** 보조 메뉴에서 활성으로 표시할 자식 id */
  activeChildId?: string;
  children: ReactNode;
};

/**
 * Internal Admin 껍데기.
 *
 * **B2C Admin 의 `AdminShell` 과 같은 뼈대다** — 사이드바는 최상위만, 세부는 본문 왼쪽 보조
 * aside 에, lg 미만에서는 사이드바가 칩 내비게이션으로 접힌다 (docs/spec/04-ia.md §4.4).
 * 두 콘솔을 오가며 일하는 사람이 같은 자리에서 같은 것을 찾게 하려는 것이라, 배치·여백을
 * 따로 두지 않는다. 한쪽만 손보면 그때부터 두 벌이 된다.
 *
 * 다른 것은 **어느 콘솔인지 알리는 표시**뿐이다: 로고 칩이 브랜드색이 아니라 먹색이고,
 * 워드마크가 `Internal` 이며, 사이드바에 사내 전용이라는 한 줄이 붙는다. 두 화면을 동시에
 * 띄워 두고 일하다 어느 쪽인지 헷갈리면 고객사 설정을 잘못 건드린다.
 */
export function InternalShell({ sectionId, trail, activeChildId, children }: InternalShellProps) {
  const section = findInternalSection(sectionId);
  const subItems = section?.children ?? [];

  return (
    <div className="flex min-h-screen bg-surface text-ink">
      <aside
        data-ssot-cid="internal-admin/shell#InternalShellSidebar"
        className="hidden w-56 shrink-0 flex-col border-r border-border bg-canvas px-4 py-6 lg:flex"
      >
        <div className="flex items-center gap-3 px-2">
          {/* 먹색 — B2C Admin 은 브랜드색이다. 색 하나로 어느 콘솔인지 먼저 알린다. */}
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-ink text-sm font-bold text-white">
            W
          </span>
          <div className="leading-tight">
            <div className="text-base font-semibold tracking-tight">WinPilot</div>
            <div className="font-mono text-xs uppercase tracking-widest text-ink-faint">Internal</div>
          </div>
        </div>

        <p className="mt-4 rounded-lg bg-surface px-3 py-2 text-xs leading-relaxed text-ink-muted">
          사내 전용 · 고객사 설정을 다룹니다
        </p>

        <nav className="mt-6 flex flex-col gap-1">
          {INTERNAL_MENU.map((item) => (
            <a
              key={item.id}
              href={linkFor(item)}
              className={`rounded-lg px-3 py-2 text-sm ${
                item.id === sectionId
                  ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                  : 'text-ink-muted'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-canvas px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <h1 aria-label={trail.join(' > ')} className="flex flex-wrap items-center gap-2 text-lg tracking-tight">
              {trail.map((part, index) => (
                <Fragment key={part}>
                  {index > 0 && (
                    <span aria-hidden="true" className="text-ink-faint">
                      |
                    </span>
                  )}
                  <span className={index === trail.length - 1 ? 'font-semibold' : 'text-ink-muted'}>{part}</span>
                </Fragment>
              ))}
            </h1>
            {/*
              B2C Admin 은 여기에 로그아웃을 두지만 이 앱에는 로그인 화면이 아직 없다.
              모양을 맞추자고 링크를 걸면 눌렀을 때 404 로 간다 — 없는 길을 그려 두지 않는다.
            */}
            <span className="hidden shrink-0 text-sm text-ink-muted sm:inline">staff@winpilot.test</span>
          </div>

          {/* lg 미만에서는 사이드바가 사라지므로 최상위 메뉴를 여기로 접는다. */}
          <nav className="mt-4 flex flex-wrap gap-2 lg:hidden">
            {INTERNAL_MENU.map((item) => (
              <a
                key={item.id}
                href={linkFor(item)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  item.id === sectionId
                    ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                    : 'bg-surface text-ink-muted'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <main className="flex flex-col gap-8 px-6 py-8 lg:flex-row lg:gap-10 lg:px-8">
          {subItems.length > 0 && (
            <aside data-ssot-cid="internal-admin/shell#InternalShellSubNav" className="w-full shrink-0 lg:w-44">
              <nav className="flex flex-wrap gap-1 lg:flex-col">
                {subItems.map((child) => (
                  <a
                    key={child.id}
                    href={linkFor(child)}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      child.id === activeChildId ? 'bg-canvas font-medium text-ink' : 'text-ink-muted'
                    }`}
                  >
                    {child.label}
                  </a>
                ))}
              </nav>
            </aside>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
