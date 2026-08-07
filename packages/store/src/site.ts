/**
 * 회사 홈페이지가 **파는 것**을 소개하는 값 — 서비스 · 솔루션 · 미디어 · 법적 고지.
 *
 * ## 왜 이제서야 여기로 왔나
 * 이 값들은 원래 `apps/ir-client-a/lib/data/site.ts` 에 있었고, 그 파일 머리말에는 이렇게
 * 적혀 있었다 — *"올리는 화면이 없기 때문이다. 값을 공유 패키지에 올려 두면 두 앱이 읽는
 * 것처럼 보이는데 한쪽에는 그 화면이 없다. 어드민에 자리가 생기는 날 그때 옮긴다."*
 *
 * **그날이 왔다.** IR 어드민에 홈페이지 갈래(`/site/*`)가 생겼고, 그때부터 앱 안에 두는 것은
 * 두 벌을 만드는 일이 된다 — 어드민에서 고친 문구가 사이트에 없거나, 사이트에만 남은 옛
 * 문구가 계속 보인다.
 *
 * ## 공시(`ir.ts`)와 나눠 두는 이유
 * 성격이 다르다. 공시·재무는 **정해진 서식이 있고 틀리면 정정 공시로만 고치는** 값이고,
 * 여기 있는 것은 **언제든 다시 쓰는 홍보 문구**다. 한 파일에 담으면 반기보고서 옆에
 * `블록을 놓아 구성합니다` 가 서게 된다.
 */

/* ── 서비스 ───────────────────────────────────────────────────────── */

export type SiteService = {
  id: 'consulting' | 'infra' | 'mes' | 'erp' | 'crm' | 'dxp';
  /** 화면에 적히는 차례 — `01` 부터. 목록 순서와 따로 두는 것은 순서를 눈으로 확인하기 위해서다 */
  no: string;
  name: string;
  /**
   * 두 줄.
   *
   * 배열로 받는 이유: 화면에서 두 줄이 **한 문단으로 붙어** 서고, 줄 사이 간격이 제목과의
   * 간격보다 좁다. 한 문자열에 `\n` 을 넣으면 그 간격을 화면이 정할 수 없다.
   */
  body: string[];
  /** 더 읽으러 가는 곳. 자기 화면이 없는 것은 제품 소개로 보낸다 */
  href: string;
};

/**
 * 홈 화면의 서비스 여섯.
 *
 * **순서가 곧 공정의 차례**다 — 컨설팅으로 진단하고, 인프라를 깔고, MES 로 현장을 표준화하고,
 * ERP 로 자원을 잇고, CRM 으로 고객을 받고, DXP 로 그 고객이 만나는 화면을 만든다. 홈의 회전
 * 무대가 이 순서대로 시계 방향으로 놓이므로, **여기서 순서를 바꾸면 그림의 흐름이 바뀐다.**
 */
export const SITE_SERVICES: SiteService[] = [
  {
    id: 'consulting',
    no: '01',
    name: '스마트 컨설팅',
    body: [
      '제조 현장을 먼저 진단합니다. 무엇을 도입할지가 아니라 어디부터 손대야 하는지를 정합니다.',
      '설비·공정·인력의 지금을 데이터로 확인하고, 효과가 큰 순서대로 단계를 나눠 제안드립니다.',
    ],
    href: '/support/contact',
  },
  {
    id: 'infra',
    no: '02',
    name: '인프라 서비스',
    body: [
      '서버·네트워크·백업을 클라우드에서 운영합니다. 공장 안에 서버실을 두지 않아도 됩니다.',
      '증설과 이중화, 장애 대응까지 맡으므로 현장은 생산에만 집중할 수 있습니다.',
    ],
    href: '/products',
  },
  {
    id: 'mes',
    no: '03',
    name: 'Cloud MES',
    body: [
      '설비·작업자·자재의 기록을 실시간으로 모아 하나의 규격으로 표준화합니다.',
      '비가동과 불량이 어느 공정에서 났는지 추적되어, 관리의 사각지대가 사라집니다.',
    ],
    href: '/solutions/mes',
  },
  {
    id: 'erp',
    no: '04',
    name: 'Cloud ERP',
    body: [
      '수주에서 매입·생산·출하·정산까지를 하나의 자원으로 잇습니다.',
      '한 번 입력한 값이 다음 단계로 그대로 흐르므로, 부서마다 옮겨 적는 일이 사라집니다.',
    ],
    href: '/solutions/erp',
  },
  {
    id: 'crm',
    no: '05',
    name: 'Cloud CRM',
    body: [
      '문의부터 상담·계약·유지보수까지 고객과의 모든 접점을 한 줄로 기록합니다.',
      '담당자가 바뀌어도 관계가 남고, 고객은 같은 설명을 두 번 하지 않습니다.',
    ],
    href: '/products',
  },
  {
    id: 'dxp',
    no: '06',
    name: 'Cloud DXP',
    body: [
      '고객이 만나는 화면을 블록을 놓아 구성합니다. 개발 없이 담당자가 직접 만듭니다.',
      'ERP·MES·CRM 의 데이터를 그대로 끌어다 쓰므로, 화면과 데이터가 따로 놀지 않습니다.',
    ],
    href: '/products',
  },
];

/* ── 솔루션 ───────────────────────────────────────────────────────── */

