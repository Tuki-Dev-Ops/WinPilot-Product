'use client';

import { useMemo, useState } from 'react';
import { ALL_VALUE, Badge, Dropdown, HintInput, ListToolbar, PageHeading, RowSelectCell, SelectAllCell, useToast, type ListFilterField, type ListToolbarTab } from '@winpilot/ui';
import { InternalField } from '@/app/_components/InternalForm';
import { InternalModal } from '@/app/_components/InternalModal';
import { InternalEmpty, InternalPanel, InternalTableFoot, InternalTableHead } from '@/app/_components/InternalPanel';
import { ACTIVITIES, ACTIVITY_KINDS, ACTIVITY_TONE, openNextSteps, type ActivityKind, type ActivityRecord } from '@/lib/data/activities';
import { STAFF } from '@/lib/data/settings';
import { findTenant, TENANTS, todayStamp } from '@/lib/data/tenants';
import {
  errorSummary,
  hasErrors,
  maxLength,
  validate,
  type FormErrors,
  type FormSpec,
} from '@/lib/validation/form';

const EMPTY_DRAFT = {
  kind: ACTIVITY_KINDS[0] as ActivityKind,
  tenantId: TENANTS[0]?.id ?? '',
  staff: STAFF[0]?.name ?? '',
  counterpart: '',
  summary: '',
  nextStep: '',
};

const COLUMNS = [
  { label: '고객사 · 고객사 담당자', span: 'lg:col-span-3' },
  { label: '활동 내용', span: 'lg:col-span-4' },
  { label: '일시', span: 'lg:col-span-2' },
  { label: '담당', span: 'lg:col-span-1 lg:text-center' },
  { label: '종류', span: 'lg:col-span-1 lg:text-center' },
];

type ActivityField = 'counterpart' | 'summary' | 'nextStep';

const ACTIVITY_FORM: FormSpec<ActivityField> = {
  counterpart: {
    label: '고객사 담당자',
    required: true,
    hint: '고객사 담당자 목록의 이름과 같게 적습니다.',
    rules: [maxLength(20)],
  },
  summary: { label: '활동 내용', required: true, hint: '한 문장으로 적습니다.', rules: [maxLength(120)] },
  nextStep: { label: '후속 조치', hint: '예정된 조치가 없으면 비워 두세요.', rules: [maxLength(120)] },
};

/**
 * 활동 목록.
 *
 * ## 타임라인에서 목록으로
 * 전에는 최신순 타임라인이었다. 그 자리에 적어 둔 이유는 **`무엇을 했는가` 가 문장이라 표의
 * 한 칸에 넣으면 잘린다**는 것이었는데, 잘리는 것 자체가 문제가 아니었다. 기록마다 후속 조치가
 * 있고 없고에 따라 줄 높이가 달라져 **훑을 수가 없었다** — 오늘 누가 어디에 손댔는지를 세려면
 * 스크롤을 하며 눈으로 줄을 나눠야 했다.
 *
 * 지금은 다른 목록과 같은 표다. 문장은 한 줄로 자르고, **전문과 후속 조치는 줄을 눌러 창에서**
 * 읽는다. 훑는 자리와 읽는 자리를 갈랐다.
 *
 * ## 후속 조치는 목록에도 표시가 남는다
 * 창에 들어가야만 보이면 "적어 놓고 하지 않은 것" 을 목록에서 셀 수 없다. 그래서 활동 내용
 * 앞에 작은 표시를 붙인다 — 탭의 건수와 같은 것을 가리킨다.
 *
 * `다음에 하기로 한 것`을 따로 세는 이유: 적어 놓고 하지 않으면 적은 뜻이 없다. 몇 건이
 * 남아 있는지가 목록을 여는 첫 물음이다.
 *
 * **프론트엔드 전용** — 기록은 이 화면에만 반영된다.
 */
