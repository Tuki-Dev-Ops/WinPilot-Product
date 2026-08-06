import { listSection, type DocSection } from '@winpilot/docs';

/** 갈래 안의 문서를 카드로 늘어놓는다 — 무엇이 있는지 먼저 보여 준다. */
export function SectionList({
  section,
  base,
  hide = [],
}: {
  section: DocSection;
  base: string;
  hide?: string[];
}) {
  const entries = listSection(section).filter((entry) => !hide.includes(entry.slug));

  if (entries.length === 0) {
    return <p className="text-sm text-ink-muted">아직 만들어진 문서가 없습니다 — `pnpm docs:build` 를 돌립니다.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {entries.map((entry) => (
        <a
          key={entry.slug}
          href={`${base}/${entry.slug}`}
          className="flex flex-col gap-1 rounded-xl border border-border px-5 py-4 hover:border-border-strong"
        >
          <span className="min-w-0 truncate text-sm font-medium">{entry.title}</span>
          <span className="min-w-0 truncate font-mono text-xs text-ink-faint">
            {base}/{entry.slug}
          </span>
        </a>
      ))}
    </div>
  );
}
