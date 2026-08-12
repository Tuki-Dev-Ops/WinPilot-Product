import type { Metadata } from 'next';
import { blankFnbFaq } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { FaqForm } from '@/app/_components/FaqForm';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `support.faq.create` · F&B Admin · route `/support/faqs/new`
 *
 * 갈래(`손님`)를 화면이 정해서 넘긴다 — 여기서 만든 글이 다른 목록에 서면 안 된다.
 * 공개를 꺼 둔 채로 열린다(`blankFnbFaq`).
 */
export const metadata: Metadata = {
  title: adminTitle('고객센터', 'FAQ', '새 글'),
  robots: { index: false, follow: false },
};

export default function FnbFaqCreatePage() {
  return (
    <FnbShell
      sectionId="support"
      trail={['고객센터', 'FAQ', '새 글']}
      activeChildId="support-faq"
      back={{ href: '/support/faqs', label: '고객센터 FAQ 목록' }}
    >
      <FaqForm faq={blankFnbFaq('손님')} mode="create" />
    </FnbShell>
  );
}
