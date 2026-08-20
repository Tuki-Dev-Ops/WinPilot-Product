import { writeFileSync } from 'node:fs';
import { FNB_BRAND } from '@winpilot/store';
import { ADMIN_SCREENS, CLIENT_SCREENS, SCREENS } from './lib/fnb-model';
import { esc, namedList, note, rich } from './lib/html';

/**
 * F&B 두 앱의 **업무 범위 정의서**를 만든다 — 계약 · 범위 · 책임 · 제외.
 *
 * ## 기능 명세서와 나눈 까닭
 * 한 파일에 다 담았더니 60쪽이 넘었고, 그중 대부분이 화면별 세부 항목이었다. 그러면 계약을
 * 맞추는 자리에서 화면 명세를 넘기게 되고, 개발자는 계약 조항 사이에서 자기 화면을 찾게 된다.
 *
 * 읽는 사람이 다르면 문서도 나뉜다. 이 문서가 답하는 것은 넷이다 — **무엇을 만드는가 ·
 * 어디까지 만드는가 · 무엇을 제공하지 않는가 · 누가 어디까지 맡는가.** 화면 안에서 무슨 일이
 * 벌어지는가는 「기능 명세서」(`pnpm fsd:build`)가 답한다.
 *
 * 두 문서는 **같은 기능 ID** 를 쓴다. 그래야 범위 정의서의 `MENU-002` 와 기능 명세서의
 * `MENU-002` 가 같은 화면을 가리킨다(`lib/fnb-model.ts`).
 *
 * ## 손으로 적지 않는다
 * 화면 목록을 옮겨 적으면 화면이 하나 늘 때 고칠 곳이 둘이 되고, 실제로는 한쪽만 고친다.
 * 그러면 계약 자리에서 코드와 문서가 다른 말을 한다. 여기 목록은 화면 등록부에서 읽는다.
 *
 * ## 범위 밖은 0 이 아니라 —
 * 이 과업에 없는 것에 `0` 을 적으면 **하기로 했는데 아직 안 한 것**으로 읽힌다. 따로 표를
 * 두고 왜 없는지를 적는다.
 *
 * ```
 * pnpm sow:build
 * ```
 */

const cells = (...values: string[]): string => `<tr>${values.map((one) => `<td>${one}</td>`).join('')}</tr>`;

/**
 * 세 칸짜리 표를 편다 — 첫 칸이 이어지면 묶는다.
 *
 * 「구분」이 줄마다 되풀이되면 어디서 갈래가 바뀌는지 눈으로 셈해야 한다. 갈래가 서너 줄로
 * 짧아 인쇄해도 한 쪽 안에 들어가므로, 묶어도 빈칸이 생기지 않는다.
 */
const grouped = (list: readonly [string, string, string][]): string =>
  list
    .map(([area, what, why], index) => {
      const first = list[index - 1]?.[0] !== area;
      /* 같은 이름이 떨어져서 두 번 나올 때를 대비해 **이어지는 만큼만** 센다. */
      let span = 0;
      while (list[index + span]?.[0] === area) span += 1;
      const head = first ? `<td class="d1" rowspan="${span}">${esc(area)}</td>` : '';
      return `<tr${first ? ' class="head"' : ''}>${head}<td class="d4">${rich(what)}</td><td class="memo">${note(why)}</td></tr>`;
    })
    .join('');

/* ── 2. 과업 범위 ──────────────────────────────────────────── */

const scopeRows = SCREENS.map((one) =>
  cells(
    `<code>${esc(one.featureId)}</code>`,
    esc(one.name),
    esc(one.menuPath),
    `<code>${esc(one.route)}</code>`,
    namedList(one.spec.actions),
  ),
).join('');

const totalActions = SCREENS.reduce((sum, one) => sum + one.spec.actions.length, 0);

/* ── 3. 책임 범위 ──────────────────────────────────────────── */

/**
 * 갈래마다 **어디서 끝나는가**를 적는다.
 *
 * 책임 범위에서 다투는 것은 맡았는가 아닌가가 아니라 **어디까지 하면 끝인가**다. 그래서
 * 「완료 기준」 칸을 따로 둔다 — 그 칸이 없으면 "다 됐다" 의 뜻이 서로 다른 채로 진행된다.
 */
