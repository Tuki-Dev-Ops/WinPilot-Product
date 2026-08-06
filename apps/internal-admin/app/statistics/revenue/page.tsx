import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { InternalPanel, InternalSummary, InternalTableFoot, InternalTableHead } from '@/app/_components/InternalPanel';
import { MonthBars, ShareBars } from '@/app/statistics/_components/MonthBars';
import {
  REVENUE_BY_KIND,
  REVENUE_BY_TENANT,
  REVENUE_MONTHS,
  changeRate,
  formatMoney,
} from '@/lib/data/statistics';
import { findTenant } from '@/lib/data/tenants';

/**
 * Feature: `tenant.revenue.list` · Internal Admin · route `/statistics/revenue`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 여기 매출은 **우리가 고객사에게 받는 돈**이다. B2C Admin 의 매출(고객사가 고객에게 파는 돈)과
 * 방향이 반대라 같은 말이라도 다른 자원이다.
 *
 * 읽기만 하는 화면이라 서버 컴포넌트로 둔다 — 고칠 값이 없으면 브라우저로 내려보낼 것도 없다.
 */
export const metadata: Metadata = {
  title: '통계 | 매출 — WinPilot Internal',
  robots: { index: false, follow: false },
};

const COLUMNS = [
  { label: '달', span: 'lg:col-span-3' },
  { label: '매출', span: 'lg:col-span-3 lg:text-right' },
  { label: '앞 달 대비', span: 'lg:col-span-3 lg:text-right' },
  { label: '청구 건수', span: 'lg:col-span-3 lg:text-right' },
];

export default function InternalRevenueListPage() {
  const months = [...REVENUE_MONTHS].reverse();
  const latest = REVENUE_MONTHS[REVENUE_MONTHS.length - 1];
  const previous = REVENUE_MONTHS[REVENUE_MONTHS.length - 2];
  const yearTotal = REVENUE_MONTHS.reduce((sum, point) => sum + point.amount, 0);
  const rate = latest && previous ? changeRate(latest.amount, previous.amount) : 0;

  return (
    <InternalShell sectionId="analytics" trail={['통계', '매출']} activeChildId="analytics-revenue">
      <InternalSummary
        cards={[
          { label: '최근 12개월', value: `${formatMoney(yearTotal)}원` },
          { label: '이번 달', value: `${formatMoney(latest?.amount ?? 0)}원`, hint: latest?.month },
          {
            label: '앞 달 대비',
            value: `${rate > 0 ? '+' : ''}${rate}%`,
            // 색만으로 알리지 않는다 — 부호를 함께 적는다.
            tone: rate < 0 ? 'text-signal-danger' : 'text-signal-ok',
          },
          { label: '월평균', value: `${formatMoney(Math.round(yearTotal / REVENUE_MONTHS.length))}원` },
        ]}
      />

      <InternalPanel
        title="월별 매출 추이"
        description="세로축은 항상 0부터 시작합니다. 최솟값을 기준으로 잡으면 작은 변동이 크게 보여 실제와 다른 추세로 읽힐 수 있습니다."
      >
        <MonthBars
          label="달별 매출"
          points={REVENUE_MONTHS.map((point) => ({ month: point.month, value: point.amount }))}
          format={(value) => `${formatMoney(value)}원`}
        />
      </InternalPanel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <InternalPanel
          title="매출 구성"
          description="매출을 유형별로 나눈 비중입니다. 유지보수·호스팅처럼 반복되는 매출의 비중이 낮을수록 다음 분기 실적을 신규 계약에 의존하게 됩니다."
        >
          <ShareBars
            rows={REVENUE_BY_KIND.map((row) => ({ label: row.kind, value: row.amount }))}
            format={(value) => `${formatMoney(value)}원`}
          />
        </InternalPanel>

        <InternalPanel
          title="고객사별 매출 비중"
          description="고객사가 전체 매출에서 차지하는 비중입니다. 상위 고객사의 비중이 높을수록 해당 고객사의 계약 종료가 전체 실적에 미치는 영향이 커집니다."
        >
          <ShareBars
            rows={REVENUE_BY_TENANT.map((row) => ({
              label: findTenant(row.tenantId)?.name ?? row.tenantId,
              value: row.amount,
              hint: row.tenantId,
            }))}
            format={(value) => `${formatMoney(value)}원`}
          />
        </InternalPanel>
      </div>

      <InternalPanel title="월별 상세 내역" description="위 차트와 동일한 데이터입니다. 수치를 그대로 옮겨야 할 때 이 표를 참고하세요.">
        <InternalTableHead columns={COLUMNS} />

        <div className="flex flex-col">
          {months.map((point, index) => {
            const before = months[index + 1];
            const change = before ? changeRate(point.amount, before.amount) : 0;
            return (
              <div
                key={point.month}
                className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-3 last:border-b-0 lg:grid-cols-12 lg:items-center lg:gap-y-0"
              >
                <span className="font-mono text-sm tabular-nums lg:col-span-3">{point.month}</span>

                <div className="flex items-baseline gap-2 lg:col-span-3 lg:justify-end">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">매출</span>
                  <span className="text-sm tabular-nums">{formatMoney(point.amount)}원</span>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-3 lg:justify-end">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">앞 달 대비</span>
                  <span
                    className={`text-sm tabular-nums ${
                      !before ? 'text-ink-faint' : change < 0 ? 'text-signal-danger' : 'text-signal-ok'
                    }`}
                  >
                    {before ? `${change > 0 ? '+' : ''}${change}%` : '—'}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-3 lg:justify-end">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">청구 건수</span>
                  <span className="text-sm tabular-nums text-ink-muted">{point.count}건</span>
                </div>
              </div>
            );
          })}
        </div>

        <InternalTableFoot>
          <p>
            총 <span className="font-medium tabular-nums text-ink">{months.length}</span>개월
          </p>
          <p>
            합계 <span className="font-medium tabular-nums text-ink">{formatMoney(yearTotal)}</span>원
          </p>
        </InternalTableFoot>
      </InternalPanel>
    </InternalShell>
  );
}
