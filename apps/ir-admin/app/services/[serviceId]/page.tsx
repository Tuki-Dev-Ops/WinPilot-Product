import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SERVICE_DETAILS, findService } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { OfferingForm } from '@/app/_components/OfferingForm';

/**
 * Feature: `service.detail` · IR Admin · route `/services/{serviceId}`
 *
 * 제품 · 문제 · 해법 상세와 **같은 폼**을 쓴다(`OfferingForm`). 제품에만 있는 칸 둘(짧은 이름 ·
 * 사이트에 노출)은 그 폼이 알아서 접는다 — 여기서 `서비스라서 빼야 할 것`을 세어 두면, 칸이
 * 하나 늘 때마다 그 목록을 함께 고쳐야 하고 그러다 한 번 빠뜨린다.
 *
 * 등록 화면이 없는 것도 제품과 같은 이유다. 상세 화면 주소가 코드로 짜여 있어 목록에 한 줄
 * 더한다고 사이트에 화면이 생기지 않는다 — 메뉴에는 있는데 눌러도 404 인 서비스가 만들어진다.
 */
export const metadata: Metadata = {
  title: '서비스 | 상세 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 둘뿐이므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return SERVICE_DETAILS.map((one) => ({ serviceId: one.id }));
}

export default async function IrServiceDetailPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  const service = findService(serviceId);
  if (!service) notFound();

  return (
    <IrShell
      sectionId="service"
      trail={['서비스', '상세']}
      activeChildId="service-list"
      back={{ href: '/services', label: '서비스 목록' }}
    >
      <OfferingForm offering={service} listHref="/services" resource="서비스" />
    </IrShell>
  );
}
