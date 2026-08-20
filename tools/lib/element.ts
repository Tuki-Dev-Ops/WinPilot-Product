import type { Screen, SpecArea, SpecButton, SpecField } from './screens';
import { condition, kindIn, type ActionKind } from './action-kind';
import { formal } from './polite';

/**
 * 화면 요소 하나를 **기능 단위 명세**로 편다.
 *
 * ## 왜 여덟 줄인가
 * 요소 이름과 한 줄 설명만 적으면 개발과 검수가 각자 다른 것을 상상한다. `조건 지우기` 가
 * 무엇을 지우는지, 지운 뒤 목록이 어떻게 되는지, 지울 것이 없을 때 어떻게 보이는지는
 * 이름에 들어 있지 않다.
 *
 * 그래서 기능마다 **목적 · 사용자 동작 · 화면 동작 · 데이터 처리 · 입력 규칙 · 결과 ·
 * 예외 처리** 를 나눠 적는다. 없는 줄은 세우지 않는다 — 빈 줄을 채우려고 지어내면 그것이
 * 그대로 합의된 값으로 읽힌다.
 *
 * ## 무엇을 어디서 읽는가
 * - **입력 항목**(`fields`) : 타입 · 필수 여부 · 검증 규칙이 명세에 있다.
 * - **단추**(`buttons`) : 눌렀을 때 · 성공 · 실패가 명세에 있다. 있으면 그것이 이긴다.
 * - **기능**(`actions`) : 위 둘에 없는 나머지. 동작 유형에서 표준 서술을 끌어낸다.
 *
 * 끌어낸 것과 명세에 적힌 것을 섞지 않는다. 명세에 없는 자리는 비우거나 `정의 필요` 로 둔다.
 */

export type Line = { label: string; text: string };
export type Element = { name: string; type: string; lines: Line[] };

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

/** 입력 형태마다 사용자가 실제로 하는 동작이 다르다. */
const GESTURE: Record<string, string> = {
  텍스트: '값을 직접 입력한다',
  '여러 줄': '내용을 직접 입력한다',
  숫자: '숫자를 직접 입력한다',
  날짜: '날짜를 선택한다',
  선택: '정의된 항목 중 하나를 선택한다',
  고르개: '정의된 항목 중 해당하는 것을 복수 선택한다',
  체크박스: '동의 여부를 선택한다',
  스위치: '상태를 켜거나 끈다',
  파일: '파일을 선택하여 첨부한다',
  '읽기 전용': '값을 확인한다',
  표시: '값을 확인한다',
};

/** 동작 유형별 표준 서술. 단추 정의가 없는 기능에만 쓴다. */
const KIND: Record<ActionKind, { type: string; goal: string; act: string; screen: string; data: string }> = {
  이동: {
    type: 'LINK',
    goal: '연관 정보를 이어서 확인할 수 있도록 화면 간 이동 경로를 제공한다.',
    act: '목록 또는 카드에서 대상 항목을 선택한다.',
    screen: '선택한 대상의 화면으로 이동한다.',
    data: '이동 대상 화면이 표시할 데이터를 조회한다.',
  },
  검색: {
    type: 'SEARCH',
    goal: '사용자가 찾는 항목에 직접 접근할 수 있도록 한다.',
    act: '검색어를 입력하고 조회를 실행한다.',
    screen: '입력한 검색어를 조회 조건에 반영하여 목록을 다시 조회한다.',
    data: '검색 조건에 해당하는 항목과 총 건수를 표시한다.',
  },
  필터: {
    type: 'FILTER',
    goal: '사용자가 원하는 조건의 정보만 선별하여 조회할 수 있도록 한다.',
    act: '조회 조건을 선택한다.',
    screen: '선택한 조건을 기준으로 목록을 필터링한다.',
    data: '선택된 조건값에 해당하는 항목만 표시한다.',
  },
  등록: {
    type: 'BTN',
    goal: '신규 데이터를 등록할 수 있도록 한다.',
    act: '입력을 마친 뒤 등록을 실행한다.',
    screen: '입력값을 검증한 뒤 신규 항목으로 저장한다.',
    data: '등록된 항목을 목록에 반영한다.',
  },
  수정: {
    type: 'BTN',
    goal: '기존 데이터를 최신 상태로 유지할 수 있도록 한다.',
    act: '값을 변경한 뒤 저장을 실행한다.',
    screen: '입력값을 검증한 뒤 기존 항목을 갱신한다.',
    data: '변경된 값을 해당 항목에 반영한다.',
  },
  삭제: {
    type: 'BTN',
    goal: '더 이상 사용하지 않는 데이터를 제거할 수 있도록 한다.',
    act: '대상을 선택한 뒤 삭제를 실행한다.',
    screen: '삭제 여부를 확인한 뒤 대상을 삭제 처리한다.',
    data: '삭제된 항목을 목록에서 제외한다.',
  },
  '상태 변경': {
    type: 'SWITCH',
    goal: '데이터를 삭제하지 않고 노출 여부만 제어할 수 있도록 한다.',
    act: '상태 스위치를 전환한다.',
    screen: '해당 항목의 상태값만 변경한다.',
    data: '변경된 상태를 목록과 사이트 노출에 반영한다.',
  },
  표시: {
    type: 'TEXT',
    goal: '사용자가 확인해야 하는 정보를 제공한다.',
    act: '화면에 표시된 값을 확인한다.',
    screen: '해당 값을 화면에 표시한다.',
    data: '표시 대상 값을 조회하여 출력한다.',
  },
  미분류: {
    type: 'ELEMENT',
    goal: '정의 필요',
    act: '정의 필요',
    screen: '정의 필요',
    data: '정의 필요',
  },
};

