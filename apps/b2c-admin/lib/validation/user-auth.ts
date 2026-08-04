/**
 * `user.auth` 검증 규칙.
 *
 * **두 뷰가 이 모듈을 함께 import 한다.** 검증이 갈라지면 Client 에서 통과한 값이
 * Admin 에서 거부되는 모순이 생긴다 (docs/spec/07-functional.md §7.2).
 * 뷰별로 달라야 하는 것은 검증이 아니라 권한이며, 그건 액터 표에 적는다.
 */

export const AUTH_MESSAGES = {
  emailRequired: '이메일을 입력해 주세요.',
  emailFormat: '이메일 형식이 올바르지 않습니다.',
  passwordRequired: '비밀번호를 입력해 주세요.',
  passwordLength: '비밀번호는 8자 이상이어야 합니다.',
  passwordComposition: '영문과 숫자를 함께 포함해야 합니다.',
} as const;

export const PASSWORD_MIN_LENGTH = 8;

// 로컬파트·도메인에 공백과 @ 가 없고, 점 뒤 TLD 가 2자 이상.
// RFC 5322 전체를 흉내내지 않는다 — 최종 판정은 서버가 한다.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return AUTH_MESSAGES.emailRequired;
  if (!EMAIL_PATTERN.test(trimmed)) return AUTH_MESSAGES.emailFormat;
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return AUTH_MESSAGES.passwordRequired;
  if (value.length < PASSWORD_MIN_LENGTH) return AUTH_MESSAGES.passwordLength;
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return AUTH_MESSAGES.passwordComposition;
  return null;
}

export type AuthFieldName = 'email' | 'password';
export type AuthErrors = Partial<Record<AuthFieldName, string>>;

export function validateAuthForm(input: { email: string; password: string }): AuthErrors {
  const errors: AuthErrors = {};
  const email = validateEmail(input.email);
  if (email) errors.email = email;
  const password = validatePassword(input.password);
  if (password) errors.password = password;
  return errors;
}

export function validateAuthField(name: AuthFieldName, value: string): string | null {
  return name === 'email' ? validateEmail(value) : validatePassword(value);
}
