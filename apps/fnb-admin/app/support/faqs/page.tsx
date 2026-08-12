import type { Metadata } from 'next';
import { FnbShell } from '@/app/_components/FnbShell';
import { FaqListView } from '@/app/_components/FaqListView';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `support.faq` · F&B Admin · route `/support/faqs`
 *
 * 사이트의 고객센터 FAQ(`/support/faq`)가 이 목록을 그대로 건다.
 */
export const metadata: Metadata = {
  title: adminTitle('고객센터', 'FAQ'),
  robots: { index: false, follow: false },
};

export default function FnbFaqListPage() {
  return (
    <FnbShell sectionId="support" trail={['고객센터', 'FAQ']} activeChildId="support-faq">
      <FaqListView
        audience="손님"
        title="고객센터 FAQ"
        basePath="/support/faqs"
        description="드시러 오시는 분이 묻는 것입니다. 사이트 고객센터 화면에 접힌 목록으로 섭니다."
      />
    </FnbShell>
  );
}
