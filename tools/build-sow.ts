import { writeFileSync } from 'node:fs';
import { FNB_BRAND } from '@winpilot/store';
import { ADMIN_SCREENS, CLIENT_SCREENS, SCREENS, impactOf, type Screen } from './lib/fnb-model';
import { COPY } from './lib/fnb-copy';
import {
  DATA_POLICY,
  DOMAINS,
  DONE,
  ERRORS,
  NOT_BUILT,
  RELATIONS,
  ROLES,
  RULES,
  STATES,
  endpointsOf,
  screenOf,
} from './lib/fnb-backend';
import { esc, rich } from './lib/html';
import { formal } from './lib/polite';

/**
 * F&B 두 앱의 **업무 범위 정의서**를 만든다 — 구축 범위 · 책임 · 완료 기준.
 *
 * ## 이 문서가 답하는 것
 * 무엇을 제공하는가 · 각 화면의 목적은 무엇인가 · 사용자와 운영자가 무엇을 할 수 있는가 ·
 * Front-End 는 어디까지 구현하는가 · Back-End 는 구현하지 않더라도 무엇을 정의하는가 ·
 * 무엇이 제외되는가 · 각 영역은 어떤 상태가 되면 끝인가 · 인수 시점에 무엇이 제공되는가.
 *
 * 한 문장으로 줄이면 이렇다 — **누가 어디까지 책임지며, 어떤 상태가 되면 완료인가.**
 *
 * ## 무엇을 어디서 읽는가
 * - 기능 ID · 화면명 · 메뉴 경로 · 화면 경로 · 데이터 항목 : 화면 등록부와 화면 명세
 * - 화면 목적 · 주요 기능 : `lib/fnb-copy.ts` — 사람이 적고, 기능 수가 바뀌면 생성기가 잡는다
 * - 도메인 · 관계 · 규칙 · 상태 · 권한 · 예외 · 데이터 정책 : `lib/fnb-backend.ts`
 * - API 요구사항 : 화면 주소에서 끌어낸다
 *
 * 화면 목록을 손으로 옮겨 적으면 화면이 하나 늘 때 고칠 곳이 둘이 되고, 실제로는 한쪽만
 * 고친다. 그러면 계약 자리에서 코드와 문서가 다른 말을 한다.
 *
 * ```
 * pnpm sow:build
 * ```
 */

const cells = (...values: string[]): string => `<tr>${values.map((one) => `<td>${one}</td>`).join('')}</tr>`;

const table = (head: string, rows: string, klass = ''): string => `<table class="${klass}">
  <thead><tr>${head}</tr></thead>
  <tbody>${rows}</tbody>
</table>`;

const th = (label: string, width?: number): string =>
  `<th${width ? ` style="width:${width}px"` : ''}>${esc(label)}</th>`;

const bullets = (items: readonly string[]): string =>
  `<ul>${items.map((one) => `<li>${rich(one)}</li>`).join('')}</ul>`;

/**
 * 첫 칸이 이어지면 묶는다. 「구분」이 줄마다 되풀이되면 어디서 갈래가 바뀌는지 눈으로 셈해야
 * 한다. 같은 이름이 떨어져서 두 번 나올 때를 대비해 **이어지는 만큼만** 센다.
 */
const grouped = (list: readonly (readonly string[])[]): string =>
  list
    .map((row, index) => {
      const [area, ...rest] = row;
      const first = list[index - 1]?.[0] !== area;
      let span = 0;
      while (list[index + span]?.[0] === area) span += 1;
      const head = first ? `<td class="d1" rowspan="${span}">${esc(area ?? '')}</td>` : '';
      return `<tr${first ? ' class="head"' : ''}>${head}${rest.map((one) => `<td class="memo">${rich(one)}</td>`).join('')}</tr>`;
    })
    .join('');

/* ── 3. 화면 및 기능 정의 ──────────────────────────────────── */

/**
 * 손으로 적은 서술이 명세를 따라가고 있는지 본다.
 *
 * 항목이 아예 없으면 화면이 문서에서 통째로 빠지므로 만들다 멈춘다. 기능 수만 달라진 것은
 * 문서가 낡았다는 뜻이라 알리기만 하고 계속 만든다 — 그 화면을 빼는 것보다 낫다.
 */
