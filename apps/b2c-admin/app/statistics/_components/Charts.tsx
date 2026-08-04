/**
 * 차트.
 *
 * **SVG 로 직접 그린다.** 차트 라이브러리 대부분이 canvas 로 그리는데, canvas 는 픽셀 덩어리라
 * 추출기가 이미지 한 장으로만 받아 Figma 에서 수정할 수 없다. SVG 요소는 실제 DOM 노드라
 * 벡터로 복원되고, 축 눈금·라벨도 텍스트 노드로 남는다 (docs/spec/05-component.md).
 *
 * 색은 토큰에서 가져온다 — 차트만 다른 파랑을 쓰기 시작하면 디자인 시스템이 갈라진다.
 */
export type SeriesPoint = { label: string; value: number };

const AXIS_COLOR = 'var(--color-border)';
const INK_FAINT = 'var(--color-ink-faint)';
const BRAND = 'var(--color-brand-500)';

function niceMax(values: readonly number[]): number {
  const max = Math.max(...values, 1);
  const magnitude = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / magnitude) * magnitude;
}

export type LineChartProps = {
  points: SeriesPoint[];
  /** 세로축 눈금에 붙는 단위 표기 함수 */
  formatTick: (value: number) => string;
  height?: number;
  ariaLabel: string;
};

/** 시간에 따른 변화 — 꺾은선. 하루하루의 값보다 흐름을 보는 자리다. */
export function LineChart({ points, formatTick, height = 200, ariaLabel }: LineChartProps) {
  const width = 640;
  const padding = { top: 12, right: 12, bottom: 28, left: 52 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const max = niceMax(points.map((point) => point.value));
  const stepX = points.length > 1 ? innerWidth / (points.length - 1) : 0;

  const coords = points.map((point, index) => ({
    x: padding.left + index * stepX,
    y: padding.top + innerHeight - (point.value / max) * innerHeight,
    point,
  }));

  const path = coords.map((coord, index) => `${index === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`).join(' ');
  const area = `${path} L ${padding.left + innerWidth} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      className="h-auto w-full"
      preserveAspectRatio="none"
    >
      {ticks.map((ratio) => {
        const y = padding.top + innerHeight - ratio * innerHeight;
        return (
          <g key={ratio}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke={AXIS_COLOR} strokeWidth="1" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill={INK_FAINT}>
              {formatTick(max * ratio)}
            </text>
          </g>
        );
      })}

      <path d={area} fill={BRAND} fillOpacity="0.08" />
      <path d={path} fill="none" stroke={BRAND} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {coords.map((coord) => (
        <circle key={coord.point.label} cx={coord.x} cy={coord.y} r="2.5" fill={BRAND} />
      ))}

      {/* 라벨이 겹치면 못 읽는다 — 개수에 따라 건너뛴다. */}
      {coords.map((coord, index) => {
        const every = Math.ceil(points.length / 7);
        if (index % every !== 0 && index !== points.length - 1) return null;
        return (
          <text
            key={`label-${coord.point.label}`}
            x={coord.x}
            y={height - 8}
            textAnchor="middle"
            fontSize="10"
            fill={INK_FAINT}
          >
            {coord.point.label}
          </text>
        );
      })}
    </svg>
  );
}

export type BarChartProps = {
  points: SeriesPoint[];
  formatValue: (value: number) => string;
  ariaLabel: string;
};

/** 항목끼리의 크기 비교 — 가로 막대. 이름이 길어도 잘리지 않는다. */
export function BarChart({ points, formatValue, ariaLabel }: BarChartProps) {
  const max = Math.max(...points.map((point) => point.value), 1);

  return (
    <div role="img" aria-label={ariaLabel} className="flex flex-col gap-3">
      {points.map((point) => (
        <div key={point.label} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-4">
            <span className="min-w-0 truncate text-sm">{point.label}</span>
            <span className="shrink-0 text-sm tabular-nums text-ink-muted">{formatValue(point.value)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${Math.max((point.value / max) * 100, 2)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export type DonutChartProps = {
  points: SeriesPoint[];
  ariaLabel: string;
};

/** 전체에서 차지하는 몫 — 도넛. 조각이 5개를 넘으면 읽히지 않으므로 그 이상은 막대를 쓴다. */
export function DonutChart({ points, ariaLabel }: DonutChartProps) {
  const total = points.reduce((sum, point) => sum + point.value, 0) || 1;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  // 토큰 색을 순서대로 돌려 쓴다 — 차트 전용 색을 새로 만들지 않는다.
  const tones = [
    'var(--color-brand-500)',
    'var(--color-brand-300)',
    'var(--color-ink-faint)',
    'var(--color-border-strong)',
    'var(--color-border)',
  ];

  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <svg viewBox="0 0 160 160" role="img" aria-label={ariaLabel} className="size-40 shrink-0">
        <g transform="rotate(-90 80 80)">
          {points.map((point, index) => {
            const length = (point.value / total) * circumference;
            const dash = `${length} ${circumference - length}`;
            const element = (
              <circle
                key={point.label}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={tones[index % tones.length]}
                strokeWidth="20"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return element;
          })}
        </g>
      </svg>

      <ul className="flex min-w-0 flex-1 flex-col gap-2">
        {points.map((point, index) => (
          <li key={point.label} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: tones[index % tones.length] }}
              />
              <span className="truncate text-sm">{point.label}</span>
            </span>
            <span className="shrink-0 text-sm tabular-nums text-ink-muted">
              {Math.round((point.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
