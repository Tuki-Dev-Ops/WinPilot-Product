/**
 * 회원 등급 — **누적 결제금액이 경계를 넘으면 그 등급의 할인율이 걸린다.**
 *
 * ## 왜 store 로 옮겼나
 * 이 표가 어드민 화면 안 배열(`GradeListView` 의 `INITIAL_GRADES`)에만 있었다. 어드민은 그
 * 자리에 **"이 조건에 해당하는 사용자에게 곧바로 적용됩니다"** 라고 적어 두었는데, 고객 화면의
 * 결제 계산에는 등급 항목이 아예 없었다 — 적어 둔 것이 지켜지지 않는 상태였다.
 *
 * 어드민이 고치고 고객 화면이 읽는 값은 이 패키지에 있어야 한다(이 패키지 머리말). 등급은 값이
 * 아니라 **규칙**이지만, 고객이 낼 금액을 바꾸는 규칙이라 더더욱 한 벌이어야 한다.
 *
 * ## 경계 금액이 겹치면 안 된다
 * 겹치면 어느 등급이 걸리는지 정해지지 않는다. 어드민 화면이 저장 전에 막고, 여기 `gradeOf()`
 * 는 **경계가 큰 것부터** 찾아 그 상황에서도 한 답을 낸다.
 *
 * ## 등급은 고르는 것이 아니다
 * 사용자가 자기 등급을 바꿀 수 없다. 누적 결제금액에서 나오는 값이라, 고를 수 있게 두면 그
 * 순간 등급이 뜻을 잃는다.
 */
export type GradeRule = {
  id: string;
  name: string;
  /** 이 금액 이상이면 이 등급. 누적 결제금액 기준 */
  threshold: number;
  /** 결제 금액에서 깎는 비율(%) */
  discountRate: number;
};

export const GRADES: GradeRule[] = [
  { id: 'G-01', name: '신규', threshold: 0, discountRate: 0 },
  { id: 'G-02', name: '일반', threshold: 100_000, discountRate: 3 },
  { id: 'G-03', name: 'VIP', threshold: 1_000_000, discountRate: 7 },
  { id: 'G-04', name: 'VVIP', threshold: 5_000_000, discountRate: 12 },
];

/**
 * 이름으로 등급을 찾는다.
 *
 * 계정이 등급을 **이름으로** 들고 있어서다(`ACCOUNT.grade === 'VIP'`). id 로 들고 있으면 더
 * 안전하지만, 그 값은 화면에도 그대로 보이는 것이라 지금은 이름이 정본이다.
 *
 * 없는 이름이면 `undefined` 를 준다 — 0% 등급을 지어내 돌려주면 **등급표에서 지운 등급이
 * 조용히 0% 로 계속 걸린다.** 부르는 쪽이 그 사실을 알아야 한다.
 */
export function findGrade(name: string): GradeRule | undefined {
  return GRADES.find((one) => one.name === name);
}

/**
 * 누적 결제금액으로 등급을 정한다.
 *
 * 경계가 **큰 것부터** 본다. 작은 것부터 보면 0원 경계(`신규`)가 늘 먼저 걸려 아무도 올라가지
 * 못한다.
 */
export function gradeOf(paidTotal: number): GradeRule {
  const sorted = [...GRADES].sort((a, b) => b.threshold - a.threshold);
  return sorted.find((one) => paidTotal >= one.threshold) ?? sorted[sorted.length - 1]!;
}
