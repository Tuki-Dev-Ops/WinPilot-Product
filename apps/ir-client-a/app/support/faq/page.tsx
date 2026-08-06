import type { Metadata } from 'next';
import { IR_COMPANY } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { FAQ_GROUPS, SITE_FAQS } from '@/lib/data/site';

/**
 * Feature: `faq.list` · IR Client (템플릿 A) · route `/support/faq`
 *
 * ## 접지 않고 전부 펼쳐 둔다
 * 아코디언으로 접으면 **찾는 말이 화면에 없어** 브라우저 검색(Ctrl+F)이 걸리지 않는다.
 * FAQ 를 여는 사람의 절반은 그렇게 찾는다.
 *
 * 대신 갈래로 묶는다 — 여섯 개가 한 덩어리로 늘어서면 자기 물음이 어디쯤인지 가늠하지 못한다.
 */
export const metadata: Metadata = { title: `FAQ — ${IR_COMPANY.name}` };

export default function FaqListPage() {
  return (
    <IrSiteShell>
      <IrPageTitle title="FAQ" description="자주 받는 물음을 모았습니다." />

      <div className="flex flex-col gap-10">
        {FAQ_GROUPS.map((group) => {
          const rows = SITE_FAQS.filter((one) => one.group === group);
          if (rows.length === 0) return null;

          return (
            <section key={group} className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold tracking-tight">{group}</h2>

              <dl className="flex flex-col">
                {rows.map((one) => (
                  <div key={one.id} className="flex flex-col gap-2 border-b border-border py-5 first:pt-0 last:border-b-0">
                    <dt className="text-base font-medium">{one.question}</dt>
                    <dd className="text-sm leading-relaxed text-ink-muted">{one.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>
    </IrSiteShell>
  );
}
