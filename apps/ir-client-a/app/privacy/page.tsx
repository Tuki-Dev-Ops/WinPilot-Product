import type { Metadata } from 'next';
import { IR_COMPANY } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';

/**
 * Feature: `site.privacy` · IR Client (템플릿 A) · route `/privacy`
 *
 * ## 처리방침 본문을 지어내지 않는다
 * 개인정보 처리방침은 **무엇을 어떤 근거로 얼마 동안 모으는지**를 적는 문서다. 실제로 무엇을
 * 모으는지 확인하지 않고 문장을 채우면, 화면에 적힌 것과 서버가 하는 일이 어긋난다 — 그
 * 어긋남은 그대로 법 위반이다.
 *
 * 대신 **누구에게 물으면 되는지**(개인정보보호책임자)는 지금도 적을 수 있고, 그것이 이 화면이
 * 없을 때 가장 아쉬운 값이다.
 */
export const metadata: Metadata = { title: `개인정보 처리방침 — ${IR_COMPANY.name}` };

export default function PrivacyPage() {
  return (
    <IrSiteShell back={{ href: '/', label: '홈' }}>
      <IrPageTitle
        title="개인정보 처리방침"
        description="처리방침을 준비하고 있습니다. 확정되는 대로 이 자리에 공개합니다."
      />

      <section className="flex flex-col gap-3 rounded-xl border border-border px-6 py-5">
        <p className="text-sm font-medium">개인정보보호책임자</p>
        <p className="text-sm">{IR_COMPANY.privacyOfficer}</p>
        <p className="font-mono text-sm tabular-nums">
          {IR_COMPANY.irEmail} · {IR_COMPANY.irPhone}
        </p>
      </section>
    </IrSiteShell>
  );
}