export type Solution = {
  id: 'erp' | 'mes' | 'crm' | 'dxp';
  name: string;
  /** 더 읽으러 가는 곳. 자기 화면이 없는 것(DXP)은 제품 소개로 보낸다 */
  href: string;
  tagline: string;
  /** 무엇을 푸는가 — 기능 목록이 아니라 문제를 적는다 */
  problem: string;
  /** 어떻게 푸는가. **두 문장까지** — 홈 카드가 이 값을 그대로 싣는데 세 문장이면 석 줄이 된다 */
  approach: string;
  /** 실제로 쓰는 사람이 얻는 것. 화면 이름이 아니라 결과로 적는다 */
  outcomes: string[];

  /**
   * 주요 기능 — 상세 화면의 격자에 선다.
   *
   * **넷으로 고정한다.** 국내 제조 솔루션 소개 화면을 여럿 보면 기능을 스무 개씩 늘어놓는데,
   * 그러면 읽는 사람이 **자기 문제가 그중에 있는지** 판단하지 못하고 목록을 통째로 건너뛴다.
   * 넷이면 한눈에 들고, 나머지는 문의에서 이야기하면 된다.
   */
  features: { title: string; desc: string }[];

  /**
   * 시스템 구성 — 아래에서 위로 쌓이는 층.
   *
   * 제조 솔루션 소개에서 구성도가 빠지지 않는 이유: 검토하는 사람이 **우리 설비와 어디서
   * 붙는지**를 먼저 본다. 그림 대신 층 이름과 한 줄로 적어 두면 화면 폭에 상관없이 읽힌다.
   */
  layers: { name: string; desc: string }[];

  /** 적용 업종. 자기 업종이 없으면 검토가 거기서 멈추므로, 실제로 맞는 것만 적는다 */
  industries: string[];

  /**
   * 도입 절차.
   *
   * 단계마다 **걸리는 기간**을 함께 적는다. 절차만 적으면 "얼마나 걸리나" 를 묻는 문의가
   * 그대로 남는데, 그 물음이 도입 검토에서 가장 먼저 나온다.
   */
  steps: { name: string; period: string; desc: string }[];
};

