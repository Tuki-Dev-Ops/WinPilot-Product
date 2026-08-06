'use client';

import { Checkbox } from './Checkbox';

/**
 * 표 맨 왼쪽 칸 — **체크박스와 순번**. 두 어드민이 같은 것을 쓴다.
 *
 * 원본은 B2C Admin 의 `/users` 표다. 열 폭(`lg:col-span-1`) · 간격(`gap-3`) · 순번 폭(`w-6`)을
 * 그대로 옮겨 왔다. 표마다 조금씩 다르게 두면 화면을 옮길 때 눈이 자리를 다시 잡는다.
 *
 * ## 순번은 자원 id 가 아니다
 * **지금 목록에서 몇 번째인지**만 말한다(1부터). 조건을 바꾸면 다시 1부터다. 그래서 id 는
 * 여기 넣지 않고 이름 아래 작은 글씨로 따로 둔다 — 둘은 다른 값이라 한 칸에 합치면 어느 쪽이
 * 바뀌는 값인지 알 수 없다. `tabular-nums` 는 자릿수가 흔들리지 않게 하려는 것이다.
 *
 * ## 전체 선택은 보이는 것만 잡는다
 * 지금 걸린 조건 안의 줄만 고른다. 안 보이는 줄까지 잡으면 무엇을 고른 것인지 화면에서
 * 확인할 길이 없고, 그 상태로 일괄 삭제를 누르면 되돌릴 수 없다.
 */
export function SelectAllCell({
  checked,
  indeterminate,
  onChange,
}: {
  /** 보이는 줄을 모두 골랐는가 */
  checked: boolean;
  /** 일부만 골랐는가 — 색만이 아니라 모양으로도 갈린다 */
  indeterminate: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <span className="flex items-center gap-3 lg:col-span-1">
      <Checkbox checked={checked} indeterminate={indeterminate} onChange={onChange} label="전체 선택" />
      <span className="w-6 text-center">순번</span>
    </span>
  );
}

/**
 * 줄마다의 체크박스와 순번.
 *
 * 행 전체가 상세를 여는 표에서는 이 칸의 누름이 행까지 번지면 안 된다 — 고르려다 상세가
 * 열린다. 전파를 여기서 한 번만 끊어 화면마다 되풀이하지 않는다.
 */
export function RowSelectCell({
  checked,
  onChange,
  label,
  index,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** 낭독기가 읽는 말 — `{그 줄 이름} 선택` */
  label: string;
  /** 0부터 받는다. 화면에는 1부터 적는다 */
  index: number;
}) {
  return (
    <div className="flex items-center gap-3 lg:col-span-1" onClick={(event) => event.stopPropagation()}>
      <Checkbox checked={checked} onChange={onChange} label={label} />
      <span className="w-6 text-center font-mono text-sm tabular-nums text-ink-faint">{index + 1}</span>
    </div>
  );
}
