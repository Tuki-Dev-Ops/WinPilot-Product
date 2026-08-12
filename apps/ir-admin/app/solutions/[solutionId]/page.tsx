import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SOLUTIONS, findSolution } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { OfferingForm } from '@/app/_components/OfferingForm';

/**
 * Feature: `solution.detail` · IR Admin · route `/solutions/{solutionId}`
 *
 * 제품 · 서비스 상세와 **같은 폼**을 쓴다. 세 갈래가 같은 모양의 값을 가리키므로 화면을 나누면
 * 한쪽에서 고친 것이 다른 쪽에 없는 것으로 보인다. 돌아갈 목록만 다르게 넘긴다.
 */
export const metadata: Metadata = {
  title: '문제 · 해법 | 상세 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 넷만 있으므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return SOLUTIONS.map((one) => ({ solutionId: one.id }));
}

export default async function IrSolutionDetailPage({ params }: { params: Promise<{ solutionId: string }> }) {
  const { solutionId } = await params;
  const solution = findSolution(solutionId);
  if (!solution) notFound();

  return (
    <IrShell
      sectionId="solution"
      trail={['문제 · 해법', '상세']}
      activeChildId="solution-list"
      back={{ href: '/solutions', label: '문제 · 해법 목록' }}
    >
      <OfferingForm offering={solution} listHref="/solutions" resource="문제 · 해법" />
    </IrShell>
  );
}