export const SOLUTIONS: Solution[] = [
  {
    id: 'erp',
    name: 'ERP',
    href: '/solutions/erp',
    tagline: '흩어진 장부를 하나의 흐름으로',
    problem:
      '영업이 쓰는 표, 생산이 쓰는 표, 회계가 쓰는 표가 각각입니다. 월말마다 셋을 맞추는 데 며칠이 들고, 맞지 않는 이유는 대개 같은 값을 세 곳에 손으로 적었기 때문입니다.',
    approach:
      '수주에서 매입·생산·출하·정산까지를 하나의 자원으로 잇습니다. 한 번 입력한 값이 다음 단계로 그대로 흐릅니다.',
    outcomes: ['월 마감이 며칠에서 하루로', '재고와 장부가 같은 숫자', '부서마다 옮겨 적는 일이 사라짐'],
    features: [
      { title: '수주 · 발주', desc: '견적에서 수주로, 수주에서 소요 자재 산출과 발주까지 한 줄로 이어집니다.' },
      { title: '재고 · 창고', desc: '입고·출고·재고 실사를 한 장부로 봅니다. 창고가 여럿이어도 총량이 한 숫자입니다.' },
      { title: '원가 · 정산', desc: '자재비·노무비·경비를 제품별로 모아 실제 원가를 냅니다. 견적가와 나란히 놓입니다.' },
      { title: '회계 전표', desc: '거래가 일어난 자리에서 전표가 만들어집니다. 월말에 몰아 적는 일이 없습니다.' },
    ],
    layers: [
      { name: '현장', desc: 'MES 가 모은 생산 실적과 자재 사용량이 그대로 올라옵니다.' },
      { name: '자원', desc: '수주·발주·재고·원가가 하나의 자원 위에서 움직입니다.' },
      { name: '회계', desc: '전표와 마감. 세무 신고에 필요한 장부가 여기서 나옵니다.' },
      { name: '경영', desc: '매출·원가·이익을 기간과 제품으로 갈라 봅니다.' },
    ],
    industries: ['기계 · 부품', '전기 · 전자', '화학 · 소재', '식음료', '자동차 부품'],
    steps: [
      { name: '진단', period: '2주', desc: '지금 쓰는 표와 절차를 그대로 받아 어디서 값이 갈리는지 찾습니다.' },
      { name: '설계', period: '3주', desc: '자원과 권한을 정합니다. 여기서 정한 것이 곧 화면이 됩니다.' },
      { name: '구축 · 이관', period: '6~8주', desc: '기존 데이터를 옮기고 두 달치를 나란히 돌려 숫자를 맞춥니다.' },
      { name: '안정화', period: '4주', desc: '실제 마감을 한 번 함께 돌립니다. 이때 나온 것만 고치고 넘깁니다.' },
    ],
  },
  {
    id: 'mes',
    name: 'MES',
    href: '/solutions/mes',
    tagline: '현장의 데이터를 표준으로',
    problem:
      '설비마다 데이터 모양이 다릅니다. 어제 몇 개를 만들었는지는 알아도 **왜 그만큼밖에 못 만들었는지**는 사람에게 물어야 알 수 있습니다.',
    approach:
      '설비·작업자·자재의 기록을 실시간으로 모아 하나의 규격으로 표준화합니다. 관리의 사각지대가 사라집니다.',
    outcomes: ['비가동 원인이 숫자로 남음', '불량이 난 공정을 바로 추적', 'AI 판단(AX)의 입력이 되는 데이터'],
    features: [
      { title: '생산 실적', desc: '작업지시부터 실적까지 실시간으로 모읍니다. 어제가 아니라 지금 몇 개인지 봅니다.' },
      { title: '설비 · 비가동', desc: '설비 신호를 받아 가동·비가동을 자동으로 가릅니다. 멈춘 이유가 코드로 남습니다.' },
      { title: '품질 · 추적', desc: '로트 단위로 자재와 공정을 잇습니다. 불량이 나면 어디까지 나갔는지 거꾸로 찾습니다.' },
      { title: '작업 표준', desc: '공정마다 지켜야 할 값을 정해 두고, 벗어나면 그 자리에서 알립니다.' },
    ],
    layers: [
      { name: '설비', desc: 'PLC · 센서 · 계측기에서 나오는 신호를 받습니다.' },
      { name: '수집', desc: '설비마다 다른 모양을 하나의 규격으로 바꿉니다.' },
      { name: '실행', desc: '작업지시 · 실적 · 품질 · 추적이 이 위에서 돕니다.' },
      { name: '분석', desc: '비가동과 불량을 원인별로 셉니다. AI 판단의 입력이 되는 자리입니다.' },
    ],
    industries: ['자동차 부품', '전기 · 전자', '기계 · 금속', '화학 · 소재', '식음료 · 제약'],
    steps: [
      { name: '현장 진단', period: '2주', desc: '설비가 어떤 신호를 내보내는지, 지금 무엇을 손으로 적는지 확인합니다.' },
      { name: '연동 설계', period: '3주', desc: '설비별 수집 방식과 표준 규격을 정합니다. 여기서 데이터의 모양이 정해집니다.' },
      { name: '구축 · 연동', period: '8~12주', desc: '설비를 한 대씩 붙입니다. 한 라인이 돌기 시작하면 다음 라인은 빨라집니다.' },
      { name: '안정화', period: '4주', desc: '수집이 끊기는 자리를 찾아 메웁니다. 실적과 실물이 맞을 때까지 봅니다.' },
    ],
  },
  {
    id: 'crm',
    name: 'CRM',
    href: '/solutions/crm',
    tagline: '사람 머릿속의 관계를 기록으로',
    problem:
      '누가 무엇을 언제 이야기했는지가 담당자 머리에만 있습니다. 담당이 바뀌는 순간 사라지고, 고객은 같은 이야기를 다시 하게 됩니다.',
    approach:
      '문의부터 상담·계약·유지보수까지 고객과의 모든 접점을 한 줄로 기록합니다. 담당이 바뀌어도 관계가 남습니다.',
    outcomes: ['담당이 바뀌어도 관계가 남음', '계약 종료 전에 신호를 봄', '고객이 같은 설명을 두 번 하지 않음'],
    features: [
      { title: '고객 · 접점', desc: '전화·메일·방문을 한 줄에 쌓습니다. 다음 사람이 그 줄만 읽으면 됩니다.' },
      { title: '영업 기회', desc: '견적부터 수주까지 단계로 봅니다. 어디서 멈춰 있는지가 목록에서 보입니다.' },
      { title: '계약 · 갱신', desc: '만료일을 앞두고 알립니다. 지나고 나서 아는 일이 없어집니다.' },
      { title: '유지보수', desc: '접수부터 처리까지 이력이 남습니다. 같은 문제가 반복되는지 셉니다.' },
    ],
    layers: [
      { name: '접점', desc: '문의·상담·방문이 들어오는 자리입니다.' },
      { name: '기록', desc: '누가 무엇을 언제 이야기했는지 한 줄로 쌓입니다.' },
      { name: '영업', desc: '기회와 계약이 단계로 움직입니다.' },
      { name: '연계', desc: 'ERP 의 수주·정산과 이어집니다. 팔린 것과 만든 것이 같은 숫자입니다.' },
    ],
    industries: ['제조 B2B', '설비 · 장비', '엔지니어링', 'SI · 솔루션', '유지보수 서비스'],
    steps: [
      { name: '현황 정리', period: '1주', desc: '지금 고객 정보가 어디에 흩어져 있는지 모읍니다.' },
      { name: '설계', period: '2주', desc: '영업 단계와 권한을 정합니다. 단계 이름이 곧 목록의 갈래가 됩니다.' },
      { name: '구축 · 이관', period: '4~6주', desc: '기존 명단과 이력을 옮깁니다. 중복은 옮기기 전에 합칩니다.' },
      { name: '안정화', period: '3주', desc: '실제 상담을 넣어 보며 빠진 칸을 채웁니다.' },
    ],
  },
  {
    id: 'dxp',
    name: 'DXP',
    /* `/solutions/dxp` 는 아직 없다. 없는 길로 보내면 눌러 본 사람이 404 를 만난다. */
    href: '/products',
    tagline: '화면을 코드가 아니라 블록으로',
    problem:
      '화면 하나를 고치려면 개발자에게 부탁하고 배포를 기다립니다. 문구 한 줄을 바꾸는 데 며칠이 걸리고, 그동안 담당자는 손을 놓고 있습니다.',
    approach:
      '고객이 만나는 화면을 블록을 놓아 구성합니다. ERP·MES·CRM 의 데이터를 그대로 끌어다 씁니다.',
    outcomes: ['문구·배치는 담당자가 직접', '화면과 데이터가 따로 놀지 않음', '배포를 기다리는 시간이 사라짐'],
    features: [
      { title: '블록 편집', desc: '화면을 블록으로 짭니다. 끌어다 놓고 미리보기로 확인합니다.' },
      { title: '데이터 연결', desc: 'ERP·MES·CRM 의 값을 블록에 바로 묶습니다. 옮겨 적지 않습니다.' },
      { title: '권한 · 검토', desc: '누가 고치고 누가 내보내는지 나눕니다. 검토를 지나야 화면에 섭니다.' },
      { title: '이력 · 되돌리기', desc: '언제 무엇이 바뀌었는지 남고, 이전 화면으로 되돌립니다.' },
    ],
    layers: [
      { name: '데이터', desc: '앞의 세 솔루션이 쌓아 둔 값입니다.' },
      { name: '블록', desc: '표 · 그래프 · 목록 · 글. 데이터를 담는 그릇입니다.' },
      { name: '화면', desc: '블록을 놓아 만든 한 장. 주소를 갖습니다.' },
      { name: '배포', desc: '검토를 지난 화면이 공개됩니다. 되돌리기가 함께 있습니다.' },
    ],
    industries: ['제조 B2B', '고객 포털', '대리점 · 협력사', '사내 업무 화면'],
    steps: [
      { name: '화면 정의', period: '1주', desc: '무엇을 누구에게 보일지 정합니다. 여기가 가장 오래 걸립니다.' },
      { name: '블록 구성', period: '2주', desc: '담당자가 직접 짭니다. 저희는 옆에서 봅니다.' },
      { name: '연결 · 검토', period: '2주', desc: '데이터를 묶고 권한을 나눕니다.' },
      { name: '공개', period: '1주', desc: '주소를 열고 이력을 켭니다.' },
    ],
  },
];

export function findSolution(id: string): Solution | undefined {
  return SOLUTIONS.find((one) => one.id === id);
}

/* ── 미디어 ───────────────────────────────────────────────────────── */

