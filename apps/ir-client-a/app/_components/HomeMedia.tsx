'use client';

import { useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Play } from 'lucide-react';
import { IR_COMPANY, MEDIA_CLIPS } from '@winpilot/store';
import { IR_ROUTES } from '@/lib/navigation';

/**
 * 마지막 칸 — **영상으로 남은 것들**.
 *
 * ## 왜 맨 아래인가
 * 여기까지 내려온 사람은 이미 무슨 회사인지(소개) · 무엇을 파는지(서비스·솔루션)를 지나왔다.
 * 그 다음에 남는 물음이 **"진짜로 하고 있나"** 이고, 그 답은 문장보다 남은 자료가 낫다 —
 * 방송에 나갔고, 행사를 열었고, 사례가 있다는 것.
 *
 * ## 옆으로 미는 줄
 * 세로로 쌓지 않는다. 맨 아래에 카드를 세로로 쌓으면 그만큼 페이지가 길어지고, **아래로 갈수록
 * 읽는 사람이 줄어드는 자리**에 길이를 더하는 셈이다. 옆으로 밀면 자리를 한 줄만 쓰고, 더 있다는
 * 것은 오른쪽이 잘려 나가는 것으로 알린다.
 *
 * 화살표를 두는 이유: 마우스 휠만으로는 가로로 밀리지 않는 장치가 많고(휠이 없는 마우스,
 * 데스크톱 트랙볼), 그 사람들에게는 오른쪽 것이 없는 것과 같다.
 *
 * ## 썸네일이 도형인 이유
 * 영상 자체가 아직 없다. 없는 영상의 장면을 지어내 사진처럼 두면 **있는 자료로 읽히고**, 그것이
 * IR 화면에서 나가면 곤란해진다. 갈래마다 다른 무늬를 깔고 재생 표시만 얹는다 — 자료가 들어오는
 * 날 이 자리에 썸네일을 넣으면 된다.
 *
 * ## 어드민 연동
 * - 영상 목록 ← `lib/data/site.ts` 의 `MEDIA_CLIPS` (아직 어드민에 올리는 화면이 없다)
 */
export function HomeMedia() {
  const rail = useRef<HTMLDivElement | null>(null);

  /*
    한 번에 미는 거리를 **보이는 만큼**으로 잡는다. 고정된 픽셀로 두면 넓은 화면에서는 한 장도
    안 움직이고 좁은 화면에서는 서너 장이 지나간다. 0.9 를 곱하는 것은 한 장을 걸쳐 두려는
    것이다 — 화면이 통째로 갈리면 방금 본 것과 이어지지 않는다.
  */
  const slide = (direction: -1 | 1) => {
    const box = rail.current;
    if (!box) return;
    box.scrollBy({ left: direction * box.clientWidth * 0.9, behavior: 'smooth' });
  };

  return (
    <section className="overflow-hidden bg-canvas py-20 text-ink lg:py-28">
      {/*
        제목과 카드 줄이 **같은 부모**의 왼쪽 여백을 쓴다. 전에는 제목은 가운데 정렬 상자
        (`mx-auto max-w-320 px-6`)에, 카드 줄은 그것과 같은 값을 계산한 여백에 두었다. 값이
        같아도 **두 곳에 따로 적힌 값**이라, 한쪽을 고치는 날 둘이 어긋난다.

        여기서는 왼쪽 여백을 한 번만 적고 둘 다 그 안에서 시작한다 — 어긋날 자리가 없다.
        오른쪽은 열어 두어 카드가 화면 끝까지 흐른다.
      */}
      <div className="px-6 lg:pl-[max(1.5rem,calc((100%_-_80rem)/2_+_1.5rem))] lg:pr-0">
        {/* 제목 묶음만 폭을 가둔다 — `80rem` 상자의 **안쪽 너비**(`80rem - 3rem`)와 같다. */}
        <div className="flex w-full max-w-308 flex-col gap-8">
        <p className="text-lg font-bold tracking-tight">{IR_COMPANY.brandEn} Media</p>

        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">스마트팩토리 Replay</h2>

            <a href={IR_ROUTES.library} className="group flex w-fit items-center gap-3 text-sm font-bold">
              라이브러리 바로가기
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-canvas transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                <ArrowUpRight aria-hidden className="size-3.5" strokeWidth={2} />
              </span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <RailButton label="이전 영상" direction="prev" onClick={() => slide(-1)} />
            <RailButton label="다음 영상" direction="next" onClick={() => slide(1)} />
          </div>
          </div>
        </div>

        {/*
          줄은 폭을 가두지 않는다 — 오른쪽으로 흘러 화면 끝에서 잘려야 **옆으로 더 있다**로
          읽힌다. 스크롤 막대는 감춘다. 밀 수 있다는 것은 잘린 카드가 이미 말하고 있고, 막대가
          보이면 카드 아래에 회색 줄이 하나 더 그어진 것으로 보인다.
        */}
        <div
          ref={rail}
          className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/*
            그림과 글 사이는 `gap-3`, **글끼리는 `gap-1`**. 셋을 같은 간격으로 두었더니 갈래와
            제목이 서로 다른 카드의 줄처럼 떨어져 보였다 — 한 카드 안의 글은 붙어 있어야 한
            덩어리로 읽힌다.
          */}
          {MEDIA_CLIPS.map((clip) => (
            <article key={clip.id} className="flex w-72 shrink-0 snap-start flex-col gap-3 lg:w-80">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-[#05060d]">
              <ClipPattern seed={clip.seed} />
              {/* 재생 표시 — 이 카드가 글이 아니라 영상이라는 것을 말하는 유일한 것. */}
              <span className="absolute bottom-3 right-3 grid size-7 place-items-center rounded bg-black/70">
                <Play aria-hidden className="size-3 fill-white text-white" />
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs text-ink-faint">{clip.channel}</p>
              <h3 className="text-sm font-semibold leading-relaxed">{clip.title}</h3>
            </div>
          </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RailButton({
  label,
  direction,
  onClick,
}: {
  label: string;
  direction: 'prev' | 'next';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-10 place-items-center rounded-full text-ink transition-colors duration-150 hover:bg-surface"
    >
      {direction === 'next' ? (
        <ArrowRight aria-hidden className="size-5" strokeWidth={1.6} />
      ) : (
        <ArrowLeft aria-hidden className="size-5" strokeWidth={1.6} />
      )}
    </button>
  );
}

/**
 * 썸네일 자리의 무늬.
 *
 * `seed` 로 기울기와 밝기만 바꾼다. 카드가 다섯인데 무늬가 하나면 **같은 영상 다섯 개**로
 * 보이고, 그렇다고 카드마다 다른 그림을 그리면 없는 자료를 지어내는 일이 된다.
 */
function ClipPattern({ seed }: { seed: number }) {
  const angle = 20 + seed * 25;

  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden className="size-full">
      <defs>
        <linearGradient id={`clip-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#101d33" />
          <stop offset="100%" stopColor="#05060d" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#clip-${seed})`} />
      <g transform={`rotate(${angle} 160 90)`}>
        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
          <line
            key={index}
            x1={-40 + index * 60}
            y1={-60}
            x2={-40 + index * 60}
            y2={240}
            stroke={index === seed % 7 ? 'rgba(138,186,255,0.55)' : 'rgba(148,163,184,0.12)'}
            strokeWidth={index === seed % 7 ? 3 : 1.5}
          />
        ))}
      </g>
    </svg>
  );
}
