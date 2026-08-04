/**
 * 이 파일은 값을 갖지 않는다 — 저장된 값은 `@winpilot/store` 한 곳에만 있다.
 *
 * 남아 있는 것은 **어드민에서만 쓰는 것**뿐이다: 상태 뱃지 색과 상태 목록, 그리고 폼 설정을
 * 한 덩어리로 묶은 기본값. 고객 화면은 상태 색을 쓰지 않으므로 store 로 올리지 않는다.
 */
import {
  INQUIRY_CATEGORIES,
  INQUIRY_DONE_TEXT,
  INQUIRY_FIELDS,
  INQUIRY_GUIDE_TEXT,
  INQUIRY_PATHS,
  type InquiryFieldSetting,
  type InquiryPathRecord,
  type InquiryState,
} from '@winpilot/store';

export {
  INQUIRIES,
  INQUIRY_ATTACHMENT,
  INQUIRY_CATEGORIES,
  INQUIRY_PATHS,
  INQUIRY_FIELDS as DEFAULT_INQUIRY_FIELDS,
  findInquiry,
  inquiriesOf,
  pathLabel,
  type InquiryFieldKey,
  type InquiryFieldSetting,
  type InquiryPathRecord,
  type InquiryRecord,
  type InquiryState,
} from '@winpilot/store';

export const INQUIRY_STATE_TONE: Record<InquiryState, string> = {
  접수: 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
  처리중: 'bg-surface text-ink-muted',
  답변완료: 'bg-signal-ok/12 text-signal-ok',
  보류: 'bg-signal-danger/12 text-signal-danger',
};

export const INQUIRY_STATES: InquiryState[] = ['접수', '처리중', '답변완료', '보류'];

export type InquirySettings = {
  categories: string[];
  fields: InquiryFieldSetting[];
  paths: InquiryPathRecord[];
  guideText: string;
  doneText: string;
  autoReply: boolean;
};

export const DEFAULT_INQUIRY_SETTINGS: InquirySettings = {
  categories: INQUIRY_CATEGORIES,
  fields: INQUIRY_FIELDS,
  paths: INQUIRY_PATHS,
  guideText: INQUIRY_GUIDE_TEXT,
  doneText: INQUIRY_DONE_TEXT,
  autoReply: true,
};