export type MediaClip = {
  id: string;
  /** 어디에 실렸나 — 방송사·행사 이름. 제목만으로는 무게가 전해지지 않는다 */
  channel: string;
  title: string;
  /** 썸네일 무늬를 가르는 값. 영상 파일이 아직 없어 무늬로 대신한다 */
  seed: number;
};

/**
 * 홈 마지막 칸의 영상 목록.
 *
 * 제목을 **실제로 있을 법한 것**으로만 적는다. 수상·수출 실적처럼 검증되는 사실을 지어내면
 * 그것이 IR 화면에 실린 허위 기재가 된다 — 여기 있는 것은 전부 "무엇을 다뤘나" 수준이다.
 */
export const MEDIA_CLIPS: MediaClip[] = [
  { id: 'MC-005', channel: '기업 브랜드 영상', title: 'AX로 판단하고 RX로 실행하는 자율 제조', seed: 0 },
  { id: 'MC-004', channel: '제품 소개', title: 'Cloud MES — 설비 신호가 표준 데이터가 되기까지', seed: 1 },
  { id: 'MC-003', channel: '도입 사례', title: '수주에서 정산까지, 월 마감을 하루로 줄인 과정', seed: 2 },
  { id: 'MC-002', channel: '기술 세미나', title: '표준화된 제조 데이터 위에서 AI는 무엇을 판단하는가', seed: 3 },
  { id: 'MC-001', channel: '제품 소개', title: 'Cloud DXP — 코드 없이 화면을 만드는 자리', seed: 4 },
];

/* ── 법적 고지 ────────────────────────────────────────────────────── */

export type LegalDoc = {
  id: 'terms' | 'privacy';
  label: string;
  href: string;
  /**
   * 본문이 확정되었는가.
   *
   * `false` 인 동안 사이트는 **준비 중이라는 사실과 물어볼 곳만** 보여 준다. 그럴듯한 조항을
   * 채워 두지 않는 이유: 약관은 채워 넣는 순간 **효력을 주장할 문서**가 되고, 처리방침은
   * 적힌 것과 서버가 실제로 하는 일이 어긋나면 그대로 법 위반이다.
   */
  published: boolean;
};

export const LEGAL_DOCS: LegalDoc[] = [
  { id: 'terms', label: '서비스 이용약관', href: '/terms', published: false },
  { id: 'privacy', label: '개인정보 처리방침', href: '/privacy', published: false },
];

/* ── 특허 및 인증 ─────────────────────────────────────────────────── */

/*
  아래 셋(특허·FAQ·오시는 길)은 `apps/ir-client-a/lib/data/site.ts` 에 있던 것이다. IR 어드민에
  고치는 화면이 생긴 날 위 규칙(머리말)에 따라 여기로 왔고, 그러면서 그 파일은 비어 없어졌다.
*/

export type Credential = {
  id: string;
  kind: '특허' | '인증' | '수상';
  title: string;
  /** 등록번호·인증번호. 확인할 수 있는 값이라 반드시 적는다 */
  number: string;
  issuer: string;
  acquiredAt: string;
};

export const CREDENTIALS: Credential[] = [
  {
    id: 'C-001',
    kind: '특허',
    title: '제조 실행 데이터의 표준화 및 이상 탐지 방법',
    number: '10-0000000',
    issuer: '특허청',
    acquiredAt: '2024-08-21',
  },
  {
    id: 'C-002',
    kind: '특허',
    title: '공정 로봇의 작업 순서 자동 결정 시스템',
    number: '10-0000001',
    issuer: '특허청',
    acquiredAt: '2025-03-14',
  },
  {
    id: 'C-003',
    kind: '인증',
    title: 'ISO/IEC 27001 정보보호 경영시스템',
    number: 'KR-000000',
    issuer: '한국인정지원센터',
    acquiredAt: '2024-11-05',
  },
  {
    id: 'C-004',
    kind: '인증',
    title: 'GS 인증 1등급 (소프트웨어 품질)',
    number: 'GS-00-0000',
    issuer: '한국정보통신기술협회',
    acquiredAt: '2025-06-30',
  },
  {
    id: 'C-005',
    kind: '수상',
    title: '스마트제조혁신대상 장관 표창',
    number: '-',
    issuer: '중소벤처기업부',
    acquiredAt: '2025-11-20',
  },
];

/* ── FAQ ──────────────────────────────────────────────────────────── */

export type SiteFaq = {
  id: string;
  group: '도입' | '기술' | '지원';
  question: string;
  answer: string;
};

export const SITE_FAQS: SiteFaq[] = [
  {
    id: 'F-01',
    group: '도입',
    question: '도입까지 얼마나 걸리나요?',
    answer:
      '표준 구성은 계약 후 6~8주입니다. 기존 설비와 연동하거나 공정을 새로 정의해야 하면 그만큼 늘어납니다. 첫 상담에서 현장을 보고 기간을 먼저 말씀드립니다.',
  },
  {
    id: 'F-02',
    group: '도입',
    question: '쓰던 시스템의 데이터를 옮길 수 있나요?',
    answer:
      '옮깁니다. 다만 옛 데이터의 모양이 표준과 다르면 그대로 넣지 않고 규격을 맞춘 뒤 넣습니다 — 모양이 다른 값을 그냥 넣으면 그때부터 통계가 맞지 않습니다.',
  },
  {
    id: 'F-03',
    group: '기술',
    question: '클라우드만 되나요, 자체 서버에도 설치되나요?',
    answer:
      '둘 다 됩니다. 망 분리가 필요한 현장은 자체 서버에 설치하고, 그 경우 갱신 주기와 원격 지원 범위가 달라집니다.',
  },
  {
    id: 'F-04',
    group: '기술',
    question: '설비가 오래되어 데이터를 못 내보내는데요?',
    answer:
      '신호를 읽을 수 있으면 게이트웨이를 붙여 받습니다. 아예 못 읽는 설비는 작업자 입력으로 대신하되, 그 값은 자동 수집분과 구분해 표시합니다 — 섞어 두면 어디까지가 실제 측정인지 알 수 없습니다.',
  },
  {
    id: 'F-05',
    group: '지원',
    question: '장애가 나면 어떻게 연락하나요?',
    answer:
      '고객 포털의 문의로 접수하시면 급한 것부터 먼저 봅니다. 생산이 멈춘 장애는 전화로도 알려 주세요 — 문의만 남기면 담당자가 확인할 때까지 시간이 걸립니다.',
  },
  {
    id: 'F-06',
    group: '지원',
    question: '유지보수 범위가 어떻게 되나요?',
    answer:
      '장애 대응과 정기 갱신이 기본입니다. 새 공정을 추가하거나 화면을 새로 만드는 일은 별도 계약입니다 — 그 경계를 계약서에 적어 두므로 나중에 다투지 않습니다.',
  },
];

