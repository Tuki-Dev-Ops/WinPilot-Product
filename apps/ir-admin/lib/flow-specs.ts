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
 * 어드민은 회사 홈페이지와 투자자 화면이 읽는 값의 **원본**이다. 그래서 흐름의 끝(`exits`)에
 * 무엇이 어디에 나타나는지를 함께 적는다. 흐름 도면만 보고도 "이 저장이 밖으로 나가는 저장인지"
 * 가 갈려야 한다. 다만 이 프로젝트에는 **서버가 없다** — `data` 에는 실제로 있는 것(공유 시드
 * `@winpilot/store`, 화면 안 상태, 주소의 id)만 적는다.
 *
 * 이 콘솔의 목록은 검색과 거르개를 **주소에 두지 않는다.** 그래서 `data` 에 질의문자열을 적지
 * 않는다 — 적어 두면 도면을 보고 만드는 사람이 없는 규칙을 구현한다.
 *
 * ## 한때 메뉴에 없던 화면도 적는다
 * 공시 · 재무 · 주주 · 자료 열 화면은 한동안 메뉴에서 빠져 주소로만 열렸다. 지금은 IR 갈래로
 * 되돌아왔지만, 그때도 흐름은 여기 있었다 — 흐름을 빼 두면 메뉴에서 빠지는 순간 화면이 문서에서도
 * 사라지는데, 투자자 화면은 그동안에도 그 값을 읽고 있었다.
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
      '볼 기간을 오늘 · 최근 7일 · 이번 달에서 고른다',
      '숫자 여섯을 한 줄에서 훑는다',
      '기간 값 옆의 전체 값과 견준다',
      '지도와 표로 어느 지역이 비었는지 본다',
    ],
    branches: [
      {
        after: 1,
        question: '색이 붙은 숫자가 있나',
        block: '밀린 것이 없다 — 지역 분포만 훑고 끝낸다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '기간은 고정된 오늘에서 센다 — 조각 안에서 날짜를 읽으면 서버와 브라우저가 갈린다' },
      { at: 1, label: '방문 수를 두지 않는다. 여기서 보는 것은 손대야 할 일의 수다' },
      { at: 3, label: '0건인 지역을 지우지 않는다 — 한 건도 오지 않은 지역이야말로 손대야 할 곳이다' },
    ],
    data: [
      '@winpilot/store · SITE_INQUIRIES · SITE_REGIONS',
      '@winpilot/store · SITE_NOTICES · DISCLOSURES',
      '@winpilot/geo · 서버에서 화면 좌표로 옮긴 시 · 도 경계선',
    ],
    exits: ['사이드바로 그 갈래를 직접 연다 — 이 화면에는 목록으로 보내는 단추가 아직 없다'],
  },
  {
    screen: 'inquiries',
    entries: ['콘솔을 열고 사이드바 문의', '메뉴의 맨 앞이라 대개 여기서 시작한다'],
    steps: [
      '아직 답하지 않은 건수를 제목 아래에서 읽는다',
      '갈래와 상태로 거른다',
      '회사명이나 담당자로 검색한다',
      '오른쪽 끝 상태 줄을 따라 내려가며 남은 것을 찾는다',
      '줄을 눌러 상세로 간다',
    ],
    branches: [
      {
        after: 2,
        question: '조건에 맞는 문의가 있나',
        block: '조건에 맞는 문의가 없다는 한 줄을 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '등록 단추가 없다 — 문의는 밖에서 들어오는 것이라 콘솔에서 만들 일이 없다' },
      { at: 3, label: '상태를 한 세로선 위에 세운다. 가운데 두면 줄마다 눈이 멈추는 자리가 달라진다' },
      { at: 4, label: '지우는 자리가 없다. 끝난 건은 상태로 닫는다' },
    ],
    data: ['@winpilot/store · SITE_INQUIRIES · SITE_INQUIRY_KINDS', '화면 안 검색어와 거르개'],
    exits: ['문의 상세로 — /inquiries/[inquiryId]'],
  },
  {
    screen: 'inquiries-detail',
    entries: ['문의 목록에서 줄을 눌러'],
    steps: [
      '보낸 사람의 지역과 연락처를 먼저 읽는다',
      '문의 내용을 읽는다',
      '답변을 적는다',
      '상태를 고르고 저장을 누른다',
    ],
    branches: [
      {
        after: 3,
        question: '답변완료로 바꾸는데 답이 비어 있나',
        pass: '아니오',
        block: '답변 내용이 비어 있다고 토스트로 알리고 저장을 막는다',
        blockLabel: '예',
      },
    ],
    exceptions: [
      { at: 1, label: '보낸 사람의 글은 고칠 수 없다 — 고치면 무엇이 실제로 왔는지 알 수 없게 된다' },
      { at: 3, label: '처리중 · 보류로 두는 동안에는 답이 비어도 된다' },
      { at: 3, label: '상태에 따라 확인 창이 묻는 말이 갈린다 — 답변을 보낼까요 · 상태를 바꿀까요' },
    ],
    data: ['@winpilot/store · SITE_INQUIRIES · findSiteInquiry', '주소의 inquiryId'],
    exits: ['문의 목록으로 — 저장한 건은 남은 일에서 빠진다', '목록으로 그냥 나가면 저장하지 않은 것은 반영되지 않는다'],
  },
  {
    screen: 'inquiries-settings',
    entries: ['사이드바 문의 · 설정'],
    steps: [
      '받는 곳의 대표 수신 메일을 확인한다',
      '양식이 묻는 칸 여덟과 각각이 필수인 이유를 읽는다',
      '접수 안내 문구를 고친다',
      '카드마다 있는 저장을 누른다',
    ],
    branches: [
      {
        after: 0,
        question: '메일 주소 모양인가',
        block: '메일 주소 형식이 아니라고 토스트로 알린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '칸을 끄고 켜지 못한다 — 수집 항목은 개인정보 처리방침에 적힌 것과 같아야 한다' },
      { at: 1, label: '첨부는 20MB 까지, 문의 내용은 10자 이상만 받는다' },
      { at: 3, label: '카드마다 저장이 따로다. 무엇을 고쳤는지가 자리로 드러난다' },
    ],
    data: ['@winpilot/store · SITE_INQUIRY_KINDS · SITE_REGIONS', '@winpilot/store · IR_COMPANY'],
    exits: ['사이트 문의 양식과 자동 회신에 그대로 나간다', '같은 화면에 머물고 토스트로 결과를 알린다'],
  },
  {
    screen: 'contents-notices',
    entries: ['사이드바 콘텐츠 · 공지사항'],
    steps: [
      '갈래와 상태로 거른다',
      '제목이나 내용으로 검색한다',
      '고정한 것이 몇인지 표에서 센다',
      '줄을 눌러 상세로 가거나 등록으로 간다',
    ],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 공지가 있나',
        block: '등록된 공지가 없다는 한 줄을 대신 그린다',
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
      { at: 2, label: '고정이 넷을 넘으면 고정의 뜻이 없어진다 — 막지는 않고 몇 개인지만 보인다' },
      { at: 3, label: '확인 창에 사이트 공지사항 목록에서 사라지고 되돌릴 수 없다고 적는다' },
    ],
    data: ['@winpilot/store · SITE_NOTICES · SITE_NOTICE_GROUPS', '화면 안 검색어와 거르개'],
    exits: ['상세로 — /contents/notices/[noticeId]', '등록으로 — /contents/notices/new'],
  },
  {
    screen: 'contents-notices-new',
    entries: ['공지사항 목록 툴바의 공지 등록 단추'],
    steps: [
      '빈 폼을 연다',
      '갈래 · 제목 · 올린 날을 넣는다',
      '본문을 빈 줄로 문단을 나눠 적는다',
      '고정과 노출을 정하고 등록을 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '갈래 · 제목 · 올린 날 · 내용이 다 찼나',
        block: '확인이 필요한 칸의 개수와 이름을 토스트에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '공지 코드는 화면 밖에서 세어 넘긴다 — 폼 안에서 세면 다시 그릴 때마다 코드가 흔들린다' },
      { at: 2, label: '문단마다 칸을 두지 않는다. 옮기고 지우는 단추가 따라붙어야 하고 서너 문단에 그만한 장치는 과하다' },
      { at: 3, label: '고정을 켜는 자리 옆에 무슨 일이 생기는지 적어 둔다 — 결과는 사이트 목록의 차례에서만 드러난다' },
    ],
    data: ['@winpilot/store · SITE_NOTICES · SITE_NOTICE_GROUPS · nextSiteId'],
    exits: ['사이트 공지사항 목록에 선다 — 노출을 켜야 한다', '공지사항 목록으로'],
  },
  {
    screen: 'contents-notices-detail',
    entries: ['공지사항 목록에서 줄을 눌러'],
    steps: [
      '이미 넣은 값이 채워진 폼을 본다',
      '갈래 · 제목 · 올린 날을 고친다',
      '본문을 고친다',
      '고정과 노출을 정하고 저장을 누른다',
    ],
    branches: [
      {
        after: 3,
        question: '확인 창에서 저장을 다시 눌렀나',
        block: '창을 닫고 고친 값을 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '없는 코드로 들어오면 404 다' },
      { at: 1, label: '코드는 고칠 수 없다 — 수정 불가라 적는다' },
      { at: 3, label: '등록 화면과 한 폼이다. 갈리는 것은 단추 말과 확인 창이 묻는 말뿐이다' },
    ],
    data: ['@winpilot/store · SITE_NOTICES · findSiteNotice', '주소의 noticeId'],
    exits: ['고친 말이 사이트 공지사항 목록에 그대로 나간다', '공지사항 목록으로'],
  },
  {
    screen: 'contents-news',
    entries: ['사이드바 콘텐츠 · 뉴스'],
    steps: ['갈래와 상태로 거른다', '제목으로 검색한다', '줄을 눌러 상세로 가거나 등록으로 간다'],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 뉴스가 있나',
        block: '조건에 맞는 것이 없다는 한 줄을 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '제목에 수상 · 수출 실적처럼 밖에서 확인되는 숫자를 적지 않는다 — 허위 기재가 될 수 있다' },
      { at: 2, label: '썸네일은 도형 무늬로 대신한다. 투자자 화면이 그리는 것과 같은 계산이다' },
    ],
    data: ['@winpilot/store · MEDIA_CLIPS', '화면 안 검색어와 거르개'],
    exits: ['상세로 — /contents/news/[newsId]', '등록으로 — /contents/news/new'],
  },
  {
    screen: 'contents-news-new',
    entries: ['뉴스 목록 툴바의 뉴스 등록 단추'],
    steps: [
      '빈 폼을 연다',
      '칸 위의 안내를 읽고 갈래와 제목을 넣는다',
      '썸네일 무늬를 고르고 그 자리에서 미리 본다',
      '노출을 정하고 등록을 누른다',
    ],
    branches: [
      {
        after: 1,
        question: '갈래와 제목이 찼나',
        block: '확인이 필요한 칸을 토스트에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '안내를 칸 아래가 아니라 칸 위에 둔다 — 다 적고 난 뒤에 읽는 주의는 늦다' },
      { at: 2, label: '무늬는 일곱을 넘기면 되풀이된다. 전부 같은 무늬면 목록 격자가 한 덩어리로 보인다' },
      { at: 3, label: '뉴스 코드는 저장할 때 매겨진다' },
    ],
    data: ['@winpilot/store · MEDIA_CLIPS · nextSiteId'],
    exits: ['사이트 CS CENTER 뉴스와 홈 마지막 칸에 선다', '뉴스 목록으로'],
  },
  {
    screen: 'contents-news-detail',
    entries: ['뉴스 목록에서 줄을 눌러'],
    steps: ['채워진 폼을 본다', '갈래와 제목을 고친다', '썸네일 무늬를 바꾼다', '노출을 정하고 저장을 누른다'],
    branches: [
      {
        after: 3,
        question: '확인 창에서 저장을 다시 눌렀나',
        block: '창을 닫고 고친 값을 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '없는 코드로 들어오면 404 다' },
      { at: 1, label: '제목에 검증되는 사실을 적지 말라는 안내가 칸 위에 그대로 선다' },
      { at: 2, label: '고른 무늬를 그 자리에서 그려 보여 준다 — 사이트에 서는 것과 같아야 고르는 일이 뜻을 갖는다' },
    ],
    data: ['@winpilot/store · MEDIA_CLIPS · findMediaClip', '주소의 newsId'],
    exits: ['사이트 CS CENTER 뉴스와 홈 마지막 칸에 그대로 나간다', '뉴스 목록으로'],
  },
  {
    screen: 'contents-faqs',
    entries: ['사이드바 콘텐츠 · FAQ'],
    steps: [
      '갈래와 상태로 거른다',
      '물음이나 답으로 검색한다',
      '목록에 함께 선 답을 훑어 같은 답이 있는지 본다',
      '줄을 눌러 상세로 가거나 등록으로 간다',
    ],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 물음이 있나',
        block: '조건에 맞는 것이 없다는 한 줄을 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '물음만 늘어놓으면 같은 물음이 두 번 적혔는지 알 수 없다 — 그래서 답을 목록에 함께 싣는다' },
      { at: 3, label: '갈래가 곧 사이트 FAQ 화면의 왼쪽 줄이다' },
    ],
    data: ['@winpilot/store · SITE_FAQS · FAQ_GROUPS', '화면 안 검색어와 거르개'],
    exits: ['상세로 — /contents/faqs/[faqId]', '등록으로 — /contents/faqs/new'],
  },
  {
    screen: 'contents-faqs-new',
    entries: ['FAQ 목록 툴바의 FAQ 등록 단추', '문의를 답하다 되풀이되는 물음을 발견했을 때'],
    steps: [
      '갈래를 고른다',
      '물음을 적는 동안 옆에 선 같은 갈래의 물음을 본다',
      '답을 열두 줄 상자에 길게 적는다',
      '노출을 정하고 등록을 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '갈래 · 물음 · 답이 다 찼나',
        block: '확인이 필요한 칸을 토스트에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '비슷해 보여도 막지 않는다 — 정말 다른 물음인지는 사람만 안다' },
      { at: 2, label: '짧게 열어 두면 짧게 적게 되고, 짧은 답은 다시 문의로 돌아온다' },
      { at: 3, label: 'FAQ 코드는 저장할 때 매겨진다' },
    ],
    data: ['@winpilot/store · SITE_FAQS · FAQ_GROUPS · nextSiteId'],
    exits: ['사이트 CS CENTER FAQ 에 선다 — 노출을 켜야 한다', 'FAQ 목록으로'],
  },
  {
    screen: 'contents-faqs-detail',
    entries: ['FAQ 목록에서 줄을 눌러'],
    steps: ['채워진 폼을 본다', '물음과 답을 고친다', '노출을 정하고 저장을 누른다'],
    branches: [
      {
        after: 2,
        question: '확인 창에서 저장을 다시 눌렀나',
        block: '창을 닫고 고친 값을 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '없는 코드로 들어오면 404 다' },
      { at: 1, label: '옆에 서는 이웃 목록에서 자기 자신은 뺀다 — 자기가 자기 이웃으로 뜨면 헷갈린다' },
    ],
    data: ['@winpilot/store · SITE_FAQS · findSiteFaq', '주소의 faqId'],
    exits: ['사이트 CS CENTER FAQ 에 그대로 나간다', 'FAQ 목록으로'],
  },
  {
    screen: 'products',
    entries: ['사이드바 제품 · 목록'],
    steps: ['이름이나 소개로 검색한다', '상태로 거른다', '줄을 눌러 상세로 간다'],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 제품이 있나',
        block: '조건에 맞는 것이 없다는 한 줄을 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '화면에 서는 이름은 title 이 갖는다 — 이름을 만들어 쓰지 않는다' },
      { at: 2, label: '등록 단추가 없다. 상세 화면이 코드로 짜여 있어 줄만 늘리면 눌러도 404 인 제품이 생긴다' },
    ],
    data: ['@winpilot/store · SOLUTIONS', '화면 안 검색어와 거르개'],
    exits: ['제품 상세로 — /products/[productId]'],
  },
  {
    screen: 'products-detail',
    entries: ['제품 목록에서 줄을 눌러'],
    steps: [
      '코드와 상세 주소를 읽는다',
      '이름 · 짧은 이름 · 한 줄 소개를 고친다',
      '무엇을 푸는가와 어떻게 푸는가를 고친다',
      '사이트 노출을 정하고 저장을 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '말 칸이 다 찼나',
        block: '확인이 필요한 칸을 토스트에 적는다',
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
      { at: 0, label: '코드와 상세 주소는 고칠 수 없다 — 주소는 라우트가 정한다' },
      { at: 2, label: '구조(기능 · 구성 · 업종 · 절차)는 보여 주기만 한다. 개수가 바뀌면 격자가 무너지고 층이 뜬다' },
      { at: 3, label: '제품에만 서는 칸 둘은 isSolution 이 정한다 — 갈래 이름은 바뀌고 그때 칸이 조용히 사라진다' },
    ],
    data: ['@winpilot/store · SOLUTIONS · findSolution', '주소의 productId'],
    exits: ['사이트 홈 카드 · PRODUCT 메뉴 · 제품 상세에 그대로 나간다', '제품 목록으로'],
  },
  {
    screen: 'products-settings',
    entries: ['사이드바 제품 · 설정'],
    steps: [
      '지금 사이트에 선 차례를 읽는다',
      '위 · 아래로 한 칸씩 옮긴다',
      '팔 준비가 안 된 것을 메뉴에서 내린다',
      '저장을 누른다',
    ],
    branches: [
      {
        after: 3,
        question: '확인 창에서 저장을 다시 눌렀나',
        block: '창을 닫고 고친 차례를 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '지금 내려 둔 것에서 시작한다 — 빈 배열로 시작하면 목록의 상태와 어긋난다' },
      { at: 1, label: '한 칸씩만 옮긴다. 끌어 옮기기는 좁은 화면과 키보드에서 쓸 수 없다' },
      { at: 3, label: '숨긴 제품은 메뉴에서 사라지고 상세 화면도 열리지 않는다' },
    ],
    data: ['@winpilot/store · SOLUTIONS'],
    exits: ['사이트 머리 메뉴 PRODUCT 의 차례가 바로 바뀐다', '같은 화면에 머물고 토스트로 알린다'],
  },
  {
    screen: 'solutions',
    entries: ['메뉴 밖 — /solutions 주소로만 열린다'],
    steps: ['이름이나 문제로 검색한다', '상태로 거른다', '구성 층과 절차가 찬 줄인지 본다', '줄을 눌러 상세로 간다'],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 것이 있나',
        block: '조건에 맞는 것이 없다는 한 줄을 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '구성 층과 절차가 비면 그 상세 화면은 문단 둘로 끝난다 — 검토하러 온 사람은 거기서 창을 닫는다' },
      { at: 3, label: '이 갈래는 사이드바에 없다. 제품 갈래와 같은 값을 보는데 이름만 달라 겹쳤다' },
    ],
    data: ['@winpilot/store · SOLUTIONS', '화면 안 검색어와 거르개'],
    exits: ['문제 · 해법 상세로 — /solutions/[solutionId]'],
  },
  {
    screen: 'solutions-detail',
    entries: ['문제 · 해법 목록에서 줄을 눌러'],
    steps: ['채워진 폼을 본다', '이름과 한 줄 소개를 고친다', '무엇을 푸는가와 어떻게 푸는가를 고친다', '저장을 누른다'],
    branches: [
      {
        after: 2,
        question: '말 칸이 다 찼나',
        block: '확인이 필요한 칸을 토스트에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '제품 · 서비스 상세와 같은 폼이다. 돌아갈 목록만 다르게 넘긴다' },
      { at: 2, label: '구조는 보여 주기만 한다 — 여기서 늘리면 사이트에서 화면이 깨진 것을 발견하게 된다' },
      { at: 3, label: '없는 코드로 들어오면 404 다' },
    ],
    data: ['@winpilot/store · SOLUTIONS · findSolution', '주소의 solutionId'],
    exits: ['사이트 제품 상세 /solutions/{id} 와 홈 카드에 그대로 나간다', '문제 · 해법 목록으로'],
  },
  {
    screen: 'solutions-settings',
    entries: ['메뉴 밖 — /solutions/settings 주소로만 열린다'],
    steps: ['홈 무대에 시계 방향으로 선 여섯을 읽는다', '각각이 여는 주소를 확인한다'],
    branches: [],
    exceptions: [
      { at: 0, label: '차례를 바꾸는 자리가 없다 — 이 순서가 곧 공정의 차례라 바꾸면 그림이 없는 흐름을 그린다' },
      { at: 1, label: '주소는 카드가 아니라 상세 화면이 정한다. 여기 적힌 것은 확인용이다' },
    ],
    data: ['@winpilot/store · SITE_SERVICES · siteServiceHref'],
    exits: ['읽고 나간다 — 바꾸는 일은 그림을 함께 손볼 때 코드에서 한다'],
  },
  {
    screen: 'services',
    entries: ['사이드바 서비스 · 목록'],
    steps: ['이름으로 검색한다', '절차 칸으로 몇 단계짜리인지 본다', '상세가 채워졌는지 확인한다', '줄을 눌러 상세로 간다'],
    branches: [
      {
        after: 0,
        question: '조건에 맞는 것이 있나',
        block: '조건에 맞는 것이 없다는 한 줄을 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '제품 목록이 상태를 두는 자리에 절차를 둔다 — 서비스에는 켜고 끄는 값이 없다' },
      { at: 2, label: '거르개를 두지 않는다. 걸 것이 없는 거르개를 세우면 목록이 고장 난 것으로 보인다' },
      { at: 3, label: '지우는 자리도 등록도 없다 — 지웠는데 사이트에 남아 있는 것이 가장 나쁜 상태다' },
    ],
    data: ['@winpilot/store · SERVICE_DETAILS', '화면 안 검색어'],
    exits: ['서비스 상세로 — /services/[serviceId]'],
  },
  {
    screen: 'services-detail',
    entries: ['서비스 목록에서 줄을 눌러'],
    steps: ['채워진 폼을 본다', '이름과 한 줄 소개를 고친다', '무엇을 푸는가와 어떻게 푸는가를 고친다', '저장을 누른다'],
    branches: [
      {
        after: 2,
        question: '말 칸이 다 찼나',
        block: '확인이 필요한 칸을 토스트에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '제품에만 있는 칸 둘은 폼이 알아서 접는다 — 여기서 빼야 할 것을 세어 두면 언젠가 한 번 빠뜨린다' },
      { at: 2, label: '어떻게 푸는가 아래 안내가 제품과 다르다. 서비스는 카드가 아니라 상세의 문제 아래에 실린다' },
      { at: 3, label: '없는 코드로 들어오면 404 다' },
    ],
    data: ['@winpilot/store · SERVICE_DETAILS · findService', '주소의 serviceId'],
    exits: ['사이트 /solutions/consulting · /solutions/infra 상세와 홈 카드에 나간다', '서비스 목록으로'],
  },
  {
    screen: 'services-settings',
    entries: ['사이드바 서비스 · 설정'],
    steps: ['서비스가 나가는 자리 셋을 읽는다', '홈 카드의 말과 상세의 말을 나란히 견준다'],
    branches: [
      {
        after: 1,
        question: '두 문구가 같은 말을 하나',
        pass: '예',
        block: '어느 쪽이 맞는지 정해 목록 · 상세에서 고친다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '켜고 끄는 자리가 없다 — 안 팔기로 하는 날 바꿀 것은 토글 하나가 아니라 세 자리다' },
      { at: 1, label: '문구가 둘인 것은 실리는 자리의 길이가 달라서다. 어느 쪽이 맞는지는 사람이 정한다' },
    ],
    data: ['@winpilot/store · SITE_SERVICES · SERVICE_DETAILS'],
    exits: ['고치는 자리는 서비스 목록 · 상세다', '읽고 나간다'],
  },
  {
    screen: 'company-about',
    entries: ['사이드바 회사 · 소개'],
    steps: ['첫 화면 소개 문단을 읽는다', '회사 정보 표를 읽는다'],
    branches: [],
    exceptions: [
      { at: 0, label: '두 곳에 나가는 값을 한 화면에 둔다 — 나누면 어느 화면을 고쳐야 하는지 먼저 알아내야 한다' },
      { at: 1, label: '여기서 고치지 않는다. 대표이사 이름이 사이트마다 다르면 먼저 눈에 띄는 것은 밖이다' },
    ],
    data: ['@winpilot/store · IR_COMPANY · SITE_INTRO'],
    exits: ['읽고 나간다 — 고치는 자리는 한 곳에서 검토를 지나야 한다'],
  },
  {
    screen: 'company-history',
    entries: ['사이드바 회사 · 연혁'],
    steps: [
      '전체 건수와 사이트에 선 건수를 제목 아래에서 읽는다',
      '제목이나 설명으로 검색한다',
      '최신순으로 늘어선 줄을 훑는다',
      '줄을 눌러 상세로 가거나 등록으로 간다',
    ],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 줄이 있나',
        block: '조건에 맞는 것이 없다는 한 줄을 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '사이트와 같은 최신순이다 — 어드민만 반대면 방금 고친 것을 확인하러 갈 때마다 끝까지 내려가야 한다' },
      { at: 2, label: '숨긴 줄도 목록에는 남는다. 사라지면 다시 켤 방법이 없다' },
      { at: 3, label: 'B2C 어드민의 회사 · 연혁과 같은 값이다 — 여기서 지우면 그쪽에서도 사라진다' },
    ],
    data: ['@winpilot/store · MILESTONES · sortMilestones', '화면 안 검색어와 거르개'],
    exits: ['상세로 — /company/history/[milestoneId]', '등록으로 — /company/history/new'],
  },
  {
    screen: 'company-history-new',
    entries: ['연혁 목록 툴바의 연혁 등록 단추'],
    steps: ['빈 폼을 연다', '연도를 넣고 월은 아는 경우에만 고른다', '제목을 적고 설명은 필요할 때만 적는다', '노출을 정하고 등록을 누른다'],
    branches: [
      {
        after: 2,
        question: '연도가 네 자리이고 제목이 찼나',
        block: '확인이 필요한 칸을 토스트에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '월을 필수로 두면 대충 01 로 적거나 아예 안 적는다 — 둘 다 연혁을 못 쓰게 만든다' },
      { at: 2, label: '설명을 필수로 두면 없는 말을 지어 채우게 되고, 그런 줄이 섞이면 연혁 전체가 부풀려 읽힌다' },
      { at: 3, label: '코드는 저장할 때 매겨진다' },
    ],
    data: ['@winpilot/store · MILESTONES · nextSiteId'],
    exits: ['사이트 연혁과 B2C 쇼핑몰의 회사 소개에 함께 나간다', '연혁 목록으로'],
  },
  {
    screen: 'company-history-detail',
    entries: ['연혁 목록에서 줄을 눌러'],
    steps: ['채워진 폼을 본다', '연도와 월을 고친다', '제목과 설명을 고친다', '노출을 정하고 저장을 누른다'],
    branches: [
      {
        after: 3,
        question: '확인 창에서 저장을 다시 눌렀나',
        block: '창을 닫고 고친 값을 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '없는 코드로 들어오면 404 다' },
      { at: 1, label: '코드는 고칠 수 없다' },
      { at: 3, label: '여기서 고친 것이 쇼핑몰의 회사 소개에도 그대로 나간다' },
    ],
    data: ['@winpilot/store · MILESTONES · milestoneDate', '주소의 milestoneId'],
    exits: ['사이트 연혁과 B2C 쇼핑몰의 회사 소개에 함께 나간다', '연혁 목록으로'],
  },
  {
    screen: 'company-credentials',
    entries: ['사이드바 회사 · 특허 및 인증'],
    steps: ['들고 온 번호로 검색한다', '구분과 상태로 거른다', '고정폭으로 선 번호를 눈으로 견준다', '줄을 눌러 상세로 가거나 등록으로 간다'],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 것이 있나',
        block: '조건에 맞는 것이 없다는 한 줄을 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '번호를 고정폭으로 둔다 — 여기 오는 사람의 절반은 번호를 들고 와서 맞는지 본다' },
      { at: 3, label: '확인 창에 사이트 특허 및 인증 화면에서 사라진다고 적는다' },
    ],
    data: ['@winpilot/store · CREDENTIALS', '화면 안 검색어와 거르개'],
    exits: ['상세로 — /company/credentials/[credentialId]', '등록으로 — /company/credentials/new'],
  },
  {
    screen: 'company-credentials-new',
    entries: ['특허 및 인증 목록 툴바의 등록 단추'],
    steps: ['빈 폼을 연다', '구분과 이름을 넣는다', '등록번호와 발급 기관을 넣는다', '취득일을 넣고 등록을 누른다'],
    branches: [
      {
        after: 2,
        question: '등록번호가 찼나',
        block: '번호 없이는 저장할 수 없다고 그 칸 아래에 적는다',
        blockLabel: '아니오',
      },
      {
        after: 3,
        question: '취득일이 오늘까지인가',
        block: '아직 받지 않은 것을 받은 것으로 세울 수 없다고 알린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '번호가 없으면 확인할 방법이 없어 적어 둔 것이 주장에 그친다' },
      { at: 3, label: '오늘은 화면 밖에서 받는다 — 조각 안에서 읽으면 서버와 브라우저 값이 어긋난다' },
    ],
    data: ['@winpilot/store · CREDENTIALS · nextSiteId'],
    exits: ['사이트 특허 및 인증 화면에 선다 — 노출을 켜야 한다', '특허 및 인증 목록으로'],
  },
  {
    screen: 'company-credentials-detail',
    entries: ['특허 및 인증 목록에서 줄을 눌러'],
    steps: ['채워진 폼을 본다', '이름과 발급 기관을 고친다', '등록번호와 취득일을 고친다', '노출을 정하고 저장을 누른다'],
    branches: [
      {
        after: 2,
        question: '번호가 차 있고 취득일이 오늘까지인가',
        block: '그 칸 아래에 무엇이 잘못됐는지 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '없는 코드로 들어오면 404 다' },
      { at: 2, label: '등록번호는 여기서도 비울 수 없다' },
      { at: 3, label: '등록 화면과 한 폼이다' },
    ],
    data: ['@winpilot/store · CREDENTIALS · findCredential', '주소의 credentialId'],
    exits: ['사이트 특허 및 인증 화면에 그대로 나간다', '특허 및 인증 목록으로'],
  },
  {
    screen: 'banners',
    entries: ['사이드바 배너 · 메인 비주얼'],
    steps: ['제목으로 검색한다', '상태로 거른다', '한 칸에 선 기간에서 끝난 것이 있는지 본다', '줄을 눌러 상세로 가거나 등록으로 간다'],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 배너가 있나',
        block: '조건에 맞는 것이 없다는 한 줄을 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '끝을 비워 둔 배너는 계속 선다 — 그 사실은 대개 밖에서 먼저 발견된다' },
      { at: 3, label: '첫 화면의 무대와는 다른 값이다. 무대는 늘 돌고 여기 있는 것은 기간을 갖는다' },
    ],
    data: ['@winpilot/store · SITE_BANNERS (slot = 메인 비주얼)', '화면 밖에서 받은 오늘'],
    exits: ['상세로 — /banners/[bannerId]', '등록으로 — /banners/new'],
  },
  {
    screen: 'banners-new',
    entries: ['메인 비주얼 목록 툴바의 배너 등록 단추'],
    steps: ['빈 폼을 연다', '제목을 넣는다', '시작일과 종료일을 넣는다', '노출을 정하고 등록을 누른다'],
    branches: [
      {
        after: 2,
        question: '제목과 시작일이 찼나',
        block: '확인이 필요한 칸을 토스트에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '끝난 날을 적는 순간 그 자리에서 알린다' },
      { at: 2, label: '끝을 비우면 계속 선다고 적어 둔다 — 상시 배너가 실제로 있어 막지는 않는다' },
      { at: 3, label: '메인 비주얼에는 본문과 링크 칸이 서지 않는다. 큰 글씨 한 줄이 서는 자리다' },
    ],
    data: ['@winpilot/store · SITE_BANNERS · nextSiteId', '화면 밖에서 받은 오늘'],
    exits: ['사이트 첫 화면 위의 배너 띠에 선다 — 노출을 켜고 기간 안이어야 한다', '메인 비주얼 목록으로'],
  },
  {
    screen: 'banners-detail',
    entries: ['메인 비주얼 목록에서 줄을 눌러'],
    steps: ['채워진 폼을 본다', '제목을 고친다', '기간을 고친다', '노출을 정하고 저장을 누른다'],
    branches: [
      {
        after: 3,
        question: '확인 창에서 저장을 다시 눌렀나',
        block: '창을 닫고 고친 값을 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '없는 코드로 들어오면 404 다' },
      { at: 1, label: '코드와 서는 자리는 고칠 수 없다 — 자리는 메뉴가 정한다' },
      { at: 2, label: '끝난 날을 적으면 그 자리에서 알린다' },
    ],
    data: ['@winpilot/store · SITE_BANNERS · findSiteBanner', '주소의 bannerId'],
    exits: ['사이트 첫 화면 위의 배너 띠에 그대로 나간다', '메인 비주얼 목록으로'],
  },
  {
    screen: 'banners-popups',
    entries: ['사이드바 배너 · 팝업'],
    steps: ['제목으로 검색한다', '상태로 거른다', '기간이 겹치는 것이 있는지 한 칸에서 본다', '줄을 눌러 상세로 가거나 등록으로 간다'],
    branches: [
      {
        after: 2,
        question: '같은 기간에 뜨는 것이 둘 이상인가',
        pass: '예',
        block: '그대로 두고 상세나 등록으로 넘어간다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '창이 둘이면 들어온 사람이 하는 일은 둘 다 닫는 것이고, 그러면 알리려던 것도 읽히지 않는다' },
      { at: 3, label: '메인 비주얼과 값은 한 벌이고 slot 으로 갈린다' },
    ],
    data: ['@winpilot/store · SITE_BANNERS (slot = 팝업)', '화면 밖에서 받은 오늘'],
    exits: ['상세로 — /banners/popups/[popupId]', '등록으로 — /banners/popups/new'],
  },
  {
    screen: 'banners-popups-new',
    entries: ['팝업 목록 툴바의 팝업 등록 단추'],
    steps: ['빈 폼을 연다', '제목과 본문을 넣는다', '자세히 보기 주소를 넣는다', '기간과 노출을 정하고 등록을 누른다'],
    branches: [
      {
        after: 1,
        question: '본문이 찼나',
        block: '팝업은 본문이 비면 저장할 수 없다고 그 칸 아래에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '제목만 뜬 팝업은 무슨 일이 있는데 뭔지는 안 알려 주는 상자로 보인다' },
      { at: 2, label: '링크를 비우면 단추가 서지 않는다 — 사이트 안의 주소를 적는다' },
      { at: 3, label: '자리를 고르는 칸을 두지 않는다. 모서리에 조용히 서는 자리에 놓인 팝업은 안 읽힌다' },
    ],
    data: ['@winpilot/store · SITE_BANNERS · nextSiteId', '화면 밖에서 받은 오늘'],
    exits: ['사이트에 들어오면 뜨는 창이 된다 — 노출을 켜고 기간 안이어야 한다', '팝업 목록으로'],
  },
  {
    screen: 'banners-popups-detail',
    entries: ['팝업 목록에서 줄을 눌러'],
    steps: ['채워진 폼을 본다', '제목과 본문을 고친다', '링크와 기간을 고친다', '노출을 정하고 저장을 누른다'],
    branches: [
      {
        after: 1,
        question: '본문이 남아 있나',
        block: '본문을 비운 채로는 저장할 수 없다고 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '없는 코드로 들어오면 404 다' },
      { at: 2, label: '끝난 날을 적으면 그 자리에서 알린다' },
      { at: 3, label: '돌아갈 목록이 메인 비주얼과 다르다 — 메뉴가 둘이다' },
    ],
    data: ['@winpilot/store · SITE_BANNERS · findSiteBanner', '주소의 popupId'],
    exits: ['사이트에 들어오면 뜨는 창에 그대로 나간다', '팝업 목록으로'],
  },
  {
    screen: 'statistics',
    entries: ['사이드바 통계 · 홈'],
    steps: ['달마다의 방문 막대를 훑는다', '막대 아래의 문의 수와 견준다', '많이 본 화면 목록을 확인한다'],
    branches: [
      {
        after: 1,
        question: '방문은 늘었는데 문의는 그대로인 달이 있나',
        pass: '예',
        block: '그대로 둔다 — 손댈 것이 없다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '막대는 CSS 로 그린다. 그래프 라이브러리를 들이면 콘솔 첫 화면이 그만큼 늦게 뜬다' },
      { at: 2, label: '숫자는 아직 씨앗이다 — 실제로 세는 곳이 없다' },
    ],
    data: ['@winpilot/store · VISIT_TREND · PAGE_VISITS · SITE_INQUIRIES'],
    exits: ['기간별 분석이나 많이 방문한 페이지로 — 보조 메뉴에서 고른다'],
  },
  {
    screen: 'statistics-period',
    entries: ['사이드바 통계 · 기간별 분석'],
    steps: ['달마다의 방문을 읽는다', '같은 달의 문의 수와 나란히 견준다'],
    branches: [],
    exceptions: [
      { at: 1, label: '방문이 늘어도 문의가 늘지 않으면 손대야 하는 것은 광고가 아니라 화면이다' },
      { at: 1, label: '숫자는 아직 씨앗이다' },
    ],
    data: ['@winpilot/store · VISIT_TREND'],
    exits: ['읽고 나간다 — 고칠 화면은 콘텐츠 · 제품 갈래에 있다'],
  },
  {
    screen: 'statistics-pages',
    entries: ['사이드바 통계 · 많이 방문한 페이지'],
    steps: ['방문이 많은 화면을 읽는다', '머문 시간이 짧은 줄을 찾는다'],
    branches: [
      {
        after: 1,
        question: '방문은 많은데 머문 시간이 짧은 화면이 있나',
        pass: '예',
        block: '그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '방문만 보면 홈이 늘 1등이라 아무것도 알 수 없다' },
      { at: 1, label: '들어왔다 바로 나간 자리가 고쳐야 할 화면이다' },
    ],
    data: ['@winpilot/store · PAGE_VISITS'],
    exits: ['읽고 나간다'],
  },
  {
    screen: 'settings-supplier',
    entries: ['사이드바 설정 · 공급자 정보'],
    steps: ['등록증을 옆에 두고 상호와 대표자를 적는다', '사업자등록번호와 신고번호를 적는다', '업태를 고르고 그 아래 업종을 고른다', '주소와 연락처를 적고 저장을 누른다'],
    branches: [
      {
        after: 3,
        question: '법이 적으라고 한 칸이 다 찼나',
        block: '비어 있는 칸이 몇 개인지 토스트에 적고 확인 창을 열지 않는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '업태를 바꾸면 업종이 그 아래 첫 값으로 되돌아간다 — 등록증에 있을 수 없는 짝을 막는다' },
      { at: 3, label: '이 값은 사이트 모든 화면 아래에 그대로 나간다. 번호 한 자리가 틀린 것은 밖에서 먼저 발견된다' },
    ],
    data: ['@winpilot/store · SITE_SUPPLIER · BUSINESS_TYPES · BUSINESS_ITEMS'],
    exits: ['사이트 모든 화면 아래의 사업자 표시에 그대로 나간다', '같은 화면에 머물고 토스트로 알린다'],
  },
  {
    screen: 'settings-seo',
    entries: ['사이드바 설정 · SEO 정보'],
    steps: ['제목을 적으며 남은 글자를 본다', '설명을 적는다', '대표 주소를 넣는다', '공유 그림 경로를 넣고 저장을 누른다'],
    branches: [
      {
        after: 3,
        question: '확인 창에서 저장을 다시 눌렀나',
        block: '창을 닫고 적은 값을 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '길이를 넘겨도 막지 않는다 — 잘려도 되는 문장이 있다' },
      { at: 1, label: '잘린 자리가 문장 가운데면 무슨 회사인지 읽히지 않는데, 그 사실은 검색 결과에 뜨기 전까지 모른다' },
      { at: 3, label: '그림을 비우면 링크가 글자만으로 떠서 눌리지 않는다' },
    ],
    data: ['@winpilot/store · SITE_SEO'],
    exits: ['검색 결과 한 줄과 메신저 공유 카드에 그대로 나간다', '같은 화면에 머물고 토스트로 알린다'],
  },
  {
    screen: 'settings-terms',
    entries: ['사이드바 설정 · 서비스 이용약관'],
    steps: ['법무 검토를 지난 글을 붙여 넣는다', '사이트에 걸지 초안으로 둘지 고른다', '저장을 누른다'],
    branches: [
      {
        after: 1,
        question: '사이트에 거는가',
        block: '초안으로 저장한다 — 사이트에는 준비 중이라는 사실만 선다',
        blockLabel: '아니오',
      },
      {
        after: 2,
        question: '본문이 차 있나',
        block: '본문이 비어 있으면 걸 수 없다고 토스트로 알린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '견본을 그대로 두면 지키지 못할 조항이 섞이고, 문서 전체의 신뢰가 깎인다' },
      { at: 1, label: '검토 전 초안이 걸리면 그 순간부터 그것이 우리가 주장하는 문서가 된다' },
    ],
    data: ['@winpilot/store · LEGAL_DOCS'],
    exits: ['사이트 아래의 서비스 이용약관 링크가 여는 글이 된다', '초안이면 사이트에는 준비 중만 선다'],
  },
  {
    screen: 'settings-privacy',
    entries: ['사이드바 설정 · 개인정보 처리방침', '문의 설정에서 받는 칸을 바꾼 날'],
    steps: ['문의 양식이 실제로 받는 칸과 맞춰 본문을 적는다', '보관 기간이 서버가 하는 일과 같은지 본다', '걸지 초안으로 둘지 고르고 저장을 누른다'],
    branches: [
      {
        after: 2,
        question: '본문이 차 있나',
        block: '본문이 비어 있으면 걸 수 없다고 토스트로 알린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '문의 양식이 받는 칸이 여기 없으면 동의 없이 받은 것이 된다' },
      { at: 1, label: '보관 기간을 1년으로 적고 서버가 3년을 들고 있으면 그것이 곧 위반이다' },
      { at: 2, label: '공개를 저장과 따로 둔다 — 검토를 기다리는 동안 사이트에는 준비 중만 서야 한다' },
    ],
    data: ['@winpilot/store · LEGAL_DOCS'],
    exits: ['사이트 아래의 개인정보 처리방침 링크가 여는 글이 된다', '초안이면 사이트에는 준비 중만 선다'],
  },
  {
    screen: 'settings-locales',
    entries: ['사이드바 설정 · 국문 · 영문'],
    steps: ['한 줄에 나란히 선 두 언어에서 아직 없음 을 찾는다', '줄을 눌러 고치는 창을 연다', '국문과 영문을 적고 저장을 누른다'],
    branches: [
      {
        after: 2,
        question: '국문이 차 있나',
        block: '저장하지 못했다고 알린다 — 국문이 비면 사이트의 그 자리가 통째로 사라진다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '영문만 빠진 자리는 해외 투자자에게 그 자리가 없는 것과 같다' },
      { at: 2, label: '틀린 값은 확인 창까지 가지 않는다 — 물어봐야 할 것이 없다' },
      { at: 2, label: '확인 창은 어느 자리를 어떤 말로 바꾸는지 한 번 더 보여 준다' },
    ],
    data: ['@winpilot/store · LOCALE_PAIRS · missingEnglish'],
    exits: ['사이트의 메뉴 이름과 화면 제목이 두 언어로 바뀐다', '같은 화면에 머물고 영문이 아직 없는지까지 토스트에 적는다'],
  },
  {
    screen: 'result',
    entries: ['되돌릴 수 없는 일을 마친 뒤 /result?state=…'],
    steps: ['무엇이 끝났는지 읽는다', '처리 번호를 확인한다', '돌아갈 곳을 고른다'],
    branches: [
      {
        after: 0,
        question: '성공인가',
        block: '실패 문구와 붉은 표시로 그린다 — 입력값을 확인하고 다시 시도하라고 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '처리 번호는 id 가 있을 때만 선다 — 문의할 때 그대로 옮기는 값이다' },
      { at: 2, label: '메뉴에 없는 화면이라 사이드바에서 켜지는 항목이 없다' },
    ],
    data: ['주소 질의문자열 (state · kind · id)'],
    exits: ['kind 에 맞는 목록으로', '대시보드로'],
  },
];

/**
 * 운영자 여정 — **화면 하나로는 안 끝나는 일**을 갈래로 묶은 것.
 *
 * 어드민의 화면별 흐름은 목록에서 시작해 목록으로 돌아오는 짧은 고리라, 그것만 보면
 * "공지 하나를 실제로 사이트에 걸기까지 무엇을 거치는가" 가 보이지 않는다. 그래서 여기 `steps` 는
 * 화면 안 동작이 아니라 **화면 이름**으로 적는다.
 */
export const JOURNEYS: NamedFlow[] = [
  {
    id: 'inquiry',
    title: '문의 받아 답하기',
    purpose: '밖에서 들어온 것을 늦지 않게 닫고, 같은 물음을 다시 받지 않게 한다.',
    entries: ['콘솔을 열면 사이드바 맨 앞의 문의'],
    steps: [
      '문의 목록에서 아직 답하지 않은 건을 찾는다',
      '문의 상세에서 지역과 연락처를 읽고 답을 적는다',
      '문의 상세에서 답변완료로 옮긴다',
      'FAQ 등록에 되풀이되는 물음을 옮겨 적는다',
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
      { at: 1, label: '보낸 사람의 글은 고칠 수 없다' },
      { at: 2, label: '답 없이 완료로 옮길 수 없다. 완료된 문의는 목록에서 사라져 다시는 눈에 띄지 않는다' },
    ],
    data: ['@winpilot/store · SITE_INQUIRIES', '@winpilot/store · SITE_FAQS'],
    exits: ['사이트 CS CENTER FAQ 에 같은 물음이 생기고, 대시보드의 답변 대기 수가 준다'],
  },
  {
    id: 'notice',
    title: '알릴 것 걸기',
    purpose: '읽히지 않으면 뜻이 없는 고지를 공지와 팝업 두 자리에 함께 세운다.',
    entries: ['사이드바 콘텐츠 · 공지사항'],
    steps: [
      '공지사항 목록에서 이미 고정한 글이 몇인지 센다',
      '공지사항 등록에서 제목과 본문을 적는다',
      '공지사항 상세에서 고정과 노출을 켠다',
      '팝업 목록에서 같은 기간에 뜨는 것을 정리한다',
      '팝업 등록에서 본문과 기간을 적어 창을 띄운다',
    ],
    branches: [
      {
        after: 0,
        question: '고정한 글이 이미 셋인가',
        pass: '예',
        block: '그대로 새 글을 쓴다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '고정은 사이트 목록의 차례에서만 드러난다 — 다 알린 뒤에는 꺼야 한다' },
      { at: 3, label: '같은 기간에 창이 둘이면 들어온 사람이 하는 일은 둘 다 닫는 것이다' },
      { at: 4, label: '팝업은 본문이 비면 저장되지 않는다' },
    ],
    data: ['@winpilot/store · SITE_NOTICES', '@winpilot/store · SITE_BANNERS'],
    exits: ['사이트 공지사항 목록에 글이 서고, 들어오는 사람에게 창이 한 번 뜬다'],
  },
  {
    id: 'offering',
    title: '파는 것 손보기',
    purpose: '제품 · 문제 · 해법 · 서비스가 같은 값을 가리키므로 한 바퀴 돌며 어긋난 데를 찾는다.',
    entries: ['사이드바 제품 · 목록'],
    steps: [
      '제품 목록에서 이름과 상태를 확인한다',
      '제품 상세에서 카드에 실리는 말을 다듬는다',
      '문제 · 해법 목록에서 구성 층과 절차가 찼는지 본다',
      '서비스 설정에서 홈 카드의 말과 상세의 말을 견준다',
      '제품 설정에서 메뉴 차례와 노출을 정한다',
    ],
    branches: [
      {
        after: 3,
        question: '두 자리에 적힌 말이 같은가',
        block: '서비스 목록 · 상세로 가서 어느 쪽이 맞는지 정해 고친다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '구조(기능 · 구성 · 업종 · 절차)는 고칠 수 없다 — 화면이 그 개수를 전제로 그려져 있다' },
      { at: 2, label: '제품과 문제 · 해법은 같은 값을 다른 칸으로 본다. 값을 두 벌로 두면 그 둘이 어긋난다' },
      { at: 4, label: '숨긴 제품은 메뉴에서 사라지고 상세 화면도 열리지 않는다' },
    ],
    data: ['@winpilot/store · SOLUTIONS · SERVICE_DETAILS · SITE_SERVICES'],
    exits: ['사이트 홈 카드 · PRODUCT 메뉴 · 제품 상세 화면이 함께 바뀐다'],
  },
  {
    id: 'legal',
    title: '법이 정한 글 맞추기',
    purpose: '문의 양식이 받는 칸과 처리방침에 적힌 것을 한 번에 맞춘다 — 한쪽만 고치면 위반이 된다.',
    entries: ['사이드바 문의 · 설정'],
    steps: [
      '문의 설정에서 양식이 실제로 받는 칸을 읽는다',
      '개인정보 처리방침에서 수집 항목이 같은지 본다',
      '서비스 이용약관에서 지키지 못할 조항이 없는지 본다',
      '공급자 정보에서 법이 적으라고 한 칸이 다 찼는지 본다',
    ],
    branches: [
      {
        after: 1,
        question: '양식의 칸과 처리방침이 같은가',
        block: '처리방침을 먼저 고친다 — 칸을 끄는 자리는 화면에 없다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '양식의 칸은 화면에서 끄지 못한다. 두 자리를 한 번에 손볼 수 있을 때 코드에서 한다' },
      { at: 2, label: '약관은 적히는 순간 우리가 효력을 주장하는 문서가 된다' },
      { at: 3, label: '공급자 정보가 빠지면 과태료가 붙는다' },
    ],
    data: ['@winpilot/store · SITE_INQUIRY_KINDS · LEGAL_DOCS · SITE_SUPPLIER'],
    exits: ['사이트 아래의 두 링크와 사업자 표시가 실제로 하는 일과 같아진다'],
  },
];

/**
 * 어디서든 같은 흐름 — 화면마다 되풀이해 적지 않는다.
 *
 * 54개 흐름에 내비게이션 · 저장 · 지우기 · 오류를 다 적으면 화면마다 같은 네 줄이 붙어 정작
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
      { at: 0, label: '공시 · 재무 · 주주 · 자료 열은 IR 갈래 하나에 담긴다 — 넷으로 세우면 최상위가 열넷이 되어 문의가 아래로 밀린다' },
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
    entries: ['상세나 등록 화면의 저장 단추', '설정 화면 카드마다의 저장 단추'],
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
    steps: ['지울지 노출만 끌지 고른다', '확인 창이 무엇이 사이트에서 사라지는지 적는다', '삭제를 다시 눌러 끝낸다'],
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
      { at: 0, label: '문의에는 지우는 자리가 없다 — 밖에서 들어온 기록이다' },
      { at: 0, label: '제품 · 문제 · 해법 · 서비스에도 없다. 상세 주소가 코드로 짜여 있어 지워도 그 화면은 열린다' },
      { at: 1, label: '확인 창은 표가 세운다 — 화면마다 세우게 두면 한 화면에서 빠지고, 알아차리는 때는 이미 지워진 뒤다' },
      { at: 2, label: '하나를 지우든 골라 지우든 같은 확인 창을 지난다' },
    ],
    data: ['목록 화면이 이미 들고 있는 줄'],
    exits: ['같은 목록에 머문다 — 노출만 끈 것은 사이트에서만 빠지고 목록에는 남는다'],
  },
  {
    id: 'error',
    title: '오류',
    purpose: '막혔을 때 어디서 막혔는지와 돌아갈 길을 함께 준다.',
    entries: ['없는 주소를 열었을 때', '처리 도중 예외가 났을 때'],
    steps: ['무엇이 막혔는지 한 줄로 알린다', '404 인지 처리 중 오류인지 가른다', '돌아갈 길을 고른다'],
    branches: [
      {
        after: 1,
        question: '주소 자체가 없는가',
        pass: '예',
        block: '오류 식별자와 함께 처리 중 오류 화면을 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '두 화면 모두 같은 StatusScreen 을 쓴다 — 문구와 코드만 갈린다' },
      { at: 1, label: '404 와 오류는 Next 의 약속된 파일이라 매니페스트에 올리지 않는다' },
      { at: 2, label: '다시 시도 단추를 두지 않는다 — 같은 오류가 반복되면 단추만 계속 누르게 된다' },
      { at: 2, label: '오류 식별자를 화면에 적어 둔다. 문의할 때 그대로 옮길 수 있다' },
    ],
    data: ['Next 가 넘기는 오류 식별자'],
    exits: ['문의 목록으로', '대시보드로'],
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
