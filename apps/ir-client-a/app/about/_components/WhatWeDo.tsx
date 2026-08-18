import type { LucideIcon } from 'lucide-react';

/**
 * 무엇을 하는 회사인가 — **하는 일 넷을 카드로**.
 *
 * ## 회사 소개에 이 칸이 없으면 무엇이 빠지나
 * 이 화면은 사진 한 장과 문장 하나, 그리고 기업정보 카드로 이뤄져 있었다. 그 셋은 **누구인가**에
 * 답하지만 **무엇을 하는가**에는 답하지 않는다 — 회사명·대표·설립일을 아무리 잘 적어도 이 회사가
 * 공장에 무엇을 해 주는 곳인지는 알 수 없다.
 *
 * 이 업계의 회사 소개 화면들을 훑어보면 그 자리가 거의 항상 있다. 이름은 제각각이지만(하는 일 ·
 * 사업 영역 · Capabilities) 담는 것은 같다 — **파는 것을 갈래로 묶어 서넛으로 줄인 것.**
 *
 * ## 파는 것 목록을 그대로 옮기지 않는다
 * 헤더의 SOLUTION 펼침에 이미 여섯이 서 있고, 제품 화면이 그 여섯을 카드로 늘어놓는다. 여기서
 * 같은 여섯을 또 늘어놓으면 **세 곳이 같은 목록을 갖는다.**
 *
 * 그래서 여기는 **묶어서 넷**이다. 여섯 중 무엇을 파는지가 아니라 **어떤 일을 하는 회사인지**를
 * 말하는 자리라, 제품이 하나 늘어도 이 넷은 그대로다.
 *
 * ## 값이 아니라 화면이 든다
 * 넷 다 `store` 에 두지 않았다. 어드민에서 고칠 수 있게 두면 계절 행사 문구가 이 자리에 서는
 * 날이 오고, 그때 회사 소개가 광고판이 된다. 파는 것이 바뀌면 코드를 고친다 — 그 정도로 드물게
 * 바뀌는 값이다.
 */
export type Capability = { title: string; body: string; icon: LucideIcon };

export function WhatWeDo({ label, headline, items }: { label: string; headline: string; items: Capability[] }) {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">{label}</p>
        <h2 className="max-w-3xl text-2xl font-bold leading-[1.4] tracking-tight lg:text-3xl">{headline}</h2>
      </div>

      {/*
        넷을 한 줄에 세운다. 셋으로 두면 마지막 하나가 다음 줄에 홀로 서고, 그 칸만 다른 무게로
        읽힌다 — 넷은 서로 우열이 없는 갈래다.
      */}
      <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {items.map((one) => (
          <li key={one.title} className="flex flex-col gap-4 bg-canvas px-6 py-7">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <one.icon aria-hidden className="size-5" strokeWidth={1.6} />
            </span>
            <p className="text-base font-bold tracking-tight">{one.title}</p>
            <p className="text-sm leading-relaxed text-ink-muted">{one.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
