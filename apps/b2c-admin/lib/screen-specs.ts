// `@/` 별칭 대신 상대 경로를 쓴다 — 이 모듈은 Next 밖(문서 생성 스크립트)에서도 읽힌다.
import { pages } from '../pages.manifest';

/**
 * 화면별 명세 — 어드민.
 *
 * 고객 화면의 명세와 **같은 모양**을 쓴다(`apps/b2c-client-a/lib/screen-specs.ts`).
 * 두 앱의 명세 구조가 다르면 같은 항목을 서로 다른 이름으로 찾게 되고, 생성기도 두 벌이 된다.
 *
 * 방향만 반대다. 고객 화면의 `admin` 은 **값을 받아 오는 곳**이고, 여기 `admin` 은
 * 여기서 정한 값이 **나타나는 고객 화면**이다. 어느 쪽이 원본인지 문서에서 갈려야 한다.
 *
 * `screen` 은 `pages.manifest.ts` 의 `id` 와 같다.
 */
export type SpecArea = { area: string; purpose: string; when?: string };

export type SpecField = {
  name: string;
  desc: string;
  type: string;
  required?: boolean;
  rule?: string;
  example?: string;
};

export type SpecButton = { label: string; onClick: string; onSuccess?: string; onFail?: string };

export type ScreenSpec = {
  screen: string;
  purpose: string;
  /**
   * 이 화면이 왜 생겼는가 — **목적보다 앞의 이야기**.
   *
   * `purpose` 는 이 화면이 지금 무엇을 하는지를 적고, 여기는 **그 화면이 없던 때 무엇이
   * 불편했는지**를 적는다. 둘을 한 칸에 쓰면 목적이 길어지면서 "무엇을 하는가" 가 흐려진다.
   *
   * 없어도 된다. 배경이 특별할 것 없는 화면(약관 · 개인정보처럼 법이 요구해서 있는 화면)에
   * 억지로 쓰면 지어낸 이야기가 남는다 — 그럴 바에는 비워 두는 편이 낫다.
   */
  background?: string;
  effect?: string;
  actions: string[];
  guards: string[];
  /** 여기서 정한 값이 나타나는 고객 화면 */
  admin: string[];
  nonFunctional: string[];
  areas?: SpecArea[];
  fields?: SpecField[];
  buttons?: SpecButton[];
  validations?: string[];
  policy?: string[];
  future?: string[];
};

/** 모든 어드민 화면에 공통으로 걸리는 조건. 화면별 항목에 되풀이해 적지 않는다. */
export const COMMON_NON_FUNCTIONAL = [
  '데스크톱 1440 · 태블릿 768 · 모바일 375 세 너비에서 가로 스크롤이 생기지 않는다.',
  '목록의 검색·필터·쪽은 주소에 남는다 — 운영자가 같은 조건을 다시 만들지 않게.',
  '되돌릴 수 없는 일(삭제·발송)은 확인을 한 번 묻는다.',
  '저장 결과는 화면 하단 정중앙 토스트 한 곳에서만 알린다.',
  '색만으로 상태를 알리지 않는다 — 모양이나 글자를 함께 둔다.',
  '표는 자기 상자 안에서만 가로로 스크롤한다. 페이지 전체가 밀리지 않게.',
];

/*
  콘텐츠 4종(공지사항 · FAQ · 뉴스 · 포트폴리오)과 배너 2종은 목록 · 등록 · 상세가 같은 구성을
  쓴다. 화면마다 문장을 따로 적으면 한 곳을 고칠 때 나머지가 옛 문장으로 남으므로, 공통 항목은
  아래에서 한 번 정의하고 화면별로 다른 것만 각 항목에 적는다.
*/
const LIST_AREAS: SpecArea[] = [
  { area: '목록 검색 영역', purpose: '검색 입력 · 필터 · 등록 버튼' },
  { area: '목록 테이블', purpose: '1행에 항목 1건' },
  { area: '선택 항목 처리 영역', purpose: '선택한 항목에 대한 일괄 처리', when: '목록에서 항목을 선택했을 때' },
  { area: '페이지 내비게이션', purpose: '전체 페이지 수와 현재 페이지' },
  { area: '데이터 없음 안내', purpose: '검색 조건에 해당하는 항목이 없을 때 표시', when: '검색 결과 0건' },
];

const FORM_AREAS: SpecArea[] = [
  { area: '입력 영역', purpose: '등록 및 수정 항목' },
  { area: '미리보기 영역', purpose: '고객 화면에 표시되는 형태', when: '입력값이 있을 때' },
  { area: '저장 버튼 영역', purpose: '저장 · 취소' },
];

const FORM_BUTTONS: SpecButton[] = [
  { label: '저장', onClick: '입력값을 검증한 뒤 저장한다', onSuccess: '저장 완료를 안내하고 목록 화면으로 이동한다', onFail: '검증에 실패한 입력 항목으로 포커스를 이동한다' },
  { label: '취소', onClick: '수정 내용을 반영하지 않는다', onSuccess: '목록 화면으로 이동한다', onFail: '수정 내용이 있으면 확인 안내를 표시한다' },
];

const LIST_POLICY = [
  '기본 정렬은 등록일 최신순입니다.',
  '검색어 · 필터 · 페이지를 URL 파라미터로 유지합니다. 새로고침과 뒤로가기에서 조건이 유지되어야 합니다.',
  '검색어가 미입력이면 조건에서 제외합니다. 목록을 비우지 않습니다.',
];

const CONTENT_FIELDS: SpecField[] = [
  { name: '제목', desc: '목록과 상세에 표시되는 제목', type: '텍스트', required: true, rule: '2~60자' },
  { name: '본문', desc: '고객 화면에 표시되는 본문', type: '편집기', required: true, rule: '10자 이상' },
  { name: '대표 이미지', desc: '목록에 표시되는 이미지', type: '파일', rule: 'PNG · JPG · WEBP · 5MB 이하' },
  { name: '노출', desc: '고객 화면 노출 여부', type: '체크박스' },
];

const CONTENT_FORM_POLICY = ['등록 직후에는 비노출 상태입니다. 작성 중인 내용이 고객 화면에 노출되지 않도록 하기 위한 것입니다.'];

const CONTENT_FORM_NF = ['본문 편집기가 생성한 HTML 을 고객 화면에서 그대로 표시합니다. 데이터 출처가 관리자이므로 외부 입력에 해당하지 않습니다.'];

