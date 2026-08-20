import { writeFileSync } from 'node:fs';
import { CHECKS, nfrOf, type DocProject } from './lib/doc-project';
import { PROJECTS } from './lib/projects';
import { NO, bullets, cells, grouped, numbered, table, th } from './lib/doc-html';
import { esc, rich } from './lib/html';
import { formal } from './lib/polite';
import { shell } from './lib/page';

/**
 * **비기능 명세서** — 얼마나 잘 도는가.
 *
 * ## 왜 갈라 냈나
 * 기능 명세서에 함께 두었더니 화면마다 「비기능 요건」 절이 붙어, 같은 요건이 화면 수만큼
 * 흩어졌다. "모션 감소를 켠 사용자에게 어떻게 도는가" 를 확인하려면 전 화면의 절을 훑어야
 * 한다.
 *
 * 비기능은 **화면이 아니라 주제로 묻는다.** 성능 · 반응형 · 접근성 · 보안 · 데이터 · 운영으로
 * 나누고, 그 화면에만 걸리는 것만 화면별 절에 남긴다.
 *
 * ## 판정 가능하게 적는다
 * "빠르게 동작한다" 는 비기능 요건이 아니다. 검수 자리에서 통과와 미통과를 가를 수 없기
 * 때문이다. 재는 방법과 기준값을 함께 적고, 저장소의 검사 도구로 재는 것은 그 도구를 적는다.
 *
 * 기준값은 **실제로 재어 정한 것만** 적는다. 지어낸 수를 적어 두면 그것이 그대로 계약 조건이
 * 된다.
 *
 * ```
 * pnpm nfr:build
 * ```
 */

export const buildNfr = (p: DocProject): string => {
  const nfr = nfrOf(p);

  const screenRows = p.screens
    .filter((one) => one.spec.nonFunctional.length > 0)
    .map((one) =>
      cells(
        `<code>${esc(one.featureId)}</code>`,
        esc(one.name),
        esc(one.appLabel),
        bullets(one.spec.nonFunctional.map(formal)),
      ),
    )
    .join('');

  const screenTotal = p.screens.reduce((sum, one) => sum + one.spec.nonFunctional.length, 0);

  const body = `
<h2>1. 적 용 범 위</h2>
<p>
  본 문서는 ${esc(p.clientLabel)}와 ${esc(p.adminLabel)} <strong>전 화면 ${p.screens.length}개</strong>에
  적용된다. 화면 하나에만 걸리는 요건은 3장 「화면별 비기능 요건」에 따로 두었다.
</p>
<p>
  1단계(Front-End)에서 판정 가능한 요건과 2단계(Back-End)에서 판정하는 요건을 구분해 표기한다.
  구분하지 않으면 서버가 없는 상태에서 보안 요건이 미충족으로 잡히고, 실제로는 아직 만들 차례가
  아닌 것을 결함으로 다루게 된다.
</p>

<h2>2. 공 통 비 기 능 요 건</h2>
<p class="lead">
  주제별로 정리한다. 요건마다 <strong>기준값</strong>과 <strong>검증 방법</strong>을 함께 적었으며,
  저장소에 검사 도구가 있는 항목은 그 도구를 적었다.
</p>
${table(NO + th('구분', 74) + th('요건') + th('기준') + th('검증 방법', 260), numbered(grouped(nfr)))}

<h3>2.1 전 화면 공통 제작 기준</h3>
<p class="lead">화면을 가리지 않고 전 화면 제작에 적용되는 기준이다.</p>
${bullets(p.commonNonFunctional.map(formal))}

<h2>3. 화 면 별 비 기 능 요 건</h2>
<p class="lead">
  해당 화면에만 걸리는 요건이다. 전 화면에 걸리는 것은 2장에 한 번만 적었으므로 여기서 되풀이하지
  않는다. 총 <strong>${screenTotal}항목</strong>.
</p>
${table(NO + th('기능 ID', 88) + th('화면', 128) + th('구분', 78) + th('요건'), numbered(screenRows))}

<h2>4. 권 한 요 건</h2>
<p class="lead">
  각 등급의 연산 범위는 아래와 같이 제안한다.
  <strong class="tbd">확정은 발주처가 한다.</strong>
  실제 인증 및 접근 통제 구현은 <strong>2단계 대상</strong>이다.
</p>
${table(
  p.backend.roles[0]!.map((one) => th(one)).join(''),
  p.backend.roles
    .slice(1)
    .map((row) => cells(...row.map((one) => (one === 'O' ? '<strong>O</strong>' : esc(one)))))
    .join(''),
  'right',
)}

<h2>5. 데 이 터 보 존 및 파 기 요 건</h2>
<p class="lead">
  수집 · 보유 · 삭제 · 소멸 · 이력 · 권한 · 보안 · 백업 정책이다. 화면에 드러나지 않지만 서버
  구축 이전에 확정되어야 하는 값이므로 여기에 정의한다.
  <strong class="tbd">「권고」로 표기한 기간과 값은 확정된 것이 아니며</strong>, 근거 법령을 함께
  적었으나 실제 값은 발주처가 정한다.
</p>
${table(NO + th('구분', 62) + th('항목', 146) + th('정의 · 기준'), numbered(grouped(p.backend.dataPolicy)))}

<h2>6. 오 류 응 답 요 건</h2>
<p class="lead">
  화면을 가리지 않고 같은 방식으로 처리한다. 화면마다 되풀이해 적으면 ${p.screens.length}벌이 되고,
  한 곳만 고쳐진다.
</p>
${table(
  NO + th('상황', 136) + th('발생 조건', 260) + th('시스템 처리 · 화면 표시'),
  numbered(p.backend.errors.map(([a, b, c]) => cells(esc(a), rich(b), rich(c))).join('')),
)}

<h2>7. 검 증 도 구</h2>
<p class="lead">
  아래 검사는 저장소에 포함되어 있으며, 인수 시점에 <strong>모두 통과한 상태</strong>로 인도한다.
  검사를 여럿 두는 것은 하나가 나머지를 대신하지 못하기 때문이다.
</p>
${table(
  NO + th('검사', 160) + th('확인하는 것') + th('적용 단계', 90),
  numbered(CHECKS.map(([a, b, c]) => cells(rich(a), rich(b), esc(c))).join('')),
)}
`;

  const file = `${p.slug}-비기능명세서.html`;
  writeFileSync(file, shell({ title: '비기능 명세서', kind: '비기능 요건 · 4/4', brand: p.brand, body }), 'utf8');
  return `${file} — 공통 요건 ${nfr.length} · 화면별 ${screenTotal} · 데이터 정책 ${p.backend.dataPolicy.length}`;
};

if (process.argv[1]?.endsWith('build-nfr.ts')) {
  for (const project of PROJECTS) console.log(buildNfr(project));
}
