/**
 * IR 사이트의 값 — **어드민과 투자자 화면이 같은 것을 읽는다.**
 *
 * | 어디 | 무엇을 하는가 |
 * |---|---|
 * | `ir-admin` | IR 담당자가 **올린다**. 공시 원고를 쓰고 자료를 붙인다 |
 * | `ir-client-a` | 투자자가 **읽는다**. 올린 것이 그대로 보인다 |
 *
 * B2C 와 같은 이유로 값을 한 곳에 둔다 — 두 벌로 두면 어드민에서 올린 공시가 사이트에
 * 없거나, 사이트에만 남은 옛 재무가 계속 보인다. 그 어긋남은 **투자자가 물어볼 때** 드러나고,
 * 공시는 틀린 것이 나가면 정정 공시로만 고친다.
 *
 * ## B2C 와 나눠 두는 이유
 * 파는 것이 없다. 상품·주문·회원이 없고 대신 공시·재무·주주가 있다. 한 파일에 담으면 IR
 * 고객사의 값 옆에 `장바구니` 가 서게 된다.
 *
 * ## 공시는 올리는 것과 내보내는 것이 다르다
 * `state` 가 그 둘을 가른다. 원고(`작성 중`)는 사이트에 나타나지 않고, **게시(`공시됨`)한
 * 것만** 투자자 화면에 선다 — 검토 없이 나간 한 줄이 그대로 공시가 되는 것을 막는 장치다
 * (권한도 같은 기준으로 갈라 두었다: `permissions.ts` 의 `disclosure` · `disclosure.publish`).
 *
 * ## 출처
 * - https://kind.krx.co.kr/ — 한국거래소 상장공시시스템(KIND). 공시 구분과 제목 형식
 * - https://dart.fss.or.kr/ — 금융감독원 전자공시(DART). 정기·수시 공시의 갈래
 */

/* ── 회사 ─────────────────────────────────────────────────────────── */

export type IrCompany = {
  name: string;
  /** 법인명 — 사업자 등록에 적힌 대로 */
  nameEn: string;
  /**
   * 영문 표기에 쓰는 **짧은 이름**.
   *
   * `nameEn` 을 그대로 쓰면 `Spaceplanning Inc. Service` 처럼 법인 형태가 문장 가운데 낀다.
   * 화면의 영문 머리글은 이 값을 쓰고, 법인명이 필요한 자리(공시·계약)만 `nameEn` 을 쓴다.
   */
  brandEn: string;
  /** 종목 코드 — 여섯 자리 */
  ticker: string;
  market: '코스피' | '코스닥';
  ceo: string;
  /** 사업자등록번호 — 푸터에 적어야 하는 값 */
  businessNumber: string;
  /**
   * 개인정보보호책임자.
   *
   * 대표이사와 같은 사람인 경우가 많지만 **자리가 다르다.** 한 값으로 묶어 두면 담당자를
   * 따로 두는 날 코드를 고쳐야 하고, 그때까지 개인정보 문의가 대표에게 간다.
   */
  privacyOfficer: string;
  foundedAt: string;
  listedAt: string;
  address: string;
  /** IR 담당 창구 */
  irEmail: string;
  irPhone: string;
  intro: string;
};

export const IR_COMPANY: IrCompany = {
  name: '스페이스플래닝',
  nameEn: 'Spaceplanning Inc.',
  brandEn: 'Spaceplanning',
  ticker: '000000',
  market: '코스닥',
  ceo: '정현우',
  businessNumber: '000-00-00000',
  privacyOfficer: '정현우',
  foundedAt: '2019-04-01',
  listedAt: '2024-11-12',
  address: '서울특별시 성동구 왕십리로 000, 000호',
  irEmail: 'ir@example.com',
  irPhone: '02-0000-0000',
  intro:
    '자원 중심으로 화면을 설계하고, 디자인과 코드가 어긋나지 않는 운영 도구를 만듭니다. 매출의 대부분은 구독에서 나옵니다.',
};

/* ── 공시 ─────────────────────────────────────────────────────────── */

/** 공시 갈래. DART 의 구분을 투자자가 읽는 말로 옮긴 것이다. */
export type DisclosureKind = '정기' | '수시' | '공정공시' | '지분';

