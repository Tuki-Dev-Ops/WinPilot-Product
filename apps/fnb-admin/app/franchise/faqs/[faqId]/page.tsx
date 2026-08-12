import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FNB_FAQS, findFnbFaq } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { FaqForm } from '@/app/_components/FaqForm';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `franchise.faq.detail` · F&B Admin · route `/franchise/faqs/{faqId}`
 *
 * 폼은 두 갈래가 한 벌을 쓴다(`FaqForm`) — 칸도 검사도 같고, 갈리는 것은 **누가 묻나** 하나다.
 * 그 값은 고르는 칸이 아니라 화면이 정해서 넘긴다. 고를 수 있게 두면 잘못 고른다.
 */
export const metadata: Metadata = {
  title: adminTitle('창업', 'FAQ', '상세'),
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 이 갈래의 글만 미리 만들어 둔다. */
export function generateStaticParams() {
  return FNB_FAQS.filter((one) => one.audience === '창업').map((one) => ({ faqId: one.id }));
}

export default async function FnbFaqDetailPage({ params }: { params: Promise<{ faqId: string }> }) {
  const { faqId } = await params;
  const faq = findFnbFaq(faqId);
  if (!faq || faq.audience !== '창업') notFound();

  return (
    <FnbShell
      sectionId="franchise"
      trail={['창업', 'FAQ', '상세']}
      activeChildId="franchise-faq"
      back={{ href: '/franchise/faqs', label: '창업 FAQ 목록' }}
    >
      <FaqForm faq={faq} />
    </FnbShell>
  );
}
