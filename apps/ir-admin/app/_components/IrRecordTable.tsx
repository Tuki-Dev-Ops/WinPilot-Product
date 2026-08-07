'use client';

import { useState, type ReactNode } from 'react';
import { RowActions, RowIconButton, RowSelectCell, SelectAllCell, useToast } from '@winpilot/ui';
import { IrConfirmModal } from './IrConfirmModal';
import { IrEmpty, IrPanel, IrTableFoot, IrTableHead } from './IrPanel';

export type IrColumn = { label: string; span: string };

/**
 * 이 콘솔의 **목록 표** 한 벌.
 *
 * ## 왜 조각으로 뽑았나
 * IR 어드민의 목록 화면 열 곳이 같은 모양이다 — 줄이 자원 하나, 맨 왼쪽에 체크박스와 순번,
 * 오른쪽 끝에 관리, 아래에 총 건수. 화면마다 그리면 열 벌이 되고, **열 벌인 동안 조용히
 * 갈라진다**(다른 두 콘솔에서 이미 겪은 일이라 처음부터 한 벌로 둔다).
 *
 * ## 열두 칸을 어떻게 나누나 — **부르는 쪽은 아홉만 쓴다**
 * 표는 `lg:grid-cols-12` 다. 그중 **맨 왼쪽 한 칸(체크박스 · 순번)과 맨 오른쪽 두 칸(관리)은
 * 이 파일이 가져간다.** 그래서 `columns` 로 넘기는 것들의 `col-span` 합은 **아홉**이어야 한다.
 *
 * 전에는 이 규칙이 적혀 있지 않아 화면마다 열둘을 꽉 채워 넘겼고, 그러면 실제로는 열넷이
 * 되어 **머리글과 줄이 서로 다른 자리에서 접혔다** — 표는 그려지는데 열이 안 맞는, 눈으로는
 * 원인이 안 잡히는 어긋남이다.
 *
 * 관리를 두 칸으로 두는 것도 그래서다. 한 칸이면 아이콘 둘이 들어가지 않아 눌러야 할 것이
 * 서로 붙는다. B2C 어드민도 같은 나눔을 쓴다 — 콘솔을 오가는 사람이 같은 자리에서 같은
 * 단추를 찾는다.
 *
 * ## 관리는 아이콘 셋이다 — 조회 · 수정 · 삭제
 * 셋 다 **그림 하나로 뜻이 읽히는 동작**이라 아이콘으로 둔다(`RowIconButton` 머리말의 기준).
 * 글자로 두면 줄마다 `수정` 두 자가 서서, 정작 그 옆의 상태 배지보다 눈에 먼저 든다.
 *
 * **조회와 수정이 같은 화면으로 간다.** 이 콘솔의 상세 화면이 곧 고치는 양식이기 때문이다.
 * 그래도 둘을 남기는 이유: 목록에서 손이 가는 이유가 둘로 갈린다 — 값을 확인하러 오는 것과
 * 고치러 오는 것. 눌러 보고 나서 "여기서 고칠 수 있구나" 를 알게 되는 것보다, **고칠 수 있다는
 * 사실이 목록에서 보이는** 편이 낫다. 화면이 읽기 전용으로 갈리는 날 조회만 그쪽을 가리킨다.
 *
 * 셋은 관리 칸 **가운데**에 선다. 오른쪽 끝에 붙이면 표 너비가 바뀔 때마다 단추 자리가 따라
 * 움직여, 같은 자리를 두 번 누르려던 손이 빗나간다.
 *
 * ## 체크박스가 늘 있다
 * 일괄로 할 일이 아직 없는 화면에서도 칸은 둔다. 표마다 맨 왼쪽이 같은 자리여야 눈이 헤매지
 * 않는다.
 *
 * 하나라도 고르면 **머리글 위에 줄이 하나 열린다** — 왼쪽에 고른 건수, 오른쪽에 `선택 해제` 와
 * `선택 삭제`. 그 줄을 늘 세워 두지 않는 이유: 고른 것이 없을 때 `선택 삭제` 가 회색으로
 * 앉아 있으면, 누를 수 없다는 것을 **눌러 봐야** 안다. 없다가 생기면 무엇이 켜졌는지가
 * 나타남으로 드러난다.
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
  onDelete,
  deleteNote,
  empty,
  foot,
}: {
  title: string;
  description?: string;
  aside?: ReactNode;
  /** `col-span` 합이 **아홉**이어야 한다 — 나머지 셋은 순번 칸과 관리 칸이 가져간다 */
  columns: IrColumn[];
  rows: T[];
  /** 그 줄의 칸들. `columns` 와 개수·순서가 같아야 한다 */
  render: (row: T) => ReactNode[];
  /** 낭독기가 읽는 이름 — `{그 줄 이름} 선택` 으로 쓴다 */
  labelOf: (row: T) => string;
  /** 줄을 눌렀을 때. 없으면 줄이 눌리지 않고 관리 칸도 서지 않는다 */
  onOpen?: (row: T) => void;
  /**
   * 지울 수 있는 자원에만 준다. 문의처럼 **밖에서 들어온 기록**에는 두지 않는다.
   *
   * 확인 창은 이 표가 세운다. 화면마다 세우게 두면 열 벌이 되고, 그러다 한 화면에서 빠진다 —
   * 빠진 것을 알아차리는 때는 **이미 지워진 뒤**다.
   */
  onDelete?: (row: T) => void;
  /** 지우면 무슨 일이 생기는지 한 줄. `사이트에서 사라집니다` 처럼 밖에 미치는 결과를 적는다 */
  deleteNote?: string;
  empty: string;
  foot?: ReactNode;
}) {
  const toast = useToast();
  /* 지울 줄들. 하나를 지우든 골라 지우든 같은 확인 창을 지나게 한다. */
  const [asking, setAsking] = useState<T[] | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const ids = rows.map((row) => row.id);
  const pickedHere = picked.filter((id) => ids.includes(id));
  const allChecked = ids.length > 0 && pickedHere.length === ids.length;

  return (
    <IrPanel title={title} {...(description ? { description } : {})} {...(aside ? { aside } : {})}>
      <IrTableHead
        columns={
          onOpen ? [...columns, { label: '관리', span: 'lg:col-span-2 lg:text-center' }] : columns
        }
        lead={
          <SelectAllCell
            checked={allChecked}
            indeterminate={pickedHere.length > 0}
            onChange={(checked) => setPicked(checked ? ids : [])}
          />
        }
      />

      {pickedHere.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-5 py-3">
          <p className="text-sm text-ink-muted">
            선택 <span className="font-semibold tabular-nums text-ink">{pickedHere.length}</span>건
          </p>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setPicked([])}
              className="h-8 shrink-0 rounded-lg border border-border-strong px-3 text-xs text-ink-muted transition-colors duration-150 hover:border-ink-faint hover:text-ink"
            >
              선택 해제
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={() => setAsking(rows.filter((one) => pickedHere.includes(one.id)))}
                className="h-8 shrink-0 rounded-lg border border-signal-danger/50 px-3 text-xs font-medium text-signal-danger transition-colors duration-150 hover:border-signal-danger"
              >
                선택 삭제
              </button>
            )}
          </div>
        </div>
      )}

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
                /*
                  `group` 이 있어야 관리 아이콘의 테두리가 **이 줄에 마우스가 닿을 때만** 나타난다.
                  없으면 테두리가 늘 투명해, 누를 수 있는 것이 있다는 사실이 드러나지 않는다.
                */
                className={`group grid grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 text-left transition-colors duration-100 last:border-b-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 lg:grid-cols-12 lg:items-center lg:gap-y-0 ${
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
                    <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">
                      {columns[cellIndex]?.label}
                    </span>
                    {cell}
                  </div>
                ))}

                {onOpen && (
                  <div className="lg:col-span-2">
                    {/*
                      단추를 누른 것이 줄을 누른 것으로도 세어지지 않게 막는다. 조회는 결과가
                      같아 티가 안 나지만, 삭제는 **확인 창이 뜨는 동시에 상세로 넘어간다.**
                    */}
                    <div
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                      role="presentation"
                      className="flex justify-center"
                    >
                      <RowActions>
                        <RowIconButton
                          icon="view"
                          label={`${labelOf(row)} 조회`}
                          onClick={() => onOpen(row)}
                        />
                        <RowIconButton
                          icon="edit"
                          label={`${labelOf(row)} 수정`}
                          onClick={() => onOpen(row)}
                        />
                        {onDelete && (
                          <RowIconButton
                            icon="delete"
                            label={`${labelOf(row)} 삭제`}
                            tone="danger"
                            onClick={() => setAsking([row])}
                          />
                        )}
                      </RowActions>
                    </div>
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

      <IrConfirmModal
        open={asking !== null}
        title={asking && asking.length > 1 ? `${asking.length}건을 지울까요` : '이 줄을 지울까요'}
        message={deleteNote ?? '되돌릴 수 없습니다.'}
        /* 여럿이면 이름을 다 적지 않고 셋까지만 — 스무 줄짜리 문장은 아무도 읽지 않는다. */
        detail={
          asking
            ? asking
                .slice(0, 3)
                .map((one) => labelOf(one))
                .join(' · ') + (asking.length > 3 ? ` 외 ${asking.length - 3}건` : '')
            : ''
        }
        confirmLabel="삭제"
        tone="danger"
        onConfirm={() => {
          const targets = asking;
          setAsking(null);
          if (!targets || targets.length === 0) return;
          for (const one of targets) onDelete?.(one);
          setPicked((was) => was.filter((id) => !targets.some((one) => one.id === id)));
          toast.success({
            message: `${targets.length}건을 삭제했습니다.`,
            detail: targets.map((one) => labelOf(one)).slice(0, 3).join(' · '),
          });
        }}
        onCancel={() => setAsking(null)}
      />
    </IrPanel>
  );
}
