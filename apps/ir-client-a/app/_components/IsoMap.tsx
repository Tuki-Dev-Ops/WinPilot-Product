/**
 * 아이소메트릭 도형을 그리는 **자·컴퍼스**. 여기에는 뜻이 없고 모양만 있다.
 *
 * ## 왜 SVG 로 직접 그리는가
 * 이 저장소의 화면은 Figma 로 다시 뽑아 쓴다. 아이소메트릭 일러스트를 그림 파일로 두면 그
 * 자리만 **크기를 바꿀 수 없는 흐릿한 조각**으로 남고, 색을 하나 바꾸려 해도 원본 파일을
 * 만든 사람을 찾아야 한다. 도형으로 그려 두면 토큰 색이 그대로 먹고, 어느 칸을 밝힐지도
 * 코드가 정한다.
 *
 * ## 2:1 로 눕힌다 — 정투상(30°)이 아니라
 * 칸 하나가 **가로 64 · 세로 32**다. 진짜 아이소메트릭(30°, 가로세로비 0.866)은 도면을 그릴
 * 때 쓰는 각도이고, 화면에서는 두 가지가 걸린다.
 *
 * 1. 좌표가 무리수라 칸 경계가 반 픽셀에 걸려 **선이 흐리게** 번진다. 2:1 은 정수로 떨어진다.
 * 2. 글자를 같이 눕혀야 그림에 붙는데, 눕힌 글자는 읽는 데 품이 든다.
 *
 * 그래서 도형만 눕히고 **글자는 화면 좌표에 똑바로 세운다**. 아래 `isoPoint` 가 격자 좌표를
 * 화면 좌표로 옮겨 주므로, 글자도 같은 함수로 자리만 얻어 가로로 선다.
 *
 * ## 앞뒤
 * 그리는 차례가 곧 앞뒤다(먼저 그린 것이 뒤). 한 벌 안에서는 **뒤에 놓일 것을 먼저 적어**
 * 맞추고, 벌과 벌 사이는 무대가 정한다 — 무대가 돌면 앞뒤가 계속 바뀌므로, 그 정렬은
 * 각도를 아는 `HomeService` 쪽에 있다.
 *
 * 출처
 * - https://www.jointjs.com/blog/isometric-diagrams — 아이소메트릭 SVG 의 면 구성과 앞뒤 정렬
 * - https://www.petercollingridge.co.uk/tutorials/svg/isometric-projection/ — 투영 행렬과 각도
 */

/** 칸 하나의 가로 절반. 세로 절반의 두 배 — 이 비가 2:1 을 만든다. */
const HALF_W = 32;
const HALF_H = 16;

/**
 * 격자 (0,0) 이 화면의 어디에 오는가.
 *
 * **둘 다 0 이다.** 장비 한 벌은 자기 자리를 모르고 원점 둘레에 그려지기만 하고, 어디에 놓일지는
 * 그것을 감싼 `<g transform>` 이 정한다 — 회전 무대 위에서 자리가 계속 바뀌기 때문이다.
 * 좌표에 자리를 섞어 두면 무대가 돌 때마다 도형을 다시 계산해야 한다.
 */
const ORIGIN_X = 0;
const ORIGIN_Y = 0;

/**
 * 격자 좌표 → 화면 좌표.
 *
 * `x` 는 오른쪽아래로, `y` 는 왼쪽아래로 간다. `z` 는 높이라 화면에서는 위로 올라가므로 뺀다.
 */
export function isoPoint(x: number, y: number, z = 0): [number, number] {
  return [ORIGIN_X + (x - y) * HALF_W, ORIGIN_Y + (x + y) * HALF_H - z];
}

function polygon(points: [number, number][]): string {
  return points.map(([x, y]) => `${x},${y}`).join(' ');
}

export type IsoTone = {
  /** 윗면 */ top: string;
  /** 오른쪽 면 — 빛이 드는 쪽이라 조금 밝다 */ right: string;
  /** 왼쪽 면 */ left: string;
  /** 모서리 */ line: string;
};

/**
 * 바닥판 — 각 서비스가 올라서는 마름모.
 *
 * 판을 따로 두는 이유: 도형만 띄우면 무엇과 무엇이 한 묶음인지 알 수 없다. 판이 묶음의
 * 경계를 대신한다 — 상자를 두르는 테두리를 아이소메트릭에서는 이렇게 그린다.
 *
 * ## 두께가 있다
 * 전에는 종잇장 한 겹이었다. 그러니 판 **아래로 무대 바닥이 그대로 비쳐** 방이 떠 있는 것도
 * 놓인 것도 아닌 상태로 보였다. 앞쪽 두 면을 세워 두께를 주면 판이 바닥에 **얹힌 덩어리**가
 * 되고, 그 두 면이 뒤엣것을 가린다.
 */
