// `@/` 별칭 대신 상대 경로를 쓴다 — 이 모듈은 Next 밖(문서 생성 스크립트)에서도 읽힌다.
import { pages } from '../pages.manifest';
import { IR_MENU } from './navigation/ir-menu';

/**
 * IA 묶음 — **사이드바 섹션이 곧 갈래**다.
 *
 * 갈래를 여기서 새로 정하지 않고 `ir-menu.ts` 의 섹션 id 를 그대로 쓴다. 따로 정하면 메뉴에
 * 항목을 하나 더했을 때 메뉴와 도면이 갈라지고, 그때부터 도면은 조용히 옛것이 된다. 갈래 이름도
 * 여기 적지 않는다 — `labelOf()` 가 메뉴에서 읽는다.
 *
 * 여기 적는 것은 메뉴가 **모르는 것**뿐이다: 목록에서만 들어가는 화면(등록·상세)의 한글 이름,
 * 화면끼리의 이동, 값이 오는 곳, 그리고 그 갈래에서만 지켜야 하는 것.
 *
 * ## 메뉴에 없는 갈래가 둘 있다
 * `system`(처리 결과) · `solution`(문제 · 해법)이다. 둘 다 사이드바에 항목이 없고, 합치면
 * **화면 넷**이 주소로만 열린다.
 *
 * 그래도 도면에는 그린다 — 메뉴에 없다고 화면이 없는 것은 아니고, 그 사실을 모르는 사람은
 * 같은 화면을 새로 만들려 든다. **이 문서가 그 넷을 아는 유일한 자리다.** 둘만 `label` 을
 * 여기 적는다(메뉴에서 읽을 이름이 없으므로).
 *
 * `ir`(공시 · 재무 · 주주 · 자료) 갈래가 여기 있었다. 열 화면을 통째로 지웠다 — 사연은
 * `lib/navigation/ir-menu.ts` 머리말에 있다.
 *
 * ## 화면 이름을 한글로 다시 적는 이유
 * 매니페스트의 `name` 은 Figma 페이지 이름이라 영문이다(`Notice Create`). 도면과 왼쪽 목록은
 * 사람이 읽는 것이므로 한글로 적는다. 두 벌이 되는 것을 막기 위해 `screen` 은 반드시 매니페스트에
 * 있는 id 여야 하며, 어긋나면 `unknownScreens()` 가 알려 준다.
 *
 * ## 고객 화면 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 고객 화면에 나타나지 않는다.
 */
export type IaScreen = {
  /** `pages.manifest.ts` 의 id */
  screen: string;
  /** 도면·목록에 보이는 한글 이름 */
  ko: string;
};

export type IaGroup = {
  /** `ir-menu.ts` 의 섹션 id. 이름은 메뉴에서 읽으므로 여기 적지 않는다. */
  id: string;
  /** 사이드바에 없는 갈래만 이름을 적는다 — 있는 것은 메뉴 이름이 이긴다 */
  label?: string;
  /** 이 갈래가 있는 이유 — 한 문장 */
  purpose: string;
  screens: IaScreen[];
  /** 갈래 안의 이동 — `[출발 screen, 도착 screen]` */
  edges: Array<[string, string]>;
  /**
   * 이 갈래의 화면이 읽고 쓰는 곳 — 도면에서 원통으로 그린다.
   *
   * 이 프로젝트에는 서버가 없다. 어드민이 만지는 것은 투자자 화면과 함께 쓰는 시드
   * (`@winpilot/store`)와 주소의 질의문자열뿐이다. 있지도 않은 API 를 도면에 그리면 그 도면을
   * 보고 만드는 사람이 서버를 찾는다.
   */
  data: string[];
  /** 이 갈래에서만 지켜야 하는 것 */
  notes: string[];
};

