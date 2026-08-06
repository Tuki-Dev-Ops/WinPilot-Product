import { Fragment, type ReactNode } from 'react';
import { BackLink, BrandMark } from '@winpilot/ui';
import { IR_COMPANY } from '@winpilot/store';
import { IR_MENU, findIrSection, linkFor } from '@/lib/navigation/ir-menu';

export type IrShellProps = {
  /** 현재 최상위 섹션 id — 사이드바 활성 표시와 보조 메뉴 선택에 쓴다 */
  sectionId: string;
  /** 현재 위치. 예: `['공시', 'DART 연동']` */
  trail: string[];
  /** 보조 메뉴에서 활성으로 표시할 자식 id */
  activeChildId?: string;
  /** 상세 화면에서 돌아갈 목록 */
  back?: { href: string; label: string };
  children: ReactNode;
};

/**
 * IR Admin 껍데기.
 *
 * ## 세 콘솔이 같은 뼈대를 쓴다
 * 사이드바는 최상위만, 세부는 본문 왼쪽 보조 메뉴에. 콘솔을 오가는 사람이 구조를 세 번
 * 배우지 않게 하려는 것이고, 그래서 이 파일은 `InternalShell` 과 같은 모양이다.
 *
 * ## B2C Admin 과 같은 색·같은 자리
 * 로고 칩은 **브랜드색**이고, 오른쪽 위에 계정과 로그아웃이 선다. 사내 콘솔만 먹색인 것은
 * 그쪽이 **우리 직원 전용**이라 고객사 콘솔과 한눈에 갈려야 하기 때문이고, IR 어드민은
 * 고객사가 쓰는 콘솔이라 B2C Admin 쪽에 붙는다.
 *
 * 어느 콘솔인지는 색이 아니라 **워드마크**(`Admin` / `Internal` / `IR`)가 말한다 —
 * 색을 콘솔 수만큼 늘리면 그 색이 무엇을 뜻하는지 사람마다 다르게 외운다.
 */
export function IrShell({ sectionId, trail, activeChildId, back, children }: IrShellProps) {
  const section = findIrSection(sectionId);
  const subItems = section?.children ?? [];

  return (
    <div className="flex min-h-screen bg-surface text-ink">
      <aside
        data-ssot-cid="ir-admin/shell#IrShellSidebar"
        className="hidden w-56 shrink-0 flex-col border-r border-border bg-canvas px-4 py-6 lg:flex"
      >
        {/* 어느 콘솔인지는 이름 아래 워드마크(`IR`)가 말한다 — 로고는 어느 회사인지만 말한다. */}
        <BrandMark className="px-2" name={IR_COMPANY.name} note="IR" size={30} />

        <nav className="mt-6 flex flex-col gap-1">
          {IR_MENU.map((item) => (
            <Fragment key={item.id}>
              {/*
                성격이 다른 갈래 앞의 선. `aria-hidden` 인 이유: 낭독기에게는 목록의 순서가 이미
                구조로 전달되고 있어, 구분선까지 읽으면 뜻 없는 한 마디가 끼어든다.
              */}
              {item.separatedBefore && <hr aria-hidden className="my-2 border-t border-border" />}
              <a
                href={linkFor(item)}
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
              <span className="hidden text-sm text-ink-muted sm:inline">ir@example.com</span>
              {/* B2C Admin 과 같은 자리에 둔다 — 로그인 화면은 아직 없어 주소만 맞춰 둔다. */}
              <a href="/login" className="text-sm text-brand-700 dark:text-brand-300">
                로그아웃
              </a>
            </div>
          </div>

          {/* lg 미만에서는 사이드바가 사라지므로 최상위 메뉴를 여기로 접는다. */}
          <nav className="mt-4 flex flex-wrap gap-2 lg:hidden">
            {IR_MENU.map((item) => (
              <a
                key={item.id}
                href={linkFor(item)}
                /* 칩은 가로로 눕는 자리라 왼쪽 선이 뜻을 갖지 못한다 — 여기서만 채움을 쓴다. */
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
            <aside data-ssot-cid="ir-admin/shell#IrShellSubNav" className="w-full shrink-0 lg:w-44">
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
