'use client';

import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { SLOT, cid, type BannerItem } from '@winpilot/client-content';

/**
 * 히어로 — **정사각 카드가 가로로 흐르고, 양옆은 흐리게 잘려 보이는** 캐러셀.
 *
 * 치수는 화면 폭에 비례한다(`vw`). 고정 픽셀로 잡으면 1920 에서만 맞고 다른 폭에서 어긋나는데,
 * 이 배치는 "가운데 3장 + 양옆 살짝" 이라는 비율 자체가 핵심이라 폭을 따라가야 한다.
 *
 *   카드 한 변 23.6vw · 간격 8px · 왼쪽으로 13.2vw 만큼 밀어 앞 카드가 걸치게 둔다.
 *   → 1920px 에서 카드 453px, 왼쪽 잘린 카드 253px, 오른쪽 잘린 카드 272px.
 *
 * **무한 반복** — 목록을 세 벌 이어 붙이고 가운데 벌에서 움직인다. 끝에 닿으면 화면이
 * 바뀌지 않는 순간(전환이 끝난 직후)에 같은 그림의 가운데 벌로 되돌려 놓는다.
 * 한 벌만 두면 마지막 카드 뒤가 비어 흰 바탕이 그대로 보인다.
 *
 * 자동 넘김은 **모션 감소를 켠 사용자에게는 돌지 않는다** — 5초마다 화면이 밀리는 것은
 * 움직임이 불편한 사람에게 그대로 장벽이다 (docs/spec/08-non-functional.md §8.2).
 *
 * ## 어드민 연동
 * - 배너 이미지 · 제목 · 부제 · 뱃지 · 링크 ← `b2c-admin` 배너 > 메인 비주얼 (`/banners`)
 * - 노출 순서는 어드민이 자동으로 매긴 값(`order`)을 그대로 따른다 — 템플릿이 다시 정렬하지 않는다
 * - 노출 기간이 끝난 배너는 계약 단계에서 걸러져 여기까지 오지 않는다
 */
const CARD = '23.6vw';
const GAP = 8;
const PEEK = '13.2vw';
const INTERVAL_MS = 5000;
const SLIDE_MS = 500;

/** 이미지가 아직 없을 때 쓰는 자리표시자 색. 배너마다 달라야 옆 카드와 구분된다. */
const PLACEHOLDER = [
  'from-[#4a5568] to-[#2d3748]',
  'from-[#5a67d8] to-[#434190]',
  'from-[#b7791f] to-[#744210]',
  'from-[#2c7a7b] to-[#1d4044]',
  'from-[#97266d] to-[#521b41]',
  'from-[#4a5568] to-[#1a202c]',
];

