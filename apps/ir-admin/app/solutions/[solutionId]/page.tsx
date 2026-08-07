import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SOLUTIONS, findSolution } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { SolutionForm } from '@/app/products/_components/SolutionForm';

/**
 * Feature: `solution.detail` · IR Admin · route `/solutions/{solutionId}`
 *
 * 제품 상세와 **같은 폼**을 쓴다. 두 메뉴가 같은 값을 가리키므로 화면을 나누면 한쪽에서 고친
 * 것이 다른 쪽에 없는 것으로 보인다. 돌아갈 목록만 다르게 넘긴다.
 */
export const metadata: Metadata = {
  title: '솔루션 | 상세 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 넷만 있으므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return SOLUTIONS.map((one) => ({ solutionId: one.id }));
}

export default async function SolutionDetailPage({ params }: { params: Promise<{ solutionId: string }> }) {
  const { solutionId } = await params;
  const solution = findSolution(solutionId);
  if (!solution) notFound();

  return (
    <IrShell
      sectionId="solution"
      trail={['솔루션', '상세']}
      activeChildId="solution-list"
      back={{ href: '/solutions', label: '솔루션 목록' }}
    >
      <SolutionForm solution={solution} listHref="/solutions" resource="솔루션" />
    </IrShell>
  );
}
