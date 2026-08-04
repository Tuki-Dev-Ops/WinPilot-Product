/**
 * 문의 답변·설정 검증.
 * HTML 이 비었는지 판정하는 규칙은 콘텐츠와 같은 것을 쓴다 (`content-record.ts`).
 */
import { htmlIsEmpty } from './content-record';

export const INQUIRY_MESSAGES = {
  answerRequired: '답변 내용을 입력해 주세요.',
  answerTooShort: '답변은 10자 이상 입력해 주세요.',
  categoryRequired: '문의 유형을 1개 이상 남겨 주세요.',
  guideRequired: '안내 문구를 입력해 주세요.',
  doneRequired: '접수 완료 메시지를 입력해 주세요.',
  pathRequired: '경로를 입력해 주세요.',
  pathFormat: "경로는 '/' 로 시작해야 합니다.",
  pathDuplicate: '이미 등록된 경로입니다.',
  labelRequired: '경로 이름을 입력해 주세요.',
} as const;

export type AnswerFormInput = { answer: string; state: string };
export type AnswerFormErrors = Partial<Record<'answer', string>>;

/** 답변 저장 검증 — '답변완료' 로 바꾸려면 실제 답변이 있어야 한다. */
export function validateAnswer(input: AnswerFormInput): AnswerFormErrors {
  const errors: AnswerFormErrors = {};

  // 답변 없이 상태만 처리중·보류로 두는 것은 정상적인 흐름이다.
  if (input.state !== '답변완료') return errors;

  if (htmlIsEmpty(input.answer)) {
    errors.answer = INQUIRY_MESSAGES.answerRequired;
    return errors;
  }

  const text = input.answer.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  if (text.length < 10) errors.answer = INQUIRY_MESSAGES.answerTooShort;

  return errors;
}

export type InquirySettingsErrors = Partial<Record<'categories' | 'guideText' | 'doneText', string>>;

export function validateInquirySettings(input: {
  categories: string[];
  guideText: string;
  doneText: string;
}): InquirySettingsErrors {
  const errors: InquirySettingsErrors = {};

  if (input.categories.length === 0) errors.categories = INQUIRY_MESSAGES.categoryRequired;
  if (!input.guideText.trim()) errors.guideText = INQUIRY_MESSAGES.guideRequired;
  if (!input.doneText.trim()) errors.doneText = INQUIRY_MESSAGES.doneRequired;

  return errors;
}

/** 경로 한 줄 검증 — 목록에 넣기 전에 본다. */
export function checkInquiryPath(
  path: string,
  label: string,
  taken: readonly string[],
): string | undefined {
  const trimmed = path.trim();
  if (!trimmed) return INQUIRY_MESSAGES.pathRequired;
  if (!trimmed.startsWith('/')) return INQUIRY_MESSAGES.pathFormat;
  if (taken.includes(trimmed)) return INQUIRY_MESSAGES.pathDuplicate;
  if (!label.trim()) return INQUIRY_MESSAGES.labelRequired;
  return undefined;
}
