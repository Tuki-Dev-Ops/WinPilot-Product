/**
 * 화면 목록 왼쪽 세움대 — 파일이 아니라 **코드에서 만들어지는** 갈래(IA·Flow Chart)에 쓴다.
 *
 * `SectionNav` 는 `docs/` 폴더를 읽지만 IA 와 흐름도는 원본이 파일이 아니라 `lib/` 안에 있다.
 * 두 곳을 한 컴포넌트로 묶으면 파일이 없는 갈래에서 빈 목록이 나온다.
 */
export function ScreenNav({
  base,
  items,
  active,
  allLabel = '전체',
}: {
  base: string;
  items: Array<{ slug: string; label: string }>;
  /** 비어 있으면 `전체` 가 켜진다 */
  active?: string;
  allLabel?: string;
}) {
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
      aria-label="화면 목록"
      className="-mx-5 flex shrink-0 gap-1 overflow-x-auto px-5 pb-2 lg:mx-0 lg:w-52 lg:flex-col lg:gap-0.5 lg:px-0 lg:pb-0"
    >
      {item(base, allLabel, !active)}
      <span aria-hidden="true" className="hidden h-px shrink-0 bg-border lg:my-1.5 lg:block" />
      {items.map((entry) => item(`${base}/${entry.slug}`, entry.label, entry.slug === active))}
    </nav>
  );
}
