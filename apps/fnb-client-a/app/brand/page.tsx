import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { FNB_BRAND, openStores } from '@winpilot/store';
import { Accent, FnbPageTitle, FnbSiteShell } from '@/app/_components/FnbSiteShell';
import { FNB_ROUTES } from '@/lib/navigation';

/**
 * Feature: `brand.detail` · F&B Client (템플릿 A) · route `/brand`
 *
 * ## 연혁 표를 두지 않았다
 * 회사 소개 화면에 흔히 `2019 법인 설립 · 2020 1호점 개점` 표가 선다. 그 표를 읽는 사람은 **투자자와
 * 기자**다. 외식 브랜드 사이트에 오는 사람은 손님 아니면 점주이고, 둘 다 연도가 아니라 **무엇을
 * 지키는 집인가**를 묻는다.
 *
 * 그래서 여기는 원칙 셋과 숫자 하나(매장 수)로 끝낸다. 연혁이 필요해지는 것은 상장을 준비하는
 * 때이고, 그때 필요한 것은 이 화면이 아니라 IR 템플릿이다.
 *
 * ## 원칙을 셋으로 고정한다
 * 다섯이 되면 하나하나가 덜 읽힌다. 넷째부터는 앞의 셋을 다시 말하는 문장이 되기 쉽고, 그러면
 * 전부가 광고 문구처럼 읽힌다.
 */
export const metadata: Metadata = { title: '브랜드 이야기' };

/**
 * 지키는 것 셋.
 *
 * 값을 store 에 두지 않은 이유: 이 셋은 어드민에서 고칠 값이 아니다. 바뀌면 브랜드가 바뀌는
 * 것이고, 그때는 화면도 함께 손본다. **고칠 수 있게 두면 고쳐진다** — 그리고 그 문장이 계절
 * 행사 문구로 덮이는 것을 막을 방법이 없다.
 */
const PRINCIPLES = [
  {
    no: '01',
    title: '그날 들어온 것만 그날 팝니다',
    body: '새벽 경매에서 문어를 받아 그날 다 씁니다. 남은 것으로 다음 날을 열지 않습니다 — 이 하나 때문에 매장 수를 천천히 늘려 왔습니다.',
  },
  {
    no: '02',
    title: '밥은 주문을 받고 담습니다',
    body: '미리 퍼 두면 십 분 만에 굳습니다. 나오는 데 조금 더 걸리는 대신, 앉은 자리에서 김이 오르는 밥을 드십니다.',
  },
  {
    no: '03',
    title: '안 되는 자리는 안 된다고 말합니다',
    body: '상권이 겹치면 열지 않습니다. 기존 점주의 매출이 먼저이기 때문이고, 그래서 창업 상담에서 거절이 실제로 나옵니다.',
  },
];

export default function BrandSettingsPage() {
  const open = openStores();

  return (
    <FnbSiteShell>
      <FnbPageTitle
        label="Brand"
        title={
          <>
            브랜드 <Accent>이야기</Accent>
          </>
        }
        description={FNB_BRAND.tagline}
      />

      <div className="flex flex-col gap-16">
        <section className="flex flex-col gap-6">
          <p className="max-w-3xl text-lg leading-relaxed lg:text-xl">
            {FNB_BRAND.foundedYear}년 군산 열 평짜리 가게에서 시작했습니다. 지금 {open.length}곳이
            있지만, 파는 것도 지키는 것도 그때와 같습니다.
          </p>
          <p className="max-w-3xl text-sm leading-loose text-ink-muted lg:text-base">
            문어는 재료가 하나라 숨길 데가 없는 음식입니다. 그래서 잘하는 방법도 하나뿐입니다 —
            매일 끓이고, 매일 다 쓰는 것.
          </p>
        </section>

        <section className="flex flex-col gap-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink-faint">지키는 것</h2>

          <ol className="flex flex-col gap-px overflow-hidden rounded-2xl border border-border bg-border">
            {PRINCIPLES.map((one) => (
              <li key={one.no} className="flex flex-col gap-3 bg-canvas px-6 py-7 sm:flex-row sm:gap-8 lg:px-8">
                <span className="shrink-0 font-mono text-sm tabular-nums text-ink-faint sm:w-16">{one.no}</span>
                <span className="flex min-w-0 flex-col gap-2">
                  <span className="text-base font-semibold lg:text-lg">{one.title}</span>
                  <span className="text-sm leading-loose text-ink-muted">{one.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col items-start gap-5 rounded-2xl bg-surface px-8 py-10 lg:px-10">
          <p className="text-xl font-bold tracking-tight lg:text-2xl">가까운 매장에서 드셔 보세요</p>
          <p className="max-w-2xl text-sm leading-loose text-ink-muted">
            지금 {open.length}곳에서 같은 문어를 씁니다. 여는 시간과 되는 것은 매장마다 다릅니다.
          </p>
          <a
            href={FNB_ROUTES.stores}
            className="group mt-1 flex w-fit items-center gap-2 rounded-full bg-night px-5 py-2.5 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-85"
          >
            매장 찾기
            <ArrowUpRight
              aria-hidden
              className="size-4 shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </section>
      </div>
    </FnbSiteShell>
  );
}
