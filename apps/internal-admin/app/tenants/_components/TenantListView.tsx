'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ALL_VALUE, Badge, Dropdown, HintInput, ListToolbar, PageHeading, RowActions, RowIconButton, RowSelectCell, RowTextButton, SelectAllCell, useToast, type ListFilterField, type ListToolbarTab } from '@winpilot/ui';
import { InternalConfirmModal } from '@/app/_components/InternalConfirmModal';
import { InternalField } from '@/app/_components/InternalForm';
import { InternalModal } from '@/app/_components/InternalModal';
import { DEPLOYMENT_TONE, PLAN_TONE, SUPPORT_TONE, supportState, TENANT_PLANS, TENANTS, type TenantPlan, type TenantRecord } from '@/lib/data/tenants';
import {
  DATE,
  errorSummary,
  hasErrors,
  maxLength,
  validate,
  type FormErrors,
  type FormSpec,
} from '@/lib/validation/form';



const EMPTY_DRAFT = { name: '', manager: '', plan: TENANT_PLANS[0] as TenantPlan, supportUntil: '' };

type TenantField = 'name' | 'manager' | 'supportUntil';

/** 이 폼이 받는 값. **별표와 검사가 이 표 하나를 읽는다.** */
const TENANT_FORM: FormSpec<TenantField> = {
  name: { label: '고객사명', required: true, hint: '계약서에 적힌 이름을 그대로 씁니다.', rules: [maxLength(40)] },
  manager: { label: '담당자', required: true, hint: '고객사 쪽에서 우리와 이야기하는 사람입니다.', rules: [maxLength(20)] },
  supportUntil: {
    label: '유지보수 종료일',
    // 계약 시점에 정해지지 않은 곳이 있다 — 비울 수 있게 두고, 적었을 때만 모양을 본다.
    hint: '비워 두면 기한 없음으로 둡니다. (YYYY-MM-DD)',
    rules: [DATE],
  },
};

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
  const [tab, setTab] = useState('all');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<TenantRecord[]>(TENANTS);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  /*
    탭은 **유지보수 상태**로 가른다. 플랜이 아니라 이것으로 가르는 이유: 이 목록을 여는 사람은
    거의 언제나 "곧 끊기는 곳이 있나" 를 묻는다. 플랜은 그다음 물음이라 필터로 내렸다.
  */
  const tabs: ListToolbarTab[] = useMemo(() => {
    const count = (state: string) =>
      rows.filter((tenant) => supportState(tenant.supportUntil, today) === state).length;
    return [
      { id: 'all', label: '전체', count: rows.length },
      { id: '만료', label: '만료', count: count('만료') },
      { id: '만료 임박', label: '만료 임박', count: count('만료 임박') },
      { id: '유효', label: '유효', count: count('유효') },
      { id: '기한 없음', label: '기한 없음', count: count('기한 없음') },
    ];
  }, [rows, today]);

  const filters: ListFilterField[] = [
    { id: 'plan', label: '플랜', options: TENANT_PLANS.map((item) => ({ value: item, label: item })) },
  ];

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const plan = filterValues.plan ?? ALL_VALUE;
    return rows
      .filter((tenant) => {
        if (tab !== 'all' && supportState(tenant.supportUntil, today) !== tab) return false;
        if (plan !== ALL_VALUE && tenant.plan !== plan) return false;
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
  }, [rows, search, tab, filterValues, today]);

  /* 고른 줄. 일괄로 할 일이 아직 없어 선택 막대는 그리지 않는다 — 누를 수 없는 단추를 두지 않는다. */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const visibleIds = visible.map((tenant) => tenant.id);
  const selectedVisible = selectedIds.filter((id) => visibleIds.includes(id));
  const allChecked = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;

  const [errors, setErrors] = useState<FormErrors<TenantField>>({});
  const [submitted, setSubmitted] = useState(false);
  /** 저장을 누른 뒤 확인을 기다리는 중인가. */
  const [pending, setPending] = useState(false);

  const commit = (next: typeof draft) => {
    setDraft(next);
    if (submitted) setErrors(validate(TENANT_FORM, next));
  };

  /**
   * 검사만 하고 **확인 창을 연다.**
   *
   * 틀린 값은 여기서 걸려 확인 창까지 가지 않는다 — 물어볼 것이 없는데 한 번 더 누르게 하면
   * 그 창은 곧 눈에 들어오지 않게 된다.
   */
  const askCreate = () => {
    setSubmitted(true);
    const found = validate(TENANT_FORM, draft);
    setErrors(found);
    // 끝까지 검사하고 한꺼번에 알린다 — 첫 실패에서 멈추면 고칠 때마다 다시 눌러야 한다.
    if (hasErrors(found)) {
      toast.error({ message: '등록하지 못했습니다.', detail: errorSummary(found) });
      return;
    }

    setPending(true);
  };

  /** 확인을 지난 뒤 실제로 고치는 자리. */
  const create = () => {
    setPending(false);

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
      <PageHeading title="고객" description="계약과 유지보수 현황을 한눈에 확인하세요." />

      <ListToolbar
        tabs={tabs}
        activeTabId={tab}
        onTabChange={setTab}
        searchId="tenant-search"
        searchLabel="고객사 검색"
        searchHint="고객사명, 담당자, 도메인으로 검색"
        searchValue={search}
        onSearchChange={setSearch}
        actionLabel="고객사 등록"
        onAction={() => setCreating(true)}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(id, value) => setFilterValues((previous) => ({ ...previous, [id]: value }))}
        onFilterReset={() => setFilterValues({})}
      />

      <section className="overflow-hidden rounded-xl border border-border bg-canvas">
        <div className="hidden gap-4 border-b border-border px-5 py-3 text-xs text-ink-faint lg:grid lg:grid-cols-12 lg:items-center">
          <SelectAllCell
            checked={allChecked}
            indeterminate={selectedVisible.length > 0}
            onChange={(checked) => setSelectedIds(checked ? visibleIds : [])}
          />
          <span className="lg:col-span-3">고객사 · 담당자</span>
          <span className="lg:col-span-3">배포 · 도메인</span>
          <span className="lg:col-span-1 lg:text-center">플랜</span>
          <span className="lg:col-span-2">유지보수</span>
          <span className="lg:col-span-2 lg:text-center">관리</span>
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
                  className="group grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 transition-colors duration-100 last:border-b-0 hover:bg-surface lg:grid-cols-12 lg:items-center lg:gap-y-0"
                >
                  <RowSelectCell
                    checked={selectedIds.includes(tenant.id)}
                    onChange={(checked) =>
                      setSelectedIds((previous) =>
                        checked ? [...previous, tenant.id] : previous.filter((id) => id !== tenant.id),
                      )
                    }
                    label={`${tenant.name} 선택`}
                    index={index}
                  />

                  <div className="min-w-0 lg:col-span-3">
                    <p className="min-w-0 truncate text-sm font-medium">{tenant.name}</p>
                    <p className="min-w-0 truncate font-mono text-xs text-ink-faint">
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
                          <Badge tone={DEPLOYMENT_TONE[deployment.status]} size="sm">
                            {deployment.kind}
                          </Badge>
                          <span className="min-w-0 truncate font-mono text-xs text-ink-muted">{deployment.domain}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                    <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">플랜</span>
                    <Badge tone={PLAN_TONE[tenant.plan]}>
                      {tenant.plan}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 lg:col-span-2">
                    <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">유지보수</span>
                    <Badge tone={SUPPORT_TONE[state]}>
                      {state}
                    </Badge>
                    {tenant.supportUntil && (
                      <span className="font-mono text-xs tabular-nums text-ink-faint">{tenant.supportUntil}</span>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <RowActions>
                      <RowIconButton
                        icon="view"
                        label={`${tenant.name} 상세`}
                        onClick={() => router.push(`/tenants/${tenant.id}`)}
                      />
                      {/*
                        연동은 글자로 남긴다. 그림 하나로 옮기면 링크·공유·설정 어느 쪽으로도
                        읽혀서, 아이콘을 읽는 데 드는 시간이 글자를 읽는 시간보다 길어진다.
                      */}
                      <RowTextButton
                        onClick={() => {
                          toast.info({ message: 'OAuth 설정으로 이동합니다.', detail: tenant.name });
                          router.push(`/integrations/oauth?tenant=${tenant.id}`);
                        }}
                      >
                        연동
                      </RowTextButton>
                    </RowActions>
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
        onSubmit={askCreate}
        submitLabel="등록"
      >
        <InternalField
          label={TENANT_FORM.name.label}
          htmlFor="tenant-new-name"
          required={TENANT_FORM.name.required}
          {...(errors.name ? { error: errors.name } : { hint: TENANT_FORM.name.hint })}
        >
          <HintInput
            id="tenant-new-name"
            type="text"
            hint="계약서에 적히는 이름"
            value={draft.name}
            onChange={(event) => commit({ ...draft, name: event.target.value })}
            invalid={!draft.name.trim()}
          />
        </InternalField>

        <InternalField
          label={TENANT_FORM.manager.label}
          htmlFor="tenant-new-manager"
          required={TENANT_FORM.manager.required}
          {...(errors.manager ? { error: errors.manager } : { hint: TENANT_FORM.manager.hint })}
        >
          <HintInput
            id="tenant-new-manager"
            type="text"
            hint="고객사 쪽 담당자 이름"
            value={draft.manager}
            onChange={(event) => commit({ ...draft, manager: event.target.value })}
            invalid={!draft.manager.trim()}
          />
        </InternalField>

        <InternalField label="플랜">
          <Dropdown
            id="tenant-new-plan"
            label="플랜 선택"
            options={TENANT_PLANS.map((item) => ({ value: item, label: item }))}
            value={draft.plan}
            onChange={(next) => commit({ ...draft, plan: next as TenantPlan })}
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
            onChange={(event) => commit({ ...draft, supportUntil: event.target.value })}
          />
        </InternalField>
      </InternalModal>

      {/*
        고객사는 이 콘솔의 **가장 바깥 단위**다. 한 번 만들면 구독·결제·연동이 그 이름에 묶이므로,
        이름을 잘못 적으면 그 뒤의 모든 화면에서 그 이름을 보게 된다.
      */}
      <InternalConfirmModal
        open={pending}
        title="이 고객사를 등록할까요"
        message="등록하면 구독·결제·연동이 이 고객사 이름으로 묶입니다."
        detail={`${draft.name.trim()}`}
        confirmLabel="등록"
        onConfirm={create}
        onCancel={() => setPending(false)}
      />
    </>
  );
}
