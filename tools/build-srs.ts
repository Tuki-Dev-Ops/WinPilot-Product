import { writeFileSync } from 'node:fs';
import { ADMIN_SCREENS, CLIENT_SCREENS, SCREENS, type Screen } from './lib/fnb-model';
import { COPY } from './lib/fnb-copy';
import { OPERATION } from './lib/fnb-backend';
import { KAKAO_PREP, OTHER_PREP, SOURCES, type Prep } from './lib/fnb-external';
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
 * `REQ-C-01`(고객 서비스) · `REQ-A-01`(관리자) · `REQ-OP-01`(운영) · `REQ-EX-01`(외부 · 준비).
 * 검토 회신에서 지목할 수 있어야 하고, 기능 ID 와 섞이지 않아야 한다.
 *
 * ```
 * pnpm srs:build
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

/* ── 요구사항 ──────────────────────────────────────────────── */

type Req = { id: string; screen: Screen };

/**
 * 화면 하나가 요구사항 하나다.
 *
 * 요구를 더 잘게 쪼갤 수도 있었다 — 기능 170건을 그대로 요구 170건으로 두는 것이다. 그러면
 * 발주처가 검토할 항목이 170개가 되고, 실제로는 아무도 끝까지 못 읽는다. **화면 단위가
 * 발주처가 판단하는 단위**다. 세부는 「세부 요구」 칸에 함께 둔다.
 */
const number = (list: readonly Screen[], prefix: string): Req[] =>
  list.map((screen, index) => ({ id: `${prefix}-${String(index + 1).padStart(2, '0')}`, screen }));

const CLIENT_REQ = number(CLIENT_SCREENS, 'REQ-C');
const ADMIN_REQ = number(ADMIN_SCREENS, 'REQ-A');

const copyOf = (screen: Screen) => {
  const copy = COPY[screen.featureId];
  if (!copy) throw new Error(`fnb-copy.ts 에 ${screen.featureId}(${screen.name}) 가 없습니다.`);
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

const REQ_HEAD =
  th('요구 ID', 76) + th('영역', 76) + th('화면', 88) + th('요구사항') + th('세부 요구') + th('대응 기능', 78);

/* ── 운영 요구사항 ─────────────────────────────────────────── */

const opRows = OPERATION.map((one, index) =>
  cells(
    `<code>REQ-OP-${String(index + 1).padStart(2, '0')}</code>`,
    esc(one.area),
    esc(one.target),
    rich(one.rule),
    one.from.map((fid) => `<code>${esc(fid)}</code>`).join(' '),
  ),
).join('');

/* ── 준비 사항 ─────────────────────────────────────────────── */

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

const PREP_HEAD = th('요구 ID', 84) + th('준비 항목', 116) + th('주체', 88) + th('내용') + th('미준비 시 영향', 220);

/* ── 추적표 ────────────────────────────────────────────────── */

/**
 * 요구와 기능을 잇는다.
 *
 * 요구사항 정의서와 기능 명세서를 따로 두면 "이 요구가 어디서 구현되었는가" 를 사람이 기억해야
 * 한다. 검수 자리에서 그 물음이 반드시 나오므로 표로 둔다.
 */
const traceRows = [...CLIENT_REQ, ...ADMIN_REQ]
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

const body = `
<h2>1. 사 업 배 경 과 목 표</h2>

<h3>1.1 배경</h3>
<p>
  브랜드 사이트의 내용이 코드에 고정되어 있으면 가격 한 줄, 공지 한 건을 변경하는 데에도 개발과
  배포가 필요하다. 그 결과 사이트는 구축 시점에 멈추고, 실제 운영은 사이트 밖에서 이루어진다.
  가맹 창업을 검토하는 방문자의 문의도 전화로만 들어와, 누가 언제 무엇을 물었는지가 남지 않는다.
</p>

<h3>1.2 목표</h3>
<table>
  <thead><tr>${th('구분', 96)}${th('목표')}${th('판단 기준', 300)}</tr></thead>
  <tbody>
    ${cells('고객 확보', '무엇을 파는 집인지, 어디에 있는지를 방문자가 스스로 확인할 수 있어야 한다.', '메뉴 · 매장 정보가 사이트에서 완결되며, 확인을 위해 전화가 필요하지 않다.')}
    ${cells('가맹 확대', '창업 검토자가 상담 이전에 비용과 절차를 판단할 수 있어야 한다.', '비용 · 절차 · 인테리어 규모가 공개되어 있고, 상담 신청 경로가 각 화면에서 연결된다.')}
    ${cells('문의 관리', '접수된 창업 문의가 누락 없이 처리되어야 한다.', '문의가 목록으로 쌓이고 상담 상태가 관리되며, 미응답 건이 집계된다.')}
    ${cells('운영 자립', '운영자가 개발 의존 없이 사이트 내용을 유지할 수 있어야 한다.', '사이트에 노출되는 값 전부에 대응하는 관리 화면이 존재한다.')}
  </tbody>
</table>

<h3>1.3 대상 사용자</h3>
<table>
  <thead><tr>${th('사용자', 108)}${th('상황')}${th('이 서비스에서 하는 일', 340)}</tr></thead>
  <tbody>
    ${cells('매장 이용 고객', '메뉴와 가까운 매장을 확인하려 한다. 대부분 모바일로 접근한다.', '메뉴 조회 · 알레르기 및 열량 확인 · 매장 검색 · 공지 및 자주 묻는 질문 확인')}
    ${cells('창업 검토자', '가맹 개설을 저울질하는 단계로, 아직 아무것도 확정하지 않았다.', '비용 및 절차 확인 · 인테리어 규모 확인 · 본사 마케팅 활동 확인 · 상담 신청')}
    ${cells('운영자', '본사에서 사이트 내용을 관리한다. 전산 담당이 아닐 수 있다.', '메뉴 · 매장 · 콘텐츠 등록과 수정 · 공개 상태 관리 · 창업 문의 응대')}
  </tbody>
