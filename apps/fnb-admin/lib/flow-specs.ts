// `@/` 별칭 대신 상대 경로를 쓴다 — 이 모듈은 Next 밖(문서 생성 스크립트)에서도 읽힌다.
import { pages } from '../pages.manifest';

/**
 * 화면별 흐름 — 어드민.
 *
 * `screen-specs.ts` 가 **한 화면 안에 무엇이 있는지**를 적는다면, 여기는 **그 화면을 어떤 차례로
 * 밟는지**를 적는다. 둘을 한 파일에 두면 목적·필드·검증 사이에 순서가 끼어들어 어느 쪽도
 * 훑어지지 않는다. 그래서 같은 `screen` id 로 나란히 두고 파일만 나눴다.
 *
 * 흐름의 근거는 전부 `screen-specs.ts` 다. 여기서 새 규칙을 만들지 않는다 — 만들면 같은 화면의
 * 가드가 두 곳에서 갈린다. `branches` 의 물음은 그 화면의 `guards`·`validations` 를,
 * `exits` 는 `buttons` 의 `onSuccess` 를 흐름의 말로 옮긴 것이다.
 *
 * 도면은 mermaid 로 그린다. 그래서 문자열에 큰따옴표·파이프·꺾쇠를 넣지 않는다 — 메뉴 경로도
 * 이 저장소가 이미 쓰는 가운뎃점(`·`)으로 잇는다.
 *
 * ## 고객 화면 연동
 * 어드민은 고객 화면이 읽는 값의 **원본**이다. 그래서 흐름의 끝(`exits`)에 무엇이 고객 화면
 * 어디에 나타나는지를 함께 적는다. 흐름 도면만 보고도 "이 저장이 밖으로 나가는 저장인지" 가
 * 갈려야 한다. 다만 이 프로젝트에는 **서버가 없다** — `data` 에는 실제로 있는 것(공유 시드
 * `@winpilot/store`, 화면 안 상태, 주소의 id)만 적는다.
 *
 * 이 콘솔의 목록은 검색과 거르개를 **주소에 두지 않는다.** 그래서 `data` 에 질의문자열을 적지
 * 않는다 — 적어 두면 도면을 보고 만드는 사람이 없는 규칙을 구현한다.
 */

/** 갈림길 — 마름모로 그린다. `after` 번째 단계 **뒤**에 놓인다(0부터). */
export type FlowBranch = {
  /** 이 갈림길이 매달리는 앞 단계 번호. 한 단계 뒤에 갈림길은 하나만 둔다. */
  after: number;
  /** 마름모 안에 들어가는 물음 한 마디 */
  question: string;
  /** 통과 간선에 붙는 짧은 말. 기본 `예` */
  pass?: string;
  /** 막혔을 때 가는 곳 — 점선으로 갈린다 */
  block: string;
  /** 막힘 간선에 붙는 짧은 말. 기본 `아니오` */
  blockLabel?: string;
};

/** 예외 — `at` 번째 단계에서 점선으로 갈린다(0부터). */
export type FlowException = {
  /** 이 예외가 걸리는 단계 번호 */
  at: number;
  /** 그 자리에서 실제로 일어나는 일 */
  label: string;
};

export type FlowBody = {
  /** 이 화면으로 들어오는 길 */
  entries: string[];
  /** 화면 안에서 밟는 차례 — 동작 위주로 3~6개 */
  steps: string[];
  /** 단계 사이의 갈림길 */
  branches: FlowBranch[];
  /** 단계에서 갈리는 예외 */
  exceptions: FlowException[];
  /** 값이 오는 곳 — 원통으로 그린다 */
  data: string[];
  /** 흐름이 끝나고 가는 곳 */
  exits: string[];
};

/** 매니페스트의 화면 하나에 붙는 흐름. `screen` 은 `pages.manifest.ts` 의 id 와 같다. */
export type ScreenFlow = FlowBody & { screen: string };

/** 화면에 매이지 않는 흐름(여정·공통). 주소 한 마디가 되므로 `id` 는 소문자 영문만 쓴다. */
export type NamedFlow = FlowBody & { id: string; title: string; purpose: string };

