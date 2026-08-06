import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { PAGE_VIEWS, formatAmount } from '@/lib/data/analytics';
import { BarChart } from '@/app/statistics/_components/Charts';
import { StatSection } from '@/app/statistics/_components/StatCard';

/**
 * Feature: `pageview.list` · B2C Admin · route `/statistics/pages`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '통계 | 많이 방문한 페이지 — WinPilot Admin',
  robots: { index: false, follow: false },
};

function seconds(value: number): string {
  const minutes = Math.floor(value / 60);
  const rest = value % 60;
  return minutes > 0 ? `${minutes}분 ${rest}초` : `${rest}초`;
}

export default function AdminPageviewListPage() {
  const total = PAGE_VIEWS.reduce((sum, page) => sum + page.views, 0);

  return (
    <AdminShell sectionId="analytics" trail={['통계', '많이 방문한 페이지']} activeChildId="analytics-pages">
      <StatSection title="조회수">
        <BarChart
          points={PAGE_VIEWS.map((page) => ({ label: page.label, value: page.views }))}
          formatValue={(value) => `${formatAmount(value)}회`}
          ariaLabel="페이지별 조회수"
        />
      </StatSection>

      <section className="overflow-hidden rounded-xl border border-border bg-canvas">
        <div className="hidden gap-4 border-b border-border px-5 py-3 text-xs text-ink-faint lg:grid lg:grid-cols-12 lg:items-center">
          <span className="lg:col-span-1 lg:text-center">순번</span>
          <span className="lg:col-span-4">페이지</span>
          <span className="lg:col-span-2 lg:text-right">조회수</span>
          <span className="lg:col-span-2 lg:text-right">비중</span>
          <span className="lg:col-span-1 lg:text-right">체류</span>
          <span className="lg:col-span-2 lg:text-right">이탈률</span>
        </div>

        <div className="flex flex-col">
          {PAGE_VIEWS.map((page, index) => (
            <div
              key={page.path}
              className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 last:border-b-0 lg:grid-cols-12 lg:items-center lg:gap-y-0"
            >
              <span className="font-mono text-sm tabular-nums text-ink-faint lg:col-span-1 lg:text-center">
                {index + 1}
              </span>

              <div className="min-w-0 lg:col-span-4">
                <p className="min-w-0 truncate text-sm font-medium">{page.label}</p>
                <p className="min-w-0 truncate font-mono text-xs text-ink-faint">{page.path}</p>
              </div>

              <div className="flex items-baseline gap-2 lg:col-span-2 lg:justify-end">
                <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">조회수</span>
                <span className="text-sm tabular-nums">{formatAmount(page.views)}</span>
              </div>

              <div className="flex items-baseline gap-2 lg:col-span-2 lg:justify-end">
                <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">비중</span>
                <span className="text-sm tabular-nums text-ink-muted">
                  {((page.views / total) * 100).toFixed(1)}%
                </span>
              </div>

              <div className="flex items-baseline gap-2 lg:col-span-1 lg:justify-end">
                <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">체류</span>
                <span className="whitespace-nowrap text-sm tabular-nums text-ink-muted">
                  {seconds(page.avgSeconds)}
                </span>
              </div>

              {/*
                이탈률은 높다고 무조건 나쁘지 않다 — 공지사항처럼 한 장 읽고 나가는 것이
                정상인 화면이 있다. 그래서 색으로 좋고 나쁨을 표시하지 않는다.
              */}
              <div className="flex items-baseline gap-2 lg:col-span-2 lg:justify-end">
                <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">이탈률</span>
                <span className="text-sm tabular-nums text-ink-muted">
                  {(page.bounceRate * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-4">
          <p className="text-sm text-ink-muted">
            총 <span className="font-medium tabular-nums text-ink">{PAGE_VIEWS.length}</span>개 페이지
          </p>
          <p className="text-sm text-ink-muted">
            합계 <span className="font-medium tabular-nums text-ink">{formatAmount(total)}</span>회
          </p>
        </div>
      </section>
    </AdminShell>
  );
}
