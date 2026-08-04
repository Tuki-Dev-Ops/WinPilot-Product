/**
 * 문의 폼 설정 — **저장된 값은 여기 한 곳에만 있다.**
 *
 * 어드민의 `문의 > 설정` 이 이 값을 고치고, 고객 화면의 문의하기 폼이 이 값을 그대로 그린다.
 * 두 화면이 각자 항목 목록을 들면 운영자가 켠 항목이 고객 화면에 나타나지 않는 일이 생긴다.
 */
export type InquiryFieldKey = 'name' | 'email' | 'phone' | 'company' | 'attachment' | 'privacy';

export type InquiryFieldSetting = {
  key: InquiryFieldKey;
  label: string;
  /** 폼에 넣을지 */
  enabled: boolean;
  /** 넣는다면 필수인지 */
  required: boolean;
  /** 끌 수 없는 항목 — 없으면 답변을 보낼 방법이 사라진다 */
  locked?: boolean;
};

export const INQUIRY_CATEGORIES = ['상품 문의', '주문·배송', '교환·반품', '제휴 제안', '기타'];

/**
 * 연락처가 필수인 이유 — 이메일 답변이 스팸함으로 들어가면 문의가 그대로 유실된다.
 * 첨부파일은 선택으로 둔다: 사진이 필요 없는 문의까지 막으면 문의 자체가 줄어든다.
 */
export const INQUIRY_FIELDS: InquiryFieldSetting[] = [
  { key: 'name', label: '이름', enabled: true, required: true, locked: true },
  { key: 'email', label: '이메일', enabled: true, required: true, locked: true },
  { key: 'phone', label: '연락처', enabled: true, required: true },
  { key: 'company', label: '회사명', enabled: false, required: false },
  { key: 'attachment', label: '첨부파일', enabled: true, required: false },
  { key: 'privacy', label: '개인정보 수집 동의', enabled: true, required: true, locked: true },
];

export const INQUIRY_GUIDE_TEXT = '문의 주신 내용은 영업일 기준 1~2일 내에 답변드립니다.';
export const INQUIRY_DONE_TEXT = '문의가 접수되었습니다. 입력하신 이메일로 답변드리겠습니다.';

/** 첨부 가능한 형식과 크기 — 어드민 안내 문구와 고객 화면 안내가 같아야 한다. */
export const INQUIRY_ATTACHMENT = {
  accept: '.jpg,.jpeg,.png,.pdf',
  acceptText: 'JPG · PNG · PDF',
  maxMb: 10,
  maxCount: 3,
} as const;
