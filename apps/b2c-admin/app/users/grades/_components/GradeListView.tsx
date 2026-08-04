'use client';

import { useMemo, useState, type MouseEvent } from 'react';
import { AdminBulkBar } from '@/app/_components/AdminBulkBar';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import { AdminListPager } from '@/app/_components/AdminListPager';
import { Checkbox, useToast } from '@winpilot/ui';
import { formatAmount, parseAmount, type GradeFormInput, type GradeFormMode } from '@/lib/validation/grade-record';
import { GradeFormModal, type GradeRecord } from './GradeFormModal';

/** 프론트엔드 전용 — 서버 없이 이 배열이 목록의 원본이다. */
const INITIAL_GRADES: GradeRecord[] = [
  { id: 'G-01', name: '신규', threshold: 0, discountRate: 0, memberCount: 214 },
  { id: 'G-02', name: '일반', threshold: 100000, discountRate: 3, memberCount: 712 },
  { id: 'G-03', name: 'VIP', threshold: 1000000, discountRate: 7, memberCount: 318 },
  { id: 'G-04', name: 'VVIP', threshold: 5000000, discountRate: 12, memberCount: 40 },
];

/** 행 클릭으로 상세가 열리므로, 행 안의 컨트롤은 자기 동작만 하도록 전파를 끊는다. */
const stopRowClick = (event: MouseEvent) => event.stopPropagation();

function nextGradeId(grades: GradeRecord[]): string {
  const max = grades.reduce((biggest, grade) => Math.max(biggest, Number(grade.id.replace('G-', ''))), 0);
  return `G-${`${max + 1}`.padStart(2, '0')}`;
}

