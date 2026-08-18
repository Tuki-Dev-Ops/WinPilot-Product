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

/*
  기간 판정은 B2C 배너의 것을 그대로 쓴다. 같은 물음("지금 걸려 있는가")에 두 벌의 답이 있으면
  갈래마다 자정 언저리의 셈이 달라지고, 그 차이는 아무도 재현하지 못한다.
*/
import { scheduleState } from './banners';

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
  },
  {
    id: 'infra',
    no: '02',
    name: '인프라 서비스',
    body: [
      '서버·네트워크·백업을 클라우드에서 운영합니다. 공장 안에 서버실을 두지 않아도 됩니다.',
      '증설과 이중화, 장애 대응까지 맡으므로 현장은 생산에만 집중할 수 있습니다.',
    ],
  },
  {
    id: 'mes',
    no: '03',
    name: 'Cloud MES',
    body: [
      '설비·작업자·자재의 기록을 실시간으로 모아 하나의 규격으로 표준화합니다.',
      '비가동과 불량이 어느 공정에서 났는지 추적되어, 관리의 사각지대가 사라집니다.',
    ],
  },
  {
    id: 'erp',
    no: '04',
    name: 'Cloud ERP',
    body: [
      '수주에서 매입·생산·출하·정산까지를 하나의 자원으로 잇습니다.',
      '한 번 입력한 값이 다음 단계로 그대로 흐르므로, 부서마다 옮겨 적는 일이 사라집니다.',
    ],
  },
  {
    id: 'crm',
    no: '05',
    name: 'Cloud CRM',
    body: [
      '문의부터 상담·계약·유지보수까지 고객과의 모든 접점을 한 줄로 기록합니다.',
      '담당자가 바뀌어도 관계가 남고, 고객은 같은 설명을 두 번 하지 않습니다.',
    ],
  },
  {
    id: 'dxp',
    no: '06',
    name: 'Cloud DXP',
    body: [
      '고객이 만나는 화면을 블록을 놓아 구성합니다. 개발 없이 담당자가 직접 만듭니다.',
      'ERP·MES·CRM 의 데이터를 그대로 끌어다 쓰므로, 화면과 데이터가 따로 놀지 않습니다.',
    ],
  },
];

/**
 * 홈 카드에서 **더 읽으러 가는 곳** — 상세 화면이 정한다.
 *
 * ## 카드가 주소를 따로 갖고 있었다
 * 전에는 `SiteService` 에 `href` 가 있었다. 여섯이 각자 자기 화면을 갖기 전, 화면이 없는 것을
 * `/products` 로 보내야 했기 때문이다. 그런데 화면이 하나씩 생길 때마다 **두 곳을 함께 고쳐야**
 * 했고 — 상세 화면의 `href` 와 카드의 `href` — 실제로 Cloud CRM 하나가 뒤처져, 자기 화면이
 * 있는데도 홈에서 누르면 제품 목록으로 갔다. 그 어긋남은 홈을 눌러 봐야만 보인다.
 *
 * 지금은 카드가 주소를 갖지 않고 파는 것에게 물어본다. 고칠 자리가 하나면 뒤처질 자리도 없다.
 *
 * 못 찾았을 때 `/products` 로 보내는 것은 **닿을 수 없는 길**이다(여섯 다 `SOLUTIONS` 아니면
 * `SERVICE_DETAILS` 에 있다). 그래도 던지지 않는 이유: 값이 어긋나는 날 홈 화면 전체가 죽는
 * 것보다, 파는 것을 다 모아 둔 목록으로 보내는 편이 낫다.
 */
export function siteServiceHref(one: SiteService): string {
  return findOffering(one.id)?.href ?? '/products';
}

/* ── 파는 것 한 벌 ────────────────────────────────────────────────── */

/**
 * 상세 화면 하나가 다루는 값 — **제품이든 서비스든 같은 모양이다.**
 *
 * ## 왜 한 모양으로 묶었나
 * 처음에는 클라우드 제품 넷만 상세 화면을 가졌고, 그 값의 이름이 `Solution` 이었다. 그런데
 * 스마트 컨설팅과 인프라 서비스에도 같은 화면이 필요해지자 길이 둘로 갈렸다 — 값의 모양을
 * 하나 더 만들고 화면도 하나 더 만드는 길, 아니면 **모양을 같게 두고 화면을 나눠 쓰는 길.**
 *
 * 뒤를 택했다. 읽는 사람이 묻는 것이 여섯 다 같기 때문이다 — 무엇이 불편한가 · 어떻게
 * 푸는가 · 어디서 붙는가 · 무엇이 달라지는가 · 우리 업종인가 · 얼마나 걸리는가. 파는 것이
 * 제품인지 사람이 붙는 일인지는 **파는 쪽의 사정**이지 읽는 쪽의 물음이 아니다.
 *
 * 화면을 나눠 쓰면 덤도 따라온다: 한 화면에만 칸을 더하는 일이 생기지 않는다. 여섯을 나란히
 * 열어 놓고 견주는 사람에게는 그 차이가 가장 먼저 보인다.
 */
