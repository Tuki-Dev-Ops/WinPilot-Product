'use client';

import { useMemo, useState } from 'react';
import { ALL_VALUE, Badge, ListToolbar, PageHeading, RowSelectCell, SelectAllCell, useToast, type ListFilterField, type ListToolbarTab } from '@winpilot/ui';
import { InternalEmpty, InternalPanel, InternalTableFoot, InternalTableHead } from '@/app/_components/InternalPanel';
import { INQUIRIES, INQUIRY_CATEGORIES, INQUIRY_TONE, openInquiries, type InquiryRecord } from '@/lib/data/inquiries';
import { findTenant, TENANTS } from '@/lib/data/tenants';
import { InquiryDetailModal, type InquiryAnswerInput } from './InquiryDetailModal';

const COLUMNS = [
  { label: '고객사 · 보낸 사람', span: 'lg:col-span-3' },
  { label: '문의', span: 'lg:col-span-4' },
  { label: '접수일', span: 'lg:col-span-2' },
  { label: '담당', span: 'lg:col-span-1 lg:text-center' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 고객사 문의 목록.
 *
 * 목록을 여는 순서가 곧 손대는 순서다 — **급한 것이 위**로 오고, 그다음이 오래된 것이다.
 * 접수일 최신순으로만 두면 어제 들어온 장애가 지난주 기능 요청 아래에 깔린다.
 *
 * ## 줄을 누르면 창이 열린다
 * 전에는 그 줄 아래가 펼쳐지며 **읽기만** 됐다. 그래서 답을 쓰려면 이 화면을 떠나야 했는데,
 * 이 목록을 여는 이유가 거의 언제나 답할 것을 찾는 일이라 매번 떠나게 됐다. 펼치기는 또 줄
 * 높이를 그때그때 바꿔 다음 줄을 누르려던 손이 빗나간다.
 *
 * 한 건에 담긴 것이 제목·내용·답변·상태·담당 다섯이라 **화면이 아니라 모달**이다
 * (`InquiryDetailModal` 머리말).
 */
export function InquiryListView() {
  const [search, setSearch] = useState('');
  // 기본값이 전체가 아니라 **미답변**이다 — 이 목록을 여는 이유가 거의 언제나 답할 것을 찾는 일이다.
  const [tab, setTab] = useState('open');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [opened, setOpened] = useState<string | null>(null);
  const [rows, setRows] = useState<InquiryRecord[]>(INQUIRIES);
  const toast = useToast();

  const isOpenState = (inquiry: InquiryRecord) => inquiry.state === '접수' || inquiry.state === '처리중';

  /*
    네 상태를 그대로 탭으로 펼치지 않고 **미답변**(접수+처리중)으로 묶는다. 손대는 방법이
    같아서다 — 둘을 갈라 두면 답할 것을 찾는 데 탭을 두 번 눌러 보게 된다.
    맨 앞은 규칙대로 `전체` 이고, 고르기만 미답변로 시작한다.
  */
  const tabs: ListToolbarTab[] = [
    { id: 'all', label: '전체', count: rows.length },
    { id: 'open', label: '미답변', count: rows.filter(isOpenState).length },
    // 요약 카드에 있던 `급함` 을 탭으로 옮겼다 — 세는 곳이 둘이면 한쪽만 고쳐진다.
    { id: 'urgent', label: '급함', count: rows.filter((i) => i.urgent).length },
    { id: '답변완료', label: '답변완료', count: rows.filter((i) => i.state === '답변완료').length },
    { id: '보류', label: '보류', count: rows.filter((i) => i.state === '보류').length },
  ];

  const filters: ListFilterField[] = [
    { id: 'tenant', label: '고객사', options: TENANTS.map((t) => ({ value: t.id, label: t.name })) },
    { id: 'category', label: '분류', options: INQUIRY_CATEGORIES.map((c) => ({ value: c, label: c })) },
  ];

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const tenantId = filterValues.tenant ?? ALL_VALUE;
    const category = filterValues.category ?? ALL_VALUE;
    return rows.filter((inquiry) => {
      if (tab === 'open' && !isOpenState(inquiry)) return false;
      if (tab === 'urgent' && !inquiry.urgent) return false;
      if (tab !== 'all' && tab !== 'open' && tab !== 'urgent' && inquiry.state !== tab) return false;
      if (tenantId !== ALL_VALUE && inquiry.tenantId !== tenantId) return false;
      if (category !== ALL_VALUE && inquiry.category !== category) return false;
      if (!keyword) return true;
      return (
        inquiry.title.toLowerCase().includes(keyword) ||
        inquiry.body.toLowerCase().includes(keyword) ||
        inquiry.sender.toLowerCase().includes(keyword) ||
        inquiry.id.toLowerCase().includes(keyword)
      );
    }).sort((a, b) => {
      // 급한 것이 먼저. 같으면 오래된 것이 먼저 — 오래 기다린 쪽이 더 급하다.
      if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
      return a.receivedAt.localeCompare(b.receivedAt);
    });
  }, [rows, search, tab, filterValues]);

  const open = openInquiries(visible);
  const urgent = open.filter((inquiry) => inquiry.urgent);

  /*
    고른 줄. **일괄로 할 일이 아직 없어 선택 줄(일괄 작업 막대)은 그리지 않는다** — 문의는
    고객사가 보낸 것이라 지우지 않는다. 그래도 칸은 둔다: 표마다 맨 왼쪽이 같은 자리여야 한다.
  */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const visibleIds = visible.map((one) => one.id);
  const selectedVisible = selectedIds.filter((id) => visibleIds.includes(id));
  const allChecked = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;

  const opening = rows.find((inquiry) => inquiry.id === opened) ?? null;

  const answer = (input: InquiryAnswerInput) => {
    if (!opening) return;

    setRows((previous) =>
      previous.map((inquiry) => (inquiry.id === opening.id ? { ...inquiry, ...input } : inquiry)),
    );
    setOpened(null);
    toast.success({
      message: '문의를 저장했습니다.',
      detail: `${opening.id} · ${input.state}${input.assignee ? ` · ${input.assignee}` : ''}`,
    });
  };

  return (
    <>
      <PageHeading title="문의" description="답변이 필요한 문의를 먼저 확인하세요." />

      {/*
        등록 단추를 두지 않는다. 문의는 **고객사가 보내는 것**이라 우리가 만들 자리가 아니다 —
        누를 수 없는 단추를 그려 두면 왜 안 되는지를 찾게 된다. 윗줄에는 탭만 선다.
      */}
      <ListToolbar
        tabs={tabs}
        activeTabId={tab}
        onTabChange={setTab}
        searchId="inquiry-search"
        searchLabel="문의 검색"
        searchHint="제목, 내용, 보낸 사람, 번호로 검색"
        searchValue={search}
        onSearchChange={setSearch}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(id, value) => setFilterValues((previous) => ({ ...previous, [id]: value }))}
        onFilterReset={() => setFilterValues({})}
      />

      <InternalPanel
        title="문의 목록"
        description="고객사가 우리에게 보낸 문의입니다. 상태 이름은 B2C Admin 의 문의와 글자까지 같습니다."
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
          <InternalEmpty>조건에 맞는 문의가 없습니다.</InternalEmpty>
        ) : (
          <div className="flex flex-col">
            {visible.map((inquiry: InquiryRecord, index) => {
              return (
                <div key={inquiry.id} className="border-b border-border last:border-b-0">
                  {/*
                    줄이 `<button>` 이었는데 그 안에는 체크박스를 넣을 수 없다 — 단추 안의 단추는
                    올바른 HTML 이 아니고, 눌러도 어느 쪽이 반응할지 정해지지 않는다.
                    그래서 다른 목록과 같은 모양(`role="button"` 인 줄)으로 바꿨다.
                  */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpened(inquiry.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setOpened(inquiry.id);
                      }
                    }}
                    className="grid w-full cursor-pointer grid-cols-1 gap-x-4 gap-y-2 px-5 py-4 text-left transition-colors duration-150 hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 lg:grid-cols-12 lg:items-center lg:gap-y-0"
                  >
                    <RowSelectCell
                      checked={selectedIds.includes(inquiry.id)}
                      onChange={(checked) =>
                        setSelectedIds((previous) =>
                          checked ? [...previous, inquiry.id] : previous.filter((one) => one !== inquiry.id),
                        )
                      }
                      label={`${inquiry.title} 선택`}
                      index={index}
                    />

                    <div className="min-w-0 lg:col-span-3">
                      <p className="min-w-0 truncate text-sm font-medium">
                        {findTenant(inquiry.tenantId)?.name ?? inquiry.tenantId}
                      </p>
                      <p className="min-w-0 truncate font-mono text-xs text-ink-faint">
                        {inquiry.id} · {inquiry.sender}
                      </p>
                    </div>

                    <div className="min-w-0 lg:col-span-4">
                      <p className="min-w-0 truncate text-sm">
                        {inquiry.urgent && (
                          <span className="mr-1.5 shrink-0 whitespace-nowrap rounded-full bg-signal-danger/12 px-2 py-0.5 text-3xs font-medium text-signal-danger">
                            급함
                          </span>
                        )}
                        {inquiry.title}
                      </p>
                      <p className="min-w-0 truncate text-xs text-ink-faint">{inquiry.category}</p>
                    </div>

                    <div className="flex items-baseline gap-2 lg:col-span-2">
                      <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">접수일</span>
                      <span className="font-mono text-xs tabular-nums text-ink-muted">{inquiry.receivedAt}</span>
                    </div>

                    <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                      <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">담당</span>
                      <span className={`text-xs ${inquiry.assignee ? 'text-ink-muted' : 'text-ink-faint'}`}>
                        {inquiry.assignee || '없음'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                      <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">상태</span>
                      <Badge tone={INQUIRY_TONE[inquiry.state]}>
                        {inquiry.state}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <InternalTableFoot>
          <p>
            총 <span className="font-medium tabular-nums text-ink">{visible.length}</span>건
          </p>
          <p>
            답하지 않음 <span className="font-medium tabular-nums text-ink">{open.length}</span>건
          </p>
        </InternalTableFoot>
      </InternalPanel>

      <InquiryDetailModal
        open={opening !== null}
        inquiry={opening}
        onClose={() => setOpened(null)}
        onSubmit={answer}
      />
    </>
  );
}
