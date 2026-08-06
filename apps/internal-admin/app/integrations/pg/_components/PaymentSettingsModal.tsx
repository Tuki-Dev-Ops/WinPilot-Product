'use client';

import { useEffect, useState } from 'react';
import { Checkbox, Dropdown, Field, HintInput, RequiredLegend } from '@winpilot/ui';
import { InternalModal } from '@/app/_components/InternalModal';
import { PAY_METHODS, maskSecret } from '@/lib/data/integrations';
import {
  PG_PROVIDERS,
  findPgProvider,
  pgFieldsFor,
  pgTakesBilling,
  type PgFieldSpec,
  type PgProviderId,
} from '@/lib/data/pg-providers';
import type { TenantRecord } from '@/lib/data/tenants';

/** 대행사가 바뀌면 필드가 통째로 바뀌므로, 값은 키 → 문자열 한 벌로 든다. */
type Credentials = Record<string, string>;

export type PgDraft = {
  provider: PgProviderId;
  credentials: Credentials;
  methods: string[];
  /** 정기결제를 쓰는가 — 대행사에 따라 받아야 할 값이 하나 늘어난다 */
  billing: boolean;
  live: boolean;
};

export const EMPTY_PG: PgDraft = {
  provider: 'toss',
  credentials: {},
  methods: ['신용카드', '간편결제', '계좌이체'],
  billing: false,
  live: false,
};

/** 필드 하나를 검사한다. 규칙은 스키마가 들고 있고 여기서는 읽기만 한다. */
function checkField(field: PgFieldSpec, raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return field.required ? `${field.label}을(를) 입력해 주세요.` : undefined;

  // 키 값에 공백이 섞이면 서명이 어긋나 결제가 통째로 실패한다. 붙여넣기 사고가 잦은 자리다.
  if (/\s/.test(raw)) return '앞뒤 공백이나 줄바꿈이 섞여 있습니다. 값만 남겨 주세요.';
  if (value.length < 4) return `${field.label}이(가) 너무 짧습니다. 발급받은 값을 그대로 붙여 넣어 주세요.`;
  return undefined;
}

export function validatePg(draft: PgDraft): Record<string, string> {
  const target = findPgProvider(draft.provider);
  const found: Record<string, string> = {};

  for (const field of pgFieldsFor(target, draft.billing)) {
    const message = checkField(field, draft.credentials[field.key] ?? '');
    if (message) found[field.key] = message;
  }
  if (draft.methods.length === 0) found.methods = '결제 수단을 1개 이상 선택해 주세요.';
  return found;
}

/**
 * 한 고객사의 **결제 대행사 설정** 창.
 *
 * ## 왜 화면 아래가 아니라 창인가
 * 전에는 고객사 목록 밑에 이 폼이 이어져 있었다. 다른 고객사를 누르면 화면은 그대로인데 아래
 * 값만 바뀌어서, 지금 넣고 있는 키가 누구 것인지 제목을 다시 읽어야 했다. **결제 키는 잘못
 * 들어가면 남의 고객이 결제하지 못하는 값**이라, 어느 고객사의 자리인지가 화면을 덮을 만큼
 * 분명해야 한다.
 *
 * ## 대행사마다 받는 값이 다르다
 * 이니시스가 넷(MID · signkey · INIAPI Key · IV), KCP 가 둘(사이트코드 · 사이트키)인 식으로
 * 개수도 이름도 다르다. 필드 목록은 `lib/data/pg-providers.ts` 의 표가 들고 있고 이 창은
 * 그것을 그린다 — **별표와 검사도 같은 표에서 나온다.**
 *
 * ## 실결제 전환
 * 되돌리기 어려운 동작이다. 켜는 순간 고객의 카드에서 돈이 빠진다. 기본값이 테스트인 이유도
 * 같다 — 실수로 저장했을 때 덜 위험한 쪽이 기본이어야 한다.
 */
