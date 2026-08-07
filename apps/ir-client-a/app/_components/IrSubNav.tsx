import { IR_ROUTES } from '@/lib/navigation';

/**
 * IR 화면들 사이를 오가는 줄.
 *
 * ## 이 줄이 없으면 IR 화면은 섬이다
 * IR 은 헤더 네 갈래(ABOUT · SOLUTION · PRODUCT · CS CENTER) 어디에도 들지 않는다 — 처음 온
 * 사람의 물음이 아니기 때문이다. 그런데 그 결과로 **공시를 보던 사람이 재무로 가려면 주소를
 * 직접 쳐야** 했다. 아홉 화면이 서로 이어지지 않은 채 각각 떠 있었던 셈이다.
 *
 * 헤더에 IR 갈래를 더하지 않고 여기서 푸는 이유: 헤더는 **처음 온 사람의 길**이고, 이 줄은
 * **이미 IR 안에 들어온 사람의 길**이다. 둘을 한 자리에 두면 다섯 갈래가 되어 처음 온 사람이
 * 넷 중에서 고르던 것을 다섯 중에서 고르게 된다.
 *
 * ## 지금 보는 화면을 표시한다
 * 아홉이 한 줄로 서면 그중 어디에 있는지가 사라진다. 지금 것만 먹색 알약으로 두면, 옆으로
 * 훑는 눈이 자기 자리를 먼저 찾는다.
 *
 * ## 가로로 밀리게 둔다
 * 좁은 화면에서 아홉을 접으면 세 줄이 되어 본문이 그만큼 아래로 밀린다. 한 줄로 두고 넘치는
 * 만큼 밀리게 하면 자리를 한 줄만 쓴다 — 스크롤 막대는 감춘다(잘린 항목이 이미 더 있다고
 * 말하고 있다).
 */
export function IrSubNav({ current }: { current: string }) {
  return (
    <nav
      aria-label="IR 정보"
      className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {IR_LINKS.map((one) => (
        <a
          key={one.href}
          href={one.href}
          aria-current={one.href === current ? 'page' : undefined}
          className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors duration-150 ${
            one.href === current ? 'bg-ink font-semibold text-canvas' : 'bg-surface text-ink-muted hover:text-ink'
          }`}
        >
          {one.label}
        </a>
      ))}
    </nav>
  );
}

/**
 * 아홉 화면.
 *
 * 차례는 **투자자가 보는 순서**다 — 무슨 일이 있었나(공시) → 얼마를 벌었나(재무·주가) →
 * 나에게 무엇이 오나(배당) → 언제 무엇을 정하나(주총·지배구조) → 더 볼 것(자료실·일정·구독).
 * 자원 이름을 가나다로 늘어놓으면 그 흐름이 사라진다.
 */
const IR_LINKS: readonly { href: string; label: string }[] = [
  { href: IR_ROUTES.disclosures, label: '공시 정보' },
  { href: IR_ROUTES.financials, label: '재무 정보' },
  { href: IR_ROUTES.stock, label: '주가 정보' },
  { href: IR_ROUTES.dividends, label: '배당 정보' },
  { href: IR_ROUTES.meetings, label: '주주총회' },
  { href: IR_ROUTES.governance, label: '지배구조' },
  { href: IR_ROUTES.library, label: 'IR 자료실' },
  { href: IR_ROUTES.schedules, label: 'IR 일정' },
  { href: IR_ROUTES.subscribe, label: '공시 구독' },
];