const copyOf = (screen: Screen) => {
  const copy = COPY[screen.featureId];
  if (!copy) throw new Error(`fnb-copy.ts 에 ${screen.featureId}(${screen.name}) 가 없습니다.`);
  if (copy.from !== screen.spec.actions.length) {
    console.warn(
      `  [낡음] ${screen.featureId} ${screen.name} — 적을 당시 ${copy.from}건, 지금 ${screen.spec.actions.length}건`,
    );
  }
  return copy;
};

const screenRows = (list: readonly Screen[]): string =>
  list
    .map((one) => {
      const copy = copyOf(one);
      /* 메뉴 경로와 화면 경로를 한 칸에 겹쳐 둔다 — 둘을 갈라 두면 목적과 기능 칸이 좁아진다. */
      return cells(
        `<code>${esc(one.featureId)}</code>`,
        esc(one.name),
        `${esc(one.menuPath)}<span class="route"><code>${esc(one.route)}</code></span>`,
        rich(copy.purpose),
        bullets(copy.features),
      );
    })
    .join('');

const SCREEN_HEAD = th('기능 ID', 74) + th('화면명', 84) + th('경로', 138) + th('화면 목적') + th('주요 기능');

/* ── 2. 정보 구조 ──────────────────────────────────────────── */

const iaRows = (list: readonly Screen[]): string => {
  const groups = new Map<string, Screen[]>();
  for (const one of list) groups.set(one.group, [...(groups.get(one.group) ?? []), one]);
  return [...groups]
    .map(([group, screens]) =>
      cells(
        esc(group),
        String(screens.length),
        screens.map((one) => `<code>${esc(one.featureId)}</code> ${esc(one.name)}`).join(' · '),
      ),
    )
    .join('');
};

/* ── 4. 운영 정책 ──────────────────────────────────────────── */

/** 화면 명세의 운영 정책을 화면별로 모은다. 정책이 적힌 화면만 세운다. */
const policyRows = SCREENS.filter((one) => one.spec.policy?.length)
  .map((one) =>
    cells(
      `<code>${esc(one.featureId)}</code> ${esc(one.name)}`,
      esc(one.appLabel),
      bullets((one.spec.policy ?? []).map(formal)),
    ),
  )
  .join('');

/* ── 5. 책임 범위 ──────────────────────────────────────────── */

const totalActions = SCREENS.reduce((sum, one) => sum + one.spec.actions.length, 0);

/**
 * 여섯 칸으로 적는다 — 수행 목적 · 제공 범위 · 주요 산출물 · 완료 기준 · 제외 범위.
 *
 * 「포함 / 미포함」 두 칸으로 적으면 맡았다는 것까지만 합의되고, **어디까지 하면 끝인가**에서
 * 갈린다. 완료 기준 칸이 없으면 "다 됐다" 의 뜻이 서로 다른 채로 진행된다.
 */
