'use client';

import { useMemo } from 'react';
import { Play } from 'lucide-react';
import type { MediaClip } from '@winpilot/store';
import { SupportBrowser } from '@/app/support/_components/SupportBrowser';
import { CLIP, NIGHT } from '@/lib/palette';

/**
 * 뉴스 — **갈래 · 검색 · 격자**.
 *
 * 공지사항 · FAQ 와 같은 틀이다(`SupportBrowser`) — 왼쪽에 갈래, 오른쪽에 검색과 결과. 셋 중
 * 여기만 결과가 격자인데, 영상은 **제목보다 그림으로 고르기** 때문이다.
 *
 * ## 홈의 줄과 무엇이 다른가
 * 홈에서는 옆으로 미는 한 줄이다 — 거기서 하는 일은 "이런 것도 있다" 를 흘리는 것이라, 다섯 장
 * 남짓이면 족하다. 여기서는 **찾으러 온 사람**이 보므로 전부 펼쳐 격자로 세운다.
 *
 * ## 갈래를 값에서 뽑는다
 * `기업 브랜드 영상` · `제품 소개` 같은 갈래를 여기에 적어 두지 않고 목록에서 뽑는다. 적어 두면
 * 어드민에서 새 갈래를 쓰는 날 **그 영상만 어느 갈래에도 안 걸린다** — 화면에는 있는데 걸러지지
 * 않는 줄이 생긴다. 공지·FAQ 와 다른 점인데, 저쪽은 갈래가 코드에 정해져 있어 없는 갈래도
 * 0 으로 세워 두는 편이 낫다.
 *
 * ## 썸네일이 도형인 이유
 * 영상 파일과 미리보기 그림이 아직 없다. 없는 영상의 장면을 지어내 사진처럼 두면 **있는 자료로
 * 읽히고**, 그것이 IR 화면에서 나가면 곤란해진다.
 */
export function NewsListView({ clips }: { clips: MediaClip[] }) {
  /** 나온 차례를 지켜 `Set` 을 쓴다 — 가나다로 섞으면 최신 갈래가 뒤로 간다. */
  const channels = useMemo(() => [...new Set(clips.map((one) => one.channel))], [clips]);

  return (
    <SupportBrowser
      items={clips}
      facets={channels}
      facetOf={(one) => one.channel}
      searchLabel="뉴스 검색"
      searchPlaceholder="제목 · 갈래"
      searchIn={(one) => [one.title, one.channel]}
      empty="조건에 맞는 뉴스가 없습니다."
    >
      {(rows) => (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((clip) => (
            <li key={clip.id} className="flex flex-col gap-3">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-night">
                <ClipPattern seed={clip.seed} />
                {/* 재생 표시 — 이 카드가 글이 아니라 영상이라는 것을 말하는 유일한 것. */}
                <span className="absolute bottom-3 right-3 grid size-7 place-items-center rounded bg-black/70">
                  <Play aria-hidden className="size-3 fill-white text-white" />
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-xs text-ink-faint">{clip.channel}</p>
                <h2 className="text-sm font-semibold leading-relaxed">{clip.title}</h2>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SupportBrowser>
  );
}

/**
 * 썸네일 자리의 무늬.
 *
 * 홈의 줄과 **같은 그림**이다. 여기서만 다르게 그리면 홈에서 본 것과 이 목록의 것이 같은
 * 영상인지 알 수 없다.
 */
function ClipPattern({ seed }: { seed: number }) {
  const angle = 20 + seed * 25;

  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden className="size-full">
      <defs>
        <linearGradient id={`news-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#101d33" />
          <stop offset="100%" stopColor={NIGHT} />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#news-${seed})`} />
      <g transform={`rotate(${angle} 160 90)`}>
        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
          <line
            key={index}
            x1={-40 + index * 60}
            y1={-60}
            x2={-40 + index * 60}
            y2={240}
            stroke={index === seed % 7 ? CLIP.lead : CLIP.rest}
            strokeWidth={index === seed % 7 ? 3 : 1.5}
          />
        ))}
      </g>
    </svg>
  );
}
