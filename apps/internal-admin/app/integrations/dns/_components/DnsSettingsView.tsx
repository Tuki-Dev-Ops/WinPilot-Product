'use client';

import { useMemo, useState } from 'react';
import { Badge, useToast } from '@winpilot/ui';
import { IntegrationTenantList } from '@/app/integrations/_components/IntegrationTenantList';
import {
  brokenDns,
  daysLeft,
  defaultCertificates,
  defaultDns,
  type DnsRecord,
} from '@/lib/data/dns-records';
import { findTenant, todayStamp } from '@/lib/data/tenants';
import type { DnsFormInput } from '@/lib/validation/dns-record';
import { DnsRecordModal } from './DnsRecordModal';
import { DnsTenantModal } from './DnsTenantModal';

/** 그 고객사의 두 도메인. 레코드 값이 여기서 만들어진다. */
function domainsOf(tenantId: string): { client: string; admin: string } {
  const tenant = findTenant(tenantId);
  const client =
    tenant?.deployments.find((deployment) => deployment.kind === 'B2C Client')?.domain ?? 'example.com';
  const admin =
    tenant?.deployments.find((deployment) => deployment.kind === 'B2C Admin')?.domain ?? `admin.${client}`;
  return { client, admin };
}

/**
 * DNS / SSL.
 *
 * ## 목록 → 고객사 창 → 레코드 창
 * 화면에 남는 것은 **고객사 목록** 하나다. 줄을 누르면 그 고객사의 인증서와 레코드가 창으로
 * 열리고, 값은 다시 그 안의 창에서 넣는다.
 *
 * | 층 | 답하는 물음 |
 * |---|---|
 * | 목록 | 어느 고객사의 도메인이 막혀 있고 인증서가 급한가 |
 * | 고객사 창 | 그 고객사에 무엇이 들어갔고 인증서를 무엇이 막고 있는가 |
 * | 레코드 창 | 그 줄의 호스트 · 값 · TTL 을 넣는다 |
 *
 * ## 인증서와 레코드를 나누지 않는다
 * **인증서는 DNS 로 발급받는다.** `_acme-challenge` 위임과 CAA 가 맞아야 나오고, 그 둘은 같은
 * 창의 표에 있는 줄이다. 나누면 "자물쇠가 왜 안 붙지" 를 물으러 온 사람이 원인이 적힌 표를
 * 보지 못한 채 돌아간다.
 *
 * ## 저장과 확인은 다른 일이다
 * 저장은 **고객사에게 넘길 값**을 정하는 것이고, 그 값이 실제로 도메인에 들어갔는지는
 * `다시 확인` 이 읽는다. 그래서 저장한 줄은 `확인됨` 이 아니라 **`확인 중`** 이 된다.
 *
 * **프론트엔드 전용** — 저장·확인 결과는 이 화면에만 반영된다.
 */
