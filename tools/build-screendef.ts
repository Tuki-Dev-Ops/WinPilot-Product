import { writeFileSync } from 'node:fs';
import type { Screen } from './lib/screens';
import type { DocProject } from './lib/doc-project';
import { PROJECTS } from './lib/projects';
import { elementsOf, type Element } from './lib/element';
import { kindIn } from './lib/action-kind';
import { DESIGN_NOTE } from './lib/design-note';
import { table, th } from './lib/doc-html';
import { esc, rich } from './lib/html';
import { formal } from './lib/polite';
import { shell } from './lib/page';

/**
 * **화면 정의서** — 화면 하나가 무엇으로 이루어졌고 각 요소가 무엇을 하는지 적는 표.
 *
 * ## 다른 문서와 무엇이 다른가
 * 요구사항 정의서는 "무엇이 필요한가", 기능 명세서는 "무엇을 하면 무엇이 일어나는가" 를
 * 적는다. 이 문서는 **요소 단위**다 — 이 화면에 어떤 입력과 단추가 있고, 각각이 무슨 타입이며
 * 무엇을 목적으로 어떤 데이터를 다루는가.
 *
 * 기획과 개발이 같은 화면을 놓고 함께 보는 표라, 한 화면이 한 줄이고 그 안에 요소가 늘어선다.
 *
 * ## 비고를 세 갈래로 나눈다
 * 처음에는 명세의 배경과 확장 항목을 그대로 옮겨 적었다. 그러자 비고가 **문제 상황을 이야기로
 * 설명하는 칸**이 되었고, 읽는 사람은 그중 무엇이 지금 지켜야 할 규칙이고 무엇이 나중 이야기인지
 * 갈라야 했다.
 *
 * 지금은 셋으로 나눈다 — **설계 배경**(왜 이 구조인가) · **정보 구조 및 UX**(무엇을 어떤
 * 기준으로 묶어 보이는가) · **확장 검토**(무엇을 언제 더할 수 있는가). 확장에는 우선순위를
 * 붙이되 **제안임을 밝힌다.**
 *
 * ```
 * pnpm screendef:build
 * ```
 */

/**
 * 확장 항목의 우선순위를 낱말로 가른다.
 *
 * 우선순위는 사업 판단이라 원본에 없다. 그렇다고 전부 같은 무게로 늘어놓으면 목록이 아니라
 * 잡동사니가 된다. **서비스에 미치는 영향의 크기**를 기준으로 낱말을 나누되, 문서에 제안임을
 * 밝힌다.
 *
 * - 높음 : 접수 · 발송 · 인증처럼 **되지 않으면 업무가 끊기는** 것
 * - 중간 : 검색 · 다국어 · 내려받기처럼 **탐색과 활용을 넓히는** 것
 * - 낮음 : 사진 · 인사말처럼 **없어도 판단에 지장이 없는** 것
 */
const PRIORITY: [RegExp, string][] = [
  [/실제 접수|발송|인증|권한|결제|만료|갱신|이력|백업|보안/, '높음'],
  [/검색|다국어|영문|내려받기|다운로드|필터|거르기|정렬|통계|연동|API/, '중간'],
  [/사진|이미지|인사말|사옥|무늬|배경|영상/, '낮음'],
];

const priorityOf = (text: string): string => PRIORITY.find(([test]) => test.test(text))?.[1] ?? '중간';

/**
 * 확장 항목에서 **무엇을**과 **지금은 어떠한가**를 가른다.
 *
 * 원본은 `메뉴 사진. 지금은 문어 그림 자리가 대신한다` 처럼 항목과 현재 상태를 한 문장에
 * 담는다. 항목만 남기면 왜 아직 없는지가 사라지고, 통째로 두면 목록이 이야기가 된다.
 */
const splitFuture = (text: string): { item: string; now?: string } => {
  const match = /^(.*?)[.]\s+(.+)$/s.exec(text.trim());
  return match ? { item: match[1] ?? text, now: match[2] } : { item: text.replace(/[.]$/, '') };
};

/**
 * 정보 구조 규칙에서 **규칙만** 남긴다.
 *
 * 원본은 `고른 묶음은 주소에 남기지 않는다 — 한 화면에서 기둥을 눌러 가며 보는 자리라…`
 * 처럼 규칙 뒤에 까닭을 붙인다. 까닭은 설계 배경의 몫이고, 이 칸에서 필요한 것은 지켜야 할
 * 규칙이다.
 */
const ruleOnly = (text: string): string => {
  /*
    까닭은 줄표 뒤에도 오고 마침표 뒤에도 온다. 정보 구조 칸에 필요한 것은 지켜야 할 규칙
    하나이므로 **첫 문장의 줄표 앞까지만** 남긴다. 까닭은 설계 배경의 몫이다.
  */
  const head = text.split(' — ')[0] ?? text;
  const first = /^(.*?[.])\s/.exec(head);
  return formal(first ? first[1] ?? head : head);
};

