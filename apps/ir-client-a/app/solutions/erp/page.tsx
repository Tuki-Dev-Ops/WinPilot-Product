import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { IR_COMPANY, findSolution } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { SolutionDetail } from '../_components/SolutionDetail';

/**
 * Feature: `solution.detail` · IR Client (템플릿 A) · route `/solutions/erp`
 *
 * 화면의 뼈대는 `SolutionDetail` 하나가 갖는다 — 셋이 같은 차례로 서야 나란히 놓고 견줄 수
 * 있고, 하나에만 칸을 더하면 그 차이가 바로 눈에 띈다(그쪽 머리말).
 *
 * 여기서 하는 일은 **어느 솔루션인지 고르는 것**뿐이다.
 */
export const metadata: Metadata = { title: `Cloud ERP — ${IR_COMPANY.name}` };

export default function SolutionErpPage() {
  const solution = findSolution('erp');
  if (!solution) notFound();

  return (
    <IrSiteShell>
      <IrPageTitle title={`Cloud ${solution.name}`} description={solution.tagline} />
      <SolutionDetail solution={solution} />
    </IrSiteShell>
  );
}
