import { Fragment, type ReactNode } from 'react';
import { BackLink } from '@winpilot/ui';
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
  /**
   * 상세 화면에서 **돌아갈 목록**. 주면 본문 맨 위에 되돌아가는 길이 선다.
   *
   * 셸이 그리는 이유: 상세 화면마다 각자 그리면 자리가 조금씩 어긋나고, 어긋남은 화면을
   * 나란히 놓기 전에는 드러나지 않는다. 목록 화면에는 주지 않는다 — 돌아갈 곳이 자기 자신이다.
   */
  back?: { href: string; label: string };
  children: ReactNode;
};

/**
 * Admin View 껍데기.
 *
 * 사이드바는 **최상위만** 노출하고, 세부 메뉴는 본문 왼쪽 상단의 보조 aside 에 둔다
 * (docs/spec/04-ia.md §4.4). lg 미만에서는 사이드바가 칩 내비게이션으로 접힌다.
 */
export function AdminShell({ sectionId, trail, activeChildId, back, children }: AdminShellProps) {
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
            <Fragment key={item.id}>
              {/*
                성격이 다른 갈래 앞의 선. `aria-hidden` 을 붙이는 이유: 낭독기에게는 이미
                메뉴 목록의 순서가 구조로 전달되고 있어서, 구분선까지 읽으면 항목 사이마다
                뜻 없는 한 마디가 끼어든다. 눈으로 보는 사람에게만 필요한 표시다.
              */}
              {item.separatedBefore && <hr aria-hidden className="my-2 border-t border-border" />}
              <a
                href={linkFor(item)}
              /*
                최상위와 보조 메뉴는 **동시에 켜져 `고객사 > 이탈` 로 읽히는 한 쌍**이라 같은 표시를 쓴다.
                다르게 두면 같은 뜻의 표시를 두 가지로 배우게 된다.
              */
                className={`rounded-r-lg border-l-2 px-3 py-2 text-sm ${
                  item.id === sectionId
                    ? 'border-brand-500 font-semibold text-brand-700 dark:text-brand-300'
                    : 'border-transparent text-ink-muted'
                }`}
              >
                {item.label}
              </a>
            </Fragment>
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
                /*
                  칩은 가로로 눕는 자리라 왼쪽 선이 뜻을 갖지 못한다 — 세로로 선 목록에서만 선이
                  `여기서부터 이 갈래` 로 읽힌다. 그래서 칩에서만 채움을 쓰고, 색은 상태 탭과 같은 먹색이다.
                */
                className={`rounded px-3 py-1.5 text-sm ${
                  item.id === sectionId ? 'bg-ink font-medium text-white' : 'bg-surface text-ink-muted'
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
                    className={`rounded-r-lg border-l-2 px-3 py-2 text-sm ${
                      child.id === activeChildId
                        ? 'border-brand-500 font-semibold text-brand-700 dark:text-brand-300'
                        : 'border-transparent text-ink-muted'
                    }`}
                  >
                    {child.label}
                  </a>
                ))}
              </nav>
            </aside>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-8">
            {back && <BackLink href={back.href} label={back.label} />}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
