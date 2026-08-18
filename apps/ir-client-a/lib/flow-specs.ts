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
 * `data` 에 적는 것은 공유 시드 패키지(`@winpilot/store` 의 `ir.ts` · `site.ts` · `company.ts`)와
 * 브라우저 상태뿐이고, 밖으로 나가는 것은 공시 상세의 DART 원문 링크 하나다. 있지도 않은 API 를
 * 흐름에 그리면 그 도면을 보고 만드는 사람이 서버를 찾는다.
 *
 * 양식 화면의 `exits` 가 토스트에서 끝나는 것도 같은 까닭이다 — 보낸 것이 쌓이는 곳이 아직 없다.
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
    entries: ['주소를 바로 열어', '어느 화면에서든 로고를 눌러', '검색으로'],
    steps: [
      '첫 화면에서 무슨 회사인지를 한 문장으로 읽는다',
      '소개 칸에서 세 문장을 읽는다',
      '서비스 무대에서 여섯이 한 줄로 이어진 것을 본다',
      '솔루션 칸을 넘겨 하나를 자세히 읽는다',
      '맨 아래 영상 줄을 민다',
    ],
    branches: [
      {
        after: 0,
        question: '오늘 걸린 팝업이 있나',
        pass: '있음',
        block: '팝업 없이 첫 화면이 그대로 열린다',
        blockLabel: '없음',
      },
    ],
    exceptions: [
      { at: 0, label: '첫 화면에 매출 · 배당 같은 숫자를 두지 않는다 — 무엇을 만드는 회사인지 모른 채 표를 보게 된다' },
      { at: 2, label: '무대는 저절로 넘어가지 않는다. 첫 화면이 이미 넘어가고 있어, 여기까지 움직이면 읽는 중에 글이 바뀐다' },
      { at: 3, label: '내려 둔 제품은 솔루션 칸에 오지 않는다' },
      { at: 4, label: '영상 파일이 아직 없어 갈래마다 다른 무늬와 재생 표시가 대신한다' },
    ],
    data: [
      '@winpilot/store · IR_COMPANY',
      '@winpilot/store · SITE_SERVICES (siteServiceHref)',
      '@winpilot/store · SOLUTIONS (publicSolutions)',
      '@winpilot/store · MEDIA_CLIPS (publicMediaClips)',
      '@winpilot/store · SITE_BANNERS (liveSitePopups)',
    ],
    exits: ['회사 소개로', '고른 서비스 · 제품 상세로', '뉴스로', '푸터에서 어느 갈래로든'],
  },
  {
    screen: 'about',
    entries: ['헤더의 ABOUT', '헤더 펼침의 회사 소개', '홈 소개 칸의 자세히 보기', '푸터의 회사 소개'],
    steps: [
      '한 줄 소개를 읽는다',
      '숫자 넉 줄에서 설립 · 상장 · 연혁 수 · 특허와 인증 수를 잰다',
      '회사 정보 표에서 대표 · 사업자등록번호 · 본사를 확인한다',
    ],
    branches: [],
    exceptions: [
      { at: 1, label: '숫자 넉 줄은 지어내지 않고 이미 있는 값을 센다 — 숨긴 연혁과 비공개 특허·인증은 들지 않는다' },
      { at: 2, label: '긴 소개 글을 두지 않는다. 홈이 이미 말했고, 같은 말이 두 곳에 있으면 한쪽만 고쳐진다' },
      { at: 2, label: '끝에 두었던 바로가기 두 장을 뺐다 — 연혁과 특허 및 인증은 헤더 펼침에 이미 서 있다' },
    ],
    data: [
      '@winpilot/store · IR_COMPANY',
      '@winpilot/store · MILESTONES',
      '@winpilot/store · CREDENTIALS (publicCredentials)',
    ],
    exits: ['여기서 끝난다 — 화면 안에 나가는 길이 없다', '헤더 펼침으로 연혁 · 특허 및 인증으로'],
  },
  {
    screen: 'about-history',
    entries: ['헤더 펼침의 연혁', '푸터의 연혁'],
    steps: ['맨 위의 가장 최근 해부터 읽는다', '왼쪽 기둥의 해를 따라 내려간다', '같은 해의 일들을 묶음으로 읽는다'],
    branches: [
      {
        after: 0,
        question: '보이는 연혁이 있나',
        pass: '있음',
        block: '등록된 연혁이 없습니다 한 줄',
        blockLabel: '0건',
      },
    ],
    exceptions: [
      { at: 0, label: '숨긴 연혁은 오지 않는다' },
      { at: 1, label: '위가 최신이다. 오래된 것부터 쌓으면 지금 무엇을 하는 회사인지가 맨 아래에 있게 된다' },
      { at: 2, label: '월이 비어 있으면 날짜 표기로 대신한다 — 빈 자리를 그대로 두지 않는다' },
    ],
    data: ['@winpilot/store · MILESTONES (sortMilestones · milestoneDate)'],
    exits: ['여기서 끝난다 — 읽고 나면 돌아 나간다'],
  },
  {
    screen: 'about-certifications',
    entries: ['헤더 펼침의 특허 및 인증', '푸터의 특허 및 인증', '등록번호를 들고 검색으로'],
    steps: [
      '왼쪽에서 구분을 고른다',
      '이름 · 번호 · 발급처로 찾는다',
      '남은 개수를 확인한다',
      '줄에서 번호와 발급처를 확인한다',
    ],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 것이 있나',
        pass: '있음',
        block: '조건에 맞는 특허·인증이 없습니다 한 줄',
        blockLabel: '0건',
      },
    ],
    exceptions: [
      { at: 0, label: '구분 옆의 수는 거르기 전 전체다 — 고르기 전에 보여야 하고, 그 숫자만 보고 돌아가는 사람도 있다' },
      { at: 1, label: '검색이 번호까지 훑는다. 여기 오는 사람의 절반은 계약서에 적힌 번호를 들고 온다' },
      { at: 2, label: '거른 뒤 몇 개가 남았는지 적는다 — 없으면 거른 탓인지 원래 없는 탓인지 알 수 없다' },
      { at: 3, label: '비공개 특허·인증은 오지 않는다' },
    ],
    data: ['@winpilot/store · CREDENTIALS (publicCredentials)'],
    exits: ['줄을 눌러 상세로 — /about/certifications/[credentialId]'],
  },
  {
    screen: 'about-certifications-detail',
    entries: ['특허 목록에서 줄을 눌러', '메일이나 제안서에 걸린 주소를 바로 열어'],
    steps: [
      '이름과 구분 · 발급처를 읽는다',
      '값 표에서 등록번호를 옮겨 적거나 대조한다',
      '같은 갈래의 다른 것으로 넘어간다',
      '목록으로 돌아간다',
    ],
    branches: [
      {
        after: 0,
        question: '공개된 것인가',
        pass: '공개',
        block: '404 — 내려 둔 것은 주소로도 안 열린다',
        blockLabel: '비공개',
      },
    ],
    exceptions: [
      { at: 1, label: '번호와 취득일은 고정폭이다 — 자릿수가 눈으로 맞아야 대조가 된다' },
      { at: 2, label: '이웃은 같은 구분에서만 넷까지다. 더 두면 이 화면이 두 번째 목록이 된다' },
      { at: 3, label: '주소로 바로 들어온 사람은 뒤로 갈 곳이 없다 — 그래서 위에 돌아가는 길을 둔다' },
    ],
    data: ['@winpilot/store · CREDENTIALS (findCredential · publicCredentials)'],
    exits: ['같은 갈래의 다른 특허·인증으로', '특허 및 인증 목록으로'],
  },
  {
    screen: 'solutions-consulting',
    entries: ['헤더의 SOLUTION', '헤더 펼침의 스마트 컨설팅', '홈 무대의 자세히 보기', '제품 목록의 서비스 묶음', '푸터의 스마트 컨설팅'],
    steps: [
      '문제를 읽고 내 이야기인지 잰다',
      '어떻게 푸는지 기능 넷을 읽는다',
      '우리 설비와 어디서 붙는지 층 목록을 본다',
      '성과와 업종을 확인한다',
      '절차와 걸리는 기간을 읽는다',
      '맨 아래 문의 칸으로 간다',
    ],
    branches: [
      {
        after: 0,
        question: '내 이야기인가',
        pass: '맞다',
        block: '여기서 닫는다 — 기능부터 늘어놓았다면 스무 개 이름을 지나서야 그것을 알았다',
        blockLabel: '아니다',
      },
    ],
    exceptions: [
      { at: 0, label: '값을 찾지 못하면 404 다. 빈 칸이 늘어선 상세는 만들다 만 화면으로 보인다' },
      { at: 2, label: '구성도를 그림이 아니라 층 목록으로 둔다 — 좁은 화면에서 글자가 뭉개지지 않고 층이 늘어도 다시 그리지 않는다' },
      { at: 3, label: '성과에 숫자를 적지 않는다. 현장마다 달라, 적으면 그것이 약속이 된다' },
    ],
    data: ['@winpilot/store · SERVICE_DETAILS (findOffering)'],
    exits: ['문의하기로'],
  },
  {
    screen: 'solutions-infra',
    entries: ['헤더 펼침의 인프라 서비스', '홈 무대의 자세히 보기', '제품 목록의 서비스 묶음', '푸터의 인프라 서비스'],
    steps: [
      '문제를 읽는다',
      '기능 넷과 구성 층을 본다',
      '성과와 업종을 확인한다',
      '절차와 걸리는 기간을 읽는다',
      '맨 아래 문의 칸으로 간다',
    ],
    branches: [],
    exceptions: [
      { at: 0, label: '전에는 메뉴의 인프라 서비스가 제품 소개로 갔다 — 거기 서 있는 것이 제품 넷이라 잘못 눌렀다고 여긴다' },
      { at: 0, label: '값을 찾지 못하면 404 다' },
      { at: 3, label: '절차마다 기간을 함께 적는다. 절차만 적으면 그래서 몇 달 걸리나가 그대로 문의로 남는다' },
    ],
    data: ['@winpilot/store · SERVICE_DETAILS (findOffering)'],
    exits: ['문의하기로'],
  },
  {
    screen: 'solutions-mes',
    entries: ['제품 목록의 카드', '홈 무대 · 솔루션 칸의 자세히 보기', '푸터의 Cloud MES'],
    steps: [
      '문제를 읽는다',
      '기능 넷을 읽는다',
      '설비와 어디서 붙는지 층 목록을 본다',
      '성과 · 업종 · 절차를 확인한다',
      '맨 아래 문의 칸으로 간다',
    ],
    branches: [],
    exceptions: [
      { at: 0, label: '값을 찾지 못하면 404 다' },
      { at: 0, label: '내려 둔 제품도 주소로는 열린다 — 아직 팔지 않는 제품의 소개를 미리 만들어 두고 길만 감추는 일이 흔하다' },
      { at: 1, label: '기능은 넷으로 고정한다. 다섯째부터는 앞의 넷을 다시 말하는 줄이 되기 쉽다' },
    ],
    data: ['@winpilot/store · SOLUTIONS (findOffering)'],
    exits: ['문의하기로', '제품 목록으로 (헤더가 감춰져 있어 푸터나 뒤로가기)'],
  },
  {
    screen: 'solutions-erp',
    entries: ['제품 목록의 카드', '홈 무대 · 솔루션 칸의 자세히 보기', '푸터의 Cloud ERP'],
    steps: ['문제를 읽는다', '기능 넷과 구성 층을 본다', '성과 · 업종 · 절차를 확인한다', '맨 아래 문의 칸으로 간다'],
    branches: [],
    exceptions: [
      { at: 0, label: '값을 찾지 못하면 404 다' },
      { at: 0, label: '내려 둔 제품도 주소로는 열린다' },
      { at: 2, label: '제품의 성과는 그 제품이 하는 일의 결과라 값이 정해져 있다 — 사람이 붙는 일과 달리 숫자를 적는다' },
    ],
    data: ['@winpilot/store · SOLUTIONS (findOffering)'],
    exits: ['문의하기로', '제품 목록으로'],
  },
  {
    screen: 'solutions-crm',
    entries: ['제품 목록의 카드', '홈 무대 · 솔루션 칸의 자세히 보기', '푸터의 Cloud CRM'],
    steps: ['문제를 읽는다', '기능 넷과 구성 층을 본다', '성과 · 업종 · 절차를 확인한다', '맨 아래 문의 칸으로 간다'],
    branches: [],
    exceptions: [
      { at: 0, label: '값을 찾지 못하면 404 다' },
      { at: 0, label: '한때 이 제품만 뒤처져 자기 화면이 있는데도 홈에서 누르면 목록으로 갔다 — 지금은 카드가 파는 것에게 주소를 묻는다' },
      { at: 2, label: '업종은 실제로 맞는 것만 적는다. 자기 업종이 없으면 검토가 거기서 멈춘다' },
    ],
    data: ['@winpilot/store · SOLUTIONS (findOffering)'],
    exits: ['문의하기로', '제품 목록으로'],
  },
  {
    screen: 'solutions-dxp',
    entries: ['제품 목록의 카드', '홈 무대 · 솔루션 칸의 자세히 보기', '푸터의 Cloud DXP'],
    steps: ['문제를 읽는다', '기능 넷과 구성 층을 본다', '성과 · 업종 · 절차를 확인한다', '맨 아래 문의 칸으로 간다'],
    branches: [],
    exceptions: [
      { at: 0, label: '값을 찾지 못하면 404 다' },
      { at: 0, label: '이 화면이 마지막으로 생겼다. 전에는 이것만 자기 화면이 없어 넷 중 하나만 제품 소개로 튕겨 나갔다' },
      { at: 1, label: '값은 처음부터 넷을 다 들고 있었으므로 화면만 세우면 되는 일이었다' },
    ],
    data: ['@winpilot/store · SOLUTIONS (findOffering)'],
    exits: ['문의하기로', '제품 목록으로'],
  },
  {
    screen: 'products',
    entries: ['푸터의 PRODUCT 갈래', '홈 무대에서 주소를 못 찾았을 때의 대비 경로', '404 화면의 상품 보기'],
    steps: [
      '클라우드 제품 넷을 훑는다',
      '카드에서 한 줄 · 푸는 방법 · 기능 이름 넷을 읽는다',
      '자세히 보기로 제품 상세를 연다',
      '아래 서비스 묶음에서 사람이 붙는 일 둘을 본다',
      '맨 아래 검은 칸에서 진단 문의하기로',
    ],
    branches: [],
    exceptions: [
      { at: 0, label: '헤더의 PRODUCT 갈래는 감춰 두었다 — 화면과 주소는 열리고 푸터에는 그대로 선다' },
      { at: 0, label: '내려 둔 제품은 목록에 오지 않는다' },
      { at: 1, label: '기능은 이름 넷만 싣는다. 여기서 고르는 사람에게 필요한 것은 무엇을 하는 것인가까지다' },
      { at: 3, label: '어느 것이 서비스인지를 이 화면에 이름으로 적지 않는다 — 서비스가 셋이 되는 날 여기만 조용히 둘을 세운다' },
      { at: 3, label: '서비스에는 사진을 붙이지 않는다 — 사람이 하는 일에 사진을 붙이면 그 사진이 결과물처럼 읽힌다' },
    ],
    data: [
      '@winpilot/store · SOLUTIONS (publicSolutions)',
      '@winpilot/store · SITE_SERVICES · SERVICE_DETAILS (siteServiceHref)',
    ],
    exits: ['제품 상세 넷으로', '서비스 상세 둘로', '문의하기로'],
  },
  {
    screen: 'disclosures',
    entries: ['주소를 바로 열어', '검색으로', 'IR 줄의 공시 정보'],
    steps: ['공시일과 갈래를 훑는다', '제목에서 자기 관심을 찾는다', '한 건을 눌러 상세로 간다'],
    branches: [
      {
        after: 0,
        question: '나간 공시가 있나',
        pass: '있음',
        block: '등록된 공시가 없습니다 한 줄',
        blockLabel: '0건',
      },
    ],
    exceptions: [
      { at: 0, label: '작성 중과 검토 요청은 오지 않는다 — 원고를 쓰는 사람과 회사 이름으로 내보내는 사람이 다르다' },
      { at: 0, label: '차례는 공시일 내림차순이고 store 가 정한다. 어드민과 같은 함수로 걸러 두 곳이 갈리지 않는다' },
      { at: 1, label: '정정 공시는 딱지로 알린다. 게시한 것은 되돌릴 수 없고 정정 공시로만 고친다' },
      { at: 2, label: '거르개도 검색도 페이지 나눔도 아직 없다' },
    ],
    data: ['@winpilot/store · DISCLOSURES (publicDisclosures)'],
    exits: ['공시 상세로', 'IR 줄로 다른 여덟 화면으로'],
  },
  {
    screen: 'disclosures-detail',
    entries: ['공시 목록의 줄', '공유받은 주소로 바로', '검색으로'],
    steps: ['제목과 공시일 · 갈래를 확인한다', '본문을 읽는다', 'DART 원문으로 나간다', '목록으로 돌아간다'],
    branches: [
      {
        after: 0,
        question: '나간 공시인가',
        pass: '나갔다',
        block: '404 다 — 나가지 않은 공시는 주소로도 열리지 않는다',
        blockLabel: '원고',
      },
      {
        after: 1,
        question: '정정한 공시인가',
        pass: '정정',
        block: '정정 안내를 그리지 않는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '없는 id 도 404 다. 없는 공시와 아직 안 나간 공시를 갈라 보이면 그 번호의 원고가 있다는 사실이 새어 나간다' },
      { at: 0, label: '미리 만들어 두는 경로는 나간 공시만이다 — 원고까지 만들면 그 화면이 검색에 걸린다' },
      { at: 2, label: '원문 주소가 없으면 그 링크를 그리지 않는다' },
      { at: 3, label: 'IR 줄을 달지 않는다. 목록의 자식이라 돌아가는 길 하나만 둔다' },
    ],
    data: ['@winpilot/store · DISCLOSURES (findDisclosure · publicDisclosures)', 'DART 원문 (dartUrl)'],
    exits: ['공시 정보로', 'DART 원문으로 (새 창)'],
  },
  {
    screen: 'financials',
    entries: ['IR 줄의 재무 정보', '주소를 바로 열어'],
    steps: ['단위와 감사 여부 안내를 읽는다', '기간별로 매출 · 영업이익 · 당기순이익을 견준다', '자산과 부채를 확인한다'],
    branches: [
      {
        after: 1,
        question: '올라온 재무가 있나',
        pass: '있음',
        block: '등록된 재무 정보가 없습니다 한 줄',
        blockLabel: '0건',
      },
    ],
    exceptions: [
      { at: 0, label: '금액 단위는 백만 원이다. 원 단위로 두면 자릿수가 길어 표에서 견줄 수 없다' },
      { at: 0, label: '감사 전 수치가 섞일 수 있다는 것을 제목 줄에 적는다 — 표만 두면 확정된 값으로 읽힌다' },
      { at: 2, label: '자본이나 부채비율 같은 파생 값을 화면에서 세지 않는다' },
    ],
    data: ['@winpilot/store · FINANCIALS'],
    exits: ['IR 줄로 다른 여덟 화면으로'],
  },
  {
    screen: 'stock',
    entries: ['IR 줄의 주가 정보', '주소를 바로 열어'],
    steps: [
      '제목 줄에서 시장 · 종목코드와 지연 시세 고지를 읽는다',
      '현재가와 등락을 본다',
      '숫자 옆의 기준 시각과 지연 표시를 확인한다',
      '거래량 · 시가총액 · 52주 최고와 최저를 본다',
    ],
    branches: [],
    exceptions: [
      { at: 0, label: '지연 시세임을 늘 적는다 — 적지 않으면 실시간으로 읽고 그 차이로 판단한 뒤에야 안다' },
      { at: 1, label: '등락은 색과 함께 화살표를 둔다. 상승이 빨강인 것은 국내 관행이라 색만으로는 반대로 읽힌다' },
      { at: 2, label: '몇 분 지연인지는 적지 않는다. 시세를 어디서 받아 오는지를 정하는 것은 어드민이고 그 값이 아직 사이트로 이어지지 않는다' },
      { at: 3, label: '시가총액만 칸 안에 단위를 적는다 — 다른 값과 자릿수가 크게 달라 빼면 잘못 읽힌다' },
    ],
    data: ['@winpilot/store · STOCK', '@winpilot/store · IR_COMPANY (시장 · 종목코드)'],
    exits: ['IR 줄로 다른 여덟 화면으로'],
  },
  {
    screen: 'dividends',
    entries: ['IR 줄의 배당 정보', '주소를 바로 열어'],
    steps: ['기준일 안내를 읽는다', '사업연도별 주당 배당금을 본다', '배당성향과 시가배당률을 견준다', '기준일과 지급일을 확인한다'],
    branches: [
      {
        after: 1,
        question: '올라온 배당이 있나',
        pass: '있음',
        block: '등록된 배당 정보가 없습니다 한 줄',
        blockLabel: '0건',
      },
    ],
    exceptions: [
      { at: 0, label: '기준일까지 보유한 주주에게 지급된다는 것을 제목 줄에 적는다 — 표에만 두면 값의 한 칸으로 묻힌다' },
      { at: 2, label: '배당성향과 시가배당률을 화면에서 세지 않는다. store 가 든 값을 그대로 적는다' },
      { at: 3, label: '차례는 최신 연도가 위다. 재무 표와 방향이 반대인데, 배당에서 먼저 묻는 것이 올해 얼마인가이기 때문이다' },
    ],
    data: ['@winpilot/store · DIVIDENDS'],
    exits: ['IR 줄로 다른 여덟 화면으로'],
  },
  {
    screen: 'meetings',
    entries: ['IR 줄의 주주총회', '전자투표 안내에서 돌아와', '주소를 바로 열어'],
    steps: [
      '총회 카드의 상태 딱지와 개최일을 본다',
      '장소를 확인한다',
      '안건을 처음부터 끝까지 읽는다',
      '전자투표 안내로 넘어간다',
    ],
    branches: [
      {
        after: 2,
        question: '전자투표를 받는 총회인가',
        pass: '받는다',
        block: '안내 링크를 그리지 않는다 — 없는 길을 세우면 자기 총회가 빠진 줄 안다',
        blockLabel: '안 받는다',
      },
    ],
    exceptions: [
      { at: 0, label: '예정된 총회만 색 있는 딱지를 단다' },
      { at: 0, label: '종료된 총회도 그대로 둔다. 지난 안건을 확인하러 오는 사람이 있다' },
      { at: 2, label: '안건을 전부 적는다. 줄이면 주주가 무엇을 의결하는지 모른 채 참석 여부를 정한다' },
      { at: 2, label: '표가 아니라 카드다 — 안건이 가변 길이 목록이라 표 칸에 들어가지 않는다' },
    ],
    data: ['@winpilot/store · MEETINGS'],
    exits: ['전자투표 안내로', 'IR 줄로 다른 여덟 화면으로'],
  },
  {
    screen: 'meetings-voting',
    entries: ['주주총회 카드의 전자투표 안내'],
    steps: [
      '지금 행사할 수 있는 총회와 개최일을 확인한다',
      '준비물 셋을 읽는다',
      '행사 기간이 총회일 전날까지임을 확인한다',
      '여기서는 투표할 수 없다는 고지를 읽는다',
    ],
    branches: [
      {
        after: 0,
        question: '예정이면서 전자투표를 받는 총회가 있나',
        pass: '있음',
        block: '지금 전자투표를 받는 총회가 없습니다 한 줄',
        blockLabel: '없음',
      },
    ],
    exceptions: [
      { at: 0, label: '종료된 총회는 전자투표를 받았더라도 여기 서지 않는다' },
      { at: 0, label: '대상 총회를 하나만 세운다 — 여럿을 세우면 어느 것에 투표하는지 흐려진다' },
      { at: 3, label: '여기서 투표하지 않는다. 투표 단추를 흉내 내 두면 눌러 놓고 표가 들어간 줄 안다' },
      { at: 3, label: '전자투표시스템으로 나가는 링크가 아직 없다 — 기관 이름만 글로 적는다' },
    ],
    data: ['@winpilot/store · MEETINGS (예정 · 전자투표)'],
    exits: ['주주총회로 돌아간다', '예탁결제원 전자투표시스템에서 투표한다 (사이트 밖)'],
  },
  {
    screen: 'governance',
    entries: ['IR 줄의 지배구조', '주소를 바로 열어'],
    steps: ['이사회 구성을 이름 · 직위 · 구분으로 읽는다', '주요 경력을 확인한다', '주주 현황과 지분율을 본다'],
    branches: [
      {
        after: 0,
        question: '등록된 임원이 있나',
        pass: '있음',
        block: '등록된 임원이 없습니다 한 줄',
        blockLabel: '0건',
      },
      {
        after: 2,
        question: '등록된 주주가 있나',
        pass: '있음',
        block: '등록된 주주 정보가 없습니다 한 줄',
        blockLabel: '0건',
      },
    ],
    exceptions: [
      { at: 0, label: '사외인지 사내인지를 이름 · 직위 바로 옆에 둔다 — 지배구조에서 가장 먼저 읽는 값이다' },
      { at: 2, label: '지분 합이 맞는지 재는 것은 어드민이 한다. 두 곳에서 재면 어느 쪽이 맞는지 화면으로는 알 수 없다' },
      { at: 2, label: '차례는 store 가 든 순서 그대로다 — 서열과 지분 순서가 그 차례에 이미 있다' },
    ],
    data: ['@winpilot/store · OFFICERS', '@winpilot/store · SHAREHOLDERS'],
    exits: ['IR 줄로 다른 여덟 화면으로'],
  },
  {
    screen: 'library',
    entries: ['IR 줄의 IR 자료실', '주소를 바로 열어'],
    steps: ['자료 제목과 구분을 훑는다', '올린 날을 본다', '크기를 확인한다', '제목을 눌러 내려받는다'],
    branches: [
      {
        after: 0,
        question: '올라온 자료가 있나',
        pass: '있음',
        block: '등록된 자료가 없습니다 한 줄',
        blockLabel: '0건',
      },
    ],
    exceptions: [
      { at: 2, label: '크기를 반드시 적는다 — 모바일에서 8MB 를 모르고 누르는 것과 알고 누르는 것은 다르다' },
      { at: 3, label: '파일이 아직 붙지 않았다. 눌러도 받아지는 것이 없다' },
      { at: 3, label: '제목만 링크다 — 줄 전체를 링크로 두면 크기를 읽으려다 파일이 받아진다' },
    ],
    data: ['@winpilot/store · IR_DOCUMENTS'],
    exits: ['파일을 받는다 (아직 붙지 않았다)', 'IR 줄로 다른 여덟 화면으로'],
  },
  {
    screen: 'schedules',
    entries: ['IR 줄의 IR 일정', '주소를 바로 열어'],
    steps: ['지난 일정은 보이지 않는다는 안내를 읽는다', '가까운 날부터 일정을 본다', '구분과 메모를 확인한다'],
    branches: [
      {
        after: 1,
        question: '앞으로 올 일정이 있나',
        pass: '있음',
        block: '예정된 일정이 없습니다 한 줄',
        blockLabel: '0건',
      },
    ],
    exceptions: [
      { at: 1, label: '자르는 일은 화면이 아니라 store 가 한다 — 화면에서 다시 기간을 재면 어드민이 말하는 상태와 갈릴 수 있다' },
      { at: 1, label: '오늘 것은 남고 어제 것은 빠진다' },
      { at: 2, label: '메모가 비어 있으면 대시를 찍는다. 빈 칸은 값이 없는 것인지 못 받은 것인지 알 수 없다' },
    ],
    data: ['@winpilot/store · IR_SCHEDULES (upcomingSchedules)'],
    exits: ['IR 줄로 다른 여덟 화면으로'],
  },
  {
    screen: 'subscribe',
    entries: ['IR 줄의 공시 구독', '주소를 바로 열어'],
    steps: [
      '확인 메일 절차를 제목 아래에서 읽는다',
      '메일 주소를 적는다',
      '받을 공시 갈래를 고른다',
      '개인정보 수집 · 이용에 동의한다',
      '구독 신청을 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '갈래를 골랐나',
        pass: '골랐다',
        block: '막지 않는다 — 고르지 않으면 전부 받는 것으로 본다',
        blockLabel: '안 골랐다',
      },
      {
        after: 4,
        question: '메일 주소와 동의가 맞나',
        pass: '맞음',
        block: '신청하지 못했습니다 토스트와 어긋난 칸 아래의 이유',
        blockLabel: '어긋남',
      },
    ],
    exceptions: [
      { at: 0, label: '확인 메일을 먼저 보낸다 — 확인 안 된 주소로 보내면 스팸 신고가 쌓여 보내던 메일 전체가 막힌다' },
      { at: 2, label: '갈래를 고르게 한다. 전부 받으면 읽지 않게 되고, 읽지 않으면 정작 중요한 공시도 지나친다' },
      { at: 4, label: '검사 결과는 한 번 눌러 본 뒤에만 보인다 — 적기 전부터 붉은 글이 서 있으면 양식이 이미 틀린 것처럼 보인다' },
      { at: 4, label: '프론트엔드 전용 — 신청은 이 화면에만 반영되고 확인 메일도 실제로 나가지 않는다' },
    ],
    data: ['@winpilot/store · DisclosureKind (정기 · 수시 · 공정공시 · 지분)'],
    exits: ['확인 메일을 보냈다는 토스트 — 링크를 눌러야 알림이 시작된다', 'IR 줄로 다른 여덟 화면으로'],
  },
  {
    screen: 'support-contact',
    entries: ['헤더의 CS CENTER', '헤더 펼침의 문의하기', '서비스 · 제품 상세의 문의 칸', '제품 목록의 진단 문의하기', '푸터의 문의하기'],
    steps: [
      '왼쪽에서 문의 갈래를 고른다',
      '창구와 받는 시간을 확인한다',
      '회사명과 지역을 적는다',
      '담당자명 · 휴대폰 · 이메일을 적는다',
      '문의 내용을 적는다',
      '필요하면 파일을 붙인다',
      '공정공시 고지를 읽는다',
      '문의 보내기를 누른다',
    ],
    branches: [
      {
        after: 5,
        question: '붙인 파일이 20MB 안인가',
        pass: '안이다',
        block: '20MB 를 넘는 파일은 이름을 토스트로 알리고 그 파일만 빼고 담는다',
        blockLabel: '넘는다',
      },
      {
        after: 7,
        question: '여섯 항목이 다 맞나',
        pass: '맞음',
        block: '보내지 못했습니다 토스트와 확인이 필요한 항목 수',
        blockLabel: '어긋남',
      },
    ],
    exceptions: [
      { at: 0, label: '갈래를 먼저 고른다 — 받는 사람이 다르다. 누가 받는지는 적지 않는다' },
      { at: 2, label: '지역은 고르지 않음으로 시작한다. 서울이 미리 골라져 있으면 고르지 않은 사람의 문의가 전부 서울로 쌓인다' },
      { at: 3, label: '휴대폰은 비었는지와 형식이 맞는지를 나눠 알린다 — 형식 안내는 빈 칸에 대한 답이 아니다' },
      { at: 5, label: '한도를 넘는 것은 고른 자리에서 바로 거른다. 보낼 때 알리면 무엇이 컸는지도 기억나지 않는다' },
      { at: 6, label: '아직 공시하지 않은 실적 · 전망은 개별로 알려 주지 않는다 — 특정 투자자에게만 미리 알리는 것은 공정공시에 어긋난다' },
      { at: 7, label: '개인정보 수집 · 이용 동의가 아직 없다. 필수 항목을 받고 있으므로 처리방침 원고와 함께 붙일 자리다' },
      { at: 7, label: '프론트엔드 전용 — 보낸 문의는 이 화면에만 반영되고 붙임 파일도 올라가지 않는다' },
    ],
    data: ['@winpilot/store · SITE_REGIONS', '@winpilot/store · IR_COMPANY (창구)'],
    exits: ['문의를 보냈다는 토스트 — 고른 갈래와 적은 메일 주소로 답한다'],
  },
  {
    screen: 'support-notices',
    entries: ['헤더 펼침의 공지사항', '푸터의 공지사항', '팝업의 자세히 보기'],
    steps: ['왼쪽에서 갈래를 고른다', '제목과 본문으로 찾는다', '제목만 훑는다', '읽을 것 하나를 편다'],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 공지가 있나',
        pass: '있음',
        block: '조건에 맞는 공지가 없습니다 한 줄',
        blockLabel: '0건',
      },
      {
        after: 3,
        question: '이미 열린 공지인가',
        pass: '아니오',
        block: '다시 누르면 닫힌다 — 한 번 연 뒤로 무엇이든 하나가 계속 펴져 있지 않게',
        blockLabel: '예',
      },
    ],
    exceptions: [
      { at: 0, label: '숨긴 공지는 서버에서 걸러 보낸다 — 브라우저에서 거르면 화면에는 없어도 페이지 소스에는 남는다' },
      { at: 0, label: '갈래 옆의 건수는 거르기 전 전체다. 거른 뒤로 세면 검색어를 치는 순간 모든 갈래가 0 이 된다' },
      { at: 2, label: '고정한 것이 먼저, 그 안에서 올린 날 내림차순이다. 고정 딱지를 함께 두어 오래된 글이 맨 위에 있는 것으로 읽히지 않게 한다' },
      { at: 3, label: '맨 위 하나는 펴 둔 채로 들어온다 — 전부 접어 두면 펼칠 수 있다는 것조차 모르고 지나간다' },
      { at: 3, label: '상세 화면이 없어 글 하나를 가리키는 주소도 없다. 링크로 보낼 일이 드물어 그 거래를 택했다' },
    ],
    data: ['@winpilot/store · SITE_NOTICES (publicSiteNotices) · SITE_NOTICE_GROUPS'],
    exits: ['여기서 끝난다 — 헤더 펼침으로 CS CENTER 의 다른 화면으로'],
  },
  {
    screen: 'support-news',
    entries: ['홈 맨 아래 영상 줄의 뉴스 전체보기', '헤더 펼침의 뉴스', '푸터의 뉴스'],
    steps: ['왼쪽에서 갈래를 고른다', '제목과 갈래로 찾는다', '격자를 훑는다'],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 뉴스가 있나',
        pass: '있음',
        block: '조건에 맞는 뉴스가 없습니다 한 줄',
        blockLabel: '0건',
      },
    ],
    exceptions: [
      { at: 0, label: '갈래를 값에서 뽑는다 — 적어 두면 새 갈래를 쓰는 날 그 영상만 어느 갈래에도 안 걸린다' },
      { at: 0, label: '숨긴 영상은 오지 않는다' },
      { at: 2, label: '셋 중 여기만 결과가 격자다. 영상은 제목보다 그림으로 고른다' },
      { at: 2, label: '카드는 누를 수 없다 — 영상 파일이 아직 없어, 누를 수 있게 보이면 고장으로 읽는다' },
      { at: 2, label: '무늬는 홈의 줄과 같다. 여기서만 다르게 그리면 같은 영상인지 알 수 없다' },
    ],
    data: ['@winpilot/store · MEDIA_CLIPS (publicMediaClips)'],
    exits: ['여기서 끝난다 — 재생도 상세도 아직 없다'],
  },
  {
    screen: 'support-faq',
    entries: ['헤더 펼침의 FAQ', '푸터의 FAQ'],
    steps: ['왼쪽에서 갈래를 고른다', '물음과 답으로 찾는다', '물음 하나를 펴 답을 읽는다'],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 물음이 있나',
        pass: '있음',
        block: '조건에 맞는 물음이 없습니다 — 찾으시는 것이 없으면 문의를 남겨 달라고 함께 적는다',
        blockLabel: '0건',
      },
      {
        after: 2,
        question: '이미 열린 물음인가',
        pass: '아니오',
        block: '다시 누르면 닫힌다',
        blockLabel: '예',
      },
    ],
    exceptions: [
      { at: 0, label: '갈래는 코드가 정한 셋이다. 한 건도 없는 갈래가 사라지면 그 갈래가 아예 없는 것으로 읽힌다' },
      { at: 1, label: '검색이 답까지 훑는다 — 견적을 치는 사람의 물음은 도입 비용은 어떻게 되나요로 적혀 있다' },
      { at: 2, label: '공지사항과 줄 모양까지 같게 맞췄다. 여기만 브라우저 접기 요소를 써서 줄 높이가 미묘하게 달랐다' },
      { at: 2, label: '한 번에 하나만 펴고 맨 위 하나는 펴 둔 채로 연다' },
    ],
    data: ['@winpilot/store · SITE_FAQS (publicSiteFaqs) · FAQ_GROUPS'],
    exits: ['여기서 끝난다 — 문의로 가는 링크가 아직 없다'],
  },
  {
    screen: 'support-directions',
    entries: ['헤더 펼침의 오시는 길', '푸터의 오시는 길'],
    steps: ['본사 주소를 크게 읽고 가져간다', '전화번호를 확인한다', '지하철 · 버스 · 자가용 중 자기 길을 고른다', '방문 전 안내를 읽는다'],
    branches: [],
    exceptions: [
      { at: 0, label: '지도를 넣지 않는다 — 열쇠 발급 · 과금 · 도메인 등록이 필요하고, 없는 동안 회색 네모가 남는다' },
      { at: 0, label: '지도 스크립트를 들이면 이 화면 하나 때문에 다른 화면까지 느려진다' },
      { at: 2, label: '갈래마다 다른 그림을 둔다 — 세 줄이 같은 모양이면 어느 줄이 어느 갈래인지 다시 읽어야 한다' },
      { at: 3, label: '주소 복사 단추와 전화 걸기 링크가 아직 없다. 지금은 끌어 고르고 손으로 옮긴다' },
    ],
    data: ['@winpilot/store · DIRECTIONS', '@winpilot/store · IR_COMPANY (본사 · 전화)'],
    exits: ['자기 지도 앱에 주소를 붙여 넣는다 (사이트 밖)'],
  },
  {
    screen: 'terms',
    entries: ['푸터 맨 윗줄의 서비스 이용약관'],
    steps: ['왜 아직 비어 있는지를 읽는다', '약관 문의 창구를 확인한다', '홈으로 돌아간다'],
    branches: [],
    exceptions: [
      { at: 0, label: '검토 전 문장을 채우지 않는다 — 채워 두면 그것이 실제로 효력을 주장할 문서가 되고, 분쟁이 났을 때 근거가 되는 것도 이 화면이다' },
      { at: 0, label: '그렇다고 링크를 지우지도 않는다. 푸터에서 약관이 빠져 있으면 없는 회사로 여긴다' },
      { at: 1, label: '문의 창구에서 문의하기 화면으로 가는 길이 아직 없다 — 메일과 번호를 글자로만 적는다' },
    ],
    data: ['@winpilot/store · IR_COMPANY (IR 창구)'],
    exits: ['홈으로 돌아간다'],
  },
  {
    screen: 'privacy',
    entries: ['푸터 맨 윗줄의 개인정보 처리방침'],
    steps: ['왜 아직 비어 있는지를 읽는다', '개인정보보호책임자와 창구를 확인한다', '홈으로 돌아간다'],
    branches: [],
    exceptions: [
      { at: 0, label: '무엇을 어떤 근거로 얼마 동안 모으는지 확인하지 않고 채우면 화면에 적힌 것과 실제가 어긋나고, 그 어긋남이 그대로 법 위반이다' },
      { at: 1, label: '개인정보보호책임자를 대표이사와 다른 값으로 둔다 — 한 값으로 묶으면 담당자를 따로 두는 날까지 개인정보 문의가 대표에게 간다' },
      { at: 1, label: '수집 항목 표가 아직 없다. 문의 양식이 회사명 · 지역 · 담당자명 · 휴대폰 · 이메일을 실제로 받고 있어, 원고가 오면 그 항목이 먼저 여기 서야 한다' },
    ],
    data: ['@winpilot/store · IR_COMPANY (개인정보보호책임자 · 창구)'],
    exits: ['홈으로 돌아간다'],
  },
];

