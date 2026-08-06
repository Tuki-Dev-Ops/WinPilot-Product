import type { ReactNode } from 'react';

export type IrTableColumn = { label: string; align?: 'right' | 'center' };

/**
 * 투자자 화면의 표.
 *
 * 어드민의 표와 **다른 조각**인 이유: 여기에는 체크박스도 관리 칸도 없다. 읽는 곳이라
 * 고를 것이 없고, 고르는 칸을 흉내만 내 두면 눌러 본 사람이 무엇이 되는지 찾는다.
 *
 * 좁은 화면에서 가로로 밀리지 않게 **자기 상자 안에서만** 스크롤한다.
 */
export function IrTable({
  columns,
  rows,
  empty,
}: {
  columns: IrTableColumn[];
  /** 줄마다의 칸. `columns` 와 개수·순서가 같아야 한다 */
  rows: ReactNode[][];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="rounded-xl border border-border px-6 py-12 text-center text-sm text-ink-muted">{empty}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-160 border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            {columns.map((column) => (
              <th
                key={column.label}
                className={`whitespace-nowrap px-5 py-3 text-xs font-normal text-ink-faint ${
                  column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, index) => (
            <tr key={index} className="border-b border-border last:border-b-0">
              {cells.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`px-5 py-3 ${
                    columns[cellIndex]?.align === 'right'
                      ? 'text-right tabular-nums'
                      : columns[cellIndex]?.align === 'center'
                        ? 'text-center'
                        : ''
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
