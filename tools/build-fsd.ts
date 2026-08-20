import { writeFileSync } from 'node:fs';
import { FNB_BRAND } from '@winpilot/store';
import {
  ADMIN_SCREENS,
  CLIENT_SCREENS,
  COMMON_NON_FUNCTIONAL,
  SCREENS,
  impactOf,
  type Screen,
} from './lib/fnb-model';
import { condition, handlingOf, kindIn, sectionOf, SECTION_ORDER } from './lib/action-kind';
import { esc, namedList, note, NONE, rich, TBD } from './lib/html';
import { formal, formalAction } from './lib/polite';

/**
 * F&B 두 앱의 **기능 명세서**를 만든다 — 개발 · QA · 운영이 구현과 검수에 쓰는 문서.
 *
 * ## 업무 범위 정의서와 무엇이 다른가
 * 범위 정의서는 계약 문서다 — 무엇을 만들고 무엇을 만들지 않는가, 누가 어디까지 맡는가.
 * 이 문서는 작업 문서다 — 사용자가 무엇을 하면 시스템이 어떻게 처리하고 무엇이 남는가.
 *
 * 둘을 한 파일에 두면 계약 자리에서 300쪽을 넘기게 되고, 개발자는 계약 조항 사이에서 자기
 * 화면을 찾게 된다. 읽는 사람이 다르면 문서도 나뉘어야 한다.
 *
 * ## 서술을 뒤집는다
 * 화면 명세는 "왜 이 기능이 있는가" 로 적혀 있다 — `메뉴 카드 열기`. 여기서는 "사용자가
 * 무엇을 하면 시스템이 어떻게 처리하고 어떤 결과가 나오는가" 로 뒤집는다.
 *
 * 뒤집는 근거는 둘뿐이다. **단추 정의가 있으면 그것이 이긴다**(눌렀을 때 · 성공 · 실패가
 * 명세에 적힌 값이다). 없으면 **동작 유형에서 끌어낸 표준 처리**를 쓴다. 끌어낸 것은
 * 확정이 아니므로 문서 앞머리에 그렇게 밝히고, 유형을 못 가른 것은 `정의 필요` 로 남긴다.
 *
 * 없는 것을 그럴듯하게 채우지 않는다. 검토하는 사람은 채워진 칸을 합의된 값으로 읽는다.
 *
 * ```
 * pnpm fsd:build
 * ```
 */

/* ── 절 조각 ───────────────────────────────────────────────── */

const table = (head: string[], rows: string[], klass = ''): string =>
  rows.length === 0
    ? ''
    : `<table class="${klass}">
  <thead><tr>${head.map((one) => `<th>${one}</th>`).join('')}</tr></thead>
  <tbody>${rows.join('')}</tbody>
</table>`;

const cells = (...values: string[]): string => `<tr>${values.map((one) => `<td>${one}</td>`).join('')}</tr>`;

/** 절 제목. 내용이 없는 절은 아예 세우지 않는다 — 빈 절이 이어지면 문서를 넘기게 된다. */
const part = (no: number, title: string, body: string): string =>
  body.trim() === '' ? '' : `<h4>${no}. ${esc(title)}</h4>${body}`;

/* ── 1. 기본 정보 ──────────────────────────────────────────── */

const basics = (screen: Screen): string => {
  const rows = [
    ['기능 ID', `<code>${esc(screen.featureId)}</code>`],
    ['기능명', esc(screen.name)],
    ['서비스 구분', esc(screen.appLabel)],
    ['메뉴 경로', esc(screen.menuPath)],
    ['화면 경로', `<code>${esc(screen.route)}</code>`],
    ['사용자 유형', esc(screen.actor)],
    [
      '기능 상태',
      screen.readOnly
        ? '현재 구현 기준 — 화면 구현 완료, 값은 공유 패키지에서 읽습니다.'
        : '현재 구현 기준 — 화면 구현 완료, 저장은 브라우저 안에서만 유지되며 서버 연동은 <strong>현재 범위에 없음</strong>입니다.',
    ],
  ];
  return table(['항목', '내용'], rows.map(([a, b]) => cells(a, b)), 'kv');
};

/* ── 3. 사용자 액션 및 시스템 처리 ─────────────────────────── */

