'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronUp, ExternalLink } from 'lucide-react';
import { FAMILY_SITES } from '@winpilot/store';

/**
 * 패밀리사이트 — 푸터 맨 윗줄 오른쪽의 접힌 목록.
 *
 * ## 위로 펼친다
 * 푸터에 있으므로 아래로 펼치면 **화면 밖으로 나간다.** 스크롤이 끝난 자리라 더 내려갈 곳도
 * 없어, 열어도 보이지 않는 목록이 된다.
 *
 * ## 밖으로 나가는 링크임을 자리에서 알린다
 * 셋 다 다른 도메인이다. 새 탭으로 여는 것을 알리지 않으면 **뒤로 가기가 안 듣는다**고 여긴다 —
 * 그래서 항목마다 나가는 표시를 붙이고, `rel` 은 이 화면이 한 번에 건다(목록에 적어 두면
 * 항목마다 빠뜨릴 수 있다).
 *
 * ## 닫는 길을 셋 둔다
 * 바깥 누름 · `Esc` · 항목 고르기. 바깥 누름만 두면 키보드로 온 사람이 갇히고, `Esc` 만 두면
 * 마우스로 온 사람이 배운 대로 눌렀는데 안 닫힌다.
 *
 * 열림 상태를 `aria-expanded` 로 알린다 — 낭독기에는 삼각형이 보이지 않는다.
 *
 * ## 목록을 지우지 않고 **숨긴다**
 * 처음에는 `{open && ...}` 로 붙였다 뗐다. 그러면 **닫힐 때 애니메이션이 없다** — 이미 DOM 에서
 * 사라진 것에는 걸 전환이 없어서, 열릴 때만 부드럽고 닫힐 때는 뚝 끊긴다. 사라지는 쪽을
 * 살리려면 다 사라질 때까지 붙들어 둘 타이머가 필요한데, 그 타이머는 빨리 여닫으면 어긋난다.
 *
 * 그래서 늘 붙여 두고 보이기만 바꾼다. 대신 **닫혀 있는 동안 눌리거나 탭으로 닿으면 안 된다** —
 * `pointer-events-none` 이 마우스를, `inert` 가 키보드와 낭독기를 막는다. 앞의 것만 걸면 보이지도
 * 않는 링크 셋이 탭 차례에 남아, 푸터에서 탭을 누르는 사람이 세 번 헛디딘다.
 *
 * ## 움직임을 끈 사람에게는 걸지 않는다
 * `motion-reduce` 로 전환을 없앤다. 어지럼을 느껴 설정을 꺼 둔 사람에게 0.15초짜리 미끄러짐은
 * 작은 문제가 아니고, 껐다고 해서 목록이 안 열리는 것도 아니다.
 */
export function FamilySiteMenu() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement | null>(null);

  /* 바깥을 누르거나 `Esc` 를 누르면 닫는다. 열려 있을 때만 듣는다 — 늘 듣게 두면 닫힌 목록이 모든 누름을 지나보낸다. */
  useEffect(() => {
    if (!open) return;

    const onDown = (event: MouseEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative">
      {/*
        공유 `Button` 을 쓰지 않는다. 그 조각의 색은 **밝은 판** 위를 기준으로 잡혀 있고
        (`secondary` 도 먹색 테두리다), 여기는 검은 푸터라 그대로 얹으면 글자가 배경에 묻는다.
        토큰(`white/20` · `white/40`)은 그대로 쓰되 대비만 이 자리에 맞춘다 — 색을 새로 만들지
        않는다는 규칙은 지키고, 밝기만 자리에 맞춘다.

        높이 · 모서리 · 글자 크기는 공유 조각과 같은 값을 쓴다. 푸터 단추만 두께가 다르면
        같은 사이트 안에서 단추가 두 벌로 보인다.
      */}
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((was) => !was)}
        className="flex h-11 items-center gap-2 rounded-lg border border-white/20 px-4 text-sm font-medium text-white/80 transition-colors duration-150 hover:border-white/40 hover:text-white"
      >
        패밀리사이트
        <ChevronUp
          aria-hidden
          /* 화살표 두께를 공유 `Dropdown` 과 맞춘다(`1.5`) — 굵기가 다르면 두 고르개가 달라 보인다. */
          className={`size-3 shrink-0 transition-transform duration-150 ${open ? '' : 'rotate-180'}`}
          strokeWidth={1.5}
        />
      </button>

      <div
        role="menu"
        inert={!open}
        /*
          위로 펼친다(`bottom-full`). 오른쪽 끝을 맞추는 것은(`right-0`) 단추가 화면 오른쪽에
          서 있어, 왼쪽을 맞추면 목록이 화면 밖으로 밀리기 때문이다.

          자라나는 기준점을 오른쪽 아래에 둔다(`origin-bottom-right`). 가운데에서 자라면 단추와
          목록이 **서로 다른 자리에서** 움직여, 눌렀을 때 열린 것이 아니라 튀어나온 것처럼 보인다.
        */
        className={`absolute bottom-full right-0 z-10 mb-2 w-64 origin-bottom-right overflow-hidden rounded-xl border border-white/15 bg-night shadow-lg transition duration-150 ease-out motion-reduce:transition-none ${
          open ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-1 scale-95 opacity-0'
        }`}
      >
        {FAMILY_SITES.map((one) => (
          <a
            key={one.id}
            role="menuitem"
            href={one.href}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => setOpen(false)}
            className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3 transition-colors duration-150 last:border-b-0 hover:bg-white/5"
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium text-white/90">{one.name}</span>
              <span className="mt-0.5 block text-xs text-white/40">{one.note}</span>
            </span>
            {/* 새 탭으로 열린다는 표시. 글자로 적으면 세 줄이 같은 말을 이고 선다. */}
            <ExternalLink aria-hidden className="mt-0.5 size-3.5 shrink-0 text-white/30" strokeWidth={1.8} />
          </a>
        ))}
      </div>
    </div>
  );
}
