import type { CSSProperties, ReactNode } from 'react';

export type MarqueeItem = { id: string; node: ReactNode };

/**
 * 끝없이 옆으로 흐르는 줄.
 *
 * ## 굴림판(`Carousel`)과 갈린다
 * 저쪽은 **고르는 것**이라 한 장씩 붙어 서고, 손으로 밀 수 있고, 마우스를 올리면 멈춘다.
 * 여기는 읽는 것도 고르는 것도 아니다 — 매장이 여럿이고 저마다 다르게 돈다는 것을 **흐름
 * 자체로** 말한다. 그래서 멈추지 않고 붙는 자리도 없다.
 *
 * 굴림판으로 만들면 4초마다 한 칸씩 끊겨 넘어가는데, 그 끊김이 **읽으라는 신호**로 읽힌다.
 * 끝없이 흐르면 숫자 하나하나가 아니라 줄 전체가 하나의 인상으로 남는다.
 *
 * ## 같은 것을 두 벌 그린다
 * 절반만큼 밀고 처음으로 되돌리면 뒤쪽 벌의 첫 항목이 앞쪽 벌의 첫 항목과 같은 자리에 있어,
 * 되돌아간 것이 보이지 않는다(`marquee` 키프레임).
 *
 * 둘째 벌은 낭독기에서 뺀다(`aria-hidden`). 그러지 않으면 같은 매장 이름을 두 번 읽는다.
 *
 * ## 사이 여백을 `gap` 으로 주지 않는다
 * `gap` 은 항목 **사이에만** 들어간다. 그러면 한 벌의 폭이 `항목합 + 여백×(개수−1)` 이라
 * 두 벌을 이어 붙인 전체의 절반과 어긋나고, 되돌아가는 순간 그 차이만큼 **줄이 튄다.**
 *
 * 항목마다 오른쪽에 여백을 주면 한 벌이 정확히 `(항목+여백)×개수` 가 되어 절반이 딱 맞는다.
 * 마지막 항목 뒤에도 여백이 남지만, 그 자리는 다음 벌의 첫 항목이 이어받는 자리라 비지 않는다.
 *
 * ## 속도를 항목 수로 정한다
 * 항목이 늘면 줄이 길어지는데 시간이 같으면 그만큼 빨리 흐른다. 항목 하나당 시간을 정해 두면
 * **몇 개가 되든 지나가는 속도가 같다** — 늘릴 때마다 눈대중으로 초를 다시 맞출 일이 없다.
 *
 * ## 움직임을 끈 사람에게는 멈춰 선다
 * `motion-reduce` 로 애니메이션을 끈다. 첫 벌이 그대로 서 있고 넘치는 만큼은 잘린다 — 목록이
 * 사라지는 것이 아니라 **저절로 움직이는 것**만 멎는다.
 *
 * ## 양끝을 흐린다
 * 흐르는 줄이 판 가장자리에서 잘리면 잘린 글자가 그 자리에 남아 오류처럼 보인다. 양끝을
 * 투명으로 지우면 들어오고 나가는 것처럼 읽힌다.
 */
export function Marquee({ items, secondsEach = 6 }: { items: readonly MarqueeItem[]; secondsEach?: number }) {
  const run = (
    <ul className="flex shrink-0">
      {items.map((one) => (
        <li key={one.id} className="pr-12">
          {one.node}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <div
        style={{ '--roll': `${items.length * secondsEach}s` } as CSSProperties}
        className="flex w-max animate-marquee motion-reduce:animate-none"
      >
        {run}
        <div aria-hidden className="flex shrink-0">
          {run}
        </div>
      </div>
    </div>
  );
}
