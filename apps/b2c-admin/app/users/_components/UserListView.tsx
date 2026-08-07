'use client';

import { MemberFormModal, type MemberFormConfig, type MemberRecord } from '@/app/_components/MemberFormModal';
import { useMemo, useState, type MouseEvent } from 'react';
import { AdminBulkBar } from '@/app/_components/AdminBulkBar';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import { AdminListPager } from '@/app/_components/AdminListPager';
import { ALL_VALUE, Badge, Checkbox, ListToolbar, PageHeading, RowActionGroup, RowSelectCell, useToast, type BadgeTone, type ListFilterField } from '@winpilot/ui';
import type { MemberFormInput, MemberFormMode } from '@/lib/validation/member-record';

/** 프론트엔드 전용 — 서버 없이 이 배열이 목록의 원본이다. */
const INITIAL_USERS: MemberRecord[] = [
  { id: 'U-10241', state: '활성', name: '김서연', nickname: '서연', email: 'seoyeon.kim@example.com', countryCode: '+82', phone: '01043215678', role: 'VIP', marketingConsent: true, marketingConsentAt: '2026-07-28', joined: '2026-07-28', lastSeen: '2026-08-03 08:41' },
  { id: 'U-10240', state: '활성', name: '박지훈', nickname: '지훈', email: 'jihoon.park@example.com', countryCode: '+82', phone: '01088776655', role: '일반', marketingConsent: false, marketingConsentAt: null, joined: '2026-07-27', lastSeen: '2026-08-02 21:10' },
  { id: 'U-10239', state: '활성', name: '이하늘', nickname: '하늘', email: 'haneul.lee@example.com', countryCode: '+82', phone: '01033334444', role: 'VIP', marketingConsent: true, marketingConsentAt: '2026-07-26', joined: '2026-07-26', lastSeen: '2026-08-03 07:55' },
  { id: 'U-10238', state: '휴면', name: '정민우', nickname: '민우', email: 'minwoo.jung@example.com', countryCode: '+82', phone: '01055667788', role: '일반', marketingConsent: false, marketingConsentAt: null, joined: '2026-07-24', lastSeen: '2026-06-30 13:02' },
  { id: 'U-10237', state: '활성', name: '최유진', nickname: '유진', email: 'yujin.choi@example.com', countryCode: '+82', phone: '01012349876', role: '일반', marketingConsent: true, marketingConsentAt: '2026-07-22', joined: '2026-07-22', lastSeen: '2026-08-01 19:24' },
  { id: 'U-10236', state: '차단', name: '한도현', nickname: '도현', email: 'dohyun.han@example.com', countryCode: '+82', phone: '01099887766', role: '신규', marketingConsent: false, marketingConsentAt: null, joined: '2026-07-21', lastSeen: '2026-07-21 10:03' },
  { id: 'U-10235', state: '활성', name: '오세라', nickname: '세라', email: 'sera.oh@example.com', countryCode: '+1', phone: '2025550143', role: '일반', marketingConsent: true, marketingConsentAt: '2026-07-19', joined: '2026-07-19', lastSeen: '2026-08-02 09:30' },
  { id: 'U-10234', state: '휴면', name: '배준호', nickname: '준호', email: 'junho.bae@example.com', countryCode: '+82', phone: '01077778888', role: '신규', marketingConsent: false, marketingConsentAt: null, joined: '2026-07-18', lastSeen: '2026-07-01 08:12' },
];

const CONFIG: MemberFormConfig = {
  entityLabel: '사용자',
  idLabel: '회원 고유ID',
  joinedLabel: '가입일',
  states: ['활성', '휴면', '차단'],
  // 등급은 누적 결제금액 기준으로 자동 산정되므로 사람이 고르지 않는다 (`/users/grades`).
  role: { label: '등급', kind: 'auto', autoValue: '신규' },
};

const STATE_TONE: Record<string, BadgeTone> = {
  활성: 'ok',
  휴면: 'neutral',
  차단: 'danger',
};

const TAB_STATE: Record<string, string | null> = { all: null, active: '활성', dormant: '휴면', blocked: '차단' };
const TAB_LABEL: Record<string, string> = { all: '전체', active: '활성', dormant: '휴면', blocked: '차단' };



function nextUserId(users: MemberRecord[]): string {
  const max = users.reduce((biggest, user) => Math.max(biggest, Number(user.id.replace('U-', ''))), 10000);
  return `U-${max + 1}`;
}

