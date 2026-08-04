import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CONTENT, COPY, ROUTES, SLOT, cid, findFaq } from '@winpilot/client-content';
import { RichBody, SiteShell } from '@/app/_components/SiteShell';
import { SupportHeading, SupportShell } from '@/app/_components/SupportShell';

/**
 * Feature: `faq.detail` · B2C Client (템플릿 A) · route `/faqs/{faqId}`
 *
 * ## 어드민 연동
 * - 질문 · 답변 ← `b2c-admin` 콘텐츠 > FAQ (`/contents/faqs`) 의 에디터 내용 그대로
 * - 분류 이름 ← 같은 화면의 FAQ 카테고리 (store `FAQ_CATEGORIES`)
 */
export const metadata: Metadata = { title: `${COPY.faq.listTitle} — ${CONTENT.seo.title}` };

export function generateStaticParams() {
  return CONTENT.faqs.map((faq) => ({ faqId: faq.id }));
}

export default async function FaqDetailPage({ params }: { params: Promise<{ faqId: string }> }) {
  const { faqId } = await params;
  const faq = findFaq(faqId);
  if (!faq) notFound();

  return (
    <SiteShell>
      <SupportShell>
        <SupportHeading title={faq.question} meta={faq.categoryName} backHref={ROUTES.faqs} />

        <article id={SLOT.articleBody} data-ssot-cid={cid('faq.detail', 'SiteFaqBody')}>
          <RichBody html={faq.answer} />
        </article>
      </SupportShell>
    </SiteShell>
  );
}