/** 단추 정의가 있으면 그것이 이긴다. 없으면 동작 유형에서 끌어낸다. */
const flow = (screen: Screen): string => {
  const buttons = screen.spec.buttons ?? [];
  const rows = screen.spec.actions.map((action, index) => {
    const button = buttons.find((one) => action.includes(one.label));
    const kind = kindIn(action, screen.route, screen.readOnly);
    const fallback = handlingOf(kind);

    const handle = button ? formal(button.onClick) : fallback.handle;
    const result = button
      ? [button.onSuccess, button.onFail].filter((one) => one !== undefined).map(formal).join(' / ') ||
        fallback.result
      : fallback.result;

    return cells(
      String(index + 1),
      rich(formalAction(action)),
      handle === '정의 필요' ? TBD : rich(handle),
      result === '정의 필요' ? TBD : rich(result),
      esc(kind),
    );
  });
  return table(['No.', '사용자 액션', '시스템 처리', '결과', '유형'], rows, 'flow');
};

/* ── 4. 세부 기능 ──────────────────────────────────────────── */

const details = (screen: Screen): string => {
  const bucket = new Map<string, string[]>();
  for (const action of screen.spec.actions) {
    const key = sectionOf(kindIn(action, screen.route, screen.readOnly));
    bucket.set(key, [...(bucket.get(key) ?? []), action]);
  }
  const blocks = SECTION_ORDER.filter((one) => bucket.has(one)).map((one, index) => {
    const list = bucket.get(one) ?? [];
    return `<h5>4.${index + 1} ${esc(one)}</h5>${note(list, formalAction)}`;
  });
  return blocks.join('');
};

/* ── 5 · 6. 입력 · 출력 데이터 ─────────────────────────────── */

const inputs = (screen: Screen): string => {
  const rows = (screen.spec.fields ?? [])
    .filter((one) => one.type !== '표시')
    .map((one) =>
      cells(
        esc(one.name),
        esc(one.type),
        one.required ? 'Y' : 'N',
        one.rule ? rich(formal(one.rule)) : NONE,
        rich(formal(one.desc)),
      ),
    );
  return table(['항목명', '입력 형태', '필수', '검증 규칙', '설명'], rows);
};

const outputs = (screen: Screen): string => {
  const shown = (screen.spec.fields ?? [])
    .filter((one) => one.type === '표시')
    .map((one) => cells(esc(one.name), '표시 값', NONE, rich(formal(one.desc))));
  const areas = (screen.spec.areas ?? []).map((one) =>
    cells(
      esc(one.area),
      '화면 영역',
      one.when ? rich(formal(one.when)) : '항상',
      rich(formal(one.purpose)),
    ),
  );
  return table(['항목명', '구분', '표시 조건', '설명'], [...shown, ...areas]);
};

/* ── 7. 처리 규칙 ──────────────────────────────────────────── */

/** 조건이 붙은 문장만 IF / THEN 으로 편다. 표지가 없는 것은 상시 규칙이다. */
const rules = (screen: Screen): string => {
  const source = [...(screen.spec.policy ?? []), ...screen.spec.guards.filter((one) => !condition(one).when)];
  if (source.length === 0) return '';
  const rows = source.map((one) => {
    const split = condition(one);
    return split.when
      ? cells(`<span class="kw">IF</span> ${rich(formal(split.when))}`, `<span class="kw">THEN</span> ${rich(formal(split.then))}`)
      : cells('<span class="kw">상시</span>', rich(formal(one)));
  });
  return table(['조건', '시스템 처리'], rows, 'rule');
};

/* ── 8. 상태 정의 ──────────────────────────────────────────── */

const STATUS_FIELD = /공개|노출|고정|상태|판매|감추|사용 여부/;

const states = (screen: Screen): string => {
  const rows = (screen.spec.fields ?? [])
    .filter((one) => STATUS_FIELD.test(one.name))
    .map((one) =>
      cells(
        esc(one.name),
        one.rule ? rich(formal(one.rule)) : TBD,
        rich(formal(one.desc)),
        screen.app === 'admin'
          ? '값을 끄면 고객 사이트 목록에서 빠지고, 데이터는 남습니다.'
          : '값에 따라 표시 여부가 갈립니다.',
      ),
    );
  return table(['상태 항목', '값', '조건', '화면 처리'], rows);
};

