import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import {
  CATEGORY_REVENUE,
  changeRate,
  formatAmount,
  pointsFor,
  shortAmount,
  sum,
} from '@/lib/data/analytics';
import { PRODUCTS } from '@/lib/data/products';
import { parseAmount } from '@/lib/validation/product-record';
import { BarChart, DonutChart, LineChart } from '@/app/statistics/_components/Charts';
import { StatCard, StatGrid, StatSection } from '@/app/statistics/_components/StatCard';

/**
 * Feature: `revenue.list` · B2C Admin · route `/statistics/revenue`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '통계 | 매출 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminRevenueListPage() {
  const points = pointsFor('14d');
  const revenue = sum(points, 'revenue');
  const orders = sum(points, 'orders');

  // 상품별 매출은 상품 시드의 판매가 × 누적 판매량에서 만든다 — 목록과 숫자가 어긋나지 않는다.
  const byProduct = [...PRODUCTS]
    .map((product) => ({
      label: product.name,
      value: parseAmount(product.price) * product.salesCount,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <AdminShell sectionId="analytics" trail={['통계', '매출']} activeChildId="analytics-revenue">
      <StatGrid>
        <StatCard label="최근 14일 매출" value={`${formatAmount(revenue)}원`} change={changeRate('14d', 'revenue')} />
        <StatCard label="최근 14일 주문" value={`${orders}건`} change={changeRate('14d', 'orders')} />
        <StatCard
          label="객단가"
          value={`${formatAmount(orders > 0 ? Math.round(revenue / orders) : 0)}원`}
          hint="매출 ÷ 주문"
        />
        <StatCard
          label="방문자당 매출"
          value={`${formatAmount(Math.round(revenue / Math.max(sum(points, 'visitors'), 1)))}원`}
          hint="매출 ÷ 방문자"
        />
      </StatGrid>

      <StatSection title="매출 추이">
        <LineChart
          points={points.map((point) => ({ label: point.date.slice(5), value: point.revenue }))}
          formatTick={shortAmount}
          height={260}
          ariaLabel="최근 14일 매출 추이"
        />
      </StatSection>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <StatSection title="카테고리별 매출">
          <DonutChart
            points={CATEGORY_REVENUE.map((row) => ({ label: row.name, value: row.revenue }))}
            ariaLabel="카테고리별 매출 비중"
          />
        </StatSection>

        <StatSection
          title="상품별 매출"
          action={
            <a href="/products" className="shrink-0 whitespace-nowrap text-sm text-brand-700 dark:text-brand-300">
              상품 목록
            </a>
          }
        >
          <BarChart
            points={byProduct}
            formatValue={(value) => `${formatAmount(value)}원`}
            ariaLabel="상품별 매출"
          />
        </StatSection>
      </div>

      <StatSection title="카테고리 상세">
        <div className="flex flex-col">
          <div className="grid grid-cols-4 gap-4 border-b border-border pb-3 text-xs text-ink-faint">
            <span>카테고리</span>
            <span className="text-right">매출</span>
            <span className="text-right">주문</span>
            <span className="text-right">객단가</span>
          </div>

          {CATEGORY_REVENUE.map((row) => (
            <div key={row.name} className="grid grid-cols-4 gap-4 border-b border-border py-3 last:border-b-0">
              <span className="min-w-0 truncate text-sm font-medium">{row.name}</span>
              <span className="text-right text-sm tabular-nums">{formatAmount(row.revenue)}원</span>
              <span className="text-right text-sm tabular-nums text-ink-muted">{row.orders}</span>
              <span className="text-right text-sm tabular-nums text-ink-muted">
                {formatAmount(Math.round(row.revenue / Math.max(row.orders, 1)))}원
              </span>
            </div>
          ))}
        </div>
      </StatSection>
    </AdminShell>
  );
}