const DUTY: [string, string, string, string, string, string][] = [
  [
    '기획',
    '구현과 검수의 근거가 되는 서비스 정의를 확정한다.',
    `서비스 구조 및 IA 정의 · 화면 목록 ${SCREENS.length}개 정의 · 화면별 목적 정의 · 세부 기능 ${totalActions}건 정의 · 사용자 흐름 정의 · 운영 정책 정의 · 주요 데이터 항목 정의 · 상태값 정책 정의 · 기능별 검수 기준 정의`,
    '업무 범위 정의서 · 기능 명세서 · IA 및 화면 흐름 정의 · 화면별 검수 기준',
    '정의된 전체 화면에 대해 화면 목적, 사용자 기능, 주요 데이터 항목, 운영 정책 및 검수 기준이 문서화되어 있으며, 구현 과정에서 기능 해석에 필요한 핵심 요구사항이 누락되지 않은 상태.',
    '시장 조사 · 경쟁사 분석 · 브랜드 전략 수립',
  ],
  [
    'UI 디자인',
    '서비스 구현을 위한 UI 구조와 디자인 시스템을 정의한다.',
    '디자인 토큰 정의 · 컬러 및 타이포그래피 규칙 · 간격과 레이아웃 규칙 · 공통 UI 컴포넌트 정의 · 화면별 UI 구조 정의 · 반응형 기준 정의 · 고객 서비스와 관리자 서비스 간 디자인 일관성 관리',
    '디자인 토큰 · 공통 컴포넌트 · 화면별 UI 구조 · 반응형 기준',
    '정의된 기준 해상도(1280 · 1024 · 768 · 390)에서 주요 화면이 정상적으로 표시되고, 의도하지 않은 가로 스크롤, 레이아웃 깨짐 또는 공통 UI 규칙의 불일치가 없는 상태.',
    'PSD · AI 등 별도 그래픽 원본 파일 · 로고 및 BI 제작 · 인쇄물 및 패키지 디자인 · 촬영 및 영상 제작',
  ],
  [
    'Front-End',
    '정의된 화면과 기능을 실제 동작하는 사용자 인터페이스로 구현한다.',
    `화면 ${SCREENS.length}개 구현 · 화면 간 이동 및 사용자 흐름 구현 · 검색 및 필터 · 목록 및 상세 · 등록 및 수정 · 입력값 및 필수값 검증 · 공개 및 노출 상태에 따른 UI 처리 · 빈 데이터 상태 · 오류 상태 · 기본 예외 처리 · 공통 컴포넌트 적용 · 공통 데이터 접근 구조 관리`,
    '고객 서비스 및 관리자 서비스 소스 · 공통 컴포넌트 · 공통 데이터 접근 구조',
    '기능 명세서의 화면별 검수 기준을 모두 통과하고 저장소의 품질 검사가 전부 통과한 상태. 화면이 사용하는 데이터 구조와 접근 방식은 공통 구조로 관리하며, 서버 연동이 필요한 영역은 향후 API 와 연결할 수 있도록 호출 지점을 일관된 구조로 구성한 상태.',
    '서버 연동 구현 · 실제 인증 처리 · 결제 및 외부 시스템 연동',
  ],
  [
    'Back-End 정의',
    '후속 서버 개발자가 화면 재분석 없이 착수할 수 있도록 요구사항과 인터페이스를 정의한다.',
    '도메인 및 관리 대상 정의 · 데이터 요구사항 정의 · 데이터 관계 정의 · API 인터페이스 요구사항 정의 · 비즈니스 규칙 및 검증 정책 정의 · 상태값 및 라이프사이클 정의 · 권한 요구사항 정의 · 예외 및 오류 응답 요구사항 정의',
    '본 문서 6장 「Back-End 요구사항 정의」 및 4.2 「데이터 관리 정책」',
    '6장의 완료 기준 열 가지(6.9)를 모두 충족한 상태. 관리 대상 · 데이터 항목 · 관계 · 연산 · 인터페이스 · 검증 · 상태 · 권한 · 예외가 각각 문서화되어 있는 상태.',
    '실제 서버 코드 · 데이터베이스 · API 구현',
  ],
  [
    'Back-End 구현',
    '**본 과업에서 제공하지 않는다.**',
    `${NOT_BUILT.join(' · ')} 미포함`,
    '해당 없음',
    '해당 없음 — 후속 과업으로 분리한다.',
    '위 전 항목',
  ],
  [
    '인프라 및 배포',
    '**본 과업에서 제공하지 않는다.**',
    '서버 인프라 구성 · CI 및 CD 구축 · 운영 환경 배포 · 도메인 및 인증서 관리 미포함',
    '해당 없음',
    '해당 없음 — 인수 시점의 산출물은 소스와 문서다.',
    '위 전 항목',
  ],
  [
    '운영 및 유지보수',
    '**본 과업에서 제공하지 않는다.**',
    '서비스 운영 대행 · 콘텐츠 제작 및 등록 대행 · 정기 유지보수 · 취약점 진단 미포함',
    '해당 없음',
    '해당 없음 — 별도 계약 대상이다.',
    '위 전 항목',
  ],
];

