import { Fragment, type ReactNode } from 'react';
import { ADMIN_MENU, findAdminSection, linkFor } from '@/lib/navigation/admin-menu';

export type AdminShellProps = {
  /** 현재 최상위 섹션 id — 사이드바 활성 표시와 보조 메뉴 선택에 쓴다 */
  sectionId: string;
  /**
   * 현재 위치를 나타내는 경로.
   * 예: `['사용자', '관리자', '상세페이지 (수정)']` → `사용자 | 관리자 | 상세페이지 (수정)`
   * 마지막 항목이 현재 화면이며 강조된다.
   */
  trail: string[];
  /** 보조 메뉴에서 활성으로 표시할 자식 id */
  activeChildId?: string;
  children: ReactNode;
};

/**
 * Admin View 껍데기.
 *
 * 사이드바는 **최상위만** 노출하고, 세부 메뉴는 본문 왼쪽 상단의 보조 aside 에 둔다
 * (docs/spec/04-ia.md §4.4). lg 미만에서는 사이드바가 칩 내비게이션으로 접힌다.
 */
export function AdminShell({ sectionId, trail, activeChildId, children }: AdminShellProps) {
  const section = findAdminSection(sectionId);
  const subItems = section?.children ?? [];

  return (
    <div className="flex min-h-screen bg-surface text-ink">
      <aside
        data-ssot-cid="b2c-admin/shell#AdminShellSidebar"
        className="hidden w-56 shrink-0 flex-col border-r border-border bg-canvas px-4 py-6 lg:flex"
      >
        <div className="flex items-center gap-3 px-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-brand-500 text-sm font-bold text-white">
            W
          </span>
          <div className="leading-tight">
            <div className="text-base font-semibold tracking-tight">WinPilot</div>
            <div className="font-mono text-xs uppercase tracking-widest text-ink-faint">Admin</div>
          </div>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {ADMIN_MENU.map((item) => (
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
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-ink-muted sm:inline">demo@winpilot.test</span>
              <a href="/login" className="text-sm text-brand-700 dark:text-brand-300">
                로그아웃
              </a>
            </div>
          </div>

          <nav className="mt-4 flex flex-wrap gap-2 lg:hidden">
            {ADMIN_MENU.map((item) => (
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
            <aside data-ssot-cid="b2c-admin/shell#AdminShellSubNav" className="w-full shrink-0 lg:w-44">
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
