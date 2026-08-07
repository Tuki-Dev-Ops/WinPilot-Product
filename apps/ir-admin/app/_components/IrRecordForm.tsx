'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { useToast } from '@winpilot/ui';
import { IrConfirmModal } from './IrConfirmModal';
import { IrGhostButton, IrPrimaryButton, IrSaveRow } from './IrForm';

export type FormMode = 'create' | 'edit';

/**
 * 등록·수정 화면의 **공통 뼈대**.
 *
 * ## 왜 한 벌로 두나
 * 이 콘솔에는 등록·수정 화면이 열일곱이다. 각자 만들면 저장 단추의 자리 · 확인 창을 세우는지 ·
 * 틀린 칸이 있을 때 무엇을 알리는지가 **열일곱 벌로 갈린다.** 실제로 갈리는 방향은 언제나 같다 —
 * 나중에 만든 화면일수록 확인 창이 빠지고, 검사가 느슨해진다.
 *
 * ## 등록과 수정을 한 화면으로 둔다
 * `mode` 하나만 다르다. 나누면 칸을 하나 더할 때마다 **두 곳을 고쳐야** 하고, 그러다 등록에만
 * 있고 수정에는 없는 칸이 생긴다 — 그 칸은 한 번 적히면 다시는 고칠 수 없다.
 *
 * ## 저장 앞에 확인 창을 세운다
 * 여기서 저장하는 것은 전부 **사이트에 그대로 나가는 값**이다. 목록 한 줄 고치는 일과 같은
 * 무게로 저장되면 안 된다. 확인 창의 값어치는 막는 데 있지 않고 **읽게 하는 데** 있으므로,
 * `detail` 에 무엇이 어디로 나가는지를 한 줄로 다시 적는다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function IrRecordForm({
  mode,
  resource,
  listHref,
  detail,
  validate,
  children,
}: {
  mode: FormMode;
  /** `공지사항` · `연혁` 처럼 사람이 부르는 이름. 토스트와 확인 창 문구에 그대로 들어간다 */
  resource: string;
  listHref: string;
  /** 확인 창에서 다시 읽히는 한 줄 — 무엇이 저장되는지 */
  detail: string;
  /**
   * 틀린 칸의 이름들. 비어 있으면 저장으로 넘어간다.
   *
   * 검사를 밖에서 받는 이유: 무엇이 필수인지는 자원마다 다르고, 그 판단이 이 파일에 들어오면
   * 여기가 열일곱 자원을 전부 알게 된다.
   */
  validate: () => string[];
  children: ReactNode;
}) {
  const router = useRouter();
  const toast = useToast();
  const [asking, setAsking] = useState(false);

  const verb = mode === 'create' ? '등록' : '저장';

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const broken = validate();

    if (broken.length > 0) {
      toast.error({
        message: `${verb}하지 못했습니다.`,
        detail: `확인이 필요한 항목이 ${broken.length}개 있습니다 — ${broken.join(' · ')}`,
      });
      return;
    }

    setAsking(true);
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-6">
      {children}

      <IrSaveRow>
        <IrGhostButton
          onClick={() => {
            toast.info({
              message: `${resource} 목록으로 이동합니다.`,
              detail: '저장하지 않은 것은 반영되지 않습니다.',
            });
            router.push(listHref);
          }}
        >
          목록
        </IrGhostButton>
        <IrPrimaryButton>{verb}</IrPrimaryButton>
      </IrSaveRow>

      <IrConfirmModal
        open={asking}
        title={`${resource}을(를) ${verb}할까요`}
        message="사이트에 그대로 나갑니다. 적힌 것이 맞는지 한 번 더 읽어 주세요."
        detail={detail}
        confirmLabel={verb}
        onConfirm={() => {
          setAsking(false);
          toast.success({ message: `${resource}을(를) ${verb}했습니다.`, detail });
          router.push(listHref);
        }}
        onCancel={() => setAsking(false)}
      />
    </form>
  );
}

/**
 * 고칠 수 없는 값 — 코드 · 등록일처럼 화면이 정하는 것.
 *
 * 입력 칸처럼 보이게 두지 않는다. 눌러 봐야 안 되는 것을 아는 자리는 **누른 뒤**가 아니라
 * 그 전이어야 한다.
 */
export function IrReadonly({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <span className="flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-3">
        <span className="min-w-0 truncate font-mono text-sm text-ink-muted">{value}</span>
        {note && <span className="shrink-0 text-xs text-ink-faint">{note}</span>}
      </span>
    </div>
  );
}

/** 글 한 줄 입력. 이 콘솔의 폼이 전부 같은 높이·같은 테두리를 쓰게 한다. */
export function IrTextInput({
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  invalid,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  type?: 'text' | 'date' | 'url' | 'number';
  invalid?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder ?? ''}
      aria-invalid={invalid ?? false}
      className={`h-11 w-full min-w-0 rounded-lg border bg-surface px-3 text-sm text-ink placeholder:text-ink-faint ${
        invalid ? 'border-signal-danger' : 'border-border-strong'
      }`}
    />
  );
}

/** 여러 줄 입력. 줄 수를 받는 이유는 본문과 한 문단짜리 설명이 필요한 높이가 다르기 때문이다. */
export function IrTextArea({
  id,
  value,
  onChange,
  rows = 6,
  placeholder,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  placeholder?: string;
  invalid?: boolean;
}) {
  return (
    <textarea
      id={id}
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder ?? ''}
      aria-invalid={invalid ?? false}
      className={`w-full min-w-0 resize-y rounded-lg border bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-faint ${
        invalid ? 'border-signal-danger' : 'border-border-strong'
      }`}
    />
  );
}

/** 몇 안 되는 것 중 하나 고르기. 갈래처럼 값이 코드로 정해진 칸에 쓴다. */
export function IrSelect({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  options: readonly string[];
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full min-w-0 rounded-lg border border-border-strong bg-surface px-3 text-sm text-ink"
    >
      {options.map((one) => (
        <option key={one} value={one}>
          {one}
        </option>
      ))}
    </select>
  );
}

/**
 * 켜고 끄는 한 줄.
 *
 * 설명을 함께 받는다. `노출` 이라는 말만으로는 **끄면 어떻게 되는지**를 알 수 없고, 그것을
 * 모른 채 끈 것은 사이트에서 사라진 뒤에야 발견된다.
 */
export function IrToggle({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-4 shrink-0 accent-brand"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs leading-relaxed text-ink-muted">{description}</span>
      </span>
    </label>
  );
}
