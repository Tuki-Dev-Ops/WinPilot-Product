'use client';

import type { KoreaShape } from '@/lib/geo/korea';

/**
 * 시 · 도별 문의를 **실제 경계선 위에** 얹은 지도.
 *
 * ## 좌표를 들고 있지 않다
 * 경계선은 서버에서 이미 화면 좌표로 옮겨진 채 온다(`lib/geo/korea.ts`). 이 파일이 하는 일은
 * 받은 경로에 색을 입히고 이름을 얹는 것뿐이다 — 그래서 214KB 의 좌표와 `d3-geo` 가 브라우저로
 * 내려가지 않는다.
 *
 * ## 색은 **어느 지역인지**를 말한다
 * 한 색의 짙기로 건수를 나타내는 방식(단계 구분도)을 쓰지 않는다. 건수를 읽는 자리는 **숫자**이고
 * 옆에 정확한 표가 나란히 서 있다. 색까지 건수를 말하면 지도와 표가 같은 것을 두 번 말하는
 * 셈이고, 정작 **어느 칠이 어느 도인지**는 아무것도 말해 주지 않는다.
 *
 * 맞닿은 도끼리는 계열이 갈리게 골랐다 — 경계선이 얇아 비슷한 색이 붙으면 두 도가 한 덩어리로
 * 보인다.
 *
 * ## 지도에 글자를 적지 않는다
 * 이름도 숫자도 없다. 바로 옆에 **같은 값을 정확히 적은 표**가 서 있기 때문이다 — 지도가 그것을
 * 한 번 더 적으면 좁은 도(세종 · 광주 · 대전)에서는 글자를 밖으로 빼내 선으로 이어야 하고,
 * 그 선과 글자가 정작 지도를 덮는다. 지도가 답하는 물음은 **어디가 짙고 어디가 비었는가**
 * 하나이고, 그 답에는 글자가 필요 없다.
 *
 * 대신 마우스를 올리면 `<title>` 이 이름과 건수를 띄우고, 누르면 옆 표가 그 줄만 남긴다.
 *
 * ## 한 지역이 세 가지 톤을 쓴다
 * `light`(위쪽) · `base`(아래쪽) · `line`(테두리). 셋 다 **같은 색상**이고 밝기만 다르다.
 *
 * - 안쪽은 위에서 아래로 밝기가 지는 그라디언트에 불투명도를 낮춰 깐다. 판판한 한 색은 종이에
 *   찍힌 것처럼 보이고, 밝기가 지면 **살짝 떠 있는 덩어리**로 읽힌다.
 * - 그 아래에 같은 모양을 3px 내려 짙은 색으로 한 겹 깐다. 이것이 두께다.
 * - 테두리는 `line` 이다. 파스텔 그대로 두르면 이웃과 경계가 녹아 두 도가 한 덩어리로 보인다.
 *
 * ## 0건은 더 옅게
 * 한 건도 오지 않은 곳은 자기 색을 그대로 두되 옅게 깐다. 색을 지우면 **비어 있는 지역이
 * 지도에서 사라지는데**, 그 지역이야말로 손대야 할 곳이다.
 */

/**
 * 시 · 도마다 자기 색 — 밝은 쪽 · 바탕 · 짙은 쪽.
 *
 * 통계청 시 · 도 코드로 키를 잡는다 — 이름은 바뀌고 코드는 남는다(`lib/geo/korea.ts`).
 * 광역시는 자기를 품은 도와 확실히 갈리는 색을 받는다(서울은 경기 안, 대구는 경북 안,
 * 광주는 전남 안).
 */