export const FAQ_GROUPS: SiteFaq['group'][] = ['도입', '기술', '지원'];

/* ── 오시는 길 ────────────────────────────────────────────────────── */

export type Direction = {
  kind: '지하철' | '버스' | '자가용';
  detail: string;
};

export const DIRECTIONS: Direction[] = [
  { kind: '지하철', detail: '2호선 왕십리역 5번 출구에서 도보 7분' },
  { kind: '버스', detail: '왕십리광장 정류장 하차 — 121, 141, 302' },
  { kind: '자가용', detail: '건물 지하 주차장 이용. 방문 등록 시 2시간 무료' },
];

/* ── 첫 화면 ──────────────────────────────────────────────────────── */

export type HeroSlide = {
  id: string;
  /** 큰 글씨 한 줄 — 국문 */
  ko: string;
  /** 그 아래 영문 한 줄. 국문과 같은 말을 옮긴 것이 아니라 **짧게 요약한 것**이다 */
  en: string;
  /** 오른쪽에 서는 굵은 한 줄 */
  lead: string;
  /** 그 아래 두 줄 */
  body: string[];
  /** 배경 영상 — `apps/ir-client-a/public/hero/` 안의 파일 */
  video: string;
};

/**
 * 첫 화면의 장.
 *
 * **셋으로 둔다.** 넷째를 더하면 마지막 장은 아무도 보지 않는다 — 저절로 넘어가는 화면에서
 * 사람이 끝까지 기다리는 것은 대개 두 장까지다.
 *
 * 영상은 저장소 안의 파일을 가리킨다. 어드민에서 주소를 고칠 수는 있어도 **올릴 수는 없다** —
 * 올리는 자리가 생기기 전까지 이 값은 읽는 것으로만 둔다.
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'factory',
    ko: 'AX로 판단하고, RX로 실행하는',
    en: 'Autonomous Factory',
    lead: 'AI Decides, Robots Execute. Manufacturing Runs Autonomously.',
    body: [
      '스페이스플래닝은 MES로 표준화된 제조 데이터를 기반으로',
      'AI가 판단(AX)하고 공정·물류 로봇이 실행(RX)하는 제조 데이터 기반 자율 제조를 구현합니다.',
    ],
    video: '/hero/factory.mp4',
  },
  {
    id: 'erp',
    ko: '수주에서 정산까지 한 줄로',
    en: 'One Connected ERP',
    lead: 'One Entry, End to End. No More Reconciling Spreadsheets.',
    body: [
      '영업·생산·회계가 각자 쓰던 표를 하나의 자원으로 잇습니다.',
      '한 번 적은 값이 뒤 단계로 그대로 흘러, 월 마감에 맞춰 보던 자리가 사라집니다.',
    ],
    video: '/hero/line.mp4',
  },
  {
    id: 'mes',
    ko: '현장의 데이터를 표준으로',
    en: 'Standardized Shop-Floor Data',
    lead: 'Every Machine Speaks the Same Language.',
    body: [
      '설비마다 다르던 기록을 한 규격으로 모읍니다.',
      '비가동과 불량이 어느 공정에서 났는지 숫자로 남고, 그 데이터가 AI 판단의 바탕이 됩니다.',
    ],
    video: '/hero/robotics.mp4',
  },
];

/**
 * 첫 화면 바로 아래의 회사 소개.
 *
 * 제목을 **두 줄로 끊어** 갖는다. 한 문장으로 두면 화면 폭에 따라 끊기는 자리가 달라져, 넓은
 * 화면에서는 마지막 낱말만 둘째 줄에 홀로 남는다.
 */
export const SITE_INTRO = {
  /** 영문 머리글 뒤에 붙는 말 — `Spaceplanning Digital Factory` */
  eyebrow: 'Digital Factory',
  headline: ['스마트 자동화 ERP로', '제조를 잇는 회사'],
  lead: ['스페이스플래닝은 ERP·MES·CRM을 한 자원으로 이어', '제조 현장의 데이터를 표준으로 만들어 왔습니다.'],
  body: [
    '이제는 표준화된 제조 데이터 위에서 AI가 판단(AX)하고 설비와 로봇이 실행(RX)합니다. 수주에서 생산·출하·정산까지가 한 줄로 흐르므로, 부서마다 같은 값을 옮겨 적던 자리가 사라집니다.',
    '사람은 확인하는 일에서 벗어나 판단이 필요한 일에 섭니다.',
  ],
};

/* ── 검색 노출 ────────────────────────────────────────────────────── */

/**
 * 검색 결과와 공유 카드에 서는 값.
 *
 * 화면 제목(`<title>`)과 **따로 두는 이유**: 제목은 화면마다 다르고 코드가 만든다. 여기 있는
 * 것은 사이트 전체를 대표하는 한 벌이라, 검색 결과의 첫 줄과 카톡·슬랙에 붙였을 때 뜨는 그림
 * 밑의 글이 된다.
 */
export const SITE_SEO = {
  title: '스페이스플래닝 — 스마트 자동화 ERP',
  description:
    '제조 현장의 데이터를 표준으로 만들고, ERP·MES·CRM을 한 자원으로 잇습니다. 스마트 컨설팅부터 클라우드 제품까지.',
  keywords: ['스마트팩토리', 'MES', 'ERP', 'CRM', '제조 DX', '자율 제조'],
  /** 공유 카드에 뜨는 그림. 없으면 링크가 글자만으로 뜬다 */
  ogImage: '/solutions/mes.jpg',
  canonical: 'https://spaceplanning.ai',
};

