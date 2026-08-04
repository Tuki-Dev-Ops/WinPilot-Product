/**
 * 배너 · 팝업 검증.
 *
 * 링크와 날짜 규칙은 콘텐츠와 같은 것을 쓴다 (`content-record.ts`) — 같은 규칙을
 * 두 번 적으면 한쪽만 고쳐지는 날이 온다.
 */
import { CONTENT_MESSAGES, checkTitle, htmlIsEmpty, isDateString, isHttpUrl } from './content-record';

export const BANNER_MESSAGES = {
  startRequired: '노출 시작일을 입력해 주세요.',
  endBeforeStart: '종료일은 시작일보다 빠를 수 없습니다.',
  widthRange: '팝업 폭은 200 ~ 800 사이의 숫자로 입력해 주세요.',
} as const;

/**
 * 노출 순서는 폼에 없다 — 등록 시 마지막 번호 다음으로 **자동 부여**한다.
 * 손으로 정하게 하면 같은 번호가 겹치거나 중간 번호가 비고, 그 상태가 고객 화면 순서로 새어 나간다.
 */
export type BannerFormInput = {
  title: string;
  subtitle: string;
  badge: string;
  linkUrl: string;
  startAt: string;
  endAt: string;
  visible: boolean;
};

export type BannerFormErrors = Partial<Record<'title' | 'linkUrl' | 'startAt' | 'endAt', string>>;

/** 시작·종료일 공통 검사 — 종료일은 비워 둘 수 있다(상시 노출). */
function checkPeriod(
  startAt: string,
  endAt: string,
): { startAt?: string; endAt?: string } {
  const errors: { startAt?: string; endAt?: string } = {};

  if (!startAt.trim()) errors.startAt = BANNER_MESSAGES.startRequired;
  else if (!isDateString(startAt)) errors.startAt = CONTENT_MESSAGES.dateFormat;

  if (endAt.trim()) {
    if (!isDateString(endAt)) errors.endAt = CONTENT_MESSAGES.dateFormat;
    else if (isDateString(startAt) && endAt.trim() < startAt.trim()) {
      errors.endAt = BANNER_MESSAGES.endBeforeStart;
    }
  }

  return errors;
}

export function validateBanner(input: BannerFormInput): BannerFormErrors {
  const errors: BannerFormErrors = {};

  const title = checkTitle(input.title);
  if (title) errors.title = title;

  // 링크는 선택이지만, 적었다면 형식은 맞아야 한다.
  if (input.linkUrl.trim() && !isHttpUrl(input.linkUrl)) errors.linkUrl = CONTENT_MESSAGES.urlFormat;

  return { ...errors, ...checkPeriod(input.startAt, input.endAt) };
}

export type PopupFormInput = {
  title: string;
  body: string;
  linkUrl: string;
  startAt: string;
  endAt: string;
  position: string;
  width: string;
  todayClose: boolean;
  visible: boolean;
};

export type PopupFormErrors = Partial<
  Record<'title' | 'body' | 'linkUrl' | 'startAt' | 'endAt' | 'width', string>
>;

export function validatePopup(input: PopupFormInput): PopupFormErrors {
  const errors: PopupFormErrors = {};

  const title = checkTitle(input.title);
  if (title) errors.title = title;

  if (htmlIsEmpty(input.body)) errors.body = CONTENT_MESSAGES.bodyRequired;

  if (input.linkUrl.trim() && !isHttpUrl(input.linkUrl)) errors.linkUrl = CONTENT_MESSAGES.urlFormat;

  const width = Number(input.width.replace(/[\s,]/g, ''));
  if (!/^\d+$/.test(input.width.trim()) || width < 200 || width > 800) {
    errors.width = BANNER_MESSAGES.widthRange;
  }

  return { ...errors, ...checkPeriod(input.startAt, input.endAt) };
}