const DUTY: [string, string, string][] = [
  [
    '기획',
    '화면 정의 · 세부 기능 정의 · 운영 정책 · IA · 화면 흐름',
    `화면 ${SCREENS.length}개에 대해 목적 · 세부 기능 · 정책이 「기능 명세서」에 적히고, 저장소의 문서 검사(\`docs:check\`)가 빈 자리 없이 통과한 상태입니다.`,
  ],
  [
    'UI 디자인',
    '디자인 토큰 · 공통 컴포넌트 · 화면별 구성 영역 · 반응형',
    '네 너비(1280 · 1024 · 768 · 390)에서 가로 스크롤이 없고, 저장소의 넘침 검사(`overflow:check`)가 통과한 상태입니다. 별도 시안 파일(PSD · AI)은 산출물이 아닙니다.',
  ],
  [
    'Front-End',
    `화면 ${SCREENS.length}개 구현 · 세부 기능 ${totalActions}건 · 입력 검증 · 예외 화면 처리`,
    '「기능 명세서」의 화면별 검수 기준을 모두 통과한 상태입니다. 값은 공유 패키지에서 읽으며, 서버 호출 지점은 한 곳으로 모아 둡니다.',
  ],
  [
    'Back-End',
    '**정의만 제공하고 구현은 제공하지 않습니다.** 화면별 데이터 연산 · 권한 · 항목 · 검증과 데이터 정책',
    '뒤에 맡는 쪽이 화면을 눌러 보지 않고도 착수할 수 있는 상태입니다. 실제 서버 · 데이터베이스 · API 구축은 **본 과업의 범위가 아닙니다.**',
  ],
  [
    '운영',
    '**제공하지 않습니다.**',
    '인수 시점의 산출물은 소스와 문서입니다. 호스팅 · 배포 · 콘텐츠 등록 대행은 포함하지 않습니다.',
  ],
];

/* ── 6. 변경 관리 기준 ─────────────────────────────────────── */

const CHANGE: [string, string, string][] = [
  [
    '접수',
    '변경 요청은 **기능 ID 를 지목해** 제기합니다.',
    '`MENU-002` 처럼 ID 로 지목하면 두 문서의 같은 자리를 함께 찾을 수 있습니다. 화면 이름으로 부르면 목록 · 상세 · 등록 중 어느 것인지 갈리지 않습니다.',
  ],
  [
    '판단',
    '요청을 **범위 안**과 **범위 밖**으로 나눕니다.',
    '이미 정의된 기능의 표현 · 배치 · 문구를 고치는 것은 범위 안입니다. 화면이 늘거나, 새 데이터 항목이 생기거나, 4장 「제외 범위」에 적힌 것을 하기로 하는 것은 범위 밖이며 별도 협의 대상입니다.',
  ],
  [
    '반영',
    '변경은 **화면 등록부와 화면 명세를 고치는 것**으로 시작합니다.',
    '그 둘을 고치면 본 문서와 기능 명세서가 함께 갱신되고, 저장소의 검사 도구가 빠진 곳을 잡아냅니다.',
  ],
  [
    '반영',
    '**문서만 고치거나 코드만 고치는 변경은 받지 않습니다.**',
    '한쪽만 고쳐 두면 다른 쪽이 조용히 낡은 상태로 남고, 그 사실은 한참 뒤 인수 자리에서 드러납니다.',
  ],
  [
    '기록',
    '변경 이력은 저장소의 이력으로 갈음합니다.',
    '별도 변경 관리 대장을 두지 않습니다. 두 벌이 되면 한쪽만 적히고, 그때부터 어느 쪽이 맞는지 확인할 방법이 없어집니다.',
  ],
];


/* ── 4. 제외 범위 ──────────────────────────────────────────── */

