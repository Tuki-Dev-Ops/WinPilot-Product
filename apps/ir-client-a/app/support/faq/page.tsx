import type { Metadata } from 'next';
import { IR_COMPANY } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { FAQ_GROUPS, SITE_FAQS } from '@/lib/data/site';
import { FaqListView } from './_components/FaqListView';

/**
 * Feature: `faq.list` · IR Client (템플릿 A) · route `/support/faq`
 *
 * ## 세 묶음을 한 화면에 펴 두었었다
 * 도입·기술·지원이 세로로 이어져 있어, 기술 문제로 들어온 사람이 **도입 이야기를 지나** 자기
 * 물음에 닿았다. 갈래를 고르고 찾는 일은 브라우저에서 한다(`FaqListView`).
 *
 * 검색을 답까지 훑는 이유: 물음의 말과 찾는 사람의 말이 다르다. `견적` 을 치는 사람의 물음은
 * `도입 비용은 어떻게 되나요` 로 적혀 있고, 그 말은 **답 안에** 있다.
 */
export const metadata: Metadata = { title: `FAQ — ${IR_COMPANY.name}` };

export default function SiteFaqPage() {
  return (
    <IrSiteShell>
      <IrPageTitle title="FAQ" description="자주 받는 물음을 모았습니다. 갈래를 고르거나 검색해 보세요." />

      <FaqListView faqs={SITE_FAQS} groups={FAQ_GROUPS} />
    </IrSiteShell>
  );
}
