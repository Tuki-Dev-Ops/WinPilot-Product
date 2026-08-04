/**
 * 약관 시드 데이터 — **프론트엔드 전용**.
 *
 * 약관은 고치는 것이 아니라 **개정하는 것**이다. 바꾼 내용을 덮어쓰면 이전에 동의한 고객이
 * 무엇에 동의했는지 증명할 수 없다. 그래서 본문과 함께 **버전 · 시행일 · 개정 이력**을 갖는다.
 */
export type PolicyKind = 'terms' | 'privacy';

export type PolicyRevision = {
  version: string;
  /** 시행일 `YYYY-MM-DD` */
  effectiveAt: string;
  /** 무엇이 바뀌었는지 한 줄 */
  summary: string;
};

export type PolicyRecord = {
  kind: PolicyKind;
  label: string;
  version: string;
  effectiveAt: string;
  /** HTML — RichTextEditor 가 만든다 */
  body: string;
  /** 개정 이력 — 최신이 위 */
  revisions: PolicyRevision[];
};

export const TERMS: PolicyRecord = {
  kind: 'terms',
  label: '서비스 이용약관',
  version: '1.2',
  effectiveAt: '2026-08-15',
  body: [
    '<h3>제1조 (목적)</h3>',
    '<p>이 약관은 회사가 제공하는 서비스의 이용 조건과 절차, 회사와 이용자의 권리·의무를 정합니다.</p>',
    '<h3>제2조 (정의)</h3>',
    '<ul><li>“이용자”란 이 약관에 따라 서비스를 이용하는 회원을 말합니다.</li><li>“상품”이란 회사가 판매하는 재화를 말합니다.</li></ul>',
    '<h3>제3조 (약관의 효력과 변경)</h3>',
    '<p>회사는 약관을 변경할 수 있으며, 변경 시 시행일 7일 전부터 공지합니다. 이용자에게 불리한 변경은 30일 전에 공지합니다.</p>',
  ].join(''),
  revisions: [
    { version: '1.2', effectiveAt: '2026-08-15', summary: '환불 조항 문구 정리' },
    { version: '1.1', effectiveAt: '2025-11-01', summary: '전자상거래법 개정 반영' },
    { version: '1.0', effectiveAt: '2024-03-02', summary: '최초 제정' },
  ],
};

export const PRIVACY: PolicyRecord = {
  kind: 'privacy',
  label: '개인정보 처리방침',
  version: '2.0',
  effectiveAt: '2026-08-15',
  body: [
    '<h3>1. 수집하는 개인정보 항목</h3>',
    '<p>회원가입 시 이름, 이메일, 연락처를 수집합니다. 주문 시 배송지와 결제 정보를 추가로 수집합니다.</p>',
    '<h3>2. 개인정보의 보유 및 이용기간</h3>',
    '<p>회원 탈퇴 시 지체 없이 파기합니다. 다만 관계 법령에 따라 보존이 필요한 정보는 해당 기간 동안 보관합니다.</p>',
    '<h3>3. 개인정보보호책임자</h3>',
    '<p>개인정보 관련 문의는 공급자 정보에 기재된 개인정보보호책임자에게 하실 수 있습니다.</p>',
  ].join(''),
  revisions: [
    { version: '2.0', effectiveAt: '2026-08-15', summary: '위탁 업체 변경 반영' },
    { version: '1.0', effectiveAt: '2024-03-02', summary: '최초 제정' },
  ],
};

export function policyFor(kind: PolicyKind): PolicyRecord {
  return kind === 'terms' ? TERMS : PRIVACY;
}

/**
 * 시행일까지 남은 날.
 * 아직 오지 않았으면 양수, 이미 시행 중이면 0 이하다 — 화면에서 '예정' 과 '시행 중' 을 가른다.
 */
export function daysUntil(effectiveAt: string, today: string): number {
  const target = Date.parse(`${effectiveAt}T00:00:00Z`);
  const base = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(target) || Number.isNaN(base)) return 0;
  return Math.round((target - base) / 86_400_000);
}
