import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CONTENT, COPY, ROUTES, SLOT, cid, findNotice } from '@winpilot/client-content';
import { PageTitle, RichBody, SiteShell } from '@/app/_components/SiteShell';

/** Feature: `notice.detail` · B2C Client (템플릿 A) · route `/notices/{noticeId}` */
export const metadata: Metadata = { title: `${COPY.notice.listTitle} — ${CONTENT.seo.title}` };

export function generateStaticParams() {
  return CONTENT.notices.map((notice) => ({ noticeId: notice.id }));
}

export default async function NoticeDetailPage({ params }: { params: Promise<{ noticeId: string }> }) {
  const { noticeId } = await params;
  const notice = findNotice(noticeId);
  if (!notice) notFound();

  return (
    <SiteShell>
      <PageTitle title={notice.title} description={notice.publishedAt} />
      <article id={SLOT.articleBody} data-ssot-cid={cid('notice.detail', 'SiteNoticeBody')}>
        <RichBody html={notice.body} />
      </article>
      <a href={ROUTES.notices} className="w-fit text-sm text-brand-700 dark:text-brand-300">
        {COPY.notice.listTitle}
      </a>
    </SiteShell>
  );
}
