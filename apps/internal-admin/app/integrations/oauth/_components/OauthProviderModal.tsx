'use client';

import { Field, HintInput, HintTextarea } from '@winpilot/ui';
import { InternalModal } from '@/app/_components/InternalModal';
import { findOauthProvider, type OauthSetting } from '@/lib/data/oauth-providers';

/**
 * 제공자 한 곳의 키를 넣는 창.
 *
 * ## 왜 창인가
 * 전에는 넷(카카오·네이버·구글·애플)의 칸을 **한 화면에 모두 펼쳐** 두었다. 애플만 칸이 넷이라
 * 화면이 열두 칸 넘게 이어졌고, 카카오 키 하나 고치러 온 사람이 애플의 `.p8` 붙여 넣는 자리를
 * 지나가야 했다. 한 번에 손대는 것은 언제나 **한 제공자**다.
 *
 * ## 저장도 제공자마다 따로다
 * 전에는 아래 `저장` 하나가 켜 둔 제공자 전부를 함께 검사했다. 그래서 애플을 켜 두고 키를
 * 아직 못 받았으면 **카카오 값을 고쳐도 저장이 막혔다.** 키는 제공자마다 따로 발급받고 따로
 * 들어오므로, 저장도 따로 끝나야 한다.
 */
export function OauthProviderModal({
  open,
  setting,
  errors,
  onClose,
  onChange,
  onSubmit,
  elevated,
}: {
  open: boolean;
  setting: OauthSetting | null;
  /** `필드키 → 메시지`. 이 제공자 것만 골라 넘긴다 */
  errors: Record<string, string>;
  onClose: () => void;
  onChange: (key: string, value: string) => void;
  onSubmit: () => void;
  /** 고객사 창 위에 뜨는가 — 같은 높이면 뒤의 창이 앞을 덮어 눌리지 않는다 */
  elevated?: boolean;
}) {
  if (!setting) return null;

  const provider = findOauthProvider(setting.id);

  return (
    <InternalModal
      open={open}
      title={`${provider.label} 키`}
      description={`발급처: ${provider.console}`}
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel="저장"
      {...(elevated ? { elevated } : {})}
    >
      {/* 한 줄에 한 칸. 키는 옮겨 적는 값이라 나란히 두면 잘못 붙여 넣기 쉽다. */}
      {provider.fields.map((field) => {
        const id = `oauth-${setting.id}-${field.key}`;
        const error = errors[field.key];

        return (
          <Field
            key={field.key}
            label={field.label}
            htmlFor={id}
            /* 꺼 둔 제공자에는 별표를 붙이지 않는다 — 넣을 의무가 없는 값이다. */
            required={field.required && setting.enabled}
            {...(error ? { error } : field.note ? { hint: field.note } : {})}
          >
            {field.multiline ? (
              <HintTextarea
                id={id}
                rows={5}
                hint={field.hint}
                value={setting.credentials[field.key] ?? ''}
                onChange={(event) => onChange(field.key, event.target.value)}
                invalid={Boolean(error)}
                className="font-mono text-xs"
                {...(error ? { 'aria-describedby': `${id}-error` } : {})}
              />
            ) : (
              <HintInput
                id={id}
                type={field.secret ? 'password' : 'text'}
                hint={field.hint}
                value={setting.credentials[field.key] ?? ''}
                onChange={(event) => onChange(field.key, event.target.value)}
                invalid={Boolean(error)}
                {...(error ? { 'aria-describedby': `${id}-error` } : {})}
              />
            )}
          </Field>
        );
      })}

      <Field
        label="리다이렉트 주소"
        hint="제공자 콘솔에 이 주소를 그대로 등록해야 합니다. 한 글자만 달라도 로그인이 막힙니다."
      >
        {/* 자동 생성 값이라 input 이 아니라 텍스트로 그린다 — 손으로 고칠 것이 아니다. */}
        <p className="flex h-11 items-center overflow-x-auto rounded-lg bg-surface px-3 font-mono text-xs text-ink-muted">
          {setting.redirectUri}
        </p>
      </Field>
    </InternalModal>
  );
}
