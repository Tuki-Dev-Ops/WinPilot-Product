'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 몇 초마다 한 칸.
 *
 * `6000`은 **문장 하나를 읽는 시간**에서 온다. 홈의 두 굴림판은 카드 위에 제목과 두어 줄이
 * 얹혀 있어, 이보다 짧으면 다 읽기 전에 넘어가고 사람이 화살표로 되돌린다. 더 길게 두면
 * 넘어가는 것을 못 보고 지나쳐, 자동으로 도는 줄 모른 채 화면을 떠난다.
 */
const TURN_MS = 6000;

/**
 * 굴림판을 **저절로 넘긴다** — 넘기는 방법은 부르는 쪽이 정한다.
 *
 * ## 왜 훅으로 빼나
 * 홈에 굴림판이 둘인데 **넘기는 방법이 서로 다르다.** 솔루션 칸은 고른 번호를 바꾸고,
 * 미디어 칸은 가로 줄을 민다. 같은 것은 넘기는 방법이 아니라 **언제 넘기는가** — 몇 초마다
 * 한 번, 마우스를 올리면 멈추고, 화면 밖이면 세지 않는다. 그 규칙만 여기 모은다.
 *
 * 컴포넌트마다 `setInterval` 을 두면 규칙이 두 벌이 되고, 한쪽만 고치는 날이 온다.
 *
 * ## 세 가지 이유로 멈춘다
 * - **마우스를 올렸을 때**: 읽고 있다는 뜻이다. 읽는 중에 넘어가면 되돌리는 수밖에 없다.
 *   초점(`focus`)도 같이 본다 — 키보드로 훑는 사람에게는 마우스를 올린 것과 같은 상태다.
 * - **화면 밖일 때**: 이 둘은 홈 한참 아래에 있다. 첫 화면에서 몇 분 머무는 동안에도 돌면,
 *   내려왔을 때 **처음 장이 아니라 아무 장**이 서 있다. 어디부터 보는 것인지가 사라진다.
 * - **다른 탭을 보고 있을 때**: 브라우저가 시간을 늦추기만 하고 멈추지는 않는다. 돌아왔을 때
 *   위와 같은 일이 난다.
 *
 * ## 움직임을 싫어하는 설정이면 아예 돌지 않는다
 * `prefers-reduced-motion` 은 **저절로 움직이는 것**을 끄라는 뜻이다. 넘어가는 애니메이션만
 * 끄고 넘기기는 계속하면, 장면이 뚝뚝 갈리는 더 나쁜 화면이 된다.
 *
 * ## 되돌리는 시계
 * `setInterval` 이 아니라 **한 번짜리 시계를 매번 다시 건다**(`turn` 이 바뀌면 다시 건다).
 * 사람이 화살표를 누른 직후에 자동으로 또 넘어가면 두 칸이 지나간 것처럼 보이는데, 다시
 * 거는 방식이면 누른 순간부터 다시 센다. 부르는 쪽은 손으로 넘길 때 `defer()` 만 부르면 된다.
 */
export function useAutoAdvance(advance: () => void, turnMs = TURN_MS) {
  const box = useRef<HTMLElement | null>(null);
  /*
    넘기는 일은 **ref 에 담아 둔다.** 의존성에 넣으면 부르는 쪽이 화살표 함수를 그대로 넘길 때
    렌더마다 새 함수가 되어 시계가 매 렌더 다시 걸리고, 그러면 영영 6초를 못 채운다.
  */
  const latest = useRef(advance);
  latest.current = advance;

  const [turn, setTurn] = useState(0);
  const [held, setHeld] = useState(false);
  const [seen, setSeen] = useState(false);
  const [away, setAway] = useState(false);

  const defer = useCallback(() => setTurn((before) => before + 1), []);

  useEffect(() => {
    const node = box.current;
    if (!node) return;

    /* 0.3 — 칸의 3분의 1이 보이면 읽기 시작한 것으로 본다. 한 점만 걸쳐도 도는 것은 이르다. */
    const watch = new IntersectionObserver((entries) => setSeen(entries.some((one) => one.isIntersecting)), {
      threshold: 0.3,
    });
    watch.observe(node);
    return () => watch.disconnect();
  }, []);

  useEffect(() => {
    const watch = () => setAway(document.hidden);
    document.addEventListener('visibilitychange', watch);
    return () => document.removeEventListener('visibilitychange', watch);
  }, []);

  useEffect(() => {
    if (held || away || !seen) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setTimeout(() => {
      latest.current();
      setTurn((before) => before + 1);
    }, turnMs);
    return () => window.clearTimeout(timer);
  }, [turn, held, away, seen, turnMs]);

  return {
    /** 손으로 넘겼을 때 부른다 — 그 순간부터 다시 센다. */
    defer,
    /** 굴림판을 감싼 칸에 그대로 편다(`<section {...hold}>`). */
    hold: {
      ref: box,
      onMouseEnter: () => setHeld(true),
      onMouseLeave: () => setHeld(false),
      onFocusCapture: () => setHeld(true),
      onBlurCapture: () => setHeld(false),
    },
  };
}