/**
 * 공시의 상태.
 *
 * `작성 중` 과 `검토 요청` 은 사이트에 나타나지 않는다 — 원고를 쓰는 사람과 회사 이름으로
 * 내보내는 사람이 다르기 때문이다.
 */
export type DisclosureState = '작성 중' | '검토 요청' | '공시됨' | '정정';

export type Disclosure = {
  id: string;
  kind: DisclosureKind;
  title: string;
  /** 본문. 어드민 편집기가 만든 HTML 이다 */
  body: string;
  /** 공시일. 아직 안 나갔으면 빈 값 */
  disclosedAt: string;
  state: DisclosureState;
  /** DART 원문 링크. 우리가 만든 글이 아니라 그쪽이 원본인 공시는 여기로 보낸다 */
  dartUrl: string;
  /** 정정 공시라면 무엇을 고쳤는지 */
  correctionOf?: string;
};

export const DISCLOSURES: Disclosure[] = [
  {
    id: 'D-2026-014',
    kind: '정기',
    title: '2026년 반기보고서 제출',
    body: '<p>2026년 상반기 실적과 재무 상태를 담은 반기보고서를 제출했습니다. 전문은 DART 에서 확인하실 수 있습니다.</p>',
    disclosedAt: '2026-08-14',
    state: '공시됨',
    dartUrl: 'https://dart.fss.or.kr/',
  },
  {
    id: 'D-2026-013',
    kind: '수시',
    title: '단일판매·공급계약 체결',
    body: '<p>국내 고객사와 구독 계약을 체결했습니다. 계약 금액은 최근 매출액의 5%를 넘습니다.</p>',
    disclosedAt: '2026-07-28',
    state: '공시됨',
    dartUrl: 'https://dart.fss.or.kr/',
  },
  {
    id: 'D-2026-012',
    kind: '공정공시',
    title: '2026년 연간 실적 전망',
    body: '<p>연간 매출 성장률 전망을 갱신했습니다. 이 자료는 예측 정보이며 실제 결과와 다를 수 있습니다.</p>',
    disclosedAt: '2026-07-10',
    state: '정정',
    dartUrl: 'https://dart.fss.or.kr/',
    correctionOf: 'D-2026-009',
  },
  {
    id: 'D-2026-015',
    kind: '수시',
    title: '자기주식 취득 결정',
    body: '<p>주주가치 제고를 위해 자기주식 취득을 결정했습니다.</p>',
    /* 아직 안 나간 원고 — 사이트에는 서지 않는다. */
    disclosedAt: '',
    state: '검토 요청',
    dartUrl: '',
  },
];

/** 사이트에 서는 공시만. 두 앱이 같은 기준으로 걸러야 어드민에서 본 것과 사이트가 갈리지 않는다. */
export function publicDisclosures(items: readonly Disclosure[] = DISCLOSURES): Disclosure[] {
  return items
    .filter((one) => one.state === '공시됨' || one.state === '정정')
    .sort((a, b) => b.disclosedAt.localeCompare(a.disclosedAt));
}

export function findDisclosure(id: string): Disclosure | undefined {
  return DISCLOSURES.find((one) => one.id === id);
}

/* ── 재무 ─────────────────────────────────────────────────────────── */

/** 금액 단위는 **백만 원**이다. 원 단위로 두면 자릿수가 길어 표에서 비교가 되지 않는다. */
export type FinancialRow = {
  period: string;
  revenue: number;
  operatingProfit: number;
  netProfit: number;
  assets: number;
  liabilities: number;
};

export const FINANCIALS: FinancialRow[] = [
  { period: '2023', revenue: 18_400, operatingProfit: 1_900, netProfit: 1_450, assets: 32_100, liabilities: 12_800 },
  { period: '2024', revenue: 24_700, operatingProfit: 3_100, netProfit: 2_480, assets: 41_600, liabilities: 15_200 },
  { period: '2025', revenue: 31_900, operatingProfit: 4_600, netProfit: 3_720, assets: 52_300, liabilities: 17_400 },
  { period: '2026 상반기', revenue: 18_050, operatingProfit: 2_780, netProfit: 2_210, assets: 56_900, liabilities: 18_100 },
];

