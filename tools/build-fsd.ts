import { writeFileSync } from 'node:fs';
import type { Screen } from './lib/screens';
import type { DocProject } from './lib/doc-project';
import { PROJECTS } from './lib/projects';
import { condition, handlingOf, kindIn, sectionOf, SECTION_ORDER } from './lib/action-kind';
import { esc, namedList, note, NONE, rich, TBD } from './lib/html';
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
          ? '1단계 완료 — 화면 구현이 끝났고, 값은 공유 데이터 구조에서 읽습니다. 서버 연동은 <strong>2단계 대상</strong>입니다.'
          : '1단계 완료 — 화면 구현이 끝났고, 저장은 브라우저 안에서만 유지됩니다. 서버 연동은 <strong>2단계 대상</strong>입니다.',
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
      const rows = p.impactOf(screen).map(({ screen: client, via }) =>
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

  const listRows = p.screens.map((one) =>
    cells(
      `<code>${esc(one.featureId)}</code>`,
      esc(one.name),
      esc(one.menuPath),
      `<code>${esc(one.route)}</code>`,
      namedList(one.spec.actions),
    ),
  ).join('');

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
   * 화면 하나가 열두 절로 이어지므로 **화면의 경계**가 눈에 보여야 한다. 기능 ID 를 검은 딱지로
   * 세우고 제목 아래에 굵은 선을 둔다 — 그 선이 없으면 47개 화면이 한 덩어리로 흐른다.
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
    table.flow td:first-child { width: 30px; text-align: center; color: var(--faint); }
    table.flow td:last-child { width: 62px; text-align: center; color: var(--muted); white-space: nowrap; }
    table.rule td:first-child { width: 220px; }

    .kw {
      font-family: "Consolas", "D2Coding", ui-monospace, monospace;
      font-size: 8pt;
      color: var(--accent);
      margin-right: 3px;
    }
    .screen { break-inside: auto; margin-bottom: 4px; }
  `;


  /* ── 11. Back-End 요구사항 ─────────────────────────────────── */

  const th = (label: string, width?: number): string =>
    `<th${width ? ` style="width:${width}px"` : ''}>${esc(label)}</th>`;

  const plain = (head: string, rows: string, klass = ''): string => `<table class="${klass}">
    <thead><tr>${head}</tr></thead>
    <tbody>${rows}</tbody>
  </table>`;

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

  const domainRows = p.backend.domains.map((one) =>
    cells(
      esc(one.name),
      rich(one.purpose),
      one.screens.map((id) => `<code>${esc(id)}</code>`).join(' '),
      rich(one.exposed),
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
  ${plain(th('항목', 118) + th('설명') + th('필수 여부', 64) + th('입력 형태 · 정책', 210), rows)}`;
  }).join('');

  const apiBlocks = p.backend.domains.map((domain) => {
    const rows = p.backend.endpointsOf(domain)
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
  ${plain(th('기능', 116) + th('Method', 58) + th('Endpoint 예시', 150) + th('요청 데이터', 142) + th('응답 데이터', 142) + th('비고'), rows)}`;
  }).join('');

  const lifecycleRows = p.backend.states.map((one) => [one.domain, one.name, one.values, one.actor, one.effect, one.flow]);

  const body = `
  <h2>1. 서비스 개요</h2>
  <p>
    본 서비스는 <strong>고객 사이트</strong>와 <strong>관리자</strong> 한 쌍으로
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
      ${cells('고객 사이트', String(p.clientScreens.length), '브랜드 · 메뉴 · 인테리어 · 마케팅 · 매장안내 · 창업안내 · 고객센터 · 법적 고지. 창업 상담 신청 한 곳을 제외하면 모두 읽기 전용입니다.')}
      ${cells('관리자', String(p.adminScreens.length), '대시보드 · 등록 · 창업 · 고객센터 · 배너 · 설정. 목록 · 상세 · 등록 세 꼴이 반복됩니다.')}
      ${cells('Back-End', '–', '<strong>2단계 구축 대상.</strong> 필요한 연산 · 권한 · 항목 · 검증과 데이터 정책은 「업무 범위 정의서」 6장에 정의되어 있습니다.')}
    </tbody>
  </table>

  <h2>3. 기능 목록</h2>
  <table>
    <thead><tr><th style="width:82px">기능 ID</th><th style="width:92px">화면명</th><th style="width:146px">메뉴 경로</th><th style="width:114px">화면 경로</th><th>세부 기능</th></tr></thead>
    <tbody>${listRows}</tbody>
  </table>

  <h2>4. 고객 사이트 기능 명세</h2>
  ${p.clientScreens.map(article).join('')}

  <h2>5. 관리자 기능 명세</h2>
  ${p.adminScreens.map(article).join('')}

  <h2>6. 공통 기능</h2>
  <p class="lead">
    화면을 가리지 않고 전 화면에 걸리는 제작 기준입니다. 성능 · 반응형 · 접근성 · 보안 등
    <strong>비기능 요건 전체는 별도 문서 「비기능 명세서」</strong>에 있으며, 여기에는 화면 제작에
    직접 걸리는 것만 옮겨 둡니다.
  </p>
  ${note(p.commonNonFunctional)}

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
  <p class="lead">화면을 가리지 않고 같은 방식으로 처리합니다. 화면마다 되풀이해 적으면 ${p.screens.length}벌이 되고, 한 곳만 고쳐집니다.</p>
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

  <h2>11. Back-End 요구사항 정의</h2>
  <p class="lead">
    <strong>Back-End 는 2단계 수행 범위</strong>이며, 본 장이 그 착수 명세입니다. 후속 수행자가
    화면을 다시 분석하지 않고 서버 개발에 들어갈 수 있도록 요구사항과 인터페이스를 정의합니다.
    엔드포인트는 구현을 강제하는 확정 사양이 아니라 인터페이스 요구사항입니다.
  </p>

  <h3>11.1 도메인 및 관리 대상 정의</h3>
  ${plain(th('관리 대상', 102) + th('데이터의 목적') + th('관련 화면', 146) + th('고객 서비스 노출'), domainRows)}

  <h3>11.2 데이터 요구사항 정의</h3>
  <p class="lead">
    각 관리 대상의 데이터 항목입니다. 항목은 관리자 상세 화면의 입력 항목에서 도출하였습니다 —
    운영자가 관리하는 값이 곧 해당 대상의 속성이기 때문입니다. 실제 테이블 설계, 인덱스 및 ORM
    구현은 포함하지 않습니다.
  </p>
  ${dataBlocks}

  <h3>11.3 데이터 관계 정의</h3>
  <p class="lead">후속 개발자가 데이터 모델을 설계할 수 있는 요구사항 수준으로 정의합니다. 물리 ERD 는 포함하지 않습니다.</p>
  ${plain(th('관계', 164) + th('정의'), p.backend.relations.map(([a, b]) => cells(esc(a), rich(b))).join(''))}

  <h3>11.4 API 요구사항 정의</h3>
  <p class="lead">
    화면에서 필요한 서버 기능입니다. 연산은 화면 주소 규칙에서 도출하였습니다 — 목록 · 단건 ·
    등록 화면의 존재가 곧 필요한 연산을 결정합니다.
  </p>
  ${apiBlocks}

  <h3>11.5 비즈니스 규칙 및 검증 정책</h3>
  <p class="lead">
    <strong>화면 검증과 서버 검증을 구분하여 정의합니다.</strong> 화면에서 막는 것은 사용자를 돕기
    위한 것이고, 서버에서 막는 것은 데이터를 지키기 위한 것입니다. 화면에만 검증을 두면 API 를
    직접 호출하는 요청에는 적용되지 않습니다.
  </p>
  ${plain(th('관리 대상', 102) + th('규칙') + th('적용 위치', 196), grouped(p.backend.rules))}

  <h3>11.6 상태값 및 라이프사이클 정의</h3>
  ${plain(
    th('관리 대상', 90) + th('상태 항목', 80) + th('값', 102) + th('변경 주체', 104) + th('고객 서비스 영향') + th('전이 규칙', 162),
    grouped(lifecycleRows),
  )}

  <h3>11.7 권한 요구사항 정의</h3>
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

  <h3>11.8 예외 및 오류 응답 요구사항</h3>
  ${plain(
    th('상황', 136) + th('발생 조건', 224) + th('시스템 처리 · 화면 표시'),
    p.backend.errors.map(([a, b, c]) => cells(esc(a), rich(b), rich(c))).join(''),
  )}

  `;

  const file = `${p.slug}-기능명세서.html`;
  writeFileSync(file, shell({ title: '기능 명세서', kind: '기능 정의 · 3/4', brand: p.brand, body, extra: EXTRA }), 'utf8');
  return `${file} — 화면 ${p.screens.length} · 검수 항목 ${qaTotal}`;
};

if (process.argv[1]?.endsWith('build-fsd.ts')) {
  for (const project of PROJECTS) console.log(buildFsd(project));
}
