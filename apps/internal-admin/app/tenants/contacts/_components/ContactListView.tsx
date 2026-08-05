'use client';

import { useMemo, useState } from 'react';
import { Dropdown, HintInput, useToast } from '@winpilot/ui';
import { InternalField } from '@/app/_components/InternalForm';
import { InternalModal } from '@/app/_components/InternalModal';
import {
  InternalEmpty,
  InternalPanel,
  InternalSummary,
  InternalTableFoot,
  InternalTableHead,
} from '@/app/_components/InternalPanel';
import { InternalChips, InternalToolbar } from '@/app/_components/InternalToolbar';
import {
  CONTACTS,
  CONTACT_ROLES,
  ROLE_MEANING,
  ROLE_TONE,
  maskPhone,
  type ContactRecord,
  type ContactRole,
} from '@/lib/data/contacts';
import { TENANTS, findTenant } from '@/lib/data/tenants';

const COLUMNS = [
  { label: '이름 · 직함', span: 'lg:col-span-3' },
  { label: '고객사', span: 'lg:col-span-2' },
  { label: '연락처', span: 'lg:col-span-4' },
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
  const [role, setRole] = useState('all');
  const [rows, setRows] = useState<ContactRecord[]>(CONTACTS);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows
      .filter((contact) => {
        if (role !== 'all' && contact.role !== role) return false;
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
  }, [rows, search, role]);

  const withoutPrimary = TENANTS.filter(
    (tenant) => !rows.some((contact) => contact.tenantId === tenant.id && contact.primary),
  );

  const create = () => {
    if (!draft.name.trim() || !draft.title.trim()) {
      toast.error({ message: '등록하지 못했습니다.', detail: '이름과 직함은 반드시 입력해야 합니다.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
      toast.error({ message: '등록하지 못했습니다.', detail: '이메일 형식이 올바르지 않습니다.' });
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
      <InternalSummary
        cards={[
          { label: '담당자', value: `${visible.length}명` },
          { label: '고객사', value: `${TENANTS.length}곳` },
          {
            label: '대표가 없는 고객사',
            value: `${withoutPrimary.length}곳`,
            tone: withoutPrimary.length > 0 ? 'text-signal-danger' : '',
            hint: '급할 때 누구에게 먼저 걸지 정해져 있지 않습니다.',
          },
        ]}
      />

      <InternalPanel
        title="역할이 뜻하는 것"
        description="역할 이름만으로는 누구에게 무엇을 물어야 하는지 갈리지 않습니다."
      >
        <dl className="flex flex-col">
          {CONTACT_ROLES.map((item) => (
            <div
              key={item}
              className="flex flex-col gap-1 border-b border-border px-6 py-4 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4"
            >
              <dt className="shrink-0">
                <span
                  className={`inline-block shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_TONE[item]}`}
                >
                  {item}
                </span>
              </dt>
              <dd className="min-w-0 flex-1 text-sm leading-relaxed text-ink-muted">{ROLE_MEANING[item]}</dd>
            </div>
          ))}
        </dl>
      </InternalPanel>

      <InternalToolbar
        searchId="contact-search"
        searchLabel="담당자 검색"
        searchHint="이름, 직함, 이메일, 고객사로 검색"
        search={search}
        onSearch={setSearch}
        filters={<InternalChips label="역할" options={CONTACT_ROLES} value={role} onChange={setRole} />}
        action={{ label: '담당자 등록', onClick: () => setCreating(true) }}
      />

      <InternalPanel
        title="담당자"
        description="고객사마다 여럿일 수 있습니다. 대표로 표시한 사람이 급할 때 먼저 거는 사람입니다."
      >
        <InternalTableHead columns={COLUMNS} />

        {visible.length === 0 ? (
          <InternalEmpty>조건에 맞는 담당자가 없습니다.</InternalEmpty>
        ) : (
          <div className="flex flex-col">
            {visible.map((contact) => (
              <div
                key={contact.id}
                className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 last:border-b-0 lg:grid-cols-12 lg:items-center lg:gap-y-0"
              >
                <div className="min-w-0 lg:col-span-3">
                  <p className="truncate text-sm font-medium">{contact.name}</p>
                  <p className="truncate text-xs text-ink-faint">{contact.title}</p>
                </div>

                <div className="flex min-w-0 items-baseline gap-2 lg:col-span-2">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">고객사</span>
                  <a
                    href={`/tenants/${contact.tenantId}`}
                    className="min-w-0 truncate text-sm text-brand-700 underline underline-offset-2 dark:text-brand-300"
                  >
                    {findTenant(contact.tenantId)?.name ?? contact.tenantId}
                  </a>
                </div>

                <div className="flex min-w-0 flex-col gap-0.5 lg:col-span-4">
                  <span className="truncate font-mono text-xs text-ink-muted">{contact.email}</span>
                  {/* 목록에서는 가운데 자리를 가린다 — 어깨너머로 읽히지 않게. 상세는 사내 전용이라 그대로 둔다. */}
                  <span className="truncate font-mono text-xs tabular-nums text-ink-faint">
                    {maskPhone(contact.phone)}
                  </span>
                </div>

                <div className="flex items-center gap-2 lg:col-span-2 lg:justify-center">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">역할</span>
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_TONE[contact.role]}`}
                  >
                    {contact.role}
                  </span>
                </div>

                <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">대표</span>
                  <span className={`text-xs ${contact.primary ? 'font-medium text-ink' : 'text-ink-faint'}`}>
                    {contact.primary ? '대표' : '—'}
                  </span>
                </div>

                {contact.memo && (
                  <p className="min-w-0 text-xs leading-relaxed text-ink-muted lg:col-span-12 lg:pt-1">
                    {contact.memo}
                  </p>
                )}
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
        title="담당자 등록"
        description="새 담당자는 대표로 두지 않습니다. 고객사마다 대표는 하나여야 급할 때 누구에게 걸지 다시 고르지 않습니다."
        onClose={() => setCreating(false)}
        onSubmit={create}
        submitLabel="등록"
      >
        <InternalField label="고객사">
          <Dropdown
            id="contact-new-tenant"
            label="고객사 선택"
            options={TENANTS.map((tenant) => ({ value: tenant.id, label: tenant.name, hint: tenant.id }))}
            value={draft.tenantId}
            onChange={(next) => setDraft((previous) => ({ ...previous, tenantId: next }))}
          />
        </InternalField>

        <InternalField label="이름" htmlFor="contact-new-name">
          <HintInput
            id="contact-new-name"
            type="text"
            hint="고객사 쪽 사람 이름"
            value={draft.name}
            onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))}
            invalid={!draft.name.trim()}
          />
        </InternalField>

        <InternalField label="역할" hint={ROLE_MEANING[draft.role]}>
          <Dropdown
            id="contact-new-role"
            label="역할 선택"
            options={CONTACT_ROLES.map((item) => ({ value: item, label: item }))}
            value={draft.role}
            onChange={(next) => setDraft((previous) => ({ ...previous, role: next as ContactRole }))}
          />
        </InternalField>

        <InternalField label="직함" htmlFor="contact-new-title" hint="고객사 안에서의 자리입니다.">
          <HintInput
            id="contact-new-title"
            type="text"
            hint="예: 재무팀"
            value={draft.title}
            onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))}
            invalid={!draft.title.trim()}
          />
        </InternalField>

        <InternalField label="이메일" htmlFor="contact-new-email">
          <HintInput
            id="contact-new-email"
            type="text"
            hint="name@example.com"
            value={draft.email}
            onChange={(event) => setDraft((previous) => ({ ...previous, email: event.target.value }))}
            invalid={!draft.email.trim()}
          />
        </InternalField>

        <InternalField label="연락처" htmlFor="contact-new-phone" hint="숫자만 넣습니다. 비워 두어도 됩니다.">
          <HintInput
            id="contact-new-phone"
            type="text"
            hint="01012345678"
            value={draft.phone}
            onChange={(event) =>
              setDraft((previous) => ({ ...previous, phone: event.target.value.replace(/[^0-9]/g, '') }))
            }
          />
        </InternalField>
      </InternalModal>
    </>
  );
}
