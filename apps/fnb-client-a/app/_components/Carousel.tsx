'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

/** 한 장이 머무는 시간(ms). */
const HOLD_MS = 4000;

/**
 * 한 장의 폭 — **두 가지뿐이다.**
 *
 * 자유롭게 받지 않는 이유: 폭을 부르는 쪽에서 글자로 넘기게 두면 화면마다 조금씩 다른 값이
 * 생기고, 그러면 같은 사이트에서 카드가 도는 속도와 크기가 화면마다 다르게 느껴진다.
 *
 * - `deck` — 좁은 화면 한 장, 중간 두 장, 넓은 화면 세 장. 여러 장을 **훑는** 자리에 쓴다.
 * - `hero` — 폭 전체에 한 장. 장이 서넛뿐이라 나란히 깔면 굴릴 것이 남지 않는 자리에 쓴다.
 */
const SLIDE_WIDTH = {
  deck: 'w-full shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]',
  hero: 'w-full shrink-0 snap-start',
} as const;

export type CarouselSlide = { id: string; node: ReactNode };

/**
 * 카드가 **저절로 옆으로 흐른다.**
 *
 * 홈의 대표 메뉴(`deck`)와 인테리어의 평형별 안(`hero`) 둘이 쓴다. 한때 메뉴 전용이었는데,
 * 두 번째 자리가 생기면서 안의 것을 그대로 베끼는 대신 **무엇을 싣는지만 받도록** 열었다 —
 * 굴리는 규칙(멈춤 · 밑줄 · 움직임 끄기)이 두 벌이 되면 한쪽만 고쳐지는 날이 온다.
 *
 * ## 옮기는 일을 스크롤에 맡긴다
 * `translateX` 로 미는 방법도 있다. 그러면 한 번에 몇 장이 보이는지를 **JS 가 알아야 하고**,
 * 화면 폭이 바뀔 때마다 그 수를 다시 세야 한다. 카드 폭은 이미 CSS 가 정하고 있는데(하나 · 둘 ·
 * 셋), 같은 규칙을 JS 에 한 벌 더 두면 둘이 어긋나는 폭이 생긴다.
 *
 * 여기서는 넘치는 줄을 그대로 두고 스크롤을 옮긴다. 몇 장이 보이는지는 **브라우저가 이미 알고**
 * 있으므로 물어보기만 하면 된다. 덤으로 손가락으로 밀거나 트랙패드로 쓸어 넘기는 것이 공짜로
 * 따라온다 — 미는 방식에서는 그것을 따로 만들어야 한다.
 *
 * 붙는 자리(`snap`)를 주어 카드가 반쯤 걸친 채 멈추지 않게 한다.
 *
 * ## 인디케이터가 밑줄이다
 * 장 수만큼 점을 찍으면 열세 개짜리 점줄이 되고, 그것은 고르는 자리가 아니라 **읽어야 할 것**이
 * 된다. 대신 얇은 선 하나를 깔고 **지금 보고 있는 만큼**을 채운다 — 어디쯤인지와 얼마나 남았는지가
 * 한 눈금으로 드러나고, 장이 몇이든 모양이 같다.
 *
 * 채운 길이는 보이는 폭 ÷ 전체 폭이다. 그래서 넓은 화면에서는 길고 좁은 화면에서는 짧다 —
 * 실제로 한 번에 보는 양이 그만큼 다르다.
 *
 * ## 마우스를 올리면 멈춘다
 * 읽는 중에 넘어가면 읽기를 포기한다. 포커스가 들어와도 멈춘다 — 키보드로 온 사람에게는 그것이
 * 유일한 멈춤 방법이다. 손으로 밀었을 때도 멈춘다(밀던 것을 되뺏기지 않게).
 *
 * ## 움직임을 끈 사람에게는 흐르지 않는다
 * 저절로 넘어가지 않고 부드럽게 굴러가지도 않는다. 밀어서 보는 것은 그대로 된다 — 목록이
 * 사라지는 것이 아니라 **저절로 움직이는 것**만 멎는다.
 */
