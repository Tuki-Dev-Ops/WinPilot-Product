// `@/` 별칭 대신 상대 경로를 쓴다 — 이 모듈은 Next 밖(문서 생성 스크립트)에서도 읽힌다.
import { pages } from '../pages.manifest';

/**
 * IA 묶음 — **화면 나무를 갈래별로 나눈 것**이 원본이다.
 *
 * 26개 화면을 한 장에 그리면 도면이 화면보다 커져서, 정작 "구매가 어떻게 흐르는가" 를 보려는
 * 사람이 도면 전체를 훑어야 한다. 갈래를 탭으로 나누면 볼 것만 본다.
 *
 * 여기서 정한 것이 곧 `/ia` 의 탭이고 `docs/ia/*.md` 다 — 탭 목록을 화면에서 따로 적지 않는다.
 * 적으면 갈래를 하나 늘렸을 때 탭과 문서가 갈라진다.
 *
 * ## 화면 이름을 한글로 다시 적는 이유
 * 매니페스트의 `name` 은 Figma 페이지 이름이라 영문이다(`Product List`). 도면은 사람이 읽는
 * 그림이므로 한글로 적는다. 두 벌이 되는 것을 막기 위해 `screen` 은 반드시 매니페스트에 있는
 * id 여야 하며, 없으면 생성 스크립트가 멈춘다.
 *
 * ## 어드민 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
 */
export type IaScreen = {
  /** `pages.manifest.ts` 의 id */
  screen: string;
  /** 도면·표에 보이는 한글 이름 */
  ko: string;
};

export type IaGroup = {
  /** 주소 한 마디 — `/ia/purchase`. 소문자 영문만 쓴다(`docs/path.md` §2). */
  id: string;
  /** 탭에 보이는 말 */
  label: string;
  /** 이 갈래가 있는 이유 — 한 문장 */
  purpose: string;
  screens: IaScreen[];
  /** 갈래 안의 이동 — `[출발 screen, 도착 screen]` */
  edges: Array<[string, string]>;
  /**
   * 이 갈래의 화면이 값을 읽어 오는 곳 — 도면에서 원통으로 그린다.
   *
   * 이 프로젝트에는 서버가 없다. 화면이 읽는 것은 공유 패키지의 시드(`@winpilot/store`),
   * 템플릿 A~F 가 함께 쓰는 문구(`@winpilot/client-content`), 그리고 **주소의 질의문자열**뿐이다.
   * 있지도 않은 API 를 도면에 그리면 그 도면을 보고 만드는 사람이 서버를 찾는다.
   */
  data: string[];
  /** 이 갈래에서만 지켜야 하는 것 */
  notes: string[];
};

/** 홈은 어느 갈래에도 들지 않는다 — 모든 갈래가 여기서 갈라진다. */
export const ROOT: IaScreen = { screen: 'index', ko: '홈' };