export const IA_GROUPS: IaGroup[] = [
  {
    id: 'dashboard',
    purpose: '아침에 여는 사람이 묻는 둘 — 얼마나 들어왔는가, 어디서 들어왔는가.',
    screens: [{ screen: 'dashboard', ko: '대시보드' }],
    edges: [],
    data: [
      '@winpilot/store · SITE_INQUIRIES · SITE_REGIONS',
      '@winpilot/store · SITE_NOTICES',
      '@winpilot/geo · 서버에서 화면 좌표로 옮긴 시 · 도 경계선',
    ],
    notes: [
      '등록 현황과 지역 분포 둘만 남겼다. 많이 본 화면 · 주가 · 다음 일정은 저마다 자기 갈래에 화면이 있어, 여기 한 번 더 그리는 동안 하는 일이 요약이 아니라 되풀이였다.',
      '숫자 옆에 늘 `/ 전체` 를 붙인다 — 이번 달 문의 4건은 그 자체로 많은지 적은지 말해 주지 않는다.',
      '0건인 지역을 지도에서도 표에서도 지우지 않는다. 한 건도 오지 않은 지역이야말로 손대야 할 곳이다.',
      '오늘을 조각 안에서 구하지 않고 고정된 글자(`TODAY`)에서 센다 — `new Date()` 를 읽으면 서버와 브라우저가 갈리고, 자정을 넘기는 순간 한쪽만 날짜가 바뀐다.',
      '경계선 좌표(214KB)와 `d3-geo` 는 서버에만 둔다. 화면이 받는 것은 경로 문자열 열일곱 개뿐이다.',
    ],
  },
  {
    id: 'inquiry',
    purpose: '밖에서 들어온 것을 받아 답한다 — 늦으면 그 사실이 고객 쪽에 남는 유일한 갈래다.',
    screens: [
      { screen: 'inquiries', ko: '문의 목록' },
      { screen: 'inquiries-detail', ko: '문의 상세' },
      { screen: 'inquiries-settings', ko: '문의 설정' },
    ],
    edges: [['inquiries', 'inquiries-detail']],
    data: [
      '@winpilot/store · SITE_INQUIRIES · SITE_INQUIRY_KINDS · SITE_REGIONS',
      '@winpilot/store · IR_COMPANY (받는 곳의 처음 값)',
    ],
    notes: [
      '등록 화면이 없다. 문의는 밖에서 들어오는 것이라 콘솔에서 만들 일이 없고, 만들 수 있게 두면 우리가 적은 것과 고객이 보낸 것이 한 목록에 섞인다.',
      '보낸 사람의 글은 읽기만 한다 — 고치는 순간 무엇이 실제로 왔는지 알 수 없게 되고, 나중에 남는 것은 이 글뿐이다.',
      '`답변완료` 로 바꿀 때만 답변 본문을 요구한다. 처리중 · 보류로 두는 동안에는 비어도 된다 — 답 없이 완료된 문의는 목록에서 사라져 다시는 눈에 띄지 않는다.',
      '설정에서 양식의 칸을 끄고 켜지 못한다. 수집 항목은 개인정보 처리방침에 적힌 것과 같아야 하고, 한 칸 끄는 일은 그 글도 함께 고치는 일이다.',
      '지우는 자리를 두지 않는다 — 밖에서 들어온 기록이라 끝난 건은 상태로 닫는다.',
    ],
  },
  {
    id: 'content',
    purpose: '사이트에서 가장 자주 손대는 글 셋 — 공지 · 뉴스 · FAQ.',
    screens: [
      { screen: 'contents-notices', ko: '공지사항 목록' },
      { screen: 'contents-notices-new', ko: '공지사항 등록' },
      { screen: 'contents-notices-detail', ko: '공지사항 상세' },
      { screen: 'contents-news', ko: '뉴스 목록' },
      { screen: 'contents-news-new', ko: '뉴스 등록' },
      { screen: 'contents-news-detail', ko: '뉴스 상세' },
      { screen: 'contents-faqs', ko: 'FAQ 목록' },
      { screen: 'contents-faqs-new', ko: 'FAQ 등록' },
      { screen: 'contents-faqs-detail', ko: 'FAQ 상세' },
    ],
    edges: [
      ['contents-notices', 'contents-notices-new'],
      ['contents-notices', 'contents-notices-detail'],
      ['contents-news', 'contents-news-new'],
      ['contents-news', 'contents-news-detail'],
      ['contents-faqs', 'contents-faqs-new'],
      ['contents-faqs', 'contents-faqs-detail'],
    ],
    data: [
      '@winpilot/store · SITE_NOTICES · SITE_NOTICE_GROUPS',
      '@winpilot/store · MEDIA_CLIPS',
      '@winpilot/store · SITE_FAQS · FAQ_GROUPS',
    ],
    notes: [
      '이 공지는 회사 홈페이지의 공지다. B2C 쇼핑몰의 공지와 **다른 값**이다 — 배송 공지가 IR 사이트에 서면 안 된다.',
      '셋 다 등록과 상세가 한 폼이다. 나누면 칸을 하나 더할 때 두 곳을 고쳐야 하고, 그러다 등록에만 있고 수정에는 없는 칸이 생긴다.',
      '뉴스 제목에 수상 · 수출 실적처럼 밖에서 확인되는 숫자를 적지 않는다 — 이 홈페이지는 IR 자료로도 읽혀, 그 한 줄이 허위 기재가 될 수 있다. 그래서 안내를 칸 아래가 아니라 칸 위에 둔다.',
      '공지의 고정은 셋까지로 본다. 넷을 넘으면 맨 위가 전부 고정이라 고정의 뜻이 없어진다 — 막지는 않고 몇 개인지만 표에서 보이게 한다.',
      'FAQ 는 적는 동안 같은 갈래의 물음을 옆에 세운다. 막지 않는 이유는 정말 다른 물음인지 사람만 알기 때문이다.',
    ],
  },
  {
    id: 'product',
    purpose: '계약하면 그날부터 쓰는 클라우드 제품 넷의 이름과 기능을 본다.',
    screens: [
      { screen: 'products', ko: '제품 목록' },
      { screen: 'products-detail', ko: '제품 상세' },
      { screen: 'products-settings', ko: '제품 설정' },
    ],
    edges: [['products', 'products-detail']],
    data: ['@winpilot/store · SOLUTIONS · findSolution'],
    notes: [
      '등록 화면이 없다. 제품 넷은 각자 상세 화면이 코드로 짜여 있어, 목록에 한 줄 더한다고 사이트에 화면이 생기지 않는다 — 메뉴에는 있는데 눌러도 404 인 제품이 만들어진다.',
      '`문제 · 해법` 갈래와 **같은 값**(`SOLUTIONS`)을 본다. 그 겹침 때문에 그쪽이 사이드바에서 빠졌다 — 지금 제품을 손대는 길은 이 갈래 하나뿐이다.',
      '설정에서 정하는 것은 사이트 머리 메뉴의 차례와 노출이다. 코드로만 내릴 수 있게 두면 배포를 기다리는 동안 `메뉴에 있는데 문의하면 아직 없다고 답하는` 상태가 남는다.',
      '차례는 한 칸씩 올리고 내린다 — 끌어 옮기기는 좁은 화면과 키보드에서 쓸 수 없다.',
    ],
  },
  {
    id: 'solution',
    label: '문제 · 해법',
    purpose: '같은 제품 넷을 **어떤 문제를 어떻게 푸는지**로 본다.',
    screens: [
      { screen: 'solutions', ko: '문제 · 해법 목록' },
      { screen: 'solutions-detail', ko: '문제 · 해법 상세' },
      { screen: 'solutions-settings', ko: '홈 무대 차례' },
    ],
    edges: [['solutions', 'solutions-detail']],
    data: ['@winpilot/store · SOLUTIONS · findSolution', '@winpilot/store · SITE_SERVICES · siteServiceHref'],
    notes: [
      '**사이드바에 없다.** `/solutions` 를 직접 쳐야 열린다 — 이름이 `문제 · 해법` 이라 메뉴에서 찾을 수도 없다.',
      '뺀 까닭은 안 열려서가 아니라 **제품 갈래와 겹쳐서**다. 둘이 `SOLUTIONS` 라는 같은 값을 보는데 이름만 달랐고, 같은 것을 두 이름으로 부르면 그때부터 두 구현이 생긴다.',
      '이름이 한때 `솔루션` 이었다. 사이트에서 SOLUTION 이 **서비스 둘**을 뜻하게 되면서 어드민에서는 반대를 가리키게 되어 바꿨는데, 결국 갈래째 메뉴에서 뺐다.',
      '홈 무대 차례는 보여 주기만 한다. 여섯이 시계 방향으로 놓인 순서가 곧 공정의 차례라, 여기서 바꾸면 그림이 없는 공정 흐름을 그린다.',
      '목록에서 확인하는 것은 상세 화면이 채워졌는지다 — 구성 층과 절차가 비면 그 화면은 문단 둘로 끝난다.',
    ],
  },
  {
    id: 'service',
    purpose: '사람이 현장에 가서 하는 일 둘 — 파는 단위가 화면이 아니라 절차다.',
    screens: [
      { screen: 'services', ko: '서비스 목록' },
      { screen: 'services-detail', ko: '서비스 상세' },
      { screen: 'services-settings', ko: '서비스 설정' },
    ],
    edges: [['services', 'services-detail']],
    data: ['@winpilot/store · SERVICE_DETAILS · findService', '@winpilot/store · SITE_SERVICES'],
    notes: [
      '어드민 주소는 `/services` 인데 사이트에서는 SOLUTION 갈래(`/solutions/consulting` · `/solutions/infra`)에 선다. 어드민 주소는 무엇을 고치러 왔는지를, 사이트 주소는 찾아온 사람이 어느 갈래에서 찾는지를 말한다.',
      '켜고 끄는 자리가 없다 — 둘은 내리는 것이 아니라 **안 파는 것**이고, 안 팔기로 하는 날 바꿀 것은 토글 하나가 아니라 메뉴 · 홈 무대 · 제품 목록 셋이다.',
      '거르개도 두지 않는다. 걸 것이 하나도 없는 거르개를 세우면 눌러 본 사람이 목록이 고장 났다고 여긴다.',
      '지우는 자리도 등록 화면도 없다. 상세 주소가 코드로 짜여 있어 목록에서 지워도 그 화면은 그대로 열린다 — 지웠는데 사이트에 남아 있는 것이 가장 나쁜 상태다.',
      '설정은 고치는 자리가 아니라 **어디에 나가는지와 무엇이라 적혀 있는지**를 한자리에서 보는 자리다. 홈 카드의 말과 상세의 말이 다른 값이라 어긋날 수 있다.',
    ],
  },
  {
    id: 'company',
    purpose: '회사가 누구인지 — 한 번 정해 두고 가끔 고치는 것들.',
    screens: [
      { screen: 'company-about', ko: '회사 소개' },
      { screen: 'company-history', ko: '연혁 목록' },
      { screen: 'company-history-new', ko: '연혁 등록' },
      { screen: 'company-history-detail', ko: '연혁 상세' },
      { screen: 'company-credentials', ko: '특허 및 인증 목록' },
      { screen: 'company-credentials-new', ko: '특허 및 인증 등록' },
      { screen: 'company-credentials-detail', ko: '특허 및 인증 상세' },
    ],
    edges: [
      ['company-history', 'company-history-new'],
      ['company-history', 'company-history-detail'],
      ['company-credentials', 'company-credentials-new'],
      ['company-credentials', 'company-credentials-detail'],
    ],
    data: [
      '@winpilot/store · IR_COMPANY · SITE_INTRO',
      '@winpilot/store · MILESTONES · milestoneDate · sortMilestones',
      '@winpilot/store · CREDENTIALS · findCredential',
    ],
    notes: [
      '회사 소개는 보여 주기만 한다. 회사 정보(`IR_COMPANY`)는 공시 · 푸터 · 사업자 표시가 함께 읽는 값이라, 고치는 자리는 한 곳에서 검토를 지나야 한다 — 대표이사 이름이 사이트마다 다르면 그것이 먼저 눈에 띄는 것은 밖이다.',
      '연혁은 **B2C 어드민의 회사 > 연혁과 같은 값**이다. 한 회사의 연혁이 두 벌이 되면 안 되므로 원본을 나눠 갖지 않는다.',
      '연혁의 월은 비울 수 있다 — 창립 초기의 일은 몇 월인지 아무도 기억하지 못하고, 필수로 두면 대충 `01` 로 적게 된다.',
      '특허 · 인증은 등록번호를 반드시 받는다. 밖에서 조회할 수 있는 값이라 번호가 없으면 적어 둔 것이 확인되지 않는 주장에 그친다.',
      '취득일이 미래면 막는다. 사이트는 날짜를 따지지 않고 그대로 세우므로, 심사 중인 특허가 받은 것으로 실린다.',
    ],
  },
  {
    id: 'banner',
    purpose: '사이트 위에 기간을 갖고 얹히는 것을 걸고 내린다.',
    screens: [
      { screen: 'banners', ko: '메인 비주얼 목록' },
      { screen: 'banners-new', ko: '메인 비주얼 등록' },
      { screen: 'banners-detail', ko: '메인 비주얼 상세' },
      { screen: 'banners-popups', ko: '팝업 목록' },
      { screen: 'banners-popups-new', ko: '팝업 등록' },
      { screen: 'banners-popups-detail', ko: '팝업 상세' },
    ],
    edges: [
      ['banners', 'banners-new'],
      ['banners', 'banners-detail'],
      ['banners-popups', 'banners-popups-new'],
      ['banners-popups', 'banners-popups-detail'],
    ],
    data: ['@winpilot/store · SITE_BANNERS (slot 으로 갈린다) · findSiteBanner · nextSiteId'],
    notes: [
      '메인 비주얼과 팝업은 값이 한 벌이고 `slot` 으로만 갈린다. 폼도 한 벌이다 — 나누면 기간을 다루는 규칙이 두 벌이 되고 한쪽만 고친 채 반년이 지난다.',
      '돌아갈 목록은 둘이다. 메뉴가 둘이므로 상세 주소도 `/banners/{id}` 와 `/banners/popups/{id}` 로 나뉜다.',
      '끝난 날을 적는 순간 그 자리에서 알린다 — 이 갈래의 사고는 늘 같다. 끝난 배너가 그대로 걸려 있고, 그 사실은 대개 밖에서 먼저 알려 온다.',
      '끝을 비우면 계속 선다. 상시 배너가 실제로 있어 막지는 않되, 비운 것이 실수가 아니라 뜻이라는 것을 적어 두게 안내를 남긴다.',
      '팝업에만 본문과 링크 칸이 있다. 제목만 뜬 팝업은 무슨 일이 있는데 뭔지는 안 알려 주는 상자로 보이고, 그 상태는 올린 사람 화면에서는 멀쩡해 보인다.',
      '자리(왼쪽 위 · 가운데)를 고르는 칸을 두지 않는다. 여기 뜨는 것은 휴무 · 처리방침 개정처럼 읽히지 않으면 뜻이 없는 고지뿐이라, 모서리에 조용히 서는 자리를 만들면 그 팝업은 안 읽힌다.',
    ],
  },
  {
    id: 'statistics',
    purpose: '앞 갈래들이 쌓아 놓은 것을 읽기만 한다 — 그래서 매일 손대는 갈래들 뒤에 선다.',
    screens: [
      { screen: 'statistics', ko: '통계 홈' },
      { screen: 'statistics-period', ko: '기간별 분석' },
      { screen: 'statistics-pages', ko: '많이 방문한 페이지' },
    ],
    edges: [],
    data: ['@winpilot/store · VISIT_TREND · PAGE_VISITS', '@winpilot/store · SITE_INQUIRIES'],
    notes: [
      '읽기만 하는 갈래라 저장 · 등록 · 삭제가 하나도 없다. 앞에 두면 들어올 때마다 숫자를 먼저 보게 되는데, 정작 오늘 해야 할 일은 문의함에 있다.',
      '방문 옆에 늘 문의를 둔다. 방문이 늘어도 문의가 늘지 않으면 사람은 왔는데 화면이 설득하지 못한 것이고, 그때 손대야 하는 것은 광고가 아니라 화면이다.',
      '많이 방문한 페이지는 머문 시간을 함께 본다 — 짧게 머물고 나간 화면이 고쳐야 할 화면이다.',
      '막대는 CSS 로 그린다. 여섯 달의 높낮이 때문에 묶음 크기를 수백 KB 늘리면 콘솔 첫 화면이 그만큼 늦게 뜬다.',
      '숫자는 아직 씨앗이다(`site.ts` 의 `VISIT_TREND` · `PAGE_VISITS`) — 실제로 세는 곳이 없다.',
    ],
  },
  {
    id: 'settings',
    purpose: '사이트에 나가는 값이 아니라 **사이트 자체**의 값 — 그래서 메뉴에서 선 아래다.',
    screens: [
      { screen: 'settings-supplier', ko: '공급자 정보' },
      { screen: 'settings-seo', ko: 'SEO 정보' },
      { screen: 'settings-terms', ko: '서비스 이용약관' },
      { screen: 'settings-privacy', ko: '개인정보 처리방침' },
      { screen: 'settings-locales', ko: '국문 · 영문' },
    ],
    edges: [],
    data: [
      '@winpilot/store · SITE_SUPPLIER · BUSINESS_TYPES · BUSINESS_ITEMS',
      '@winpilot/store · SITE_SEO',
      '@winpilot/store · LEGAL_DOCS',
      '@winpilot/store · LOCALE_PAIRS · missingEnglish',
    ],
    notes: [
      '공급자 정보가 `회사 > 소개` 와 따로인 이유: 그쪽은 읽는 사람에게 우리를 알리는 글이고, 여기 있는 것은 전자상거래법 · 정보통신망법이 사이트에 적으라고 정한 항목이다. 빠지면 과태료가 붙는다.',
      '업태와 업종은 고르는 값이다. 손으로 적게 두면 같은 것이 여러 말로 남고, 업태를 바꾸면 업종이 그 아래 첫 값으로 되돌아간다 — 등록증에 있을 수 없는 짝을 막는다.',
      '약관과 처리방침은 **공개를 저장과 따로** 둔다. 초안을 적어 두고 법무 검토를 기다리는 동안 사이트에는 준비 중이라는 사실만 서 있어야 한다 — 검토 전 초안이 걸리면 그 순간부터 그것이 우리가 주장하는 문서다.',
      '처리방침의 수집 항목은 `문의 > 설정` 이 실제로 받는 칸과 같아야 한다. 한쪽만 고치면 동의 없이 받은 것이 된다.',
      '국문은 지울 수 없다. 영문이 비면 원문으로 대신하지만 국문이 비면 사이트의 그 자리가 통째로 사라진다.',
      'SEO 는 글자 수를 세어 보여 주되 넘겨도 막지 않는다 — 잘려도 되는 문장이 있다.',
    ],
  },
  {
    id: 'system',
    label: '시스템',
    purpose: '메뉴에 없지만 주소가 있는 화면 — 끝나는 자리.',
    screens: [{ screen: 'result', ko: '처리 결과' }],
    edges: [],
    data: ['주소 질의문자열 (state · kind · id)'],
    notes: [
      '사이드바에 항목이 없다. 그래도 도면에는 그린다 — 메뉴에 없다고 화면이 없는 것은 아니고, 그 사실을 모르면 같은 화면을 새로 만들려 든다.',
      '완료 · 실패가 한 화면이다(`/result?state=…`). 문구만 다르고 구조가 같아서, 나누면 한쪽만 고쳐 두 화면이 어긋난다.',
      '404 · 오류와 같은 `StatusScreen` 을 쓴다. 그 둘은 Next 의 약속된 파일이라 매니페스트에 없고, 여기에도 없다.',
      '로그인 화면이 없다 — 이 콘솔에는 아직 들어오는 문이 그려져 있지 않다. 없는 길을 도면에 그리지 않는다.',
    ],
  },
];

