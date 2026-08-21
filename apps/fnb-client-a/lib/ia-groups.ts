// `@/` 별칭 대신 상대 경로를 쓴다 — 이 모듈은 Next 밖(문서 생성 스크립트)에서도 읽힌다.
import { pages } from '../pages.manifest';

/**
 * IA 묶음 — **화면 나무를 갈래별로 나눈 것**이 원본이다.
 *
 * 갈래는 새로 정하지 않는다. **사이트 헤더에 선 일곱**(브랜드 · 메뉴 · 인테리어 · 마케팅 ·
 * 매장안내 · 창업안내 · 고객센터) 그대로이고, 그 뒤에 헤더에 없는 것 하나(법적 고지)가 붙는다.
 * 도면이 헤더와 다른 갈래를 말하면, 사이트를 눌러 본 사람과 도면을 읽은 사람이 다른 구조를
 * 머리에 담는다.
 *
 * ## 일곱으로 나눈 까닭
 * 자원으로 나누면 `공지사항` · `자료실` 처럼 **회사가 부르는 이름**이 갈래가 되고, 그러면 밖에서
 * 온 사람은 자기 물음을 어디서 찾아야 하는지 모른다. 여기 일곱은 전부 찾아온 사람이 묻는 말
 * 그대로다. 앞의 둘은 손님이 보고, 가운데 넷은 차리려는 사람이 보며, 마지막은 이미 우리를
 * 아는 사람이 찾는다(`lib/navigation.ts` 머리말).
 *
 * ## 어드민 갈래를 따라가지 않는다
 * 어드민판(`apps/fnb-admin/lib/ia-groups.ts`)은 사이드바 섹션 id 를 그대로 쓰고 이름도 메뉴에서
 * 읽는다. 여기는 그럴 수 없다 — 이 사이트가 읽는 값의 출처가 어드민이지만, **손님이 보는 길**은
 * 어드민이 값을 담아 둔 서랍과 같은 모양이 아니다. 그래서 갈래마다 `label` 을 직접 적는다.
 *
 * ## 화면 이름을 한글로 다시 적는 이유
 * 매니페스트의 `name` 은 Figma 페이지 이름이라 영문이다(`Store Finder`). 도면은 사람이 읽는
 * 그림이므로 한글로 적는다. 두 벌이 되는 것을 막기 위해 `screen` 은 반드시 매니페스트에 있는
 * id 여야 하며, 어긋나면 `unknownScreens()` 가 알려 준다.
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
  /** 주소 한 마디 — `/ia/franchise`. 소문자 영문만 쓴다(`docs/path.md` §2). */
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
   * 이 프로젝트에는 서버가 없다. 화면이 읽는 것은 공유 패키지의 시드(`@winpilot/store` 의
   * `fnb.ts`)와 브라우저 상태뿐이고, 밖으로 나가는 것은 카카오 지도 SDK 하나다. 있지도 않은
   * API 를 도면에 그리면 그 도면을 보고 만드는 사람이 서버를 찾는다.
   */
  data: string[];
  /** 이 갈래에서만 지켜야 하는 것 */
  notes: string[];
};

/** 홈은 어느 갈래에도 들지 않는다 — 일곱 갈래가 모두 여기서 갈라진다. */
export const ROOT: IaScreen = { screen: 'home', ko: '메인 페이지' };

