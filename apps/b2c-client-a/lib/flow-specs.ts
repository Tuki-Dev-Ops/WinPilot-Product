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
 * `data` 에 적는 것은 공유 시드 패키지와 주소의 질의문자열, 그리고 브라우저 보관뿐이다.
 * 있지도 않은 API 를 흐름에 그리면 그 도면을 보고 만드는 사람이 서버를 찾는다.
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
  문자열에 큰따옴표·파이프를 넣지 않는다. 그대로 mermaid 노드 이름과 간선 라벨이 되므로
  따옴표가 들어가면 도면이 통째로 그려지지 않는다 (`lib/flow-diagram.ts` 의 `text()` 참고).
*/
export const FLOW_SPECS: ScreenFlow[] = [
  {
    screen: 'index',
    entries: ['주소를 바로 열어', '어느 화면에서든 로고를 눌러'],
    steps: ['히어로 배너를 본다', '바로가기 타일로 분류를 고른다', '신상품·베스트 줄을 훑는다'],
    branches: [],
    exceptions: [{ at: 0, label: '노출 기간이 끝난 배너는 목록에 오지 않는다 — 화면에서 숨기는 것이 아니라 받지 않는다' }],
    data: ['@winpilot/store · banners', '@winpilot/store · products', '@winpilot/store · categories'],
    exits: ['상품 목록으로', '상품 상세로 바로', '쿠폰함으로 (홈 쿠폰 띠)'],
  },
  {
    screen: 'products',
    entries: ['홈의 바로가기 타일에서', '헤더 메뉴에서', '조건이 담긴 주소를 공유받아'],
    steps: ['1Depth·2Depth 탭으로 좁힌다', '검색어와 가격 범위를 넣는다', '조건을 주소에 넣는다', '격자에서 상품을 고른다'],
    branches: [
      {
        after: 1,
        question: '가격이 숫자인가',
        block: '그 조건은 없는 것으로 본다 — 목록을 비우지 않는다',
        blockLabel: '아니오',
      },
      {
        after: 2,
        question: '맞는 상품이 있나',
        block: '빈 상태 — 조건을 지우는 길을 함께 둔다',
        blockLabel: '0건',
      },
    ],
    exceptions: [{ at: 0, label: '2Depth 가 고른 1Depth 에 속하지 않으면 없는 것으로 본다' }],
    data: ['@winpilot/store · products', '@winpilot/store · categories', '주소 질의문자열 (tag·category·sub·q·min·max)'],
    exits: ['상품 상세로'],
  },
  {
    screen: 'products-detail',
    entries: ['상품 목록에서 카드를 눌러', '홈의 신상품·베스트 줄에서 바로'],
    steps: ['색상을 고른다', '사이즈를 고른다', '수량을 맞춘다', '담기 또는 바로 구매를 누른다'],
    branches: [
      { after: 0, question: '색상을 골랐나', block: '토스트: 색상을 먼저 골라 주세요' },
      { after: 1, question: '사이즈를 골랐나', block: '토스트: 사이즈를 골라 주세요' },
      { after: 2, question: '수량이 재고 안인가', block: '토스트: 재고보다 많이 담을 수 없습니다' },
    ],
    exceptions: [
      { at: 0, label: '재고 0 옵션은 누를 수 없고 취소선으로 남는다 — 왜 못 고르는지 보여야 한다' },
      { at: 3, label: '판매중지·숨김 상품은 주소로 들어와도 열리지 않는다' },
    ],
    data: ['@winpilot/store · products', '@winpilot/store · product-options', '@winpilot/store · reviews'],
    exits: ['장바구니로 (담기)', '결제로 바로 (바로 구매 — 담기를 건너뛴다)'],
  },
  {
    screen: 'cart',
    entries: ['헤더의 장바구니', '상품 상세에서 담은 뒤'],
    steps: ['담은 줄을 확인한다', '수량을 고치거나 줄을 지운다', '결제할 것을 고른다', '결제하기를 누른다'],
    branches: [
      { after: 1, question: '지우려는가', pass: '삭제', block: '그대로 둔다', blockLabel: '취소' },
      { after: 2, question: '고른 줄이 있나', block: '결제·삭제 단추가 잠긴다' },
    ],
    exceptions: [{ at: 0, label: '담은 뒤 품절된 줄은 남기되 고를 수 없고 합계에서 빠진다' }],
    data: ['브라우저 보관 (app/_components/cart-store.ts)', '@winpilot/store · products'],
    exits: ['결제로', '로그인으로 — 비회원이면 결제 앞에서 묻는다'],
  },
  {
    screen: 'orders-new',
    entries: ['장바구니에서 고른 것으로', '상품 상세의 바로 구매로 (productId 를 주소에 실어)'],
    steps: ['받는 사람과 주소를 적는다', '쿠폰 한 장과 적립금을 고른다', '결제 수단을 고른다', '약관에 동의한다', '결제하기를 누른다'],
    branches: [
      { after: 0, question: '필수 항목이 다 찼나', block: '결제 단추가 잠긴다 — 눌러 놓고 막지 않는다' },
      { after: 1, question: '쿠폰 조건을 넘겼나', block: '왜 못 쓰는지 그 자리에 적는다', blockLabel: '못 미침' },
      { after: 3, question: '필수 동의를 했나', block: '결제 단추가 잠긴다' },
      { after: 4, question: '확인 창에서 결제할까요', pass: '결제', block: '결제 화면에 그대로 남는다', blockLabel: '취소' },
    ],
    exceptions: [{ at: 4, label: '어긋나면 실패 결과로 — /result?state=failed&kind=order' }],
    data: ['@winpilot/store · products', '@winpilot/store · coupons', '주소 질의문자열 (productId·optionId·qty)'],
    exits: ['처리 결과로 — /result?state=done&kind=order', '약관·처리방침으로 (동의 문구의 링크)'],
  },
  {
    screen: 'result',
    entries: ['결제를 마치고', '가입을 마치고', '문의를 접수하고'],
    steps: ['무엇이 끝났는지 읽는다', '접수 번호를 확인한다', '돌아갈 길을 고른다'],
    branches: [
      {
        after: 0,
        question: '잘 끝났나',
        pass: '완료',
        block: '실패 안내 — 무엇이 막혔는지와 다시 할 길을 함께 둔다',
        blockLabel: '실패',
      },
    ],
    exceptions: [{ at: 1, label: '주소에 id 가 없으면 요약 자리를 그리지 않는다' }],
    data: ['주소 질의문자열 (state·kind·id)'],
    exits: ['주문 내역으로 (주문)', '로그인으로 (가입)', '홈으로'],
  },
  {
    screen: 'orders',
    entries: ['마이페이지 왼쪽 갈래에서', '주문을 마친 결과 화면에서'],
    steps: ['기간을 고른다', '목록에서 주문을 찾는다', '상세를 연다'],
    branches: [{ after: 1, question: '그 기간에 주문이 있나', block: '빈 상태 — 기간을 넓히는 길을 둔다', blockLabel: '0건' }],
    exceptions: [],
    data: ['@winpilot/store · orders', '주소 질의문자열 (기간·쪽)'],
    exits: ['주문 상세로'],
  },
  {
    screen: 'orders-detail',
    entries: ['주문 내역에서 줄을 눌러', '주문번호가 담긴 주소로 바로'],
    steps: ['주문 요약과 상태를 본다', '산 것과 금액을 확인한다', '운송장 번호를 확인한다'],
    branches: [{ after: 1, question: '배송이 시작됐나', block: '배송 정보 자리를 아직 그리지 않는다', blockLabel: '아직' }],
    exceptions: [{ at: 0, label: '없는 주문번호는 404 화면' }],
    data: ['@winpilot/store · orders'],
    exits: ['주문 내역으로'],
  },
  {
    screen: 'mypage',
    entries: ['헤더의 계정 메뉴에서', '로그인을 마치고'],
    steps: ['잠긴 상태로 내 정보를 확인한다', '수정을 시작한다', '닉네임·연락처를 고친다', '저장을 누른다'],
    branches: [
      { after: 2, question: '입력이 규칙에 맞나', block: '틀린 입력으로 포커스를 옮긴다' },
      { after: 3, question: '확인 창에서 저장할까요', pass: '저장', block: '고친 값을 되돌린다', blockLabel: '취소' },
    ],
    exceptions: [
      { at: 0, label: '이메일·이름은 고칠 수 없다 — 기록을 묶는 값이라 보여만 준다' },
      { at: 2, label: '주소 찾기가 막혀도 직접 적을 수 있다' },
    ],
    data: ['@winpilot/store · nickname', '브라우저 보관 (app/_components/session-store.ts)'],
    exits: ['주문 내역·문의 내역·쿠폰함·알람으로'],
  },
  {
    screen: 'mypage-inquiries',
    entries: ['마이페이지 왼쪽 갈래에서', '문의를 접수한 결과 화면에서'],
    steps: ['상태 탭으로 좁힌다', '문의를 고른다', '답변을 읽는다'],
    branches: [{ after: 2, question: '답변이 달렸나', block: '비워 두지 않고 준비 중이라고 적는다', blockLabel: '아직' }],
    exceptions: [],
    data: ['@winpilot/store · inquiries'],
    exits: ['문의하기로 — 새로 묻는다'],
  },
  {
    screen: 'mypage-coupons',
    entries: ['마이페이지 왼쪽 갈래에서', '홈의 쿠폰 띠에서'],
    steps: ['내 쿠폰 / 쿠폰 받기 탭을 고른다', '받을 쿠폰을 고른다', '확인 창에서 받는다'],
    branches: [{ after: 1, question: '이미 받은 쿠폰인가', pass: '아니오', block: '그 자리에서 이미 받았다고 알린다', blockLabel: '예' }],
    exceptions: [{ at: 0, label: '기간이 지난 쿠폰도 지우지 않고 흐리게 남긴다 — 왜 못 쓰는지 알아야 한다' }],
    data: ['@winpilot/store · coupons'],
    exits: ['결제로 — 받은 쿠폰을 한 장 쓴다'],
  },
  {
    screen: 'alarms',
    entries: ['헤더의 알람 (읽지 않은 수가 붙어 있다)', '마이페이지 왼쪽 갈래에서'],
    steps: ['읽지 않음·읽음·전체 탭을 고른다', '알람을 읽는다', '모두 읽음으로 비운다'],
    branches: [{ after: 2, question: '읽지 않은 것이 있나', block: '모두 읽음 단추가 잠긴다' }],
    exceptions: [],
    data: ['브라우저 보관 (읽음 여부)'],
    exits: ['알람이 가리키는 화면으로'],
  },
  {
    screen: 'login',
    entries: ['헤더의 로그인', '결제 앞에서 회원임을 물었을 때', '마이페이지로 가려 했을 때'],
    steps: ['이메일과 비밀번호를 적는다', '로그인을 누른다'],
    branches: [
      { after: 0, question: '형식이 맞나', block: '단추가 잠긴다' },
      {
        after: 1,
        question: '들어갈 수 있나',
        block: '토스트: 로그인하지 못했습니다 — 어느 항목이 틀렸는지는 말하지 않는다',
      },
    ],
    exceptions: [{ at: 0, label: '소셜 로그인은 사내 어드민이 켠 것만 나온다' }],
    data: ['@winpilot/client-content · account', '브라우저 보관 (session-store)'],
    exits: ['들어오기 전 화면으로', '마이페이지로', '회원가입 탭으로'],
  },
  {
    screen: 'signup',
    entries: ['로그인 화면의 회원가입 탭'],
    steps: ['이메일을 적는다', '인증번호를 받아 넣는다', '비밀번호와 닉네임을 적는다', '약관에 동의한다', '가입하기를 누른다'],
    branches: [
      { after: 1, question: '번호가 맞고 시간이 남았나', block: '토스트: 인증하지 못했습니다 — 다시 받는다' },
      { after: 3, question: '필수 항목이 다 찼나', block: '틀린 입력으로 포커스를 옮긴다' },
      { after: 4, question: '확인 창에서 이 내용으로 가입할까요', pass: '가입', block: '폼에 그대로 남는다', blockLabel: '취소' },
    ],
    exceptions: [
      { at: 2, label: '인증한 뒤 주소를 고치면 인증이 풀린다 — 인증만 받아 놓고 다른 주소로 가입하지 못하게' },
    ],
    data: ['@winpilot/store · nickname', '@winpilot/store · policies (동의 문구가 가리키는 글)'],
    exits: ['처리 결과로 — /result?state=done&kind=signup', '약관·처리방침으로 (동의 문구의 링크)'],
  },
  {
    screen: 'contact',
    entries: ['고객지원 왼쪽 갈래에서', '푸터의 문의하기'],
    steps: ['문의 분류를 고른다', '제목과 내용을 적는다', '연락처를 적는다', '개인정보 동의를 한다', '보내기를 누른다'],
    branches: [
      { after: 2, question: '길이와 형식이 맞나', block: '토스트: 문의를 보내지 못했습니다 + 첫 번째 문제' },
      { after: 3, question: '필수 동의를 했나', block: '보내기 단추가 잠긴다' },
      { after: 4, question: '확인 창에서 문의를 보낼까요', pass: '보내기', block: '적은 내용이 그대로 남는다', blockLabel: '취소' },
    ],
    exceptions: [{ at: 0, label: '어드민이 켠 항목만 나오고 필수 여부도 어드민을 따른다' }],
    data: ['@winpilot/store · inquiry-form (어드민이 정한 항목·분류)'],
    exits: ['처리 결과로 — /result?state=done&kind=inquiry', '문의 내역으로 — 답변은 거기서 본다'],
  },
  {
    screen: 'notices',
    entries: ['고객지원 왼쪽 갈래에서', '푸터의 공지사항'],
    steps: ['목록을 훑는다', '공지를 연다'],
    branches: [],
    exceptions: [{ at: 0, label: '상단 고정 공지가 맨 위에 붙는다 — 어드민이 정한다' }],
    data: ['@winpilot/store · contents (공지)'],
    exits: ['공지 상세로'],
  },
  {
    screen: 'notices-detail',
    entries: ['공지 목록에서', '공유받은 주소로 바로'],
    steps: ['본문을 읽는다', '이전·다음 글로 옮긴다'],
    branches: [],
    exceptions: [
      { at: 0, label: '없는 id 는 404 화면' },
      { at: 0, label: '숨김 공지는 주소로 들어와도 열리지 않는다' },
    ],
    data: ['@winpilot/store · contents (공지)'],
    exits: ['공지 목록으로'],
  },
  {
    screen: 'faqs',
    entries: ['고객지원 왼쪽 갈래에서'],
    steps: ['분류 탭으로 좁힌다', '문답을 연다'],
    branches: [],
    exceptions: [],
    data: ['@winpilot/store · contents (FAQ·분류)'],
    exits: ['FAQ 상세로'],
  },
  {
    screen: 'faqs-detail',
    entries: ['FAQ 목록에서', '공유받은 주소로 바로'],
    steps: ['질문과 답변을 읽는다'],
    branches: [],
    exceptions: [{ at: 0, label: '없는 id 는 404 화면' }],
    data: ['@winpilot/store · contents (FAQ)'],
    exits: ['FAQ 목록으로'],
  },
  {
    screen: 'news',
    entries: ['고객지원 왼쪽 갈래에서'],
    steps: ['최신 순으로 훑는다', '뉴스를 연다'],
    branches: [],
    exceptions: [],
    data: ['@winpilot/store · contents (뉴스)'],
    exits: ['뉴스 상세로'],
  },
  {
    screen: 'news-detail',
    entries: ['뉴스 목록에서'],
    steps: ['요약을 읽는다', '원문 보기를 누른다'],
    branches: [{ after: 1, question: '원문 주소가 있나', pass: '있음', block: '원문 링크 자리를 그리지 않는다', blockLabel: '없음' }],
    exceptions: [
      { at: 0, label: '없는 id 는 404 화면' },
      { at: 1, label: '원문은 새 창으로 연다 — 우리 화면을 잃지 않게 한다' },
    ],
    data: ['@winpilot/store · contents (뉴스)'],
    exits: ['뉴스 목록으로'],
  },
  {
    screen: 'portfolios',
    entries: ['회사소개의 바로가기에서', '헤더 메뉴에서'],
    steps: ['연도 탭을 고른다', '작업 격자를 훑는다'],
    branches: [],
    exceptions: [],
    data: ['@winpilot/store · contents (포트폴리오)', '주소 질의문자열 (연도)'],
    exits: ['여기서 끝난다 — 작업 상세 화면은 아직 없다'],
  },
  {
    screen: 'company',
    entries: ['헤더의 회사소개', '푸터에서'],
    steps: ['대표 이미지와 소개 글을 읽는다', '사업자 정보를 확인한다', '연혁·포트폴리오로 넘어간다'],
    branches: [
      {
        after: 0,
        question: '어드민이 대표 이미지를 올렸나',
        pass: '올림',
        block: '자리표시자를 둔다 — 올렸을 때 배치가 밀리지 않게',
        blockLabel: '없음',
      },
    ],
    exceptions: [],
    data: ['@winpilot/store · company', '@winpilot/store · policies (사업자 정보)'],
    exits: ['연혁으로', '포트폴리오로'],
  },
  {
    screen: 'company-history',
    entries: ['회사소개의 바로가기에서', '헤더 메뉴에서'],
    steps: ['최신 연도부터 내려 읽는다'],
    branches: [],
    exceptions: [{ at: 0, label: '숨김 항목은 오지 않는다' }],
    data: ['@winpilot/store · company (연혁)'],
    exits: ['회사소개로'],
  },
  {
    screen: 'terms',
    entries: ['푸터에서', '회원가입·결제의 동의 문구 링크로'],
    steps: ['어느 판인지 확인한다', '본문을 읽는다'],
    branches: [],
    exceptions: [],
    data: ['@winpilot/store · policies'],
    exits: ['읽던 화면으로 돌아간다'],
  },
  {
    screen: 'privacy',
    entries: ['푸터에서', '회원가입·문의의 동의 문구 링크로'],
    steps: ['어느 판인지 확인한다', '본문을 읽는다'],
    branches: [],
    exceptions: [],
    data: ['@winpilot/store · policies'],
    exits: ['읽던 화면으로 돌아간다'],
  },
];