export function Carousel({
  slides,
  width = 'deck',
}: {
  slides: readonly CarouselSlide[];
  width?: keyof typeof SLIDE_WIDTH;
}) {
  const still = usePrefersReducedMotion();
  const track = useRef<HTMLUListElement | null>(null);
  const bar = useRef<HTMLSpanElement | null>(null);
  const [paused, setPaused] = useState(false);

  /**
   * 밑줄에서 채워진 조각을 지금 스크롤에 맞춘다.
   *
   * ## 상태로 두지 않는다
   * 한때 `useState` 로 두고 스크롤마다 갱신했다. 그러면 손가락으로 한 번 밀 때 **초당 수십 번**
   * 이 컴포넌트가 통째로 다시 그려진다 — 안에 카드가 열세 장이다. 게다가 매번 새 객체를 넣어
   * React 의 같은 값 건너뛰기도 걸리지 않았다.
   *
   * 밑줄은 `aria-hidden` 인 **순수 장식**이라 React 가 알아야 할 값이 아니다. 자리만 직접 쓴다.
   */
  const measure = useCallback(() => {
    const el = track.current;
    const fill = bar.current;
    if (!el || !fill || el.scrollWidth === 0) return;
    fill.style.marginLeft = `${(el.scrollLeft / el.scrollWidth) * 100}%`;
    fill.style.width = `${(el.clientWidth / el.scrollWidth) * 100}%`;
  }, []);

  /* 폭이 바뀌면 한 번에 보이는 양도 바뀐다 — 밑줄이 그것을 따라가야 한다. */
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    if (still || paused) return;
    const el = track.current;
    if (!el) return;

    const timer = setInterval(() => {
      const kids = [...el.children] as HTMLElement[];
      /* 끝에 닿았으면 처음으로. 1px 은 소수점 반올림으로도 남아 여유를 둔다. */
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      const next = kids.find((kid) => kid.offsetLeft > el.scrollLeft + 1);
      el.scrollTo({ left: atEnd || !next ? 0 : next.offsetLeft, behavior: 'smooth' });
    }, HOLD_MS);

    return () => clearInterval(timer);
  }, [still, paused]);

  return (
    <div
      className="flex w-full flex-col gap-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      /* 손으로 밀기 시작하면 멈춘다. 떼도 다시 흐르지 않는 것은 읽으려고 민 것이기 때문이다. */
      onPointerDown={() => setPaused(true)}
    >
      <ul
        ref={track}
        onScroll={measure}
        /*
          `relative` 를 주는 것은 카드의 `offsetLeft` 가 이 줄을 기준으로 재지게 하려는 것이다 —
          기준이 바깥으로 새면 넘길 자리를 엉뚱하게 계산한다.

          스크롤 막대는 감춘다. 밑줄이 이미 어디쯤인지를 말하고 있어 둘이 같은 말을 두 번 한다.
        */
        className="relative flex snap-x snap-mandatory gap-5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((one) => (
          <li key={one.id} className={SLIDE_WIDTH[width]}>
            {one.node}
          </li>
        ))}
      </ul>

      {/*
        밑줄. `aria-hidden` 인 이유: 목록이 이미 낭독기에 다 있고, 어디쯤인지는 **눈으로 보는
        사람에게만** 필요한 값이다. 읽어 주면 `진행률 23퍼센트` 같은 뜻 없는 말이 끼어든다.
      */}
      <span aria-hidden className="block h-0.5 w-full overflow-hidden rounded-full bg-border">
        {/* 자리는 `measure` 가 직접 쓴다 — 처음 값만 여기서 준다(첫 화면에서 꽉 찬 채 서지 않게). */}
        <span
          ref={bar}
          style={{ marginLeft: '0%', width: '100%' }}
          className="block h-full rounded-full bg-ink transition-[margin,width] duration-300 ease-out motion-reduce:transition-none"
        />
      </span>
    </div>
  );
}
