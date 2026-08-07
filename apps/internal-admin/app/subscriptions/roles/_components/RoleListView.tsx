'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  ListToolbar,
  PageHeading,
  RowActions,
  RowIconButton,
  RowSelectCell,
  SelectAllCell,
  type ListToolbarTab,
} from '@winpilot/ui';
import { InternalEmpty, InternalPanel, InternalTableFoot, InternalTableHead } from '@/app/_components/InternalPanel';
import {
  CONSOLE_DOMAINS,
  CONSOLE_NOTE,
  CONSOLE_RESOURCES,
  CONSOLE_ROLES,
  grantCount,
  type ConsoleDomain,
  type RoleTemplate,
} from '@/lib/data/permissions';

const COLUMNS = [
  { label: '역할', span: 'lg:col-span-3' },
  { label: '맡기는 자리', span: 'lg:col-span-4' },
  { label: '여는 권한', span: 'lg:col-span-2' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
  { label: '관리', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 권한 — **도메인마다 역할 목록**, 세부 설정은 들어가서 한다.
 *
 * ## 탭이 도메인인 이유
 * 파는 것이 다르면 만질 것도 다르다. B2C 에 `주문` 이 있는 자리에 B2B 는 `견적`·`발주` 가
 * 있고, IR 에는 애초에 파는 것이 없다. 한 목록에 섞으면 IR 고객사 이야기를 하는 자리에
 * `환불` 이 함께 뜬다.
 *
 * ## 표를 여기서 펼치지 않는다
 * 전에는 이 화면 아래에 `자원 × 역할` 전체 표를 늘 펼쳐 두었다. 자원이 열다섯이고 동작이
 * 넷이면 예순 칸이 목록 밑에 붙는데, 여기 오는 사람 대부분은 **역할이 몇 개이고 누가
 * 무엇을 맡는지**를 보러 온다. 칸을 켜고 끄는 일은 한 역할을 정하고 나서 하는 일이라
 * 상세(`/subscriptions/roles/{roleId}`)로 내렸다.
 *
 * ## 등록이 없다
 * 역할은 **템플릿**이다(`@winpilot/store` 의 `permissions.ts` 머리말). 고객사가 처음부터
 * 만들게 두면 이름만 다른 역할이 열 개 생기고, 그때부터 누가 무엇을 할 수 있는지 아무도
 * 답하지 못한다.
 */
export function RoleListView() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<ConsoleDomain>('B2C');

  const tabs: ListToolbarTab[] = CONSOLE_DOMAINS.map((domain) => ({
    id: domain,
    label: domain,
    count: CONSOLE_ROLES[domain].length,
  }));

  const resources = CONSOLE_RESOURCES[tab];

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return CONSOLE_ROLES[tab].filter((role) => {
      if (!keyword) return true;
      return (
        role.label.toLowerCase().includes(keyword) ||
        role.note.toLowerCase().includes(keyword) ||
        role.id.toLowerCase().includes(keyword)
      );
    });
  }, [search, tab]);

  /*
    고른 줄. **일괄로 할 일이 아직 없어 선택 줄(일괄 작업 막대)은 그리지 않는다** — 누를 수
    없는 단추를 두지 않는다는 규칙이 여기에도 걸린다. 할 일이 정해지면 그때 막대를 잇는다.
  */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const visibleIds = visible.map((role) => role.id);
  const selectedVisible = selectedIds.filter((id) => visibleIds.includes(id));
  const allChecked = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;
  const toggleRow = (id: string, checked: boolean) =>
    setSelectedIds((previous) => (checked ? [...previous, id] : previous.filter((one) => one !== id)));

  /** 그 도메인에서 켤 수 있는 칸의 총수. 분모가 없으면 `28개` 가 넓은지 좁은지 알 수 없다. */
  const total = resources.reduce((sum, resource) => sum + resource.actions.length, 0);

  const open = (roleId: string) => router.push(`/subscriptions/roles/${roleId}`);

  return (
    <>
      <PageHeading title="권한" description="고객사 콘솔의 역할과 그 역할이 여는 것을 확인하세요." />

      {/*
        거를 것이 도메인 하나뿐이라 필터 단추를 따로 두지 않는다 — 탭이 그 일을 이미 한다.
        등록 단추도 없다: 역할은 우리가 정한 템플릿이라 화면에서 만들어지지 않는다.
      */}
      <ListToolbar
        tabs={tabs}
        activeTabId={tab}
        onTabChange={(next) => setTab(next as ConsoleDomain)}
        searchId="role-search"
        searchLabel="역할 검색"
        searchHint="역할 이름, 맡기는 자리로 검색"
        searchValue={search}
        onSearchChange={setSearch}
      />

      <InternalPanel title={`${tab} 역할`} description={CONSOLE_NOTE[tab]}>
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
          <InternalEmpty>조건에 맞는 역할이 없습니다.</InternalEmpty>
        ) : (
          <div className="flex flex-col">
            {visible.map((role: RoleTemplate, index) => {
              const count = grantCount(role, resources);

              return (
                /*
                  줄 전체를 눌러도 상세로 간다. 오른쪽 끝의 `조회` 만 누를 수 있게 두면 표가
                  넓은 화면에서 커서가 가장 먼 자리까지 가야 한다.
                */
                <div
                  key={role.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => open(role.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      open(role.id);
                    }
                  }}
                  className="group grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 text-left transition-colors duration-150 last:border-b-0 hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 lg:grid-cols-12 lg:items-center lg:gap-y-0"
                >
                  {/* 체크박스와 아래 `조회` 는 자기 안에서 클릭을 끊는다 — 고를 때마다 화면이 넘어가지 않는다. */}
                  <RowSelectCell
                    checked={selectedIds.includes(role.id)}
                    onChange={(checked) => toggleRow(role.id, checked)}
                    label={`${role.label} 선택`}
                    index={index}
                  />

                  <div className="min-w-0 lg:col-span-3">
                    <p className="min-w-0 truncate text-sm font-medium">{role.label}</p>
                    <p className="min-w-0 truncate font-mono text-xs text-ink-faint">{role.id}</p>
                  </div>

                  <p className="min-w-0 truncate text-sm text-ink-muted lg:col-span-4">{role.note}</p>

                  <div className="flex min-w-0 items-baseline gap-2 lg:col-span-2">
                    <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">여는 권한</span>
                    <span className="min-w-0 truncate text-sm tabular-nums">
                      {count}
                      <span className="text-ink-faint"> / {total}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                    <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">상태</span>
                    {/* 고정 역할은 지울 수 없다 — 없애려다 막히는 이유가 목록에 있어야 한다. */}
                    <Badge tone={role.fixed ? 'danger' : 'neutral'}>{role.fixed ? '고정' : '조정 가능'}</Badge>
                  </div>

                  <div className="lg:col-span-1">
                    <RowActions>
                      <RowIconButton
                        icon="view"
                        label={`${role.label} 세부 권한`}
                        onClick={() => open(role.id)}
                      />
                    </RowActions>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <InternalTableFoot>
          <p>
            총 <span className="font-medium tabular-nums text-ink">{visible.length}</span>개 역할
          </p>
          <p>
            줄을 누르면 <span className="font-medium text-ink">자원별 세부 권한</span>을 켜고 끕니다.
          </p>
        </InternalTableFoot>
      </InternalPanel>
    </>
  );
}
