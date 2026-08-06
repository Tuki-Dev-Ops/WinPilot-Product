'use client';

import { Smile } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { COPY, ROUTES, SLOT, cid } from '@winpilot/client-content';

/**
 * 마이페이지 공통 뼈대 — **왼쪽 aside 로 갈래를 고르고, 오른쪽 main 만 바뀐다.**
 *
 * 고객지원과 같은 구조다(`SupportShell`). 두 곳 모두 '내가 고른 갈래를 유지한 채 안쪽을 본다'
 * 는 동작이라 구조를 맞춘다 — 화면마다 다른 배치를 쓰면 같은 일을 매번 다시 익혀야 한다.
 *
 * ## 어드민 연동
 * - 갈래(내 정보 · 주문 · 문의 · 쿠폰)는 각각 어드민의 사용자 · **판매** · 문의 · 쿠폰과 이어진다
 * - 주문은 어드민 메뉴에서 **'판매'** 로 불린다 — 워딩만 다르고 자원은 하나다(엔티티 `order`)
 */
const SECTIONS = [
  { href: ROUTES.mypage, label: COPY.mypage.profile },
  { href: ROUTES.orders, label: COPY.mypage.orders },
  { href: ROUTES.mypageInquiries, label: COPY.mypage.inquiries },
  { href: ROUTES.mypageCoupons, label: COPY.mypage.coupons },
] as const;

export function MyPageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <aside
        id={SLOT.mypageAside}
        data-ssot-cid={cid('user.settings', 'SiteMyPageAside')}
        className="w-full shrink-0 lg:w-56"
      >
        <p className="mb-4 text-xl font-bold tracking-tight">{COPY.mypage.title}</p>

        <nav aria-label={COPY.mypage.menu} className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {SECTIONS.map((section) => {
            /*
              `/mypage` 는 다른 갈래(`/mypage/coupons` 등)의 앞자리이기도 하다. 접두사로 판정하면
              쿠폰함에서도 '내 정보 수정' 이 함께 켜지므로, 이 항목만 정확히 같을 때로 본다.
            */
            const active =
              section.href === ROUTES.mypage
                ? pathname === ROUTES.mypage
                : pathname === section.href || pathname.startsWith(`${section.href}/`);
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

/** 오른쪽 main 의 제목 — aside 가 이미 갈래를 말하므로 여기서는 지금 보는 것만 적는다. */
export function MyPageHeading({
  title,
  meta,
  badges,
  avatar = false,
}: {
  title: string;
  meta?: string;
  badges?: string[];
  /** 내 정보 화면에서만 켠다 — 목록 화면에서는 얼굴이 목록보다 앞에 설 이유가 없다 */
  avatar?: boolean;
}) {
  return (
    <header className="flex flex-col gap-2 border-b border-border pb-4">
      <div className="flex items-center gap-3">
        {avatar && (
          // 헤더 아바타와 같은 표정이다 — 회색 원판이 얼굴이라 윤곽선은 그리지 않는다.
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-border text-ink-muted">
            <AvatarMark />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="min-w-0 truncate text-[22px] font-bold leading-snug tracking-tight">{title}</h1>
          {meta && <p className="mt-1 min-w-0 truncate text-sm text-ink-muted">{meta}</p>}
        </div>
      </div>

      {badges && badges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2.5 py-1 text-xs text-ink-muted"
            >
              {badge}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}

function AvatarMark() {
  return (
    <Smile aria-hidden className="size-5" strokeWidth={1.5} />
  );
}