/* ── 공급자 정보 ──────────────────────────────────────────────────── */

/**
 * 사이트 아래에 적어야 하는 사업자 표시.
 *
 * `IR_COMPANY`(`ir.ts`)와 겹치는 값이 있지만 **쓰이는 자리가 다르다.** 그쪽은 공시·IR 화면이
 * 읽는 법인 정보이고, 여기 있는 것은 **전자상거래·정보통신망법이 사이트에 적으라고 정한
 * 항목**이다 — 통신판매업 신고번호처럼 그쪽에는 없는 값이 있다.
 */
export const SITE_SUPPLIER = {
  name: '스페이스플래닝',
  ceo: '정현우',
  businessNumber: '000-00-00000',
  /** 통신판매업 신고번호. 온라인으로 파는 것이 있으면 반드시 적는다 */
  mailOrderNumber: '제2026-서울성동-0000호',
  address: '서울특별시 성동구 왕십리로 000, 000호',
  phone: '02-0000-0000',
  email: 'ir@example.com',
  /** 개인정보보호책임자 — 대표와 같은 사람이어도 자리가 다르므로 따로 적는다 */
  privacyOfficer: '정현우',
  /** 호스팅 제공자. 분쟁이 났을 때 어디에 자료가 있는지를 가리킨다 */
  hosting: '스페이스플래닝',
};

/* ── 공지사항 ─────────────────────────────────────────────────────── */

/**
 * 공지의 갈래.
 *
 * 셋으로 둔다. 갈래가 다섯을 넘으면 **어느 갈래에 넣을지 매번 망설이게** 되고, 망설인 것은
 * 결국 `기타` 로 간다 — 갈래가 있으나 마나 해진다.
 *
 * - `운영` 은 휴무·연락처처럼 **우리 쪽 사정**이 바뀌는 것
 * - `서비스` 는 홈페이지·제품처럼 **보는 것**이 바뀌는 것
 * - `약관` 은 약관·처리방침처럼 **동의한 내용**이 바뀌는 것. 이것만 따로 두는 이유는 개정 전에
 *   미리 알려야 하는 법상 의무가 있어, 나중에 언제 알렸는지 찾을 일이 실제로 생기기 때문이다.
 */
export const SITE_NOTICE_GROUPS = ['운영', '서비스', '약관'] as const;

export type SiteNoticeGroup = (typeof SITE_NOTICE_GROUPS)[number];

export type SiteNotice = {
  id: string;
  title: string;
  group: SiteNoticeGroup;
  /**
   * 본문 — 문단마다 한 칸.
   *
   * 배열로 받는 이유는 `
` 을 넣은 한 문자열로는 **문단 사이 간격을 화면이 정할 수 없기**
   * 때문이다. 공지는 두세 문단이 보통이고, 그 간격이 줄 간격과 같으면 문단이 뭉쳐 읽힌다.
   */
  body: string[];
  /** 맨 위에 고정할지. 고정한 것이 셋을 넘으면 고정의 뜻이 없어진다 */
  pinned: boolean;
  postedAt: string;
  visible: boolean;
};

/**
 * 회사 홈페이지의 공지.
 *
 * **B2C 쇼핑몰의 `NOTICES` 와 다른 값이다.** 같은 회사가 두 사이트를 갖고 있고, 쇼핑몰의 배송
 * 공지가 IR 사이트에 서면 안 된다 — 한 벌로 묶으면 어느 사이트에 나갈지 고르는 칸을 매번 두어야
 * 하고, 그 칸을 잘못 고른 것은 밖에서 먼저 발견된다.
 */
export const SITE_NOTICES: SiteNotice[] = [
  {
    id: 'N-004',
    title: '2026년 하계 휴무 안내',
    group: '운영',
    body: [
      '2026년 8월 10일(월)부터 8월 14일(금)까지 하계 휴무로 사무실 운영을 쉽니다.',
      '휴무 기간에도 운영 중인 시스템의 장애 접수는 평소와 같이 받습니다. 접수는 고객지원 대표번호와 문의하기 양식 모두 열려 있습니다.',
      '견적·도입 상담과 같이 담당자가 필요한 문의는 8월 17일(월)부터 차례대로 답변드립니다.',
    ],
    pinned: true,
    postedAt: '2026-07-20',
    visible: true,
  },
  {
    id: 'N-003',
    title: '고객지원 대표번호 변경 안내',
    group: '운영',
    body: [
      '2026년 6월 15일부터 고객지원 대표번호가 바뀝니다. 기존 번호는 2026년 12월 31일까지 새 번호로 이어집니다.',
      '사내 문서나 즐겨찾기에 적어 두신 번호가 있다면 이 기간 안에 바꿔 주시기 바랍니다.',
    ],
    pinned: false,
    postedAt: '2026-06-02',
    visible: true,
  },
  {
    id: 'N-002',
    title: '개인정보 처리방침 개정 예정 안내',
    group: '약관',
    body: [
      '문의 양식이 받는 항목이 바뀌면서 개인정보 처리방침을 함께 고칩니다. 바뀌는 것은 수집 항목과 보관 기간 두 가지입니다.',
      '개정된 내용은 시행 7일 전에 이 자리에 다시 알려 드립니다. 내용에 동의하지 않으시면 문의 양식 대신 대표 메일로 연락 주시면 됩니다.',
    ],
    pinned: false,
    postedAt: '2026-04-15',
    visible: true,
  },
  {
    id: 'N-001',
    title: '홈페이지 개편 안내',
    group: '서비스',
    body: [
      '회사 홈페이지를 새로 열었습니다. 제품과 솔루션을 나누어 정리했고, 문의·FAQ·오시는 길을 고객지원 아래로 모았습니다.',
    ],
    pinned: false,
    postedAt: '2026-02-28',
    visible: false,
  },
];

/* ── 배너 ─────────────────────────────────────────────────────────── */

