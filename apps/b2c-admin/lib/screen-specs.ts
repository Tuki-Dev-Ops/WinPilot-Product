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

export const SCREEN_SPECS: ScreenSpec[] = [
  {
    screen: 'dashboard',
    purpose: '오늘 봐야 할 것을 한 화면에 모은다.',
    actions: [
      '요약 카드에서 해당 목록으로 이동',
      '처리 대기 목록 열기',
    ],
    guards: [
      '볼 것이 없으면 카드에 0 을 적는다 — 카드 자체를 숨기지 않는다.',
    ],
    admin: [
      '없음 — 운영자만 보는 화면이다.',
    ],
    areas: [
      { area: '요약 카드', purpose: '오늘의 수치' },
      { area: '처리 대기', purpose: '먼저 손대야 할 것' },
    ],
    policy: [
      '카드를 누르면 그 수치를 만든 조건이 그대로 걸린 목록으로 간다.',
    ],
    future: [
      '기간 비교(어제 대비).',
    ],
    nonFunctional: [
      '카드 수치는 목록 화면의 같은 조건과 항상 같은 값이다.',
    ],
  },
  {
    screen: 'login',
    purpose: '운영자만 들어오게 한다.',
    actions: [
      '이메일·비밀번호로 로그인',
    ],
    guards: [
      '둘 중 하나라도 비면 단추가 잠긴다.',
    ],
    admin: [
      '없음 — 고객 화면과 계정이 다르다.',
    ],
    areas: [
      { area: '입력 묶음', purpose: '이메일·비밀번호' },
    ],
    fields: [
      { name: '이메일', desc: '운영자 계정', type: '텍스트', required: true, rule: '`아이디@도메인` 모양', example: 'demo@winpilot.test' },
      { name: '비밀번호', desc: '계정 비밀번호', type: '비밀번호', required: true, rule: '8자 이상' },
    ],
    buttons: [
      { label: '로그인', onClick: '입력을 확인하고 들어간다', onSuccess: '대시보드로 이동', onFail: '무엇이 틀렸는지 입력 아래 적는다' },
    ],
    validations: [
      '이메일 모양이 아니면 그 자리에서 알린다.',
      '비밀번호는 8자 이상이다.',
    ],
    future: [
      '2단계 인증.',
    ],
    nonFunctional: [
      '로그인 화면에는 사이드바를 두지 않는다 — 들어오기 전에는 갈 곳이 없다.',
    ],
  },
  {
    screen: 'users',
    purpose: '가입한 사람을 찾고 상태를 본다.',
    actions: [
      '이름·닉네임·이메일·회원번호로 검색',
      '상태 탭으로 거르기',
      '조회·삭제',
    ],
    guards: [
      '삭제는 확인을 한 번 묻는다.',
      '개인정보는 목록에서 가려서 보여 준다.',
    ],
    admin: [
      '마이페이지 — 여기서 바꾼 등급이 고객 화면의 혜택에 반영된다.',
    ],
    areas: [
      { area: '목록 툴바', purpose: '검색·필터·등록 단추' },
      { area: '표', purpose: '한 줄이 자원 하나' },
      { area: '선택 도구', purpose: '고른 줄에 한 번에 하는 일', when: '줄을 골랐을 때' },
      { area: '쪽 넘김', purpose: '몇 쪽 중 몇 쪽인지' },
      { area: '빈 상태', purpose: '조건에 맞는 것이 없을 때', when: '결과 0건' },
    ],
    policy: [
      '기본 정렬은 등록 최신순이다.',
      '검색·필터·쪽을 주소에 둔다 — 새로고침·뒤로가기에서 조건이 살아남는다.',
      '검색어가 비면 조건이 없는 것으로 본다. 목록을 비우지 않는다.',
      '기본 탭은 전체다.',
    ],
    future: [
      '내보내기(CSV).',
    ],
    nonFunctional: [
      '이메일·연락처는 목록에서 가린다 — 어깨너머로도 새어 나간다.',
    ],
  },
  {
    screen: 'users-admins',
    purpose: '운영자 계정을 만들고 거둔다.',
    actions: [
      '운영자 추가',
      '정보 수정',
      '계정 정지',
    ],
    guards: [
      '자기 계정은 스스로 정지할 수 없다.',
    ],
    admin: [
      '없음 — 고객 화면에 나타나지 않는다.',
    ],
    areas: [
      { area: '목록 툴바', purpose: '검색·필터·등록 단추' },
      { area: '표', purpose: '한 줄이 자원 하나' },
      { area: '선택 도구', purpose: '고른 줄에 한 번에 하는 일', when: '줄을 골랐을 때' },
      { area: '쪽 넘김', purpose: '몇 쪽 중 몇 쪽인지' },
      { area: '빈 상태', purpose: '조건에 맞는 것이 없을 때', when: '결과 0건' },
    ],
    fields: [
      { name: '이름', desc: '운영자 이름', type: '텍스트', required: true, rule: '2자 이상', example: '홍길동' },
      { name: '이메일', desc: '로그인 계정', type: '텍스트', required: true, rule: '`아이디@도메인` 모양', example: 'staff@winpilot.test' },
      { name: '역할', desc: '무엇을 할 수 있는지', type: '선택', required: true, rule: '정해진 역할 중 하나', example: '운영자' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    validations: [
      '이미 있는 이메일은 다시 쓸 수 없다.',
    ],
    policy: [
      '기본 정렬은 등록 최신순이다.',
      '검색·필터·쪽을 주소에 둔다 — 새로고침·뒤로가기에서 조건이 살아남는다.',
      '검색어가 비면 조건이 없는 것으로 본다. 목록을 비우지 않는다.',
    ],
    future: [
      '역할별 권한 세분화.',
    ],
    nonFunctional: [
      '정지된 계정은 목록에 남기되 상태를 글자로 적는다.',
    ],
  },
  {
    screen: 'users-grades',
    purpose: '등급과 혜택을 정한다.',
    actions: [
      '등급 추가·수정·삭제',
      '적립률·기준 금액 설정',
    ],
    guards: [
      '쓰이고 있는 등급은 지울 수 없다 — 그 등급의 회원이 갈 곳이 없어진다.',
    ],
    admin: [
      '마이페이지 · 상품 상세 — 등급별 적립률이 여기서 온다.',
    ],
    areas: [
      { area: '목록 툴바', purpose: '검색·필터·등록 단추' },
      { area: '표', purpose: '한 줄이 자원 하나' },
      { area: '선택 도구', purpose: '고른 줄에 한 번에 하는 일', when: '줄을 골랐을 때' },
      { area: '쪽 넘김', purpose: '몇 쪽 중 몇 쪽인지' },
      { area: '빈 상태', purpose: '조건에 맞는 것이 없을 때', when: '결과 0건' },
    ],
    fields: [
      { name: '등급명', desc: '화면에 보이는 이름', type: '텍스트', required: true, rule: '1~10자', example: 'VIP' },
      { name: '기준 금액', desc: '이 등급이 되는 누적 금액', type: '숫자', required: true, rule: '0 이상 정수', example: '1000000' },
      { name: '적립률', desc: '구매 시 적립', type: '숫자', required: true, rule: '0~100', example: '3' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    validations: [
      '적립률은 0~100 사이다.',
      '기준 금액이 겹치는 등급을 만들 수 없다.',
    ],
    policy: [
      '기본 정렬은 기준 금액 오름차순이다.',
    ],
    future: [
      '등급별 쿠폰 자동 발급.',
    ],
    nonFunctional: [
      '등급 순서가 곧 혜택 크기 순서다.',
    ],
  },
  {
    screen: 'products-categories',
    purpose: '상품을 담을 서랍을 만든다.',
    actions: [
      '1Depth·2Depth 추가·수정·삭제',
      '순서 바꾸기',
    ],
    guards: [
      '상품이 들어 있는 분류는 지울 수 없다.',
      '2Depth 는 1Depth 없이 만들 수 없다.',
    ],
    admin: [
      '헤더 메뉴 · 상품 목록 — 분류를 늘리면 고객 화면 메뉴도 늘어난다.',
    ],
    areas: [
      { area: '목록 툴바', purpose: '검색·필터·등록 단추' },
      { area: '표', purpose: '한 줄이 자원 하나' },
      { area: '선택 도구', purpose: '고른 줄에 한 번에 하는 일', when: '줄을 골랐을 때' },
      { area: '쪽 넘김', purpose: '몇 쪽 중 몇 쪽인지' },
      { area: '빈 상태', purpose: '조건에 맞는 것이 없을 때', when: '결과 0건' },
    ],
    fields: [
      { name: '분류명', desc: '화면에 보이는 이름', type: '텍스트', required: true, rule: '1~20자', example: '가구' },
      { name: '상위 분류', desc: '2Depth 일 때의 부모', type: '선택', rule: '1Depth 중 하나', example: '가구' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    validations: [
      '같은 상위 아래 같은 이름을 둘 수 없다.',
    ],
    policy: [
      '3Depth 를 만들지 않는다 — 고객 화면이 2Depth 까지만 그린다.',
    ],
    future: [
      '분류별 대표 이미지.',
    ],
    nonFunctional: [
      '분류 순서가 곧 고객 화면 메뉴 순서다.',
    ],
  },
  {
    screen: 'products',
    purpose: '파는 것을 찾고 상태를 바꾼다.',
    actions: [
      '상품명·코드로 검색',
      '분류·판매 상태로 거르기',
      '상세로 들어가기',
      '노출 끄고 켜기',
    ],
    guards: [
      '숨김 상품은 고객 화면 어디에도 나오지 않는다.',
      '삭제는 확인을 한 번 묻는다.',
    ],
    admin: [
      '상품 목록 · 상품 상세 · 홈 — 여기서 끈 상품은 어느 줄에도 나오지 않는다.',
    ],
    areas: [
      { area: '목록 툴바', purpose: '검색·필터·등록 단추' },
      { area: '표', purpose: '한 줄이 자원 하나' },
      { area: '선택 도구', purpose: '고른 줄에 한 번에 하는 일', when: '줄을 골랐을 때' },
      { area: '쪽 넘김', purpose: '몇 쪽 중 몇 쪽인지' },
      { area: '빈 상태', purpose: '조건에 맞는 것이 없을 때', when: '결과 0건' },
    ],
    policy: [
      '기본 정렬은 등록 최신순이다.',
      '검색·필터·쪽을 주소에 둔다 — 새로고침·뒤로가기에서 조건이 살아남는다.',
      '검색어가 비면 조건이 없는 것으로 본다. 목록을 비우지 않는다.',
      '기본 정렬은 어드민이 정한 진열 순서다.',
    ],
    future: [
      '일괄 가격 수정.',
    ],
    nonFunctional: [
      '노출 상태를 색과 함께 글자로도 적는다.',
    ],
  },
  {
    screen: 'products-new',
    purpose: '팔 것을 새로 올린다.',
    actions: [
      '기본 정보 입력',
      '옵션 조합 만들기',
      '이미지 올리기',
      '적립·배송 정하기',
      '미리보기',
    ],
    guards: [
      '옵션이 있으면 재고는 옵션 합계로 정해진다 — 따로 받으면 두 값이 어긋난다.',
      '필수 항목이 비면 저장 단추가 잠긴다.',
    ],
    admin: [
      '상품 목록 · 상품 상세',
    ],
    areas: [
      { area: '입력 묶음', purpose: '고칠 값들' },
      { area: '미리보기', purpose: '고객 화면에서 어떻게 보이는지', when: '값을 넣었을 때' },
      { area: '저장 줄', purpose: '저장·취소' },
    ],
    fields: [
      { name: '상품명', desc: '고객이 보는 이름', type: '텍스트', required: true, rule: '2~60자', example: '접이식 캠핑 체어' },
      { name: '분류', desc: '어느 서랍에 넣을지', type: '선택', required: true, rule: '1Depth·2Depth 짝이 맞아야 함', example: '가구 > 야외' },
      { name: '판매가', desc: '실제로 받는 값', type: '숫자', required: true, rule: '0 이상 정수', example: '54000' },
      { name: '정가', desc: '비교를 위해 함께 적는 값', type: '숫자', rule: '판매가 이상', example: '69000' },
      { name: '재고', desc: '옵션이 없을 때만 직접 입력', type: '숫자', rule: '0 이상 정수', example: '120' },
      { name: '옵션', desc: '색상 × 사이즈 조합별 재고', type: '표', rule: '조합마다 0 이상 정수', example: '베이지 / M / 40' },
      { name: '대표 이미지', desc: '목록과 상세에 쓰인다', type: '파일', required: true, rule: 'PNG·JPG·WEBP · 5MB 이하' },
      { name: '적립', desc: '정률 또는 정액', type: '선택+숫자', rule: '정률은 0~100', example: '정률 3' },
      { name: '배송 정책', desc: '무료·조건부 무료·유료', type: '선택', required: true, example: '조건부 무료' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    validations: [
      '판매가·재고는 0 이상의 정수만 받는다.',
      '정가는 판매가보다 작을 수 없다.',
      '옵션이 있으면 재고 입력칸이 잠기고 옵션 합계가 대신 들어간다.',
      '조건부 무료를 고르면 기준 금액이 필수가 된다.',
    ],
    policy: [
      '등록 직후에는 숨김 상태다 — 값을 다 채우기 전에 고객 화면에 뜨지 않게.',
    ],
    future: [
      '상품 복제.',
    ],
    nonFunctional: [
      '오른쪽 미리보기가 고객 화면과 같은 컴포넌트를 쓴다 — 저장하기 전에 결과를 본다.',
    ],
  },
  {
    screen: 'products-detail',
    purpose: '올린 상품을 고친다.',
    actions: [
      '기본 정보 수정',
      '옵션·재고 조정',
      '노출 끄고 켜기',
      '삭제',
    ],
    guards: [
      '이미 팔린 상품은 지울 수 없다 — 주문 내역이 가리킬 곳이 없어진다.',
    ],
    admin: [
      '상품 상세 · 장바구니 · 결제',
    ],
    areas: [
      { area: '입력 묶음', purpose: '고칠 값들' },
      { area: '미리보기', purpose: '고객 화면에서 어떻게 보이는지', when: '값을 넣었을 때' },
      { area: '저장 줄', purpose: '저장·취소' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    policy: [
      '고친 값은 저장하는 순간 고객 화면에 반영된다.',
    ],
    future: [
      '변경 이력.',
    ],
    nonFunctional: [
      '이미 있던 조합의 재고는 살린다 — 사이즈를 하나 추가했다고 입력한 재고가 날아가면 안 된다.',
    ],
  },
  {
    screen: 'products-sales',
    purpose: '들어온 주문을 처리한다.',
    actions: [
      '주문번호·주문자로 검색',
      '상태로 거르기',
      '운송장 입력',
      '교환·반품 처리',
    ],
    guards: [
      '이미 배송이 끝난 주문의 운송장은 고칠 수 없다.',
    ],
    admin: [
      '주문 내역 · 주문 상세 — 여기서 넣은 운송장이 고객 화면에 뜬다.',
    ],
    areas: [
      { area: '목록 툴바', purpose: '검색·필터·등록 단추' },
      { area: '표', purpose: '한 줄이 자원 하나' },
      { area: '선택 도구', purpose: '고른 줄에 한 번에 하는 일', when: '줄을 골랐을 때' },
      { area: '쪽 넘김', purpose: '몇 쪽 중 몇 쪽인지' },
      { area: '빈 상태', purpose: '조건에 맞는 것이 없을 때', when: '결과 0건' },
    ],
    fields: [
      { name: '택배사', desc: '보낸 곳', type: '선택', required: true, rule: '정해진 목록 중 하나', example: 'CJ대한통운' },
      { name: '운송장 번호', desc: '조회용 번호', type: '텍스트', required: true, rule: '숫자·하이픈', example: '123456789012' },
    ],
    buttons: [
      { label: '운송장 입력', onClick: '택배사와 번호를 넣는다', onSuccess: '상태가 배송중으로 바뀌고 고객 화면에 뜬다', onFail: '번호 모양이 아니면 그 자리에서 알린다' },
      { label: '교환 처리', onClick: '사유와 처리 방법을 고른다', onSuccess: '상태가 바뀌고 내역에 남는다' },
    ],
    validations: [
      '운송장 번호는 숫자와 하이픈만 받는다.',
    ],
    policy: [
      '기본 정렬은 등록 최신순이다.',
      '검색·필터·쪽을 주소에 둔다 — 새로고침·뒤로가기에서 조건이 살아남는다.',
      '검색어가 비면 조건이 없는 것으로 본다. 목록을 비우지 않는다.',
      '기본 정렬은 주문일 최신순이다.',
    ],
    future: [
      '일괄 운송장 업로드.',
    ],
    nonFunctional: [
      '상태 변화는 되돌릴 수 없으므로 확인을 한 번 묻는다.',
    ],
  },
  {
    screen: 'products-sales-detail',
    purpose: '주문 한 건을 자세히 본다.',
    actions: [
      '주문 상품·금액 확인',
      '배송 정보 수정',
      '상태 바꾸기',
    ],
    guards: [
      '취소된 주문은 상태를 되돌릴 수 없다.',
    ],
    admin: [
      '주문 상세',
    ],
    areas: [
      { area: '주문 요약', purpose: '주문번호·주문일·상태' },
      { area: '상품', purpose: '산 것과 금액' },
      { area: '배송', purpose: '받는 사람·주소·운송장' },
      { area: '결제', purpose: '금액 내역' },
    ],
    policy: [
      '금액은 고칠 수 없다 — 결제된 값이라 화면에서 바꾸면 두 값이 갈린다.',
    ],
    future: [
      '부분 취소.',
    ],
    nonFunctional: [
      '금액 내역의 합이 결제 금액과 항상 같다.',
    ],
  },
  {
    screen: 'products-reviews',
    purpose: '고객이 남긴 리뷰를 관리한다.',
    actions: [
      '내용·작성자·상품명으로 검색',
      '별점으로 거르기',
      '숨기기',
    ],
    guards: [
      '리뷰를 지우지 않고 숨긴다 — 지우면 왜 사라졌는지 남지 않고 평균 별점만 조용히 바뀐다.',
    ],
    admin: [
      '상품 상세의 리뷰 탭 — 숨긴 리뷰는 고객 화면까지 오지 않는다.',
    ],
    areas: [
      { area: '목록 툴바', purpose: '검색·필터·등록 단추' },
      { area: '표', purpose: '한 줄이 자원 하나' },
      { area: '선택 도구', purpose: '고른 줄에 한 번에 하는 일', when: '줄을 골랐을 때' },
      { area: '쪽 넘김', purpose: '몇 쪽 중 몇 쪽인지' },
      { area: '빈 상태', purpose: '조건에 맞는 것이 없을 때', when: '결과 0건' },
    ],
    buttons: [
      { label: '숨기기', onClick: '고객 화면에서 감춘다', onSuccess: '상태가 숨김으로 바뀐다' },
    ],
    policy: [
      '기본 정렬은 등록 최신순이다.',
      '검색·필터·쪽을 주소에 둔다 — 새로고침·뒤로가기에서 조건이 살아남는다.',
      '검색어가 비면 조건이 없는 것으로 본다. 목록을 비우지 않는다.',
      '운영자가 리뷰를 새로 쓰지 않는다 — 등록 단추 자리에 고객 화면으로 가는 길을 둔다.',
    ],
    future: [
      '리뷰 답글.',
    ],
    nonFunctional: [
      '별점은 숫자와 함께 별 모양으로도 보여 준다 — 목록을 훑을 때 숫자만으로는 눈에 걸리지 않는다.',
    ],
  },
  {
    screen: 'products-coupons',
    purpose: '할인 쿠폰을 만들고 거둔다.',
    actions: [
      '쿠폰 추가·수정',
      '기간·대상 설정',
      '발급 중지',
    ],
    guards: [
      '이미 발급된 쿠폰의 할인율은 고칠 수 없다 — 받은 사람마다 값이 달라진다.',
    ],
    admin: [
      '쿠폰함 · 결제 — 발급 대상이 비어 있으면 고객 화면의 쿠폰 받기 탭에 나온다.',
    ],
    areas: [
      { area: '목록 툴바', purpose: '검색·필터·등록 단추' },
      { area: '표', purpose: '한 줄이 자원 하나' },
      { area: '선택 도구', purpose: '고른 줄에 한 번에 하는 일', when: '줄을 골랐을 때' },
      { area: '쪽 넘김', purpose: '몇 쪽 중 몇 쪽인지' },
      { area: '빈 상태', purpose: '조건에 맞는 것이 없을 때', when: '결과 0건' },
    ],
    fields: [
      { name: '쿠폰명', desc: '고객이 보는 이름', type: '텍스트', required: true, rule: '2~30자', example: '첫 구매 10%' },
      { name: '할인 방식', desc: '정률 또는 정액', type: '선택', required: true, example: '정률' },
      { name: '할인 값', desc: '깎아 주는 크기', type: '숫자', required: true, rule: '정률은 0~100', example: '10' },
      { name: '최소 주문 금액', desc: '이 금액부터 쓸 수 있다', type: '숫자', rule: '0 이상 정수', example: '30000' },
      { name: '사용 기간', desc: '언제부터 언제까지', type: '기간', required: true, rule: '시작일 ≤ 종료일', example: '2026-08-01 ~ 2026-08-31' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    validations: [
      '정률 할인은 0~100 사이다.',
      '시작일이 종료일보다 늦을 수 없다.',
    ],
    policy: [
      '기본 정렬은 등록 최신순이다.',
      '검색·필터·쪽을 주소에 둔다 — 새로고침·뒤로가기에서 조건이 살아남는다.',
      '검색어가 비면 조건이 없는 것으로 본다. 목록을 비우지 않는다.',
      '만료된 쿠폰도 지우지 않고 남긴다.',
    ],
    future: [
      '자동 발급 조건.',
    ],
    nonFunctional: [
      '상태(사용 가능·완료·만료)를 색과 함께 글자로 적는다.',
    ],
  },
  {
    screen: 'support',
    purpose: '이 콘솔에서 직접 바꿀 수 없는 것을 스페이스플래닝에 묻는다.',
    actions: ['제목·내용·번호로 검색', '답변 여부로 거르기', '분류로 거르기', '문의하기', '줄을 눌러 답변 읽기'],
    guards: [
      '제목이나 내용이 비면 보내지 않는다.',
      '내용이 10자에 못 미치면 보내지 않는다 — 되묻는 데 하루가 더 걸린다.',
      '보낸 문의는 고치거나 지우지 못한다.',
    ],
    admin: ['사내 어드민 문의 목록 — 여기서 보낸 것이 그대로 서고, 거기서 쓴 답이 여기 상세 창에 뜬다.'],
    areas: [
      { area: '안내 한 줄', purpose: '무엇을 여기로 보내는지' },
      { area: '목록 툴바', purpose: '답변 대기·답변완료·보류 탭(건수 포함) · 검색 · 분류 필터 · 문의하기' },
      { area: '표', purpose: '문의 번호 · 제목 · 분류 · 보낸 날 · 상태' },
      { area: '급함 표시', purpose: '시간이 곧 손해인 문의', when: '급함으로 보냈을 때' },
      { area: '상세 창', purpose: '보낸 내용과 답변', when: '줄을 눌렀을 때' },
      { area: '문의 창', purpose: '분류 · 제목 · 내용 · 급함', when: '문의하기를 눌렀을 때' },
    ],
    fields: [
      { name: '분류', desc: '장애 · 기능 요청 · 결제 · 계약 · 기타', type: '선택', required: true, example: '장애' },
      { name: '제목', desc: '한 줄로 무엇이 문제인지', type: '텍스트', required: true, rule: '60자까지', example: '카카오 로그인이 되지 않습니다' },
      { name: '내용', desc: '언제부터 · 어느 화면에서 · 무엇을 눌렀을 때', type: '여러 줄', required: true, rule: '10자 이상 1000자까지' },
      { name: '급함', desc: '켜면 담당자의 다른 일보다 먼저 본다', type: '체크박스', rule: '지금 장사가 멈춘 경우에만' },
    ],
    buttons: [
      { label: '문의하기', onClick: '문의 창을 연다' },
      { label: '보내기', onClick: '문의를 접수 상태로 올린다', onSuccess: '목록 맨 위에 서고 사내 어드민에도 나타난다', onFail: '무엇이 비었는지 칸 밑에 적고 창을 닫지 않는다' },
    ],
    validations: ['제목과 내용은 공백만으로 둘 수 없다.', '내용은 10자 이상 1000자 이하다.'],
    policy: [
      '고객이 이 고객사에 보낸 문의(위쪽 갈래)와 자원이 다르다 — 받는 쪽도 답하는 쪽도 달라 메뉴를 갈랐다.',
      '설정의 OAuth · PG 는 이 콘솔에서 만질 수 없다. 막힌 사람이 갈 곳이 화면에 있어야 메일 주소를 찾아 나가지 않는다.',
      '자기 고객사의 문의만 보인다 — 다른 고객사의 제목만 보여도 그쪽이 무엇을 만드는지 드러난다.',
      '보낸 문의를 지우지 않는다. 지우면 답하던 담당자가 무엇을 답하고 있었는지 알 수 없게 된다.',
      '급함은 고객사가 스스로 켠다. 우리가 대신 판단하면 급한 것을 늦게 받는다.',
      '담당은 비운 채로 올라간다 — 누가 맡을지는 우리 쪽에서 정한다.',
    ],
    future: ['첨부 파일', '답변 도착 알림'],
    nonFunctional: [
      '목록의 원본은 @winpilot/store 의 support.ts 하나다 — 사내 콘솔과 두 벌로 두면 답이 어긋난다.',
      '상태 이름은 사내 콘솔·고객 문의와 글자까지 같다.',
    ],
  },
  {
    screen: 'inquiries',
    purpose: '들어온 문의에 답한다.',
    actions: [
      '제목·작성자로 검색',
      '답변 여부로 거르기',
      '답변 쓰기',
    ],
    guards: [
      '답변한 문의는 목록에서 상태가 바뀐다 — 지우지 않는다.',
    ],
    admin: [
      '마이페이지 문의 내역 — 여기서 쓴 답변이 고객 화면에 뜬다.',
    ],
    areas: [
      { area: '목록 툴바', purpose: '검색·필터·등록 단추' },
      { area: '표', purpose: '한 줄이 자원 하나' },
      { area: '선택 도구', purpose: '고른 줄에 한 번에 하는 일', when: '줄을 골랐을 때' },
      { area: '쪽 넘김', purpose: '몇 쪽 중 몇 쪽인지' },
      { area: '빈 상태', purpose: '조건에 맞는 것이 없을 때', when: '결과 0건' },
    ],
    fields: [
      { name: '답변 내용', desc: '고객이 읽을 글', type: '여러 줄', required: true, rule: '10자 이상' },
    ],
    buttons: [
      { label: '답변 저장', onClick: '답변을 붙인다', onSuccess: '상태가 답변 완료로 바뀌고 고객 화면에 뜬다', onFail: '내용이 비면 잠겨 있다' },
    ],
    validations: [
      '답변은 10자 이상이다.',
    ],
    policy: [
      '기본 정렬은 등록 최신순이다.',
      '검색·필터·쪽을 주소에 둔다 — 새로고침·뒤로가기에서 조건이 살아남는다.',
      '검색어가 비면 조건이 없는 것으로 본다. 목록을 비우지 않는다.',
      '기본 탭은 미답변이다 — 먼저 손대야 할 것을 먼저 보여 준다.',
    ],
    future: [
      '자주 쓰는 답변 저장.',
    ],
    nonFunctional: [
      '답변 여부를 색과 함께 글자로 적는다.',
    ],
  },
  {
    screen: 'inquiries-settings',
    purpose: '문의 분류와 안내문을 정한다.',
    actions: [
      '문의 분류 추가·수정·삭제',
      '안내문 수정',
    ],
    guards: [
      '쓰이고 있는 분류는 지울 수 없다.',
    ],
    admin: [
      '문의하기 — 여기서 정한 분류가 고객 화면의 선택 목록이 된다.',
    ],
    areas: [
      { area: '입력 묶음', purpose: '고칠 값들' },
      { area: '미리보기', purpose: '고객 화면에서 어떻게 보이는지', when: '값을 넣었을 때' },
      { area: '저장 줄', purpose: '저장·취소' },
    ],
    fields: [
      { name: '분류명', desc: '고객이 고르는 이름', type: '텍스트', required: true, rule: '1~20자', example: '배송' },
      { name: '안내문', desc: '문의 양식 위에 보이는 글', type: '여러 줄' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    policy: [
      '분류를 하나도 두지 않을 수 없다 — 고객이 고를 것이 없어진다.',
    ],
    future: [
      '분류별 담당자 지정.',
    ],
    nonFunctional: [
      '분류 순서가 곧 고객 화면 선택 순서다.',
    ],
  },
  {
    screen: 'contents-notices',
    purpose: '공지사항을(를) 찾고 상태를 본다.',
    actions: [
      '제목으로 검색',
      '노출 여부로 거르기',
      '등록·수정·삭제',
    ],
    guards: [
      '숨긴 글은 고객 화면에 나오지 않는다.',
      '삭제는 확인을 한 번 묻는다.',
    ],
    admin: [
      '공지사항 목록 · 공지 상세',
    ],
    areas: [
      { area: '목록 툴바', purpose: '검색·필터·등록 단추' },
      { area: '표', purpose: '한 줄이 자원 하나' },
      { area: '선택 도구', purpose: '고른 줄에 한 번에 하는 일', when: '줄을 골랐을 때' },
      { area: '쪽 넘김', purpose: '몇 쪽 중 몇 쪽인지' },
      { area: '빈 상태', purpose: '조건에 맞는 것이 없을 때', when: '결과 0건' },
    ],
    policy: [
      '기본 정렬은 등록 최신순이다.',
      '검색·필터·쪽을 주소에 둔다 — 새로고침·뒤로가기에서 조건이 살아남는다.',
      '검색어가 비면 조건이 없는 것으로 본다. 목록을 비우지 않는다.',
      '상단 고정 공지는 목록 맨 위에 붙는다.',
    ],
    future: [
      '예약 발행.',
    ],
    nonFunctional: [
      '노출 여부를 색과 함께 글자로 적는다.',
    ],
  },
  {
    screen: 'contents-notices-new',
    purpose: '공지사항을(를) 새로 쓴다.',
    actions: [
      '제목·본문 입력',
      '이미지 올리기',
      '노출 여부 정하기',
      '미리보기',
    ],
    guards: [
      '제목·본문이 비면 저장 단추가 잠긴다.',
    ],
    admin: [
      '공지사항 목록 · 공지 상세',
    ],
    areas: [
      { area: '입력 묶음', purpose: '고칠 값들' },
      { area: '미리보기', purpose: '고객 화면에서 어떻게 보이는지', when: '값을 넣었을 때' },
      { area: '저장 줄', purpose: '저장·취소' },
    ],
    fields: [
      { name: '제목', desc: '목록과 상세에 보이는 이름', type: '텍스트', required: true, rule: '2~60자' },
      { name: '본문', desc: '고객이 읽을 글', type: '편집기', required: true, rule: '10자 이상' },
      { name: '대표 이미지', desc: '목록에 보이는 그림', type: '파일', rule: 'PNG·JPG·WEBP · 5MB 이하' },
      { name: '노출', desc: '고객 화면에 보일지', type: '체크박스' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    validations: [
      '제목은 2~60자, 본문은 10자 이상이다.',
    ],
    policy: [
      '등록 직후에는 숨김 상태다 — 다 쓰기 전에 고객 화면에 뜨지 않게.',
    ],
    future: [
      '임시 저장.',
    ],
    nonFunctional: [
      '본문 편집기가 만든 HTML 을 고객 화면이 그대로 그린다 — 값의 출처가 어드민이라 바깥 입력이 아니다.',
    ],
  },
  {
    screen: 'contents-notices-detail',
    purpose: '공지사항을(를) 고친다.',
    actions: [
      '제목·본문 입력',
      '이미지 올리기',
      '노출 여부 정하기',
      '미리보기',
    ],
    guards: [
      '제목·본문이 비면 저장 단추가 잠긴다.',
    ],
    admin: [
      '공지 상세',
    ],
    areas: [
      { area: '입력 묶음', purpose: '고칠 값들' },
      { area: '미리보기', purpose: '고객 화면에서 어떻게 보이는지', when: '값을 넣었을 때' },
      { area: '저장 줄', purpose: '저장·취소' },
    ],
    fields: [
      { name: '제목', desc: '목록과 상세에 보이는 이름', type: '텍스트', required: true, rule: '2~60자' },
      { name: '본문', desc: '고객이 읽을 글', type: '편집기', required: true, rule: '10자 이상' },
      { name: '대표 이미지', desc: '목록에 보이는 그림', type: '파일', rule: 'PNG·JPG·WEBP · 5MB 이하' },
      { name: '노출', desc: '고객 화면에 보일지', type: '체크박스' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    validations: [
      '제목은 2~60자, 본문은 10자 이상이다.',
    ],
    policy: [
      '등록 직후에는 숨김 상태다 — 다 쓰기 전에 고객 화면에 뜨지 않게.',
    ],
    future: [
      '임시 저장.',
    ],
    nonFunctional: [
      '본문 편집기가 만든 HTML 을 고객 화면이 그대로 그린다 — 값의 출처가 어드민이라 바깥 입력이 아니다.',
    ],
  },
  {
    screen: 'contents-faqs',
    purpose: 'FAQ을(를) 찾고 상태를 본다.',
    actions: [
      '제목으로 검색',
      '노출 여부로 거르기',
      '등록·수정·삭제',
    ],
    guards: [
      '숨긴 글은 고객 화면에 나오지 않는다.',
      '삭제는 확인을 한 번 묻는다.',
    ],
    admin: [
      'FAQ 목록 · FAQ 상세',
    ],
    areas: [
      { area: '목록 툴바', purpose: '검색·필터·등록 단추' },
      { area: '표', purpose: '한 줄이 자원 하나' },
      { area: '선택 도구', purpose: '고른 줄에 한 번에 하는 일', when: '줄을 골랐을 때' },
      { area: '쪽 넘김', purpose: '몇 쪽 중 몇 쪽인지' },
      { area: '빈 상태', purpose: '조건에 맞는 것이 없을 때', when: '결과 0건' },
    ],
    policy: [
      '기본 정렬은 등록 최신순이다.',
      '검색·필터·쪽을 주소에 둔다 — 새로고침·뒤로가기에서 조건이 살아남는다.',
      '검색어가 비면 조건이 없는 것으로 본다. 목록을 비우지 않는다.',
      '분류별로 묶어 보여 준다.',
    ],
    future: [
      '예약 발행.',
    ],
    nonFunctional: [
      '노출 여부를 색과 함께 글자로 적는다.',
    ],
  },
  {
    screen: 'contents-news',
    purpose: '뉴스을(를) 찾고 상태를 본다.',
    actions: [
      '제목으로 검색',
      '노출 여부로 거르기',
      '등록·수정·삭제',
    ],
    guards: [
      '숨긴 글은 고객 화면에 나오지 않는다.',
      '삭제는 확인을 한 번 묻는다.',
    ],
    admin: [
      '뉴스 목록 · 뉴스 상세',
    ],
    areas: [
      { area: '목록 툴바', purpose: '검색·필터·등록 단추' },
      { area: '표', purpose: '한 줄이 자원 하나' },
      { area: '선택 도구', purpose: '고른 줄에 한 번에 하는 일', when: '줄을 골랐을 때' },
      { area: '쪽 넘김', purpose: '몇 쪽 중 몇 쪽인지' },
      { area: '빈 상태', purpose: '조건에 맞는 것이 없을 때', when: '결과 0건' },
    ],
    policy: [
      '기본 정렬은 등록 최신순이다.',
      '검색·필터·쪽을 주소에 둔다 — 새로고침·뒤로가기에서 조건이 살아남는다.',
      '검색어가 비면 조건이 없는 것으로 본다. 목록을 비우지 않는다.',
    ],
    future: [
      '예약 발행.',
    ],
    nonFunctional: [
      '노출 여부를 색과 함께 글자로 적는다.',
    ],
  },
  {
    screen: 'contents-news-new',
    purpose: '뉴스을(를) 새로 쓴다.',
    actions: [
      '제목·본문 입력',
      '이미지 올리기',
      '노출 여부 정하기',
      '미리보기',
    ],
    guards: [
      '제목·본문이 비면 저장 단추가 잠긴다.',
    ],
    admin: [
      '뉴스 목록 · 뉴스 상세',
    ],
    areas: [
      { area: '입력 묶음', purpose: '고칠 값들' },
      { area: '미리보기', purpose: '고객 화면에서 어떻게 보이는지', when: '값을 넣었을 때' },
      { area: '저장 줄', purpose: '저장·취소' },
    ],
    fields: [
      { name: '제목', desc: '목록과 상세에 보이는 이름', type: '텍스트', required: true, rule: '2~60자' },
      { name: '본문', desc: '고객이 읽을 글', type: '편집기', required: true, rule: '10자 이상' },
      { name: '대표 이미지', desc: '목록에 보이는 그림', type: '파일', rule: 'PNG·JPG·WEBP · 5MB 이하' },
      { name: '노출', desc: '고객 화면에 보일지', type: '체크박스' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    validations: [
      '제목은 2~60자, 본문은 10자 이상이다.',
    ],
    policy: [
      '등록 직후에는 숨김 상태다 — 다 쓰기 전에 고객 화면에 뜨지 않게.',
    ],
    future: [
      '임시 저장.',
    ],
    nonFunctional: [
      '본문 편집기가 만든 HTML 을 고객 화면이 그대로 그린다 — 값의 출처가 어드민이라 바깥 입력이 아니다.',
    ],
  },
  {
    screen: 'contents-news-detail',
    purpose: '뉴스을(를) 고친다.',
    actions: [
      '제목·본문 입력',
      '이미지 올리기',
      '노출 여부 정하기',
      '미리보기',
    ],
    guards: [
      '제목·본문이 비면 저장 단추가 잠긴다.',
    ],
    admin: [
      '뉴스 상세',
    ],
    areas: [
      { area: '입력 묶음', purpose: '고칠 값들' },
      { area: '미리보기', purpose: '고객 화면에서 어떻게 보이는지', when: '값을 넣었을 때' },
      { area: '저장 줄', purpose: '저장·취소' },
    ],
    fields: [
      { name: '제목', desc: '목록과 상세에 보이는 이름', type: '텍스트', required: true, rule: '2~60자' },
      { name: '본문', desc: '고객이 읽을 글', type: '편집기', required: true, rule: '10자 이상' },
      { name: '대표 이미지', desc: '목록에 보이는 그림', type: '파일', rule: 'PNG·JPG·WEBP · 5MB 이하' },
      { name: '노출', desc: '고객 화면에 보일지', type: '체크박스' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    validations: [
      '제목은 2~60자, 본문은 10자 이상이다.',
    ],
    policy: [
      '등록 직후에는 숨김 상태다 — 다 쓰기 전에 고객 화면에 뜨지 않게.',
    ],
    future: [
      '임시 저장.',
    ],
    nonFunctional: [
      '본문 편집기가 만든 HTML 을 고객 화면이 그대로 그린다 — 값의 출처가 어드민이라 바깥 입력이 아니다.',
    ],
  },
  {
    screen: 'contents-portfolios',
    purpose: '포트폴리오을(를) 찾고 상태를 본다.',
    actions: [
      '제목으로 검색',
      '노출 여부로 거르기',
      '등록·수정·삭제',
    ],
    guards: [
      '숨긴 글은 고객 화면에 나오지 않는다.',
      '삭제는 확인을 한 번 묻는다.',
    ],
    admin: [
      '포트폴리오',
    ],
    areas: [
      { area: '목록 툴바', purpose: '검색·필터·등록 단추' },
      { area: '표', purpose: '한 줄이 자원 하나' },
      { area: '선택 도구', purpose: '고른 줄에 한 번에 하는 일', when: '줄을 골랐을 때' },
      { area: '쪽 넘김', purpose: '몇 쪽 중 몇 쪽인지' },
      { area: '빈 상태', purpose: '조건에 맞는 것이 없을 때', when: '결과 0건' },
    ],
    policy: [
      '기본 정렬은 등록 최신순이다.',
      '검색·필터·쪽을 주소에 둔다 — 새로고침·뒤로가기에서 조건이 살아남는다.',
      '검색어가 비면 조건이 없는 것으로 본다. 목록을 비우지 않는다.',
    ],
    future: [
      '예약 발행.',
    ],
    nonFunctional: [
      '노출 여부를 색과 함께 글자로 적는다.',
    ],
  },
  {
    screen: 'contents-portfolios-new',
    purpose: '포트폴리오을(를) 새로 쓴다.',
    actions: [
      '제목·본문 입력',
      '이미지 올리기',
      '노출 여부 정하기',
      '미리보기',
    ],
    guards: [
      '제목·본문이 비면 저장 단추가 잠긴다.',
    ],
    admin: [
      '포트폴리오',
    ],
    areas: [
      { area: '입력 묶음', purpose: '고칠 값들' },
      { area: '미리보기', purpose: '고객 화면에서 어떻게 보이는지', when: '값을 넣었을 때' },
      { area: '저장 줄', purpose: '저장·취소' },
    ],
    fields: [
      { name: '제목', desc: '목록과 상세에 보이는 이름', type: '텍스트', required: true, rule: '2~60자' },
      { name: '본문', desc: '고객이 읽을 글', type: '편집기', required: true, rule: '10자 이상' },
      { name: '대표 이미지', desc: '목록에 보이는 그림', type: '파일', rule: 'PNG·JPG·WEBP · 5MB 이하' },
      { name: '노출', desc: '고객 화면에 보일지', type: '체크박스' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    validations: [
      '제목은 2~60자, 본문은 10자 이상이다.',
    ],
    policy: [
      '등록 직후에는 숨김 상태다 — 다 쓰기 전에 고객 화면에 뜨지 않게.',
    ],
    future: [
      '임시 저장.',
    ],
    nonFunctional: [
      '본문 편집기가 만든 HTML 을 고객 화면이 그대로 그린다 — 값의 출처가 어드민이라 바깥 입력이 아니다.',
    ],
  },
  {
    screen: 'contents-portfolios-detail',
    purpose: '포트폴리오을(를) 고친다.',
    actions: [
      '제목·본문 입력',
      '이미지 올리기',
      '노출 여부 정하기',
      '미리보기',
    ],
    guards: [
      '제목·본문이 비면 저장 단추가 잠긴다.',
    ],
    admin: [
      '포트폴리오',
    ],
    areas: [
      { area: '입력 묶음', purpose: '고칠 값들' },
      { area: '미리보기', purpose: '고객 화면에서 어떻게 보이는지', when: '값을 넣었을 때' },
      { area: '저장 줄', purpose: '저장·취소' },
    ],
    fields: [
      { name: '제목', desc: '목록과 상세에 보이는 이름', type: '텍스트', required: true, rule: '2~60자' },
      { name: '본문', desc: '고객이 읽을 글', type: '편집기', required: true, rule: '10자 이상' },
      { name: '대표 이미지', desc: '목록에 보이는 그림', type: '파일', rule: 'PNG·JPG·WEBP · 5MB 이하' },
      { name: '노출', desc: '고객 화면에 보일지', type: '체크박스' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    validations: [
      '제목은 2~60자, 본문은 10자 이상이다.',
    ],
    policy: [
      '등록 직후에는 숨김 상태다 — 다 쓰기 전에 고객 화면에 뜨지 않게.',
    ],
    future: [
      '임시 저장.',
    ],
    nonFunctional: [
      '본문 편집기가 만든 HTML 을 고객 화면이 그대로 그린다 — 값의 출처가 어드민이라 바깥 입력이 아니다.',
    ],
  },
  {
    screen: 'banners',
    purpose: '홈 맨 위에 무엇을 걸지 정한다.',
    actions: [
      '배너 추가·수정·삭제',
      '순서 바꾸기',
      '노출 기간 설정',
    ],
    guards: [
      '노출 기간이 지난 배너는 고객 화면에 오지 않는다 — 숨기는 것이 아니라 아예 받지 않는다.',
    ],
    admin: [
      '홈의 히어로 배너',
    ],
    areas: [
      { area: '목록 툴바', purpose: '검색·필터·등록 단추' },
      { area: '표', purpose: '한 줄이 자원 하나' },
      { area: '선택 도구', purpose: '고른 줄에 한 번에 하는 일', when: '줄을 골랐을 때' },
      { area: '쪽 넘김', purpose: '몇 쪽 중 몇 쪽인지' },
      { area: '빈 상태', purpose: '조건에 맞는 것이 없을 때', when: '결과 0건' },
    ],
    policy: [
      '기본 정렬은 등록 최신순이다.',
      '검색·필터·쪽을 주소에 둔다 — 새로고침·뒤로가기에서 조건이 살아남는다.',
      '검색어가 비면 조건이 없는 것으로 본다. 목록을 비우지 않는다.',
    ],
    future: [
      '노출 비율 A/B.',
    ],
    nonFunctional: [
      '배너 순서가 곧 고객 화면 넘김 순서다.',
    ],
  },
  {
    screen: 'banners-new',
    purpose: '배너를 새로 만든다.',
    actions: [
      '이미지 올리기',
      '연결 주소 정하기',
      '노출 기간 정하기',
      '미리보기',
    ],
    guards: [
      '이미지 비율이 맞지 않으면 올릴 수 없다 — 고객 화면에서 잘린다.',
    ],
    admin: [
      '홈의 히어로 배너',
    ],
    areas: [
      { area: '입력 묶음', purpose: '고칠 값들' },
      { area: '미리보기', purpose: '고객 화면에서 어떻게 보이는지', when: '값을 넣었을 때' },
      { area: '저장 줄', purpose: '저장·취소' },
    ],
    fields: [
      { name: '이미지', desc: '배너 그림', type: '파일', required: true, rule: 'PNG·JPG·WEBP · 5MB 이하 · 21:9' },
      { name: '연결 주소', desc: '누르면 갈 곳', type: '텍스트', rule: '앱 안의 경로', example: '/products?tag=NEW' },
      { name: '노출 기간', desc: '언제부터 언제까지', type: '기간', required: true, rule: '시작일 ≤ 종료일', example: '2026-08-01 ~ 2026-08-31' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    validations: [
      '이미지 비율이 21:9 에서 벗어나면 거절하고 무엇이 걸렸는지 적는다.',
      '시작일이 종료일보다 늦을 수 없다.',
    ],
    future: [
      '모바일 전용 이미지.',
    ],
    nonFunctional: [
      '미리보기가 고객 화면과 같은 비율로 그려진다.',
    ],
  },
  {
    screen: 'banners-detail',
    purpose: '배너를 고친다.',
    actions: [
      '이미지 교체',
      '기간·연결 주소 수정',
      '삭제',
    ],
    guards: [
      '노출 중인 배너를 지우면 고객 화면에서 바로 사라진다 — 확인을 한 번 묻는다.',
    ],
    admin: [
      '홈의 히어로 배너',
    ],
    areas: [
      { area: '입력 묶음', purpose: '고칠 값들' },
      { area: '미리보기', purpose: '고객 화면에서 어떻게 보이는지', when: '값을 넣었을 때' },
      { area: '저장 줄', purpose: '저장·취소' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    future: [
      '변경 이력.',
    ],
    nonFunctional: [
      '고친 값은 저장하는 순간 반영된다.',
    ],
  },
  {
    screen: 'banners-popups',
    purpose: '띄울 팝업을 정한다.',
    actions: [
      '팝업 추가·수정·삭제',
      '노출 기간 설정',
    ],
    guards: [
      '같은 기간에 팝업이 여럿이면 순서대로 겹쳐 뜬다.',
    ],
    admin: [
      '홈 — 처음 들어온 사람에게 뜬다.',
    ],
    areas: [
      { area: '목록 툴바', purpose: '검색·필터·등록 단추' },
      { area: '표', purpose: '한 줄이 자원 하나' },
      { area: '선택 도구', purpose: '고른 줄에 한 번에 하는 일', when: '줄을 골랐을 때' },
      { area: '쪽 넘김', purpose: '몇 쪽 중 몇 쪽인지' },
      { area: '빈 상태', purpose: '조건에 맞는 것이 없을 때', when: '결과 0건' },
    ],
    policy: [
      '기본 정렬은 등록 최신순이다.',
      '검색·필터·쪽을 주소에 둔다 — 새로고침·뒤로가기에서 조건이 살아남는다.',
      '검색어가 비면 조건이 없는 것으로 본다. 목록을 비우지 않는다.',
    ],
    future: [
      '노출 빈도 제한.',
    ],
    nonFunctional: [
      '오늘 하루 보지 않기를 고른 사람에게는 다시 뜨지 않는다.',
    ],
  },
  {
    screen: 'banners-popups-new',
    purpose: '팝업을 새로 만든다.',
    actions: [
      '내용 입력',
      '위치·크기 정하기',
      '노출 기간 정하기',
    ],
    guards: [
      '필수 항목이 비면 저장 단추가 잠긴다.',
    ],
    admin: [
      '홈',
    ],
    areas: [
      { area: '입력 묶음', purpose: '고칠 값들' },
      { area: '미리보기', purpose: '고객 화면에서 어떻게 보이는지', when: '값을 넣었을 때' },
      { area: '저장 줄', purpose: '저장·취소' },
    ],
    fields: [
      { name: '제목', desc: '팝업 머리글', type: '텍스트', required: true, rule: '2~40자' },
      { name: '내용', desc: '보여 줄 글', type: '편집기', required: true },
      { name: '노출 기간', desc: '언제부터 언제까지', type: '기간', required: true, rule: '시작일 ≤ 종료일' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    validations: [
      '시작일이 종료일보다 늦을 수 없다.',
    ],
    future: [
      '대상 지정(신규 회원만).',
    ],
    nonFunctional: [
      '미리보기가 실제 뜨는 자리와 같은 위치에 그려진다.',
    ],
  },
  {
    screen: 'banners-popups-detail',
    purpose: '팝업을 고친다.',
    actions: [
      '내용·기간 수정',
      '삭제',
    ],
    guards: [
      '노출 중인 팝업을 지우면 바로 사라진다 — 확인을 한 번 묻는다.',
    ],
    admin: [
      '홈',
    ],
    areas: [
      { area: '입력 묶음', purpose: '고칠 값들' },
      { area: '미리보기', purpose: '고객 화면에서 어떻게 보이는지', when: '값을 넣었을 때' },
      { area: '저장 줄', purpose: '저장·취소' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    future: [
      '변경 이력.',
    ],
    nonFunctional: [
      '고친 값은 저장하는 순간 반영된다.',
    ],
  },
  {
    screen: 'company-about',
    purpose: '회사 소개 글과 대표 이미지를 넣는다.',
    actions: [
      '소개 글 수정',
      '대표 이미지 올리기',
      '미리보기',
    ],
    guards: [
      '이미지 비율이 맞지 않으면 올릴 수 없다.',
    ],
    admin: [
      '회사소개',
    ],
    areas: [
      { area: '입력 묶음', purpose: '고칠 값들' },
      { area: '미리보기', purpose: '고객 화면에서 어떻게 보이는지', when: '값을 넣었을 때' },
      { area: '저장 줄', purpose: '저장·취소' },
    ],
    fields: [
      { name: '소개 글', desc: '고객이 읽을 글', type: '편집기', required: true },
      { name: '대표 이미지', desc: '회사를 한 장으로', type: '파일', rule: 'PNG·JPG·WEBP · 5MB 이하 · 16:9' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    future: [
      '오시는 길 지도.',
    ],
    nonFunctional: [
      '대표 이미지 자리가 고객 화면과 1:1 로 맞는다 — 어드민에서 본 것이 그대로 나간다.',
    ],
  },
  {
    screen: 'company-history',
    purpose: '연혁을 쌓는다.',
    actions: [
      '연혁 항목 추가·수정·삭제',
      '연도별 정렬',
    ],
    guards: [
      '연도가 비면 저장할 수 없다 — 연도가 곧 정렬 기준이다.',
    ],
    admin: [
      '연혁',
    ],
    areas: [
      { area: '목록 툴바', purpose: '검색·필터·등록 단추' },
      { area: '표', purpose: '한 줄이 자원 하나' },
      { area: '선택 도구', purpose: '고른 줄에 한 번에 하는 일', when: '줄을 골랐을 때' },
      { area: '쪽 넘김', purpose: '몇 쪽 중 몇 쪽인지' },
      { area: '빈 상태', purpose: '조건에 맞는 것이 없을 때', when: '결과 0건' },
    ],
    fields: [
      { name: '연도', desc: '언제 있었던 일인지', type: '숫자', required: true, rule: '네 자리', example: '2026' },
      { name: '내용', desc: '무슨 일이 있었는지', type: '텍스트', required: true, rule: '2~80자', example: '본사 이전' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    validations: [
      '연도는 네 자리 숫자다.',
    ],
    policy: [
      '기본 정렬은 최신 연도부터다 — 고객 화면과 같은 순서로 보여야 한다.',
    ],
    future: [
      '연혁 이미지.',
    ],
    nonFunctional: [
      '연도만 뜻이 있는 자리라 날짜를 `YYYY` 로 받는다.',
    ],
  },
  {
    screen: 'statistics',
    purpose: '오늘의 지표를 본다.',
    actions: [
      '기간 고르기',
      '차트·표 보기',
    ],
    guards: [
      '자료가 없는 기간은 빈 차트 대신 한 줄로 알린다.',
    ],
    admin: [
      '없음 — 운영자만 보는 화면이다.',
    ],
    areas: [
      { area: '기간 고르기', purpose: '언제 것을 볼지' },
      { area: '차트', purpose: '방문·주문·매출 한눈에' },
      { area: '표', purpose: '숫자로 다시 본다' },
    ],
    fields: [
      { name: '기간', desc: '조회 범위', type: '선택', rule: '최근 7일·30일·90일', example: '최근 30일' },
    ],
    policy: [
      '기간을 주소에 둔다.',
      '기본 기간은 최근 30일이다.',
    ],
    future: [
      '기간 비교.',
    ],
    nonFunctional: [
      '차트는 전부 인라인 SVG 다. 비트맵은 Figma 에서 벡터로 복원되지 않는다.',
    ],
  },
  {
    screen: 'statistics-periods',
    purpose: '기간별 흐름를 본다.',
    actions: [
      '기간 고르기',
      '차트·표 보기',
    ],
    guards: [
      '자료가 없는 기간은 빈 차트 대신 한 줄로 알린다.',
    ],
    admin: [
      '없음 — 운영자만 보는 화면이다.',
    ],
    areas: [
      { area: '기간 고르기', purpose: '언제 것을 볼지' },
      { area: '차트', purpose: '기간에 따른 변화' },
      { area: '표', purpose: '숫자로 다시 본다' },
    ],
    fields: [
      { name: '기간', desc: '조회 범위', type: '선택', rule: '최근 7일·30일·90일', example: '최근 30일' },
    ],
    policy: [
      '기간을 주소에 둔다.',
      '기본 기간은 최근 30일이다.',
    ],
    future: [
      '기간 비교.',
    ],
    nonFunctional: [
      '차트는 전부 인라인 SVG 다. 비트맵은 Figma 에서 벡터로 복원되지 않는다.',
    ],
  },
  {
    screen: 'statistics-pages',
    purpose: '많이 방문한 페이지를 본다.',
    actions: [
      '기간 고르기',
      '차트·표 보기',
    ],
    guards: [
      '자료가 없는 기간은 빈 차트 대신 한 줄로 알린다.',
    ],
    admin: [
      '없음 — 운영자만 보는 화면이다.',
    ],
    areas: [
      { area: '기간 고르기', purpose: '언제 것을 볼지' },
      { area: '차트', purpose: '어느 화면을 많이 보는지' },
      { area: '표', purpose: '숫자로 다시 본다' },
    ],
    fields: [
      { name: '기간', desc: '조회 범위', type: '선택', rule: '최근 7일·30일·90일', example: '최근 30일' },
    ],
    policy: [
      '기간을 주소에 둔다.',
      '기본 기간은 최근 30일이다.',
    ],
    future: [
      '기간 비교.',
    ],
    nonFunctional: [
      '차트는 전부 인라인 SVG 다. 비트맵은 Figma 에서 벡터로 복원되지 않는다.',
    ],
  },
  {
    screen: 'statistics-revenue',
    purpose: '매출를 본다.',
    actions: [
      '기간 고르기',
      '차트·표 보기',
    ],
    guards: [
      '자료가 없는 기간은 빈 차트 대신 한 줄로 알린다.',
    ],
    admin: [
      '없음 — 운영자만 보는 화면이다.',
    ],
    areas: [
      { area: '기간 고르기', purpose: '언제 것을 볼지' },
      { area: '차트', purpose: '무엇이 얼마나 팔렸는지' },
      { area: '표', purpose: '숫자로 다시 본다' },
    ],
    fields: [
      { name: '기간', desc: '조회 범위', type: '선택', rule: '최근 7일·30일·90일', example: '최근 30일' },
    ],
    policy: [
      '기간을 주소에 둔다.',
      '기본 기간은 최근 30일이다.',
    ],
    future: [
      '기간 비교.',
    ],
    nonFunctional: [
      '차트는 전부 인라인 SVG 다. 비트맵은 Figma 에서 벡터로 복원되지 않는다.',
    ],
  },
  {
    screen: 'settings-supplier',
    purpose: '공급자 정보를 정한다.',
    actions: [
      '값 수정',
      '저장',
    ],
    guards: [
      '필수 항목이 비면 저장 단추가 잠긴다.',
    ],
    admin: [
      '푸터 · 회사소개',
    ],
    areas: [
      { area: '입력 묶음', purpose: '고칠 값들' },
      { area: '미리보기', purpose: '고객 화면에서 어떻게 보이는지', when: '값을 넣었을 때' },
      { area: '저장 줄', purpose: '저장·취소' },
    ],
    fields: [
      { name: '상호', desc: '사업자 이름', type: '텍스트', required: true, rule: '1~40자', example: '스페이스플래닝' },
      { name: '대표자', desc: '대표 이름', type: '텍스트', required: true, example: '홍승범' },
      { name: '사업자등록번호', desc: '등록 번호', type: '텍스트', required: true, rule: '숫자·하이픈', example: '000-00-00000' },
      { name: '통신판매업 신고번호', desc: '신고 번호', type: '텍스트', required: true, example: '제2026-서울성동-0000호' },
      { name: '주소', desc: '사업장 주소', type: '텍스트', required: true, example: '서울시 성동구 …' },
      { name: '전화·이메일', desc: '연락처', type: '텍스트', required: true, example: '02-0000-0000' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    policy: [
      '값을 템플릿에 박아 두지 않는다. 박아 두면 고칠 때마다 배포해야 한다.',
    ],
    future: [
      '변경 이력.',
    ],
    nonFunctional: [
      '저장하면 고객 화면에 바로 반영된다 — 배포하지 않는다.',
    ],
  },
  {
    screen: 'settings-seo',
    purpose: 'SEO 정보를 정한다.',
    actions: [
      '값 수정',
      '저장',
    ],
    guards: [
      '필수 항목이 비면 저장 단추가 잠긴다.',
    ],
    admin: [
      '모든 화면의 메타 정보',
    ],
    areas: [
      { area: '입력 묶음', purpose: '고칠 값들' },
      { area: '미리보기', purpose: '고객 화면에서 어떻게 보이는지', when: '값을 넣었을 때' },
      { area: '저장 줄', purpose: '저장·취소' },
    ],
    fields: [
      { name: '사이트 제목', desc: '탭과 검색 결과에 보이는 이름', type: '텍스트', required: true, rule: '1~60자' },
      { name: '설명', desc: '검색 결과에 보이는 한 줄', type: '텍스트', required: true, rule: '~160자' },
      { name: '대표 이미지', desc: '공유했을 때 보이는 그림', type: '파일', rule: 'PNG·JPG · 1.91:1' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    policy: [
      '문서 화면(`/docs`)은 검색에 걸리지 않게 따로 막는다 — 사내 문서다.',
    ],
    future: [
      '변경 이력.',
    ],
    nonFunctional: [
      '저장하면 고객 화면에 바로 반영된다 — 배포하지 않는다.',
    ],
  },
  {
    screen: 'settings-terms',
    purpose: '서비스 이용약관를 정한다.',
    actions: [
      '값 수정',
      '저장',
    ],
    guards: [
      '필수 항목이 비면 저장 단추가 잠긴다.',
    ],
    admin: [
      '이용약관',
    ],
    areas: [
      { area: '입력 묶음', purpose: '고칠 값들' },
      { area: '미리보기', purpose: '고객 화면에서 어떻게 보이는지', when: '값을 넣었을 때' },
      { area: '저장 줄', purpose: '저장·취소' },
    ],
    fields: [
      { name: '본문', desc: '고객이 읽을 약관', type: '편집기', required: true },
      { name: '시행일', desc: '이 판이 적용되는 날', type: '날짜', required: true, rule: '`YYYY-MM-DD`', example: '2026-08-01' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    policy: [
      '값을 템플릿에 박아 두지 않는다. 박아 두면 고칠 때마다 배포해야 한다.',
    ],
    future: [
      '변경 이력.',
    ],
    nonFunctional: [
      '저장하면 고객 화면에 바로 반영된다 — 배포하지 않는다.',
    ],
  },
  {
    screen: 'settings-privacy',
    purpose: '개인정보 처리방침를 정한다.',
    actions: [
      '값 수정',
      '저장',
    ],
    guards: [
      '필수 항목이 비면 저장 단추가 잠긴다.',
    ],
    admin: [
      '개인정보 처리방침',
    ],
    areas: [
      { area: '입력 묶음', purpose: '고칠 값들' },
      { area: '미리보기', purpose: '고객 화면에서 어떻게 보이는지', when: '값을 넣었을 때' },
      { area: '저장 줄', purpose: '저장·취소' },
    ],
    fields: [
      { name: '본문', desc: '고객이 읽을 처리방침', type: '편집기', required: true },
      { name: '시행일', desc: '이 판이 적용되는 날', type: '날짜', required: true, rule: '`YYYY-MM-DD`', example: '2026-08-01' },
    ],
    buttons: [
      { label: '저장', onClick: '입력을 확인하고 반영한다', onSuccess: '토스트로 알리고 목록으로 돌아간다', onFail: '틀린 입력으로 포커스를 옮긴다' },
      { label: '취소', onClick: '고친 것을 버린다', onSuccess: '목록으로 돌아간다', onFail: '고친 것이 있으면 확인을 한 번 묻는다' },
    ],
    policy: [
      '값을 템플릿에 박아 두지 않는다. 박아 두면 고칠 때마다 배포해야 한다.',
    ],
    future: [
      '변경 이력.',
    ],
    nonFunctional: [
      '저장하면 고객 화면에 바로 반영된다 — 배포하지 않는다.',
    ],
  },
  {
    screen: 'components',
    purpose: '쓰고 있는 컴포넌트를 실제로 그려 본다.',
    actions: [
      '컴포넌트 훑어보기',
    ],
    guards: [
      '없다 — 읽기만 하는 개발용 화면이다.',
    ],
    admin: [
      '없음 — 운영자에게 보이지 않는 개발 도구다.',
    ],
    areas: [
      { area: '컴포넌트 목록', purpose: '이름과 실제 모습' },
    ],
    policy: [
      '이 화면은 고객사에 노출되지 않는다.',
    ],
    future: [
      '어느 화면에 쓰이는지 표시.',
    ],
    nonFunctional: [
      '화면에 보이는 것이 실제 컴포넌트다 — 그림으로 흉내 내지 않는다.',
    ],
  },
  {
    screen: 'result',
    purpose: '방금 한 일이 끝났음을 알린다.',
    actions: [
      '돌아갈 곳 고르기',
    ],
    guards: [
      '무엇이 끝났는지(`kind`)에 따라 돌아갈 곳이 달라진다.',
    ],
    admin: [
      '없음 — 어드민 안에서 끝나는 화면이다.',
    ],
    areas: [
      { area: '결과 아이콘', purpose: '성공·실패를 모양으로 갈라 보여 준다' },
      { area: '안내 문구', purpose: '무엇이 끝났는지' },
      { area: '돌아갈 길', purpose: '어디로 갈지' },
    ],
    policy: [
      '완료·실패가 한 화면이다(`?state=done|failed`) — 문구와 아이콘만 바뀐다.',
    ],
    future: [
      '결과 화면에서 바로 다음 할 일 잇기.',
    ],
    nonFunctional: [
      '고객 화면과 같은 컴포넌트(`StatusScreen`)를 쓴다.',
    ],
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
