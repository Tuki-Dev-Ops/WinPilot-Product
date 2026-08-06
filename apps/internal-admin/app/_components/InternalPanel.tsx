import type { ReactNode } from 'react';

/**
 * 카드 한 장 · 요약 숫자 · 빈 상태.
 *
 * 세 조각이 한 파일에 있는 이유: 목록 화면이 셋을 언제나 함께 쓴다. 파일을 나누면 화면마다
 * import 가 셋으로 늘고, 그러다 한 화면이 자기 카드를 따로 그리기 시작한다.
 *
 * **목록 위 툴바는 여기 없다.** 두 어드민이 같은 것을 쓰기로 정해 `@winpilot/ui` 의
 * `ListToolbar` 로 올렸다. 여기 남은 것은 아직 이 콘솔만 쓰는 카드·요약·빈 상태다 —
 * 다른 앱이 같은 것을 쓰기로 정하면 그때 올린다 (`docs/component.md` §2.1).
 */
export function InternalPanel({
  title,
  description,
  aside,
  children,
}: {
  title: string;
  /** 이 카드가 무엇을 다루는지 한 줄. 없으면 두지 않는다 — 빈 줄이 자리만 차지한다 */
  description?: string;
  /** 제목 오른쪽에 붙는 값(합계·상태 등) */
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-canvas">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-6 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-1 text-sm leading-relaxed text-ink-muted">{description}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

/**
 * 결과가 없을 때.
 *
 * 목록 자리를 비우지 않고 **왜 비었는지** 한 줄로 적는다. 빈 자리는 "값이 없다" 로도
 * "아직 불러오는 중" 으로도 읽혀서, 읽는 사람이 새로고침을 반복하게 된다.
 */
export function InternalEmpty({ children }: { children: ReactNode }) {
  return <p className="px-6 py-16 text-center text-sm text-ink-muted">{children}</p>;
}

export type SummaryCard = {
  label: string;
  value: string;
  /** 강조가 필요한 값에만 색을 준다 — 전부 칠하면 아무것도 도드라지지 않는다 */
  tone?: string;
  hint?: string;
};

/**
 * 요약 숫자 줄.
 *
 * 볼 것이 없어도 카드를 숨기지 않고 0 을 적는다. 사라진 카드는 값이 0 인지 기능이 없어진
 * 것인지 알 수 없다.
 */
export function InternalSummary({ cards }: { cards: SummaryCard[] }) {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${cards.length > 3 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
      {cards.map((card) => (
        <section key={card.label} className="rounded-xl border border-border bg-canvas px-6 py-5">
          <p className="text-xs uppercase tracking-widest text-ink-faint">{card.label}</p>
          <p className={`mt-2 text-lg font-semibold tabular-nums ${card.tone ?? ''}`}>{card.value}</p>
          {card.hint && <p className="mt-1 text-xs leading-relaxed text-ink-faint">{card.hint}</p>}
        </section>
      ))}
    </div>
  );
}

/**
 * 표 머리줄 — `lg` 이상에서만 보인다.
 *
 * 좁은 화면에서는 머리줄을 숨기고 각 행이 자기 라벨을 갖는다. 좁은 폭에 열 이름을 그대로
 * 두면 글자가 겹쳐 어느 값이 어느 열인지 오히려 알 수 없다.
 */
export function InternalTableHead({
  columns,
  lead,
}: {
  columns: Array<{ label: string; span: string }>;
  /** 맨 왼쪽 칸 — 전체 선택 체크박스와 `순번` 라벨. 표마다 자리가 같아야 눈이 헤매지 않는다 */
  lead?: ReactNode;
}) {
  return (
    <div className="hidden gap-4 border-b border-border px-5 py-3 text-xs text-ink-faint lg:grid lg:grid-cols-12 lg:items-center">
      {lead}
      {columns.map((column) => (
        <span key={column.label} className={column.span}>
          {column.label}
        </span>
      ))}
    </div>
  );
}

/** 표 아래 마무리 줄 — 총 건수와 합계. 목록이 길어져도 이 줄에서 전체를 읽는다. */
export function InternalTableFoot({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-4 text-sm text-ink-muted">
      {children}
    </div>
  );
}
