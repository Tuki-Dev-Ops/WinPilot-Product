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
  /**
   * 갈래를 눌렀을 때 가는 곳.
   *
   * **첫 하위 화면이 아니라 갈래 전체를 훑는 화면**이면 그쪽을 쓴다. SOLUTION 이 그렇다 —
   * 여섯 중 첫째(스마트 컨설팅)로 보내면 나머지 다섯을 못 본 사람이 그 하나를 우리가 미는
   * 것으로 읽는다. 그런 화면이 없는 갈래는 첫 하위 화면으로 간다.
   */
  href: string;
  groups: SiteNavGroup[];
  /**
   * 헤더에서 **감춘다.** 화면과 주소는 그대로 남는다.
   *
   * ## 왜 목록에서 지우지 않나
   * 지우면 **왜 없는지가 코드에서 사라진다.** 다음 사람이 `PRODUCT 갈래가 왜 없지` 하고
   * 물으면 답할 것이 git 이력밖에 없고, 그러다 같은 갈래를 새로 만들어 붙인다.
   *
   * 화면도 지우지 않는다. `/products` 와 제품 상세 넷은 그대로 열린다 — 홈의 제품 칸과 푸터가
   * 그 주소로 가고 있고, 감춘 것은 **헤더의 갈래 하나**일 뿐이다.
   */
  hidden?: boolean;
};

