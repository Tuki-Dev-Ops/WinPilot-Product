/**
 * 이탈한 고객사 — **프론트엔드 전용** 시드.
 *
 * 떠난 고객사를 `tenants.ts` 에서 지우지 않고 여기 따로 두는 이유는 둘이다.
 * 하나는 **운영 중인 목록을 흐리지 않기 위해서**다 — 이탈까지 한 목록에 섞으면 "지금 몇
 * 곳을 맡고 있나" 를 셀 때마다 상태로 걸러야 한다. 다른 하나는 **떠난 이유를 남기기 위해서**다.
 * 계약이 끝난 뒤에 남는 것은 금액이 아니라 이유이고, 그것이 다음 계약의 조건을 정한다.
 */
import type { BadgeTone } from '@winpilot/ui';

export type ChurnReason = '가격' | '기능 부족' | '내부 사정' | '경쟁사 이동' | '연락 두절';

export type ChurnRecord = {
  id: string;
  name: string;
  /** 마지막으로 쓰던 플랜 이름 — 기준 값(`/settings/codes`)의 플랜 목록과 같은 말이다 */
  plan: string;
  manager: string;
  contractedAt: string;
  /** 계약이 끝난 날 */
  churnedAt: string;
  reason: ChurnReason;
  /** 계약 기간 동안 받은 금액 합계 (원) */
  lifetimeAmount: number;
  /** 되찾을 수 있다고 보는지 — 연락을 다시 걸 대상을 고르는 값이다 */
  winBack: boolean;
  memo: string;
};

export const CHURN_REASONS: ChurnReason[] = ['가격', '기능 부족', '내부 사정', '경쟁사 이동', '연락 두절'];

export const CHURNED: ChurnRecord[] = [
  {
    id: 'T-042',
    name: '노르딕테이블',
    plan: '스탠다드',
    manager: '정유진',
    contractedAt: '2024-05-02',
    churnedAt: '2026-05-01',
    reason: '가격',
    lifetimeAmount: 21_600_000,
    winBack: true,
    memo: '베이직으로 낮추면 다시 붙일 수 있다고 했습니다.',
  },
  {
    id: 'T-055',
    name: '하루커피',
    plan: '베이직',
    manager: '최민석',
    contractedAt: '2024-11-18',
    churnedAt: '2026-02-17',
    reason: '내부 사정',
    lifetimeAmount: 7_200_000,
    winBack: true,
    memo: '오프라인 매장을 정리하면서 잠시 멈춘 것입니다.',
  },
  {
    id: 'T-061',
    name: '페이퍼웍스',
    plan: '엔터프라이즈',
    manager: '오세훈',
    contractedAt: '2023-08-01',
    churnedAt: '2025-12-31',
    reason: '경쟁사 이동',
    lifetimeAmount: 68_400_000,
    winBack: false,
    memo: '다국어가 필요해 다른 제품으로 옮겼습니다.',
  },
  {
    id: 'T-073',
    name: '그린바스켓',
    plan: '스탠다드',
    manager: '한지수',
    contractedAt: '2025-02-10',
    churnedAt: '2026-06-30',
    reason: '기능 부족',
    lifetimeAmount: 13_600_000,
    winBack: true,
    memo: '정기 구독 결제를 요청했으나 제공하지 못했습니다.',
  },
  {
    id: 'T-088',
    name: '스튜디오온',
    plan: '베이직',
    manager: '김도윤',
    contractedAt: '2025-06-01',
    churnedAt: '2026-07-15',
    reason: '연락 두절',
    lifetimeAmount: 5_400_000,
    winBack: false,
    memo: '',
  },
];

export const CHURN_TONE: Record<ChurnReason, BadgeTone> = {
  가격: 'brand',
  '기능 부족': 'danger',
  '내부 사정': 'neutral',
  '경쟁사 이동': 'danger',
  '연락 두절': 'neutral',
};

/** 계약을 유지한 개월 수. 이탈이 초기에 일어나는지 후기에 일어나는지가 원인을 가른다. */
export function monthsKept(record: ChurnRecord): number {
  const from = Date.parse(`${record.contractedAt}T00:00:00Z`);
  const to = Date.parse(`${record.churnedAt}T00:00:00Z`);
  return Math.max(Math.round((to - from) / (86_400_000 * 30.4)), 0);
}