/**
 * 갈래를 넘는 이동.
 *
 * 사이드바 도면에는 **긋지 않는다** — 열두 갈래에 이 선을 다 그으면 도면이 그물이 되어 아무것도
 * 읽히지 않는다. 화면 하나를 볼 때(`/docs/ia/{화면}`)만 그 화면에 닿는 선을 꺼내 그린다.
 *
 * 사이드바에서 어느 갈래로나 갈 수 있는 길은 여기 적지 않는다. 어느 화면에서나 같으므로 적어
 * 두면 화면 수만큼 되풀이되고, 정작 그 화면에만 있는 길이 묻힌다.
 */
export type CrossEdge = {
  from: string;
  to: string;
  /** 어떤 길로 넘어가는가 */
  how: string;
};

/**
 * **지금은 비어 있다.**
 *
 * 다른 콘솔에서는 대시보드 카드가 그 수치를 만든 목록으로 보낸다. 이 콘솔의 대시보드에는 그
 * 링크가 없다 — 숫자와 지도를 읽는 화면이고, 손댈 곳으로 보내는 단추를 아직 두지 않았다.
 * 나머지 이동은 전부 갈래 안에서 끝난다(목록 → 등록 · 상세, 상세 → 돌아갈 목록).
 *
 * 없는 길을 미리 적어 두지 않는 이유는 도면이 곧 약속이 되기 때문이다. 도면에 선이 있으면
 * 그 길을 찾다가 없다는 것을 알고, 그때는 화면이 고장 난 것으로 읽힌다.
 */
