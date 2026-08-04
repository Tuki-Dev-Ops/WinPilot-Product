import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import {
  CHANNELS,
  DAILY,
  PAGE_VIEWS,
  changeRate,
  formatAmount,
  pointsFor,
  shortAmount,
  sum,
} from '@/lib/data/analytics';
import { BarChart, DonutChart, LineChart } from './_components/Charts';
import { StatCard, StatGrid, StatSection } from './_components/StatCard';

/**
 * Feature: `analytics.home` · B2C Admin · route `/statistics`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '통계 | 홈 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminAnalyticsHomePage() {
  const points = pointsFor('7d');
  const last = DAILY[DAILY.length - 1];

  return (
    <AdminShell sectionId="analytics" trail={['통계', '홈']} activeChildId="analytics-home">
      <StatGrid>
        <StatCard
          label="최근 7일 매출"
          value={`${formatAmount(sum(points, 'revenue'))}원`}
          change={changeRate('7d', 'revenue')}
        />
        <StatCard label="최근 7일 주문" value={`${sum(points, 'orders')}건`} change={changeRate('7d', 'orders')} />
        <StatCard
          label="최근 7일 방문자"
          value={`${formatAmount(sum(points, 'visitors'))}명`}
          change={changeRate('7d', 'visitors')}
        />
        <StatCard
          label="최근 7일 가입"
          value={`${sum(points, 'signups')}명`}
          change={changeRate('7d', 'signups')}
        />
      </StatGrid>

      <StatSection
        title="매출 추이"
        action={
          <a href="/statistics/periods" className="shrink-0 whitespace-nowrap text-sm text-brand-700 dark:text-brand-300">
            기간별 분석
          </a>
        }
      >
        <LineChart
          points={points.map((point) => ({ label: point.date.slice(5), value: point.revenue }))}
          formatTick={shortAmount}
          ariaLabel="최근 7일 매출 추이"
        />
      </StatSection>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <StatSection
          title="많이 방문한 페이지"
          action={
            <a href="/statistics/pages" className="shrink-0 whitespace-nowrap text-sm text-brand-700 dark:text-brand-300">
              전체 보기
            </a>
          }
        >
          <BarChart
            points={PAGE_VIEWS.slice(0, 5).map((page) => ({ label: page.label, value: page.views }))}
            formatValue={(value) => `${formatAmount(value)}회`}
            ariaLabel="많이 방문한 페이지"
          />
        </StatSection>

        <StatSection title="유입 채널">
          <DonutChart
            points={CHANNELS.map((channel) => ({ label: channel.name, value: channel.visitors }))}
            ariaLabel="유입 채널 비중"
          />
        </StatSection>
      </div>

      <StatSection title="어제 요약">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: '주문', value: `${last?.orders ?? 0}건` },
            { label: '매출', value: `${formatAmount(last?.revenue ?? 0)}원` },
            { label: '방문자', value: `${formatAmount(last?.visitors ?? 0)}명` },
            { label: '가입', value: `${last?.signups ?? 0}명` },
          ].map((row) => (
            <div key={row.label} className="flex flex-col gap-1">
              <dt className="text-xs text-ink-faint">{row.label}</dt>
              <dd className="text-sm font-medium tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>
      </StatSection>
    </AdminShell>
  );
}