const block = (one: Element): string => {
  const head = `<strong>[${esc(one.name)}]</strong><br><span class="type">- Type : ${esc(one.type)}</span>`;
  const rest = one.lines
    .map(({ label, text }) => {
      const klass = label === '예외 처리' ? ' class="guard"' : '';
      return `<br><span${klass}>- ${esc(label)} : ${rich(text)}</span>`;
    })
    .join('');
  return `<div class="el">${head}${rest}</div>`;
};

/**
 * 이 관리자 화면이 **값을 고칠 수 있는가**.
 *
 * 목록과 설정 중에는 조회만 하는 화면이 있다 — IR 의 `회사 소개` 는 홈 소개 문단과 회사
 * 정보를 **읽기만** 하고, 실제 값은 코드에 있다. 그런데도 연동을 `O` 로 적으면 발주처는
 * 그 문구를 관리자에서 고칠 수 있는 것으로 읽는다.
 *
 * 등록 · 수정 · 삭제 · 상태 변경 중 하나라도 하는 화면만 관리 가능으로 본다.
 */
const canEdit = (screen: Screen): boolean =>
  screen.spec.actions.some((one) => {
    const kind = kindIn(one, screen.route, screen.readOnly);
    return kind === '등록' || kind === '수정' || kind === '삭제' || kind === '상태 변경';
  });

/** 그 화면이 실제로 다루는 항목. 화면 이름만으로는 무엇이 연동되는지 알 수 없다. */
const managedItems = (screen: Screen): string =>
  (screen.spec.fields ?? [])
    .filter((one) => one.type !== '읽기 전용')
    .map((one) => one.name)
    .join(' · ');

/**
 * 관리자 연동 — **이 화면이 실제로 무엇을 연동하는가**.
 *
 * 메뉴 이름만 늘어놓으면 "그 메뉴에서 무엇을 고칠 수 있는가" 를 다시 찾아야 하고, 조회 전용
 * 화면까지 `O` 로 묶이면 고칠 수 없는 값이 고칠 수 있는 것으로 읽힌다.
 *
 * 그래서 셋으로 가른다 — **관리 가능**(등록 · 수정이 되는 화면과 그 항목) · **조회 전용**
 * (관리자에서 확인만 되고 값은 코드에 있는 것) · **연동 없음**.
 */
const linkOf = (p: DocProject, screen: Screen): string => {
  if (screen.app === 'admin') {
    const to = p.impactOf(screen);
    if (!canEdit(screen)) {
      return '<span class="none">–</span><br>조회 전용 화면이며 사이트로 내보내는 값이 없다.';
    }
    return to.length === 0
      ? '<span class="none">–</span><br>내부 관리 전용이며 사이트에 노출되지 않는다.'
      : `<strong class="yes">O</strong><br><span class="sub">사이트 반영 대상</span>${to
          .map(({ screen: one }) => `<br>· <code>${esc(one.featureId)}</code> ${esc(one.name)}`)
          .join('')}`;
  }

  const from = screen.spec.admin.filter((one) => !one.startsWith('없음'));
  if (from.length === 0) {
    return '<span class="none">–</span><br>화면 구성과 문구가 코드에서 관리되며 연동 대상이 없다.';
  }

  /*
    같은 관리자 화면이 두 연결값에 함께 걸리는 일이 흔하다 — `등록 > 메뉴` 와
    `등록 > 메뉴 > 메뉴 묶음` 은 같은 메뉴를 가리킨다. 화면은 한 번씩만 세운다.
  */
  const owners = p.adminScreens.filter((one) =>
    p.impactOf(one).some((x) => x.screen.featureId === screen.featureId),
  );
  const editable = owners.filter(canEdit);
  const readOnly = owners.filter((one) => !canEdit(one));

  const mark =
    editable.length > 0
      ? '<strong class="yes">O</strong>'
      : '<strong class="warnmark">△</strong> 조회 전용';

  const editBlock =
    editable.length === 0
      ? ''
      : `<br><span class="sub">관리 가능 항목</span>${editable
          .map((one) => {
            const items = managedItems(one);
            return `<br>· <code>${esc(one.featureId)}</code> ${esc(one.name)}${
              items === '' ? '' : `<br>&nbsp;&nbsp;<span class="now">${esc(items)}</span>`
            }`;
          })
          .join('')}`;

  const readBlock =
    readOnly.length === 0
      ? ''
      : `<br><br><span class="sub">조회 전용</span>${readOnly
          .map((one) => `<br>· <code>${esc(one.featureId)}</code> ${esc(one.name)}`)
          .join('')}<br>&nbsp;&nbsp;<span class="now">관리자에서 확인만 가능하며, 값 변경은 코드 반영이 필요하다.</span>`;

  const menus = from.map((one) => `<br>· ${rich(formal(one))}`).join('');

  return `${mark}<br><span class="sub">연동 메뉴</span>${menus}${editBlock}${readBlock}`;
};

