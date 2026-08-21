import type { Screen } from './screens';
import { handlingOf, kindIn } from './action-kind';
import { featureName } from './feature-name';
import { esc } from './html';
import { formal, formalAction } from './polite';

/**
 * 기능 명세를 **엑셀 한 장**으로 편다 — 한 줄이 화면 하나, 「세부 사항」 한 칸이 그 화면의 전부.
 *
 * ## 왜 화면마다 절을 세우지 않나
 * 앞선 판은 화면 하나에 열두 절을 세웠다. 읽기는 편했지만 **화면 47개면 절이 564개**가 되어,
 * 두 화면을 견주려면 문서를 앞뒤로 넘겨야 했다. 검토하는 사람이 실제로 하는 일은 줄을 세로로
 * 훑으며 빠진 칸을 찾는 것이고, 그 일에는 표 한 장이 맞다.
 *
 * ## 세부 사항의 여섯 갈래
 * 갈래를 고정한다 — 화면마다 다른 차례로 적히면 세로로 훑을 수 없다. 없는 갈래도 자리를
 * 비우지 않고 `해당 없음` 을 적는다. **빈 칸은 없다는 뜻인지 안 적은 것인지 갈리지 않는다.**
 */

/** 세부 사항의 여섯 갈래. 차례가 곧 읽는 순서다 — 무엇을 보여 주고, 무엇이 없을 때 어찌하고, 무엇을 하는가. */
const PARTS = [
  '입력 / 표시 데이터',
  '이미지 처리',
  '빈 값 / 미입력 예외처리',
  '주요 기능 및 플로우',
  '유효성 · 에러 메시지',
  '이동 / 결과',
] as const;

const NONE = '해당 없음.';

/**
 * 문장 끝을 고른다.
 *
 * 두 가지를 한다 — 문체를 합쇼체로 맞추고, 마침표를 세운다. 원문은 만드는 사람끼리 읽는 글이라
 * 해라체이고 마침표가 있기도 없기도 하다. 그대로 이으면 **한 칸 안에서 `않는다` 와 `않습니다` 가
 * 나란히 선다.**
 */
const dot = (text: string): string => {
  const said = formal(text.trim());
  return /[.!?]$/.test(said) ? said : `${said}.`;
};

const join = (items: readonly string[]): string => (items.length === 0 ? NONE : items.map(dot).join(' '));

/** 사진 · 이미지를 다루는 칸. 이름과 설명 어느 쪽에 적혀 있어도 걸리게 둔다. */
const IMAGE = /사진|이미지|썸네일|배너|갤러리|모자이크|로고/;

/** 값이 없을 때를 말하는 제약. `0건` 처럼 숫자로 적힌 것도 같은 이야기다. */
const EMPTY = /비어|빈 |빈$|없으면|없을 때|0건|미등록|하나도/;

const inputs = (screen: Screen): string => {
  const fields = (screen.spec.fields ?? []).filter((one) => one.type !== '표시');
  const areas = screen.spec.areas ?? [];
  const admin = screen.spec.admin.filter((one) => !one.startsWith('없음'));

  return join([
    ...(fields.length > 0 ? [`입력 ${fields.length}항목 — ${fields.map((one) => one.name).join(' · ')}`] : []),
    ...(areas.length > 0 ? [`표시 ${areas.length}영역 — ${areas.map((one) => one.area).join(' · ')}`] : []),
    ...(admin.length > 0 ? [`어드민 ${admin.join(' · ')} 등록 데이터 연동`] : ['어드민 연동 없음']),
  ]);
};

const images = (screen: Screen): string => {
  const areas = (screen.spec.areas ?? []).filter((one) => IMAGE.test(one.area) || IMAGE.test(one.purpose));
  const fields = (screen.spec.fields ?? []).filter((one) => IMAGE.test(one.name) || IMAGE.test(one.desc));
  return join([
    ...areas.map((one) => `${one.area} — ${one.purpose}`),
    ...fields.map((one) => `${one.name} — ${one.desc}`),
  ]);
};

const empties = (screen: Screen): string =>
  join(screen.spec.guards.filter((one) => EMPTY.test(one)));

