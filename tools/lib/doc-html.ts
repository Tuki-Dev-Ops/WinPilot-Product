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

/** 순번 칸의 머리. 표마다 같은 너비로 서야 여러 표를 나란히 볼 때 눈이 흔들리지 않는다. */
export const NO = th('순번', 46);

/**
 * 표의 줄마다 순번을 앞에 붙인다.
 *
 * ## 왜 줄을 만드는 쪽을 고치지 않나
 * 줄을 만드는 방식이 표마다 다르다 — 어떤 것은 `cells`, 어떤 것은 `grouped`, 어떤 것은 rowspan 을
 * 직접 쓴다. 만드는 쪽을 전부 고치면 같은 수정을 여섯 군데에 하게 되고, **그중 하나를 빠뜨린
 * 표만 번호가 없는** 상태가 만들어진다. 다 만들어진 줄에 칸 하나를 밀어 넣으면 한 곳에서 끝난다.
 *
 * 세는 것은 `<tr` 이라 rowspan 이 섞인 표에서도 줄 수와 번호가 어긋나지 않는다. 다만 칸 안에
 * 표가 다시 들어가는 자리에는 쓰지 않는다 — 안쪽 표의 줄까지 세어 번호가 건너뛴다.
 */
export const numbered = (rows: string): string => {
  let n = 0;
  return rows.replace(/<tr(?:\s[^>]*)?>/g, (tag) => `${tag}<td class="no">${(n += 1)}</td>`);
};

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
