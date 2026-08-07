import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { FaqListView } from './_components/FaqListView';

/**
 * Feature: `faq.list` · IR Admin · route `/contents/faqs`
 *
 * 사이트의 CS CENTER > FAQ 가 이 값을 읽는다. 갈래(`도입`·`기술`·`지원`)가 곧 그 화면의
 * 왼쪽 줄이 된다.
 */
export const metadata: Metadata = {
  title: '콘텐츠 | FAQ — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function FaqPage() {
  return (
    <IrShell sectionId="content" trail={['콘텐츠', 'FAQ']} activeChildId="content-faqs">
      <FaqListView />
    </IrShell>
  );
}