/* ── 9. 예외 및 예외 처리 ──────────────────────────────────── */

/**
 * 조건이 붙은 제약과 검증 규칙을 모은다.
 *
 * 받은 양식은 「시스템 처리」와 「사용자 화면」을 나누라고 한다. 그런데 명세는 그 둘을 한
 * 문장으로 적는다 — `해당 없음이라 적는다` 는 처리이면서 곧 화면이다. 나누려면 없는 말을
 * 지어내야 하므로 한 칸에 둔다.
 */
const exceptions = (screen: Screen): string => {
  const guards = screen.spec.guards.filter((one) => condition(one).when);
  const rows = [
    ...guards.map((one) => {
      const split = condition(one);
      return cells('제약', rich(formal(split.when ?? '')), rich(formal(split.then)));
    }),
    ...(screen.spec.validations ?? []).map((one) => {
      const split = condition(one);
      return split.when
        ? cells('입력 검증', rich(formal(split.when)), rich(formal(split.then)))
        : cells('입력 검증', '값을 저장하기 전', rich(formal(one)));
    }),
  ];
  return table(['구분', '상황', '시스템 처리 · 화면 표시'], rows);
};

/* ── 10. 권한 ──────────────────────────────────────────────── */

const O = '<span class="yes">O</span>';
const X = '<span class="none">–</span>';

/** 주소가 곧 열어야 할 연산이다 — 목록 · 단건 · 등록. Back-End 정의와 같은 규칙을 쓴다. */
const rights = (screen: Screen): string => {
  const isNew = screen.route.endsWith('/new');
  const isDetail = screen.route.includes('[');
  const row =
    screen.app === 'admin'
      ? cells('관리자', O, isNew ? O : X, isDetail ? O : X, isDetail ? O : X)
      : cells('비회원', O, screen.readOnly ? X : O, X, X);
  const others =
    screen.app === 'admin'
      ? cells('비회원', X, X, X, X)
      : cells('관리자', O, X, X, X);
  return table(['사용자 유형', '조회', '등록', '수정', '삭제'], [row, others], 'right');
};

/* ── 11. 데이터 변경 영향 ──────────────────────────────────── */

const impact = (screen: Screen): string => {
  if (screen.app === 'admin') {
    const rows = impactOf(screen).map(({ screen: client, via }) =>
      cells(
        `${esc(screen.name)}에서 값 변경`,
        `<code>${esc(client.featureId)}</code> ${esc(client.name)}`,
        rich(formal(via)),
      ),
    );
    return rows.length === 0
      ? '<p class="none">이 화면의 값을 읽는 고객 화면이 아직 없습니다.</p>'
      : table(['변경 대상', '영향 기능', '연결된 값'], rows);
  }
  const rows = screen.spec.admin.map((one) => cells(rich(formal(one)), esc(screen.name), '값이 바뀌면 이 화면에 그대로 반영됩니다.'));
  return table(['값을 고치는 관리자 화면', '영향 기능', '반영 내용'], rows);
};

/* ── 12. 검수 기준 ─────────────────────────────────────────── */

const qa = (screen: Screen): string => {
  const items: string[] = [];
  for (const action of screen.spec.actions) {
    const kind = kindIn(action, screen.route, screen.readOnly);
    const button = (screen.spec.buttons ?? []).find((one) => action.includes(one.label));
    const outcome = button?.onSuccess ?? handlingOf(kind).result;
    items.push(`${formalAction(action)} — ${formal(outcome)}`);
  }
  for (const guard of screen.spec.guards) items.push(formal(guard));
  for (const rule of screen.spec.validations ?? []) items.push(formal(rule));
  return `<ul class="check">${items.map((one) => `<li>${rich(one)}</li>`).join('')}</ul>`;
};

/* ── 화면 한 장 ────────────────────────────────────────────── */

const overview = (screen: Screen): string => {
  const lines = [screen.spec.purpose, screen.spec.effect, screen.spec.background].filter(
    (one): one is string => one !== undefined,
  );
  return `<p>${lines.map((one) => rich(formal(one))).join(' ')}</p>`;
};