export const CROSS_EDGES: CrossEdge[] = [];

export function findGroup(id: string): IaGroup | undefined {
  return IA_GROUPS.find((group) => group.id === id);
}

/** 화면이 속한 갈래. */
export function groupOf(screen: string): IaGroup | undefined {
  return IA_GROUPS.find((group) => group.screens.some((item) => item.screen === screen));
}

/** 갈래 이름 — 사이드바에 있는 것은 메뉴가 이긴다. 두 곳에 적으면 메뉴를 고칠 때 도면이 남는다. */
export function labelOf(group: IaGroup): string {
  return IR_MENU.find((section) => section.id === group.id)?.label ?? group.label ?? group.id;
}

/**
 * 화면의 한글 이름.
 *
 * 매니페스트의 `name` 은 Figma 페이지 이름이라 영문이다. 사람이 읽는 자리에는 한글을 먼저 쓰고,
 * 갈래에 적히지 않은 화면만 매니페스트 이름으로 돌아간다.
 */
export function koOf(screen: string): string {
  const found = IA_GROUPS.flatMap((group) => group.screens).find((item) => item.screen === screen);
  return found?.ko ?? pages.find((page) => page.id === screen)?.name ?? screen;
}

/**
 * 왼쪽 세움대에 세울 화면 목록 — **매니페스트 순서**를 따른다.
 *
 * 매니페스트 순번은 사이드바 메뉴 순서와 같게 매겨 둔 값이라(`pages.manifest.ts` 머리말),
 * 그대로 세우면 세움대와 사이드바가 같은 차례로 읽힌다.
 */
export function screenNavItems(): Array<{ slug: string; label: string }> {
  return pages.map((page) => ({ slug: page.id, label: koOf(page.id) }));
}

/** 매니페스트에 있는데 어느 갈래에도 들지 않은 화면. 도면이 화면을 따라가지 못한 자리다. */
export function ungrouped(): string[] {
  const held = new Set(IA_GROUPS.flatMap((group) => group.screens.map((item) => item.screen)));
  return pages.filter((page) => !held.has(page.id)).map((page) => page.id);
}

/** 갈래에는 적혀 있는데 매니페스트에 없는 화면. 지운 화면이 도면에 남은 자리다. */
export function unknownScreens(): string[] {
  const real = new Set(pages.map((page) => page.id));
  // 갈래를 넘는 선도 함께 본다 — 한쪽 끝이 사라진 선은 도면에서 허공으로 뻗는다.
  const named = [
    ...IA_GROUPS.flatMap((group) => group.screens.map((item) => item.screen)),
    ...CROSS_EDGES.flatMap((edge) => [edge.from, edge.to]),
  ];
  return [...new Set(named)].filter((screen) => !real.has(screen));
}