const TINT: Record<string, { light: string; base: string; line: string }> = {
  '31': { light: '#fdf0ce', base: '#fbe3a6', line: '#b8862a' }, // 경기 — 노랑
  '11': { light: '#f9cfc8', base: '#f5a79b', line: '#c2503f' }, // 서울 — 코랄
  '23': { light: '#caeaeb', base: '#9fd8db', line: '#2f8b90' }, // 인천 — 청록
  '32': { light: '#e0f1d8', base: '#c6e6b8', line: '#5b9445' }, // 강원 — 초록
  '33': { light: '#d2eaf7', base: '#aed8f0', line: '#2f7ba8' }, // 충북 — 하늘
  '34': { light: '#fbe2ce', base: '#f8cba6', line: '#b9702b' }, // 충남 — 살구
  '29': { light: '#fbe5bf', base: '#f7d08a', line: '#b3801c' }, // 세종 — 주황
  '25': { light: '#eed2e5', base: '#e0aecf', line: '#a4508a' }, // 대전 — 자주
  '35': { light: '#eaddf5', base: '#d9c2ec', line: '#7a55a8' }, // 전북 — 라일락
  '36': { light: '#d0eee5', base: '#a9e0d0', line: '#2f8f76' }, // 전남 — 민트
  '24': { light: '#cfdff5', base: '#a8c4ec', line: '#4269a8' }, // 광주 — 파랑
  '37': { light: '#fadce4', base: '#f6bfce', line: '#bc5273' }, // 경북 — 분홍
  '22': { light: '#fae1c8', base: '#f6c89a', line: '#b57226' }, // 대구 — 주황
  '38': { light: '#f0f1cf', base: '#e4e6a8', line: '#8b8f2c' }, // 경남 — 연두
  '26': { light: '#dfd8f2', base: '#c5b8e8', line: '#6a58ab' }, // 울산 — 보라
  '21': { light: '#c3e2f2', base: '#92cbe8', line: '#2b7ba3' }, // 부산 — 청
  '39': { light: '#f6e0f1', base: '#eec7e6', line: '#a4589a' }, // 제주 — 분홍보라
};

/** 아무 색도 못 찾았을 때. 지도에 구멍이 뚫리는 것보다 회색이 낫다. */
const FALLBACK = { light: '#eef1f5', base: '#dfe3ea', line: '#7b8494' };

/** 두께로 보이는 아래 겹을 얼마나 내릴지(px). 더 내리면 도가 서로 떠 보인다. */
const LIFT = 3;

export function KoreaMap({
  shapes,
  box,
  counts,
  onPick,
  picked,
}: {
  shapes: KoreaShape[];
  box: { width: number; height: number };
  /** 시 · 도 이름 → 건수. 없는 이름은 0 으로 본다 */
  counts: Record<string, number>;
  onPick?: (region: string) => void;
  picked?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${box.width} ${box.height + LIFT}`}
      className="h-auto w-full max-w-90"
      role="img"
      aria-label="시 · 도별 문의 건수"
    >
      <defs>
        {shapes.map((shape) => {
          const tint = TINT[shape.code] ?? FALLBACK;
          return (
            /* 위에서 아래로 밝기가 진다 — 빛이 위에서 온다고 보는 것이 사람 눈의 기본값이다. */
            <linearGradient key={shape.code} id={`korea-${shape.code}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tint.light} />
              <stop offset="100%" stopColor={tint.base} />
            </linearGradient>
          );
        })}
      </defs>

      {shapes.map((shape) => {
        const tint = TINT[shape.code] ?? FALLBACK;
        const count = counts[shape.region] ?? 0;
        const empty = count === 0;
        const on = shape.region === picked;

        return (
          <g
            key={shape.code}
            {...(onPick
              ? {
                  role: 'button',
                  tabIndex: 0,
                  onClick: () => onPick(shape.region),
                  onKeyDown: (event: React.KeyboardEvent) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onPick(shape.region);
                    }
                  },
                  className: 'cursor-pointer',
                }
              : {})}
            aria-label={`${shape.region} ${count}건`}
          >
            {/* 아래 겹 — 두께. 같은 모양을 짙은 색으로 조금 내려 깐다. */}
            <path
              d={shape.d}
              transform={`translate(0 ${LIFT})`}
              fill={tint.line}
              fillOpacity={empty ? 0.12 : 0.32}
            />

            <path
              d={shape.d}
              fill={`url(#korea-${shape.code})`}
              fillOpacity={empty ? 0.3 : 0.78}
              stroke={tint.line}
              strokeOpacity={empty ? 0.4 : 0.9}
              strokeWidth={on ? 2.4 : 0.9}
              strokeLinejoin="round"
            />

            {/*
              브라우저가 띄우는 풍선 도움말. 지도에 글자를 적지 않으므로 **마우스를 올렸을 때
              무엇인지 말해 줄 것**이 하나는 있어야 한다. 우리가 그린 도움말이 아니라 `<title>` 인
              이유는, 이것이 낭독기가 읽는 이름이기도 해서다 — 두 벌로 두면 한쪽만 낡는다.
            */}
            <title>{`${shape.region} ${count}건`}</title>
          </g>
        );
      })}
    </svg>
  );
}
