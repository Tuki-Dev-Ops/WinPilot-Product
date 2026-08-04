import type { ReactNode } from 'react';

export type StatCardProps = {
  label: string;
  value: string;
  /** 앞 구간 대비 증감 — 없으면 비교 구간이 없다는 뜻이다 */
  change?: number | null;
  hint?: string;
};

/**
 * 숫자 하나를 보여주는 칸.
 *
 * 증감은 **부호로 색을 정하지 않는다** — 반품·연체처럼 늘어나면 나쁜 지표가 있어서,
 * 색을 자동으로 붙이면 나쁜 소식이 초록으로 표시된다. 방향만 표시하고 판단은 사람에게 맡긴다.
 */
export function StatCard({ label, value, change, hint }: StatCardProps) {
  return (
    <div className="bg-canvas px-5 py-5">
      <div className="text-sm text-ink-muted">{label}</div>
      <div className="mt-2 text-3xl font-bold tabular-nums tracking-tight">{value}</div>
      <div className="mt-1 flex items-center gap-2 text-xs text-ink-faint">
        {change !== undefined && (
          <span className="tabular-nums">
            {change === null ? '비교 구간 없음' : `${change > 0 ? '▲' : change < 0 ? '▼' : '–'} ${Math.abs(change * 100).toFixed(1)}%`}
          </span>
        )}
        {hint && <span className="min-w-0 truncate">{hint}</span>}
      </div>
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
      {children}
    </div>
  );
}

export function StatSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-canvas">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}