/* ── 주가 ─────────────────────────────────────────────────────────── */

export type StockQuote = {
  /** 기준 시각 — 실시간이 아니라는 사실을 화면에 적어야 한다 */
  at: string;
  price: number;
  change: number;
  changeRate: number;
  volume: number;
  marketCap: number;
  high52: number;
  low52: number;
};

export const STOCK: StockQuote = {
  at: '2026-08-06 15:30',
  price: 18_450,
  change: 320,
  changeRate: 1.77,
  volume: 214_800,
  /** 백만 원 */
  marketCap: 264_300,
  high52: 21_900,
  low52: 12_400,
};

/* ── 배당 ─────────────────────────────────────────────────────────── */

export type Dividend = {
  year: string;
  /** 주당 배당금 (원) */
  perShare: number;
  /** 배당성향 (%) */
  payoutRatio: number;
  /** 시가배당률 (%) */
  yieldRate: number;
  recordDate: string;
  payDate: string;
};

export const DIVIDENDS: Dividend[] = [
  { year: '2025', perShare: 220, payoutRatio: 18.4, yieldRate: 1.3, recordDate: '2025-12-31', payDate: '2026-04-10' },
  { year: '2024', perShare: 150, payoutRatio: 16.1, yieldRate: 1.1, recordDate: '2024-12-31', payDate: '2025-04-11' },
];

/* ── 주주 ─────────────────────────────────────────────────────────── */

export type Meeting = {
  id: string;
  title: string;
  heldAt: string;
  place: string;
  /** 안건 목록 */
  agenda: string[];
  /** 전자투표를 받는가 */
  electronicVote: boolean;
  state: '예정' | '종료';
};

export const MEETINGS: Meeting[] = [
  {
    id: 'M-2026-01',
    title: '제8기 정기주주총회',
    heldAt: '2026-03-27',
    place: '서울특별시 성동구 왕십리로 000, 대회의실',
    agenda: ['제8기 재무제표 승인', '이사 선임', '이사 보수한도 승인'],
    electronicVote: true,
    state: '종료',
  },
  {
    id: 'M-2026-02',
    title: '임시주주총회',
    heldAt: '2026-09-18',
    place: '서울특별시 성동구 왕십리로 000, 대회의실',
    agenda: ['정관 일부 변경', '감사 선임'],
    electronicVote: true,
    state: '예정',
  },
];

export type Officer = {
  name: string;
  title: string;
  /** 사외이사인지 — 지배구조에서 가장 먼저 읽는 값이다 */
  outside: boolean;
  career: string;
};

export const OFFICERS: Officer[] = [
  { name: '홍승범', title: '대표이사', outside: false, career: '전 000 CTO' },
  { name: '김서연', title: '사내이사', outside: false, career: '전 000 재무총괄' },
  { name: '박지훈', title: '사외이사', outside: true, career: '000 회계법인 파트너' },
  { name: '이하늘', title: '감사', outside: true, career: '전 000 감사위원' },
];

export type Shareholder = {
  name: string;
  /** 지분율 (%) */
  share: number;
  kind: '최대주주' | '특수관계인' | '기관' | '소액주주';
};

export const SHAREHOLDERS: Shareholder[] = [
  { name: '홍승범', share: 32.4, kind: '최대주주' },
  { name: '특수관계인 계', share: 8.1, kind: '특수관계인' },
  { name: '기관투자자 계', share: 21.7, kind: '기관' },
  { name: '소액주주 계', share: 37.8, kind: '소액주주' },
];

/* ── 자료실 · 일정 ────────────────────────────────────────────────── */

export type IrDocument = {
  id: string;
  title: string;
  kind: '실적발표' | '사업보고서' | '기업설명회' | '기타';
  publishedAt: string;
  /** 내려받는 파일. 없으면 아직 붙이지 않은 것이다 */
  fileUrl: string;
  sizeLabel: string;
};

