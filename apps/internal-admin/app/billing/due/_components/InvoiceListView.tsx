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
  INVOICES,
  INVOICE_KINDS,
  INVOICE_TONE,
  daysFrom,
  dueInvoices,
  formatAmount,
  outstanding,
  type InvoiceKind,
  type InvoiceRecord,
} from '@/lib/data/invoices';
import { TENANTS, findTenant } from '@/lib/data/tenants';

const EMPTY_DRAFT = {
  tenantId: TENANTS[0]?.id ?? '',
  kind: INVOICE_KINDS[0] as InvoiceKind,
  title: '',
  amount: '',
  dueAt: '',
};

const COLUMNS = [
  { label: '고객사', span: 'lg:col-span-3' },
  { label: '항목', span: 'lg:col-span-4' },
  { label: '금액', span: 'lg:col-span-2 lg:text-right' },
  { label: '기한', span: 'lg:col-span-2' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 청구 예정 목록.
 *
 * 사내 어드민은 청구를 **집행하지 않고 안내만** 한다. 그래서 이 화면에는 '결제하기' 가 없고,
 * 대신 **기한이 가까운 것**이 위로 온다 — 담당자가 확인해야 할 것은 그 순서다.
 *
 * 견적도 함께 보여 준다. 아직 확정이 아니지만 곧 확정될 돈이라, 예정 목록에서 빠지면
 * 다음 달 들어올 금액을 셀 때마다 다른 화면을 함께 열어야 한다.
 */
export function InvoiceListView({ today }: { today: string }) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('all');
  const [tenantId, setTenantId] = useState('all');
  const [rows, setRows] = useState<InvoiceRecord[]>(INVOICES);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return dueInvoices(today, rows).filter((invoice) => {
      if (tenantId !== 'all' && invoice.tenantId !== tenantId) return false;
      if (kind !== 'all' && invoice.kind !== kind) return false;
      if (!keyword) return true;
      const tenant = findTenant(invoice.tenantId)?.name ?? '';
      return (
        invoice.title.toLowerCase().includes(keyword) ||
        invoice.id.toLowerCase().includes(keyword) ||
        tenant.toLowerCase().includes(keyword)
      );
    });
  }, [rows, search, kind, tenantId, today]);

  const total = visible.reduce((sum, invoice) => sum + invoice.amount, 0);
  const unpaid = outstanding(visible);
  const soon = visible.filter((invoice) => daysFrom(invoice.dueAt, today) >= -7);

  const create = () => {
    if (!draft.title.trim() || !draft.amount) {
      toast.error({ message: '등록하지 못했습니다.', detail: '항목 이름과 금액은 반드시 입력해야 합니다.' });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.dueAt)) {
      toast.error({ message: '등록하지 못했습니다.', detail: '기한은 YYYY-MM-DD 로 넣어 주세요.' });
      return;
    }
    // 기한이 이미 지난 청구를 예정 목록에서 만들면 만들자마자 연체 목록으로 사라진다.
    if (draft.dueAt < today) {
      toast.error({ message: '등록하지 못했습니다.', detail: '지난 기한으로는 예정 청구를 만들 수 없습니다.' });
      return;
    }

    const record: InvoiceRecord = {
      id: `IV-${2044 + rows.length}`,
      tenantId: draft.tenantId,
      kind: draft.kind,
      title: draft.title.trim(),
      amount: Number(draft.amount),
      issuedAt: today,
      dueAt: draft.dueAt,
      // 새로 만든 것은 언제나 견적이다 — 확정은 회계가 세금계산서를 낼 때 일어난다.
      state: '견적',
      recurring: false,
      memo: '',
    };

    setRows((previous) => [...previous, record]);
    setDraft(EMPTY_DRAFT);
    setCreating(false);
    toast.success({
      message: '청구를 등록했습니다.',
      detail: `${findTenant(record.tenantId)?.name ?? record.tenantId} · ${formatAmount(record.amount)}원 · 견적`,
    });
  };

  return (
    <>
      <InternalSummary
        cards={[
          { label: '예정 합계', value: `${formatAmount(total)}원` },
          {
            label: '확정된 청구',
            value: `${formatAmount(unpaid)}원`,
            tone: 'text-brand-700 dark:text-brand-300',
            hint: '견적을 뺀 금액입니다.',
          },
          {
            label: '7일 안',
            value: `${soon.length}건`,
            tone: soon.length > 0 ? 'text-signal-danger' : '',
            hint: '기한이 일주일 안으로 들어왔습니다.',
          },
        ]}
      />

      <InternalToolbar
        searchId="invoice-search"
        searchLabel="청구 검색"
        searchHint="항목, 번호, 고객사로 검색"
        search={search}
        onSearch={setSearch}
        filters={<InternalChips label="청구 항목" options={INVOICE_KINDS} value={kind} onChange={setKind} />}
        action={{ label: '청구 등록', onClick: () => setCreating(true) }}
      />

      <div className="flex min-w-0 flex-col gap-2 sm:max-w-80">
        <span className="text-xs text-ink-faint">고객사</span>
        <Dropdown
          id="invoice-tenant"
          label="고객사 전체"
          options={[
            { value: 'all', label: '전체' },
            ...TENANTS.map((tenant) => ({ value: tenant.id, label: tenant.name, hint: tenant.id })),
          ]}
          value={tenantId}
          onChange={setTenantId}
        />
      </div>

      <InternalPanel
        title="청구 예정"
        description="기한이 가까운 것부터 옵니다. 기한이 지난 것은 보조 메뉴의 연체에 있습니다."
      >
        <InternalTableHead columns={COLUMNS} />

        {visible.length === 0 ? (
          <InternalEmpty>조건에 맞는 청구 예정 건이 없습니다.</InternalEmpty>
        ) : (
          <div className="flex flex-col">
            {visible.map((invoice: InvoiceRecord) => {
              const left = -daysFrom(invoice.dueAt, today);
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
                      className={`font-mono text-xs tabular-nums ${left <= 7 ? 'text-signal-danger' : 'text-ink-muted'}`}
                    >
                      {invoice.dueAt}
                      <span className="ml-1">{left}일 남음</span>
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

        <InternalTableFoot>
          <p>
            총 <span className="font-medium tabular-nums text-ink">{visible.length}</span>건
          </p>
          <p>
            합계 <span className="font-medium tabular-nums text-ink">{formatAmount(total)}</span>원
          </p>
        </InternalTableFoot>
      </InternalPanel>

      <InternalModal
        open={creating}
        title="청구 등록"
        description="새로 만든 것은 언제나 견적입니다. 확정은 회계가 세금계산서를 낼 때 일어납니다."
        onClose={() => setCreating(false)}
        onSubmit={create}
        submitLabel="등록"
      >
        <InternalField label="고객사">
          <Dropdown
            id="invoice-new-tenant"
            label="고객사 선택"
            options={TENANTS.map((tenant) => ({ value: tenant.id, label: tenant.name, hint: tenant.id }))}
            value={draft.tenantId}
            onChange={(next) => setDraft((previous) => ({ ...previous, tenantId: next }))}
          />
        </InternalField>

        <InternalField label="항목">
          <Dropdown
            id="invoice-new-kind"
            label="항목 선택"
            options={INVOICE_KINDS.map((item) => ({ value: item, label: item }))}
            value={draft.kind}
            onChange={(next) => setDraft((previous) => ({ ...previous, kind: next as InvoiceKind }))}
          />
        </InternalField>

        <InternalField label="제목" htmlFor="invoice-new-title" hint="고객사에게 보내는 안내에 그대로 적힙니다.">
          <HintInput
            id="invoice-new-title"
            type="text"
            hint="예: 2026년 10월 유지보수"
            value={draft.title}
            onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))}
            invalid={!draft.title.trim()}
          />
        </InternalField>

        <InternalField label="금액" htmlFor="invoice-new-amount">
          <HintInput
            id="invoice-new-amount"
            type="text"
            hint="원 단위 숫자만"
            value={draft.amount}
            onChange={(event) =>
              setDraft((previous) => ({ ...previous, amount: event.target.value.replace(/[^0-9]/g, '') }))
            }
            invalid={!draft.amount}
          />
        </InternalField>

        <InternalField label="기한" htmlFor="invoice-new-due" hint="지난 날짜로는 만들 수 없습니다 — 만들자마자 연체가 됩니다.">
          <HintInput
            id="invoice-new-due"
            type="text"
            hint="YYYY-MM-DD"
            value={draft.dueAt}
            onChange={(event) => setDraft((previous) => ({ ...previous, dueAt: event.target.value }))}
            invalid={!draft.dueAt}
          />
        </InternalField>
      </InternalModal>
    </>
  );
}