const OUT: [string, string, string][] = [
  ['BX', '로고 · BI 가이드 제작', '**BX 는 제공하지 않는 서비스입니다.** 로고는 원본 파일을 받아 그대로 씁니다 — 눈으로 보고 다시 그린 로고는 그 브랜드의 표장이 아닙니다.'],
  ['BX', '패키지 · 인쇄물 · 편집 디자인', 'BX 범위이므로 제공하지 않습니다. 본 과업은 웹 화면에 한정합니다.'],
  ['BX', 'SNS · 프로모션 콘텐츠 디자인', '같은 이유로 제공하지 않습니다.'],
  ['BX', '제품 · 모델 촬영 · 영상 제작', '메뉴 사진과 영상은 발주처가 제공합니다.'],
  ['기획', '경쟁사 분석 · 시장 조사', '발주처가 제공하는 브랜드 기준을 따릅니다.'],
  ['UI 디자인', '시안 파일 (PSD · AI)', '디자인은 실제로 동작하는 화면으로 인도합니다. 별도 시안 파일은 만들지 않습니다.'],
  ['Back-End', '서버 · 데이터베이스 **구현**', '**정의는 제공하고 구현은 제공하지 않습니다.** 화면별 데이터 연산 · 권한 · 항목 · 검증은 「기능 명세서」에, 보존 · 삭제 · 소멸 기준은 이 문서 5장에 있습니다. 그 둘이 뒤에 맡는 쪽의 착수 명세가 됩니다.'],
  ['Back-End', 'API 개발 · 배포', '같은 구분입니다. 화면이 필요로 하는 연산 · 권한 · 항목 · 검증은 「기능 명세서」에 정의해 두었습니다.'],
  ['Back-End', '회원 · 로그인 · 권한 **구현**', '화면까지만 만듭니다. 입력한 값은 지금은 어디로도 전송되지 않습니다.'],
  ['Back-End', '온라인 주문 · 결제', '**정의도 하지 않습니다.** 이 브랜드는 주문을 전화와 매장 방문으로 받습니다.'],
  ['Back-End', '메일 · 문자 발송', '정의하지 않습니다. 창업 문의는 값을 받는 양식까지 제공합니다.'],
  ['Back-End', '지도 · 예약 · POS 등 외부 연동', '정의하지 않습니다. 지도는 화면에서 지도 SDK 를 직접 부릅니다.'],
  ['운영', '서버 구성 · 배포 · 호스팅', '인수 시점의 산출물은 소스와 문서입니다.'],
  ['운영', '취약점 진단 · 보안 점검', '포함하지 않습니다. 「데이터 정책」의 보안 항목은 점검이 아니라 설계 기준입니다.'],
  ['운영', '콘텐츠 제작 · 등록 대행', '메뉴 사진과 문구는 발주처가 제공하며, 등록은 콘솔에서 직접 하십니다.'],
];


/* ── 5. 데이터 정책 ────────────────────────────────────────── */

