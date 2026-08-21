// `@/` 별칭 대신 상대 경로를 쓴다 — 이 모듈은 Next 밖(문서 생성 스크립트)에서도 읽힌다.
import { pages } from '../pages.manifest';

/**
 * 흐름 원본 — **도면이 아니라 사실을 적는다.**
 *
 * mermaid 를 손으로 적어 두면 화면이 바뀌었을 때 도면만 조용히 옛것이 된다. 여기에는 어디서
 * 들어오고 무엇을 밟고 어디서 갈리는지만 적고, 선과 모양은 `lib/flow-diagram.ts` 가 그린다.
 * 고칠 곳이 하나여야 도면이 화면을 따라온다.
 *
 * `screen` 은 `pages.manifest.ts` 의 id 와 같다 — 매니페스트에 있는데 여기 없으면
 * `missingFlows()` 가 알려 준다. 문서가 화면을 따라가지 못하는 것을 사람이 기억하지 않는다.
 *
 * ## 서버가 없다
 * `data` 에 적는 것은 공유 시드 패키지(`@winpilot/store` 의 `fnb.ts`)와 브라우저 상태뿐이고,
 * 밖으로 나가는 것은 카카오 지도 SDK 하나다. 있지도 않은 API 를 흐름에 그리면 그 도면을 보고
 * 만드는 사람이 서버를 찾는다.
 *
 * ## 어드민 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
 */

/** 갈림길 — 마름모로 그린다. `after` 번째 단계 **뒤**에 놓인다(0부터). */
export type FlowBranch = {
  after: number;
  /** 물음 한 마디 */
  question: string;
  /** 통과 간선에 붙는 짧은 말. 기본 `예` */
  pass?: string;
  /** 막혔을 때 가는 곳 — 점선으로 갈린다 */
  block: string;
  /** 막힘 간선에 붙는 짧은 말. 기본 `아니오` */
  blockLabel?: string;
};

/** 예외 — `at` 번째 단계에서 점선으로 갈린다(0부터). */
export type FlowException = { at: number; label: string };

export type FlowBody = {
  /** 이 흐름으로 들어오는 길 */
  entries: string[];
  /** 밟는 차례 — 순서대로 잇는다 */
  steps: string[];
  branches: FlowBranch[];
  exceptions: FlowException[];
  /** 값이 오는 곳 — 원통으로 그린다 */
  data: string[];
  /** 흐름이 끝나고 가는 곳 */
  exits: string[];
};

export type ScreenFlow = FlowBody & { screen: string };
export type NamedFlow = FlowBody & { id: string; title: string; purpose: string };

