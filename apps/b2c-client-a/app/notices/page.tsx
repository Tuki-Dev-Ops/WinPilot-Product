import type { Metadata } from 'next';
import { CONTENT, COPY, ROUTES } from '@winpilot/client-content';
import { PageTitle, SiteShell } from '@/app/_components/SiteShell';

/** Feature: `notice.list` · B2C Client (템플릿 A) · route `/notices` */
export const metadata: Metadata = { title: `${COPY.notice.listTitle} — ${CONTENT.seo.title}` };

export default function NoticeListPage() {
  // 고정 공지가 위로 온다 — 어드민의 '상단 고정' 이 여기서 실제로 쓰인다.
  const notices = [...CONTENT.notices].sort((a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false));

  return (
    <SiteShell>
      <PageTitle title={COPY.notice.listTitle} />
      {notices.length === 0 ? (
        <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">{COPY.notice.empty}</p>
      ) : (
        <div className="flex flex-col overflow-hidden rounded-xl border border-border">
          {notices.map((notice) => (
            <a
              key={notice.id}
              href={ROUTES.noticeDetail(notice.id)}
              className="flex items-center gap-3 border-b border-border px-6 py-4 last:border-b-0 hover:bg-surface"
            >
              {notice.pinned && (
                <span className="shrink-0 whitespace-nowrap rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-200">
                  {COPY.notice.pinned}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-sm">{notice.title}</span>
              <span className="shrink-0 font-mono text-xs tabular-nums text-ink-faint">{notice.publishedAt}</span>
            </a>
          ))}
        </div>
      )}
    </SiteShell>
  );
}
