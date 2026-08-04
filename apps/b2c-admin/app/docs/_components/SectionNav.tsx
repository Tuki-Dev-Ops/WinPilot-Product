import { listSection, type DocSection } from '@winpilot/docs';

/**
 * 갈래 안의 문서 목록 — 문서 한 장을 볼 때 왼쪽에 세워 둔다.
 *
 * 한 화면을 보다가 옆 화면의 같은 절을 보는 일이 잦아서(예: 이 화면의 예외 처리는 저 화면과
 * 같은가) 매번 목차로 돌아가게 두지 않는다.
 */
export function SectionNav({
  section,
  base,
  active,
  hide = [],
}: {
  section: DocSection;
  base: string;
  active: string;
  hide?: string[];
}) {
  const entries = listSection(section).filter((entry) => !hide.includes(entry.slug));

  return (
    <nav
      aria-label="문서 목록"
      className="-mx-5 flex shrink-0 gap-1 overflow-x-auto px-5 pb-2 lg:mx-0 lg:w-52 lg:flex-col lg:px-0 lg:pb-0"
    >
      {entries.map((entry) => {
        const on = entry.slug === active;
        return (
          <a
            key={entry.slug}
            href={`${base}/${entry.slug}`}
            aria-current={on ? 'page' : undefined}
            className={`shrink-0 truncate whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
              on
                ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                : 'text-ink-muted hover:bg-surface hover:text-ink'
            }`}
          >
            {entry.title}
          </a>
        );
      })}
    </nav>
  );
}