export type SiteBanner = {
  id: string;
  /** 어디에 서는가 — 첫 화면의 장인지, 띄우는 팝업인지 */
  slot: '메인 비주얼' | '팝업';
  title: string;
  /** 언제부터 언제까지. 끝을 비우면 계속 선다 */
  startAt: string;
  endAt: string;
  visible: boolean;
};

/**
 * 사이트에 서는 배너.
 *
 * 첫 화면의 장(`HERO_SLIDES`)과 **따로 두는 이유**: 그쪽은 영상과 문구가 한 벌로 묶인 고정
 * 구성이고, 이쪽은 **기간을 갖고 떴다 사라지는 것**이다. 한 곳에 담으면 기간이 지난 장이
 * 첫 화면에서 사라져 빈 자리가 생긴다.
 */
export const SITE_BANNERS: SiteBanner[] = [
  { id: 'B-003', slot: '메인 비주얼', title: '2026 스마트팩토리 솔루션 페어', startAt: '2026-08-01', endAt: '2026-09-30', visible: true },
  { id: 'B-002', slot: '팝업', title: '하계 휴무 안내', startAt: '2026-07-25', endAt: '2026-08-05', visible: true },
  { id: 'B-001', slot: '팝업', title: '개인정보 처리방침 개정 예고', startAt: '2026-04-15', endAt: '2026-05-15', visible: false },
];

/* ── 방문 통계 ────────────────────────────────────────────────────── */

/*
  둘 다 `id` 를 갖는다. 어드민의 표 조각(`IrRecordTable`)이 줄마다 `id` 를 요구하기 때문이다 —
  줄의 차례가 바뀌어도 React 가 같은 줄임을 알아보게 하는 값이라, 통계처럼 지우고 다시 그리는
  값에도 있어야 한다.
*/
export type VisitPoint = { id: string; month: string; visits: number; inquiries: number };
export type PageVisit = { id: string; route: string; label: string; visits: number; staySeconds: number };

/**
 * 방문 통계.
 *
 * **프론트엔드 전용 씨앗이다.** 실제 방문 수를 재려면 분석 도구를 붙여야 하고, 그것은 개인정보
 * 처리방침에 무엇을 모으는지 적은 뒤에 할 일이다 — 지금 붙이면 화면에는 숫자가 뜨는데 그
 * 문서에는 그런 말이 없다.
 *
 * 그래서 여기 있는 숫자는 **화면의 모양을 잡기 위한 것**이고, 어드민 화면에도 그 사실을 적는다.
 */
export const VISIT_TREND: VisitPoint[] = [
  { id: 'V-202603', month: '2026-03', visits: 3120, inquiries: 14 },
  { id: 'V-202604', month: '2026-04', visits: 3480, inquiries: 19 },
  { id: 'V-202605', month: '2026-05', visits: 4010, inquiries: 22 },
  { id: 'V-202606', month: '2026-06', visits: 3890, inquiries: 17 },
  { id: 'V-202607', month: '2026-07', visits: 4620, inquiries: 26 },
  { id: 'V-202608', month: '2026-08', visits: 2140, inquiries: 11 },
];

export const PAGE_VISITS: PageVisit[] = [
  { id: 'P-01', route: '/', label: '홈', visits: 8420, staySeconds: 96 },
  { id: 'P-02', route: '/solutions/mes', label: 'Cloud MES', visits: 3180, staySeconds: 142 },
  { id: 'P-03', route: '/products', label: '제품', visits: 2760, staySeconds: 88 },
  { id: 'P-04', route: '/solutions/erp', label: 'Cloud ERP', visits: 2410, staySeconds: 131 },
  { id: 'P-05', route: '/support/contact', label: '문의하기', visits: 1890, staySeconds: 174 },
  { id: 'P-06', route: '/about', label: '회사 소개', visits: 1540, staySeconds: 71 },
  { id: 'P-07', route: '/support/faq', label: 'FAQ', visits: 1120, staySeconds: 118 },
];

/**
 * 회사 홈페이지의 문의 — **B2C 쇼핑몰의 `INQUIRIES` 와 다른 값이다.**
 *
 * 쇼핑몰 문의는 주문·교환처럼 **산 사람**이 보내고, 여기 문의는 도입·투자처럼 **아직 사지 않은
 * 회사**가 보낸다. 묻는 것도(회사명·담당자명) 답하는 사람도 다르므로 한 통에 담지 않는다 —
 * 섞으면 상품 사이즈 문의와 기관 애널리스트의 물음이 같은 목록에 서고, 어느 쪽도 제때 답을
 * 못 받는다.
 */
export type SiteInquiryState = '접수' | '처리중' | '답변완료' | '보류';

export type SiteInquiry = {
  id: string;
  /** 보낸 사람이 고른 갈래 — 사이트 문의 양식의 첫 칸 */
  kind: string;
  /**
   * 보낸 회사가 있는 시·도.
   *
   * 묻는 이유는 통계가 아니라 **일정**이다. 스마트공장 구축은 현장을 보러 가야 하는 일이고,
   * 강원에서 온 문의와 성동구에서 온 문의는 첫 방문까지 걸리는 시간이 다르다. 답장에 적을
   * 일정이 달라지므로 받을 때 함께 받는다.
   */
  region: SiteRegion;
  company: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  /** 첨부파일 이름 — 없으면 빈 문자열 */
  attachment: string;
  state: SiteInquiryState;
  receivedAt: string;
};

/**
 * 시·도 열일곱.
 *
 * **전국을 빠짐없이 둔다.** 목록에 없는 지역에서 온 사람은 `기타` 를 고르는데, 그 순간
 * 그 문의는 어느 담당 구역에도 들지 않아 **아무도 자기 것이 아니라고 여긴다.** 열일곱은
 * 행정구역이 정한 수라 우리가 줄이고 늘릴 것이 아니다.
 *
 * 차례는 인구·산업단지가 아니라 **행정 표준 순서**다. 우리 기준으로 큰 곳을 앞에 두면
 * 고르는 사람이 자기 지역을 어림잡아 찾지 못하고 목록을 처음부터 읽는다.
 */
