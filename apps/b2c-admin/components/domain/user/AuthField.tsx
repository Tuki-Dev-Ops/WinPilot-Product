import type { ChangeEvent } from 'react';
import { HintInput } from '@winpilot/ui';

export type AuthFieldProps = {
  id: string;
  label: string;
  /** 입력란 안에 보이는 안내 문구 */
  hint: string;
  type: string;
  autoComplete?: string;
  /** 값이 있으면 Error 변형으로 렌더된다 */
  error?: string;
  defaultValue?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /**
   * Figma 컴포넌트로 승격할지 여부.
   *
   * 제품 화면에서 켜면 같은 컴포넌트가 화면 수만큼 중복 생성되고, 같은 variant 조합이
   * 여러 개가 되어 ComponentSet 결합이 깨진다. 변형을 나란히 그려두는
   * 컴포넌트 갤러리(`/ssot/components`)에서만 켠다.
   */
  figmaComponent?: boolean;
};

/**
 * 인증 폼 입력 필드.
 *
 * Figma 로 넘어갈 때:
 *  - `State` variant  ← 오류 유무
 *  - `Label` TEXT     ← 라벨 문구
 *  - `Message` TEXT   ← 오류 문구
 *  - `ShowMessage` BOOLEAN ← 오류 표시 여부
 */
export function AuthField({
  id,
  label,
  hint,
  type,
  autoComplete,
  error,
  defaultValue,
  onChange,
  figmaComponent = false,
}: AuthFieldProps) {
  const invalid = Boolean(error);
  const componentAttributes = figmaComponent
    ? {
        'data-ssot-component': 'AuthField',
        'data-ssot-variant': JSON.stringify({ State: invalid ? 'Error' : 'Default' }),
      }
    : {};

  return (
    <div className="flex flex-col gap-2" {...componentAttributes}>
      <label
        htmlFor={id}
        className="text-sm font-medium"
        {...(figmaComponent ? { 'data-ssot-prop-text': 'Label' } : {})}
      >
        {label}
      </label>

      <HintInput
        id={id}
        name={id}
        type={type}
        hint={hint}
        invalid={invalid}
        {...(autoComplete ? { autoComplete } : {})}
        {...(defaultValue !== undefined ? { defaultValue } : {})}
        {...(onChange ? { onChange } : {})}
        {...(invalid ? { 'aria-describedby': `${id}-error` } : {})}
      />

      {invalid && (
        <p
          id={`${id}-error`}
          className="text-sm text-signal-danger"
          {...(figmaComponent ? { 'data-ssot-prop-text': 'Message', 'data-ssot-prop-bool': 'ShowMessage' } : {})}
        >
          {error}
        </p>
      )}
    </div>
  );
}
