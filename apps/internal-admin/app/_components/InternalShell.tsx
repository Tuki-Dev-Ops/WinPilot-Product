import { Fragment, type ReactNode } from 'react';
import { INTERNAL_MENU, findInternalSection, linkFor } from '@/lib/navigation/internal-menu';

export type InternalShellProps = {
  sectionId: string;
  /** 현재 위치 — 마지막 항목이 현재 화면이며 강조된다. */
  trail: string[];
  activeChildId?: string;
  children: ReactNode;
};

/**
 * Internal Admin 껍데기.
 *
 * 구조는 B2C Admin 과 같지만(사이드바 최상위 + 본문 보조 메뉴), **로고 색과 배지가 다르다** —
 * 두 화면을 동시에 띄워 두고 일하다 어느 쪽에 값을 넣는지 헷갈리면 고객사 설정을 잘못 건드린다.
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
        <header className="border-b border-border bg-canvas px-6 py-4">
          <div className="flex flex-wrap items-center gap-2 lg:hidden">
            {INTERNAL_MENU.map((item) => (
              <a
                key={item.id}
                href={linkFor(item)}
                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
                  item.id === sectionId
                    ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                    : 'bg-surface text-ink-muted'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <h1 className="mt-3 flex flex-wrap items-center gap-2 text-lg font-semibold tracking-tight lg:mt-0">
            {trail.map((step, index) => (
              <Fragment key={step}>
                {index > 0 && <span className="text-ink-faint">|</span>}
                <span className={index === trail.length - 1 ? '' : 'text-ink-muted'}>{step}</span>
              </Fragment>
            ))}
          </h1>
        </header>

        <main className="flex min-w-0 flex-1 flex-col gap-6 px-6 py-6">
          {subItems.length > 0 && (
            <nav className="flex flex-wrap items-center gap-2">
              {subItems.map((child) => (
                <a
                  key={child.id}
                  href={linkFor(child)}
                  className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${
                    child.id === activeChildId
                      ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                      : 'bg-canvas text-ink-muted'
                  }`}
                >
                  {child.label}
                </a>
              ))}
            </nav>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