/** 비고 — 설계 배경 · 정보 구조 및 UX · 확장 검토 세 갈래. 없는 갈래는 세우지 않는다. */
const noteOf = (screen: Screen, slug: string): string => {
  const parts: string[] = [];

  /* 배경은 명세의 이야기 대신 다시 적은 판단을 쓴다 — `lib/design-note.ts` 에 까닭을 적었다. */
  const note = DESIGN_NOTE[`${slug}/${screen.featureId}`];
  if (note) parts.push(`<span class="sub">설계 배경</span><br>${rich(note)}`);

  const rules = (screen.spec.policy ?? []).map(ruleOnly);
  if (rules.length > 0) {
    parts.push(`<span class="sub">정보 구조 및 UX</span>${rules.map((one) => `<br>· ${rich(one)}`).join('')}`);
  }

  const future = (screen.spec.future ?? []).map((one) => {
    const { item, now } = splitFuture(one);
    return `<br>· <strong>${esc(priorityOf(one))}</strong> : ${rich(formal(item))}${now ? `<br>&nbsp;&nbsp;<span class="now">${rich(formal(now))}</span>` : ''}`;
  });
  if (future.length > 0) {
    parts.push(`<span class="sub">확장 검토 <em>(우선순위는 제안)</em></span>${future.join('')}`);
  }

  if (!screen.readOnly) {
    parts.push('<span class="sub">단계</span><br>저장 및 전송은 2단계에서 서버로 대체된다.');
  }

  return parts.length === 0 ? '<span class="none">–</span>' : parts.join('<br><br>');
};

const EXTRA = `
  /*
    요소 하나가 한 덩어리다. 덩어리 사이에 선을 두어 어디까지가 한 요소인지 눈으로 갈리게
    한다 — 줄만 띄우면 긴 설명이 두 요소로 읽힌다.
  */
  .el { padding: 5px 0; border-top: 1px dotted var(--line); }
  .el:first-child { border-top: none; padding-top: 0; }
  .type { color: var(--accent); font-family: "Consolas", "D2Coding", ui-monospace, monospace; font-size: 8pt; }
  .guard { color: var(--warn); }
  /* 비고 안의 갈래 머리. 셋이 한 칸에 들어가므로 머리가 없으면 어디서 갈리는지 안 보인다. */
  .sub { display: inline-block; font-weight: 700; color: var(--ink); border-bottom: 1px solid var(--line); }
  .sub em { font-weight: 400; font-style: normal; color: var(--faint); }
  .now { color: var(--faint); }
  .warnmark { color: var(--warn); }
  td.flow { color: var(--muted); }
  td.flow ol { margin: 0; padding-left: 17px; }
  td.spec { padding: 6px 8px; }
`;

/*
  「기능 명세」 가 이 표의 본문이다. 나머지 칸에 폭을 먼저 나눠 주면 본문이 남은 자리에서
  줄마다 두세 글자로 꺾인다. 앞뒤 칸을 좁히고 본문에 남은 폭을 몰아 준다.
*/
const HEAD =
  th('Depth 1', 56) +
  th('Depth 2', 64) +
  th('Depth 3', 84) +
  th('Sub / Flow', 86) +
  th('화면 정의', 148) +
  th('기능 명세') +
  th('관리자 연동', 148) +
  th('비고', 168);

export const buildScreenDef = (p: DocProject): string => {
  let elements = 0;

  const rows = p.screens
    .map((screen) => {
      const copy = p.copy[screen.featureId];
      if (!copy) throw new Error(`${p.slug} 서술에 ${screen.featureId}(${screen.name}) 가 없습니다.`);

      const { list, rest } = elementsOf(screen, p.screens);
      elements += list.length;

      const flow = (screen.spec.areas ?? []).map((one) => `<li>${esc(one.area)}</li>`).join('');
      const spec =
        list.map(block).join('') +
        (rest.length > 0
          ? `<div class="el"><strong>[화면 공통 예외]</strong>${rest.map((one) => `<br><span class="guard">- ${rich(one)}</span>`).join('')}</div>`
          : '');

      return `<tr class="head">
  <td class="d1">${esc(screen.appLabel)}</td>
  <td>${esc(screen.group)}</td>
  <td><strong>${esc(screen.name)}</strong><span class="route"><code>${esc(screen.featureId)}</code><br><code>${esc(screen.route)}</code></span></td>
  <td class="flow">${flow === '' ? '<span class="none">–</span>' : `<ol>${flow}</ol>`}</td>
  <td class="memo">${rich(copy.purpose)}</td>
  <td class="spec">${spec}</td>
  <td class="memo">${linkOf(p, screen)}</td>
  <td class="memo">${noteOf(screen, p.slug)}</td>
</tr>`;
    })
    .join('');

  const file = `${p.slug}-화면정의서.html`;
  writeFileSync(
    file,
    shell({
      title: '화면 정의서',
      kind: '화면 · 요소 정의',
      brand: p.brand,
      body: `\n${table(HEAD, rows, 'sd')}\n`,
      extra: EXTRA,
    }),
    'utf8',
  );
  return `${file} — 화면 ${p.screens.length} · 요소 ${elements}`;
};

if (process.argv[1]?.endsWith('build-screendef.ts')) {
  for (const project of PROJECTS) console.log(buildScreenDef(project));
}