export const IA_GROUPS: IaGroup[] = [
  {
    id: 'brand',
    label: '브랜드',
    purpose: '무엇을 지키는 집인지 읽는다.',
    screens: [{ screen: 'brand', ko: '브랜드 이야기' }],
    edges: [],
    data: ['@winpilot/store · FNB_BRAND', '@winpilot/store · STORES (openStores)'],
    notes: [
      '연혁 표를 두지 않는다. 그 표를 읽는 사람은 투자자와 기자이고, 여기 오는 사람은 손님 아니면 점주다 — 둘 다 연도가 아니라 무엇을 지키는 집인가를 묻는다.',
      '지키는 것 셋은 store 가 아니라 화면이 들고 있다. 어드민에서 고칠 수 있게 두면 고쳐지고, 그 문장이 계절 행사 문구로 덮이는 것을 막을 방법이 없다.',
      '원칙을 셋으로 고정한다. 넷째부터는 앞의 셋을 다시 말하는 문장이 되기 쉽고, 그러면 전부가 광고 문구처럼 읽힌다.',
      '매장 수를 글로 적지 않고 센다. 매장이 하나 늘 때 이 화면만 옛 숫자로 남지 않게 한다.',
    ],
  },
  {
    id: 'menu',
    label: '메뉴',
    purpose: '무엇을 파는지 보고, 더 알아야 할 것이 있는 한 가지를 연다.',
    screens: [
      { screen: 'menu', ko: '메뉴판' },
      { screen: 'menu-detail', ko: '메뉴 상세' },
    ],
    edges: [['menu', 'menu-detail']],
    data: ['@winpilot/store · MENU_ITEMS', '@winpilot/store · MENU_CATEGORIES'],
    notes: [
      '내려 둔 메뉴는 없는 것처럼 둔다. 품절과 계절 메뉴를 흐리게라도 세우면 손님이 주문할 수 있는 줄 알고 매장에 가서 안다.',
      '상세는 내려 둔 메뉴도 주소로 열린다. 즐겨찾기나 공유받은 링크에 404 를 보이면 없어진 것인지 주소가 틀린 것인지 알 수 없다 — 대신 화면 위쪽에 지금 팔지 않는다고 적는다.',
      '미리 만들어 두는 경로는 파는 것만이다. 내려 둔 것까지 만들어 두면 그 화면이 검색에 걸린다.',
      '상세가 답하는 것은 알레르기와 열량이다. 이름 · 값 · 한 줄 설명은 메뉴판에서 이미 읽었고, 그럼에도 눌러 들어오는 사람은 더 알아야 할 것이 있는 사람이다.',
      '왼쪽에 묶음, 오른쪽에 그 묶음의 메뉴다. 메뉴판에서 실제로 하는 일이 처음부터 끝까지 읽는 것이 아니라 한 묶음을 고르는 것이라 그렇다.',
    ],
  },
  {
    id: 'interior',
    label: '인테리어',
    purpose: '자리를 보고 있는 사람의 첫 물음에 답한다 — 내 평수에 얼마 드나.',
    screens: [{ screen: 'interior', ko: '인테리어' }],
    edges: [],
    data: [
      '@winpilot/store · INTERIOR_PLANS · INTERIOR_PER_PYEONG',
      '@winpilot/store · INTERIOR_GALLERY',
    ],
    notes: [
      '창업안내 아래가 아니라 최상위다. 자리를 보고 있는 사람이 실제로 묻는 것이 이것과 마케팅 둘이고 그것이 창업 검토의 절반인데, 한 단계 아래에 두면 창업안내를 눌러 본 사람만 그 답에 닿는다.',
      '사진보다 숫자가 먼저다. 완성 매장 사진에서 알아내는 것은 예뻐 보인다는 것뿐이고, 그것은 어느 브랜드 사진이나 같다.',
      '공사비를 표에 적지 않고 평당 단가 하나에서 센다. 창업 비용표의 인테리어 줄도 같은 값에서 나오므로, 단가가 오르면 두 화면이 함께 움직인다.',
      '평형별 안이 한 장씩 크게 넘어간다. 세 칸으로 깔면 굴릴 것이 남지 않고, 자리를 보고 있는 사람은 세 안을 동시에 견주지 않는다.',
      '맨 아래에 상담 판을 두지 않는다. 이 화면이 답하는 것은 얼마 드는가 하나이고, 검은 판이 사진 모자이크 바로 아래 서면 방금 본 사진의 색을 덮는다.',
      '사진 자리는 잡아 두되 아직 사진이 없다 — 문어 그림으로 대신한다(`PhotoSlot`). 자리를 안 잡으면 사진이 생기는 날 배치를 다시 짜야 한다.',
    ],
  },
  {
    id: 'marketing',
    label: '마케팅',
    purpose: '본사가 밖에서 무엇을 하고 있는지를 올린 것으로 보인다.',
    screens: [{ screen: 'marketing', ko: '마케팅' }],
    edges: [],
    data: ['@winpilot/store · MARKETING_CHANNELS', '@winpilot/store · MARKETING_POSTS'],
    notes: [
      '인테리어와 같은 까닭으로 최상위다 — 본사가 뭘 해 주나는 자리를 보고 있는 사람이 실제로 묻는 둘 중 하나다.',
      '`본사 부담 / 분담 / 점주 부담` 표가 있었다. 뺐다 — 마케팅을 보러 온 사람이 묻는 것은 이 브랜드가 밖에서 어떻게 보이는가다. 부담이 어떻게 갈리는지는 창업 비용표와 계약 전 정보공개서가 답한다.',
      '창구를 둘만 세운다. 비어 있는 창구는 없는 창구보다 나쁘다 — 눌러 본 사람이 관리를 안 한다고 읽는다.',
      '카드가 링크가 아니다. 계정 주소를 아직 갖고 있지 않아, 누를 수 있게 보이면 눌러 본 사람이 고장으로 읽는다.',
      '맨 아래에 상담 판을 두지 않는다. 인테리어와 같은 판단이다.',
    ],
  },
  {
    id: 'stores',
    label: '매장안내',
    purpose: '가까운 매장을 찾고 거기까지 어떻게 가는지 본다.',
    screens: [{ screen: 'stores', ko: '매장 찾기' }],
    edges: [],
    data: [
      '@winpilot/store · STORES · STORE_REGIONS',
      '카카오 지도 SDK (NEXT_PUBLIC_KAKAO_MAP_KEY)',
    ],
    notes: [
      '지도를 직접 그리지 않고 카카오 지도를 쓴다. 통계청 경계선으로 세 층을 그려 본 적이 있는데 길과 건물이 없었다 — 여기 온 사람이 하는 일은 여기서 어떻게 가지이고, 그 답은 행정 경계가 아니라 길에 있다.',
      '열쇠가 없거나 도메인이 등록되지 않으면 빈 상자 대신 설명 판을 세운다. 무엇이 없어서 안 뜨는지와 어디에 넣으면 되는지를 적는다 — 이 화면을 처음 띄우는 사람이 가장 먼저 만나는 것이 그 상자다.',
      '거르개와 지도가 이어져 있다. 목록이 좁혀지면 지도도 그만큼 좁혀진다 — 둘이 따로 놀면 지도에 있는 표식을 목록에서 못 찾는다.',
      '휴점은 목록에서 빠지고 준비중은 남는다. 곧 여는 매장이 실제로 가장 많이 찾는 값이고, 대신 번호 자리에 여는 달을 적어 없는 번호로 전화가 가지 않게 한다.',
      '매장 상세 화면이 없다. 줄 하나가 주소 · 여는 시간 · 번호 · 되는 것을 다 적어 더 볼 것이 남지 않는다.',
    ],
  },
  {
    id: 'franchise',
    label: '창업안내',
    purpose: '차리려는 사람이 얼마 드는지 읽고, 물어보고, 번호를 남긴다.',
    screens: [
      { screen: 'franchise', ko: '가맹점 개설절차' },
      { screen: 'franchise-apply', ko: '가맹점 상담 신청' },
      { screen: 'franchise-faq', ko: '가맹점 개설문의' },
    ],
    edges: [
      ['franchise', 'franchise-apply'],
      ['franchise', 'franchise-faq'],
      ['franchise-faq', 'franchise-apply'],
    ],
    data: [
      '@winpilot/store · FRANCHISE_COSTS · FRANCHISE_STEPS · FRANCHISE_COST_BASIS',
      '@winpilot/store · FNB_FAQS (audience = 창업) · FAQ_TOPICS',
      '@winpilot/store · STORE_REGIONS · FRANCHISE_BUDGETS',
    ],
    notes: [
      '셋이 한 화면이었다. 창업을 검토하는 사람은 비용 · 절차 · 물음 · 신청을 한 번에 다 읽지 않는다 — 한 장에 쌓아 두면 두 번째로 왔을 때 자기가 어디까지 읽었는지를 잃는다.',
      '차례는 읽는 순서다: 개설절차 · 상담 신청 · 개설문의. 비용은 절차 화면에 함께 둔다 — 얼마 드는지와 얼마 걸리는지는 같이 봐야 판단이 된다.',
      '비용을 표로 적는다. 전화해서 물으라고 두면 아직 마음을 못 정한 사람은 전화하지 않고 창을 닫는다. 숫자를 보고 물러나는 사람은 어차피 계약까지 가지 않을 사람이다.',
      '빠진 것(임차료 · 권리금 · 철거비)을 합계와 같은 줄에 같은 크기로 적는다. 아래 작은 글씨로 내리면 합계만 읽고 가는 사람이 생기고, 그 사람은 나중에 속았다고 여긴다.',
      '탭 셋이 가운데 밑줄로 선다. 헤더에 펼침판을 들이면 나머지 여섯 갈래도 같은 동작을 배워야 하므로 그 화면 안에서 나눈다.',
      '고정 상담 바는 어느 화면에나 뜨지만 신청 화면에서만 뜨지 않는다 — 이미 온 사람에게 신청하러 가자고 하는 바는 양식을 가리는 방해물이다.',
    ],
  },
  {
    id: 'support',
    label: '고객센터',
    purpose: '드시러 오시는 분이 묻기 전에 읽을 것을 둔다.',
    screens: [
      { screen: 'support-notices', ko: '공지사항' },
      { screen: 'support-faq', ko: '자주 묻는 질문' },
    ],
    edges: [
      ['support-notices', 'support-faq'],
      ['support-faq', 'support-notices'],
    ],
    data: [
      '@winpilot/store · FNB_NOTICES (orderedFnbNotices)',
      '@winpilot/store · FNB_FAQS (audience = 손님)',
    ],
    notes: [
      '헤더에 펼침판이 없다. 일곱 갈래 중 아래에 둘이 있는 것은 여기뿐이라, 그 하나 때문에 펼침판을 들이면 나머지 여섯도 같은 동작을 배워야 한다 — 대신 화면 안 왼쪽 기둥으로 나눈다(`SUPPORT_NAV`).',
      '두 화면이 기둥 하나를 함께 읽으므로 오가는 길이 양쪽에 다 있다. 화면마다 목록을 적어 두면 하나가 늘 때 한쪽에만 생긴다.',
      '갈래는 `/support` 아래를 다 덮지만 눌렀을 때는 공지사항으로 간다. `/support` 자체를 화면으로 만들면 고를 것만 둘 있는 빈 화면을 지나게 되는데, 그 일은 기둥이 이미 하고 있다.',
      '둘 다 접었다 펴고, 한 번에 하나만 열린다. 여럿 열어 두면 셋쯤에서 방금 연 것이 화면 밖으로 밀린다.',
      '공지는 상세 화면이 없다. 목록 자리에서 펴 읽으므로 글 하나를 링크로 공유할 주소가 없는데, 지금 공지의 성격(가격 조정 · 개점 · 휴점)에서 그 일이 실제로 일어나지 않는다.',
      '공지의 맨 위 하나는 펴 둔다. 그 자리는 붙여 둔 글이 오는 곳이라 전부 접혀 있으면 붙여 둔 뜻이 사라진다.',
      '창업 물음은 여기 없다. 고객센터는 드시러 오시는 분의 자리이고, 차리려는 분의 물음은 창업안내 아래 자기 화면이 따로 있다 — 답하는 사람이 다르기 때문이다.',
    ],
  },
  {
    id: 'legal',
    label: '법적 고지',
    purpose: '무엇을 받고 얼마나 갖고 있는지를 언제든 다시 읽게 한다.',
    screens: [
      { screen: 'terms', ko: '서비스 이용약관' },
      { screen: 'privacy', ko: '개인정보 처리방침' },
    ],
    edges: [],
    data: ['@winpilot/store · FNB_BRAND (창구 · 개인정보보호책임자)'],
    notes: [
      '헤더에 없다. 이 둘은 파는 것을 소개하는 길이 아니라 어느 화면에서든 같은 자리에 있어야 하는 고지라, 푸터 맨 윗줄에 가로로 둔다 — 브랜드 · 창업 옆에 세우면 둘 다 눈에 덜 든다.',
      '약관은 비워 두고 물어볼 곳만 적는다. 검토 전 초안을 걸면 그 순간부터 그것이 내건 약관이 되고, 나중에 고쳐도 그 사이에 신청한 사람에게는 옛 약관이 적용된다. 그렇다고 링크를 지우면 찾는 사람이 없는 회사로 여긴다.',
      '처리방침은 비워 둘 수 없다. 창업 상담 신청에서 성함 · 연락처 · 지역 · 예산을 실제로 받고 있으므로, 무엇을 얼마나 보관하는지는 지금 적혀 있어야 한다 — 원고가 없다는 이유로 비우면 받고 있으면서 안 밝히는 상태가 된다.',
      '받는 것 표는 store 가 아니라 화면이 들고 있다. 어드민에서 따로 고칠 수 있게 두면 양식은 그대로인데 표만 바뀌고, 그때 어느 쪽이 사실인지 화면으로는 알 수 없다.',
      '두 화면만 제목이 왼쪽 맞춤이다. 아래가 왼쪽에서 시작하는 긴 글이라, 제목만 가운데 두면 읽는 눈이 위아래로 오갈 때마다 옆으로도 움직인다.',
    ],
  },
];

