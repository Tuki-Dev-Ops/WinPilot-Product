'use client';

import { useMemo, useState } from 'react';
import { ALL_VALUE, Badge, Dropdown, HintInput, ListToolbar, PageHeading, RowSelectCell, SelectAllCell, useToast, type ListFilterField, type ListToolbarTab } from '@winpilot/ui';
import { InternalField } from '@/app/_components/InternalForm';
import { InternalModal } from '@/app/_components/InternalModal';
import { InternalEmpty, InternalPanel, InternalTableFoot, InternalTableHead } from '@/app/_components/InternalPanel';
import { daysFrom, dueInvoices, formatAmount, INVOICE_KINDS, INVOICE_TONE, INVOICES, monthEnd, monthLabel, outstanding, type InvoiceKind, type InvoiceRecord } from '@/lib/data/invoices';
import { PLANS, formatWon, planOfTenant } from '@/lib/data/subscriptions';
import { findTenant, TENANTS } from '@/lib/data/tenants';
import {
  DATE,
  DIGITS,
  POSITIVE,
  errorSummary,
  hasErrors,
  maxLength,
  validate,
  type FormErrors,
  type FormSpec,
} from '@/lib/validation/form';

type InvoiceField = 'title' | 'amount' | 'dueAt';

const INVOICE_FORM: FormSpec<InvoiceField> = {
  title: { label: '제목', required: true, hint: '고객사에게 보내는 안내에 그대로 적힙니다.', rules: [maxLength(40)] },
  amount: { label: '금액', required: true, hint: '원 단위로 적습니다.', rules: [DIGITS, POSITIVE] },
  dueAt: {
    label: '기한',
    required: true,
    hint: '지난 날짜로는 만들 수 없습니다 — 만들자마자 연체가 됩니다. (YYYY-MM-DD)',
    rules: [DATE],
  },
};


const EMPTY_DRAFT = {
  tenantId: TENANTS[0]?.id ?? '',
  kind: INVOICE_KINDS[0] as InvoiceKind,
  /** 어느 등급으로 청구하는가. 유지보수일 때만 쓴다 */
  planId: '',
  title: '',
  amount: '',
  dueAt: '',
};

/**
 * 유지보수는 **플랜 값을 그대로 청구한다.**
 *
 * 고객사는 플랜을 이름으로 들고 있고 요금은 플랜이 들고 있다(`subscriptions.ts` 의
 * `planOfTenant`). 그 둘을 사람이 눈으로 이어 붙이는 동안, 플랜 값을 올린 달에 한 곳만 옛
 * 금액으로 남는다 — 그리고 그 사실은 고객사가 입금액이 다르다고 말할 때 드러난다.
 *
 * 그래서 등급을 고르면 **금액 · 제목 · 기한이 그 등급에서 따라온다.** 기한이 월말인 것은
 * 유지보수가 달 단위이기 때문이고, 시드의 청구도 전부 월말이다.
 *
 * 손으로 고친 칸은 다시 덮지 않는다(`touched`) — 이번 달만 깎아 주기로 한 협의가 고객사를
 * 바꿔 보는 사이에 지워지면, 지워진 줄도 모르고 저장하게 된다.
 */
function fromPlan(planId: string, today: string): { title: string; amount: string; dueAt: string } | null {
  const plan = PLANS.find((one) => one.id === planId);
  if (!plan) return null;
  return {
    title: `${monthLabel(today)} 유지보수`,
    amount: String(plan.monthly),
    dueAt: monthEnd(today),
  };
}

