'use client';

import { useState, type ReactNode } from 'react';
import { RowActions, RowSelectCell, RowTextButton, SelectAllCell } from '@winpilot/ui';
import { IrEmpty, IrPanel, IrTableFoot, IrTableHead } from './IrPanel';

export type IrColumn = { label: string; span: string };

/**
 * 이 콘솔의 **목록 표** 한 벌.
 *
 * ## 왜 조각으로 뽑았나
 * IR 어드민의 화면 열둘 중 아홉이 같은 모양이다 — 줄이 자원 하나, 맨 왼쪽에 체크박스와 순번,
 * 오른쪽 끝에 관리, 아래에 총 건수. 화면마다 그리면 열두 벌이 되고, **열두 벌인 동안 조용히
 * 갈라진다**(다른 두 콘솔에서 이미 겪은 일이라 처음부터 한 벌로 둔다).
 *
 * 여기 남는 것은 모양이고, 무엇을 그릴지는 부르는 쪽이 `columns` 와 `render` 로 넘긴다 —
 * 이 파일이 자원을 알면 아홉 화면의 값이 여기로 몰려 들어온다.
 *
 * ## 체크박스가 늘 있다
 * 일괄로 할 일이 아직 없는 화면에서도 칸은 둔다. 표마다 맨 왼쪽이 같은 자리여야 눈이 헤매지
 * 않고, 할 일이 정해지면 그때 막대만 잇는다.
 */
export function IrRecordTable<T extends { id: string }>({
  title,
  description,
  aside,
  columns,
  rows,
  render,
  labelOf,
  onOpen,
  openLabel = '조회',
  empty,
  foot,
}: {
  title: string;
  description?: string;
  aside?: ReactNode;
  columns: IrColumn[];
  rows: T[];
  /** 그 줄의 칸들. `columns` 와 개수·순서가 같아야 한다 */
  render: (row: T) => ReactNode[];
  /** 낭독기가 읽는 이름 — `{그 줄 이름} 선택` 으로 쓴다 */
  labelOf: (row: T) => string;
  /** 줄을 눌렀을 때. 없으면 줄이 눌리지 않는다 */
  onOpen?: (row: T) => void;
  openLabel?: string;
  empty: string;
  foot?: ReactNode;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const ids = rows.map((row) => row.id);
  const pickedHere = picked.filter((id) => ids.includes(id));
  const allChecked = ids.length > 0 && pickedHere.length === ids.length;

  return (
    <IrPanel title={title} {...(description ? { description } : {})} {...(aside ? { aside } : {})}>
      <IrTableHead
        columns={onOpen ? [...columns, { label: '관리', span: 'lg:col-span-1 lg:text-center' }] : columns}
        lead={
          <SelectAllCell
            checked={allChecked}
            indeterminate={pickedHere.length > 0}
            onChange={(checked) => setPicked(checked ? ids : [])}
          />
        }
      />

      {rows.length === 0 ? (
        <IrEmpty>{empty}</IrEmpty>
      ) : (
        <div className="flex flex-col">
          {rows.map((row, index) => {
            const cells = render(row);

            return (
              <div
                key={row.id}
                {...(onOpen
                  ? {
                      role: 'button',
                      tabIndex: 0,
                      onClick: () => onOpen(row),
                      onKeyDown: (event: React.KeyboardEvent) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onOpen(row);
                        }
                      },
                    }
                  : {})}
                className={`grid grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 text-left transition-colors duration-150 last:border-b-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 lg:grid-cols-12 lg:items-center lg:gap-y-0 ${
                  onOpen ? 'cursor-pointer hover:bg-surface' : ''
                }`}
              >
                <RowSelectCell
                  checked={picked.includes(row.id)}
                  onChange={(checked) =>
                    setPicked((previous) =>
                      checked ? [...previous, row.id] : previous.filter((one) => one !== row.id),
                    )
                  }
                  label={`${labelOf(row)} 선택`}
                  index={index}
                />

                {cells.map((cell, cellIndex) => (
                  <div
                    key={columns[cellIndex]?.label ?? cellIndex}
                    className={`flex min-w-0 items-center gap-2 ${columns[cellIndex]?.span ?? ''}`}
                  >
                    {/* 좁은 화면에는 열 머리가 없으므로 이름을 함께 적는다. */}
                    <span className="w-20 shrink-0 text-xs text-ink-faint lg:hidden">
                      {columns[cellIndex]?.label}
                    </span>
                    {cell}
                  </div>
                ))}

                {onOpen && (
                  <div className="lg:col-span-1">
                    <RowActions>
                      <RowTextButton onClick={() => onOpen(row)}>{openLabel}</RowTextButton>
                    </RowActions>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <IrTableFoot>
        <p>
          총 <span className="font-medium tabular-nums text-ink">{rows.length}</span>건
        </p>
        {foot}
      </IrTableFoot>
    </IrPanel>
  );
}
