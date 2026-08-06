// `@/` 별칭 대신 상대 경로를 쓴다 — 이 모듈은 Next 밖(문서 생성 스크립트)에서도 읽힌다.
import { pages } from '../pages.manifest';

/**
 * 화면별 흐름 — 사내 어드민.
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
 * ## 고객사 배포 연동
 * 이 콘솔이 정하는 값은 **고객사의 배포**에 반영된다. 그래서 흐름의 끝(`exits`)에 그 저장이
 * 밖으로 나가는 저장인지를 함께 적는다. 다만 이 프로젝트에는 **서버가 없다** — `data` 에는
 * 실제로 있는 것(앱 안의 시드 `lib/data/*`, 주소 질의문자열)만 적는다.
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
    entries: ['주소창에 / 를 열어', '사이드바 대시보드'],
    steps: [
      '요약 카드로 오늘 수치를 훑는다',
      '유지보수 확인 필요에서 먼저 손댈 고객사를 고른다',
      '연체 · 답하지 않은 문의를 확인한다',
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
    data: ['lib/data/tenants.ts', 'lib/data/invoices.ts', 'lib/data/inquiries.ts'],
    exits: ['수치를 만든 조건이 그대로 걸린 목록으로'],
  },
  {
    screen: 'tenants',
    entries: ['사이드바 고객사', '보조 메뉴 고객', '대시보드 고객사 카드'],
    steps: [
      '만료가 가까운 순으로 정렬된 목록을 본다',
      '고객사명 · 담당자 · 도메인으로 검색한다',
      '플랜으로 거른다',
      '행을 눌러 상세로 들어간다',
      '등록을 눌러 새 고객사를 만든다',
    ],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 고객사가 있나',
        block: '빈 상태 안내를 대신 그린다',
        blockLabel: '아니오',
      },
      {
        after: 4,
        question: '고객사명과 담당자를 다 넣었나',
        block: '무엇이 비었는지 알리고 모달을 닫지 않는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: '만료 · 만료 임박인 고객사가 목록 맨 위로 올라온다' }],
    data: ['lib/data/tenants.ts'],
    exits: ['고객사 상세로', '그 고객사의 OAuth 설정으로', '목록에 새 줄이 생긴다'],
  },
  {
    screen: 'tenants-pipeline',
    entries: ['보조 메뉴 파이프라인'],
    steps: [
      '진행 중인 건과 예상 금액을 먼저 본다',
      '이름 · 건 번호 · 플랜으로 검색하고 사내 담당으로 거른다',
      '단계별 칸에서 카드를 읽는다',
      '카드의 단추로 앞이나 뒤 단계로 옮긴다',
      '등록을 눌러 새 건을 만든다',
    ],
    branches: [
      {
        after: 3,
        question: '옮길 단계가 있나',
        block: '단추를 잠근 채로 둔다 — 문의의 앞과 운영의 뒤에는 갈 곳이 없다',
        blockLabel: '아니오',
      },
      {
        after: 4,
        question: '이름과 예상 금액을 다 넣었나',
        block: '무엇이 비었는지 알리고 모달을 닫지 않는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '끌어 옮기기가 없다 — 되돌리기 없는 끌기는 실수했을 때 되돌릴 길이 없다' },
      { at: 2, label: '운영 칸의 카드만 고객사 상세로 이어진다. 나머지는 아직 고객사가 아니다' },
      { at: 4, label: '새 건은 언제나 문의 단계에서 시작한다 — 중간부터 넣으면 어디서 들어왔는지가 남지 않는다' },
    ],
    data: ['lib/data/pipeline.ts', 'lib/data/settings.ts'],
    exits: ['운영 단계로 옮기면 고객 목록에서 보인다', '고객사 상세로'],
  },
  {
    screen: 'tenants-activities',
    entries: ['보조 메뉴 활동', '고객사 상세의 활동 묶음'],
    steps: [
      '다음에 하기로 한 것이 몇 건 남았는지 본다',
      '상대 · 내용 · 담당으로 검색하고 종류 · 고객사로 거른다',
      '최신순 목록을 훑는다',
      '줄을 눌러 활동 내용 전문과 다음에 할 것을 읽는다',
      '활동 기록을 눌러 새로 남긴다',
    ],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 활동이 있나',
        block: '빈 상태 안내를 대신 그린다',
        blockLabel: '아니오',
      },
      {
        after: 4,
        question: '무엇을 했는지와 상대를 다 적었나',
        block: '무엇이 비었는지 알리고 창을 닫지 않는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '아직 고객사가 아닌 파이프라인 건의 활동은 링크 대신 파이프라인 표시가 붙는다' },
      { at: 2, label: '다음에 할 것이 남은 기록에는 후속 표시가 붙는다 — 창에 들어가야만 보이면 목록에서 셀 수 없다' },
      { at: 3, label: '창에서 일시와 고객사는 바꾸지 않는다 — 파이프라인 건의 활동에는 고객사 코드가 없다' },
    ],
    data: ['lib/data/activities.ts', 'lib/data/tenants.ts', 'lib/data/settings.ts'],
    exits: ['목록 맨 위에 새 기록이 쌓인다', '고친 값이 그 줄에 반영된다', '고객사 상세로'],
  },
  {
    screen: 'tenants-contacts',
    entries: ['보조 메뉴 담당자', '고객사 상세의 담당자 묶음'],
    steps: [
      '역할이 무엇을 뜻하는지 먼저 읽는다',
      '이름 · 직함 · 이메일 · 고객사로 검색하고 역할로 거른다',
      '대표가 없는 고객사가 있는지 확인한다',
      '등록을 눌러 담당자를 더한다',
    ],
    branches: [
      {
        after: 3,
        question: '이름 · 직함 · 이메일 모양이 다 맞나',
        block: '무엇이 틀렸는지 알리고 모달을 닫지 않는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '목록에서는 연락처 가운데 자리를 가린다. 상세는 사내 전용이라 그대로 둔다' },
      { at: 3, label: '새 담당자는 대표로 두지 않는다 — 고객사마다 대표는 하나여야 한다' },
    ],
    data: ['lib/data/contacts.ts', 'lib/data/tenants.ts'],
    exits: ['목록에 새 줄이 생기고 고객사 상세에도 함께 나타난다'],
  },
  {
    screen: 'tenants-churned',
    entries: ['보조 메뉴 이탈'],
    steps: ['재계약 가능한 곳이 몇 곳인지 먼저 본다', '이탈 사유로 거른다', '떠난 날짜 최신순으로 훑는다'],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 이탈 고객사가 있나',
        block: '빈 상태 안내를 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: '등록 단추가 없다 — 이탈은 만드는 것이 아니라 계약이 끝나서 생기는 결과다' }],
    data: ['lib/data/churn.ts'],
    exits: ['이어지는 다음 화면이 없다 — 읽고 다음 계약의 조건에 쓴다'],
  },
  {
    screen: 'tenants-detail',
    entries: ['고객사 목록에서 행을 눌러', '대시보드 유지보수 확인 필요에서'],
    steps: [
      '고객사 정보 · 배포 · 청구 내역을 한 화면에서 읽는다',
      '그 고객사의 담당자와 활동을 이어서 읽는다',
      '유지보수 상태를 확인한다',
      '연동 설정으로 넘어간다',
    ],
    branches: [
      {
        after: 0,
        question: '그 코드의 고객사가 있나',
        block: '404 화면으로 보낸다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '아직 붙이지 않은 배포는 빈 칸이 아니라 그렇게 적는다' },
      { at: 1, label: '담당자와 활동을 여기에도 붙인다 — 목록으로 나갔다 돌아오면 어디까지 읽었는지를 다시 찾는다' },
    ],
    data: [
      'lib/data/tenants.ts',
      'lib/data/invoices.ts',
      'lib/data/contacts.ts',
      'lib/data/activities.ts',
    ],
    exits: ['그 고객사의 PG 설정으로', '그 고객사의 OAuth 설정으로', '담당자 · 활동 전체 목록으로', '고객사 목록으로'],
  },
  {
    screen: 'subscriptions-plans',
    entries: ['사이드바 구독', '보조 메뉴 플랜'],
    steps: [
      'B2C · B2B · IR 중 파는 것을 고른다',
      '등급 카드에서 금액 · 배포 수 · 회원 상한을 읽는다',
      '아래 비교표에서 어느 등급부터 열리는 기능인지 한 줄로 읽는다',
      '어드민과 웹페이지를 갈라 본다',
    ],
    branches: [
      {
        after: 0,
        question: '그 도메인의 기능이 정해져 있나',
        block: '빈 표 대신 기능 미정이라고 적는다 — 빈 표는 기능이 없는 것으로 읽힌다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 1, label: '판매를 멈춘 플랜도 숨기지 않는다 — 쓰던 고객사의 계약서에 그 이름이 있다' }],
    data: ['lib/data/subscriptions.ts', 'lib/data/plan-features.ts'],
    exits: ['그 등급이 무엇을 여는지 읽고 계약 자리에서 그대로 쓴다', '직원 한 명이 그 화면에서 무엇을 하는지는 권한 화면에서 정한다'],
  },
  {
    screen: 'subscriptions-roles',
    entries: ['보조 메뉴 권한', '플랜 화면에서 그 등급이 무엇을 여는지 본 뒤'],
    steps: [
      'B2C · B2B · IR 중 이야기 중인 도메인을 고른다',
      '역할마다 맡기는 자리와 여는 권한 수를 읽는다',
      '줄을 눌러 그 역할의 세부 권한으로 들어간다',
    ],
    branches: [
      {
        after: 1,
        question: '고정 역할인가',
        block: '상세에서 칸이 잠긴 채로 열린다',
        blockLabel: '예',
      },
    ],
    exceptions: [
      { at: 0, label: '도메인마다 자원이 다르다 — 한 목록에 섞으면 IR 이야기 자리에 환불이 함께 뜬다' },
      { at: 1, label: '등록 단추가 없다 — 역할은 우리가 정한 템플릿이다' },
    ],
    data: ['packages/store/src/permissions.ts'],
    exits: ['그 역할의 세부 권한 화면으로'],
  },
  {
    screen: 'subscriptions-roles-detail',
    entries: ['권한 목록에서 줄을 눌러', '권한 목록의 관리 · 세부 권한을 눌러'],
    steps: [
      '갈래별로 묶인 자원을 훑는다',
      '자원마다 조회 · 등록 · 삭제 · 설정 변경을 켜고 끈다',
      '오른쪽에서 여는 권한 수가 몇으로 바뀌었는지 본다',
      '저장한다',
    ],
    branches: [
      {
        after: 3,
        question: '조회 없이 다른 동작만 켠 자원이 있나',
        block: '어느 자원이 걸렸는지 알리고 저장하지 않는다',
        blockLabel: '예',
      },
    ],
    exceptions: [
      { at: 0, label: '그 자원에 없는 동작은 자리 자체를 비운다 — 눌리지 않는 칸을 두면 왜 못 누르는지를 찾게 된다' },
      { at: 1, label: '고정 역할은 잠긴다. 한 칸이라도 끄면 권한을 되돌릴 사람이 아무도 남지 않는 순간이 생긴다' },
      { at: 3, label: '칸을 켤 때마다 저장하지 않는다 — 되돌릴 자리가 없어진다' },
    ],
    data: ['packages/store/src/permissions.ts'],
    exits: ['권한 목록으로 돌아간다'],
  },
  {
    screen: 'inquiries',
    entries: ['사이드바 문의', '대시보드 답하지 않은 문의 줄'],
    steps: [
      '급한 것부터 오는 목록을 훑는다',
      '상태 · 고객사로 거른다',
      '줄을 눌러 창을 연다',
      '담당과 상태를 정하고 답변을 쓴다',
      '저장한다',
    ],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 문의가 있나',
        block: '빈 상태 안내를 대신 그린다',
        blockLabel: '아니오',
      },
      {
        after: 4,
        question: '답변완료로 옮기는데 답변이 비었나',
        block: '무엇이 비었는지 알리고 창을 닫지 않는다',
        blockLabel: '예',
      },
    ],
    exceptions: [
      { at: 0, label: '등록 단추가 없다 — 문의는 고객사가 보내는 것이라 우리가 만들 자리가 아니다' },
      { at: 2, label: '줄 아래를 펼치지 않는다 — 펼치면 줄 높이가 그때그때 바뀌어 다음 줄을 누르려던 손이 빗나간다' },
      { at: 3, label: '아직 답하지 않은 상태(접수·처리중·보류)로 두는 동안에는 답이 비어 있어도 막지 않는다' },
    ],
    data: ['lib/data/inquiries.ts', 'lib/data/tenants.ts', 'lib/data/settings.ts'],
    exits: ['목록의 상태와 담당이 함께 바뀐다'],
  },
  {
    screen: 'integrations-pg',
    entries: ['사이드바 연동', '보조 메뉴 PG', '고객사 상세의 연동 설정'],
    steps: [
      '고객사 목록에서 아직 테스트인 곳을 찾는다',
      '줄을 눌러 그 고객사의 설정을 연다',
      '대행사를 고르고 그 대행사가 요구하는 값을 넣는다',
      '결제 수단을 고른다',
      '운영 모드를 고른다',
      '저장을 누른다',
    ],
    branches: [
      {
        after: 4,
        question: '상점 ID · 비밀 키가 있고 결제 수단이 하나 이상인가',
        block: '무엇이 비었는지 토스트로 알리고 저장하지 않는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '고객사를 바꾸면 그 고객사의 값으로 다시 시작한다 — 앞 고객사의 키가 남지 않게' },
      { at: 3, label: '실결제를 켜면 그 자리에서 붉은 경고가 뜬다 — 고객의 카드에서 실제로 돈이 빠진다' },
    ],
    data: ['lib/data/integrations.ts', 'lib/data/tenants.ts', '주소 질의문자열 (tenant)'],
    exits: ['고객사 배포의 결제 화면이 이 설정으로 돈다'],
  },
  {
    screen: 'integrations-oauth',
    entries: ['보조 메뉴 OAuth', '고객사 목록의 연동 단추', '고객사 상세의 연동 설정'],
    steps: [
      '고객사 목록에서 로그인이 아직 안 열린 곳을 찾는다',
      '줄을 눌러 그 고객사의 제공자 목록을 연다',
      '넉 줄 목록에서 켜진 제공자와 채운 값 수를 훑는다',
      '설정을 눌러 그 제공자의 창을 연다',
      '콘솔에 적힌 이름 그대로인 칸에 값을 넣고 리다이렉트 주소를 확인한다',
      '그 제공자만 저장한다',
    ],
    branches: [
      {
        after: 4,
        question: '켜 둔 제공자의 필수 값이 다 들어 있나',
        block: '어느 칸이 비었는지 창 안에 붉게 적고 저장하지 않는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '고객사를 바꾸면 그 고객사의 값으로 다시 시작한다' },
      { at: 1, label: '값이 덜 찬 제공자를 켜면 그 자리에서 창이 열린다 — 켜 두기만 하면 고객이 눌러 봐야 오류가 드러난다' },
      { at: 3, label: '리다이렉트 주소는 고객사 도메인에서 만들어진다 — 손으로 고칠 수 없다' },
      { at: 4, label: '저장이 제공자마다 따로다 — 애플 키가 아직 없어도 카카오는 저장된다' },
    ],
    data: ['lib/data/oauth-providers.ts', 'lib/data/integrations.ts', 'lib/data/tenants.ts', '주소 질의문자열 (tenant)'],
    exits: ['고객사 배포의 소셜 로그인이 이 설정으로 돈다'],
  },
  {
    screen: 'integrations-plugin',
    entries: ['보조 메뉴 Plugin', '고객사 상세의 연동 설정'],
    steps: [
      '고객사 목록에서 무엇이 켜져 있는지 훑는다',
      '줄을 눌러 그 고객사의 조각 목록을 연다',
      '얹을 조각을 켠다',
      '키가 필요한 조각에 값을 넣는다',
      '저장을 누른다',
    ],
    branches: [
      {
        after: 4,
        question: '켜 둔 조각에 키가 다 들어 있나',
        block: '어느 조각이 비었는지 토스트로 알리고 저장하지 않는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '보이지 않는 조각을 켜 두면 아래에 몇 개인지 따로 알린다 — 켠 사실을 잊기 쉬운 쪽이다' },
    ],
    data: ['lib/data/integrations.ts', 'lib/data/tenants.ts', '주소 질의문자열 (tenant)'],
    exits: ['고객사 배포에서 그 조각이 바로 돈다'],
  },
  {
    screen: 'integrations-dns',
    entries: ['보조 메뉴 DNS / SSL', '고객사 상세의 연동 설정'],
    steps: [
      '고객사 목록에서 레코드가 빠졌거나 인증서가 급한 곳을 찾는다',
      '줄을 눌러 그 고객사의 설정을 연다',
      '인증서 만료일과 자동 갱신 상태를 먼저 본다',
      '갱신을 막는 레코드가 있으면 그 줄로 들어간다',
      '갈래별로 넣어야 할 레코드를 읽는다',
      '값을 고객사 담당자에게 넘긴다',
      '다시 확인을 누른다',
    ],
    branches: [
      {
        after: 3,
        question: '모든 레코드가 확인됐나',
        block: '불일치한 레코드를 붉게 표시하고 무엇이 막히는지 아래에 적는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 2, label: '저장 단추가 없다 — 등록은 고객사가 자기 도메인 관리 화면에서 한다' },
      { at: 3, label: '전파에 최대 48시간이 걸려 확인 중 상태가 한동안 남는다' },
    ],
    data: ['lib/data/integrations.ts', 'lib/data/tenants.ts', '주소 질의문자열 (tenant)'],
    exits: ['고객사 도메인이 우리 배포를 가리키게 된다'],
  },
  {
    screen: 'statistics-revenue',
    entries: ['사이드바 통계', '보조 메뉴 매출'],
    steps: [
      '최근 12개월 합계와 앞 달 대비 증감을 본다',
      '달별 막대에서 흐름을 훑는다',
      '무엇으로 · 어디서 버는지를 나눠 본다',
      '표에서 정확한 숫자를 옮겨 적는다',
    ],
    branches: [],
    exceptions: [{ at: 1, label: '막대의 바닥은 언제나 0 이다 — 최솟값을 바닥으로 잡으면 없는 추세를 읽는다' }],
    data: ['lib/data/statistics.ts', 'lib/data/tenants.ts'],
    exits: ['이어지는 다음 화면이 없다 — 읽고 계약과 가격에 쓴다'],
  },
  {
    screen: 'statistics-members',
    entries: ['보조 메뉴 회원'],
    steps: [
      '누적 회원과 이번 달 가입을 본다',
      '달별 막대에서 흐름을 훑는다',
      '고객사별로 플랜 상한에 얼마나 가까운지 본다',
    ],
    branches: [
      {
        after: 2,
        question: '상한의 90% 를 넘긴 고객사가 있나',
        pass: '예',
        block: '막대를 그대로 두고 아무것도 알리지 않는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 2, label: '상한을 넘기면 고객사 사이트에서 새 가입이 막힌다 — 넘긴 뒤에 알면 늦다' }],
    data: ['lib/data/statistics.ts', 'lib/data/tenants.ts'],
    exits: ['플랜을 올려야 하는 고객사를 알아낸다'],
  },
  {
    screen: 'billing-due',
    entries: ['사이드바 결제', '보조 메뉴 예정일', '대시보드 미수금 카드'],
    steps: [
      '기한이 가까운 순으로 오는 목록을 본다',
      '항목 · 고객사로 거른다',
      '7일 안으로 들어온 것을 확인한다',
      '등록을 눌러 새 청구를 만든다',
      '고객사를 고르면 그 고객사의 등급에서 금액 · 제목 · 기한이 따라 붙는다',
    ],
    branches: [
      {
        after: 4,
        question: '제목 · 금액 · 기한이 모두 맞나',
        block: '무엇이 틀렸는지 토스트로 알리고 모달을 닫지 않는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '견적도 함께 보여 준다 — 곧 확정될 돈이라 예정에서 빠지면 다른 화면을 함께 열게 된다' },
      { at: 3, label: '지난 기한으로는 만들 수 없다 — 만들자마자 연체 목록으로 사라진다' },
      { at: 4, label: '등급 칸은 유지보수일 때만 뜬다 — 구축·추가 개발·호스팅은 등급과 무관한 금액이다' },
      { at: 4, label: '손으로 고친 칸은 등급을 바꿔도 덮지 않는다. 이번 달만 깎아 주기로 한 협의가 지워지지 않게' },
    ],
    data: ['lib/data/invoices.ts', 'lib/data/tenants.ts', 'lib/data/subscriptions.ts'],
    exits: ['새 청구가 견적 상태로 목록에 생긴다 — 금액은 그 고객사 등급의 월 구독료다'],
  },
  {
    screen: 'billing-overdue',
    entries: ['보조 메뉴 연체', '대시보드 연체 카드'],
    steps: ['연체 금액과 60일 초과 건수를 먼저 본다', '구간으로 거른다', '오래된 것부터 손댈 순서를 정한다'],
    branches: [
      {
        after: 1,
        question: '조건에 맞는 연체 건이 있나',
        block: '빈 상태 안내를 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '상태가 연체로 적혀 있지 않아도 기한이 지나면 여기로 온다' },
      { at: 2, label: '등록 단추가 없다 — 새 청구는 예정일에서 만든다' },
    ],
    data: ['lib/data/invoices.ts', 'lib/data/tenants.ts'],
    exits: ['담당자에게 알리거나 계약을 다시 본다'],
  },
  {
    screen: 'settings-staff',
    entries: ['사이드바 설정', '보조 메뉴 관리자'],
    steps: [
      '직급이 무엇을 여는지 먼저 읽는다',
      '이름 · 계정 · 소속으로 검색한다',
      '직급으로 거른다',
      '등록을 눌러 새 계정을 만든다',
    ],
    branches: [
      {
        after: 3,
        question: '이름 · 소속 · 이메일 모양이 다 맞나',
        block: '무엇이 틀렸는지 토스트로 알리고 모달을 닫지 않는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 3, label: '새 계정은 언제나 조회로 시작한다 — 처음부터 되돌릴 수 없는 일까지 열어 주지 않는다' },
      { at: 1, label: '중지한 계정도 목록에 남는다 — 지난 기록에 이름이 남아 있다' },
    ],
    data: ['lib/data/settings.ts', 'lib/data/tenants.ts'],
    exits: ['새 계정이 조회 직급으로 목록에 생긴다'],
  },
  {
    screen: 'settings-notifications',
    entries: ['보조 메뉴 알림'],
    steps: [
      '켜 둔 규칙과 보내지 않는 규칙 수를 본다',
      '규칙을 켜고 끈다',
      '알릴 시점 · 보내는 곳 · 받는 사람을 고친다',
      '저장을 누른다',
    ],
    branches: [
      {
        after: 3,
        question: '켜 둔 규칙에 알릴 시점이 숫자로 들어 있나',
        block: '숫자로 넣어 달라고 알리고 저장하지 않는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 1, label: '규칙을 지우지 않고 끈다 — 지우면 그런 신호가 있다는 사실 자체가 화면에서 사라진다' },
      { at: 2, label: '보내는 곳을 알림 없음으로 두면 켜져 있어도 아무 데도 가지 않는다' },
    ],
    data: ['lib/data/settings.ts'],
    exits: ['통계 · 결제가 만들어 내는 신호가 정한 곳으로 간다'],
  },
  {
    screen: 'settings-codes',
    entries: ['보조 메뉴 기준 값'],
    steps: [
      '목록마다 어느 화면이 읽는지 확인한다',
      '값을 더하거나 뺀다',
      '등록을 눌러 새 목록을 만든다',
    ],
    branches: [
      {
        after: 1,
        question: '더하려는 값이 이미 있나',
        pass: '아니오',
        block: '이미 있는 값이라고 알리고 더하지 않는다',
        blockLabel: '예',
      },
    ],
    exceptions: [
      { at: 1, label: '잠긴 목록은 값을 늘릴 수 없다 — 화면이 값마다 다르게 그려서 화면을 함께 고쳐야 한다' },
    ],
    data: ['lib/data/settings.ts'],
    exits: ['이 목록을 읽는 화면들이 함께 바뀐다'],
  },
  {
    screen: 'result',
    entries: ['되돌릴 수 없는 일을 마쳤을 때', '주소로 바로 (/result?state=…)'],
    steps: ['무엇이 끝났는지 읽는다', '처리 번호를 확인한다', '돌아갈 곳을 고른다'],
    branches: [
      {
        after: 0,
        question: 'state 가 failed 인가',
        pass: '예',
        block: '완료 문구와 초록 표시를 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: '메뉴에 없는 화면이라 사이드바에서 켜지는 항목이 없다' }],
    data: ['주소 질의문자열 (state·kind·id)'],
    exits: ['방금 있던 목록으로', '대시보드로'],
  },
];

/**
 * 여정 — 화면 하나가 아니라 **한 사람이 하는 일 하나**를 따라간다.
 *
 * 단계는 화면 이름으로만 적는다. 화면 안에서 무엇을 밟는지는 그 화면의 흐름에 이미 있고,
 * 여기까지 적으면 같은 것이 두 벌이 된다.
 */