export function IsoPlatform({
  cx,
  cy,
  r,
  tone,
  active,
}: {
  cx: number;
  cy: number;
  /** 반지름 — 격자 칸 수 */
  r: number;
  tone: IsoTone;
  active: boolean;
}) {
  const face = polygon([
    isoPoint(cx - r, cy - r),
    isoPoint(cx + r, cy - r),
    isoPoint(cx + r, cy + r),
    isoPoint(cx - r, cy + r),
  ]);

  /** 판의 두께(px). 방을 들어 올리지 않을 만큼만 — 높으면 판이 아니라 좌대가 된다. */
  const deep = 12;

  return (
    <g>
      {/* 앞쪽 두 면 — 판을 덩어리로 만들고, 그 뒤로 비치는 것을 막는다. */}
      <polygon
        points={polygon([
          isoPoint(cx + r, cy - r),
          isoPoint(cx + r, cy + r),
          isoPoint(cx + r, cy + r, -deep),
          isoPoint(cx + r, cy - r, -deep),
        ])}
        fill={tone.right}
        stroke={tone.line}
        strokeWidth={1}
      />
      <polygon
        points={polygon([
          isoPoint(cx - r, cy + r),
          isoPoint(cx + r, cy + r),
          isoPoint(cx + r, cy + r, -deep),
          isoPoint(cx - r, cy + r, -deep),
        ])}
        fill={tone.left}
        stroke={tone.line}
        strokeWidth={1}
      />
      <polygon points={face} fill={tone.top} stroke={tone.line} strokeWidth={active ? 1.5 : 1} />
      {/*
        살아 있는 칸에만 안쪽 선을 하나 더 둔다. 판 색만 밝히면 어두운 배경에서 차이가 거의
        보이지 않는다 — 선이 하나 더 있는 쪽이 훨씬 빨리 눈에 든다.
      */}
      {active && (
        <polygon
          points={polygon([
            isoPoint(cx - r + 0.35, cy - r + 0.35),
            isoPoint(cx + r - 0.35, cy - r + 0.35),
            isoPoint(cx + r - 0.35, cy + r - 0.35),
            isoPoint(cx - r + 0.35, cy + r - 0.35),
          ])}
          fill="none"
          stroke={tone.line}
          strokeWidth={0.75}
          strokeOpacity={0.5}
        />
      )}
    </g>
  );
}

/**
 * 세운 상자 — 설비·서버·서류 무더기가 전부 이것의 크기만 다른 것이다.
 *
 * 보이는 면은 셋뿐이다(윗면 · 오른쪽 · 왼쪽). 뒤의 세 면은 어차피 가려지므로 그리지 않는다 —
 * 그리면 노드 하나가 폴리곤 여섯 개가 되고, 스무 개를 놓으면 그 차이가 스크롤에서 드러난다.
 */
export function IsoBox({
  x,
  y,
  w,
  d,
  h,
  base = 0,
  tone,
  fill,
}: {
  x: number;
  y: number;
  /** 가로(격자 칸) */ w: number;
  /** 깊이(격자 칸) */ d: number;
  /** 높이(화면 픽셀) — 높이만 픽셀인 이유는 격자와 무관하게 눈으로 맞추기 때문이다 */ h: number;
  /** 바닥에서 띄우는 높이. 이것이 있어야 **쌓을 수 있다** — 선반 위의 팔레트, 기계 위의 조작반 */
  base?: number;
  tone: IsoTone;
  /** 윗면만 다른 색으로 — 화면·표시등처럼 그 면만 다른 것 */
  fill?: string;
}) {
  const x1 = x + w;
  const y1 = y + d;
  const top = base + h;

  return (
    <g>
      <polygon
        points={polygon([isoPoint(x, y, top), isoPoint(x1, y, top), isoPoint(x1, y1, top), isoPoint(x, y1, top)])}
        fill={fill ?? tone.top}
        stroke={tone.line}
        strokeWidth={0.9}
      />
      <polygon
        points={polygon([isoPoint(x1, y, base), isoPoint(x1, y1, base), isoPoint(x1, y1, top), isoPoint(x1, y, top)])}
        fill={tone.right}
        stroke={tone.line}
        strokeWidth={0.9}
      />
      <polygon
        points={polygon([isoPoint(x, y1, base), isoPoint(x1, y1, base), isoPoint(x1, y1, top), isoPoint(x, y1, top)])}
        fill={tone.left}
        stroke={tone.line}
        strokeWidth={0.9}
      />
    </g>
  );
}

/**
 * 원기둥 — 로봇 받침 · 컨베이어 롤러 · 탱크.
 *
 * 아랫면은 그리지 않는다. 바닥에 놓인 것은 어차피 판이 가리고, 떠 있는 것은 아래에서 볼 일이
 * 없다 — 아이소메트릭에서 시점은 늘 위쪽이다.
 */