export type Offering = {
  id: string;
  /**
   * 화면에 서는 이름 **그대로** — `Cloud MES` · `스마트 컨설팅`.
   *
   * `name` 과 따로 두는 이유: 제품은 목록에서 `MES` 로, 화면에서는 `Cloud MES` 로 선다.
   * 화면이 `Cloud ${name}` 을 만들어 쓰면 **`Cloud 스마트 컨설팅`** 같은 말이 생긴다.
   */
  title: string;
  /** 더 읽으러 가는 곳. 여섯 다 자기 화면을 갖는다 */
  href: string;
  tagline: string;
  /**
   * 무엇을 푸는가 — 기능 목록이 아니라 문제를 적는다.
   *
   * 여기 있는 글은 **글자 그대로** 화면에 선다. 한때 `**왜 그만큼밖에**` 처럼 마크다운으로
   * 힘을 준 문장이 하나 있었고, 그 별표는 사이트와 어드민 양쪽에서 그대로 보였다. 어드민에서
   * 이 칸을 직접 고칠 수 있게 된 지금은 더 생기기 쉬운 실수라 여기 적어 둔다 — 힘을 주고
   * 싶으면 문장을 나누지, 기호를 넣지 않는다.
   */
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

/* ── 솔루션(클라우드 제품 넷) ─────────────────────────────────────── */

/**
 * 클라우드 제품 — `Offering` 에 **파는 쪽 사정**을 얹은 것.
 *
 * `name` 은 목록에서 쓰는 짧은 이름(`MES`), `visible` 은 메뉴에 세울지다. 서비스 둘에는 없는
 * 값이라 여기에만 둔다 — 공통 모양에 넣으면 서비스 쪽이 쓰지도 않는 칸을 채우게 된다.
 */
export type Solution = Offering & {
  id: 'erp' | 'mes' | 'crm' | 'dxp';
  /** 목록에서 쓰는 짧은 이름. 화면에 서는 이름은 `title` 이다 */
  name: string;

  /**
   * 사이트에 세울지.
   *
   * 끄면 메뉴 · 홈 카드 · 제품 목록에서 함께 사라진다. 상세 화면(`/solutions/mes` 같은 주소)은
   * 코드로 짜여 있어 주소를 직접 치면 열리는데, 그것까지 막지 않는 이유는 **아직 팔지 않는
   * 제품의 소개 화면을 미리 만들어 두고 링크만 감추는** 일이 실제로 흔하기 때문이다.
   */
  visible: boolean;
};

export const SOLUTIONS: Solution[] = [
  {
    id: 'erp',
    name: 'ERP',
    title: 'Cloud ERP',
    href: '/solutions/erp',
    tagline: '부서마다 흩어진 장부를 수주에서 정산까지 하나의 흐름으로',
    problem:
      '영업이 쓰는 표와 생산이 쓰는 표, 회계가 쓰는 표가 각각 따로 자라면서 같은 거래가 세 곳에 세 번 적힙니다. 그래서 월말 마감은 숫자를 내는 일이 아니라 서로 다른 세 숫자를 맞추는 일이 되고, 여기에만 며칠이 들어갑니다. 맞지 않는 자리를 거슬러 올라가 보면 대개 어느 한 곳에서 손으로 옮겨 적은 지점입니다.',
    approach:
      '수주에서 매입과 생산, 출하를 지나 정산에 이르기까지를 하나의 자원 위에 올려 한 번 입력한 값이 다음 단계로 그대로 흐르게 합니다. 부서마다 따로 적는 것이 아니라 같은 값을 각자의 관점에서 보게 됩니다.',
    outcomes: ['며칠씩 걸리던 월 마감이 하루로', '재고 장부와 회계 장부가 같은 숫자로', '부서마다 다시 옮겨 적는 일이 사라짐'],
    features: [
      { title: '수주 · 발주', desc: '견적에서 수주로, 수주에서 소요 자재 산출과 발주까지 끊기지 않고 이어져 중간에 다시 계산하는 일이 없습니다.' },
      { title: '재고 · 창고', desc: '입고와 출고, 재고 실사를 한 장부에서 보므로 창고가 여럿이어도 총량은 언제나 하나의 숫자입니다.' },
      { title: '원가 · 정산', desc: '자재비와 노무비, 경비를 제품별로 모아 실제 원가를 내고 견적가와 나란히 놓아 어디서 남고 어디서 빠졌는지를 봅니다.' },
      { title: '회계 전표', desc: '거래가 일어난 자리에서 전표가 만들어져, 월말에 몰아 적는 일 없이 마감이 시작됩니다.' },
    ],
    layers: [
      { name: '현장', desc: 'MES 가 모은 생산 실적과 자재 사용량이 사람의 손을 거치지 않고 그대로 올라옵니다.' },
      { name: '자원', desc: '수주와 발주, 재고와 원가가 하나의 자원 위에서 같은 기준으로 움직입니다.' },
      { name: '회계', desc: '전표와 마감이 이 층에서 정리되어 세무 신고에 필요한 장부가 그대로 나옵니다.' },
      { name: '경영', desc: '매출과 원가, 이익을 기간과 제품의 관점에서 갈라 봅니다.' },
    ],
    industries: ['기계 · 부품', '전기 · 전자', '화학 · 소재', '식음료', '자동차 부품'],
    steps: [
      { name: '진단', period: '2주', desc: '지금 쓰는 표와 절차를 그대로 받아, 어느 자리에서 값이 갈라지는지부터 찾습니다.' },
      { name: '설계', period: '3주', desc: '자원과 권한의 구조를 정합니다. 여기서 정한 것이 그대로 화면이 됩니다.' },
      { name: '구축 · 이관', period: '6~8주', desc: '기존 데이터를 옮긴 뒤 두 달치를 기존 방식과 나란히 돌려 숫자가 맞는지 확인합니다.' },
      { name: '안정화', period: '4주', desc: '실제 마감을 한 번 함께 돌리고, 그때 나온 것만 고쳐 넘겨드립니다.' },
    ],
    visible: true,
  },
  {
    id: 'mes',
    name: 'MES',
    title: 'Cloud MES',
    href: '/solutions/mes',
    tagline: '설비마다 다르던 기록을 현장의 표준 데이터로',
    problem:
      '설비마다 내보내는 신호의 모양이 달라 라인 전체를 같은 기준으로 놓고 보는 일이 어렵습니다. 어제 몇 개를 만들었는지는 알 수 있어도 왜 그만큼밖에 못 만들었는지는 결국 현장 사람에게 물어야 하고, 그 대답은 어디에도 기록으로 남지 않습니다. 원인이 남지 않으므로 같은 이유의 멈춤이 다음 달에도 되풀이됩니다.',
    approach:
      '설비와 작업자, 자재에서 나오는 기록을 실시간으로 모아 하나의 규격으로 표준화하고, 그 위에서 생산 실적부터 품질 추적까지가 같은 데이터를 보게 합니다. 단순 자동화를 넘어 왜 그만큼이었는지가 숫자로 남습니다.',
    outcomes: ['비가동의 원인이 코드와 숫자로 남음', '불량이 난 공정을 로트 단위로 추적', 'AI 판단(AX)의 입력이 되는 표준 데이터'],
    features: [
      { title: '생산 실적', desc: '작업지시부터 실적 집계까지 실시간으로 이어져, 어제 몇 개였는지가 아니라 지금 몇 개인지를 봅니다.' },
      { title: '설비 · 비가동', desc: '설비 신호를 받아 가동과 비가동을 자동으로 가르고, 멈춘 이유가 코드로 남아 원인별로 세어집니다.' },
      { title: '품질 · 추적', desc: '로트 단위로 자재와 공정을 이어 두므로, 불량이 나면 어느 자재가 어느 공정을 지나 어디까지 나갔는지를 거슬러 찾습니다.' },
      { title: '작업 표준', desc: '공정마다 지켜야 할 값을 정해 두고 벗어나는 순간 그 자리에서 알려, 다음 공정으로 넘어가기 전에 잡습니다.' },
    ],
    layers: [
      { name: '설비', desc: 'PLC 와 센서, 계측기에서 나오는 신호를 있는 그대로 받습니다.' },
      { name: '수집', desc: '설비마다 다른 모양을 하나의 규격으로 바꾸어, 위의 두 층이 설비 종류를 몰라도 되게 합니다.' },
      { name: '실행', desc: '작업지시와 실적, 품질과 추적이 이 표준 위에서 함께 돕니다.' },
      { name: '분석', desc: '비가동과 불량을 원인별로 세는 자리이자, AI 판단이 입력으로 삼는 자리입니다.' },
    ],
    industries: ['자동차 부품', '전기 · 전자', '기계 · 금속', '화학 · 소재', '식음료 · 제약'],
    steps: [
      { name: '현장 진단', period: '2주', desc: '설비가 어떤 신호를 내보내는지, 지금 무엇을 손으로 적고 있는지를 라인에서 직접 확인합니다.' },
      { name: '연동 설계', period: '3주', desc: '설비별 수집 방식과 표준 규격을 정합니다. 여기서 데이터의 모양이 정해집니다.' },
      { name: '구축 · 연동', period: '8~12주', desc: '설비를 한 대씩 붙입니다. 한 라인이 돌기 시작하면 그다음 라인은 눈에 띄게 빨라집니다.' },
      { name: '안정화', period: '4주', desc: '수집이 끊기는 자리를 찾아 메우고, 시스템의 실적과 현장의 실물이 맞을 때까지 함께 봅니다.' },
    ],
    visible: true,
  },
  {
    id: 'crm',
    name: 'CRM',
    title: 'Cloud CRM',
    href: '/solutions/crm',
    tagline: '담당자 머릿속의 관계를 회사에 남는 기록으로',
    problem:
      '누가 무엇을 언제 이야기했는지가 담당자의 기억과 개인 수첩에만 남습니다. 담당이 바뀌는 순간 그 이력이 통째로 사라지고, 고객은 몇 해 전에 한 이야기를 처음부터 다시 하게 됩니다. 갱신 시점이 지나서야 계약이 끝난 것을 아는 일도 같은 자리에서 생깁니다.',
    approach:
      '문의와 상담부터 계약과 유지보수까지 고객과 만나는 모든 접점을 한 줄의 기록으로 쌓아, 담당이 바뀌어도 관계가 회사에 남게 합니다. 다음 사람은 그 줄을 읽는 것으로 인수인계를 마칩니다.',
    outcomes: ['담당이 바뀌어도 관계가 이어짐', '계약이 끝나기 전에 갱신 신호를 봄', '고객이 같은 설명을 두 번 하지 않음'],
    features: [
      { title: '고객 · 접점', desc: '전화와 메일, 방문을 한 줄에 시간 순으로 쌓아 다음 사람이 그 줄만 읽으면 되게 합니다.' },
      { title: '영업 기회', desc: '견적에서 수주까지를 단계로 놓아, 어느 건이 어느 단계에서 멈춰 있는지가 목록에서 바로 보입니다.' },
      { title: '계약 · 갱신', desc: '만료일을 앞두고 미리 알리므로, 지나고 나서야 아는 일이 없어집니다.' },
      { title: '유지보수', desc: '접수부터 처리 완료까지 이력이 남아, 같은 문제가 몇 번째인지가 세어집니다.' },
    ],
    layers: [
      { name: '접점', desc: '문의와 상담, 방문이 들어오는 자리입니다.' },
      { name: '기록', desc: '누가 무엇을 언제 이야기했는지가 사람이 아니라 회사에 쌓입니다.' },
      { name: '영업', desc: '기회와 계약이 정해진 단계를 따라 움직입니다.' },
      { name: '연계', desc: 'ERP 의 수주와 정산으로 이어져, 판 것과 만든 것이 같은 숫자 위에 놓입니다.' },
    ],
    industries: ['제조 B2B', '설비 · 장비', '엔지니어링', 'SI · 솔루션', '유지보수 서비스'],
    steps: [
      { name: '현황 정리', period: '1주', desc: '지금 고객 정보가 어느 파일과 어느 수첩에 흩어져 있는지부터 모읍니다.' },
      { name: '설계', period: '2주', desc: '영업 단계와 권한을 정합니다. 여기서 정한 단계 이름이 그대로 목록의 갈래가 됩니다.' },
      { name: '구축 · 이관', period: '4~6주', desc: '기존 명단과 상담 이력을 옮깁니다. 중복은 옮기기 전에 합쳐 둡니다.' },
      { name: '안정화', period: '3주', desc: '실제 상담을 넣어 보며 빠진 칸과 쓰이지 않는 칸을 함께 정리합니다.' },
    ],
    visible: true,
  },
  {
    id: 'dxp',
    name: 'DXP',
    title: 'Cloud DXP',
    href: '/solutions/dxp',
    tagline: '고객이 만나는 화면을 코드가 아니라 블록으로',
    problem:
      '고객이 보는 화면의 문구 한 줄을 고치려 해도 개발자에게 부탁하고 배포를 기다려야 합니다. 며칠이 지나는 동안 담당자는 손을 놓고 있고, 급한 안내는 결국 화면 밖의 메일로 나갑니다. 화면과 데이터를 따로 관리하다 보면 같은 값이 두 곳에서 서로 다르게 적히기도 합니다.',
    approach:
      '고객과 협력사가 만나는 화면을 블록을 놓아 구성하고, ERP 와 MES, CRM 이 쌓아 둔 데이터를 그 블록에 그대로 묶습니다. 화면을 고치는 일이 개발 일정이 아니라 담당자의 일이 됩니다.',
    outcomes: ['문구와 배치를 담당자가 직접', '화면의 값과 시스템의 값이 하나로', '배포를 기다리는 시간이 사라짐'],
    features: [
      { title: '블록 편집', desc: '표와 그래프, 목록과 글을 끌어다 놓아 화면을 짜고 미리보기로 그 자리에서 확인합니다.' },
      { title: '데이터 연결', desc: 'ERP 와 MES, CRM 의 값을 블록에 바로 묶으므로 옮겨 적는 과정이 없습니다.' },
      { title: '권한 · 검토', desc: '고치는 사람과 내보내는 사람을 나누어, 검토를 지난 화면만 밖에 섭니다.' },
      { title: '이력 · 되돌리기', desc: '언제 무엇이 바뀌었는지가 남고, 문제가 생기면 이전 화면으로 되돌립니다.' },
    ],
    layers: [
      { name: '데이터', desc: '앞의 세 제품이 쌓아 둔 값이 이 층으로 올라옵니다.' },
      { name: '블록', desc: '표와 그래프, 목록과 글. 데이터를 담는 그릇입니다.' },
      { name: '화면', desc: '블록을 놓아 만든 한 장. 저마다 자기 주소를 갖습니다.' },
      { name: '배포', desc: '검토를 지난 화면이 공개되고, 되돌리기가 늘 함께 있습니다.' },
    ],
    industries: ['제조 B2B', '고객 포털', '대리점 · 협력사', '사내 업무 화면'],
    steps: [
      { name: '화면 정의', period: '1주', desc: '무엇을 누구에게 보일지 정합니다. 네 단계 가운데 여기가 가장 오래 걸립니다.' },
      { name: '블록 구성', period: '2주', desc: '담당자가 직접 짜고, 저희는 옆에서 봅니다.' },
      { name: '연결 · 검토', period: '2주', desc: '데이터를 묶고 고치는 권한과 내보내는 권한을 나눕니다.' },
      { name: '공개', period: '1주', desc: '주소를 열고 이력을 켭니다. 이때부터 되돌리기가 동작합니다.' },
    ],
    visible: true,
  },
];

export function findSolution(id: string): Solution | undefined {
  return SOLUTIONS.find((one) => one.id === id);
}

/**
 * 이 값이 클라우드 제품인가 — **제품에만 있는 칸을 그릴지**를 정한다.
 *
 * 제품과 서비스가 `Offering` 한 벌을 나눠 쓰는데 제품에만 있는 칸이 둘이다(`name` · `visible`).
 * 그 둘을 그릴지를 화면마다 `'visible' in one` 으로 판단하게 두면 판단하는 곳이 늘 때마다
 * **한 곳이 빠진다** — 빠진 화면에서는 숨겨 둔 제품이 노출로 보인다.
 */
export function isSolution(one: Offering): one is Solution {
  return 'visible' in one;
}

/* ── 미디어 ───────────────────────────────────────────────────────── */

export type MediaClip = {
  id: string;
  /** 어디에 실렸나 — 방송사·행사 이름. 제목만으로는 무게가 전해지지 않는다 */
  channel: string;
  title: string;
  /** 썸네일 무늬를 가르는 값. 영상 파일이 아직 없어 무늬로 대신한다 */
  seed: number;
  /**
   * 사이트에 세울지.
   *
   * 지우기와 따로 두는 이유: 내리는 까닭의 대부분이 **잠깐**이다 — 내용을 고치는 중이거나,
   * 아직 알릴 때가 아니거나. 지워 버리면 다시 세울 때 처음부터 적어야 하고, 그래서 실제로는
   * 아무도 지우지 않고 그냥 둔다.
   */
  visible: boolean;
};

/**
 * 홈 마지막 칸의 영상 목록.
 *
 * 제목을 **실제로 있을 법한 것**으로만 적는다. 수상·수출 실적처럼 검증되는 사실을 지어내면
 * 그것이 IR 화면에 실린 허위 기재가 된다 — 여기 있는 것은 전부 "무엇을 다뤘나" 수준이다.
 */
export const MEDIA_CLIPS: MediaClip[] = [
  { id: 'MC-005', channel: '기업 브랜드 영상', title: 'AX로 판단하고 RX로 실행하는 자율 제조', seed: 0, visible: true },
  { id: 'MC-004', channel: '제품 소개', title: 'Cloud MES — 설비 신호가 표준 데이터가 되기까지', seed: 1, visible: true },
  { id: 'MC-003', channel: '도입 사례', title: '수주에서 정산까지, 월 마감을 하루로 줄인 과정', seed: 2, visible: true },
  { id: 'MC-002', channel: '기술 세미나', title: '표준화된 제조 데이터 위에서 AI는 무엇을 판단하는가', seed: 3, visible: true },
  { id: 'MC-001', channel: '제품 소개', title: 'Cloud DXP — 코드 없이 화면을 만드는 자리', seed: 4, visible: true },
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
  /**
   * 사이트에 세울지.
   *
   * 지우기와 따로 두는 이유: 내리는 까닭의 대부분이 **잠깐**이다 — 내용을 고치는 중이거나,
   * 아직 알릴 때가 아니거나. 지워 버리면 다시 세울 때 처음부터 적어야 하고, 그래서 실제로는
   * 아무도 지우지 않고 그냥 둔다.
   */
  visible: boolean;
};

export const CREDENTIALS: Credential[] = [
  {
    id: 'C-001',
    kind: '특허',
    title: '제조 실행 데이터의 표준화 및 이상 탐지 방법',
    number: '10-0000000',
    issuer: '특허청',
    acquiredAt: '2024-08-21',
    visible: true,
  },
  {
    id: 'C-002',
    kind: '특허',
    title: '공정 로봇의 작업 순서 자동 결정 시스템',
    number: '10-0000001',
    issuer: '특허청',
    acquiredAt: '2025-03-14',
    visible: true,
  },
  {
    id: 'C-003',
    kind: '인증',
    title: 'ISO/IEC 27001 정보보호 경영시스템',
    number: 'KR-000000',
    issuer: '한국인정지원센터',
    acquiredAt: '2024-11-05',
    visible: true,
  },
  {
    id: 'C-004',
    kind: '인증',
    title: 'GS 인증 1등급 (소프트웨어 품질)',
    number: 'GS-00-0000',
    issuer: '한국정보통신기술협회',
    acquiredAt: '2025-06-30',
    visible: true,
  },
  {
    id: 'C-005',
    kind: '수상',
    title: '스마트제조혁신대상 장관 표창',
    number: '-',
    issuer: '중소벤처기업부',
    acquiredAt: '2025-11-20',
    visible: true,
  },
];

/* ── FAQ ──────────────────────────────────────────────────────────── */

export type SiteFaq = {
  id: string;
  group: '도입' | '기술' | '지원';
  question: string;
  answer: string;
  /**
   * 사이트에 세울지.
   *
   * 지우기와 따로 두는 이유: 내리는 까닭의 대부분이 **잠깐**이다 — 내용을 고치는 중이거나,
   * 아직 알릴 때가 아니거나. 지워 버리면 다시 세울 때 처음부터 적어야 하고, 그래서 실제로는
   * 아무도 지우지 않고 그냥 둔다.
   */
  visible: boolean;
};

export const SITE_FAQS: SiteFaq[] = [
  {
    id: 'F-01',
    group: '도입',
    question: '도입까지 얼마나 걸리나요?',
    answer:
      '표준 구성은 계약 후 6~8주입니다. 기존 설비와 연동하거나 공정을 새로 정의해야 하면 그만큼 늘어납니다. 첫 상담에서 현장을 보고 기간을 먼저 말씀드립니다.',
    visible: true,
  },
  {
    id: 'F-02',
    group: '도입',
    question: '쓰던 시스템의 데이터를 옮길 수 있나요?',
    answer:
      '옮깁니다. 다만 옛 데이터의 모양이 표준과 다르면 그대로 넣지 않고 규격을 맞춘 뒤 넣습니다 — 모양이 다른 값을 그냥 넣으면 그때부터 통계가 맞지 않습니다.',
    visible: true,
  },
  {
    id: 'F-03',
    group: '기술',
    question: '클라우드만 되나요, 자체 서버에도 설치되나요?',
    answer:
      '둘 다 됩니다. 망 분리가 필요한 현장은 자체 서버에 설치하고, 그 경우 갱신 주기와 원격 지원 범위가 달라집니다.',
    visible: true,
  },
  {
    id: 'F-04',
    group: '기술',
    question: '설비가 오래되어 데이터를 못 내보내는데요?',
    answer:
      '신호를 읽을 수 있으면 게이트웨이를 붙여 받습니다. 아예 못 읽는 설비는 작업자 입력으로 대신하되, 그 값은 자동 수집분과 구분해 표시합니다 — 섞어 두면 어디까지가 실제 측정인지 알 수 없습니다.',
    visible: true,
  },
  {
    id: 'F-05',
    group: '지원',
    question: '장애가 나면 어떻게 연락하나요?',
    answer:
      '고객 포털의 문의로 접수하시면 급한 것부터 먼저 봅니다. 생산이 멈춘 장애는 전화로도 알려 주세요 — 문의만 남기면 담당자가 확인할 때까지 시간이 걸립니다.',
    visible: true,
  },
  {
    id: 'F-06',
    group: '지원',
    question: '유지보수 범위가 어떻게 되나요?',
    answer:
      '장애 대응과 정기 갱신이 기본입니다. 새 공정을 추가하거나 화면을 새로 만드는 일은 별도 계약입니다 — 그 경계를 계약서에 적어 두므로 나중에 다투지 않습니다.',
    visible: true,
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
/**
 * 업태와 업종 — **사업자등록증에 적힌 그대로 골라야 하는 값.**
 *
 * ## 왜 고르게 하고 적게 두지 않나
 * 손으로 적으면 같은 것이 여러 말로 남는다 — `소프트웨어개발` · `소프트웨어 개발업` ·
 * `소프트웨어 개발 및 공급업`. 세금계산서와 계약서에 이 말이 그대로 들어가는데, 등록증과
 * 한 글자라도 다르면 상대 회사 회계팀이 되묻는다. 실제로 그 되물음이 정산을 며칠 늦춘다.
 *
 * 목록은 **한국표준산업분류의 대분류**를 따른다. 우리가 지어낸 갈래를 쓰면 등록증에 없는 말을
 * 고르게 되어 손으로 적는 것과 같아진다.
 *
 * ## 업종이 업태에 딸려 있다
 * 업종은 업태 아래의 세분류다. 둘을 따로 고르게 두면 `건설업 · 소프트웨어 개발업` 같은 짝이
 * 만들어지고, 그 짝은 등록증에 있을 수 없다. 그래서 업태를 바꾸면 업종을 다시 고르게 한다.
 *
 * 여기 없는 업종이 있을 수 있다 — 표준분류의 세분류는 천 개가 넘는다. 우리가 실제로 쓰는
 * 것만 담고, 없으면 코드에 더한다. 자유 입력 칸을 열어 두지 않는 이유는 위와 같다.
 */
export const BUSINESS_TYPES = [
  '정보통신업',
  '제조업',
  '전문 · 과학 및 기술 서비스업',
  '도매 및 소매업',
  '건설업',
  '교육 서비스업',
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const BUSINESS_ITEMS: Record<BusinessType, readonly string[]> = {
  정보통신업: [
    '소프트웨어 개발 및 공급업',
    '응용 소프트웨어 개발 및 공급업',
    '시스템 소프트웨어 개발 및 공급업',
    '컴퓨터 프로그래밍 · 시스템 통합 및 관리업',
    '자료 처리 · 호스팅 및 관련 서비스업',
    '포털 및 기타 인터넷 정보매개 서비스업',
  ],
  제조업: [
    '전자부품 제조업',
    '측정 · 시험 · 항해 · 제어 및 기타 정밀기기 제조업',
    '특수 목적용 기계 제조업',
    '일반 목적용 기계 제조업',
  ],
  '전문 · 과학 및 기술 서비스업': [
    '경영 컨설팅업',
    '기타 엔지니어링 서비스업',
    '기타 기술 시험 · 검사 및 분석업',
    '그 외 기타 과학기술 서비스업',
  ],
  '도매 및 소매업': [
    '컴퓨터 및 주변장치 · 소프트웨어 도매업',
    '산업용 기계 및 장비 도매업',
    '전자상거래 소매업',
  ],
  건설업: ['건물 설비 설치 공사업', '산업설비 설치 공사업'],
  '교육 서비스업': ['기타 기술 및 직업훈련학원', '그 외 기타 교육기관'],
};

export const SITE_SUPPLIER = {
  name: '스페이스플래닝',
  ceo: '정현우',
  businessNumber: '000-00-00000',
  /** 통신판매업 신고번호. 온라인으로 파는 것이 있으면 반드시 적는다 */
  mailOrderNumber: '제2026-서울성동-0000호',
  /** 업태 · 업종 — 등록증에 적힌 그대로. `BUSINESS_TYPES` · `BUSINESS_ITEMS` 에서 고른다 */
  businessType: '정보통신업' as BusinessType,
  businessItem: '소프트웨어 개발 및 공급업',
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
  /**
   * 팝업 안에 서는 본문 — **팝업에만 쓴다.**
   *
   * 한때 이 줄이 없어서 팝업이 `title` 하나만 갖고 있었다. 그런데 팝업이 뜨는 까닭은 늘
   * "언제부터 언제까지 무엇이 어떻게 된다" 를 알리기 위해서다 — 제목 한 줄로 그것을 담으면
   * 제목이 문단이 되고, 그 문단이 목록의 한 칸에 그대로 들어가 표가 무너진다.
   *
   * 메인 비주얼에는 없다. 그쪽은 큰 글씨 한 줄이 서는 자리라 본문이 설 데가 없다.
   */
  body?: string;
  /** 더 읽을 곳 — 비우면 단추가 서지 않는다 */
  linkUrl?: string;
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
  {
    id: 'B-002',
    slot: '팝업',
    title: '하계 휴무 안내',
    body: '8월 3일(월)부터 8월 7일(금)까지 하계 휴무입니다. 이 기간에 들어온 문의는 8월 10일(월)부터 차례로 답해 드립니다.',
    linkUrl: '/support/notices',
    startAt: '2026-07-25',
    endAt: '2026-08-31',
    visible: true,
  },
  {
    id: 'B-001',
    slot: '팝업',
    title: '개인정보 처리방침 개정 예고',
    body: '문의 양식이 받는 항목이 바뀌면서 개인정보 처리방침을 함께 고칩니다. 바뀌는 것은 수집 항목과 보관 기간 두 가지입니다.',
    linkUrl: '/privacy',
    startAt: '2026-04-15',
    endAt: '2026-05-15',
    visible: false,
  },
];

/**
 * 지금 걸린 배너 · 팝업.
 *
 * ## 화면마다 기간을 다시 재지 않는다
 * `scheduleState()` 한 벌이 판정하고, 사이트는 그 결과만 받는다. 화면에
 * `visible && today >= startAt` 을 적어 두면 새 화면을 만드는 날 그 한 줄을 빠뜨리고,
 * 그러면 **끝난 배너가 그 화면에만 다시 뜬다.**
 *
 * ## 이름에 `Site` 가 붙는 까닭
 * F&B 쪽에 같은 뜻의 `liveBanners` · `livePopups` 가 이미 있고, 두 파일이 같은 꾸러미에서
 * 함께 내보내진다. 이름이 겹치면 한쪽이 조용히 덮인다.
 *
 * @param today 오늘 — 서버가 없으므로 화면 밖에서 받는다(`lib/today.ts`)
 */
export function liveSiteBanners(today: string): SiteBanner[] {
  return SITE_BANNERS.filter(
    (one) => one.slot === '메인 비주얼' && scheduleState(one, today) === '노출 중',
  );
}

export function liveSitePopups(today: string): SiteBanner[] {
  return SITE_BANNERS.filter((one) => one.slot === '팝업' && scheduleState(one, today) === '노출 중');
}

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

/* ── 한 줄 찾기 ───────────────────────────────────────────────────── */

/*
  상세 화면이 주소의 id 로 줄 하나를 찾는다. 화면마다 `find` 를 적으면 **없을 때 무엇을 돌려줄지**가
  화면마다 갈린다 — 어떤 곳은 `undefined`, 어떤 곳은 첫 줄. 여기 한 벌로 두고 전부 `undefined` 다.
*/

export function findSiteNotice(id: string): SiteNotice | undefined {
  return SITE_NOTICES.find((one) => one.id === id);
}

export function findMediaClip(id: string): MediaClip | undefined {
  return MEDIA_CLIPS.find((one) => one.id === id);
}

export function findSiteFaq(id: string): SiteFaq | undefined {
  return SITE_FAQS.find((one) => one.id === id);
}

export function findCredential(id: string): Credential | undefined {
  return CREDENTIALS.find((one) => one.id === id);
}

export function findSiteBanner(id: string): SiteBanner | undefined {
  return SITE_BANNERS.find((one) => one.id === id);
}

export function findSiteInquiry(id: string): SiteInquiry | undefined {
  return SITE_INQUIRIES.find((one) => one.id === id);
}

/* `findSolution` 은 `SOLUTIONS` 바로 아래에 이미 있다 — 값과 그것을 찾는 함수는 붙여 둔다. */

/**
 * 다음 코드 — `N-004` 다음은 `N-005`.
 *
 * 등록 화면이 코드를 미리 보여 줘야 하는데, 그 값은 **서버가 정할 일**이다. 서버가 없는 동안
 * 화면이 대신 세되 규칙은 한 곳에 둔다 — 화면마다 세면 자릿수가 갈리고(`N-5` · `N-005`),
 * 자릿수가 갈리면 목록에서 코드로 정렬한 차례가 어긋난다.
 */
export function nextSiteId(prefix: string, ids: readonly string[]): string {
  const numbers = ids
    .filter((id) => id.startsWith(`${prefix}-`))
    .map((id) => Number(id.slice(prefix.length + 1)))
    .filter((value) => Number.isFinite(value));

  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  /* 자릿수는 이미 있는 코드에서 배운다 — 손으로 정해 두면 값이 늘어난 날 `N-1000` 이 섞인다. */
  const sample = ids[0];
  const width = sample === undefined ? 3 : Math.max(3, sample.length - prefix.length - 1);
  return `${prefix}-${String(next).padStart(width, '0')}`;
}

/* ── 사이트에 나가는 것만 ──────────────────────────────────────────── */

/*
  `visible` 을 거르는 일을 화면마다 적지 않고 여기 한 벌로 둔다. 화면마다 적으면 새 화면을
  만드는 날 그 한 줄을 빠뜨리고, 그러면 **내려 둔 것이 그 화면에만 다시 뜬다** — 내린 사람은
  내린 줄 알고 있으므로 아무도 확인하지 않는다.

  이름을 `public…` 으로 맞춘다(공시의 `publicDisclosures` 와 같은 규칙) — 부를 때 이 값이
  밖으로 나가는 것임이 이름에서 보여야 한다.
*/

export function publicSolutions(): Solution[] {
  return SOLUTIONS.filter((one) => one.visible);
}

export function publicMediaClips(): MediaClip[] {
  return MEDIA_CLIPS.filter((one) => one.visible);
}

export function publicSiteFaqs(): SiteFaq[] {
  return SITE_FAQS.filter((one) => one.visible);
}

export function publicCredentials(): Credential[] {
  return CREDENTIALS.filter((one) => one.visible);
}

export function publicSiteNotices(): SiteNotice[] {
  return SITE_NOTICES.filter((one) => one.visible);
}

/* ── 서비스 상세(컨설팅 · 인프라) ─────────────────────────────────── */

/**
 * 사람이 붙어서 하는 일 둘 — 스마트 컨설팅 · 인프라 서비스.
 *
 * ## 왜 `SOLUTIONS` 와 나눠 두나
 * 모양(`Offering`)은 같지만 **성격이 다르다.** 클라우드 제품 넷은 계약하면 그날부터 쓰는
 * 것이고, 이 둘은 사람이 현장에 가서 하는 일이다. 그래서 PRODUCT 가 아니라 SOLUTION 메뉴에
 * 서고, 어드민에서 켜고 끄는 값(`visible`)도 갖지 않는다 — 서비스는 내리는 것이 아니라
 * 안 파는 것이다.
 *
 * ## 성과에 숫자를 적지 않는다
 * 제품 넷의 성과는 `월 마감이 며칠에서 하루로` 처럼 적혀 있다. 그것은 **그 제품이 하는 일**의
 * 결과라 값이 정해져 있다. 컨설팅의 성과는 현장마다 달라, 여기에 숫자를 적으면 그것이 약속이
 * 된다 — 지키지 못할 약속을 소개 화면에 적는 것은 파는 사람에게도 손해다.
 */
export const SERVICE_DETAILS: Offering[] = [
  {
    id: 'consulting',
    title: '스마트 컨설팅',
    href: '/solutions/consulting',
    tagline: '무엇을 도입할지가 아니라 어디부터 손댈지를 함께 정합니다',
    problem:
      '스마트공장을 해야 한다는 것은 알지만 어디서부터 손대야 할지가 정해지지 않습니다. 설비를 새로 사자는 이야기와 시스템부터 넣자는 이야기가 함께 나오는데, 어느 쪽이 먼저인지를 가릴 근거가 회사 안에 없습니다. 근거 없이 시작한 도입은 대개 쓰지 않는 화면 몇 개를 남기고 멈춥니다.',
    approach:
      '제품을 권하기 전에 현장을 먼저 봅니다. 설비와 공정, 인력의 지금을 데이터로 확인한 뒤 효과가 큰 순서대로 단계를 나누어 제안드립니다.',
    outcomes: [
      '무엇을 언제 할지가 문서로 남음',
      '지원사업 신청에 그대로 쓰는 근거',
      '도입 전에 기대 효과를 먼저 확인',
    ],
    features: [
      { title: '현장 진단', desc: '설비가 무엇을 내보내는지, 지금 무엇을 손으로 적는지를 라인에서 하나씩 확인합니다.' },
      { title: '공정 표준화', desc: '사람마다 다르게 하던 순서를 하나로 정리합니다. 시스템을 넣는 것은 그다음 일입니다.' },
      { title: '단계 설계', desc: '한 번에 다 바꾸지 않습니다. 효과가 큰 것부터 나누어 순서와 기간을 정합니다.' },
      { title: '지원사업 안내', desc: '스마트공장 보급사업처럼 쓸 수 있는 제도를 요건과 일정까지 함께 검토합니다.' },
    ],
    layers: [
      { name: '현장', desc: '설비와 작업자가 실제로 하는 일을 고치지 않고 그대로 받아 적습니다.' },
      { name: '진단', desc: '어느 공정에서 시간이 새고 어디서 값이 갈라지는지를 데이터로 짚습니다.' },
      { name: '설계', desc: '고칠 것의 순서와 기간을 정합니다. 이 층의 결과가 그대로 제안서가 됩니다.' },
      { name: '이행', desc: '정한 순서대로 제품을 넣습니다. 넣지 않기로 한 것도 이유와 함께 문서에 남습니다.' },
    ],
    industries: ['기계 · 부품', '전기 · 전자', '자동차 부품', '화학 · 소재', '식음료 · 제약'],
    steps: [
      { name: '사전 협의', period: '1주', desc: '무엇이 가장 불편한지를 먼저 듣습니다. 여기서 진단의 범위가 정해집니다.' },
      { name: '현장 방문', period: '1~2주', desc: '라인을 직접 봅니다. 설비가 내보내는 신호와 손으로 적는 기록을 함께 확인합니다.' },
      { name: '진단 보고', period: '2주', desc: '어디서 얼마나 새는지를 현장에서 모은 숫자로 정리해 드립니다.' },
      { name: '로드맵', period: '1주', desc: '단계와 기간을 정합니다. 이번에 하지 않기로 한 것도 이유와 함께 적습니다.' },
    ],
  },
  {
    id: 'infra',
    title: '인프라 서비스',
    href: '/solutions/infra',
    tagline: '공장 안에 서버실을 두지 않아도 됩니다',
    problem:
      '시스템은 들어왔는데 그것이 도는 서버는 공장 한쪽에서 관리하게 됩니다. 밤에 멈추면 아침 출근 전까지 아무도 모르고, 담당자가 그만두면 접속 정보를 찾는 일부터 시작해야 합니다. 라인이 늘 때마다 서버를 얼마나 더 둘지도 매번 감으로 정하게 됩니다.',
    approach:
      '서버와 네트워크, 백업을 클라우드에서 운영하며 증설과 이중화부터 장애 대응까지를 저희가 맡습니다. 현장은 서버실이 아니라 생산에만 손을 쓰면 됩니다.',
    outcomes: [
      '멈춘 것을 저희가 먼저 알고 연락',
      '담당자가 바뀌어도 운영이 이어짐',
      '늘어난 라인만큼만 늘어나는 비용',
    ],
    features: [
      { title: '서버 운영', desc: '설치와 증설, 이중화를 맡습니다. 라인이 늘면 늘어난 만큼만 늘립니다.' },
      { title: '네트워크', desc: '공장과 클라우드를 잇되 설비망과 사무망은 나누어 두어, 한쪽의 문제가 다른 쪽으로 넘어가지 않게 합니다.' },
      { title: '백업 · 복구', desc: '날마다 받는 것에서 끝내지 않고 되살아나는지를 정기적으로 확인합니다.' },
      { title: '장애 대응', desc: '멈춘 것을 감시가 먼저 알립니다. 현장의 연락을 받고 시작하지 않습니다.' },
    ],
    layers: [
      { name: '현장망', desc: '설비와 게이트웨이가 붙는 자리. 사무망과 나누어 둡니다.' },
      { name: '연결', desc: '공장에서 클라우드까지의 길. 끊겼을 때 쓸 두 번째 길을 함께 둡니다.' },
      { name: '서버', desc: '제품이 도는 자리. 늘리고 줄이는 일이 이 층에서 일어납니다.' },
      { name: '감시 · 백업', desc: '멈춤과 되살림을 맡는 층으로, 이것이 있어야 나머지 셋이 사고가 아니라 일이 됩니다.' },
    ],
    industries: ['기계 · 부품', '전기 · 전자', '자동차 부품', '화학 · 소재', '식음료 · 제약'],
    steps: [
      { name: '현황 확인', period: '1주', desc: '지금 무엇이 어디서 돌고 있고 누가 관리하는지를 확인합니다.' },
      { name: '구성 설계', period: '2주', desc: '망을 나누고 이중화할 곳을 정합니다. 달마다 나가는 비용이 여기서 정해집니다.' },
      { name: '구축 · 이전', period: '3~6주', desc: '옮깁니다. 옮기는 동안 기존 것을 함께 돌려 라인이 멈추지 않게 합니다.' },
      { name: '운영 인계', period: '2주', desc: '감시와 연락 체계를 켭니다. 이때부터 멈춤을 저희가 먼저 압니다.' },
    ],
  },
];

/**
 * 주소의 id 로 **서비스만** 찾는다. 어드민의 서비스 상세가 쓴다.
 *
 * `findOffering` 을 대신 쓰지 않는 이유: 그러면 `/services/mes` 가 열린다. 제품을 서비스
 * 갈래에서 고칠 수 있게 되면 **같은 값을 고치는 자리가 셋**이 되고, 셋 중 어느 화면에서
 * 고쳤는지에 따라 보이는 칸이 달라진다.
 */
export function findService(id: string): Offering | undefined {
  return SERVICE_DETAILS.find((one) => one.id === id);
}

/**
 * 주소의 id 로 **제품이든 서비스든** 하나를 찾는다.
 *
 * 상세 화면이 여섯인데 찾는 곳이 둘이면 화면마다 `제품에서 먼저 찾고 없으면 서비스에서`
 * 를 적게 된다. 그 두 줄이 여섯 벌이 되면 그중 하나는 순서가 뒤집힌다.
 */
export function findOffering(id: string): Offering | undefined {
  return SOLUTIONS.find((one) => one.id === id) ?? SERVICE_DETAILS.find((one) => one.id === id);
}
