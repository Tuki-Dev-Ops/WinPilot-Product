/**
 * 고객사 시드 데이터 — **프론트엔드 전용**.
 *
 * 고객사 하나가 보통 **B2C Client 와 B2C Admin 두 배포**를 쓴다. 도메인과 계정이
 * 각각 따로 있으므로 한 줄로 합치지 않고 배포 단위로 나눠 둔다.
 */
import type { BadgeTone } from '@winpilot/ui';

export type DeploymentKind = 'B2C Client' | 'B2C Admin';

export type Deployment = {
  kind: DeploymentKind;
  domain: string;
  /** 운영 담당자 계정 (로그인 이메일) */
  account: string;
  status: '운영중' | '준비중' | '중지';
};

export type TenantPlan = '베이직' | '스탠다드' | '엔터프라이즈';

export type TenantRecord = {
  id: string;
  name: string;
  /** 고객사 담당자 */
  manager: string;
  managerEmail: string;
  managerPhone: string;
  plan: TenantPlan;
  contractedAt: string;
  /** 유지보수 계약 종료일 — 비우면 종료일 없음 */
  supportUntil: string;
  deployments: Deployment[];
  memo: string;
};

export const TENANT_PLANS: TenantPlan[] = ['베이직', '스탠다드', '엔터프라이즈'];

export const TENANTS: TenantRecord[] = [
  {
    id: 'T-101',
    name: '무드하우스',
    manager: '김서연',
    managerEmail: 'seoyeon.kim@moodhouse.example',
    managerPhone: '01043215678',
    plan: '엔터프라이즈',
    contractedAt: '2026-03-02',
    supportUntil: '2027-03-01',
    deployments: [
      { kind: 'B2C Client', domain: 'moodhouse.example', account: 'ops@moodhouse.example', status: '운영중' },
      { kind: 'B2C Admin', domain: 'admin.moodhouse.example', account: 'admin@moodhouse.example', status: '운영중' },
    ],
    memo: '팝업스토어 시즌마다 트래픽이 몰립니다.',
  },
  {
    id: 'T-102',
    name: '트레일노트',
    manager: '박지훈',
    managerEmail: 'jihoon.park@trailnote.example',
    managerPhone: '01088776655',
    plan: '스탠다드',
    contractedAt: '2026-01-15',
    supportUntil: '2027-01-14',
    deployments: [
      { kind: 'B2C Client', domain: 'trailnote.example', account: 'ops@trailnote.example', status: '운영중' },
      { kind: 'B2C Admin', domain: 'admin.trailnote.example', account: 'admin@trailnote.example', status: '준비중' },
    ],
    memo: '',
  },
  {
    id: 'T-103',
    name: '베이커스랩',
    manager: '이하늘',
    managerEmail: 'haneul.lee@bakerslab.example',
    managerPhone: '01033334444',
    plan: '베이직',
    contractedAt: '2025-09-01',
    supportUntil: '2026-08-31',
    deployments: [
      { kind: 'B2C Client', domain: 'bakerslab.example', account: 'ops@bakerslab.example', status: '중지' },
    ],
    memo: '유지보수 종료가 한 달 남았습니다.',
  },
];

export function findTenant(id: string): TenantRecord | undefined {
  return TENANTS.find((tenant) => tenant.id === id);
}

export const PLAN_TONE: Record<TenantPlan, BadgeTone> = {
  베이직: 'neutral',
  스탠다드: 'brand',
  엔터프라이즈: 'ok',
};

export const DEPLOYMENT_TONE: Record<Deployment['status'], BadgeTone> = {
  운영중: 'ok',
  준비중: 'neutral',
  중지: 'danger',
};

/**
 * 유지보수 계약 상태 — 종료일이 지났는지, 30일 안으로 다가왔는지.
 * '만료 임박' 을 따로 두는 이유는 끝난 뒤에 아는 것이 늦기 때문이다.
 */
export type SupportState = '유효' | '만료 임박' | '만료' | '기한 없음';

export function supportState(supportUntil: string, today: string): SupportState {
  if (!supportUntil) return '기한 없음';
  if (supportUntil < today) return '만료';

  const left = Math.round(
    (Date.parse(`${supportUntil}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000,
  );
  return left <= 30 ? '만료 임박' : '유효';
}

export const SUPPORT_TONE: Record<SupportState, BadgeTone> = {
  유효: 'ok',
  '만료 임박': 'danger',
  만료: 'danger',
  '기한 없음': 'neutral',
};

/** 오늘 날짜를 `YYYY-MM-DD` 로. 서버 컴포넌트에서 한 번만 호출한다. */
export function todayStamp(): string {
  const now = new Date();
  const pad = (value: number) => `${value}`.padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