/**
 * 기능 하나를 **사용자 동작 → 시스템 처리 → 결과** 세 마디로 편다.
 *
 * ## 왜 이름만으로는 모자란가
 * 앞선 판은 기능 명칭만 실었다. `브랜드 운영 원칙 조회 기능 제공` 은 무엇을 만들지는 알려
 * 주지만 **누르면 무엇이 일어나는지**를 말하지 않아, 구현하는 사람과 검수하는 사람이 각자
 * 다르게 채운다. 화면마다 절을 세우던 앞선 판에는 이 세 마디가 표로 있었는데, 한 줄로 접으면서
 * 함께 사라졌다.
 *
 * 단추가 명세에 적혀 있으면 그것이 이긴다 — 눌렀을 때와 성공했을 때가 이미 정해진 값이다.
 */
const step = (screen: Screen, action: string): string => {
  const kind = kindIn(action, screen.route, screen.readOnly);
  /*
    단추 이름이 기능 이름 **끝에** 있을 때만 짝으로 본다. 앞선 판은 `포함` 으로 찾아,
    `문의 접수 정보 및 운영 시간 조회` 가 `문의 접수` 단추와 짝지어져 조회 기능에 접수 단추의
    처리와 결과가 붙었다.
  */
  const buttons = screen.spec.buttons ?? [];
  const button = buttons.find((one) => action === one.label) ?? buttons.find((one) => action.endsWith(one.label));
  const fallback = handlingOf(kind);

  const handle = button?.onClick ?? fallback.handle;
  const result =
    [button?.onSuccess, button?.onFail].filter((one) => one !== undefined).map(dot).join(' ') ||
    dot(fallback.result);

  return `<div class="fn"><b>${esc(featureName(action, kind))}</b><span>${esc(
    `${dot(formalAction(action))} ${dot(handle)} ${result}`,
  )}</span></div>`;
};

const flow = (screen: Screen): string =>
  screen.spec.actions.length === 0 ? NONE : screen.spec.actions.map((one) => step(screen, one)).join('');

const checks = (screen: Screen): string => join(screen.spec.validations ?? []);

const moves = (screen: Screen): string =>
  join(
    screen.links.length > 0
      ? screen.links.map((one) => `${one.name} (${one.route})`)
      : screen.spec.actions.filter((one) => kindIn(one, screen.route, screen.readOnly) === '이동'),
  );

/**
 * 「세부 사항」 한 칸. 갈래마다 번호를 세우고 그 아래에 내용을 적는다.
 *
 * 「주요 기능 및 플로우」만 이미 짜인 조각을 넘긴다 — 기능마다 세 마디가 서야 해서 한 줄로는
 * 담기지 않는다. 나머지 다섯은 글자이므로 그대로 막는다.
 */
export const detailCell = (screen: Screen): string => {
  const bodies: [string, boolean][] = [
    [inputs(screen), false],
    [images(screen), false],
    [empties(screen), false],
    [flow(screen), true],
    [checks(screen), false],
    [moves(screen), false],
  ];
  return PARTS.map((title, index) => {
    const [body, raw] = bodies[index] ?? [NONE, false];
    const shown = raw && body !== NONE ? body : `- ${esc(body)}`;
    return `<div class="pt"><b>${index + 1}. ${esc(title)}</b><span>${shown}</span></div>`;
  }).join('');
};

/**
 * 화면 코드 — `US-01-02` 꼴.
 *
 * 기능 ID 와 따로 두는 것은 **세는 자리가 다르기** 때문이다. 기능 ID 는 주제로 묶여 있어 화면이
 * 문서 어디쯤 있는지를 말해 주지 않는다. 이 코드는 서비스 · 갈래 · 갈래 안 차례를 그대로 담아,
 * 표를 보며 「US-01 무리 셋째」처럼 부를 수 있다.
 */
export const pageCodes = (screens: readonly Screen[]): Map<string, string> => {
  const code = new Map<string, string>();
  const groups = new Map<string, string[]>();
  for (const one of screens) {
    const key = `${one.app}/${one.group}`;
    groups.set(key, [...(groups.get(key) ?? []), one.featureId]);
  }
  const seen = new Map<string, number>();
  const pad = (value: number): string => String(value).padStart(2, '0');
  for (const [key, ids] of groups) {
    const app = key.startsWith('client') ? 'US' : 'AD';
    const order = (seen.get(app) ?? 0) + 1;
    seen.set(app, order);
    ids.forEach((id, index) => code.set(id, `${app}-${pad(order)}-${pad(index + 1)}`));
  }
  return code;
};
