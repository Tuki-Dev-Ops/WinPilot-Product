// `@/` 별칭 대신 상대 경로를 쓴다 — 이 모듈은 Next 밖(문서 생성 스크립트)에서도 읽힌다.
import { pages } from '../pages.manifest';

/**
 * 화면별 명세 — **기능과 비기능을 한 자리에서** 적는다.
 *
 * 마크다운 한 장에 26개 화면을 모두 적지 않는다. 그러면 한 화면을 고칠 때마다 긴 문서를 훑어야
 * 하고, 어느 화면의 명세가 비어 있는지도 보이지 않는다. 화면 하나가 항목 하나다.
 *
 * `screen` 은 `pages.manifest.ts` 의 `id` 와 같다 — 매니페스트에 있는데 여기 없으면
 * `missingSpecs()` 가 알려 준다. 문서가 화면을 따라가지 못하는 것을 사람이 기억하지 않는다.
 *
 * ## 어드민 연동
 * - 각 항목의 `admin` 이 그 화면이 읽는 어드민 화면이다. 자세한 표는 `/admin-sync`.
 */
/** 화면 구성 — 어떤 영역이 왜 있고 언제 보이는가 (FSD §3) */
export type SpecArea = { area: string; purpose: string; when?: string };

/** 입력·출력 항목 (FSD §4) */
export type SpecField = {
  name: string;
  desc: string;
  /** 입력 형태 — 읽기만 하는 값이면 `표시` */
  type: string;
  required?: boolean;
  /** 형식·길이·범위 */
  rule?: string;
  example?: string;
};

/** 단추와 그 결과 (FSD §6) */
export type SpecButton = {
  label: string;
  /** 눌렀을 때 */
  onClick: string;
  /** 성공했을 때 — 화면이 어떻게 바뀌는가 */
  onSuccess?: string;
  /** 실패했을 때 */
  onFail?: string;
};

export type ScreenSpec = {
  /** `pages.manifest.ts` 의 id */
  screen: string;
  /** 이 화면이 있는 이유 — 한 문장 */
  purpose: string;
  /** 이 화면을 두어서 얻는 것 — 없으면 목적에서 끌어 쓴다 */
  effect?: string;
  /** 할 수 있는 일 */
  actions: string[];
  /** 막는 것과 그때 나오는 말 */
  guards: string[];
  /** 값이 오는 어드민 화면 */
  admin: string[];
  /** 판정 가능한 비기능 조건 */
  nonFunctional: string[];

  /*
    아래는 기획 명세(FSD)를 채우는 항목이다. 적지 않으면 생성기가 그 절을 `N/A` 로 적는다 —
    비워 두는 것과 "해당 없음" 은 다르고, 읽는 사람은 그 둘을 구분할 수 없기 때문이다.
  */
  areas?: SpecArea[];
  fields?: SpecField[];
  buttons?: SpecButton[];
  /** 입력값을 거르는 규칙 (FSD §9) */
  validations?: string[];
  /** 기본 정렬·검색·페이징·조건 유지 (FSD §12) */
  policy?: string[];
  /** 앞으로 늘어날 방향 (FSD §14) */
  future?: string[];
};

/** 모든 화면에 공통으로 걸리는 비기능 조건. 화면별 항목에 되풀이해 적지 않는다. */
export const COMMON_NON_FUNCTIONAL = [
  '데스크톱 1440 · 태블릿 768 · 모바일 375 세 너비에서 가로 스크롤이 생기지 않는다.',
  'placeholder·option·input value 는 추출되지 않으므로 화면 문구로 쓰지 않는다 (겹친 글자·직접 그린 목록으로 대체).',
  '차트·아이콘·삽화는 전부 인라인 SVG 다. 비트맵은 Figma 에서 벡터로 복원되지 않는다.',
  '모션 감소를 켠 사용자에게는 자동 넘김·전환이 돌지 않는다.',
  '색만으로 상태를 알리지 않는다 — 모양이나 글자를 함께 둔다.',
  '토스트는 화면 하단 정중앙 한 곳에서만 뜬다.',
];