const article = (screen: Screen): string => `
<section class="screen">
  <h3 id="${esc(screen.featureId)}"><span class="fid">${esc(screen.featureId)}</span> ${esc(screen.name)}</h3>
  ${part(1, '기본 정보', basics(screen))}
  ${part(2, '기능 개요', overview(screen))}
  ${part(3, '사용자 액션 및 시스템 처리', flow(screen))}
  ${part(4, '세부 기능', details(screen))}
  ${part(5, '입력 데이터', inputs(screen))}
  ${part(6, '출력 데이터', outputs(screen))}
  ${part(7, '처리 규칙', rules(screen))}
  ${part(8, '상태 정의', states(screen))}
  ${part(9, '예외 및 예외 처리', exceptions(screen))}
  ${part(10, '권한', rights(screen))}
  ${part(11, '데이터 변경 영향', impact(screen))}
  ${part(12, '검수 기준', qa(screen))}
</section>`;

/* ── 문서 앞뒤 ─────────────────────────────────────────────── */

const listRows = SCREENS.map((one) =>
  cells(
    `<code>${esc(one.featureId)}</code>`,
    esc(one.name),
    esc(one.menuPath),
    `<code>${esc(one.route)}</code>`,
    namedList(one.spec.actions),
  ),
).join('');

const stateRows = SCREENS.flatMap((screen) =>
  (screen.spec.fields ?? [])
    .filter((one) => STATUS_FIELD.test(one.name))
    .map((one) =>
      cells(
        `<code>${esc(screen.featureId)}</code>`,
        esc(screen.name),
        esc(one.name),
        one.rule ? rich(formal(one.rule)) : TBD,
        rich(formal(one.desc)),
      ),
    ),
).join('');

const impactRows = ADMIN_SCREENS.flatMap((admin) =>
  impactOf(admin).map(({ screen: client, via }) =>
    cells(
      `<code>${esc(admin.featureId)}</code> ${esc(admin.name)}`,
      `<code>${esc(client.featureId)}</code> ${esc(client.name)}`,
      rich(formal(via)),
    ),
  ),
).join('');

/**
 * 화면을 가리지 않고 같은 방식으로 처리해야 하는 예외.
 *
 * 화면마다 되풀이해 적으면 47벌이 되고, 한 곳만 고쳐진다. 여기서 한 번 정하고 화면별 절에는
 * 그 화면에만 있는 것만 적는다.
 */
const COMMON_EXCEPTION: [string, string, string][] = [
  ['데이터 없음', '목록 조회 결과가 0건입니다.', '목록 자리에 빈 상태 문구를 세웁니다. 빈 표를 그대로 두지 않습니다.'],
  ['잘못된 식별자', '주소의 식별자에 해당하는 값이 없습니다.', '404 로 답하고 없는 화면임을 알립니다.'],
  ['비공개 대상', '공개가 꺼진 값을 고객 사이트 주소로 직접 열었습니다.', '고객 사이트에서는 404 로 답합니다. 값 자체는 지우지 않습니다.'],
  ['검색 결과 없음', '검색어나 조건에 걸리는 값이 없습니다.', '건 수 0 을 함께 보이고, 조건을 지우는 길을 함께 둡니다.'],
  ['필수값 누락', '필수 항목이 비었습니다.', '저장하지 않고, 비어 있는 항목이 몇 개인지 알립니다.'],
  ['권한 없음', '관리자 화면을 인증 없이 열었습니다.', '로그인 화면으로 보냅니다. **서버 연동은 현재 범위에 없음**이며, 지금은 화면 흐름까지만 있습니다.'],
  ['저장 실패', '등록 · 수정 · 삭제가 끝나지 않았습니다.', '입력한 값을 지우지 않고 화면에 남긴 뒤 실패를 알립니다.'],
  ['외부 서비스 오류', '지도 SDK 가 응답하지 않거나 열쇠가 등록되지 않았습니다.', '빈 상자 대신 설명 판을 세웁니다.'],
];

const commonExceptionRows = COMMON_EXCEPTION.map(([when, what, how]) =>
  cells(esc(when), rich(what), rich(how)),
).join('');

const qaRows = SCREENS.map((screen) =>
  cells(
    `<code>${esc(screen.featureId)}</code>`,
    esc(screen.name),
    `<a href="#${esc(screen.featureId)}">${esc(screen.route)}</a>`,
    String(
      screen.spec.actions.length + screen.spec.guards.length + (screen.spec.validations?.length ?? 0),
    ),
  ),
).join('');