/**
 * 여정 — **화면 하나가 아니라 하고 싶은 일 하나**를 따라간다.
 *
 * 화면별 흐름만 있으면 "사려면 어디를 몇 번 거치는가" 를 사람이 머릿속에서 이어 붙여야 한다.
 * 여정은 그 이어 붙이기를 대신한다. 단계는 화면 이름으로 적는다 — 화면 안의 자세한 것은
 * 그 화면의 흐름에 이미 있다.
 */
export const JOURNEYS: NamedFlow[] = [
  {
    id: 'purchase',
    title: '사기',
    purpose: '고르는 것에서 결제까지, 담기를 거치는 길과 건너뛰는 길이 함께 있다.',
    entries: ['홈', '상품 목록'],
    steps: ['상품 상세', '장바구니', '결제', '처리 결과', '주문 내역'],
    branches: [
      { after: 0, question: '한 개만 사는가', pass: '바로 구매', block: '장바구니에 담아 모은다', blockLabel: '여럿' },
      { after: 2, question: '회원인가', block: '로그인을 먼저 묻는다 — 담을 때가 아니라 결제할 때다' },
    ],
    exceptions: [{ at: 2, label: '어긋나면 실패 결과로 — 적은 값은 지우지 않는다' }],
    data: ['@winpilot/store · products', '@winpilot/store · coupons', '브라우저 보관 (장바구니)'],
    exits: ['주문 상세에서 배송을 따라간다'],
  },
  {
    id: 'account',
    title: '계정 만들기',
    purpose: '가입하고 들어오기까지. 이메일 인증이 가운데를 가른다.',
    entries: ['헤더의 로그인'],
    steps: ['로그인 화면의 회원가입 탭', '회원가입', '처리 결과', '로그인', '마이페이지'],
    branches: [{ after: 1, question: '이메일 인증을 마쳤나', block: '가입 단추가 잠긴다' }],
    exceptions: [{ at: 1, label: '인증한 주소를 고치면 인증이 풀린다' }],
    data: ['@winpilot/store · nickname', '브라우저 보관 (session-store)'],
    exits: ['들어오기 전 보던 화면으로'],
  },
  {
    id: 'support',
    title: '묻고 답 받기',
    purpose: '묻기 전에 찾아보게 하고, 찾지 못했을 때만 묻게 한다.',
    entries: ['헤더의 고객지원', '푸터'],
    steps: ['FAQ·공지사항', '문의하기', '처리 결과', '문의 내역'],
    branches: [{ after: 0, question: '읽고 풀렸나', pass: '풀림', block: '문의 양식으로 넘어간다', blockLabel: '아니오' }],
    exceptions: [{ at: 1, label: '어드민이 켠 항목만 나온다 — 템플릿이 항목을 정하지 않는다' }],
    data: ['@winpilot/store · contents', '@winpilot/store · inquiry-form'],
    exits: ['답변이 달리면 문의 내역에서 읽는다'],
  },
  {
    id: 'coupon',
    title: '쿠폰 쓰기',
    purpose: '받는 곳과 쓰는 곳이 떨어져 있어 한 번에 보여 준다.',
    entries: ['홈의 쿠폰 띠'],
    steps: ['쿠폰함', '쿠폰 받기', '결제에서 한 장 적용'],
    branches: [{ after: 2, question: '최소 주문 금액을 넘겼나', block: '왜 못 쓰는지 그 자리에 적는다', blockLabel: '못 미침' }],
    exceptions: [{ at: 0, label: '기간이 지난 쿠폰도 지우지 않고 흐리게 남긴다' }],
    data: ['@winpilot/store · coupons'],
    exits: ['깎인 금액으로 결제한다'],
  },
];

