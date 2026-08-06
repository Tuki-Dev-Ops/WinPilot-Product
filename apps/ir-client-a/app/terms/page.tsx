import type { Metadata } from 'next';
import { IR_COMPANY } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';

/**
 * Feature: `site.terms` · IR Client (템플릿 A) · route `/terms`
 *
 * ## 약관 본문을 지어내지 않는다
 * 푸터가 이 자리를 가리키므로 화면 자체는 있어야 한다. 그렇다고 **그럴듯한 약관 문장을 채워
 * 두면 그것이 실제로 효력을 주장할 문서**가 된다 — 검토받지 않은 조항이 회사 이름으로 나가고,
 * 분쟁이 났을 때 근거가 되는 것도 이 화면이다.
 *
 * 그래서 여기는 **아직 준비 중이라는 사실과 물어볼 곳**만 적는다. 법무 검토를 마친 원고가
 * 오면 이 자리를 그대로 갈아 끼우면 된다.
 */
export const metadata: Metadata = { title: `서비스 이용약관 — ${IR_COMPANY.name}` };

export default function TermsPage() {
  return (
    <IrSiteShell back={{ href: '/', label: '홈' }}>
      <IrPageTitle
        title="서비스 이용약관"
        description="약관 원고를 준비하고 있습니다. 확정되는 대로 이 자리에 공개합니다."
      />

      <section className="flex flex-col gap-3 rounded-xl border border-border px-6 py-5">
        <p className="text-sm font-medium">문의</p>
        <p className="text-sm leading-relaxed text-ink-muted">
          약관과 관련한 문의는 아래로 주시면 담당자가 답변드립니다.
        </p>
        <p className="font-mono text-sm tabular-nums">
          {IR_COMPANY.irEmail} · {IR_COMPANY.irPhone}
        </p>
      </section>
    </IrSiteShell>
  );
}