/*
  문자열에 큰따옴표·파이프·꺾쇠를 넣지 않는다. 그대로 mermaid 노드 이름과 간선 라벨이 되므로
  따옴표가 들어가면 도면이 통째로 그려지지 않는다 (`lib/flow-diagram.ts` 의 `text()` 참고).
*/
export const FLOW_SPECS: ScreenFlow[] = [
  {
    screen: 'home',
    entries: ['주소를 바로 열어', '어느 화면에서든 로고를 눌러'],
    steps: [
      '한 줄 소개를 읽고 길 둘 중 하나를 고른다',
      '숫자 띠에서 매장 수 · 창업 비용 · 개점까지를 잰다',
      '공지 한 줄을 지나며 읽는다',
      '대표 메뉴 굴림판을 민다',
      '검은 판부터는 차리려는 분의 자리다',
    ],
    branches: [
      {
        after: 2,
        question: '공지가 하나라도 있나',
        pass: '있음',
        block: '띠를 세우지 않는다 — 뜻 없는 빈 줄을 남기지 않는다',
        blockLabel: '0건',
      },
    ],
    exceptions: [
      { at: 3, label: '내려 둔 메뉴는 굴림판에 오지 않는다 — 품절과 계절 메뉴' },
      { at: 4, label: '휴점 매장은 GRAND OPEN 줄에 서지 않는다' },
    ],
    data: [
      '@winpilot/store · FNB_BRAND',
      '@winpilot/store · MENU_ITEMS (publicMenuItems)',
      '@winpilot/store · STORES (newestStores · openStores)',
      '@winpilot/store · FNB_NOTICES (orderedFnbNotices)',
      '@winpilot/store · GROWTH_FIGURES · STORE_SALES · BRAND_POINTS',
    ],
    exits: ['메뉴판으로', '메뉴 상세로 바로', '매장 찾기로', '창업 안내로', '공지사항으로'],
  },
  {
    screen: 'brand',
    entries: ['헤더의 브랜드', '푸터의 브랜드'],
    steps: ['언제 어디서 시작했고 지금 몇 곳인지 읽는다', '지키는 것 셋을 읽는다', '매장 찾기로 넘어간다'],
    branches: [],
    exceptions: [{ at: 1, label: '지키는 것 셋은 화면이 들고 있다 — 어드민에서 고칠 수 있게 두면 행사 문구로 덮인다' }],
    data: ['@winpilot/store · FNB_BRAND', '@winpilot/store · STORES (openStores)'],
    exits: ['매장 찾기로'],
  },
  {
    screen: 'menu',
    entries: ['헤더의 메뉴', '첫 화면의 메뉴 보기', '홈 대표 메뉴 칸의 전체 메뉴 보기', '푸터의 메뉴'],
    steps: ['카테고리 필터에서 카테고리를 선택한다', '카테고리 설명을 확인한다', '메뉴 카드 목록을 확인한다', '메뉴 상세로 이동한다'],
    branches: [],
    exceptions: [
      { at: 0, label: '등록된 메뉴가 없는 카테고리는 필터에 표시하지 않는다' },
      { at: 2, label: '내려 둔 메뉴는 없는 것처럼 둔다. 흐리게 세우면 주문할 수 있는 줄 알고 매장에 가서 안다' },
    ],
    data: ['@winpilot/store · MENU_ITEMS (publicMenuItems)', '@winpilot/store · MENU_CATEGORIES'],
    exits: ['메뉴 상세로'],
  },
  {
    screen: 'menu-detail',
    entries: ['메뉴판의 카드에서', '홈의 대표 메뉴 굴림판에서', '공유받은 주소로 바로'],
    steps: ['메뉴명과 가격을 확인한다', '설명과 태그를 확인한다', '열량과 알레르기 유발 재료를 확인한다', '동일 카테고리 추천 메뉴를 확인한다'],
    branches: [
      {
        after: 0,
        question: '지금 파는 메뉴인가',
        pass: '판다',
        block: '지금은 팔지 않는다고 값 바로 아래에 적는다 — 다 읽은 뒤에 알게 하지 않는다',
        blockLabel: '내려 둠',
      },
      {
        after: 3,
        question: '동일 카테고리에 다른 메뉴가 있는가',
        pass: '있음',
        block: '동일 카테고리 추천 영역을 표시하지 않는다',
        blockLabel: '없음',
      },
    ],
    exceptions: [
      { at: 0, label: '없는 id 는 404 화면' },
      { at: 0, label: '내려 둔 메뉴도 주소로는 열린다 — 즐겨찾기와 공유받은 링크에 404 를 보이지 않는다' },
      { at: 2, label: '알레르기가 없으면 비우지 않고 해당 없음이라 적는다' },
    ],
    data: ['@winpilot/store · MENU_ITEMS (findMenuItem)', '@winpilot/store · MENU_CATEGORIES'],
    exits: ['메뉴 목록으로', '동일 카테고리의 다른 메뉴로'],
  },
  {
    screen: 'interior',
    entries: ['헤더의 인테리어', '푸터의 인테리어'],
    steps: [
      '평당 단가와 빠진 것을 제목에서 읽는다',
      '평형별 안을 한 장씩 넘긴다',
      '값 · 좌석 · 공사 주를 견준다',
      '완성 매장 사진 모자이크를 훑는다',
    ],
    branches: [],
    exceptions: [
      { at: 1, label: '사진 자리는 잡아 두되 아직 사진이 없다 — 문어 그림으로 대신한다' },
      { at: 2, label: '공사비는 표에 적힌 값이 아니라 평당 단가 하나에서 나온다' },
      { at: 3, label: '맨 아래에 상담 판이 없다. 갈 길은 헤더 · 푸터 · 고정 상담 바에 그대로 있다' },
    ],
    data: ['@winpilot/store · INTERIOR_PLANS · INTERIOR_PER_PYEONG', '@winpilot/store · INTERIOR_GALLERY'],
    exits: ['창업 안내로 (헤더)', '상담 신청으로 (고정 상담 바)'],
  },
  {
    screen: 'marketing',
    entries: ['헤더의 마케팅', '푸터의 마케팅'],
    steps: ['왼쪽 기둥에서 창구를 고른다', '무엇을 올리는 곳인지 한 줄을 읽는다', '올라간 글을 훑는다'],
    branches: [
      {
        after: 1,
        question: '그 창구에 올라온 글이 있나',
        pass: '있음',
        block: '아직 올라온 글이 없습니다 한 줄',
        blockLabel: '0건',
      },
    ],
    exceptions: [
      { at: 2, label: '카드는 누를 수 없다 — 계정 주소를 아직 갖고 있지 않아 hover 도 넣지 않는다' },
      { at: 2, label: '사진 자리는 문어 그림이 대신한다' },
    ],
    data: ['@winpilot/store · MARKETING_CHANNELS', '@winpilot/store · MARKETING_POSTS (postsOfChannel)'],
    exits: ['창업 안내로 (헤더)', '상담 신청으로 (고정 상담 바)'],
  },
  {
    screen: 'stores',
    entries: ['헤더의 매장안내', '첫 화면의 매장 찾기', '홈 GRAND OPEN 칸의 매장 전체 보기', '브랜드 화면 맨 아래'],
    steps: [
      '지도가 깔린 판을 본다',
      '매장명이나 주소로 찾는다',
      '지역으로 좁힌다',
      '결과 줄을 눌러 지도를 당긴다',
      '주소 · 여는 시간 · 번호 · 되는 것을 읽는다',
    ],
    branches: [
      {
        after: 0,
        question: '지도 열쇠가 있고 도메인이 등록되어 있나',
        pass: '있음',
        block: '빈 상자 대신 설명 판 — 무엇이 없어서 안 뜨는지와 어디에 넣으면 되는지를 적는다',
        blockLabel: '없음',
      },
      {
        after: 2,
        question: '조건에 맞는 매장이 있나',
        pass: '있음',
        block: '찾으시는 조건에 맞는 매장이 없습니다 — 새 매장은 공지사항에 먼저 올린다고 함께 적는다',
        blockLabel: '0건',
      },
      {
        after: 3,
        question: '고른 매장이 있나',
        pass: '있음',
        block: '지금 목록에 선 매장 전부가 담기게 지도를 맞춘다',
        blockLabel: '없음',
      },
    ],
    exceptions: [
      { at: 0, label: '휴점 매장은 목록에 오지 않는다. 값은 남고 사이트에서만 빠진다' },
      { at: 3, label: '누른 줄을 다시 누르면 놓는다 — 당겨 본 뒤 전체로 돌아가는 길이 그것뿐이다' },
      { at: 4, label: '준비중 매장은 번호 자리에 여는 달을 적는다. 없는 번호를 두면 그리로 전화가 간다' },
    ],
    data: [
      '@winpilot/store · STORES (publicStores)',
      '@winpilot/store · STORE_REGIONS',
      '카카오 지도 SDK (NEXT_PUBLIC_KAKAO_MAP_KEY)',
    ],
    exits: ['여기서 끝난다 — 매장 상세 화면은 없다', '공지사항으로 (새로 여는 매장)'],
  },
  {
    screen: 'franchise',
    entries: ['헤더의 창업안내', '홈 매장별 실적 칸의 창업 안내 자세히 보기', '푸터의 창업안내'],
    steps: [
      '탭 셋에서 개설절차를 본다',
      '비용 표를 항목별로 읽는다',
      '합계와 빠진 것을 같은 줄에서 읽는다',
      '개점까지 다섯 단계와 걸리는 기간을 읽는다',
      '상담 판에서 신청하거나 번호로 건다',
    ],
    branches: [],
    exceptions: [
      { at: 1, label: '인테리어 줄은 평당 단가에서 나온다 — 인테리어 화면의 기본형과 같은 값이어야 한다' },
      { at: 2, label: '임차료 · 권리금 · 철거비는 포함되지 않는다. 작은 글씨로 내리지 않는다' },
      { at: 2, label: '표가 어느 크기 기준인지를 표 아래에 적는다' },
    ],
    data: [
      '@winpilot/store · FRANCHISE_COSTS · FRANCHISE_COST_BASIS · franchiseCostTotal',
      '@winpilot/store · FRANCHISE_STEPS',
      '@winpilot/store · FNB_BRAND (창업 상담 번호)',
    ],
    exits: ['상담 신청으로', '개설문의로'],
  },
  {
    screen: 'franchise-apply',
    entries: ['창업 안내의 상담 판', '개설문의의 상담 판', '고정 상담 바', '푸터의 창업 상담 신청'],
    steps: [
      '왼쪽에서 번호와 언제 연락이 오는지를 읽는다',
      '성함과 연락처를 적는다',
      '보고 계신 지역과 예산 구간을 고른다',
      '하고 싶은 말을 남긴다',
      '개인정보 수집 · 이용에 동의한다',
      '상담 신청을 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '지역과 예산을 골랐나',
        block: '고르지 않음인 채로는 통과하지 않는다 — 미리 골라 두면 안 고른 사람의 문의가 한곳으로 쌓인다',
      },
      {
        after: 4,
        question: '개인정보 동의를 했나',
        block: '동의해 달라고 그 자리에 적는다',
      },
      {
        after: 5,
        question: '다섯 항목이 다 맞나',
        pass: '맞음',
        block: '신청하지 못했습니다 + 확인이 필요한 항목이 몇 개인지',
        blockLabel: '어긋남',
      },
    ],
    exceptions: [
      { at: 1, label: '연락처는 비었는지와 형식이 맞는지를 나눠 알린다 — 형식 안내는 빈 칸에 대한 답이 아니다' },
      { at: 3, label: '하고 싶은 말은 선택이다. 필수로 두면 쓸 말이 없는 사람이 아무거나 적고 나간다' },
      { at: 5, label: '검사 결과는 한 번 눌러 본 뒤에만 보인다 — 적기 전부터 붉은 글이 서 있으면 양식이 틀린 것처럼 보인다' },
      { at: 5, label: '이 화면에서만 고정 상담 바가 뜨지 않는다 — 이미 온 사람에게는 양식을 가리는 방해물이다' },
    ],
    data: [
      '@winpilot/store · STORE_REGIONS',
      '@winpilot/store · FRANCHISE_BUDGETS',
      '@winpilot/store · FNB_BRAND (창업 상담 번호)',
    ],
    exits: ['접수 토스트 — 남긴 번호로 하루 안에 연락한다', '개설절차로 (탭)', '개설문의로 (탭)'],
  },
  {
    screen: 'franchise-faq',
    entries: ['창업 안내의 탭', '상담 신청의 탭'],
    steps: [
      '맨 위 전화번호를 확인한다',
      '왼쪽 분류에서 궁금한 갈래를 고른다',
      '물음을 눌러 답을 편다',
      '여기 없는 것이면 상담 판으로 간다',
    ],
    branches: [
      {
        after: 2,
        question: '이미 열린 물음인가',
        pass: '아니오',
        block: '다시 누르면 닫힌다 — 한 번 연 뒤로 무엇이든 하나가 계속 펴져 있지 않게',
        blockLabel: '예',
      },
    ],
    exceptions: [
      { at: 0, label: '여기까지 온 사람은 글로 답이 안 나온 사람이라 번호가 맨 위다' },
      { at: 1, label: '그 갈래에서 실제로 쓰이는 분류만 세운다. 빈 분류를 누르면 답이 없어진 줄 안다' },
      { at: 2, label: '분류를 바꾸면 열려 있던 답이 닫힌다 — 남의 분류의 답이 펴진 채 남으면 목록이 바뀐 것을 못 본다' },
      { at: 2, label: '한 번에 하나만 열린다. 셋쯤 열면 방금 연 것이 화면 밖으로 밀린다' },
    ],
    data: ['@winpilot/store · FNB_FAQS (audience = 창업)', '@winpilot/store · FAQ_TOPICS (faqTopicsOf)', '@winpilot/store · FNB_BRAND (창업 상담 번호)'],
    exits: ['상담 신청으로', '개설절차로 (탭)'],
  },
  {
    screen: 'support-notices',
    entries: ['헤더의 고객센터', '홈 공지 띠의 굴러가는 줄과 전체보기', '푸터의 공지사항'],
    steps: ['왼쪽 기둥에서 공지사항에 있음을 확인한다', '제목만 훑는다', '읽을 것 하나를 편다'],
    branches: [
      {
        after: 1,
        question: '올라온 공지가 있나',
        pass: '있음',
        block: '아직 올라온 공지가 없습니다 한 줄',
        blockLabel: '0건',
      },
    ],
    exceptions: [
      { at: 1, label: '고정한 글이 날짜를 이긴다 — 가격 인상처럼 묻기 전에 읽혀야 하는 것이 한 달 만에 밀리지 않게' },
      { at: 1, label: '차례는 store 가 세운다. 홈의 공지 띠가 같은 차례를 읽는다' },
      { at: 2, label: '맨 위 하나는 펴 둔 채로 들어온다 — 붙여 둔 글이 오는 자리다' },
      { at: 2, label: '상세 화면이 없어 글 하나의 주소도 없다. 지금 공지의 성격에서 그 일이 일어나지 않는다' },
    ],
    data: ['@winpilot/store · FNB_NOTICES (orderedFnbNotices)'],
    exits: ['자주 묻는 질문으로 (왼쪽 기둥)'],
  },
  {
    screen: 'support-faq',
    entries: ['고객센터 왼쪽 기둥', '푸터의 자주 묻는 질문'],
    steps: ['물음만 세로로 늘어선 목록을 훑는다', '자기 물음 하나를 편다'],
    branches: [
      {
        after: 0,
        question: '올라온 물음이 있나',
        pass: '있음',
        block: '아직 올라온 질문이 없습니다 한 줄',
        blockLabel: '0건',
      },
    ],
    exceptions: [
      { at: 0, label: '드시러 오시는 분의 물음만 선다. 차리려는 분의 물음은 창업 안내 아래 자기 화면이 있다' },
      { at: 0, label: '누구인지를 고르는 줄을 두지 않는다 — 열에 아홉이 손님이라 한 번의 고름을 없앤 셈이다' },
      { at: 1, label: '한 번에 하나만 열리고, 이미 열린 것을 다시 누르면 닫힌다' },
    ],
    data: ['@winpilot/store · FNB_FAQS (audience = 손님)'],
    exits: ['공지사항으로 (왼쪽 기둥)', '창업 개설문의로 (창업 물음이면)'],
  },
  {
    screen: 'terms',
    entries: ['푸터 맨 윗줄의 서비스 이용약관'],
    steps: ['왜 아직 비어 있는지를 읽는다', '급하면 물어볼 곳을 확인한다'],
    branches: [],
    exceptions: [
      { at: 0, label: '검토 전 초안을 걸지 않는다 — 거는 순간 그것이 내건 약관이 되고, 고쳐도 그 사이 신청한 사람에게는 옛 약관이 적용된다' },
      { at: 0, label: '그렇다고 링크를 지우지도 않는다. 푸터에서 약관이 빠져 있으면 없는 회사로 여긴다' },
    ],
    data: ['@winpilot/store · FNB_BRAND (손님 문의 번호 · 메일)'],
    exits: ['읽던 화면으로 돌아간다'],
  },
  {
    screen: 'privacy',
    entries: ['푸터 맨 윗줄의 개인정보 처리방침'],
    steps: ['받는 것 · 쓰는 곳 · 보관 기간을 표에서 읽는다', '넘기지 않는다는 약속을 읽는다', '개인정보보호책임자를 확인한다'],
    branches: [],
    exceptions: [
      { at: 0, label: '여기는 비워 둘 수 없다. 상담 신청이 실제로 개인정보를 받고 있어, 안 밝히면 받고 있으면서 감추는 상태가 된다' },
      { at: 0, label: '표는 화면이 들고 있다 — 어드민에서 따로 고칠 수 있게 두면 양식은 그대로인데 표만 바뀐다' },
      { at: 1, label: '양식의 동의 문구와 같은 말을 쓴다. 두 곳의 말이 다르면 어느 쪽이 약속인지 알 수 없다' },
    ],
    data: ['@winpilot/store · FNB_BRAND (개인정보보호책임자 · 메일)'],
    exits: ['읽던 화면으로 돌아간다'],
  },
];

