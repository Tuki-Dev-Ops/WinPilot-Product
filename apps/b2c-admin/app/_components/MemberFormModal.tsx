'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Button, Dropdown, HintInput, Modal } from '@winpilot/ui';
import {
  COUNTRY_CODES,
  formatPhone,
  validateMemberField,
  validateMemberForm,
  type MemberFormErrors,
  type MemberFormInput,
  type MemberFormMode,
} from '@/lib/validation/member-record';

export type MemberRecord = {
  /** 고유 ID — 자동 부여, 수정 불가 */
  id: string;
  state: string;
  name: string;
  nickname: string;
  email: string;
  countryCode: string;
  phone: string;
  /** 사용자는 등급(자동), 관리자는 역할(선택) */
  role: string;
  marketingConsent: boolean;
  marketingConsentAt: string | null;
  joined: string;
  lastSeen: string;
};

/**
 * 사용자와 관리자는 같은 폼을 쓴다. 차이는 아래 설정으로만 표현한다 —
 * 두 벌로 복제하면 한쪽만 고쳐지는 순간이 반드시 온다 (docs/spec/05-component.md §5.2).
 */
export type MemberFormConfig = {
  /** '사용자' · '관리자' */
  entityLabel: string;
  /** '회원 고유ID' · '관리자 고유ID' */
  idLabel: string;
  /** '가입일' · '등록일' */
  joinedLabel: string;
  states: string[];
  role:
    | { label: string; kind: 'auto'; autoValue: string }
    | { label: string; kind: 'select'; options: string[] };
};

export type MemberFormModalProps = {
  open: boolean;
  mode: MemberFormMode;
  record: MemberRecord | null;
  /** 추가 모드에서 미리 보여줄 자동 부여 값 */
  nextId: string;
  config: MemberFormConfig;
  onClose: () => void;
  onModeChange: (mode: MemberFormMode) => void;
  onSubmit: (value: MemberFormInput) => void;
};

const emptyInput = (config: MemberFormConfig): MemberFormInput => ({
  state: config.states[0] ?? '활성',
  name: '',
  nickname: '',
  email: '',
  password: '',
  passwordConfirm: '',
  countryCode: '+82',
  phone: '',
  role: config.role.kind === 'auto' ? config.role.autoValue : '',
  marketingConsent: false,
});

