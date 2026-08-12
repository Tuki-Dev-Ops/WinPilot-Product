'use client';

import { useEffect, useState } from 'react';
import type { FnbNotice } from '@winpilot/store';
import { FNB_ROUTES } from '@/lib/navigation';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

/** 한 줄의 높이(rem). 옮기는 거리가 이 값의 배수라 CSS 와 JS 가 같은 수를 봐야 한다. */
const ROW_REM = 1.5;

/** 한 글이 머무는 시간(ms). */
const HOLD_MS = 4000;

/**
 * 공지 한 줄이 **달력 넘기듯 위로 올라간다.**
 *
 * ## 왜 위로만 가나
 * 마지막 글에서 첫 글로 돌아갈 때 그냥 인덱스를 0 으로 되돌리면 **아래로 주르륵 되감긴다** —
 * 지금까지 올라간 만큼이 한 번에 거꾸로 돌아, 넘기던 것이 되감기는 것으로 보인다.
 *
 * 그래서 목록 끝에 **첫 글을 한 장 더 붙인다.** 마지막에서 그 복제로 한 칸 더 올라가면 화면에는
 * 첫 글이 보이고, 그 순간 전환을 끄고 진짜 0 번으로 되돌린다. 눈에는 계속 위로만 간다.
 *
 * ## 링크가 하나다
 * 굴러가는 줄마다 링크를 걸면 탭 차례에 **보이지도 않는 링크가 글 수만큼** 쌓인다. 어차피 넷 다
 * 같은 곳(공지 목록)으로 가므로 바깥을 링크 하나로 감싸고, 안쪽 글은 낭독기에서 숨긴다.
 * 대신 링크 이름에 지금 맨 위 글의 제목을 넣는다 — 안 그러면 `공지사항` 이라고만 읽힌다.
 *
 * ## 마우스를 올리면 멈춘다
 * 읽는 중에 넘어가면 읽기를 포기한다. 포커스가 들어와도 멈춘다 — 키보드로 온 사람에게는 그것이
 * 유일한 멈춤 방법이다.
 *
 * ## 움직임을 끈 사람에게는 굴리지 않는다
 * `prefers-reduced-motion` 이면 맨 위 글 하나만 세워 둔다. 전환만 끄고 4초마다 글을 바꾸면
 * **더 나쁘다** — 미끄러짐 없이 글자가 툭툭 갈리는 것이 어지럼에는 더 해롭다.
 */
export function NoticeTicker({ notices }: { notices: FnbNotice[] }) {
  const still = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  /** 되돌리는 한 순간에만 참 — 이때는 전환을 끈다(위 머리말). */
  const [snap, setSnap] = useState(false);
  const [paused, setPaused] = useState(false);

  const rolls = notices.length > 1 && !still;
  /* 끝에 첫 글을 한 장 더. 굴리지 않을 때는 붙이지 않는다 — 안 보이는 줄을 하나 더 그릴 뿐이다. */
  const rows = rolls ? [...notices, notices[0]!] : notices.slice(0, 1);

  useEffect(() => {
    if (!rolls || paused) return;
    const timer = setInterval(() => setIndex((was) => was + 1), HOLD_MS);
    return () => clearInterval(timer);
  }, [rolls, paused]);

  /* 전환을 끈 채 0 번으로 되돌린 다음, 다음 그림에서 전환을 다시 켠다. */
  useEffect(() => {
    if (!snap) return;
    const frame = requestAnimationFrame(() => setSnap(false));
    return () => cancelAnimationFrame(frame);
  }, [snap]);

  const top = notices[index % notices.length] ?? notices[0];
  if (!top) return null;

  return (
    <a
      href={FNB_ROUTES.notices}
      aria-label={`공지사항 ${top.title} · 전체 보기`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="group min-w-0 flex-1"
    >
      {/* 창. 한 줄 높이만큼만 열어 두고 나머지는 가린다. */}
      <span className="block h-6 overflow-hidden">
        <span
          aria-hidden
          onTransitionEnd={() => {
            if (index === notices.length) {
              setSnap(true);
              setIndex(0);
            }
          }}
          style={{ transform: `translateY(-${index * ROW_REM}rem)` }}
          className={`block ${snap ? '' : 'transition-transform duration-500 ease-out'}`}
        >
          {rows.map((one, at) => (
            <span
              key={`${one.id}-${at}`}
              className="flex h-6 items-center gap-4 leading-6"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium transition-colors duration-150 group-hover:text-ink-muted">
                {one.title}
              </span>
              <span className="shrink-0 font-mono text-xs tabular-nums text-ink-faint">{one.postedOn}</span>
            </span>
          ))}
        </span>
      </span>
    </a>
  );
}

