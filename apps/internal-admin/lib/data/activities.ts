/**
 * 활동 기록 — **프론트엔드 전용** 시드.
 *
 * 언제 누구와 무엇을 했는지를 남긴다. **사람 머리에만 있으면 담당자가 바뀌는 순간 사라진다** —
 * 그러면 다음 사람이 같은 것을 다시 묻고, 고객사는 우리가 아무것도 기억하지 못한다고 느낀다.
 *
 * `tenantId` 는 `lib/data/tenants.ts` 의 고객사 코드와 같다. 아직 고객사가 아닌 곳의 활동도
 * 남겨야 하므로 `dealId`(`lib/data/pipeline.ts`)로도 걸 수 있게 두 칸을 둔다 — 둘 다 비운
 * 기록은 만들지 않는다. 누구와 한 일인지 없는 활동은 나중에 찾을 길이 없다.
 */
export type ActivityKind = '통화' | '미팅' | '메일' | '점검';

export type ActivityRecord = {
  id: string;
  kind: ActivityKind;
  /** 고객사 코드 — 계약한 곳의 활동 */
  tenantId?: string;
  /** 파이프라인 건 코드 — 아직 고객사가 아닌 곳의 활동 */
  dealId?: string;
  /** 목록에 이름으로 보이는 상대 — 고객사명이거나 파이프라인 건 이름 */
  target: string;
  /** `YYYY-MM-DD HH:mm` */
  at: string;
  /** 우리 쪽 사람 — `lib/data/settings.ts` 의 이름과 같다 */
  staff: string;
  /** 고객사 쪽 사람 — `lib/data/contacts.ts` 의 이름과 같다 */
  counterpart: string;
  summary: string;
  /** 다음에 하기로 한 것. 비우면 정한 것이 없다 */
  nextStep: string;
};

export const ACTIVITY_KINDS: ActivityKind[] = ['통화', '미팅', '메일', '점검'];

export const ACTIVITIES: ActivityRecord[] = [
  {
    id: 'AC-5012',
    kind: '점검',
    tenantId: 'T-103',
    target: '베이커스랩',
    at: '2026-08-04 16:20',
    staff: '박현우',
    counterpart: '이하늘',
    summary: '카카오 로그인 오류를 확인했습니다. 키는 정상이고 리다이렉트 주소가 바뀌어 있었습니다.',
    nextStep: 'OAuth 설정에서 리다이렉트 주소를 다시 저장한다.',
  },
  {
    id: 'AC-5011',
    kind: '통화',
    tenantId: 'T-103',
    target: '베이커스랩',
    at: '2026-08-04 10:05',
    staff: '정소미',
    counterpart: '이하늘',
    summary: '유지보수 종료가 한 달 남았음을 알렸습니다. 연장 의사는 있으나 금액을 낮추고 싶어 합니다.',
    nextStep: '베이직 유지 조건으로 견적을 다시 만든다.',
  },
  {
    id: 'AC-5010',
    kind: '미팅',
    dealId: 'D-304',
    target: '포레스트키친',
    at: '2026-08-03 14:00',
    staff: '임재훈',
    counterpart: '오지현',
    summary: '약관을 직접 고쳐야 해서 엔터프라이즈로 정했습니다. 법무 검토가 2주 걸린다고 합니다.',
    nextStep: '8월 셋째 주에 계약서 초안을 보낸다.',
  },
  {
    id: 'AC-5009',
    kind: '메일',
    tenantId: 'T-101',
    target: '무드하우스',
    at: '2026-08-02 09:30',
    staff: '정소미',
    counterpart: '김서연',
    summary: '내년 3월 유지보수 연장 견적을 보냈습니다. 월 120만 원 동일 조건입니다.',
    nextStep: '',
  },
  {
    id: 'AC-5008',
    kind: '점검',
    tenantId: 'T-102',
    target: '트레일노트',
    at: '2026-08-01 11:40',
    staff: '박현우',
    counterpart: '박지훈',
    summary: '테스트 결제가 실결제로 잡힌 건을 확인했습니다. 운영 모드가 실결제로 저장되어 있었습니다.',
    nextStep: '결제 취소 처리 결과를 다시 알린다.',
  },
  {
    id: 'AC-5007',
    kind: '미팅',
    dealId: 'D-303',
    target: '월간가구',
    at: '2026-07-28 15:00',
    staff: '정소미',
    counterpart: '한소영',
    summary: '요구사항을 정리했습니다. 상품 옵션이 많아 스탠다드로 충분합니다.',
    nextStep: '견적서를 만든다.',
  },
  {
    id: 'AC-5006',
    kind: '통화',
    dealId: 'D-305',
    target: '노트앤펜',
    at: '2026-07-24 13:10',
    staff: '박현우',
    counterpart: '유재석',
    summary: 'DNS 레코드를 전달했습니다. 도메인 관리 업체가 달라 전파에 시간이 걸린다고 합니다.',
    nextStep: '48시간 뒤 다시 확인한다.',
  },
];

export const ACTIVITY_TONE: Record<ActivityKind, string> = {
  통화: 'bg-surface text-ink-muted',
  미팅: 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200',
  메일: 'bg-surface text-ink-muted',
  점검: 'bg-signal-ok/12 text-signal-ok',
};

/** 그 고객사의 활동 — 최신순. 상세 화면이 목록으로 나가지 않고 여기서 읽는다. */
export function activitiesOf(tenantId: string, items: readonly ActivityRecord[] = ACTIVITIES): ActivityRecord[] {
  return items.filter((item) => item.tenantId === tenantId).sort((a, b) => b.at.localeCompare(a.at));
}

/** 다음에 하기로 한 것이 남아 있는 활동. 적어 놓고 하지 않으면 적은 뜻이 없다. */
export function openNextSteps(items: readonly ActivityRecord[] = ACTIVITIES): ActivityRecord[] {
  return items.filter((item) => item.nextStep.trim().length > 0);
}
