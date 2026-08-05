import { listSection, type DocSection } from '@winpilot/docs';

/**
 * 갈래 안의 문서 목록 — 문서 한 장을 볼 때 왼쪽에 세워 둔다.
 *
 * 한 화면을 보다가 옆 화면의 같은 절을 보는 일이 잦아서(예: 이 화면의 예외 처리는 저 화면과
 * 같은가) 매번 목차로 돌아가게 두지 않는다.
 *
 * 맨 위는 늘 **전체**다. 갈래로 나눠 놓아도 한 장에서 훑고 싶은 때가 있고, 그때 목록을
 * 벗어나 브레드크럼을 찾아 올라가게 두면 목록을 세워 둔 뜻이 없다.
 */
export function SectionNav({
  section,
  base,
  active,
  hide = [],
  allLabel = '전체',
}: {
  section: DocSection;
  base: string;
  active: string;
  hide?: string[];
  allLabel?: string;
}) {
  const entries = listSection(section).filter((entry) => !hide.includes(entry.slug));

  const item = (href: string, label: string, on: boolean) => (
    <a
      key={href}
      href={href}
      aria-current={on ? 'page' : undefined}
      className={`shrink-0 truncate whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
        on
          ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
          : 'text-ink-muted hover:bg-surface hover:text-ink'
      }`}
    >
      {label}
    </a>
  );

  return (
    <nav
      aria-label="문서 목록"
      className="-mx-5 flex shrink-0 gap-1 overflow-x-auto px-5 pb-2 lg:mx-0 lg:w-52 lg:flex-col lg:gap-0.5 lg:px-0 lg:pb-0"
    >
      {item(base, allLabel, false)}
      <span aria-hidden="true" className="hidden h-px shrink-0 bg-border lg:my-1.5 lg:block" />
      {entries.map((entry) => item(`${base}/${entry.slug}`, entry.title, entry.slug === active))}
    </nav>
  );
}