/**
 * 여정 — **화면 하나가 아니라 하고 싶은 일 하나**를 따라간다.
 *
 * 화면별 흐름만 있으면 "투자 판단을 하려면 어디를 몇 번 거치는가" 를 사람이 머릿속에서 이어
 * 붙여야 한다. 여정은 그 이어 붙이기를 대신한다. 단계는 화면 이름으로 적는다 — 화면 안의
 * 자세한 것은 그 화면의 흐름에 이미 있다.
 *
 * 이 사이트에는 서로 다른 사람이 온다. 처음 온 사람 · 도입을 검토하는 회사 · 이미 주주인
 * 사람 · 막혀서 온 사람. 여정도 그 넷으로 갈린다.
 */
export const JOURNEYS: NamedFlow[] = [
  {
    id: 'company',
    title: '어떤 회사인지 알아보기',
    purpose: '처음 온 사람이 무슨 회사인지 알고 확인까지 마치기까지. 헤더 ABOUT 이 그 길이다.',
    entries: ['홈', '헤더의 ABOUT', '검색으로'],
    steps: ['홈', '회사 소개', '연혁', '특허 및 인증'],
    branches: [
      {
        after: 1,
        question: '확인할 것이 더 있나',
        pass: '있음',
        block: '회사 소개에서 끝난다 — 숫자 넉 줄과 표가 신원을 다 적는다',
        blockLabel: '없음',
      },
      {
        after: 3,
        question: '들고 온 등록번호가 있나',
        pass: '있음',
        block: '구분만 눌러 몇 건인지 보고 나간다',
        blockLabel: '없음',
      },
    ],
    exceptions: [
      { at: 1, label: '회사 소개에서 연혁 · 특허 및 인증으로 가던 바로가기 두 장을 뺐다. 헤더 펼침에 이미 서 있어, 화면 안에 한 번 더 두면 아래가 더 있는 것처럼 읽힌다' },
      { at: 2, label: '숨긴 연혁과 비공개 특허·인증은 어느 화면에도 오지 않는다' },
    ],
    data: [
      '@winpilot/store · IR_COMPANY',
      '@winpilot/store · MILESTONES',
      '@winpilot/store · CREDENTIALS',
    ],
    exits: ['확인이 끝나면 돌아 나간다', '문의하기로'],
  },
  {
    id: 'evaluate',
    title: '도입 검토하기',
    purpose: '무엇을 파는지 보고 문의를 남기기까지. 홈의 무대와 제품 목록이 같은 한 줄의 서로 다른 입구다.',
    entries: ['홈의 서비스 무대', '푸터의 PRODUCT · SOLUTION', '제품 목록'],
    steps: ['제품 · 서비스 상세', '문의하기', '담당자 회신'],
    branches: [
      {
        after: 0,
        question: '내 문제가 맞나',
        pass: '맞다',
        block: '여기서 닫는다 — 기능부터 늘어놓았다면 스무 개 이름을 지나서야 그것을 알았다',
        blockLabel: '아니다',
      },
      {
        after: 1,
        question: '여섯 항목을 다 적었나',
        pass: '적었다',
        block: '보내지 못했습니다 토스트와 확인이 필요한 항목 수',
        blockLabel: '어긋남',
      },
    ],
    exceptions: [
      { at: 0, label: '여섯 상세가 같은 차례로 선다 — 나란히 열어 놓고 견주는 사람이 차이를 칸 단위로 본다' },
      { at: 1, label: '지역을 묻는 이유는 통계가 아니라 일정이다. 현장을 봐야 하는 일이라 첫 방문까지 걸리는 시간이 다르다' },
      { at: 2, label: '프론트엔드 전용 — 보낸 문의가 쌓이는 곳이 아직 없다' },
    ],
    data: [
      '@winpilot/store · SOLUTIONS · SERVICE_DETAILS',
      '@winpilot/store · SITE_REGIONS',
      '@winpilot/store · IR_COMPANY (창구)',
    ],
    exits: ['첫 통화 — 사이트에서 파는 것이 없다'],
  },
  {
    id: 'invest',
    title: '투자 판단하기',
    purpose: '무슨 일이 있었나부터 알림을 걸기까지. IR 아홉이 한 줄로 이어져 그 차례가 곧 여정이다.',
    entries: ['공시 주소를 바로 열어', '검색으로'],
    steps: ['공시 정보', '재무 · 주가 · 배당', '주주총회 · 지배구조', 'IR 자료실 · IR 일정', '공시 구독'],
    branches: [
      {
        after: 0,
        question: '나간 공시인가',
        pass: '나갔다',
        block: '404 다 — 원고는 주소로도 열리지 않는다',
        blockLabel: '원고',
      },
      {
        after: 2,
        question: '의결권을 행사할 총회가 있나',
        pass: '있음',
        block: '전자투표 안내로 가는 길을 그리지 않는다',
        blockLabel: '없음',
      },
    ],
    exceptions: [
      { at: 1, label: '주가는 지연 시세임을 늘 적는다 — 적지 않으면 실시간으로 읽고 그 차이로 판단한 뒤에야 안다' },
      { at: 2, label: '전자투표는 예탁결제원의 시스템에서 한다. 이 사이트에서는 투표하지 않는다' },
      { at: 3, label: '자료마다 크기를 적는다. 모바일에서 8MB 를 모르고 누르는 것과 알고 누르는 것은 다르다' },
      { at: 4, label: '확인 메일을 눌러야 알림이 시작된다 — 확인 안 된 주소로 보내면 스팸 신고가 쌓인다' },
    ],
    data: [
      '@winpilot/store · DISCLOSURES · FINANCIALS · STOCK · DIVIDENDS',
      '@winpilot/store · MEETINGS · OFFICERS · SHAREHOLDERS',
      '@winpilot/store · IR_DOCUMENTS · IR_SCHEDULES',
    ],
    exits: ['새 공시를 메일로 받는다 (아직 실제로 나가지 않는다)'],
  },
  {
    id: 'support',
    title: '묻기 전에 읽기',
    purpose: '막혀서 온 사람이 읽을 것을 먼저 만나고, 그래도 안 되면 묻는다. CS CENTER 넷이 한 배치를 쓴다.',
    entries: ['헤더의 CS CENTER', '홈 맨 아래 영상 줄', '팝업의 자세히 보기'],
    steps: ['공지사항', 'FAQ', '문의하기', '오시는 길'],
    branches: [
      {
        after: 0,
        question: '내 물음이 공지에 있나',
        pass: '있음',
        block: 'FAQ 로 넘어간다',
        blockLabel: '아니오',
      },
      {
        after: 1,
        question: '답까지 훑어도 안 나오나',
        pass: '안 나온다',
        block: '펴 읽고 끝낸다',
        blockLabel: '나온다',
      },
    ],
    exceptions: [
      { at: 0, label: '고정한 공지가 날짜를 이긴다. 다만 딱지를 함께 두어 오래된 글이 맨 위에 있는 것으로 읽히지 않게 한다' },
      { at: 1, label: 'FAQ 의 빈 상태가 문의를 권하지만 링크가 아직 없다' },
      { at: 2, label: '아직 공시하지 않은 실적 · 전망은 개별로 답하지 않는다는 것을 양식 아래에 미리 적는다' },
    ],
    data: [
      '@winpilot/store · SITE_NOTICES · SITE_FAQS',
      '@winpilot/store · SITE_REGIONS · DIRECTIONS',
      '@winpilot/store · IR_COMPANY (창구)',
    ],
    exits: ['문의를 보냈다는 토스트', '전화로', '찾아온다'],
  },
];

