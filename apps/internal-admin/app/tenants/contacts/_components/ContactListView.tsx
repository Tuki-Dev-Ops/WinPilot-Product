'use client';

import { useMemo, useState } from 'react';
import { ALL_VALUE, Badge, Dropdown, HintInput, ListToolbar, PageHeading, RowSelectCell, SelectAllCell, useToast, type ListFilterField, type ListToolbarTab } from '@winpilot/ui';
import { InternalField } from '@/app/_components/InternalForm';
import { InternalModal } from '@/app/_components/InternalModal';
import { InternalEmpty, InternalPanel, InternalTableFoot, InternalTableHead } from '@/app/_components/InternalPanel';
import { CONTACT_ROLES, CONTACTS, maskPhone, ROLE_MEANING, ROLE_TONE, type ContactRecord, type ContactRole } from '@/lib/data/contacts';
import { findTenant, TENANTS } from '@/lib/data/tenants';
import {
  EMAIL,
  PHONE,
  errorSummary,
  hasErrors,
  maxLength,
  validate,
  type FormErrors,
  type FormSpec,
} from '@/lib/validation/form';

type ContactField = 'name' | 'title' | 'email' | 'phone';

/** 이 폼이 받는 값. **별표와 검사가 이 표 하나를 읽는다.** */
const CONTACT_FORM: FormSpec<ContactField> = {
  name: { label: '이름', required: true, hint: '고객사 담당자의 이름입니다.', rules: [maxLength(20)] },
  title: { label: '직함', required: true, hint: '고객사 안에서의 자리입니다.', rules: [maxLength(20)] },
  email: { label: '이메일', required: true, hint: '연락이 닿는 주소여야 합니다.', rules: [EMAIL] },
  // 연락처는 비울 수 있다 — 메일로만 오가는 담당자가 있다.
  phone: { label: '연락처', hint: '숫자와 하이픈만 넣습니다. 비워 두어도 됩니다.', rules: [PHONE] },
};


const COLUMNS = [
  { label: '이름 · 직함', span: 'lg:col-span-3' },
  { label: '고객사', span: 'lg:col-span-2' },
  { label: '연락처', span: 'lg:col-span-3' },
  { label: '역할', span: 'lg:col-span-2 lg:text-center' },
  { label: '대표', span: 'lg:col-span-1 lg:text-center' },
];

const EMPTY_DRAFT = {
  tenantId: TENANTS[0]?.id ?? '',
  name: '',
  role: CONTACT_ROLES[0] as ContactRole,
  title: '',
  email: '',
  phone: '',
};

/**
 * 고객사 담당자 목록.
 *
 * 목록 위에 **역할이 무엇을 뜻하는지** 먼저 적는다. 역할 이름만으로는 누구에게 무엇을
 * 물어야 하는지 갈리지 않고, 갈리지 않으면 결국 총괄에게 다 물어보게 된다.
 *
 * **대표 담당자가 없는 고객사**를 따로 센다. 급할 때 누구에게 먼저 걸지 정해져 있지 않으면
 * 목록을 처음부터 읽어야 하고, 장애 상황에서 그 몇 분이 가장 비싸다.
 *
 * **프론트엔드 전용** — 등록 결과는 이 화면에만 반영된다.
 */
