'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ALL_VALUE,
  Badge,
  ListToolbar,
  PageHeading,
  RecordTable,
  type BadgeTone,
  type ListFilterField,
  type RecordColumn,
} from '@winpilot/ui';
import { ADMIN_ROLES, FNB_ADMINS, type AdminRole } from '@winpilot/store';

/** `col-span` 합은 **아홉**이다 — 나머지 셋은 순번 칸과 관리 칸이 가져간다. */
const COLUMNS: RecordColumn[] = [
  { label: '이름', span: 'lg:col-span-2' },
  { label: '이메일', span: 'lg:col-span-3' },
  { label: '권한', span: 'lg:col-span-1 lg:text-center' },
  { label: '마지막 접속', span: 'lg:col-span-2 lg:text-center' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 권한별 표 색.
 *
 * `대표` 만 눈에 띈다. 관리자를 늘리고 지울 수 있는 유일한 권한이라, 목록에서 **그 줄이 몇인지**가
 * 한눈에 보여야 한다. 둘 이상이면 대개 정리가 필요한 상태다.
 */
const ROLE_TONE: Record<AdminRole, BadgeTone> = { 대표: 'brand', 운영: 'neutral', 조회: 'neutral' };

const FILTERS: ListFilterField[] = [
  { id: 'role', label: '권한', options: ADMIN_ROLES.map((one) => ({ value: one, label: one })) },
  {
    id: 'state',
    label: '상태',
    options: [
      { value: '사용', label: '사용' },
      { value: '정지', label: '정지' },
    ],
  },
];

/**
 * 설정 > 관리자.
 *
 * ## 마지막 접속을 열로 세운다
 * 안 쓰는 계정이 남아 있는 것이 이 종류의 콘솔에서 가장 흔한 구멍이다. 목록에서 날짜가 오래된
 * 줄이 보이면 그때 정리한다 — **찾아보려면 안 찾게 되고**, 열로 서 있으면 지나가다 보인다.
 *
 * 접속한 적이 없는 계정은 날짜 대신 그 말을 적는다. 빈 칸으로 두면 값이 없는 것인지 아직 안
 * 들어온 것인지 갈리지 않는다.
 *
 * ## 지우는 것과 정지가 다르다
 * 지우면 **그 사람이 무엇을 고쳤는지가 함께 사라진다.** 나간 사람은 정지로 두는 것이 맞고,
 * 지우는 것은 잘못 만든 계정에만 쓴다.
 *
 * **프론트엔드 전용** — 값의 원본은 `@winpilot/store` 다.
 */
export function AdminListView() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState<string>(ALL_VALUE);
  const [state, setState] = useState<string>(ALL_VALUE);

  const word = keyword.trim().toLowerCase();
  const shown = FNB_ADMINS.filter((one) => {
    if (role !== ALL_VALUE && one.role !== role) return false;
    if (state !== ALL_VALUE && (one.active ? '사용' : '정지') !== state) return false;
    if (!word) return true;
    return [one.name, one.email].some((value) => value.toLowerCase().includes(word));
  });

  return (
    <>
      <PageHeading title="관리자" description="이 콘솔에 들어오는 사람입니다. 나간 사람은 지우지 말고 정지로 두세요." />

      <ListToolbar
        searchId="admin-search"
        searchLabel="관리자 검색"
        searchHint="이름 · 이메일"
        searchValue={keyword}
        onSearchChange={setKeyword}
        actionLabel="계정 등록"
        onAction={() => router.push('/settings/admins/new')}
        filters={FILTERS}
        filterValues={{ role, state }}
        onFilterChange={(id, value) => {
          if (id === 'role') setRole(value);
          if (id === 'state') setState(value);
        }}
        onFilterReset={() => {
          setRole(ALL_VALUE);
          setState(ALL_VALUE);
        }}
      />

      <RecordTable
        title="관리자"
        description="마지막 접속이 오래된 줄이 보이면 그때 정리하세요."
        columns={COLUMNS}
        rows={shown}
        onOpen={(one) => router.push(`/settings/admins/${one.id}`)}
        onDelete={() => undefined}
        deleteNote="그 사람이 무엇을 고쳤는지가 함께 사라집니다. 나가신 분이라면 지우지 말고 정지로 두세요."
        labelOf={(one) => one.name}
        empty="조건에 맞는 관리자가 없습니다."
        render={(one) => [
          <span key="name" className="min-w-0 truncate text-sm font-medium">
            {one.name}
          </span>,
          <span key="email" className="min-w-0 truncate font-mono text-xs text-ink-muted">
            {one.email}
          </span>,
          <span key="role" className="flex min-w-0 justify-center">
            <Badge tone={ROLE_TONE[one.role]}>{one.role}</Badge>
          </span>,
          <span key="seen" className="flex min-w-0 justify-center font-mono text-xs tabular-nums text-ink-muted">
            {one.lastSeenOn || '접속 없음'}
          </span>,
          <span key="state" className="flex min-w-0 justify-center">
            <Badge tone={one.active ? 'ok' : 'neutral'}>{one.active ? '사용' : '정지'}</Badge>
          </span>,
        ]}
      />
    </>
  );
}