const line = (label: string, text: string | undefined): Line[] =>
  text === undefined || text.trim() === '' ? [] : [{ label, text }];

/**
 * 검증 규칙을 항목에 붙인다.
 *
 * 항목 이름이 문장에 들어 있으면 그 항목의 규칙으로 본다. 짧은 이름(`값` · `표`)이 다른
 * 낱말에 섞여 잘못 걸리는 것을 막으려고 **두 글자 이상**만 짝짓는다.
 */
const guardsFor = (name: string, pool: readonly string[]): string[] =>
  name.length >= 2 ? pool.filter((one) => one.includes(name)) : [];

/**
 * 이 기능이 어디로 가는가.
 *
 * 갈래 도면이 들고 있는 이동선에서 찾는다. 기능 이름에 대상 화면의 이름이 들어 있으면 그것을
 * 쓰고, 나가는 길이 하나뿐이면 그것으로 본다. 둘 이상인데 이름이 안 걸리면 **짐작하지 않고**
 * 정의 필요로 남긴다.
 */
const targetOf = (
  screen: Screen,
  action: string,
  pool: readonly Screen[],
): { name: string; route: string } | undefined => {
  const named = screen.links.find((one) => action.includes(one.name));
  if (named) return named;

  /*
    도면에 이동선이 없어도 기능 이름이 대상 화면의 이름을 그대로 담고 있으면 그것으로 본다 —
    `메뉴판으로 돌아가기` 는 `메뉴판` 화면이다. 이름이 통째로 들어 있을 때만 짝짓는다.
    비슷해 보인다고 이어 붙이면 문서가 없는 이동을 말하게 된다.
  */
  const byName = pool
    .filter((one) => one.app === screen.app && one.featureId !== screen.featureId)
    .filter((one) => action.includes(one.name))
    .sort((a, b) => b.name.length - a.name.length)[0];
  if (byName) return byName;

  return screen.links.length === 1 ? screen.links[0] : undefined;
};

/** 주소의 동적 자리 — `[itemId]` 가 곧 전달해야 하는 식별자다. */
const paramOf = (route: string): string | undefined => /\[(\w+)\]/.exec(route)?.[1];

const fromField = (one: SpecField, screen: Screen, validations: readonly string[], used: Set<string>): Element => {
  const guard = guardsFor(one.name, validations);
  for (const each of guard) used.add(each);
  const readOnly = one.type === '읽기 전용' || one.type === '표시';
  return {
    name: `${one.name}${one.required ? ' (필수)' : ''}`,
    type: TYPE[one.type] ?? one.type,
    lines: [
      ...line('기능 목적', formal(one.desc)),
      ...line('사용자 동작', GESTURE[one.type] ?? '값을 입력한다'),
      ...line(
        '데이터 처리',
        readOnly
          ? '시스템이 관리하는 값을 조회하여 표시하며, 사용자는 수정할 수 없다.'
          : screen.app === 'admin'
            ? '입력값을 해당 항목의 관리 값으로 저장한다.'
            : '입력값을 접수 데이터에 포함하여 전송한다.',
      ),
      ...line('입력 규칙', one.rule ? formal(one.rule) : one.required ? '필수 입력 항목이다.' : undefined),
      ...guard.map((each) => ({ label: '예외 처리', text: formal(each) })),
    ],
  };
};

/**
 * 화면의 표시 영역을 요소로 세운다.
 *
 * 명세의 기능에는 `해를 따라 내려가며 읽기` 처럼 **읽는 행동**이 섞여 있다. 그것은 요소가
 * 아니다 — 누를 것도 고를 것도 없고, 이름으로 가리킬 수 있는 자리도 아니다. 그대로 옮기면
 * `Type : TEXT · 사용자 동작 : 화면에 표시된 값을 확인한다` 가 화면마다 되풀이된다.
 *
 * 읽는 행동을 걷어 내는 대신 **실제로 값이 서는 영역**을 세운다. 영역은 이름이 있고 표시
 * 조건이 있어 가리킬 수 있다. Sub / Flow 가 그 이름을 차례로 보여 주고, 여기서는 각 영역이
 * 무엇을 어떤 조건으로 보이는지를 적는다.
 */
