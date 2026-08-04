'use client';

import { useMemo, useState, type MouseEvent } from 'react';
import { AdminBulkBar } from '@/app/_components/AdminBulkBar';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import { AdminListPager } from '@/app/_components/AdminListPager';
import { AdminListToolbar, ALL_VALUE, type AdminFilterField } from '@/app/_components/AdminListToolbar';
import { MemberFormModal, type MemberFormConfig, type MemberRecord } from '@/app/_components/MemberFormModal';
import { Checkbox, useToast } from '@winpilot/ui';
import { type MemberFormInput, type MemberFormMode } from '@/lib/validation/member-record';

const ROLES = ['최고 관리자', '운영', '상품 심사', 'CS'];

/** 프론트엔드 전용 — 서버 없이 이 배열이 목록의 원본이다. */
const INITIAL_STAFF: MemberRecord[] = [
  { id: 'S-004', state: '활성', name: '윤태경', nickname: '태경', email: 'taekyung.yoon@winpilot.test', countryCode: '+82', phone: '01020103040', role: '최고 관리자', marketingConsent: false, marketingConsentAt: null, joined: '2025-11-03', lastSeen: '2026-08-03 09:12' },
  { id: 'S-007', state: '활성', name: '문가영', nickname: '가영', email: 'gayoung.moon@winpilot.test', countryCode: '+82', phone: '01031415926', role: '운영', marketingConsent: false, marketingConsentAt: null, joined: '2026-01-12', lastSeen: '2026-08-03 08:47' },
  { id: 'S-011', state: '활성', name: '신동현', nickname: '동현', email: 'donghyun.shin@winpilot.test', countryCode: '+82', phone: '01027182818', role: '상품 심사', marketingConsent: false, marketingConsentAt: null, joined: '2026-03-02', lastSeen: '2026-08-02 18:30' },
  { id: 'S-013', state: '활성', name: '류하은', nickname: '하은', email: 'haeun.ryu@winpilot.test', countryCode: '+82', phone: '01016180339', role: 'CS', marketingConsent: false, marketingConsentAt: null, joined: '2026-04-20', lastSeen: '2026-08-02 17:05' },
  { id: 'S-015', state: '정지', name: '고은성', nickname: '은성', email: 'eunsung.ko@winpilot.test', countryCode: '+82', phone: '01014142135', role: 'CS', marketingConsent: false, marketingConsentAt: null, joined: '2026-05-08', lastSeen: '2026-07-15 11:20' },
];

const CONFIG: MemberFormConfig = {
  entityLabel: '관리자',
  idLabel: '관리자 고유ID',
  joinedLabel: '등록일',
  states: ['활성', '정지'],
  // 사용자와 달리 역할은 사람이 지정한다.
  role: { label: '역할', kind: 'select', options: ROLES },
};

const STATE_TONE: Record<string, string> = {
  활성: 'bg-signal-ok/12 text-signal-ok',
  정지: 'bg-signal-danger/12 text-signal-danger',
};

const ROLE_TONE: Record<string, string> = {
  '최고 관리자': 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
};

const TAB_STATE: Record<string, string | null> = { all: null, active: '활성', suspended: '정지' };
const TAB_LABEL: Record<string, string> = { all: '전체', active: '활성', suspended: '정지' };

// shrink-0 · whitespace-nowrap — 좁은 폭에서 flex 가 버튼을 눌러 글자가 접히는 것을 막는다.
const ACTION_BUTTON = 'h-8 shrink-0 whitespace-nowrap rounded-lg border px-3 text-sm transition-colors duration-150';

/** 행 클릭으로 상세가 열리므로, 행 안의 컨트롤은 자기 동작만 하도록 전파를 끊는다. */
const stopRowClick = (event: MouseEvent) => event.stopPropagation();

function nextStaffId(staff: MemberRecord[]): string {
  const max = staff.reduce((biggest, member) => Math.max(biggest, Number(member.id.replace('S-', ''))), 0);
  return `S-${`${max + 1}`.padStart(3, '0')}`;
}

function stamp(withTime: boolean): string {
  const now = new Date();
  const pad = (value: number) => `${value}`.padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return withTime ? `${date} ${pad(now.getHours())}:${pad(now.getMinutes())}` : date;
}

