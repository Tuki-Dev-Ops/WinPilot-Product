// `@/` 별칭 대신 상대 경로를 쓴다 — 이 모듈은 Next 밖(문서 생성 스크립트)에서도 읽힌다.
import { pages } from '../pages.manifest';
import { INTERNAL_MENU } from './navigation/internal-menu';

/**
 * IA 묶음 — **사이드바 섹션이 곧 갈래**다.
 *
 * 갈래를 여기서 새로 정하지 않고 `internal-menu.ts` 의 섹션 id 를 그대로 쓴다. 따로 정하면
 * 메뉴에 항목을 하나 더했을 때 메뉴와 도면이 갈라지고, 그때부터 도면은 조용히 옛것이 된다.
 * 갈래 이름도 여기 적지 않는다 — `labelOf()` 가 메뉴에서 읽는다.
 *
 * 여기 적는 것은 메뉴가 **모르는 것**뿐이다: 목록에서만 들어가는 화면(상세)의 한글 이름,
 * 화면끼리의 이동, 값이 오는 곳, 그리고 그 갈래에서만 지켜야 하는 것.
 *
 * ## 화면 이름을 한글로 다시 적는 이유
 * 매니페스트의 `name` 은 Figma 페이지 이름이라 영문이다(`Churned Tenants`). 도면과 왼쪽 목록은
 * 사람이 읽는 것이므로 한글로 적는다. 두 벌이 되는 것을 막기 위해 `screen` 은 반드시 매니페스트에
 * 있는 id 여야 하며, 어긋나면 `unknownScreens()` 가 알려 준다.
 *
 * ## 고객사 배포 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 고객사의 배포에 나타나지 않는다.
 */
export type IaScreen = {
  /** `pages.manifest.ts` 의 id */
  screen: string;
  /** 도면·목록에 보이는 한글 이름 */
  ko: string;
};

export type IaGroup = {
  /** `internal-menu.ts` 의 섹션 id. 이름은 메뉴에서 읽으므로 여기 적지 않는다. */
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
   * 이 프로젝트에는 서버가 없다. 사내 어드민이 만지는 것은 이 앱 안의 시드(`lib/data/*`)와
   * 주소의 질의문자열뿐이다. 있지도 않은 API 를 도면에 그리면 그 도면을 보고 만드는 사람이
   * 서버를 찾는다.
   */
  data: string[];
  /** 이 갈래에서만 지켜야 하는 것 */
  notes: string[];
};

