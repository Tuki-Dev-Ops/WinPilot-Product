// `@/` 별칭 대신 상대 경로를 쓴다 — 이 모듈은 Next 밖(문서 생성 스크립트)에서도 읽힌다.
import { pages } from '../pages.manifest';

/**
 * IA 묶음 — **화면 나무를 갈래별로 나눈 것**이 원본이다.
 *
 * ## 갈래를 새로 정하지 않는다
 * 앞의 넷은 헤더에 선 갈래 그대로다(`lib/navigation.ts` 의 `SITE_NAV`) — ABOUT · SOLUTION ·
 * PRODUCT · CS CENTER. 도면이 헤더와 다른 갈래를 말하면, 사이트를 눌러 본 사람과 도면을 읽은
 * 사람이 서로 다른 구조를 머리에 담는다.
 *
 * ## 감춘 갈래도 도면에는 남긴다
 * PRODUCT 는 지금 헤더에서 감춰 두었다(`hidden: true`). 그래도 여기서 지우지 않는 이유는 그
 * 필드의 머리말과 같다 — 지우면 **왜 없는지가 코드에서 사라진다.** 화면과 주소는 그대로 열리고
 * 푸터는 `SITE_NAV` 를 통째로 읽으므로, 사라진 것은 헤더의 갈래 하나뿐이다.
 *
 * ## IR 다섯 갈래는 헤더에 없다
 * 공시 · 숫자 · 주주 · 자료 · 법적 고지는 `SITE_NAV` 에 없다. 처음 온 사람의 물음이 아니라
 * **이미 이 회사를 아는 사람**의 물음이기 때문이다(`lib/navigation.ts` 머리말). 그래서 갈래
 * 이름과 차례는 매니페스트의 번호대와 IR 줄(`app/_components/IrSubNav.tsx`)이 정한 순서를
 * 따른다 — 무슨 일이 있었나(공시) → 얼마를 벌었나(숫자) → 언제 무엇을 정하나(주주) →
 * 더 볼 것(자료).
 *
 * IR 아홉을 한 갈래로 묶지 않은 이유: 한 상자에 아홉을 넣으면 도면에서 그 상자만 화면 절반을
 * 차지하고, 그 안에서 재무와 주주총회가 같은 종류로 보인다. 투자자가 실제로 나누어 보는 단위가
 * 그 넷이다.
 *
 * ## 화면 이름을 한글로 다시 적는 이유
 * 매니페스트의 `name` 은 Figma 페이지 이름이라 영문이다(`Disclosure Detail`). 도면은 사람이
 * 읽는 그림이므로 한글로 적는다. 두 벌이 되는 것을 막기 위해 `screen` 은 반드시 매니페스트에
 * 있는 id 여야 하며, 어긋나면 `unknownScreens()` 가 알려 준다.
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
  /** 주소 한 마디 — `/ia/disclosure`. 소문자 영문만 쓴다(`docs/path.md` §2). */
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
   * 이 저장소에는 서버가 없다. 화면이 읽는 것은 공유 패키지의 시드(`@winpilot/store` 의
   * `ir.ts` · `site.ts` · `company.ts`)와 브라우저 상태뿐이고, 밖으로 나가는 것은 공시 상세의
   * DART 원문 링크 하나다. 있지도 않은 API 를 도면에 그리면 그 도면을 보고 만드는 사람이
   * 서버를 찾는다.
   */
  data: string[];
  /** 이 갈래에서만 지켜야 하는 것 */
  notes: string[];
};

/** 홈은 어느 갈래에도 들지 않는다 — 아홉 갈래가 모두 여기서 갈라진다. */
export const ROOT: IaScreen = { screen: 'home', ko: '메인 페이지' };

