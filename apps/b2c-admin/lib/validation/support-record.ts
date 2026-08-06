/**
 * 사내 어드민에 올리는 **지원 요청**의 검사.
 *
 * 문의는 사람이 읽고 답하는 글이라 모양 규칙이 많지 않다. 대신 **제목과 내용이 실제로 쓸모
 * 있는 길이인가**를 본다 — `안 돼요` 한 마디만 들어오면 우리가 되묻는 데 하루가 더 걸리고,
 * 그 하루는 장애일 때 그대로 고객사의 손해가 된다.
 */
import { mergeErrors, requiredErrors, type FormSpec } from './field-spec';

export type SupportField = 'title' | 'body';

export type SupportFormInput = {
  title: string;
  body: string;
};

export type SupportFormErrors = Partial<Record<SupportField, string>>;

export const SUPPORT_FORM: FormSpec<SupportField> = {
  title: { label: '제목', required: true, hint: '한 줄로 무엇이 문제인지 적어 주세요.' },
  body: {
    label: '내용',
    required: true,
    hint: '언제부터, 어느 화면에서, 무엇을 눌렀을 때인지 적어 주시면 빨리 답할 수 있습니다.',
  },
};

const TITLE_MAX = 60;
const BODY_MIN = 10;
const BODY_MAX = 1000;

/** 모양 검사. 비어 있는지는 `requiredErrors` 가 본다(`field-spec.ts` 머리말). */
function shapeErrors(input: SupportFormInput): SupportFormErrors {
  const found: SupportFormErrors = {};

  if (input.title.trim().length > TITLE_MAX) {
    found.title = `제목은 ${TITLE_MAX}자까지 적을 수 있습니다.`;
  }

  const body = input.body.trim();
  if (body.length > 0 && body.length < BODY_MIN) {
    /* 짧은 글은 막는 것이 아니라 되묻는 일을 앞당기는 것이다 — 무엇을 더 적어야 하는지 말해 준다. */
    found.body = `무슨 일이 있었는지 조금만 더 적어 주세요. (${BODY_MIN}자 이상)`;
  }
  if (body.length > BODY_MAX) {
    found.body = `내용은 ${BODY_MAX}자까지 적을 수 있습니다.`;
  }

  return found;
}

export function validateSupportForm(input: SupportFormInput): SupportFormErrors {
  return mergeErrors(requiredErrors(SUPPORT_FORM, input), shapeErrors(input));
}

/** 칸 하나만 다시 본다 — 고친 칸의 붉은 글씨를 바로 거두기 위해서다. */
export function validateSupportField(field: SupportField, input: SupportFormInput): string | undefined {
  return validateSupportForm(input)[field];
}
