'use client';

import { useEffect, useState } from 'react';
import { Badge, HintInput } from '@winpilot/ui';
import { InternalField } from '@/app/_components/InternalForm';
import { InternalModal } from '@/app/_components/InternalModal';
import { DNS_TONE, type DnsRecord } from '@/lib/data/dns-records';
import {
  hasDnsErrors,
  validateDnsForm,
  type DnsFormErrors,
  type DnsFormInput,
} from '@/lib/validation/dns-record';

/**
 * 레코드 한 줄의 값을 **넣는 창**.
 *
 * ## 왜 창인가
 * 열두 줄의 호스트·값·TTL 을 한 화면에 입력칸으로 펼치면 서른여섯 칸이 된다. 한 번에 손대는
 * 것은 언제나 한 줄이고, 나머지 서른세 칸은 그 한 줄을 찾는 동안 지나가는 것이 된다
 * (OAuth 제공자 창과 같은 이유다).
 *
 * ## 저장이 무엇을 뜻하나
 * **우리가 정한 값**을 저장한다 — 고객사에게 넘길 값이 이것이라는 뜻이다. 실제로 그 값이
 * 도메인에 들어갔는지는 저장이 답하지 않는다. 그래서 저장하면 상태가 `확인됨` 이 아니라
 * **`확인 중`** 이 되고, 들어갔는지는 목록의 `다시 확인` 이 읽는다. 저장을 확인으로 읽히게
 * 두면 넣지도 않은 값이 들어간 것으로 보인다.
 *
 * ## 종류는 바꾸지 못한다
 * `A` 를 `CNAME` 으로 바꾸는 것은 값을 고치는 일이 아니라 **다른 레코드를 만드는 일**이다.
 * 목록의 줄은 무엇을 위한 자리인지가 정해져 있고(루트 연결 · 인증서 확인 …), 종류는 그
 * 쓰임이 정한다.
 */
export function DnsRecordModal({
  open,
  record,
  onClose,
  onSubmit,
  elevated,
}: {
  open: boolean;
  record: DnsRecord | null;
  onClose: () => void;
  onSubmit: (input: DnsFormInput) => void;
  /** 고객사 창 위에 뜨는가 — 같은 높이면 뒤의 창이 앞을 덮어 눌리지 않는다 */
  elevated?: boolean;
}) {
  const [value, setValue] = useState<DnsFormInput>({ host: '', value: '', ttl: '' });
  const [errors, setErrors] = useState<DnsFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  /* 창을 열 때마다 그 줄의 값으로 되돌린다 — 앞서 연 줄의 값이 남아 있으면 엉뚱한 곳에 저장된다. */
  useEffect(() => {
    if (!open || !record) return;
    setValue({ host: record.host, value: record.value, ttl: String(record.ttl) });
    setErrors({});
    setSubmitted(false);
  }, [open, record]);

  if (!record) return null;

  const commit = (next: DnsFormInput) => {
    setValue(next);
    if (submitted) setErrors(validateDnsForm(record.kind, next));
  };

  const submit = () => {
    setSubmitted(true);
    const found = validateDnsForm(record.kind, value);
    setErrors(found);
    if (hasDnsErrors(found)) return;

    onSubmit({ host: value.host.trim(), value: value.value.trim(), ttl: value.ttl.trim() });
  };

  return (
    <InternalModal
      open={open}
      title={`${record.kind} · ${record.target}`}
      description={record.purpose}
      onClose={onClose}
      onSubmit={submit}
      submitLabel="저장"
      {...(elevated ? { elevated } : {})}
    >
      <dl className="flex flex-col gap-2 rounded-lg bg-surface px-4 py-3">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="shrink-0 text-xs text-ink-faint">지금 상태</dt>
          <dd className="flex shrink-0 items-center gap-2">
            <Badge tone={DNS_TONE[record.state]}>{record.state}</Badge>
            {record.required ? <Badge tone="danger">필수</Badge> : <Badge tone="neutral">권장</Badge>}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="shrink-0 text-xs text-ink-faint">마지막 확인</dt>
          <dd className="min-w-0 truncate font-mono text-xs tabular-nums">{record.checkedAt}</dd>
        </div>
        <p className="text-xs leading-relaxed text-signal-danger">빠지면 — {record.ifMissing}</p>
      </dl>

      {/* 왜 이 종류·이 모양인지는 물음이 반복되는 줄에만 적혀 있다. */}
      {record.note && (
        <p className="rounded-lg border border-border px-4 py-3 text-xs leading-relaxed text-ink-muted">
          {record.note}
        </p>
      )}

      <InternalField label="종류" hint="쓰임이 정하는 값이라 바꾸지 않습니다. 다른 종류가 필요하면 다른 줄입니다.">
        <p className="flex h-11 items-center rounded-lg bg-surface px-3 font-mono text-sm">{record.kind}</p>
      </InternalField>

      <InternalField
        label="호스트"
        htmlFor="dns-host"
        required
        {...(errors.host ? { error: errors.host } : { hint: '고객사 도메인 관리 화면의 `이름`·`호스트` 칸에 넣는 값입니다.' })}
      >
        <HintInput
          id="dns-host"
          type="text"
          hint="예: www.moodhouse.example"
          value={value.host}
          onChange={(event) => commit({ ...value, host: event.target.value })}
          invalid={Boolean(errors.host)}
          {...(errors.host ? { 'aria-describedby': 'dns-host-error' } : {})}
        />
      </InternalField>

      <InternalField
        label="값"
        htmlFor="dns-value"
        required
        {...(errors.value ? { error: errors.value } : { hint: '고객사가 그대로 복사해 넣는 값입니다.' })}
      >
        <HintInput
          id="dns-value"
          type="text"
          hint={record.value}
          value={value.value}
          onChange={(event) => commit({ ...value, value: event.target.value })}
          invalid={Boolean(errors.value)}
          {...(errors.value ? { 'aria-describedby': 'dns-value-error' } : {})}
        />
      </InternalField>

      <InternalField
        label="TTL (초)"
        htmlFor="dns-ttl"
        required
        {...(errors.ttl
          ? { error: errors.ttl }
          : { hint: '자주 바뀌는 값은 짧게 둡니다. 바꾸기 하루 전에 300초로 낮추면 바꾼 값이 바로 퍼집니다.' })}
      >
        <HintInput
          id="dns-ttl"
          type="text"
          hint="60 ~ 86400"
          value={value.ttl}
          onChange={(event) => commit({ ...value, ttl: event.target.value.replace(/[^0-9]/g, '') })}
          invalid={Boolean(errors.ttl)}
          {...(errors.ttl ? { 'aria-describedby': 'dns-ttl-error' } : {})}
        />
      </InternalField>

      <p className="rounded-lg bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted">
        저장은 <span className="font-medium text-ink">고객사에게 넘길 값</span>을 정하는 것입니다. 실제로
        도메인에 들어갔는지는 목록의 <span className="font-medium text-ink">다시 확인</span>이 읽습니다.
      </p>
    </InternalModal>
  );
}
