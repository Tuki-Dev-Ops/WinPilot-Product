import { writeFileSync } from 'node:fs';
import type { Screen } from './lib/screens';
import type { DocProject } from './lib/doc-project';
import { PROJECTS } from './lib/projects';
import { condition } from './lib/action-kind';
import { detailCell, pageCodes } from './lib/sheet';
import { NO, numbered } from './lib/doc-html';
import { esc, note, NONE, rich, TBD } from './lib/html';
import { shell } from './lib/page';
import { formal, formalAction } from './lib/polite';

/**
 * 두 앱의 **기능 명세서**를 만든다 — 개발 · QA · 운영이 구현과 검수에 쓰는 문서.
 *
 * ## 과업범위 정의서와 무엇이 다른가
 * 과업범위 정의서는 계약 문서다 — 무엇을 만들고 무엇을 만들지 않는가, 누가 어디까지 맡는가.
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

export const buildFsd = (p: DocProject): string => {
  /*
    서비스의 영역 구성. 한때 F&B 의 갈래 이름을 문자열로 박아 두어, IR 문서의 1장에 `브랜드 ·
    메뉴 · 인테리어` 가 그대로 실렸다. 화면이 이미 갖고 있는 값을 세어 쓴다.
  */
  const areasOf = (list: readonly Screen[]): string =>
    esc([...new Set(list.map((one) => one.group))].join(' · '));

  /* 값에 따라 화면 처리가 갈리는 칸. 상태값 정의 절이 이 이름들로 항목을 고른다. */
  const STATUS_FIELD = /공개|노출|고정|상태|판매|감추|사용 여부/;

  /* ── 화면 한 줄 ─────────────────────────────────────────────── */

  const code = pageCodes(p.screens);

  const sheetRows = p.screens
    .map((screen) => {
      const depth = screen.menuPath.split(' > ');
      const areas = screen.spec.areas ?? [];
      const admin = screen.spec.admin.filter((one) => !one.startsWith('없음'));
      return `<tr id="${esc(screen.featureId)}">
  <td class="d1">${esc(depth[0] ?? screen.appLabel)}</td>
  <td>${esc(depth[1] ?? NONE)}</td>
  <td>${esc(depth[2] ?? NONE)}</td>
  <td class="flow">${areas.length === 0 ? NONE : `<ol>${areas.map((one) => `<li>${esc(one.area)}</li>`).join('')}</ol>`}</td>
  <td><code>${esc(screen.route)}</code></td>
  <td><code>${esc(code.get(screen.featureId) ?? screen.featureId)}</code></td>
  <td><strong>${esc(screen.name)}</strong><br><code>${esc(screen.featureId)}</code></td>
  <td class="detail">${detailCell(screen)}</td>
  <td class="yn">Y</td>
  <td class="yn">Y</td>
  <td class="yn">${admin.length > 0 ? 'Y' : 'N'}</td>
  <td class="memo">${esc(screen.actor)}</td>
</tr>`;
    })
    .join('');


  /* ── 문서 앞뒤 ─────────────────────────────────────────────── */

  const stateRows = p.screens.flatMap((screen) =>
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

  const impactRows = p.adminScreens.flatMap((admin) =>
    p.impactOf(admin).map(({ screen: client, via }) =>
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
    ['권한 없음', '관리자 화면을 인증 없이 열었습니다.', '로그인 화면으로 보냅니다. 실제 차단은 **2단계 대상**이며, 1단계에서는 화면 흐름까지 구현되어 있습니다.'],
    ['저장 실패', '등록 · 수정 · 삭제가 끝나지 않았습니다.', '입력한 값을 지우지 않고 화면에 남긴 뒤 실패를 알립니다.'],
    ['외부 서비스 오류', '지도 SDK 가 응답하지 않거나 열쇠가 등록되지 않았습니다.', '빈 상자 대신 설명 판을 세웁니다.'],
  ];

  const commonExceptionRows = COMMON_EXCEPTION.map(([when, what, how]) =>
    cells(esc(when), rich(what), rich(how)),
  ).join('');

  const qaRows = p.screens.map((screen) =>
    cells(
      `<code>${esc(screen.featureId)}</code>`,
      esc(screen.name),
      `<a href="#${esc(screen.featureId)}">${esc(screen.route)}</a>`,
      String(
        screen.spec.actions.length + screen.spec.guards.length + (screen.spec.validations?.length ?? 0),
      ),
    ),
  ).join('');

  const qaTotal = p.screens.reduce(
    (sum, one) => sum + one.spec.actions.length + one.spec.guards.length + (one.spec.validations?.length ?? 0),
    0,
  );


  /**
   * 이 문서에만 필요한 규칙. 공통 판은 `lib/page.ts` 에 있다.
   *
   * ## 세부 사항 칸이 표를 지배한다
   * 한 줄에 여섯 갈래가 들어가므로, 폭을 나눠 주지 않으면 그 칸이 종이를 다 먹고 앞의 depth
   * 칸들이 글자마다 꺾인다. 앞뒤 칸에 고정 폭을 주고 남은 폭을 세부 사항에 몰아 준다.
   *
   * 줄이 길어 한 줄이 두 쪽에 걸친다. `break-inside: avoid` 를 걸면 줄 하나가 통째로 다음 장으로
   * 밀려 **앞 장의 절반이 빈 채로 남는다.** 표는 줄 안에서 끊기게 두고, 대신 갈래마다 여백을
   * 주어 어디서 끊겨도 무엇을 읽던 중인지 보이게 한다.
   */
  const EXTRA = `
    h3 {
      color: var(--ink);
      font-size: 11pt;
      margin: 22px 0 8px;
      padding-bottom: 5px;
      border-bottom: 1.6px solid var(--ink);
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
    h4 { color: var(--accent); }

    /* 가로로 눕히면서 두 칸짜리 표가 종이 폭만큼 늘어났다. 좁은 표는 폭을 따로 잡는다. */
    table.kv { max-width: 560px; }
    table.kv th, table.kv td:first-child { width: 92px; background: #fafbfc; font-weight: 600; color: var(--muted); }
    table.rule td:first-child { width: 220px; }

    table.sheet { table-layout: fixed; font-size: 8pt; }
    table.sheet th { font-size: 8pt; }
    table.sheet td { vertical-align: top; break-inside: auto; padding: 4px 5px; }
    table.sheet td.yn { text-align: center; font-weight: 700; }
    table.sheet td.flow ol { margin: 0; padding-left: 13px; }
    table.sheet td.flow li { margin-bottom: 1px; }
    table.sheet code { font-size: 7.5pt; }

    /*
      갈래 제목을 본문 옆이 아니라 위에 세운다. 옆에 두면 제목 폭만큼 본문이 좁아져,
      가장 긴 갈래인 「입력 / 표시 데이터」가 글자마다 꺾인다.
    */
    .pt { margin-bottom: 4px; }
    .pt:last-child { margin-bottom: 0; }
    .pt b { display: block; color: var(--accent); font-weight: 600; }
    .pt span { display: block; padding-left: 8px; color: var(--muted); }

    /* 기능 하나 — 이름 한 줄, 그 아래에 사용자 동작 · 시스템 처리 · 결과. */
    .fn { margin-bottom: 3px; }
    .fn:last-child { margin-bottom: 0; }
    .fn b { display: block; color: var(--ink); font-weight: 600; }
    .fn span { display: block; padding-left: 8px; color: var(--muted); }

    .kw {
      font-family: "Consolas", "D2Coding", ui-monospace, monospace;
      font-size: 8pt;
      color: var(--accent);
      margin-right: 3px;
    }
  `;


  /* ── 11. Back-End 요구사항 ─────────────────────────────────── */

  const th = (label: string, width?: number): string =>
    `<th${width ? ` style="width:${width}px"` : ''}>${esc(label)}</th>`;

  const plain = (head: string, rows: string, klass = ''): string => `<table class="${klass}">
    <thead><tr>${head}</tr></thead>
    <tbody>${rows}</tbody>
  </table>`;

  /*
    Back-End 요구사항은 명세 파일에 해라체로 적혀 있다. 이 문서의 나머지가 합쇼체라, 그대로
    실으면 8장에서만 말투가 바뀐다. 읽는 사람은 그것을 다른 사람이 쓴 장으로 읽는다.

    나누는 자리가 둘이다. 하나는 긴 줄표 — 줄표는 문장 끝이 아니라서 통째로 넘기면 앞 갈래가
    해라체로 남는다. 다른 하나는 굵게 표시하는 별표다. `**…정한다.**` 는 별표로 끝나므로 문장
    끝을 찾는 규칙에 걸리지 않아, 굵게 적힌 문장만 해라체로 남아 있었다.
  */
  const MARK = /( — |\*\*)/;

  const said = (text: string): string =>
    rich(
      text
        .split(MARK)
        .map((one) => (one === '' || MARK.test(one) ? one : formal(one)))
        .join(''),
    );

  const grouped = (list: readonly (readonly string[])[]): string =>
    list
      .map((row, index) => {
        const [area, ...rest] = row;
        const first = list[index - 1]?.[0] !== area;
        let span = 0;
        while (list[index + span]?.[0] === area) span += 1;
        const head = first ? `<td class="d1" rowspan="${span}">${esc(area ?? '')}</td>` : '';
        return `<tr${first ? ' class="head"' : ''}>${head}${rest.map((one) => `<td class="memo">${said(one)}</td>`).join('')}</tr>`;
      })
      .join('');

  const domainRows = p.backend.domains.map((one) =>
    cells(
      esc(one.name),
      said(one.purpose),
      one.screens.map((id) => `<code>${esc(id)}</code>`).join(' '),
      said(one.exposed),
    ),
  ).join('');

  /** 데이터 요구사항 — 관리자 상세 화면의 입력 항목이 곧 그 대상의 속성이다. */
  const dataBlocks = p.backend.domains.map((domain) => {
    const source = p.backend.screenOf(domain.fieldsFrom);
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
  ${plain(NO + th('항목', 118) + th('설명') + th('필수 여부', 64) + th('입력 형태 · 정책', 210), numbered(rows))}`;
  }).join('');

  const apiBlocks = p.backend.domains.map((domain) => {
    const rows = p.backend.endpointsOf(domain)
      .map((one) =>
        cells(
          esc(one.action),
          `<code>${esc(one.method)}</code>`,
          `<code>${esc(one.path)}</code>`,
          said(one.request),
          said(one.response),
          said(one.note),
        ),
      )
      .join('');
    return `<h4>${esc(domain.name)}</h4>
  ${plain(NO + th('기능', 116) + th('Method', 58) + th('Endpoint 예시', 150) + th('요청 데이터', 142) + th('응답 데이터', 142) + th('비고'), numbered(rows))}`;
  }).join('');

  const lifecycleRows = p.backend.states.map((one) => [one.domain, one.name, one.values, one.actor, one.effect, one.flow]);

  const body = `
  <h2>1. 시스템 범위</h2>
  <table>
    <thead><tr><th style="width:110px">구분</th><th style="width:90px">화면 수</th><th>범위</th></tr></thead>
    <tbody>
      ${cells(esc(p.clientLabel), String(p.clientScreens.length), `${areasOf(p.clientScreens)}. ${rich(formal(p.intro.roles[0] ?? ''))}`)}
      ${cells(esc(p.adminLabel), String(p.adminScreens.length), `${areasOf(p.adminScreens)}. ${rich(formal(p.intro.roles[1] ?? ''))}`)}
      ${cells('Back-End', '–', '<strong>2단계 구축 대상.</strong> 필요한 연산 · 권한 · 항목 · 검증은 본 문서 8장에, 데이터 보존 · 파기 정책은 「비기능 명세서」에 정의되어 있습니다.')}
    </tbody>
  </table>

  <h2>2. 기능 명세</h2>
  <p class="lead">
    1개 행이 1개 화면에 해당합니다. <strong>세부 사항</strong>은 6개 항목으로 고정하여 화면 간
    비교와 누락 확인이 가능하도록 구성하였습니다. <strong>개발 구분</strong>의 어드민은 해당 화면의
    데이터를 관리자에서 관리하는지 여부를 의미하며, 디자인 · 개발은 1단계 수행 범위입니다.
  </p>
  <table class="sheet">
    <!--
      머리가 두 줄이라 「개발 구분」 이 세 칸을 아우른다. 고정 배치에서 칸 폭을 정하는 것은 첫
      줄뿐이라, 아우르는 칸 아래의 셋은 폭을 받지 못하고 남은 자리를 나눠 가져 표를 밀어냈다.
      폭은 colgroup 이 정한다.
    -->
    <colgroup>
      <col style="width:2.6%"><col style="width:4.4%"><col style="width:5%"><col style="width:6%">
      <col style="width:6.4%"><col style="width:7.6%"><col style="width:5.4%"><col style="width:7%">
      <col><col style="width:3.4%"><col style="width:3.4%"><col style="width:3.8%"><col style="width:4%">
    </colgroup>
    <thead>
      <tr>
        <th rowspan="2">Num</th><th rowspan="2">1Depth</th><th rowspan="2">2Depth</th>
        <th rowspan="2">3Depth</th><th rowspan="2">Tab / 서브 플로우</th>
        <th rowspan="2">URL / 경로</th><th rowspan="2">Page Code</th>
        <th rowspan="2">화면명</th><th rowspan="2">세부 사항</th>
        <th colspan="3">개발 구분</th><th rowspan="2">비고</th>
      </tr>
      <tr><th>디자인</th><th>개발</th><th>어드민</th></tr>
    </thead>
    <tbody>${numbered(sheetRows)}</tbody>
  </table>

  <h2>3. 공통 기능</h2>
  <p class="lead">
    전 화면에 공통으로 적용되는 구현 기준입니다. 성능 · 반응형 · 접근성 · 보안 등
    <strong>비기능 요건 전체는 「비기능 명세서」</strong>에 정의되어 있으며, 본 장에는 화면 구현에
    직접 적용되는 항목만 기재합니다.
  </p>
  ${note(p.commonNonFunctional)}

  <h2>4. 상태값 정의</h2>
  <p class="lead">노출 · 상단 고정 · 판매 여부 등 값에 따라 화면 처리가 달라지는 항목입니다.</p>
  ${
    stateRows === ''
      ? '<p class="none">상태값을 가진 항목이 명세에 없습니다.</p>'
      : `<table>
    <thead><tr>${NO}<th style="width:88px">기능 ID</th><th style="width:104px">화면</th><th style="width:96px">상태 항목</th><th style="width:130px">값</th><th>조건</th></tr></thead>
    <tbody>${numbered(stateRows)}</tbody>
  </table>`
  }

  <h2>5. 데이터 변경 영향도</h2>
  <p class="lead">관리자에서 데이터를 변경할 때 영향을 받는 고객 화면입니다. 각 고객 화면에 정의된 데이터 출처를 기준으로 작성하였습니다.</p>
  <table>
    <thead><tr>${NO}<th style="width:190px">변경 대상 (관리자)</th><th style="width:190px">영향 기능 (고객 사이트)</th><th>연결된 값</th></tr></thead>
    <tbody>${numbered(impactRows)}</tbody>
  </table>

  <h2>6. 예외 처리 기준</h2>
  <p class="lead">전 화면에 동일한 방식으로 적용합니다. 화면별로 개별 정의할 경우 기준이 분산되어 일부만 갱신되는 문제가 발생합니다.</p>
  <table>
    <thead><tr>${NO}<th style="width:100px">구분</th><th style="width:230px">상황</th><th>시스템 처리 · 화면 표시</th></tr></thead>
    <tbody>${numbered(commonExceptionRows)}</tbody>
  </table>

  <h2>7. QA 검수 체크리스트</h2>
  <p class="lead">
    검수 항목의 상세 내용은 <strong>2장 기능 명세</strong>의 화면별 세부 사항에 있습니다. 아래는 화면별
    검수 항목 수를 집계한 것으로 전체 <strong>${qaTotal}항목</strong>입니다. 화면 경로를 선택하면 해당
    화면의 명세 행으로 이동합니다.
  </p>
  <table>
    <thead><tr>${NO}<th style="width:88px">기능 ID</th><th style="width:150px">화면</th><th>화면 경로</th><th style="width:70px">검수 항목</th></tr></thead>
    <tbody>${numbered(qaRows)}</tbody>
  </table>

  <h2>8. Back-End 요구사항 정의</h2>
  <p class="lead">
    <strong>Back-End 는 2단계 수행 범위</strong>이며, 본 장이 그 착수 명세입니다. 후속 수행자가
    화면을 다시 분석하지 않고 서버 개발에 들어갈 수 있도록 요구사항과 인터페이스를 정의합니다.
    엔드포인트는 구현을 강제하는 확정 사양이 아니라 인터페이스 요구사항입니다.
  </p>

  <h3>8.1 도메인 및 관리 대상 정의</h3>
  ${plain(NO + th('관리 대상', 102) + th('데이터의 목적') + th('관련 화면', 146) + th('고객 서비스 노출'), numbered(domainRows))}

  <h3>8.2 데이터 요구사항 정의</h3>
  <p class="lead">
    각 관리 대상의 데이터 항목입니다. 항목은 관리자 상세 화면의 입력 항목에서 도출하였습니다 —
    운영자가 관리하는 값이 곧 해당 대상의 속성이기 때문입니다. 실제 테이블 설계, 인덱스 및 ORM
    구현은 포함하지 않습니다.
  </p>
  ${dataBlocks}

  <h3>8.3 데이터 관계 정의</h3>
  <p class="lead">후속 개발자가 데이터 모델을 설계할 수 있는 요구사항 수준으로 정의합니다. 물리 ERD 는 포함하지 않습니다.</p>
  ${plain(NO + th('관계', 164) + th('정의'), numbered(p.backend.relations.map(([a, b]) => cells(esc(a), said(b))).join('')))}

  <h3>8.4 API 요구사항 정의</h3>
  <p class="lead">
    화면에서 필요한 서버 기능입니다. 연산은 화면 주소 규칙에서 도출하였습니다 — 목록 · 단건 ·
    등록 화면의 존재가 곧 필요한 연산을 결정합니다.
  </p>
  ${apiBlocks}

  <h3>8.5 비즈니스 규칙 및 검증 정책</h3>
  <p class="lead">
    <strong>화면 검증과 서버 검증을 구분하여 정의합니다.</strong> 화면에서 막는 것은 사용자를 돕기
    위한 것이고, 서버에서 막는 것은 데이터를 지키기 위한 것입니다. 화면에만 검증을 두면 API 를
    직접 호출하는 요청에는 적용되지 않습니다.
  </p>
  ${plain(NO + th('관리 대상', 102) + th('규칙') + th('적용 위치', 196), numbered(grouped(p.backend.rules)))}

  <h3>8.6 상태값 및 라이프사이클 정의</h3>
  ${plain(
    NO + th('관리 대상', 90) + th('상태 항목', 80) + th('값', 102) + th('변경 주체', 104) + th('고객 서비스 영향') + th('전이 규칙', 162),
    numbered(grouped(lifecycleRows)),
  )}

  <h3>8.7 권한 요구사항 정의</h3>
  <p class="lead">
    권한 등급은 현재 데이터에 정의된 <strong>대표 · 운영 · 조회</strong> 세 등급을 사용합니다.
    각 등급의 연산 범위는 현재 문서에 정의되어 있지 않으므로 아래 배분은
    <strong class="tbd">제안이며 확정은 발주처가 합니다.</strong>
  </p>
  ${plain(
    p.backend.roles[0]!.map((one) => th(one)).join(''),
    p.backend.roles.slice(1).map((row) => cells(...row.map((one) => (one === 'O' ? '<strong>O</strong>' : esc(one))))).join(''),
    'right',
  )}

  <h3>8.8 예외 및 오류 응답 요구사항</h3>
  ${plain(
    NO + th('상황', 136) + th('발생 조건', 224) + th('시스템 처리 · 화면 표시'),
    p.backend.errors.map(([a, b, c]) => cells(esc(a), said(b), said(c))).join(''),
  )}

  `;

  const file = `${p.slug}-기능명세서.html`;
  writeFileSync(file, shell({ title: '기능 명세서', kind: '기능 정의 · 3/4', brand: p.brand, body, extra: EXTRA }), 'utf8');
  return `${file} — 화면 ${p.screens.length} · 검수 항목 ${qaTotal}`;
};

if (process.argv[1]?.endsWith('build-fsd.ts')) {
  for (const project of PROJECTS) console.log(buildFsd(project));
}