const fromArea = (one: SpecArea): Element => ({
  name: one.area,
  type: 'AREA (표시 영역)',
  lines: [
    ...line('표시 내용', formal(one.purpose)),
    ...line('표시 조건', one.when ? formal(one.when) : '항상 표시한다.'),
  ],
});

const fromButton = (one: SpecButton, screen: Screen): Element => ({
  name: one.label,
  type: 'BTN',
  lines: [
    ...line('사용자 동작', `${one.label} 버튼을 선택한다.`),
    ...line('화면 동작', formal(one.onClick)),
    ...line('결과 처리', one.onSuccess ? formal(one.onSuccess) : undefined),
    ...line('예외 처리', one.onFail ? formal(one.onFail) : undefined),
    ...line(
      '데이터 처리',
      screen.readOnly ? undefined : '저장 대상 값은 관리 데이터에 반영된다.',
    ),
  ],
});

const fromAction = (action: string, screen: Screen, pool: readonly Screen[]): Element => {
  const kind = kindIn(action, screen.route, screen.readOnly);
  const base = KIND[kind];
  const target = kind === '이동' ? targetOf(screen, action, pool) : undefined;
  const param = target ? paramOf(target.route) : undefined;

  return {
    /* 요소 이름은 명세의 말 그대로 둔다 — 이 칸은 문장이 아니라 이름이다. */
    name: action,
    type: base.type,
    lines: [
      ...line('기능 목적', base.goal),
      ...line('사용자 동작', base.act),
      ...(kind === '이동'
        ? [
            ...line('이동 대상', target ? `${target.name} 화면` : '정의 필요 — 화면 도면에 이 이동선이 없다.'),
            ...line('전달 정보', param ? `${param} (대상 식별자)` : target ? '없음' : undefined),
            ...line('URL 처리', target ? target.route : undefined),
            ...line('예외 처리', target && param ? '대상 데이터가 존재하지 않을 경우 404 화면으로 이동한다.' : undefined),
          ]
        : [...line('화면 동작', base.screen), ...line('데이터 처리', base.data)]),
      ...(kind === '필터' ? line('입력 규칙', '기본값은 전체로 설정한다.') : []),
      ...(kind === '검색' ? line('예외 처리', '검색 결과가 없을 경우 조건을 유지한 상태로 빈 상태 문구를 표시한다.') : []),
    ],
  };
};

/**
 * 화면 하나의 요소 전부와, 어느 요소에도 붙지 않은 예외.
 *
 * 이름이 겹치지 않는데 같은 것을 가리키는 기능이 있다 — `네 칸 채우기` 는 위에 이미 선 입력
 * 항목 넷을 통틀어 부르는 말이다. 항목이 있는 화면의 「채우기 · 넣기」 는 그 항목들의 다른
 * 이름으로 본다.
 */
export const elementsOf = (screen: Screen, pool: readonly Screen[]): { list: Element[]; rest: string[] } => {
  const fields = screen.spec.fields ?? [];
  const buttons = screen.spec.buttons ?? [];
  const validations = screen.spec.validations ?? [];
  const used = new Set<string>();

  const wholeForm = /칸 채우|항목 넣|값 넣|정보 넣|채우기$/;
  const covered = (action: string): boolean =>
    buttons.some((one) => action.includes(one.label)) ||
    fields.some((one) => one.name.length >= 2 && action.includes(one.name)) ||
    (fields.length > 0 && wholeForm.test(action));

  /*
    읽는 행동은 요소가 아니다. 표시 갈래로 잡힌 기능은 세우지 않고, 그 값이 서는 영역이
    대신한다 — 그러지 않으면 `값을 확인한다` 만 적힌 칸이 화면마다 늘어선다.
  */
  const list = [
    ...(screen.spec.areas ?? []).map(fromArea),
    ...fields.map((one) => fromField(one, screen, validations, used)),
    ...buttons.map((one) => fromButton(one, screen)),
    ...screen.spec.actions
      .filter((one) => !covered(one) && kindIn(one, screen.route, screen.readOnly) !== '표시')
      .map((one) => fromAction(one, screen, pool)),
  ];

  const rest = [
    ...validations.filter((one) => !used.has(one)),
    ...screen.spec.guards.filter((one) => condition(one).when !== null),
  ].map(formal);

  return { list, rest };
};
