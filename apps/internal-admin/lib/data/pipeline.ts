/**
 * 도입 파이프라인 — **프론트엔드 전용** 시드.
 *
 * 고객사 목록은 **지금 상태**만 보여 준다. 어떻게 여기까지 왔는지가 없으면 계약이 끊길 때가
 * 되어서야 이탈 목록에서 처음 알게 되고, 그때는 되돌릴 수 없다. 그래서 **아직 고객사가 아닌
 * 곳까지** 한 줄에 세운다.
 *
 * `운영` 단계에 들어간 것이 곧 `/tenants` 의 목록이다 — 두 화면이 **같은 자료를 다르게 본다**
 * (목록은 표, 파이프라인은 단계별 세로 칸). 그래서 운영 단계의 건은 `tenantId` 를 갖고,
 * 아직 계약 전인 건은 비운다. 시드를 두 벌로 두면 같은 고객사가 두 화면에서 다르게 보인다.
 */
import type { BadgeTone } from '@winpilot/ui';

export type PipelineStage = '문의' | '상담' | '계약' | '구축' | '운영';

export type PipelineDeal = {
  id: string;
  /** 아직 고객사가 아닐 수 있어 이름은 여기 따로 든다 */
  name: string;
  stage: PipelineStage;
  /** 운영 단계에 들어간 건만 고객사 코드를 갖는다 — `lib/data/tenants.ts` 의 id 와 같다 */
  tenantId?: string;
  /** 팔려는 플랜 이름 — 기준 값의 플랜 목록과 같은 말이다 */
  plan: string;
  /** 예상 계약 금액 (원) */
  amount: number;
  /** 사내 담당 — `lib/data/settings.ts` 의 이름과 같다 */
  owner: string;
  /** 이 단계로 들어온 날 */
  enteredAt: string;
  /** 마지막으로 무엇을 했는지 — 활동 기록의 요약과 같은 말이다 */
  lastTouch: string;
  memo: string;
};

/** 단계 차례. 화면의 칸 순서가 이 배열이다 — 화면에 또 적으면 두 곳이 갈라진다. */
export const PIPELINE_STAGES: PipelineStage[] = ['문의', '상담', '계약', '구축', '운영'];

export const DEALS: PipelineDeal[] = [
  {
    id: 'D-301',
    name: '리프레시랩',
    stage: '문의',
    plan: '베이직',
    amount: 6_000_000,
    owner: '정소미',
    enteredAt: '2026-08-03',
    lastTouch: '홈페이지 문의 폼으로 들어옴',
    memo: '',
  },
  {
    id: 'D-302',
    name: '단정한하루',
    stage: '문의',
    plan: '스탠다드',
    amount: 9_600_000,
    owner: '임재훈',
    enteredAt: '2026-07-29',
    lastTouch: '소개로 연결됨',
    memo: '기존 고객사 무드하우스의 소개입니다.',
  },
  {
    id: 'D-303',
    name: '월간가구',
    stage: '상담',
    plan: '스탠다드',
    amount: 9_600_000,
    owner: '정소미',
    enteredAt: '2026-07-22',
    lastTouch: '요구사항 정리 미팅 1회',
    memo: '',
  },
  {
    id: 'D-304',
    name: '포레스트키친',
    stage: '계약',
    plan: '엔터프라이즈',
    amount: 32_000_000,
    owner: '임재훈',
    enteredAt: '2026-07-15',
    lastTouch: '견적서 발송, 법무 검토 중',
    memo: '약관 개정 권한이 필요해 엔터프라이즈로 갑니다.',
  },
  {
    id: 'D-305',
    name: '노트앤펜',
    stage: '구축',
    plan: '베이직',
    amount: 7_200_000,
    owner: '박현우',
    enteredAt: '2026-07-01',
    lastTouch: 'DNS 레코드 전달, 전파 대기',
    memo: '',
  },
  {
    id: 'D-201',
    name: '무드하우스',
    stage: '운영',
    tenantId: 'T-101',
    plan: '엔터프라이즈',
    amount: 28_000_000,
    owner: '정소미',
    enteredAt: '2026-03-02',
    lastTouch: '월간 점검 완료',
    memo: '',
  },
  {
    id: 'D-202',
    name: '트레일노트',
    stage: '운영',
    tenantId: 'T-102',
    plan: '스탠다드',
    amount: 28_000_000,
    owner: '임재훈',
    enteredAt: '2026-01-15',
    lastTouch: '어드민 배포 준비 중',
    memo: '',
  },
  {
    id: 'D-203',
    name: '베이커스랩',
    stage: '운영',
    tenantId: 'T-103',
    plan: '베이직',
    amount: 9_000_000,
    owner: '정소미',
    enteredAt: '2025-09-01',
    lastTouch: '유지보수 연장 안내',
    memo: '유지보수 종료가 한 달 남았습니다.',
  },
];

export const STAGE_TONE: Record<PipelineStage, BadgeTone> = {
  문의: 'neutral',
  상담: 'brand',
  계약: 'brand',
  구축: 'brand',
  운영: 'ok',
};

/** 그 단계에서 무엇을 하는 중인지 — 칸 머리에 적어 둔다. 단계 이름만으로는 갈리지 않는다. */
export const STAGE_MEANING: Record<PipelineStage, string> = {
  문의: '아직 상담 전 단계입니다. 문의 경로와 기본 정보만 확인된 상태입니다.',
  상담: '고객 요구사항을 확인하고 제안 범위를 협의하는 단계입니다.',
  계약: '견적과 계약 조건이 확정되어 계약 절차를 진행하는 단계입니다.',
  구축: '서비스를 개발·설정하고 배포를 준비하는 단계입니다.',
  운영: '구축이 완료되어 서비스를 운영하고 유지보수를 진행하는 단계입니다.',
};

export function stageIndex(stage: PipelineStage): number {
  return PIPELINE_STAGES.indexOf(stage);
}

/** 다음 단계. 마지막(운영)이면 없다 — 운영 다음은 계약이 끝나는 것이고, 그것은 이탈이 받는다. */
export function nextStage(stage: PipelineStage): PipelineStage | undefined {
  return PIPELINE_STAGES[stageIndex(stage) + 1];
}

/** 앞 단계. 되돌릴 길을 두는 이유는 단계를 잘못 옮겼을 때 되돌아올 곳이 있어야 하기 때문이다. */
export function previousStage(stage: PipelineStage): PipelineStage | undefined {
  const index = stageIndex(stage);
  return index > 0 ? PIPELINE_STAGES[index - 1] : undefined;
}

export function dealsIn(stage: PipelineStage, items: readonly PipelineDeal[] = DEALS): PipelineDeal[] {
  return items.filter((deal) => deal.stage === stage);
}

export function formatDealAmount(value: number): string {
  return value.toLocaleString('ko-KR');
}
