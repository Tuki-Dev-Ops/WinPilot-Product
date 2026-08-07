'use client';

import { useMemo, useState } from 'react';
import { ALL_VALUE, Badge, ListToolbar, PageHeading, RowSelectCell, SelectAllCell, type ListFilterField, type ListToolbarTab } from '@winpilot/ui';
import { InternalDetailModal } from '@/app/_components/InternalDetailModal';
import { InternalEmpty, InternalPanel, InternalTableFoot, InternalTableHead } from '@/app/_components/InternalPanel';
import { CHURN_REASONS, CHURN_TONE, CHURNED, monthsKept, type ChurnRecord } from '@/lib/data/churn';
import { formatAmount } from '@/lib/data/invoices';

const COLUMNS = [
  { label: '고객사 · 담당자', span: 'lg:col-span-3' },
  { label: '플랜', span: 'lg:col-span-1 lg:text-center' },
  { label: '계약 기간', span: 'lg:col-span-2' },
  { label: '사유', span: 'lg:col-span-2' },
  { label: '누적 매출', span: 'lg:col-span-2 lg:text-right' },
  { label: '재계약', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 이탈한 고객사 목록.
 *
 * 맨 위에 두는 것이 **재계약 가능**인 이유: 이 목록을 여는 사람은 대개 "다시 걸어 볼 곳이
 * 있나" 를 묻는다. 사유별 건수를 함께 보여 주는 것은 그다음 물음(무엇을 고쳐야 덜 떠나나)에
 * 답하기 위해서다.
 */
export function ChurnListView() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  /*
    탭을 **사유**가 아니라 **다시 걸어 볼 수 있는가**로 가른다. 이 목록을 여는 사람은
    대개 "다시 걸어 볼 곳이 있나" 를 먼저 묻기 때문이다. 사유는 그다음 물음이라 필터로 내렸다.
  */
  const tabs: ListToolbarTab[] = [
    { id: 'all', label: '전체', count: CHURNED.length },
    { id: 'winback', label: '재계약 가능', count: CHURNED.filter((record) => record.winBack).length },
    { id: 'hard', label: '어려움', count: CHURNED.filter((record) => !record.winBack).length },
  ];

  const filters: ListFilterField[] = [
    { id: 'reason', label: '이탈 사유', options: CHURN_REASONS.map((item) => ({ value: item, label: item })) },
  ];

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const reason = filterValues.reason ?? ALL_VALUE;
    return CHURNED.filter((record) => {
      if (tab === 'winback' && !record.winBack) return false;
      if (tab === 'hard' && record.winBack) return false;
      if (reason !== ALL_VALUE && record.reason !== reason) return false;
      if (!keyword) return true;
      return (
        record.name.toLowerCase().includes(keyword) ||
        record.manager.toLowerCase().includes(keyword) ||
        record.id.toLowerCase().includes(keyword)
      );
    }).sort((a, b) => b.churnedAt.localeCompare(a.churnedAt));
  }, [search, tab, filterValues]);

  /*
    고른 줄. **일괄로 할 일이 아직 없어서 선택 줄(일괄 작업 막대)은 그리지 않는다** — 누를 수
    없는 단추를 두지 않는다는 규칙이 여기에도 걸린다. 할 일이 정해지면 그때 막대를 잇는다.
  */
  /*
    줄을 누르면 **읽기 창**이 열린다. 이탈은 만드는 것이 아니라 계약이 끝나서 생긴 결과라
    여기서 고칠 것이 없다. 대신 줄에 싣지 않은 값(계약일 · 끝난 날 · 메모 전문)을 여기서 본다 —
    "왜 떠났는가" 는 한 줄에 담기지 않는데, 그것이 이 목록을 남겨 두는 이유다.
  */
  const [opened, setOpened] = useState<string | null>(null);
  const opening = CHURNED.find((record) => record.id === opened) ?? null;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const visibleIds = visible.map((item) => item.id);
  const selectedVisible = selectedIds.filter((id) => visibleIds.includes(id));
  const allChecked = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;
  const toggleRow = (id: string, checked: boolean) =>
    setSelectedIds((previous) => (checked ? [...previous, id] : previous.filter((one) => one !== id)));

  const winBack = visible.filter((record) => record.winBack);
  const lifetime = visible.reduce((sum, record) => sum + record.lifetimeAmount, 0);

  return (
    <>
      <PageHeading title="이탈" description="떠난 고객사와 이탈 사유를 확인하세요." />

      {/*
        등록 단추를 두지 않는다. 이탈은 운영자가 만드는 것이 아니라 **계약이 끝나서 생기는
        결과**다 — 누를 수 없는 단추를 그려 두면 왜 안 되는지를 찾게 된다.
        그래서 윗줄에는 탭만 선다.
      */}
      <ListToolbar
        tabs={tabs}
        activeTabId={tab}
        onTabChange={setTab}
        searchId="churn-search"
        searchLabel="이탈 고객사 검색"
        searchHint="고객사명, 담당자, 코드로 검색"
        searchValue={search}
        onSearchChange={setSearch}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(id, value) => setFilterValues((previous) => ({ ...previous, [id]: value }))}
        onFilterReset={() => setFilterValues({})}
      />

      <InternalPanel
        title="이탈 목록"
        description="계약이 끝난 고객사입니다. 지우지 않는 이유는 왜 떠났는지가 다음 계약에서 쓰이기 때문입니다."
      >
        <InternalTableHead columns={COLUMNS} lead={<SelectAllCell checked={allChecked} indeterminate={selectedVisible.length > 0} onChange={(checked) => setSelectedIds(checked ? visibleIds : [])} />} />

        {visible.length === 0 ? (
          <InternalEmpty>조건에 맞는 이탈 고객사가 없습니다.</InternalEmpty>
        ) : (
          <div className="flex flex-col">
            {visible.map((record: ChurnRecord, index) => (
              <div
                key={record.id}
                role="button"
                tabIndex={0}
                onClick={() => setOpened(record.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setOpened(record.id);
                  }
                }}
                className="group grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 text-left transition-colors duration-150 last:border-b-0 hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 lg:grid-cols-12 lg:items-center lg:gap-y-0"
              >
                <RowSelectCell
                  checked={selectedIds.includes(record.id)}
                  onChange={(checked) => toggleRow(record.id, checked)}
                  label={`${record.name} 선택`}
                  index={index}
                />

                <div className="min-w-0 lg:col-span-3">
                  <p className="min-w-0 truncate text-sm font-medium">{record.name}</p>
                  <p className="min-w-0 truncate font-mono text-xs text-ink-faint">
                    {record.id} · {record.manager}
                  </p>
                  {/* 메모는 그 고객사에 딸린 값이다 — 아래에 한 줄을 더 만들면 행 높이가 줄마다 갈린다. */}
                  {record.memo && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">{record.memo}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">플랜</span>
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2.5 py-1 text-xs text-ink-muted">
                    {record.plan}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-2">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">계약 기간</span>
                  <span className="min-w-0 font-mono text-xs tabular-nums text-ink-muted">
                    {record.contractedAt} ~ {record.churnedAt}
                    <span className="ml-1.5 text-ink-faint">{monthsKept(record)}개월</span>
                  </span>
                </div>

                <div className="flex min-w-0 items-center gap-2 lg:col-span-2">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">사유</span>
                  <Badge tone={CHURN_TONE[record.reason]}>
                    {record.reason}
                  </Badge>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-2 lg:justify-end">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">누적 매출</span>
                  <span className="text-sm tabular-nums">{formatAmount(record.lifetimeAmount)}원</span>
                </div>

                <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">재계약</span>
                  {/* 색만으로 알리지 않는다 — 가능·어려움을 글자로도 적는다. */}
                  <Badge tone={record.winBack ? 'ok' : 'neutral'}>
                    {record.winBack ? '가능' : '어려움'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <InternalTableFoot>
          <p>
            총 <span className="font-medium tabular-nums text-ink">{visible.length}</span>곳
          </p>
          <p>
            누적 매출 <span className="font-medium tabular-nums text-ink">{formatAmount(lifetime)}</span>원
          </p>
        </InternalTableFoot>
      </InternalPanel>

      <InternalDetailModal
        open={opening !== null}
        title={opening?.name ?? ''}
        description={`${opening?.plan ?? ''} · ${opening?.id ?? ''}`}
        rows={
          opening
            ? [
                { label: '담당자', value: opening.manager },
                { label: '플랜', value: opening.plan },
                {
                  label: '계약 기간',
                  value: (
                    <span className="font-mono text-xs tabular-nums">
                      {opening.contractedAt} ~ {opening.churnedAt} · {monthsKept(opening)}개월
                    </span>
                  ),
                },
                { label: '사유', value: opening.reason },
                {
                  label: '누적 매출',
                  value: <span className="tabular-nums">{formatAmount(opening.lifetimeAmount)}원</span>,
                },
                { label: '재계약', value: opening.winBack ? '다시 걸어 볼 곳' : '대상 아님' },
                { label: '메모', value: opening.memo || <span className="text-ink-faint">없음</span> },
              ]
            : []
        }
        note="이탈 기록은 고치지 않습니다. 왜 떠났는지가 다음 계약의 조건을 정하는 자리에서 그대로 쓰입니다."
        onClose={() => setOpened(null)}
      />
    </>
  );
}
