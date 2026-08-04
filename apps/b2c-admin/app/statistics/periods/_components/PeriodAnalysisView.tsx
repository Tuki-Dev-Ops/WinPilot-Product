'use client';

import { useState } from 'react';
import {
  PERIODS,
  changeRate,
  formatAmount,
  formatRate,
  pointsFor,
  shortAmount,
  sum,
  type PeriodId,
} from '@/lib/data/analytics';
import { LineChart } from '@/app/statistics/_components/Charts';
import { StatCard, StatGrid, StatSection } from '@/app/statistics/_components/StatCard';

const METRICS = [
  { id: 'revenue', label: '매출', unit: '원', format: formatAmount, tick: shortAmount },
  { id: 'orders', label: '주문', unit: '건', format: (v: number) => `${v}`, tick: (v: number) => `${Math.round(v)}` },
  { id: 'visitors', label: '방문자', unit: '명', format: formatAmount, tick: shortAmount },
  { id: 'signups', label: '가입', unit: '명', format: (v: number) => `${v}`, tick: (v: number) => `${Math.round(v)}` },
] as const;

type MetricId = (typeof METRICS)[number]['id'];

/**
 * 기간별 분석.
 *
 * 지표를 한 화면에 다 겹쳐 그리면 축 단위가 달라 아무것도 읽히지 않는다(매출은 천만, 가입은 수십).
 * 그래서 **지표 하나를 골라 크게 보는** 방식으로 둔다.
 *
 * 증감은 **같은 길이의 직전 구간**과 비교한다 — 7일을 30일과 비교하면 늘 늘어난 것처럼 보인다.
 */
export function PeriodAnalysisView() {
  const [periodId, setPeriodId] = useState<PeriodId>('7d');
  const [metricId, setMetricId] = useState<MetricId>('revenue');

  const points = pointsFor(periodId);
  const metric = METRICS.find((item) => item.id === metricId) ?? METRICS[0];

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="기간 선택" className="flex flex-wrap items-center gap-2">
          {PERIODS.map((period) => (
            <button
              key={period.id}
              type="button"
              role="tab"
              aria-selected={period.id === periodId}
              onClick={() => setPeriodId(period.id)}
              className={`h-9 shrink-0 whitespace-nowrap rounded-lg border px-3 text-sm transition-colors duration-150 ${
                period.id === periodId
                  ? 'border-brand-500 bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                  : 'border-border-strong text-ink-muted hover:border-ink-faint'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        <div role="tablist" aria-label="지표 선택" className="flex flex-wrap items-center gap-2">
          {METRICS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === metricId}
              onClick={() => setMetricId(item.id)}
              className={`h-9 shrink-0 whitespace-nowrap rounded-lg px-3 text-sm transition-colors duration-150 ${
                item.id === metricId
                  ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                  : 'bg-surface text-ink-muted'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <StatGrid>
        {METRICS.map((item) => (
          <StatCard
            key={item.id}
            label={item.label}
            value={`${item.format(sum(points, item.id))}${item.unit}`}
            change={changeRate(periodId, item.id)}
          />
        ))}
      </StatGrid>

      <StatSection title={`${metric.label} 추이`}>
        <LineChart
          points={points.map((point) => ({ label: point.date.slice(5), value: point[metric.id] }))}
          formatTick={metric.tick}
          height={260}
          ariaLabel={`${metric.label} 추이`}
        />
      </StatSection>

      <StatSection title="일자별 상세">
        <div className="overflow-x-auto">
          <div className="min-w-140">
            <div className="grid grid-cols-5 gap-4 border-b border-border pb-3 text-xs text-ink-faint">
              <span>날짜</span>
              <span className="text-right">매출</span>
              <span className="text-right">주문</span>
              <span className="text-right">방문자</span>
              <span className="text-right">가입</span>
            </div>

            {[...points].reverse().map((point) => (
              <div key={point.date} className="grid grid-cols-5 gap-4 border-b border-border py-3 last:border-b-0">
                <span className="font-mono text-xs tabular-nums text-ink-muted">{point.date}</span>
                <span className="text-right text-sm tabular-nums">{formatAmount(point.revenue)}원</span>
                <span className="text-right text-sm tabular-nums text-ink-muted">{point.orders}</span>
                <span className="text-right text-sm tabular-nums text-ink-muted">
                  {formatAmount(point.visitors)}
                </span>
                <span className="text-right text-sm tabular-nums text-ink-muted">{point.signups}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-faint">
          증감은 같은 길이의 직전 구간과 비교합니다 — 현재 {metric.label} {formatRate(changeRate(periodId, metric.id))}.
        </p>
      </StatSection>
    </>
  );
}
