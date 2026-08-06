/**
 * 구독 — 플랜의 **요금과 한도**. **프론트엔드 전용** 시드.
 *
 * ## 권한도 기능도 여기 없다
 * 전에는 이 파일에 `ROLES` (`R-01 상품 관리` …) 가 함께 있었고, 플랜마다 그 id 를 배열로
 * 들고 있었다. 같은 것을 세 곳이 말하게 된 뒤로 세 곳이 서로 어긋났다.
 *
 * | 무엇 | 어디 |
 * |---|---|
 * | 이 플랜에 이 화면이 들어오는가 | `plan-features.ts` — 기능마다 `from` (최소 플랜) |
 * | 고객사 직원 한 명이 그 화면에서 무엇을 하는가 | `@winpilot/store` 의 `CONSOLE_ROLES` |
 * | 얼마이고 몇 개까지인가 | 이 파일 |
 *
 * 특히 `PlanRecord.roles` 는 B2B·IR 플랜까지 `R-01`(B2C 상품 관리)을 들고 있었다 —
 * 팔지 않는 것을 켜 둔 셈이라, 목록에서만 안 보였을 뿐 값은 이미 틀려 있었다.
 */
import type { BadgeTone } from '@winpilot/ui';
import type { PlanDomain } from './plan-features';

export type { PlanDomain };

export type PlanRecord = {
  id: string;
  /**
   * 어느 제품의 플랜인가.
   *
   * 도메인을 나누는 이유: **파는 것이 다르면 등급이 뜻하는 것도 다르다.** B2C 의 회원 상한은
   * 쇼핑몰에 가입한 소비자 수이고, B2B 에서 같은 숫자는 거래처 담당자 수다. 한 목록에
   * 섞으면 '스탠다드' 라는 말이 두 가지를 가리키게 된다.
   */
  domain: PlanDomain;
  /** 화면과 계약서에 그대로 적히는 이름 — 기준 값(`/settings/codes`)의 플랜 목록과 같은 말이다 */
  name: string;
  /** 월 구독료 (원) */
  monthly: number;
  /** 이 플랜으로 쓸 수 있는 배포 수 */
  deployments: number;
  /** 고객사 사이트에 가입할 수 있는 회원 수 상한 */
  memberLimit: number;
  /** 지금 이 플랜을 쓰는 고객사 수 */
  tenants: number;
  /** 새 계약에 팔 수 있는지 — 끈 플랜은 쓰던 고객사만 남는다 */
  sellable: boolean;
  note: string;
};

/**
 * **도메인마다 등급은 셋이다** — 베이직 · 스탠다드 · 엔터프라이즈.
 *
 * 넷째 등급을 만들지 않는 이유: 등급이 늘면 고르는 사람이 견줄 것이 늘어나고, 파는 사람도
 * "이건 어느 등급이죠" 를 매번 다시 정하게 된다. 셋이면 **아래·가운데·위**로 읽혀서 설명이
 * 필요 없다.
 *
 * 그래서 이 화면에는 **플랜 등록이 없다.** 새로 만드는 것이 아니라 있는 셋을 고치는 자리다.
 * 옛 등급(`스타터(종료)`)도 지웠다 — 넷째 등급이 목록에 남아 있으면 그 규칙이 무너진다.
 */