const qaTotal = SCREENS.reduce(
  (sum, one) => sum + one.spec.actions.length + one.spec.guards.length + (one.spec.validations?.length ?? 0),
  0,
);

const today = new Date().toLocaleDateString('ko-KR', { dateStyle: 'long' });

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>F&amp;B 기능 명세서</title>
<style>
  /*
    A4 를 눕힌다. 이 문서의 표는 여섯 칸까지 가고(책임 범위 · API 요구사항), 세로 A4 에서는
    칸마다 두세 글자에서 줄이 꺾여 읽는 속도가 떨어진다. 눕히면 가로 여유가 100mm 늘어
    한 칸이 한 줄로 앉는다.
  */
  @page { size: A4 landscape; margin: 12mm 14mm 14mm; }

  :root {
    --ink: #1a1c20;
    --muted: #5a6070;
    --faint: #939aa6;
    --line: #c9ced7;
    --band: #eceef2;
    --head: #f5f6f8;
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
    font-size: 9.5pt;
    line-height: 1.62;
    word-break: keep-all;
    overflow-wrap: break-word;
  }

  .sheet { max-width: 269mm; margin: 0 auto; }

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
    margin: 26px 0 12px;
    break-after: avoid;
  }
  h3 {
    font-size: 11pt;
    margin: 22px 0 8px;
    padding-bottom: 5px;
    border-bottom: 1.6px solid var(--ink);
    break-after: avoid;
  }
  h3 .fid {
    display: inline-block;
    background: var(--ink);
    color: #fff;
    font-family: "Consolas", "D2Coding", ui-monospace, monospace;
    font-size: 8.5pt;
    padding: 1px 6px;
    border-radius: 3px;
    margin-right: 7px;
    vertical-align: 1px;
  }
  h4 { font-size: 9.5pt; margin: 13px 0 5px; color: var(--accent); break-after: avoid; }
  h5 { font-size: 9pt; margin: 9px 0 3px; color: var(--muted); break-after: avoid; }
  p { margin: 5px 0; }

  table { width: 100%; border-collapse: collapse; margin: 4px 0 10px; }
  th, td { border: 1px solid var(--line); padding: 4px 7px; vertical-align: top; text-align: left; }
  thead th { background: var(--head); font-weight: 600; text-align: center; white-space: nowrap; }
  tbody tr { break-inside: avoid; }

  /*
    가로로 눕히면서 두 칸짜리 표가 종이 폭만큼 늘어났다. 「기능 ID」 옆에 빈 공간이 한 뼘
    생기면 값이 어디까지인지 눈으로 좇게 된다. 좁은 표는 폭을 따로 잡는다.
  */
  table.kv { max-width: 560px; }
  table.kv th, table.kv td:first-child { width: 92px; background: #fafbfc; font-weight: 600; color: var(--muted); }
  table.flow td:first-child { width: 30px; text-align: center; color: var(--faint); }
  table.flow td:last-child { width: 62px; text-align: center; color: var(--muted); white-space: nowrap; }
  table.rule td:first-child { width: 220px; }
  table.right td { text-align: center; }
  table.right td:first-child { text-align: left; width: 96px; }

  .kw {
    font-family: "Consolas", "D2Coding", ui-monospace, monospace;
    font-size: 8pt;
    color: var(--accent);
    margin-right: 3px;
  }
  .yes { color: var(--accent); font-weight: 700; }
  .none { color: var(--faint); }
  .tbd { color: var(--warn); font-weight: 600; }

  /* 세부 기능 목록 — 번호가 기능 명세서 3절의 「기능 01 · 02」 와 같은 자리를 가리킨다. */
  ol.fn { margin: 0; padding-left: 20px; }
  ol.fn li { margin: 1px 0; }
  ol.fn li::marker { color: var(--faint); font-variant-numeric: tabular-nums; font-size: 8.5pt; }

  ul { margin: 3px 0; padding-left: 17px; }
  li { margin: 1px 0; }

  ul.check { list-style: none; padding-left: 2px; }
  ul.check li { position: relative; padding-left: 17px; margin: 2px 0; break-inside: avoid; }
  ul.check li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 3.5px;
    width: 9px;
    height: 9px;
    border: 1px solid var(--muted);
    border-radius: 2px;
  }

  code {
    font-family: "Consolas", "D2Coding", ui-monospace, monospace;
    font-size: 0.92em;
    background: #f1f3f6;
    padding: 0.5px 3px;
    border-radius: 3px;
  }
  th code, td code, h3 code { background: transparent; }
  a { color: var(--accent); text-decoration: none; }

  .screen { break-inside: auto; margin-bottom: 4px; }
  .lead { color: var(--muted); margin: 0 0 10px; }

  .common { margin-bottom: 16px; border: 1px solid var(--line); }
  .common th { background: var(--band); text-align: center; font-weight: 700; font-size: 10pt; padding: 5px; }
  .common td { padding: 10px 14px; }
  .common ol { margin: 0; padding-left: 18px; color: var(--muted); }
  .common li { margin: 2px 0; }
  .common li strong { color: var(--ink); }

  @media print { body { padding: 0; } }