export function StaffListView() {
  const toast = useToast();
  const [staff, setStaff] = useState<MemberRecord[]>(INITIAL_STAFF);
  const [activeTabId, setActiveTabId] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<MemberFormMode>('create');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pendingSave, setPendingSave] = useState<MemberFormInput | null>(null);

  const detail = useMemo(() => staff.find((member) => member.id === detailId) ?? null, [staff, detailId]);

  const filterFields = useMemo<AdminFilterField[]>(
    () => [
      {
        id: 'role',
        label: '역할',
        options: [...new Set(staff.map((member) => member.role))].map((role) => ({ value: role, label: role })),
      },
      {
        id: 'country',
        label: '국가번호',
        options: [...new Set(staff.map((member) => member.countryCode))].map((code) => ({ value: code, label: code })),
      },
    ],
    [staff],
  );

  const matchesFilters = (member: MemberRecord) => {
    const role = filters.role ?? ALL_VALUE;
    if (role !== ALL_VALUE && member.role !== role) return false;

    const country = filters.country ?? ALL_VALUE;
    if (country !== ALL_VALUE && member.countryCode !== country) return false;

    return true;
  };

  const tabs = useMemo(
    () =>
      Object.keys(TAB_STATE).map((id) => {
        const state = TAB_STATE[id];
        return {
          id,
          label: TAB_LABEL[id] ?? id,
          count: state ? staff.filter((member) => member.state === state).length : staff.length,
        };
      }),
    [staff],
  );

  const visible = useMemo(() => {
    const state = TAB_STATE[activeTabId];
    const keyword = search.trim().toLowerCase();
    return staff.filter((member) => {
      if (state && member.state !== state) return false;
      if (!matchesFilters(member)) return false;
      if (!keyword) return true;
      return (
        member.name.toLowerCase().includes(keyword) ||
        member.nickname.toLowerCase().includes(keyword) ||
        member.email.toLowerCase().includes(keyword) ||
        member.role.toLowerCase().includes(keyword) ||
        member.id.toLowerCase().includes(keyword)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff, activeTabId, search, filters]);

  // 선택은 화면에 보이는 것만 대상으로 한다 — 탭이나 검색으로 가려진 항목이 함께 지워지면 안 된다.
  const visibleIds = visible.map((member) => member.id);
  const selectedVisible = selectedIds.filter((id) => visibleIds.includes(id));
  const allChecked = visible.length > 0 && selectedVisible.length === visible.length;

  const submit = (input: MemberFormInput) => {
    // 이메일은 계정 식별자다 — 겹치면 로그인 시 어느 쪽인지 가릴 수 없다.
    const email = input.email.trim().toLowerCase();
    if (staff.some((member) => member.email.toLowerCase() === email && member.id !== detailId)) {
      toast.error({ message: '이미 등록된 이메일입니다.', detail: input.email.trim() });
      return;
    }

    // 목록이 소리 없이 바뀌지 않도록, 반영 전에 무엇을 저장하는지 한 번 더 보여 준다.
    setPendingSave(input);
  };

  const applySave = () => {
    const input = pendingSave;
    if (!input) return;
    setPendingSave(null);

    if (mode === 'create') {
      const newId = nextStaffId(staff);
      setStaff((previous) => [
        {
          id: nextStaffId(previous),
          state: input.state,
          name: input.name.trim(),
          nickname: input.nickname.trim(),
          email: input.email.trim(),
          countryCode: input.countryCode,
          phone: input.phone.replace(/\D/g, ''),
          role: input.role,
          marketingConsent: input.marketingConsent,
          marketingConsentAt: input.marketingConsent ? stamp(false) : null,
          joined: stamp(false),
          lastSeen: stamp(true),
        },
        ...previous,
      ]);
      setActiveTabId('all');
      setSearch('');
      toast.success({ message: '관리자를 추가했습니다.', detail: `${input.name.trim()} · ${input.role} · ${newId}` });
    } else if (detailId) {
      setStaff((previous) =>
        previous.map((member) =>
          member.id === detailId
            ? {
                ...member,
                state: input.state,
                name: input.name.trim(),
                nickname: input.nickname.trim(),
                email: input.email.trim(),
                countryCode: input.countryCode,
                phone: input.phone.replace(/\D/g, ''),
                role: input.role,
                marketingConsent: input.marketingConsent,
                marketingConsentAt: input.marketingConsent ? (member.marketingConsentAt ?? stamp(false)) : null,
              }
            : member,
        ),
      );
      toast.success({ message: '관리자 정보를 저장했습니다.', detail: `${input.name.trim()} · ${detailId}` });
    }
    setModalOpen(false);
  };

  const openDetail = (id: string) => {
    setDetailId(id);
    setMode('view');
    setModalOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const targets = new Set(pendingDelete);
    const names = staff.filter((member) => targets.has(member.id)).map((member) => member.name);
    setStaff((previous) => previous.filter((member) => !targets.has(member.id)));
    setSelectedIds((previous) => previous.filter((id) => !targets.has(id)));
    setPendingDelete(null);
    toast.success({
      message: `관리자 ${targets.size}건을 삭제했습니다.`,
      detail: names.length > 2 ? `${names.slice(0, 2).join(', ')} 외 ${names.length - 2}명` : names.join(', '),
    });
  };

  return (
    <>
      <AdminListToolbar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        searchId="staff-search"
        searchLabel="관리자 검색"
        searchHint="이름, 닉네임, 이메일, 역할로 검색"
        searchValue={search}
        onSearchChange={setSearch}
        actionLabel="관리자 추가"
        onAction={() => {
          setDetailId(null);
          setMode('create');
          setModalOpen(true);
        }}
        filters={filterFields}
        filterValues={filters}
        onFilterChange={(id, value) => setFilters((previous) => ({ ...previous, [id]: value }))}
        onFilterReset={() => {
          setFilters({});
          toast.info('필터를 초기화했습니다.');
        }}
      />

      <AdminBulkBar
        count={selectedVisible.length}
        onClear={() => setSelectedIds([])}
        onDelete={() => setPendingDelete(selectedVisible)}
      />

      <section
        data-ssot-cid="b2c-admin/staff.list#AdminStaffListTable"
        className="overflow-hidden rounded-xl border border-border bg-canvas"
      >
        <div className="hidden gap-4 border-b border-border px-5 py-3 text-xs text-ink-faint lg:grid lg:grid-cols-12 lg:items-center">
          <span className="flex items-center gap-3 lg:col-span-1">
            <Checkbox
              checked={allChecked}
              indeterminate={selectedVisible.length > 0}
              onChange={(checked) => setSelectedIds(checked ? visibleIds : [])}
              label="전체 선택"
            />
            <span className="w-6 text-center">순번</span>
          </span>
          <span className="lg:col-span-3">이름 · 닉네임</span>
          <span className="lg:col-span-3">이메일</span>
          <span className="lg:col-span-2">역할</span>
          <span className="lg:col-span-1 lg:text-center">상태</span>
          <span className="lg:col-span-2 lg:text-right">관리</span>
        </div>

        {visible.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-ink-muted">조건에 맞는 관리자가 없습니다.</p>
        ) : (
          <div className="flex flex-col">
            {visible.map((member, index) => (
              <div
                key={member.id}
                onClick={() => openDetail(member.id)}
                className="grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 transition-colors duration-100 last:border-b-0 hover:bg-surface lg:grid-cols-12 lg:items-center lg:gap-y-0"
              >
                {/*
                  행 전체가 상세를 연다. 안쪽 체크박스·버튼은 자기 동작만 하도록 전파를 끊는다.
                  키보드 사용자는 끝의 조회 버튼으로 같은 곳에 도달한다.
                */}
                <div className="flex items-center gap-3 lg:col-span-1" onClick={stopRowClick}>
                  <Checkbox
                    checked={selectedIds.includes(member.id)}
                    onChange={(checked) =>
                      setSelectedIds((previous) =>
                        checked ? [...previous, member.id] : previous.filter((id) => id !== member.id),
                      )
                    }
                    label={`${member.name} 선택`}
                  />
                  <span className="w-6 text-center font-mono text-sm tabular-nums text-ink-faint">{index + 1}</span>
                </div>

                <div className="lg:col-span-3">
                  <p className="text-sm font-medium">
                    {member.name} <span className="text-ink-muted">· {member.nickname}</span>
                  </p>
                  <p className="font-mono text-xs text-ink-faint">{member.id}</p>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-3">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">이메일</span>
                  <span className="font-mono text-sm text-ink-muted">{member.email}</span>
                </div>

                <div className="flex items-center gap-2 lg:col-span-2">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">역할</span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_TONE[member.role] ?? 'bg-surface text-ink-muted'}`}
                  >
                    {member.role}
                  </span>
                </div>

                <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">상태</span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATE_TONE[member.state] ?? 'bg-surface text-ink-muted'}`}
                  >
                    {member.state}
                  </span>
                </div>

                <div className="flex items-center gap-2 lg:col-span-2 lg:justify-end" onClick={stopRowClick}>
                  <button
                    type="button"
                    onClick={() => openDetail(member.id)}
                    className={`${ACTION_BUTTON} border-border-strong text-ink-muted hover:border-ink-faint`}
                  >
                    조회
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete([member.id])}
                    className={`${ACTION_BUTTON} border-border-strong text-signal-danger hover:border-signal-danger`}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <AdminListPager total={visible.length} page={1} pageSize={Math.max(visible.length, 1)} />
      </section>

      <MemberFormModal
        open={modalOpen}
        mode={mode}
        record={detail}
        nextId={nextStaffId(staff)}
        config={CONFIG}
        onClose={() => setModalOpen(false)}
        onModeChange={setMode}
        onSubmit={submit}
      />

      <AdminConfirmModal
        open={pendingSave !== null}
        elevated
        tone="brand"
        title={mode === 'create' ? '관리자 추가' : '관리자 정보 저장'}
        description={
          mode === 'create'
            ? '아래 내용으로 관리자를 추가합니다. 역할에 따라 접근 범위가 달라집니다.'
            : '아래 내용으로 관리자 정보를 저장합니다.'
        }
        confirmLabel={mode === 'create' ? '추가' : '저장'}
        summary={
          pendingSave
            ? [
                { label: '이름', value: pendingSave.name.trim() },
                { label: '이메일', value: pendingSave.email.trim() },
                { label: '역할', value: pendingSave.role },
                { label: '상태', value: pendingSave.state },
                { label: '연락처', value: `${pendingSave.countryCode} ${pendingSave.phone}` },
              ]
            : []
        }
        onConfirm={applySave}
        onClose={() => setPendingSave(null)}
      />

      <AdminConfirmModal
        open={pendingDelete !== null}
        title="관리자 삭제"
        description={
          pendingDelete && pendingDelete.length > 1
            ? `선택한 관리자 ${pendingDelete.length}건을 삭제합니다. 되돌릴 수 없습니다.`
            : '이 관리자를 삭제합니다. 되돌릴 수 없습니다.'
        }
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