export const IA_GROUPS: IaGroup[] = [
  {
    id: 'about',
    label: 'ABOUT',
    purpose: '어떤 회사이고 무엇을 지나왔는지 확인한다.',
    screens: [
      { screen: 'about', ko: '회사 소개' },
      { screen: 'about-history', ko: '연혁' },
      { screen: 'about-certifications', ko: '특허 및 인증' },
      { screen: 'about-certifications-detail', ko: '특허 · 인증 상세' },
    ],
    edges: [['about-certifications', 'about-certifications-detail']],
    data: [
      '@winpilot/store · IR_COMPANY',
      '@winpilot/store · MILESTONES (sortMilestones · milestoneDate)',
      '@winpilot/store · CREDENTIALS (publicCredentials)',
    ],
    notes: [
      '회사 소개에서 연혁·특허 및 인증으로 가던 바로가기 두 장을 뺐다 — 그 둘은 헤더의 ABOUT 펼침에 이미 서 있고, 같은 길을 화면 안에 한 번 더 두면 화면이 끝났다는 신호가 있어야 할 자리에 링크 둘이 서서 아래가 더 있는 것처럼 읽힌다. 갈래 안에 남은 길은 특허 목록에서 상세로 가는 하나뿐이다.',
      '특허 상세를 둔 까닭은 목록에 값이 모자라서가 아니라 **주소가 필요해서**다. 특허 하나를 제안서나 메일에 걸 자리가 없어, 홈페이지 목록의 몇 번째 줄이라고 적게 된다.',
      '내려 둔 특허·인증은 상세도 주소로 안 열린다. 공시와 같은 규칙이다.',
      '연혁은 왼쪽에 연도 기둥을 세워 닻으로 뛴다. 자바스크립트 없이 주소에 남으므로 뒤로 가기가 듣고 특정 해를 그대로 공유할 수 있다.',
      '회사 소개는 한 줄 · 숫자 넉 줄 · 표 세 층이다. 표만 두면 확인하러 온 사람에게는 맞지만 처음 온 사람에게는 읽을 것이 없다.',
      '숫자 넉 줄은 지어내지 않고 이미 있는 값을 센다 — 설립 연도 · 상장 시장 · 연혁 수 · 특허와 인증 수.',
      '긴 소개 글을 두지 않는다. 홈이 이미 무엇을 하는 회사인지 말했고, 같은 말이 두 곳에 있으면 고칠 때 한쪽만 고쳐진다.',
      '연혁은 위가 최신이다. 오래된 것부터 쌓으면 지금 무엇을 하는 회사인지가 맨 아래에 있게 되는데, 여기 오는 사람의 절반은 첫 화면만 보고 나간다.',
      '숨긴 연혁과 비공개 특허·인증은 오지 않는다. 세는 숫자도 거른 뒤의 것이라 소개 화면과 목록이 같은 답을 준다.',
      '특허 및 인증은 등록번호를 반드시 적는다. 밖에서 조회할 수 있는 값이라 번호가 없으면 적어 둔 뜻이 없고, 검색이 이름뿐 아니라 번호와 발급처까지 훑는 것도 번호를 들고 오는 사람 때문이다.',
      '연혁 값을 이 앱이 따로 들지 않는다. 같은 회사의 연혁을 어드민이 고치고 있어, 여기에 한 벌 더 두면 두 벌 중 하나만 고쳐진다.',
    ],
  },
  {
    id: 'solution',
    label: 'SOLUTION',
    purpose: '사람이 붙어서 하는 일 둘을 읽고 문의로 넘어간다.',
    screens: [
      { screen: 'solutions-consulting', ko: '스마트 컨설팅' },
      { screen: 'solutions-infra', ko: '인프라 서비스' },
    ],
    edges: [],
    data: [
      '@winpilot/store · SERVICE_DETAILS (findOffering)',
      '@winpilot/store · SITE_SERVICES (siteServiceHref)',
    ],
    notes: [
      'SOLUTION 은 사람이 붙어서 하는 일, PRODUCT 는 계약하면 그날부터 쓰는 것이다. 한 갈래에 섞어 두면 컨설팅을 몇 카피 사면 되나 같은 물음이 생긴다.',
      '둘 다 제품 넷과 같은 조각(`OfferingDetail`)으로 선다 — 문제 · 기능 · 구성 · 성과 · 업종 · 절차 · 문의. 검토하는 사람은 여러 화면을 나란히 열어 놓고 보므로 차례가 갈리면 그 차이가 바로 눈에 띈다.',
      '전에는 메뉴의 스마트 컨설팅이 곧장 문의하기로 갔다. 무엇을 해 주는지 읽기도 전에 물어보라는 것이라, 누를 이유가 이미 있는 사람만 눌렀다.',
      '인프라 서비스는 전에 제품 소개로 갔다. 거기 서 있는 것이 클라우드 제품 넷이라, 인프라를 보러 간 사람은 자기가 잘못 눌렀다고 여긴다.',
      '이 둘에는 켜고 끄는 값(`visible`)이 없다 — 서비스는 내리는 것이 아니라 안 파는 것이다.',
      '성과에 숫자를 적지 않는다. 현장마다 다른 값이라, 소개 화면에 적으면 그것이 약속이 된다.',
    ],
  },
  {
    id: 'product',
    label: 'PRODUCT',
    purpose: '계약하면 그날부터 쓰는 클라우드 제품 넷을 훑고 하나를 연다.',
    screens: [
      { screen: 'products', ko: '제품' },
      { screen: 'solutions-mes', ko: 'Cloud MES' },
      { screen: 'solutions-erp', ko: 'Cloud ERP' },
      { screen: 'solutions-crm', ko: 'Cloud CRM' },
      { screen: 'solutions-dxp', ko: 'Cloud DXP' },
    ],
    edges: [
      ['products', 'solutions-mes'],
      ['products', 'solutions-erp'],
      ['products', 'solutions-crm'],
      ['products', 'solutions-dxp'],
    ],
    data: [
      '@winpilot/store · SOLUTIONS (publicSolutions · findOffering)',
      '@winpilot/store · SITE_SERVICES · SERVICE_DETAILS (siteServiceHref)',
    ],
    notes: [
      '이 갈래는 헤더에서 감춰 두었다(`SITE_NAV` 의 `hidden: true`). 헤더에는 뜨지 않지만 화면과 주소는 그대로 열리고, 푸터는 `SITE_NAV` 를 그대로 읽어 제품 넷이 거기 서 있다 — 감춘 것은 맨 위의 갈래 하나뿐이다.',
      '목록에서 지우지 않은 이유: 지우면 왜 없는지가 코드에서 사라지고, 다음 사람이 물었을 때 답할 것이 git 이력밖에 없다. 다시 세우려면 그 한 줄만 지운다.',
      '주소는 `/solutions/*` 인데 갈래는 PRODUCT 다. 한때 넷을 SOLUTION 아래에 두었다가 갈랐고, 갈래를 옮길 때 주소까지 옮기면 밖에 나간 링크가 끊긴다.',
      '`/products` 는 한때 준비중 한 장이었다. 헤더의 PRODUCT 갈래와 홈의 카드가 전부 여기로 와서, 들어온 사람이 가장 많은 화면이 가장 비어 있었다. 지금은 여섯이 다 자기 화면을 가져 그 쏠림이 없어졌고, 여기는 무엇을 파는지 한눈에 훑는 자리로 남았다.',
      '어느 것이 서비스인지를 `/products` 에 이름으로 적지 않는다. 적어 두면 서비스가 셋이 되는 날 이 화면만 조용히 둘을 세우고, 짧아진 목록은 빠뜨렸다는 표시가 아니라 그냥 짧은 목록으로 보인다.',
      '클라우드 제품에만 사진을 붙인다 — 사람이 하는 일에 사진을 붙이면 그 사진이 결과물처럼 읽힌다.',
      '`visible` 을 끄면 메뉴 · 홈 카드 · 제품 목록에서 함께 사라지지만 상세 주소는 그대로 열린다. 아직 팔지 않는 제품의 소개를 미리 만들어 두고 길만 감추는 일이 실제로 흔하다.',
      'Cloud DXP 는 마지막에 화면이 생겼다. 그전에는 넷 중 하나만 제품 소개로 튕겨 나갔고, 눌러 본 사람은 자기가 잘못 눌렀다고 여겼다.',
    ],
  },
  {
    id: 'support',
    label: 'CS CENTER',
    purpose: '막혀서 온 사람이 읽을 것을 먼저 두고, 그래도 안 되면 묻게 한다.',
    screens: [
      { screen: 'support-contact', ko: '문의하기' },
      { screen: 'support-notices', ko: '공지사항' },
      { screen: 'support-news', ko: '뉴스' },
      { screen: 'support-faq', ko: 'FAQ' },
      { screen: 'support-directions', ko: '오시는 길' },
    ],
    edges: [],
    data: [
      '@winpilot/store · SITE_NOTICES (publicSiteNotices) · SITE_NOTICE_GROUPS',
      '@winpilot/store · SITE_FAQS (publicSiteFaqs) · FAQ_GROUPS',
      '@winpilot/store · MEDIA_CLIPS (publicMediaClips)',
      '@winpilot/store · DIRECTIONS · SITE_REGIONS · IR_COMPANY',
    ],
    notes: [
      '넷이 한 배치를 쓴다(`SupportBrowser`) — 왼쪽에 갈래, 오른쪽에 검색과 결과. 전에는 갈래가 어디 붙는지가 화면마다 달라, 안을 오가는 사람이 고르는 자리를 매번 다시 찾았다.',
      '갈래 옆의 수는 거르기 전 전체를 센다. 거른 뒤로 세면 검색어를 치는 순간 모든 갈래가 0 이 되어, 다른 갈래에 답이 있는지 없는지 알 수 없다.',
      '공지와 FAQ 는 상세 화면으로 보내지 않고 제자리에서 편다. 서너 문단 때문에 화면을 옮기면 셋을 읽으려고 여섯 번 오간다 — 대신 글 하나를 가리키는 주소가 없고, 그 거래를 택했다.',
      '숨긴 공지는 서버에서 걸러 보낸다. 브라우저에서 거르면 아직 알리지 않기로 한 공지가 화면에는 없어도 페이지 소스에는 그대로 남는다.',
      '고정 공지를 맨 위로 올리되 고정 딱지를 함께 둔다. 표시 없이 순서만 바꾸면 오래된 글이 맨 위에 있는 것으로 읽혀 목록이 관리되지 않는다는 인상을 준다.',
      '접히는 목록은 맨 위 하나를 펴 둔 채로 연다. 전부 접어 두면 제목만 늘어선 줄이 되어, 처음 온 사람은 펼칠 수 있다는 것조차 모르고 지나간다.',
      '검색이 본문과 답까지 훑는다. 찾는 사람의 말과 적힌 말이 다르다 — 견적을 치는 사람의 물음은 도입 비용은 어떻게 되나요로 적혀 있고, 그 말은 답 안에 있다.',
      '뉴스만 결과가 격자다. 영상은 제목보다 그림으로 고른다.',
      '뉴스의 갈래는 값에서 뽑고 공지·FAQ 의 갈래는 코드에 정해진 것을 쓴다. 저쪽은 없는 갈래도 0 으로 세워 두는 편이 낫고, 이쪽은 적어 두면 새 갈래를 쓰는 날 그 영상만 어느 갈래에도 안 걸린다.',
      '오시는 길에 지도를 넣지 않는다. 키가 있어야 하고 없는 동안 회색 네모가 남으며, 스크립트를 통째로 들여와 이 화면 하나 때문에 다른 화면까지 느려진다 — 대신 주소를 크게 두어 자기 지도 앱에 붙여 넣게 한다.',
      '아직 공시하지 않은 실적·전망은 개별로 알려 주지 않는다는 것을 문의 양식 아래에 늘 적는다. 특정 투자자에게만 미리 알리는 것은 공정공시에 어긋난다(`docs/architecture/policy.md` §3).',
    ],
  },
  {
    id: 'legal',
    label: '법적 고지',
    purpose: '아직 원고가 없다는 사실과 물어볼 곳을 같은 자리에 둔다.',
    screens: [
      { screen: 'terms', ko: '서비스 이용약관' },
      { screen: 'privacy', ko: '개인정보 처리방침' },
    ],
    edges: [],
    data: ['@winpilot/store · IR_COMPANY (IR 창구 · 개인정보보호책임자)'],
    notes: [
      '푸터 맨 윗줄에서만 열린다. 사이트 메뉴와 같은 층에 두면 ABOUT · SOLUTION 옆에 서서 둘 다 눈에 덜 든다 — 이 둘은 파는 것을 소개하는 길이 아니라 어느 화면에서든 같은 자리에 있어야 하는 고지다.',
      '약관 본문을 지어내지 않는다. 그럴듯한 문장을 채워 두면 그것이 실제로 효력을 주장할 문서가 되고, 분쟁이 났을 때 근거가 되는 것도 이 화면이다.',
      '처리방침도 같다. 무엇을 어떤 근거로 얼마 동안 모으는지 확인하지 않고 채우면 화면에 적힌 것과 실제로 하는 일이 어긋나고, 그 어긋남이 그대로 법 위반이다.',
      '그렇다고 링크를 지우지도 않는다. 푸터에서 약관이 빠져 있으면 찾는 사람이 없는 회사로 여긴다.',
      '대신 물어볼 곳은 지금도 적는다 — 약관은 IR 창구, 처리방침은 개인정보보호책임자다. 이 화면이 없을 때 가장 아쉬운 값이 그것이다.',
      '두 화면만 제목 위에 홈으로 돌아가는 길을 단다. 헤더 갈래 어디에도 들지 않아 돌아갈 자리가 그것뿐이다.',
      '문의 양식이 회사명 · 지역 · 담당자명 · 휴대폰 · 이메일 · 내용 · 첨부를 실제로 받고 있다. 원고가 오면 그 항목이 표로 여기 서야 한다.',
    ],
  },
];

