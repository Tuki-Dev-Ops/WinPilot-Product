import type { Metadata } from 'next';
import { FNB_BRAND, faqTopicsOf, publicFnbFaqs } from '@winpilot/store';
import { ApplyCta } from '@/app/_components/ApplyCta';
import { Accent, FnbPageTitle, FnbSiteShell } from '@/app/_components/FnbSiteShell';
import { FranchiseTabs } from '@/app/franchise/_components/FranchiseTabs';
import { FranchiseFaqBoard } from './_components/FranchiseFaqBoard';
import { FNB_ROUTES } from '@/lib/navigation';

/**
 * Feature: `franchise.faq` · F&B Client (템플릿 A) · route `/franchise/faq`
 *
 * ## 개설절차 화면에서 떼어 냈다
 * 한때 이 물음들이 창업 안내 한 장의 맨 아래에 있었다. 비용 표와 절차를 다 지나야 닿는
 * 자리였는데, **물어볼 것이 생겨서 다시 온 사람**은 그 둘을 이미 읽었다 — 읽은 것을 두 번
 * 지나게 하는 셈이었다.
 *
 * ## 전화번호를 맨 위에 둔다
 * 여기까지 온 사람은 **글로 답이 안 나온 사람**이다. 목록을 먼저 세우고 번호를 아래 두면 스무
 * 줄을 훑고 나서야 전화할 곳을 찾는다.
 *
 * ## 물음은 접어 두고 분류를 왼쪽에 세운다
 * 열둘이 넘어가면서 다 펴 두면 자기 물음에 닿기까지 남의 답을 여럿 지나야 했다. 왜 접었고 왜
 * 하나만 열리는지는 `FranchiseFaqBoard` 머리말에 있다.
 *
 * ## 어드민 연동
 * - 자주 묻는 것 ← `@winpilot/store` 의 `FNB_FAQS` 중 `창업` (F&B 어드민 콘텐츠 > FAQ)
 */
export const metadata: Metadata = { title: '가맹점 개설문의' };

export default function FaqListPage() {
  const faqs = publicFnbFaqs().filter((one) => one.audience === '창업');

  return (
    <FnbSiteShell>
      <FnbPageTitle
        label="Franchise"
        title={
          <>
            처음 여시는 분이 <Accent>가장 많습니다</Accent>
          </>
        }
        description="얼마가 드는지, 문 여는 날까지 얼마나 걸리는지 먼저 적어 둡니다."
      />
      <FranchiseTabs />

      <div className="flex flex-col gap-10">
        {/* 글로 답이 안 나온 사람이 여기까지 온다 — 번호가 맨 위다(머리말). */}
        <section className="flex flex-col items-center gap-3 rounded-2xl bg-surface px-8 py-8 text-center">
          <p className="text-sm text-ink-muted">바로 물어보고 싶으시면</p>
          <p className="font-mono text-2xl font-bold tabular-nums">{FNB_BRAND.franchisePhone}</p>
          <p className="text-xs text-ink-faint">평일 09:00 – 18:00 · 창업 상담 전용</p>
        </section>

        <FranchiseFaqBoard topics={faqTopicsOf('창업')} faqs={faqs} />

        <ApplyCta title="여기 없는 것이 궁금하시면">
          번호만 남겨 주시면 하루 안에 연락드립니다. 첫 통화에서는 아무것도 정하지 않습니다.
        </ApplyCta>
      </div>
    </FnbSiteShell>
  );
}
