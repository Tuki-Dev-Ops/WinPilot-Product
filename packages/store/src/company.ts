/**
 * 회사 정보 시드 — **프론트엔드 전용**.
 *
 * 소개(`profile`)는 목록이 아니라 **단일 자원**이다. 회사는 하나뿐이라 등록·삭제가 없고
 * 편집만 있다. 연혁(`milestone`)은 여러 건이라 목록으로 다룬다.
 */
export type CompanyProfile = {
  name: string;
  ceo: string;
  foundedAt: string;
  businessNumber: string;
  address: string;
  phone: string;
  email: string;
  /** HTML — RichTextEditor 가 만든다 */
  intro: string;
  /**
   * 소개 위에 놓이는 대표 이미지.
   *
   * 비어 있으면 고객 화면이 **벡터 키비주얼**을 그린다 — 빈 자리를 두거나 남의 사진을 끌어다
   * 쓰지 않기 위해서다. 운영자가 올리면 그 사진이 이긴다.
   */
  heroImageUrl: string;
};

export type MilestoneRecord = {
  id: string;
  /** 표기 연도 — 정렬 기준 */
  year: string;
  /** 월 (선택) */
  month: string;
  title: string;
  description: string;
  visible: boolean;
};

export const COMPANY_PROFILE: CompanyProfile = {
  name: '윈파일럿',
  ceo: '홍승범',
  foundedAt: '2019-04-01',
  businessNumber: '000-00-00000',
  address: '서울특별시 성동구 왕십리로 000, 000호',
  phone: '02-0000-0000',
  email: 'hello@example.com',
  heroImageUrl: '',
  intro:
    '<h3>무엇을 하는 회사인가</h3><p>자원 중심으로 화면을 설계하고, 디자인과 코드가 어긋나지 않는 운영 도구를 만듭니다.</p><h3>일하는 방식</h3><p>실행 중인 화면을 원본으로 삼아 디자인을 맞춥니다.</p>',
};

export const MILESTONES: MilestoneRecord[] = [
  {
    id: 'M-012',
    year: '2026',
    month: '07',
    title: '어드민 콘솔 정식 공개',
    description: '자원 단위로 화면을 나눈 운영 콘솔을 공개했습니다.',
    visible: true,
  },
  {
    id: 'M-011',
    year: '2025',
    month: '11',
    title: '디자인 시스템 v2 적용',
    description: '토큰을 한 곳으로 모아 모든 화면에 같은 값을 씁니다.',
    visible: true,
  },
  {
    id: 'M-010',
    year: '2024',
    month: '03',
    title: '시리즈 A 투자 유치',
    description: '',
    visible: true,
  },
  {
    id: 'M-009',
    year: '2019',
    month: '04',
    title: '법인 설립',
    description: '',
    visible: false,
  },
];

/** 연도 내림차순, 같은 해면 월 내림차순 — 연혁은 최근 것이 위에 온다. */
export function sortMilestones(items: readonly MilestoneRecord[]): MilestoneRecord[] {
  return [...items].sort((a, b) => `${b.year}${b.month}`.localeCompare(`${a.year}${a.month}`));
}

export function milestoneDate(item: { year: string; month: string }): string {
  return item.month ? `${item.year}.${item.month}` : item.year;
}

export function nextMilestoneId(items: readonly MilestoneRecord[]): string {
  const max = items.reduce((biggest, item) => Math.max(biggest, Number(item.id.replace('M-', '')) || 0), 0);
  return `M-${`${max + 1}`.padStart(3, '0')}`;
}
