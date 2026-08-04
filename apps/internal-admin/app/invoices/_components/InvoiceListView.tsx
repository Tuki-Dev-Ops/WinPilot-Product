'use client';

import { useMemo, useState } from 'react';
import { Dropdown } from '@winpilot/ui';
import {
  INVOICES,
  INVOICE_KINDS,
  INVOICE_STATES,
  INVOICE_TONE,
  formatAmount,
  outstanding,
  type InvoiceRecord,
} from '@/lib/data/invoices';
import { TENANTS, findTenant } from '@/lib/data/tenants';

/**
 * 구매 · 유지보수 비용 안내.
 *
 * 사내 어드민은 청구를 **집행하지 않고 안내만** 한다. 그래서 이 화면에는 '결제하기' 가 없고,
 * 대신 **미수금**과 **연체**가 가장 먼저 보인다 — 담당자가 확인해야 할 것은 그 둘이다.
 */
export function InvoiceListView({ today }: { today: string }) {
  const [tenantId, setTenantId] = useState('all');
  const [kind, setKind] = useState('all');
  const [state, setState] = useState('all');

  const visible = useMemo(
    () =>
      INVOICES.filter((invoice) => {
        if (tenantId !== 'all' && invoice.tenantId !== tenantId) return false;
        if (kind !== 'all' && invoice.kind !== kind) return false;
        if (state !== 'all' && invoice.state !== state) return false;
        return true;
      }).sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)),
    [tenantId, kind, state],
  );

  const total = visible.reduce((sum, invoice) => sum + invoice.amount, 0);
  const unpaid = outstanding(visible);
  const overdue = visible.filter((invoice) => invoice.state === '연체');

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: '합계', value: `${formatAmount(total)}원`, tone: '' },
          { label: '미수금', value: `${formatAmount(unpaid)}원`, tone: 'text-brand-700 dark:text-brand-300' },
          {
            label: '연체',
            value: `${overdue.length}건 · ${formatAmount(overdue.reduce((sum, i) => sum + i.amount, 0))}원`,
            tone: overdue.length > 0 ? 'text-signal-danger' : '',
          },
        ].map((card) => (
          <section key={card.label} className="rounded-xl border border-border bg-canvas px-6 py-5">
            <p className="text-xs uppercase tracking-widest text-ink-faint">{card.label}</p>
            <p className={`mt-2 text-lg font-semibold tabular-nums ${card.tone}`}>{card.value}</p>
          </section>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-xs text-ink-faint">고객사</span>
          <Dropdown
            id="invoice-tenant"
            label="고객사 전체"
            options={[
              { value: 'all', label: '전체' },
              ...TENANTS.map((tenant) => ({ value: tenant.id, label: tenant.name })),
            ]}
            value={tenantId}
            onChange={setTenantId}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-xs text-ink-faint">항목</span>
          <Dropdown
            id="invoice-kind"
            label="항목 전체"
            options={[{ value: 'all', label: '전체' }, ...INVOICE_KINDS.map((k) => ({ value: k, label: k }))]}
            value={kind}
            onChange={setKind}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-xs text-ink-faint">상태</span>
          <Dropdown
            id="invoice-state"
            label="상태 전체"
            options={[{ value: 'all', label: '전체' }, ...INVOICE_STATES.map((s) => ({ value: s, label: s }))]}
            value={state}
            onChange={setState}
          />
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-canvas">
        <div className="hidden gap-4 border-b border-border px-5 py-3 text-xs text-ink-faint lg:grid lg:grid-cols-12 lg:items-center">
          <span className="lg:col-span-3">고객사</span>
          <span className="lg:col-span-4">항목</span>
          <span className="lg:col-span-2 lg:text-right">금액</span>
          <span className="lg:col-span-2">기한</span>
          <span className="lg:col-span-1 lg:text-center">상태</span>
        </div>

        {visible.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-ink-muted">조건에 맞는 내역이 없습니다.</p>
        ) : (
          <div className="flex flex-col">
            {visible.map((invoice: InvoiceRecord) => {
              const late = invoice.state === '청구' && invoice.dueAt < today;
              return (
                <div
                  key={invoice.id}
                  className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 last:border-b-0 lg:grid-cols-12 lg:items-center lg:gap-y-0"
                >
                  <div className="min-w-0 lg:col-span-3">
                    <p className="truncate text-sm font-medium">{findTenant(invoice.tenantId)?.name ?? '-'}</p>
                    <p className="truncate font-mono text-xs text-ink-faint">{invoice.id}</p>
                  </div>

                  <div className="min-w-0 lg:col-span-4">
                    <p className="truncate text-sm">
                      {invoice.title}
                      {invoice.recurring && (
                        <span className="ml-1.5 shrink-0 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 text-[10px] text-ink-faint">
                          매월
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-ink-faint">
                      {invoice.kind}
                      {invoice.memo && ` · ${invoice.memo}`}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2 lg:col-span-2 lg:justify-end">
                    <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">금액</span>
                    <span className="text-sm font-medium tabular-nums">{formatAmount(invoice.amount)}원</span>
                  </div>

                  <div className="flex items-baseline gap-2 lg:col-span-2">
                    <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">기한</span>
                    <span
                      className={`font-mono text-xs tabular-nums ${late ? 'text-signal-danger' : 'text-ink-muted'}`}
                    >
                      {invoice.dueAt}
                      {late && ' 지남'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                    <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">상태</span>
                    <span
                      className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${INVOICE_TONE[invoice.state]}`}
                    >
                      {invoice.state}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-4">
          <p className="text-sm text-ink-muted">
            총 <span className="font-medium tabular-nums text-ink">{visible.length}</span>건
          </p>
          <p className="text-sm text-ink-muted">
            합계 <span className="font-medium tabular-nums text-ink">{formatAmount(total)}</span>원
          </p>
        </div>
      </section>
    </>
  );
}
