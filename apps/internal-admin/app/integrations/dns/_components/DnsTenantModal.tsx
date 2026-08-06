'use client';

import { Badge, Button, Checkbox, Modal, RowActions, RowTextButton } from '@winpilot/ui';
import {
  CERT_REQUIREMENTS,
  CERT_TONE,
  DNS_GROUPS,
  DNS_GROUP_NOTE,
  DNS_TONE,
  daysLeft,
  REGISTRAR_GUIDE,
  type Certificate,
  type DnsRecord,
} from '@/lib/data/dns-records';
import type { TenantRecord } from '@/lib/data/tenants';

/**
 * 한 고객사의 **DNS / SSL** 창.
 *
 * ## 셋을 한 창에 담는다
 * 인증서 · 넣어야 할 레코드 · 어디에 넣는지. 이 셋은 **한 물음의 세 부분**이다 — "왜 자물쇠가
 * 안 붙지" 의 답이 레코드 두 줄(`_acme-challenge` · `CAA`)에 있고, 그 줄을 넣을 곳이 등록기관
 * 화면이다. 나누면 원인이 적힌 자리를 보지 못한 채 돌아간다.
 *
 * ## 아래줄이 닫기와 다시 확인이다
 * 저장이 없다. 값은 **레코드마다의 창**에서 저장하고, 이 창이 할 수 있는 일은 지금 어떻게
 * 들어가 있는지 다시 읽는 것뿐이다 — 등록은 고객사가 자기 도메인 관리 화면에서 한다.
 */
