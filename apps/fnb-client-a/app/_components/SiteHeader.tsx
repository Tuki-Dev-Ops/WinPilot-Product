'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BrandMark } from '@winpilot/ui';
import { FNB_BRAND } from '@winpilot/store';
import { SITE_NAV, type SiteNavItem } from '@/lib/navigation';
import { OctopusMark } from './OctopusMark';

/**
 * 상단 내비 — **갈래 일곱.**
 *
 * 펼침판도 단추도 없는 이유는 `lib/navigation.ts` 머리말에 있다. 여기서 하는 일은 일곱을
 * 세우는 것과, **띠를 언제 깔지 · 지금 어디인지**를 정하는 것뿐이다.
 *
 * ## 지금 있는 갈래에 표를 남긴다
 * 갈래가 넷일 때는 없어도 됐다. 일곱이 되면 한 줄이 길어져, 어느 화면을 보고 있는지가
 * **본문을 읽어야만** 드러난다. 밑줄 하나로 그 물음이 사라진다.
 *
 * 하위 화면에서도 그 갈래에 표가 남아야 한다(`/support/faq` 에서 `고객센터`). 그래서 주소가
 * 같은지가 아니라 **그 갈래로 시작하는지**를 본다.
 *
 * ## 언제나 검은 띠다 — 첫 화면 맨 위만 빼고
 * 화면마다 헤더 색이 다르면 같은 사이트 안에서 머리가 두 벌로 보인다. 검게 고정하면 어느
 * 화면에서든 맨 위가 같은 띠다.
 *
 * 첫 화면만 빼는 것은 거기서 헤더가 사진 위에 겹쳐 뜨기 때문이다. 띠를 깔면 사진이 그만큼
 * 잘린다 — 대신 조금이라도 내려가면 그때 깔린다.
 *
 * 사라지게 두지 않는 이유: 이 사이트는 아래로 길다. 헤더가 맨 위에만 있으면 메뉴를 다 읽은
 * 사람이 매장을 보러 가려고 **끝까지 올라갔다 와야 한다.**
 */
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const scrolled = useScrolled();
  const pathname = usePathname();
  const solid = !overlay || scrolled;

  return (
    <header
      className={`${overlay ? 'fixed inset-x-0 top-0 z-30' : 'sticky top-0 z-30'} text-white transition-colors duration-200 ${
        solid ? 'border-b border-white/10 bg-night/90 backdrop-blur-sm' : ''
      }`}
    >
      <div className="mx-auto flex w-full max-w-320 flex-wrap items-center justify-between gap-4 px-6 py-4">
        {/*
          헤더가 늘 어두우므로 로고도 늘 흰색이다 — 색을 재는 조건이 없어졌다.

          영문명(`nameEn`)을 이름 아래 두지 않는다. 손님에게 그것은 **같은 말을 두 번** 하는
          것이고, 맨 위에서 답할 것은 어느 집인가 하나다. 영문명이 필요해지는 자리는 저작권
          표시처럼 정식 이름을 적어야 하는 곳이고, 거기서는 지금도 쓰고 있다.

          로고 자리에 문어를 세운다(`mark`). 이 브랜드는 아직 로고 파일이 없어, 안 넘기면
          **다른 브랜드의 로고**가 여기 선다. 원본을 받는 날 이 줄만 빼면 파일로 돌아간다.
        */}
        <BrandMark
          href="/"
          mark={<OctopusMark className="size-8 shrink-0 text-white" />}
          name={FNB_BRAND.name}
          tone="light"
          size={30}
        />

        {/* 일곱이 서므로 간격을 좁힌다. 좁은 화면에서는 줄이 접힌다(`flex-wrap`). */}
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {SITE_NAV.map((item) => {
            const here = isHere(pathname, item);

            return (
              <a
                key={item.label}
                href={item.href}
                {...(here ? { 'aria-current': 'page' as const } : {})}
                className={`relative block whitespace-nowrap py-2 text-sm font-semibold transition-colors duration-150 ${
                  here ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
                {here && <span aria-hidden className="absolute inset-x-0 -bottom-0.5 block h-0.5 bg-white" />}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

/**
 * 지금 이 갈래 안에 있는가.
 *
 * 주소가 같은지가 아니라 **그 갈래로 시작하는지**를 본다. `/menu/sukhoe-whole` 에서도 `메뉴` 에
 * 표가 남아야 하기 때문이다.
 *
 * 재는 것은 `href` 가 아니라 `match` 다 — 가는 곳과 덮는 곳이 갈리는 갈래가 있다(그쪽 머리말).
 *
 * 홈(`/`)만 따로 본다. 모든 주소가 `/` 로 시작하므로 앞자리 비교로는 늘 걸린다 — 지금 홈은
 * 갈래에 없지만, 나중에 누가 넣는 날 일곱 갈래에 전부 밑줄이 그어지는 것으로 드러난다.
 */
function isHere(pathname: string, item: SiteNavItem): boolean {
  const scope = item.match ?? item.href;
  if (scope === '/') return pathname === '/';
  return pathname === scope || pathname.startsWith(`${scope}/`);
}

/**
 * 맨 위에서 벗어났는가.
 *
 * 문턱을 `8px` 로 둔 이유: `0` 으로 두면 탄력 스크롤(트랙패드에서 위로 튕기는 것)에 값이
 * 오가며 띠가 깜빡인다. 그렇다고 크게 두면 이미 글이 헤더 아래로 들어온 뒤에 띠가 켜진다.
 *
 * `passive` 를 주는 이유: 이 처리는 스크롤을 막을 일이 없다고 브라우저에 알리는 것이고,
 * 그래야 스크롤이 이 함수를 기다리지 않는다.
 */
function useScrolled(): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll(); /* 새로고침이 중간에서 일어나면 처음부터 켜져 있어야 한다. */
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return scrolled;
}