/**
 * 갈래를 넘는 이동.
 *
 * 전체 사이트맵에는 **긋지 않는다** — 아홉 갈래에 이 선을 다 그으면 도면이 그물이 되어
 * 아무것도 읽히지 않는다. 대신 화면 하나를 볼 때(`/docs/ia/{화면}`)만 그 화면에 닿는 선을
 * 꺼내 그린다. 한 화면에 붙는 선은 많아야 둘셋이라 그때는 읽힌다.
 *
 * 헤더 넷 · 푸터 · IR 줄(`IrSubNav`)에서 가는 길은 여기 적지 않는다. 어느 화면에서나 같으므로
 * 적어 두면 화면 수만큼 되풀이되고, 정작 그 화면에만 있는 길이 묻힌다.
 */
export type CrossEdge = {
  from: string;
  to: string;
  /** 어떤 길로 넘어가는가 — 도면의 간선 라벨이 아니라 표에 적히는 말이다 */
  how: string;
};

export const CROSS_EDGES: CrossEdge[] = [
  { from: 'home', to: 'about', how: '소개 칸의 자세히 보기' },
  { from: 'home', to: 'solutions-consulting', how: '서비스 무대에서 고른 칸의 자세히 보기' },
  { from: 'home', to: 'solutions-infra', how: '서비스 무대에서 고른 칸의 자세히 보기' },
  { from: 'home', to: 'solutions-mes', how: '서비스 무대 · 솔루션 칸의 자세히 보기' },
  { from: 'home', to: 'solutions-erp', how: '서비스 무대 · 솔루션 칸의 자세히 보기' },
  { from: 'home', to: 'solutions-crm', how: '서비스 무대 · 솔루션 칸의 자세히 보기' },
  { from: 'home', to: 'solutions-dxp', how: '서비스 무대 · 솔루션 칸의 자세히 보기' },
  { from: 'home', to: 'support-news', how: '맨 아래 영상 줄의 뉴스 전체보기' },
  { from: 'products', to: 'support-contact', how: '맨 아래 검은 칸의 진단 문의하기' },
  { from: 'solutions-consulting', to: 'support-contact', how: '상세 맨 아래 문의 칸' },
  { from: 'solutions-infra', to: 'support-contact', how: '상세 맨 아래 문의 칸' },
  { from: 'solutions-mes', to: 'support-contact', how: '상세 맨 아래 문의 칸' },
  { from: 'solutions-erp', to: 'support-contact', how: '상세 맨 아래 문의 칸' },
  { from: 'solutions-crm', to: 'support-contact', how: '상세 맨 아래 문의 칸' },
  { from: 'solutions-dxp', to: 'support-contact', how: '상세 맨 아래 문의 칸' },
  { from: 'terms', to: 'home', how: '제목 위의 홈으로' },
  { from: 'privacy', to: 'home', how: '제목 위의 홈으로' },
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
 * 매니페스트의 `name` 은 Figma 페이지 이름이라 영문이다(`Disclosure Detail`). 왼쪽 세움대와
 * 도면은 사람이 읽는 것이므로 한글을 먼저 쓰고, 갈래에 적히지 않은 화면만 매니페스트 이름으로
 * 돌아간다.
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
