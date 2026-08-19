'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * 스크롤해서 **닿았을 때 나타나게** 감싸는 칸.
 *
 * ## 자바스크립트가 없으면 그냥 보인다
 * 이런 것을 만들 때 가장 흔한 사고가 **글이 영영 안 보이는 것**이다. `opacity-0` 을 처음부터
 * 적어 두면, 스크립트가 막힌 브라우저나 검색 로봇 앞에서 그 칸은 빈 자리로 남는다.
 *
 * 그래서 서버가 그리는 첫 모습은 **보이는 상태**다. 브라우저에서 이 칸이 살아난 뒤에야
 * 숨기고(`armed`), 그다음에 나타낸다. 화면에 이미 들어와 있는 칸은 그 두 일이 거의 같은
 * 순간에 일어나 **나타나는 애니메이션 한 번**으로 보인다.
 *
 * ## `translate` 를 함께 쓴다
 * 투명도만 바꾸면 글자가 제자리에서 옅어졌다 진해질 뿐이라 **뭔가 늦게 왔다**로 읽힌다.
 * 조금 아래에서 올라오면 눈이 그 방향을 따라가고, 그때 비로소 아래로 이어진다는 느낌이 난다.
 * `24px` — 더 크게 두면 칸이 통째로 움직이는 것으로 보여 스크롤과 싸운다.
 *
 * ## 관찰과 굴림을 함께 본다
 * `IntersectionObserver` 하나로도 지금은 다 잡힌다. 그래도 굴림을 함께 보는 까닭은 아래 코드
 * 옆에 적어 두었다 — 놓쳤을 때의 모습이 **글이 없는 화면**이라서다.
 *
 * ## 한 번만 나타난다
 * 지나갔다 돌아오면 다시 숨는 방식도 있다. 그러지 않는 이유: 위아래로 훑는 사람에게 같은 칸이
 * **볼 때마다 다시 나타나면** 화면이 안정되지 않는다. 한 번 본 것은 본 것으로 둔다 —
 * 그래서 나타난 뒤에는 관찰도 끊는다.
 *
 * ## 움직임을 싫어하는 설정이면 아예 숨기지 않는다
 * `prefers-reduced-motion` 은 저절로 움직이는 것을 끄라는 뜻이다. 이때는 `armed` 로 가지
 * 않으므로 처음 모습 그대로 보인다 — 나타나는 동작만 끄고 숨기기는 그대로 두면, 그 설정을
 * 켠 사람에게는 **화면이 비어 보인다.**
 */
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const box = useRef<HTMLDivElement | null>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const node = box.current;
    if (!node) return;

    setArmed(true);

    let live = true;
    let queued = false;

    const done = () => {
      live = false;
      setShown(true);
      watch.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };

    /*
      관찰과 **함께** 굴림도 본다 — 관찰만으로 못 잡는 자리가 이론상 있기 때문이다.

      `IntersectionObserver` 는 교차 상태가 **바뀔 때** 알려 준다. 화면을 그리는 두 틈 사이에
      아래에서 위로 통째로 지나가 버린 칸은 `교차 안 함 → 교차 안 함` 이라 상태가 바뀌지
      않고, 그러면 알림 자체가 오지 않는다. 그 칸은 **영영 숨은 채로 남는다.**

      실제로 그 일이 나는 것을 본 적은 없다. 휠로 굴려 보면 지금도 열넷이 다 나타난다. 그래도
      두는 이유는 **실패했을 때의 모습이 나쁘기 때문**이다 — 늦게 나타나는 것이 아니라 글이
      아예 없는 화면이 된다. 대비가 싼 쪽을 고른다.

      자리를 직접 재어 **화면 아래끝보다 위에 있으면** 나타낸다. 굴림은 잦게 일어나므로 그릴
      때에 맞춰 한 번만 잰다(`requestAnimationFrame`) — 재는 일이 `getBoundingClientRect`
      하나뿐이라 그 이상 아낄 것이 없다.
    */
    const measure = () => {
      queued = false;
      if (!live) return;
      if (node.getBoundingClientRect().top < window.innerHeight) done();
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(measure);
    };

    /*
      0.15 — 칸의 15%가 보이면 나타난다. 화면 높이를 꽉 채우는 칸이라 값을 크게 잡으면
      스크롤을 한참 내린 뒤에야 글이 뜨고, 그때는 이미 지나쳐 읽을 자리가 위로 올라가 있다.
    */
    const watch = new IntersectionObserver(
      (entries) => {
        if (entries.some((one) => one.isIntersecting)) done();
      },
      { threshold: 0.15 },
    );

    watch.observe(node);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      live = false;
      watch.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const hidden = armed && !shown;

  return (
    <div
      ref={box}
      className={`transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        hidden ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
      } ${className}`}
    >
      {children}
    </div>
  );
}
