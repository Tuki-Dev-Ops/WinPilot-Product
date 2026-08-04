'use client';

export type AdminBulkBarProps = {
  count: number;
  onClear: () => void;
  onDelete: () => void;
};

/** 선택된 항목이 있을 때만 목록 위에 뜨는 일괄 작업 줄. */
export function AdminBulkBar({ count, onClear, onDelete }: AdminBulkBarProps) {
  if (count === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-800 dark:bg-brand-900">
      <p className="text-sm text-brand-700 dark:text-brand-200">
        <span className="font-medium tabular-nums">{count}</span>건 선택됨
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClear}
          className="h-8 rounded-lg border border-border-strong bg-canvas px-3 text-sm text-ink-muted"
        >
          선택 해제
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="h-8 rounded-lg bg-signal-danger px-3 text-sm font-medium text-white"
        >
          선택 삭제
        </button>
      </div>
    </div>
  );
}
