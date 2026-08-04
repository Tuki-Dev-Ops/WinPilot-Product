/**
 * 회사 소개·연혁 검증.
 * 제목·HTML 규칙은 콘텐츠와 같은 것을 쓴다 (`content-record.ts`).
 */
import { CONTENT_MESSAGES, htmlIsEmpty, isDateString } from './content-record';

export const COMPANY_MESSAGES = {
  nameRequired: '회사명을 입력해 주세요.',
  ceoRequired: '대표자명을 입력해 주세요.',
  addressRequired: '주소를 입력해 주세요.',
  emailFormat: '이메일 형식이 올바르지 않습니다.',
  phoneFormat: '숫자와 하이픈만 입력해 주세요.',
  businessNumberFormat: '사업자등록번호는 000-00-00000 형식으로 입력해 주세요.',
  introRequired: '회사 소개 내용을 입력해 주세요.',
  yearFormat: '연도는 4자리 숫자로 입력해 주세요.',
  monthFormat: '월은 01 ~ 12 로 입력해 주세요.',
  titleRequired: '내용을 입력해 주세요.',
} as const;

export type CompanyProfileInput = {
  name: string;
  ceo: string;
  foundedAt: string;
  businessNumber: string;
  address: string;
  phone: string;
  email: string;
  intro: string;
};

export type CompanyProfileErrors = Partial<Record<keyof CompanyProfileInput, string>>;

export function validateCompanyProfile(input: CompanyProfileInput): CompanyProfileErrors {
  const errors: CompanyProfileErrors = {};

  if (!input.name.trim()) errors.name = COMPANY_MESSAGES.nameRequired;
  if (!input.ceo.trim()) errors.ceo = COMPANY_MESSAGES.ceoRequired;
  if (!input.address.trim()) errors.address = COMPANY_MESSAGES.addressRequired;

  if (input.foundedAt.trim() && !isDateString(input.foundedAt)) {
    errors.foundedAt = CONTENT_MESSAGES.dateFormat;
  }

  // 사업자번호는 나라마다 형식이 다르지만, 국내 표기 하나로 고정해 두어야 목록에서 눈에 익는다.
  if (input.businessNumber.trim() && !/^\d{3}-\d{2}-\d{5}$/.test(input.businessNumber.trim())) {
    errors.businessNumber = COMPANY_MESSAGES.businessNumberFormat;
  }

  if (input.phone.trim() && !/^[\d-]+$/.test(input.phone.trim())) {
    errors.phone = COMPANY_MESSAGES.phoneFormat;
  }

  if (input.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = COMPANY_MESSAGES.emailFormat;
  }

  if (htmlIsEmpty(input.intro)) errors.intro = COMPANY_MESSAGES.introRequired;

  return errors;
}

export type MilestoneFormInput = {
  year: string;
  month: string;
  title: string;
  description: string;
  visible: boolean;
};

export type MilestoneFormErrors = Partial<Record<'year' | 'month' | 'title', string>>;

export function validateMilestone(input: MilestoneFormInput): MilestoneFormErrors {
  const errors: MilestoneFormErrors = {};

  if (!/^\d{4}$/.test(input.year.trim())) errors.year = COMPANY_MESSAGES.yearFormat;

  // 월은 비워 둘 수 있다 — '2019년' 처럼 연도만 적는 연혁이 흔하다.
  if (input.month.trim() && !/^(0[1-9]|1[0-2])$/.test(input.month.trim())) {
    errors.month = COMPANY_MESSAGES.monthFormat;
  }

  if (!input.title.trim()) errors.title = COMPANY_MESSAGES.titleRequired;

  return errors;
}
