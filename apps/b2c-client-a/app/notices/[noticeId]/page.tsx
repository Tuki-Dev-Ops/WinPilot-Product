import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CONTENT, COPY, ROUTES, SLOT, cid, findNotice } from '@winpilot/client-content';
import { RichBody, SiteShell } from '@/app/_components/SiteShell';
import { SupportHeading, SupportShell } from '@/app/_components/SupportShell';

/**
 * Feature: `notice.detail` · B2C Client (템플릿 A) · route `/notices/{noticeId}`
 *
 * 목록과 같은 뼈대다 — 왼쪽 aside 는 그대로 두고 오른쪽 main 만 상세로 바뀐다.
 *
 * ## 어드민 연동
 * - 제목 · 본문 ← 콘텐츠 > 공지사항 상세 (`/contents/notices/[noticeId]`) 의 에디터 내용 그대로
 */
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
      <SupportShell>
        <SupportHeading title={notice.title} meta={notice.publishedAt} backHref={ROUTES.notices} />

        <article id={SLOT.articleBody} data-ssot-cid={cid('notice.detail', 'SiteNoticeBody')}>
          <RichBody html={notice.body} />
        </article>
      </SupportShell>
    </SiteShell>
  );
}
