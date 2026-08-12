import { FNB_BRAND } from '@winpilot/store';

/**
 * 외식 브랜드 홈페이지의 길.
 *
 * ## 일곱 갈래를 한 줄로 편다
 * 브랜드 · 메뉴 · 인테리어 · 마케팅 · 매장안내 · 창업안내 · 고객센터. 앞의 둘은 손님이 보고,
 * 가운데 넷은 **차리려는 사람**이 보며, 마지막은 이미 우리를 아는 사람이 찾는다.
 *
 * 자원으로 나누면 `공지사항`·`자료실` 처럼 회사가 부르는 이름이 메뉴가 되고, 그러면 밖에서 온
 * 사람은 자기 물음을 어느 갈래에서 찾아야 하는지 모른다. 여기 일곱은 전부 **찾아온 사람이
 * 묻는 말** 그대로다.
 *
 * ## 인테리어와 마케팅이 왜 최상위인가
 * 둘 다 창업안내 아래에 넣을 수도 있었다. 그런데 자리를 보고 있는 사람이 실제로 묻는 것이
 * **내 평수에 얼마 드나**(인테리어)와 **본사가 뭘 해 주나**(마케팅) 둘이고, 그것이 창업 검토의
 * 절반이다. 한 단계 아래에 두면 창업안내를 눌러 본 사람만 그 답에 닿는다.
 *
 * ## 펼침판이 없다 — IR 템플릿과 갈리는 자리
 * IR 템플릿의 헤더는 갈래마다 화면 폭짜리 판이 펼쳐진다. 거기는 한 갈래 아래에 여섯이 있어서
 * **묶어 세울 것**이 있었다. 여기는 갈래마다 화면이 하나씩이다. 하나짜리 판을 펼치면 마우스를
 * 올릴 때마다 화면이 한 번 덮였다가 링크 하나만 보여 주고 닫힌다 — 누르러 온 사람에게 한 단계를
 * 더 시키는 셈이다. 갈래 자체를 링크로 둔다.
 *
 * 고객센터만 아래에 둘(공지사항 · 자주 묻는 질문)이 있는데, 그 둘은 **그 화면 안 왼쪽 기둥**으로
 * 선다(`SUPPORT_NAV`). 일곱 중 하나 때문에 펼침판을 들이면 나머지 여섯도 같은 동작을 배워야 한다.
 *
 * ## 헤더에 단추가 없다
 * 한때 오른쪽에 `창업 상담` 단추를 세워 두었다. 뺐다 — 갈래가 일곱이 되면서 그 단추가 **여덟째
 * 항목처럼** 읽혔고, 늘 떠 있는 채움 단추 하나가 일곱 갈래보다 눈에 먼저 들어왔다. 헤더가 답할
 * 것은 어디로 갈 수 있는가이지 무엇을 하라는 것이 아니다.
 *
 * 신청하러 가는 길은 없어지지 않았다. 홈 · 인테리어 · 마케팅 · 창업안내 네 화면이 **다 읽은
 * 자리 바로 아래**에서 그리로 보내고, 푸터에도 있다. 읽고 나서 누르는 자리가 읽기 전에 늘 떠
 * 있는 자리보다 낫다.
 */
export type SiteNavItem = {
  label: string;
  /** 눌렀을 때 **가는 곳** */
  href: string;
  /**
   * 이 갈래가 **덮는 주소**. 없으면 `href` 를 쓴다.
   *
   * 둘이 갈리는 자리가 하나 있다 — 고객센터는 `/support` 아래를 다 덮지만 눌렀을 때는
   * 공지사항(`/support/notices`)으로 간다. `href` 만으로 지금 위치를 재면 `/support/faq` 에서
   * **일곱 갈래 어디에도 표가 남지 않는다.**
   *
   * `/support` 자체를 화면으로 만들어 해결할 수도 있었다. 그러면 눌러 들어간 사람이 고를 것만
   * 둘 있는 빈 화면을 지나야 하는데, 그 화면이 하는 일은 탭이 이미 하고 있다.
   */
  match?: string;
};

export const SITE_NAV: readonly SiteNavItem[] = [
  { label: '브랜드', href: '/brand' },
  { label: '메뉴', href: '/menu' },
  { label: '인테리어', href: '/interior' },
  { label: '마케팅', href: '/marketing' },
  { label: '매장안내', href: '/stores' },
  { label: '창업안내', href: '/franchise' },
  { label: '고객센터', href: '/support/notices', match: '/support' },
];

