import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternalShell } from '@/app/_components/InternalShell';
import { formatAmount, invoicesOf, outstanding, INVOICE_TONE } from '@/lib/data/invoices';
import {
  DEPLOYMENT_TONE,
  PLAN_TONE,
  SUPPORT_TONE,
  TENANTS,
  findTenant,
  supportState,
  todayStamp,
} from '@/lib/data/tenants';

/**
 * Feature: `tenant.detail` · Internal Admin · route `/tenants/{tenantId}`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '고객사 | 상세 — WinPilot Internal',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 시드 고객사만 존재하므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return TENANTS.map((tenant) => ({ tenantId: tenant.id }));
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="w-28 shrink-0 text-xs text-ink-faint">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm leading-relaxed">{children}</dd>
    </div>
  );
}

export default async function InternalTenantDetailPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const tenant = findTenant(tenantId);
  if (!tenant) notFound();

  const today = todayStamp();
  const state = supportState(tenant.supportUntil, today);
  const invoices = invoicesOf(tenant.id);

  return (
    <InternalShell sectionId="tenant" trail={['고객사', '목록', tenant.name]} activeChildId="tenant-list">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <section className="rounded-xl border border-border bg-canvas">
            <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold tracking-tight">고객사 정보</h2>
              <span
                className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${PLAN_TONE[tenant.plan]}`}
              >
                {tenant.plan}
              </span>
            </div>
            <dl className="flex flex-col gap-4 px-6 py-5">
              <Row label="고객사명">{tenant.name}</Row>
              <Row label="고객사 코드">
                <span className="font-mono text-xs">{tenant.id}</span>
              </Row>
              <Row label="담당자">{tenant.manager}</Row>
              <Row label="이메일">
                <span className="font-mono text-xs">{tenant.managerEmail}</span>
              </Row>
              <Row label="연락처">
                <span className="font-mono text-xs tabular-nums">{tenant.managerPhone}</span>
              </Row>
              <Row label="계약일">
                <span className="font-mono text-xs tabular-nums text-ink-muted">{tenant.contractedAt}</span>
              </Row>
              <Row label="메모">
                <span className={tenant.memo ? '' : 'text-ink-faint'}>{tenant.memo || '없음'}</span>
              </Row>
            </dl>
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-canvas">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold tracking-tight">배포 · 계정</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                고객사 하나가 보통 Client 와 Admin 두 배포를 씁니다.
              </p>
            </div>
            <div className="flex flex-col">
              {tenant.deployments.map((deployment) => (
                <div
                  key={deployment.kind}
                  className="flex flex-col gap-2 border-b border-border px-6 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{deployment.kind}</p>
                    <p className="truncate font-mono text-xs text-ink-muted">{deployment.domain}</p>
                    <p className="truncate font-mono text-xs text-ink-faint">{deployment.account}</p>
                  </div>
                  <span
                    className={`w-fit shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${DEPLOYMENT_TONE[deployment.status]}`}
                  >
                    {deployment.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-canvas">
            <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold tracking-tight">구매 · 유지보수</h2>
              <span className="shrink-0 whitespace-nowrap text-sm text-ink-muted">
                미수금 <span className="font-medium tabular-nums text-ink">{formatAmount(outstanding(invoices))}</span>원
              </span>
            </div>

            {invoices.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-ink-muted">등록된 내역이 없습니다.</p>
            ) : (
              <div className="flex flex-col">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between gap-4 border-b border-border px-6 py-4 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm">{invoice.title}</p>
                      <p className="truncate font-mono text-xs text-ink-faint">
                        {invoice.id} · {invoice.kind} · 기한 {invoice.dueAt}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm tabular-nums">{formatAmount(invoice.amount)}원</span>
                      <span
                        className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${INVOICE_TONE[invoice.state]}`}
                      >
                        {invoice.state}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-6 xl:w-80">
          <section className="rounded-xl border border-border bg-canvas px-6 py-5">
            <h2 className="text-base font-semibold tracking-tight">유지보수</h2>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span
                className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${SUPPORT_TONE[state]}`}
              >
                {state}
              </span>
              <span className="font-mono text-xs tabular-nums text-ink-muted">
                {tenant.supportUntil || '기한 없음'}
              </span>
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-border bg-canvas px-6 py-6">
            <h2 className="text-base font-semibold tracking-tight">연동 설정</h2>
            <a
              href={`/integrations/oauth?tenant=${tenant.id}`}
              className="flex h-11 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-border-strong text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint"
            >
              OAuth 정보
            </a>
            <a
              href={`/integrations/payment?tenant=${tenant.id}`}
              className="flex h-11 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-border-strong text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint"
            >
              PG 정보
            </a>
            <a
              href="/tenants"
              className="flex h-11 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-border-strong text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint"
            >
              목록으로
            </a>
          </section>
        </aside>
      </div>
    </InternalShell>
  );
}
