import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { InternalEmpty, InternalPanel } from '@/app/_components/InternalPanel';
import { INQUIRY_TONE, openInquiries } from '@/lib/data/inquiries';
import { daysFrom, formatAmount, INVOICES, outstanding, overdueInvoices } from '@/lib/data/invoices';
import { findTenant, SUPPORT_TONE, supportState, TENANTS, todayStamp } from '@/lib/data/tenants';
import { Badge } from '@winpilot/ui';

/**
 * Feature: `tenant.dashboard` · Internal Admin · route `/`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 대시보드가 갈래를 갖지 않는 이유: 여기서 정하는 값이 하나도 없다. **다른 화면이 만들어 낸
 * 신호를 모아 보내는 자리**이고, 그래서 카드마다 그 수치를 만든 조건이 걸린 목록으로 간다.
 * 수치와 목록이 다른 값을 말하면 그때부터 카드를 믿지 않게 된다.
 */
export const metadata: Metadata = {
  title: '대시보드 — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default function InternalTenantDashboardPage() {
  // 기준일은 서버에서 정한다 — 화면이 스스로 읽으면 서버·브라우저 값이 어긋난다.
  const today = todayStamp();

  const expiring = TENANTS.filter((tenant) => {
    const state = supportState(tenant.supportUntil, today);
    return state === '만료 임박' || state === '만료';
  });
  const overdue = overdueInvoices(today);
  const open = openInquiries();

  const cards = [
    { label: '고객사', value: `${TENANTS.length}곳`, href: '/tenants' },
    {
      label: '만료 임박',
      value: `${expiring.length}곳`,
      href: '/tenants',
      tone: expiring.length > 0 ? 'text-signal-danger' : '',
    },
    {
      label: '미수금',
      value: `${formatAmount(outstanding(INVOICES))}원`,
      href: '/billing/due',
    },
    {
      label: '연체',
      value: `${overdue.length}건`,
      href: '/billing/overdue',
      tone: overdue.length > 0 ? 'text-signal-danger' : '',
    },
  ];

  return (
    <InternalShell sectionId="dashboard" trail={['대시보드']}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/*
          볼 것이 없어도 카드를 숨기지 않고 0 을 적는다 — 사라진 카드는 값이 0 인지
          기능이 없어진 것인지 알 수 없다.
        */}
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="rounded-xl border border-border bg-canvas px-6 py-5 transition-colors duration-100 hover:border-border-strong"
          >
            <p className="text-xs uppercase tracking-widest text-ink-faint">{card.label}</p>
            <p className={`mt-2 text-lg font-semibold tabular-nums ${card.tone ?? ''}`}>{card.value}</p>
          </a>
        ))}
      </div>

      {/*
        먼저 봐야 할 것을 먼저 보여준다 — 유지보수가 끝나가는 고객사는 계약이 끊긴 뒤에
        알게 되면 되돌릴 수 없다.
      */}
      <InternalPanel
        title="유지보수 확인 필요"
        description="종료일이 30일 안으로 들어왔거나 이미 지난 고객사입니다."
      >
        {expiring.length === 0 ? (
          <InternalEmpty>확인이 필요한 고객사가 없습니다.</InternalEmpty>
        ) : (
          <div className="flex flex-col">
            {expiring.map((tenant) => {
              const state = supportState(tenant.supportUntil, today);
              return (
                <a
                  key={tenant.id}
                  href={`/tenants/${tenant.id}`}
                  className="group flex items-center justify-between gap-4 border-b border-border px-6 py-4 transition-colors duration-100 last:border-b-0 hover:bg-surface"
                >
                  <div className="min-w-0">
                    <p className="min-w-0 truncate text-sm font-medium">{tenant.name}</p>
                    <p className="min-w-0 truncate font-mono text-xs text-ink-faint">
                      {tenant.id} · {tenant.manager}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-xs tabular-nums text-ink-muted">{tenant.supportUntil}</span>
                    <Badge tone={SUPPORT_TONE[state]}>
                      {state}
                    </Badge>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </InternalPanel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <InternalPanel title="연체" description="기한이 지난 청구입니다. 오래된 것이 위에 옵니다.">
          {overdue.length === 0 ? (
            <InternalEmpty>연체된 건이 없습니다.</InternalEmpty>
          ) : (
            <div className="flex flex-col">
              {overdue.map((invoice) => (
                <a
                  key={invoice.id}
                  href="/billing/overdue"
                  className="group flex items-center justify-between gap-4 border-b border-border px-6 py-4 transition-colors duration-100 last:border-b-0 hover:bg-surface"
                >
                  <div className="min-w-0">
                    <p className="min-w-0 truncate text-sm font-medium">{findTenant(invoice.tenantId)?.name ?? '-'}</p>
                    <p className="min-w-0 truncate font-mono text-xs text-ink-faint">
                      {invoice.id} · {invoice.title}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm tabular-nums text-signal-danger">
                      {formatAmount(invoice.amount)}원
                    </span>
                    <span className="whitespace-nowrap font-mono text-xs tabular-nums text-ink-faint">
                      {daysFrom(invoice.dueAt, today)}일 지남
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </InternalPanel>

        <InternalPanel title="답하지 않은 문의" description="고객사가 우리에게 보낸 문의입니다.">
          {open.length === 0 ? (
            <InternalEmpty>답해야 할 문의가 없습니다.</InternalEmpty>
          ) : (
            <div className="flex flex-col">
              {open.map((inquiry) => (
                <a
                  key={inquiry.id}
                  href="/inquiries"
                  className="group flex items-center justify-between gap-4 border-b border-border px-6 py-4 transition-colors duration-100 last:border-b-0 hover:bg-surface"
                >
                  <div className="min-w-0">
                    <p className="min-w-0 truncate text-sm font-medium">
                      {inquiry.urgent && (
                        <span className="mr-1.5 shrink-0 whitespace-nowrap rounded-full bg-signal-danger/12 px-2 py-0.5 text-3xs font-medium text-signal-danger">
                          급함
                        </span>
                      )}
                      {inquiry.title}
                    </p>
                    <p className="min-w-0 truncate font-mono text-xs text-ink-faint">
                      {findTenant(inquiry.tenantId)?.name ?? inquiry.tenantId} · {inquiry.receivedAt}
                    </p>
                  </div>
                  <Badge tone={INQUIRY_TONE[inquiry.state]}>
                    {inquiry.state}
                  </Badge>
                </a>
              ))}
            </div>
          )}
        </InternalPanel>
      </div>
    </InternalShell>
  );
}
