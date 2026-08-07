import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { IR_COMPANY, findSolution } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { SolutionDetail } from '../_components/SolutionDetail';

/**
 * Feature: `solution.detail` · IR Client (템플릿 A) · route `/solutions/dxp`
 *
 * 화면의 뼈대는 `SolutionDetail` 하나가 갖는다 — 넷이 같은 차례로 서야 나란히 놓고 견줄 수
 * 있고, 하나에만 칸을 더하면 그 차이가 바로 눈에 띈다(그쪽 머리말).
 *
 * ## 이 화면이 마지막으로 생겼다
 * 전에는 DXP 만 자기 화면이 없어 메뉴가 제품 소개(`/products`)로 보냈다. 그러면 넷 중 하나만
 * **다른 곳으로 튕겨** 나가고, 눌러 본 사람은 자기가 잘못 눌렀다고 여긴다. 값(`SOLUTIONS`)은
 * 처음부터 넷을 다 들고 있었으므로 화면만 세우면 되는 일이었다.
 *
 * 여기서 하는 일은 **어느 솔루션인지 고르는 것**뿐이다.
 */
export const metadata: Metadata = { title: `Cloud DXP — ${IR_COMPANY.name}` };

export default function SolutionDxpPage() {
  const solution = findSolution('dxp');
  if (!solution) notFound();

  return (
    <IrSiteShell>
      <IrPageTitle title={`Cloud ${solution.name}`} description={solution.tagline} />
      <SolutionDetail solution={solution} />
    </IrSiteShell>
  );
}
