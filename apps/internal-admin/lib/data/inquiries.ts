/**
 * 고객사가 **우리에게** 보낸 문의 — **프론트엔드 전용** 시드.
 *
 * B2C Admin 의 문의는 고객이 고객사에게 보낸 것이고, 여기 문의는 고객사가 우리에게 보낸
 * 것이다. 받는 쪽도 답하는 쪽도 달라 자원을 나눴다.
 *
 * 상태 이름(접수·처리중·답변완료·보류)은 **B2C Admin 과 글자까지 같다.** 두 콘솔을 오가며
 * 일하는 사람이 같은 말을 다르게 읽지 않게 하려는 것이고, 장애 상황에서 서로 통해야 한다.
 */
export type InquiryState = '접수' | '처리중' | '답변완료' | '보류';

/** 분류는 기준 값(`/settings/codes`)의 `문의 분류` 와 같은 목록이다 — 여기서 새로 정하지 않는다. */
export type InquiryCategory = '장애' | '기능 요청' | '결제' | '계약' | '기타';

export type InquiryRecord = {
  id: string;
  tenantId: string;
  category: InquiryCategory;
  title: string;
  body: string;
  /** 보낸 사람 — 고객사 담당자 */
  sender: string;
  receivedAt: string;
  state: InquiryState;
  /** 답한 사람. 아직 답하지 않았으면 빈 값 */
  assignee: string;
  answer: string;
  /** 장애처럼 시간이 곧 손해인 문의 */
  urgent: boolean;
};

export const INQUIRY_STATES: InquiryState[] = ['접수', '처리중', '답변완료', '보류'];
export const INQUIRY_CATEGORIES: InquiryCategory[] = ['장애', '기능 요청', '결제', '계약', '기타'];

export const INQUIRIES: InquiryRecord[] = [
  {
    id: 'Q-3081',
    tenantId: 'T-103',
    category: '장애',
    title: '카카오 로그인이 되지 않습니다',
    body: '어제 저녁부터 카카오 로그인 버튼을 누르면 오류 화면으로 갑니다.',
    sender: '이하늘',
    receivedAt: '2026-08-04',
    state: '접수',
    assignee: '',
    answer: '',
    urgent: true,
  },
  {
    id: 'Q-3080',
    tenantId: 'T-101',
    category: '기능 요청',
    title: '정기 구독 결제를 붙일 수 있나요',
    body: '매달 같은 상품을 자동으로 결제하는 방식이 필요합니다.',
    sender: '김서연',
    receivedAt: '2026-08-03',
    state: '처리중',
    assignee: '박현우',
    answer: '',
    urgent: false,
  },
  {
    id: 'Q-3079',
    tenantId: 'T-102',
    category: '결제',
    title: '테스트 결제가 실결제로 잡혔습니다',
    body: '테스트 모드였는데 카드에서 금액이 빠져나갔다는 문의를 받았습니다.',
    sender: '박지훈',
    receivedAt: '2026-08-02',
    state: '답변완료',
    assignee: '박현우',
    answer: '실결제 모드로 저장되어 있었습니다. 테스트로 되돌리고 결제는 취소 처리했습니다.',
    urgent: true,
  },
  {
    id: 'Q-3078',
    tenantId: 'T-101',
    category: '계약',
    title: '유지보수 연장 견적을 받고 싶습니다',
    body: '내년 3월에 끝나는데 미리 조건을 알고 싶습니다.',
    sender: '김서연',
    receivedAt: '2026-07-30',
    state: '답변완료',
    assignee: '정소미',
    answer: '엔터프라이즈 기준 월 120만 원으로 동일하게 연장 가능합니다.',
    urgent: false,
  },
  {
    id: 'Q-3077',
    tenantId: 'T-102',
    category: '기능 요청',
    title: '상품 목록을 엑셀로 내려받고 싶습니다',
    body: '월말 정산에 쓰려고 합니다.',
    sender: '박지훈',
    receivedAt: '2026-07-28',
    state: '보류',
    assignee: '정소미',
    answer: '',
    urgent: false,
  },
  {
    id: 'Q-3076',
    tenantId: 'T-103',
    category: '기타',
    title: '담당자가 바뀌었습니다',
    body: '9월부터 다른 사람이 맡습니다. 계정을 옮겨 주세요.',
    sender: '이하늘',
    receivedAt: '2026-07-25',
    state: '답변완료',
    assignee: '정소미',
    answer: '새 담당자 계정을 만들고 이전 계정은 중지했습니다.',
    urgent: false,
  },
];

export const INQUIRY_TONE: Record<InquiryState, string> = {
  접수: 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
  처리중: 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
  답변완료: 'bg-signal-ok/12 text-signal-ok',
  보류: 'bg-surface text-ink-muted',
};

/** 아직 답하지 않은 것. 대시보드와 목록이 같은 기준으로 세어야 두 수치가 갈리지 않는다. */
export function openInquiries(items: readonly InquiryRecord[] = INQUIRIES): InquiryRecord[] {
  return items.filter((inquiry) => inquiry.state === '접수' || inquiry.state === '처리중');
}