/**
 * 갈래 넷과 그 아래 항목.
 *
 * ## 지금 헤더에 서는 것은 셋이다 — ABOUT · SOLUTION · CS CENTER
 * `hidden` 을 쓰는 갈래는 지금 없다. 그 필드는 남겨 둔다 — `PRODUCT` 를 그렇게 감춰 본 적이
 * 있고, 갈래를 늘리지 않으면서 화면은 살려 두는 방법이 그것뿐이다.
 *
 * ## 항목에 설명을 달지 않는다
 * 한때 항목마다 한 줄 설명을 붙여 두었다(`Cloud MES — 설비 데이터 표준화·실시간 추적`).
 * 그러면 펼침이 **읽는 화면**이 되어, 고르러 온 사람이 여섯 문장을 지나야 자기 자리를 찾는다.
 * 메뉴에서 필요한 것은 이름뿐이고, 설명은 눌러서 들어간 화면이 한다.
 *
 * ## 파는 것 여섯이 SOLUTION 한 갈래에 있다
 * Cloud ERP·MES·CRM·DXP 는 **제품**이고 스마트 컨설팅·인프라 서비스는 **사람이 하는 일**이다.
 * 셋을 오갔다.
 *
 * 1. 처음에는 SOLUTION 아래 여섯을 한 줄로 두었다 — 켜고 끌 수 있는 줄과 없는 줄이 한 목록에
 *    섰다.
 * 2. `PRODUCT` 갈래를 따로 세워 넷을 옮겼다 — 헤더 맨 위가 넷이 되어 무거웠고, 그래서
 *    `hidden` 으로 감췄다. 그러자 **파는 것의 절반으로 가는 길이 홈과 푸터에만** 남았다.
 * 3. 지금은 SOLUTION 안에서 **세 갈래로 나눈다** — 서비스 · 유지보수 · 솔루션.
 *
 * 헤더 맨 위는 셋 그대로이고, 펼침 안에서만 성격이 갈린다. 갈래를 늘리는 값과 길을 잃는 값을
 * 함께 치르지 않는 자리가 여기였다.
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
    /*
      갈래 이름을 누르면 **여섯이 다 보이는 화면**으로 간다.

      전에는 첫 하위 화면인 `/solutions/consulting` 이었다. 그러면 마우스를 올리지 않고 바로
      누른 사람에게 컨설팅 상세가 펼쳐지고, 나머지 다섯은 다시 헤더로 올라가야 보인다.

      그 화면(`/products`)은 한동안 **어느 메뉴에서도 닿지 않았다.** PRODUCT 갈래를 감추면서
      길이 홈과 404 화면에만 남았는데, 화면을 지우지도 못하고 길도 없는 상태가 가장 나쁘다 —
      고치는 사람이 그 화면이 살아 있는 줄 모른다. 여기가 그 화면의 제자리다.
    */
    href: '/products',
    /*
      세 갈래로 나눈다. 앞의 둘은 **사람이 현장에 가서 하는 일**이고 셋째는 계약하면 그날부터
      쓰는 것이다 — 하는 일이 다르면 갈래도 달라야 고를 때 헤매지 않는다.

      `서비스` 와 `유지보수` 를 한 갈래에 묶어 두었더니 둘 다 `서비스` 라는 이름 아래 서서,
      **한 번 붙이고 끝나는 일과 계속 도와주는 일**이 같은 것으로 읽혔다. 값은 그대로이고
      나누는 자리만 바뀐다.

      ## 클라우드 넷이 여기로 왔다
      전에는 `PRODUCT` 라는 따로 선 갈래였고, 그것을 헤더에서 감춰 두었다(`hidden`). 감추면
      화면 넷으로 가는 길이 홈과 푸터에만 남는데, **그 넷이 이 회사가 파는 것의 절반**이다.

      갈래를 되살리는 대신 SOLUTION 안으로 들였다. 헤더 맨 위에 서는 갈래를 늘리지 않으면서
      길은 되찾는다 — `hidden` 을 두었던 까닭이 그 갈래 수였다.

      주소(`/solutions/*`)는 그대로다. 넷 다 원래 그 아래에 있었다.
    */
    groups: [
      {
        title: '서비스',
        children: [{ href: '/solutions/consulting', label: '스마트 컨설팅', ready: true }],
      },
      {
        title: '유지보수',
        children: [{ href: '/solutions/infra', label: '인프라 서비스', ready: true }],
      },
      {
        /*
          차례가 ERP · MES · CRM · DXP 다. 수주에서 정산까지가 ERP 이고 그 안의 생산이 MES,
          그 앞이 CRM, 화면을 만드는 것이 DXP 다 — 파는 쪽이 이야기하는 차례를 따른다.

          이름은 `Cloud ERP` 로 적는다. 화면 제목 · 홈 카드 · 푸터가 전부 이 표기라, 메뉴에서만
          대문자로 두면 같은 제품이 두 이름을 갖는다.
        */
        title: '솔루션',
        children: [
          { href: '/solutions/erp', label: 'Cloud ERP', ready: true },
          { href: '/solutions/mes', label: 'Cloud MES', ready: true },
          { href: '/solutions/crm', label: 'Cloud CRM', ready: true },
          { href: '/solutions/dxp', label: 'Cloud DXP', ready: true },
        ],
      },
    ],
  },
  {
    label: 'CS CENTER',
    href: '/support/faq',
    /*
      두 갈래로 나눈다. 다섯이 한 줄로 서 있을 때는 **묻는 사람과 읽는 사람이 섞여 있었다** —
      문의하기·오시는 길은 우리에게 닿으려는 길이고, 공지사항·뉴스는 우리가 내보낸 것을
      읽는 길이다. 하는 일이 다르면 갈래도 달라야 고를 때 헤매지 않는다.

      고객지원 안의 차례도 바꿨다. 맨 앞이 `자주 묻는 질문` 인 이유: 물으러 온 사람의 절반은
      이미 적혀 있는 것을 묻는다. 문의 양식을 먼저 세우면 읽어 보기 전에 적기부터 한다.

      갈래 이름을 누를 때 가는 곳(`href`)도 그 첫 화면으로 옮겼다.

      `FAQ` 를 `자주 묻는 질문` 으로 적는다. 나머지 넷이 다 우리말이라 그 하나만 영문이면
      약자를 모르는 사람에게는 무엇인지 알 수 없는 항목이 된다.
    */
    groups: [
      {
        title: '고객지원',
        children: [
          { href: '/support/faq', label: '자주 묻는 질문', ready: true },
          { href: '/support/contact', label: '문의하기', ready: true },
          { href: '/support/directions', label: '오시는 길', ready: true },
        ],
      },
      {
        title: '회사소식',
        children: [
          { href: '/support/notices', label: '공지사항', ready: true },
          { href: '/support/news', label: '뉴스', ready: true },
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
/**
 * 헤더에 세울 갈래 — 감춘 것을 뺀다.
 *
 * 헤더만 거른다. **푸터는 `SITE_NAV` 를 그대로 읽는다** — 감춘 갈래의 화면은 여전히 열리고,
 * 거기로 가는 길이 사이트에서 통째로 사라지면 그 화면은 주소를 아는 사람만 볼 수 있게 된다.
 *
 * 헤더에서 뺀 까닭은 **맨 위에 서는 갈래를 줄이는 것**이지 화면을 없애는 것이 아니다.
 */
export function headerNav(): SiteNavItem[] {
  return SITE_NAV.filter((one) => !one.hidden);
}

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
  dxp: '/solutions/dxp',
  consulting: '/solutions/consulting',
  infra: '/solutions/infra',
  contact: '/support/contact',
  notices: '/support/notices',
  news: '/support/news',
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
