import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { ServiceListView } from './_components/ServiceListView';

/**
 * Feature: `service.list` · IR Admin · route `/services`
 *
 * 사이트의 SOLUTION 메뉴 아래 두 화면(`/solutions/consulting` · `/solutions/infra`)이 이 값을 읽는다.
 *
 * ## 주소가 `/services` 인데 사이트는 `/solutions/*` 다
 * 어긋나 보이지만 그대로 둔다. 어드민의 주소는 **운영자가 무엇을 고치러 왔는지**를 말하고,
 * 사이트의 주소는 **찾아온 사람이 어느 갈래에서 찾는지**를 말한다. 사이트에서 이 둘은 SOLUTION
 * 갈래에 서지만, 어드민에는 이미 클라우드 제품 넷을 보는 `/solutions` 가 있다. 같은 주소에
 * 성격이 다른 둘을 겹쳐 두면 목록 하나에 여섯이 섞여 서고, 그때부터 **켜고 끌 수 있는 줄과
 * 없는 줄**이 한 표 안에 섞인다.
 */
export const metadata: Metadata = {
  title: '서비스 | 목록 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function IrServiceListPage() {
  return (
    <IrShell sectionId="service" trail={['서비스', '목록']} activeChildId="service-list">
      <ServiceListView />
    </IrShell>
  );
}