export function HeroCarousel({ banners }: { banners: BannerItem[] }) {
  const total = banners.length;

  /*
    화면에는 최대 다섯 장이 걸린다(가운데 3장 + 양옆 2장). 배너가 그보다 적으면 한 벌로는
    빈자리가 생기므로, **화면을 채우고도 앞뒤로 한 벌씩 남을 만큼** 복제한다.
  */
  const copies = total === 0 ? 0 : Math.max(5, Math.ceil(6 / total) + 4);
  const origin = total * Math.floor(copies / 2);

  // 가운데 벌에서 시작한다 — 앞뒤로 여유가 있어야 양방향으로 끊김 없이 넘어간다.
  const [index, setIndex] = useState(origin);
  const [animate, setAnimate] = useState(true);
  const [playing, setPlaying] = useState(true);

  const step = useCallback((delta: number) => setIndex((current) => current + delta), []);

  /*
    되돌리기는 **전환이 실제로 끝난 뒤**에 한다.
    시간(500ms)으로 재면 자동 넘김과 어긋나 되돌리기 전에 다음 칸으로 가 버리고,
    그때 목록 끝을 넘어서면 카드가 없는 흰 자리가 그대로 보인다.
  */
  const settle = useCallback(() => {
    if (total === 0) return;
    setIndex((current) => {
      if (current >= origin + total) return current - total;
      if (current < origin) return current + total;
      return current;
    });
  }, [origin, total]);

  useEffect(() => {
    if (!playing || total <= 1) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const timer = setInterval(() => setIndex((current) => current + 1), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [playing, total]);

  // 되돌린 다음 프레임에 전환을 다시 켠다 — 같은 프레임에 켜면 되돌아가는 모습이 보인다.
  useEffect(() => {
    if (animate) return undefined;
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, [animate]);

  if (total === 0) return null;

  const loop = Array.from({ length: copies }, () => banners).flat();
  const current = ((index % total) + total) % total;

  return (
    <section
      id={SLOT.hero}
      data-ssot-cid={cid('banner.list', 'SiteHero')}
      /* 화면 폭을 가득 채운다 — 본문 여백 안에 갇히면 양옆 걸침이 생기지 않는다. */
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      aria-roledescription="carousel"
      aria-label="기획전 배너"
    >
      <div
        onTransitionEnd={() => {
          // 되돌리는 순간에는 전환을 끈다 — 켜 두면 되돌아가는 모습이 그대로 보인다.
          if (index >= origin + total || index < origin) setAnimate(false);
          settle();
        }}
        className={`flex ${animate ? 'transition-transform duration-500 ease-out' : ''}`}
        style={{
          gap: `${GAP}px`,
          transform: `translateX(calc(${PEEK} - ${index} * (${CARD} + ${GAP}px)))`,
        }}
      >
        {loop.map((banner, position) => {
          // 가운데 세 장만 또렷하다. 양옆에 걸친 카드는 흐리게 두어 '더 있다' 만 전한다.
          const focused = position >= index && position <= index + 2;
          const tone = PLACEHOLDER[position % PLACEHOLDER.length];

          return (
            <a
              key={`${banner.id}-${position}`}
              href={banner.linkUrl || undefined}
              aria-hidden={!focused}
              tabIndex={focused ? undefined : -1}
              className={`relative aspect-square shrink-0 overflow-hidden rounded-lg transition-[filter,opacity] duration-500 ${
                focused ? '' : 'pointer-events-none opacity-70 blur-[6px]'
              }`}
              style={{ width: CARD }}
            >
              {banner.imageUrl ? (
                // 미리보기 이미지는 objectURL 일 수 있어 next/image 최적화 대상이 아니다.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={banner.imageUrl} alt="" className="size-full object-cover" />
              ) : (
                <span className={`block size-full bg-gradient-to-br ${tone}`} />
              )}

              {/* 글자를 읽히게 하는 그늘. 이미지가 밝아도 흰 글씨가 살아남아야 한다. */}
              <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 px-7 pb-6">
                {banner.badge && (
                  <span className="w-fit rounded bg-black/80 px-2.5 py-1 text-xs font-medium text-white">
                    {banner.badge}
                  </span>
                )}
                <p className="text-[28px] font-bold leading-tight tracking-tight text-white">{banner.title}</p>
                {banner.subtitle && <p className="text-sm text-white/85">{banner.subtitle}</p>}
              </div>
            </a>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="이전 배너"
        className="absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-lg"
        style={{ left: `calc(${PEEK} / 2 - 22px)` }}
      >
        <ChevronLeft aria-hidden className="size-5" strokeWidth={1.6} />
      </button>

      <button
        type="button"
        onClick={() => step(1)}
        aria-label="다음 배너"
        className="absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-lg"
        style={{ right: `calc(${PEEK} / 2 - 22px)` }}
      >
        <ChevronRight aria-hidden className="size-5" strokeWidth={1.6} />
      </button>

      {/* 재생 제어와 순번 — 세 번째 카드 오른쪽 아래에 앉는다. */}
      <div className="absolute bottom-5 flex items-center gap-1.5" style={{ right: `calc(${PEEK} + 24px)` }}>
        <button
          type="button"
          onClick={() => setPlaying((value) => !value)}
          aria-label={playing ? '자동 넘김 멈춤' : '자동 넘김 시작'}
          className="grid size-8 place-items-center rounded bg-black/60 text-white"
        >
          {playing ? (
            <Pause aria-hidden className="size-3 fill-current" strokeWidth={0} />
          ) : (
            <Play aria-hidden className="size-3 fill-current" strokeWidth={0} />
          )}
        </button>

        <p className="flex h-8 items-center gap-1.5 rounded bg-black/60 px-3 text-xs tabular-nums text-white">
          <span className="font-medium">{current + 1}</span>
          <span className="text-white/40">|</span>
          <span className="text-white/70">{total}</span>
        </p>
      </div>
    </section>
  );
}
