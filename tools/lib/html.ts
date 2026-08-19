import { formal } from './polite';

/**
 * 문서를 만드는 도구가 함께 쓰는 HTML 조각.
 *
 * 업무 범위 정의서와 기능 명세서가 같은 명세를 읽는다. 이스케이프 규칙이 두 벌이면 한쪽만
 * 고쳐지고, 그 차이는 `&` 가 든 문장이 나올 때까지 드러나지 않는다.
 */

export const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 명세가 마크다운으로 적혀 있어 강조 표기를 태그로 바꾼다. */
export const rich = (s: string): string =>
  esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

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