/**
 * 창업 안내 안의 탭 셋.
 *
 * ## 왜 셋으로 나눴나
 * 한 화면에 비용 · 절차 · 자주 묻는 것 · 상담 신청이 다 있었다. 창업을 검토하는 사람은 그 넷을
 * **한 번에 다 읽지 않는다** — 처음에는 얼마 드는지만 보고, 마음이 서면 절차를 보고, 물어볼 것이
 * 생기면 문의를 찾는다. 한 장에 쌓아 두면 두 번째로 왔을 때 자기가 어디까지 읽었는지를 잃는다.
 *
 * 차례는 **읽는 순서**다: 절차 → 상담 신청 → 개설 문의. 비용은 절차 화면에 함께 둔다 — 얼마
 * 드는지와 얼마 걸리는지는 같이 봐야 판단이 된다.
 */
export const FRANCHISE_NAV: readonly SiteNavItem[] = [
  { label: '가맹점 개설절차', href: '/franchise' },
  { label: '가맹점 상담 신청', href: '/franchise/apply' },
  { label: '가맹점 개설문의', href: '/franchise/faq' },
];

/**
 * 고객센터 안의 길 둘 — 본문 왼쪽에 기둥으로 선다(`SupportAside`).
 *
 * 헤더에 펼침판을 들이는 대신 **그 화면 안에서** 나눈다. 두 화면 다 이 목록을 읽으므로,
 * 하나가 늘어도 한쪽에만 생기는 일이 없다.
 */
export const SUPPORT_NAV: readonly SiteNavItem[] = [
  { label: '공지사항', href: '/support/notices' },
  { label: '자주 묻는 질문', href: '/support/faq' },
];

export type SiteNavGroup = {
  title: string;
  children: SiteNavItem[];
};

/**
 * 푸터의 길 — 헤더보다 **넓게** 편다.
 *
 * 맨 아래까지 내려온 사람은 이미 헤더에서 멀어져 있어, 거기서 다음 갈래로 가려면 끝까지
 * 올라가야 한다. 푸터는 좁힐 자리가 아니므로 헤더에 없는 것(고객지원)까지 여기서 다 편다.
 */
export const FOOTER_NAV: readonly SiteNavGroup[] = [
  {
    /*
      브랜드명을 글자로 적지 않고 값에서 가져온다. 한때 `손님` 이라 적혀 있었고 그 앞에는 다른
      말이 있었는데, 이름을 바꿀 때마다 **여기가 남는다** — 푸터는 아래로 내려가야 보이는 자리라
      옛 이름이 오래 남는다.
    */
    title: FNB_BRAND.name,
    children: [
      { href: '/brand', label: '브랜드' },
      { href: '/menu', label: '메뉴' },
      { href: '/stores', label: '매장안내' },
    ],
  },
  {
    title: '창업',
    children: [
      { href: '/franchise', label: '창업안내' },
      { href: '/interior', label: '인테리어' },
      { href: '/marketing', label: '마케팅' },
      { href: '/franchise/apply', label: '창업 상담 신청' },
    ],
  },
  {
    title: '고객센터',
    children: [
      { href: '/support/notices', label: '공지사항' },
      { href: '/support/faq', label: '자주 묻는 질문' },
    ],
  },
];

/**
 * 푸터 맨 윗줄의 법적 고지.
 *
 * 사이트 메뉴와 나눠 두는 이유: 이 둘은 **파는 것을 소개하는 길이 아니다.** 같은 목록에 섞으면
 * 브랜드·창업 옆에 `개인정보 처리방침` 이 서게 되고, 그러면 둘 다 눈에 덜 든다.
 */
export const LEGAL_NAV: readonly { href: string; label: string }[] = [
  { href: '/terms', label: '서비스 이용약관' },
  { href: '/privacy', label: '개인정보 처리방침' },
];

/**
 * 화면 주소를 값으로 둔다.
 *
 * 글자로 적어 두면 주소가 바뀌는 날 **어디를 고쳐야 하는지 검색으로 찾아야 하고**, 하나를
 * 빠뜨려도 그 링크를 눌러 보기 전에는 드러나지 않는다.
 *
 * 메뉴 상세만 함수다 — 붙일 것(`id`)이 있기 때문이다. 부르는 쪽에서 `/menu/${id}` 를 엮으면
 * 앞자리가 세 군데에 흩어진다.
 */
export const FNB_ROUTES = {
  home: '/',
  brand: '/brand',
  menu: '/menu',
  menuItem: (id: string) => `/menu/${id}`,
  interior: '/interior',
  marketing: '/marketing',
  stores: '/stores',
  franchise: '/franchise',
  franchiseApply: '/franchise/apply',
  notices: '/support/notices',
  faq: '/support/faq',
} as const;