export const IR_DOCUMENTS: IrDocument[] = [
  { id: 'F-2026-03', title: '2026년 상반기 실적발표', kind: '실적발표', publishedAt: '2026-08-14', fileUrl: '#', sizeLabel: '3.2MB' },
  { id: 'F-2026-02', title: '2025년 사업보고서', kind: '사업보고서', publishedAt: '2026-03-20', fileUrl: '#', sizeLabel: '8.7MB' },
  { id: 'F-2026-01', title: '2026년 상반기 기업설명회 자료', kind: '기업설명회', publishedAt: '2026-06-05', fileUrl: '#', sizeLabel: '5.1MB' },
];

export type IrSchedule = {
  id: string;
  title: string;
  at: string;
  kind: '실적발표' | '기업설명회' | '주주총회' | '배당';
  note: string;
};

export const IR_SCHEDULES: IrSchedule[] = [
  { id: 'S-2026-04', title: '2026년 3분기 실적발표', at: '2026-11-13', kind: '실적발표', note: '장 마감 후 공시' },
  { id: 'S-2026-03', title: '임시주주총회', at: '2026-09-18', kind: '주주총회', note: '전자투표 가능' },
  { id: 'S-2026-02', title: '2026년 상반기 실적발표', at: '2026-08-14', kind: '실적발표', note: '' },
];

/** 앞으로 올 일정만. 지난 것을 함께 보여 주면 다음에 무엇이 있는지 찾기 어렵다. */
export function upcomingSchedules(today: string, items: readonly IrSchedule[] = IR_SCHEDULES): IrSchedule[] {
  return items.filter((one) => one.at >= today).sort((a, b) => a.at.localeCompare(b.at));
}

/* ── 공시 구독 ────────────────────────────────────────────────────── */

export type Subscriber = {
  id: string;
  email: string;
  /** 받고 싶은 갈래. 비우면 전부 */
  kinds: DisclosureKind[];
  subscribedAt: string;
  /** 메일 확인을 마쳤는가 — 남의 주소를 넣는 것을 막는 값이다 */
  verified: boolean;
};

export const SUBSCRIBERS: Subscriber[] = [
  { id: 'SB-001', email: 'investor1@example.com', kinds: ['정기', '수시'], subscribedAt: '2026-05-02', verified: true },
  { id: 'SB-002', email: 'fund@example.com', kinds: [], subscribedAt: '2026-06-19', verified: true },
  { id: 'SB-003', email: 'analyst@example.com', kinds: ['공정공시'], subscribedAt: '2026-08-01', verified: false },
];

/* ── 국문 · 영문 ──────────────────────────────────────────────────── */

/**
 * 두 언어를 짝으로 관리한다.
 *
 * 영문만 빠진 화면이 생기면 해외 투자자에게는 **그 자리가 없는 것**과 같다. 짝을 표로 두면
 * 무엇이 아직 안 됐는지가 목록에서 바로 보인다.
 */
export type LocalePair = {
  key: string;
  label: string;
  ko: string;
  en: string;
};

export const LOCALE_PAIRS: LocalePair[] = [
  { key: 'nav.disclosures', label: '공시 정보', ko: '공시 정보', en: 'Disclosures' },
  { key: 'nav.financials', label: '재무 정보', ko: '재무 정보', en: 'Financials' },
  { key: 'nav.stock', label: '주가 정보', ko: '주가 정보', en: 'Stock' },
  { key: 'nav.governance', label: '지배구조', ko: '지배구조', en: 'Governance' },
  { key: 'nav.library', label: 'IR 자료실', ko: 'IR 자료실', en: 'IR Library' },
  { key: 'nav.contact', label: 'IR 문의', ko: 'IR 문의', en: 'Contact IR' },
  /* 아직 영문이 없는 자리 — 목록에서 비어 있음이 보여야 한다. */
  { key: 'notice.forward', label: '예측 정보 주의문구', ko: '이 자료는 예측 정보이며 실제와 다를 수 있습니다.', en: '' },
];

/** 영문이 아직 없는 짝. 어드민 목록과 사이트 배지가 같은 기준으로 세어야 한다. */
export function missingEnglish(items: readonly LocalePair[] = LOCALE_PAIRS): LocalePair[] {
  return items.filter((one) => one.en.trim() === '');
}
