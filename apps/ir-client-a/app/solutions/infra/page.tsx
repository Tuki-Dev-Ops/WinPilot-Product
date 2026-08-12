import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { IR_COMPANY, findOffering } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { OfferingDetail } from '../_components/OfferingDetail';

/**
 * Feature: `infra.detail` · IR Client (템플릿 A) · route `/solutions/infra`
 *
 * 화면의 뼈대는 `OfferingDetail` 하나가 갖는다 — 여섯이 같은 차례로 서야 나란히 놓고 견줄 수
 * 있고, 하나에만 칸을 더하면 그 차이가 바로 눈에 띈다(그쪽 머리말).
 *
 * 여기서 하는 일은 **어느 것인지 고르는 것**뿐이다.
 *
 * ## 이 화면이 왜 필요했나
 * 전에는 메뉴의 `인프라 서비스` 가 제품 소개(`/products`)로 갔다. 거기 서 있는 것은 클라우드
 * 제품 넷이라, 인프라를 보러 간 사람은 **자기가 잘못 눌렀다고 여긴다.**
 */
export const metadata: Metadata = { title: `인프라 서비스 — ${IR_COMPANY.name}` };

export default function InfraHomePage() {
  const offering = findOffering('infra');
  if (!offering) notFound();

  return (
    <IrSiteShell>
      <IrPageTitle title={offering.title} description={offering.tagline} />
      <OfferingDetail offering={offering} />
    </IrSiteShell>
  );
}
