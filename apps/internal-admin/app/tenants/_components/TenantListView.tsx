'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, type MouseEvent } from 'react';
import { Dropdown, HintInput, useToast } from '@winpilot/ui';
import { InternalField } from '@/app/_components/InternalForm';
import { InternalModal } from '@/app/_components/InternalModal';
import { InternalChips, InternalToolbar } from '@/app/_components/InternalToolbar';
import {
  DEPLOYMENT_TONE,
  PLAN_TONE,
  SUPPORT_TONE,
  TENANTS,
  TENANT_PLANS,
  supportState,
  type TenantPlan,
  type TenantRecord,
} from '@/lib/data/tenants';

const ACTION_BUTTON = 'h-8 shrink-0 whitespace-nowrap rounded-lg border px-3 text-sm transition-colors duration-150';

/** 행 클릭으로 상세로 이동하므로, 행 안의 컨트롤은 자기 동작만 하도록 전파를 끊는다. */
const stopRowClick = (event: MouseEvent) => event.stopPropagation();

const EMPTY_DRAFT = { name: '', manager: '', plan: TENANT_PLANS[0] as TenantPlan, supportUntil: '' };

/**
 * 고객사 목록.
 *
 * 여기서 가장 중요한 것은 **유지보수 만료**다. 끝난 뒤에 알면 이미 늦으므로
 * 30일 안으로 들어온 고객사를 '만료 임박' 으로 따로 표시하고 맨 위로 올린다.
 *
 * 등록은 목록 위 모달에서 끝난다. 계약을 딸 때 처음 적는 값은 이름·담당자·플랜·유지보수
 * 종료일 넷뿐이고, 나머지(배포·도메인·계정)는 붙이면서 채워지기 때문이다.
 *
 * **프론트엔드 전용** — 등록 결과는 이 화면에만 반영된다.
 */
export function TenantListView({ today }: { today: string }) {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState<string>('all');
  const [rows, setRows] = useState<TenantRecord[]>(TENANTS);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows
      .filter((tenant) => {
        if (plan !== 'all' && tenant.plan !== plan) return false;
        if (!keyword) return true;
        return (
          tenant.name.toLowerCase().includes(keyword) ||
          tenant.manager.toLowerCase().includes(keyword) ||
          tenant.id.toLowerCase().includes(keyword) ||
          tenant.deployments.some((deployment) => deployment.domain.toLowerCase().includes(keyword))
        );
      })
      .sort((a, b) => {
        // 만료가 가까운 순 — 계약이 끝나가는 고객사가 목록 맨 위에 있어야 한다.
        const order = { 만료: 0, '만료 임박': 1, 유효: 2, '기한 없음': 3 } as const;
        return order[supportState(a.supportUntil, today)] - order[supportState(b.supportUntil, today)];
      });
  }, [rows, search, plan, today]);

  const create = () => {
    if (!draft.name.trim() || !draft.manager.trim()) {
      toast.error({ message: '등록하지 못했습니다.', detail: '고객사명과 담당자는 반드시 입력해야 합니다.' });
      return;
    }
    if (draft.supportUntil && !/^\d{4}-\d{2}-\d{2}$/.test(draft.supportUntil)) {
      toast.error({ message: '등록하지 못했습니다.', detail: '유지보수 종료일은 YYYY-MM-DD 로 넣어 주세요.' });
      return;
    }

    // 배포·계정은 붙이면서 채운다 — 계약 시점에는 아직 도메인이 정해지지 않는다.
    const record: TenantRecord = {
      id: `T-${100 + rows.length + 1}`,
      name: draft.name.trim(),
      manager: draft.manager.trim(),
      managerEmail: '',
      managerPhone: '',
      plan: draft.plan,
      contractedAt: today,
      supportUntil: draft.supportUntil,
      deployments: [],
      memo: '',
    };

    setRows((previous) => [...previous, record]);
    setDraft(EMPTY_DRAFT);
    setCreating(false);
    toast.success({ message: '고객사를 등록했습니다.', detail: `${record.name} · ${record.plan}` });
  };

  return (
    <>
      <InternalToolbar
        searchId="tenant-search"
        searchLabel="고객사 검색"
        searchHint="고객사명, 담당자, 도메인으로 검색"
        search={search}
        onSearch={setSearch}
        filters={<InternalChips label="플랜" options={TENANT_PLANS} value={plan} onChange={setPlan} />}
        action={{ label: '고객사 등록', onClick: () => setCreating(true) }}
      />

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
                    {/* 배포가 없는 것은 이상한 상태가 아니라 아직 붙이지 않은 것이다 — 빈 칸으로 두면 오류로 읽힌다. */}
                    {tenant.deployments.length === 0 ? (
                      <span className="text-xs text-ink-faint">아직 붙이지 않았습니다.</span>
                    ) : (
                      tenant.deployments.map((deployment) => (
                        <div key={deployment.kind} className="flex min-w-0 items-center gap-2">
                          <span
                            className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium ${DEPLOYMENT_TONE[deployment.status]}`}
                          >
                            {deployment.kind}
                          </span>
                          <span className="truncate font-mono text-xs text-ink-muted">{deployment.domain}</span>
                        </div>
                      ))
                    )}
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

      <InternalModal
        open={creating}
        title="고객사 등록"
        description="계약 시점에 정해지는 값만 받습니다. 배포·도메인·계정은 붙이면서 채웁니다."
        onClose={() => setCreating(false)}
        onSubmit={create}
        submitLabel="등록"
      >
        <InternalField label="고객사명" htmlFor="tenant-new-name">
          <HintInput
            id="tenant-new-name"
            type="text"
            hint="계약서에 적히는 이름"
            value={draft.name}
            onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))}
            invalid={!draft.name.trim()}
          />
        </InternalField>

        <InternalField label="담당자" htmlFor="tenant-new-manager">
          <HintInput
            id="tenant-new-manager"
            type="text"
            hint="고객사 쪽 담당자 이름"
            value={draft.manager}
            onChange={(event) => setDraft((previous) => ({ ...previous, manager: event.target.value }))}
            invalid={!draft.manager.trim()}
          />
        </InternalField>

        <InternalField label="플랜">
          <Dropdown
            id="tenant-new-plan"
            label="플랜 선택"
            options={TENANT_PLANS.map((item) => ({ value: item, label: item }))}
            value={draft.plan}
            onChange={(next) => setDraft((previous) => ({ ...previous, plan: next as TenantPlan }))}
          />
        </InternalField>

        <InternalField
          label="유지보수 종료일"
          htmlFor="tenant-new-support"
          hint="비우면 기한 없음으로 둡니다. 나중에 상세에서 넣을 수 있습니다."
        >
          <HintInput
            id="tenant-new-support"
            type="text"
            hint="YYYY-MM-DD"
            value={draft.supportUntil}
            onChange={(event) => setDraft((previous) => ({ ...previous, supportUntil: event.target.value }))}
          />
        </InternalField>
      </InternalModal>
    </>
  );
}
