/**
 * 약관 검증.
 *
 * 약관은 **버전과 시행일이 본문만큼 중요하다**. 이 둘이 없으면 어떤 고객이 어느 약관에
 * 동의했는지 뒤에 증명할 수 없다.
 */
import { CONTENT_MESSAGES, htmlIsEmpty, isDateString } from './content-record';

export const POLICY_MESSAGES = {
  bodyRequired: '약관 본문을 입력해 주세요.',
  versionRequired: '버전을 입력해 주세요.',
  versionFormat: '버전은 1.0 처럼 숫자와 점으로 입력해 주세요.',
  versionNotNewer: '이전 버전보다 높은 번호를 입력해 주세요.',
  effectiveRequired: '시행일을 입력해 주세요.',
  summaryRequired: '무엇이 바뀌었는지 한 줄로 적어 주세요.',
} as const;

export type PolicyFormInput = {
  version: string;
  effectiveAt: string;
  body: string;
  /** 이번 개정에 대한 설명 — 이력에 남는다 */
  changeSummary: string;
};

export type PolicyFormErrors = Partial<Record<keyof PolicyFormInput, string>>;

/** `1.10` 이 `1.9` 보다 높다 — 문자열 비교로는 반대가 나오므로 마디별로 숫자로 본다. */
export function compareVersion(a: string, b: string): number {
  const left = a.split('.').map((part) => Number(part) || 0);
  const right = b.split('.').map((part) => Number(part) || 0);
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const diff = (left[index] ?? 0) - (right[index] ?? 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

export function validatePolicy(
  input: PolicyFormInput,
  options: { previousVersion?: string; changed: boolean },
): PolicyFormErrors {
  const errors: PolicyFormErrors = {};

  if (htmlIsEmpty(input.body)) errors.body = POLICY_MESSAGES.bodyRequired;

  if (!input.version.trim()) errors.version = POLICY_MESSAGES.versionRequired;
  else if (!/^\d+(\.\d+)*$/.test(input.version.trim())) errors.version = POLICY_MESSAGES.versionFormat;
  else if (
    options.changed &&
    options.previousVersion &&
    compareVersion(input.version.trim(), options.previousVersion) <= 0
  ) {
    /*
      내용을 바꿨는데 버전을 그대로 두면 같은 번호의 약관이 두 벌 존재하게 된다.
      바꾸지 않았다면(오타 수정 등) 굳이 올리라고 하지 않는다.
    */
    errors.version = POLICY_MESSAGES.versionNotNewer;
  }

  if (!input.effectiveAt.trim()) errors.effectiveAt = POLICY_MESSAGES.effectiveRequired;
  else if (!isDateString(input.effectiveAt)) errors.effectiveAt = CONTENT_MESSAGES.dateFormat;

  if (options.changed && !input.changeSummary.trim()) {
    errors.changeSummary = POLICY_MESSAGES.summaryRequired;
  }

  return errors;
}