</style>
</head>
<body>
<div class="sheet">

<div class="title-row">
  <h1>${esc(FNB_BRAND.name)} <span class="dim">기능 명세서</span></h1>
  <div class="date">${esc(today)}</div>
</div>

<table class="common">
  <tr><th>문서 사용 안내</th></tr>
  <tr><td>
    <ol>
      <li>이 문서는 <strong>개발 · QA · 운영이 구현과 검수에 쓰는 작업 문서</strong>입니다. 계약 · 책임 · 제외 범위는 별도 문서 「업무 범위 정의서」에 있습니다.</li>
      <li>화면 ${SCREENS.length}개(고객 사이트 ${CLIENT_SCREENS.length} · 관리자 ${ADMIN_SCREENS.length})를 각각 열두 절로 적었습니다. 내용이 없는 절은 세우지 않았습니다.</li>
      <li><strong>「시스템 처리」와 「결과」의 근거는 둘뿐입니다.</strong> 화면 명세에 단추 정의가 있으면 그 값을 그대로 옮겼고, 없으면 동작 유형에서 끌어낸 표준 처리를 적었습니다. <strong>끌어낸 것은 확정이 아니라 검토 대상</strong>입니다.</li>
      <li><span class="tbd">정의 필요</span> 로 표시된 칸은 <strong>현재 문서에 근거가 없는 자리</strong>입니다. 채워 넣지 않았습니다.</li>
      <li><strong>서버 연동은 현재 범위에 없습니다.</strong> 저장 · 인증 · 발송이 필요한 기능은 화면 흐름까지만 구현되어 있으며, 그 사실을 각 절에 적었습니다. 구현된 것처럼 읽지 마십시오.</li>
      <li>화면을 가리지 않는 예외는 <strong>9장 「예외 처리 기준」</strong>에 한 번만 적었습니다. 화면별 절에는 그 화면에만 있는 것을 적었습니다.</li>
      <li>기능 ID 는 업무 범위 정의서와 같은 값입니다. 회신 시 <code>MENU-002</code> 처럼 ID 로 지목해 주십시오.</li>
      <li>이 문서는 저장소의 화면 등록부 · IA 묶음 · 화면 명세에서 생성합니다(<code>pnpm fsd:build</code>). 문서를 직접 고치면 다음 생성 때 지워집니다.</li>
    </ol>
  </td></tr>
</table>

<h2>1. 서비스 개요</h2>
<p>
  ${esc(FNB_BRAND.name)}의 웹 서비스는 <strong>고객 사이트</strong>와 <strong>관리자</strong> 한 쌍으로
  이루어집니다. 고객 사이트는 손님에게 무엇을 파는 집인지를, 예비 점주에게 얼마가 들고 얼마나
  걸리는지를 각각의 길에서 답합니다. 관리자는 그 사이트에 나가는 값을 운영자가 직접 고치는
  자리입니다.
</p>
<p>
  두 앱은 <strong>같은 값 한 곳</strong>을 읽습니다. 값을 두 벌로 두면 어느 쪽이 맞는지 확인할 방법이
  없어지기 때문입니다. 따라서 관리자에서 값을 고치면 고객 사이트에 그대로 반영되며, 무엇이
  어디에 반영되는지는 8장 「데이터 변경 영향도」에 정리했습니다.
