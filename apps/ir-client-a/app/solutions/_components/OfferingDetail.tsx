import { ArrowUpRight, Check } from 'lucide-react';
import { SectionHead } from './SectionHead';
import type { Offering } from '@winpilot/store';
import { IR_ROUTES } from '@/lib/navigation';

/**
 * 파는 것 하나의 상세 — **여섯이 같은 차례로 선다.**
 *
 * 클라우드 제품 넷(MES · ERP · CRM · DXP)과 사람이 붙는 일 둘(스마트 컨설팅 · 인프라 서비스)이
 * 이 한 벌을 나눠 쓴다. 값의 모양도 하나다(`Offering`) — 왜 하나로 묶었는지는 그쪽 머리말에 있다.
 *
 * ## 왜 화면마다 따로 짜지 않는가
 * 전에는 세 화면이 각자 `문제 → 방법 → 성과` 세 문단만 갖고 있었고, 그마저 파일이 셋이었다.
 * 하나가 늘 때마다 같은 뼈대를 다시 짜야 하고, 한 화면에만 절차를 더하면 **모양이 갈린다** —
 * 검토하는 사람은 여러 화면을 나란히 열어 놓고 보므로 그 차이가 바로 눈에 띈다.
 *
 * ## 차례를 이렇게 둔 이유
 * 국내외 제조 솔루션 소개 화면들을 보면 대개 **기능부터** 늘어놓는다. 그러면 읽는 사람이 스무
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
 * ## 절 제목을 한글로 크게 세운다
 * 전에는 칸마다 `주요 기능` 이 12px 짜리 영문 대문자 라벨로 서 있었다. 개발 문서에서는 그 크기가
 * 맞는데, **고객사 담당자가 읽는 회사 홈페이지**에서는 절이 서지 않는다 — 스크롤을 내리다
 * 멈춰서 "여기가 무슨 칸이지" 를 다시 읽게 된다.
 *
 * 국내 제조 솔루션 소개 화면(한화시스템 스마트팩토리 같은)들이 공통으로 하는 것이 그것이다.
 * 절마다 **번호 · 한글 제목 · 한 줄 설명**을 세워 그 칸이 무엇에 답하는지를 먼저 말한다.
 *
 * ## 어두운 칸을 둘 둔다 — 처음과 끝
 * 흰 카드만 열 개를 쌓으면 어디까지 읽었는지가 사라지고, 스크롤이 길어질수록 그 값이 커진다.
 * 여기서는 **문제**와 **문의**를 어둡게 둔다. 그 둘이 이 화면의 시작과 끝이고, 사이의 밝은
 * 칸들은 "그래서 어떻게" 를 설명하는 자리다.
 *
 * ## 숫자를 지어내지 않는다
 * 같은 업계 화면들은 대개 `가동률 20% 향상` 같은 숫자 띠를 갖는다. 여기에는 두지 않았다 —
 * 그 숫자는 **고객사마다 다른 값**이고, 우리 값(`Offering`)에는 그런 칸 자체가 없다. 자리를
 * 채우려고 지어낸 수는 계약 자리에서 근거를 물었을 때 답할 것이 없다.
 *
 * 대신 **이미 적어 둔 것을 세어** 맨 위에 올린다. 기능 수 · 붙는 층 수 · 절차 단계 · 업종 수
 * 넷은 전부 아래 칸들이 실제로 그리는 값이라, 늘거나 줄면 이 줄도 함께 움직인다.
 */