export function GradeListView() {
  const toast = useToast();
  const [grades, setGrades] = useState<GradeRecord[]>(INITIAL_GRADES);
  const [selected, setSelected] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [mode, setMode] = useState<GradeFormMode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);
  const [pendingSave, setPendingSave] = useState<{ name: string; threshold: number; discountRate: number } | null>(
    null,
  );

  // 기준 금액이 낮은 순으로 보여야 등급 사다리가 읽힌다.
  const ordered = useMemo(() => [...grades].sort((a, b) => a.threshold - b.threshold), [grades]);
  const editing = useMemo(() => grades.find((grade) => grade.id === editingId) ?? null, [grades, editingId]);

  const allChecked = ordered.length > 0 && selected.length === ordered.length;

  const toggleAll = (checked: boolean) => setSelected(checked ? ordered.map((grade) => grade.id) : []);
  const toggleOne = (id: string, checked: boolean) =>
    setSelected((previous) => (checked ? [...previous, id] : previous.filter((item) => item !== id)));

  const submit = (input: GradeFormInput) => {
    const next = {
      name: input.name.trim(),
      threshold: parseAmount(input.threshold),
      discountRate: Number(input.discountRate.replace(/[\s,]/g, '')),
    };

    // 기준 금액이 겹치면 어느 등급이 적용되는지 정해지지 않는다.
    const clash = grades.find((grade) => grade.threshold === next.threshold && grade.id !== editingId);
    if (clash) {
      toast.error({
        message: '같은 기준 금액의 등급이 이미 있습니다.',
        detail: `${formatAmount(next.threshold)}원 — ${clash.name}`,
      });
      return;
    }

    // 등급은 할인율을 바꾸는 일이라 조용히 반영하면 안 된다.
    setPendingSave(next);
  };

  const applySave = () => {
    const next = pendingSave;
    if (!next) return;
    setPendingSave(null);

    if (mode === 'create') {
      setGrades((previous) => [...previous, { id: nextGradeId(previous), memberCount: 0, ...next }]);
      toast.success({
        message: '등급을 추가했습니다.',
        detail: `${next.name} · ${formatAmount(next.threshold)}원 이상 ${next.discountRate}% 할인`,
      });
    } else if (editingId) {
      setGrades((previous) => previous.map((grade) => (grade.id === editingId ? { ...grade, ...next } : grade)));
      toast.success({
        message: '등급을 저장했습니다.',
        detail: `${next.name} · ${formatAmount(next.threshold)}원 이상 ${next.discountRate}% 할인`,
      });
    }
    setFormOpen(false);
  };

  const openDetail = (id: string) => {
    setEditingId(id);
    setMode('edit');
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const targets = new Set(pendingDelete);
    const removed = grades.filter((grade) => targets.has(grade.id));
    const movedMembers = removed.reduce((sum, grade) => sum + grade.memberCount, 0);
    setGrades((previous) => previous.filter((grade) => !targets.has(grade.id)));
    setSelected((previous) => previous.filter((id) => !targets.has(id)));
    setPendingDelete(null);
    toast.success({
      message: `등급 ${targets.size}건을 삭제했습니다.`,
      detail: movedMembers > 0
        ? `${removed.map((grade) => grade.name).join(', ')} · 사용자 ${formatAmount(movedMembers)}명이 아래 등급으로 내려갔습니다.`
        : removed.map((grade) => grade.name).join(', '),
    });
  };

  const deleteLabel =
    pendingDelete && pendingDelete.length > 1
      ? `선택한 등급 ${pendingDelete.length}건을 삭제합니다. 이 등급에 속한 사용자는 바로 아래 등급으로 내려갑니다.`
      : '이 등급을 삭제합니다. 등급에 속한 사용자는 바로 아래 등급으로 내려갑니다.';

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm leading-relaxed text-ink-muted">
          누적 결제금액이 기준을 넘으면 해당 등급의 할인율이 적용됩니다.
        </p>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setMode('create');
            setFormOpen(true);
          }}
          className="h-9 shrink-0 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600"
        >
          등급 추가
        </button>
      </div>

      <AdminBulkBar
        count={selected.length}
        onClear={() => setSelected([])}
        onDelete={() => setPendingDelete(selected)}
      />

      <section
        data-ssot-cid="b2c-admin/grade.list#AdminGradeListTable"
        className="overflow-hidden rounded-xl border border-border bg-canvas"
      >
        <div className="hidden items-center gap-4 border-b border-border px-5 py-3 text-xs text-ink-faint lg:grid lg:grid-cols-12">
          <span className="flex items-center gap-3 lg:col-span-1">
            <Checkbox checked={allChecked} indeterminate={selected.length > 0} onChange={toggleAll} label="전체 선택" />
            <span className="w-6 text-center">순번</span>
          </span>
          <span className="lg:col-span-3">등급명</span>
          <span className="lg:col-span-3">누적금액 기준</span>
          <span className="lg:col-span-2">할인율</span>
          <span className="lg:col-span-1">사용자</span>
          <span className="lg:col-span-2 lg:text-right">관리</span>
        </div>

        {ordered.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-ink-muted">등록된 등급이 없습니다.</p>
        ) : (
          <div className="flex flex-col">
            {ordered.map((grade, index) => (
              <div
                key={grade.id}
                onClick={() => openDetail(grade.id)}
                className="grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 transition-colors duration-100 last:border-b-0 hover:bg-surface lg:grid-cols-12 lg:items-center lg:gap-y-0"
              >
                {/* 행 전체가 상세를 연다. 안쪽 컨트롤은 전파를 끊어 자기 동작만 한다. */}
                <div className="flex items-center gap-3 lg:col-span-1" onClick={stopRowClick}>
                  <Checkbox
                    checked={selected.includes(grade.id)}
                    onChange={(checked) => toggleOne(grade.id, checked)}
                    label={`${grade.name} 선택`}
                  />
                  <span className="w-6 text-center font-mono text-sm tabular-nums text-ink-faint">{index + 1}</span>
                </div>

                <div className="lg:col-span-3">
                  <p className="text-sm font-medium">{grade.name}</p>
                  <p className="font-mono text-xs text-ink-faint">{grade.id}</p>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-3">
                  <span className="w-24 shrink-0 text-xs text-ink-faint lg:hidden">누적금액 기준</span>
                  <span className="text-sm tabular-nums">{formatAmount(grade.threshold)}원 이상</span>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-2">
                  <span className="w-24 shrink-0 text-xs text-ink-faint lg:hidden">할인율</span>
                  <span className="text-sm font-medium tabular-nums text-brand-700 dark:text-brand-300">
                    {grade.discountRate}%
                  </span>
                </div>

                <div className="flex items-baseline gap-2 lg:col-span-1">
                  <span className="w-24 shrink-0 text-xs text-ink-faint lg:hidden">사용자</span>
                  <span className="text-sm tabular-nums text-ink-muted">{grade.memberCount}</span>
                </div>

                <div className="flex items-center gap-2 lg:col-span-2 lg:justify-end" onClick={stopRowClick}>
                  <button
                    type="button"
                    onClick={() => openDetail(grade.id)}
                    className="h-8 rounded-lg border border-border-strong px-3 text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint"
                  >
                    조회
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete([grade.id])}
                    className="h-8 rounded-lg border border-border-strong px-3 text-sm text-signal-danger transition-colors duration-150 hover:border-signal-danger"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <AdminListPager total={ordered.length} page={1} pageSize={Math.max(ordered.length, 1)} />
      </section>

      <GradeFormModal
        open={formOpen}
        mode={mode}
        record={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={submit}
      />

      <AdminConfirmModal
        open={pendingSave !== null}
        elevated
        tone="brand"
        title={mode === 'create' ? '등급 추가' : '등급 저장'}
        description="이 조건에 해당하는 사용자에게 곧바로 적용됩니다."
        confirmLabel={mode === 'create' ? '추가' : '저장'}
        summary={
          pendingSave
            ? [
                { label: '등급명', value: pendingSave.name },
                { label: '기준 금액', value: `${formatAmount(pendingSave.threshold)}원 이상` },
                { label: '할인율', value: `${pendingSave.discountRate}%` },
              ]
            : []
        }
        onConfirm={applySave}
        onClose={() => setPendingSave(null)}
      />

      <AdminConfirmModal
        open={pendingDelete !== null}
        title="등급 삭제"
        description={deleteLabel}
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