/**
 * 공통 상호작용 — **어느 화면에서나 같은 것**.
 *
 * 화면마다 되풀이해 적으면 26벌이 되고, 26벌은 한 번에 고쳐지지 않는다. 여기 한 벌만 둔다.
 */
export const COMMON_FLOWS: NamedFlow[] = [
  {
    id: 'navigation',
    title: '내비게이션',
    purpose: '헤더는 어느 화면에서나 같고, 갈래 안에서만 왼쪽 aside 가 더해진다.',
    entries: ['어느 화면에서든'],
    steps: ['헤더에서 갈래를 고른다', '갈래의 목록 화면', '왼쪽 aside 로 옆 갈래를 넘나든다', '상세 화면'],
    branches: [{ after: 3, question: '돌아갈 곳이 있나', block: '제목 위의 목록 링크로 돌아간다', blockLabel: '주소로 바로 들어옴' }],
    exceptions: [{ at: 2, label: 'aside 는 상세에서도 그대로 남는다 — main 만 바뀐다' }],
    data: ['@winpilot/store · categories (헤더 2Depth)'],
    exits: ['로고를 누르면 홈으로'],
  },
  {
    id: 'modal',
    title: '모달과 확인 창',
    purpose: '되돌릴 수 없는 일 앞에서 한 번 묻는다. 묻지 않아도 되는 일에는 묻지 않는다.',
    entries: ['삭제·주문·저장처럼 되돌리기 어려운 동작'],
    steps: ['확인 창이 화면 가운데 열린다', '뒤 화면이 어두워지고 스크롤이 멈춘다', '실행 또는 취소를 고른다'],
    branches: [{ after: 2, question: '실행을 골랐나', pass: '실행', block: '아무 일도 없이 닫힌다 — 적은 값은 그대로', blockLabel: '취소' }],
    exceptions: [{ at: 1, label: 'ESC 또는 바깥을 누르면 취소와 같다' }],
    data: [],
    exits: ['토스트로 결과를 알린다', '흐름이 끝난 일은 결과 화면으로 옮긴다'],
  },
  {
    id: 'error',
    title: '오류와 빈 상태',
    purpose: '무엇이 왜 막혔는지와 다시 할 길을 늘 같은 자리에 둔다.',
    entries: ['없는 주소', '처리 중 예외', '되돌릴 수 없는 동작의 실패'],
    steps: ['어떤 종류인지 가른다', '같은 자리에 안내를 그린다', '돌아갈 길을 둔다'],
    branches: [
      {
        after: 0,
        question: '화면을 못 여는 것인가',
        pass: '못 엶',
        block: '토스트로 알리고 화면은 그대로 둔다 — 적은 값을 지우지 않는다',
        blockLabel: '동작 실패',
      },
    ],
    exceptions: [{ at: 1, label: '흐름이 끝난 뒤의 실패는 /result?state=failed 로 옮긴다' }],
    data: ['주소 질의문자열 (state·kind)'],
    exits: ['홈으로', '방금 있던 목록으로'],
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
