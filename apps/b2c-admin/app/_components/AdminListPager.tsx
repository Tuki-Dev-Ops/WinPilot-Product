export type AdminListPagerProps = {
  total: number;
  page: number;
  pageSize: number;
};

/** 목록 하단 — 총 건수와 페이지 이동. 페이지 상태는 URL 쿼리에 반영한다 (docs/spec/01-path.md §1.4). */
export function AdminListPager({ total, page, pageSize }: AdminListPagerProps) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-4">
      <p className="text-sm text-ink-muted">
        총 <span className="font-medium tabular-nums text-ink">{total.toLocaleString('ko-KR')}</span>건
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="h-8 rounded-lg border border-border-strong px-3 text-sm text-ink-muted"
          disabled={page <= 1}
        >
          이전
        </button>
        <span className="px-1 text-sm tabular-nums text-ink-muted">
          {page} / {lastPage}
        </span>
        <button
          type="button"
          className="h-8 rounded-lg border border-border-strong px-3 text-sm text-ink-muted"
          disabled={page >= lastPage}
        >
          다음
        </button>
      </div>
    </div>
  );
}
