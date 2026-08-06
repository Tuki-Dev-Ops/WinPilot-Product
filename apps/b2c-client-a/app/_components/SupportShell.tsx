'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { BackLink } from '@winpilot/ui';
import { COPY, ROUTES, SLOT, cid } from '@winpilot/client-content';

/**
 * 고객지원 공통 뼈대 — **왼쪽 aside 로 갈래를 고르고, 오른쪽 main 만 바뀐다.**
 *
 * 공지사항·FAQ·뉴스는 읽는 목적이 같은 세 갈래라 화면 구조도 같아야 한다. 페이지마다 다른
 * 배치를 두면 갈래를 옮길 때마다 눈이 다시 화면을 훑어야 한다.
 *
 * 상세로 들어갈 때도 aside 는 그대로 두고 오른쪽만 바꾼다 — 지금 어느 갈래를 보고 있는지가
 * 상세에서도 유지되어야 옆 항목으로 건너뛸 수 있다.
 *
 * ## 어드민 연동
 * - 갈래(공지사항 · FAQ · 뉴스 · 문의하기)는 `b2c-admin` 콘텐츠 메뉴와 문의 메뉴에 그대로 대응한다
 */
const SECTIONS = [
  { href: ROUTES.notices, label: COPY.nav.notices },
  { href: ROUTES.faqs, label: COPY.nav.faqs },
  { href: ROUTES.news, label: COPY.nav.news },
  { href: ROUTES.contact, label: COPY.nav.contact },
] as const;

export function SupportShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <aside
        id={SLOT.supportAside}
        data-ssot-cid={cid('notice.list', 'SiteSupportAside')}
        className="w-full shrink-0 lg:w-52"
      >
        <p className="mb-4 text-xl font-bold tracking-tight">{COPY.nav.support}</p>

        <nav aria-label={COPY.nav.support} className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {SECTIONS.map((section) => {
            // 상세(`/notices/N-1`)도 같은 갈래다 — 접두사로 판정해야 상세에서 표시가 꺼지지 않는다.
            const active = pathname === section.href || pathname.startsWith(`${section.href}/`);
            return (
              <a
                key={section.href}
                href={section.href}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm transition-colors duration-150 ${
                  active
                    ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                    : 'text-ink-muted hover:bg-surface'
                }`}
              >
                {section.label}
              </a>
            );
          })}
        </nav>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col gap-6">{children}</main>
    </div>
  );
}

/**
 * 오른쪽 main 의 제목 — aside 가 이미 갈래를 말하므로 여기서는 지금 보는 것만 적는다.
 *
 * 상세에서는 **제목 위에 목록으로 돌아가는 길**을 둔다. 브라우저 뒤로가기에 맡기면 검색이나
 * 링크로 바로 들어온 사람에게는 돌아갈 곳이 없다.
 */
export function SupportHeading({
  title,
  meta,
  backHref,
  backLabel = '목록으로',
}: {
  title: string;
  meta?: string;
  backHref?: string;
  /** 어디로 돌아가는지. 무엇의 목록인지 적을 수 있으면 적는다 */
  backLabel?: string;
}) {
  return (
    <header className="flex flex-col gap-2 border-b border-border pb-4">
      {/* 되돌아가는 길은 공용 조각이다 — 세 콘솔이 같은 모양을 쓰기로 했다(`@winpilot/ui` 의 BackLink). */}
      {backHref && <BackLink href={backHref} label={backLabel} />}
      <h1 className="text-[22px] font-bold leading-snug tracking-tight">{title}</h1>
      {meta && <p className="font-mono text-xs tabular-nums text-ink-faint">{meta}</p>}
    </header>
  );
}

