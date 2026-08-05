'use client';

import { useMemo, useState } from 'react';
import {
  InternalEmpty,
  InternalPanel,
  InternalSummary,
  InternalTableFoot,
  InternalTableHead,
} from '@/app/_components/InternalPanel';
import { InternalChips, InternalToolbar } from '@/app/_components/InternalToolbar';
import {
  OVERDUE_BUCKETS,
  OVERDUE_TONE,
  daysFrom,
  formatAmount,
  overdueBucket,
  overdueInvoices,
  type InvoiceRecord,
} from '@/lib/data/invoices';
import { findTenant } from '@/lib/data/tenants';

const COLUMNS = [
  { label: '고객사', span: 'lg:col-span-3' },
  { label: '항목', span: 'lg:col-span-4' },
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
  const [bucket, setBucket] = useState('all');

  const all = useMemo(() => overdueInvoices(today), [today]);

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return all.filter((invoice) => {
      if (bucket !== 'all' && overdueBucket(invoice.dueAt, today) !== bucket) return false;
      if (!keyword) return true;
      const tenant = findTenant(invoice.tenantId)?.name ?? '';
      return (
        invoice.title.toLowerCase().includes(keyword) ||
        invoice.id.toLowerCase().includes(keyword) ||
        tenant.toLowerCase().includes(keyword)
      );
    });
  }, [all, search, bucket, today]);

  const total = visible.reduce((sum, invoice) => sum + invoice.amount, 0);
  const worst = all.filter((invoice) => overdueBucket(invoice.dueAt, today) === '60일 초과');

  return (
    <>
      <InternalSummary
        cards={[
          {
            label: '연체',
            value: `${visible.length}건`,
            tone: visible.length > 0 ? 'text-signal-danger' : '',
          },
          { label: '연체 금액', value: `${formatAmount(total)}원`, tone: total > 0 ? 'text-signal-danger' : '' },
          {
            label: '60일 초과',
            value: `${worst.length}건`,
            tone: worst.length > 0 ? 'text-signal-danger' : '',
            hint: '계약을 다시 봐야 하는 건입니다.',
          },
        ]}
      />

      {/*
        등록 단추를 두지 않는다. 연체는 만드는 것이 아니라 **기한이 지나서 생기는 결과**다.
        새 청구는 보조 메뉴의 예정일에서 만든다.
      */}
      <InternalToolbar
        searchId="overdue-search"
        searchLabel="연체 검색"
        searchHint="항목, 번호, 고객사로 검색"
        search={search}
        onSearch={setSearch}
        filters={<InternalChips label="연체 구간" options={OVERDUE_BUCKETS} value={bucket} onChange={setBucket} />}
      />

      <InternalPanel
        title="연체 목록"
        description="오래된 것이 위로 옵니다. 30일까지는 담당자에게 알리면 들어오고, 60일을 넘으면 계약을 다시 봐야 합니다."
      >
        <InternalTableHead columns={COLUMNS} />

        {visible.length === 0 ? (
          <InternalEmpty>
            {all.length === 0 ? '연체된 건이 없습니다.' : '조건에 맞는 연체 건이 없습니다.'}
          </InternalEmpty>
        ) : (
          <div className="flex flex-col">
            {visible.map((invoice: InvoiceRecord) => {
              const late = daysFrom(invoice.dueAt, today);
              const group = overdueBucket(invoice.dueAt, today);
              return (
                <div
                  key={invoice.id}
                  className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 last:border-b-0 lg:grid-cols-12 lg:items-center lg:gap-y-0"
                >
                  <div className="min-w-0 lg:col-span-3">
                    <p className="truncate text-sm font-medium">{findTenant(invoice.tenantId)?.name ?? '-'}</p>
                    <p className="truncate font-mono text-xs text-ink-faint">
                      {invoice.id} · {findTenant(invoice.tenantId)?.manager ?? '담당자 없음'}
                    </p>
                  </div>

                  <div className="min-w-0 lg:col-span-4">
                    <p className="truncate text-sm">{invoice.title}</p>
                    <p className="truncate text-xs text-ink-faint">
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
                    <span
                      className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${OVERDUE_TONE[group]}`}
                    >
                      {group}
                    </span>
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
    </>
  );
}
