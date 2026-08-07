'use client';

import { useMemo, useState } from 'react';
import { ALL_VALUE, Badge, Dropdown, HintInput, ListToolbar, PageHeading, RowSelectCell, SelectAllCell, useToast, type ListFilterField, type ListToolbarTab } from '@winpilot/ui';
import { InternalConfirmModal } from '@/app/_components/InternalConfirmModal';
import { InternalField } from '@/app/_components/InternalForm';
import { InternalModal } from '@/app/_components/InternalModal';
import { InternalEmpty, InternalPanel, InternalTableFoot, InternalTableHead } from '@/app/_components/InternalPanel';
import { PermissionLegend, PermissionMatrix } from '@/app/_components/PermissionMatrix';
import { INTERNAL_GROUPS, INTERNAL_RESOURCES, INTERNAL_ROLES } from '@/lib/data/permissions';
import { RANK_GRANTS, RANK_TONE, STAFF, STAFF_RANKS, type StaffRank, type StaffRecord } from '@/lib/data/settings';
import { findTenant } from '@/lib/data/tenants';
import {
  EMAIL,
  errorSummary,
  hasErrors,
  maxLength,
  notIn,
  validate,
  type FormErrors,
  type FormSpec,
} from '@/lib/validation/form';

// 새 계정은 언제나 `조회` 로 시작한다 — 처음부터 되돌릴 수 없는 일까지 열어 주지 않는다.
const EMPTY_DRAFT = { name: '', email: '', team: '', rank: '조회' as StaffRank };

type StaffField = 'name' | 'email' | 'team';

/**
 * 이 폼이 받는 값. **별표와 검사가 이 표 하나를 읽는다.**
 *
 * `email` 의 중복 검사는 여기 없다 — 이미 있는 계정인지는 폼 밖의 사실(현재 목록)이라
 * 화면에서 규칙을 만들어 붙인다(`specFor`).
 */
const STAFF_FORM: FormSpec<StaffField> = {
  name: { label: '이름', required: true, hint: '직원 이름을 그대로 적습니다.', rules: [maxLength(20)] },
  email: { label: '계정', required: true, hint: '사내 메일 주소로 들어옵니다.', rules: [EMAIL] },
  team: {
    label: '소속',
    required: true,
    hint: '누구에게 물어야 하는지가 목록에서 바로 보여야 합니다.',
    rules: [maxLength(20)],
  },
};

