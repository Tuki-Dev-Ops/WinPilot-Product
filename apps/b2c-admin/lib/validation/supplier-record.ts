/**
 * 공급자 정보 검증.
 *
 * 여기 값들은 대부분 **전자상거래법상 표시 의무 항목**이다. 비워 두면 고객 화면 하단에
 * 빈 자리가 남는 것이 아니라 법적으로 문제가 되므로, 선택 항목을 최소로 둔다.
 */
export const SUPPLIER_MESSAGES = {
  companyRequired: '회사명(상호)을 입력해 주세요.',
  ceoRequired: '대표자명을 입력해 주세요.',
  businessNumberRequired: '사업자등록번호를 입력해 주세요.',
  businessNumberFormat: '사업자등록번호는 000-00-00000 형식으로 입력해 주세요.',
  mailOrderFormat: '통신판매업 신고번호 형식이 올바르지 않습니다. (예: 제2026-서울성동-0000호)',
  sectionRequired: '업태를 선택해 주세요.',
  industryRequired: '업종을 입력해 주세요.',
  postalCodeFormat: '우편번호는 숫자 5자리입니다.',
  addressRequired: '주소를 입력해 주세요.',
  phoneRequired: '대표 전화를 입력해 주세요.',
  phoneFormat: '숫자와 하이픈만 입력해 주세요.',
  emailRequired: '이메일을 입력해 주세요.',
  emailFormat: '이메일 형식이 올바르지 않습니다.',
  privacyOfficerRequired: '개인정보보호책임자를 입력해 주세요.',
} as const;

export type SupplierFormInput = {
  companyName: string;
  ceo: string;
  businessNumber: string;
  mailOrderNumber: string;
  /** 업태 — KSIC 대분류 이름 */
  section: string;
  /** 업종 — 사업자등록증에 적힌 문구 그대로 */
  industry: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  phone: string;
  fax: string;
  email: string;
  privacyOfficer: string;
  hostingProvider: string;
};

export type SupplierFormErrors = Partial<Record<keyof SupplierFormInput, string>>;

const PHONE_SHAPE = /^[\d-]+$/;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSupplier(input: SupplierFormInput): SupplierFormErrors {
  const errors: SupplierFormErrors = {};

  if (!input.companyName.trim()) errors.companyName = SUPPLIER_MESSAGES.companyRequired;
  if (!input.ceo.trim()) errors.ceo = SUPPLIER_MESSAGES.ceoRequired;

  if (!input.businessNumber.trim()) errors.businessNumber = SUPPLIER_MESSAGES.businessNumberRequired;
  else if (!/^\d{3}-\d{2}-\d{5}$/.test(input.businessNumber.trim())) {
    errors.businessNumber = SUPPLIER_MESSAGES.businessNumberFormat;
  }

  /*
    통신판매업 신고번호는 지자체마다 표기가 조금씩 다르다(제2026-서울성동-0000호).
    형식을 좁게 잡으면 실제 신고증과 다른 값을 넣게 되므로, 적었을 때만 느슨하게 본다.
  */
  if (input.mailOrderNumber.trim() && !/^제?\s?\d{4}-[가-힣A-Za-z0-9]+-\d+\s?호?$/.test(input.mailOrderNumber.trim())) {
    errors.mailOrderNumber = SUPPLIER_MESSAGES.mailOrderFormat;
  }

  if (!input.section.trim()) errors.section = SUPPLIER_MESSAGES.sectionRequired;
  if (!input.industry.trim()) errors.industry = SUPPLIER_MESSAGES.industryRequired;

  if (input.postalCode.trim() && !/^\d{5}$/.test(input.postalCode.trim())) {
    errors.postalCode = SUPPLIER_MESSAGES.postalCodeFormat;
  }
  if (!input.address.trim()) errors.address = SUPPLIER_MESSAGES.addressRequired;

  if (!input.phone.trim()) errors.phone = SUPPLIER_MESSAGES.phoneRequired;
  else if (!PHONE_SHAPE.test(input.phone.trim())) errors.phone = SUPPLIER_MESSAGES.phoneFormat;

  // 팩스는 선택이다 — 팩스가 없는 회사가 더 많다.
  if (input.fax.trim() && !PHONE_SHAPE.test(input.fax.trim())) errors.fax = SUPPLIER_MESSAGES.phoneFormat;

  if (!input.email.trim()) errors.email = SUPPLIER_MESSAGES.emailRequired;
  else if (!EMAIL_SHAPE.test(input.email.trim())) errors.email = SUPPLIER_MESSAGES.emailFormat;

  if (!input.privacyOfficer.trim()) errors.privacyOfficer = SUPPLIER_MESSAGES.privacyOfficerRequired;

  return errors;
}

/** 고객 화면 하단에 한 줄로 나가는 표기 — 무엇이 실제로 노출되는지 폼에서 보여준다. */
export function footerLine(input: SupplierFormInput): string {
  return [
    input.companyName.trim(),
    input.ceo.trim() && `대표 ${input.ceo.trim()}`,
    input.businessNumber.trim() && `사업자등록번호 ${input.businessNumber.trim()}`,
    input.mailOrderNumber.trim() && `통신판매업신고 ${input.mailOrderNumber.trim()}`,
    [input.postalCode.trim() && `(${input.postalCode.trim()})`, input.address.trim(), input.addressDetail.trim()]
      .filter(Boolean)
      .join(' '),
    input.phone.trim() && `전화 ${input.phone.trim()}`,
    input.fax.trim() && `팩스 ${input.fax.trim()}`,
    input.email.trim(),
    input.privacyOfficer.trim() && `개인정보보호책임자 ${input.privacyOfficer.trim()}`,
  ]
    .filter(Boolean)
    .join(' · ');
}
