import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { PageVisitListView } from './_components/PageVisitListView';

/**
 * Feature: `statistics.pages` · IR Admin · route `/statistics/pages`
 *
 * 어느 화면이 실제로 읽히는지를 본다. 숫자는 아직 **씨앗**이다(`site.ts` 의 `PAGE_VISITS`).
 */
export const metadata: Metadata = {
  title: '통계 | 많이 방문한 페이지 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function PageVisitListPage() {
  return (
    <IrShell sectionId="statistics" trail={['통계', '많이 방문한 페이지']} activeChildId="statistics-pages">
      <PageVisitListView />
    </IrShell>
  );
}
