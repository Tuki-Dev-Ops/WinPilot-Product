'use client';

import { useMemo, useState } from 'react';
import { useToast } from '@winpilot/ui';
import { InternalGhostButton, InternalSaveRow } from '@/app/_components/InternalForm';
import { InternalEmpty, InternalPanel, InternalSummary, InternalTableHead } from '@/app/_components/InternalPanel';
import { TenantPicker } from '@/app/integrations/_components/TenantPicker';
import { DNS_TONE, defaultDns, type DnsRecord } from '@/lib/data/integrations';
import { TENANTS, findTenant } from '@/lib/data/tenants';

const COLUMNS = [
  { label: '대상', span: 'lg:col-span-2' },
  { label: '종류', span: 'lg:col-span-1 lg:text-center' },
  { label: '호스트', span: 'lg:col-span-3' },
  { label: '값', span: 'lg:col-span-4' },
  { label: '상태', span: 'lg:col-span-2 lg:text-right' },
];

/**
 * DNS 레코드.
 *
 * **저장이 없고 다시 확인만 있다.** 등록은 고객사가 자기 도메인 관리 화면에서 하기 때문이다.
 * 우리가 할 수 있는 것은 넣어야 할 값을 만들어 주고, 지금 어떻게 들어가 있는지 읽는 것뿐이다.
 * 저장 단추를 모양만 맞추자고 두면 눌러 놓고 왜 안 바뀌는지 찾게 된다.
 *
 * 값을 복사하기 쉽게 한 줄로 늘어놓는다 — 이 화면의 값은 읽으라고 있는 것이 아니라
 * **집어 가라고** 있는 것이다.
 *
 * **프론트엔드 전용** — 확인 결과는 이 화면에만 반영된다.
 */
export function DnsSettingsView({ initialTenantId }: { initialTenantId?: string }) {
  const toast = useToast();
  const [tenantId, setTenantId] = useState(initialTenantId ?? TENANTS[0]?.id ?? '');
  const tenant = useMemo(() => findTenant(tenantId), [tenantId]);

  const clientDomain =
    tenant?.deployments.find((deployment) => deployment.kind === 'B2C Client')?.domain ?? 'example.com';
  const adminDomain =
    tenant?.deployments.find((deployment) => deployment.kind === 'B2C Admin')?.domain ?? `admin.${clientDomain}`;

  const records: DnsRecord[] = useMemo(
    () => defaultDns(clientDomain, adminDomain),
    [clientDomain, adminDomain],
  );

  const broken = records.filter((record) => record.state === '불일치' || record.state === '없음');
  const checking = records.filter((record) => record.state === '확인 중');

  return (
    <div className="flex flex-col gap-6">
      <TenantPicker value={tenantId} onChange={setTenantId} tenant={tenant} />

      <InternalSummary
        cards={[
          { label: '레코드', value: `${records.length}개` },
          {
            label: '확인 중',
            value: `${checking.length}개`,
            tone: checking.length > 0 ? 'text-brand-700 dark:text-brand-300' : '',
            hint: '전파에 최대 48시간이 걸립니다.',
          },
          {
            label: '불일치',
            value: `${broken.length}개`,
            tone: broken.length > 0 ? 'text-signal-danger' : '',
            hint: '값 하나가 틀리면 사이트 전체가 열리지 않습니다.',
          },
        ]}
      />

      <InternalPanel
        title="넣어야 할 레코드"
        description="고객사가 자기 도메인 관리 화면에 그대로 넣는 값입니다. 등록은 고객사가 하고, 우리는 값을 만들어 주고 확인합니다."
        aside={<span className="shrink-0 font-mono text-xs text-ink-faint">{clientDomain}</span>}
      >
        <InternalTableHead columns={COLUMNS} />

        {records.length === 0 ? (
          <InternalEmpty>고객사를 고르면 넣어야 할 레코드가 나옵니다.</InternalEmpty>
        ) : (
          <div className="flex flex-col">
            {records.map((record) => (
              <div
                key={`${record.kind}-${record.host}-${record.value}`}
                className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 last:border-b-0 lg:grid-cols-12 lg:items-center lg:gap-y-0"
              >
                <div className="flex items-baseline gap-2 lg:col-span-2">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">대상</span>
                  <span className="truncate text-sm">{record.target}</span>
                </div>

                <div className="flex items-center gap-2 lg:col-span-1 lg:justify-center">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">종류</span>
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2.5 py-1 font-mono text-xs text-ink-muted">
                    {record.kind}
                  </span>
                </div>

                <div className="flex min-w-0 items-baseline gap-2 lg:col-span-3">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">호스트</span>
                  <span className="min-w-0 truncate font-mono text-xs text-ink-muted">{record.host}</span>
                </div>

                <div className="flex min-w-0 items-baseline gap-2 lg:col-span-4">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">값</span>
                  {/* 값은 잘리면 옮겨 적을 수 없다 — 줄이지 않고 자기 상자 안에서 가로로 흐르게 둔다. */}
                  <span className="min-w-0 overflow-x-auto whitespace-nowrap rounded bg-surface px-2 py-1 font-mono text-xs text-ink">
                    {record.value}
                  </span>
                </div>

                <div className="flex items-center gap-2 lg:col-span-2 lg:justify-end">
                  <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">상태</span>
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${DNS_TONE[record.state]}`}
                  >
                    {record.state}
                  </span>
                  <span className="hidden font-mono text-xs tabular-nums text-ink-faint xl:inline">
                    {record.checkedAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <InternalSaveRow>
          {/*
            저장이 아니라 다시 확인이다. 값을 넣는 쪽이 우리가 아니므로 이 화면이 할 수 있는 일은
            지금 어떻게 들어가 있는지 다시 읽는 것뿐이다.
          */}
          <InternalGhostButton
            onClick={() =>
              toast.info({
                message: '레코드를 다시 확인했습니다.',
                detail: `${tenant?.name} · ${broken.length > 0 ? `불일치 ${broken.length}개` : '모두 확인됨'}`,
              })
            }
          >
            다시 확인
          </InternalGhostButton>
        </InternalSaveRow>
      </InternalPanel>

      {broken.length > 0 && (
        <p className="rounded-xl bg-signal-danger/12 px-6 py-4 text-sm leading-relaxed text-signal-danger">
          불일치 레코드가 있습니다. 값이 틀린 채로 두면 고객사 사이트가 열리지 않거나 메일이 스팸으로 갑니다 —
          고객사 담당자에게 위 값을 그대로 전달해 주세요.
        </p>
      )}
    </div>
  );
}