export const FLOW_SPECS: ScreenFlow[] = [
  {
    screen: 'dashboard',
    entries: ['콘솔을 열면 바로', '사이드바 대시보드'],
    steps: [
      '요약 카드 여섯으로 오늘 수치를 훑는다',
      '색이 붙은 카드가 있는지 본다',
      '답을 기다리는 문의에서 오래된 것을 연다',
      '사이트에 걸린 공지를 확인한다',
    ],
    branches: [
      {
        after: 1,
        question: '색이 붙은 카드가 있나',
        block: '밀린 것이 없다 — 아래 목록만 훑고 끝낸다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '매출 숫자를 두지 않는다 — POS 와 배달앱이 갖고 있어 옮겨 오면 두 곳의 숫자가 달라진다' },
      { at: 1, label: '색이 붙는 카드는 둘뿐이다 — 답하지 않은 창업 문의와 셋을 넘긴 팝업' },
      { at: 3, label: '오늘 날짜를 화면이 정해서 넘긴다 — 조각 안에서 부르면 빌드한 날이 굳는다' },
    ],
    data: [
      '@winpilot/store · FRANCHISE_INQUIRIES',
      '@winpilot/store · STORES · MENU_ITEMS',
      '@winpilot/store · FNB_BANNERS · FNB_POPUPS · bannerState()',
      '@winpilot/store · FNB_NOTICES',
    ],
    exits: ['창업 문의 상세로 — 답을 기다리는 건을 바로 연다', '수치를 만든 그 목록으로'],
  },
  {
    screen: 'menus',
    entries: ['사이드바 등록 · 메뉴', '대시보드 내려 둔 메뉴 카드에서'],
    steps: [
      '묶음과 상태로 거른다',
      '메뉴명이나 설명으로 검색한다',
      '알레르기가 빈 줄이 있는지 훑는다',
      '줄을 눌러 상세로 가거나 등록으로 간다',
    ],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 메뉴가 있나',
        block: '조건에 맞는 메뉴가 없다는 한 줄을 대신 그린다',
        blockLabel: '아니오',
      },
      {
        after: 3,
        question: '삭제를 눌렀나',
        pass: '예',
        block: '상세나 등록으로 넘어간다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '알레르기가 빈 줄은 빈 칸이 아니라 없음 이라 적는다 — 해당 없음인지 안 적은 것인지 갈려야 한다' },
      { at: 3, label: '확인 창에 값도 함께 지워진다고 적는다. 잠시 안 파는 것이면 지우지 말고 내려 둔다' },
    ],
    data: ['@winpilot/store · MENU_ITEMS · MENU_CATEGORIES', '화면 안 검색어와 거르개'],
    exits: [
      '상세로 — /menus/[menuId]',
      '등록으로 — /menus/new',
      '묶음으로 — /menus/categories',
    ],
  },
  {
    screen: 'menus-detail',
    entries: ['메뉴 목록에서 줄을 눌러'],
    steps: [
      '이미 넣은 값이 채워진 폼을 본다',
      '이름 · 묶음 · 값 · 열량 · 설명을 고친다',
      '알레르기를 정해진 목록에서 켜고 끈다',
      '표와 매운 정도를 고른다',
      '메뉴판 노출을 정하고 저장을 누른다',
    ],
    branches: [
      {
        after: 1,
        question: '값과 열량이 숫자뿐인가',
        block: '숫자만 받는다고 그 칸 아래에 적는다 — 쉼표와 원은 화면이 붙인다',
        blockLabel: '아니오',
      },
      {
        after: 4,
        question: '확인 창에서 저장을 다시 눌렀나',
        block: '창을 닫고 고친 값을 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '목록에 없는 재료는 화면에서 만들지 못한다 — 같은 재료가 두 이름으로 쌓인다' },
      { at: 2, label: '하나도 안 고르면 그것이 의도인지 한 줄 묻는다. 저장은 막지 않는다' },
      { at: 4, label: '노출을 꺼도 상세 주소는 열린다 — 지금 팔지 않는다고 적힌다' },
    ],
    data: ['@winpilot/store · MENU_ITEMS · MENU_CATEGORIES', '주소의 menuId'],
    exits: ['저장한 값이 사이트 메뉴판 /menu 와 그 메뉴의 상세 화면에 그대로 나간다', '메뉴 목록으로'],
  },
  {
    screen: 'menus-new',
    entries: ['메뉴 목록 툴바의 메뉴 등록 단추'],
    steps: [
      '빈 폼을 연다',
      '이름 · 묶음 · 값 · 열량 · 설명을 넣는다',
      '알레르기를 고른다',
      '표와 매운 정도를 고른다',
      '등록을 누른다',
    ],
    branches: [
      {
        after: 1,
        question: '값과 열량이 숫자뿐이고 이름과 설명이 찼나',
        block: '확인이 필요한 칸의 개수와 이름을 토스트에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '노출이 꺼진 채로 열린다 — 등록하다 만 것이 메뉴판에 바로 서지 않게' },
      { at: 0, label: '코드는 저장할 때 매겨진다. 미리 보여 주면 저장하지 않고 나간 코드가 생긴다' },
      { at: 4, label: '빈 값은 store 의 blankMenuItem() 이 준다 — 화면이 객체를 손으로 적으면 새 칸을 빠뜨린다' },
    ],
    data: ['@winpilot/store · MENU_CATEGORIES', '@winpilot/store · blankMenuItem()'],
    exits: ['메뉴 목록으로 — 새 메뉴는 내림 상태로 들어간다', '상세에서 노출을 켜야 메뉴판에 선다'],
  },
  {
    screen: 'menus-categories',
    entries: ['사이드바 등록 · 메뉴에서 옆 화면으로'],
    steps: [
      '먹는 순서대로 늘어선 넷을 읽는다',
      '묶음마다 몇 가지가 판매중인지 센다',
      '내려 둔 것이 있는 묶음을 찾는다',
    ],
    branches: [
      {
        after: 2,
        question: '내려 둔 것이 있나',
        pass: '예',
        block: '고칠 것이 없다 — 메뉴 목록으로 돌아간다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '순서를 바꾸는 자리가 없다 — 넷의 차례는 취향이 아니라 먹는 순서다' },
      { at: 0, label: '묶음을 늘리고 줄이는 일도 여기서 하지 않는다. 넣을 메뉴가 없으면 메뉴판에 빈 제목만 선다' },
    ],
    data: ['@winpilot/store · MENU_CATEGORIES · MENU_ITEMS'],
    exits: ['메뉴 목록으로 — 내려 둔 것을 찾아 연다', '같은 화면에 머문다 — 읽기만 하는 자리다'],
  },
  {
    screen: 'marketing',
    entries: ['사이드바 등록 · 마케팅'],
    steps: [
      '창구와 상태로 거른다',
      '제목이나 설명으로 검색한다',
      '올린 날 차례가 실제와 맞는지 본다',
      '줄을 눌러 상세로 가거나 등록으로 간다',
    ],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 글이 있나',
        block: '조건에 맞는 글이 없다는 한 줄을 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '창구가 첫 칸이다 — 이 목록에서 가장 먼저 판단하는 것이 그것이다' },
      { at: 3, label: '잠시 내리는 것이라면 지우지 말고 숨김으로 둔다' },
    ],
    data: ['@winpilot/store · MARKETING_POSTS · MARKETING_CHANNELS', '화면 안 검색어와 거르개'],
    exits: ['상세로 — /marketing/[postId]', '등록으로 — /marketing/new'],
  },
  {
    screen: 'marketing-detail',
    entries: ['마케팅 목록에서 줄을 눌러'],
    steps: [
      '이미 적은 값이 채워진 폼을 본다',
      '창구와 올린 날을 고친다',
      '제목과 설명을 고친다',
      '공개를 정하고 저장을 누른다',
    ],
    branches: [
      {
        after: 1,
        question: '올린 날이 2026-08-05 꼴인가',
        block: '받는 모양을 그 칸 아래에 적는다',
        blockLabel: '아니오',
      },
      {
        after: 3,
        question: '확인 창에서 저장을 다시 눌렀나',
        block: '창을 닫고 고친 값을 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '설명이 60자를 넘으면 세어 알리되 막지 않는다 — 카드에서 두 줄을 넘길 수 있다' },
      { at: 2, label: '사진을 올리는 칸이 없다. 제목 첫 글자가 사진 자리를 대신한다' },
    ],
    data: ['@winpilot/store · MARKETING_POSTS · MARKETING_CHANNELS', '주소의 postId'],
    exits: ['저장한 값이 사이트 마케팅 /marketing 의 창구별 카드로 나간다', '마케팅 목록으로'],
  },
  {
    screen: 'marketing-new',
    entries: ['마케팅 목록 툴바의 글 등록 단추'],
    steps: [
      '빈 폼을 연다',
      '창구를 고른다',
      '실제 그 창구에 올린 날을 적는다',
      '제목과 설명을 넣는다',
      '등록을 누른다',
    ],
    branches: [
      {
        after: 3,
        question: '제목 · 설명이 찼고 올린 날 모양이 맞나',
        block: '확인이 필요한 칸의 개수와 이름을 토스트에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '공개가 꺼진 채로 열린다' },
      { at: 2, label: '저장 시각을 자동으로 박지 않는다 — 창구에 올린 날과 옮겨 적는 날이 다른 것이 보통이다' },
    ],
    data: ['@winpilot/store · MARKETING_CHANNELS', '@winpilot/store · blankMarketingPost()'],
    exits: ['마케팅 목록으로 — 새 글은 숨김으로 들어간다', '상세에서 공개를 켜야 사이트에 선다'],
  },
  {
    screen: 'stores',
    entries: ['사이드바 등록 · 가맹점', '대시보드 문 여는 가맹점 카드에서'],
    steps: [
      '지역과 상태로 거른다',
      '매장명이나 주소로 검색한다',
      '영업시간과 되는 것을 훑는다',
      '줄을 눌러 상세로 가거나 등록으로 간다',
    ],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 매장이 있나',
        block: '조건에 맞는 매장이 없다는 한 줄을 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '휴점 매장은 사이트에서만 빠지고 이 목록에는 남는다 — 다시 열 때 주소와 번호가 필요하다' },
      { at: 2, label: '목록에는 번호 대신 영업시간을 세운다. 준비중 매장에는 번호가 아예 없다' },
    ],
    data: ['@winpilot/store · STORES · STORE_REGIONS', '화면 안 검색어와 거르개'],
    exits: ['상세로 — /stores/[storeId]', '등록으로 — /stores/new'],
  },
  {
    screen: 'stores-detail',
    entries: ['가맹점 목록에서 줄을 눌러'],
    steps: [
      '이미 적은 값이 채워진 폼을 본다',
      '상태를 고른다',
      '주소 · 전화 · 개점 연월 · 영업시간을 고친다',
      '되는 것을 켜고 끈다',
      '저장을 누른다',
    ],
    branches: [
      {
        after: 1,
        question: '상태가 준비중인가',
        pass: '예',
        block: '전화가 필수가 된다 — 비면 저장하지 못한다',
        blockLabel: '아니오',
      },
      {
        after: 2,
        question: '개점 연월이 2026-09 꼴인가',
        block: '연-월로 적어 달라고 그 칸 아래에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '준비중이면 번호를 비워 둔다. 없는 번호를 적으면 그리로 전화가 간다' },
      { at: 3, label: '되는 것은 정해진 다섯에서만 고른다 — 매장마다 다르게 적히면 거르지도 견주지도 못한다' },
    ],
    data: ['@winpilot/store · STORES · STORE_REGIONS', '주소의 storeId'],
    exits: ['저장한 값이 사이트 매장안내 /stores 에 그대로 나간다', '가맹점 목록으로'],
  },
  {
    screen: 'stores-new',
    entries: ['가맹점 목록 툴바의 가맹점 등록 단추'],
    steps: [
      '준비중으로 열린 빈 폼을 본다',
      '매장명 · 지역 · 주소를 넣는다',
      '개점 연월과 영업시간을 넣는다',
      '되는 것을 고른다',
      '등록을 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '매장명 · 주소 · 영업시간이 찼고 개점 연월 모양이 맞나',
        block: '확인이 필요한 칸의 개수와 이름을 토스트에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '새 가맹점은 준비중으로 열린다 — 등록하는 시점이 대개 공사 중이다' },
      { at: 0, label: '준비중이라 전화가 필수가 아니다. 사이트에는 번호 없이 여는 달만 선다' },
    ],
    data: ['@winpilot/store · STORE_REGIONS', '@winpilot/store · blankStore()'],
    exits: ['가맹점 목록으로 — 새 매장은 준비중으로 들어간다', '사이트 매장안내 /stores 에 준비중으로 선다'],
  },
  {
    screen: 'inquiries',
    entries: ['사이드바 창업 · 문의 내역', '대시보드 답하지 않은 창업 문의 카드에서'],
    steps: [
      '상태와 지역으로 거른다',
      '신청자 · 연락처 · 내용으로 검색한다',
      '접수된 채로 남은 것을 찾는다',
      '줄을 눌러 상세를 연다',
    ],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 문의가 있나',
        block: '조건에 맞는 문의가 없다는 한 줄을 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '처음에 접수만 걸어 두지 않는다 — 상담 중인 건이 화면에서 사라지면 아무도 안 보는 채로 남는다' },
      { at: 3, label: '지우는 자리가 없다. 손님이 남긴 것이라 지우면 언제 무엇을 물었는지가 사라진다' },
    ],
    data: ['@winpilot/store · FRANCHISE_INQUIRIES · STORE_REGIONS', '화면 안 검색어와 거르개'],
    exits: ['상세로 — /inquiries/[inquiryId]'],
  },
  {
    screen: 'inquiries-detail',
    entries: ['창업 문의 목록에서 줄을 눌러', '대시보드에서 답을 기다리는 건을 바로 열어'],
    steps: [
      '신청자가 남긴 것을 읽는다',
      '전화를 걸어 이야기한다',
      '상담 메모에 알게 된 것을 적는다',
      '상태를 바꾸고 저장을 누른다',
    ],
    branches: [
      {
        after: 3,
        question: '통화를 시작했나',
        pass: '예',
        block: '상태를 접수로 둔 채 메모만 남긴다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '성함 · 연락처 · 지역 · 예산 · 하고 싶은 말은 못 고친다 — 덮어쓰면 원본이 사라진다' },
      { at: 2, label: '다음에 이 건을 여는 사람이 읽는다. 무엇을 약속했는지까지 적는다' },
      { at: 3, label: '상태와 메모가 한 카드에 있다 — 나누면 한쪽만 저장한 채 화면을 떠난다' },
    ],
    data: ['@winpilot/store · FRANCHISE_INQUIRIES', '주소의 inquiryId'],
    exits: ['같은 화면에 머문다 — 결과만 토스트로 알린다', '대시보드의 밀린 건수가 이 상태를 센다'],
  },
  {
    screen: 'franchise-faqs',
    entries: ['사이드바 창업 · FAQ'],
    steps: [
      '분류와 상태로 거른다',
      '질문이나 답으로 검색한다',
      '답이 옛말인 줄이 있는지 훑는다',
      '줄을 눌러 상세로 가거나 등록으로 간다',
    ],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 질문이 있나',
        block: '조건에 맞는 질문이 없다는 한 줄을 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '이 화면은 창업 갈래만 보여 준다 — 답하는 사람이 손님 물음과 다르다' },
      { at: 2, label: '답을 질문보다 넓게 세운다. 값이 오르면 창업 비용을 적은 답도 함께 고쳐야 한다' },
    ],
    data: ['@winpilot/store · FNB_FAQS (audience 창업) · FAQ_TOPICS', '화면 안 검색어와 거르개'],
    exits: ['상세로 — /franchise/faqs/[faqId]', '등록으로 — /franchise/faqs/new'],
  },
  {
    screen: 'franchise-faqs-detail',
    entries: ['창업 FAQ 목록에서 줄을 눌러'],
    steps: [
      '누가 묻나가 창업으로 적힌 것을 확인한다',
      '분류를 고른다',
      '질문과 답을 고친다',
      '공개를 정하고 저장을 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '질문과 답이 다 찼나',
        block: '확인이 필요한 칸의 개수와 이름을 토스트에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '누가 묻나는 화면이 정해서 넘긴 값이라 고를 수 없다 — 고를 수 있게 두면 잘못 고른다' },
      { at: 2, label: '질문이 물음표로 끝나지 않으면 알린다. 막지는 않는다' },
      { at: 2, label: '답의 길이를 재지 않는다 — 사이트에서 접혀 있다가 펴지는 자리다' },
    ],
    data: ['@winpilot/store · FNB_FAQS · FAQ_TOPICS', '주소의 faqId'],
    exits: ['저장한 값이 사이트 가맹점 개설문의 /franchise/faq 에 나간다', '창업 FAQ 목록으로'],
  },
  {
    screen: 'franchise-faqs-new',
    entries: ['창업 FAQ 목록 툴바의 질문 등록 단추', '문의 상세에서 같은 물음이 되풀이될 때'],
    steps: [
      '갈래가 창업으로 고정된 빈 폼을 연다',
      '분류를 고른다',
      '질문과 답을 넣는다',
      '등록을 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '질문과 답이 다 찼나',
        block: '확인이 필요한 칸의 개수와 이름을 토스트에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '공개가 꺼진 채로 열린다' },
      { at: 0, label: '갈래를 화면이 넘긴다 — 여기서 만든 글이 손님 목록에 서면 안 된다' },
    ],
    data: ['@winpilot/store · FAQ_TOPICS', '@winpilot/store · blankFnbFaq(창업)'],
    exits: ['창업 FAQ 목록으로 — 새 글은 숨김으로 들어간다', '상세에서 공개를 켜야 사이트에 선다'],
  },
  {
    screen: 'franchise-cost',
    entries: ['사이드바 창업 · 비용 · 절차', '창업 상담 전화를 받았을 때'],
    steps: [
      '비용 항목과 합계를 읽는다',
      '무엇이 빠져 있는지 같은 줄에서 확인한다',
      '개점까지의 차례와 기간을 읽는다',
    ],
    branches: [
      {
        after: 1,
        question: '사이트에 적힌 값과 다른가',
        pass: '예',
        block: '그대로 상담을 이어 간다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '여기서 고치지 못한다 — 정보공개서에 신고한 값이라 사이트만 바뀌면 가맹사업법 문제가 된다' },
      { at: 0, label: '인테리어 금액은 평당 단가에서 계산해 낸다 — 두 곳에 적으면 한쪽만 옛 숫자로 남는다' },
      { at: 2, label: '값을 바꾸는 일은 신고를 함께 갱신할 때 코드에서 한다' },
    ],
    data: ['@winpilot/store · FRANCHISE_COSTS · FRANCHISE_STEPS · INTERIOR_PER_PYEONG'],
    exits: [
      '같은 화면에 머문다 — 읽기만 하는 자리다',
      '사이트 창업안내 /franchise 와 인테리어 /interior 가 같은 값을 보여 준다',
    ],
  },
  {
    screen: 'support-faqs',
    entries: ['사이드바 고객센터 · FAQ'],
    steps: [
      '분류와 상태로 거른다',
      '질문이나 답으로 검색한다',
      '답이 옛말인 줄이 있는지 훑는다',
      '줄을 눌러 상세로 가거나 등록으로 간다',
    ],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 질문이 있나',
        block: '조건에 맞는 질문이 없다는 한 줄을 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '이 화면은 손님 갈래만 보여 준다 — 창업 물음은 가맹 담당이, 손님 물음은 매장 담당이 답한다' },
      { at: 3, label: '당분간 안 쓰는 것이라면 지우지 말고 숨김으로 둔다' },
    ],
    data: ['@winpilot/store · FNB_FAQS (audience 손님) · FAQ_TOPICS', '화면 안 검색어와 거르개'],
    exits: ['상세로 — /support/faqs/[faqId]', '등록으로 — /support/faqs/new'],
  },
  {
    screen: 'support-faqs-detail',
    entries: ['고객센터 FAQ 목록에서 줄을 눌러'],
    steps: [
      '누가 묻나가 손님으로 적힌 것을 확인한다',
      '분류를 고른다',
      '질문과 답을 고친다',
      '공개를 정하고 저장을 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '질문과 답이 다 찼나',
        block: '확인이 필요한 칸의 개수와 이름을 토스트에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '누가 묻나는 화면이 정해서 넘긴 값이라 고를 수 없다' },
      { at: 2, label: '회사가 부르는 이름으로 적지 않는다 — 그 말은 검색에 걸리지 않는다' },
    ],
    data: ['@winpilot/store · FNB_FAQS · FAQ_TOPICS', '주소의 faqId'],
    exits: ['저장한 값이 사이트 고객센터 /support/faq 에 접힌 목록으로 나간다', '고객센터 FAQ 목록으로'],
  },
  {
    screen: 'support-faqs-new',
    entries: ['고객센터 FAQ 목록 툴바의 질문 등록 단추'],
    steps: [
      '갈래가 손님으로 고정된 빈 폼을 연다',
      '분류를 고른다',
      '질문과 답을 넣는다',
      '등록을 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '질문과 답이 다 찼나',
        block: '확인이 필요한 칸의 개수와 이름을 토스트에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '공개가 꺼진 채로 열린다' },
      { at: 0, label: '갈래를 화면이 넘긴다 — 여기서 만든 글이 창업 목록에 서면 안 된다' },
    ],
    data: ['@winpilot/store · FAQ_TOPICS', '@winpilot/store · blankFnbFaq(손님)'],
    exits: ['고객센터 FAQ 목록으로 — 새 글은 숨김으로 들어간다', '상세에서 공개를 켜야 사이트에 선다'],
  },
  {
    screen: 'support-notices',
    entries: ['사이드바 고객센터 · 공지사항', '대시보드 사이트에 걸린 공지 줄에서'],
    steps: [
      '상태로 거른다',
      '제목이나 본문으로 검색한다',
      '고정한 글이 몇인지 센다',
      '줄을 눌러 상세로 가거나 등록으로 간다',
    ],
    branches: [
      {
        after: 2,
        question: '고정한 글이 하나뿐인가',
        block: '몇 개인지 목록 위에 적고 하나만 남기기를 권한다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '본문을 목록에 세운다 — 제목만 세우면 무엇을 알린 글인지 열어 봐야 안다' },
      { at: 3, label: '지난 공지를 남겨 두려면 지우지 말고 숨김으로 둔다' },
    ],
    data: ['@winpilot/store · FNB_NOTICES', '화면 안 검색어와 거르개'],
    exits: ['상세로 — /support/notices/[noticeId]', '등록으로 — /support/notices/new'],
  },
  {
    screen: 'support-notices-detail',
    entries: ['공지사항 목록에서 줄을 눌러'],
    steps: [
      '이미 쓴 값이 채워진 폼을 본다',
      '제목과 본문을 고친다',
      '올린 날을 고친다',
      '맨 위 고정과 공개를 정하고 저장을 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '올린 날이 2026-08-05 꼴인가',
        block: '받는 모양을 그 칸 아래에 적는다',
        blockLabel: '아니오',
      },
      {
        after: 3,
        question: '이미 고정된 공지가 없나',
        block: '몇 개 있는지 고정 칸 아래에 적는다 — 둘 이상이면 고정의 뜻이 흐려진다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '제목이 34자를 넘으면 홈 띠에서 잘린다고 알린다. 막지는 않는다' },
      { at: 3, label: '고정은 날짜를 이긴다 — 켜 두고 잊으면 반년 지난 글이 첫 줄에 남는다' },
    ],
    data: ['@winpilot/store · FNB_NOTICES', '주소의 noticeId'],
    exits: [
      '저장한 값이 사이트 홈 공지 띠와 고객센터 공지사항 /support/notices 에 나간다',
      '공지사항 목록으로',
    ],
  },
  {
    screen: 'support-notices-new',
    entries: ['공지사항 목록 툴바의 공지 등록 단추'],
    steps: [
      '고정과 공개가 꺼진 빈 폼을 연다',
      '제목과 본문을 넣는다',
      '실제로 알릴 날을 적는다',
      '등록을 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '제목 · 본문이 찼고 올린 날 모양이 맞나',
        block: '확인이 필요한 칸의 개수와 이름을 토스트에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '고정과 공개가 꺼진 채로 열린다 — 적다 만 공지가 홈 띠에 흐르지 않게' },
      { at: 2, label: '저장 시각을 박지 않는다. 미리 적어 두고 나중에 여는 공지가 적어 둔 날짜로 서게 된다' },
    ],
    data: ['@winpilot/store · FNB_NOTICES', '@winpilot/store · blankFnbNotice()'],
    exits: ['공지사항 목록으로 — 새 글은 숨김으로 들어간다', '상세에서 공개를 켜야 홈 띠에 흐른다'],
  },
  {
    screen: 'banners-main',
    entries: ['사이드바 배너 · 메인 비주얼', '대시보드 걸린 배너 카드에서'],
    steps: [
      '상태로 거른다',
      '제목이나 한 줄로 검색한다',
      '기간과 상태를 맞춰 본다',
      '줄을 눌러 상세로 가거나 등록으로 간다',
    ],
    branches: [
      {
        after: 2,
        question: '오늘이 그 기간 안인가',
        block: '예정이나 종료로 적는다 — 사람이 끄지 않아도 오르내린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '상태를 사람이 켜지 않고 날짜가 정한다 — 행사가 끝난 다음 날 아무도 안 끄기 때문이다' },
      { at: 2, label: '그래도 숨김은 따로 있다. 기간과 상관없이 지금 당장 내려야 하는 일이 있다' },
      { at: 3, label: '다음에 또 쓸 배너라면 지우지 말고 숨김으로 둔다' },
    ],
    data: ['@winpilot/store · FNB_BANNERS · bannerState()', '화면이 잡아 둔 오늘 날짜'],
    exits: ['상세로 — /banners/main/[bannerId]', '등록으로 — /banners/main/new'],
  },
  {
    screen: 'banners-main-detail',
    entries: ['메인 비주얼 목록에서 줄을 눌러'],
    steps: [
      '이미 건 배너의 값을 본다',
      '제목과 한 줄을 고친다',
      '가는 곳을 고친다',
      '기간을 고치고 노출을 정한다',
      '저장을 누른다',
    ],
    branches: [
      {
        after: 3,
        question: '시작일이 있고 종료가 시작보다 뒤인가',
        block: '시작이 비면 막고, 기간이 거꾸로면 이대로는 걸리지 않는다고 알린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '가는 곳을 비우면 누를 수 없는 배너가 된다 — 억지로 넣게 하면 눌러도 제자리인 배너가 생긴다' },
      { at: 3, label: '종료를 비우면 상시다. 먼 미래 날짜를 적게 두면 진짜 계획인지 임시인지 알 수 없다' },
      { at: 4, label: '사진을 올리는 칸이 없다 — 저장은 되는데 첫 화면은 그대로인 상태를 만들지 않으려는 것이다' },
    ],
    data: ['@winpilot/store · FNB_BANNERS', '주소의 bannerId'],
    exits: ['메인 비주얼 목록으로 — 기간이 오늘을 덮으면 노출 중으로 바뀐다', '사이트 첫 화면의 배너 자리로'],
  },
  {
    screen: 'banners-main-new',
    entries: ['메인 비주얼 목록 툴바의 배너 등록 단추'],
    steps: [
      '노출이 꺼진 빈 폼을 연다',
      '제목과 한 줄을 넣는다',
      '가는 곳을 넣는다',
      '기간을 정하고 등록을 누른다',
    ],
    branches: [
      {
        after: 3,
        question: '제목이 있고 시작일 모양이 맞나',
        block: '확인이 필요한 칸의 개수와 이름을 토스트에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '노출이 꺼진 채로 열린다 — 등록하다 만 배너가 첫 화면에 바로 서는 것이 가장 흔한 사고다' },
      { at: 3, label: '기간이 거꾸로여도 막지 않는다. 적어 두고 나중에 고치는 일이 실제로 있다' },
    ],
    data: ['@winpilot/store · blankFnbBanner()'],
    exits: ['메인 비주얼 목록으로 — 새 배너는 숨김으로 들어간다', '상세에서 노출을 켜야 첫 화면에 걸린다'],
  },
  {
    screen: 'banners-popups',
    entries: ['사이드바 배너 · 팝업', '대시보드 뜨는 팝업 카드에서'],
    steps: [
      '상태와 닫기로 거른다',
      '제목이나 내용으로 검색한다',
      '지금 뜨는 것이 몇인지 센다',
      '줄을 눌러 상세로 가거나 등록으로 간다',
    ],
    branches: [
      {
        after: 2,
        question: '지금 뜨는 것이 셋 안인가',
        block: '넘은 만큼 내린다 — 넷이면 손님이 넷을 닫고서야 첫 화면에 닿는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '닫기를 열로 세운다 — 매번 뜨는 팝업이 실수로 켜진 채 몇 달을 가는 일이 있다' },
      { at: 2, label: '배너와 같은 색 표를 쓴다. 상태의 뜻이 같으므로 색이 갈리면 오히려 헷갈린다' },
    ],
    data: ['@winpilot/store · FNB_POPUPS · bannerState()', '화면이 잡아 둔 오늘 날짜'],
    exits: ['상세로 — /banners/popups/[popupId]', '등록으로 — /banners/popups/new'],
  },
  {
    screen: 'banners-popups-detail',
    entries: ['팝업 목록에서 줄을 눌러'],
    steps: [
      '이미 띄운 팝업의 값을 본다',
      '제목과 내용을 고친다',
      '기간을 고친다',
      '하루 감추기와 노출을 정하고 저장을 누른다',
    ],
    branches: [
      {
        after: 3,
        question: '하루 감추기를 켜 두나',
        pass: '예',
        block: '올 때마다 뜬다 — 반드시 읽혀야 하는 것에만 쓰라고 그 자리에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '내용이 120자를 넘으면 세어 알린다. 길면 읽지 않고 닫는다' },
      { at: 3, label: '매번 뜨는 팝업은 읽지 않고 닫는 습관을 만든다 — 그러면 다음 팝업도 안 읽힌다' },
      { at: 3, label: '기간이 거꾸로면 켜 두어도 뜨지 않는다고 알린다' },
    ],
    data: ['@winpilot/store · FNB_POPUPS', '주소의 popupId'],
    exits: ['팝업 목록으로 — 기간이 오늘을 덮으면 노출 중으로 바뀐다', '사이트 홈의 팝업 자리로'],
  },
  {
    screen: 'banners-popups-new',
    entries: ['팝업 목록 툴바의 팝업 등록 단추'],
    steps: [
      '노출이 꺼지고 하루 감추기가 켜진 빈 폼을 연다',
      '제목과 내용을 넣는다',
      '기간을 정한다',
      '등록을 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '제목 · 내용이 찼고 시작일 모양이 맞나',
        block: '확인이 필요한 칸의 개수와 이름을 토스트에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '하루 감추기가 켜진 채로 열린다 — 끄는 것은 무거운 결정이라 한 번 더 고르게 한다' },
      { at: 0, label: '노출이 꺼진 채로 열린다' },
    ],
    data: ['@winpilot/store · blankFnbPopup()'],
    exits: ['팝업 목록으로 — 새 팝업은 숨김으로 들어간다', '상세에서 노출을 켜야 사이트에 뜬다'],
  },
  {
    screen: 'settings-brand',
    entries: ['사이드바 설정 · 브랜드 정보'],
    steps: [
      '고칠 수 없는 값과 고칠 수 있는 값을 나눠 본다',
      '한 줄 소개를 고친다',
      '손님 문의와 창업 상담 번호를 나눠 적는다',
      '이메일과 본사 주소를 고치고 저장을 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '두 창구가 다른 번호인가',
        block: '나눠 둔 뜻이 사라진다고 알린다 — 같은 번호가 맞다면 그대로 저장한다',
        blockLabel: '아니오',
      },
      {
        after: 3,
        question: '이메일이 아이디와 도메인 모양인가',
        block: '메일 주소를 정확히 적어 달라고 그 칸 아래에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '브랜드명 · 대표이사 · 사업자등록번호는 고칠 수 없다 — 사이트에만 새 이름이 서는 일을 막는다' },
      { at: 2, label: '하나로 두면 창업 전화가 매장 번호로 가고, 받는 사람은 답할 수 없는 것을 묻는 사람과 통화한다' },
    ],
    data: ['@winpilot/store · FNB_BRAND'],
    exits: [
      '같은 화면에 머문다 — 목록이 없어 돌아갈 곳이 없다',
      '사이트 첫 화면 · 푸터 · 약관 문의처에 그대로 나간다',
    ],
  },
  {
    screen: 'settings-admins',
    entries: ['사이드바 설정 · 관리자'],
    steps: [
      '권한과 상태로 거른다',
      '이름이나 이메일로 검색한다',
      '마지막 접속이 오래된 줄을 찾는다',
      '줄을 눌러 상세로 가거나 등록으로 간다',
    ],
    branches: [
      {
        after: 2,
        question: '오래 안 들어온 계정이 있나',
        pass: '예',
        block: '정리할 것이 없다 — 목록만 훑고 끝낸다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '접속한 적이 없는 계정은 빈 칸이 아니라 접속 없음 이라 적는다' },
      { at: 3, label: '나간 사람은 지우지 말고 정지로 둔다 — 지우면 무엇을 고쳤는지가 함께 사라진다' },
    ],
    data: ['@winpilot/store · FNB_ADMINS · ADMIN_ROLES', '화면 안 검색어와 거르개'],
    exits: ['상세로 — /settings/admins/[adminId]', '등록으로 — /settings/admins/new'],
  },
  {
    screen: 'settings-admins-detail',
    entries: ['관리자 목록에서 줄을 눌러'],
    steps: [
      '마지막 접속과 계정 번호를 본다',
      '이름과 이메일을 고친다',
      '권한을 고른다',
      '로그인 허용을 정하고 저장을 누른다',
    ],
    branches: [
      {
        after: 3,
        question: '살아 있는 대표가 이 사람 말고 또 있나',
        block: '마지막 대표라 권한을 내리거나 정지할 수 없다 — 다른 분을 대표로 올린 뒤에 바꾼다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '이메일을 잠그지 않는다 — 잠그면 도메인이 바뀔 때 한 사람이 두 줄로 남는다' },
      { at: 2, label: '권한마다 무엇을 할 수 있는지 고르는 자리 바로 아래에 적는다' },
      { at: 3, label: '확인 창의 말이 다르다 — 사이트가 아니라 이 사람이 콘솔에서 할 수 있는 것이 바뀐다' },
    ],
    data: ['@winpilot/store · FNB_ADMINS · ADMIN_ROLES', '주소의 adminId'],
    exits: ['관리자 목록으로 — 정지한 계정도 지우지 않고 상태만 글자로 바뀐다', '사이트에는 나가지 않는다'],
  },
  {
    screen: 'settings-admins-new',
    entries: ['관리자 목록 툴바의 계정 등록 단추'],
    steps: [
      '권한이 조회로 열린 빈 폼을 연다',
      '이름과 이메일을 넣는다',
      '필요하면 권한을 넓힌다',
      '등록을 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '이름이 있고 이메일 모양이 맞나',
        block: '확인이 필요한 칸의 개수와 이름을 토스트에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '가장 좁은 권한으로 열린다 — 급할 때 만든 계정이 전부를 할 수 있는 채로 남지 않게' },
      { at: 0, label: '로그인 허용은 켠 채로 열린다. 등록하는 까닭이 곧 지금부터 쓰겠다는 뜻이다' },
      { at: 3, label: '비밀번호를 여기서 정하지 않는다 — 그 자리는 로그인 화면이 생길 때 함께 만든다' },
    ],
    data: ['@winpilot/store · ADMIN_ROLES', '@winpilot/store · blankFnbAdmin()'],
    exits: ['관리자 목록으로 — 새 계정은 조회 권한으로 선다'],
  },
];

/**
 * 운영자 여정 — **화면 하나로는 안 끝나는 일**을 갈래로 묶은 것.
 *
 * 어드민의 화면별 흐름은 목록에서 시작해 목록으로 돌아오는 짧은 고리라, 그것만 보면
 * "메뉴 하나를 실제로 팔기까지 무엇을 거치는가" 가 보이지 않는다. 그래서 여기 `steps` 는
 * 화면 안 동작이 아니라 **화면 이름**으로 적는다.
 */
export const JOURNEYS: NamedFlow[] = [
  {
    id: 'menu',
    title: '메뉴 올리기',
    purpose: '팔기로 한 것을 적어 두고 준비가 끝나는 날 켠다.',
    entries: ['사이드바 등록 · 메뉴'],
    steps: [
      '메뉴 카테고리에서 노출 위치를 확인한다',
      '메뉴 목록에서 등록으로 간다',
      '메뉴 등록에서 값과 알레르기를 적는다',
      '메뉴 상세에서 노출을 켠다',
      '메뉴 목록에서 켜진 것을 확인한다',
    ],
    branches: [
      {
        after: 2,
        question: '알레르기까지 다 적었나',
        block: '메뉴 등록에 머물며 정해진 목록에서 고른다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '묶음을 늘리는 자리가 없다 — 넣을 메뉴가 없으면 메뉴판에 빈 제목만 선다' },
      { at: 3, label: '등록 직후는 내림이라 상세를 한 번 거쳐야 메뉴판에 선다' },
    ],
    data: ['@winpilot/store · MENU_ITEMS · MENU_CATEGORIES'],
    exits: ['사이트 메뉴판 /menu 와 홈의 대표 메뉴 굴림판에 새 메뉴가 선다'],
  },
  {
    id: 'inquiry',
    title: '창업 문의 응대',
    purpose: '하루 안에 연락한다고 적어 둔 약속을 지키고, 같은 물음을 다시 받지 않게 한다.',
    entries: ['대시보드 답하지 않은 창업 문의 카드', '사이드바 창업 · 문의 내역'],
    steps: [
      '창업 문의 목록에서 접수된 건을 찾는다',
      '창업 비용 · 절차에서 사이트에 적힌 값을 확인한다',
      '창업 문의 상세에서 통화 내용을 메모하고 상태를 바꾼다',
      '창업 FAQ 에 되풀이되는 물음을 옮겨 적는다',
    ],
    branches: [
      {
        after: 2,
        question: '같은 물음이 되풀이되나',
        pass: '예',
        block: '문의 목록으로 돌아가 다음 건을 연다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '지우는 자리가 없다 — 끝난 건은 상태로 닫는다' },
      { at: 1, label: '비용은 신고한 값이라 여기서 고치지 못한다. 받는 쪽과 신청자가 같은 표를 봐야 말이 어긋나지 않는다' },
    ],
    data: ['@winpilot/store · FRANCHISE_INQUIRIES', '@winpilot/store · FNB_FAQS · FRANCHISE_COSTS'],
    exits: ['사이트 가맹점 개설문의 /franchise/faq 에 같은 물음이 생기고, 대시보드의 밀린 건수가 준다'],
  },
  {
    id: 'store',
    title: '가맹점 열기',
    purpose: '공사 중인 매장을 먼저 세워 두고 여는 날 영업중으로 바꾼다.',
    entries: ['사이드바 등록 · 가맹점'],
    steps: [
      '가맹점 등록에서 준비중으로 만든다',
      '가맹점 목록에서 준비중 줄을 확인한다',
      '가맹점 상세에서 번호와 영업시간을 채우고 영업중으로 바꾼다',
      '메인 비주얼 등록에서 개점 배너를 건다',
    ],
    branches: [
      {
        after: 2,
        question: '번호와 영업시간이 정해졌나',
        block: '준비중으로 둔다 — 없는 번호를 적으면 그리로 전화가 간다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '휴점 매장도 이 목록에는 남는다. 사이트에서만 빠진다' },
      { at: 3, label: '개점 배너는 종료일을 적어 둔다 — 행사가 끝난 다음 날 아무도 안 끄기 때문이다' },
    ],
    data: ['@winpilot/store · STORES', '@winpilot/store · FNB_BANNERS'],
    exits: ['사이트 매장안내 /stores 에 영업중으로 서고, 첫 화면에 개점 배너가 걸린다'],
  },
  {
    id: 'notice',
    title: '알림 걸기',
    purpose: '손님이 묻기 전에 읽어야 하는 것을 사이트 맨 위에 올린다.',
    entries: ['사이드바 고객센터 · 공지사항'],
    steps: [
      '공지사항 목록에서 이미 고정한 글이 몇인지 센다',
      '공지 등록에서 제목과 본문을 적는다',
      '공지 상세에서 고정과 공개를 켠다',
      '팝업 목록에서 같은 기간에 뜨는 것을 정리한다',
    ],
    branches: [
      {
        after: 0,
        question: '고정한 글이 이미 있나',
        pass: '예',
        block: '그대로 새 글을 쓴다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '제목이 34자를 넘으면 홈 띠에서 잘린다 — 세어 알리되 막지 않는다' },
      { at: 2, label: '고정은 날짜를 이긴다. 다 알린 뒤에는 꺼야 한다' },
      { at: 3, label: '지금 뜨는 팝업이 셋을 넘으면 손님이 셋을 닫고서야 첫 화면에 닿는다' },
    ],
    data: ['@winpilot/store · FNB_NOTICES', '@winpilot/store · FNB_POPUPS · bannerState()'],
    exits: ['사이트 홈 공지 띠와 고객센터 공지사항 /support/notices 에 글이 선다'],
  },
  {
    id: 'access',
    title: '사람 들이고 내보내기',
    purpose: '들어오는 사람을 늘리되 나간 사람의 기록은 남긴다.',
    entries: ['사이드바 설정 · 관리자'],
    steps: [
      '관리자 목록에서 마지막 접속이 오래된 줄을 찾는다',
      '관리자 등록에서 조회 권한으로 만든다',
      '관리자 상세에서 필요한 만큼 권한을 올린다',
      '관리자 상세에서 나간 사람을 정지한다',
    ],
    branches: [
      {
        after: 3,
        question: '살아 있는 대표가 또 있나',
        block: '마지막 대표는 내리지도 정지하지도 못한다 — 다른 분을 먼저 대표로 올린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '새 계정은 가장 좁은 권한으로 열린다. 넓히는 것은 한 번 더 고르는 일이어야 한다' },
      { at: 3, label: '지우지 않고 정지한다 — 지우면 그 사람이 무엇을 고쳤는지가 함께 사라진다' },
    ],
    data: ['@winpilot/store · FNB_ADMINS · ADMIN_ROLES'],
    exits: ['사이트에는 아무것도 나가지 않는다 — 이 콘솔에 들어올 수 있는 사람만 바뀐다'],
  },
];

/**
 * 어디서든 같은 흐름 — 화면마다 되풀이해 적지 않는다.
 *
 * 33개 흐름에 내비게이션 · 저장 · 지우기 · 오류를 다 적으면 화면마다 같은 네 줄이 붙어 정작
 * 그 화면만의 것이 묻힌다. 여기 한 번 적고 화면 쪽에서는 **다를 때만** 적는다.
 */
export const COMMON_FLOWS: NamedFlow[] = [
  {
    id: 'navigation',
    title: '내비게이션',
    purpose: '어느 화면에서든 같은 차례로 원하는 것을 찾아 들어간다.',
    entries: ['어느 화면에서든'],
    steps: [
      '사이드바에서 최상위 갈래를 고른다',
      '본문 왼쪽 보조 메뉴에서 그 갈래의 세부를 고른다',
      '목록에서 검색과 거르개로 좁힌다',
      '줄을 눌러 상세로 들어간다',
    ],
    branches: [
      {
        after: 0,
        question: '그 갈래에 세부가 여럿인가',
        pass: '예',
        block: '보조 메뉴 없이 바로 그 화면을 연다',
        blockLabel: '아니오',
      },
      {
        after: 2,
        question: '조건에 맞는 것이 있나',
        block: '조건에 맞는 것이 없다는 한 줄을 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '사이드바는 최상위만 편다 — 세부까지 펴면 자원이 늘수록 무너진다' },
      { at: 2, label: '검색과 거르개는 화면 안 상태다. 주소에 남지 않아 돌아오면 풀린다' },
      { at: 3, label: '상세에는 돌아갈 목록으로 가는 줄이 맨 위에 선다' },
    ],
    data: ['@winpilot/store · 각 갈래의 시드'],
    exits: ['상세로 — 돌아오면 목록이 처음 조건으로 다시 선다'],
  },
  {
    id: 'save',
    title: '저장',
    purpose: '사이트로 나가는 값을 저장하기 전에 한 번 읽게 한다.',
    entries: ['상세나 등록 화면의 저장 단추'],
    steps: [
      '저장을 누른다',
      '틀린 칸이 있으면 토스트가 개수와 이름을 알린다',
      '확인 창이 무엇이 어디로 나가는지 한 줄로 다시 적는다',
      '저장을 다시 눌러 끝낸다',
    ],
    branches: [
      {
        after: 1,
        question: '확인이 필요한 칸이 없나',
        block: '확인 창을 열지 않는다 — 틀린 칸에 붉은 글씨가 선다',
        blockLabel: '아니오',
      },
      {
        after: 3,
        question: '확인 창에서 저장을 다시 눌렀나',
        block: '창만 닫히고 고친 값은 그대로 남는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '누르기 전에는 붉은 글씨를 띄우지 않는다 — 처음 여는 폼이 온통 붉으면 아무것도 안 읽힌다' },
      { at: 2, label: '확인 창의 값어치는 막는 데가 아니라 읽게 하는 데 있다. 그래서 무엇이 나가는지를 한 줄로 다시 적는다' },
      { at: 3, label: '프론트엔드 전용이라 저장 결과는 그 화면에만 남는다' },
    ],
    data: ['그 화면이 이미 들고 있는 값'],
    exits: ['같은 화면에 머물고 토스트로 결과를 알린다'],
  },
  {
    id: 'remove',
    title: '지우기와 내리기',
    purpose: '되돌릴 수 있는 것과 없는 것을 갈라 고르게 한다.',
    entries: ['목록의 관리 칸', '고른 줄 위에 열리는 선택 줄'],
    steps: [
      '지울지 내릴지 고른다',
      '확인 창이 무엇이 함께 사라지는지 적는다',
      '삭제를 다시 눌러 끝낸다',
    ],
    branches: [
      {
        after: 0,
        question: '다시 쓸 일이 있나',
        pass: '예',
        block: '지운다 — 값이 함께 사라진다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '창업 문의에는 지우는 자리가 없다 — 밖에서 들어온 기록이다' },
      { at: 0, label: '관리자는 지우지 않고 정지한다. 무엇을 고쳤는지가 함께 사라지기 때문이다' },
      { at: 1, label: '확인 창은 표가 세운다 — 화면마다 세우게 두면 한 화면에서 빠지고, 알아차리는 때는 이미 지워진 뒤다' },
    ],
    data: ['목록 화면이 이미 들고 있는 줄'],
    exits: ['같은 목록에 머문다 — 내린 것은 사이트에서만 빠지고 목록에는 남는다'],
  },
  {
    id: 'error',
    title: '오류',
    purpose: '막혔을 때 어디서 막혔는지와 돌아갈 길을 함께 준다.',
    entries: ['없는 주소를 열었을 때', '처리 도중 예외가 났을 때'],
    steps: [
      '무엇이 막혔는지 한 줄로 알린다',
      '404 인지 처리 중 오류인지 가른다',
      '돌아갈 길을 고른다',
    ],
    branches: [
      {
        after: 1,
        question: '주소 자체가 없는가',
        pass: '예',
        block: '오류 번호와 함께 처리 중 오류 화면을 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '두 화면 모두 같은 StatusScreen 을 쓴다 — 문구와 코드만 갈린다' },
      { at: 2, label: '404 는 창업 문의로 먼저 보낸다. 이 콘솔에서 늦으면 밖에 표가 나는 것이 그것뿐이다' },
      { at: 2, label: '다시 시도 단추를 두지 않는다 — 같은 오류가 반복되면 단추만 계속 누르게 된다' },
    ],
    data: ['Next 가 넘기는 오류 식별자'],
    exits: ['창업 문의 목록으로', '대시보드로'],
  },
];

export function findFlow(screen: string): ScreenFlow | undefined {
  return FLOW_SPECS.find((flow) => flow.screen === screen);
}

/** 매니페스트에는 있는데 흐름이 없는 화면. 문서가 화면을 따라가지 못한 자리다. */
export function missingFlows(): string[] {
  const held = new Set(FLOW_SPECS.map((flow) => flow.screen));
  return pages.filter((page) => !held.has(page.id)).map((page) => page.id);
}

/** 흐름에는 적혀 있는데 매니페스트에 없는 화면. 지운 화면이 남은 자리다. */
export function unknownFlows(): string[] {
  const real = new Set(pages.map((page) => page.id));
  return FLOW_SPECS.map((flow) => flow.screen).filter((screen) => !real.has(screen));
}