export function ContactListView() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<ContactRecord[]>(CONTACTS);
  const [creating, setCreating] = useState(false);
  /** 수정 중인 담당자 id. 비어 있으면 등록 창이다 — 창 하나가 두 일을 한다 */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const tabs: ListToolbarTab[] = useMemo(
    () => [
      { id: 'all', label: '전체', count: rows.length },
      ...CONTACT_ROLES.map((item) => ({
        id: item,
        label: item,
        count: rows.filter((contact) => contact.role === item).length,
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
      .filter((contact) => {
        if (tab !== 'all' && contact.role !== tab) return false;
        if (tenantId !== ALL_VALUE && contact.tenantId !== tenantId) return false;
        if (!keyword) return true;
        const tenant = findTenant(contact.tenantId)?.name ?? '';
        return (
          contact.name.toLowerCase().includes(keyword) ||
          contact.email.toLowerCase().includes(keyword) ||
          contact.title.toLowerCase().includes(keyword) ||
          tenant.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        if (a.tenantId !== b.tenantId) return a.tenantId.localeCompare(b.tenantId);
        return a.primary === b.primary ? 0 : a.primary ? -1 : 1;
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

  const withoutPrimary = TENANTS.filter(
    (tenant) => !rows.some((contact) => contact.tenantId === tenant.id && contact.primary),
  );

  const [errors, setErrors] = useState<FormErrors<ContactField>>({});
  const [submitted, setSubmitted] = useState(false);

  const commit = (next: typeof draft) => {
    setDraft(next);
    if (submitted) setErrors(validate(CONTACT_FORM, next));
  };

  /*
    줄을 누르면 **그 담당자의 값이 담긴 같은 창**이 열린다. 읽기 전용 창을 따로 만들지 않는
    이유: 여기서 확인하는 값(연락처·역할)은 확인하러 들어왔다가 그 자리에서 고치게 되는 값이다.
    창을 둘로 나누면 고치려고 다시 나갔다 들어와야 한다.
  */
  const openNew = () => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setSubmitted(false);
    setCreating(true);
  };

  const openEdit = (contact: ContactRecord) => {
    setEditingId(contact.id);
    setDraft({
      tenantId: contact.tenantId,
      name: contact.name,
      role: contact.role,
      title: contact.title,
      email: contact.email,
      phone: contact.phone,
    });
    setErrors({});
    setSubmitted(false);
    setCreating(true);
  };

  const create = () => {
    setSubmitted(true);
    const found = validate(CONTACT_FORM, draft);
    setErrors(found);
    // 끝까지 검사하고 한꺼번에 알린다 — 첫 실패에서 멈추면 고칠 때마다 다시 눌러야 한다.
    if (hasErrors(found)) {
      toast.error({
        message: editingId ? '저장하지 못했습니다.' : '등록하지 못했습니다.',
        detail: errorSummary(found),
      });
      return;
    }

    if (editingId) {
      /* 대표 여부와 메모는 이 창에서 다루지 않는다 — 있던 값을 지우지 않도록 그대로 둔다. */
      setRows((previous) =>
        previous.map((contact) =>
          contact.id === editingId
            ? {
                ...contact,
                tenantId: draft.tenantId,
                name: draft.name.trim(),
                role: draft.role,
                title: draft.title.trim(),
                email: draft.email.trim(),
                phone: draft.phone.replace(/[^0-9]/g, ''),
              }
            : contact,
        ),
      );
      setCreating(false);
      setEditingId(null);
      toast.success({ message: '담당자를 저장했습니다.', detail: `${draft.name.trim()} · ${draft.role}` });
      return;
    }

    /*
      새 담당자는 대표로 두지 않는다. 고객사마다 대표는 하나뿐인데 여기서 켜 주면 이미 있던
      대표와 둘이 되고, 급할 때 누구에게 걸지 다시 고르게 된다.
    */
    const record: ContactRecord = {
      id: `CT-${9007 + rows.length}`,
      tenantId: draft.tenantId,
      name: draft.name.trim(),
      role: draft.role,
      title: draft.title.trim(),
      email: draft.email.trim(),
      phone: draft.phone.replace(/[^0-9]/g, ''),
      primary: false,
      memo: '',
    };

    setRows((previous) => [...previous, record]);
    setDraft(EMPTY_DRAFT);
    setCreating(false);
    toast.success({
      message: '담당자를 등록했습니다.',
      detail: `${findTenant(record.tenantId)?.name ?? record.tenantId} · ${record.name} · ${record.role}`,
    });
  };

  return (
    <>
      <PageHeading title="담당자" description="고객사 담당자를 역할별로 확인하세요." />

      <ListToolbar
        tabs={tabs}
        activeTabId={tab}
        onTabChange={setTab}
        searchId="contact-search"
        searchLabel="담당자 검색"
        searchHint="이름, 직함, 이메일, 고객사로 검색"
        searchValue={search}
        onSearchChange={setSearch}
        actionLabel="담당자 등록"
        onAction={openNew}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(id, value) => setFilterValues((previous) => ({ ...previous, [id]: value }))}
        onFilterReset={() => setFilterValues({})}
      />

      <InternalPanel
        title="담당자"
        description="고객사마다 여럿일 수 있습니다. 대표로 표시한 사람이 급할 때 먼저 거는 사람입니다."
      >
        <InternalTableHead columns={COLUMNS} lead={<SelectAllCell checked={allChecked} indeterminate={selectedVisible.length > 0} onChange={(checked) => setSelectedIds(checked ? visibleIds : [])} />} />

        {visible.length === 0 ? (
          <InternalEmpty>조건에 맞는 담당자가 없습니다.</InternalEmpty>
        ) : (
          <div className="flex flex-col">
            {visible.map((contact, index) => (
              <div
                key={contact.id}
                role="button"
                tabIndex={0}
                onClick={() => openEdit(contact)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openEdit(contact);
                  }
                }}
                className="group grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 text-left transition-colors duration-150 last:border-b-0 hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 lg:grid-cols-12 lg:items-center lg:gap-y-0"
              >
                <RowSelectCell
                  checked={selectedIds.includes(contact.id)}
                  onChange={(checked) => toggleRow(contact.id, checked)}
                  label={`${contact.name} 선택`}
                  index={index}
                />

                <div className="min-w-0 lg:col-span-3">
                  <p className="min-w-0 truncate text-sm font-medium">{contact.name}</p>
                  <p className="min-w-0 truncate text-xs text-ink-faint">{contact.title}</p>
                  {/*
                    메모는 그 사람에 딸린 값이라 이름과 같은 칸에 둔다. 행 아래에 한 줄을 더 만들면
                    줄마다 높이가 달라져 표를 훑을 때 눈이 걸린다. 이름과 달리 길어질 수 있으므로
                    잘라 내지 않고 두 줄까지 접어 보인다 — 잘라 버리면 적어 둔 뜻이 없다.
                  */}
                  {contact.memo && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">{contact.memo}</p>
                  )}
                </div>

                <div className="flex min-w-0 items-baseline gap-2 lg:col-span-2">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">고객사</span>
                  <a
                    href={`/tenants/${contact.tenantId}`}
                    onClick={(event) => event.stopPropagation()}
                    className="min-w-0 truncate text-sm text-brand-700 underline underline-offset-2 dark:text-brand-300"
                  >
                    {findTenant(contact.tenantId)?.name ?? contact.tenantId}
                  </a>
                </div>

                <div className="flex min-w-0 flex-col gap-0.5 lg:col-span-3">
                  <span className="min-w-0 truncate font-mono text-xs text-ink-muted">{contact.email}</span>
                  {/* 목록에서는 가운데 자리를 가린다 — 어깨너머로 읽히지 않게. 상세는 사내 전용이라 그대로 둔다. */}
                  <span className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-faint">
                    {maskPhone(contact.phone)}
                  </span>
                </div>

                <div className="flex items-center gap-2 lg:col-span-2 lg:justify-center">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">역할</span>
                  <Badge tone={ROLE_TONE[contact.role]}>
                    {contact.role}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">대표</span>
                  <span className={`text-xs ${contact.primary ? 'font-medium text-ink' : 'text-ink-faint'}`}>
                    {contact.primary ? '대표' : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <InternalTableFoot>
          <p>
            총 <span className="font-medium tabular-nums text-ink">{visible.length}</span>명
          </p>
          {withoutPrimary.length > 0 && (
            <p className="text-signal-danger">
              대표가 없는 고객사: {withoutPrimary.map((tenant) => tenant.name).join(', ')}
            </p>
          )}
        </InternalTableFoot>
      </InternalPanel>

      <InternalModal
        open={creating}
        title={editingId ? '담당자 수정' : '담당자 등록'}
        description={
          editingId
            ? '대표 여부는 이 창에서 바꾸지 않습니다 — 고객사마다 하나뿐이라 옮기는 일에 가깝습니다.'
            : '새 담당자는 대표로 두지 않습니다. 고객사마다 대표는 하나여야 급할 때 누구에게 걸지 다시 고르지 않습니다.'
        }
        onClose={() => {
          setCreating(false);
          setEditingId(null);
        }}
        onSubmit={create}
        submitLabel={editingId ? '저장' : '등록'}
      >
        <InternalField label="고객사">
          <Dropdown
            id="contact-new-tenant"
            label="고객사 선택"
            options={TENANTS.map((tenant) => ({ value: tenant.id, label: tenant.name, hint: tenant.id }))}
            value={draft.tenantId}
            onChange={(next) => commit({ ...draft, tenantId: next })}
          />
        </InternalField>

        <InternalField
          label={CONTACT_FORM.name.label}
          htmlFor="contact-new-name"
          required={CONTACT_FORM.name.required}
          {...(errors.name ? { error: errors.name } : { hint: CONTACT_FORM.name.hint })}
        >
          <HintInput
            id="contact-new-name"
            type="text"
            hint="고객사 담당자 이름"
            value={draft.name}
            onChange={(event) => commit({ ...draft, name: event.target.value })}
            invalid={!draft.name.trim()}
          />
        </InternalField>

        <InternalField label="역할" hint={ROLE_MEANING[draft.role]}>
          <Dropdown
            id="contact-new-role"
            label="역할 선택"
            options={CONTACT_ROLES.map((item) => ({ value: item, label: item }))}
            value={draft.role}
            onChange={(next) => commit({ ...draft, role: next as ContactRole })}
          />
        </InternalField>

        <InternalField
          label={CONTACT_FORM.title.label}
          htmlFor="contact-new-title"
          required={CONTACT_FORM.title.required}
          {...(errors.title ? { error: errors.title } : { hint: CONTACT_FORM.title.hint })}
        >
          <HintInput
            id="contact-new-title"
            type="text"
            hint="예: 재무팀"
            value={draft.title}
            onChange={(event) => commit({ ...draft, title: event.target.value })}
            invalid={!draft.title.trim()}
          />
        </InternalField>

        <InternalField
          label={CONTACT_FORM.email.label}
          htmlFor="contact-new-email"
          required={CONTACT_FORM.email.required}
          {...(errors.email ? { error: errors.email } : { hint: CONTACT_FORM.email.hint })}
        >
          <HintInput
            id="contact-new-email"
            type="text"
            hint="name@example.com"
            value={draft.email}
            onChange={(event) => commit({ ...draft, email: event.target.value })}
            invalid={!draft.email.trim()}
          />
        </InternalField>

        <InternalField
          label={CONTACT_FORM.phone.label}
          htmlFor="contact-new-phone"
          {...(errors.phone ? { error: errors.phone } : { hint: CONTACT_FORM.phone.hint })}
        >
          <HintInput
            id="contact-new-phone"
            type="text"
            hint="01012345678"
            value={draft.phone}
            onChange={(event) =>
              commit({ ...draft, phone: event.target.value.replace(/[^0-9]/g, '') })
            }
          />
        </InternalField>
      </InternalModal>
    </>
  );
}
