import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE_FAQS, findSiteFaq } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { FaqForm } from '@/app/contents/faqs/_components/FaqForm';

/**
 * Feature: `faq.detail` · IR Admin · route `/contents/faqs/{faqId}`
 */
export const metadata: Metadata = {
  title: '콘텐츠 | FAQ | 수정 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 씨앗 값만 있으므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return SITE_FAQS.map((one) => ({ faqId: one.id }));
}

export default async function FaqDetailPage({ params }: { params: Promise<{ faqId: string }> }) {
  const { faqId } = await params;
  const faq = findSiteFaq(faqId);
  if (!faq) notFound();

  return (
    <IrShell
      sectionId="content"
      trail={['콘텐츠', 'FAQ', '수정']}
      activeChildId="content-faqs"
      back={{ href: '/contents/faqs', label: 'FAQ 목록' }}
    >
      <FaqForm mode="edit" code={faq.id} initial={faq} />
    </IrShell>
  );
}