export const IA_GROUPS: IaGroup[] = [
  {
    id: 'dashboard',
    purpose: '오늘 손대야 할 것을 한 화면에 모아 보낸다.',
    screens: [{ screen: 'dashboard', ko: '대시보드' }],
    edges: [],
    data: ['lib/data/tenants.ts', 'lib/data/invoices.ts', 'lib/data/inquiries.ts'],
    notes: [
      '여기서 정하는 값이 하나도 없다 — 다른 화면이 만들어 낸 신호를 모아 보내는 자리다.',
      '카드를 누르면 그 수치를 만든 조건이 그대로 걸린 목록으로 간다. 수치와 목록이 다른 값을 말하면 카드를 믿지 않게 된다.',
      '볼 것이 없어도 카드를 숨기지 않고 0 을 적는다. 사라진 카드는 값이 0 인지 기능이 없어진 것인지 알 수 없다.',
    ],
  },
  {
    id: 'tenant',
    purpose: '고객사와의 관계를 처음부터 끝까지 한 갈래에 둔다.',
    screens: [
      { screen: 'tenants', ko: '고객' },
      { screen: 'tenants-pipeline', ko: '파이프라인' },
      { screen: 'tenants-activities', ko: '활동' },
      { screen: 'tenants-contacts', ko: '담당자' },
      { screen: 'tenants-churned', ko: '이탈' },
      { screen: 'tenants-detail', ko: '고객사 상세' },
    ],
    edges: [
      ['tenants', 'tenants-detail'],
      ['tenants-pipeline', 'tenants-detail'],
      ['tenants-activities', 'tenants-detail'],
      ['tenants-contacts', 'tenants-detail'],
    ],
    data: [
      'lib/data/tenants.ts',
      'lib/data/pipeline.ts',
      'lib/data/activities.ts',
      'lib/data/contacts.ts',
      'lib/data/churn.ts',
      'lib/data/invoices.ts',
    ],
    notes: [
      '이 갈래를 조금 CRM 처럼 잡은 이유: 고객 목록은 지금 상태만 보여 주고 어떻게 여기까지 왔는지가 없다. 그러면 계약이 끊길 때가 되어서야 이탈에서 처음 알게 되고, 그때는 되돌릴 수 없다.',
      '보조 메뉴 차례는 시간 순이다 — 아직 고객사가 아닌 곳(파이프라인)에서 시작해, 무엇을 했고(활동) 누구와 했는지(담당자)를 지나, 떠난 곳(이탈)에서 끝난다.',
      '파이프라인의 운영 단계가 곧 고객 목록이다 — 같은 자료를 표와 단계별 칸으로 다르게 본다. 시드를 두 벌로 두지 않는 이유가 그것이다.',
      '파이프라인에 끌어 옮기기를 만들지 않는다. 끌기는 되돌리기가 없으면 실수했을 때 되돌릴 길이 없다 — 단계 바꾸기는 카드의 단추로 하고 앞뒤 두 방향을 함께 연다.',
      '활동을 남기는 이유: 사람 머리에만 있으면 담당자가 바뀌는 순간 사라지고, 다음 사람이 같은 것을 다시 묻는다.',
      '담당자를 고객사 레코드의 한 칸에 눌러 담지 않는다 — 결제 담당과 기술 담당이 다르고, 급할 때 그 물음이 가장 비싸다.',
      '이탈을 고객 목록에 섞지 않는다 — 섞으면 지금 몇 곳을 맡고 있는지 셀 때마다 상태로 걸러야 한다.',
      '상세는 메뉴에 항목이 없고 목록에서만 들어간다. 배포·청구뿐 아니라 그 고객사의 담당자와 활동도 한 묶음씩 붙인다 — 목록으로 나갔다 돌아오면 어디까지 읽었는지를 다시 찾게 된다.',
      '가장 먼저 보이는 것은 유지보수 만료다 — 끝난 뒤에 알면 되돌릴 수 없다.',
    ],
  },
  {
    id: 'subscription',
    purpose: '무엇을 팔았고 그것이 무엇을 여는지 정한다.',
    screens: [
      { screen: 'subscriptions-plans', ko: '플랜' },
      { screen: 'subscriptions-roles', ko: '권한' },
    ],
    edges: [],
    data: ['lib/data/subscriptions.ts'],
    notes: [
      '플랜이 권한을 켠다 — 두 화면이 같은 관계를 양쪽에서 묻는다. 플랜에서는 “이 플랜이 무엇을 켜는가”, 권한에서는 “이 권한을 쓰려면 얼마부터인가”.',
      '여기 권한은 고객사가 자기 콘솔에서 쓰는 것이다. 이 콘솔에 들어오는 직원은 설정 갈래에 있다.',
      '팔지 않는 플랜을 숨기지 않는다. 쓰던 고객사의 계약서에 그 이름이 적혀 있다.',
      '플랜은 표가 아니라 카드로 늘어놓는다 — 한 줄에 밀어 넣으면 가로로 스크롤해야 읽힌다.',
    ],
  },
  {
    id: 'inquiry',
    purpose: '고객사가 우리에게 보낸 말을 받아 답한다.',
    screens: [{ screen: 'inquiries', ko: '문의' }],
    edges: [],
    data: ['lib/data/inquiries.ts', 'lib/data/tenants.ts'],
    notes: [
      'B2C Admin 의 문의는 고객이 고객사에게 보낸 것이다 — 받는 쪽도 답하는 쪽도 달라 자원을 나눴다.',
      '상태 이름(접수·처리중·답변완료·보류)은 B2C Admin 과 글자까지 같다. 장애 상황에서 서로 통해야 한다.',
      '급한 것이 위로 오고 그다음이 오래된 것이다. 접수일 최신순으로만 두면 어제 들어온 장애가 지난주 기능 요청 아래에 깔린다.',
      '답변을 목록 안에서 펼쳐 읽는다. 화면을 따로 두면 돌아왔을 때 어디까지 봤는지 다시 찾는다.',
    ],
  },
  {
    id: 'integration',
    purpose: '고객사 배포에 붙는 바깥 연결을 우리가 대신 잡는다.',
    screens: [
      { screen: 'integrations-pg', ko: 'PG' },
      { screen: 'integrations-oauth', ko: 'OAuth' },
      { screen: 'integrations-plugin', ko: 'Plugin' },
      { screen: 'integrations-dns', ko: 'DNS' },
    ],
    edges: [],
    data: ['lib/data/integrations.ts', 'lib/data/tenants.ts', '주소 질의문자열 (tenant)'],
    notes: [
      '네 화면 모두 고객사를 먼저 고른다. 선택 없이 값을 보여 주면 다른 고객사의 키를 고치는 사고가 난다.',
      '고객사를 바꾸면 그 고객사의 값으로 다시 시작한다 — 앞 고객사의 키가 남아 있으면 사고가 난다.',
      '비밀값은 뒷 4자리만 보여 준다. 목록·요약에 그대로 흘리지 않는다.',
      'DNS 에는 저장이 없고 다시 확인만 있다. 등록은 고객사가 하므로, 없는 권한을 있는 것처럼 그리지 않는다.',
      '고객사가 이 네 화면을 직접 만지지 못한다 — 키 하나가 틀리면 로그인·결제·사이트가 통째로 멈춘다.',
    ],
  },
  {
    id: 'analytics',
    purpose: '앞의 갈래들이 쌓아 놓은 것을 합쳐 읽는다.',
    screens: [
      { screen: 'statistics-revenue', ko: '매출' },
      { screen: 'statistics-members', ko: '회원' },
    ],
    edges: [],
    data: ['lib/data/statistics.ts', 'lib/data/tenants.ts'],
    notes: [
      '읽기만 하는 갈래다 — 여기서 고쳐지는 값이 없다.',
      '매출은 우리가 고객사에게 받는 돈이다. B2C Admin 의 매출(고객사가 파는 것)과 방향이 반대다.',
      '회원은 수만 본다. 이름·이메일을 두지 않는 이유는 우리가 개인을 들여다볼 자리가 아니기 때문이다 — 없는 값은 새어 나갈 수도 없다.',
      '차트는 전부 인라인 SVG 다. 비트맵은 Figma 에서 벡터로 복원되지 않는다.',
      '막대의 바닥은 언제나 0 이다. 최솟값을 바닥으로 잡으면 작은 차이가 커 보여 없는 추세를 읽는다.',
    ],
  },
  {
    id: 'billing',
    purpose: '받을 것과 못 받은 것을 갈라 놓는다.',
    screens: [
      { screen: 'billing-due', ko: '예정일' },
      { screen: 'billing-overdue', ko: '연체' },
    ],
    edges: [],
    data: ['lib/data/invoices.ts', 'lib/data/tenants.ts'],
    notes: [
      '자원은 하나이고 목록만 둘이다 — 섞으면 급한 것이 묻힌다. 그것 말고 다른 이유는 없다.',
      '상태가 연체로 적혀 있지 않아도 기한이 지나면 연체 목록으로 온다. 상태 값만 믿으면 어느 목록에도 오지 않는 건이 생긴다.',
      '연체는 30일·60일로 구간을 나눈다. 손대는 방법이 갈리므로 목록도 그 기준으로 읽혀야 한다.',
      '청구를 집행하지 않고 안내만 한다 — 그래서 결제하기 단추가 없다.',
    ],
  },
  {
    id: 'settings',
    purpose: '이 콘솔 자신의 값을 한자리에서 정한다.',
    screens: [
      { screen: 'settings-staff', ko: '사내 계정' },
      { screen: 'settings-notifications', ko: '알림' },
      { screen: 'settings-codes', ko: '기준 값' },
    ],
    edges: [],
    data: ['lib/data/settings.ts', 'lib/data/tenants.ts'],
    notes: [
      '세 화면 모두 고객사를 고르지 않는다 — 고객사에 붙는 값이 아니라 이 콘솔 자신의 값이다.',
      '사내 계정은 구독 · 권한과 성격이 다르다. 저기는 고객사가 쓰는 권한, 여기는 이 콘솔에 들어오는 우리 직원이다.',
      '알림은 통계·결제가 만들어 내는 신호를 받을 곳이다. 신호를 내는 화면마다 조건을 박아 두면 규칙이 화면 수만큼 늘어난다.',
      '기준 값은 여러 화면이 함께 쓰는 목록이다. 화면마다 박아 두면 두 벌이 되고, 그때부터 어느 쪽이 맞는지 알 수 없다.',
      '중지한 계정을 지우지 않는다 — 지난 기록에 누가 무엇을 고쳤는지가 이름으로 남아 있다.',
    ],
  },
  {
    id: 'system',
    label: '시스템',
    purpose: '메뉴에 없지만 주소가 있는 화면 — 끝나는 자리.',
    screens: [{ screen: 'result', ko: '처리 결과' }],
    edges: [],
    data: ['주소 질의문자열 (state·kind·id)'],
    notes: [
      '사이드바에 항목이 없다. 그래도 도면에는 그린다 — 메뉴에 없다고 화면이 없는 것은 아니고, 그 사실을 모르면 같은 화면을 새로 만들려 든다.',
      '완료·실패가 한 화면이다(`/result?state=…`). 404·오류와 같은 `StatusScreen` 을 쓰고 배치만 다르다.',
      '로그인 화면이 없다 — 이 콘솔에는 아직 들어오는 문이 그려져 있지 않다. 없는 길을 도면에 그리지 않는다.',
    ],
  },
];