const dutyRows = DUTY.map(
  ([area, why, scope, output, done, out]) =>
    `<tr class="head"><td class="d1">${esc(area)}</td>${[why, scope, output, done, out].map((one) => `<td class="memo">${rich(one)}</td>`).join('')}</tr>`,
).join('');

/* ── 6. Back-End 요구사항 ──────────────────────────────────── */

const domainRows = DOMAINS.map((one) =>
  cells(
    esc(one.name),
    rich(one.purpose),
    one.screens.map((id) => `<code>${esc(id)}</code>`).join(' '),
    rich(one.exposed),
  ),
).join('');

/** 데이터 요구사항 — 관리자 상세 화면의 입력 항목이 곧 그 대상의 속성이다. */
const dataBlocks = DOMAINS.map((domain) => {
  const source = screenOf(domain.fieldsFrom);
  const fields = source?.spec.fields ?? [];
  if (fields.length === 0) {
    return `<h4>${esc(domain.name)}</h4>
<p class="tbd">데이터 항목이 화면 명세에 정의되어 있지 않습니다 — <strong>정의 필요</strong>. 현재는 조회 전용 화면만 존재하므로, 등록 및 수정 기능을 도입하는 시점에 항목을 함께 정의합니다.</p>`;
  }
  const rows = fields
    .map((one) =>
      cells(
        esc(one.name),
        rich(formal(one.desc)),
        one.required ? '필수' : '선택',
        one.rule ? rich(formal(one.rule)) : `<span class="none">${esc(one.type)}</span>`,
      ),
    )
    .join('');
  return `<h4>${esc(domain.name)}</h4>
<p class="from">항목 정의 출처 — <code>${esc(domain.fieldsFrom)}</code> ${esc(source?.name ?? '')} <code>${esc(source?.route ?? '')}</code></p>
${table(th('항목', 118) + th('설명') + th('필수 여부', 64) + th('입력 형태 · 정책', 210), rows)}`;
}).join('');

const apiBlocks = DOMAINS.map((domain) => {
  const rows = endpointsOf(domain)
    .map((one) =>
      cells(
        esc(one.action),
        `<code>${esc(one.method)}</code>`,
        `<code>${esc(one.path)}</code>`,
        rich(one.request),
        rich(one.response),
        rich(one.note),
      ),
    )
    .join('');
  return `<h4>${esc(domain.name)}</h4>
${table(th('기능', 116) + th('Method', 58) + th('Endpoint 예시', 150) + th('요청 데이터', 142) + th('응답 데이터', 142) + th('비고'), rows)}`;
}).join('');

const stateRows = STATES.map((one) => [one.domain, one.name, one.values, one.actor, one.effect, one.flow]);

/* ── 7. 완료 및 인수 기준 ──────────────────────────────────── */

const HANDOVER: [string, string][] = [
  [
    '소스 코드',
    `고객 서비스와 관리자 서비스 소스 일체 및 공통 패키지. 화면 ${SCREENS.length}개 · 세부 기능 ${totalActions}건.`,
  ],
  ['업무 범위 정의서', '본 문서. 구축 범위 · 책임 범위 · Back-End 요구사항 · 완료 및 인수 기준.'],
  ['기능 명세서', `화면 ${SCREENS.length}개의 기능 · 데이터 · 동작 · 조건 · 예외 · 검수 기준.`],
  ['IA 및 화면 흐름 정의', '서비스 구조와 화면 간 연결 관계.'],
  ['디자인 토큰 및 공통 컴포넌트', '색 · 타이포그래피 · 간격 규칙과 공통 UI 컴포넌트 일체.'],
  ['화면 캡처', `전 화면 ${SCREENS.length}장.`],
  ['품질 검사 도구', '명명 및 등록 일치 · 문서 누락 · 값의 출처 · 반응형 · 화면 무게 여섯 종.'],
];

