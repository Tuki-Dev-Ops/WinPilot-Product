import { writeFileSync } from 'node:fs';
import type { Screen, SpecField } from './lib/screens';
import type { DocProject } from './lib/doc-project';
import { PROJECTS } from './lib/projects';
import { condition, handlingOf, kindIn } from './lib/action-kind';
import { cells, table, th } from './lib/doc-html';
import { esc, rich } from './lib/html';
import { formal, formalAction } from './lib/polite';
import { shell } from './lib/page';

/**
 * **화면 정의서** — 화면 하나가 무엇으로 이루어졌고 각 요소가 무엇을 하는지 적는 표.
 *
 * ## 다른 넷과 무엇이 다른가
 * 요구사항 정의서는 "무엇이 필요한가", 기능 명세서는 "무엇을 하면 무엇이 일어나는가" 를
 * 적는다. 이 문서는 **요소 단위**다 — 이 화면에 단추가 몇 개이고 각각 무슨 타입이며 눌렀을
 * 때 어디에 무엇이 남는가.
 *
 * 퍼블리싱과 화면 개발이 실제로 보고 만드는 표라, 한 화면이 한 줄이고 그 안에 요소가 늘어선다.
 *
 * ## 요소를 어디서 읽는가
 * 셋을 순서대로 읽어 한 줄로 세운다.
 *
 * 1. **입력 항목**(`fields`) — 타입과 필수 여부, 검증 규칙이 이미 적혀 있다.
 * 2. **단추**(`buttons`) — 눌렀을 때 · 성공 · 실패가 적혀 있다. 있으면 그것이 이긴다.
 * 3. **기능**(`actions`) — 위 둘에 걸리지 않은 나머지. 동작 유형에서 타입을 끌어낸다.
 *
 * 세 곳이 같은 요소를 가리키면 겹친다. 이름이 서로의 안에 들어 있는지로 걸러 내되, 걸러 내는
 * 쪽은 **뒤에 오는 것**이다 — 앞의 것이 더 자세하기 때문이다.
 *
 * ## 예외 처리를 요소에 붙인다
 * 검증 규칙이 어느 항목의 것인지는 문장에 그 항목 이름이 들어 있는지로 안다. 이름이 없는
 * 규칙은 화면 전체에 걸리는 것으로 보고 맨 아래 따로 세운다.
 *
 * 화면마다 「예외처리」를 한 덩어리로 몰아 두면, 어느 항목의 규칙인지 읽는 사람이 다시
 * 짝지어야 한다.
 *
 * ```
 * pnpm screendef:build
 * ```
 */

/** 명세의 입력 형태를 화면 요소 타입으로 옮긴다. 없는 것은 그대로 쓴다 — 지어내지 않는다. */
const TYPE: Record<string, string> = {
  텍스트: 'INPUT',
  '여러 줄': 'TEXTAREA',
  숫자: 'INPUT (number)',
  날짜: 'DATE',
  선택: 'SELECT',
  고르개: 'CHECKBOX (multi)',
  체크박스: 'CHECKBOX',
  스위치: 'SWITCH',
  파일: 'FILE',
  '읽기 전용': 'TEXT (readonly)',
  표시: 'TEXT',
};

/** 단추가 없는 기능은 동작 유형에서 타입을 끌어낸다. */
const KIND_TYPE: Record<string, string> = {
  이동: 'LINK',
  검색: 'SEARCH',
  필터: 'FILTER',
  등록: 'BTN',
  수정: 'BTN',
  삭제: 'BTN',
  '상태 변경': 'SWITCH',
  표시: 'TEXT',
  미분류: 'ELEMENT',
};

type Element = { name: string; type: string; behavior: string[]; guard: string[] };

const block = (one: Element): string => {
  const lines = [
    `<strong>${esc(one.name)}</strong>`,
    `<span class="type">- Type : ${esc(one.type)}</span>`,
    ...one.behavior.map((text) => `- ${rich(formal(text))}`),
    ...one.guard.map((text) => `<span class="guard">- 예외처리 : ${rich(formal(text))}</span>`),
  ];
  return `<div class="el">${lines.join('<br>')}</div>`;
};

/**
 * 검증 규칙을 항목에 붙인다.
 *
 * 항목 이름이 문장에 들어 있으면 그 항목의 규칙으로 본다. 짧은 이름(`값` · `표`)이 다른
 * 낱말에 섞여 잘못 걸리는 것을 막으려고 **두 글자 이상**만 짝짓는다.
 */
