import { writeFileSync } from 'node:fs';
import type { Screen } from './lib/screens';
import type { DocProject } from './lib/doc-project';
import type { Prep } from './lib/fnb-external';
import { PROJECTS } from './lib/projects';
import { bullets, cells, grouped, table, th } from './lib/doc-html';
import { esc, rich } from './lib/html';
import { shell } from './lib/page';

/**
 * **요구사항 정의서** — 발주처가 읽는 문서.
 *
 * ## 다른 셋과 무엇이 다른가
 * 과업범위 정의서는 "누가 어디까지 맡는가", 기능 명세서는 "무엇을 하면 무엇이 일어나는가",
 * 비기능 명세서는 "얼마나 잘 도는가" 를 적는다. 이 문서는 그 앞이다 — **무엇이 필요한가.**
 *
 * 요구사항은 구현 방식을 적지 않는다. `왼쪽 기둥에서 묶음 고르기` 도 아니고
 * `카테고리 필터를 제공한다` 도 아니고, **"고객이 원하는 메뉴를 빠르게 찾을 수 있어야 한다"**
 * 가 요구사항이다. 그래서 요구와 기능을 갈라 적고, 마지막에 추적표로 잇는다.
 *
 * ## 요구사항 ID
 * `REQ-C-01`(사이트) · `REQ-A-01`(관리자) · `REQ-OP-01`(운영) · `REQ-EX-01`(외부) ·
 * `REQ-PR-01`(준비). 검토 회신에서 지목할 수 있어야 하고, 기능 ID 와 섞이지 않아야 한다.
 *
 * ```
 * pnpm srs:build
 * ```
 */

type Req = { id: string; screen: Screen };

/**
 * 화면 하나가 요구사항 하나다.
 *
 * 기능 하나하나를 요구로 두면 발주처가 검토할 항목이 수백 개가 되고, 실제로는 아무도 끝까지
 * 못 읽는다. **화면 단위가 발주처가 판단하는 단위**다. 세부는 「세부 요구」 칸에 함께 둔다.
 */
const number = (list: readonly Screen[], prefix: string): Req[] =>
  list.map((screen, index) => ({ id: `${prefix}-${String(index + 1).padStart(2, '0')}`, screen }));

const REQ_HEAD =
  th('요구 ID', 76) + th('영역', 76) + th('화면', 88) + th('요구사항') + th('세부 요구') + th('대응 기능', 78);

const PREP_HEAD =
  th('요구 ID', 84) + th('준비 항목', 116) + th('주체', 88) + th('내용') + th('미준비 시 영향', 220);

const prepRows = (list: readonly Prep[], prefix: string): string =>
  list
    .map((one, index) =>
      cells(
        `<code>${prefix}-${String(index + 1).padStart(2, '0')}</code>`,
        esc(one.item),
        esc(one.owner),
        rich(one.detail),
        rich(one.impact),
      ),
    )
    .join('');