export const SCREEN_SPECS: ScreenSpec[] = [
  {
    screen: 'dashboard',
    purpose: '당일 처리 대상 항목을 요약하여 제공하는 운영 현황 페이지입니다.',
    actions: ['주요 지표 카드 선택 시 해당 목록으로 이동', '처리 대기 목록 조회'],
    guards: ['해당 건수가 0이면 카드에 0을 표시합니다. 카드 자체를 숨기지 않습니다.'],
    admin: ['없음 — 운영자 전용 화면입니다.'],
    areas: [
      { area: '주요 지표 카드', purpose: '당일 처리 현황 수치' },
      { area: '처리 대기 목록', purpose: '우선 처리가 필요한 항목' },
    ],
    policy: ['지표 카드를 선택하면 해당 집계 조건이 적용된 목록 화면으로 이동합니다.'],
    future: ['전일 대비 비교'],
    nonFunctional: ['지표 카드의 수치는 해당 목록 화면의 동일 조건 결과와 항상 일치해야 합니다.'],
  },
  {
    screen: 'login',
    purpose: '운영자 계정으로 로그인하는 페이지입니다.',
    actions: ['이메일 및 비밀번호 로그인'],
    guards: ['두 항목 중 하나라도 미입력이면 버튼을 비활성화합니다.'],
    admin: ['없음 — 고객 화면과 계정 체계가 다릅니다.'],
    areas: [{ area: '로그인 입력 영역', purpose: '이메일 · 비밀번호' }],
    fields: [
      { name: '이메일', desc: '운영자 계정 아이디', type: '텍스트', required: true, rule: '`아이디@도메인` 형식', example: 'demo@winpilot.test' },
      { name: '비밀번호', desc: '계정 비밀번호', type: '비밀번호', required: true, rule: '8자 이상' },
    ],
    buttons: [
      { label: '로그인', onClick: '입력값을 검증한 뒤 로그인을 처리한다', onSuccess: '대시보드로 이동한다', onFail: '검증 실패 사유를 입력 항목 하단에 표시한다' },
    ],
    validations: ['이메일 형식이 아니면 해당 위치에 안내를 표시합니다.', '비밀번호는 8자 이상입니다.'],
    future: ['2단계 인증'],
    nonFunctional: ['로그인 화면에는 사이드바를 표시하지 않습니다.'],
  },
  {
    screen: 'users',
    purpose: '가입 회원을 조회하고 상태를 관리하는 회원 목록 페이지입니다.',
    actions: ['성명 · 닉네임 · 이메일 · 회원번호 검색', '회원 상태 필터', '회원 상세 조회 및 삭제'],
    guards: ['삭제 시 확인 모달을 표시합니다.', '개인정보는 목록에서 마스킹하여 표시합니다.'],
    admin: ['마이페이지 — 본 화면에서 변경한 등급이 고객 화면의 혜택에 반영됩니다.'],
    areas: LIST_AREAS,
    policy: [...LIST_POLICY, '기본 탭은 전체입니다.'],
    future: ['회원 목록 내보내기(CSV)'],
    nonFunctional: ['이메일과 연락처는 목록에서 마스킹합니다.'],
  },
  {
    screen: 'users-admins',
    purpose: '운영자 계정을 등록하고 관리하는 운영자 관리 페이지입니다.',
    actions: ['운영자 등록', '운영자 정보 수정', '계정 정지'],
    guards: ['본인 계정은 정지할 수 없습니다.'],
    admin: ['없음 — 고객 화면에 노출되지 않습니다.'],
    areas: LIST_AREAS,
    fields: [
      { name: '성명', desc: '운영자 성명', type: '텍스트', required: true, rule: '2자 이상', example: '홍길동' },
      { name: '이메일', desc: '로그인 계정', type: '텍스트', required: true, rule: '`아이디@도메인` 형식', example: 'staff@winpilot.test' },
      { name: '권한', desc: '콘솔 내 권한 범위', type: '선택', required: true, rule: '사전 정의된 권한 중 선택', example: '운영자' },
    ],
    buttons: FORM_BUTTONS,
    validations: ['이미 등록된 이메일은 중복 등록할 수 없습니다.'],
    policy: LIST_POLICY,
    future: ['권한별 상세 설정'],
    nonFunctional: ['정지한 계정은 목록에 유지하고 상태를 텍스트로 표시합니다.'],
  },
  {
    screen: 'users-grades',
    purpose: '회원 등급과 등급별 혜택을 관리하는 등급 관리 페이지입니다.',
    actions: ['등급 등록 · 수정 · 삭제', '적립률 및 기준 금액 설정'],
    guards: ['사용 중인 등급은 삭제할 수 없습니다. 해당 등급의 회원을 배정할 등급이 없어집니다.'],
    admin: ['마이페이지 · 상품 상세 — 등급별 적립률을 조회합니다.'],
    areas: LIST_AREAS,
    fields: [
      { name: '등급명', desc: '고객 화면에 표시되는 명칭', type: '텍스트', required: true, rule: '1~10자', example: 'VIP' },
      { name: '기준 금액', desc: '해당 등급 적용 누적 구매 금액', type: '숫자', required: true, rule: '0 이상 정수', example: '1000000' },
      { name: '적립률', desc: '구매 시 적립 비율', type: '숫자', required: true, rule: '0~100', example: '3' },
    ],
    buttons: FORM_BUTTONS,
    validations: ['적립률은 0~100 범위입니다.', '기준 금액이 중복되는 등급을 등록할 수 없습니다.'],
    policy: ['기본 정렬은 기준 금액 오름차순입니다.'],
    future: ['등급별 쿠폰 자동 발급'],
    nonFunctional: ['등급 순서가 혜택 범위 순서와 일치합니다.'],
  },
  {
    screen: 'products-categories',
    purpose: '상품 분류를 관리하는 카테고리 관리 페이지입니다.',
    actions: ['1Depth · 2Depth 등록 · 수정 · 삭제', '노출 순서 변경'],
    guards: [
      '등록된 상품이 있는 분류는 삭제할 수 없습니다.',
      '2Depth 는 상위 1Depth 없이 등록할 수 없습니다.',
    ],
    admin: ['상단 내비게이션 · 상품 목록 — 분류를 추가하면 고객 화면 메뉴도 함께 추가됩니다.'],
    areas: LIST_AREAS,
    fields: [
      { name: '분류명', desc: '고객 화면에 표시되는 명칭', type: '텍스트', required: true, rule: '1~20자', example: '가구' },
      { name: '상위 분류', desc: '2Depth 등록 시 상위 분류', type: '선택', rule: '1Depth 중 선택', example: '가구' },
    ],
    buttons: FORM_BUTTONS,
    validations: ['동일 상위 분류 아래에 같은 명칭을 등록할 수 없습니다.'],
    policy: ['3Depth 를 제공하지 않습니다. 고객 화면이 2Depth 까지 표시합니다.'],
    future: ['분류별 대표 이미지'],
    nonFunctional: ['분류 순서가 고객 화면 메뉴 순서와 일치합니다.'],
  },
  {
    screen: 'products',
    purpose: '등록 상품을 조회하고 판매 상태를 관리하는 상품 목록 페이지입니다.',
    actions: ['상품명 · 상품코드 검색', '분류 및 판매 상태 필터', '목록 항목 선택 시 상세 페이지로 이동', '노출 상태 변경'],
    guards: [
      '비노출 상품은 고객 화면에 표시하지 않습니다.',
      '삭제 시 확인 모달을 표시합니다.',
    ],
    admin: ['상품 목록 · 상품 상세 · 메인 — 비노출로 변경한 상품은 전 영역에서 제외됩니다.'],
    areas: LIST_AREAS,
    policy: [...LIST_POLICY, '고객 화면의 기본 정렬은 관리자에 등록된 진열 순서입니다.'],
    future: ['가격 일괄 수정'],
    nonFunctional: ['노출 상태를 색상과 함께 텍스트로 표시합니다.'],
  },
  {
    screen: 'products-new',
    purpose: '신규 상품을 등록하는 상품 등록 페이지입니다.',
    actions: ['기본 정보 입력', '옵션 조합 등록', '이미지 등록', '적립 및 배송 정책 설정', '미리보기 조회'],
    guards: [
      '옵션이 등록되면 재고는 옵션별 재고의 합계로 산출합니다. 별도 입력 시 두 값이 불일치합니다.',
      '필수 항목이 미입력이면 저장 버튼을 비활성화합니다.',
    ],
    admin: ['상품 목록 · 상품 상세'],
    areas: FORM_AREAS,
    fields: [
      { name: '상품명', desc: '고객 화면에 표시되는 명칭', type: '텍스트', required: true, rule: '2~60자', example: '접이식 캠핑 체어' },
      { name: '분류', desc: '상품이 속하는 분류', type: '선택', required: true, rule: '1Depth · 2Depth 조합이 유효해야 함', example: '가구 > 야외' },
      { name: '판매가', desc: '실제 판매 금액', type: '숫자', required: true, rule: '0 이상 정수', example: '54000' },
      { name: '정가', desc: '비교 표시용 금액', type: '숫자', rule: '판매가 이상', example: '69000' },
      { name: '재고', desc: '옵션 미등록 시에만 직접 입력', type: '숫자', rule: '0 이상 정수', example: '120' },
      { name: '옵션', desc: '색상 × 사이즈 조합별 재고', type: '표', rule: '조합별 0 이상 정수', example: '베이지 / M / 40' },
      { name: '대표 이미지', desc: '목록과 상세에 표시되는 이미지', type: '파일', required: true, rule: 'PNG · JPG · WEBP · 5MB 이하' },
      { name: '적립', desc: '정률 또는 정액', type: '선택+숫자', rule: '정률은 0~100', example: '정률 3' },
      { name: '배송 정책', desc: '무료 · 조건부 무료 · 유료', type: '선택', required: true, example: '조건부 무료' },
    ],
    buttons: FORM_BUTTONS,
    validations: [
      '판매가와 재고는 0 이상의 정수만 입력할 수 있습니다.',
      '정가는 판매가보다 작을 수 없습니다.',
      '옵션이 등록되면 재고 입력 항목을 비활성화하고 옵션별 합계를 적용합니다.',
      '조건부 무료를 선택하면 기준 금액이 필수입니다.',
    ],
    policy: ['등록 직후에는 비노출 상태입니다. 입력이 완료되기 전에 고객 화면에 노출되지 않도록 하기 위한 것입니다.'],
    future: ['상품 복제'],
    nonFunctional: ['미리보기 영역은 고객 화면과 동일한 컴포넌트를 사용합니다.'],
  },
  {
    screen: 'products-detail',
    purpose: '등록된 상품 정보를 수정하는 상품 상세 페이지입니다.',
    actions: ['기본 정보 수정', '옵션 및 재고 수정', '노출 상태 변경', '상품 삭제'],
    guards: ['판매 이력이 있는 상품은 삭제할 수 없습니다. 주문 내역의 참조 대상이 없어집니다.'],
    admin: ['상품 상세 · 장바구니 · 주문서'],
    areas: FORM_AREAS,
    buttons: FORM_BUTTONS,
    policy: ['수정한 값은 저장 시점에 고객 화면에 반영됩니다.'],
    future: ['변경 이력'],
    nonFunctional: ['기존 옵션 조합의 재고를 유지합니다. 옵션 추가 시 입력한 재고가 초기화되지 않아야 합니다.'],
  },
  {
    screen: 'products-sales',
    purpose: '접수된 주문을 조회하고 배송을 처리하는 주문 관리 페이지입니다.',
    actions: ['주문번호 · 주문자 검색', '주문 상태 필터', '운송장 등록', '교환 및 반품 처리'],
    guards: ['배송이 완료된 주문의 운송장은 수정할 수 없습니다.'],
    admin: ['주문 목록 · 주문 상세 — 등록한 운송장이 고객 화면에 표시됩니다.'],
    areas: LIST_AREAS,
    fields: [
      { name: '택배사', desc: '배송 처리 택배사', type: '선택', required: true, rule: '사전 정의된 목록 중 선택', example: 'CJ대한통운' },
      { name: '운송장 번호', desc: '배송 조회 번호', type: '텍스트', required: true, rule: '숫자 · 하이픈', example: '123456789012' },
    ],
    buttons: [
      { label: '운송장 등록', onClick: '택배사와 운송장 번호를 저장한다', onSuccess: '주문 상태를 배송중으로 변경하고 고객 화면에 반영한다', onFail: '운송장 번호 형식 오류를 해당 위치에 표시한다' },
      { label: '교환 처리', onClick: '사유와 처리 방식을 선택한다', onSuccess: '주문 상태를 변경하고 처리 이력에 기록한다' },
    ],
    validations: ['운송장 번호는 숫자와 하이픈만 입력할 수 있습니다.'],
    policy: [...LIST_POLICY, '기본 정렬은 주문일 최신순입니다.'],
    future: ['운송장 일괄 등록'],
    nonFunctional: ['상태 변경은 복구할 수 없으므로 확인 모달을 표시합니다.'],
  },
  {
    screen: 'products-sales-detail',
    purpose: '개별 주문의 상세 정보를 제공하는 주문 상세 페이지입니다.',
    actions: ['주문 상품 및 금액 조회', '배송 정보 수정', '주문 상태 변경'],
    guards: ['취소된 주문은 상태를 복구할 수 없습니다.'],
    admin: ['주문 상세'],
    areas: [
      { area: '주문 요약', purpose: '주문번호 · 주문일 · 주문 상태' },
      { area: '주문 상품 목록', purpose: '주문 상품과 금액' },
      { area: '배송 정보', purpose: '수령인 · 주소 · 운송장 번호' },
      { area: '결제 정보', purpose: '결제 금액 내역' },
    ],
    policy: ['결제 금액은 수정할 수 없습니다. 결제 완료 금액이므로 화면에서 변경하면 데이터가 불일치합니다.'],
    future: ['부분 취소'],
    nonFunctional: ['금액 내역의 합계가 결제 금액과 항상 일치해야 합니다.'],
  },
  {
    screen: 'products-reviews',
    purpose: '고객이 등록한 상품 리뷰를 관리하는 리뷰 관리 페이지입니다.',
    actions: ['내용 · 작성자 · 상품명 검색', '평점 필터', '리뷰 비노출 처리'],
    guards: ['리뷰를 삭제하지 않고 비노출 처리합니다. 삭제 시 처리 이력이 남지 않고 평균 평점만 변경됩니다.'],
    admin: ['상품 상세의 리뷰 탭 — 비노출 처리한 리뷰는 고객 화면에서 제외됩니다.'],
    areas: LIST_AREAS,
    buttons: [
      { label: '비노출 처리', onClick: '고객 화면에서 제외한다', onSuccess: '상태를 비노출로 변경한다' },
    ],
    policy: [...LIST_POLICY, '운영자가 리뷰를 등록하지 않습니다. 등록 버튼 위치에 고객 화면 이동 링크를 제공합니다.'],
    future: ['리뷰 답글'],
    nonFunctional: ['평점은 수치와 함께 아이콘으로 표시합니다.'],
  },
  {
    screen: 'products-coupons',
    purpose: '할인 쿠폰을 등록하고 관리하는 쿠폰 관리 페이지입니다.',
    actions: ['쿠폰 등록 · 수정', '사용 기간 및 발급 대상 설정', '발급 중지'],
    guards: ['이미 발급된 쿠폰의 할인율은 수정할 수 없습니다. 수신자별로 값이 달라집니다.'],
    admin: ['쿠폰함 · 주문서 — 발급 대상이 지정되지 않은 쿠폰은 고객 화면의 발급 가능 쿠폰에 표시됩니다.'],
    areas: LIST_AREAS,
    fields: [
      { name: '쿠폰명', desc: '고객 화면에 표시되는 명칭', type: '텍스트', required: true, rule: '2~30자', example: '첫 구매 10%' },
      { name: '할인 방식', desc: '정률 또는 정액', type: '선택', required: true, example: '정률' },
      { name: '할인 값', desc: '할인 금액 또는 비율', type: '숫자', required: true, rule: '정률은 0~100', example: '10' },
      { name: '최소 주문 금액', desc: '사용 가능 최소 금액', type: '숫자', rule: '0 이상 정수', example: '30000' },
      { name: '사용 기간', desc: '사용 가능 기간', type: '기간', required: true, rule: '시작일 ≤ 종료일', example: '2026-08-01 ~ 2026-08-31' },
    ],
    buttons: FORM_BUTTONS,
    validations: ['정률 할인은 0~100 범위입니다.', '시작일이 종료일보다 이후일 수 없습니다.'],
    policy: [...LIST_POLICY, '기간이 만료된 쿠폰도 삭제하지 않고 유지합니다.'],
    future: ['자동 발급 조건 설정'],
    nonFunctional: ['쿠폰 상태(사용 가능 · 사용 완료 · 기간 만료)를 색상과 함께 텍스트로 표시합니다.'],
  },
  {
    screen: 'support',
    purpose: '본 콘솔에서 직접 처리할 수 없는 사항을 운영사에 문의하는 지원 요청 페이지입니다.',
    actions: ['제목 · 내용 · 번호 검색', '처리 상태 필터', '분류 필터', '지원 요청 등록', '항목 선택 시 답변 조회'],
    guards: [
      '제목이나 내용이 미입력이면 접수하지 않습니다.',
      '내용이 10자 미만이면 접수하지 않습니다.',
      '접수한 요청은 수정하거나 삭제할 수 없습니다.',
    ],
    admin: ['사내 어드민 문의 목록 — 본 화면에서 접수한 요청이 표시되며 해당 화면의 답변이 본 화면의 상세 모달에 표시됩니다.'],
    areas: [
      { area: '안내 영역', purpose: '지원 요청 대상 범위 안내' },
      { area: '목록 검색 영역', purpose: '처리 상태 탭과 건수 · 검색 입력 · 분류 필터 · 지원 요청 버튼' },
      { area: '목록 테이블', purpose: '요청 번호 · 제목 · 분류 · 접수일 · 처리 상태' },
      { area: '긴급 표시', purpose: '긴급으로 접수한 요청 표시', when: '긴급으로 접수했을 때' },
      { area: '상세 모달', purpose: '접수 내용과 답변', when: '목록 항목을 선택했을 때' },
      { area: '접수 모달', purpose: '분류 · 제목 · 내용 · 긴급 여부', when: '지원 요청 버튼을 선택했을 때' },
    ],
    fields: [
      { name: '분류', desc: '장애 · 기능 요청 · 결제 · 계약 · 기타', type: '선택', required: true, example: '장애' },
      { name: '제목', desc: '요청 내용 요약', type: '텍스트', required: true, rule: '60자 이하', example: '카카오 로그인이 되지 않습니다' },
      { name: '내용', desc: '발생 시점 · 발생 화면 · 조작 내용', type: '여러 줄', required: true, rule: '10자 이상 1000자 이하' },
      { name: '긴급 여부', desc: '활성화 시 우선 처리 대상으로 분류', type: '체크박스', rule: '서비스 운영이 중단된 경우에만 사용' },
    ],
    buttons: [
      { label: '지원 요청', onClick: '접수 모달을 표시한다' },
      { label: '접수', onClick: '요청을 접수 상태로 등록한다', onSuccess: '목록 최상단에 추가하고 사내 어드민에도 반영한다', onFail: '미입력 항목을 입력 항목 하단에 표시하고 모달을 유지한다' },
    ],
    validations: ['제목과 내용은 공백만으로 저장할 수 없습니다.', '내용은 10자 이상 1000자 이하입니다.'],
    policy: [
      '고객이 본 사이트에 접수한 문의와 별도 자원입니다. 접수 대상과 처리 주체가 다르므로 메뉴를 분리합니다.',
      '설정의 OAuth 와 PG 는 본 콘솔에서 수정할 수 없습니다. 처리 요청 경로를 화면에서 제공합니다.',
      '본인 고객사의 요청만 조회할 수 있습니다.',
      '접수한 요청을 삭제하지 않습니다. 삭제 시 처리 중인 담당자가 요청 내용을 확인할 수 없습니다.',
      '긴급 여부는 요청자가 직접 설정합니다.',
      '담당자는 미지정 상태로 접수합니다. 담당자 배정은 운영사에서 처리합니다.',
    ],
    future: ['첨부파일', '답변 등록 알림'],
    nonFunctional: [
      '목록의 데이터 원본은 @winpilot/store 의 support.ts 1개입니다. 사내 콘솔과 별도 관리 시 답변이 불일치합니다.',
      '처리 상태 명칭은 사내 콘솔 · 고객 문의와 동일하게 표기합니다.',
    ],
  },
  {
    screen: 'inquiries',
    purpose: '고객이 접수한 문의에 답변하는 문의 관리 페이지입니다.',
    actions: ['제목 · 작성자 검색', '답변 여부 필터', '답변 등록'],
    guards: ['답변한 문의는 상태만 변경합니다. 삭제하지 않습니다.'],
    admin: ['마이페이지 문의 내역 — 등록한 답변이 고객 화면에 표시됩니다.'],
    areas: LIST_AREAS,
    fields: [
      { name: '답변 내용', desc: '고객 화면에 표시되는 답변', type: '여러 줄', required: true, rule: '10자 이상' },
    ],
    buttons: [
      { label: '답변 저장', onClick: '답변 내용을 저장한다', onSuccess: '상태를 답변 완료로 변경하고 고객 화면에 반영한다', onFail: '답변 내용이 미입력이면 버튼을 비활성화한다' },
    ],
    validations: ['답변 내용은 10자 이상입니다.'],
    policy: [...LIST_POLICY, '기본 탭은 미답변입니다. 우선 처리 대상을 먼저 제공합니다.'],
    future: ['자주 사용하는 답변 저장'],
    nonFunctional: ['답변 여부를 색상과 함께 텍스트로 표시합니다.'],
  },
  {
    screen: 'inquiries-settings',
    purpose: '문의 분류와 안내 문구를 관리하는 문의 설정 페이지입니다.',
    actions: ['문의 분류 등록 · 수정 · 삭제', '안내 문구 수정'],
    guards: ['사용 중인 분류는 삭제할 수 없습니다.'],
    admin: ['문의하기 — 본 화면에서 관리하는 분류가 고객 화면의 선택 항목이 됩니다.'],
    areas: FORM_AREAS,
    fields: [
      { name: '분류명', desc: '고객 화면에 표시되는 명칭', type: '텍스트', required: true, rule: '1~20자', example: '배송' },
      { name: '안내 문구', desc: '문의 입력 폼 상단에 표시되는 문구', type: '여러 줄' },
    ],
    buttons: FORM_BUTTONS,
    policy: ['분류를 하나도 등록하지 않은 상태로 운영할 수 없습니다. 고객이 선택할 항목이 없어집니다.'],
    future: ['분류별 담당자 지정'],
    nonFunctional: ['분류 순서가 고객 화면의 선택 항목 순서와 일치합니다.'],
  },
  {
    screen: 'contents-notices',
    purpose: '공지사항을 조회하고 관리하는 공지사항 목록 페이지입니다.',
    actions: ['제목 검색', '노출 상태 필터', '공지 등록 · 수정 · 삭제'],
    guards: ['비노출 항목은 고객 화면에 표시하지 않습니다.', '삭제 시 확인 모달을 표시합니다.'],
    admin: ['공지사항 목록 · 공지사항 상세'],
    areas: LIST_AREAS,
    policy: [...LIST_POLICY, '상단 고정 공지를 목록 최상단에 배치합니다.'],
    future: ['예약 게시'],
    nonFunctional: ['노출 상태를 색상과 함께 텍스트로 표시합니다.'],
  },
  {
    screen: 'contents-notices-new',
    purpose: '공지사항을 등록하는 페이지입니다.',
    actions: ['제목 및 본문 입력', '이미지 등록', '노출 상태 설정', '미리보기 조회'],
    guards: ['제목이나 본문이 미입력이면 저장 버튼을 비활성화합니다.'],
    admin: ['공지사항 목록 · 공지사항 상세'],
    areas: FORM_AREAS,
    fields: CONTENT_FIELDS,
    buttons: FORM_BUTTONS,
    validations: ['제목은 2~60자, 본문은 10자 이상입니다.'],
    policy: CONTENT_FORM_POLICY,
    future: ['임시 저장'],
    nonFunctional: CONTENT_FORM_NF,
  },
  {
    screen: 'contents-notices-detail',
    purpose: '등록된 공지사항을 수정하는 페이지입니다.',
    actions: ['제목 및 본문 수정', '이미지 등록', '노출 상태 설정', '미리보기 조회'],
    guards: ['제목이나 본문이 미입력이면 저장 버튼을 비활성화합니다.'],
    admin: ['공지사항 상세'],
    areas: FORM_AREAS,
    fields: CONTENT_FIELDS,
    buttons: FORM_BUTTONS,
    validations: ['제목은 2~60자, 본문은 10자 이상입니다.'],
    policy: ['수정한 값은 저장 시점에 고객 화면에 반영됩니다.'],
    future: ['임시 저장'],
    nonFunctional: CONTENT_FORM_NF,
  },
  {
    screen: 'contents-faqs',
    purpose: '자주 묻는 질문을 조회하고 관리하는 FAQ 목록 페이지입니다.',
    actions: ['제목 검색', '노출 상태 필터', 'FAQ 등록 · 수정 · 삭제'],
    guards: ['비노출 항목은 고객 화면에 표시하지 않습니다.', '삭제 시 확인 모달을 표시합니다.'],
    admin: ['FAQ 목록 · FAQ 상세'],
    areas: LIST_AREAS,
    policy: [...LIST_POLICY, '분류별로 구분하여 표시합니다.'],
    future: ['예약 게시'],
    nonFunctional: ['노출 상태를 색상과 함께 텍스트로 표시합니다.'],
  },
  {
    screen: 'contents-news',
    purpose: '뉴스를 조회하고 관리하는 뉴스 목록 페이지입니다.',
    actions: ['제목 검색', '노출 상태 필터', '뉴스 등록 · 수정 · 삭제'],
    guards: ['비노출 항목은 고객 화면에 표시하지 않습니다.', '삭제 시 확인 모달을 표시합니다.'],
    admin: ['뉴스 목록 · 뉴스 상세'],
    areas: LIST_AREAS,
    policy: LIST_POLICY,
    future: ['예약 게시'],
    nonFunctional: ['노출 상태를 색상과 함께 텍스트로 표시합니다.'],
  },
  {
    screen: 'contents-news-new',
    purpose: '뉴스를 등록하는 페이지입니다.',
    actions: ['제목 및 본문 입력', '이미지 등록', '노출 상태 설정', '미리보기 조회'],
    guards: ['제목이나 본문이 미입력이면 저장 버튼을 비활성화합니다.'],
    admin: ['뉴스 목록 · 뉴스 상세'],
    areas: FORM_AREAS,
    fields: CONTENT_FIELDS,
    buttons: FORM_BUTTONS,
    validations: ['제목은 2~60자, 본문은 10자 이상입니다.'],
    policy: CONTENT_FORM_POLICY,
    future: ['임시 저장'],
    nonFunctional: CONTENT_FORM_NF,
  },
  {
    screen: 'contents-news-detail',
    purpose: '등록된 뉴스를 수정하는 페이지입니다.',
    actions: ['제목 및 본문 수정', '이미지 등록', '노출 상태 설정', '미리보기 조회'],
    guards: ['제목이나 본문이 미입력이면 저장 버튼을 비활성화합니다.'],
    admin: ['뉴스 상세'],
    areas: FORM_AREAS,
    fields: CONTENT_FIELDS,
    buttons: FORM_BUTTONS,
    validations: ['제목은 2~60자, 본문은 10자 이상입니다.'],
    policy: ['수정한 값은 저장 시점에 고객 화면에 반영됩니다.'],
    future: ['임시 저장'],
    nonFunctional: CONTENT_FORM_NF,
  },
  {
    screen: 'contents-portfolios',
    purpose: '포트폴리오를 조회하고 관리하는 포트폴리오 목록 페이지입니다.',
    actions: ['제목 검색', '노출 상태 필터', '포트폴리오 등록 · 수정 · 삭제'],
    guards: ['비노출 항목은 고객 화면에 표시하지 않습니다.', '삭제 시 확인 모달을 표시합니다.'],
    admin: ['포트폴리오 목록'],
    areas: LIST_AREAS,
    policy: LIST_POLICY,
    future: ['예약 게시'],
    nonFunctional: ['노출 상태를 색상과 함께 텍스트로 표시합니다.'],
  },
  {
    screen: 'contents-portfolios-new',
    purpose: '포트폴리오를 등록하는 페이지입니다.',
    actions: ['제목 및 본문 입력', '이미지 등록', '노출 상태 설정', '미리보기 조회'],
    guards: ['제목이나 본문이 미입력이면 저장 버튼을 비활성화합니다.'],
    admin: ['포트폴리오 목록'],
    areas: FORM_AREAS,
    fields: CONTENT_FIELDS,
    buttons: FORM_BUTTONS,
    validations: ['제목은 2~60자, 본문은 10자 이상입니다.'],
    policy: CONTENT_FORM_POLICY,
    future: ['임시 저장'],
    nonFunctional: CONTENT_FORM_NF,
  },
  {
    screen: 'contents-portfolios-detail',
    purpose: '등록된 포트폴리오를 수정하는 페이지입니다.',
    actions: ['제목 및 본문 수정', '이미지 등록', '노출 상태 설정', '미리보기 조회'],
    guards: ['제목이나 본문이 미입력이면 저장 버튼을 비활성화합니다.'],
    admin: ['포트폴리오 목록'],
    areas: FORM_AREAS,
    fields: CONTENT_FIELDS,
    buttons: FORM_BUTTONS,
    validations: ['제목은 2~60자, 본문은 10자 이상입니다.'],
    policy: ['수정한 값은 저장 시점에 고객 화면에 반영됩니다.'],
    future: ['임시 저장'],
    nonFunctional: CONTENT_FORM_NF,
  },
  {
    screen: 'banners',
    purpose: '메인 배너를 조회하고 관리하는 배너 목록 페이지입니다.',
    actions: ['배너 등록 · 수정 · 삭제', '노출 순서 변경', '게시 기간 설정'],
    guards: ['게시 기간이 종료된 배너는 고객 화면에 전달하지 않습니다. 화면에서 숨기지 않고 조회 단계에서 제외합니다.'],
    admin: ['메인 배너 영역'],
    areas: LIST_AREAS,
    policy: LIST_POLICY,
    future: ['노출 비율 설정'],
    nonFunctional: ['배너 순서가 고객 화면의 슬라이드 순서와 일치합니다.'],
  },
  {
    screen: 'banners-new',
    purpose: '메인 배너를 등록하는 페이지입니다.',
    actions: ['이미지 등록', '연결 URL 입력', '게시 기간 설정', '미리보기 조회'],
    guards: ['이미지 비율이 기준과 다르면 등록할 수 없습니다. 고객 화면에서 절삭됩니다.'],
    admin: ['메인 배너 영역'],
    areas: FORM_AREAS,
    fields: [
      { name: '이미지', desc: '배너 이미지', type: '파일', required: true, rule: 'PNG · JPG · WEBP · 5MB 이하 · 21:9' },
      { name: '연결 URL', desc: '배너 선택 시 이동 경로', type: '텍스트', rule: '사이트 내 경로', example: '/products?tag=NEW' },
      { name: '게시 기간', desc: '노출 기간', type: '기간', required: true, rule: '시작일 ≤ 종료일', example: '2026-08-01 ~ 2026-08-31' },
    ],
    buttons: FORM_BUTTONS,
    validations: [
      '이미지 비율이 21:9 가 아니면 등록하지 않고 사유를 표시합니다.',
      '시작일이 종료일보다 이후일 수 없습니다.',
    ],
    future: ['모바일 전용 이미지'],
    nonFunctional: ['미리보기 영역을 고객 화면과 동일한 비율로 표시합니다.'],
  },
  {
    screen: 'banners-detail',
    purpose: '등록된 메인 배너를 수정하는 페이지입니다.',
    actions: ['이미지 교체', '게시 기간 및 연결 URL 수정', '배너 삭제'],
    guards: ['게시 중인 배너를 삭제하면 고객 화면에서 즉시 제외됩니다. 확인 모달을 표시합니다.'],
    admin: ['메인 배너 영역'],
    areas: FORM_AREAS,
    buttons: FORM_BUTTONS,
    future: ['변경 이력'],
    nonFunctional: ['수정한 값은 저장 시점에 반영됩니다.'],
  },
  {
    screen: 'banners-popups',
    purpose: '팝업을 조회하고 관리하는 팝업 목록 페이지입니다.',
    actions: ['팝업 등록 · 수정 · 삭제', '게시 기간 설정'],
    guards: ['동일 기간에 복수의 팝업이 게시되면 등록 순서대로 표시합니다.'],
    admin: ['메인 페이지 — 최초 진입 시 표시됩니다.'],
    areas: LIST_AREAS,
    policy: LIST_POLICY,
    future: ['노출 빈도 제한'],
    nonFunctional: ['오늘 하루 보지 않기를 선택한 사용자에게는 재표시하지 않습니다.'],
  },
  {
    screen: 'banners-popups-new',
    purpose: '팝업을 등록하는 페이지입니다.',
    actions: ['내용 입력', '표시 위치 및 크기 설정', '게시 기간 설정'],
    guards: ['필수 항목이 미입력이면 저장 버튼을 비활성화합니다.'],
    admin: ['메인 페이지'],
    areas: FORM_AREAS,
    fields: [
      { name: '제목', desc: '팝업 상단 제목', type: '텍스트', required: true, rule: '2~40자' },
      { name: '내용', desc: '팝업 본문', type: '편집기', required: true },
      { name: '게시 기간', desc: '노출 기간', type: '기간', required: true, rule: '시작일 ≤ 종료일' },
    ],
    buttons: FORM_BUTTONS,
    validations: ['시작일이 종료일보다 이후일 수 없습니다.'],
    future: ['노출 대상 지정'],
    nonFunctional: ['미리보기 영역을 실제 표시 위치와 동일하게 배치합니다.'],
  },
  {
    screen: 'banners-popups-detail',
    purpose: '등록된 팝업을 수정하는 페이지입니다.',
    actions: ['내용 및 게시 기간 수정', '팝업 삭제'],
    guards: ['게시 중인 팝업을 삭제하면 즉시 제외됩니다. 확인 모달을 표시합니다.'],
    admin: ['메인 페이지'],
    areas: FORM_AREAS,
    buttons: FORM_BUTTONS,
    future: ['변경 이력'],
    nonFunctional: ['수정한 값은 저장 시점에 반영됩니다.'],
  },
  {
    screen: 'company-about',
    purpose: '회사 소개 본문과 대표 이미지를 관리하는 회사 소개 설정 페이지입니다.',
    actions: ['회사 소개 본문 수정', '대표 이미지 등록', '미리보기 조회'],
    guards: ['이미지 비율이 기준과 다르면 등록할 수 없습니다.'],
    admin: ['회사 소개'],
    areas: FORM_AREAS,
    fields: [
      { name: '회사 소개 본문', desc: '고객 화면에 표시되는 본문', type: '편집기', required: true },
      { name: '대표 이미지', desc: '회사 소개 대표 이미지', type: '파일', rule: 'PNG · JPG · WEBP · 5MB 이하 · 16:9' },
    ],
    buttons: FORM_BUTTONS,
    future: ['오시는 길 지도'],
    nonFunctional: ['대표 이미지 영역을 고객 화면과 동일한 비율로 표시합니다.'],
  },
  {
    screen: 'company-history',
    purpose: '회사 연혁을 관리하는 연혁 관리 페이지입니다.',
    actions: ['연혁 항목 등록 · 수정 · 삭제', '연도별 정렬'],
    guards: ['연도가 미입력이면 저장할 수 없습니다. 연도가 정렬 기준입니다.'],
    admin: ['연혁'],
    areas: LIST_AREAS,
    fields: [
      { name: '연도', desc: '해당 이력의 연도', type: '숫자', required: true, rule: '4자리', example: '2026' },
      { name: '내용', desc: '이력 내용', type: '텍스트', required: true, rule: '2~80자', example: '본사 이전' },
    ],
    buttons: FORM_BUTTONS,
    validations: ['연도는 4자리 숫자입니다.'],
    policy: ['기본 정렬은 최신 연도순입니다. 고객 화면과 동일한 순서로 표시해야 합니다.'],
    future: ['연혁 항목별 이미지'],
    nonFunctional: ['연도 단위 정보이므로 날짜는 `YYYY` 형식으로 입력받습니다.'],
  },
  {
    screen: 'statistics',
    purpose: '주요 운영 지표를 조회하는 통계 페이지입니다.',
    actions: ['조회 기간 선택', '차트 및 표 조회'],
    guards: ['데이터가 없는 기간은 빈 차트 대신 안내 문구를 표시합니다.'],
    admin: ['없음 — 운영자 전용 화면입니다.'],
    areas: [
      { area: '기간 선택 영역', purpose: '조회 기간 선택' },
      { area: '지표 차트', purpose: '방문 · 주문 · 매출 현황' },
      { area: '지표 표', purpose: '차트와 동일한 데이터의 표 형태' },
    ],
    fields: [
      { name: '조회 기간', desc: '조회 범위', type: '선택', rule: '최근 7일 · 30일 · 90일', example: '최근 30일' },
    ],
    policy: ['조회 기간을 URL 파라미터로 유지합니다.', '기본 조회 기간은 최근 30일입니다.'],
    future: ['기간 비교'],
    nonFunctional: ['차트는 인라인 SVG 로 구현합니다. 비트맵은 Figma 에서 벡터로 변환되지 않습니다.'],
  },
  {
    screen: 'statistics-periods',
    purpose: '기간별 지표 추이를 조회하는 기간별 통계 페이지입니다.',
    actions: ['조회 기간 선택', '차트 및 표 조회'],
    guards: ['데이터가 없는 기간은 빈 차트 대신 안내 문구를 표시합니다.'],
    admin: ['없음 — 운영자 전용 화면입니다.'],
    areas: [
      { area: '기간 선택 영역', purpose: '조회 기간 선택' },
      { area: '추이 차트', purpose: '기간별 지표 변화' },
      { area: '지표 표', purpose: '차트와 동일한 데이터의 표 형태' },
    ],
    fields: [
      { name: '조회 기간', desc: '조회 범위', type: '선택', rule: '최근 7일 · 30일 · 90일', example: '최근 30일' },
    ],
    policy: ['조회 기간을 URL 파라미터로 유지합니다.', '기본 조회 기간은 최근 30일입니다.'],
    future: ['기간 비교'],
    nonFunctional: ['차트는 인라인 SVG 로 구현합니다.'],
  },
  {
    screen: 'statistics-pages',
    purpose: '화면별 방문 현황을 조회하는 화면별 통계 페이지입니다.',
    actions: ['조회 기간 선택', '차트 및 표 조회'],
    guards: ['데이터가 없는 기간은 빈 차트 대신 안내 문구를 표시합니다.'],
    admin: ['없음 — 운영자 전용 화면입니다.'],
    areas: [
      { area: '기간 선택 영역', purpose: '조회 기간 선택' },
      { area: '방문 현황 차트', purpose: '화면별 방문 수' },
      { area: '지표 표', purpose: '차트와 동일한 데이터의 표 형태' },
    ],
    fields: [
      { name: '조회 기간', desc: '조회 범위', type: '선택', rule: '최근 7일 · 30일 · 90일', example: '최근 30일' },
    ],
    policy: ['조회 기간을 URL 파라미터로 유지합니다.', '기본 조회 기간은 최근 30일입니다.'],
    future: ['기간 비교'],
    nonFunctional: ['차트는 인라인 SVG 로 구현합니다.'],
  },
  {
    screen: 'statistics-revenue',
    purpose: '매출 현황을 조회하는 매출 통계 페이지입니다.',
    actions: ['조회 기간 선택', '차트 및 표 조회'],
    guards: ['데이터가 없는 기간은 빈 차트 대신 안내 문구를 표시합니다.'],
    admin: ['없음 — 운영자 전용 화면입니다.'],
    areas: [
      { area: '기간 선택 영역', purpose: '조회 기간 선택' },
      { area: '매출 차트', purpose: '항목별 매출 현황' },
      { area: '지표 표', purpose: '차트와 동일한 데이터의 표 형태' },
    ],
    fields: [
      { name: '조회 기간', desc: '조회 범위', type: '선택', rule: '최근 7일 · 30일 · 90일', example: '최근 30일' },
    ],
    policy: ['조회 기간을 URL 파라미터로 유지합니다.', '기본 조회 기간은 최근 30일입니다.'],
    future: ['기간 비교'],
    nonFunctional: ['차트는 인라인 SVG 로 구현합니다.'],
  },
  {
    screen: 'settings-supplier',
    purpose: '고객 화면 하단에 표시되는 사업자 정보를 관리하는 설정 페이지입니다.',
    actions: ['사업자 정보 수정', '저장'],
    guards: ['필수 항목이 미입력이면 저장 버튼을 비활성화합니다.'],
    admin: ['푸터 · 회사 소개'],
    areas: FORM_AREAS,
    fields: [
      { name: '상호', desc: '사업자 상호', type: '텍스트', required: true, rule: '1~40자', example: '스페이스플래닝' },
      { name: '대표자', desc: '대표자 성명', type: '텍스트', required: true, example: '홍승범' },
      { name: '사업자등록번호', desc: '사업자등록번호', type: '텍스트', required: true, rule: '숫자 · 하이픈', example: '000-00-00000' },
      { name: '통신판매업 신고번호', desc: '통신판매업 신고번호', type: '텍스트', required: true, example: '제2026-서울성동-0000호' },
      { name: '주소', desc: '사업장 주소', type: '텍스트', required: true, example: '서울시 성동구 …' },
      { name: '전화번호 · 이메일', desc: '연락처', type: '텍스트', required: true, example: '02-0000-0000' },
    ],
    buttons: FORM_BUTTONS,
    policy: ['값을 화면에 고정 문자열로 작성하지 않습니다. 수정 시마다 배포가 필요해집니다.'],
    future: ['변경 이력'],
    nonFunctional: ['저장 시 고객 화면에 즉시 반영됩니다. 별도 배포가 필요하지 않습니다.'],
  },
  {
    screen: 'settings-seo',
    purpose: '검색 결과와 링크 공유 시 표시되는 정보를 관리하는 SEO 설정 페이지입니다.',
    actions: ['SEO 정보 수정', '저장'],
    guards: ['필수 항목이 미입력이면 저장 버튼을 비활성화합니다.'],
    admin: ['전 화면의 메타 정보'],
    areas: FORM_AREAS,
    fields: [
      { name: '사이트 제목', desc: '브라우저 탭과 검색 결과에 표시되는 명칭', type: '텍스트', required: true, rule: '1~60자' },
      { name: '설명', desc: '검색 결과에 표시되는 설명', type: '텍스트', required: true, rule: '160자 이하' },
      { name: '공유 이미지', desc: '링크 공유 시 표시되는 이미지', type: '파일', rule: 'PNG · JPG · 1.91:1' },
    ],
    buttons: FORM_BUTTONS,
    policy: ['문서 화면(`/docs`)은 검색 엔진 색인 대상에서 제외합니다. 사내 문서이기 때문입니다.'],
    future: ['변경 이력'],
    nonFunctional: ['저장 시 고객 화면에 즉시 반영됩니다.'],
  },
  {
    screen: 'settings-terms',
    purpose: '고객 화면에 게시하는 이용약관을 관리하는 설정 페이지입니다.',
    actions: ['약관 본문 수정', '저장'],
    guards: ['필수 항목이 미입력이면 저장 버튼을 비활성화합니다.'],
    admin: ['이용약관'],
    areas: FORM_AREAS,
    fields: [
      { name: '약관 본문', desc: '고객 화면에 표시되는 약관', type: '편집기', required: true },
      { name: '시행일', desc: '해당 버전의 시행일', type: '날짜', required: true, rule: '`YYYY-MM-DD`', example: '2026-08-01' },
    ],
    buttons: FORM_BUTTONS,
    policy: ['값을 화면에 고정 문자열로 작성하지 않습니다. 수정 시마다 배포가 필요해집니다.'],
    future: ['변경 이력'],
    nonFunctional: ['저장 시 고객 화면에 즉시 반영됩니다.'],
  },
  {
    screen: 'settings-privacy',
    purpose: '고객 화면에 게시하는 개인정보 처리방침을 관리하는 설정 페이지입니다.',
    actions: ['처리방침 본문 수정', '저장'],
    guards: ['필수 항목이 미입력이면 저장 버튼을 비활성화합니다.'],
    admin: ['개인정보 처리방침'],
    areas: FORM_AREAS,
    fields: [
      { name: '처리방침 본문', desc: '고객 화면에 표시되는 처리방침', type: '편집기', required: true },
      { name: '시행일', desc: '해당 버전의 시행일', type: '날짜', required: true, rule: '`YYYY-MM-DD`', example: '2026-08-01' },
    ],
    buttons: FORM_BUTTONS,
    policy: ['값을 화면에 고정 문자열로 작성하지 않습니다. 수정 시마다 배포가 필요해집니다.'],
    future: ['변경 이력'],
    nonFunctional: ['저장 시 고객 화면에 즉시 반영됩니다.'],
  },
  {
    screen: 'components',
    purpose: '사용 중인 공통 컴포넌트를 확인하는 개발 지원 페이지입니다.',
    actions: ['공통 컴포넌트 조회'],
    guards: ['조회 전용 개발 지원 화면이므로 별도 검증 조건이 없습니다.'],
    admin: ['없음 — 운영자에게 노출되지 않는 개발 지원 화면입니다.'],
    areas: [{ area: '컴포넌트 목록', purpose: '컴포넌트명과 실제 표시 형태' }],
    policy: ['본 화면은 고객사에 노출하지 않습니다.'],
    future: ['컴포넌트별 사용 화면 표시'],
    nonFunctional: ['화면에 표시되는 것이 실제 컴포넌트입니다. 이미지로 대체하지 않습니다.'],
  },
  {
    screen: 'result',
    purpose: '처리 결과를 안내하고 이동 경로를 제공하는 처리 결과 페이지입니다.',
    actions: ['이동 경로 선택'],
    guards: ['처리 대상(`kind`)에 따라 이동 경로가 달라집니다.'],
    admin: ['없음 — 관리자 콘솔 내에서 완결되는 화면입니다.'],
    areas: [
      { area: '결과 아이콘', purpose: '성공과 실패를 형태로 구분하여 표시' },
      { area: '안내 문구', purpose: '처리 완료 내용' },
      { area: '이동 경로', purpose: '후속 이동 경로' },
    ],
    policy: ['성공과 실패를 단일 화면으로 처리합니다(`?state=done|failed`). 문구와 아이콘만 변경됩니다.'],
    future: ['결과 화면에서 후속 작업으로 직접 연결'],
    nonFunctional: ['고객 화면과 동일한 컴포넌트(`StatusScreen`)를 사용합니다.'],
  },
];

/** 매니페스트에는 있는데 명세가 없는 화면. 문서가 화면을 따라가지 못한 자리다. */
export function missingSpecs(): string[] {
  const held = new Set(SCREEN_SPECS.map((spec) => spec.screen));
  return pages.filter((page) => !held.has(page.id)).map((page) => page.id);
}

export function findSpec(screen: string): ScreenSpec | undefined {
  return SCREEN_SPECS.find((spec) => spec.screen === screen);
}