export function OfferingDetail({ offering }: { offering: Offering }) {
  return (
    <div className="flex flex-col gap-20">
      {/*
        문제를 어두운 판에 큰 글씨로 둔다. 이 칸 하나가 **읽을지 말지**를 정하므로, 아래 본문과
        같은 바탕에 같은 크기로 두면 그냥 첫 문단이 되어 지나쳐진다.
      */}
      <section className="flex flex-col gap-6 rounded-2xl bg-night px-8 py-12 text-white lg:px-14 lg:py-16">
        <p className="text-xs font-bold uppercase tracking-widest text-white/40">Challenge</p>
        <p className="max-w-3xl text-xl font-semibold leading-[1.65] tracking-tight lg:text-[1.75rem]">
          {offering.problem}
        </p>
        <p className="max-w-3xl text-sm leading-loose text-white/60 lg:text-base">{offering.approach}</p>

        {/*
          한눈에 보는 줄. 검토하는 사람이 맨 먼저 재는 것이 **규모**라, 아래를 다 읽기 전에
          그 크기를 먼저 준다. 넷 다 아래 칸이 실제로 그리는 것을 센 값이다.
        */}
        <dl className="mt-3 flex flex-wrap gap-x-12 gap-y-5 border-t border-white/10 pt-7">
          <Glance label="주요 기능" value={`${offering.features.length}가지`} />
          <Glance label="구성 층" value={`${offering.layers.length}층`} />
          <Glance label="도입 절차" value={`${offering.steps.length}단계`} />
          <Glance label="적용 업종" value={`${offering.industries.length}개`} />
        </dl>
      </section>

      <section className="flex flex-col gap-8">
        <SectionHead no="01" title="주요 기능" lead="현장에서 실제로 하는 일입니다." />
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {offering.features.map((one, index) => (
            <li
              key={one.title}
              className="flex flex-col gap-3 rounded-2xl border border-border px-7 py-7 transition-colors duration-150 hover:border-border-strong"
            >
              {/*
                번호를 붙인다. 기능이 여섯을 넘어가면 어디까지 읽었는지가 사라지는데, 카드가
                격자로 접히면서 읽는 차례가 화면 너비마다 달라지기 때문이다.
              */}
              <span className="font-mono text-xs tabular-nums text-brand-700">{`0${index + 1}`}</span>
              <p className="text-lg font-bold tracking-tight">{one.title}</p>
              <p className="text-sm leading-loose text-ink-muted">{one.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/*
        구성도를 그림 대신 **층 목록**으로 둔다. 그림으로 그리면 좁은 화면에서 글자가 뭉개지고,
        층이 하나 늘 때마다 그림을 다시 그려야 한다.

        아래에서 위로 쌓인다(`flex-col-reverse`) — 설비가 맨 아래, 사람이 보는 화면이 맨 위다.
      */}
      <section className="flex flex-col gap-8">
        <SectionHead no="02" title="시스템 구성" lead="아래에서 위로, 어느 층에서 무엇이 이뤄지는지입니다." />

        <ol className="relative flex flex-col-reverse rounded-2xl bg-surface px-6 py-6 lg:px-10 lg:py-8">
          {/*
            기둥을 **목록에 한 번** 긋는다. 항목마다 그었더니 줄마다 선이 자기 높이만큼만 서서
            토막으로 끊겼다 — 이어져 쌓인다는 것을 말하려던 선이 오히려 끊긴 칸으로 읽혔다.

            위아래를 점 자리만큼 비워 첫 점 위와 끝 점 아래로 선이 삐져나가지 않게 한다.
          */}
          <span
            aria-hidden
            className="absolute bottom-14 left-8 top-14 w-px -translate-x-1/2 bg-border-strong lg:left-12"
          />

          {offering.layers.map((one, index) => (
            <li key={one.name} className="relative flex gap-5">
              <span aria-hidden className="flex w-4 shrink-0 justify-center">
                <span className="mt-6 size-3 shrink-0 rounded-full bg-brand-500 ring-4 ring-surface" />
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-5 sm:flex-row sm:items-baseline sm:gap-8">
                <span className="flex shrink-0 items-baseline gap-3 sm:w-48">
                  <span className="font-mono text-xs tabular-nums text-ink-faint">{`0${index + 1}`}</span>
                  <span className="text-lg font-bold tracking-tight">{one.name}</span>
                </span>
                <span className="min-w-0 text-sm leading-loose text-ink-muted">{one.desc}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-8">
        <SectionHead no="03" title="도입 효과" lead="쓰기 시작하면 무엇이 달라지는지 적었습니다." />
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {offering.outcomes.map((one) => (
            <li key={one} className="flex flex-col gap-5 rounded-2xl bg-brand-50 px-7 py-8">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
                <Check aria-hidden className="size-4" strokeWidth={2.6} />
              </span>
              <p className="text-base font-semibold leading-relaxed">{one}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-8">
        <SectionHead no="04" title="적용 업종" lead="아래 업종의 현장을 기준으로 준비했습니다." />
        <ul className="flex flex-wrap gap-2.5">
          {offering.industries.map((one) => (
            <li key={one} className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink-muted">
              {one}
            </li>
          ))}
        </ul>
      </section>

      {/*
        절차마다 **기간**을 함께 적는다. 절차만 적으면 "얼마나 걸리나" 가 그대로 문의로 남는데,
        그 물음이 도입 검토에서 가장 먼저 나온다.

        넷이 가로로 설 때 사이에 선을 그어 **이어지는 일**임을 보인다 — 카드만 늘어놓으면 넷 중
        아무거나 고르는 것처럼 읽힌다. 좁은 화면에서는 그 선을 감춘다(세로로 쌓이면 선이 카드
        옆구리에 붙어 어디로도 가지 않는다).
      */}
      <section className="flex flex-col gap-8">
        <SectionHead no="05" title="도입 절차" lead="현장을 먼저 보고, 한 라인에서 시작해 넓혀 갑니다." />
        <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {offering.steps.map((one, index) => (
            <li key={one.name} className="relative flex flex-col gap-3 rounded-2xl border border-border px-6 py-6">
              {index < offering.steps.length - 1 && (
                <span aria-hidden className="absolute -right-5 top-10 hidden h-px w-5 bg-border lg:block" />
              )}
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-xs font-bold tabular-nums text-brand-700">{`STEP ${index + 1}`}</span>
                <span className="rounded-full bg-surface px-3 py-1 font-mono text-xs tabular-nums text-ink-muted">
                  {one.period}
                </span>
              </span>
              <span className="text-lg font-bold tracking-tight">{one.name}</span>
              <span className="text-sm leading-loose text-ink-muted">{one.desc}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col items-start gap-5 rounded-2xl bg-night px-8 py-12 text-white lg:px-14 lg:py-16">
        {/*
          이름을 `title` 에서 그대로 가져온다. 전에는 `Cloud ${name}` 을 만들어 썼는데, 서비스가
          이 화면을 함께 쓰게 되면서 **Cloud 스마트 컨설팅**이 될 뻔했다.
        */}
        <p className="text-2xl font-bold tracking-tight lg:text-3xl">{offering.title} 도입을 검토하고 계신가요</p>
        <p className="max-w-2xl text-sm leading-loose text-white/60 lg:text-base">
          지금 쓰고 계신 방식과 설비를 먼저 살펴봅니다. 무엇을 도입할지보다 어디부터 손대야 하는지를 정하는 것이 첫
          단계입니다.
        </p>
        <a
          href={IR_ROUTES.contact}
          className="group mt-2 flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-night transition-opacity duration-150 hover:opacity-85"
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

/** 한눈에 보는 줄의 한 칸. 값에서 **세거나 합친 것**만 선다 — 지어낸 수는 두지 않는다. */
function Glance({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="font-mono text-xl font-bold tabular-nums tracking-tight">{value}</dd>
    </div>
  );
}
