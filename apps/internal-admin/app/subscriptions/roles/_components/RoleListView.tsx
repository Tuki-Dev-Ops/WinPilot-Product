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
import { PLANS, ROLES, plansWith, type RoleRecord } from '@/lib/data/subscriptions';

const COLUMNS = [
  { label: '권한', span: 'lg:col-span-3' },
  { label: '여는 것', span: 'lg:col-span-4' },
  { label: '열리는 플랜', span: 'lg:col-span-3' },
  { label: '끌 수 있음', span: 'lg:col-span-2 lg:text-center' },
];

const OPTIONAL = ['끌 수 있음', '끌 수 없음'] as const;

const EMPTY_DRAFT = { name: '', grants: '', from: PLANS[0]?.id ?? '' };

/**
 * 권한 목록.
 *
 * **어느 플랜부터 열리는지**를 권한마다 적는다. 플랜 화면에서는 "이 플랜이 무엇을 켜는가" 를
 * 읽고, 여기서는 "이 권한을 쓰려면 얼마부터인가" 를 읽는다 — 같은 관계를 양쪽에서 묻기 때문에
 * 두 화면 모두에 적는다.
 *
 * 끌 수 없는 권한을 따로 표시하는 이유: 제품이 도는 데 필요한 것이라 고객사가 꺼 달라고 해도
 * 꺼 줄 수 없다. 그 사실을 화면에 두지 않으면 매번 말로 설명하게 된다.
 */
export function RoleListView() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [optional, setOptional] = useState('all');
  const [rows, setRows] = useState<RoleRecord[]>(ROLES);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter((role) => {
      if (optional !== 'all' && (optional === '끌 수 있음') !== role.optional) return false;
      if (!keyword) return true;
      return (
        role.name.toLowerCase().includes(keyword) ||
        role.grants.toLowerCase().includes(keyword) ||
        role.id.toLowerCase().includes(keyword)
      );
    });
  }, [rows, search, optional]);

  const fixed = rows.filter((role) => !role.optional);

  const create = () => {
    if (!draft.name.trim() || !draft.grants.trim()) {
      toast.error({ message: '등록하지 못했습니다.', detail: '권한 이름과 여는 것을 모두 적어 주세요.' });
      return;
    }

    /*
      새 권한은 **끌 수 있는 것**으로 만든다. 끌 수 없는 권한은 제품이 도는 데 필요한 것이라,
      화면에서 만들어지는 것이 아니라 제품이 정하는 것이다.
    */
    const record: RoleRecord = {
      id: `R-${`${rows.length + 1}`.padStart(2, '0')}`,
      name: draft.name.trim(),
      grants: draft.grants.trim(),
      from: draft.from,
      optional: true,
    };

    setRows((previous) => [...previous, record]);
    setDraft(EMPTY_DRAFT);
    setCreating(false);
    toast.success({ message: '권한을 등록했습니다.', detail: `${record.name} · 끌 수 있는 권한으로 만들었습니다.` });
  };

  return (
    <>
      <InternalSummary
        cards={[
          { label: '권한', value: `${rows.length}개` },
          { label: '끌 수 없는 권한', value: `${fixed.length}개`, hint: '제품이 도는 데 필요한 것입니다.' },
          { label: '플랜', value: `${PLANS.length}개`, hint: '권한을 켜는 것은 플랜입니다.' },
        ]}
      />

      <InternalToolbar
        searchId="role-search"
        searchLabel="권한 검색"
        searchHint="권한 이름, 여는 것으로 검색"
        search={search}
        onSearch={setSearch}
        filters={<InternalChips label="끌 수 있는지" options={OPTIONAL} value={optional} onChange={setOptional} />}
        action={{ label: '권한 등록', onClick: () => setCreating(true) }}
      />

      <InternalPanel
        title="권한"
        description="고객사가 자기 콘솔에서 쓰는 권한입니다. 이 콘솔에 들어오는 우리 직원의 권한은 설정 · 사내 계정에 있습니다."
      >
        <InternalTableHead columns={COLUMNS} />

        {visible.length === 0 ? (
          <InternalEmpty>조건에 맞는 권한이 없습니다.</InternalEmpty>
        ) : (
          <div className="flex flex-col">
            {visible.map((role: RoleRecord) => (
              <div
                key={role.id}
                className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 last:border-b-0 lg:grid-cols-12 lg:items-center lg:gap-y-0"
              >
                <div className="min-w-0 lg:col-span-3">
                  <p className="truncate text-sm font-medium">{role.name}</p>
                  <p className="truncate font-mono text-xs text-ink-faint">{role.id}</p>
                </div>

                <p className="min-w-0 text-sm leading-relaxed text-ink-muted lg:col-span-4">{role.grants}</p>

                <div className="flex min-w-0 flex-wrap items-center gap-1.5 lg:col-span-3">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">열리는 플랜</span>
                  {plansWith(role.id).map((plan) => (
                    <span
                      key={plan.id}
                      className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${
                        plan.id === role.from
                          ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                          : 'bg-surface text-ink-muted'
                      }`}
                    >
                      {plan.name}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 lg:col-span-2 lg:justify-center">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">끌 수 있음</span>
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                      role.optional ? 'bg-surface text-ink-muted' : 'bg-signal-danger/12 text-signal-danger'
                    }`}
                  >
                    {role.optional ? '끌 수 있음' : '끌 수 없음'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <InternalTableFoot>
          <p>
            총 <span className="font-medium tabular-nums text-ink">{visible.length}</span>개 권한
          </p>
          <p>
            진하게 칠한 것이 그 권한이 <span className="font-medium text-ink">처음 열리는</span> 플랜입니다.
          </p>
        </InternalTableFoot>
      </InternalPanel>

      <InternalModal
        open={creating}
        title="권한 등록"
        description="새 권한은 끌 수 있는 것으로 만들어집니다. 끌 수 없는 권한은 제품이 도는 데 필요한 것이라 화면에서 만들지 않습니다."
        onClose={() => setCreating(false)}
        onSubmit={create}
        submitLabel="등록"
      >
        <InternalField label="권한 이름" htmlFor="role-new-name">
          <HintInput
            id="role-new-name"
            type="text"
            hint="예: 배송비 설정"
            value={draft.name}
            onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))}
            invalid={!draft.name.trim()}
          />
        </InternalField>

        <InternalField label="여는 것" htmlFor="role-new-grants" hint="고객사가 무엇을 할 수 있게 되는지 한 문장으로.">
          <HintInput
            id="role-new-grants"
            type="text"
            hint="예: 배송비 규칙을 만들고 고친다."
            value={draft.grants}
            onChange={(event) => setDraft((previous) => ({ ...previous, grants: event.target.value }))}
            invalid={!draft.grants.trim()}
          />
        </InternalField>

        <InternalField label="처음 열리는 플랜" hint="이 플랜부터 위로 모두 켜집니다.">
          <Dropdown
            id="role-new-from"
            label="플랜 선택"
            options={PLANS.map((plan) => ({ value: plan.id, label: plan.name, hint: plan.id }))}
            value={draft.from}
            onChange={(next) => setDraft((previous) => ({ ...previous, from: next }))}
          />
        </InternalField>
      </InternalModal>
    </>
  );
}
