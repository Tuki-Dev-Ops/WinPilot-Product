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
    areas: [
      { area: '헤더', purpose: '메뉴·검색·장바구니·알람. 모든 화면이 같은 것을 쓴다' },
      { area: '히어로 배너', purpose: '지금 밀고 있는 것을 가장 먼저 보여 준다', when: '노출 기간 안의 배너만' },
      { area: '바로가기 타일', purpose: '분류로 한 번에 들어가는 길' },
      { area: '신상품·베스트 줄', purpose: '새 것과 잘 나가는 것을 가로 줄로', when: '숨김 상품 제외' },
      { area: '푸터', purpose: '사업자 정보와 약관 링크' },
    ],
    policy: [
      '히어로는 목록을 여러 벌 이어 붙여 끝에서 끊기지 않는다(무한 반복).',
      '상품 줄은 가로 스크롤바 대신 장 표시(n/total)를 쓴다.',
      '노출 기간이 지난 배너는 목록에 오지 않는다 — 화면에서 숨기지 않고 아예 받지 않는다.',
    ],
    future: [
      '개인화 추천 줄. 지금은 모두에게 같은 줄을 보여 준다.',
      '배너 A/B 노출. 어드민에 노출 비율 항목이 생기면 붙는다.',
    ],
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
    areas: [
      { area: '분류 탭', purpose: '1Depth·2Depth 로 좁힌다', when: '2Depth 는 고른 1Depth 안에서만' },
      { area: '검색창', purpose: '상품명으로 찾는다' },
      { area: '필터 서랍', purpose: '분류·가격 범위를 한 번에 적용', when: '필터 단추를 눌렀을 때' },
      { area: '상품 격자', purpose: '조건에 맞는 상품' },
      { area: '빈 상태', purpose: '조건에 맞는 것이 없을 때 한 줄 안내', when: '결과 0건' },
    ],
    fields: [
      { name: '검색어', desc: '상품명 일부', type: '텍스트', rule: '앞뒤 공백 제거 · 대소문자 가리지 않음', example: '캠핑 체어' },
      { name: '1Depth 분류', desc: '대분류', type: '선택', rule: '어드민 카테고리', example: 'C-01' },
      { name: '2Depth 분류', desc: '소분류', type: '선택', rule: '고른 1Depth 안의 것만', example: 'C-04' },
      { name: '최저가', desc: '가격 범위 아래', type: '숫자', rule: '0 이상 정수', example: '30000' },
      { name: '최고가', desc: '가격 범위 위', type: '숫자', rule: '최저가 이상', example: '200000' },
    ],
    buttons: [
      { label: '필터 적용', onClick: '고른 조건을 주소에 넣는다', onSuccess: '목록이 조건에 맞게 다시 그려진다', onFail: '조건이 숫자가 아니면 그 조건은 없는 것으로 본다' },
      { label: '조건 지우기', onClick: '주소의 조건을 모두 뺀다', onSuccess: '전체 목록으로 돌아간다' },
    ],
    validations: [
      '가격 입력이 숫자가 아니면 **오류로 보지 않고 조건이 없는 것으로** 본다 — 목록을 비우지 않는다.',
      '최저가가 최고가보다 크면 두 값을 바꿔서 본다.',
      '2Depth 가 고른 1Depth 에 속하지 않으면 없는 것으로 본다.',
    ],
    policy: [
      '분류·검색·가격·쪽을 모두 주소에 둔다 — 새로고침·공유·뒤로가기에서 살아남는다.',
      '기본 정렬은 어드민이 정한 진열 순서다.',
      '신상품·베스트는 화면이 아니라 이 목록의 필터(`?tag=NEW|BEST`)다.',
    ],
    future: [
      '정렬 고르기(가격순·판매순). 지금은 진열 순서 하나다.',
    ],
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
    areas: [
      { area: '상품 이미지', purpose: '고른 것을 크게 본다' },
      { area: '옵션 고르기', purpose: '색상 × 사이즈', when: '옵션이 있는 상품만' },
      { area: '가격·적립', purpose: '정가·판매가·적립' },
      { area: '구매 단추 줄', purpose: '장바구니 담기 · 바로 결제' },
      { area: '상세 설명·리뷰 탭', purpose: '어드민이 넣은 설명과 고객 리뷰' },
    ],
    fields: [
      { name: '색상', desc: '옵션의 첫 갈래', type: '선택', required: true, rule: '재고 0 은 고를 수 없음', example: '베이지' },
      { name: '사이즈', desc: '고른 색상 안의 갈래', type: '선택', required: true, rule: '고른 색상에 있는 것만', example: 'M' },
      { name: '수량', desc: '살 개수', type: '숫자', required: true, rule: '1 이상 · 재고 이하', example: '2' },
    ],
    buttons: [
      { label: '장바구니 담기', onClick: '고른 옵션과 수량을 담는다', onSuccess: '토스트로 알리고 장바구니 수가 오른다', onFail: '옵션을 고르지 않았으면 그 자리에서 알린다' },
      { label: '바로 결제', onClick: '결제 화면으로 그 상품만 들고 간다', onSuccess: '`/orders/new?productId=…` 로 이동', onFail: '옵션 미선택이면 단추가 잠겨 있다' },
    ],
    validations: [
      '옵션을 고르지 않으면 두 단추 모두 잠긴다.',
      '수량은 1 이상이며 고른 옵션의 재고를 넘지 못한다.',
      '재고 0 옵션은 목록에는 남기되 고를 수 없고 취소선으로 표시한다 — 왜 못 고르는지 보여야 한다.',
    ],
    policy: [
      '판매중지·숨김 상품은 주소로 직접 들어와도 열리지 않는다.',
      '리뷰는 어드민이 숨긴 것(`visible: false`)이 오지 않는다.',
    ],
    future: [
      '관심 상품 담기. 지금은 헤더에 자리만 있다.',
    ],
    nonFunctional: ['담기·바로 구매가 같은 검사를 쓴다 — 한쪽만 막으면 다른 길로 같은 문제가 들어온다.'],
  },
  {
    screen: 'cart',
    purpose: '담아 둔 것을 확인하고 주문으로 넘긴다.',
    actions: ['수량 조절', '줄 삭제(확인 창)', '결제 화면으로 이동'],
    guards: ['품절 줄은 합계에서 빠지고 주문에서 제외된다 — 숨기지 않고 표시한다.', '수량은 재고를 넘지 못한다.'],
    admin: ['상품 > 상품 목록(가격·재고)'],
    areas: [
      { area: '담은 상품 목록', purpose: '옵션·수량·금액' },
      { area: '선택 도구', purpose: '전체 선택·선택 삭제' },
      { area: '금액 요약', purpose: '상품 금액·배송비·합계' },
      { area: '결제 단추', purpose: '고른 것만 결제로' },
      { area: '빈 상태', purpose: '담은 것이 없을 때', when: '목록 0건' },
    ],
    fields: [
      { name: '선택', desc: '결제할 것 고르기', type: '체크박스' },
      { name: '수량', desc: '담은 개수 고치기', type: '숫자', required: true, rule: '1 이상 · 재고 이하', example: '2' },
    ],
    buttons: [
      { label: '선택 삭제', onClick: '고른 줄을 뺀다', onSuccess: '목록과 합계가 다시 계산된다', onFail: '고른 것이 없으면 잠겨 있다' },
      { label: '결제하기', onClick: '고른 것만 결제 화면으로', onSuccess: '`/orders/new` 로 이동', onFail: '고른 것이 없으면 잠겨 있다' },
    ],
    validations: [
      '수량은 1 이상이며 재고를 넘지 못한다.',
      '고른 줄이 하나도 없으면 결제·삭제 단추가 잠긴다.',
    ],
    policy: [
      '비회원도 담을 수 있다 — 담을 때가 아니라 결제할 때 로그인을 묻는다.',
      '담은 뒤 품절된 상품은 목록에 남기되 고를 수 없게 하고 그 이유를 적는다.',
    ],
    future: [
      '장바구니 저장 기간·복구. 지금은 브라우저를 닫으면 사라진다.',
    ],
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
    areas: [
      { area: '주문 상품', purpose: '무엇을 사는지' },
      { area: '받는 사람', purpose: '이름·연락처·주소' },
      { area: '쿠폰·적립', purpose: '쓸 수 있는 것만 고른다', when: '보유한 쿠폰이 있을 때' },
      { area: '결제 수단', purpose: '고르는 자리' },
      { area: '약관 동의', purpose: '필수·선택을 갈라 보여 준다' },
      { area: '금액 요약과 결제 단추', purpose: '최종 금액' },
    ],
    fields: [
      { name: '받는 사람', desc: '이름', type: '텍스트', required: true, rule: '2자 이상', example: '홍길동' },
      { name: '연락처', desc: '전화번호', type: '텍스트', required: true, rule: '숫자·하이픈', example: '010-0000-0000' },
      { name: '주소', desc: '배송지', type: '텍스트', required: true, example: '서울시 성동구 …' },
      { name: '배송 요청사항', desc: '기사에게 남길 말', type: '텍스트', rule: '50자 이하', example: '부재 시 경비실' },
      { name: '쿠폰', desc: '적용할 쿠폰', type: '선택', rule: '사용 가능한 것만', example: '10% 할인' },
      { name: '필수 약관 동의', desc: '구매 조건 동의', type: '체크박스', required: true },
    ],
    buttons: [
      { label: '결제하기', onClick: '입력을 확인하고 결과 화면으로', onSuccess: '`/result?state=done&kind=order` 로 이동', onFail: '`/result?state=failed&kind=order` 로 이동' },
      { label: '쿠폰 적용', onClick: '고른 쿠폰을 금액에 반영', onSuccess: '합계가 다시 계산된다', onFail: '쓸 수 없는 쿠폰이면 그 이유를 적는다' },
    ],
    validations: [
      '필수 항목(받는 사람·연락처·주소·필수 약관)이 비면 결제 단추가 잠긴다.',
      '연락처는 숫자와 하이픈만 받는다.',
      '결제할 상품이 없으면 결제 단추가 잠긴다.',
      '기간이 지났거나 조건에 못 미치는 쿠폰은 고를 수 없다.',
    ],
    policy: [
      '상품 상세에서 장바구니를 거치지 않고 바로 들어올 수 있다(`?productId=…`).',
      '결제 수단은 화면만 있고 실제로 결제하지 않는다 — 서버가 없다.',
    ],
    future: [
      '배송지 주소록. 지금은 매번 적는다.',
      '부분 결제·분할 배송.',
    ],
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
    areas: [
      { area: '기간 필터', purpose: '언제 것을 볼지' },
      { area: '주문 목록', purpose: '주문번호·상품·금액·상태' },
      { area: '빈 상태', purpose: '주문이 없을 때', when: '목록 0건' },
    ],
    fields: [
      { name: '기간', desc: '조회 범위', type: '선택', rule: '최근 1개월·3개월·6개월', example: '최근 3개월' },
    ],
    policy: [
      '기본 정렬은 주문일 최신순이다.',
      '기간과 쪽을 주소에 둔다.',
      '주문은 마이페이지에 딸린 것이 아니라 독립된 자원이라 주소가 `/orders` 다.',
    ],
    future: [
      '주문 상태별 필터(배송중·완료).',
    ],
    nonFunctional: ['상태 이름은 어드민 화면과 글자까지 같다.'],
  },
  {
    screen: 'orders-detail',
    purpose: '한 주문의 결제·배송·운송장을 확인한다.',
    actions: ['운송장 번호 확인', '주문 목록으로 돌아가기'],
    guards: ['없는 주문번호는 404 다.'],
    admin: ['판매 상세 — 운송장·결제 취소·교환은 운영자가 처리한다'],
    areas: [
      { area: '주문 요약', purpose: '주문번호·주문일·상태' },
      { area: '상품 목록', purpose: '산 것과 금액' },
      { area: '배송 정보', purpose: '받는 사람·주소·운송장', when: '배송이 시작된 뒤' },
      { area: '결제 정보', purpose: '금액 내역' },
    ],
    policy: [
      '내 주문이 아니면 열리지 않는다.',
      '취소·교환은 상태에 따라 보이는 것이 달라진다.',
    ],
    future: [
      '취소·교환·반품 신청. 지금은 상태만 보여 준다.',
    ],
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
    areas: [
      { area: '왼쪽 aside', purpose: '마이페이지 갈래' },
      { area: '기본 정보', purpose: '닉네임·이메일·연락처' },
      { area: '비밀번호 변경', purpose: '따로 묶어 둔다' },
    ],
    fields: [
      { name: '닉네임', desc: '화면에 보이는 이름', type: '텍스트', required: true, rule: '2~12자 · 금칙어 불가', example: '바람가르는하늘' },
      { name: '연락처', desc: '전화번호', type: '텍스트', rule: '숫자·하이픈', example: '010-0000-0000' },
      { name: '현재 비밀번호', desc: '바꾸기 전 확인', type: '비밀번호', rule: '비밀번호를 바꿀 때만 필수' },
      { name: '새 비밀번호', desc: '바꿀 값', type: '비밀번호', rule: '8자 이상 · 영문+숫자' },
    ],
    buttons: [
      { label: '저장', onClick: '고친 값을 반영', onSuccess: '토스트로 알린다', onFail: '틀린 입력으로 포커스를 옮긴다' },
    ],
    validations: [
      '닉네임은 2~12자이며 금칙어를 쓸 수 없다.',
      '이메일은 바꿀 수 없다 — 계정을 가르는 값이라 화면에 보여만 준다.',
      '새 비밀번호를 적었으면 현재 비밀번호가 필수다.',
    ],
    policy: [
      '저장 전에 화면을 벗어나면 고친 값이 사라진다는 것을 확인으로 묻는다.',
    ],
    future: [
      '회원 탈퇴. 지금은 화면이 없다.',
    ],
    nonFunctional: ['들어오면 잠긴 상태다 — 확인하러 온 사람이 실수로 지우지 않게 한다.'],
  },
  {
    screen: 'mypage-inquiries',
    purpose: '내가 보낸 문의와 운영자의 답변을 한 자리에서 본다.',
    actions: ['상태 탭으로 좁히기', '답변 읽기'],
    guards: ['답변이 없으면 비워 두지 않고 준비 중이라고 적는다.'],
    admin: ['문의 > 목록 — 같은 기록이다'],
    areas: [
      { area: '왼쪽 aside', purpose: '마이페이지 갈래' },
      { area: '문의 목록', purpose: '제목·등록일·답변 여부' },
      { area: '상세 모달', purpose: '내용과 답변', when: '줄을 눌렀을 때' },
      { area: '빈 상태', purpose: '문의가 없을 때', when: '목록 0건' },
    ],
    policy: [
      '기본 정렬은 등록 최신순이다.',
      '답변 여부는 색과 함께 글자로도 알린다.',
    ],
    future: [
      '문의 다시 쓰기·취소.',
    ],
    nonFunctional: ['상태 이름(접수·처리중·답변완료·보류)이 어드민과 같다.'],
  },
  {
    screen: 'mypage-coupons',
    purpose: '가진 쿠폰과 받을 수 있는 쿠폰을 나눠 본다.',
    actions: ['내 쿠폰 / 쿠폰 받기 탭 전환', '쿠폰 받기(확인 창)'],
    guards: ['기간이 지난 쿠폰도 숨기지 않고 흐리게 남긴다 — 왜 못 쓰는지 알 수 있어야 한다.'],
    admin: ['*(쿠폰 화면 예정)* — 값은 store `COUPONS`'],
    areas: [
      { area: '왼쪽 aside', purpose: '마이페이지 갈래' },
      { area: '상태 탭', purpose: '사용 가능·사용 완료·기간 만료' },
      { area: '쿠폰 목록', purpose: '이름·할인·기한' },
      { area: '쿠폰 받기', purpose: '발급 대상이 열린 쿠폰', when: '받을 수 있는 쿠폰이 있을 때' },
    ],
    buttons: [
      { label: '쿠폰 받기', onClick: '내 쿠폰함에 담는다', onSuccess: '목록에 더해지고 토스트로 알린다', onFail: '이미 받았으면 그 자리에서 알린다' },
    ],
    policy: [
      '기본 탭은 사용 가능이다 — 지금 쓸 수 있는 것을 먼저 본다.',
      '만료된 쿠폰도 지우지 않고 남긴다. 왜 못 쓰는지 보여야 한다.',
    ],
    future: [
      '쿠폰 만료 알림.',
    ],
    nonFunctional: ['한 줄에 한 장씩 둔다 — 조건(기간·최소 금액·최대 할인)이 잘리면 쓸 수 있는지 알 수 없다.'],
  },
  {
    screen: 'alarms',
    purpose: '읽지 않은 소식을 먼저 본다.',
    actions: ['읽지 않음 / 읽음 / 전체 탭 전환', '알람이 가리키는 화면으로 이동'],
    guards: [],
    admin: ['판매 상태 변경 · 콘텐츠 > 공지사항 · 배너'],
    areas: [
      { area: '알람 목록', purpose: '받은 알림' },
      { area: '읽음 처리', purpose: '한 번에 읽음' },
      { area: '빈 상태', purpose: '알림이 없을 때', when: '목록 0건' },
    ],
    buttons: [
      { label: '모두 읽음', onClick: '읽지 않은 것을 모두 읽음으로', onSuccess: '헤더의 읽지 않은 수가 0 이 된다', onFail: '읽지 않은 것이 없으면 잠겨 있다' },
    ],
    policy: [
      '기본 정렬은 받은 시각 최신순이다.',
      '읽지 않은 수는 헤더에 숫자로 붙는다 — 색만으로 알리지 않는다.',
    ],
    future: [
      '알림 종류별 켜고 끄기.',
    ],
    nonFunctional: ['읽음 여부를 색만이 아니라 점으로도 구분한다.'],
  },
  {
    screen: 'login',
    purpose: '계정으로 들어온다.',
    actions: ['이메일·비밀번호 로그인', '소셜 로그인 5종', '회원가입 탭으로 이동'],
    guards: ['어느 항목이 틀렸는지 말하지 않는다 — 계정 존재 여부를 알려 주는 것과 같다.'],
    admin: ['사용자 > 사용자 목록', '사내 어드민 > OAuth 설정'],
    areas: [
      { area: '탭', purpose: '로그인 · 회원가입' },
      { area: '입력 묶음', purpose: '이메일·비밀번호' },
      { area: '소셜 로그인', purpose: '카카오·네이버 등', when: '어드민에 켜 둔 것만' },
      { area: '보조 링크', purpose: '비밀번호 찾기' },
    ],
    fields: [
      { name: '이메일', desc: '계정', type: '텍스트', required: true, rule: '`아이디@도메인` 모양', example: 'hello@example.com' },
      { name: '비밀번호', desc: '계정 비밀번호', type: '비밀번호', required: true, rule: '8자 이상' },
    ],
    buttons: [
      { label: '로그인', onClick: '입력을 확인하고 들어간다', onSuccess: '들어오기 전 화면으로 돌아간다', onFail: '무엇이 틀렸는지 입력 아래 적는다' },
    ],
    validations: [
      '이메일 모양이 아니면 그 자리에서 알린다.',
      '비밀번호는 8자 이상이다.',
      '둘 중 하나라도 비면 단추가 잠긴다.',
    ],
    policy: [
      '가입은 같은 화면의 탭에서 들어간다 — 계정이 없는 사람이 여기서 막히지 않게.',
      '소셜 로그인 목록은 사내 어드민이 켠 것만 나온다.',
    ],
    future: [
      '비밀번호 찾기 화면. 지금은 링크 자리만 있다.',
    ],
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
    areas: [
      { area: '탭', purpose: '로그인 · 회원가입' },
      { area: '입력 묶음', purpose: '이메일·비밀번호·닉네임' },
      { area: '약관 동의', purpose: '필수·선택을 갈라 보여 준다' },
    ],
    fields: [
      { name: '이메일', desc: '계정', type: '텍스트', required: true, rule: '`아이디@도메인` 모양', example: 'hello@example.com' },
      { name: '비밀번호', desc: '계정 비밀번호', type: '비밀번호', required: true, rule: '8자 이상 · 영문+숫자' },
      { name: '비밀번호 확인', desc: '같은 값 다시', type: '비밀번호', required: true, rule: '위와 같아야 함' },
      { name: '닉네임', desc: '화면에 보이는 이름', type: '텍스트', required: true, rule: '2~12자 · 금칙어 불가', example: '바람가르는하늘' },
      { name: '필수 약관 동의', desc: '이용약관·개인정보', type: '체크박스', required: true },
    ],
    buttons: [
      { label: '가입하기', onClick: '입력을 확인하고 계정을 만든다', onSuccess: '`/result?state=done&kind=signup` 으로 이동', onFail: '틀린 입력으로 포커스를 옮긴다' },
    ],
    validations: [
      '비밀번호와 확인 값이 다르면 그 자리에서 알린다.',
      '닉네임은 2~12자이며 금칙어를 쓸 수 없다.',
      '필수 약관에 동의하지 않으면 단추가 잠긴다.',
    ],
    policy: [
      '약관 본문은 링크로 열리며 로그인 없이 읽힌다.',
    ],
    future: [
      '이메일 인증. 지금은 형식만 본다.',
    ],
    nonFunctional: ['인증번호는 3분간 유효하고 남은 시간을 입력란 안에 보여 준다.'],
  },
  {
    screen: 'notices',
    purpose: '운영자가 알리는 것을 최신 순으로 본다.',
    actions: ['상세 열기'],
    guards: ['상단 고정 공지가 위로 온다.'],
    admin: ['콘텐츠 > 공지사항'],
    areas: [
      { area: '왼쪽 aside', purpose: '고객지원 갈래' },
      { area: '공지 목록', purpose: '제목·등록일' },
      { area: '빈 상태', purpose: '공지가 없을 때', when: '목록 0건' },
    ],
    policy: [
      '기본 정렬은 등록 최신순이다.',
      '상단 고정 공지는 어드민이 정하며 목록 맨 위에 붙는다.',
    ],
    future: [
      '공지 검색.',
    ],
    nonFunctional: ['왼쪽 aside 는 상세에서도 그대로 남는다 — 옆 갈래로 건너뛸 수 있어야 한다.'],
  },
  {
    screen: 'notices-detail',
    purpose: '공지 한 건을 읽는다.',
    actions: ['목록으로 돌아가기'],
    guards: ['없는 id 는 404 다.'],
    admin: ['콘텐츠 > 공지사항 상세의 에디터 내용 그대로'],
    areas: [
      { area: '왼쪽 aside', purpose: '고객지원 갈래' },
      { area: '본문', purpose: '어드민이 넣은 글' },
      { area: '이전·다음', purpose: '옆 글로' },
    ],
    policy: [
      '숨김 공지는 주소로 직접 들어와도 열리지 않는다.',
    ],
    future: [
      '첨부파일.',
    ],
    nonFunctional: ['제목 위에 목록으로 가는 길을 둔다 — 링크로 바로 들어온 사람에게 돌아갈 곳이 필요하다.'],
  },
  {
    screen: 'faqs',
    purpose: '자주 묻는 것을 분류와 함께 훑는다.',
    actions: ['상세 열기'],
    guards: [],
    admin: ['콘텐츠 > FAQ (분류 이름 포함)'],
    areas: [
      { area: '왼쪽 aside', purpose: '고객지원 갈래' },
      { area: '분류 탭', purpose: '자주 묻는 갈래' },
      { area: '아코디언 목록', purpose: '눌러서 펼친다' },
    ],
    policy: [
      '기본 분류는 전체다.',
      '펼친 상태는 주소에 두지 않는다 — 한 번에 여러 개를 펼쳐 읽는 화면이다.',
    ],
    future: [
      'FAQ 검색.',
    ],
    nonFunctional: ['아코디언 대신 목록 → 상세로 간다 — 공지·뉴스와 조작이 같아야 한다.'],
  },
  { screen: 'faqs-detail', purpose: '문답 한 건을 읽는다.', actions: ['목록으로 돌아가기'], guards: ['없는 id 는 404 다.'], admin: ['콘텐츠 > FAQ'], areas: [{ area: '왼쪽 aside', purpose: '고객지원 갈래' }, { area: '본문', purpose: '질문과 답변' }], policy: ['목록에서 펼쳐 읽을 수도 있고 주소로 바로 열 수도 있다 — 공유를 위해 주소를 따로 둔다.'], future: ['도움이 되었나요 응답.'], nonFunctional: ['답변 하나를 그대로 공유할 주소가 생긴다.'] },
  { screen: 'news', purpose: '회사 소식을 최신 순으로 본다.', actions: ['상세 열기'], guards: [], admin: ['콘텐츠 > 뉴스'], areas: [{ area: '왼쪽 aside', purpose: '고객지원 갈래' }, { area: '뉴스 목록', purpose: '제목·날짜·대표 이미지' }], policy: ['기본 정렬은 등록 최신순이다.'], future: ['태그별 보기.'], nonFunctional: ['어드민은 요약과 원문 링크만 관리한다 — 본문 전체는 언론사 쪽에 있다.'] },
  { screen: 'news-detail', purpose: '뉴스 한 건의 요약을 읽고 원문으로 간다.', actions: ['원문 보기(새 창)', '목록으로 돌아가기'], guards: ['없는 id 는 404 다.'], admin: ['콘텐츠 > 뉴스 상세'], areas: [{ area: '왼쪽 aside', purpose: '고객지원 갈래' }, { area: '요약 본문', purpose: '어드민이 넣은 요약' }, { area: '원문 링크', purpose: '언론사 쪽 원문으로', when: '원문 주소가 있을 때' }], buttons: [{ label: '원문 보기', onClick: '새 창으로 언론사 쪽을 연다', onSuccess: '우리 화면은 그대로 남는다' }], policy: ['숨김 뉴스는 주소로 직접 들어와도 열리지 않는다.', '본문 전체는 언론사 쪽에 있어 우리는 요약만 둔다.'], future: ['공유하기.'], nonFunctional: ['원문은 새 창으로 연다 — 우리 화면을 잃지 않게 한다.'] },
  {
    screen: 'portfolios',
    purpose: '무엇을 만들어 왔는지 훑는다.',
    actions: ['연도 탭으로 좁히기'],
    guards: [],
    admin: ['콘텐츠 > 포트폴리오'],
    areas: [
      { area: '연도 탭', purpose: '언제 한 일인지로 가른다' },
      { area: '작업 격자', purpose: '대표 이미지와 이름' },
    ],
    policy: [
      '기본 탭은 가장 최근 연도다.',
      '연도를 주소에 둔다.',
    ],
    future: [
      '작업 상세 화면. 지금은 격자에서 끝난다.',
    ],
    nonFunctional: ['상품 목록과 같은 격자·카드를 쓴다.', '설명은 두 줄까지만 — 카드 높이가 들쭉날쭉해지지 않게.'],
  },
  {
    screen: 'company',
    purpose: '무엇을 하는 회사인지 읽는다.',
    actions: ['소개 읽기', '사업자 정보 확인'],
    guards: ['대표 이미지가 없으면 자리표시자를 둔다 — 올렸을 때 배치가 밀리지 않게.'],
    admin: ['회사 > 회사 소개(본문·대표 이미지)', '설정 > 공급자 정보'],
    areas: [
      { area: '대표 이미지', purpose: '회사를 한 장으로', when: '어드민이 올렸을 때' },
      { area: '소개 글', purpose: '어드민이 넣은 글' },
      { area: '바로가기', purpose: '연혁·포트폴리오로' },
    ],
    policy: [
      '대표 이미지가 없으면 자리를 비우지 않고 기본 배경을 둔다.',
    ],
    future: [
      '오시는 길·지도.',
    ],
    nonFunctional: ['템플릿이 그림을 지어내지 않는다 — 어드민이 올린 것만 보여 준다.'],
  },
  {
    screen: 'company-history',
    purpose: '어떻게 커 왔는지 본다.',
    actions: ['연도별로 훑기'],
    guards: ['숨김 항목은 오지 않는다.'],
    admin: ['회사 > 연혁'],
    areas: [
      { area: '연혁 타임라인', purpose: '연도별로 쌓인 일' },
    ],
    policy: [
      '기본 정렬은 최신 연도부터다.',
      '연도만 뜻이 있는 자리라 날짜를 `YYYY` 로 적는다.',
    ],
    future: [
      '연혁 이미지.',
    ],
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
    areas: [
      { area: '왼쪽 aside', purpose: '고객지원 갈래' },
      { area: '안내문', purpose: '무엇을 적어야 하는지' },
      { area: '문의 양식', purpose: '분류·제목·내용·연락처' },
    ],
    fields: [
      { name: '문의 분류', desc: '무엇에 대한 문의인지', type: '선택', required: true, rule: '어드민이 정한 분류', example: '배송' },
      { name: '제목', desc: '한 줄 요약', type: '텍스트', required: true, rule: '2~50자', example: '배송이 늦습니다' },
      { name: '내용', desc: '자세한 내용', type: '여러 줄', required: true, rule: '10자 이상' },
      { name: '연락처', desc: '답변 받을 곳', type: '텍스트', required: true, rule: '이메일 또는 전화', example: 'hello@example.com' },
    ],
    buttons: [
      { label: '보내기', onClick: '입력을 확인하고 접수한다', onSuccess: '`/result?state=done&kind=inquiry` 로 이동', onFail: '틀린 입력으로 포커스를 옮긴다' },
    ],
    validations: [
      '제목은 2~50자, 내용은 10자 이상이다.',
      '연락처는 이메일 또는 전화번호 모양이어야 한다.',
      '필수 항목이 비면 단추가 잠긴다.',
    ],
    policy: [
      '문의 분류는 어드민이 정한다 — 템플릿에 박아 두지 않는다.',
      '보낸 문의는 마이페이지의 문의 내역에서 다시 본다.',
    ],
    future: [
      '파일 첨부. 지금은 글만 받는다.',
    ],
    nonFunctional: ['폼 하나뿐인 화면이라 가운데로 모은다.'],
  },
  { screen: 'terms', purpose: '이용약관을 읽는다.', actions: [], guards: [], admin: ['설정 > 약관 정보'], areas: [{ area: '본문', purpose: '어드민이 넣은 약관' }, { area: '판·시행일', purpose: '어느 판을 읽고 있는지' }], policy: ['로그인 없이 읽힌다 — 가입·결제에서 링크로 열린다.', '본문은 어드민이 넣는다. 템플릿에 박아 두면 고칠 때 배포해야 한다.'], future: ['개정 이력·판 고르기.'], nonFunctional: ['버전과 시행일을 함께 적는다 — 어느 판을 읽었는지 남아야 한다.'] },
  { screen: 'privacy', purpose: '개인정보 처리방침을 읽는다.', actions: [], guards: [], admin: ['설정 > 약관 정보'], areas: [{ area: '본문', purpose: '어드민이 넣은 처리방침' }, { area: '판·시행일', purpose: '어느 판을 읽고 있는지' }], policy: ['로그인 없이 읽힌다.', '문의 폼·회원가입의 동의 문구가 이 문서를 가리킨다.'], future: ['개정 이력·판 고르기.'], nonFunctional: ['문의 폼·회원가입의 동의 문구가 이 문서를 가리킨다.'] },
  {
    screen: 'result',
    purpose: '방금 한 일이 끝났는지 알린다.',
    actions: ['다음 화면으로 이동(주문 내역·마이페이지 등)'],
    guards: ['무엇이 끝났는지(`kind`)와 잘됐는지(`state`)를 주소로 받는다 — 새로고침해도 남는다.'],
    admin: ['판매 목록 · 문의 > 설정의 완료 문구'],
    areas: [
      { area: '결과 아이콘', purpose: '성공·실패를 모양으로 갈라 보여 준다' },
      { area: '안내 문구', purpose: '무엇이 끝났는지' },
      { area: '요약', purpose: '접수 번호 등', when: 'id 가 주소에 있을 때' },
      { area: '돌아갈 길', purpose: '무엇이 끝났는지에 따라 달라진다' },
    ],
    policy: [
      '완료·실패가 한 화면이다(`?state=done|failed`) — 문구와 아이콘만 바뀐다.',
      '무엇이 끝났는지(`kind`)에 따라 돌아갈 곳이 달라진다.',
      '성공을 색이 아니라 체크·느낌표 모양으로 갈라 알린다.',
    ],
    future: [
      '결과 화면에서 바로 다음 할 일 잇기.',
    ],
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