export function IsoCylinder({
  x,
  y,
  r,
  h,
  base = 0,
  tone,
  fill,
}: {
  x: number;
  y: number;
  /** 반지름(격자 칸) */ r: number;
  h: number;
  base?: number;
  tone: IsoTone;
  fill?: string;
}) {
  const [cx, cyBottom] = isoPoint(x, y, base);
  const cyTop = cyBottom - h;
  const rx = r * HALF_W;
  const ry = r * HALF_H;

  return (
    <g>
      <polygon
        points={polygon([
          [cx - rx, cyBottom],
          [cx - rx, cyTop],
          [cx + rx, cyTop],
          [cx + rx, cyBottom],
        ])}
        fill={tone.right}
        stroke={tone.line}
        strokeWidth={0.9}
      />
      <ellipse cx={cx} cy={cyTop} rx={rx} ry={ry} fill={fill ?? tone.top} stroke={tone.line} strokeWidth={0.9} />
    </g>
  );
}

/** 눕힌 원판 — 탁자 상판 · 회전 받침. */
export function IsoDisc({
  x,
  y,
  r,
  z = 0,
  tone,
  fill,
}: {
  x: number;
  y: number;
  r: number;
  z?: number;
  tone: IsoTone;
  fill?: string;
}) {
  const [cx, cy] = isoPoint(x, y, z);
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={r * HALF_W}
      ry={r * HALF_H}
      fill={fill ?? tone.top}
      stroke={tone.line}
      strokeWidth={0.9}
    />
  );
}

/**
 * 격자 위의 점들을 잇는 선 — 로봇 팔의 마디 · 배선 · 난간.
 *
 * 점을 `[x, y, z]` 로 받는다. 팔처럼 **높이가 계속 바뀌는 것**은 상자로 그릴 수 없다.
 */
export function IsoPolyline({
  points,
  color,
  width = 2,
  dashed = false,
}: {
  points: [number, number, number][];
  color: string;
  width?: number;
  dashed?: boolean;
}) {
  const d = points
    .map(([x, y, z], index) => {
      const [sx, sy] = isoPoint(x, y, z);
      return `${index === 0 ? 'M' : 'L'} ${sx} ${sy}`;
    })
    .join(' ');

  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dashed ? '3 4' : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/**
 * 세워 놓은 판 — 모니터 · 전광판 · 서류 한 장.
 *
 * 두께가 없다. 상자로 그리면 얇은 것을 표현하려고 깊이를 0.05 같은 값으로 두게 되는데, 그
 * 정도면 면이 선으로 뭉개져 상자를 그린 뜻이 없다.
 */
export function IsoPane({
  x,
  y,
  len,
  h,
  base = 0,
  axis = 'x',
  tone,
}: {
  x: number;
  y: number;
  /** 길이(격자 칸) */ len: number;
  /** 높이(화면 픽셀) */ h: number;
  /** 바닥에서 띄우는 높이 */ base?: number;
  /** 어느 축을 따라 서는가 */ axis?: 'x' | 'y';
  tone: IsoTone;
}) {
  const end: [number, number] = axis === 'x' ? [x + len, y] : [x, y + len];

  return (
    <polygon
      points={polygon([
        isoPoint(x, y, base),
        isoPoint(end[0], end[1], base),
        isoPoint(end[0], end[1], base + h),
        isoPoint(x, y, base + h),
      ])}
      fill={tone.right}
      stroke={tone.line}
      strokeWidth={0.9}
    />
  );
}

/**
 * 판의 뒤쪽 두 면에 세우는 낮은 벽.
 *
 * 이것이 있고 없고가 **떠 있는 판**과 **방 한 칸**을 가른다. 세트장에서 뒤 벽 두 개만 세우고
 * 앞을 터 두는 것과 같은 이유다 — 네 면을 다 세우면 안이 보이지 않는다.
 */
export function IsoWalls({ cx, cy, r, h, tone }: { cx: number; cy: number; r: number; h: number; tone: IsoTone }) {
  return (
    <g>
      <polygon
        points={polygon([
          isoPoint(cx - r, cy - r),
          isoPoint(cx + r, cy - r),
          isoPoint(cx + r, cy - r, h),
          isoPoint(cx - r, cy - r, h),
        ])}
        fill={tone.left}
        stroke={tone.line}
        strokeWidth={0.9}
      />
      <polygon
        points={polygon([
          isoPoint(cx - r, cy - r),
          isoPoint(cx - r, cy + r),
          isoPoint(cx - r, cy + r, h),
          isoPoint(cx - r, cy - r, h),
        ])}
        fill={tone.right}
        stroke={tone.line}
        strokeWidth={0.9}
      />
    </g>
  );
}