const POLICY: [string, string, string][] = [
  [
    '수집',
    '수집 항목',
    '창업 상담 신청에서 받는 값 — 성함 · 연락처 · 지역 · 예산 · 하고 싶은 말. 실제 항목과 검증 규칙은 「기능 명세서」 `FRANCHISE-002` 의 「입력 데이터」와 같습니다.',
  ],
  [
    '수집',
    '수집 근거',
    '정보주체의 동의입니다. 신청 화면에 동의 여부를 따로 받는 칸이 있으며, 동의하지 않으면 접수되지 않습니다.',
  ],
  [
    '수집',
    '최소 수집',
    '상담에 필요하지 않은 값은 받지 않습니다. 항목을 늘릴 때에는 동의 문구도 함께 고쳐야 합니다.',
  ],
  [
    '보유',
    '보유 · 이용 기간',
    '**권고 — 상담 종료 후 3년.** 「전자상거래 등에서의 소비자보호에 관한 법률」 시행령이 소비자 불만 · 분쟁 처리 기록을 3년간 보존하도록 하는 것을 근거로 삼았습니다. 발주처 확인이 필요합니다.',
  ],
  [
    '보유',
    '기간의 기산점',
    '접수일이 아니라 **상담이 끝난 날**부터 셉니다. 접수일 기준으로 하면 상담이 길어진 건이 진행 중에 지워집니다.',
  ],
  [
    '삭제',
    '정보주체의 삭제 요청',
    '요청을 받으면 지체 없이 지웁니다. **권고 — 접수 후 10일 이내**, 「개인정보 보호법」의 열람 · 정정 · 삭제 처리 기한을 따랐습니다. 처리 결과를 요청인에게 알립니다.',
  ],
  [
    '삭제',
    '운영자의 삭제',
    '목록에서는 즉시 감추되 바로 지우지 않습니다. **권고 — 감춘 뒤 30일 보관 후 완전 삭제.** 잘못 지운 것을 되돌릴 창구가 없으면 운영자가 삭제 단추를 못 누릅니다.',
  ],
  [
    '삭제',
    '삭제 대상의 범위',
    '본문뿐 아니라 첨부 · 검색 색인 · 캐시에 남은 사본까지 함께 지웁니다. 한 곳만 지우면 검색 결과에는 계속 뜹니다.',
  ],
  [
    '소멸',
    '보유 기간 만료',
    '기간이 지난 값은 **자동으로 파기**합니다. 사람이 지우기로 하면 잊습니다. **권고 — 하루 한 번 정해진 시각에 도는 일괄 처리**로 그날 만료된 것을 처리합니다.',
  ],
  [
    '소멸',
    '미처리 문의의 자동 종결',
    '연락이 닿지 않아 멈춘 문의를 열린 채로 두면 처리 건수가 실제와 달라집니다. **권고 — 마지막 접촉일로부터 1년이 지나면 「종결」로 자동 전환**하고, 그때부터 보유 기간을 셉니다.',
  ],
  [
    '소멸',
    '파기 방법',
    '전자적 파일은 복구할 수 없는 방법으로 지웁니다. 출력물이 있다면 파쇄하거나 소각합니다.',
  ],
  [
    '소멸',
    '파기 기록',
    '무엇을 언제 몇 건 파기했는지 남깁니다. 개인정보 자체는 남기지 않고 건수와 시각만 남깁니다.',
  ],
  [
    '이력',
    '변경 이력',
    '등록 · 수정 · 삭제마다 **누가 · 언제 · 무엇을 바꿨는지**를 남깁니다. 값이 왜 이렇게 되어 있는지를 나중에 물을 곳이 여기뿐입니다. **권고 — 1년 보관.**',
  ],
  [
    '이력',
    '접근 기록',
    '개인정보가 담긴 창업 문의를 **열어 본 기록**을 남깁니다. 바꾼 기록만으로는 누가 들여다봤는지 알 수 없습니다.',
  ],
  [
    '권한',
    '운영자 권한',
    '콘솔은 인증된 운영자만 씁니다. **권고 — 창업 문의는 권한을 따로 나눕니다.** 메뉴 값을 고치는 일과 손님의 연락처를 보는 일은 같은 무게가 아닙니다.',
  ],
  [
    '권한',
    '권한 회수',
    '퇴사 · 담당 변경 시 계정을 즉시 막습니다. 콘솔에 운영자 관리 화면이 있으므로 그 화면에서 처리합니다.',
  ],
  [
    '보안',
    '전송 구간',
    '사이트와 콘솔 모두 HTTPS 로만 엽니다. 창업 문의는 개인정보가 오가는 길입니다.',
  ],
  [
    '보안',
    '저장 시 암호화',
    '**권고 — 연락처는 암호화해 저장**하고, 목록에서는 일부를 가려 보여 줍니다. 목록 화면은 여러 사람이 함께 보는 자리입니다.',
  ],
  [
    '백업',
    '백업 주기 · 보관',
    '**권고 — 하루 한 번, 30일 보관.** 백업본에도 같은 파기 정책이 걸립니다. 본체에서 지운 값이 백업에 남아 있으면 지운 것이 아닙니다.',
  ],
];


/**
 * 만든 날. 문서가 생성물이라 **언제 기준인가**가 곧 유효기간이다 — 날짜가 없으면 받는 쪽이
 * 지난 판을 최신으로 읽는다.
 */
