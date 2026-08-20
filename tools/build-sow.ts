import { writeFileSync } from 'node:fs';
import type { Screen } from './lib/screens';
import {
  ACCEPT,
  CHANGE,
  dutyOf,
  handoverOf,
  outOf,
  type DocProject,
} from './lib/doc-project';
import { PROJECTS } from './lib/projects';
import { bullets, cells, grouped, table, th } from './lib/doc-html';
import { esc, rich } from './lib/html';
import { shell } from './lib/page';

/**
 * **과업범위 정의서** — 계약 문서.
 *
 * ## 무엇만 남기나
 * 한때 이 문서에 화면별 목적과 주요 기능, 운영 정책, Back-End 요구사항, 데이터 정책까지 다
 * 담았다. 40쪽이 넘었고 그중 대부분이 범위가 아니라 명세였다. 계약을 맞추는 자리에서 데이터
 * 항목 표를 넘기게 되고, 정작 **어디까지 맡는가**는 그 사이에 묻힌다.
 *
 * 여기 남는 것은 넷이다 — **무엇을 만드는가 · 어디까지 만드는가 · 누가 어디까지 맡는가 ·
 * 어떤 상태가 되면 완료인가.** 나머지는 세 문서로 갔다.
 *
 * ```
 * pnpm sow:build     # 이 문서
 * pnpm docs:all      # 두 프로젝트 · 네 문서
 * ```
 */

const SCOPE_HEAD =
  th('기능 ID', 90) + th('화면명', 150) + th('영역', 110) + th('화면 경로') + th('세부 기능 수', 96);

/** 서비스 한 벌의 영역 구성. 첫 줄에만 서비스 이름을 세우고 나머지는 묶는다. */
const iaSection = (label: string, list: readonly Screen[]): string => {
  const groups = new Map<string, Screen[]>();
  for (const one of list) groups.set(one.group, [...(groups.get(one.group) ?? []), one]);
  const entries = [...groups];
  return entries
    .map(([group, screens], index) => {
      const head = index === 0 ? `<td class="d1" rowspan="${entries.length}">${esc(label)}</td>` : '';
      const names = screens
        .map((one) => `<code>${esc(one.featureId)}</code> ${esc(one.name)}`)
        .join(' · ');
      return `<tr${index === 0 ? ' class="head"' : ''}>${head}<td>${esc(group)}</td><td>${screens.length}</td><td class="memo">${names}</td></tr>`;
    })
    .join('');
};

/**
 * 화면 목록은 **범위를 확정하는 목록**이다. 여기 없는 화면은 범위 밖이다.
 *
 * 세부 기능을 적지 않는 것은, 계약 자리에서 필요한 것이 "몇 개를 어디까지" 이고 그 안에서
 * 무엇을 하는가는 기능 명세서가 답하기 때문이다. 대신 세부 기능 수를 적어 규모를 가늠하게 한다.
 */
const scopeRows = (list: readonly Screen[]): string =>
  list
    .map((one) =>
      cells(
        `<code>${esc(one.featureId)}</code>`,
        esc(one.name),
        esc(one.group),
        `<code>${esc(one.route)}</code>`,
        String(one.spec.actions.length),
      ),
    )
    .join('');

