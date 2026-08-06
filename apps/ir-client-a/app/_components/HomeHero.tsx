'use client';

import { NIGHT } from '@/lib/palette';
import { useEffect, useState } from 'react';
import { IR_COMPANY } from '@winpilot/store';

/**
 * 첫 화면의 슬라이드.
 *
 * 셋으로 둔 이유: 이 회사가 파는 것이 **자율 제조 · ERP · MES** 셋이고, 첫 화면이 답해야
 * 하는 것도 그 셋이다. 넷째를 더하면 마지막 장은 아무도 보지 않는다 — 자동으로 넘어가는
 * 화면에서 사람이 끝까지 기다리는 것은 대개 두 장까지다.
 *
 * 매출·배당 같은 IR 숫자를 여기 두지 않는 이유: 첫 화면은 **무슨 회사인지**를 말하는
 * 자리다. 숫자부터 들이밀면 처음 온 사람은 무엇을 만드는 회사인지 모른 채 표를 본다 —
 * 그 숫자는 아래 요약과 IR 화면이 맡는다.
 *
 * **장마다 배경 영상이 다르다.** 문장은 바뀌는데 배경이 그대로면 장이 넘어간 것이 아니라
 * 글자만 갈린 것처럼 보인다. 영상은 문장이 말하는 것과 같은 것을 보여 준다 — 자율 제조를
 * 말하는 장에는 로봇 팔이, 한 줄로 흐르는 ERP 를 말하는 장에는 멈추지 않는 컨베이어가 깔린다.
 */
export type HeroSlide = {
  id: string;
  ko: string;
  en: string;
  lead: string;
  body: string[];
  /** 이 장의 배경 영상. `public/hero/` 안의 파일이다 */
  video: string;
};

const SLIDES: HeroSlide[] = [
  {
    id: 'factory',
    ko: 'AX로 판단하고, RX로 실행하는',
    en: 'Autonomous Factory',
    lead: 'AI Decides, Robots Execute. Manufacturing Runs Autonomously.',
    body: [
      `${IR_COMPANY.name}은 MES로 표준화된 제조 데이터를 기반으로`,
      'AI가 판단(AX)하고 공정·물류 로봇이 실행(RX)하는 제조 데이터 기반 자율 제조를 구현합니다.',
    ],
    video: '/hero/factory.mp4',
  },
  {
    id: 'erp',
    ko: '수주에서 정산까지 한 줄로',
    en: 'One Connected ERP',
    lead: 'One Entry, End to End. No More Reconciling Spreadsheets.',
    body: [
      '영업·생산·회계가 각자 쓰던 표를 하나의 자원으로 잇습니다.',
      '한 번 적은 값이 뒤 단계로 그대로 흘러, 월 마감에 맞춰 보던 자리가 사라집니다.',
    ],
    video: '/hero/line.mp4',
  },
  {
    id: 'mes',
    ko: '현장의 데이터를 표준으로',
    en: 'Standardized Shop-Floor Data',
    lead: 'Every Machine Speaks the Same Language.',
    body: [
      '설비마다 다르던 기록을 한 규격으로 모읍니다.',
      '비가동과 불량이 어느 공정에서 났는지 숫자로 남고, 그 데이터가 AI 판단의 바탕이 됩니다.',
    ],
    video: '/hero/robotics.mp4',
  },
];

/** 한 장이 머무는 시간. 짧으면 읽다 넘어가고, 길면 다음이 있는 줄 모른다. */
const DWELL_MS = 7000;