const COLUMNS = [
  { label: '고객사', span: 'lg:col-span-3' },
  { label: '항목', span: 'lg:col-span-3' },
  { label: '금액', span: 'lg:col-span-2 lg:text-right' },
  { label: '기한', span: 'lg:col-span-2' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 청구 예정 목록.
 *
 * 사내 어드민은 청구를 **집행하지 않고 안내만** 한다. 그래서 이 화면에는 '결제하기' 가 없고,
 * 대신 **기한이 가까운 것**이 위로 온다 — 담당자가 확인해야 할 것은 그 순서다.
 *
 * 견적도 함께 보여 준다. 아직 확정이 아니지만 곧 확정될 돈이라, 예정 목록에서 빠지면
 * 다음 달 들어올 금액을 셀 때마다 다른 화면을 함께 열어야 한다.
 */
export function InvoiceListView({ today }: { today: string }) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<InvoiceRecord[]>(INVOICES);
  const [creating, setCreating] = useState(false);
  /** 수정 중인 청구 id. 비어 있으면 등록 창이다 — 창 하나가 두 일을 한다 */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  /*
    탭의 기본값은 `전체` 다. `7일 안` 이 먼저 손대야 할 묶음이지만 대개 한두 건이라, 그것을
    기본으로 두면 다음 달 들어올 돈 전체를 보려는 사람이 매번 탭을 바꿔야 한다.
  */
  const dueAll = useMemo(() => dueInvoices(today, rows), [today, rows]);

  const tabs: ListToolbarTab[] = [
    { id: 'all', label: '전체', count: dueAll.length },
    { id: 'soon', label: '7일 안', count: dueAll.filter((i) => daysFrom(i.dueAt, today) >= -7).length },
    { id: '견적', label: '견적', count: dueAll.filter((i) => i.state === '견적').length },
    { id: '청구', label: '청구', count: dueAll.filter((i) => i.state === '청구').length },
  ];

  const filters: ListFilterField[] = [
    { id: 'tenant', label: '고객사', options: TENANTS.map((t) => ({ value: t.id, label: t.name })) },
    { id: 'kind', label: '청구 항목', options: INVOICE_KINDS.map((k) => ({ value: k, label: k })) },
  ];

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const tenantId = filterValues.tenant ?? ALL_VALUE;
    const kind = filterValues.kind ?? ALL_VALUE;
    return dueInvoices(today, rows).filter((invoice) => {
      if (tab === 'soon' && daysFrom(invoice.dueAt, today) < -7) return false;
      if (tab !== 'all' && tab !== 'soon' && invoice.state !== tab) return false;
      if (tenantId !== ALL_VALUE && invoice.tenantId !== tenantId) return false;
      if (kind !== ALL_VALUE && invoice.kind !== kind) return false;
      if (!keyword) return true;
      const tenant = findTenant(invoice.tenantId)?.name ?? '';
      return (
        invoice.title.toLowerCase().includes(keyword) ||
        invoice.id.toLowerCase().includes(keyword) ||
        tenant.toLowerCase().includes(keyword)
      );
    });
  }, [rows, search, tab, filterValues, today]);

  /*
    고른 줄. **일괄로 할 일이 아직 없어서 선택 줄(일괄 작업 막대)은 그리지 않는다** — 누를 수
    없는 단추를 두지 않는다는 규칙이 여기에도 걸린다. 할 일이 정해지면 그때 막대를 잇는다.
  */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const visibleIds = visible.map((item) => item.id);
  const selectedVisible = selectedIds.filter((id) => visibleIds.includes(id));
  const allChecked = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;
  const toggleRow = (id: string, checked: boolean) =>
    setSelectedIds((previous) => (checked ? [...previous, id] : previous.filter((one) => one !== id)));

  /** 지금 고른 등급. 안내 문구와 드롭다운이 함께 읽는다 */
  const plan = PLANS.find((one) => one.id === draft.planId);
  /* 팔지 않는 등급으로는 새로 청구하지 않는다 — 계약할 수 없는 값이 청구서에 적힌다. */
  const sellablePlans = PLANS.filter((one) => one.domain === 'B2C' && one.sellable);

  const total = visible.reduce((sum, invoice) => sum + invoice.amount, 0);
  const unpaid = outstanding(visible);
  const soon = visible.filter((invoice) => daysFrom(invoice.dueAt, today) >= -7);

  const [errors, setErrors] = useState<FormErrors<InvoiceField>>({});
  const [submitted, setSubmitted] = useState(false);

  /*
    지난 기한인지는 **오늘이 언제인가**에 달린 값이라 표에 못 박아 둘 수 없다.
    기한이 이미 지난 청구를 예정 목록에서 만들면 만들자마자 연체 목록으로 사라진다.
  */
  const spec: FormSpec<InvoiceField> = {
    ...INVOICE_FORM,
    dueAt: {
      ...INVOICE_FORM.dueAt,
      rules: [
        ...(INVOICE_FORM.dueAt.rules ?? []),
        { message: '지난 기한으로는 예정 청구를 만들 수 없습니다.', test: (value) => value >= today },
      ],
    },
  };

  /** 손으로 고친 칸. 여기 든 칸은 플랜을 바꿔도 덮지 않는다. */
  const [touched, setTouched] = useState<Record<'title' | 'amount' | 'dueAt', boolean>>({
    title: false,
    amount: false,
    dueAt: false,
  });

  const commit = (next: typeof draft) => {
    setDraft(next);
    if (submitted) setErrors(validate(spec, next));
  };

  /** 사람이 친 칸 — 여기서만 `touched` 가 켜진다. */
  const type = (field: 'title' | 'amount' | 'dueAt', value: string) => {
    setTouched((previous) => ({ ...previous, [field]: true }));
    commit({ ...draft, [field]: value });
  };

  /**
   * 등급을 고르면 그 등급의 값이 따라 붙는다. 손대지 않은 칸만 바꾼다.
   * 유지보수가 아닌 항목(구축·추가 개발·호스팅)은 플랜과 무관하므로 아무것도 채우지 않는다 —
   * 그 금액은 견적에서 오고, 채워 두면 견적과 다른 값이 조용히 저장된다.
   */
  const applyPlan = (next: typeof draft) => {
    if (next.kind !== '유지보수') return commit(next);

    const filled = fromPlan(next.planId, today);
    if (!filled) return commit(next);

    commit({
      ...next,
      title: touched.title ? next.title : filled.title,
      amount: touched.amount ? next.amount : filled.amount,
      dueAt: touched.dueAt ? next.dueAt : filled.dueAt,
    });
  };

  const changeTenant = (tenantId: string) => {
    /* 고객사를 바꾸면 그 고객사가 지금 쓰는 등급으로 되돌린다 — 앞 고객사의 등급이 남으면 엉뚱한 금액이 청구된다. */
    const plan = planOfTenant(findTenant(tenantId)?.plan ?? '');
    applyPlan({ ...draft, tenantId, planId: plan?.id ?? '' });
  };

  /*
    줄을 누르면 **그 건의 값이 담긴 같은 창**이 열린다. 금액과 기한은 확인하러 들어왔다가
    그 자리에서 고치게 되는 값이라, 읽기 전용 창을 따로 두면 다시 나갔다 들어와야 한다.
  */
  const openNew = () => {
    setEditingId(null);
    setTouched({ title: false, amount: false, dueAt: false });

    /* 새 청구는 **첫 고객사의 지금 등급**에서 시작한다 — 빈 칸으로 두면 금액을 손으로 적게 된다. */
    const first = TENANTS[0];
    const plan = planOfTenant(first?.plan ?? '');
    const filled = plan ? fromPlan(plan.id, today) : null;

    setDraft({
      ...EMPTY_DRAFT,
      kind: '유지보수',
      planId: plan?.id ?? '',
      ...(filled ?? {}),
    });
    setErrors({});
    setSubmitted(false);
    setCreating(true);
  };

  const openEdit = (invoice: InvoiceRecord) => {
    setEditingId(invoice.id);
    /*
      이미 있는 청구는 **적힌 값이 옳다.** 등급에서 다시 끌어오면 그때 깎아 주기로 한 금액이
      열자마자 원래 값으로 돌아간다 — 그래서 세 칸 모두 손댄 것으로 표시해 둔다.
    */
    setTouched({ title: true, amount: true, dueAt: true });
    setDraft({
      tenantId: invoice.tenantId,
      kind: invoice.kind,
      planId: planOfTenant(findTenant(invoice.tenantId)?.plan ?? '')?.id ?? '',
      title: invoice.title,
      amount: String(invoice.amount),
      dueAt: invoice.dueAt,
    });
    setErrors({});
    setSubmitted(false);
    setCreating(true);
  };

  const create = () => {
    setSubmitted(true);
    const found = validate(spec, draft);
    setErrors(found);
    if (hasErrors(found)) {
      toast.error({
        message: editingId ? '저장하지 못했습니다.' : '등록하지 못했습니다.',
        detail: errorSummary(found),
      });
      return;
    }

    if (editingId) {
      /* 상태(견적·청구)와 발행일은 이 창에서 바꾸지 않는다 — 회계가 세금계산서를 낼 때 움직이는 값이다. */
      setRows((previous) =>
        previous.map((invoice) =>
          invoice.id === editingId
            ? {
                ...invoice,
                tenantId: draft.tenantId,
                kind: draft.kind,
                title: draft.title.trim(),
                amount: Number(draft.amount),
                dueAt: draft.dueAt,
              }
            : invoice,
        ),
      );
      setCreating(false);
      setEditingId(null);
      toast.success({
        message: '청구를 저장했습니다.',
        detail: `${findTenant(draft.tenantId)?.name ?? draft.tenantId} · ${formatAmount(Number(draft.amount))}원`,
      });
      return;
    }

    const record: InvoiceRecord = {
      id: `IV-${2044 + rows.length}`,
      tenantId: draft.tenantId,
      kind: draft.kind,
      title: draft.title.trim(),
      amount: Number(draft.amount),
      issuedAt: today,
      dueAt: draft.dueAt,
      // 새로 만든 것은 언제나 견적이다 — 확정은 회계가 세금계산서를 낼 때 일어난다.
      state: '견적',
      recurring: false,
      memo: '',
    };

    setRows((previous) => [...previous, record]);
    setDraft(EMPTY_DRAFT);
    setCreating(false);
    toast.success({
      message: '청구를 등록했습니다.',
      detail: `${findTenant(record.tenantId)?.name ?? record.tenantId} · ${formatAmount(record.amount)}원 · 견적`,
    });
  };

  return (
    <>
      <PageHeading title="예정일" description="청구 예정 건과 남은 기한을 확인하세요." />

      <ListToolbar
        tabs={tabs}
        activeTabId={tab}
        onTabChange={setTab}
        searchId="invoice-search"
        searchLabel="청구 검색"
        searchHint="항목, 번호, 고객사로 검색"
        searchValue={search}
        onSearchChange={setSearch}
        actionLabel="청구 등록"
        onAction={openNew}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(id, value) => setFilterValues((previous) => ({ ...previous, [id]: value }))}
        onFilterReset={() => setFilterValues({})}
      />

      <InternalPanel
        title="청구 예정"
        description="기한이 가까운 것부터 옵니다. 기한이 지난 것은 보조 메뉴의 연체에 있습니다."
      >
        <InternalTableHead columns={COLUMNS} lead={<SelectAllCell checked={allChecked} indeterminate={selectedVisible.length > 0} onChange={(checked) => setSelectedIds(checked ? visibleIds : [])} />} />

        {visible.length === 0 ? (
          <InternalEmpty>조건에 맞는 청구 예정 건이 없습니다.</InternalEmpty>
        ) : (
          <div className="flex flex-col">
            {visible.map((invoice: InvoiceRecord, index) => {
              const left = -daysFrom(invoice.dueAt, today);
              return (
                <div
                  key={invoice.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openEdit(invoice)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openEdit(invoice);
                    }
                  }}
                  className="group grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 text-left transition-colors duration-150 last:border-b-0 hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 lg:grid-cols-12 lg:items-center lg:gap-y-0"
                >
                  <RowSelectCell
                    checked={selectedIds.includes(invoice.id)}
                    onChange={(checked) => toggleRow(invoice.id, checked)}
                    label={`${invoice.title} 선택`}
                    index={index}
                  />

                  <div className="min-w-0 lg:col-span-3">
                    <p className="min-w-0 truncate text-sm font-medium">{findTenant(invoice.tenantId)?.name ?? '-'}</p>
                    <p className="min-w-0 truncate font-mono text-xs text-ink-faint">{invoice.id}</p>
                  </div>

                  <div className="min-w-0 lg:col-span-3">
                    <p className="min-w-0 truncate text-sm">
                      {invoice.title}
                      {invoice.recurring && (
                        <span className="ml-1.5 shrink-0 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 text-3xs text-ink-faint">
                          매월
                        </span>
                      )}
                    </p>
                    <p className="min-w-0 truncate text-xs text-ink-faint">
                      {invoice.kind}
                      {invoice.memo && ` · ${invoice.memo}`}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2 lg:col-span-2 lg:justify-end">
                    <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">금액</span>
                    <span className="text-sm font-medium tabular-nums">{formatAmount(invoice.amount)}원</span>
                  </div>

                  <div className="flex items-baseline gap-2 lg:col-span-2">
                    <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">기한</span>
                    <span
                      className={`font-mono text-xs tabular-nums ${left <= 7 ? 'text-signal-danger' : 'text-ink-muted'}`}
                    >
                      {invoice.dueAt}
                      <span className="ml-1">{left}일 남음</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                    <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">상태</span>
                    <Badge tone={INVOICE_TONE[invoice.state]}>
                      {invoice.state}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <InternalTableFoot>
          <p>
            총 <span className="font-medium tabular-nums text-ink">{visible.length}</span>건
          </p>
          <p>
            합계 <span className="font-medium tabular-nums text-ink">{formatAmount(total)}</span>원
          </p>
        </InternalTableFoot>
      </InternalPanel>

      <InternalModal
        open={creating}
        title={editingId ? '청구 수정' : '청구 등록'}
        description={
          editingId
            ? '상태와 발행일은 이 창에서 바꾸지 않습니다 — 회계가 세금계산서를 낼 때 움직이는 값입니다.'
            : '새로 만든 것은 언제나 견적입니다. 확정은 회계가 세금계산서를 낼 때 일어납니다.'
        }
        onClose={() => {
          setCreating(false);
          setEditingId(null);
        }}
        onSubmit={create}
        submitLabel={editingId ? '저장' : '등록'}
      >
        <InternalField label="고객사" hint={`지금 등급: ${findTenant(draft.tenantId)?.plan ?? '-'}`}>
          <Dropdown
            id="invoice-new-tenant"
            label="고객사 선택"
            options={TENANTS.map((tenant) => ({ value: tenant.id, label: tenant.name, hint: tenant.plan }))}
            value={draft.tenantId}
            onChange={changeTenant}
          />
        </InternalField>

        <InternalField label="항목">
          <Dropdown
            id="invoice-new-kind"
            label="항목 선택"
            options={INVOICE_KINDS.map((item) => ({ value: item, label: item }))}
            value={draft.kind}
            onChange={(next) => applyPlan({ ...draft, kind: next as InvoiceKind })}
          />
        </InternalField>

        {/*
          등급 칸은 **유지보수일 때만** 뜬다. 구축·추가 개발·호스팅은 등급과 무관한 금액이라,
          거기에도 등급을 물으면 고른 값이 아무 데도 쓰이지 않는다(`fromPlan` 머리말).
        */}
        {draft.kind === '유지보수' && (
          <InternalField
            label="청구할 등급"
            hint={
              plan
                ? `월 ${formatWon(plan.monthly)}원 — 금액 · 제목 · 기한이 이 등급에서 따라옵니다.`
                : '등급을 고르면 금액이 그 등급의 월 구독료로 채워집니다.'
            }
          >
            <Dropdown
              id="invoice-new-plan"
              label="등급 선택"
              options={sellablePlans.map((one) => ({
                value: one.id,
                label: one.name,
                hint: `월 ${formatWon(one.monthly)}원`,
              }))}
              value={draft.planId}
              onChange={(next) => applyPlan({ ...draft, planId: next })}
            />
          </InternalField>
        )}

        <InternalField
          label={INVOICE_FORM.title.label}
          htmlFor="invoice-new-title"
          required={INVOICE_FORM.title.required}
          {...(errors.title ? { error: errors.title } : { hint: INVOICE_FORM.title.hint })}
        >
          <HintInput
            id="invoice-new-title"
            type="text"
            hint="예: 2026년 10월 유지보수"
            value={draft.title}
            onChange={(event) => type('title', event.target.value)}
            invalid={!draft.title.trim()}
          />
        </InternalField>

        <InternalField
          label={INVOICE_FORM.amount.label}
          htmlFor="invoice-new-amount"
          required={INVOICE_FORM.amount.required}
          {...(errors.amount ? { error: errors.amount } : { hint: INVOICE_FORM.amount.hint })}
        >
          <HintInput
            id="invoice-new-amount"
            type="text"
            hint="원 단위 숫자만"
            value={draft.amount}
            onChange={(event) => type('amount', event.target.value.replace(/[^0-9]/g, ''))}
            invalid={!draft.amount}
          />
        </InternalField>

        <InternalField
          label={INVOICE_FORM.dueAt.label}
          htmlFor="invoice-new-due"
          required={INVOICE_FORM.dueAt.required}
          {...(errors.dueAt ? { error: errors.dueAt } : { hint: INVOICE_FORM.dueAt.hint })}
        >
          <HintInput
            id="invoice-new-due"
            type="text"
            hint="YYYY-MM-DD"
            value={draft.dueAt}
            onChange={(event) => type('dueAt', event.target.value)}
            invalid={!draft.dueAt}
          />
        </InternalField>
      </InternalModal>
    </>
  );
}