/*
  `상태` 를 전용 열로 둔다.

  전에는 중지된 계정임을 **이름 옆 작은 칩**으로만 알렸다. 탭(`쓰는 계정`/`중지`)으로 거를
  수는 있었지만, `전체` 탭에서 훑을 때 상태가 세로로 정렬되지 않아 눈에 걸리지 않았다.
  다른 목록은 전부 상태 열 하나에 배지가 세로로 서는데 이 화면만 달랐다.
*/
const COLUMNS = [
  { label: '이름 · 소속', span: 'lg:col-span-3' },
  { label: '계정', span: 'lg:col-span-2' },
  { label: '맡은 고객사', span: 'lg:col-span-2' },
  { label: '마지막 접속', span: 'lg:col-span-2' },
  { label: '직급', span: 'lg:col-span-1 lg:text-center' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 관리자 목록.
 *
 * 목록 위에 **직급이 무엇을 여는지**를 먼저 적는다. 직급 이름만 보고 고르면 무엇을 주는지
 * 모른 채 주게 되고, 되돌릴 수 없는 일까지 열어 준 것을 나중에 안다.
 *
 * 쓰지 않는 계정을 지우지 않고 **중지**로 두는 이유: 지난 기록에 누가 무엇을 고쳤는지가
 * 이름으로 남아 있다. 계정을 지우면 그 기록이 이름 없는 것이 된다.
 */
export function StaffListView() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<StaffRecord[]>(STAFF);
  const [creating, setCreating] = useState(false);
  /** 수정 중인 계정 id. 비어 있으면 등록 창이다 — 창 하나가 두 일을 한다 */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  /*
    탭을 직급이 아니라 **쓰는지 중지인지**로 가른다. 직급은 무엇을 열어 주는지의 이야기이고,
    이 목록을 여는 사람이 먼저 묻는 것은 "지금 들어올 수 있는 사람이 누구인가" 이기 때문이다.
  */
  const tabs: ListToolbarTab[] = [
    { id: 'all', label: '전체', count: rows.length },
    { id: 'active', label: '쓰는 계정', count: rows.filter((staff) => staff.active).length },
    { id: 'stopped', label: '중지', count: rows.filter((staff) => !staff.active).length },
  ];

  const filters: ListFilterField[] = [
    { id: 'rank', label: '직급', options: STAFF_RANKS.map((item) => ({ value: item, label: item })) },
  ];

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const rank = filterValues.rank ?? ALL_VALUE;
    return rows.filter((staff) => {
      if (tab === 'active' && !staff.active) return false;
      if (tab === 'stopped' && staff.active) return false;
      if (rank !== ALL_VALUE && staff.rank !== rank) return false;
      if (!keyword) return true;
      return (
        staff.name.toLowerCase().includes(keyword) ||
        staff.email.toLowerCase().includes(keyword) ||
        staff.team.toLowerCase().includes(keyword)
      );
    }).sort((a, b) => {
      // 중지된 계정은 아래로 내린다 — 지금 일하는 사람이 먼저 읽혀야 한다.
      if (a.active !== b.active) return a.active ? -1 : 1;
      return b.lastSignedInAt.localeCompare(a.lastSignedInAt);
    });
  }, [rows, search, tab, filterValues]);

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

  const active = rows.filter((staff) => staff.active);
  const admins = active.filter((staff) => staff.rank === '관리자');

  const [errors, setErrors] = useState<FormErrors<StaffField>>({});
  const [submitted, setSubmitted] = useState(false);
  /** 저장을 누른 뒤 확인을 기다리는 중인가. */
  const [pending, setPending] = useState(false);

  /*
    이미 있는 계정인지는 **폼 밖의 사실**(지금 목록)이라 표에 못 박아 둘 수 없다.
    화면이 그때그때 규칙을 만들어 붙인다.
  */
  const spec: FormSpec<StaffField> = {
    ...STAFF_FORM,
    email: {
      ...STAFF_FORM.email,
      rules: [
        EMAIL,
        /* 고칠 때 자기 자신은 겹치는 것으로 세지 않는다 — 이메일을 그대로 두고 이름만 고칠 수 있어야 한다. */
        notIn(
          rows.filter((staff) => staff.id !== editingId).map((staff) => staff.email),
          '이미 등록된 계정입니다.',
        ),
      ],
    },
  };

  const commit = (next: typeof draft) => {
    setDraft(next);
    if (submitted) setErrors(validate(spec, next));
  };

  /*
    줄을 누르면 **그 계정의 값이 담긴 같은 창**이 열린다. 읽기 전용 창을 따로 두지 않는 이유:
    여기서 확인하는 값(직급·소속)은 확인하러 들어왔다가 그 자리에서 고치게 되는 값이다.
  */
  const openNew = () => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setSubmitted(false);
    setCreating(true);
  };

  const openEdit = (staff: StaffRecord) => {
    setEditingId(staff.id);
    setDraft({ name: staff.name, email: staff.email, team: staff.team, rank: staff.rank });
    setErrors({});
    setSubmitted(false);
    setCreating(true);
  };

  /**
   * 검사만 하고 **확인 창을 연다.**
   *
   * 틀린 값은 여기서 걸려 확인 창까지 가지 않는다 — 물어볼 것이 없는데 한 번 더 누르게 하면
   * 그 창은 곧 눈에 들어오지 않게 된다.
   */
  const askCreate = () => {
    setSubmitted(true);
    const found = validate(spec, draft);
    setErrors(found);

    /*
      **끝까지 검사하고 한꺼번에 알린다.** 전에는 첫 실패에서 `return` 했기 때문에,
      이름과 이메일이 둘 다 틀렸으면 이름을 고쳐 다시 누르고 나서야 이메일이 틀렸다는 것을 알았다.
    */
    if (hasErrors(found)) {
      toast.error({
        message: editingId ? '저장하지 못했습니다.' : '등록하지 못했습니다.',
        detail: errorSummary(found),
      });
      return;
    }

    setPending(true);
  };

  /** 확인을 지난 뒤 실제로 고치는 자리. */
  const create = () => {
    setPending(false);

    if (editingId) {
      /* 맡은 고객사와 쓰는지 여부는 이 창에서 다루지 않는다 — 있던 값을 지우지 않도록 그대로 둔다. */
      setRows((previous) =>
        previous.map((staff) =>
          staff.id === editingId
            ? {
                ...staff,
                name: draft.name.trim(),
                email: draft.email.trim(),
                team: draft.team.trim(),
                rank: draft.rank,
              }
            : staff,
        ),
      );
      setCreating(false);
      setEditingId(null);
      toast.success({ message: '계정을 저장했습니다.', detail: `${draft.name.trim()} · ${draft.rank}` });
      return;
    }

    const record: StaffRecord = {
      id: `S-${`${rows.length + 1}`.padStart(2, '0')}`,
      name: draft.name.trim(),
      email: draft.email.trim(),
      team: draft.team.trim(),
      rank: draft.rank,
      tenants: [],
      lastSignedInAt: '접속 전',
      active: true,
    };

    setRows((previous) => [...previous, record]);
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setSubmitted(false);
    setCreating(false);
    toast.success({ message: '관리자를 등록했습니다.', detail: `${record.name} · ${record.rank}` });
  };

  return (
    <>
      <PageHeading title="관리자" description="콘솔에 들어오는 직원과 직급을 관리하세요." />

      <ListToolbar
        tabs={tabs}
        activeTabId={tab}
        onTabChange={setTab}
        searchId="staff-search"
        searchLabel="관리자 검색"
        searchHint="이름, 계정, 소속으로 검색"
        searchValue={search}
        onSearchChange={setSearch}
        actionLabel="관리자 등록"
        onAction={openNew}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(id, value) => setFilterValues((previous) => ({ ...previous, [id]: value }))}
        onFilterReset={() => setFilterValues({})}
      />

      <InternalPanel
        title="계정"
        description="이 콘솔에 들어오는 우리 직원입니다. 고객사가 쓰는 권한은 구독 · 권한에 있습니다."
      >
        <InternalTableHead columns={COLUMNS} lead={<SelectAllCell checked={allChecked} indeterminate={selectedVisible.length > 0} onChange={(checked) => setSelectedIds(checked ? visibleIds : [])} />} />

        {visible.length === 0 ? (
          <InternalEmpty>조건에 맞는 계정이 없습니다.</InternalEmpty>
        ) : (
          <div className="flex flex-col">
            {visible.map((staff: StaffRecord, index) => (
              <div
                key={staff.id}
                role="button"
                tabIndex={0}
                onClick={() => openEdit(staff)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openEdit(staff);
                  }
                }}
                className="group grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 text-left transition-colors duration-150 last:border-b-0 hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 lg:grid-cols-12 lg:items-center lg:gap-y-0"
              >
                <RowSelectCell
                  checked={selectedIds.includes(staff.id)}
                  onChange={(checked) => toggleRow(staff.id, checked)}
                  label={`${staff.name} 선택`}
                  index={index}
                />

                <div className="min-w-0 lg:col-span-3">
                  <p className="min-w-0 truncate text-sm font-medium">{staff.name}</p>
                  <p className="min-w-0 truncate text-xs text-ink-faint">{staff.team}</p>
                </div>

                <div className="flex min-w-0 items-baseline gap-2 lg:col-span-2">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">계정</span>
                  <span className="min-w-0 truncate font-mono text-xs text-ink-muted">{staff.email}</span>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-1.5 lg:col-span-2">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">맡은 고객사</span>
                  {staff.tenants.length === 0 ? (
                    <span className="text-xs text-ink-faint">
                      {staff.rank === '관리자' ? '전체' : '없음'}
                    </span>
                  ) : (
                    staff.tenants.map((tenantId) => (
                      <span
                        key={tenantId}
                        className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2.5 py-1 text-xs text-ink-muted"
                      >
                        {findTenant(tenantId)?.name ?? tenantId}
                      </span>
                    ))
                  )}
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-2">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">마지막 접속</span>
                  <span className="font-mono text-xs tabular-nums text-ink-muted">{staff.lastSignedInAt}</span>
                </div>

                <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">직급</span>
                  <Badge tone={RANK_TONE[staff.rank]}>
                    {staff.rank}
                  </Badge>
                </div>

                {/* 색만으로 알리지 않는다 — 배지 안에 언제나 글자가 들어간다. */}
                <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">상태</span>
                  <Badge tone={staff.active ? 'ok' : 'neutral'}>{staff.active ? '사용' : '중지'}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <InternalTableFoot>
          <p>
            총 <span className="font-medium tabular-nums text-ink">{visible.length}</span>개 계정
          </p>
          <p>중지된 계정은 지우지 않습니다 — 지난 기록에 이름이 남아 있습니다.</p>
        </InternalTableFoot>
      </InternalPanel>

      <InternalPanel
        title="직급이 여는 것"
        description="직급 셋이 각각 어디까지 만질 수 있는지입니다. 계정을 만들 때 이 표를 보고 고릅니다."
      >
        {/*
          **최소 권한이 기본이다.** 새 계정은 언제나 `조회` 로 시작한다 — 필요해지면 올리는
          편이, 열어 두고 사고가 난 뒤에 줄이는 것보다 싸다.
        */}
        <PermissionMatrix
          roles={INTERNAL_ROLES}
          resources={INTERNAL_RESOURCES}
          groups={INTERNAL_GROUPS}
        />
        <PermissionLegend />
      </InternalPanel>

      <InternalModal
        open={creating}
        title={editingId ? '관리자 수정' : '관리자 등록'}
        description={
          editingId
            ? '맡은 고객사와 중지 여부는 이 창에서 바꾸지 않습니다 — 다른 화면의 기록이 함께 걸립니다.'
            : '새 계정은 조회로 시작합니다. 처음부터 되돌릴 수 없는 일까지 열어 주지 않습니다.'
        }
        onClose={() => {
          setCreating(false);
          setEditingId(null);
        }}
        onSubmit={askCreate}
        submitLabel={editingId ? '저장' : '등록'}
      >
        <InternalField
          label={spec.name.label}
          htmlFor="staff-new-name"
          required={spec.name.required}
          {...(errors.name ? { error: errors.name } : { hint: spec.name.hint })}
        >
          <HintInput
            id="staff-new-name"
            type="text"
            hint="예: 정소미"
            value={draft.name}
            aria-required
            onChange={(event) => commit({ ...draft, name: event.target.value })}
            invalid={Boolean(errors.name)}
            {...(errors.name ? { 'aria-describedby': 'staff-new-name-error' } : {})}
          />
        </InternalField>

        <InternalField
          label={spec.email.label}
          htmlFor="staff-new-email"
          required={spec.email.required}
          {...(errors.email ? { error: errors.email } : { hint: spec.email.hint })}
        >
          <HintInput
            id="staff-new-email"
            type="email"
            hint="name@winpilot.test"
            value={draft.email}
            aria-required
            onChange={(event) => commit({ ...draft, email: event.target.value })}
            invalid={Boolean(errors.email)}
            {...(errors.email ? { 'aria-describedby': 'staff-new-email-error' } : {})}
          />
        </InternalField>

        <InternalField
          label={spec.team.label}
          htmlFor="staff-new-team"
          required={spec.team.required}
          {...(errors.team ? { error: errors.team } : { hint: spec.team.hint })}
        >
          <HintInput
            id="staff-new-team"
            type="text"
            hint="예: 고객성공"
            value={draft.team}
            aria-required
            onChange={(event) => commit({ ...draft, team: event.target.value })}
            invalid={Boolean(errors.team)}
            {...(errors.team ? { 'aria-describedby': 'staff-new-team-error' } : {})}
          />
        </InternalField>

        <InternalField label="직급" hint={RANK_GRANTS[draft.rank]}>
          <Dropdown
            id="staff-new-rank"
            label="직급 선택"
            options={STAFF_RANKS.map((item) => ({ value: item, label: item }))}
            value={draft.rank}
            onChange={(next) => commit({ ...draft, rank: next as StaffRank })}
          />
        </InternalField>
      </InternalModal>

      {/*
        계정은 **콘솔에 들어올 수 있는 사람**을 늘리는 일이다. 직급이 곧 어디까지 만질 수 있는지를
        정하므로, 무엇을 만드는지 한 줄로 다시 보여 주고 누르게 한다.
      */}
      <InternalConfirmModal
        open={pending}
        title={editingId ? '이 내용으로 저장할까요' : '이 계정을 만들까요'}
        message="콘솔에 들어올 수 있는 계정입니다. 직급이 곧 어디까지 만질 수 있는지를 정합니다."
        detail={`${draft.name.trim()} · ${draft.rank} · ${draft.email.trim()}`}
        confirmLabel={editingId ? '저장' : '등록'}
        onConfirm={create}
        onCancel={() => setPending(false)}
      />
    </>
  );
}