function stamp(withTime: boolean): string {
  const now = new Date();
  const pad = (value: number) => `${value}`.padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return withTime ? `${date} ${pad(now.getHours())}:${pad(now.getMinutes())}` : date;
}

export function UserListView() {
  const toast = useToast();
  const [users, setUsers] = useState<MemberRecord[]>(INITIAL_USERS);
  const [activeTabId, setActiveTabId] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<MemberFormMode>('create');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pendingSave, setPendingSave] = useState<MemberFormInput | null>(null);

  const detail = useMemo(() => users.find((user) => user.id === detailId) ?? null, [users, detailId]);

  const filterFields = useMemo<ListFilterField[]>(
    () => [
      {
        id: 'role',
        label: '등급',
        options: [...new Set(users.map((user) => user.role))].map((role) => ({ value: role, label: role })),
      },
      {
        id: 'marketing',
        label: '마케팅 동의',
        options: [
          { value: 'yes', label: '동의' },
          { value: 'no', label: '미동의' },
        ],
      },
      {
        id: 'country',
        label: '국가번호',
        options: [...new Set(users.map((user) => user.countryCode))].map((code) => ({ value: code, label: code })),
      },
    ],
    [users],
  );

  const matchesFilters = (user: MemberRecord) => {
    const role = filters.role ?? ALL_VALUE;
    if (role !== ALL_VALUE && user.role !== role) return false;

    const marketing = filters.marketing ?? ALL_VALUE;
    if (marketing !== ALL_VALUE && user.marketingConsent !== (marketing === 'yes')) return false;

    const country = filters.country ?? ALL_VALUE;
    if (country !== ALL_VALUE && user.countryCode !== country) return false;

    return true;
  };

  const tabs = useMemo(
    () =>
      Object.keys(TAB_STATE).map((id) => {
        const state = TAB_STATE[id];
        return {
          id,
          label: TAB_LABEL[id] ?? id,
          count: state ? users.filter((user) => user.state === state).length : users.length,
        };
      }),
    [users],
  );

  const visible = useMemo(() => {
    const state = TAB_STATE[activeTabId];
    const keyword = search.trim().toLowerCase();
    return users.filter((user) => {
      if (state && user.state !== state) return false;
      if (!matchesFilters(user)) return false;
      if (!keyword) return true;
      return (
        user.name.toLowerCase().includes(keyword) ||
        user.nickname.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.id.toLowerCase().includes(keyword)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, activeTabId, search, filters]);

  // 선택은 화면에 보이는 것만 대상으로 한다 — 탭이나 검색으로 가려진 항목이 함께 지워지면 안 된다.
  const visibleIds = visible.map((user) => user.id);
  const selectedVisible = selectedIds.filter((id) => visibleIds.includes(id));
  const allChecked = visible.length > 0 && selectedVisible.length === visible.length;

  const submit = (input: MemberFormInput) => {
    // 이메일은 계정 식별자다 — 겹치면 로그인 시 어느 쪽인지 가릴 수 없다.
    const email = input.email.trim().toLowerCase();
    if (users.some((user) => user.email.toLowerCase() === email && user.id !== detailId)) {
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
      const newId = nextUserId(users);
      setUsers((previous) => [
        {
          id: nextUserId(previous),
          state: input.state,
          name: input.name.trim(),
          nickname: input.nickname.trim(),
          email: input.email.trim(),
          countryCode: input.countryCode,
          phone: input.phone.replace(/\D/g, ''),
          role: '신규',
          marketingConsent: input.marketingConsent,
          marketingConsentAt: input.marketingConsent ? stamp(false) : null,
          joined: stamp(false),
          lastSeen: stamp(true),
        },
        ...previous,
      ]);
      setActiveTabId('all');
      setSearch('');
      toast.success({ message: '사용자를 추가했습니다.', detail: `${input.name.trim()} · ${newId}` });
    } else if (detailId) {
      setUsers((previous) =>
        previous.map((user) =>
          user.id === detailId
            ? {
                ...user,
                state: input.state,
                name: input.name.trim(),
                nickname: input.nickname.trim(),
                email: input.email.trim(),
                countryCode: input.countryCode,
                phone: input.phone.replace(/\D/g, ''),
                marketingConsent: input.marketingConsent,
                marketingConsentAt: input.marketingConsent ? (user.marketingConsentAt ?? stamp(false)) : null,
              }
            : user,
        ),
      );
      toast.success({ message: '사용자 정보를 저장했습니다.', detail: `${input.name.trim()} · ${detailId}` });
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
    const names = users.filter((user) => targets.has(user.id)).map((user) => user.name);
    setUsers((previous) => previous.filter((user) => !targets.has(user.id)));
    setSelectedIds((previous) => previous.filter((id) => !targets.has(id)));
    setPendingDelete(null);
    toast.success({
      message: `사용자 ${targets.size}건을 삭제했습니다.`,
      detail: names.length > 2 ? `${names.slice(0, 2).join(', ')} 외 ${names.length - 2}명` : names.join(', '),
    });
  };

  return (
    <>
      <PageHeading title="사용자" description="가입한 회원과 등급을 확인하세요." />

      <ListToolbar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        searchId="user-search"
        searchLabel="사용자 검색"
        searchHint="이름, 닉네임, 이메일, 회원번호로 검색"
        searchValue={search}
        onSearchChange={setSearch}
        actionLabel="사용자 추가"
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
        data-ssot-cid="b2c-admin/user.list#AdminUserListTable"
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
          <span className="lg:col-span-1">등급</span>
          <span className="lg:col-span-1">가입일</span>
          <span className="lg:col-span-1 lg:text-center">상태</span>
          <span className="lg:col-span-2 lg:text-center">관리</span>
        </div>

        {visible.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-ink-muted">조건에 맞는 사용자가 없습니다.</p>
        ) : (
          <div className="flex flex-col">
            {visible.map((user, index) => (
              <div
                key={user.id}
                onClick={() => openDetail(user.id)}
                className="group grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 transition-colors duration-100 last:border-b-0 hover:bg-surface lg:grid-cols-12 lg:items-center lg:gap-y-0"
              >
                <RowSelectCell
                  checked={selectedIds.includes(user.id)}
                  onChange={(checked) =>
                    setSelectedIds((previous) =>
                      checked ? [...previous, user.id] : previous.filter((id) => id !== user.id),
                    )
                  }
                  label={`${user.name} 선택`}
                  index={index}
                />

                <div className="lg:col-span-3">
                  <p className="text-sm font-medium">
                    {user.name} <span className="text-ink-muted">· {user.nickname}</span>
                  </p>
                  <p className="font-mono text-xs text-ink-faint">{user.id}</p>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-3">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">이메일</span>
                  <span className="font-mono text-sm text-ink-muted">{user.email}</span>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-1">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">등급</span>
                  <span className="text-sm">{user.role}</span>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-1">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">가입일</span>
                  <span className="font-mono text-xs tabular-nums text-ink-muted">{user.joined}</span>
                </div>

                <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">상태</span>
                  <Badge tone={STATE_TONE[user.state] ?? 'neutral'}>
                    {user.state}
                  </Badge>
                </div>

                <div className="lg:col-span-2">
                  <RowActionGroup
                    label={user.name}
                    onView={() => openDetail(user.id)}
                    onEdit={() => openDetail(user.id)}
                    onDelete={() => setPendingDelete([user.id])}
                  />
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
        nextId={nextUserId(users)}
        config={CONFIG}
        onClose={() => setModalOpen(false)}
        onModeChange={setMode}
        onSubmit={submit}
      />

      <AdminConfirmModal
        open={pendingSave !== null}
        elevated
        tone="brand"
        title={mode === 'create' ? '사용자 추가' : '사용자 정보 저장'}
        description={
          mode === 'create'
            ? '아래 내용으로 사용자를 추가합니다.'
            : '아래 내용으로 사용자 정보를 저장합니다.'
        }
        confirmLabel={mode === 'create' ? '추가' : '저장'}
        summary={
          pendingSave
            ? [
                { label: '이름', value: pendingSave.name.trim() },
                { label: '이메일', value: pendingSave.email.trim() },
                { label: '상태', value: pendingSave.state },
                { label: '연락처', value: `${pendingSave.countryCode} ${pendingSave.phone}` },
                { label: '마케팅 동의', value: pendingSave.marketingConsent ? '동의' : '미동의' },
              ]
            : []
        }
        onConfirm={applySave}
        onClose={() => setPendingSave(null)}
      />

      <AdminConfirmModal
        open={pendingDelete !== null}
        title="사용자 삭제"
        description={
          pendingDelete && pendingDelete.length > 1
            ? `선택한 사용자 ${pendingDelete.length}건을 삭제합니다. 되돌릴 수 없습니다.`
            : '이 사용자를 삭제합니다. 되돌릴 수 없습니다.'
        }
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
