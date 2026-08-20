import { formal } from './polite';

/**
 * 문서를 만드는 도구가 함께 쓰는 HTML 조각.
 *
 * 업무 범위 정의서와 기능 명세서가 같은 명세를 읽는다. 이스케이프 규칙이 두 벌이면 한쪽만
 * 고쳐지고, 그 차이는 `&` 가 든 문장이 나올 때까지 드러나지 않는다.
 */

export const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * 명세가 마크다운으로 적혀 있어 강조 표기를 태그로 바꾼다.
 *
 * ## 줄표 뒤는 줄을 바꾼다
 * 이 저장소의 글은 `…표시한다 — 연결되지 않는 번호를 노출하지 않기 위한 것이다` 처럼
 * 줄표 뒤에 **까닭**을 붙이는 꼴을 자주 쓴다. 한 줄로 이어 두면 규칙과 까닭이 같은 무게로
 * 읽혀, 표에서 어디까지가 지켜야 할 것인지 눈으로 갈라야 한다.
 *
 * 줄을 바꾸고 `-` 를 앞에 세운다. 규칙이 먼저 읽히고 까닭이 그 아래 붙는다.
 */
export const rich = (s: string): string =>
  esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/ — /g, '<br>- ');

/**
 * 설명 칸 — 한 줄이면 문단, 여럿이면 목록. 여럿을 한 문장으로 이으면 어디서 끊기는지
 * 보이지 않는다.
 *
 * 명세는 만드는 사람끼리 읽는 해라체로 적혀 있다. 밖으로 내보내는 문서이므로 여기서
 * 합쇼체로 올린다 — 원본을 고치지 않는 까닭은 `polite.ts` 에 적었다.
 */
export const note = (
  value: string | readonly string[],
  voice: (text: string) => string = formal,
): string => {
  const line = (text: string): string => rich(voice(text));
  const list = typeof value === 'string' ? [value] : value;
  const [only] = list;
  if (only !== undefined && list.length === 1) return line(only);
  return `<ul>${list.map((text) => `<li>${line(text)}</li>`).join('')}</ul>`;
};

/** 값이 없는 칸. 빈칸으로 두면 적기를 잊은 것인지 없는 것인지 구분되지 않는다. */
export const NONE = '<span class="none">해당 없음</span>';
export const TBD = '<span class="tbd">정의 필요</span>';

/**
 * 세부 기능 명칭을 번호와 함께 편다.
 *
 * 화면 목록에 기능 **수**만 적으면 `4` 가 무엇인지 알 수 없어, 확인하려면 매번 화면을 열어야
 * 한다. 범위를 정하는 자리에서 그 넷이 무엇인지가 곧 범위다.
 *
 * 번호는 기능 명세서 3절의 `기능 01 · 02` 와 같게 매긴다. 두 문서를 나란히 놓고
 * `MENU-002 의 기능 03` 으로 짚을 수 있어야 한다.
 *
 * 말투는 원문 그대로 둔다. 이 칸은 문장이 아니라 **이름**이라, `묶음 고르기` 를
 * `묶음 고릅니다` 로 바꾸면 목록이 아니라 설명이 된다.
 */
export const namedList = (items: readonly string[]): string =>
  items.length === 0
    ? NONE
    : `<ol class="fn">${items.map((one) => `<li>${rich(one)}</li>`).join('')}</ol>`;