/**
 * 첫 화면 히어로 — **영상 배경 + 큰 문장 + 슬라이드**.
 *
 * ## 왜 이 배치인가
 * 회사 홈페이지의 첫 화면은 **이 회사가 무엇을 하는 곳인지**를 한 문장으로 말하는 자리다.
 * 숫자와 공시는 아래에서 읽으면 되고, 그것부터 들이밀면 처음 온 사람은 무슨 회사인지 모른 채
 * 표를 본다. 그래서 여기에는 문장만 두고, **화면을 꽉 채운다**.
 *
 * ## 겹치는 층이 셋이다
 * 아래에서부터 **SVG 배경 → 영상 → 글**이다. 층마다 `z-` 를 못 박아 둔다 — 전에 영상과
 * 어둠막이 같은 층에 있어 **뒤에 적힌 어둠막이 영상을 통째로 덮었고**, 영상이 깔려 있는데도
 * 화면에는 보이지 않았다.
 *
 * SVG 를 맨 아래 두는 것은 영상이 늦게 뜨거나 못 뜰 때를 위해서다. 그 자리가 비면 검은
 * 상자가 남는데, 첫 화면이 검게 뜨면 사이트가 고장 난 것으로 읽힌다.
 *
 * ## 막도 그림자도 두지 않는다
 * 영상 위에 반투명 막을 덮으면 글은 읽히지만 **영상을 깐 뜻이 절반쯤 사라진다.** 글자
 * 그림자도 마찬가지로 뺐다 — 큰 글씨에 그림자가 붙으면 획이 번져 보인다.
 *
 * 대신 **어두운 영상을 고르는 것**으로 읽히게 한다. 밝은 장면이 많은 영상으로 바꾸면 이
 * 자리의 흰 글씨가 사라지므로, 영상을 고르는 기준을 `public/hero/README.md` 에 적어 두었다.
 *
 * ## 움직임을 끌 수 있어야 한다
 * 자동으로 넘어가는 화면은 읽는 속도가 사람마다 다르다. 멈춤 단추를 두고, OS 에서 움직임
 * 줄이기를 켠 사람에게는 **처음부터 멈춘 채로** 보여 준다.
 *
 * ## 아래로 내려가라는 표시도 두지 않는다
 * 화면이 꽉 차 있으면 아래에 더 있다는 것은 **스크롤 한 번이면 바로 드러난다.** 표시를
 * 두면 그것을 눌러야 내려가는 줄 아는 사람이 생기고, 첫 화면의 오른쪽 아래는 마침 영상이
 * 가장 잘 보이는 자리다.
 *
 * ## 좌우 화살표를 두지 않는다
 * 가장자리 가운데는 **아무도 보지 않는 자리**다 — 누르려면 화면 끝까지 마우스를 옮겨야 하고,
 * 터치에서는 아예 닿지 않는다. 장을 고르는 일은 아래 숫자 셋이 이미 맡고 있다.
 */