</p>

<h2>2. 시스템 범위</h2>
<table>
  <thead><tr><th style="width:110px">구분</th><th style="width:90px">화면 수</th><th>범위</th></tr></thead>
  <tbody>
    ${cells('고객 사이트', String(CLIENT_SCREENS.length), '브랜드 · 메뉴 · 인테리어 · 마케팅 · 매장안내 · 창업안내 · 고객센터 · 법적 고지. 창업 상담 신청 한 곳을 제외하면 모두 읽기 전용입니다.')}
    ${cells('관리자', String(ADMIN_SCREENS.length), '대시보드 · 등록 · 창업 · 고객센터 · 배너 · 설정. 목록 · 상세 · 등록 세 꼴이 반복됩니다.')}
    ${cells('Back-End', '–', '<strong>현재 범위에 없음.</strong> 필요한 연산 · 권한 · 항목 · 검증과 데이터 정책은 「업무 범위 정의서」에 정의되어 있습니다.')}
  </tbody>
</table>

<h2>3. 기능 목록</h2>
<table>
  <thead><tr><th style="width:82px">기능 ID</th><th style="width:92px">화면명</th><th style="width:146px">메뉴 경로</th><th style="width:114px">화면 경로</th><th>세부 기능</th></tr></thead>
  <tbody>${listRows}</tbody>
</table>

<h2>4. 고객 사이트 기능 명세</h2>
${CLIENT_SCREENS.map(article).join('')}

<h2>5. 관리자 기능 명세</h2>
${ADMIN_SCREENS.map(article).join('')}

<h2>6. 공통 기능</h2>
<p class="lead">화면을 가리지 않고 전 화면에 걸리는 동작 요건입니다. 화면별 절에 되풀이해 적지 않았습니다.</p>
${note(COMMON_NON_FUNCTIONAL)}

<h2>7. 상태값 정의</h2>
<p class="lead">노출 · 고정 · 판매 여부처럼 값에 따라 화면 처리가 갈리는 항목을 모았습니다.</p>
${
  stateRows === ''
    ? '<p class="none">상태값을 가진 항목이 명세에 없습니다.</p>'
    : `<table>
  <thead><tr><th style="width:88px">기능 ID</th><th style="width:104px">화면</th><th style="width:96px">상태 항목</th><th style="width:130px">값</th><th>조건</th></tr></thead>
  <tbody>${stateRows}</tbody>
</table>`
}

<h2>8. 데이터 변경 영향도</h2>
<p class="lead">관리자에서 값을 고쳤을 때 달라지는 고객 화면입니다. 고객 화면이 적어 둔 값의 출처를 뒤집어 만들었습니다.</p>
<table>
  <thead><tr><th style="width:190px">변경 대상 (관리자)</th><th style="width:190px">영향 기능 (고객 사이트)</th><th>연결된 값</th></tr></thead>
  <tbody>${impactRows}</tbody>
</table>

<h2>9. 예외 처리 기준</h2>
<p class="lead">화면을 가리지 않고 같은 방식으로 처리합니다. 화면마다 되풀이해 적으면 ${SCREENS.length}벌이 되고, 한 곳만 고쳐집니다.</p>
<table>
  <thead><tr><th style="width:100px">구분</th><th style="width:230px">상황</th><th>시스템 처리 · 화면 표시</th></tr></thead>
  <tbody>${commonExceptionRows}</tbody>
</table>

<h2>10. QA 검수 체크리스트</h2>
<p class="lead">
  검수 항목은 <strong>화면별 12절</strong>에 각각 있습니다. 아래는 화면마다 몇 항목인지를 모은
  것으로, 전체 <strong>${qaTotal}항목</strong>입니다. 기능 ID 를 누르면 해당 화면의 검수 기준으로 갑니다.
</p>
<table>
  <thead><tr><th style="width:88px">기능 ID</th><th style="width:150px">화면</th><th>화면 경로</th><th style="width:70px">검수 항목</th></tr></thead>
  <tbody>${qaRows}</tbody>
</table>

</div>
</body>
</html>
`;

const out = 'FnB-기능명세서.html';
writeFileSync(out, html, 'utf8');
console.log(`${out} — 화면 ${SCREENS.length} · 검수 항목 ${qaTotal}`);