export const IA_GROUPS: IaGroup[] = [
  {
    id: 'company',
    label: '회사',
    purpose: '우리가 누구이고 무엇을 해 왔는지를 보여 준다.',
    screens: [
      { screen: 'company', ko: '회사소개' },
      { screen: 'company-history', ko: '연혁' },
      { screen: 'portfolios', ko: '포트폴리오' },
    ],
    edges: [
      ['company', 'company-history'],
      ['company', 'portfolios'],
    ],
    data: ['@winpilot/store · company', '@winpilot/store · contents (포트폴리오)'],
    notes: [
      '헤더의 `회사소개` 2Depth 와 같은 세 갈래다 — 메뉴에만 있고 화면이 없는 항목을 만들지 않는다.',
      '연혁·포트폴리오는 회사소개 아래에 놓이지만 주소는 각자 1뎁스다. 3뎁스를 만들면 돌아올 길이 길어진다.',
      '대표 이미지·연혁 항목·포트폴리오 글은 모두 어드민이 넣는다 — 템플릿은 자리만 정한다.',
    ],
  },
  {
    id: 'products',
    label: '상품',
    purpose: '파는 것을 좁혀 가며 고르고, 고른 것을 자세히 본다.',
    screens: [
      { screen: 'products', ko: '상품 목록' },
      { screen: 'products-detail', ko: '상품 상세' },
    ],
    edges: [['products', 'products-detail']],
    data: ['@winpilot/store · products', '@winpilot/store · categories', '@winpilot/store · product-options', '주소 질의문자열 (분류·검색·가격)'],
    notes: [
      '신상품(`/products?tag=NEW`)·베스트(`?tag=BEST`)는 **화면이 아니라 목록의 필터**다. 화면을 나누면 정렬·페이징·빈 상태를 세 벌로 관리하게 된다.',
      '분류·검색·가격은 주소에 남는다 — 새로고침과 공유에서 살아남아야 조건을 말로 설명하지 않는다.',
      '재고가 0인 옵션도 목록에는 남긴다. 왜 못 고르는지가 보여야 한다.',
    ],
  },
  {
    id: 'support',
    label: '고객지원',
    purpose: '묻기 전에 찾아보게 하고, 찾지 못하면 물을 곳을 준다.',
    screens: [
      { screen: 'notices', ko: '공지사항' },
      { screen: 'notices-detail', ko: '공지 상세' },
      { screen: 'faqs', ko: 'FAQ' },
      { screen: 'faqs-detail', ko: 'FAQ 상세' },
      { screen: 'news', ko: '뉴스' },
      { screen: 'news-detail', ko: '뉴스 상세' },
      { screen: 'contact', ko: '문의하기' },
    ],
    edges: [
      ['notices', 'notices-detail'],
      ['faqs', 'faqs-detail'],
      ['news', 'news-detail'],
    ],
    data: ['@winpilot/store · contents (공지·FAQ·뉴스)', '@winpilot/store · inquiry-form'],
    notes: [
      '네 갈래가 왼쪽 aside 하나를 함께 쓴다(`app/_components/SupportShell.tsx`). 상세로 들어가도 aside 는 그대로 두고 main 만 바뀐다.',
      '헤더의 `고객지원` 2Depth 와 aside 의 갈래가 같다 — 같은 것을 두 가지로 나누어 부르지 않는다.',
      '문의하기는 읽는 화면 셋과 달리 **쓰는 화면**이라 같은 aside 안에 두되 마지막에 놓는다.',
    ],
  },
  {
    id: 'purchase',
    label: '구매',
    purpose: '담은 것을 결제하고 그 결과를 알린다.',
    screens: [
      { screen: 'cart', ko: '장바구니' },
      { screen: 'orders-new', ko: '결제' },
      { screen: 'result', ko: '처리 결과' },
    ],
    edges: [
      ['cart', 'orders-new'],
      ['orders-new', 'result'],
    ],
    data: ['@winpilot/store · products', '@winpilot/store · coupons', '주소 질의문자열 (productId·state·kind)'],
    notes: [
      '상품 상세에서 장바구니를 거치지 않고 바로 결제로 들어올 수 있다(`/orders/new?productId=…`). 한 개만 사는 사람에게 담기를 시키지 않는다.',
      '장바구니는 비회원도 쓴다 — 담을 때가 아니라 결제할 때 로그인을 묻는다.',
      '결제할 것이 없으면 결제 단추가 잠긴다. 눌러 놓고 다음 화면에서 막으면 무엇이 잘못됐는지 늦게 안다.',
      '처리 결과는 완료·실패가 **한 화면**이다(`/result?state=…`). 문구와 아이콘만 바뀐다.',
    ],
  },
  {
    id: 'mypage',
    label: '마이페이지',
    purpose: '내가 한 일과 나에게 온 것을 한자리에서 본다.',
    screens: [
      { screen: 'mypage', ko: '내 정보 수정' },
      { screen: 'orders', ko: '주문 내역' },
      { screen: 'orders-detail', ko: '주문 상세' },
      { screen: 'mypage-inquiries', ko: '문의 내역' },
      { screen: 'mypage-coupons', ko: '쿠폰함' },
      { screen: 'alarms', ko: '알람' },
    ],
    edges: [
      ['mypage', 'orders'],
      ['orders', 'orders-detail'],
      ['mypage', 'mypage-inquiries'],
      ['mypage', 'mypage-coupons'],
      ['mypage', 'alarms'],
    ],
    data: ['@winpilot/store · orders', '@winpilot/store · coupons', '@winpilot/store · inquiries'],
    notes: [
      '주문 내역이 `/mypage/orders` 가 아니라 `/orders` 인 이유: 주문은 마이페이지에 딸린 것이 아니라 **독립된 자원**이다(어드민의 `판매` 와 같은 것). 화면만 마이페이지 안쪽에 놓인다.',
      '네 갈래가 왼쪽 aside 하나를 함께 쓴다(`app/_components/MyPageShell.tsx`).',
      '알람은 헤더에서도 바로 열린다 — 읽지 않은 수가 헤더에 붙어 있어서 마이페이지를 거치게 하면 한 번 더 누르게 된다.',
    ],
  },
  {
    id: 'account',
    label: '계정',
    purpose: '로그인하고, 없으면 만든다.',
    screens: [
      { screen: 'login', ko: '로그인' },
      { screen: 'signup', ko: '회원가입' },
    ],
    edges: [['login', 'signup']],
    data: ['@winpilot/client-content · account', '@winpilot/store · nickname'],
    notes: [
      '가입은 로그인 화면의 탭에서 들어간다 — 두 화면을 멀리 두면 계정이 없는 사람이 로그인 화면에서 막힌다.',
      '가입이 끝나면 처리 결과 화면으로 보낸다(`/result?state=done&kind=signup`). 무엇이 끝났는지에 따라 돌아갈 곳이 달라진다.',
    ],
  },
  {
    id: 'policy',
    label: '약관',
    purpose: '동의한 것이 무엇인지 언제든 다시 읽게 한다.',
    screens: [
      { screen: 'terms', ko: '이용약관' },
      { screen: 'privacy', ko: '개인정보 처리방침' },
    ],
    edges: [],
    data: ['@winpilot/store · policies'],
    notes: [
      '가입·결제에서 링크로 열리므로 로그인 없이 읽힌다.',
      '본문은 어드민이 넣는다(`설정 > 서비스 이용약관 정보`·`개인정보 처리방침 정보`). 템플릿에 글을 박아 두면 고칠 때 배포를 해야 한다.',
    ],
  },
];

export function findGroup(id: string): IaGroup | undefined {
  return IA_GROUPS.find((group) => group.id === id);
}

/** 매니페스트에 있는데 어느 갈래에도 들지 않은 화면. 도면이 화면을 따라가지 못한 자리다. */
export function ungrouped(): string[] {
  const held = new Set([ROOT.screen, ...IA_GROUPS.flatMap((group) => group.screens.map((s) => s.screen))]);
  return pages.filter((page) => !held.has(page.id)).map((page) => page.id);
}

/** 갈래에는 적혀 있는데 매니페스트에 없는 화면. 지운 화면이 도면에 남은 자리다. */
export function unknownScreens(): string[] {
  const real = new Set(pages.map((page) => page.id));
  return [ROOT, ...IA_GROUPS.flatMap((group) => group.screens)]
    .map((s) => s.screen)
    .filter((screen) => !real.has(screen));
}