export function DnsSettingsView({ initialTenantId }: { initialTenantId?: string }) {
  const toast = useToast();
  const [tenantId, setTenantId] = useState(initialTenantId ?? '');
  const tenant = useMemo(() => findTenant(tenantId), [tenantId]);
  const today = todayStamp();

  /*
    고객사마다의 레코드와 넣지 않기로 한 줄. 아직 손대지 않은 곳은 여기 없고 그때는 기본값을
    읽는다 — 빈 값과 "기본 그대로" 를 같은 것으로 두면 저장한 적 없는 곳이 비어 보인다.
  */
  const [saved, setSaved] = useState<Record<string, DnsRecord[]>>({});
  const [off, setOff] = useState<Record<string, string[]>>({});

  const recordsOf = (id: string) => {
    const mine = saved[id];
    if (mine) return mine;
    const { client, admin } = domainsOf(id);
    return defaultDns(client, admin);
  };
  const offOf = (id: string) => off[id] ?? [];

  const [editing, setEditing] = useState<string | null>(null);

  const records = tenant ? recordsOf(tenant.id) : [];
  const certificates = useMemo(() => {
    if (!tenant) return [];
    const { client, admin } = domainsOf(tenant.id);
    return defaultCertificates(client, admin);
  }, [tenant]);

  const editingRecord = records.find((record) => record.id === editing) ?? null;

  const toggle = (record: DnsRecord, on: boolean) => {
    if (!tenant || record.required) return;

    setOff((previous) => {
      const current = previous[tenant.id] ?? [];
      return {
        ...previous,
        [tenant.id]: on ? current.filter((id) => id !== record.id) : [...current, record.id],
      };
    });
  };

  const save = (input: DnsFormInput) => {
    if (!tenant || !editingRecord) return;

    setSaved((previous) => ({
      ...previous,
      [tenant.id]: recordsOf(tenant.id).map((record) =>
        record.id === editingRecord.id
          ? {
              ...record,
              host: input.host,
              value: input.value,
              ttl: Number(input.ttl),
              /*
                저장은 값을 정하는 일이지 들어갔다는 뜻이 아니다. 그래서 `확인 중` 으로 두고,
                실제로 들어갔는지는 `다시 확인` 이 읽는다.
              */
              state: '확인 중' as const,
            }
          : record,
      ),
    }));
    setEditing(null);
    toast.success({
      message: '레코드를 저장했습니다.',
      detail: `${editingRecord.kind} · ${input.host} — 고객사에 전달한 뒤 다시 확인을 누르세요.`,
    });
  };

  const recheck = () => {
    if (!tenant) return;

    const live = records.filter((record) => !offOf(tenant.id).includes(record.id));
    const broken = brokenDns(live);
    toast.info({
      message: '레코드를 다시 확인했습니다.',
      detail: `${tenant.name} · ${broken.length > 0 ? `없거나 틀린 것 ${broken.length}개` : '모두 확인됨'}`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/*
        고객사 목록이 곧 이 화면이다. 가장 급한 물음이 **어느 고객사가 막혀 있는가**인데,
        선택기 하나로는 고객사를 하나씩 골라 봐야 알 수 있었다.
      */}
      <IntegrationTenantList
        value={tenantId}
        onChange={setTenantId}
        description="줄을 누르면 그 고객사의 인증서와 레코드가 창에서 열립니다."
        columns={[
          { label: '도메인', span: 'lg:col-span-3' },
          { label: '레코드', span: 'lg:col-span-2' },
          { label: '인증서', span: 'lg:col-span-2' },
        ]}
        render={(one) => {
          const { client, admin } = domainsOf(one.id);
          const list = recordsOf(one.id);
          const live = list.filter((record) => !offOf(one.id).includes(record.id));
          const broken = brokenDns(live).length;
          const done = live.filter((record) => record.state === '확인됨').length;
          const certs = defaultCertificates(client, admin);
          const soon = [...certs].sort((a, b) => daysLeft(a.expiresAt, today) - daysLeft(b.expiresAt, today))[0];
          const left = soon ? daysLeft(soon.expiresAt, today) : null;

          return [
            <span key="domain" className="min-w-0">
              <span className="block min-w-0 truncate font-mono text-xs text-ink-muted">{client}</span>
              <span className="block min-w-0 truncate font-mono text-3xs text-ink-faint">{admin}</span>
            </span>,
            <span key="records" className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-sm tabular-nums">
                {done}
                <span className="text-ink-faint"> / {live.length}</span>
              </span>
              {/* 막힌 곳을 목록에서 바로 센다 — 골라 들어가야만 보이면 어디부터 볼지 정할 수 없다. */}
              {broken > 0 && <Badge tone="danger">{broken}개 빠짐</Badge>}
            </span>,
            left === null ? (
              <Badge key="cert" tone="neutral">
                없음
              </Badge>
            ) : (
              <Badge key="cert" tone={left <= 30 ? 'danger' : 'ok'}>
                D-{left}
              </Badge>
            ),
          ];
        }}
      />

      <DnsTenantModal
        open={tenant !== undefined}
        tenant={tenant}
        today={today}
        records={records}
        certificates={certificates}
        off={tenant ? offOf(tenant.id) : []}
        clientDomain={tenant ? domainsOf(tenant.id).client : ''}
        onClose={() => {
          setTenantId('');
          setEditing(null);
        }}
        onToggle={toggle}
        onEdit={setEditing}
        onRecheck={recheck}
      />

      {/* 고객사 창 **위에** 뜬다 — 같은 높이면 뒤의 창이 앞을 덮어 눌리지 않는다. */}
      <DnsRecordModal
        open={editingRecord !== null}
        record={editingRecord}
        elevated
        onClose={() => setEditing(null)}
        onSubmit={save}
      />
    </div>
  );
}