export const buildSrs = (p: DocProject): string => {
  const clientReq = number(p.clientScreens, 'REQ-C');
  const adminReq = number(p.adminScreens, 'REQ-A');

  const copyOf = (screen: Screen) => {
    const copy = p.copy[screen.featureId];
    if (!copy) throw new Error(`${p.slug} 서술에 ${screen.featureId}(${screen.name}) 가 없습니다.`);
    return copy;
  };

  const reqRows = (list: readonly Req[]): string =>
    list
      .map(({ id, screen }) => {
        const copy = copyOf(screen);
        return cells(
          `<code>${esc(id)}</code>`,
          esc(screen.group),
          esc(screen.name),
          rich(copy.purpose),
          bullets(copy.features),
          `<code>${esc(screen.featureId)}</code>`,
        );
      })
      .join('');

  const opRows = p.backend.operation
    .map((one, index) =>
      cells(
        `<code>REQ-OP-${String(index + 1).padStart(2, '0')}</code>`,
        esc(one.area),
        esc(one.target),
        rich(one.rule),
        one.from.map((fid) => `<code>${esc(fid)}</code>`).join(' '),
      ),
    )
    .join('');

  const traceRows = [...clientReq, ...adminReq]
    .map(({ id, screen }) =>
      cells(
        `<code>${esc(id)}</code>`,
        esc(screen.name),
        `<code>${esc(screen.featureId)}</code>`,
        `<code>${esc(screen.route)}</code>`,
        String(screen.spec.actions.length),
      ),
    )
    .join('');

  const areasOf = (list: readonly Screen[]): string =>
    [...new Set(list.map((one) => one.group))].join(' · ');

  const body = `
<h2>1. 사 업 배 경 과 목 표</h2>

<h3>1.1 배경</h3>
<p>${rich(p.intro.background)}</p>

<h3>1.2 목표</h3>
${table(th('구분', 96) + th('목표') + th('판단 기준', 300), grouped(p.intro.goals))}

<h3>1.3 대상 사용자</h3>
${table(th('사용자', 108) + th('상황') + th('이 서비스에서 하는 일', 340), grouped(p.intro.actors))}

<h2>2. 서 비 스 구 성 과 정 보 구 조</h2>
<table>
  <thead><tr>${th('구분', 108)}${th('화면 수', 66)}${th('영역 구성')}</tr></thead>
  <tbody>
    ${cells(esc(p.clientLabel), String(p.clientScreens.length), esc(areasOf(p.clientScreens)))}
    ${cells(esc(p.adminLabel), String(p.adminScreens.length), esc(areasOf(p.adminScreens)))}
  </tbody>
</table>
<p>
  두 서비스는 <strong>동일한 데이터를 참조</strong>한다. ${rich(p.intro.sharedData)}
  무엇이 어디에 반영되는지는 「기능 명세서」의 데이터 변경 영향도에 정리되어 있다.
</p>

<h2>3. ${esc(p.clientLabel)} 요 구 사 항</h2>
<p class="lead">방문자가 서비스에서 해결해야 하는 것을 화면 단위로 정리한다. 「대응 기능」은 이 요구를 구현한 기능 명세서의 항목이다.</p>
${table(REQ_HEAD, reqRows(clientReq))}

<h2>4. ${esc(p.adminLabel)} 요 구 사 항</h2>
<p class="lead">운영자가 서비스를 유지하기 위해 필요한 관리 기능을 정리한다.</p>
${table(REQ_HEAD, reqRows(adminReq))}

<h2>5. 운 영 요 구 사 항</h2>
<p class="lead">
  공개 · 노출 · 상태 · 삭제 · 데이터 관리에 적용되는 운영 규칙이다. 화면 하나에 매이지 않고
  서비스 전반에 걸리므로 따로 정리한다.
</p>
${table(th('요구 ID', 90) + th('주제', 62) + th('적용 대상', 112) + th('요구사항') + th('관련 기능', 160), opRows)}

<h2>6. 외 부 서 비 스 및 준 비 사 항</h2>

<h3>6.1 카카오 지도 (Kakao Maps JavaScript SDK)</h3>
<p class="lead">
  ${rich(p.intro.mapNote)} <strong>키와 도메인 등록은 발주처 계정으로 발급받아야 하는 값</strong>이라,
  개발이 끝나도 이 값이 없으면 지도가 표시되지 않는다. 착수 시점에 준비를 시작해야 한다.
</p>
${table(PREP_HEAD, prepRows(p.external.kakao, 'REQ-EX'))}
<p>
  <strong>연동 방식</strong> — 브라우저에서 <code>https://dapi.kakao.com/v2/maps/sdk.js</code> 를
  <code>appkey</code> 와 함께 내려받아 지도를 그린다. 서버를 거치지 않으므로 2단계 Back-End 구축
  이후에도 이 구조는 그대로 유지된다.
</p>

<h3>6.2 그 밖의 준비 사항</h3>
${table(PREP_HEAD, prepRows(p.external.other, 'REQ-PR'))}

<h3>6.3 조사 근거</h3>
<p class="lead">
  카카오 정책과 단가는 변경될 수 있다. 아래는 <strong>2026년 8월 20일 기준</strong>으로 확인한
  출처이며, 계약 시점에 재확인이 필요하다.
</p>
${table(
  th('내용', 460) + th('출처'),
  p.external.sources.map(([label, url]) => cells(esc(label), `<a href="${esc(url)}">${esc(url)}</a>`)).join(''),
)}

<h2>7. 제 약 사 항 과 전 제</h2>
${bullets(p.intro.constraints)}

<h2>8. 요 구 사 항 추 적 표</h2>
<p class="lead">
  요구사항과 구현 기능을 잇는다. 검수 시 <strong>요구 ID 로 시작해 기능 ID 로 확인</strong>하고,
  해당 기능의 검수 기준은 「기능 명세서」의 같은 ID 항목에 있다.
</p>
${table(
  th('요구 ID', 90) + th('화면', 140) + th('대응 기능', 96) + th('화면 경로', 180) + th('세부 기능 수', 92),
  traceRows,
)}
`;

  const out = `${p.slug}-요구사항정의서.html`;
  writeFileSync(out, shell({ title: '요구사항 정의서', kind: '고객 요구사항 · 1/4', brand: p.brand, body }), 'utf8');
  return `${out} — 사이트 요구 ${clientReq.length} · 관리자 요구 ${adminReq.length} · 운영 요구 ${p.backend.operation.length} · 준비 ${p.external.kakao.length + p.external.other.length}`;
};

if (process.argv[1]?.endsWith('build-srs.ts')) {
  for (const project of PROJECTS) console.log(buildSrs(project));
}
