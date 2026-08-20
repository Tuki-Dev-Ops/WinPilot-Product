import { writeFileSync } from 'node:fs';
import type { Screen } from './lib/screens';
import { CHANGE, outOf, type DocProject } from './lib/doc-project';
import { PROJECTS } from './lib/projects';
import { NO, bullets, cells, grouped, numbered, table, th } from './lib/doc-html';
import { TBD, esc, rich } from './lib/html';
import { shell } from './lib/page';

/**
 * **과업범위 정의서** — 계약 문서.
 *
 * ## 무엇만 남기나
 * 한때 이 문서에 화면별 목적과 주요 기능, 운영 정책, Back-End 요구사항, 데이터 정책까지 다
 * 담았다. 40쪽이 넘었고 그중 대부분이 범위가 아니라 명세였다. 계약을 맞추는 자리에서 데이터
 * 항목 표를 넘기게 되고, 정작 **어디까지 맡는가**는 그 사이에 묻힌다.
 *
 * 여기 남는 것은 셋이다 — **무엇을 만드는가 · 어디까지 만드는가 · 무엇이 범위 밖인가.**
 * 나머지는 세 문서로 갔다.
 *
 * ## 책임 범위와 인수 기준을 뺀 자리
 * 한때 영역별 책임 범위표와 인수 판정 기준을 여기 두었다. 둘 다 **수행사가 스스로 적은 완료
 * 선언**이라, 계약 자리에서 합의할 것이 아니라 통보하는 것처럼 읽혔다. 무엇을 만드는지와 무엇을
 * 안 만드는지만 남기고, 완료 판정은 검수 문서가 맡는다.
 *
 * ```
 * pnpm sow:build     # 이 문서
 * pnpm docs:all      # 두 프로젝트 · 네 문서
 * ```
 */

const SCOPE_HEAD = NO + th('기능 ID', 92) + th('화면명', 168) + th('영역', 124) + th('화면 정의');

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
 * ## 수 대신 정의를 적는다
 * 앞선 판은 화면 경로와 세부 기능 수를 적었다. 그런데 `47개 화면 · 170건` 이라는 수는 규모를
 * 알려 줄 뿐 **그 화면이 무엇인지는 알려 주지 않는다.** 범위를 다투는 자리에서 오가는 말은
 * 언제나 "이 화면이 무엇을 하는 화면인가" 이고, 그때마다 다른 문서를 펴게 된다.
 *
 * 경로도 뺀다. 주소는 만드는 쪽의 값이지 범위를 가르는 값이 아니며, 그 자리를 화면 정의에 준다.
 */
const scopeRows = (p: DocProject, list: readonly Screen[]): string =>
  list
    .map((one) =>
      cells(
        `<code>${esc(one.featureId)}</code>`,
        esc(one.name),
        esc(one.group),
        `<span class="memo">${rich(p.copy[one.featureId]?.purpose ?? TBD)}</span>`,
      ),
    )
    .join('');

export const buildSow = (p: DocProject): string => {
  const totalActions = p.screens.reduce((sum, one) => sum + one.spec.actions.length, 0);
  const out = outOf(p);

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
    ${cells('1단계', '기획 · UI 디자인 · Front-End 구현 · Back-End 요구사항 정의', `화면 ${p.screens.length}개가 정의대로 동작하고, Back-End 요구사항이 서버 개발에 착수할 수 있는 수준으로 확정된 상태.`)}
    ${cells('2단계', '서버 애플리케이션 · 데이터베이스 · API · 인증 및 권한 · Front-End 연동', '정의한 규칙이 서버에서 지켜지는 상태.')}
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
${table(SCOPE_HEAD, numbered(scopeRows(p, p.clientScreens)))}

<h3>2.3 ${esc(p.adminLabel)} 화면 목록</h3>
${table(SCOPE_HEAD, numbered(scopeRows(p, p.adminScreens)))}

<h2>3. 제 외 범 위</h2>
<p class="lead">
  아래는 <strong>본 과업에 포함하지 않는다.</strong> 적어 두지 않으면 포함된 것으로 읽히므로 따로 둔다.
  「사유」를 함께 적는 것은 빠진 항목을 볼 때마다 왜 빠졌는지 되묻는 일을 없애기 위해서다.
</p>
${table(NO + th('구분', 80) + th('항목', 230) + th('사유'), numbered(grouped(out)))}

<h2>4. 변 경 관 리 기 준</h2>
${table(NO + th('단계', 88) + th('기준'), numbered(grouped(CHANGE)))}
`;

  const file = `${p.slug}-과업범위정의서.html`;
  writeFileSync(file, shell({ title: '과업범위 정의서', kind: '구축 범위 · 2/4', brand: p.brand, body }), 'utf8');
  return `${file} — 화면 ${p.screens.length} · 세부 기능 ${totalActions} · 제외 ${out.length}`;
};

if (process.argv[1]?.endsWith('build-sow.ts')) {
  for (const project of PROJECTS) console.log(buildSow(project));
}