/** 자동입력·수정 불가 항목. input 이 아니라 텍스트로 그린다 — input 의 value 는 추출되지 않는다. */
function ReadonlyField({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{label}</span>
        {note && <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-ink-faint">{note}</span>}
      </div>
      <p className="flex h-11 items-center rounded-lg bg-surface px-3 text-sm text-ink-muted">{value}</p>
    </div>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-signal-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function ChoiceGroup({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">{legend}</legend>
      {/* 선택지가 한 줄을 꽉 채우도록 균등 분할한다 — 다른 입력란과 폭이 맞아야 열이 정돈된다. */}
      <div className="mt-1 flex w-full gap-2">
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option)}
              className={`h-11 flex-1 rounded-lg border px-4 text-sm transition-colors duration-150 ${
                active
                  ? 'border-brand-500 bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                  : 'border-border-strong text-ink-muted hover:border-ink-faint'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function MemberFormModal({
  open,
  mode,
  record,
  nextId,
  config,
  onClose,
  onModeChange,
  onSubmit,
}: MemberFormModalProps) {
  const [value, setValue] = useState<MemberFormInput>(() => emptyInput(config));
  const [errors, setErrors] = useState<MemberFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const requireRole = config.role.kind === 'select';
  const validateOptions = { requireRole, roleLabel: config.role.label };

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitted(false);
    setValue(
      record
        ? {
            state: record.state,
            name: record.name,
            nickname: record.nickname,
            email: record.email,
            password: '',
            passwordConfirm: '',
            countryCode: record.countryCode,
            phone: record.phone,
            role: record.role,
            marketingConsent: record.marketingConsent,
          }
        : emptyInput(config),
    );
    // config 는 화면마다 고정이라 의존성에 넣지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, record]);

  const readonly = mode === 'view';

  const update = <K extends keyof MemberFormInput>(field: K, next: MemberFormInput[K]) => {
    const draft = { ...value, [field]: next };
    setValue(draft);
    if (!submitted) return;
    // 비밀번호는 재확인과 짝이므로 함께 다시 본다.
    const affected: Array<keyof MemberFormInput> =
      field === 'password' || field === 'passwordConfirm' ? ['password', 'passwordConfirm'] : [field];
    setErrors((current) => {
      const updated = { ...current };
      for (const key of affected) {
        const message = validateMemberField(key, draft, mode, validateOptions);
        if (message) updated[key] = message;
        else delete updated[key];
      }
      return updated;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validateMemberForm(value, mode, validateOptions);
    setErrors(found);
    const firstInvalid = (['name', 'nickname', 'email', 'password', 'passwordConfirm', 'phone'] as const).find(
      (field) => found[field],
    );
    if (firstInvalid) {
      document.getElementById(`member-${firstInvalid}`)?.focus();
      return;
    }
    if (found.role) return;
    onSubmit(value);
  };

  const consentText = record?.marketingConsent
    ? `동의${record.marketingConsentAt ? ` (${record.marketingConsentAt})` : ''}`
    : '미동의';

  const title = `${config.entityLabel} ${mode === 'create' ? '추가' : mode === 'edit' ? '수정' : '정보'}`;
  const description =
    mode === 'create'
      ? `${config.idLabel}·${config.joinedLabel}은 자동으로 부여됩니다.`
      : mode === 'edit'
        ? '비밀번호를 비워두면 기존 비밀번호가 유지됩니다.'
        : '수정하려면 오른쪽 아래 수정을 누르세요.';

  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      footer={
        <>
          <Button tone="secondary" onClick={onClose}>
            취소
          </Button>
          {/*
            key 를 다르게 주는 것이 중요하다. 같은 위치의 버튼을 React 가 재사용하면,
            '수정' 클릭 → mode 변경 → 같은 DOM 노드가 type="submit" 으로 바뀌고
            브라우저가 그 클릭의 기본 동작으로 폼을 제출해 버린다(모달이 즉시 닫힘).
          */}
          {mode === 'view' ? (
            <Button key="enter-edit" onClick={() => onModeChange('edit')}>
              수정
            </Button>
          ) : (
            <Button key="submit-form" type="submit" form="member-form">
              {mode === 'create' ? '추가' : '저장'}
            </Button>
          )}
        </>
      }
    >
      <form id="member-form" noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <ReadonlyField label={config.idLabel} value={record?.id ?? nextId} note="자동입력" />

        {readonly ? (
          <ReadonlyField label="상태" value={value.state} />
        ) : (
          <ChoiceGroup
            legend="상태"
            options={config.states}
            value={value.state}
            onChange={(next) => update('state', next)}
          />
        )}

        {readonly ? (
          <ReadonlyField label="이름" value={value.name} />
        ) : (
          <Field id="member-name" label="이름" {...(errors.name ? { error: errors.name } : {})}>
            <HintInput
              id="member-name"
              type="text"
              hint="이름을 입력해 주세요"
              value={value.name}
              onChange={(event) => update('name', event.target.value)}
              invalid={Boolean(errors.name)}
              {...(errors.name ? { 'aria-describedby': 'member-name-error' } : {})}
            />
          </Field>
        )}

        {readonly ? (
          <ReadonlyField label="닉네임" value={value.nickname} />
        ) : (
          <Field id="member-nickname" label="닉네임" {...(errors.nickname ? { error: errors.nickname } : {})}>
            <HintInput
              id="member-nickname"
              type="text"
              hint="닉네임을 입력해 주세요"
              value={value.nickname}
              onChange={(event) => update('nickname', event.target.value)}
              invalid={Boolean(errors.nickname)}
              {...(errors.nickname ? { 'aria-describedby': 'member-nickname-error' } : {})}
            />
          </Field>
        )}

        {readonly ? (
          <ReadonlyField label="이메일" value={value.email} />
        ) : (
          <Field id="member-email" label="이메일" {...(errors.email ? { error: errors.email } : {})}>
            <HintInput
              id="member-email"
              type="email"
              autoComplete="off"
              hint="이메일을 입력해 주세요"
              value={value.email}
              onChange={(event) => update('email', event.target.value)}
              invalid={Boolean(errors.email)}
              {...(errors.email ? { 'aria-describedby': 'member-email-error' } : {})}
            />
          </Field>
        )}

        {!readonly && (
          <>
            <Field id="member-password" label="비밀번호" {...(errors.password ? { error: errors.password } : {})}>
              <HintInput
                id="member-password"
                type="password"
                autoComplete="new-password"
                hint="영문·숫자 포함 8자 이상"
                value={value.password}
                onChange={(event) => update('password', event.target.value)}
                invalid={Boolean(errors.password)}
                {...(errors.password ? { 'aria-describedby': 'member-password-error' } : {})}
              />
            </Field>

            <Field
              id="member-passwordConfirm"
              label="비밀번호 재확인"
              {...(errors.passwordConfirm ? { error: errors.passwordConfirm } : {})}
            >
              <HintInput
                id="member-passwordConfirm"
                type="password"
                autoComplete="new-password"
                hint="비밀번호를 한 번 더 입력해 주세요"
                value={value.passwordConfirm}
                onChange={(event) => update('passwordConfirm', event.target.value)}
                invalid={Boolean(errors.passwordConfirm)}
                {...(errors.passwordConfirm ? { 'aria-describedby': 'member-passwordConfirm-error' } : {})}
              />
            </Field>
          </>
        )}

        {readonly ? (
          <ReadonlyField label="휴대폰번호" value={`${value.countryCode} ${formatPhone(value.phone)}`} />
        ) : (
          <div className="flex flex-col gap-2">
            <label htmlFor="member-phone" className="text-sm font-medium">
              국가번호 · 휴대폰번호
            </label>
            <div className="flex items-start gap-2">
              <Dropdown
                id="member-countryCode"
                label="국가번호"
                options={COUNTRY_CODES}
                value={value.countryCode}
                onChange={(next) => update('countryCode', next)}
                className="w-32 shrink-0"
              />
              <HintInput
                id="member-phone"
                type="tel"
                inputMode="numeric"
                hint="숫자만 입력해 주세요"
                value={value.phone}
                onChange={(event) => update('phone', event.target.value)}
                invalid={Boolean(errors.phone)}
                className="flex-1"
                {...(errors.phone ? { 'aria-describedby': 'member-phone-error' } : {})}
              />
            </div>
            {errors.phone && (
              <p id="member-phone-error" className="text-sm text-signal-danger">
                {errors.phone}
              </p>
            )}
          </div>
        )}

        {config.role.kind === 'auto' ? (
          <ReadonlyField label={config.role.label} value={record?.role ?? config.role.autoValue} note="자동입력" />
        ) : readonly ? (
          <ReadonlyField label={config.role.label} value={value.role} />
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{config.role.label}</span>
            <Dropdown
              id="member-role"
              label={`${config.role.label} 선택`}
              options={config.role.options.map((option) => ({ value: option, label: option }))}
              value={value.role}
              onChange={(next) => update('role', next)}
              invalid={Boolean(errors.role)}
            />
            {errors.role && <p className="text-sm text-signal-danger">{errors.role}</p>}
          </div>
        )}

        {readonly ? (
          <ReadonlyField label="마케팅 동의 이력" value={consentText} />
        ) : (
          <ChoiceGroup
            legend="마케팅 동의 이력"
            options={['동의', '미동의']}
            value={value.marketingConsent ? '동의' : '미동의'}
            onChange={(next) => update('marketingConsent', next === '동의')}
          />
        )}

        <ReadonlyField label={config.joinedLabel} value={record?.joined ?? '등록 시 자동'} note="자동입력" />
        <ReadonlyField label="마지막 접속일" value={record?.lastSeen ?? '접속 시 기록'} note="자동입력" />
      </form>
    </Modal>
  );
}
