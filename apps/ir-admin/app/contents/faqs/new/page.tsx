import type { Metadata } from 'next';
import { SITE_FAQS, nextSiteId } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { FaqForm } from '@/app/contents/faqs/_components/FaqForm';

/**
 * Feature: `faq.create` · IR Admin · route `/contents/faqs/new`
 */
export const metadata: Metadata = {
  title: '콘텐츠 | FAQ | 등록 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function FaqCreatePage() {
  return (
    <IrShell
      sectionId="content"
      trail={['콘텐츠', 'FAQ', '등록']}
      activeChildId="content-faqs"
      back={{ href: '/contents/faqs', label: 'FAQ 목록' }}
    >
      <FaqForm mode="create" code={nextSiteId('F', SITE_FAQS.map((one) => one.id))} />
    </IrShell>
  );
}