/**
 * 여정 — **화면 하나가 아니라 하고 싶은 일 하나**를 따라간다.
 *
 * 화면별 흐름만 있으면 "차리려면 어디를 몇 번 거치는가" 를 사람이 머릿속에서 이어 붙여야 한다.
 * 여정은 그 이어 붙이기를 대신한다. 단계는 화면 이름으로 적는다 — 화면 안의 자세한 것은
 * 그 화면의 흐름에 이미 있다.
 *
 * 갈래 일곱이 손님 길과 점주 길로 갈리므로 여정도 그렇게 갈린다.
 */
export const JOURNEYS: NamedFlow[] = [
  {
    id: 'eat',
    title: '드시러 가기',
    purpose: '무엇을 파는지 보고 어느 매장으로 갈지 정하기까지. 사는 일은 매장에서 일어난다.',
    entries: ['홈', '헤더의 메뉴'],
    steps: ['메뉴판', '메뉴 상세', '매장 찾기'],
    branches: [
      {
        after: 0,
        question: '더 알아야 할 것이 있나',
        pass: '알레르기 · 열량',
        block: '메뉴판에서 값과 한 줄 설명만 보고 끝낸다',
        blockLabel: '없음',
      },
      {
        after: 2,
        question: '가까운 곳에 매장이 있나',
        pass: '있음',
        block: '새로 여는 매장은 공지사항에 먼저 올린다고 적는다',
        blockLabel: '0건',
      },
    ],
    exceptions: [{ at: 0, label: '내려 둔 메뉴는 목록에 없지만 주소로는 열린다 — 대신 지금 팔지 않는다고 적는다' }],
    data: ['@winpilot/store · MENU_ITEMS · MENU_CATEGORIES', '@winpilot/store · STORES'],
    exits: ['매장에서 드신다 — 사이트에서 파는 것이 없다'],
  },
  {
    id: 'franchise',
    title: '차리기',
    purpose: '얼마 드는지부터 번호를 남기기까지. 헤더 넷이 이 한 줄의 서로 다른 입구다.',
    entries: ['홈의 검은 판', '인테리어', '마케팅', '헤더의 창업안내'],
    steps: ['창업 안내 (비용 · 절차)', '가맹점 개설문의', '가맹점 상담 신청', '하루 안에 전화'],
    branches: [
      {
        after: 0,
        question: '숫자를 보고 계속할 마음이 서나',
        pass: '선다',
        block: '여기서 닫는다 — 어차피 계약까지 가지 않을 사람이고, 그 사람과의 상담 시간이 실제 비용이다',
        blockLabel: '아니오',
      },
      {
        after: 1,
        question: '글로 답이 나왔나',
        pass: '나옴',
        block: '개설문의 맨 위의 창업 상담 번호로 바로 건다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '네 칸만 묻는다. 평수 · 개점일까지 물으면 아직 아무것도 안 정한 사람이 창을 닫는다' },
      { at: 2, label: '신청 화면에서만 고정 상담 바가 뜨지 않는다' },
    ],
    data: [
      '@winpilot/store · FRANCHISE_COSTS · FRANCHISE_STEPS · INTERIOR_PER_PYEONG',
      '@winpilot/store · FNB_FAQS (audience = 창업)',
      '@winpilot/store · STORE_REGIONS · FRANCHISE_BUDGETS',
    ],
    exits: ['상권 조사 — 안 된다고 말씀드리는 경우가 실제로 있다'],
  },
  {
    id: 'support',
    title: '묻기 전에 읽기',
    purpose: '전화가 오기 전에 읽히게 한다. 답하는 사람이 달라 손님 길과 점주 길이 여기서도 갈린다.',
    entries: ['홈의 공지 한 줄', '헤더의 고객센터'],
    steps: ['공지사항', '자주 묻는 질문', '창구로 전화'],
    branches: [
      {
        after: 0,
        question: '내 물음이 공지에 있나',
        pass: '있음',
        block: '자주 묻는 질문으로 넘어간다',
        blockLabel: '아니오',
      },
      {
        after: 1,
        question: '드시러 오시는 분의 물음인가',
        pass: '손님',
        block: '창업 개설문의로 보낸다 — 가맹 담당이 답할 물음이다',
        blockLabel: '창업',
      },
    ],
    exceptions: [{ at: 0, label: '고정한 공지가 날짜를 이긴다. 켜 두고 잊으면 반년 지난 글이 첫 줄에 남는다' }],
    data: ['@winpilot/store · FNB_NOTICES', '@winpilot/store · FNB_FAQS', '@winpilot/store · FNB_BRAND (창구 둘)'],
    exits: ['손님 문의 번호로', '창업 상담 번호로'],
  },
];

/**
 * 공통 상호작용 — **어느 화면에서나 같은 것**.
 *
 * 화면마다 되풀이해 적으면 열네 벌이 되고, 열네 벌은 한 번에 고쳐지지 않는다. 여기 한 벌만 둔다.
 */
export const COMMON_FLOWS: NamedFlow[] = [
  {
    id: 'navigation',
    title: '내비게이션',
    purpose: '헤더 일곱은 어느 화면에서나 같고, 갈래 안에서만 탭이나 왼쪽 기둥이 더해진다.',
    entries: ['어느 화면에서든'],
    steps: ['헤더에서 갈래 일곱 중 하나를 고른다', '그 갈래의 화면', '갈래 안에서 탭이나 왼쪽 기둥으로 옮긴다'],
    branches: [
      {
        after: 1,
        question: '그 갈래 아래에 화면이 여럿인가',
        pass: '창업 · 고객센터',
        block: '갈래 자체가 링크다 — 하나짜리 펼침판은 한 단계를 더 시키는 셈이다',
        blockLabel: '하나뿐',
      },
    ],
    exceptions: [
      { at: 0, label: '펼침판이 없다. 갈래마다 화면이 하나씩이라 마우스를 올릴 때마다 링크 하나만 보이고 닫힌다' },
      { at: 0, label: '헤더에 단추가 없다. 갈래가 일곱이 되면서 채움 단추 하나가 여덟째 항목처럼 읽혔다' },
      { at: 2, label: '창업은 가운데 밑줄 탭 셋, 고객센터는 본문 왼쪽 기둥 둘이다 — 저쪽은 읽는 차례라 지금 어느 단계인지가 드러나야 한다' },
    ],
    data: ['lib/navigation.ts · SITE_NAV · FRANCHISE_NAV · SUPPORT_NAV · FOOTER_NAV · LEGAL_NAV'],
    exits: ['로고를 누르면 홈으로', '푸터에서 헤더에 없는 것까지 편다'],
  },
  {
    id: 'apply-bar',
    title: '고정 상담 바',
    purpose: '다 읽은 사람이 손을 뻗는 자리에 늘 있게 한다. 헤더에서 뺀 단추가 여기 있다.',
    entries: ['어느 화면에서든 화면 아래에 붙어 따라온다'],
    steps: ['화면을 끝까지 읽는다', '바에서 창업 상담 신청이나 번호를 고른다'],
    branches: [
      {
        after: 0,
        question: '지금 신청 화면인가',
        pass: '아니오',
        block: '바가 뜨지 않는다 — 이미 온 사람에게는 양식을 가리는 방해물이다',
        blockLabel: '예',
      },
      {
        after: 1,
        question: '화면이 넓은가',
        pass: '넓다',
        block: '번호를 접고 단추만 남긴다. 붙어 서면 둘 다 눌리기 어려워진다',
        blockLabel: '좁다',
      },
    ],
    exceptions: [
      { at: 1, label: '손님 번호가 아니라 창업 상담 번호다. 하나로 두면 창업 전화가 매장으로 간다' },
      { at: 1, label: '푸터 맨 아랫줄이 바에 가리지 않게 그만큼 자리를 비워 둔다' },
    ],
    data: ['@winpilot/store · FNB_BRAND (창업 상담 번호)'],
    exits: ['가맹점 상담 신청으로', '전화 걸기'],
  },
  {
    id: 'fold',
    title: '접었다 펴는 목록',
    purpose: '공지사항 · 고객센터 FAQ · 창업 개설문의 셋이 같은 것을 쓴다 — 여기서 하는 일은 읽는 것이 아니라 찾는 것이다.',
    entries: ['글이 열을 넘고 본문이 긴 목록'],
    steps: ['제목만 세로로 늘어선 것을 훑는다', '읽을 것 하나를 누른다', '앞서 열려 있던 것이 닫힌다'],
    branches: [
      {
        after: 1,
        question: '이미 열린 것을 눌렀나',
        pass: '예',
        block: '새로 연 것이 펴지고 앞의 것이 닫힌다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '공지사항만 맨 위 하나를 펴 둔 채로 연다 — 붙여 둔 글이 오는 자리다' },
      { at: 2, label: '접힌 본문은 지우지 않고 높이를 0 으로 접되 낭독기와 탭 이동에서는 빠진다' },
      { at: 2, label: '메뉴판과 매장 목록에는 쓰지 않는다. 거기서는 카드 하나가 그 자체로 보여 줄 것이다' },
    ],
    data: ['@winpilot/store · FNB_NOTICES · FNB_FAQS'],
    exits: ['열린 글은 늘 눈에 보이는 자리에 있다'],
  },
  {
    id: 'empty',
    title: '빈 상태와 못 불러온 것',
    purpose: '무엇이 왜 없는지와 다음에 할 것을 늘 같은 자리에 둔다.',
    entries: ['조건에 맞는 것이 0건', '아직 올라온 것이 없음', '밖에서 받아 오는 것이 실패'],
    steps: ['어떤 종류인지 가른다', '같은 자리에 안내를 그린다', '다음에 할 것을 함께 적는다'],
    branches: [
      {
        after: 0,
        question: '우리 값이 비어 있는 것인가',
        pass: '비었음',
        block: '지도처럼 밖에서 받아 오는 것이면 무엇이 없어서 안 뜨는지와 어디에 넣으면 되는지를 적는다',
        blockLabel: '밖의 문제',
      },
    ],
    exceptions: [
      { at: 1, label: '빈 회색 상자를 두지 않는다. 사이트가 아직 안 만들어졌다는 인상을 준다' },
      { at: 1, label: '없는 값 자리를 비워 두지 않는다 — 준비중 매장의 번호 자리에는 여는 달이 선다' },
      { at: 2, label: '사진이 없는 자리는 문어 그림과 이름 첫 글자가 대신한다' },
    ],
    data: [],
    exits: ['조건을 지우는 길로', '다른 갈래로'],
  },
];

export function findFlow(screen: string): ScreenFlow | undefined {
  return FLOW_SPECS.find((flow) => flow.screen === screen);
}

/** 매니페스트에 있는데 흐름이 없는 화면. 문서가 화면을 따라가지 못한 자리다. */
export function missingFlows(): string[] {
  return pages.filter((page) => !findFlow(page.id)).map((page) => page.id);
}

/** 흐름에는 적혀 있는데 매니페스트에 없는 화면. 지운 화면이 남은 자리다. */
export function unknownFlows(): string[] {
  const real = new Set(pages.map((page) => page.id));
  return FLOW_SPECS.map((flow) => flow.screen).filter((screen) => !real.has(screen));
}
