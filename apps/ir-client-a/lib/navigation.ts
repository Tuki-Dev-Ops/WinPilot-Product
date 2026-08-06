/**
 * 회사 홈페이지의 길.
 *
 * ## 네 갈래로 나눈 기준은 **찾아오는 사람**이다
 * 회사를 알고 싶은 사람(ABOUT) · 무엇을 파는지 보러 온 사람(SOLUTION) · 쓰는 제품을 찾는
 * 사람(PRODUCT) · 막혀서 온 사람(CS CENTER). 자원으로 나누면 `공지`·`자료실` 처럼 회사가
 * 부르는 이름이 메뉴가 되고, 그러면 **밖에서 온 사람은 자기 물음을 어느 갈래에서 찾아야
 * 하는지 모른다.**
 *
 * ## IR 은 메뉴에 없다
 * 이 사이트가 IR 을 위해 서 있는 것은 맞지만, 처음 온 사람의 물음 넷 중 어디에도 들지 않는다 —
 * 공시를 보러 오는 사람은 **이미 이 회사를 알고** 주소를 치거나 검색으로 들어온다. 그래서 IR 은
 * 푸터에 묶어 두고, 헤더는 처음 온 사람의 길만 남긴다.
 *
 * ## 아직 없는 화면
 * `ready: false` 인 것은 링크를 걸지 않는다. 준비 중인 자리를 눌러 404 로 보내면, 그 뒤로는
 * 다른 메뉴도 눌러 보지 않는다.
 */
export type SiteNavChild = {
  href: string;
  label: string;
  /** 이름만으로 무엇인지 모를 때 붙이는 한 줄. 이름이 이미 다 말하면 두지 않는다 */
  desc?: string;
  /** 화면이 있는가. 없으면 링크를 걸지 않고 `준비중` 으로 적는다 */
  ready?: boolean;
};

/**
 * 펼침 안의 한 칸.
 *
 * 항목을 묶음으로 나누는 이유: SOLUTION 아래에 여섯이 한 줄로 서면 **컨설팅과 Cloud MES 가
 * 같은 종류로** 보인다. 하나는 사람이 하는 일이고 하나는 파는 물건이다. 묶어 두면 그 차이가
 * 제목 한 줄로 드러난다.
 */
export type SiteNavGroup = {
  title: string;
  children: SiteNavChild[];
};

export type SiteNavItem = {
  /** 갈래 이름. 영문 대문자로 두는 것은 국문 하위 항목과 층이 갈려 보이게 하려는 것이다 */
  label: string;
  /** 갈래를 눌렀을 때 가는 곳 — 첫 하위 화면이다 */
  href: string;
  groups: SiteNavGroup[];
};

export const SITE_NAV: readonly SiteNavItem[] = [
  {
    label: 'ABOUT',
    href: '/about',
    groups: [
      {
        title: '회사',
        children: [
          { href: '/about', label: '회사 소개', desc: '무엇을 하는 회사인가', ready: true },
          { href: '/about/history', label: '연혁', desc: '지나온 자리', ready: true },
          { href: '/about/certifications', label: '특허 및 인증', desc: '가지고 있는 것', ready: true },
        ],
      },
    ],
  },
  {
    label: 'SOLUTION',
    href: '/solutions/erp',
    groups: [
      {
        title: '서비스',
        children: [
          {
            href: '/support/contact',
            label: '스마트 컨설팅',
            desc: '현장 진단부터 도입 순서까지',
            ready: true,
          },
          /*
            인프라와 DXP 는 아직 자기 화면이 없어 제품 소개로 보낸다. `준비중` 으로 두지 않는
            이유: 파는 것을 준비 중이라고 적으면 팔지 않는 것으로 읽힌다.
          */
          { href: '/products', label: '인프라 서비스', desc: '서버·네트워크·백업 운영 대행', ready: true },
        ],
      },
      {
        title: '클라우드 솔루션',
        children: [
          { href: '/solutions/mes', label: 'Cloud MES', desc: '설비 데이터 표준화·실시간 추적', ready: true },
          { href: '/solutions/erp', label: 'Cloud ERP', desc: '수주에서 정산까지 하나의 흐름', ready: true },
          { href: '/solutions/crm', label: 'Cloud CRM', desc: '문의부터 유지보수까지 한 줄 기록', ready: true },
          { href: '/products', label: 'Cloud DXP', desc: '코드 없이 화면을 만드는 로우코드 빌더', ready: true },
        ],
      },
    ],
  },
  {
    label: 'PRODUCT',
    href: '/products',
    groups: [
      {
        title: '제품',
        children: [{ href: '/products', label: '제품명', desc: '규격과 도입 사례', ready: true }],
      },
    ],
  },
  {
    label: 'CS CENTER',
    href: '/support/contact',
    groups: [
      {
        title: '고객지원',
        children: [
          { href: '/support/contact', label: '문의하기', desc: '도입·견적 상담', ready: true },
          { href: '/support/faq', label: 'FAQ', desc: '자주 묻는 것', ready: true },
          { href: '/support/directions', label: '오시는 길', desc: '찾아오는 방법', ready: true },
        ],
      },
    ],
  },
];

/**
 * 푸터 맨 왼쪽의 법적 고지.
 *
 * 사이트 메뉴(`SITE_NAV`)와 나눠 두는 이유: 이 둘은 **파는 것을 소개하는 길이 아니다.**
 * 같은 목록에 섞으면 ABOUT·SOLUTION 옆에 `개인정보 처리방침` 이 서게 되고, 그러면 둘 다
 * 눈에 덜 든다.
 */
export const LEGAL_NAV: readonly { href: string; label: string }[] = [
  { href: '/terms', label: '서비스 이용약관' },
  { href: '/privacy', label: '개인정보 처리방침' },
];

/**
 * 푸터의 IR 묶음.
 *
 * 헤더에서 뺀 대신 여기 전부 늘어놓는다 — 접어 두면 공시를 보러 온 사람이 검색으로만
 * 들어오게 되고, 그때는 사이트 안의 다른 자료를 지나친다.
 */
export const IR_NAV: readonly { href: string; label: string }[] = [
  { href: '/disclosures', label: '공시 정보' },
  { href: '/financials', label: '재무 정보' },
  { href: '/stock', label: '주가 정보' },
  { href: '/dividends', label: '배당 정보' },
  { href: '/meetings', label: '주주총회' },
  { href: '/governance', label: '지배구조' },
  { href: '/library', label: 'IR 자료실' },
  { href: '/schedules', label: 'IR 일정' },
  { href: '/subscribe', label: '공시 구독' },
];

export const IR_ROUTES = {
  home: '/',
  about: '/about',
  history: '/about/history',
  certifications: '/about/certifications',
  erp: '/solutions/erp',
  mes: '/solutions/mes',
  crm: '/solutions/crm',
  products: '/products',
  contact: '/support/contact',
  faq: '/support/faq',
  directions: '/support/directions',
  disclosures: '/disclosures',
  financials: '/financials',
  stock: '/stock',
  dividends: '/dividends',
  meetings: '/meetings',
  voting: '/meetings/voting',
  governance: '/governance',
  library: '/library',
  schedules: '/schedules',
  subscribe: '/subscribe',
} as const;
