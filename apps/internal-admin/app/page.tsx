import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { INVOICES, formatAmount, outstanding } from '@/lib/data/invoices';
import { SUPPORT_TONE, TENANTS, supportState, todayStamp } from '@/lib/data/tenants';

/**
 * Feature: `tenant.dashboard` · Internal Admin · route `/`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
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
  const overdue = INVOICES.filter((invoice) => invoice.state === '연체');

  return (
    <InternalShell sectionId="dashboard" trail={['대시보드']}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: '고객사', value: `${TENANTS.length}개` },
          { label: '운영 중 배포', value: `${TENANTS.flatMap((t) => t.deployments).filter((d) => d.status === '운영중').length}개` },
          { label: '미수금', value: `${formatAmount(outstanding(INVOICES))}원` },
          { label: '연체', value: `${overdue.length}건` },
        ].map((card) => (
          <section key={card.label} className="rounded-xl border border-border bg-canvas px-6 py-5">
            <p className="text-xs uppercase tracking-widest text-ink-faint">{card.label}</p>
            <p className="mt-2 text-lg font-semibold tabular-nums">{card.value}</p>
          </section>
        ))}
      </div>

      {/*
        먼저 봐야 할 것을 먼저 보여준다 — 유지보수가 끝나가는 고객사는 계약이 끊긴 뒤에
        알게 되면 되돌릴 수 없다.
      */}
      <section className="overflow-hidden rounded-xl border border-border bg-canvas">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold tracking-tight">유지보수 확인 필요</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            종료일이 30일 안으로 들어왔거나 이미 지난 고객사입니다.
          </p>
        </div>

        {expiring.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-ink-muted">확인이 필요한 고객사가 없습니다.</p>
        ) : (
          <div className="flex flex-col">
            {expiring.map((tenant) => {
              const state = supportState(tenant.supportUntil, today);
              return (
                <a
                  key={tenant.id}
                  href={`/tenants/${tenant.id}`}
                  className="flex items-center justify-between gap-4 border-b border-border px-6 py-4 transition-colors duration-100 last:border-b-0 hover:bg-surface"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{tenant.name}</p>
                    <p className="truncate font-mono text-xs text-ink-faint">
                      {tenant.id} · {tenant.manager}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-xs tabular-nums text-ink-muted">{tenant.supportUntil}</span>
                    <span
                      className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${SUPPORT_TONE[state]}`}
                    >
                      {state}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>
    </InternalShell>
  );
}