export function DnsTenantModal({
  open,
  tenant,
  today,
  records,
  certificates,
  off,
  clientDomain,
  onClose,
  onToggle,
  onEdit,
  onRecheck,
}: {
  open: boolean;
  tenant: TenantRecord | undefined;
  today: string;
  records: DnsRecord[];
  certificates: Certificate[];
  /** 넣지 않기로 한 줄의 id */
  off: string[];
  clientDomain: string;
  onClose: () => void;
  onToggle: (record: DnsRecord, on: boolean) => void;
  onEdit: (id: string) => void;
  onRecheck: () => void;
}) {
  if (!tenant) return null;

  const live = records.filter((record) => !off.includes(record.id));

  /** 이 인증서가 막혀 있다면 어느 줄 때문인가 — 상태만 보고 원인을 찾지 않게 잇는다. */
  const blockers = CERT_REQUIREMENTS.map((need) => ({
    ...need,
    record: live.find((record) => record.id === need.recordId),
  })).filter((need) => need.record && need.record.state !== '확인됨');

  return (
    <Modal
      open={open}
      title={`DNS / SSL — ${tenant.name}`}
      description={`${clientDomain} · 등록은 고객사가 하고 우리는 값을 정해 주고 확인합니다.`}
      onClose={onClose}
      footer={
        <>
          <Button tone="secondary" onClick={onClose}>
            닫기
          </Button>
          {/* 저장이 아니라 다시 확인이다 — 값을 넣는 쪽이 우리가 아니다. */}
          <Button onClick={onRecheck}>다시 확인</Button>
        </>
      }
    >
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">SSL 인증서</h3>

        {certificates.map((certificate) => {
          const left = daysLeft(certificate.expiresAt, today);
          return (
            <div key={certificate.id} className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Badge tone={CERT_TONE[certificate.state]}>{certificate.state}</Badge>
                  <span className="min-w-0 truncate font-mono text-xs text-ink-muted">
                    {certificate.domains.join(' · ')}
                  </span>
                </div>
                <span className="shrink-0 whitespace-nowrap text-sm tabular-nums">
                  D-{left}
                  <span className="ml-1.5 font-mono text-xs text-ink-faint">{certificate.expiresAt} 만료</span>
                </span>
              </div>

              <dl className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
                <div className="flex items-baseline gap-2">
                  <dt className="text-ink-faint">발급</dt>
                  <dd>{certificate.issuer}</dd>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="text-ink-faint">방식</dt>
                  <dd className="font-mono">{certificate.method}</dd>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="text-ink-faint">자동 갱신</dt>
                  {/* 꺼져 있으면 색으로도 갈라 둔다 — 만료 당일에 알게 되는 값이다. */}
                  <dd className={certificate.autoRenew ? '' : 'font-medium text-signal-danger'}>
                    {certificate.autoRenew ? '켜짐' : '꺼짐'}
                  </dd>
                </div>
              </dl>

              <p className="text-xs leading-relaxed text-ink-faint">{certificate.note}</p>
            </div>
          );
        })}

        {/*
          갱신을 막고 있는 줄을 이름으로 가리킨다. 상태만 붉게 두면 무엇을 고쳐야 하는지를
          아래 표에서 다시 찾아야 한다.
        */}
        {blockers.length > 0 && (
          <div className="flex flex-col gap-2 rounded-lg bg-signal-danger/12 px-4 py-3">
            <p className="text-sm font-medium text-signal-danger">갱신을 막고 있는 레코드</p>
            {blockers.map((need) => (
              <button
                key={need.recordId}
                type="button"
                onClick={() => onEdit(need.recordId)}
                className="flex w-fit flex-col text-left"
              >
                <span className="text-sm text-signal-danger underline underline-offset-2">
                  {need.label} — {need.record?.state}
                </span>
                <span className="text-xs leading-relaxed text-ink-muted">{need.why}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 flex flex-col gap-2">
        <h3 className="text-sm font-semibold">넣어야 할 레코드</h3>
        <p className="text-xs leading-relaxed text-ink-muted">
          넣을 것을 켜고, 값은 줄의 설정을 눌러 넣습니다.
        </p>

        {DNS_GROUPS.map((group) => {
          const inGroup = records.filter((record) => record.group === group);
          if (inGroup.length === 0) return null;

          return (
            <div key={group} className="flex flex-col">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border py-2">
                <p className="text-xs uppercase tracking-widest text-ink-faint">{group}</p>
                <p className="min-w-0 text-xs text-ink-muted">{DNS_GROUP_NOTE[group]}</p>
              </div>

              {inGroup.map((record) => {
                const on = !off.includes(record.id);

                return (
                  <div
                    key={record.id}
                    className="flex flex-col gap-2 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className={`flex min-w-0 items-center gap-3 ${on ? '' : 'opacity-50'}`}>
                      <Checkbox
                        checked={on}
                        onChange={(checked) => onToggle(record, checked)}
                        label={`${record.kind} ${record.host} 넣기`}
                        /* 없으면 사이트가 열리지 않는 줄은 끌 수 없다 — 꺼 놓고 왜 안 되는지 찾게 된다. */
                        disabled={record.required}
                      />
                      <div className="min-w-0">
                        <p className="flex min-w-0 items-center gap-2 text-sm">
                          <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 font-mono text-3xs text-ink-muted">
                            {record.kind}
                          </span>
                          <span className="min-w-0 truncate">{record.target}</span>
                          {!record.required && (
                            <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 text-3xs text-ink-faint">
                              권장
                            </span>
                          )}
                        </p>
                        <p className="min-w-0 truncate font-mono text-xs text-ink-faint">{record.host}</p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      {on ? (
                        <Badge tone={DNS_TONE[record.state]}>{record.state}</Badge>
                      ) : (
                        <Badge tone="neutral">안 넣음</Badge>
                      )}
                      <RowActions>
                        <RowTextButton onClick={() => onEdit(record.id)}>설정</RowTextButton>
                      </RowActions>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </section>

      {/*
        값을 만들어 주고도 "이걸 어디에 넣나요" 에서 통화가 한 번 더 생긴다.
        국내 등록기관마다 화면 이름이 달라 말로 설명하기 어렵다.
      */}
      <section className="mt-6 flex flex-col gap-2 rounded-lg bg-surface px-4 py-3">
        <h3 className="text-sm font-semibold">어디에 넣나</h3>
        {REGISTRAR_GUIDE.map((registrar) => (
          <div key={registrar.name} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="w-20 shrink-0 text-xs font-medium">{registrar.name}</span>
            <span className="min-w-0 text-xs leading-relaxed text-ink-muted">{registrar.path}</span>
          </div>
        ))}
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          바꾸기 <span className="font-medium text-ink">하루 전에 TTL 을 300초로 낮춰</span> 두면 바꾼 값이 바로
          퍼집니다. TTL 이 길면 그 시간만큼 옛 값이 살아 있어 고친 것이 보이지 않습니다.
        </p>
      </section>
    </Modal>
  );
}