export function HomeHero() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  /* OS 의 `움직임 줄이기` 를 켠 사람에게는 자동 넘김을 처음부터 끈다. */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setIndex((previous) => (previous + 1) % SLIDES.length), DWELL_MS);
    return () => window.clearTimeout(timer);
  }, [index, playing]);

  const slide = SLIDES[index] ?? SLIDES[0]!;

  return (
    /*
      화면을 꽉 채운다(`min-h-dvh`). `vh` 가 아니라 `dvh` 인 이유: 모바일 브라우저는 주소창이
      접히고 펴지며 `vh` 가 그때마다 달라져, 스크롤할 때 첫 화면이 늘었다 줄었다 한다.

      헤더는 이 위에 겹쳐 뜨므로 높이를 빼지 않는다 — 대신 글이 헤더에 가리지 않도록 위쪽에
      여백을 준다.
    */
    <section className="relative isolate flex min-h-dvh flex-col justify-center overflow-hidden bg-night px-6 pb-24 pt-32 text-white">
      {/* 1층 — 영상이 없을 때 남는 배경. */}
      <HeroBackdrop />

      {/*
        2층 — 이 장의 영상.

        `key` 에 장 id 를 넣어 장이 바뀌면 요소가 새로 만들어진다. 같은 요소의 `src` 만 갈면
        브라우저가 앞 영상을 물고 있다가 늦게 바뀌어, 문장은 넘어갔는데 배경만 남는다.
      */}
      <video
        key={slide.id}
        className="absolute inset-0 z-[1] size-full animate-hero-fade object-cover"
        src={slide.video}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        /* 첫 프레임이 오기 전 한 순간이라도 흰 상자가 남지 않게 배경색을 깔아 둔다. */
        style={{ backgroundColor: NIGHT }}
        aria-hidden
      />

      {/* 3층 — 글. */}
      <div className="relative z-10 mx-auto flex w-full max-w-320 flex-col gap-8">
        <div className="flex flex-col gap-5">
          <h1 className="flex flex-col gap-1 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            <span>{slide.ko}</span>
            <span>{slide.en}</span>
          </h1>

          <p className="text-lg font-bold sm:text-xl">{slide.lead}</p>

          <div className="flex flex-col gap-1 text-sm leading-relaxed text-white/80 sm:text-base">
            {slide.body.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        {/*
          몇 장 중 몇 장째인지. 숫자만 두면 지금 어디인지는 알아도 **언제 넘어가는지**를 모른다 —
          진행 막대가 그 답이고, 그래서 지금 장의 막대만 길게 둔다.
        */}
        <div className="flex items-end gap-6">
          {SLIDES.map((one, position) => (
            <button
              key={one.id}
              type="button"
              onClick={() => setIndex(position)}
              aria-current={position === index}
              aria-label={`${position + 1}번째 슬라이드로`}
              className="flex flex-col gap-2 text-left"
            >
              {/*
                지금 장의 숫자는 **굵고 크다.** 색만 흐리게 갈라 두었더니, 밝은 장면이 뒤에
                깔릴 때 흰색과 40% 흰색의 차이가 거의 사라져 몇 장째인지 읽히지 않았다.
                굵기와 크기는 배경이 무엇이든 남는다.
              */}
              <span
                className={`font-mono tabular-nums transition-all duration-300 ${
                  position === index ? 'text-lg font-bold text-white' : 'text-sm font-medium text-white/45'
                }`}
              >
                {position + 1}
              </span>
              {/*
                지금 장의 막대는 **차오른다.** 길이만 다르게 두면 지금 어디인지는 알아도
                언제 넘어가는지를 모르고, 그래서 다음 장이 갑자기 나타난 것처럼 읽힌다.

                `key` 에 장 번호를 넣어 장이 바뀔 때마다 애니메이션을 처음부터 다시 돌린다 —
                없으면 같은 요소가 이어져 두 번째 장부터는 이미 차 있는 상태로 시작한다.
              */}
              <span
                className={`block overflow-hidden transition-all duration-300 ${
                  position === index ? 'h-0.5 w-40 bg-white/25 sm:w-60' : 'h-px w-10 bg-white/30'
                }`}
              >
                {position === index && (
                  <span
                    key={index}
                    aria-hidden
                    className="block h-full w-full origin-left animate-hero-progress bg-white"
                    style={{
                      ['--dwell' as string]: `${DWELL_MS}ms`,
                      /* 멈추면 막대도 그 자리에 선다 — 글은 멈췄는데 막대만 차면 곧 넘어가는 줄 안다. */
                      animationPlayState: playing ? 'running' : 'paused',
                    }}
                  />
                )}
              </span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPlaying((previous) => !previous)}
            aria-pressed={!playing}
            className="pb-1 text-xs text-white/60 hover:text-white"
          >
            {playing ? '❚❚' : '▶'}
            <span className="sr-only">{playing ? '자동 넘김 멈춤' : '자동 넘김 시작'}</span>
          </button>
        </div>
      </div>

    </section>
  );
}

/**
 * 영상이 없을 때 남는 배경 — **빛줄기**를 인라인 SVG 로 그린다.
 *
 * 영상이 늦게 뜨거나 못 뜰 때 이 자리가 비면 검은 상자가 남는다. 비트맵이 아니라 선으로
 * 그리는 이유는 따로 있다 — 이 저장소는 화면을 그대로 Figma 로 뽑는데(`docs/spec/05-component.md`)
 * **영상과 비트맵은 벡터로 복원되지 않아** 도면에서 빈 상자가 된다. 선은 그대로 넘어간다.
 *
 * 줄의 좌표와 색을 손으로 적어 두는 이유도 같다 — 난수로 만들면 뽑을 때마다 다른 그림이 나와
 * 도면과 화면을 견줄 수 없다.
 */
function HeroBackdrop() {
  const streaks = [
    { x: 62, y: 12, w: 26, o: 0.55 },
    { x: 70, y: 20, w: 18, o: 0.35 },
    { x: 58, y: 28, w: 34, o: 0.25 },
    { x: 76, y: 36, w: 14, o: 0.45 },
    { x: 64, y: 46, w: 28, o: 0.3 },
    { x: 80, y: 55, w: 12, o: 0.5 },
    { x: 56, y: 63, w: 22, o: 0.2 },
    { x: 72, y: 72, w: 20, o: 0.4 },
    { x: 66, y: 82, w: 30, o: 0.28 },
    { x: 84, y: 90, w: 10, o: 0.35 },
  ];

  return (
    <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 z-0 size-full">
      <defs>
        <linearGradient id="ir-hero-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={NIGHT} />
          <stop offset="60%" stopColor="#0a1024" />
          <stop offset="100%" stopColor="#111a3a" />
        </linearGradient>
        <linearGradient id="ir-hero-streak" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="1" />
        </linearGradient>
      </defs>

      <rect width="100" height="100" fill="url(#ir-hero-sky)" />

      {streaks.map((one) => (
        <rect
          key={`${one.x}-${one.y}`}
          x={one.x}
          y={one.y}
          width={one.w}
          height="0.25"
          rx="0.12"
          fill="url(#ir-hero-streak)"
          opacity={one.o}
        />
      ))}
    </svg>
  );
}
