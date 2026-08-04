'use client';

import { Dropdown } from '@winpilot/ui';
import { TENANTS, type TenantRecord } from '@/lib/data/tenants';

export type TenantPickerProps = {
  value: string;
  onChange: (tenantId: string) => void;
  /** 고른 고객사의 배포 정보를 함께 보여준다 */
  tenant: TenantRecord | undefined;
};

/**
 * 고객사 선택기.
 *
 * 연동 설정은 **반드시 어느 고객사의 것인지**가 먼저다. 선택 없이 값을 보여주면
 * 다른 고객사의 키를 고치는 사고가 난다. 그래서 화면 맨 위에 고정해 두고 도메인까지 같이 보여준다.
 */
export function TenantPicker({ value, onChange, tenant }: TenantPickerProps) {
  return (
    <section className="rounded-xl border border-border bg-canvas px-6 py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-sm font-medium">고객사</span>
          <Dropdown
            id="integration-tenant"
            label="고객사 선택"
            options={TENANTS.map((item) => ({ value: item.id, label: item.name, hint: item.id }))}
            value={value}
            onChange={onChange}
          />
        </div>

        <dl className="flex min-w-0 flex-1 flex-col gap-2 rounded-lg bg-surface px-4 py-3">
          {tenant ? (
            tenant.deployments.map((deployment) => (
              <div key={deployment.kind} className="flex items-baseline justify-between gap-4">
                <dt className="shrink-0 text-xs text-ink-faint">{deployment.kind}</dt>
                <dd className="min-w-0 truncate text-right font-mono text-xs text-ink-muted">
                  {deployment.domain}
                </dd>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-faint">고객사를 선택하세요.</p>
          )}
        </dl>
      </div>
    </section>
  );
}