export const JOURNEYS: NamedFlow[] = [
  {
    id: 'onboard',
    title: '고객사 붙이기',
    purpose: '계약을 딴 뒤 고객사의 배포가 돌기까지.',
    entries: ['파이프라인에 건이 들어왔을 때'],
    steps: [
      '고객사 · 파이프라인에서 문의 → 상담 → 계약으로 옮긴다',
      '고객사 · 활동에 오간 이야기를 남긴다',
      '고객사 · 담당자에 결제 · 기술 담당을 나눠 적는다',
      '고객사 목록에서 등록한다',
      '구독 · 플랜에서 무엇을 팔았는지 맞춘다',
      '연동 · DNS 에서 도메인을 가리키게 한다',
      '연동 · OAuth 와 PG 에서 로그인과 결제를 붙인다',
      '연동 · Plugin 에서 얹을 조각을 켠다',
    ],
    branches: [
      {
        after: 5,
        question: '레코드가 모두 확인됐나',
        block: '값을 다시 넘기고 전파를 기다린다 — 최대 48시간',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '파이프라인의 운영 단계가 곧 고객 목록이다 — 옮기면 두 화면에 함께 나타난다' },
      { at: 3, label: '계약 시점에는 도메인이 정해지지 않아 배포 칸이 비어 있다' },
    ],
    data: [
      'lib/data/pipeline.ts',
      'lib/data/activities.ts',
      'lib/data/contacts.ts',
      'lib/data/tenants.ts',
      'lib/data/subscriptions.ts',
      'lib/data/integrations.ts',
    ],
    exits: ['고객사의 배포가 자기 도메인에서 돈다'],
  },
  {
    id: 'collect',
    title: '받을 것 받기',
    purpose: '청구를 만들고 못 받은 것을 좇는다.',
    entries: ['달이 바뀔 때', '대시보드 미수금 · 연체 카드'],
    steps: [
      '결제 · 예정일에서 이번 달 청구를 만든다',
      '기한이 7일 안으로 들어온 것을 확인한다',
      '결제 · 연체에서 기한이 지난 것을 본다',
      '설정 · 알림에서 언제 알릴지 손본다',
    ],
    branches: [
      {
        after: 2,
        question: '연체가 60일을 넘겼나',
        pass: '예',
        block: '담당자에게 알리는 것으로 끝낸다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: '새로 만든 것은 언제나 견적이다 — 확정은 회계가 세금계산서를 낼 때다' }],
    data: ['lib/data/invoices.ts', 'lib/data/settings.ts'],
    exits: ['계약을 다시 보거나, 받고 목록에서 사라진다'],
  },
  {
    id: 'renew',
    title: '계약 이어 가기',
    purpose: '유지보수가 끝나기 전에 다음 계약을 만든다.',
    entries: ['대시보드 유지보수 확인 필요'],
    steps: [
      '고객사 상세에서 지금 조건을 읽는다',
      '통계 · 회원에서 플랜 상한에 얼마나 가까운지 본다',
      '구독 · 플랜에서 올릴 플랜을 고른다',
      '결제 · 예정일에서 다음 청구를 만든다',
    ],
    branches: [
      {
        after: 1,
        question: '상한에 가까운가',
        pass: '예',
        block: '지금 플랜 그대로 이어 간다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [{ at: 0, label: '만료 30일 전부터 대시보드와 목록 맨 위에 올라온다' }],
    data: ['lib/data/tenants.ts', 'lib/data/statistics.ts', 'lib/data/subscriptions.ts'],
    exits: ['계약이 이어지거나, 이어지지 않으면 고객사 · 이탈로 넘어간다'],
  },
];

/**
 * 어디서든 같은 흐름 — 화면마다 되풀이해 적지 않는다.
 *
 * 열아홉 흐름에 내비게이션 · 모달 · 오류를 다 적으면 화면마다 같은 세 줄이 붙어 정작 그 화면만의
 * 것이 묻힌다. 여기 한 번 적고 화면 쪽에서는 **다를 때만** 적는다.
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
      '목록에서 검색 · 필터로 좁힌다',
      '행을 눌러 상세로 들어간다',
    ],
    branches: [
      {
        after: 0,
        question: '그 갈래에 세부가 여럿인가',
        pass: '예',
        block: '보조 메뉴 없이 바로 목록을 연다 — 문의가 그렇다',
        blockLabel: '아니오',
      },
      {
        after: 2,
        question: '조건에 맞는 것이 있나',
        block: '빈 상태 안내를 대신 그린다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '사이드바는 최상위만 편다 — 세부까지 펴면 자원이 늘수록 무너진다' },
      { at: 0, label: 'lg 미만에서는 사이드바가 칩 내비게이션으로 접힌다' },
    ],
    data: ['주소 질의문자열 (tenant 등)'],
    exits: ['상세로'],
  },
  {
    id: 'toolbar',
    title: '목록 툴바',
    purpose: '무엇을 볼지 먼저 정하고, 그 안에서 좁힌다.',
    entries: ['목록 화면을 열면'],
    steps: [
      '윗줄 상태 탭에서 어느 묶음을 볼지 고른다',
      '아랫줄 검색창에 말을 넣는다',
      '필터 단추를 열어 조건을 더 건다',
      '윗줄 오른쪽 끝 등록 단추로 새로 만든다',
      '모달에서 값을 넣고 저장한다',
    ],
    branches: [
      {
        after: 0,
        question: '가를 상태가 있나',
        pass: '예',
        block: '탭 줄을 그리지 않는다 — 파이프라인은 단계가 이미 칸으로 서 있다',
        blockLabel: '아니오',
      },
      {
        after: 3,
        question: '운영자가 새로 만드는 자료인가',
        pass: '예',
        block: '등록 단추 자체를 그리지 않는다 — 이탈 · 문의 · 연체 · 통계가 그렇다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: '탭마다 건수를 함께 적는다 — 눌러 보기 전에 몇 건인지 알아야 어디를 볼지 정한다' },
      { at: 0, label: '맨 앞은 늘 전체다. 기본으로 켜지는 탭만 화면마다 다르다 — 문의는 미답변으로 시작한다' },
      { at: 1, label: '안내 문구는 placeholder 가 아니라 겹친 글자다 — placeholder 는 추출되지 않아 Figma 에서 빈 상자가 된다' },
      { at: 2, label: '조건이 걸려 있으면 필터 패널이 펼친 채로 시작한다 — 접혀 있으면 목록이 왜 비었는지 알 수 없다' },
      { at: 3, label: '단추 글자에 무엇을 만드는지 적는다 — 등록이 아니라 고객사 등록' },
      { at: 1, label: 'sm 미만에서는 아랫줄의 검색과 필터가 세로로 쌓인다' },
    ],
    data: ['화면이 이미 들고 있는 목록'],
    exits: ['목록에 새 줄이 생기고 하단 정중앙 토스트로 알린다'],
  },
  {
    id: 'modal',
    title: '모달',
    purpose: '화면을 떠나지 않고 한 가지만 묻거나 고치게 한다.',
    entries: ['목록의 등록 단추'],
    steps: ['모달이 뜨고 바깥이 어두워진다', '값을 넣는다', '저장을 눌러 끝낸다'],
    branches: [
      {
        after: 2,
        question: '넣어야 할 값이 다 들어 있나',
        block: '무엇이 비었는지 토스트로 알리고 모달을 닫지 않는다',
        blockLabel: '아니오',
      },
    ],
    exceptions: [
      { at: 0, label: 'ESC 나 바깥 누름으로 닫으면 아무것도 바뀌지 않는다' },
      { at: 0, label: '열려 있는 동안 뒤 화면은 스크롤되지 않고, 첫 입력으로 포커스가 간다' },
    ],
    data: ['모달을 연 화면이 이미 들고 있는 값'],
    exits: ['모달만 닫히고 뒤 화면은 그대로다 — 결과는 하단 정중앙 토스트로 알린다'],
  },
  {
    id: 'error',
    title: '오류',
    purpose: '막혔을 때 어디서 막혔는지와 돌아갈 길을 함께 준다.',
    entries: ['없는 주소를 열었을 때', '처리 도중 예외가 났을 때'],
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
    exceptions: [
      { at: 1, label: '세 화면 모두 같은 StatusScreen 을 쓴다 — 문구와 배치만 갈린다' },
      { at: 2, label: '로그인 화면이 없어 돌아갈 곳은 언제나 대시보드나 목록이다' },
    ],
    data: ['주소 질의문자열 (state·kind·id)'],
    exits: ['대시보드로', '고객사 목록으로'],
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
