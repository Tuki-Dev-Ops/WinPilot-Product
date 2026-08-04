/**
 * 업태 · 업종 분류.
 *
 * **왜 데이터를 직접 들고 있나**
 *
 * 한국 기준으로 쓸 수 있는 분류는 통계청 **한국표준산업분류(KSIC)** 와 국세청 **업종코드** 둘인데,
 * npm 에 이 둘을 담은 패키지가 없다. 검색되는 `sic-codes` · `sic-code-list` · `naics` 계열은
 * 전부 미국(NAICS) · 영국(UK SIC) 분류라 국내 사업자등록증의 업태·업종과 맞지 않는다.
 * 두 기관 모두 공공데이터포털 OpenAPI 나 파일로 배포하는데, 이 프로젝트는 **프론트엔드 전용**이라
 * 외부 API 를 붙이지 않는다.
 *
 * 그래서 **대분류(21개)만 내장**하고, 그 아래 업종은 자유 입력으로 받되 자주 쓰는 값을 제안한다.
 * 사업자등록증에 적힌 문구가 기관마다 조금씩 다르기 때문에, 목록으로 강제하면 실제 등록증과
 * 다른 값을 넣게 되는 쪽이 더 나쁘다.
 *
 * 출처: 통계청 한국표준산업분류(KSIC) 대분류 A~U.
 * 중분류까지 필요해지면 통계청 배포 파일을 이 파일에 함께 넣는다 — 런타임에 받아오지 않는다.
 */
export type IndustrySection = {
  /** KSIC 대분류 코드 (A ~ U) */
  code: string;
  /** 업태로 적는 이름 */
  name: string;
  /** 이 대분류에서 자주 쓰는 업종 — 제안일 뿐 강제하지 않는다 */
  suggestions: string[];
};

export const INDUSTRY_SECTIONS: IndustrySection[] = [
  { code: 'A', name: '농업, 임업 및 어업', suggestions: [] },
  { code: 'B', name: '광업', suggestions: [] },
  {
    code: 'C',
    name: '제조업',
    suggestions: ['식료품 제조업', '의복 제조업', '가구 제조업', '화장품 제조업'],
  },
  { code: 'D', name: '전기, 가스, 증기 및 공기 조절 공급업', suggestions: [] },
  { code: 'E', name: '수도, 하수 및 폐기물 처리, 원료 재생업', suggestions: [] },
  { code: 'F', name: '건설업', suggestions: ['실내건축 공사업'] },
  {
    code: 'G',
    name: '도매 및 소매업',
    suggestions: ['전자상거래 소매업', '통신판매업', '전자상거래 소매 중개업', '상품 종합 도매업'],
  },
  { code: 'H', name: '운수 및 창고업', suggestions: ['화물 운송 중개업'] },
  { code: 'I', name: '숙박 및 음식점업', suggestions: [] },
  {
    code: 'J',
    name: '정보통신업',
    suggestions: [
      '소프트웨어 개발 및 공급업',
      '컴퓨터 프로그래밍, 시스템 통합 및 관리업',
      '포털 및 기타 인터넷 정보매개 서비스업',
      '응용 소프트웨어 개발 및 공급업',
    ],
  },
  { code: 'K', name: '금융 및 보험업', suggestions: [] },
  { code: 'L', name: '부동산업', suggestions: [] },
  {
    code: 'M',
    name: '전문, 과학 및 기술 서비스업',
    suggestions: ['광고 대행업', '전문 디자인업', '경영 컨설팅업', '시장조사 및 여론조사업'],
  },
  {
    code: 'N',
    name: '사업시설 관리, 사업 지원 및 임대 서비스업',
    suggestions: ['그 외 기타 사업지원 서비스업'],
  },
  { code: 'O', name: '공공행정, 국방 및 사회보장 행정', suggestions: [] },
  { code: 'P', name: '교육 서비스업', suggestions: ['기타 교육지원 서비스업'] },
  { code: 'Q', name: '보건업 및 사회복지 서비스업', suggestions: [] },
  { code: 'R', name: '예술, 스포츠 및 여가관련 서비스업', suggestions: [] },
  {
    code: 'S',
    name: '협회 및 단체, 수리 및 기타 개인 서비스업',
    suggestions: ['기타 개인 서비스업'],
  },
  { code: 'T', name: '가구 내 고용활동 및 달리 분류되지 않은 자가 소비 생산활동', suggestions: [] },
  { code: 'U', name: '국제 및 외국기관', suggestions: [] },
];

export function findSection(name: string): IndustrySection | undefined {
  return INDUSTRY_SECTIONS.find((section) => section.name === name);
}

/** 고른 업태에서 제안할 업종. 대분류를 고르지 않았으면 제안하지 않는다. */
export function suggestionsFor(sectionName: string): string[] {
  return findSection(sectionName)?.suggestions ?? [];
}