export const buildSow = (p: DocProject): string => {
  const totalActions = p.screens.reduce((sum, one) => sum + one.spec.actions.length, 0);
  const duty = dutyOf(p);

  const dutyRows = duty
    .map(
      ([area, why, scope, output, done, out]) =>
        `<tr class="head"><td class="d1">${esc(area)}</td>${[why, scope, output, done, out].map((one) => `<td class="memo">${rich(one)}</td>`).join('')}</tr>`,
    )
    .join('');

  const out = outOf(p);
  const handover = handoverOf(p);

  const body = `
<h2>1. 과 업 개 요</h2>

<h3>1.1 과업 목적</h3>
<p>${rich(p.intro.background)}</p>
${p.intro.purpose.map((one) => `<p>${rich(one)}</p>`).join('')}

<h3>1.2 서비스 구성</h3>
<table>
  <thead><tr>${th('구분', 106)}${th('화면 수', 66)}${th('세부 기능', 72)}${th('역할')}</tr></thead>
  <tbody>
    ${cells(esc(p.clientLabel), String(p.clientScreens.length), String(p.clientScreens.reduce((s, o) => s + o.spec.actions.length, 0)), rich(p.intro.roles[0]))}
    ${cells(esc(p.adminLabel), String(p.adminScreens.length), String(p.adminScreens.reduce((s, o) => s + o.spec.actions.length, 0)), rich(p.intro.roles[1]))}
  </tbody>
</table>
<p>두 서비스는 <strong>동일한 데이터를 참조</strong>한다. ${rich(p.intro.sharedData)}</p>

<h3>1.3 수행 단계</h3>
<p class="lead">
  본 과업은 두 단계로 나누어 수행한다. <strong>Back-End 는 제외 범위가 아니라 2단계의 수행
  범위</strong>이며, 1단계에서 확정한 요구사항이 그대로 2단계의 착수 명세가 된다.
</p>
<table>
  <thead><tr>${th('단계', 72)}${th('수행 범위', 300)}${th('완료 기준')}</tr></thead>
  <tbody>
    ${cells('1단계', '기획 · UI 디자인 · Front-End 구현 · Back-End 요구사항 정의', `화면 ${p.screens.length}개가 정의대로 동작하고, Back-End 요구사항이 서버 개발에 착수할 수 있는 수준으로 확정된 상태. 상세 기준은 5.2 참조.`)}
    ${cells('2단계', '서버 애플리케이션 · 데이터베이스 · API · 인증 및 권한 · Front-End 연동', '정의한 규칙이 서버에서 지켜지는 상태. 상세 기준은 5.4 참조.')}
  </tbody>
</table>

<h3>1.4 전제 조건</h3>
${bullets(p.intro.premises)}

<h2>2. 과 업 범 위</h2>
<p class="lead">
  어디까지 만드는가 — 화면 단위로 확정된 범위다. <strong>이 표에 없는 화면은 범위 밖</strong>이다.
  각 화면이 무엇을 하는가는 「기능 명세서」의 같은 기능 ID 항목에 있다.
</p>

<h3>2.1 정보 구조</h3>
${table(
  th('구분', 106) + th('영역', 110) + th('화면 수', 66) + th('구성 화면'),
  iaSection(p.clientLabel, p.clientScreens) + iaSection(p.adminLabel, p.adminScreens),
)}

<h3>2.2 ${esc(p.clientLabel)} 화면 목록</h3>
${table(SCOPE_HEAD, scopeRows(p.clientScreens))}

<h3>2.3 ${esc(p.adminLabel)} 화면 목록</h3>
${table(SCOPE_HEAD, scopeRows(p.adminScreens))}

<h2>3. 책 임 범 위</h2>
<p class="lead">
  책임 범위에서 실제로 다투는 것은 담당 여부가 아니라 <strong>어디까지 수행하면 완료인가</strong>다.
  따라서 각 영역에 대해 수행 목적 · 제공 범위 · 주요 산출물 · 완료 기준 · 제외 범위를 함께 정의한다.
</p>
${table(
  th('구분', 76) + th('수행 목적', 146) + th('제공 범위') + th('주요 산출물', 136) + th('완료 기준') + th('제외 범위', 126),
  dutyRows,
)}

<h2>4. 제 외 범 위</h2>
<p class="lead">
  아래는 <strong>본 과업에 포함하지 않는다.</strong> 적어 두지 않으면 포함된 것으로 읽히므로 따로 둔다.
  「사유」를 함께 적는 것은 빠진 항목을 볼 때마다 왜 빠졌는지 되묻는 일을 없애기 위해서다.
</p>
${table(th('구분', 80) + th('항목', 230) + th('사유'), grouped(out))}

<h2>5. 완 료 및 인 수 기 준</h2>

<h3>5.1 인수 산출물</h3>
${table(th('단계', 72) + th('산출물', 210) + th('내용'), grouped(handover))}

<h3>5.2 1단계 인수 판정 기준</h3>
${bullets(ACCEPT)}

<h3>5.3 Back-End 정의 완료 기준 (1단계)</h3>
<p class="lead">다음 조건을 모두 충족한 경우 Back-End 정의가 완료된 것으로 판단한다. 정의 내용은 「기능 명세서」에 있다.</p>
${bullets(p.backend.defineDone)}

<h3>5.4 2단계 완료 기준</h3>
<p class="lead">
  1단계의 완료 기준이 「화면이 정의대로 도는가」였다면, 2단계는 「정의한 규칙이 서버에서
  지켜지는가」다. 화면에서 막는 것과 서버에서 막는 것은 다른 일이므로 따로 판정한다.
</p>
${bullets(p.backend.buildDone)}

<h3>5.5 2단계 구축 항목</h3>
<p class="lead">
  각 항목의 요구사항은 「기능 명세서」의 Back-End 요구사항 정의에 이미 확정되어 있으므로,
  2단계는 화면을 새로 분석하지 않고 그대로 착수한다.
</p>
${table(th('구축 항목', 280) + th('근거'), p.backend.build.map((one) => cells(esc(one.name), rich(one.basis))).join(''))}

<h2>6. 변 경 관 리 기 준</h2>
${table(th('단계', 72) + th('기준', 320) + th('까닭'), grouped(CHANGE))}
`;

  const file = `${p.slug}-과업범위정의서.html`;
  writeFileSync(file, shell({ title: '과업범위 정의서', kind: '구축 범위 · 2/4', brand: p.brand, body }), 'utf8');
  return `${file} — 화면 ${p.screens.length} · 세부 기능 ${totalActions} · 책임 ${duty.length}영역 · 제외 ${out.length} · 산출물 ${handover.length}`;
};

if (process.argv[1]?.endsWith('build-sow.ts')) {
  for (const project of PROJECTS) console.log(buildSow(project));
}
