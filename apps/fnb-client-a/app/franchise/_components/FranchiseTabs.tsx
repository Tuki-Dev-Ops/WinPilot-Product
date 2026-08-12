'use client';

import { usePathname } from 'next/navigation';
import { FRANCHISE_NAV } from '@/lib/navigation';

/**
 * 창업 안내 안의 탭 셋 — **가운데로 선다.**
 *
 * ## 왜 헤더에 펼침판을 두지 않았나
 * 창업 아래에 화면이 셋이 되었다. 헤더 갈래마다 펼침판을 들이면 나머지 여섯 갈래도 같은 동작을
 * 배워야 하고, 그중 여섯에서는 그 기대가 어긋난다(`lib/navigation.ts` 머리말). 고객센터와 같은
 * 방식으로 **그 화면 안에서** 나눈다.
 *
 * ## 밑줄이다 — 한때 알약이었다
 * 채워진 알약은 **누르는 것**처럼 읽힌다. 셋이 나란히 서면 그중 하나가 검게 채워져 있어, 지금
 * 보고 있는 자리라기보다 지금 눌러야 할 자리로 보였다.
 *
 * 밑줄은 아래 선을 한 줄 긋고 그 위에 표를 남기는 것뿐이라, 판이 어디서 시작하는지와 지금
 * 어디인지를 한 번에 말한다. 사이트에 탭이 서는 자리는 여기 하나가 되었다(고객센터는 왼쪽
 * 기둥으로 갔다) — 모양을 인자로 받을 일이 없어졌다.
 */
export function FranchiseTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap justify-center gap-1 border-b border-border">
      {FRANCHISE_NAV.map((item) => {
        const here = pathname === item.href;

        return (
          <a
            key={item.href}
            href={item.href}
            {...(here ? { 'aria-current': 'page' as const } : {})}
            /*
              밑줄이 아래 선 위에 겹치게 `-mb-px` 를 준다. 그렇지 않으면 고른 탭 아래에 선이
              두 겹으로 남아, 탭이 판에 붙어 있지 않고 떠 있는 것처럼 보인다.
            */
            className={`-mb-px border-b-2 px-4 py-3 text-sm transition-colors duration-150 ${
              here ? 'border-ink font-semibold text-ink' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
