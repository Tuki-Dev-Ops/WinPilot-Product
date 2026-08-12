'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export type FoldItem = {
  id: string;
  /** 접혀 있을 때도 보이는 줄 — 누르는 자리다 */
  head: ReactNode;
  /** 펴야 보이는 것 */
  body: ReactNode;
};

/**
 * 접었다 펴는 목록 — **공지사항 · 고객센터 FAQ · 창업 문의 셋이 같은 것을 쓴다.**
 *
 * ## 왜 접나
 * 셋 다 글이 열을 넘고 본문이 길다. 다 펴 두면 자기가 찾는 것에 닿기까지 남의 글을 대여섯 개
 * 지나야 한다. 접으면 **제목만 세로로 늘어서서** 훑는 눈이 한 줄에 하나씩 지난다 — 이 자리에서
 * 실제로 하는 일이 읽는 것이 아니라 찾는 것이라 그렇다.
 *
 * 메뉴판이나 매장 목록에는 쓰지 않는다. 거기서는 카드 하나가 그 자체로 보여 줄 것(값 · 사진 ·
 * 주소)이고, 접으면 훑는 일이 오히려 어려워진다.
 *
 * ## 하나만 열린다
 * 여럿 열어 둘 수 있게 하면 셋쯤 열었을 때 화면이 길어져 **방금 연 것이 화면 밖으로 밀린다.**
 * 새로 열면 앞의 것이 닫히므로 열린 글은 늘 눈에 보이는 자리에 있다.
 *
 * 이미 열린 것을 다시 누르면 닫힌다 — 그러지 않으면 한 번 연 뒤로는 무엇이든 하나가 계속 펴져
 * 있게 되고, 목록만 훑고 싶은 사람이 그것을 없앨 방법이 없다.
 *
 * ## 처음부터 하나 펴 둘 수 있다(`openFirst`)
 * 공지사항이 쓴다. 거기 맨 위는 **먼저 읽어 달라고 붙여 둔 글**이라, 들어오자마자 전부 접혀
 * 있으면 그 글을 붙여 둔 뜻이 사라진다. 나머지 둘은 무엇을 물을지가 사람마다 달라 전부 접는다.
 */
export function FoldList({ items, openFirst = false }: { items: readonly FoldItem[]; openFirst?: boolean }) {
  const [openId, setOpenId] = useState(openFirst ? (items[0]?.id ?? '') : '');

  return (
    <ul className="flex flex-col gap-px overflow-hidden rounded-2xl border border-border bg-border">
      {items.map((one) => {
        const open = one.id === openId;

        return (
          <li key={one.id} className="bg-canvas">
            <button
              type="button"
              onClick={() => setOpenId(open ? '' : one.id)}
              aria-expanded={open}
              aria-controls={`fold-${one.id}`}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-150 hover:bg-surface lg:px-8"
            >
              <span className="min-w-0 flex-1">{one.head}</span>
              <ChevronDown
                aria-hidden
                className={`size-4 shrink-0 text-ink-faint transition-transform duration-150 ease-out ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/*
              닫힌 글을 지우지 않고 높이를 `0` 으로 접는다 — 그래야 펴고 접히는 것이 움직임으로
              보인다. `grid-rows` 를 쓰는 까닭은 **본문 높이를 미리 알 수 없기** 때문이다.
              `max-height` 로 하면 넉넉한 값을 정해 둬야 하고, 그 값보다 긴 글은 잘리거나 짧은
              글에서 접히는 속도가 느려진다.

              접힌 동안 `invisible` 로 두어 낭독기와 탭 이동에서 빠진다 — 높이가 0이어도 그 안의
              링크는 여전히 눌리기 때문이다.
            */}
            <div
              id={`fold-${one.id}`}
              className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
                open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className={`overflow-hidden ${open ? '' : 'invisible'}`}>
                <div className="px-6 pb-6 lg:px-8">{one.body}</div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