const guardsFor = (name: string, pool: readonly string[]): string[] =>
  name.length >= 2 ? pool.filter((one) => one.includes(name)) : [];

const elementsOf = (screen: Screen): { list: Element[]; rest: string[] } => {
  const fields = screen.spec.fields ?? [];
  const buttons = screen.spec.buttons ?? [];
  const validations = screen.spec.validations ?? [];
  const used = new Set<string>();

  const fromField = (one: SpecField): Element => {
    const guard = guardsFor(one.name, validations);
    for (const g of guard) used.add(g);
    return {
      name: `${one.name}${one.required ? ' (필수)' : ''}`,
      type: TYPE[one.type] ?? one.type,
      behavior: [one.desc, ...(one.rule ? [`입력 규칙 : ${one.rule}`] : [])],
      guard,
    };
  };

  const fromButton = (one: (typeof buttons)[number]): Element => ({
    name: one.label,
    type: 'BTN',
    behavior: [
      `누르면 ${one.onClick}`,
      ...(one.onSuccess ? [`성공 시 ${one.onSuccess}`] : []),
    ],
    guard: one.onFail ? [one.onFail] : [],
  });

  /*
    단추와 항목에 이미 잡힌 기능은 다시 세우지 않는다.

    이름이 겹치지 않는데도 같은 것을 가리키는 기능이 있다 — `네 칸 채우기` 는 위에 이미 선
    입력 항목 넷을 통틀어 부르는 말이다. 그대로 두면 같은 요소가 항목 넷과 단추 하나로
    두 번 선다. 항목이 있는 화면에서 「채우기 · 넣기」 로 끝나는 기능은 그 항목들의 다른
    이름으로 본다.
  */
  const wholeForm = /칸 채우|항목 넣|값 넣|정보 넣|채우기$/;
  const covered = (action: string): boolean =>
    buttons.some((one) => action.includes(one.label)) ||
    fields.some((one) => one.name.length >= 2 && action.includes(one.name)) ||
    (fields.length > 0 && wholeForm.test(action));

  const fromAction = (action: string): Element => {
    const kind = kindIn(action, screen.route, screen.readOnly);
    const fallback = handlingOf(kind);
    return {
      name: formalAction(action),
      type: KIND_TYPE[kind] ?? 'ELEMENT',
      behavior: fallback.handle === '정의 필요' ? ['정의 필요'] : [fallback.handle],
      guard: [],
    };
  };

  const list = [
    ...fields.map(fromField),
    ...buttons.map(fromButton),
    ...screen.spec.actions.filter((one) => !covered(one)).map(fromAction),
  ];

  /* 어느 항목에도 붙지 않은 검증과, 조건이 붙은 제약은 화면 전체의 예외로 세운다. */
  const rest = [
    ...validations.filter((one) => !used.has(one)),
    ...screen.spec.guards.filter((one) => condition(one).when !== null),
  ];

  return { list, rest };
};

/** 관리자 연동 — 사이트는 값이 오는 곳을, 관리자는 값이 나가는 곳을 적는다. */
const linkOf = (p: DocProject, screen: Screen): string => {
  if (screen.app === 'client') {
    const from = screen.spec.admin.filter((one) => !one.startsWith('없음'));
    return from.length === 0
      ? '<span class="none">–</span>'
      : `<strong class="yes">O</strong><br>${from.map((one) => rich(formal(one))).join('<br>')}`;
  }
  const to = p.impactOf(screen);
  return to.length === 0
    ? '<span class="none">–</span><br>내부 관리 전용'
    : `<strong class="yes">O</strong><br>${to.map(({ screen: one }) => `<code>${esc(one.featureId)}</code> ${esc(one.name)}`).join('<br>')}`;
};

/** 비고 — 확장 검토와 2단계 대상만 적는다. 지금 확정된 것을 되풀이하지 않는다. */
const noteOf = (screen: Screen): string => {
  const lines = [
    ...(screen.spec.background ? [rich(formal(screen.spec.background))] : []),
    ...(screen.spec.future ?? []).map((one) => `확장 검토 — ${rich(formal(one))}`),
    ...(screen.readOnly ? [] : ['<strong>저장은 2단계에서 서버로 대체된다.</strong>']),
  ];
  return lines.length === 0 ? '<span class="none">–</span>' : lines.join('<br>');
};

