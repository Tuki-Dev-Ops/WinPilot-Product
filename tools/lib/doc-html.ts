import { esc, rich } from './html';

/**
 * 생성기 넷이 함께 쓰는 표 조각.
 *
 * 넷 다 같은 `cells` · `table` · `th` · `grouped` 를 각자 갖고 있었다. 문서를 넷으로 가르면서
 * 복사했기 때문인데, 그러다 `grouped` 의 rowspan 셈법을 한 곳에서만 고친 적이 있다. 같은
 * 이름이 같은 일을 하면 한 곳에 둔다.
 */

export const cells = (...values: string[]): string =>
  `<tr>${values.map((one) => `<td>${one}</td>`).join('')}</tr>`;

export const table = (head: string, rows: string, klass = ''): string => `<table class="${klass}">
  <thead><tr>${head}</tr></thead>
  <tbody>${rows}</tbody>
</table>`;

export const th = (label: string, width?: number): string =>
  `<th${width ? ` style="width:${width}px"` : ''}>${esc(label)}</th>`;

export const bullets = (items: readonly string[]): string =>
  `<ul>${items.map((one) => `<li>${rich(one)}</li>`).join('')}</ul>`;

/**
 * 첫 칸이 이어지면 묶는다.
 *
 * 「구분」이 줄마다 되풀이되면 어디서 갈래가 바뀌는지 눈으로 셈해야 한다. 같은 이름이 떨어져서
 * 두 번 나올 때를 대비해 **이어지는 만큼만** 센다 — 전체 개수를 세면 두 번째 묶음이 첫 번째
 * 칸에 흡수된다.
 */
export const grouped = (list: readonly (readonly string[])[]): string =>
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