/**
 * 공통 상호작용 — **어느 화면에서나 같은 것**.
 *
 * 화면마다 되풀이해 적으면 스물아홉 벌이 되고, 스물아홉 벌은 한 번에 고쳐지지 않는다.
 * 여기 한 벌만 둔다.
 */
export const COMMON_FLOWS: NamedFlow[] = [
  {
    id: 'navigation',
    title: '내비게이션',
    purpose: '헤더는 처음 온 사람의 길이다. 갈래 넷 중 셋이 서고, 나머지 하나는 감춰 두었다.',
    entries: ['어느 화면에서든'],
    steps: ['헤더의 갈래에 마우스를 올리거나 포커스를 준다', '화면 폭으로 펼쳐지는 판에서 하위 화면을 고른다', '그 갈래의 화면'],
    branches: [
      {
        after: 0,
        question: '감춘 갈래인가',
        pass: '아니오',
        block: '헤더에 서지 않는다 — 화면과 주소는 그대로 열리고 푸터에는 남는다',
        blockLabel: '예',
      },
    ],
    exceptions: [
      { at: 0, label: '마우스만으로 열지 않는다. 포커스가 들어와도 열고 Esc 로 닫으며, 갈래 자체도 눌러서 갈 수 있다' },
      { at: 1, label: '판을 화면 폭으로 넓혀 묶음을 칸으로 나눈다 — 좁은 목록 하나로 두면 사람이 하는 일과 파는 물건이 같은 종류로 보인다' },
      { at: 1, label: '펼침 항목에 설명을 달지 않는다. 그러면 펼침이 읽는 화면이 되어 고르러 온 사람이 문장을 지나야 자기 자리를 찾는다' },
      { at: 1, label: '아직 없는 화면은 링크를 걸지 않고 준비중으로 적는다. 눌러 404 로 보내면 그 뒤로는 다른 메뉴도 눌러 보지 않는다' },
      { at: 2, label: '푸터는 감춘 갈래까지 그대로 편다. 접지 않는 이유는 맨 아래까지 내려온 사람이 이미 헤더에서 멀어져 있기 때문이다' },
    ],
    data: ['lib/navigation.ts · SITE_NAV · headerNav · LEGAL_NAV · IR_ROUTES'],
    exits: ['로고를 누르면 홈으로', '푸터 맨 윗줄에서 약관 · 처리방침으로'],
  },
  {
    id: 'irnav',
    title: 'IR 줄',
    purpose: '헤더에 IR 갈래를 더하지 않고 IR 아홉을 잇는다. 헤더는 처음 온 사람의 길이고 이 줄은 이미 IR 안에 들어온 사람의 길이다.',
    entries: ['IR 아홉 화면 어디에서든 제목 아래'],
    steps: ['아홉 알약 중 지금 있는 자리를 먼저 찾는다', '옆으로 훑는다', '다른 IR 화면으로 넘어간다'],
    branches: [
      {
        after: 2,
        question: 'IR 아홉에 드는 화면인가',
        pass: '든다',
        block: '줄 대신 돌아가는 길 하나를 단다 — 공시 상세와 전자투표 안내가 그렇다',
        blockLabel: '자식 화면',
      },
    ],
    exceptions: [
      { at: 0, label: '지금 것만 먹색 알약이다. 아홉이 한 줄로 서면 그중 어디에 있는지가 사라진다' },
      { at: 1, label: '좁은 화면에서 접지 않고 가로로 밀리게 둔다. 접으면 세 줄이 되어 본문이 그만큼 아래로 밀린다' },
      { at: 1, label: '스크롤 막대는 감춘다 — 잘린 항목이 이미 더 있다고 말하고 있다' },
      { at: 2, label: '차례는 투자자가 보는 순서다. 무슨 일이 있었나 · 얼마를 벌었나 · 나에게 무엇이 오나 · 언제 무엇을 정하나 · 더 볼 것' },
      { at: 2, label: '지금 사이트 안에는 IR 아홉으로 처음 들어가는 길이 없다. 주소나 검색으로 들어오고 그 뒤로는 이 줄이 잇는다' },
    ],
    data: ['lib/navigation.ts · IR_ROUTES'],
    exits: ['IR 아홉 사이를 오간다'],
  },
  {
    id: 'popup',
    title: '팝업',
    purpose: '읽히지 않으면 뜻이 없는 고지를 화면 가운데에 한 번 세운다.',
    entries: ['어느 화면에서든 열 때'],
    steps: ['오늘 걸린 팝업을 store 가 고른다', '오늘 감춰 둔 것을 브라우저 기록에서 뺀다', '남은 것 중 첫 하나를 가운데 띄운다', '닫거나 오늘 하루 보지 않기를 누른다'],
    branches: [
      {
        after: 2,
        question: '띄울 것이 남았나',
        pass: '있음',
        block: '아무것도 그리지 않는다',
        blockLabel: '없음',
      },
    ],
    exceptions: [
      { at: 0, label: '기간이 지났거나 내려 둔 것은 화면까지 오지 않는다 — 화면이 다시 판단하면 그 판단이 두 벌이 된다' },
      { at: 1, label: '첫 그림에서는 아무것도 그리지 않는다. 서버가 판단해 그리면 감춰 둔 팝업이 한 번 깜빡였다가 사라지는데, 그것은 감춘 것이 아니다' },
      { at: 1, label: '감춘 기록이 깨져 있으면 그냥 다 띄운다 — 안 띄우는 쪽으로 실패하면 알릴 것을 못 알린다' },
      { at: 2, label: '한 번에 하나만 띄운다. 셋을 한꺼번에 띄우면 읽으러 온 사람이 셋을 닫고서야 화면에 닿는다' },
      { at: 3, label: '자리가 가운데 하나뿐이다. 모서리에 조용히 서는 자리를 두면 그 자리에 놓인 고지는 안 읽힌다' },
    ],
    data: ['@winpilot/store · SITE_BANNERS (liveSitePopups)', '브라우저 기록 (오늘 하루 보지 않기)'],
    exits: ['닫고 화면을 읽는다', '자세히 보기로 그 고지의 화면으로'],
  },
  {
    id: 'browse',
    title: '갈래로 좁히고 말로 좁히기',
    purpose: 'CS CENTER 넷과 특허 및 인증이 같은 일을 한다 — 여럿 중에서 갈래로 좁히고, 말로 한 번 더 좁히고, 남은 것을 본다.',
    entries: ['목록이 열 줄을 넘는 화면'],
    steps: ['왼쪽에서 갈래를 고른다', '검색창에 말을 친다', '남은 건수를 확인한다', '결과를 본다'],
    branches: [
      {
        after: 2,
        question: '남은 것이 있나',
        pass: '있음',
        block: '무엇이 없는지 적은 한 줄을 같은 자리에 세운다',
        blockLabel: '0건',
      },
    ],
    exceptions: [
      { at: 0, label: '갈래 옆의 수는 거르기 전 전체다. 거른 뒤로 세면 검색어를 치는 순간 모든 갈래가 0 이 되어, 다른 갈래에 답이 있는지 알 수 없다' },
      { at: 0, label: '한 건도 없는 갈래도 0 으로 세운다 — 사라지면 그 갈래가 아예 없는 것으로 읽힌다. 뉴스만 값에서 뽑는데, 새 갈래를 쓰는 날 그 영상이 어느 갈래에도 안 걸리기 때문이다' },
      { at: 1, label: '검색은 제목만이 아니라 본문과 답까지 훑는다. 찾는 사람의 말과 적힌 말이 다르다' },
      { at: 2, label: '거른 결과가 몇 건인지를 검색어 옆에 둔다 — 없으면 거른 탓인지 원래 없는 탓인지 알 수 없다' },
      { at: 3, label: '결과 모양은 화면이 정한다. 뉴스는 격자, 공지와 FAQ 는 접히는 줄이다' },
      { at: 3, label: '고른 갈래와 검색어를 주소에 남기지 않는다. 새로고침하면 처음으로 돌아간다' },
      { at: 3, label: '왼쪽 갈래는 좁은 화면에서 가로로 눕는다. 세로로 두면 결과가 한참 아래로 밀린다' },
    ],
    data: ['@winpilot/store · SITE_NOTICES · SITE_FAQS · MEDIA_CLIPS · CREDENTIALS'],
    exits: ['결과 하나를 펴 읽는다', '조건을 바꿔 다시 좁힌다'],
  },
  {
    id: 'form',
    title: '양식과 검사',
    purpose: '문의하기와 공시 구독이 같은 규칙을 쓴다 — 눌러 본 뒤에만 붉은 글이 서고, 이유는 칸 아래에 적는다.',
    entries: ['문의하기', '공시 구독'],
    steps: ['칸을 채운다', '보내기를 누른다', '어긋난 칸 아래에 이유가 선다', '고쳐서 다시 누른다'],
    branches: [
      {
        after: 1,
        question: '다 맞나',
        pass: '맞음',
        block: '보내지 못했다는 토스트와 확인이 필요한 항목 수',
        blockLabel: '어긋남',
      },
    ],
    exceptions: [
      { at: 0, label: '입력 예시를 placeholder 가 아니라 겹친 글자로 둔다 — placeholder 는 Figma 로 뽑을 때 빈 상자가 된다' },
      { at: 0, label: '필수 표시를 손으로 붙이지 않는다. 화면과 검사 두 곳에 적히면 반드시 어긋난다' },
      { at: 1, label: '보내는 단추를 잠그지 않는다. 눌러야 무엇이 어긋났는지 드러난다' },
      { at: 2, label: '안내와 오류가 같은 자리를 갈아 끼운다 — 둘이 함께 서면 줄이 늘어 양식 전체가 밀린다' },
      { at: 2, label: '토스트는 몇 개가 어긋났는지만 말하고 어느 칸인지는 그 칸 아래가 말한다' },
      { at: 3, label: '보낸 뒤에는 양식을 비운다. 문의하기는 고른 갈래만 남긴다 — 이어서 하나 더 보내는 사람이 같은 갈래인 경우가 많다' },
      { at: 3, label: '프론트엔드 전용 — 보낸 것이 쌓이는 곳이 아직 없다' },
    ],
    data: ['@winpilot/store · SITE_REGIONS · DisclosureKind', '@winpilot/store · IR_COMPANY (창구)'],
    exits: ['토스트로 결과를 알린다', '그 자리에 그대로 머문다'],
  },
  {
    id: 'error',
    title: '오류와 빈 상태',
    purpose: '무엇이 왜 없는지와 돌아갈 길을 늘 같은 자리에 둔다.',
    entries: ['없는 주소', '나가지 않은 공시의 주소', '처리 중 예외', '조건에 맞는 것이 0건'],
    steps: ['어떤 종류인지 가른다', '같은 자리에 안내를 그린다', '돌아갈 길을 둔다'],
    branches: [
      {
        after: 0,
        question: '화면을 못 여는 것인가',
        pass: '못 엶',
        block: '목록 자리에 무엇이 없는지 적은 한 줄을 세운다 — 표나 격자를 빈 채로 두지 않는다',
        blockLabel: '결과가 0건',
      },
    ],
    exceptions: [
      { at: 0, label: '없는 공시와 아직 안 나간 공시가 같은 404 다. 둘을 갈라 보이면 그 번호의 원고가 있다는 사실이 새어 나간다' },
      { at: 1, label: '오류 화면에 다시 시도를 두지 않는다. 같은 오류가 반복되면 단추만 계속 누르게 되므로 돌아갈 곳을 주는 편이 낫다' },
      { at: 1, label: '오류 번호를 화면에 적는다 — 문의할 때 그대로 옮길 수 있다' },
      { at: 2, label: '404 의 두 번째 길이 제품 목록으로 간다. 헤더에서 감춘 갈래라 그 자리에서만 열리는 셈이다' },
      { at: 2, label: '서버가 없어 오류를 보낼 곳이 없다. 콘솔에만 남긴다' },
    ],
    data: [],
    exits: ['홈으로', '방금 있던 목록으로', '조건을 바꿔 다시 좁힌다'],
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
