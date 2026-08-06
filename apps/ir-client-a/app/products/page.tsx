import type { Metadata } from 'next';
import { IR_COMPANY } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { IR_ROUTES } from '@/lib/navigation';

/**
 * Feature: `product.list` · IR Client (템플릿 A) · route `/products`
 *
 * ## 준비 중인 화면을 어떻게 두는가
 * 빈 화면을 두지 않고 **언제 · 무엇이 열리는지**를 적는다. 그냥 비워 두면 들어온 사람은
 * 사이트가 고장 난 것으로 읽고, 그 뒤로는 다른 메뉴도 눌러 보지 않는다.
 *
 * 대신 지금 볼 수 있는 곳으로 보낸다 — 제품이 궁금해 들어온 사람이 가장 가까이 볼 수 있는
 * 것이 솔루션 소개다.
 */
export const metadata: Metadata = { title: `제품 — ${IR_COMPANY.name}` };

export default function ProductListPage() {
  return (
    <IrSiteShell>
      <IrPageTitle title="제품" description="개별 제품 소개는 준비 중입니다." />

      <section className="flex flex-col items-start gap-4 rounded-xl border border-border px-6 py-10">
        <span className="rounded-full bg-surface px-3 py-1 text-xs text-ink-muted">준비중</span>
        <p className="text-sm leading-relaxed text-ink-muted">
          제품별 소개 화면을 준비하고 있습니다. 그동안 어떤 문제를 어떻게 푸는지는 솔루션에서 보실 수
          있고, 도입을 검토 중이시면 문의를 남겨 주세요.
        </p>

        <div className="flex flex-wrap gap-3">
          <a
            href={IR_ROUTES.mes}
            className="flex h-11 shrink-0 items-center rounded-lg bg-brand-500 px-6 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-600"
          >
            솔루션 보기
          </a>
          <a
            href={IR_ROUTES.contact}
            className="flex h-11 shrink-0 items-center rounded-lg border border-border-strong px-6 text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint"
          >
            문의하기
          </a>
        </div>
      </section>
    </IrSiteShell>
  );
}
