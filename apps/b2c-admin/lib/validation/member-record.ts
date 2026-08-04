import { validateEmail, validatePassword } from './user-auth';

/**
 * 사용자·관리자 등록/수정 폼 검증.
 *
 * 두 화면이 같은 규칙을 쓴다 — 이메일·비밀번호는 `user-auth` 의 것을 그대로 재사용한다.
 * 로그인에서 통과한 값이 등록에서 거부되면 모순이다 (docs/spec/07-functional.md §7.2).
 */
export const MEMBER_MESSAGES = {
  nameRequired: '이름을 입력해 주세요.',
  nameLength: '이름은 2자 이상 30자 이하여야 합니다.',
  nicknameRequired: '닉네임을 입력해 주세요.',
  nicknameLength: '닉네임은 2자 이상 20자 이하여야 합니다.',
  passwordConfirmRequired: '비밀번호를 한 번 더 입력해 주세요.',
  passwordMismatch: '비밀번호가 일치하지 않습니다.',
  phoneRequired: '휴대폰번호를 입력해 주세요.',
  phoneFormat: '숫자만 8자리 이상 11자리 이하로 입력해 주세요.',
} as const;

export type MemberFormMode = 'create' | 'view' | 'edit';

export type MemberFormInput = {
  state: string;
  name: string;
  nickname: string;
  email: string;
  password: string;
  passwordConfirm: string;
  countryCode: string;
  phone: string;
  /** 사용자는 등급(자동), 관리자는 역할(선택) */
  role: string;
  marketingConsent: boolean;
};

export type MemberFormErrors = Partial<Record<keyof MemberFormInput, string>>;

/** 역할을 사람이 고르는 화면에서만 필수로 검사한다 (등급은 자동 부여라 검사 대상이 아니다). */
export type MemberValidateOptions = { requireRole?: boolean; roleLabel?: string };

const between = (value: string, min: number, max: number) => value.length >= min && value.length <= max;

export function validateMemberField(
  field: keyof MemberFormInput,
  input: MemberFormInput,
  mode: MemberFormMode,
  options: MemberValidateOptions = {},
): string | null {
  switch (field) {
    case 'name': {
      const value = input.name.trim();
      if (!value) return MEMBER_MESSAGES.nameRequired;
      return between(value, 2, 30) ? null : MEMBER_MESSAGES.nameLength;
    }
    case 'nickname': {
      const value = input.nickname.trim();
      if (!value) return MEMBER_MESSAGES.nicknameRequired;
      return between(value, 2, 20) ? null : MEMBER_MESSAGES.nicknameLength;
    }
    case 'email':
      return validateEmail(input.email);
    case 'password': {
      // 수정 모드에서 둘 다 비어 있으면 '변경하지 않음' 이다.
      if (mode === 'edit' && !input.password && !input.passwordConfirm) return null;
      return validatePassword(input.password);
    }
    case 'passwordConfirm': {
      if (mode === 'edit' && !input.password && !input.passwordConfirm) return null;
      if (!input.passwordConfirm) return MEMBER_MESSAGES.passwordConfirmRequired;
      return input.password === input.passwordConfirm ? null : MEMBER_MESSAGES.passwordMismatch;
    }
    case 'phone': {
      const digits = input.phone.replace(/[\s-]/g, '');
      if (!digits) return MEMBER_MESSAGES.phoneRequired;
      return /^\d{8,11}$/.test(digits) ? null : MEMBER_MESSAGES.phoneFormat;
    }
    case 'role': {
      if (!options.requireRole) return null;
      return input.role ? null : `${options.roleLabel ?? '역할'}을 선택해 주세요.`;
    }
    default:
      return null;
  }
}

const VALIDATED: Array<keyof MemberFormInput> = [
  'name',
  'nickname',
  'email',
  'password',
  'passwordConfirm',
  'phone',
  'role',
];

export function validateMemberForm(
  input: MemberFormInput,
  mode: MemberFormMode,
  options: MemberValidateOptions = {},
): MemberFormErrors {
  const errors: MemberFormErrors = {};
  for (const field of VALIDATED) {
    const message = validateMemberField(field, input, mode, options);
    if (message) errors[field] = message;
  }
  return errors;
}

/** `01012345678` → `010-1234-5678` (표시용) */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return digits;
}

export const COUNTRY_CODES = [
  { value: '+82', label: '+82', hint: '대한민국' },
  { value: '+1', label: '+1', hint: '미국 · 캐나다' },
  { value: '+81', label: '+81', hint: '일본' },
  { value: '+86', label: '+86', hint: '중국' },
  { value: '+84', label: '+84', hint: '베트남' },
  { value: '+65', label: '+65', hint: '싱가포르' },
  { value: '+44', label: '+44', hint: '영국' },
  { value: '+61', label: '+61', hint: '호주' },
  { value: '+49', label: '+49', hint: '독일' },
  { value: '+33', label: '+33', hint: '프랑스' },
];
