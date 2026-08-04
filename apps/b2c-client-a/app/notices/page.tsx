import type { Metadata } from 'next';
import { CONTENT, COPY, ROUTES, SLOT, cid } from '@winpilot/client-content';
import { SiteShell } from '@/app/_components/SiteShell';
import { SupportHeading, SupportShell } from '@/app/_components/SupportShell';

/**
 * Feature: `notice.list` · B2C Client (템플릿 A) · route `/notices`
 *
 * 고객지원 세 갈래는 같은 뼈대를 쓴다 — 왼쪽 aside 가 갈래, 오른쪽 main 이 목록·상세다.
 *
 * ## 어드민 연동
 * - 목록 · 상단 고정 ← `b2c-admin` 콘텐츠 > 공지사항 (`/contents/notices`)
 * - 숨김(`visible: false`)으로 둔 공지는 여기 오지 않는다
 */
export const metadata: Metadata = { title: `${COPY.notice.listTitle} — ${CONTENT.seo.title}` };

export default function NoticeListPage() {
  // 고정 공지가 위로 온다 — 어드민의 '상단 고정' 이 여기서 실제로 쓰인다.
  const notices = [...CONTENT.notices].sort((a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false));

  return (
    <SiteShell>
      <SupportShell>
        <SupportHeading title={COPY.notice.listTitle} />

        {notices.length === 0 ? (
          <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">{COPY.notice.empty}</p>
        ) : (
          <div id={SLOT.noticeList} data-ssot-cid={cid('notice.list', 'SiteNoticeList')} className="flex flex-col">
            {notices.map((notice) => (
              <a
                key={notice.id}
                href={ROUTES.noticeDetail(notice.id)}
                className="flex items-center gap-3 border-b border-border px-1 py-4 hover:bg-surface"
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
      </SupportShell>
    </SiteShell>
  );
}
