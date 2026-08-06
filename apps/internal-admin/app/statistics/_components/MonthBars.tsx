import { ratioOf } from '@/lib/data/statistics';

/**
 * 달별 막대 — **인라인 SVG**.
 *
 * 비트맵으로 두면 Figma 에서 벡터로 복원되지 않는다. 차트 라이브러리를 쓰지 않는 이유도
 * 같다 — 대부분 캔버스로 그려서 추출기에 상자 하나로만 잡힌다.
 *
 * 바닥은 언제나 0 이다. 최솟값을 바닥으로 잡으면 작은 차이가 커 보여 없는 추세를 읽는다.
 */
export function MonthBars({
  points,
  format,
  label,
}: {
  points: Array<{ month: string; value: number }>;
  /** 값을 사람이 읽는 말로 — 금액과 사람 수의 단위가 다르다 */
  format: (value: number) => string;
  /** 스크린리더가 읽는 도면 이름 */
  label: string;
}) {
  const values = points.map((point) => point.value);
  const max = Math.max(...values, 1);

  const width = 720;
  const height = 200;
  const gap = 8;
  const barWidth = (width - gap * (points.length - 1)) / points.length;

  return (
    <div className="min-w-0 overflow-x-auto px-6 py-5">
      <svg
        viewBox={`0 0 ${width} ${height + 28}`}
        role="img"
        aria-label={`${label} — 최근 ${points.length}개월. 가장 큰 값 ${format(max)}.`}
        className="h-52 w-full min-w-160"
      >
        {/* 눈금 세 줄. 값을 읽을 기준이 없으면 막대 높이가 아무 뜻도 갖지 않는다. */}
        {[0.25, 0.5, 0.75, 1].map((step) => (
          <line
            key={step}
            x1={0}
            x2={width}
            y1={height - height * step}
            y2={height - height * step}
            className="stroke-border"
            strokeWidth={1}
          />
        ))}

        {points.map((point, index) => {
          const barHeight = Math.max(ratioOf(point.value, values) * height, 2);
          const x = index * (barWidth + gap);
          return (
            <g key={point.month}>
              <rect
                x={x}
                y={height - barHeight}
                width={barWidth}
                height={barHeight}
                rx={3}
                className="fill-brand-500"
              />
              {/* 달 이름은 두 칸에 하나만 적는다 — 열두 칸에 다 적으면 글자가 겹친다. */}
              {index % 2 === 0 && (
                <text
                  x={x + barWidth / 2}
                  y={height + 18}
                  textAnchor="middle"
                  className="fill-ink-faint text-2xs"
                >
                  {point.month.slice(2)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * 무엇이 얼마를 차지하는지 — 가로 막대.
 *
 * 원 그래프를 쓰지 않는 이유: 조각이 넷을 넘으면 각도로는 크기를 비교하지 못한다. 가로 막대는
 * 길이만 보면 되고, 이름을 옆에 그대로 적을 수 있다.
 */
export function ShareBars({
  rows,
  format,
}: {
  rows: Array<{ label: string; value: number; hint?: string }>;
  format: (value: number) => string;
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;

  return (
    <div className="flex flex-col gap-4 px-6 py-5">
      {rows.map((row) => {
        const share = Math.round((row.value / total) * 1000) / 10;
        return (
          <div key={row.label} className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="min-w-0 truncate text-sm">
                {row.label}
                {row.hint && <span className="ml-1.5 font-mono text-xs text-ink-faint">{row.hint}</span>}
              </span>
              <span className="shrink-0 text-sm tabular-nums text-ink-muted">
                {format(row.value)} · {share}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${share}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
