/**
 * 콘텐츠(공지사항 · 뉴스 · 포트폴리오 · FAQ) 공통 검증.
 *
 * 화면마다 필드가 다르지만 규칙은 겹친다 — 제목은 어디서나 필요하고,
 * 본문은 HTML 이라 태그를 걷어낸 뒤에야 "비었는지" 판정할 수 있다.
 */
export const CONTENT_MESSAGES = {
  titleRequired: '제목을 입력해 주세요.',
  titleLength: '제목은 2자 이상 120자 이하여야 합니다.',
  bodyRequired: '내용을 입력해 주세요.',
  urlRequired: '링크 주소를 입력해 주세요.',
  urlFormat: 'http:// 또는 https:// 로 시작하는 주소를 입력해 주세요.',
  pressRequired: '언론사를 입력해 주세요.',
  dateFormat: '날짜는 YYYY-MM-DD 형식으로 입력해 주세요.',
  clientRequired: '고객사를 입력해 주세요.',
  questionRequired: '질문을 입력해 주세요.',
  answerRequired: '답변을 입력해 주세요.',
  categoryRequired: '카테고리를 선택해 주세요.',
  categoryNameRequired: '카테고리명을 입력해 주세요.',
} as const;

/**
 * HTML 에서 글자만 남긴다.
 *
 * `<p><br></p>` 처럼 눈에는 비어 보이지만 태그는 있는 값이 흔하다. 태그를 지우고
 * 판단하지 않으면 빈 본문이 통과한다. 이미지가 있으면 글자가 없어도 내용이 있는 것으로 본다.
 */
export function htmlIsEmpty(html: string): boolean {
  if (/<img\b/i.test(html)) return false;
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
  return text === '';
}

export function isHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  try {
    const url = new URL(trimmed);
    return Boolean(url.hostname) && url.hostname.includes('.');
  } catch {
    return false;
  }
}

export function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) && !Number.isNaN(Date.parse(`${value.trim()}T00:00:00Z`));
}

export function checkTitle(title: string): string | undefined {
  const trimmed = title.trim();
  if (!trimmed) return CONTENT_MESSAGES.titleRequired;
  if (trimmed.length < 2 || trimmed.length > 120) return CONTENT_MESSAGES.titleLength;
  return undefined;
}

// ── 공지사항 ────────────────────────────────────────────────────────────
export type NoticeFormInput = { title: string; body: string; pinned: boolean; visible: boolean };
export type NoticeFormErrors = Partial<Record<'title' | 'body', string>>;

export function validateNotice(input: NoticeFormInput): NoticeFormErrors {
  const errors: NoticeFormErrors = {};
  const title = checkTitle(input.title);
  if (title) errors.title = title;
  if (htmlIsEmpty(input.body)) errors.body = CONTENT_MESSAGES.bodyRequired;
  return errors;
}

// ── 뉴스 ────────────────────────────────────────────────────────────────
export type NewsFormInput = {
  title: string;
  press: string;
  url: string;
  publishedAt: string;
  summary: string;
  visible: boolean;
};
export type NewsFormErrors = Partial<Record<'title' | 'press' | 'url' | 'publishedAt', string>>;

export function validateNews(input: NewsFormInput): NewsFormErrors {
  const errors: NewsFormErrors = {};
  const title = checkTitle(input.title);
  if (title) errors.title = title;
  if (!input.press.trim()) errors.press = CONTENT_MESSAGES.pressRequired;

  if (!input.url.trim()) errors.url = CONTENT_MESSAGES.urlRequired;
  else if (!isHttpUrl(input.url)) errors.url = CONTENT_MESSAGES.urlFormat;

  if (!isDateString(input.publishedAt)) errors.publishedAt = CONTENT_MESSAGES.dateFormat;

  return errors;
}

// ── 포트폴리오 ──────────────────────────────────────────────────────────
export type PortfolioFormInput = {
  title: string;
  client: string;
  period: string;
  body: string;
  visible: boolean;
};
export type PortfolioFormErrors = Partial<Record<'title' | 'client' | 'body', string>>;

export function validatePortfolio(input: PortfolioFormInput): PortfolioFormErrors {
  const errors: PortfolioFormErrors = {};
  const title = checkTitle(input.title);
  if (title) errors.title = title;
  if (!input.client.trim()) errors.client = CONTENT_MESSAGES.clientRequired;
  if (htmlIsEmpty(input.body)) errors.body = CONTENT_MESSAGES.bodyRequired;
  return errors;
}

// ── FAQ ─────────────────────────────────────────────────────────────────
export type FaqFormInput = { categoryId: string; question: string; answer: string; visible: boolean };
export type FaqFormErrors = Partial<Record<'categoryId' | 'question' | 'answer', string>>;

export function validateFaq(input: FaqFormInput): FaqFormErrors {
  const errors: FaqFormErrors = {};
  if (!input.categoryId) errors.categoryId = CONTENT_MESSAGES.categoryRequired;
  if (!input.question.trim()) errors.question = CONTENT_MESSAGES.questionRequired;
  if (htmlIsEmpty(input.answer)) errors.answer = CONTENT_MESSAGES.answerRequired;
  return errors;
}

export function hasErrors(errors: Record<string, unknown>): boolean {
  return Object.keys(errors).length > 0;
}
