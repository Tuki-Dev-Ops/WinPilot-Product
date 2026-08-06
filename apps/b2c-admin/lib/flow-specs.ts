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
 * `@winpilot/store`, 어드민 시드 `lib/data/*`, 주소 질의문자열)만 적는다.
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
    entries: ['로그인을 마치고 바로', '사이드바 대시보드'],
    steps: [
      '요약 카드로 오늘 수치를 훑는다',
      '처리 대기에서 먼저 손댈 것을 고른다',
      '카드를 눌러 그 수치를 만든 조건이 걸린 목록으로 간다',
    ],
    branches: [
      {
        after: 0,
        question: '오늘 볼 것이 있나',
        block: '카드에 0 을 적고 그대로 둔다 — 카드 자체를 숨기지 않는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [],
    data: ['어드민 시드 · lib/data/analytics.ts', '어드민 시드 · lib/data/orders.ts', '@winpilot/store · inquiries'],
    exits: ['수치를 만든 조건이 그대로 걸린 목록으로'],
  },
  // 유일하게 사이드바가 없는 화면이라 들어오는 길이 주소뿐이다.
  {
    screen: 'login',
    entries: ['주소창에 /login 을 직접 열어'],
    steps: ['이메일을 넣는다', '비밀번호를 넣는다', '로그인을 누른다'],
    branches: [
      {
        after: 2,
        question: '이메일 모양과 8자 이상을 다 만족하나',
        block: '무엇이 틀렸는지 그 입력 아래에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: '둘 중 하나라도 비면 로그인 단추가 잠긴 채로 있다' }],
    data: ['없음 — 화면 안 입력만 쓴다'],
    exits: ['대시보드로'],
  },
  {
    screen: 'users',
    entries: ['사이드바 사용자', '보조 메뉴 사용자'],
    steps: [
      '상태 탭으로 거른다',
      '이름 · 닉네임 · 이메일 · 회원번호로 검색한다',
      '줄을 눌러 조회 창을 연다',
      '삭제를 누르면 확인 창이 뜬다',
    ],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 회원이 있나',
        block: '빈 상태 안내를 대신 그린다',
        blockLabel: '아니오',
      },
      {
        after: 3,
        question: '확인 창에서 삭제를 다시 눌렀나',
        block: '창을 닫고 목록을 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 2, label: '이메일 · 연락처는 목록에서 가려 보여 준다' }],
    data: ['화면 안 회원 시드 목록', '주소 질의문자열 (q·tab·page)'],
    exits: ['목록으로 — 검색 · 탭 · 쪽은 주소에 그대로 남는다'],
  },
  {
    screen: 'users-admins',
    entries: ['사이드바 사용자 · 관리자'],
    steps: ['운영자 목록을 훑는다', '추가를 눌러 폼 모달을 연다', '이름 · 이메일 · 역할을 넣는다', '저장을 누른다'],
    branches: [
      {
        after: 3,
        question: '이메일이 이미 쓰는 것과 겹치지 않나',
        block: '토스트로 알리고 이메일 칸으로 포커스를 옮긴다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: '자기 계정 줄에는 정지 단추가 잠겨 있다' }],
    data: ['화면 안 운영자 시드 목록'],
    exits: ['목록으로 — 정지한 계정도 지우지 않고 상태만 글자로 바뀐다'],
  },
  {
    screen: 'users-grades',
    entries: ['사이드바 사용자 · 등급'],
    steps: [
      '기준 금액 오름차순으로 늘어선 등급을 본다',
      '추가나 수정으로 폼 모달을 연다',
      '등급명 · 기준 금액 · 적립률을 넣는다',
      '저장을 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '적립률이 0에서 100 사이인가',
        block: '적립률 칸 아래에 받는 범위를 적는다',
        blockLabel: '아니오',
      },
      {
        after: 3,
        question: '기준 금액이 다른 등급과 겹치지 않나',
        block: '토스트로 알리고 기준 금액 칸으로 포커스를 옮긴다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: '회원이 물려 있는 등급은 삭제 단추가 잠긴다' }],
    data: ['화면 안 등급 시드 목록'],
    exits: ['목록으로 — 여기 순서가 곧 혜택 크기 순서다', '고객 화면 마이페이지 · 상품 상세의 적립률로'],
  },
  {
    screen: 'products-categories',
    entries: ['사이드바 상품 · 카테고리'],
    steps: ['1Depth 를 고른다', '그 아래 2Depth 를 본다', '더하거나 순서를 바꾼다', '저장을 누른다'],
    branches: [
      {
        after: 2,
        question: '1Depth 를 먼저 골랐나',
        block: '2Depth 추가 단추가 잠긴 채로 있다',
        blockLabel: '아니오',
      },
      {
        after: 3,
        question: '같은 상위 아래 이름이 겹치지 않나',
        block: '토스트로 알리고 분류명 칸으로 포커스를 옮긴다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 2, label: '상품이 들어 있는 분류는 삭제 단추가 잠긴다' }],
    data: ['@winpilot/store · categories', '@winpilot/store · products'],
    exits: ['분류 목록으로 — 이 순서가 곧 고객 화면 헤더 메뉴 순서다'],
  },
  {
    screen: 'products',
    entries: ['사이드바 상품 · 등록', '대시보드 요약 카드에서'],
    steps: [
      '분류와 판매 상태로 거른다',
      '상품명이나 코드로 검색한다',
      '표에서 상품을 찾는다',
      '노출을 끄고 켜거나 삭제를 누른다',
    ],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 상품이 있나',
        block: '빈 상태 안내와 등록 단추를 함께 둔다',
        blockLabel: '아니오',
      },
      {
        after: 3,
        question: '확인 창에서 삭제를 다시 눌렀나',
        block: '창을 닫고 목록을 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 3, label: '숨김으로 바꾸면 고객 화면 어느 줄에도 나오지 않는다' }],
    data: ['@winpilot/store · products', '@winpilot/store · categories', '주소 질의문자열 (q·분류·상태·page)'],
    exits: ['상세로 — /products/[productId]', '등록으로 — /products/new', '목록에 머문다 — 노출만 바꾼 경우'],
  },
  // 등록 직후가 숨김이라 흐름이 목록에서 끝나지 않는다 — 노출을 켜려면 상세를 한 번 더 거친다.
  {
    screen: 'products-new',
    entries: ['상품 목록 툴바의 등록 단추'],
    steps: [
      '상품명 · 분류 · 가격을 넣는다',
      '옵션 조합을 만든다',
      '대표 이미지를 올린다',
      '적립과 배송 정책을 고른다',
      '오른쪽 미리보기로 고객 화면 모습을 본다',
      '저장을 누른다',
    ],
    branches: [
      {
        after: 1,
        question: '옵션 조합을 만들었나',
        pass: '예',
        block: '재고 칸을 열어 직접 받는다',
        blockLabel: '아니오',
      },
      {
        after: 3,
        question: '조건부 무료를 골랐나',
        pass: '예',
        block: '기준 금액 칸을 감춘다',
        blockLabel: '아니오',
      },
      {
        after: 5,
        question: '필수 항목이 다 찼고 정가가 판매가 이상인가',
        block: '토스트로 알리고 첫 번째 어긋난 칸으로 포커스를 옮긴다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 2, label: '5MB 를 넘거나 PNG · JPG · WEBP 가 아니면 올리지 않고 무엇이 걸렸는지 적는다' }],
    data: ['@winpilot/store · categories', '@winpilot/store · product-options'],
    exits: ['상품 목록으로 — 새 상품은 숨김 상태로 맨 위에 놓인다'],
  },
  {
    screen: 'products-detail',
    entries: ['상품 목록에서 행을 눌러'],
    steps: [
      '이미 넣은 값이 채워진 폼을 본다',
      '기본 정보를 고친다',
      '옵션과 재고를 조정한다',
      '노출을 끄고 켠다',
      '저장이나 취소를 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '이미 있던 조합인가',
        pass: '예',
        block: '새 조합으로 보고 재고를 0 으로 연다',
        blockLabel: '아니오',
      },
      {
        after: 4,
        question: '저장을 눌렀나',
        pass: '예',
        block: '고친 것이 있으면 버릴지 한 번 묻는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 3, label: '팔린 적이 있는 상품은 삭제 단추가 잠긴다' }],
    data: ['@winpilot/store · products', '@winpilot/store · product-options', '주소의 productId'],
    exits: ['상품 목록으로 — 고친 값은 저장하는 순간 고객 화면 상품 상세에 반영된다'],
  },
  {
    screen: 'products-sales',
    entries: ['사이드바 상품 · 판매', '대시보드 처리 대기에서'],
    steps: [
      '주문 상태로 거른다',
      '주문번호나 주문자로 검색한다',
      '보낼 주문을 골라 운송장 창을 연다',
      '택배사와 운송장 번호를 넣는다',
      '교환이나 반품을 처리한다',
    ],
    branches: [
      {
        after: 3,
        question: '번호가 숫자와 하이픈뿐인가',
        block: '번호 칸 아래에 받는 모양을 적는다',
        blockLabel: '아니오',
      },
      {
        after: 4,
        question: '확인 창에서 상태 변경을 다시 눌렀나',
        block: '창을 닫고 상태를 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 2, label: '배송이 끝난 주문은 운송장 칸이 잠겨 있다' }],
    data: ['어드민 시드 · lib/data/orders.ts', '주소 질의문자열 (q·상태·page)'],
    exits: ['판매 목록으로 — 상태가 배송중으로 바뀌고 고객 화면 주문 상세에 운송장이 뜬다'],
  },
  {
    screen: 'products-sales-detail',
    entries: ['판매 목록에서 행을 눌러'],
    steps: [
      '주문번호 · 주문일 · 상태를 확인한다',
      '산 상품과 결제 금액을 맞춰 본다',
      '받는 사람 · 주소 · 운송장을 고친다',
      '상태를 바꾼다',
    ],
    branches: [
      {
        after: 3,
        question: '확인 창에서 상태 변경을 다시 눌렀나',
        block: '창을 닫고 상태를 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '금액 칸은 읽기 전용이다 — 화면에서 바꾸면 결제된 값과 갈린다' },
      { at: 3, label: '취소된 주문은 상태 고르기가 잠겨 있다' },
    ],
    data: ['어드민 시드 · lib/data/orders.ts', '주소의 orderId'],
    exits: ['판매 목록으로 — 바뀐 상태가 고객 화면 주문 상세에 그대로 뜬다'],
  },
  // 운영자가 리뷰를 새로 쓰지 않는다 — 그래서 이 화면만 등록 흐름이 없고 나가는 길이 고객 화면이다.
  {
    screen: 'products-reviews',
    entries: ['사이드바 상품 · 리뷰'],
    steps: ['별점으로 거른다', '내용 · 작성자 · 상품명으로 검색한다', '가릴 리뷰를 고른다', '숨기기를 누른다'],
    branches: [
      {
        after: 3,
        question: '확인 창에서 숨기기를 다시 눌렀나',
        block: '창을 닫고 상태를 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 2, label: '지우는 단추가 없다 — 지우면 평균 별점만 조용히 바뀐다' }],
    data: ['@winpilot/store · reviews', '@winpilot/store · products', '주소 질의문자열 (q·별점·page)'],
    exits: [
      '목록으로 — 숨긴 리뷰는 고객 화면 리뷰 탭까지 오지 않는다',
      '고객 화면으로 — 등록 단추 자리에 리뷰를 쓰는 길을 둔다',
    ],
  },
  {
    screen: 'products-coupons',
    entries: ['사이드바 상품 · 쿠폰'],
    steps: [
      '쿠폰 목록에서 사용 가능 · 완료 · 만료를 훑는다',
      '추가나 수정으로 폼을 연다',
      '할인 방식과 할인 값을 고른다',
      '사용 기간과 최소 주문 금액을 넣는다',
      '저장을 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '정률 할인이 0에서 100 사이인가',
        block: '할인 값 칸 아래에 받는 범위를 적는다',
        blockLabel: '아니오',
      },
      {
        after: 3,
        question: '시작일이 종료일보다 앞서나',
        block: '기간 칸 아래에 순서를 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 2, label: '이미 발급된 쿠폰은 할인 값 칸이 잠겨 있다' }],
    data: ['@winpilot/store · coupons', '주소 질의문자열 (q·상태·page)'],
    exits: ['쿠폰 목록으로 — 만료된 쿠폰도 지우지 않고 남는다', '고객 화면 쿠폰함 · 결제의 쿠폰 고르기로'],
  },
  {
    screen: 'support',
    entries: ['사이드바 고객 지원', '설정에서 바꿀 수 없는 값을 만났을 때'],
    steps: [
      '답변 대기 탭에서 이미 보낸 것이 있는지 본다',
      '문의하기를 눌러 창을 연다',
      '분류를 고르고 제목과 내용을 적는다',
      '지금 장사가 멈췄으면 급함을 켠다',
      '보내기를 누른다',
    ],
    branches: [
      {
        after: 4,
        question: '제목과 내용이 다 있고 내용이 10자를 넘었나',
        block: '무엇이 비었는지 칸 밑에 적고 창을 닫지 않는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '자기 고객사의 문의만 보인다' },
      { at: 4, label: '올린 문의는 언제나 접수로 시작하고 담당은 비어 있다 — 누가 맡을지는 우리 쪽에서 정한다' },
      { at: 4, label: '보낸 뒤에는 고치거나 지우지 못한다. 우리가 읽은 글과 달라지면 서로 확인할 방법이 없다' },
    ],
    data: ['@winpilot/store · support'],
    exits: ['사내 어드민 문의 목록에 그대로 선다', '답변이 등록되면 상세 창에 뜨고 상태가 답변완료로 바뀐다'],
  },
  {
    screen: 'inquiries',
    entries: ['사이드바 문의', '대시보드 처리 대기에서'],
    steps: [
      '미답변 탭에서 시작한다',
      '제목이나 작성자로 검색한다',
      '문의를 눌러 상세 창을 연다',
      '답변을 쓴다',
      '답변 저장을 누른다',
    ],
    branches: [
      {
        after: 3,
        question: '답변이 10자를 넘었나',
        block: '답변 저장 단추가 잠긴 채로 있다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: '기본 탭이 미답변이다 — 먼저 손대야 할 것을 먼저 보여 준다' }],
    data: ['@winpilot/store · inquiries', '주소 질의문자열 (q·tab·page)'],
    exits: ['목록으로 — 상태가 답변 완료로 바뀌고 고객 화면 문의 내역에 뜬다'],
  },
  // 목록이 없는 설정 화면이라 저장한 뒤에도 돌아갈 곳이 없다 — 같은 화면에 머문다.
  {
    screen: 'inquiries-settings',
    entries: ['사이드바 문의 · 설정'],
    steps: [
      '문의 분류 목록을 본다',
      '분류를 더하거나 이름을 고친다',
      '문의 양식 위에 붙는 안내문을 쓴다',
      '미리보기로 고객 화면 모습을 본다',
      '저장을 누른다',
    ],
    branches: [
      {
        after: 1,
        question: '분류가 하나라도 남나',
        block: '마지막 분류는 지우지 못하게 막고 이유를 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 1, label: '이미 쓰이고 있는 분류는 삭제 단추가 잠긴다' }],
    data: ['@winpilot/store · inquiries'],
    exits: ['설정 화면에 머문다 — 결과만 토스트로 알린다', '고객 화면 문의하기의 분류 고르기로'],
  },
  {
    screen: 'contents-notices',
    entries: ['사이드바 콘텐츠 · 공지사항'],
    steps: ['노출 여부로 거른다', '제목으로 검색한다', '고칠 글을 고르거나 등록으로 간다', '삭제를 누르면 확인 창이 뜬다'],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 글이 있나',
        block: '빈 상태 안내와 등록 단추를 함께 둔다',
        blockLabel: '아니오',
      },
      {
        after: 3,
        question: '확인 창에서 삭제를 다시 눌렀나',
        block: '창을 닫고 목록을 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: '상단 고정 공지는 거르기와 상관없이 맨 위에 붙는다' }],
    data: ['@winpilot/store · contents', '주소 질의문자열 (q·노출·page)'],
    exits: ['등록으로 — /contents/notices/new', '상세로 — /contents/notices/[noticeId]'],
  },
  {
    screen: 'contents-notices-new',
    entries: ['공지 목록 툴바의 등록 단추'],
    steps: [
      '제목을 넣는다',
      '편집기로 본문을 쓴다',
      '대표 이미지를 올린다',
      '노출 여부를 정한다',
      '미리보기로 고객 화면 모습을 본다',
      '저장을 누른다',
    ],
    branches: [
      {
        after: 1,
        question: '제목이 2자에서 60자, 본문이 10자를 넘나',
        block: '저장 단추가 잠긴 채로 있다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 2, label: '5MB 를 넘거나 PNG · JPG · WEBP 가 아니면 올리지 않는다' }],
    data: ['@winpilot/store · contents'],
    exits: ['공지 목록으로 — 새 글은 숨김 상태로 들어간다'],
  },
  {
    screen: 'contents-notices-detail',
    entries: ['공지 목록에서 행을 눌러'],
    steps: [
      '이미 쓴 값이 채워진 폼을 본다',
      '제목과 본문을 고친다',
      '대표 이미지를 갈아 끼운다',
      '노출을 켠다',
      '저장이나 취소를 누른다',
    ],
    branches: [
      {
        after: 4,
        question: '저장을 눌렀나',
        pass: '예',
        block: '고친 것이 있으면 버릴지 한 번 묻는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 1, label: '제목이나 본문이 비면 저장 단추가 잠긴다' }],
    data: ['@winpilot/store · contents', '주소의 noticeId'],
    exits: ['공지 목록으로 — 노출을 켠 글은 고객 화면 공지사항에 바로 뜬다'],
  },
  // FAQ 만 등록·수정 화면이 따로 없다 — 목록 위 모달에서 끝난다. 글이 짧아 화면을 나눌 값이 없다.
  {
    screen: 'contents-faqs',
    entries: ['사이드바 콘텐츠 · FAQ'],
    steps: [
      '분류로 묶인 목록을 본다',
      '분류 모달에서 묶음을 손본다',
      '질문 · 답변 모달을 열어 글을 쓴다',
      '노출 여부를 정한다',
      '저장을 누른다',
    ],
    branches: [
      {
        after: 1,
        question: '이 글을 담을 분류가 있나',
        block: '분류 모달을 먼저 열어 만들게 한다',
        blockLabel: '아니오',
      },
      {
        after: 4,
        question: '질문과 답변이 다 찼나',
        block: '저장 단추가 잠긴 채로 있다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 1, label: '글이 들어 있는 분류는 삭제 단추가 잠긴다' }],
    data: ['@winpilot/store · contents', '주소 질의문자열 (q·노출·page)'],
    exits: ['같은 목록으로 — 모달만 닫히고 화면은 그대로다', '고객 화면 FAQ 로'],
  },
  {
    screen: 'contents-news',
    entries: ['사이드바 콘텐츠 · 뉴스'],
    steps: ['노출 여부로 거른다', '제목으로 검색한다', '고칠 글을 고르거나 등록으로 간다', '삭제를 누르면 확인 창이 뜬다'],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 글이 있나',
        block: '빈 상태 안내와 등록 단추를 함께 둔다',
        blockLabel: '아니오',
      },
      {
        after: 3,
        question: '확인 창에서 삭제를 다시 눌렀나',
        block: '창을 닫고 목록을 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: '상단 고정이 없어 등록 최신순 하나로만 늘어선다' }],
    data: ['@winpilot/store · contents', '주소 질의문자열 (q·노출·page)'],
    exits: ['등록으로 — /contents/news/new', '상세로 — /contents/news/[newsId]'],
  },
  {
    screen: 'contents-news-new',
    entries: ['뉴스 목록 툴바의 등록 단추'],
    steps: [
      '제목을 넣는다',
      '편집기로 본문을 쓴다',
      '목록에 보일 대표 이미지를 올린다',
      '노출 여부를 정한다',
      '미리보기로 고객 화면 모습을 본다',
      '저장을 누른다',
    ],
    branches: [
      {
        after: 1,
        question: '제목이 2자에서 60자, 본문이 10자를 넘나',
        block: '저장 단추가 잠긴 채로 있다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 2, label: '대표 이미지를 비우면 목록에서 글자만 보인다 — 막지 않는다' }],
    data: ['@winpilot/store · contents'],
    exits: ['뉴스 목록으로 — 새 글은 숨김 상태로 들어간다'],
  },
  {
    screen: 'contents-news-detail',
    entries: ['뉴스 목록에서 행을 눌러'],
    steps: [
      '이미 쓴 값이 채워진 폼을 본다',
      '제목과 본문을 고친다',
      '대표 이미지를 갈아 끼운다',
      '노출을 켠다',
      '저장이나 취소를 누른다',
    ],
    branches: [
      {
        after: 4,
        question: '저장을 눌렀나',
        pass: '예',
        block: '고친 것이 있으면 버릴지 한 번 묻는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 1, label: '제목이나 본문이 비면 저장 단추가 잠긴다' }],
    data: ['@winpilot/store · contents', '주소의 newsId'],
    exits: ['뉴스 목록으로 — 노출을 켠 글은 고객 화면 뉴스에 바로 뜬다'],
  },
  {
    screen: 'contents-portfolios',
    entries: ['사이드바 콘텐츠 · 포트폴리오'],
    steps: ['노출 여부로 거른다', '제목으로 검색한다', '고칠 글을 고르거나 등록으로 간다', '삭제를 누르면 확인 창이 뜬다'],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 글이 있나',
        block: '빈 상태 안내와 등록 단추를 함께 둔다',
        blockLabel: '아니오',
      },
      {
        after: 3,
        question: '확인 창에서 삭제를 다시 눌렀나',
        block: '창을 닫고 목록을 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 2, label: '고객 화면이 연도 탭으로 묶어 보여 주므로 등록 연도가 곧 탭이 된다' }],
    data: ['@winpilot/store · contents', '주소 질의문자열 (q·노출·page)'],
    exits: ['등록으로 — /contents/portfolios/new', '상세로 — /contents/portfolios/[portfolioId]'],
  },
  {
    screen: 'contents-portfolios-new',
    entries: ['포트폴리오 목록 툴바의 등록 단추'],
    steps: [
      '제목을 넣는다',
      '편집기로 본문을 쓴다',
      '대표 이미지를 올린다',
      '노출 여부를 정한다',
      '미리보기로 고객 화면 모습을 본다',
      '저장을 누른다',
    ],
    branches: [
      {
        after: 1,
        question: '제목이 2자에서 60자, 본문이 10자를 넘나',
        block: '저장 단추가 잠긴 채로 있다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 2, label: '5MB 를 넘거나 PNG · JPG · WEBP 가 아니면 올리지 않는다' }],
    data: ['@winpilot/store · contents'],
    exits: ['포트폴리오 목록으로 — 새 글은 숨김 상태로 들어간다'],
  },
  {
    screen: 'contents-portfolios-detail',
    entries: ['포트폴리오 목록에서 행을 눌러'],
    steps: [
      '이미 쓴 값이 채워진 폼을 본다',
      '제목과 본문을 고친다',
      '대표 이미지를 갈아 끼운다',
      '노출을 켠다',
      '저장이나 취소를 누른다',
    ],
    branches: [
      {
        after: 4,
        question: '저장을 눌렀나',
        pass: '예',
        block: '고친 것이 있으면 버릴지 한 번 묻는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 1, label: '제목이나 본문이 비면 저장 단추가 잠긴다' }],
    data: ['@winpilot/store · contents', '주소의 portfolioId'],
    exits: ['포트폴리오 목록으로 — 노출을 켠 글은 고객 화면 포트폴리오에 바로 뜬다'],
  },
  {
    screen: 'banners',
    entries: ['사이드바 배너', '보조 메뉴 메인 비주얼'],
    steps: ['노출 중인 배너를 순서대로 본다', '순서를 끌어 바꾼다', '노출 기간을 손본다', '등록이나 상세로 간다'],
    branches: [
      {
        after: 0,
        question: '오늘이 노출 기간 안인가',
        block: '지난 배너로 표시한다 — 고객 화면은 아예 받지 않는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 1, label: '여기 순서가 곧 고객 화면 히어로 넘김 순서다' }],
    data: ['@winpilot/store · banners', '주소 질의문자열 (q·page)'],
    exits: ['등록으로 — /banners/new', '상세로 — /banners/[bannerId]'],
  },
  // 이미지 비율을 통과하지 못하면 다음 단계로 못 간다 — 고객 화면 히어로에서 잘리기 때문이다.
  {
    screen: 'banners-new',
    entries: ['배너 목록 툴바의 등록 단추'],
    steps: ['배너 이미지를 올린다', '누르면 갈 앱 안의 경로를 넣는다', '노출 기간을 정한다', '미리보기로 잘림을 본다', '저장을 누른다'],
    branches: [
      {
        after: 0,
        question: '이미지가 21:9 인가',
        block: '올리지 않고 무엇이 걸렸는지 적는다',
        blockLabel: '아니오',
      },
      {
        after: 2,
        question: '시작일이 종료일보다 앞서나',
        block: '기간 칸 아래에 순서를 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 1, label: '연결 주소를 비워도 저장된다 — 누를 곳 없는 그림 배너로 나간다' }],
    data: ['@winpilot/store · banners'],
    exits: ['배너 목록으로 — 노출 기간이 오늘을 덮으면 고객 화면 홈에 바로 걸린다'],
  },
  {
    screen: 'banners-detail',
    entries: ['배너 목록에서 행을 눌러'],
    steps: ['이미 건 배너를 본다', '이미지를 갈아 끼운다', '기간과 연결 주소를 고친다', '저장하거나 삭제를 누른다'],
    branches: [
      {
        after: 3,
        question: '확인 창에서 삭제를 다시 눌렀나',
        block: '창을 닫고 배너를 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 3, label: '노출 중인 배너를 지우면 고객 화면 홈에서 바로 사라진다' }],
    data: ['@winpilot/store · banners', '주소의 bannerId'],
    exits: ['배너 목록으로 — 고친 값은 저장하는 순간 반영된다'],
  },
  {
    screen: 'banners-popups',
    entries: ['사이드바 배너 · 팝업'],
    steps: ['기간이 겹치는 팝업을 함께 본다', '겹칠 순서를 정한다', '기간을 손본다', '등록이나 상세로 간다'],
    branches: [
      {
        after: 0,
        question: '같은 기간에 팝업이 여럿인가',
        pass: '예',
        block: '한 장만 뜬다 — 순서를 정할 것이 없다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: '오늘 하루 보지 않기를 고른 사람에게는 다시 뜨지 않는다' }],
    data: ['@winpilot/store · banners', '주소 질의문자열 (q·page)'],
    exits: ['등록으로 — /banners/popups/new', '상세로 — /banners/popups/[popupId]'],
  },
  {
    screen: 'banners-popups-new',
    entries: ['팝업 목록 툴바의 등록 단추'],
    steps: ['제목을 넣는다', '편집기로 내용을 쓴다', '뜰 위치와 크기를 정한다', '노출 기간을 정한다', '저장을 누른다'],
    branches: [
      {
        after: 3,
        question: '시작일이 종료일보다 앞서나',
        block: '기간 칸 아래에 순서를 적는다',
        blockLabel: '아니오',
      },
      {
        after: 4,
        question: '제목이 2자에서 40자인가',
        block: '저장 단추가 잠긴 채로 있다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 2, label: '미리보기가 실제 뜨는 자리와 같은 위치에 그려진다' }],
    data: ['@winpilot/store · banners'],
    exits: ['팝업 목록으로 — 기간이 오늘을 덮으면 고객 화면 홈에서 바로 뜬다'],
  },
  {
    screen: 'banners-popups-detail',
    entries: ['팝업 목록에서 행을 눌러'],
    steps: ['이미 띄운 팝업을 본다', '내용과 기간을 고친다', '저장하거나 삭제를 누른다'],
    branches: [
      {
        after: 2,
        question: '확인 창에서 삭제를 다시 눌렀나',
        block: '창을 닫고 팝업을 그대로 둔다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 2, label: '노출 중인 팝업을 지우면 고객 화면에서 바로 사라진다' }],
    data: ['@winpilot/store · banners', '주소의 popupId'],
    exits: ['팝업 목록으로 — 고친 값은 저장하는 순간 반영된다'],
  },
  {
    screen: 'company-about',
    entries: ['사이드바 회사 · 소개'],
    steps: ['소개 글을 편집기로 고친다', '대표 이미지를 올린다', '미리보기로 고객 화면 자리를 맞춰 본다', '저장을 누른다'],
    branches: [
      {
        after: 1,
        question: '이미지가 16:9 인가',
        block: '올리지 않고 무엇이 걸렸는지 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 2, label: '미리보기 자리가 고객 화면과 1:1 이라 여기서 본 것이 그대로 나간다' }],
    data: ['@winpilot/store · company'],
    exits: ['같은 화면에 머문다 — 결과만 토스트로 알린다', '고객 화면 회사소개로'],
  },
  {
    screen: 'company-history',
    entries: ['사이드바 회사 · 연혁'],
    steps: ['최신 연도부터 쌓인 연혁을 본다', '항목을 더하거나 고친다', '연도와 내용을 넣는다', '저장을 누른다'],
    branches: [
      {
        after: 2,
        question: '연도가 네 자리인가',
        block: '연도 칸 아래에 받는 모양을 적는다',
        blockLabel: '아니오',
      },
      {
        after: 3,
        question: '내용이 2자에서 80자인가',
        block: '토스트로 알리고 내용 칸으로 포커스를 옮긴다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: '연도만 뜻이 있는 자리라 날짜가 아니라 네 자리 수로 받는다' }],
    data: ['@winpilot/store · company'],
    exits: ['연혁 목록으로 — 최신 연도가 맨 위, 고객 화면 연혁과 같은 순서다'],
  },
  {
    screen: 'statistics',
    entries: ['사이드바 통계', '대시보드 요약 카드에서'],
    steps: ['기간을 고른다', '방문 · 주문 · 매출을 한 차트로 훑는다', '아래 표에서 숫자로 다시 본다', '볼 갈래를 골라 세부 통계로 간다'],
    branches: [
      {
        after: 0,
        question: '고른 기간에 자료가 있나',
        block: '빈 차트 대신 자료가 없다는 한 줄을 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 1, label: '차트는 인라인 SVG 다 — 비트맵은 Figma 에서 벡터로 돌아오지 않는다' }],
    data: ['어드민 시드 · lib/data/analytics.ts', '주소 질의문자열 (기간)'],
    exits: ['기간별 흐름 · 많이 방문한 페이지 · 매출 중 하나로'],
  },
  {
    screen: 'statistics-periods',
    entries: ['사이드바 통계 · 기간별 분석', '통계 홈에서'],
    steps: ['기간을 고른다', '기간에 따른 변화를 차트로 본다', '아래 표에서 날짜별 숫자를 확인한다'],
    branches: [
      {
        after: 0,
        question: '고른 기간에 자료가 있나',
        block: '빈 차트 대신 자료가 없다는 한 줄을 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: '기본 기간은 최근 30일이고 고른 기간은 주소에 남는다' }],
    data: ['어드민 시드 · lib/data/analytics.ts', '주소 질의문자열 (기간)'],
    exits: ['통계 홈으로', '같은 화면에 머문다 — 기간만 바꿔 다시 본다'],
  },
  {
    screen: 'statistics-pages',
    entries: ['사이드바 통계 · 많이 방문한 페이지', '통계 홈에서'],
    steps: ['기간을 고른다', '어느 화면을 많이 보는지 차트로 본다', '표에서 화면별 방문 수를 읽는다'],
    branches: [
      {
        after: 0,
        question: '고른 기간에 자료가 있나',
        block: '빈 차트 대신 자료가 없다는 한 줄을 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 1, label: '고객 화면의 주소가 그대로 나온다 — 어드민 화면은 세지 않는다' }],
    data: ['어드민 시드 · lib/data/analytics.ts', '주소 질의문자열 (기간)'],
    exits: ['통계 홈으로'],
  },
  {
    screen: 'statistics-revenue',
    entries: ['사이드바 통계 · 매출', '통계 홈에서'],
    steps: ['기간을 고른다', '무엇이 얼마나 팔렸는지 차트로 본다', '표에서 상품별 매출을 읽는다'],
    branches: [
      {
        after: 0,
        question: '고른 기간에 자료가 있나',
        block: '빈 차트 대신 자료가 없다는 한 줄을 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 2, label: '상품 이름을 상품 시드에서 가져온다 — 지운 상품은 코드만 남는다' }],
    data: ['어드민 시드 · lib/data/analytics.ts', '@winpilot/store · products', '주소 질의문자열 (기간)'],
    exits: ['통계 홈으로', '상품 목록으로 — 많이 팔린 상품을 확인할 때'],
  },
  {
    screen: 'settings-supplier',
    entries: ['사이드바 설정', '보조 메뉴 공급자 정보'],
    steps: [
      '업종을 골라 예시 문구를 받는다',
      '상호 · 대표자 · 등록번호를 넣는다',
      '주소와 연락처를 넣는다',
      '미리보기로 푸터 모습을 본다',
      '저장을 누른다',
    ],
    branches: [
      {
        after: 2,
        question: '필수 항목이 다 찼나',
        block: '저장 단추가 잠긴 채로 있다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: '업종은 예시를 주기만 한다 — 고르지 않아도 저장된다' }],
    data: ['@winpilot/store · company', '어드민 시드 · lib/data/industry.ts'],
    exits: ['같은 화면에 머문다 — 결과만 토스트로 알린다', '고객 화면 푸터 · 회사소개로'],
  },
  {
    screen: 'settings-seo',
    entries: ['사이드바 설정 · SEO 정보'],
    steps: ['사이트 제목을 넣는다', '검색 결과에 보일 한 줄을 넣는다', '공유용 대표 이미지를 올린다', '저장을 누른다'],
    branches: [
      {
        after: 1,
        question: '제목이 60자, 설명이 160자 안인가',
        block: '남은 글자 수를 칸 아래에 적고 저장을 막는다',
        blockLabel: '아니오',
      },
      {
        after: 2,
        question: '이미지가 1.91:1 인가',
        block: '올리지 않고 무엇이 걸렸는지 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: '문서 화면(/docs)은 검색에 걸리지 않게 따로 막혀 있다' }],
    data: ['화면 안 SEO 시드 값'],
    exits: ['같은 화면에 머문다 — 결과만 토스트로 알린다', '고객 화면 모든 화면의 메타 정보로'],
  },
  {
    screen: 'settings-terms',
    entries: ['사이드바 설정 · 서비스 이용약관 정보'],
    steps: ['지금 시행 중인 판을 확인한다', '편집기로 본문을 고친다', '이 판이 적용될 시행일을 넣는다', '저장을 누른다'],
    branches: [
      {
        after: 2,
        question: '시행일이 YYYY-MM-DD 모양인가',
        block: '시행일 칸 아래에 받는 모양을 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: '시행일이 아직 오지 않았으면 며칠 남았는지 함께 적는다' }],
    data: ['@winpilot/store · policies'],
    exits: ['같은 화면에 머문다 — 결과만 토스트로 알린다', '고객 화면 이용약관으로 — 배포 없이 바로 바뀐다'],
  },
  {
    screen: 'settings-privacy',
    entries: ['사이드바 설정 · 개인정보 처리방침 정보'],
    steps: ['지금 시행 중인 판을 확인한다', '편집기로 본문을 고친다', '이 판이 적용될 시행일을 넣는다', '저장을 누른다'],
    branches: [
      {
        after: 2,
        question: '시행일이 YYYY-MM-DD 모양인가',
        block: '시행일 칸 아래에 받는 모양을 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 1, label: '가입 · 결제에서 링크로 열리는 글이라 본문이 비면 저장하지 못한다' }],
    data: ['@winpilot/store · policies'],
    exits: ['같은 화면에 머문다 — 결과만 토스트로 알린다', '고객 화면 개인정보 처리방침으로 — 배포 없이 바로 바뀐다'],
  },
  // 읽기만 하는 개발용 화면이라 갈림길이 없다. 비어 있는 것이 맞는 자리다.
  {
    screen: 'components',
    entries: ['주소창에 /ssot/components 를 직접 열어'],
    steps: ['쓰고 있는 컴포넌트를 이름과 함께 훑는다', '실제로 그려진 모습을 눈으로 맞춰 본다'],
    branches: [],
    exceptions: [{ at: 1, label: '보이는 것이 실제 컴포넌트다 — 그림으로 흉내 내지 않는다' }],
    data: ['없음 — 화면이 자기 컴포넌트를 그대로 그린다'],
    exits: ['어느 화면으로도 잇지 않는다 — 사이드바에 올리지 않는 개발 도구다'],
  },
  {
    screen: 'result',
    entries: ['되돌릴 수 없는 일을 마치고', '처리가 실패했을 때'],
    steps: ['아이콘으로 성공인지 실패인지 가른다', '무엇이 끝났는지 문구를 읽는다', '돌아갈 곳을 고른다'],
    branches: [
      {
        after: 0,
        question: 'state 가 done 인가',
        block: '실패 아이콘과 문구로 바꿔 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 2, label: 'kind 가 없으면 저장으로 보고 목록으로 가는 길만 준다' }],
    data: ['주소 질의문자열 (state·kind·id)'],
    exits: ['kind 가 가리키는 목록으로', '대시보드로 — 돌아갈 목록이 정해지지 않았을 때'],
  },
];

/**
 * 운영자 여정 — **화면 하나로는 안 끝나는 일**을 갈래로 묶은 것.
 *
 * 어드민의 화면별 흐름은 목록에서 시작해 목록으로 돌아오는 짧은 고리라, 그것만 보면
 * "상품 하나를 실제로 파는 데까지 무엇을 거치는가" 가 보이지 않는다. 그래서 여기 `steps` 는
 * 화면 안 동작이 아니라 **화면 이름**으로 적는다.
 */
export const JOURNEYS: NamedFlow[] = [
  {
    id: 'launch',
    title: '상품 올리기',
    purpose: '팔 것을 서랍에 넣고 값을 채워 고객 화면에 내보낸다.',
    entries: ['사이드바 상품'],
    steps: ['카테고리에서 넣을 서랍을 만든다', '상품 목록에서 등록으로 간다', '상품 등록에서 값을 채운다', '상품 상세에서 노출을 켠다', '상품 목록에서 켜진 것을 확인한다'],
    branches: [
      {
        after: 0,
        question: '넣을 분류가 이미 있나',
        block: '카테고리에서 1Depth 부터 만든다',
        blockLabel: '아니오',
      },
      {
        after: 2,
        question: '값을 다 채웠나',
        block: '상품 등록에 머물며 빈 칸을 채운다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 3, label: '등록 직후는 숨김이라 상세를 한 번 거쳐야 고객 화면에 뜬다' }],
    data: ['@winpilot/store · categories', '@winpilot/store · products', '@winpilot/store · product-options'],
    exits: ['고객 화면 상품 목록 · 상품 상세에 새 상품이 나타난다'],
  },
  {
    id: 'fulfill',
    title: '주문 처리',
    purpose: '들어온 주문을 확인하고 보내고 끝을 낸다.',
    entries: ['대시보드 처리 대기', '사이드바 상품 · 판매'],
    steps: ['판매 목록에서 오늘 볼 주문을 거른다', '판매 상세에서 산 것과 금액을 맞춘다', '판매 목록에서 운송장을 넣는다', '교환이나 반품을 처리한다'],
    branches: [
      {
        after: 1,
        question: '보낼 수 있는 주문인가',
        block: '판매 상세에서 상태만 바꾸고 끝낸다',
        blockLabel: '아니오',
      },
      {
        after: 2,
        question: '운송장 번호 모양이 맞나',
        block: '판매 목록에 머물며 번호를 고친다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 3, label: '되돌릴 수 없는 상태 변화 앞에서는 확인 창이 한 번 뜬다' }],
    data: ['어드민 시드 · lib/data/orders.ts', '@winpilot/store · products'],
    exits: ['고객 화면 주문 내역 · 주문 상세에 운송장과 상태가 뜬다'],
  },
  {
    id: 'answer',
    title: '문의 응대',
    purpose: '쌓인 문의를 비우고 다시 묻지 않게 만든다.',
    entries: ['대시보드 처리 대기', '사이드바 문의'],
    steps: ['문의 목록의 미답변 탭을 연다', '상세 창에서 답변을 쓴다', 'FAQ 에 같은 질문을 옮겨 적는다', '문의 설정에서 분류를 손본다'],
    branches: [
      {
        after: 1,
        question: '같은 질문이 되풀이되나',
        pass: '예',
        block: '문의 목록으로 돌아가 다음 건을 연다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 3, label: '분류를 늘리면 고객 화면 문의하기의 고르는 목록도 함께 늘어난다' }],
    data: ['@winpilot/store · inquiries', '@winpilot/store · contents'],
    exits: ['고객 화면 문의 내역에 답변이 뜨고 FAQ 에 같은 질문이 생긴다'],
  },
  {
    id: 'publish',
    title: '콘텐츠 발행',
    purpose: '알릴 것을 쓰고 다 쓴 뒤에 켠다.',
    entries: ['사이드바 콘텐츠'],
    steps: ['공지 · 뉴스 · 포트폴리오 중 갈래를 고른다', '목록에서 등록으로 간다', '등록 화면에서 제목과 본문을 쓴다', '상세에서 노출을 켠다'],
    branches: [
      {
        after: 0,
        question: 'FAQ 인가',
        pass: '예',
        block: '목록 · 등록 · 상세 세 화면을 차례로 거친다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: 'FAQ 만 등록 · 수정이 목록 위 모달에서 끝난다' }],
    data: ['@winpilot/store · contents'],
    exits: ['고객 화면 공지사항 · 뉴스 · 포트폴리오 · FAQ 에 글이 나타난다'],
  },
  {
    id: 'swap',
    title: '배너 교체',
    purpose: '홈 맨 위에 걸린 그림을 갈아 끼운다.',
    entries: ['사이드바 배너'],
    steps: ['배너 목록에서 지금 걸린 것을 본다', '배너 등록에서 새 그림을 올린다', '배너 상세에서 지난 배너의 기간을 닫는다', '팝업 목록에서 같이 뜰 것을 정리한다'],
    branches: [
      {
        after: 1,
        question: '이미지 비율이 맞나',
        block: '배너 등록에 머물며 그림을 다시 만든다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 2, label: '노출 중인 배너를 지우면 고객 화면 홈에서 바로 사라진다' }],
    data: ['@winpilot/store · banners'],
    exits: ['고객 화면 홈의 히어로 배너와 팝업이 바뀐다'],
  },
];

/**
 * 어디서든 같은 흐름 — 화면마다 되풀이해 적지 않는다.
 *
 * 43개 흐름에 내비게이션 · 모달 · 오류를 다 적으면 화면마다 같은 세 줄이 붙어 정작 그 화면만의
 * 것이 묻힌다. 여기 한 번 적고 화면 쪽에서는 **다를 때만** 적는다.
 */
export const COMMON_FLOWS: NamedFlow[] = [
  {
    id: 'navigation',
    title: '내비게이션',
    purpose: '어느 화면에서든 같은 차례로 원하는 것을 찾아 들어간다.',
    entries: ['어느 화면에서든'],
    steps: ['사이드바에서 최상위 갈래를 고른다', '본문 왼쪽 보조 메뉴에서 그 갈래의 세부를 고른다', '목록에서 검색 · 필터로 좁힌다', '행을 눌러 상세로 들어간다'],
    branches: [
      {
        after: 0,
        question: '그 갈래에 세부가 여럿인가',
        pass: '예',
        block: '보조 메뉴 없이 바로 목록을 연다',
        blockLabel: '아니오',
      },
      {
        after: 2,
        question: '조건에 맞는 것이 있나',
        block: '빈 상태 안내를 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: '사이드바는 최상위만 편다 — 세부까지 펴면 자원이 늘수록 무너진다' }],
    data: ['주소 질의문자열 (q·필터·page)'],
    exits: ['상세로 — 돌아오면 검색 · 필터 · 쪽이 그대로 살아 있다'],
  },
  {
    id: 'modal',
    title: '모달',
    purpose: '화면을 떠나지 않고 한 가지만 묻거나 고치게 한다.',
    entries: ['목록의 추가 · 수정 단추', '되돌릴 수 없는 일을 누를 때'],
    steps: ['모달이 뜨고 바깥이 어두워진다', '폼 모달이면 값을 고친다', '확인 모달이면 무엇이 사라지는지 읽는다', '주 단추를 눌러 끝낸다'],
    branches: [
      {
        after: 3,
        question: '주 단추를 눌렀나',
        pass: '예',
        block: 'ESC 나 바깥 누름으로 닫고 아무것도 바꾸지 않는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 1, label: '고친 것이 있는 폼 모달은 닫기 전에 버릴지 한 번 더 묻는다' }],
    data: ['모달을 연 화면이 이미 들고 있는 값'],
    exits: ['모달만 닫히고 뒤 화면은 그대로다 — 결과는 하단 정중앙 토스트로 알린다'],
  },
  {
    id: 'error',
    title: '오류',
    purpose: '막혔을 때 어디서 막혔는지와 돌아갈 길을 함께 준다.',
    entries: ['없는 주소를 열었을 때', '처리 도중 예외가 났을 때', '되돌릴 수 없는 동작이 실패했을 때'],
    steps: ['무엇이 막혔는지 한 줄로 알린다', '404 · 오류 · 처리 결과 중 맞는 화면을 그린다', '돌아갈 길을 고른다'],
    branches: [
      {
        after: 0,
        question: '주소 자체가 없는가',
        pass: '예',
        block: '오류 화면이나 /result?state=failed 로 간다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 1, label: '세 화면 모두 같은 StatusScreen 을 쓴다 — 문구와 아이콘만 갈린다' }],
    data: ['주소 질의문자열 (state·kind·id)'],
    exits: ['대시보드로', '방금 있던 목록으로'],
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