export function PaymentSettingsModal({
  open,
  tenant,
  onClose,
  onSubmit,
}: {
  open: boolean;
  tenant: TenantRecord | undefined;
  onClose: () => void;
  onSubmit: (draft: PgDraft) => void;
}) {
  const [value, setValue] = useState<PgDraft>(EMPTY_PG);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  /* 창을 열 때마다 그 고객사의 값으로 되돌린다 — 앞 고객사의 키가 남아 있으면 사고가 난다. */
  useEffect(() => {
    if (!open) return;
    setValue(EMPTY_PG);
    setErrors({});
    setSubmitted(false);
  }, [open, tenant?.id]);

  if (!tenant) return null;

  const provider = findPgProvider(value.provider);
  const fields = pgFieldsFor(provider, value.billing);

  /**
   * 값이 바뀔 때마다 다시 검사하되 **한 번 제출한 뒤부터만** 한다.
   * 처음부터 빨갛게 두면 아직 아무것도 안 한 사람에게 잘못했다고 말하는 꼴이 된다.
   */
  const commit = (next: PgDraft) => {
    setValue(next);
    if (submitted) setErrors(validatePg(next));
  };

  const setCredential = (key: string, next: string) =>
    commit({ ...value, credentials: { ...value.credentials, [key]: next } });

  const changeProvider = (next: PgProviderId) => {
    /*
      대행사가 바뀌면 앞 대행사의 키를 지운다 — 이름이 같은 칸에 남아 있으면 엉뚱한 값이 저장된다.
      정기결제도 함께 끈다. 스위치가 보이지 않는 대행사로 옮긴 뒤에도 켜진 채로 남아 있으면,
      화면에 없는 값이 검사에만 걸려 "무엇이 잘못됐는지 보이지 않는" 상태가 된다.
    */
    const target = findPgProvider(next);
    commit({
      ...value,
      provider: next,
      credentials: {},
      billing: pgTakesBilling(target) ? value.billing : false,
    });
  };

  const submit = () => {
    setSubmitted(true);
    const found = validatePg(value);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit(value);
  };

  return (
    <InternalModal
      open={open}
      title={`결제 대행사 — ${tenant.name}`}
      description="대행사를 고르면 그 대행사가 요구하는 값만 나타납니다. 값의 이름은 대행사 관리자 화면에 적힌 것과 같습니다."
      onClose={onClose}
      onSubmit={submit}
      submitLabel="저장"
    >
      <RequiredLegend />

      <Field label="대행사" required hint={provider.note}>
        <Dropdown
          id="pg-provider"
          label="대행사 선택"
          options={PG_PROVIDERS.map((item) => ({ value: item.id, label: item.label }))}
          value={value.provider}
          onChange={(next) => changeProvider(next as PgProviderId)}
        />
      </Field>

      {/*
        정기결제 스위치는 **그것을 켜면 값이 하나 더 필요한 대행사에서만** 묻는다.
        다른 대행사에서는 켜도 화면이 그대로라, 눌러 본 사람이 무엇이 달라졌는지를 찾게 된다
        (`pg-providers.ts` 의 `pgTakesBilling`).
      */}
      {pgTakesBilling(provider) && (
        <Field label="정기결제 사용" hint={`${provider.label} 는 정기결제를 쓰면 받아야 할 키가 하나 늘어납니다.`}>
          <label className="flex w-fit shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-border-strong px-3 py-2 text-sm">
            <Checkbox
              checked={value.billing}
              onChange={(checked) => commit({ ...value, billing: checked })}
              label="정기결제 사용"
            />
            {value.billing ? '사용함' : '사용 안 함'}
          </label>
        </Field>
      )}

      {/* 한 줄에 한 칸. 키는 옮겨 적는 값이라 나란히 두면 잘못 붙여 넣기 쉽다. */}
      {fields.map((field) => (
        <Field
          key={field.key}
          label={field.label}
          htmlFor={`pg-${field.key}`}
          required={field.required}
          {...(field.note ? { hint: field.note } : {})}
          {...(errors[field.key] ? { error: errors[field.key] } : {})}
        >
          <HintInput
            id={`pg-${field.key}`}
            type={field.secret ? 'password' : 'text'}
            hint={field.hint}
            value={value.credentials[field.key] ?? ''}
            onChange={(event) => setCredential(field.key, event.target.value)}
            invalid={Boolean(errors[field.key])}
            {...(errors[field.key] ? { 'aria-describedby': `pg-${field.key}-error` } : {})}
            {...(field.required ? { 'aria-required': true } : {})}
          />
          {/* 비밀값은 가려 두므로, 무엇이 저장돼 있는지 뒷자리로만 알린다. */}
          {field.secret && (value.credentials[field.key] ?? '') !== '' && (
            <p className="font-mono text-xs text-ink-faint">
              저장된 값: {maskSecret(value.credentials[field.key] ?? '')}
            </p>
          )}
        </Field>
      ))}

      <Field
        label="결제 수단"
        required
        {...(errors.methods ? { error: errors.methods } : { hint: '고객 화면 결제창에 나타날 수단입니다.' })}
      >
        <div className="flex flex-col gap-2">
          {PAY_METHODS.map((method) => (
            <label
              key={method}
              className="flex items-center gap-2 rounded-lg border border-border-strong px-3 py-2 text-sm"
            >
              <Checkbox
                checked={value.methods.includes(method)}
                onChange={(checked) =>
                  commit({
                    ...value,
                    methods: checked
                      ? [...value.methods, method]
                      : value.methods.filter((item) => item !== method),
                  })
                }
                label={`${method} 사용`}
              />
              {method}
            </label>
          ))}
        </div>
      </Field>

      <Field label="운영 모드" required hint="테스트 모드에서는 실제로 돈이 빠지지 않습니다.">
        <div className="flex flex-col gap-2">
          {(
            [
              { live: false, label: '테스트', note: '결제창은 뜨지만 승인은 일어나지 않습니다.' },
              { live: true, label: '실결제', note: '고객의 카드에서 실제로 금액이 빠져나갑니다.' },
            ] as const
          ).map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={value.live === option.live}
              onClick={() => commit({ ...value, live: option.live })}
              className={`flex flex-col items-start gap-0.5 rounded-lg border px-4 py-3 text-left text-sm transition-colors duration-150 ${
                value.live === option.live
                  ? 'border-brand-500 bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                  : 'border-border-strong text-ink-muted hover:border-ink-faint'
              }`}
            >
              {option.label}
              <span className="text-xs font-normal text-ink-faint">{option.note}</span>
            </button>
          ))}
        </div>
      </Field>

      {value.live && (
        <p className="rounded-lg bg-signal-danger/12 px-4 py-3 text-sm leading-relaxed text-signal-danger">
          실결제 모드입니다. 이 설정으로 저장하면 고객의 카드에서 실제로 금액이 빠져나갑니다.
        </p>
      )}
    </InternalModal>
  );
}