/**
 * 갈래를 넘는 이동.
 *
 * 사이드바 도면에는 **긋지 않는다** — 아홉 갈래에 이 선을 다 그으면 도면이 그물이 되어
 * 아무것도 읽히지 않는다. 화면 하나를 볼 때(`/docs/ia/{화면}`)만 그 화면에 닿는 선을 꺼내 그린다.
 *
 * 사이드바에서 어느 갈래로나 갈 수 있는 길은 여기 적지 않는다. 어느 화면에서나 같으므로
 * 적어 두면 화면 수만큼 되풀이되고, 정작 그 화면에만 있는 길이 묻힌다.
 */
export type CrossEdge = {
  from: string;
  to: string;
  /** 어떤 길로 넘어가는가 */
  how: string;
};

export const CROSS_EDGES: CrossEdge[] = [
  { from: 'dashboard', to: 'tenants', how: '고객사 카드에서 목록으로' },
  { from: 'dashboard', to: 'tenants-detail', how: '만료가 임박한 고객사를 바로 열어' },
  { from: 'dashboard', to: 'billing-due', how: '미수금 카드에서 청구 예정으로' },
  { from: 'dashboard', to: 'billing-overdue', how: '연체 카드에서 연체 목록으로' },
  { from: 'dashboard', to: 'inquiries', how: '답하지 않은 문의 줄에서' },
  { from: 'tenants-detail', to: 'tenants-contacts', how: '상세의 담당자 묶음에서 전체 목록으로' },
  { from: 'tenants-detail', to: 'tenants-activities', how: '상세의 활동 묶음에서 전체 목록으로' },
  { from: 'tenants', to: 'integrations-oauth', how: '목록의 연동 단추에서 그 고객사의 값으로' },
  { from: 'tenants-detail', to: 'integrations-pg', how: '상세의 연동 설정에서 그 고객사의 값으로' },
  { from: 'tenants-detail', to: 'integrations-oauth', how: '상세의 연동 설정에서 그 고객사의 값으로' },
];

export function findGroup(id: string): IaGroup | undefined {
  return IA_GROUPS.find((group) => group.id === id);
}

/** 화면이 속한 갈래. */
export function groupOf(screen: string): IaGroup | undefined {
  return IA_GROUPS.find((group) => group.screens.some((item) => item.screen === screen));
}

/** 갈래 이름 — 사이드바에 있는 것은 메뉴가 이긴다. 두 곳에 적으면 메뉴를 고칠 때 도면이 남는다. */
export function labelOf(group: IaGroup): string {
  return INTERNAL_MENU.find((section) => section.id === group.id)?.label ?? group.label ?? group.id;
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
