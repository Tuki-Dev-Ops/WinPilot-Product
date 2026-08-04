/**
 * 등급 등록·수정 폼 검증.
 *
 * 등급은 "누적 결제금액이 N원 이상이면 할인율 X%" 규칙 하나로 정의된다.
 * 사용자에게 붙는 등급은 이 기준으로 자동 산정되므로 사용자 화면에서는 등급을 고르지 않는다.
 */
export const GRADE_MESSAGES = {
  nameRequired: '등급명을 입력해 주세요.',
  nameLength: '등급명은 1자 이상 20자 이하여야 합니다.',
  thresholdRequired: '누적금액 기준을 입력해 주세요.',
  thresholdFormat: '0 이상의 숫자만 입력해 주세요.',
  discountRequired: '할인율을 입력해 주세요.',
  discountRange: '할인율은 0 이상 100 이하로 입력해 주세요.',
} as const;

export type GradeFormMode = 'create' | 'edit';

export type GradeFormInput = {
  name: string;
  /** 누적 결제금액 기준 (원). 문자열로 다루고 제출할 때 숫자로 바꾼다. */
  threshold: string;
  /** 할인율 (%) */
  discountRate: string;
};

export type GradeFormErrors = Partial<Record<keyof GradeFormInput, string>>;

const digitsOnly = (value: string) => value.replace(/[\s,]/g, '');

export function validateGradeField(field: keyof GradeFormInput, input: GradeFormInput): string | null {
  if (field === 'name') {
    const value = input.name.trim();
    if (!value) return GRADE_MESSAGES.nameRequired;
    return value.length <= 20 ? null : GRADE_MESSAGES.nameLength;
  }

  if (field === 'threshold') {
    const value = digitsOnly(input.threshold);
    if (!value) return GRADE_MESSAGES.thresholdRequired;
    return /^\d+$/.test(value) ? null : GRADE_MESSAGES.thresholdFormat;
  }

  const value = digitsOnly(input.discountRate);
  if (!value) return GRADE_MESSAGES.discountRequired;
  if (!/^\d+(\.\d+)?$/.test(value)) return GRADE_MESSAGES.discountRange;
  const rate = Number(value);
  return rate >= 0 && rate <= 100 ? null : GRADE_MESSAGES.discountRange;
}

export function validateGradeForm(input: GradeFormInput): GradeFormErrors {
  const errors: GradeFormErrors = {};
  for (const field of ['name', 'threshold', 'discountRate'] as const) {
    const message = validateGradeField(field, input);
    if (message) errors[field] = message;
  }
  return errors;
}

export function parseAmount(value: string): number {
  return Number(digitsOnly(value) || 0);
}

export function formatAmount(value: number): string {
  return value.toLocaleString('ko-KR');
}
