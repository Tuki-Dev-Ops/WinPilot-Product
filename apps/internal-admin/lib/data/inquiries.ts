/**
 * 고객사가 **우리에게** 보낸 문의.
 *
 * ## 값이 여기 있지 않다
 * 원본은 `@winpilot/store` 의 `support.ts` 다. **고객사가 올리고 우리가 답하는** 한 자원이라,
 * 올리는 쪽(`b2c-admin` 의 `/support`)과 답하는 쪽(이 콘솔의 `/inquiries`)이 같은 것을 읽어야
 * 한다. 두 벌로 두면 고객사가 올린 문의가 우리 목록에 없거나 우리가 쓴 답이 고객사에게 보이지
 * 않고, 그 어긋남은 고객사가 "답이 없다" 고 전화할 때 처음 드러난다.
 *
 * ## 이름은 이 콘솔의 말로 쓴다
 * 공유 패키지에서는 `SupportRequest` 이다 — 고객사 쪽에서는 그것이 `문의` 가 아니라 `지원 요청`
 * 에 가깝기 때문이다. 이 콘솔의 화면 열몇 곳은 이미 `문의` 라는 말로 적혀 있고, 그 말이 사이드바
 * 메뉴 이름이기도 하다. 그래서 **이 자리에서 이름만 갈아 끼운다.**
 *
 * B2C Admin 의 `문의` 는 **고객이 고객사에게** 보낸 것이다. 받는 쪽도 답하는 쪽도 달라 자원을
 * 나눴다.
 */
import type { BadgeTone } from '@winpilot/ui';
import {
  SUPPORT_CATEGORIES,
  SUPPORT_STATES,
  SUPPORT_REQUESTS,
  openRequests,
  type SupportCategory,
  type SupportState,
  type SupportRequest,
} from '@winpilot/store';

export type InquiryState = SupportState;
export type InquiryCategory = SupportCategory;
export type InquiryRecord = SupportRequest;

export const INQUIRY_STATES: InquiryState[] = SUPPORT_STATES;
export const INQUIRY_CATEGORIES: InquiryCategory[] = SUPPORT_CATEGORIES;
export const INQUIRIES: InquiryRecord[] = SUPPORT_REQUESTS;

/** 아직 답하지 않은 것. 대시보드와 목록이 같은 기준으로 세어야 두 수치가 갈리지 않는다. */
export const openInquiries = openRequests;

/*
  톤 표는 여기 남는다. 공유 패키지는 `@winpilot/ui` 를 알지 못하고, 알게 하면 값만 쓰려는
  곳까지 UI 를 함께 끌고 온다. 색은 콘솔마다 다를 수 있는 것이기도 하다.
*/
export const INQUIRY_TONE: Record<InquiryState, BadgeTone> = {
  접수: 'brand',
  처리중: 'brand',
  답변완료: 'ok',
  보류: 'neutral',
};