/**
 * 갈래를 넘는 이동.
 *
 * 전체 사이트맵에는 **긋지 않는다** — 여덟 갈래에 이 선을 다 그으면 도면이 그물이 되어 아무것도
 * 읽히지 않는다. 대신 화면 하나를 볼 때(`/docs/ia/{화면}`)만 그 화면에 닿는 선을 꺼내 그린다.
 * 한 화면에 붙는 선은 많아야 서넛이라 그때는 읽힌다.
 *
 * 헤더 일곱 · 푸터 · 화면 아래 고정 상담 바에서 가는 길은 여기 적지 않는다. 어느 화면에서나
 * 같으므로 적어 두면 화면 수만큼 되풀이되고, 정작 그 화면에만 있는 길이 묻힌다.
 */
export type CrossEdge = {
  from: string;
  to: string;
  /** 어떤 길로 넘어가는가 — 도면의 간선 라벨이 아니라 표에 적히는 말이다 */
  how: string;
};

export const CROSS_EDGES: CrossEdge[] = [
  { from: 'home', to: 'menu', how: '첫 화면의 메뉴 보기 · 대표 메뉴 칸 아래의 전체 메뉴 보기' },
  { from: 'home', to: 'menu-detail', how: '대표 메뉴 굴림판의 카드에서 바로' },
  { from: 'home', to: 'stores', how: '첫 화면의 매장 찾기 · GRAND OPEN 칸 아래의 매장 전체 보기' },
  { from: 'home', to: 'franchise', how: '매장별 실적 칸 아래의 창업 안내 자세히 보기' },
  { from: 'home', to: 'support-notices', how: '공지 띠 — 굴러가는 줄과 전체보기가 같은 곳으로 간다' },
  { from: 'brand', to: 'stores', how: '맨 아래의 매장 찾기' },
];

