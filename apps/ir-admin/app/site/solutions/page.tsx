import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { SolutionListView } from './_components/SolutionListView';

/**
 * Feature: `site.solutions` · IR Admin · route `/site/solutions`
 *
 * 홈페이지 갈래는 **투자자 화면이 아니라 회사 홈페이지**를 고치는 자리다. 공시·재무와 나눠 둔
 * 이유: 그쪽은 서식이 정해져 있고 틀리면 정정 공시로만 고치지만, 여기는 언제든 다시 쓰는
 * 홍보 문구다.
 */
export const metadata: Metadata = {
  title: '홈페이지 | 솔루션 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function IrSiteSolutionPage() {
  return (
    <IrShell sectionId="site" trail={['홈페이지', '솔루션']} activeChildId="site-solutions">
      <SolutionListView />
    </IrShell>
  );
}
