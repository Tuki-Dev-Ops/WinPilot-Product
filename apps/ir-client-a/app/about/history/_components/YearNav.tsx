'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** 머리띠가 덮는 높이. 이 아래로 올라온 해를 "보고 있는 해" 로 친다. */
const HEADER_OFFSET = 120;

/** 누른 뒤 화면이 미끄러지는 동안 관찰을 멈추는 시간(ms). */
const SCROLL_SETTLE_MS = 900;

/**
 * 연도 기둥 — **지금 보고 있는 해를 켜 둔다.**
 *
 * ## 왜 누른 것과 본 것을 둘 다 보나
 * 누르기만으로 켜면, 눌러서 간 뒤에 화면을 굴려 다른 해로 내려가도 옛 해가 켜져 있다.
 * 반대로 보는 것만으로 켜면, 부드러운 스크롤이 도는 **1초 남짓 동안 아무 반응이 없어** 눌린
 * 것인지 알 수 없다.
 *
 * 그래서 누르는 순간 바로 켜고 그동안 관찰을 잠근다. 미끄러짐이 끝나면 화면이 다시 켠다.
 *
 * ## 관찰자가 준 것만 보면 틀린다
 * `IntersectionObserver` 는 **상태가 바뀐 것만** 넘긴다. 그 안에서 고르면 아래쪽 해 하나가
 * 걸릴 때 그것이 이겨서, 2025 를 눌렀는데 2024 가 켜진다. 실제로 그렇게 틀렸다.
 *
 * 그래서 관찰자는 **다시 재라는 신호**로만 쓰고, 켤 해는 그때마다 모든 해의 자리를 재서 고른다.
 * 해가 스물이 넘어도 한 번에 스무 번 재는 것뿐이라 그 값이 싸다.
 *
 * ## 링크는 링크로 둔다
 * `href` 를 그대로 두고 누름을 **가로채지 않는다.** 자바스크립트가 아직 안 붙었거나 꺼져 있어도
 * 닻으로 뛰고, 주소에 남아 뒤로 가기가 듣는다 — 켜지는 표시만 이 조각이 얹는다.
 */
export function YearNav({ years }: { years: { year: string; count: number }[] }) {
  const [active, setActive] = useState(years[0]?.year ?? '');
  /** 누른 직후에는 관찰자가 끼어들지 않게 잠근다. */
  const locked = useRef(false);

  /**
   * 지금 보고 있는 해.
   *
   * 머리띠 아래로 올라온 것 중 **가장 마지막 것**이다 — 위에서부터 지나온 해를 세는 셈이라,
   * 아직 아무것도 안 지났으면 첫 해가 켜진다.
   */
  const measure = useCallback(() => {
    /*
      바닥에 닿으면 **마지막 해**다.

      끝의 해는 대개 짧아서, 거기까지 굴려도 그 제목이 머리띠 아래로 올라오지 못한다 — 화면이
      더 내려갈 자리가 없기 때문이다. 그대로 두면 마지막 해를 눌러도 그 앞의 해가 켜진 채
      남는다. 실제로 그렇게 틀렸다.
    */
    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
    if (atBottom) {
      const last = years[years.length - 1];
      if (last) {
        setActive(last.year);
        return;
      }
    }

    /* 머리띠 아래로 올라온 것 중 마지막 것 — 위에서부터 지나온 해를 세는 셈이다. */
    let found = years[0]?.year ?? '';
    for (const one of years) {
      const box = document.getElementById(`year-${one.year}`)?.getBoundingClientRect();
      if (box && box.top <= HEADER_OFFSET) found = one.year;
    }
    setActive(found);
  }, [years]);

  useEffect(() => {
    const targets = years
      .map((one) => document.getElementById(`year-${one.year}`))
      .filter((one): one is HTMLElement => one !== null);
    if (targets.length === 0) return;

    const recheck = () => {
      if (!locked.current) measure();
    };

    /* 관찰자는 다시 재라는 신호로만 쓴다 — 무엇이 걸렸는지는 보지 않는다. */
    const watcher = new IntersectionObserver(recheck, {
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });
    for (const target of targets) watcher.observe(target);

    /*
      관찰자만으로는 부족하다. 해가 화면보다 길면 그 안에서 굴리는 동안 걸침이 안 바뀌어
      신호가 오지 않는다. 스크롤도 함께 듣되 `passive` 로 두어 굴림을 막지 않는다.
    */
    window.addEventListener('scroll', recheck, { passive: true });
    measure();

    return () => {
      watcher.disconnect();
      window.removeEventListener('scroll', recheck);
    };
  }, [years, measure]);

  const jump = (year: string) => {
    setActive(year);
    locked.current = true;
    window.setTimeout(() => {
      locked.current = false;
      measure();
    }, SCROLL_SETTLE_MS);
  };

  return (
    <nav
      aria-label="연도로 이동"
      className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0"
    >
      {years.map((one) => {
        const on = one.year === active;

        return (
          <a
            key={one.year}
            href={`#year-${one.year}`}
            aria-current={on ? 'true' : undefined}
            onClick={() => jump(one.year)}
            className={`flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors duration-150 ${
              on ? 'bg-surface font-semibold text-ink' : 'text-ink-muted hover:bg-surface hover:text-ink'
            }`}
          >
            <span className="font-mono text-sm font-semibold tabular-nums">{one.year}</span>
            {/* 그 해에 몇 건인지. 연도만 세워 두면 어느 해가 굵은 해였는지가 안 보인다. */}
            <span className="font-mono text-xs tabular-nums text-ink-faint">{one.count}</span>
          </a>
        );
      })}
    </nav>
  );
}
