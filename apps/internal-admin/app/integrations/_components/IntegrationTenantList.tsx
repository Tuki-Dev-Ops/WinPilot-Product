'use client';

import type { ReactNode } from 'react';
import { Checkbox, RowActions, RowTextButton } from '@winpilot/ui';
import { InternalPanel, InternalTableHead } from '@/app/_components/InternalPanel';
import { TENANTS, type TenantRecord } from '@/lib/data/tenants';

export type IntegrationTenantColumn = { label: string; span: string };

/**
 * 연동 네 화면(PG · OAuth · Plugin · DNS/SSL)이 함께 쓰는 **고객사 목록**.
 *
 * ## 선택기에서 목록으로
 * 전에는 화면 맨 위에 드롭다운 하나(`TenantPicker`)가 있었다. 그것으로는 **어느 고객사가
 * 막혀 있는지**를 알 수 없다 — 고객사를 하나씩 골라 봐야 알 수 있고, 고르기 전 화면은 비어
 * 있다. 이 네 화면을 여는 이유가 대개 "어디가 막혔지" 인데, 그 물음에 답하려면 목록이
 * 먼저 서야 한다.
 *
 * ## 요약 칸은 화면마다 다르다
 * PG 는 실결제인지, OAuth 는 켠 제공자가 몇인지, DNS 는 레코드가 몇 개 들어갔는지가 궁금하다.
 * 그래서 **열 정의와 칸 그리기를 부르는 쪽이 넘긴다** — 여기서 자원을 알면 네 화면의 값이
 * 이 파일 하나로 몰려 들어온다.
 *
 * ## 한 번에 한 곳만 본다
 * 체크는 고르기가 아니라 **지금 보고 있는 고객사**다. 여러 줄이 함께 켜지지 않으므로 전체
 * 선택 단추도 두지 않는다 — 눌러도 할 일이 없는 단추다.
 */
export function IntegrationTenantList({
  value,
  onChange,
  description,
  columns,
  render,
}: {
  value: string;
  onChange: (tenantId: string) => void;
  /** 이 화면에서 줄을 누르면 무엇이 열리는지 */
  description: string;
  /** 고객사 이름 뒤에 붙는 요약 열 */
  columns: IntegrationTenantColumn[];
  /** 그 고객사의 요약 칸. `columns` 와 개수·순서가 같아야 한다 */
  render: (tenant: TenantRecord) => ReactNode[];
}) {
  return (
    <InternalPanel title="고객사" description={description}>
      <InternalTableHead
        columns={[{ label: '고객사 · 담당자', span: 'lg:col-span-3' }, ...columns, { label: '관리', span: 'lg:col-span-1 lg:text-center' }]}
        lead={
          <span className="flex items-center gap-3 lg:col-span-1">
            <span className="w-[18px]" />
            <span className="w-6 text-center">보기</span>
          </span>
        }
      />

      <div className="flex flex-col">
        {TENANTS.map((tenant, index) => {
          const active = tenant.id === value;
          const cells = render(tenant);

          return (
            <div
              key={tenant.id}
              role="button"
              tabIndex={0}
              onClick={() => onChange(tenant.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onChange(tenant.id);
                }
              }}
              className={`grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 text-left transition-colors duration-150 last:border-b-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 lg:grid-cols-12 lg:items-center lg:gap-y-0 ${
                active ? 'bg-brand-50 dark:bg-brand-900' : 'hover:bg-surface'
              }`}
            >
              <div className="flex items-center gap-3 lg:col-span-1" onClick={(event) => event.stopPropagation()}>
                <Checkbox checked={active} onChange={() => onChange(tenant.id)} label={`${tenant.name} 보기`} />
                <span className="w-6 text-center font-mono text-sm tabular-nums text-ink-faint">{index + 1}</span>
              </div>

              <div className="min-w-0 lg:col-span-3">
                <p className={`min-w-0 truncate text-sm font-medium ${active ? 'text-brand-700 dark:text-brand-200' : ''}`}>
                  {tenant.name}
                </p>
                <p className="min-w-0 truncate text-xs text-ink-faint">
                  {tenant.id} · {tenant.manager}
                </p>
              </div>

              {cells.map((cell, cellIndex) => (
                <div key={columns[cellIndex]?.label ?? cellIndex} className={`flex min-w-0 items-center gap-2 ${columns[cellIndex]?.span ?? ''}`}>
                  {/* 좁은 화면에는 열 머리가 없으므로 이름을 함께 적는다. */}
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">
                    {columns[cellIndex]?.label}
                  </span>
                  {cell}
                </div>
              ))}

              <div className="lg:col-span-1">
                <RowActions>
                  <RowTextButton onClick={() => onChange(tenant.id)}>보기</RowTextButton>
                </RowActions>
              </div>
            </div>
          );
        })}
      </div>
    </InternalPanel>
  );
}
