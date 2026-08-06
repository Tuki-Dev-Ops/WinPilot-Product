/**
 * **고객사가 우리에게 보낸 문의** — 두 콘솔이 같은 것을 읽는다.
 *
 * | 어디 | 무엇을 하는가 |
 * |---|---|
 * | `b2c-admin` `/support` | 고객사가 **올린다**. 자기 고객사의 것만 본다 |
 * | `internal-admin` `/inquiries` | 우리가 **답한다**. 모든 고객사의 것을 본다 |
 *
 * 전에는 사내 콘솔에만 시드가 있었다. 그때는 고객사가 문의를 올릴 자리가 화면에 없었고,
 * 그래서 이 목록에 무엇이 어떻게 들어오는지가 어디에도 적혀 있지 않았다 — 사내 화면만 보면
 * 문의는 **어디선가 그냥 생기는 것**이었다. 올리는 쪽을 만들면서 값을 여기로 옮긴다.
 *
 * 두 벌로 두면 고객사가 올린 문의가 사내 목록에 없거나, 우리가 쓴 답이 고객사에게 보이지
 * 않는다. 그 어긋남은 **고객사가 "답이 없다" 고 전화할 때** 처음 드러난다.
 *
 * ## B2C Admin 의 `문의` 와 다른 것이다
 * 그쪽(`inquiries.ts`)은 **고객이 고객사에게** 보낸 것이다. 받는 쪽도 답하는 쪽도 달라
 * 자원을 나눴다 — 한 이름에 묶으면 고객사 운영자가 자기가 답할 것과 우리가 답할 것을
 * 같은 목록에서 보게 된다.
 *
 * ## 상태 이름을 맞춰 둔 이유
 * 접수·처리중·답변완료·보류는 B2C Admin 의 고객 문의와 **글자까지 같다.** 두 목록을 오가며
 * 일하는 사람이 같은 말을 다르게 읽지 않게 하려는 것이고, 장애 상황에서 서로 통해야 한다.
 */

export type SupportState = '접수' | '처리중' | '답변완료' | '보류';

/** 분류는 사내 콘솔 기준 값(`/settings/codes`)의 `문의 분류` 와 같은 목록이다. */
export type SupportCategory = '장애' | '기능 요청' | '결제' | '계약' | '기타';

export type SupportRequest = {
  id: string;
  /** 어느 고객사가 올렸는가 */
  tenantId: string;
  category: SupportCategory;
  title: string;
  body: string;
  /** 올린 사람 — 고객사 담당자 */
  sender: string;
  receivedAt: string;
  state: SupportState;
  /** 우리 쪽에서 맡은 사람. 아직 배정 전이면 빈 값 */
  assignee: string;
  answer: string;
  /**
   * 장애처럼 시간이 곧 손해인 문의.
   *
   * **고객사가 스스로 켠다.** 우리가 대신 판단하면 급한 것을 늦게 받게 되고, 남용은 목록에서
   * 바로 보이므로(급함 탭의 건수) 통화 한 번으로 정리된다.
   */
  urgent: boolean;
};

export const SUPPORT_STATES: SupportState[] = ['접수', '처리중', '답변완료', '보류'];
export const SUPPORT_CATEGORIES: SupportCategory[] = ['장애', '기능 요청', '결제', '계약', '기타'];

/** 분류를 고를 때 옆에 붙는 말. 이름만으로는 `기능 요청` 과 `기타` 가 갈리지 않는다. */
export const SUPPORT_CATEGORY_NOTE: Record<SupportCategory, string> = {
  장애: '되던 것이 안 됩니다. 가장 먼저 봅니다.',
  '기능 요청': '지금 없는 것을 만들어 달라는 요청입니다.',
  결제: '결제·환불이 뜻대로 되지 않습니다.',
  계약: '플랜·유지보수·견적에 관한 것입니다.',
  기타: '위 어디에도 들지 않는 것입니다.',
};

export const SUPPORT_REQUESTS: SupportRequest[] = [
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

/** 아직 답하지 않은 것. 두 콘솔이 같은 기준으로 세어야 양쪽 수치가 갈리지 않는다. */
export function openRequests(items: readonly SupportRequest[] = SUPPORT_REQUESTS): SupportRequest[] {
  return items.filter((request) => request.state === '접수' || request.state === '처리중');
}

/**
 * 한 고객사의 문의만. 고객사 콘솔은 **자기 것만** 본다 —
 * 다른 고객사의 제목만 보여도 그쪽이 무엇을 만들고 있는지가 드러난다.
 */
export function requestsOf(tenantId: string, items: readonly SupportRequest[] = SUPPORT_REQUESTS): SupportRequest[] {
  return items
    .filter((request) => request.tenantId === tenantId)
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

/** 다음 문의 번호. 화면이 번호 규칙을 각자 만들면 두 콘솔에서 같은 번호가 생긴다. */
export function nextRequestId(items: readonly SupportRequest[] = SUPPORT_REQUESTS): string {
  const biggest = items.reduce((max, request) => Math.max(max, Number(request.id.replace('Q-', '')) || 0), 0);
  return `Q-${biggest + 1}`;
}