export const SCREEN_SPECS: ScreenSpec[] = [
  {
    screen: 'index',
    purpose: '무엇을 파는 곳인지와 지금 밀고 있는 것을 한 화면에서 보여 준다.',
    actions: ['히어로 배너 넘김(자동·수동)', '바로가기 타일로 분류 이동', '신상품·베스트 줄에서 상품 열기', '카테고리 탐색'],
    guards: ['노출 기간이 끝난 배너는 오지 않는다.', '숨김 상품은 어느 줄에도 나오지 않는다.'],
    admin: ['배너 > 메인 비주얼', '상품 > 상품 목록·카테고리', '설정 > 공급자 정보'],
    nonFunctional: [
      '히어로는 목록을 여러 벌 이어 붙여 끝에서 끊기지 않는다(무한 반복).',
      '바로가기 타일은 어느 너비에서도 한 줄이고, 넘치면 장 단위로 넘긴다.',
      '상품 줄은 가로 스크롤바 대신 장 표시(n/total)를 쓴다.',
    ],
  },
  {
    screen: 'products',
    purpose: '파는 것 전부를 한 자리에서 좁혀 가며 고른다.',
    actions: ['1Depth·2Depth 탭으로 분류', '상품명 검색', '필터 서랍에서 분류·가격 범위 적용', '상품 열기'],
    guards: [
      '2Depth 는 고른 1Depth 안에서만 유효하다 — 짝이 맞지 않으면 없는 것으로 본다.',
      '가격 입력이 숫자가 아니면 조건이 없는 것으로 본다(목록을 비우지 않는다).',
    ],
    admin: ['상품 > 상품 목록', '상품 > 카테고리'],
    nonFunctional: [
      '모든 조건이 주소에 남는다(`tag`·`category`·`sub`·`q`·`min`·`max`) — 새로고침·공유·뒤로가기에서 살아남는다.',
      '필터 서랍은 고르는 즉시 이동하지 않고 적용하기를 눌러야 닫힌다.',
    ],
  },
  {
    screen: 'products-detail',
    purpose: '이 상품을 살지 결정하는 데 필요한 것만 모아 둔다.',
    actions: ['색상 → 사이즈 순서로 옵션 고르기', '수량 조절', '장바구니 담기', '바로 구매', '설명·리뷰 탭 전환'],
    guards: [
      '옵션이 있는 상품은 고르기 전에 담을 수 없다.',
      '재고 0 옵션은 누를 수 없고 취소선으로 표시한다.',
      '수량은 재고를 넘지 못한다.',
    ],
    admin: ['상품 > 상품 등록(옵션·적립·배송)', '상품 > 카테고리'],
    nonFunctional: ['담기·바로 구매가 같은 검사를 쓴다 — 한쪽만 막으면 다른 길로 같은 문제가 들어온다.'],
  },
  {
    screen: 'cart',
    purpose: '담아 둔 것을 확인하고 주문으로 넘긴다.',
    actions: ['수량 조절', '줄 삭제(확인 창)', '결제 화면으로 이동'],
    guards: ['품절 줄은 합계에서 빠지고 주문에서 제외된다 — 숨기지 않고 표시한다.', '수량은 재고를 넘지 못한다.'],
    admin: ['상품 > 상품 목록(가격·재고)'],
    nonFunctional: ['담긴 것은 `localStorage` 에 남아 화면을 옮겨도 유지된다.'],
  },
  {
    screen: 'orders-new',
    purpose: '무엇을·어디로·얼마에 세 가지를 한 화면에서 확정한다.',
    actions: ['배송지 수정', '배송 요청사항 선택(직접 입력 포함)', '쿠폰 한 장 적용', '적립금 사용', '결제 수단 선택', '결제'],
    guards: [
      '배송지가 비면 결제할 수 없다.',
      '쿠폰의 최소 주문 금액을 넘지 못하면 막고 그 이유를 말한다.',
      '직접 입력을 골라 놓고 비워 두면 막는다.',
      '주문 내용 확인 동의 없이는 결제할 수 없다.',
    ],
    admin: ['상품 > 상품 목록', '사용자 > 사용자 목록(배송지)', '사내 어드민 > PG 설정'],
    nonFunctional: [
      '합계는 왼쪽에서 무엇을 바꾸든 즉시 따라 움직인다.',
      '쿠폰은 한 장만 쓴다 — 중복 적용 규칙이 정해지기 전에 화면이 규칙을 만들지 않는다.',
    ],
  },
  {
    screen: 'orders',
    purpose: '내 주문이 지금 어디까지 왔는지 본다.',
    actions: ['배송 상태 탭으로 좁히기', '주문 상세 열기'],
    guards: ['한 건도 없는 상태는 탭에서 뺀다 — 늘 0 인 탭이 줄지어 있으면 탭 줄만 길어진다.'],
    admin: ["판매 목록 (`/products/sales`) — 고객 화면의 '주문' 과 같은 자원"],
    nonFunctional: ['상태 이름은 어드민 화면과 글자까지 같다.'],
  },
  {
    screen: 'orders-detail',
    purpose: '한 주문의 결제·배송·운송장을 확인한다.',
    actions: ['운송장 번호 확인', '주문 목록으로 돌아가기'],
    guards: ['없는 주문번호는 404 다.'],
    admin: ['판매 상세 — 운송장·결제 취소·교환은 운영자가 처리한다'],
    nonFunctional: ['주문번호는 어드민과 같은 값이다(S-2408x).'],
  },
  {
    screen: 'mypage',
    purpose: '내 정보를 확인하고 필요할 때만 고친다.',
    actions: ['수정 시작·취소', '닉네임 자동 생성', '주소 찾기(우편번호 서비스)', '마케팅 동의', '저장(확인 창)'],
    guards: [
      '이메일·이름은 고칠 수 없다 — 주문·문의 기록을 묶는 값이고 실명이다.',
      '연락처는 숫자 9~11자리만 통과한다.',
      '주소 서비스가 막혀도 직접 입력할 수 있다.',
    ],
    admin: ['사용자 > 사용자 목록의 상세', '사용자 > 등급'],
    nonFunctional: ['들어오면 잠긴 상태다 — 확인하러 온 사람이 실수로 지우지 않게 한다.'],
  },
  {
    screen: 'mypage-inquiries',
    purpose: '내가 보낸 문의와 운영자의 답변을 한 자리에서 본다.',
    actions: ['상태 탭으로 좁히기', '답변 읽기'],
    guards: ['답변이 없으면 비워 두지 않고 준비 중이라고 적는다.'],
    admin: ['문의 > 목록 — 같은 기록이다'],
    nonFunctional: ['상태 이름(접수·처리중·답변완료·보류)이 어드민과 같다.'],
  },
  {
    screen: 'mypage-coupons',
    purpose: '가진 쿠폰과 받을 수 있는 쿠폰을 나눠 본다.',
    actions: ['내 쿠폰 / 쿠폰 받기 탭 전환', '쿠폰 받기(확인 창)'],
    guards: ['기간이 지난 쿠폰도 숨기지 않고 흐리게 남긴다 — 왜 못 쓰는지 알 수 있어야 한다.'],
    admin: ['*(쿠폰 화면 예정)* — 값은 store `COUPONS`'],
    nonFunctional: ['한 줄에 한 장씩 둔다 — 조건(기간·최소 금액·최대 할인)이 잘리면 쓸 수 있는지 알 수 없다.'],
  },
  {
    screen: 'alarms',
    purpose: '읽지 않은 소식을 먼저 본다.',
    actions: ['읽지 않음 / 읽음 / 전체 탭 전환', '알람이 가리키는 화면으로 이동'],
    guards: [],
    admin: ['판매 상태 변경 · 콘텐츠 > 공지사항 · 배너'],
    nonFunctional: ['읽음 여부를 색만이 아니라 점으로도 구분한다.'],
  },
  {
    screen: 'login',
    purpose: '계정으로 들어온다.',
    actions: ['이메일·비밀번호 로그인', '소셜 로그인 5종', '회원가입 탭으로 이동'],
    guards: ['어느 항목이 틀렸는지 말하지 않는다 — 계정 존재 여부를 알려 주는 것과 같다.'],
    admin: ['사용자 > 사용자 목록', '사내 어드민 > OAuth 설정'],
    nonFunctional: ['소셜 버튼의 색·문구·심볼은 각 사 브랜드 가이드라인을 그대로 따른다.'],
  },
  {
    screen: 'signup',
    purpose: '계정을 만든다.',
    actions: ['항목 입력', '닉네임 자동 생성', '이메일 인증(발송·확인)', '가입(확인 창)'],
    guards: [
      '이메일 인증을 마쳐야 가입할 수 있다.',
      '인증 뒤 주소를 고치면 인증이 풀린다.',
      '비밀번호 8자 이상·확인 일치·필수 동의.',
    ],
    admin: ['사용자 > 사용자 추가(목록 안 모달)와 같은 항목'],
    nonFunctional: ['인증번호는 3분간 유효하고 남은 시간을 입력란 안에 보여 준다.'],
  },
  {
    screen: 'notices',
    purpose: '운영자가 알리는 것을 최신 순으로 본다.',
    actions: ['상세 열기'],
    guards: ['상단 고정 공지가 위로 온다.'],
    admin: ['콘텐츠 > 공지사항'],
    nonFunctional: ['왼쪽 aside 는 상세에서도 그대로 남는다 — 옆 갈래로 건너뛸 수 있어야 한다.'],
  },
  {
    screen: 'notices-detail',
    purpose: '공지 한 건을 읽는다.',
    actions: ['목록으로 돌아가기'],
    guards: ['없는 id 는 404 다.'],
    admin: ['콘텐츠 > 공지사항 상세의 에디터 내용 그대로'],
    nonFunctional: ['제목 위에 목록으로 가는 길을 둔다 — 링크로 바로 들어온 사람에게 돌아갈 곳이 필요하다.'],
  },
  {
    screen: 'faqs',
    purpose: '자주 묻는 것을 분류와 함께 훑는다.',
    actions: ['상세 열기'],
    guards: [],
    admin: ['콘텐츠 > FAQ (분류 이름 포함)'],
    nonFunctional: ['아코디언 대신 목록 → 상세로 간다 — 공지·뉴스와 조작이 같아야 한다.'],
  },
  { screen: 'faqs-detail', purpose: '문답 한 건을 읽는다.', actions: ['목록으로 돌아가기'], guards: ['없는 id 는 404 다.'], admin: ['콘텐츠 > FAQ'], nonFunctional: ['답변 하나를 그대로 공유할 주소가 생긴다.'] },
  { screen: 'news', purpose: '회사 소식을 최신 순으로 본다.', actions: ['상세 열기'], guards: [], admin: ['콘텐츠 > 뉴스'], nonFunctional: ['어드민은 요약과 원문 링크만 관리한다 — 본문 전체는 언론사 쪽에 있다.'] },
  { screen: 'news-detail', purpose: '뉴스 한 건의 요약을 읽고 원문으로 간다.', actions: ['원문 보기(새 창)', '목록으로 돌아가기'], guards: ['없는 id 는 404 다.'], admin: ['콘텐츠 > 뉴스 상세'], nonFunctional: ['원문은 새 창으로 연다 — 우리 화면을 잃지 않게 한다.'] },
  {
    screen: 'portfolios',
    purpose: '무엇을 만들어 왔는지 훑는다.',
    actions: ['연도 탭으로 좁히기'],
    guards: [],
    admin: ['콘텐츠 > 포트폴리오'],
    nonFunctional: ['상품 목록과 같은 격자·카드를 쓴다.', '설명은 두 줄까지만 — 카드 높이가 들쭉날쭉해지지 않게.'],
  },
  {
    screen: 'company',
    purpose: '무엇을 하는 회사인지 읽는다.',
    actions: ['소개 읽기', '사업자 정보 확인'],
    guards: ['대표 이미지가 없으면 자리표시자를 둔다 — 올렸을 때 배치가 밀리지 않게.'],
    admin: ['회사 > 회사 소개(본문·대표 이미지)', '설정 > 공급자 정보'],
    nonFunctional: ['템플릿이 그림을 지어내지 않는다 — 어드민이 올린 것만 보여 준다.'],
  },
  {
    screen: 'company-history',
    purpose: '어떻게 커 왔는지 본다.',
    actions: ['연도별로 훑기'],
    guards: ['숨김 항목은 오지 않는다.'],
    admin: ['회사 > 연혁'],
    nonFunctional: ['연도는 내려도 왼쪽에 붙어 있는다 — 지금 몇 년도를 읽는지 잃지 않게.'],
  },
  {
    screen: 'contact',
    purpose: '문의를 보낸다.',
    actions: ['유형 선택', '항목 입력', '파일 첨부', '개인정보 동의', '보내기(확인 창)'],
    guards: [
      '어드민이 켠 항목만 나오고, 필수 여부도 어드민을 따른다.',
      '첨부는 고른 순간 형식·용량·개수를 검사한다.',
      '필수 동의 없이는 보낼 수 없다.',
    ],
    admin: ['문의 > 설정', '문의 > 목록(Path `/contact`)'],
    nonFunctional: ['폼 하나뿐인 화면이라 가운데로 모은다.'],
  },
  { screen: 'terms', purpose: '이용약관을 읽는다.', actions: [], guards: [], admin: ['설정 > 약관 정보'], nonFunctional: ['버전과 시행일을 함께 적는다 — 어느 판을 읽었는지 남아야 한다.'] },
  { screen: 'privacy', purpose: '개인정보 처리방침을 읽는다.', actions: [], guards: [], admin: ['설정 > 약관 정보'], nonFunctional: ['문의 폼·회원가입의 동의 문구가 이 문서를 가리킨다.'] },
  {
    screen: 'result',
    purpose: '방금 한 일이 끝났는지 알린다.',
    actions: ['다음 화면으로 이동(주문 내역·마이페이지 등)'],
    guards: ['무엇이 끝났는지(`kind`)와 잘됐는지(`state`)를 주소로 받는다 — 새로고침해도 남는다.'],
    admin: ['판매 목록 · 문의 > 설정의 완료 문구'],
    nonFunctional: ['성공은 체크, 실패는 느낌표로 모양까지 구분한다.', '404·오류와 한 컴포넌트를 쓰되 배치만 다르다.'],
  },
];

export function findSpec(screen: string): ScreenSpec | undefined {
  return SCREEN_SPECS.find((spec) => spec.screen === screen);
}

/** 매니페스트에 있는데 명세가 없는 화면. 문서가 화면을 따라가지 못하는 것을 화면이 스스로 알린다. */
export function missingSpecs(): string[] {
  return pages.filter((page) => !findSpec(page.id)).map((page) => page.id);
}
