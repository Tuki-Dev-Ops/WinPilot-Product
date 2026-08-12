'use client';

import { useEffect, useState } from 'react';

/**
 * 움직임을 줄여 달라고 해 두었는가.
 *
 * ## 왜 CSS 만으로 안 되나
 * `motion-reduce:transition-none` 은 **전환을 끄는** 일까지만 한다. 그런데 저절로 넘어가는
 * 것들(공지 롤링 · 메뉴 슬라이더)은 전환만 끄면 **더 나빠진다** — 미끄러짐 없이 4초마다 내용이
 * 툭툭 갈리는 편이 어지럼에는 더 해롭다. 저절로 움직이는 일 자체를 멎게 하려면 JS 가 그 설정을
 * 알아야 한다.
 *
 * ## 처음 그림에서는 늘 거짓이다
 * 서버에는 그 설정이 없다. 참으로 시작하면 서버가 만든 글자와 브라우저가 만든 글자가 달라져
 * React 가 그 자리를 다시 그린다. 브라우저에서 한 번 읽고 맞춘다.
 *
 * 보는 동안 운영체제 설정을 바꾸는 일도 실제로 있어, 듣고만 있지 않고 바뀌면 따라간다.
 */
export function usePrefersReducedMotion(): boolean {
  const [still, setStill] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setStill(media.matches);

    const onChange = (event: MediaQueryListEvent) => setStill(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return still;
}
