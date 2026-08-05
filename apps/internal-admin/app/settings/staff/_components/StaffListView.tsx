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
  RANK_GRANTS,
  RANK_TONE,
  STAFF,
  STAFF_RANKS,
  type StaffRank,
  type StaffRecord,
} from '@/lib/data/settings';
import { findTenant } from '@/lib/data/tenants';

// 새 계정은 언제나 `조회` 로 시작한다 — 처음부터 되돌릴 수 없는 일까지 열어 주지 않는다.
const EMPTY_DRAFT = { name: '', email: '', team: '', rank: '조회' as StaffRank };

const COLUMNS = [
  { label: '이름 · 소속', span: 'lg:col-span-3' },
  { label: '계정', span: 'lg:col-span-3' },
  { label: '맡은 고객사', span: 'lg:col-span-3' },
  { label: '마지막 접속', span: 'lg:col-span-2' },
  { label: '직급', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 사내 계정 목록.
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
  const [rank, setRank] = useState('all');
  const [rows, setRows] = useState<StaffRecord[]>(STAFF);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter((staff) => {
      if (rank !== 'all' && staff.rank !== rank) return false;
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
  }, [rows, search, rank]);

  const active = rows.filter((staff) => staff.active);
  const admins = active.filter((staff) => staff.rank === '관리자');

  const create = () => {
    if (!draft.name.trim() || !draft.team.trim()) {
      toast.error({ message: '등록하지 못했습니다.', detail: '이름과 소속은 반드시 입력해야 합니다.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
      toast.error({ message: '등록하지 못했습니다.', detail: '이메일 형식이 올바르지 않습니다.' });
      return;
    }
    if (rows.some((staff) => staff.email === draft.email.trim())) {
      toast.error({ message: '등록하지 못했습니다.', detail: '이미 있는 계정입니다.' });
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
    setCreating(false);
    toast.success({ message: '사내 계정을 등록했습니다.', detail: `${record.name} · ${record.rank}` });
  };

  return (
    <>
      <InternalSummary
        cards={[
          { label: '쓰는 계정', value: `${active.length}개`, hint: `전체 ${rows.length}개` },
          {
            label: '관리자',
            value: `${admins.length}명`,
            hint: '되돌릴 수 없는 일까지 할 수 있는 사람입니다.',
          },
          { label: '중지된 계정', value: `${rows.length - active.length}개`, hint: '기록을 위해 지우지 않습니다.' },
        ]}
      />

      <InternalPanel
        title="직급이 여는 것"
        description="직급 이름만 보고 고르면 무엇을 주는지 모른 채 주게 됩니다."
      >
        <dl className="flex flex-col">
          {STAFF_RANKS.map((item) => (
            <div
              key={item}
              className="flex flex-col gap-1 border-b border-border px-6 py-4 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4"
            >
              <dt className="shrink-0">
                <span
                  className={`inline-block shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${RANK_TONE[item]}`}
                >
                  {item}
                </span>
              </dt>
              <dd className="min-w-0 flex-1 text-sm leading-relaxed text-ink-muted">{RANK_GRANTS[item]}</dd>
            </div>
          ))}
        </dl>
      </InternalPanel>

      <InternalToolbar
        searchId="staff-search"
        searchLabel="사내 계정 검색"
        searchHint="이름, 계정, 소속으로 검색"
        search={search}
        onSearch={setSearch}
        filters={<InternalChips label="직급" options={STAFF_RANKS} value={rank} onChange={setRank} />}
        action={{ label: '사내 계정 등록', onClick: () => setCreating(true) }}
      />

      <InternalPanel
        title="계정"
        description="이 콘솔에 들어오는 우리 직원입니다. 고객사가 쓰는 권한은 구독 · 권한에 있습니다."
      >
        <InternalTableHead columns={COLUMNS} />

        {visible.length === 0 ? (
          <InternalEmpty>조건에 맞는 계정이 없습니다.</InternalEmpty>
        ) : (
          <div className="flex flex-col">
            {visible.map((staff: StaffRecord) => (
              <div
                key={staff.id}
                className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 last:border-b-0 lg:grid-cols-12 lg:items-center lg:gap-y-0"
              >
                <div className="min-w-0 lg:col-span-3">
                  <p className="truncate text-sm font-medium">
                    {staff.name}
                    {/* 중지를 색이 아니라 글자로도 알린다. */}
                    {!staff.active && (
                      <span className="ml-1.5 shrink-0 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 text-[10px] text-ink-faint">
                        중지
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-ink-faint">{staff.team}</p>
                </div>

                <div className="flex min-w-0 items-baseline gap-2 lg:col-span-3">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">계정</span>
                  <span className="min-w-0 truncate font-mono text-xs text-ink-muted">{staff.email}</span>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-1.5 lg:col-span-3">
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
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${RANK_TONE[staff.rank]}`}
                  >
                    {staff.rank}
                  </span>
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

      <InternalModal
        open={creating}
        title="사내 계정 등록"
        description="새 계정은 조회로 시작합니다. 처음부터 되돌릴 수 없는 일까지 열어 주지 않습니다."
        onClose={() => setCreating(false)}
        onSubmit={create}
        submitLabel="등록"
      >
        <InternalField label="이름" htmlFor="staff-new-name">
          <HintInput
            id="staff-new-name"
            type="text"
            hint="직원 이름"
            value={draft.name}
            onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))}
            invalid={!draft.name.trim()}
          />
        </InternalField>

        <InternalField label="계정" htmlFor="staff-new-email" hint="사내 메일 주소로 들어옵니다.">
          <HintInput
            id="staff-new-email"
            type="text"
            hint="name@winpilot.test"
            value={draft.email}
            onChange={(event) => setDraft((previous) => ({ ...previous, email: event.target.value }))}
            invalid={!draft.email.trim()}
          />
        </InternalField>

        <InternalField label="소속" htmlFor="staff-new-team" hint="누구에게 물어야 하는지가 목록에서 바로 보여야 합니다.">
          <HintInput
            id="staff-new-team"
            type="text"
            hint="예: 고객성공"
            value={draft.team}
            onChange={(event) => setDraft((previous) => ({ ...previous, team: event.target.value }))}
            invalid={!draft.team.trim()}
          />
        </InternalField>

        <InternalField label="직급" hint={RANK_GRANTS[draft.rank]}>
          <Dropdown
            id="staff-new-rank"
            label="직급 선택"
            options={STAFF_RANKS.map((item) => ({ value: item, label: item }))}
            value={draft.rank}
            onChange={(next) => setDraft((previous) => ({ ...previous, rank: next as StaffRank }))}
          />
        </InternalField>
      </InternalModal>
    </>
  );
}
