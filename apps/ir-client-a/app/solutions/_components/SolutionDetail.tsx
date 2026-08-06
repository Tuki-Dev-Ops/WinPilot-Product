import { ArrowUpRight } from 'lucide-react';
import type { Solution } from '@winpilot/store';
import { IR_ROUTES } from '@/lib/navigation';

/**
 * 솔루션 상세 한 벌 — **ERP · MES · CRM 이 같은 차례로 선다.**
 *
 * ## 왜 화면마다 따로 짜지 않는가
 * 전에는 세 화면이 각자 `문제 → 방법 → 성과` 세 문단만 갖고 있었고, 그마저 파일이 셋이었다.
 * 솔루션이 늘 때마다 같은 뼈대를 다시 짜야 하고, 한 화면에만 절차를 더하면 **셋의 모양이
 * 갈린다** — 검토하는 사람은 세 화면을 나란히 열어 놓고 보므로 그 차이가 바로 눈에 띈다.
 *
 * ## 차례를 이렇게 둔 이유
 * 국내 제조 솔루션 소개 화면들을 보면 대개 **기능부터** 늘어놓는다. 그러면 읽는 사람이 스무
 * 개 이름 중에서 자기 문제를 찾아야 한다. 여기서는 뒤집어 둔다.
 *
 * | 칸 | 답하는 물음 |
 * |---|---|
 * | 문제 | 지금 무엇이 불편한가 — **내 이야기인가** |
 * | 기능 | 그걸 어떻게 푸는가 |
 * | 구성 | 우리 설비·시스템과 **어디서 붙는가** |
 * | 성과 | 그래서 무엇이 달라지는가 |
 * | 업종 | 우리 같은 곳이 쓰는가 |
 * | 절차 | 얼마나 걸리는가 |
 * | 문의 | 다음에 무엇을 하면 되는가 |
 *
 * 업종과 절차를 뒤에 두는 것은 **검토가 거기까지 온 사람만** 보는 값이기 때문이다. 앞에 두면
 * 아직 필요를 못 느낀 사람에게 기간부터 들이미는 셈이 된다.
 *
 * ## 어드민 연동
 * - 값의 원본은 `@winpilot/store` 의 `SOLUTIONS` — IR 어드민 홈페이지 > 솔루션이 고친다.
 */
export function SolutionDetail({ solution }: { solution: Solution }) {
  return (
    <div className="flex flex-col gap-14">
      {/*
        문제를 큰 글씨로 둔다. 이 칸 하나가 **읽을지 말지**를 정하므로, 아래 본문과 같은 크기로
        두면 그냥 첫 문단이 되어 지나쳐진다.
      */}
      <section className="flex flex-col gap-4">
        <SectionLabel>이런 어려움이 있으신가요</SectionLabel>
        <p className="max-w-3xl text-lg leading-relaxed lg:text-xl">{solution.problem}</p>
        <p className="max-w-3xl text-sm leading-loose text-ink-muted lg:text-base">{solution.approach}</p>
      </section>

      <section className="flex flex-col gap-6">
        <SectionLabel>주요 기능</SectionLabel>
        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          {solution.features.map((one) => (
            <li key={one.title} className="flex flex-col gap-2 bg-canvas px-6 py-5">
              <p className="text-sm font-semibold">{one.title}</p>
              <p className="text-sm leading-relaxed text-ink-muted">{one.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/*
        구성도를 그림 대신 **층 목록**으로 둔다. 그림으로 그리면 좁은 화면에서 글자가 뭉개지고,
        층이 하나 늘 때마다 그림을 다시 그려야 한다. 아래에서 위로 쌓이는 차례는 번호가 말한다.
      */}
      <section className="flex flex-col gap-6">
        <SectionLabel>시스템 구성</SectionLabel>
        <ol className="flex flex-col-reverse gap-px overflow-hidden rounded-xl border border-border bg-border">
          {solution.layers.map((one, index) => (
            <li key={one.name} className="flex flex-col gap-1 bg-canvas px-6 py-5 sm:flex-row sm:items-baseline sm:gap-6">
              <span className="flex shrink-0 items-baseline gap-3 sm:w-40">
                <span className="font-mono text-xs tabular-nums text-ink-faint">{`0${index + 1}`}</span>
                <span className="text-sm font-semibold">{one.name}</span>
              </span>
              <span className="min-w-0 text-sm leading-relaxed text-ink-muted">{one.desc}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-6">
        <SectionLabel>도입 효과</SectionLabel>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {solution.outcomes.map((one) => (
            <li key={one} className="rounded-xl bg-surface px-6 py-6 text-base font-medium leading-relaxed">
              {one}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <SectionLabel>적용 업종</SectionLabel>
        <ul className="flex flex-wrap gap-2">
          {solution.industries.map((one) => (
            <li key={one} className="rounded-full border border-border px-4 py-2 text-sm text-ink-muted">
              {one}
            </li>
          ))}
        </ul>
      </section>

      {/*
        절차마다 **기간**을 함께 적는다. 절차만 적으면 "얼마나 걸리나" 가 그대로 문의로 남는데,
        그 물음이 도입 검토에서 가장 먼저 나온다.
      */}
      <section className="flex flex-col gap-6">
        <SectionLabel>도입 절차</SectionLabel>
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {solution.steps.map((one, index) => (
            <li key={one.name} className="flex flex-col gap-2 rounded-xl border border-border px-5 py-5">
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-xs tabular-nums text-ink-faint">{`STEP ${index + 1}`}</span>
                <span className="rounded-full bg-surface px-2.5 py-1 font-mono text-xs tabular-nums text-ink-muted">
                  {one.period}
                </span>
              </span>
              <span className="text-sm font-semibold">{one.name}</span>
              <span className="text-sm leading-relaxed text-ink-muted">{one.desc}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col items-start gap-5 rounded-2xl bg-night px-8 py-10 text-white lg:px-10 lg:py-12">
        <p className="text-xl font-bold tracking-tight lg:text-2xl">
          Cloud {solution.name} 도입을 검토 중이신가요
        </p>
        <p className="max-w-2xl text-sm leading-loose text-white/60">
          지금 쓰시는 방식과 설비를 먼저 봅니다. 무엇을 도입할지가 아니라 어디부터 손대야 하는지를
          정하는 것이 첫 단계입니다.
        </p>
        <a
          href={IR_ROUTES.contact}
          className="group mt-1 flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-night transition-opacity duration-150 hover:opacity-85"
        >
          도입 문의하기
          <ArrowUpRight
            aria-hidden
            className="size-4 shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      </section>
    </div>
  );
}

/** 칸 이름. 본문과 층이 갈리게 작고 흐리게 둔다 — 크게 두면 칸마다 제목이 경쟁한다. */
function SectionLabel({ children }: { children: string }) {
  return <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">{children}</p>;
}
