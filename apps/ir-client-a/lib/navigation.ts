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
  /** 화면이 있는가. 없으면 링크를 걸지 않고 `준비중` 으로 적는다 */
  ready?: boolean;
};

/**
 * 펼침 안의 한 칸.
 *
 * 항목을 묶음으로 나누는 이유: 한 갈래 아래에 여섯이 한 줄로 서면 **성격이 다른 것이 같은
 * 종류로** 보인다. 묶어 두면 그 차이가 제목 한 줄로 드러난다.
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

/**
 * 갈래 넷과 그 아래 항목.
 *
 * ## 항목에 설명을 달지 않는다
 * 한때 항목마다 한 줄 설명을 붙여 두었다(`Cloud MES — 설비 데이터 표준화·실시간 추적`).
 * 그러면 펼침이 **읽는 화면**이 되어, 고르러 온 사람이 여섯 문장을 지나야 자기 자리를 찾는다.
 * 메뉴에서 필요한 것은 이름뿐이고, 설명은 눌러서 들어간 화면이 한다.
 *
 * ## 파는 것은 PRODUCT 에 있다
 * Cloud MES·ERP·CRM·DXP 는 **제품**이다. 한때 SOLUTION 아래에 두었는데, 그러면 PRODUCT 갈래가
 * 비고 SOLUTION 이 둘로 갈린다(사람이 하는 일 + 파는 물건). 지금은 갈라 두었다 —
 * SOLUTION 은 사람이 붙어서 하는 일, PRODUCT 는 계약하면 그날부터 쓰는 것.
 */
export const SITE_NAV: readonly SiteNavItem[] = [
  {
    label: 'ABOUT',
    href: '/about',
    groups: [
      {
        title: '회사',
        children: [
          { href: '/about', label: '회사 소개', ready: true },
          { href: '/about/history', label: '연혁', ready: true },
          { href: '/about/certifications', label: '특허 및 인증', ready: true },
        ],
      },
    ],
  },
  {
    label: 'SOLUTION',
    href: '/support/contact',
    groups: [
      {
        title: '서비스',
        children: [
          { href: '/support/contact', label: '스마트 컨설팅', ready: true },
          /* 인프라는 아직 자기 화면이 없어 제품 소개로 보낸다. */
          { href: '/products', label: '인프라 서비스', ready: true },
        ],
      },
    ],
  },
  {
    label: 'PRODUCT',
    href: '/products',
    groups: [
      {
        title: '클라우드 제품',
        children: [
          { href: '/solutions/mes', label: 'Cloud MES', ready: true },
          { href: '/solutions/erp', label: 'Cloud ERP', ready: true },
          { href: '/solutions/crm', label: 'Cloud CRM', ready: true },
          /* `/solutions/dxp` 는 아직 없다. 없는 길로 보내면 눌러 본 사람이 404 를 만난다. */
          { href: '/products', label: 'Cloud DXP', ready: true },
        ],
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
          { href: '/support/contact', label: '문의하기', ready: true },
          { href: '/support/faq', label: 'FAQ', ready: true },
          { href: '/support/directions', label: '오시는 길', ready: true },
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