export function ActivityListView() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<ActivityRecord[]>(ACTIVITIES);
  const [creating, setCreating] = useState(false);
  /** 수정 중인 활동 id. 비어 있으면 기록 창이다 — 창 하나가 두 일을 한다 */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  /*
    `다음에 할 것` 은 요약 카드에 있던 값을 탭으로 옮긴 것이다. 같은 숫자를 카드와 탭 두 곳에서
    세면 한쪽만 고쳐졌을 때 어느 쪽이 맞는지 알 수 없다.
  */
  const tabs: ListToolbarTab[] = useMemo(
    () => [
      { id: 'all', label: '전체', count: rows.length },
      { id: 'next', label: '후속 조치', count: openNextSteps(rows).length },
      ...ACTIVITY_KINDS.map((item) => ({
        id: item,
        label: item,
        count: rows.filter((activity) => activity.kind === item).length,
      })),
    ],
    [rows],
  );

  const filters: ListFilterField[] = [
    { id: 'tenant', label: '고객사', options: TENANTS.map((t) => ({ value: t.id, label: t.name })) },
  ];

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const tenantId = filterValues.tenant ?? ALL_VALUE;
    return rows
      .filter((activity) => {
        if (tab === 'next' && activity.nextStep.trim().length === 0) return false;
        if (tab !== 'all' && tab !== 'next' && activity.kind !== tab) return false;
        if (tenantId !== ALL_VALUE && activity.tenantId !== tenantId) return false;
        if (!keyword) return true;
        return (
          activity.target.toLowerCase().includes(keyword) ||
          activity.summary.toLowerCase().includes(keyword) ||
          activity.staff.toLowerCase().includes(keyword) ||
          activity.counterpart.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => b.at.localeCompare(a.at));
  }, [rows, search, tab, filterValues]);

  const pending = openNextSteps(visible);

  /*
    고른 줄. **일괄로 할 일이 아직 없어서 선택 줄(일괄 작업 막대)은 그리지 않는다** — 누를 수
    없는 단추를 두지 않는다는 규칙이 여기에도 걸린다.
  */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const visibleIds = visible.map((item) => item.id);
  const selectedVisible = selectedIds.filter((id) => visibleIds.includes(id));
  const allChecked = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;
  const toggleRow = (id: string, checked: boolean) =>
    setSelectedIds((previous) => (checked ? [...previous, id] : previous.filter((one) => one !== id)));

  const editing = rows.find((activity) => activity.id === editingId) ?? null;

  const [errors, setErrors] = useState<FormErrors<ActivityField>>({});
  const [submitted, setSubmitted] = useState(false);

  const commit = (next: typeof draft) => {
    setDraft(next);
    if (submitted) setErrors(validate(ACTIVITY_FORM, next));
  };

  /*
    줄을 누르면 **그 기록의 값이 담긴 같은 창**이 열린다. 읽기 전용 창을 따로 두지 않는 이유:
    여기서 확인하러 들어오는 값이 대개 후속 조치인데, 그것은 읽고 나면 지우거나 고치게 되는
    값이다. 창을 둘로 나누면 확인하고 다시 나갔다 들어와야 한다.
  */
  const openNew = () => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setSubmitted(false);
    setCreating(true);
  };

  const openEdit = (activity: ActivityRecord) => {
    setEditingId(activity.id);
    setDraft({
      kind: activity.kind,
      /* 파이프라인 건의 활동에는 고객사 코드가 없다 — 창의 드롭다운은 첫 고객사로 두고, 저장할 때 원래 값을 지킨다. */
      tenantId: activity.tenantId ?? EMPTY_DRAFT.tenantId,
      staff: activity.staff,
      counterpart: activity.counterpart,
      summary: activity.summary,
      nextStep: activity.nextStep,
    });
    setErrors({});
    setSubmitted(false);
    setCreating(true);
  };

  const create = () => {
    setSubmitted(true);
    const found = validate(ACTIVITY_FORM, draft);
    setErrors(found);
    if (hasErrors(found)) {
      toast.error({
        message: editingId ? '저장하지 못했습니다.' : '기록하지 못했습니다.',
        detail: errorSummary(found),
      });
      return;
    }

    if (editingId) {
      /*
        일시와 고객사는 이 창에서 바꾸지 않는다. 언제 있었던 일인지를 뒤에 고치면 기록의 순서가
        흔들리고, 파이프라인 건의 활동은 애초에 고객사 코드가 없다.
      */
      setRows((previous) =>
        previous.map((activity) =>
          activity.id === editingId
            ? {
                ...activity,
                kind: draft.kind,
                staff: draft.staff,
                counterpart: draft.counterpart.trim(),
                summary: draft.summary.trim(),
                nextStep: draft.nextStep.trim(),
              }
            : activity,
        ),
      );
      setCreating(false);
      setEditingId(null);
      toast.success({ message: '활동을 저장했습니다.', detail: draft.summary.trim() });
      return;
    }

    const tenant = findTenant(draft.tenantId);
    const record: ActivityRecord = {
      id: `AC-${5013 + rows.length}`,
      kind: draft.kind,
      tenantId: draft.tenantId,
      target: tenant?.name ?? draft.tenantId,
      // 시각은 서버에서 정한 기준일을 쓴다 — 분 단위까지는 사람이 적는 값이 아니다.
      at: `${todayStamp()} 00:00`,
      staff: draft.staff,
      counterpart: draft.counterpart.trim(),
      summary: draft.summary.trim(),
      nextStep: draft.nextStep.trim(),
    };

    setRows((previous) => [...previous, record]);
    setDraft(EMPTY_DRAFT);
    setCreating(false);
    toast.success({ message: '활동을 기록했습니다.', detail: `${record.target} · ${record.kind}` });
  };

  return (
    <>
      <PageHeading title="활동" description="고객사와 오간 기록을 남기고 확인하세요." />

      <ListToolbar
        tabs={tabs}
        activeTabId={tab}
        onTabChange={setTab}
        searchId="activity-search"
        searchLabel="활동 검색"
        searchHint="고객사 담당자, 활동 내용, 담당자로 검색"
        searchValue={search}
        onSearchChange={setSearch}
        actionLabel="활동 기록"
        onAction={openNew}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(id, value) => setFilterValues((previous) => ({ ...previous, [id]: value }))}
        onFilterReset={() => setFilterValues({})}
      />

      <InternalPanel
        title="활동 기록"
        description="최신순입니다. 아직 고객사가 아닌 파이프라인 건의 활동도 함께 쌓입니다."
      >
        <InternalTableHead
          columns={COLUMNS}
          lead={
            <SelectAllCell
              checked={allChecked}
              indeterminate={selectedVisible.length > 0}
              onChange={(checked) => setSelectedIds(checked ? visibleIds : [])}
            />
          }
        />

        {visible.length === 0 ? (
          <InternalEmpty>조건에 맞는 활동이 없습니다.</InternalEmpty>
        ) : (
          <div className="flex flex-col">
            {visible.map((activity: ActivityRecord, index) => (
              <div
                key={activity.id}
                role="button"
                tabIndex={0}
                onClick={() => openEdit(activity)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openEdit(activity);
                  }
                }}
                className="group grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 text-left transition-colors duration-150 last:border-b-0 hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 lg:grid-cols-12 lg:items-center lg:gap-y-0"
              >
                <RowSelectCell
                  checked={selectedIds.includes(activity.id)}
                  onChange={(checked) => toggleRow(activity.id, checked)}
                  label={`${activity.summary} 선택`}
                  index={index}
                />

                <div className="min-w-0 lg:col-span-3">
                  {activity.tenantId ? (
                    <a
                      href={`/tenants/${activity.tenantId}`}
                      onClick={(event) => event.stopPropagation()}
                      className="block min-w-0 truncate text-sm font-medium text-brand-700 underline underline-offset-2 dark:text-brand-300"
                    >
                      {activity.target}
                    </a>
                  ) : (
                    <p className="min-w-0 truncate text-sm font-medium">
                      {activity.target}
                      {/* 아직 고객사가 아닌 건임을 밝힌다 — 링크가 없는 이유가 화면에 있어야 한다. */}
                      <span className="ml-1.5 shrink-0 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 text-3xs text-ink-faint">
                        파이프라인
                      </span>
                    </p>
                  )}
                  <p className="min-w-0 truncate text-xs text-ink-faint">{activity.counterpart}</p>
                </div>

                <div className="min-w-0 lg:col-span-4">
                  <p className="min-w-0 truncate text-sm">
                    {/*
                      후속 조치가 남아 있으면 표시를 붙인다. 창에 들어가야만 보이면 "적어 놓고
                      하지 않은 것" 을 목록에서 셀 수 없다 — 탭의 건수와 같은 것을 가리킨다.
                    */}
                    {activity.nextStep && (
                      <span className="mr-1.5 shrink-0 whitespace-nowrap rounded-full bg-brand-50 px-2 py-0.5 text-3xs font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200">
                        후속
                      </span>
                    )}
                    {activity.summary}
                  </p>
                </div>

                <div className="flex min-w-0 items-baseline gap-2 lg:col-span-2">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">일시</span>
                  <span className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
                    {activity.at}
                  </span>
                </div>

                <div className="flex min-w-0 items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">담당</span>
                  <span className="min-w-0 truncate text-xs text-ink-muted">{activity.staff}</span>
                </div>

                <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">종류</span>
                  <Badge tone={ACTIVITY_TONE[activity.kind]}>{activity.kind}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <InternalTableFoot>
          <p>
            총 <span className="font-medium tabular-nums text-ink">{visible.length}</span>건
          </p>
          <p>
            남은 후속 조치 <span className="font-medium tabular-nums text-ink">{pending.length}</span>건
          </p>
        </InternalTableFoot>
      </InternalPanel>

      <InternalModal
        open={creating}
        title={editingId ? '활동 수정' : '활동 기록'}
        description={
          editingId
            ? '일시와 고객사는 바꾸지 않습니다 — 언제 있었던 일인지를 뒤에 고치면 기록의 순서가 흔들립니다.'
            : '활동 내용과 고객사 담당자만 있으면 기록할 수 있습니다. 후속 조치는 정해졌을 때만 입력합니다.'
        }
        onClose={() => {
          setCreating(false);
          setEditingId(null);
        }}
        onSubmit={create}
        submitLabel={editingId ? '저장' : '기록'}
      >
        <InternalField label="종류">
          <Dropdown
            id="activity-new-kind"
            label="종류 선택"
            options={ACTIVITY_KINDS.map((item) => ({ value: item, label: item }))}
            value={draft.kind}
            onChange={(next) => commit({ ...draft, kind: next as ActivityKind })}
          />
        </InternalField>

        {editingId ? (
          /* 고칠 수 없는 값을 드롭다운으로 그리면 바꿀 수 있는 것으로 읽힌다 — 글자로 적는다. */
          <InternalField label="고객사" hint="활동이 일어난 상대는 바꾸지 않습니다.">
            <p className="flex h-11 items-center rounded-lg bg-surface px-3 text-sm">
              {editing?.target ?? '-'}
            </p>
          </InternalField>
        ) : (
          <InternalField label="고객사">
            <Dropdown
              id="activity-new-tenant"
              label="고객사 선택"
              options={TENANTS.map((tenant) => ({ value: tenant.id, label: tenant.name, hint: tenant.id }))}
              value={draft.tenantId}
              onChange={(next) => commit({ ...draft, tenantId: next })}
            />
          </InternalField>
        )}

        <InternalField label="담당자">
          <Dropdown
            id="activity-new-staff"
            label="담당자 선택"
            options={STAFF.map((staff) => ({ value: staff.name, label: staff.name, hint: staff.team }))}
            value={draft.staff}
            onChange={(next) => commit({ ...draft, staff: next })}
          />
        </InternalField>

        <InternalField
          label={ACTIVITY_FORM.counterpart.label}
          htmlFor="activity-new-counterpart"
          required={ACTIVITY_FORM.counterpart.required}
          {...(errors.counterpart ? { error: errors.counterpart } : { hint: ACTIVITY_FORM.counterpart.hint })}
        >
          <HintInput
            id="activity-new-counterpart"
            type="text"
            hint="예: 김서연"
            value={draft.counterpart}
            onChange={(event) => commit({ ...draft, counterpart: event.target.value })}
            invalid={!draft.counterpart.trim()}
          />
        </InternalField>

        <InternalField
          label={ACTIVITY_FORM.summary.label}
          htmlFor="activity-new-summary"
          required={ACTIVITY_FORM.summary.required}
          {...(errors.summary ? { error: errors.summary } : { hint: ACTIVITY_FORM.summary.hint })}
        >
          <HintInput
            id="activity-new-summary"
            type="text"
            hint="예: 유지보수 연장 견적을 발송했습니다."
            value={draft.summary}
            onChange={(event) => commit({ ...draft, summary: event.target.value })}
            invalid={!draft.summary.trim()}
          />
        </InternalField>

        <InternalField label="후속 조치" htmlFor="activity-new-next" hint="예정된 조치가 없으면 비워 두세요.">
          <HintInput
            id="activity-new-next"
            type="text"
            hint="예: 견적서를 다시 보낸다"
            value={draft.nextStep}
            onChange={(event) => commit({ ...draft, nextStep: event.target.value })}
          />
        </InternalField>
      </InternalModal>
    </>
  );
}