export const SITE_REGIONS = [
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
  '경기도',
  '강원특별자치도',
  '충청북도',
  '충청남도',
  '전북특별자치도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도',
] as const;

export type SiteRegion = (typeof SITE_REGIONS)[number];

/** 사이트 문의 양식이 보여 주는 갈래. 양식과 어드민 목록이 같은 것을 읽는다. */
export const SITE_INQUIRY_KINDS = [
  '도입 · 견적',
  '기술 지원',
  '주주 · 투자자',
  '기관 · 애널리스트',
  '언론',
  '기타',
] as const;

export const SITE_INQUIRIES: SiteInquiry[] = [
  {
    id: 'S-2041',
    kind: '도입 · 견적',
    region: '경기도',
    company: '대성정밀',
    name: '박정우',
    phone: '010-2841-7720',
    email: 'jw.park@example.com',
    message: '사출 6호기까지 설비 신호를 붙이려 합니다. 라인 3개 기준 견적과 구축 기간이 궁금합니다.',
    attachment: '설비목록.xlsx',
    state: '접수',
    receivedAt: '2026-08-05 09:41',
  },
  {
    id: 'S-2040',
    kind: '기술 지원',
    region: '경상남도',
    company: '한도기계',
    name: '이수현',
    phone: '010-9033-1187',
    email: 'sh.lee@example.com',
    message: 'MES 실적 집계가 야간 조에서만 30분씩 밀립니다. 로그를 어디서 보면 될까요.',
    attachment: '',
    state: '처리중',
    receivedAt: '2026-08-04 17:08',
  },
  {
    id: 'S-2039',
    kind: '기관 · 애널리스트',
    region: '서울특별시',
    company: '신성투자증권',
    name: '최민아',
    phone: '010-4417-6620',
    email: 'ma.choi@example.com',
    message: '올해 반기 실적과 수주 잔고 관련해 미팅을 요청드립니다.',
    attachment: '',
    state: '답변완료',
    receivedAt: '2026-08-03 11:26',
  },
  {
    id: 'S-2038',
    kind: '도입 · 견적',
    region: '인천광역시',
    company: '유진전자',
    name: '김도현',
    phone: '010-7712-3390',
    email: 'dh.kim@example.com',
    message: 'ERP 를 이미 쓰고 있는데 MES 만 얹는 것이 가능한지 확인하고 싶습니다.',
    attachment: '현행구성도.pdf',
    state: '답변완료',
    receivedAt: '2026-08-02 14:52',
  },
  {
    id: 'S-2037',
    kind: '언론',
    region: '서울특별시',
    company: '산업일보',
    name: '정하늘',
    phone: '010-2205-8814',
    email: 'hn.jung@example.com',
    message: '스마트공장 보급 사업 관련 인터뷰를 요청드립니다.',
    attachment: '',
    state: '보류',
    receivedAt: '2026-07-31 10:03',
  },
  {
    id: 'S-2036',
    kind: '도입 · 견적',
    region: '경상북도',
    company: '구미정공',
    name: '오세진',
    phone: '010-3318-4402',
    email: 'sj.oh@example.com',
    message: '2공장 신설에 맞춰 MES 를 처음부터 넣으려 합니다. 착공 전에 봐 주실 수 있을까요.',
    attachment: '배치도.pdf',
    state: '처리중',
    receivedAt: '2026-07-29 15:20',
  },
  {
    id: 'S-2035',
    kind: '기술 지원',
    region: '충청남도',
    company: '아산화학',
    name: '류지호',
    phone: '010-8820-1174',
    email: 'jh.ryu@example.com',
    message: '설비 신호가 하루에 두세 번 끊깁니다. 게이트웨이 쪽 문제인지 확인 부탁드립니다.',
    attachment: '',
    state: '답변완료',
    receivedAt: '2026-07-27 09:14',
  },
  {
    id: 'S-2034',
    kind: '도입 · 견적',
    region: '경기도',
    company: '평택메탈',
    name: '한소영',
    phone: '010-6612-9930',
    email: 'sy.han@example.com',
    message: 'ERP 를 쓰고 있는데 재고가 실제와 자꾸 어긋납니다. 현장 실적부터 잡아야 할 것 같습니다.',
    attachment: '',
    state: '접수',
    receivedAt: '2026-07-24 13:47',
  },
  {
    id: 'S-2033',
    kind: '도입 · 견적',
    region: '부산광역시',
    company: '사하기전',
    name: '문태현',
    phone: '010-2077-5518',
    email: 'th.moon@example.com',
    message: '스마트공장 지원사업으로 진행하려 합니다. 신청 서류에 필요한 견적을 받고 싶습니다.',
    attachment: '',
    state: '답변완료',
    receivedAt: '2026-07-21 16:31',
  },
  {
    id: 'S-2032',
    kind: '기술 지원',
    region: '경기도',
    company: '화성정밀',
    name: '배성우',
    phone: '010-4491-2263',
    email: 'sw.bae@example.com',
    message: 'CRM 에서 고객사 담당자 일괄 등록이 안 됩니다. 양식이 따로 있나요.',
    attachment: '고객목록.csv',
    state: '답변완료',
    receivedAt: '2026-07-18 10:52',
  },
  {
    id: 'S-2031',
    kind: '주주 · 투자자',
    region: '서울특별시',
    company: '개인',
    name: '윤재민',
    phone: '010-5540-8871',
    email: 'jm.yoon@example.com',
    message: '전자투표 참여 방법을 알고 싶습니다.',
    attachment: '',
    state: '답변완료',
    receivedAt: '2026-07-16 20:08',
  },
  {
    id: 'S-2030',
    kind: '도입 · 견적',
    region: '강원특별자치도',
    company: '원주산업',
    name: '조은별',
    phone: '010-7734-2205',
    email: 'eb.jo@example.com',
    message: '공정이 다섯 단계인데 아직 종이로 관리합니다. 어디서부터 손대야 할지 상담받고 싶습니다.',
    attachment: '',
    state: '보류',
    receivedAt: '2026-07-13 11:35',
  },
];
