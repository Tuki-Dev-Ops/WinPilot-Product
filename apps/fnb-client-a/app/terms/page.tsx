import type { Metadata } from 'next';
import { FNB_BRAND } from '@winpilot/store';
import { FnbPageTitle, FnbSiteShell } from '@/app/_components/FnbSiteShell';

/**
 * Feature: `terms` · F&B Client (템플릿 A) · route `/terms`
 *
 * ## 원고가 없는 채로 화면을 세운다
 * 약관은 법무 검토를 지난 원고가 있어야 걸 수 있다. 검토 전 초안을 걸면 **그 순간부터 그것이
 * 우리가 내건 약관**이 되고, 나중에 다르게 고치면 그 사이에 신청한 사람에게는 옛 약관이 적용된다.
 *
 * 그렇다고 링크를 지우지도 않는다. 푸터에서 약관이 빠져 있으면 찾는 사람이 **없는 회사**로
 * 여긴다. 여기는 아직 준비 중이라는 사실과 **물어볼 곳**만 적는다.
 *
 * 원고가 오면 이 화면은 어드민(설정 > 서비스 이용약관)이 저장한 값을 읽게 된다.
 */
export const metadata: Metadata = { title: '서비스 이용약관' };

export default function TermsSettingsPage() {
  return (
    <FnbSiteShell>
      <FnbPageTitle title="서비스 이용약관" description="법무 검토를 마치는 대로 이 자리에 겁니다." align="left" />

      <div className="flex max-w-3xl flex-col gap-5 rounded-2xl bg-surface px-8 py-8">
        <p className="text-sm leading-loose text-ink-muted">
          아직 준비 중입니다. 검토 전 초안을 걸어 두면 그것이 곧 내건 약관이 되어, 나중에 고쳐도 그
          사이에 신청하신 분께는 옛 약관이 적용됩니다. 그래서 원고가 확정될 때까지 비워 둡니다.
        </p>
        <p className="text-sm leading-loose text-ink-muted">
          급히 확인이 필요하시면 아래로 문의해 주세요.
        </p>
        <div className="flex flex-col gap-1 border-t border-border pt-5">
          <p className="font-mono text-sm tabular-nums">{FNB_BRAND.phone}</p>
          <p className="font-mono text-sm">{FNB_BRAND.email}</p>
        </div>
      </div>
    </FnbSiteShell>
  );
}