const EXTRA = `
  /*
    요소 하나가 한 덩어리다. 덩어리 사이에 선을 두어 어디까지가 한 요소인지 눈으로 갈리게
    한다 — 줄만 띄우면 긴 설명이 두 요소로 읽힌다.
  */
  .el { padding: 4px 0; border-top: 1px dotted var(--line); }
  .el:first-child { border-top: none; padding-top: 0; }
  .type { color: var(--accent); font-family: "Consolas", "D2Coding", ui-monospace, monospace; font-size: 8pt; }
  .guard { color: var(--warn); }
  td.flow { color: var(--muted); }
  td.flow ol { margin: 0; padding-left: 17px; }
  td.spec { padding: 6px 8px; }
`;

/*
  「기능 명세」 가 이 표의 본문이다. 나머지 칸에 폭을 먼저 나눠 주면 본문이 남은 자리에서
  줄마다 두세 글자로 꺾인다. 앞뒤 칸을 좁히고 본문에 남은 폭을 몰아 준다.
*/
const HEAD =
  th('1Depth', 58) +
  th('2Depth', 68) +
  th('3Depth', 86) +
  th('Sub / Flow', 92) +
  th('화면 정의', 150) +
  th('기능 명세') +
  th('관리자 연동', 108) +
  th('비고', 118);

export const buildScreenDef = (p: DocProject): string => {
  let elements = 0;

  const rows = p.screens
    .map((screen) => {
      const copy = p.copy[screen.featureId];
      if (!copy) throw new Error(`${p.slug} 서술에 ${screen.featureId}(${screen.name}) 가 없습니다.`);

      const { list, rest } = elementsOf(screen);
      elements += list.length;

      const flow = (screen.spec.areas ?? []).map((one) => `<li>${esc(one.area)}</li>`).join('');
      const spec =
        list.map(block).join('') +
        (rest.length > 0
          ? `<div class="el"><strong>화면 공통 예외</strong>${rest.map((one) => `<br><span class="guard">- ${rich(formal(one))}</span>`).join('')}</div>`
          : '');

      return `<tr class="head">
  <td class="d1">${esc(screen.appLabel)}</td>
  <td>${esc(screen.group)}</td>
  <td><strong>${esc(screen.name)}</strong><span class="route"><code>${esc(screen.featureId)}</code><br><code>${esc(screen.route)}</code></span></td>
  <td class="flow">${flow === '' ? '<span class="none">–</span>' : `<ol>${flow}</ol>`}</td>
  <td class="memo">${rich(copy.purpose)}</td>
  <td class="spec">${spec}</td>
  <td class="memo">${linkOf(p, screen)}</td>
  <td class="memo">${noteOf(screen)}</td>
</tr>`;
    })
    .join('');

  const body = `
<h2>화 면 정 의 서</h2>
<p class="lead">
  화면 하나가 한 줄이며, 「기능 명세」 칸에 그 화면의 요소가 차례로 선다. 요소마다
  <strong>이름 · Type · 동작 · 예외처리</strong>를 함께 적었다. 기능 ID 는 다른 네 문서와 같은
  값이므로 <code>MENU-002</code> 처럼 지목하면 같은 화면을 가리킨다.
</p>
<p class="lead">
  요소는 화면 명세의 <strong>입력 항목 · 단추 · 기능</strong> 세 곳에서 읽었다. 단추 정의가 있으면
  그것이 이기고, 없는 기능만 동작 유형에서 타입을 끌어냈다. 검증 규칙은 항목 이름이 들어 있는
  것을 그 항목에 붙였고, 이름이 없는 것은 <strong>화면 공통 예외</strong>로 맨 아래 세웠다.
</p>
${table(HEAD, rows, 'sd')}
`;

  const file = `${p.slug}-화면정의서.html`;
  writeFileSync(
    file,
    shell({ title: '화면 정의서', kind: '화면 · 요소 정의', brand: p.brand, body, extra: EXTRA }),
    'utf8',
  );
  return `${file} — 화면 ${p.screens.length} · 요소 ${elements}`;
};

if (process.argv[1]?.endsWith('build-screendef.ts')) {
  for (const project of PROJECTS) console.log(buildScreenDef(project));
}
