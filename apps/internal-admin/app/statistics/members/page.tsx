import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { InternalPanel, InternalSummary, InternalTableFoot, InternalTableHead } from '@/app/_components/InternalPanel';
import { MonthBars } from '@/app/statistics/_components/MonthBars';
import { MEMBERS_BY_TENANT, MEMBER_MONTHS, changeRate, formatPeople } from '@/lib/data/statistics';
import { findTenant } from '@/lib/data/tenants';

/**
 * Feature: `tenant.user.list` · Internal Admin · route `/statistics/members`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 고객사 사이트에 가입한 사람의 **수**만 본다. 이름·이메일 같은 값을 두지 않는 이유는
 * 우리가 개인을 들여다볼 자리가 아니기 때문이다 — 없는 값은 새어 나갈 수도 없다.
 *
 * 읽기만 하는 화면이라 서버 컴포넌트로 둔다.
 */
export const metadata: Metadata = {
  title: '통계 | 회원 — WinPilot Internal',
  robots: { index: false, follow: false },
};

const COLUMNS = [
  { label: '달', span: 'lg:col-span-3' },
  { label: '누적', span: 'lg:col-span-3 lg:text-right' },
  { label: '가입', span: 'lg:col-span-2 lg:text-right' },
  { label: '탈퇴', span: 'lg:col-span-2 lg:text-right' },
  { label: '순증', span: 'lg:col-span-2 lg:text-right' },
];

export default function InternalUserListPage() {
  const months = [...MEMBER_MONTHS].reverse();
  const latest = MEMBER_MONTHS[MEMBER_MONTHS.length - 1];
  const previous = MEMBER_MONTHS[MEMBER_MONTHS.length - 2];
  const rate = latest && previous ? changeRate(latest.total, previous.total) : 0;

  // 상한의 90% 를 넘긴 고객사는 다음 계약에서 플랜을 올려야 한다 — 넘긴 뒤에 알면 늦다.
  const nearLimit = MEMBERS_BY_TENANT.filter((row) => row.members / row.limit >= 0.9);

  return (
    <InternalShell sectionId="analytics" trail={['통계', '회원']} activeChildId="analytics-member">
      <InternalSummary
        cards={[
          { label: '누적 회원', value: `${formatPeople(latest?.total ?? 0)}명`, hint: latest?.month },
          { label: '이번 달 가입', value: `${formatPeople(latest?.joined ?? 0)}명` },
          {
            label: '앞 달 대비',
            value: `${rate > 0 ? '+' : ''}${rate}%`,
            tone: rate < 0 ? 'text-signal-danger' : 'text-signal-ok',
          },
          {
            label: '상한에 가까운 고객사',
            value: `${nearLimit.length}곳`,
            tone: nearLimit.length > 0 ? 'text-signal-danger' : '',
            hint: '플랜 상한의 90% 를 넘겼습니다.',
          },
        ]}
      />

      <InternalPanel
        title="달별 누적 회원"
        description="모든 고객사의 합계입니다. 고객사 하나하나의 규모는 아래 표에서 봅니다."
      >
        <MonthBars
          label="달별 누적 회원"
          points={MEMBER_MONTHS.map((point) => ({ month: point.month, value: point.total }))}
          format={(value) => `${formatPeople(value)}명`}
        />
      </InternalPanel>

      <InternalPanel
        title="고객사별 규모"
        description="플랜 상한에 얼마나 가까운지가 다음 계약의 근거가 됩니다."
      >
        <div className="flex flex-col gap-4 px-6 py-5">
          {MEMBERS_BY_TENANT.map((row) => {
            const share = Math.round((row.members / row.limit) * 1000) / 10;
            const tight = share >= 90;
            return (
              <div key={row.tenantId} className="flex min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate text-sm">
                    {findTenant(row.tenantId)?.name ?? row.tenantId}
                    <span className="ml-1.5 font-mono text-xs text-ink-faint">{row.tenantId}</span>
                  </span>
                  <span className={`shrink-0 text-sm tabular-nums ${tight ? 'text-signal-danger' : 'text-ink-muted'}`}>
                    {formatPeople(row.members)} / {formatPeople(row.limit)}명 · {share}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                  <div
                    className={`h-full rounded-full ${tight ? 'bg-signal-danger' : 'bg-brand-500'}`}
                    style={{ width: `${Math.min(share, 100)}%` }}
                  />
                </div>
                {tight && (
                  <p className="text-xs leading-relaxed text-signal-danger">
                    상한이 얼마 남지 않았습니다. 넘기면 새 가입이 막히므로 플랜을 올려야 합니다.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </InternalPanel>

      <InternalPanel title="달별 내역" description="차트와 같은 값입니다 — 옮겨 적을 때는 이 표를 봅니다.">
        <InternalTableHead columns={COLUMNS} />

        <div className="flex flex-col">
          {months.map((point) => (
            <div
              key={point.month}
              className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-3 last:border-b-0 lg:grid-cols-12 lg:items-center lg:gap-y-0"
            >
              <span className="font-mono text-sm tabular-nums lg:col-span-3">{point.month}</span>

              <div className="flex items-baseline gap-2 lg:col-span-3 lg:justify-end">
                <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">누적</span>
                <span className="text-sm tabular-nums">{formatPeople(point.total)}명</span>
              </div>

              <div className="flex items-baseline gap-2 lg:col-span-2 lg:justify-end">
                <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">가입</span>
                <span className="text-sm tabular-nums text-ink-muted">+{formatPeople(point.joined)}</span>
              </div>

              <div className="flex items-baseline gap-2 lg:col-span-2 lg:justify-end">
                <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">탈퇴</span>
                <span className="text-sm tabular-nums text-ink-muted">-{formatPeople(point.left)}</span>
              </div>

              <div className="flex items-baseline gap-2 lg:col-span-2 lg:justify-end">
                <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">순증</span>
                <span className="text-sm tabular-nums">{formatPeople(point.joined - point.left)}명</span>
              </div>
            </div>
          ))}
        </div>

        <InternalTableFoot>
          <p>
            총 <span className="font-medium tabular-nums text-ink">{months.length}</span>개월
          </p>
          <p>
            누적 <span className="font-medium tabular-nums text-ink">{formatPeople(latest?.total ?? 0)}</span>명
          </p>
        </InternalTableFoot>
      </InternalPanel>
    </InternalShell>
  );
}