const today = new Date().toLocaleDateString('ko-KR', { dateStyle: 'long' });

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>F&amp;B 업무 범위 정의서</title>
<style>
  /*
    인쇄를 먼저 생각한 판이다. 화면에서 예쁘게 보이는 것보다, A4 로 뽑았을 때 줄이 페이지
    사이에서 잘리지 않는 것이 중요하다.
  */
  @page { size: A4; margin: 14mm 12mm 16mm; }

  :root {
    --ink: #1a1c20;
    --muted: #5a6070;
    --faint: #939aa6;
    --line: #c9ced7;
    --band: #eceef2;
    --head: #f5f6f8;
    --d1: #f2f4f7;
    --accent: #1b5fc4;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    padding: 26px 22px 56px;
    background: #fff;
    color: var(--ink);
    font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", system-ui, sans-serif;
    font-size: 9.5pt;
    line-height: 1.62;
    /* 한글은 낱말 한가운데서 끊긴다. 띄어쓰기 단위로만 끊게 한다. */
    word-break: keep-all;
    overflow-wrap: break-word;
  }

  .sheet { max-width: 200mm; margin: 0 auto; }

  .title-row { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
  h1 { font-size: 17pt; margin: 0; letter-spacing: -0.02em; }
  h1 .dim { color: var(--faint); font-weight: 600; }
  .date { color: var(--muted); font-size: 9pt; font-style: italic; white-space: nowrap; }

  h2 {
    background: var(--band);
    border: 1px solid var(--line);
    text-align: center;
    font-size: 11pt;
    letter-spacing: 0.24em;
    padding: 6px;
    margin: 26px 0 10px;
    break-after: avoid;
  }
  h3 { font-size: 10pt; margin: 16px 0 6px; color: var(--accent); break-after: avoid; }
  p { margin: 6px 0; }
  .lead { color: var(--muted); margin: 0 0 8px; }

  table { width: 100%; border-collapse: collapse; margin: 4px 0 12px; }
  th, td { border: 1px solid var(--line); padding: 5px 7px; vertical-align: top; text-align: left; }
  thead th { background: var(--head); font-weight: 600; text-align: center; white-space: nowrap; }
  tbody tr { break-inside: avoid; }

  td.d1 { text-align: center; vertical-align: middle; background: var(--d1); font-weight: 700; }
  td.d4 { font-weight: 600; }
  td.memo { color: var(--muted); }
  td.memo ul { margin: 0; padding-left: 15px; }
  tbody tr.head > td { border-top: 1.4px solid #9aa1ad; }

  .common { margin-bottom: 16px; border: 1px solid var(--line); }
  .common th { background: var(--band); text-align: center; font-weight: 700; font-size: 10pt; padding: 5px; }
  .common td { padding: 10px 14px; }
  .common ol { margin: 0; padding-left: 18px; color: var(--muted); }
  .common li { margin: 2px 0; }
  .common li strong { color: var(--ink); }

  code {
    font-family: "Consolas", "D2Coding", ui-monospace, monospace;
    font-size: 0.92em;
    background: #f1f3f6;
    padding: 0.5px 3px;
    border-radius: 3px;
  }
  th code, td code { background: transparent; }
  .none { color: var(--faint); }

  /* 세부 기능 목록 — 번호가 기능 명세서 3절의 「기능 01 · 02」 와 같은 자리를 가리킨다. */
  ol.fn { margin: 0; padding-left: 20px; }
  ol.fn li { margin: 1px 0; }
  ol.fn li::marker { color: var(--faint); font-variant-numeric: tabular-nums; font-size: 8.5pt; }

  ul { margin: 4px 0; padding-left: 17px; }
  li { margin: 2px 0; }

  @media print { body { padding: 0; } }
</style>
</head>
<body>
<div class="sheet">

<div class="title-row">
  <h1>${esc(FNB_BRAND.name)} <span class="dim">업무 범위 정의서</span></h1>
  <div class="date">${esc(today)}</div>
</div>

<table class="common">
  <tr><th>공통사항</th></tr>
  <tr><td>
    <ol>
      <li>이 문서는 <strong>계약 · 범위 · 책임 · 제외 범위</strong>를 정하는 문서입니다. 화면 안에서 무슨 일이 벌어지는가는 <strong>별도 문서 「기능 명세서」</strong>에 있습니다.</li>
      <li>두 문서는 <strong>같은 기능 ID</strong> 를 씁니다. 회신 시 <code>MENU-002</code> 처럼 ID 로 지목해 주십시오. 화면 이름으로 부르면 목록 · 상세 · 등록 중 어느 것인지 갈리지 않습니다.</li>
      <li><strong>대상</strong> — F&amp;B 고객 사이트(<code>apps/fnb-client-a</code>)와 관리자(<code>apps/fnb-admin</code>) 한 쌍입니다.</li>
      <li><strong>범위 기준</strong> — 화면 ${SCREENS.length}개(고객 사이트 ${CLIENT_SCREENS.length} · 관리자 ${ADMIN_SCREENS.length}) · 세부 기능 ${totalActions}건입니다.</li>
      <li>본 문서의 화면 목록은 <strong>현재 구현된 것을 읽어 만든 값</strong>입니다. 예정이 아니라 저장소의 화면 등록부에서 기계로 뽑았습니다.</li>
      <li><strong>Back-End 는 정의만 제공하고 구현하지 않습니다.</strong> 필요한 연산 · 권한 · 항목 · 검증은 「기능 명세서」에, 보존 · 삭제 · 소멸 기준은 이 문서 5장 「데이터 정책」에 있습니다.</li>
      <li>5장에서 <strong>권고</strong>라고 적은 기간과 값은 <strong>확정된 것이 아닙니다.</strong> 근거로 삼은 법령을 함께 적었으나 실제 값은 발주처가 정합니다.</li>
      <li><strong>BX(로고 · BI · 패키지 · 촬영 · SNS 콘텐츠)는 제공하지 않습니다.</strong> 4장 「제외 범위」를 확인해 주십시오.</li>
      <li>메뉴 사진과 문구 등 <strong>콘텐츠는 발주처가 제공</strong>합니다. 본 과업은 받은 값을 화면에 세우는 일까지입니다.</li>
      <li>범위를 더하거나 빼는 절차는 6장 「변경 관리 기준」에 있습니다.</li>
    </ol>
  </td></tr>
</table>

<h2>1. 개 요</h2>

<h3>1.1 배경</h3>
<p>
  브랜드 사이트의 내용이 코드에 적혀 있으면 메뉴 가격 한 줄, 공지 한 건을 고치는 데에도
  개발자와 배포가 필요합니다. 그 결과 사이트는 만들어진 시점에 멈춰 있고, 실제 운영은 전화와
  종이로 돌아갑니다.
</p>

<h3>1.2 무엇을 만드는가</h3>
<p>
  <strong>고객 사이트</strong>와 <strong>그 내용을 고치는 관리자</strong> 한 쌍을 만듭니다.
  고객 사이트는 손님에게 무엇을 파는 집인지를, 예비 점주에게 얼마가 들고 얼마나 걸리는지를
  각각의 길에서 답합니다. 관리자는 사이트에 나가는 값을 운영자가 직접 고치는 자리입니다.
</p>
<p>
  두 앱은 <strong>같은 값 한 곳</strong>을 읽습니다. 값을 두 벌로 두면 어느 쪽이 맞는지 확인할
  방법이 없어지기 때문입니다.
</p>

<h3>1.3 전제</h3>
<ul>
  <li>본 단계에는 <strong>서버와 데이터베이스가 없습니다.</strong> 화면이 읽는 값은 공유 패키지에 담기며, 관리자에서 고친 값은 브라우저 안에서만 유지됩니다.</li>
  <li>메뉴 사진과 문구 등 콘텐츠는 <strong>발주처가 제공</strong>합니다.</li>
  <li>브랜드 로고는 <strong>원본 파일을 받아 그대로</strong> 사용합니다. 눈으로 보고 다시 그린 로고는 그 브랜드의 표장이 아닙니다.</li>
</ul>

<h2>2. 과 업 범 위</h2>
<p class="lead">어디까지 만드는가 — 화면 단위로 확정된 범위입니다. 이 표에 없는 화면은 범위 밖입니다.</p>

<table>
  <thead><tr><th style="width:110px">구분</th><th style="width:80px">화면 수</th><th style="width:80px">기능 수</th><th>범위</th></tr></thead>
  <tbody>
    ${cells('고객 사이트', String(CLIENT_SCREENS.length), String(CLIENT_SCREENS.reduce((sum, one) => sum + one.spec.actions.length, 0)), '브랜드 · 메뉴 · 인테리어 · 마케팅 · 매장안내 · 창업안내 · 고객센터 · 법적 고지. 창업 상담 신청 한 곳을 제외하면 모두 읽기 전용입니다.')}
    ${cells('관리자', String(ADMIN_SCREENS.length), String(ADMIN_SCREENS.reduce((sum, one) => sum + one.spec.actions.length, 0)), '대시보드 · 등록 · 창업 · 고객센터 · 배너 · 설정. 목록 · 상세 · 등록 세 꼴이 반복됩니다.')}
    ${cells('Back-End', '<span class="none">–</span>', '<span class="none">–</span>', '<strong>정의만 포함하고 구현은 포함하지 않습니다.</strong> 3장 「책임 범위」와 5장 「데이터 정책」을 확인해 주십시오.')}
  </tbody>
</table>

<h3>2.1 화면 목록</h3>
<table>
  <thead><tr><th style="width:82px">기능 ID</th><th style="width:92px">화면명</th><th style="width:146px">메뉴 경로</th><th style="width:114px">화면 경로</th><th>세부 기능</th></tr></thead>
  <tbody>${scopeRows}</tbody>
</table>

<h2>3. 책 임 범 위</h2>
<p class="lead">
  책임 범위에서 다투는 것은 맡았는가 아닌가가 아니라 <strong>어디까지 하면 끝인가</strong>입니다.
  그래서 「완료 기준」을 함께 적었습니다.
</p>
<table>
  <thead><tr><th style="width:82px">갈래</th><th style="width:240px">맡는 일</th><th>완료 기준</th></tr></thead>
  <tbody>${grouped(DUTY)}</tbody>
</table>

<h2>4. 제 외 범 위</h2>
<p class="lead">아래는 <strong>이번 과업에 포함하지 않습니다.</strong> 적어 두지 않으면 포함된 것으로 읽히기 때문에 따로 둡니다.</p>
<table>
  <thead><tr><th style="width:82px">갈래</th><th style="width:200px">항목</th><th>사유 · 지금 상태</th></tr></thead>
  <tbody>${grouped(OUT)}</tbody>
</table>

<h2>5. 데 이 터 정 책</h2>
<p class="lead">
  Back-End 를 맡는 쪽이 <strong>정해 놓고 시작해야 하는 것</strong>들입니다. 기능은 화면에서
  끌어낼 수 있지만 보존 기간과 파기 시점은 화면에 드러나지 않습니다.
  <strong>「권고」라고 적은 값은 확정된 것이 아니며</strong>, 근거로 삼은 법령을 함께 적었습니다.
</p>
<table>
  <thead><tr><th style="width:64px">구분</th><th style="width:150px">항목</th><th>정의 · 기준</th></tr></thead>
  <tbody>${grouped(POLICY)}</tbody>
</table>

<h2>6. 변 경 관 리 기 준</h2>
<table>
  <thead><tr><th style="width:64px">단계</th><th style="width:240px">기준</th><th>까닭</th></tr></thead>
  <tbody>${grouped(CHANGE)}</tbody>
</table>

</div>
</body>
</html>
`;

const out = 'FnB-업무범위정의서.html';
writeFileSync(out, html, 'utf8');
console.log(`${out} — 화면 ${SCREENS.length} · 세부 기능 ${totalActions} · 제외 ${OUT.length} · 정책 ${POLICY.length}`);
