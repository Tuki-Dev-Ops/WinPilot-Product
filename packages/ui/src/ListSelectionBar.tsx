/**
 * 고른 줄에 대고 할 일 — 표 **머리글 위**에 열리는 줄.
 *
 * ## 고른 것이 없으면 아예 없다
 * 늘 세워 두고 `선택 삭제` 를 회색으로 앉혀 두는 방법도 있다. 그러면 누를 수 없다는 것을
 * **눌러 봐야** 알게 되고, 그 사이 사람은 자기가 무엇을 잘못했는지 찾는다. 없다가 생기면
 * 무엇이 켜졌는지가 **나타남으로** 드러난다.
 *
 * ## 자리가 머리글 위인 이유
 * 고른 줄은 표 안에 흩어져 있다. 표 아래에 두면 스무 줄짜리 목록에서 셋을 고른 뒤 **끝까지
 * 내려가야** 지울 수 있고, 화면 위에 띄우면 어느 표의 것인지 자리로 드러나지 않는다.
 *
 * ## `선택 해제` 를 왼쪽에 둔다
 * 되돌리는 일이 지우는 일보다 왼쪽이다(`RowActionGroup` 과 같은 규칙) — 손이 미끄러져도
 * 위험한 쪽을 먼저 누르지 않는다.
 */
export function ListSelectionBar({
  count,
  onClear,
  onDelete,
  deleteLabel = '선택 삭제',
}: {
  /** 고른 줄 수. 0 이면 아무것도 그리지 않는다 */
  count: number;
  onClear: () => void;
  /** 없으면 지우는 단추를 그리지 않는다 — 지울 수 없는 자원이 있다 */
  onDelete?: () => void;
  deleteLabel?: string;
}) {
  if (count === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-5 py-3">
      <p className="text-sm text-ink-muted">
        선택 <span className="font-semibold tabular-nums text-ink">{count}</span>건
      </p>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onClear}
          className="h-8 shrink-0 rounded-lg border border-border-strong px-3 text-xs text-ink-muted transition-colors duration-150 hover:border-ink-faint hover:text-ink"
        >
          선택 해제
        </button>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="h-8 shrink-0 rounded-lg border border-signal-danger/50 px-3 text-xs font-medium text-signal-danger transition-colors duration-150 hover:border-signal-danger"
          >
            {deleteLabel}
          </button>
        )}
      </div>
    </div>
  );
}
