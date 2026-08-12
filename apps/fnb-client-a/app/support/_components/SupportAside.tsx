'use client';

import { usePathname } from 'next/navigation';
import { SUPPORT_NAV } from '@/lib/navigation';

/**
 * 고객센터 안의 길 — **본문 왼쪽에 세로로 선다.**
 *
 * ## 헤더에 펼침판을 들이지 않는 대신
 * 일곱 갈래 중 아래에 둘이 있는 것은 고객센터뿐이다. 그 하나 때문에 헤더에 펼침판을 들이면
 * 나머지 여섯도 같은 동작을 배워야 한다 — 마우스를 올리면 무언가 열릴 수 있다는 기대가
 * 생기고, 여섯에서는 그 기대가 어긋난다.
 *
 * ## 가로 탭이 아니라 왼쪽 기둥이다
 * 처음에는 제목 아래 가로 탭이었다. 그런데 이 아래 오는 것이 **긴 목록**(공지 여럿 · 물음
 * 여럿)이라, 스크롤을 조금만 내려도 탭이 화면 밖으로 나가고 그때부터 옆으로 갈 길이 사라진다.
 * 왼쪽에 세우면 목록을 읽는 내내 같은 자리에 남는다.
 *
 * 창업 안내는 여전히 가운데 알약 탭이다 — 저쪽 셋은 **읽는 차례**(절차 → 신청 → 문의)라 지금
 * 어느 단계인지가 드러나야 하고, 화면마다 내용이 짧아 한눈에 끝난다.
 *
 * ## 좁은 화면에서는 눕는다
 * `lg` 미만에서 세로로 두면 본문이 그만큼 아래로 밀려, 작은 화면에서 첫 화면이 링크 둘로
 * 채워진다. 가로로 접어 두면 한 줄만 쓴다.
 *
 * ## 목록을 두 화면이 나눠 읽는다
 * `SUPPORT_NAV` 하나를 두 화면이 함께 쓴다. 화면마다 적어 두면 하나가 늘 때 한쪽에만 생기고,
 * 그 화면에서는 다른 곳으로 갈 길이 없어진다.
 */
export function SupportAside() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:w-44">
      <nav className="flex flex-wrap gap-1 lg:flex-col">
        {SUPPORT_NAV.map((item) => {
          const here = pathname === item.href;

          return (
            <a
              key={item.href}
              href={item.href}
              {...(here ? { 'aria-current': 'page' as const } : {})}
              /*
                고른 것에 왼쪽 선이 선다. 어드민 콘솔의 보조 메뉴와 같은 모양인데, 세로로 선
                목록에서 지금 자리를 알리는 방법으로 이미 이 저장소가 쓰고 있는 것이다.
              */
              className={`rounded-r-lg border-l-2 px-3 py-2 text-sm transition-colors duration-150 ${
                here ? 'border-ink font-semibold text-ink' : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