export const PLANS: PlanRecord[] = [
  {
    id: 'P-BASIC',
    domain: 'B2C',
    name: '베이직',
    monthly: 500_000,
    deployments: 1,
    memberLimit: 5_000,
    tenants: 1,
    sellable: true,
    note: '고객 화면 한 벌만 쓰는 고객사.',
  },
  {
    id: 'P-STANDARD',
    domain: 'B2C',
    name: '스탠다드',
    monthly: 800_000,
    deployments: 2,
    memberLimit: 30_000,
    tenants: 1,
    sellable: true,
    note: '고객 화면과 어드민을 함께 쓰는 기본 구성.',
  },
  {
    id: 'P-ENTERPRISE',
    domain: 'B2C',
    name: '엔터프라이즈',
    monthly: 1_200_000,
    deployments: 4,
    memberLimit: 200_000,
    tenants: 1,
    sellable: true,
    note: '약관을 직접 고치고 자료를 내려받는 고객사.',
  },

  /*
    B2B · IR 은 **등급만 세우고 기능은 아직 비었다** (`plan-features.ts`).
    파는 것이 정해지기 전에 요금부터 적으면, 계약 자리에서 없는 기능을 팔게 된다.
    요금은 B2C 를 기준으로 잡은 **초안**이고, 기능을 채우기 전까지 팔지 않는다.
  */
  {
    id: 'P-B2B-BASIC',
    domain: 'B2B',
    name: '베이직',
    monthly: 700_000,
    deployments: 1,
    memberLimit: 300,
    tenants: 0,
    sellable: false,
    note: '거래처 담당자 300명까지.',
  },
  {
    id: 'P-B2B-STANDARD',
    domain: 'B2B',
    name: '스탠다드',
    monthly: 1_100_000,
    deployments: 2,
    memberLimit: 1_000,
    tenants: 0,
    sellable: false,
    note: '견적·여신을 붙일 자리입니다.',
  },
  {
    id: 'P-B2B-ENTERPRISE',
    domain: 'B2B',
    name: '엔터프라이즈',
    monthly: 1_800_000,
    deployments: 4,
    memberLimit: 5_000,
    tenants: 0,
    sellable: false,
    note: '거래처마다 다른 단가와 결제 조건을 둘 자리입니다.',
  },
  {
    id: 'P-IR-BASIC',
    domain: 'IR',
    name: '베이직',
    monthly: 400_000,
    deployments: 1,
    // IR 사이트는 회원 가입이 없다 — 0 은 '가입 기능이 없다' 는 뜻이다.
    memberLimit: 0,
    tenants: 0,
    sellable: false,
    note: '공시·재무 자료를 올리는 사이트입니다.',
  },
  {
    id: 'P-IR-STANDARD',
    domain: 'IR',
    name: '스탠다드',
    monthly: 650_000,
    deployments: 2,
    memberLimit: 0,
    tenants: 0,
    sellable: false,
    note: '주가·재무 지표를 자동으로 받아 올 자리입니다.',
  },
  {
    id: 'P-IR-ENTERPRISE',
    domain: 'IR',
    name: '엔터프라이즈',
    monthly: 1_000_000,
    deployments: 3,
    memberLimit: 0,
    tenants: 0,
    sellable: false,
    note: '국문·영문을 나란히 내는 공시 사이트입니다.',
  },
];

export function findPlan(id: string): PlanRecord | undefined {
  return PLANS.find((plan) => plan.id === id);
}

export const PLAN_STATE_TONE: Record<'판매 중' | '판매 종료', BadgeTone> = {
  '판매 중': 'ok',
  '판매 종료': 'neutral',
};

export function formatWon(value: number): string {
  return value.toLocaleString('ko-KR');
}

export function formatCount(value: number): string {
  return value.toLocaleString('ko-KR');
}

/**
 * 그 고객사가 지금 쓰는 **플랜 레코드**.
 *
 * 고객사는 플랜을 **이름**으로 들고 있고(`tenants.ts` 의 `plan`), 요금은 플랜이 들고 있다.
 * 두 곳을 잇는 자리를 화면마다 만들면 어떤 화면은 이름만 보고 금액을 손으로 적게 되고,
 * 플랜 가격을 올린 달에 그 화면만 옛 금액으로 남는다.
 *
 * B2C 안에서만 찾는다 — 이름(`베이직`·`스탠다드`·`엔터프라이즈`)이 도메인마다 겹치는데,
 * 고객사 레코드의 `plan` 은 B2C 등급을 가리키는 값이다.
 */
export function planOfTenant(planName: string): PlanRecord | undefined {
  return PLANS.find((plan) => plan.domain === 'B2C' && plan.name === planName);
}
