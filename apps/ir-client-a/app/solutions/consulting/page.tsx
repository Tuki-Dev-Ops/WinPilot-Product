import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { IR_COMPANY, findOffering } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { OfferingDetail } from '../_components/OfferingDetail';

/**
 * Feature: `consulting.detail` · IR Client (템플릿 A) · route `/solutions/consulting`
 *
 * 화면의 뼈대는 `OfferingDetail` 하나가 갖는다 — 여섯이 같은 차례로 서야 나란히 놓고 견줄 수
 * 있고, 하나에만 칸을 더하면 그 차이가 바로 눈에 띈다(그쪽 머리말).
 *
 * 여기서 하는 일은 **어느 것인지 고르는 것**뿐이다.
 *
 * ## 이 화면이 왜 필요했나
 * 전에는 메뉴의 `스마트 컨설팅` 이 곧장 문의하기로 갔다. **무엇을 해 주는지 읽기도 전에 물어보
 * 라는 것**이라, 누를 이유가 있는 사람만 눌렀다. 컨설팅은 여섯 중에서 가장 설명이 필요한
 * 것이다 — 만져지는 물건이 아니라 사람이 하는 일이기 때문이다.
 */
export const metadata: Metadata = { title: `스마트 컨설팅 — ${IR_COMPANY.name}` };

export default function ConsultingHomePage() {
  const offering = findOffering('consulting');
  if (!offering) notFound();

  return (
    <IrSiteShell>
      <IrPageTitle title={offering.title} description={offering.tagline} />
      <OfferingDetail offering={offering} />
    </IrSiteShell>
  );
}