const ACCEPT: string[] = [
  '정의된 전체 화면이 구현되어 있으며, 기능 명세서의 화면별 검수 기준을 모두 통과한다.',
  '기준 해상도 네 곳에서 의도하지 않은 가로 스크롤과 레이아웃 깨짐이 없다.',
  '저장소에 포함된 품질 검사 여섯 종이 전부 통과한다.',
  '화면 목록 · 세부 기능 · 데이터 항목이 문서와 코드에서 일치한다.',
  'Back-End 요구사항 정의가 6.9 의 완료 기준 열 가지를 충족한다.',
  '인수 산출물 일곱 종이 전달되어 있다.',
  '범위 밖으로 정의된 항목이 구현되지 않은 사실은 미완료가 아니라 <strong>범위 제외</strong>로 판정한다.',
];

const today = new Date().toLocaleDateString('ko-KR', { dateStyle: 'long' });

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>F&amp;B 업무 범위 정의서</title>
<style>
  /* 인쇄를 먼저 생각한 판이다. A4 로 뽑았을 때 줄이 페이지 사이에서 잘리지 않는 것이 중요하다. */
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
    --warn: #b8792a;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    padding: 26px 22px 56px;
    background: #fff;
    color: var(--ink);
    font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", system-ui, sans-serif;
    font-size: 9pt;
    line-height: 1.6;
    /* 한글은 낱말 한가운데서 끊긴다. 띄어쓰기 단위로만 끊게 한다. */
    word-break: keep-all;
    overflow-wrap: break-word;
  }

  .sheet { max-width: 200mm; margin: 0 auto; }

  .title-row { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
  h1 { font-size: 17pt; margin: 0; letter-spacing: -0.02em; }
  h1 .dim { color: var(--faint); font-weight: 600; }
  .date { color: var(--muted); font-size: 9pt; font-style: italic; white-space: nowrap; }

  h2 {
    background: var(--band);
    border: 1px solid var(--line);
    text-align: center;
    font-size: 11pt;
    letter-spacing: 0.22em;
    padding: 6px;
    margin: 26px 0 10px;
    break-after: avoid;
  }
  h3 { font-size: 10pt; margin: 18px 0 6px; color: var(--accent); break-after: avoid; }
  h4 { font-size: 9.5pt; margin: 14px 0 4px; break-after: avoid; }
  p { margin: 6px 0; }
  .lead { color: var(--muted); margin: 0 0 8px; }
  .from { color: var(--faint); font-size: 8.5pt; margin: 0 0 3px; }
  /* 화면 경로는 메뉴 경로 아래에 작게 붙인다. 한 칸에 둘이지만 읽는 차례가 갈린다. */
  .route { display: block; margin-top: 2px; color: var(--faint); font-size: 8pt; word-break: break-all; }
  .tbd { color: var(--warn); }

  table { width: 100%; border-collapse: collapse; margin: 4px 0 12px; }
  th, td { border: 1px solid var(--line); padding: 5px 7px; vertical-align: top; text-align: left; }
  thead th { background: var(--head); font-weight: 600; text-align: center; white-space: nowrap; }
  tbody tr { break-inside: avoid; }

  td.d1 { text-align: center; vertical-align: middle; background: var(--d1); font-weight: 700; }
  td.memo { color: var(--muted); }
  tbody tr.head > td { border-top: 1.4px solid #9aa1ad; }

  table.right td { text-align: center; }
  table.right td:first-child { text-align: left; font-weight: 600; color: var(--ink); }

  ul { margin: 3px 0; padding-left: 16px; }
  li { margin: 1.5px 0; }

  code {
    font-family: "Consolas", "D2Coding", ui-monospace, monospace;
    font-size: 0.92em;
    background: #f1f3f6;
    padding: 0.5px 3px;
    border-radius: 3px;
  }
  th code, td code { background: transparent; padding: 0; }
  .none { color: var(--faint); }

  @media print { body { padding: 0; } }
</style>
</head>
<body>
<div class="sheet">

<div class="title-row">
  <h1>${esc(FNB_BRAND.name)} <span class="dim">업무 범위 정의서</span></h1>
  <div class="date">${esc(today)}</div>
</div>

<h2>1. 프 로 젝 트 개 요</h2>

<h3>1.1 프로젝트 목적</h3>
<p>
  브랜드 사이트의 내용이 코드에 고정되어 있으면 가격 한 줄, 공지 한 건을 변경하는 데에도 개발과
  배포가 필요하다. 그 결과 사이트는 구축 시점에 멈추고, 실제 운영은 사이트 밖에서 이루어진다.
</p>
<p>
  본 과업은 <strong>고객이 이용하는 서비스</strong>와 <strong>그 내용을 운영자가 직접 관리하는
  서비스</strong>를 한 쌍으로 구축하여, 운영 주체가 개발 의존 없이 서비스를 현행으로 유지할 수
  있도록 하는 것을 목적으로 한다.
</p>

<h3>1.2 서비스 구성</h3>
<table>
  <thead><tr>${th('구분', 96)}${th('화면 수', 64)}${th('세부 기능', 70)}${th('역할')}</tr></thead>
  <tbody>
    ${cells('고객 서비스', String(CLIENT_SCREENS.length), String(CLIENT_SCREENS.reduce((s, o) => s + o.spec.actions.length, 0)), '브랜드 정보 제공 · 메뉴 탐색 · 매장 검색 · 창업 안내 · 고객 지원. 창업 상담 신청을 제외한 전 화면이 조회 전용이다.')}
    ${cells('관리자 서비스', String(ADMIN_SCREENS.length), String(ADMIN_SCREENS.reduce((s, o) => s + o.spec.actions.length, 0)), '고객 서비스에 노출되는 데이터의 등록 · 수정 · 삭제 · 상태 관리와 창업 문의 처리.')}
  </tbody>
</table>
<p>
  두 서비스는 <strong>동일한 데이터를 참조</strong>한다. 데이터를 이중으로 관리하면 어느 쪽이
  기준인지 확인할 방법이 없어지기 때문이다. 따라서 관리자 서비스의 변경은 고객 서비스에 그대로
  반영되며, 반영 범위는 3.3 「데이터 변경 영향도」에 정의한다.
</p>

<h3>1.3 전제 조건</h3>
<ul>
  <li>본 단계에는 <strong>서버와 데이터베이스가 없다.</strong> 화면이 참조하는 데이터는 공통 데이터 구조로 관리하며, 관리자 서비스의 변경은 브라우저 세션 범위에서 유지된다.</li>
  <li>메뉴 이미지 및 콘텐츠 원고는 <strong>발주처가 제공</strong>한다. 본 과업은 제공된 콘텐츠를 화면에 반영하는 범위까지 수행한다.</li>
  <li>브랜드 로고는 원본 파일을 제공받아 사용한다.</li>
</ul>

<h2>2. 정 보 구 조</h2>
<p class="lead">서비스 영역별 화면 구성이다. 이 구조는 고객 서비스의 상단 내비게이션 및 관리자 서비스의 좌측 메뉴 구성과 동일하다.</p>

<h3>2.1 고객 서비스 구조</h3>
${table(th('영역', 100) + th('화면 수', 64) + th('구성 화면'), iaRows(CLIENT_SCREENS))}

<h3>2.2 관리자 서비스 구조</h3>
${table(th('영역', 100) + th('화면 수', 64) + th('구성 화면'), iaRows(ADMIN_SCREENS))}

<h2>3. 화 면 및 기 능 정 의</h2>

<h3>3.1 고객 서비스</h3>
${table(SCREEN_HEAD, screenRows(CLIENT_SCREENS))}

<h3>3.2 관리자 서비스</h3>
${table(SCREEN_HEAD, screenRows(ADMIN_SCREENS))}

<h3>3.3 데이터 변경 영향도</h3>
<p class="lead">
  관리자 서비스에서 데이터를 변경했을 때 반영되는 고객 서비스 화면이다.
  <code>등록 → 저장 → 상태 관리 → 고객 서비스 노출</code> 흐름의 마지막 단계에 해당한다.
</p>
${table(
  th('변경 대상 (관리자)', 186) + th('영향 기능 (고객 서비스)', 186) + th('연결된 데이터'),
  ADMIN_SCREENS.flatMap((admin) =>
    impactOf(admin).map(({ screen: client, via }) =>
      cells(
        `<code>${esc(admin.featureId)}</code> ${esc(admin.name)}`,
        `<code>${esc(client.featureId)}</code> ${esc(client.name)}`,
        rich(formal(via)),
      ),
    ),
  ).join(''),
)}

<h2>4. 운 영 정 책</h2>

<h3>4.1 화면별 운영 정책</h3>
<p class="lead">
  화면에 적용되는 공개 · 노출 · 정렬 · 집계 규칙이다. 6.5 의 비즈니스 규칙은 이 정책을 서버
  관점에서 다시 정의한 것이다.
</p>
${table(th('화면', 164) + th('구분', 72) + th('운영 정책'), policyRows)}

<h3>4.2 데이터 관리 정책</h3>
<p class="lead">
  수집 · 보유 · 삭제 · 소멸 · 이력 · 권한 · 보안 · 백업 정책이다. 화면에 드러나지 않지만
  서버 구축 이전에 확정되어야 하는 값이므로 여기에 정의한다.
  <strong class="tbd">「권고」로 표기한 기간과 값은 확정된 것이 아니며</strong>, 근거 법령을 함께
  적었으나 실제 값은 발주처가 정한다.
</p>
${table(th('구분', 62) + th('항목', 146) + th('정의 · 기준'), grouped(DATA_POLICY))}

<h2>5. 책 임 범 위</h2>
<p class="lead">
  책임 범위에서 실제로 다투는 것은 담당 여부가 아니라 <strong>어디까지 수행하면 완료인가</strong>이다.
  따라서 각 영역에 대해 수행 목적 · 제공 범위 · 주요 산출물 · 완료 기준 · 제외 범위를 함께 정의한다.
</p>
${table(
  th('구분', 76) + th('수행 목적', 146) + th('제공 범위') + th('주요 산출물', 136) + th('완료 기준') + th('제외 범위', 126),
  dutyRows,
)}

<h2>6. B a c k - E n d 요 구 사 항 정 의</h2>
<p class="lead">
  <strong>Back-End 정의는 제공하고, Back-End 실제 구현은 제공하지 않는다.</strong>
  본 장은 후속 서버 개발자가 Front-End 화면을 다시 분석하지 않고 서버 개발에 착수할 수 있도록
  요구사항과 인터페이스를 정의한 것이다. 엔드포인트는 구현을 강제하는 확정 사양이 아니라
  인터페이스 요구사항이다.
</p>

<h3>6.1 도메인 및 관리 대상 정의</h3>
${table(th('관리 대상', 102) + th('데이터의 목적') + th('관련 화면', 146) + th('고객 서비스 노출'), domainRows)}

<h3>6.2 데이터 요구사항 정의</h3>
<p class="lead">
  각 관리 대상의 데이터 항목이다. 항목은 관리자 서비스 상세 화면의 입력 항목에서 도출하였다 —
  운영자가 관리하는 값이 곧 해당 대상의 속성이기 때문이다. 실제 테이블 설계, 인덱스 및 ORM
  구현은 포함하지 않는다.
</p>
${dataBlocks}

<h3>6.3 데이터 관계 정의</h3>
<p class="lead">후속 개발자가 데이터 모델을 설계할 수 있는 요구사항 수준으로 정의한다. 물리 ERD 는 포함하지 않는다.</p>
${table(th('관계', 164) + th('정의'), RELATIONS.map(([a, b]) => cells(esc(a), rich(b))).join(''))}

<h3>6.4 API 요구사항 정의</h3>
<p class="lead">
  화면에서 필요한 서버 기능이다. 연산은 화면 주소 규칙에서 도출하였다 — 목록 · 단건 · 등록
  화면의 존재가 곧 필요한 연산을 결정한다.
</p>
${apiBlocks}

<h3>6.5 비즈니스 규칙 및 검증 정책</h3>
<p class="lead">
  <strong>화면 검증과 서버 검증을 구분하여 정의한다.</strong> 화면에서 막는 것은 사용자를 돕기 위한
  것이고, 서버에서 막는 것은 데이터를 지키기 위한 것이다. 화면에만 검증을 두면 API 를 직접
  호출하는 요청에는 적용되지 않는다.
</p>
${table(th('관리 대상', 102) + th('규칙') + th('적용 위치', 196), grouped(RULES))}

<h3>6.6 상태값 및 라이프사이클 정의</h3>
${table(
  th('관리 대상', 90) + th('상태 항목', 80) + th('값', 102) + th('변경 주체', 104) + th('고객 서비스 영향') + th('전이 규칙', 162),
  grouped(stateRows),
)}

<h3>6.7 권한 요구사항 정의</h3>
<p class="lead">
  권한 등급은 현재 데이터에 정의된 <strong>대표 · 운영 · 조회</strong> 세 등급을 사용한다.
  각 등급의 연산 범위는 현재 문서에 정의되어 있지 않으므로, 아래 배분은
  <strong class="tbd">제안이며 확정은 발주처가 한다.</strong>
  실제 인증 시스템, 접근 통제 구현 및 세션 관리는 본 과업 범위에서 제외한다.
</p>
${table(
  ROLES[0]!.map((one) => th(one)).join(''),
  ROLES.slice(1)
    .map((row) => cells(...row.map((one) => (one === 'O' ? '<strong>O</strong>' : esc(one)))))
    .join(''),
  'right',
)}

<h3>6.8 예외 및 오류 요구사항 정의</h3>
<p class="lead">화면에서 고려해야 하는 예외 상황과 서버 응답 요구사항을 함께 정의한다.</p>
${table(
  th('상황', 136) + th('발생 조건', 224) + th('시스템 처리 · 화면 표시'),
  ERRORS.map(([a, b, c]) => cells(esc(a), rich(b), rich(c))).join(''),
)}

<h3>6.9 Back-End 정의 완료 기준</h3>
<p class="lead">다음 조건을 모두 충족한 경우 Back-End 정의가 완료된 것으로 판단한다.</p>
${bullets(DONE)}

<h3>6.10 Back-End 구현 제외 범위</h3>
<p class="lead">아래 항목은 <strong>본 과업에서 제외</strong>한다. 다만 향후 개발이 가능하도록 6.1부터 6.8까지의 요구사항을 문서로 제공한다.</p>
${bullets(NOT_BUILT)}

<h2>7. 완 료 및 인 수 기 준</h2>

<h3>7.1 인수 산출물</h3>
${table(th('산출물', 164) + th('내용'), HANDOVER.map(([a, b]) => cells(esc(a), rich(b))).join(''))}

<h3>7.2 인수 판정 기준</h3>
${bullets(ACCEPT)}

<h3>7.3 변경 관리 기준</h3>
<ul>
  <li>변경 요청은 <strong>기능 ID 를 지목하여</strong> 제기한다. 화면 이름으로 지목하면 목록 · 상세 · 등록 중 어느 화면인지 특정되지 않는다.</li>
  <li>이미 정의된 기능의 표현 · 배치 · 문구 조정은 <strong>범위 내 변경</strong>으로 처리한다.</li>
  <li>화면 추가, 신규 데이터 항목 도입, 5장에서 제외 범위로 정의된 항목의 수행은 <strong>범위 외 변경</strong>이며 별도 협의 대상이다.</li>
  <li>변경은 화면 등록부와 화면 명세의 수정으로 시작하며, 본 문서와 기능 명세서가 함께 갱신된다.</li>
  <li>문서만 수정하거나 코드만 수정하는 변경은 허용하지 않는다. 한쪽만 반영되면 다른 쪽이 낡은 상태로 남고, 그 사실은 인수 시점에 드러난다.</li>
</ul>

</div>
</body>
</html>
`;

const out = 'FnB-업무범위정의서.html';
writeFileSync(out, html, 'utf8');
console.log(
  `${out} — 화면 ${SCREENS.length} · 세부 기능 ${totalActions} · 도메인 ${DOMAINS.length} · 규칙 ${RULES.length} · 상태 ${STATES.length} · 예외 ${ERRORS.length}`,
);
