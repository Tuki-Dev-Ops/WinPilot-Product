import type { Metadata } from 'next';
import { Accent, FnbPageTitle, FnbSiteShell } from '@/app/_components/FnbSiteShell';
import { SupportAside } from '@/app/support/_components/SupportAside';
import { FaqBoard } from './_components/FaqBoard';

/**
 * Feature: `support.faq` · F&B Client (템플릿 A) · route `/support/faq`
 *
 * 갈래를 왜 손님 · 창업 둘로 갈랐는지는 `FaqBoard` 머리말에 있다.
 *
 * ## 창업 물음이 두 자리에 선다
 * 같은 값이 창업 안내 화면(`/franchise`) 아래에도 선다. 두 벌로 적어 둔 것이 아니라 **같은
 * `FNB_FAQS` 를 갈래로 걸러** 쓴다. 두 자리에 두는 이유: 창업을 읽던 사람은 흐름을 끊지 않고
 * 거기서 답을 찾고, 여기로 바로 온 사람은 여기서 찾는다.
 *
 * ## 어드민 연동
 * - 자주 묻는 것 ← `@winpilot/store` 의 `FNB_FAQS` (F&B 어드민 콘텐츠 > FAQ)
 */
export const metadata: Metadata = { title: '자주 묻는 질문' };

export default function FaqListPage() {
  return (
    <FnbSiteShell>
      <FnbPageTitle
        label="Support"
        title={
          <>
            자주 <Accent>묻는 것</Accent>
          </>
        }
        description="드시러 오시는 분들이 자주 물으시는 것을 모아 두었습니다. 창업에 관한 물음은 창업 안내에서 따로 받습니다."
      />
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <SupportAside />

        <div className="min-w-0 flex-1">
          <FaqBoard />
        </div>
      </div>
    </FnbSiteShell>
  );
}