</table>

<h2>2. 서 비 스 구 성 과 정 보 구 조</h2>
<table>
  <thead><tr>${th('구분', 108)}${th('화면 수', 66)}${th('영역 구성')}</tr></thead>
  <tbody>
    ${cells('고객 서비스', String(CLIENT_SCREENS.length), [...new Set(CLIENT_SCREENS.map((one) => one.group))].join(' · '))}
    ${cells('관리자 서비스', String(ADMIN_SCREENS.length), [...new Set(ADMIN_SCREENS.map((one) => one.group))].join(' · '))}
  </tbody>
</table>
<p>
  두 서비스는 <strong>동일한 데이터를 참조</strong>한다. 관리자에서의 변경이 고객 서비스에 그대로
  반영되며, 무엇이 어디에 반영되는지는 「기능 명세서」의 데이터 변경 영향도에 정리되어 있다.
</p>

<h2>3. 고 객 서 비 스 요 구 사 항</h2>
<p class="lead">방문자가 서비스에서 해결해야 하는 것을 화면 단위로 정리한다. 「대응 기능」은 이 요구를 구현한 기능 명세서의 항목이다.</p>
${table(REQ_HEAD, reqRows(CLIENT_REQ))}

<h2>4. 관 리 자 서 비 스 요 구 사 항</h2>
<p class="lead">운영자가 서비스를 유지하기 위해 필요한 관리 기능을 정리한다.</p>
${table(REQ_HEAD, reqRows(ADMIN_REQ))}

<h2>5. 운 영 요 구 사 항</h2>
<p class="lead">
  공개 · 노출 · 상태 · 삭제 · 데이터 관리에 적용되는 운영 규칙이다. 화면 하나에 매이지 않고
  서비스 전반에 걸리므로 따로 정리한다.
</p>
${table(
  th('요구 ID', 90) + th('주제', 62) + th('적용 대상', 112) + th('요구사항') + th('관련 기능', 160),
  opRows,
)}

<h2>6. 외 부 서 비 스 및 준 비 사 항</h2>

<h3>6.1 카카오 지도 (Kakao Maps JavaScript SDK)</h3>
<p class="lead">
  매장 찾기 화면은 카카오 지도를 사용한다. <strong>키와 도메인 등록은 발주처 계정으로 발급받아야
  하는 값</strong>이라, 개발이 끝나도 이 값이 없으면 지도가 표시되지 않는다. 착수 시점에 준비를
  시작해야 한다.
</p>
${table(PREP_HEAD, prepRows(KAKAO_PREP, 'REQ-EX'))}
<p>
  <strong>연동 방식</strong> — 브라우저에서 <code>https://dapi.kakao.com/v2/maps/sdk.js</code> 를
  <code>appkey</code> 와 함께 내려받아 지도를 그린다. 서버를 거치지 않으므로 2단계 Back-End 구축
  이후에도 이 구조는 그대로 유지된다. 지도를 이용할 수 없는 경우(키 미설정 · 도메인 미등록 ·
  쿼터 초과) 화면은 빈 영역 대신 대체 안내를 표시하며, <strong>매장 목록은 지도와 무관하게
  조회된다.</strong>
</p>

<h3>6.2 그 밖의 준비 사항</h3>
${table(PREP_HEAD, prepRows(OTHER_PREP, 'REQ-PR'))}

<h3>6.3 조사 근거</h3>
<p class="lead">
  카카오 정책과 단가는 변경될 수 있다. 아래는 <strong>2026년 8월 20일 기준</strong>으로 확인한
  출처이며, 계약 시점에 재확인이 필요하다.
</p>
${table(
  th('내용', 460) + th('출처'),
  SOURCES.map(([label, url]) => cells(esc(label), `<a href="${esc(url)}">${esc(url)}</a>`)).join(''),
)}

<h2>7. 제 약 사 항 과 전 제</h2>
${bullets([
  '**1단계 시점에는 서버와 데이터베이스가 없다.** 화면이 참조하는 데이터는 공통 데이터 구조로 관리하며, 관리자에서의 변경은 브라우저 세션 범위에서 유지된다. 2단계에서 실제 서버로 대체한다.',
  '**온라인 주문과 결제는 요구사항에 포함하지 않는다.** 주문은 전화와 매장 방문으로 받는다.',
  '**회원 체계는 고객 서비스에 두지 않는다.** 고객은 로그인 없이 전 화면을 이용하며, 로그인은 관리자 서비스에만 존재한다.',
  '메뉴 이미지 · 콘텐츠 원고 · 법적 고지 원문은 발주처가 제공한다. 제작은 과업 범위에 포함하지 않는다.',
  '개인정보를 수집하는 경로는 **창업 상담 신청 한 곳**이다. 보존과 파기 기준은 「비기능 명세서」에 정의한다.',
  '요구사항의 추가와 변경은 「과업범위 정의서」의 변경 관리 기준을 따른다.',
])}

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

const out = 'FnB-요구사항정의서.html';
writeFileSync(out, shell({ title: '요구사항 정의서', kind: '고객 요구사항 · 1/4', body }), 'utf8');
console.log(
  `${out} — 고객 요구 ${CLIENT_REQ.length} · 관리자 요구 ${ADMIN_REQ.length} · 운영 요구 ${OPERATION.length} · 준비 ${KAKAO_PREP.length + OTHER_PREP.length}`,
);
