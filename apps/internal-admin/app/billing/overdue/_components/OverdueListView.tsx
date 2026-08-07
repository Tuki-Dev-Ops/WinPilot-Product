'use client';

import { useMemo, useState } from 'react';
import { ALL_VALUE, Badge, ListToolbar, PageHeading, RowSelectCell, SelectAllCell, type ListFilterField, type ListToolbarTab } from '@winpilot/ui';
import { InternalDetailModal } from '@/app/_components/InternalDetailModal';
import { InternalEmpty, InternalPanel, InternalTableFoot, InternalTableHead } from '@/app/_components/InternalPanel';
import { daysFrom, formatAmount, OVERDUE_BUCKETS, OVERDUE_TONE, overdueBucket, overdueInvoices, type InvoiceRecord } from '@/lib/data/invoices';
import { findTenant, TENANTS } from '@/lib/data/tenants';

const COLUMNS = [
  { label: '고객사', span: 'lg:col-span-3' },
  { label: '항목', span: 'lg:col-span-3' },
  { label: '금액', span: 'lg:col-span-2 lg:text-right' },
  { label: '지난 기한', span: 'lg:col-span-2' },
  { label: '구간', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 연체 목록.
 *
 * 구간을 나누는 이유: 30일까지는 담당자에게 알리면 들어오고, 60일을 넘으면 계약을 다시 봐야
 * 한다. 손대는 방법이 갈리므로 목록도 그 기준으로 읽혀야 한다 — 구간이 없으면 목록이 그저
 * 길어지기만 하고 무엇부터 손댈지가 보이지 않는다.
 *
 * 상태가 `연체` 로 적혀 있지 않아도 기한이 지나면 여기로 온다. 상태 값은 사람이 나중에 고치는
 * 것이라, 그것만 믿으면 아직 `청구` 로 남아 있는 건이 어느 목록에도 오지 않는다.
 */
export function OverdueListView({ today }: { today: string }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const all = useMemo(() => overdueInvoices(today), [today]);

  /*
    이 목록은 이미 전부 연체라, 먼저 손대야 할 것을 기본 탭으로 두는 규칙이 여기서는 `전체` 로
    이어진다. 60일 초과를 기본으로 두면 나머지가 숨어 받을 돈이 얼마인지를 잃는다.
  */
  const tabs: ListToolbarTab[] = [
    { id: 'all', label: '전체', count: all.length },
    ...OVERDUE_BUCKETS.map((item) => ({
      id: item,
      label: item,
      count: all.filter((invoice) => overdueBucket(invoice.dueAt, today) === item).length,
    })),
  ];

  const filters: ListFilterField[] = [
    { id: 'tenant', label: '고객사', options: TENANTS.map((t) => ({ value: t.id, label: t.name })) },
  ];

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const tenantId = filterValues.tenant ?? ALL_VALUE;
    return all.filter((invoice) => {
      if (tab !== 'all' && overdueBucket(invoice.dueAt, today) !== tab) return false;
      if (tenantId !== ALL_VALUE && invoice.tenantId !== tenantId) return false;
      if (!keyword) return true;
      const tenant = findTenant(invoice.tenantId)?.name ?? '';
      return (
        invoice.title.toLowerCase().includes(keyword) ||
        invoice.id.toLowerCase().includes(keyword) ||
        tenant.toLowerCase().includes(keyword)
      );
    });
  }, [all, search, tab, filterValues, today]);

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

  /*
    줄을 누르면 **읽기 창**이 열린다. 여기서 고칠 것이 없기 때문이다 — 연체는 만드는 값이
    아니라 기한이 지나서 생긴 결과이고, 금액과 기한을 고치는 자리는 예정일 화면이다.
    대신 줄에 싣지 않은 값(발행일 · 정기 여부 · 메모 전문)을 여기서 본다.
  */
  const [opened, setOpened] = useState<string | null>(null);
  const opening = all.find((invoice) => invoice.id === opened) ?? null;

  const total = visible.reduce((sum, invoice) => sum + invoice.amount, 0);
  const worst = all.filter((invoice) => overdueBucket(invoice.dueAt, today) === '60일 초과');

  return (
    <>
      <PageHeading title="연체" description="연체된 청구와 경과일을 확인하세요." />

      {/*
        등록 단추를 두지 않는다. 연체는 만드는 것이 아니라 **기한이 지나서 생기는 결과**다.
        새 청구는 보조 메뉴의 예정일에서 만든다.
      */}
      <ListToolbar
        tabs={tabs}
        activeTabId={tab}
        onTabChange={setTab}
        searchId="overdue-search"
        searchLabel="연체 검색"
        searchHint="항목, 번호, 고객사로 검색"
        searchValue={search}
        onSearchChange={setSearch}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(id, value) => setFilterValues((previous) => ({ ...previous, [id]: value }))}
        onFilterReset={() => setFilterValues({})}
      />

      <InternalPanel
        title="연체 목록"
        description="오래된 것이 위로 옵니다. 30일까지는 담당자에게 알리면 들어오고, 60일을 넘으면 계약을 다시 봐야 합니다."
      >
        <InternalTableHead columns={COLUMNS} lead={<SelectAllCell checked={allChecked} indeterminate={selectedVisible.length > 0} onChange={(checked) => setSelectedIds(checked ? visibleIds : [])} />} />

        {visible.length === 0 ? (
          <InternalEmpty>
            {all.length === 0 ? '연체된 건이 없습니다.' : '조건에 맞는 연체 건이 없습니다.'}
          </InternalEmpty>
        ) : (
          <div className="flex flex-col">
            {visible.map((invoice: InvoiceRecord, index) => {
              const late = daysFrom(invoice.dueAt, today);
              const group = overdueBucket(invoice.dueAt, today);
              return (
                <div
                  key={invoice.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpened(invoice.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setOpened(invoice.id);
                    }
                  }}
                  className="group grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 text-left transition-colors duration-150 last:border-b-0 hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 lg:grid-cols-12 lg:items-center lg:gap-y-0"
                >
                  <RowSelectCell
                    checked={selectedIds.includes(invoice.id)}
                    onChange={(checked) => toggleRow(invoice.id, checked)}
                    label={`${invoice.title} 선택`}
                    index={index}
                  />

                  <div className="min-w-0 lg:col-span-3">
                    <p className="min-w-0 truncate text-sm font-medium">{findTenant(invoice.tenantId)?.name ?? '-'}</p>
                    <p className="min-w-0 truncate font-mono text-xs text-ink-faint">
                      {invoice.id} · {findTenant(invoice.tenantId)?.manager ?? '담당자 없음'}
                    </p>
                  </div>

                  <div className="min-w-0 lg:col-span-3">
                    <p className="min-w-0 truncate text-sm">{invoice.title}</p>
                    <p className="min-w-0 truncate text-xs text-ink-faint">
                      {invoice.kind}
                      {invoice.memo && ` · ${invoice.memo}`}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2 lg:col-span-2 lg:justify-end">
                    <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">금액</span>
                    <span className="text-sm font-medium tabular-nums text-signal-danger">
                      {formatAmount(invoice.amount)}원
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 lg:col-span-2">
                    <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">지난 기한</span>
                    <span className="font-mono text-xs tabular-nums text-ink-muted">
                      {invoice.dueAt}
                      <span className="ml-1 text-signal-danger">{late}일 지남</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                    <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">구간</span>
                    <Badge tone={OVERDUE_TONE[group]}>
                      {group}
                    </Badge>
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
            연체 금액 <span className="font-medium tabular-nums text-ink">{formatAmount(total)}</span>원
          </p>
        </InternalTableFoot>
      </InternalPanel>

      <InternalDetailModal
        open={opening !== null}
        title={opening?.title ?? ''}
        description={`${findTenant(opening?.tenantId ?? '')?.name ?? ''} · ${opening?.id ?? ''}`}
        rows={
          opening
            ? [
                { label: '고객사', value: findTenant(opening.tenantId)?.name ?? opening.tenantId },
                { label: '담당자', value: findTenant(opening.tenantId)?.manager ?? '담당자 없음' },
                { label: '항목', value: opening.kind },
                {
                  label: '금액',
                  value: <span className="tabular-nums">{formatAmount(opening.amount)}원</span>,
                },
                {
                  label: '발행일',
                  value: <span className="font-mono text-xs tabular-nums">{opening.issuedAt}</span>,
                },
                {
                  label: '기한',
                  value: (
                    <span className="font-mono text-xs tabular-nums">
                      {opening.dueAt} · {daysFrom(opening.dueAt, today)}일 지남
                    </span>
                  ),
                },
                { label: '구간', value: overdueBucket(opening.dueAt, today) },
                { label: '정기', value: opening.recurring ? '정기 청구' : '한 번' },
                {
                  label: '메모',
                  value: opening.memo || <span className="text-ink-faint">없음</span>,
                },
              ]
            : []
        }
        note="금액과 기한은 여기서 고치지 않습니다 — 청구 · 예정일 화면에서 고칩니다."
        onClose={() => setOpened(null)}
      />
    </>
  );
}
