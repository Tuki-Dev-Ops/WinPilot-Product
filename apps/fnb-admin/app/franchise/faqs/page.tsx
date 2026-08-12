import type { Metadata } from 'next';
import { FnbShell } from '@/app/_components/FnbShell';
import { FaqListView } from '@/app/_components/FaqListView';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `franchise.faq` · F&B Admin · route `/franchise/faqs`
 *
 * 사이트의 가맹점 개설문의 화면(`/franchise/faq`)이 이 목록을 분류별로 나눠 건다.
 * 표는 고객센터 FAQ 와 한 벌을 쓴다 — 갈리는 것은 `누가 묻나` 하나다(`FaqListView`).
 */
export const metadata: Metadata = {
  title: adminTitle('창업', 'FAQ'),
  robots: { index: false, follow: false },
};

export default function FnbFaqListPage() {
  return (
    <FnbShell sectionId="franchise" trail={['창업', 'FAQ']} activeChildId="franchise-faq">
      <FaqListView
        audience="창업"
        title="창업 FAQ"
        basePath="/franchise/faqs"
        description="차리려는 분이 묻는 것입니다. 사이트의 가맹점 개설문의 화면에 분류별로 섭니다."
      />
    </FnbShell>
  );
}
