'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, type MouseEvent } from 'react';
import { useToast } from '@winpilot/ui';
import {
  DEPLOYMENT_TONE,
  PLAN_TONE,
  SUPPORT_TONE,
  TENANTS,
  TENANT_PLANS,
  supportState,
  type TenantRecord,
} from '@/lib/data/tenants';

const ACTION_BUTTON = 'h-8 shrink-0 whitespace-nowrap rounded-lg border px-3 text-sm transition-colors duration-150';

/** 행 클릭으로 상세로 이동하므로, 행 안의 컨트롤은 자기 동작만 하도록 전파를 끊는다. */
const stopRowClick = (event: MouseEvent) => event.stopPropagation();

/**
 * 고객사 목록.
 *
 * 여기서 가장 중요한 것은 **유지보수 만료**다. 끝난 뒤에 알면 이미 늦으므로
 * 30일 안으로 들어온 고객사를 '만료 임박' 으로 따로 표시하고 맨 위로 올린다.
 */
export function TenantListView({ today }: { today: string }) {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState<string>('all');

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return TENANTS.filter((tenant) => {
      if (plan !== 'all' && tenant.plan !== plan) return false;
      if (!keyword) return true;
      return (
        tenant.name.toLowerCase().includes(keyword) ||
        tenant.manager.toLowerCase().includes(keyword) ||
        tenant.id.toLowerCase().includes(keyword) ||
        tenant.deployments.some((deployment) => deployment.domain.toLowerCase().includes(keyword))
      );
    }).sort((a, b) => {
      // 만료가 가까운 순 — 계약이 끝나가는 고객사가 목록 맨 위에 있어야 한다.
      const order = { 만료: 0, '만료 임박': 1, 유효: 2, '기한 없음': 3 } as const;
      return order[supportState(a.supportUntil, today)] - order[supportState(b.supportUntil, today)];
    });
  }, [search, plan, today]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex min-w-0 flex-1 items-center">
          <input
            id="tenant-search"
            type="search"
            aria-label="고객사 검색"
            placeholder=" "
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="peer h-9 w-full min-w-0 rounded-lg border border-border-strong bg-canvas px-3 text-sm text-ink"
          />
          <span className="pointer-events-none absolute left-3 text-sm text-ink-faint peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden">
            고객사명, 담당자, 도메인으로 검색
          </span>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {['all', ...TENANT_PLANS].map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={plan === option}
              onClick={() => setPlan(option)}
              className={`h-9 shrink-0 whitespace-nowrap rounded-lg border px-3 text-sm transition-colors duration-150 ${
                plan === option
                  ? 'border-brand-500 bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                  : 'border-border-strong text-ink-muted hover:border-ink-faint'
              }`}
            >
              {option === 'all' ? '전체' : option}
            </button>
          ))}
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-canvas">
        <div className="hidden gap-4 border-b border-border px-5 py-3 text-xs text-ink-faint lg:grid lg:grid-cols-12 lg:items-center">
          <span className="lg:col-span-1 lg:text-center">순번</span>
          <span className="lg:col-span-3">고객사 · 담당자</span>
          <span className="lg:col-span-3">배포 · 도메인</span>
          <span className="lg:col-span-1 lg:text-center">플랜</span>
          <span className="lg:col-span-2">유지보수</span>
          <span className="lg:col-span-2 lg:text-right">관리</span>
        </div>

        {visible.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-ink-muted">조건에 맞는 고객사가 없습니다.</p>
        ) : (
          <div className="flex flex-col">
            {visible.map((tenant: TenantRecord, index) => {
              const state = supportState(tenant.supportUntil, today);
              return (
                <div
                  key={tenant.id}
                  onClick={() => router.push(`/tenants/${tenant.id}`)}
                  className="grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 transition-colors duration-100 last:border-b-0 hover:bg-surface lg:grid-cols-12 lg:items-center lg:gap-y-0"
                >
                  <span className="font-mono text-sm tabular-nums text-ink-faint lg:col-span-1 lg:text-center">
                    {index + 1}
                  </span>

                  <div className="min-w-0 lg:col-span-3">
                    <p className="truncate text-sm font-medium">{tenant.name}</p>
                    <p className="truncate font-mono text-xs text-ink-faint">
                      {tenant.id} · {tenant.manager}
                    </p>
                  </div>

                  <div className="flex min-w-0 flex-col gap-1 lg:col-span-3">
                    {tenant.deployments.map((deployment) => (
                      <div key={deployment.kind} className="flex min-w-0 items-center gap-2">
                        <span
                          className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium ${DEPLOYMENT_TONE[deployment.status]}`}
                        >
                          {deployment.kind}
                        </span>
                        <span className="truncate font-mono text-xs text-ink-muted">{deployment.domain}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                    <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">플랜</span>
                    <span
                      className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${PLAN_TONE[tenant.plan]}`}
                    >
                      {tenant.plan}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 lg:col-span-2">
                    <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">유지보수</span>
                    <span
                      className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${SUPPORT_TONE[state]}`}
                    >
                      {state}
                    </span>
                    {tenant.supportUntil && (
                      <span className="font-mono text-xs tabular-nums text-ink-faint">{tenant.supportUntil}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 lg:col-span-2 lg:justify-end" onClick={stopRowClick}>
                    <button
                      type="button"
                      onClick={() => router.push(`/tenants/${tenant.id}`)}
                      className={`${ACTION_BUTTON} border-border-strong text-ink-muted hover:border-ink-faint`}
                    >
                      상세
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        toast.info({ message: 'OAuth 설정으로 이동합니다.', detail: tenant.name });
                        router.push(`/integrations/oauth?tenant=${tenant.id}`);
                      }}
                      className={`${ACTION_BUTTON} border-border-strong text-ink-muted hover:border-ink-faint`}
                    >
                      연동
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-4">
          <p className="text-sm text-ink-muted">
            총 <span className="font-medium tabular-nums text-ink">{visible.length}</span>개 고객사
          </p>
        </div>
      </section>
    </>
  );
}