export function findGroup(id: string): IaGroup | undefined {
  return IA_GROUPS.find((group) => group.id === id);
}

/** 화면이 속한 갈래. 홈은 어느 갈래에도 들지 않으므로 `undefined` 다. */
export function groupOf(screen: string): IaGroup | undefined {
  return IA_GROUPS.find((group) => group.screens.some((item) => item.screen === screen));
}

/**
 * 화면의 한글 이름.
 *
 * 매니페스트의 `name` 은 Figma 페이지 이름이라 영문이다(`Store Finder`). 왼쪽 세움대와 도면은
 * 사람이 읽는 것이므로 한글을 먼저 쓰고, 갈래에 적히지 않은 화면만 매니페스트 이름으로 돌아간다.
 */
export function koOf(screen: string): string {
  if (screen === ROOT.screen) return ROOT.ko;
  const found = IA_GROUPS.flatMap((group) => group.screens).find((item) => item.screen === screen);
  return found?.ko ?? pages.find((page) => page.id === screen)?.name ?? screen;
}

/**
 * 왼쪽 세움대에 세울 화면 목록 — **매니페스트 순서**를 따른다.
 *
 * 갈래 순서로 세우지 않는 이유: 세움대는 갈래를 보여 주는 곳이 아니라 화면으로 건너뛰는 곳이고,
 * 매니페스트 순번은 Figma 페이지 순번과 같아서 디자인 파일과 나란히 놓고 보기 좋다.
 */
export function screenNavItems(): Array<{ slug: string; label: string }> {
  return pages.map((page) => ({ slug: page.id, label: koOf(page.id) }));
}

/** 매니페스트에 있는데 어느 갈래에도 들지 않은 화면. 도면이 화면을 따라가지 못한 자리다. */
export function ungrouped(): string[] {
  const held = new Set([ROOT.screen, ...IA_GROUPS.flatMap((group) => group.screens.map((s) => s.screen))]);
  return pages.filter((page) => !held.has(page.id)).map((page) => page.id);
}

/** 갈래에는 적혀 있는데 매니페스트에 없는 화면. 지운 화면이 도면에 남은 자리다. */
export function unknownScreens(): string[] {
  const real = new Set(pages.map((page) => page.id));
  // 갈래를 넘는 선도 함께 본다 — 한쪽 끝이 사라진 선은 도면에서 허공으로 뻗는다.
  const named = [
    ROOT.screen,
    ...IA_GROUPS.flatMap((group) => group.screens.map((item) => item.screen)),
    ...CROSS_EDGES.flatMap((edge) => [edge.from, edge.to]),
  ];
  return [...new Set(named)].filter((screen) => !real.has(screen));
}
