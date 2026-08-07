'use client';

/**
 * 시 · 도 열일곱을 **칸으로 놓은 지도**.
 *
 * ## 왜 해안선을 그리지 않았나
 * 실제 경계선을 그리면 눈에는 좋지만 여기서 하는 일에는 해롭다. 이 지도가 답하는 물음은
 * "어디서 문의가 오는가 · 어디가 비어 있는가" 하나인데, 진짜 지도에서는 **세종과 광주가
 * 손톱만 해져** 그 숫자를 읽을 수 없다. 정작 손대야 할 곳이 가장 안 보이는 지도가 된다.
 *
 * 게다가 우리가 그린 경계선이 맞는지 확인할 방법이 없다. 틀린 경계선을 콘솔에 두는 것은
 * 값이 틀린 것과 같다 — 다만 아무도 눈치채지 못할 뿐이다.
 *
 * ## 그래서 칸을 놓는다
 * 칸 하나가 시 · 도 하나다. **자리는 실제 지리를 따르고**(인천은 서울 서쪽, 강원은 북동쪽,
 * 제주는 맨 아래), 크기는 넓이가 아니라 **읽을 수 있는 크기**로 고정한다. 넓은 도는 칸을
 * 여러 개 차지해 도와 광역시가 한눈에 갈린다.
 *
 * 서울이 경기 안에 들어앉은 모양도 실제와 같다 — 그 사실이 자리로 드러난다.
 *
 * ## 색으로만 말하지 않는다
 * 칸마다 이름과 숫자를 함께 적는다. 색 짙기만으로 알리면 색을 가려 보는 사람에게는 빈
 * 지도가 되고, 짙기의 차이는 두 칸을 나란히 놓기 전에는 원래 잘 구분되지 않는다.
 */

/** 칸 하나의 크기와 사이. 이름 두 글자와 숫자가 들어가는 최소가 이 값이다. */
const CELL = 52;
const GAP = 4;
const COLS = 5;
const ROWS = 8;

/**
 * 어느 칸에 놓는가 — `[열, 행]`. 열 0 이 서쪽, 행 0 이 북쪽이다.
 *
 * 칸이 여럿인 것은 넓은 도다. 실제 넓이 비가 아니라 **도와 광역시를 갈라 보이게 하는**
 * 정도로만 준다 — 넓이를 그대로 옮기면 다시 세종이 사라진다.
 */
const PLACES: { region: string; short: string; cells: [number, number][] }[] = [
  { region: '경기도', short: '경기', cells: [[1, 0], [2, 0], [2, 1]] },
  { region: '강원특별자치도', short: '강원', cells: [[3, 0], [4, 0], [3, 1], [4, 1]] },
  { region: '인천광역시', short: '인천', cells: [[0, 1]] },
  { region: '서울특별시', short: '서울', cells: [[1, 1]] },
  { region: '충청남도', short: '충남', cells: [[0, 2], [0, 3]] },
  { region: '세종특별자치시', short: '세종', cells: [[1, 2]] },
  { region: '대전광역시', short: '대전', cells: [[1, 3]] },
  { region: '충청북도', short: '충북', cells: [[2, 2], [2, 3]] },
  { region: '경상북도', short: '경북', cells: [[3, 2], [4, 2], [3, 3], [4, 3], [3, 4]] },
  { region: '전북특별자치도', short: '전북', cells: [[0, 4], [1, 4]] },
  { region: '대구광역시', short: '대구', cells: [[2, 4]] },
  { region: '울산광역시', short: '울산', cells: [[4, 4]] },
  { region: '광주광역시', short: '광주', cells: [[0, 5]] },
  { region: '전라남도', short: '전남', cells: [[1, 5], [0, 6], [1, 6]] },
  { region: '경상남도', short: '경남', cells: [[2, 5], [2, 6]] },
  { region: '부산광역시', short: '부산', cells: [[3, 5]] },
  { region: '제주특별자치도', short: '제주', cells: [[0, 7]] },
];

export function KoreaMap({
  counts,
  onPick,
  picked,
}: {
  /** 시 · 도 이름 → 건수. 없는 이름은 0 으로 본다 */
  counts: Record<string, number>;
  /** 칸을 눌렀을 때. 없으면 눌리지 않는다 */
  onPick?: (region: string) => void;
  /** 지금 골라 둔 시 · 도 */
  picked?: string;
}) {
  const top = Math.max(1, ...Object.values(counts));

  return (
    <svg
      viewBox={`0 0 ${COLS * (CELL + GAP)} ${ROWS * (CELL + GAP)}`}
      className="h-auto w-full max-w-80"
      role="img"
      aria-label="시 · 도별 문의 건수"
    >
      {PLACES.map((place) => {
        const count = counts[place.region] ?? 0;
        /* 0 은 색을 주지 않는다 — 옅게라도 칠하면 한 건 온 곳과 구분되지 않는다. */
        const weight = count === 0 ? 0 : 0.25 + (count / top) * 0.65;
        const label = labelCell(place.cells);
        const on = place.region === picked;

        return (
          <g
            key={place.region}
            {...(onPick
              ? {
                  role: 'button',
                  tabIndex: 0,
                  onClick: () => onPick(place.region),
                  onKeyDown: (event: React.KeyboardEvent) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onPick(place.region);
                    }
                  },
                  className: 'cursor-pointer',
                }
              : {})}
            aria-label={`${place.region} ${count}건`}
          >
            {place.cells.map(([col, row]) => (
              <rect
                key={`${col}-${row}`}
                x={col * (CELL + GAP)}
                y={row * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={6}
                className="fill-brand stroke-canvas"
                fillOpacity={weight === 0 ? 0.06 : weight}
                strokeWidth={on ? 3 : 1.5}
                stroke={on ? 'currentColor' : undefined}
              />
            ))}

            {/*
              글자색을 짙기로 가른다. 옅은 칸 위의 흰 글자는 읽히지 않고, 짙은 칸 위의
              먹색 글자도 마찬가지다 — 어느 쪽이든 못 읽으면 숫자를 적은 뜻이 없다.
            */}
            <text
              x={label.x}
              y={label.y - 5}
              textAnchor="middle"
              className={`text-[13px] ${weight > 0.55 ? 'fill-white' : 'fill-ink'}`}
            >
              {place.short}
            </text>
            <text
              x={label.x}
              y={label.y + 13}
              textAnchor="middle"
              className={`font-mono text-[13px] tabular-nums ${
                weight > 0.55 ? 'fill-white' : count === 0 ? 'fill-ink-faint' : 'fill-ink'
              }`}
            >
              {count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * 이름을 적을 칸의 한가운데.
 *
 * 여러 칸을 차지하는 도는 **칸들의 평균**이 아니라 맨 위 왼쪽 칸에 적는다. 평균을 쓰면
 * ㄱ 자로 놓인 경기 같은 곳에서 글자가 자기 칸 밖(빈 자리)에 떨어진다.
 */
function labelCell(cells: [number, number][]): { x: number; y: number } {
  const first = cells[0] ?? [0, 0];
  return {
    x: first[0] * (CELL + GAP) + CELL / 2,
    y: first[1] * (CELL + GAP) + CELL / 2,
  };
}
