import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { IR_COMPANY, SITE_SERVICES, publicSolutions } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { IR_ROUTES } from '@/lib/navigation';

/**
 * Feature: `product.list` · IR Client (템플릿 A) · route `/products`
 *
 * ## `준비중` 한 장이었다
 * 전에는 이 화면에 "제품별 소개는 준비 중" 한 줄과 솔루션으로 보내는 단추만 있었다. 그런데
 * 헤더의 PRODUCT 갈래와 서비스 칸의 인프라·DXP 가 **전부 여기로 온다** — 들어온 사람이 가장
 * 많은 화면이 가장 비어 있었던 셈이다.
 *
 * ## 두 묶음으로 나눈다
 * 파는 것이 성격으로 갈린다. **클라우드 제품**(MES·ERP·CRM·DXP)은 계약하면 그날부터 쓰는
 * 것이고, **서비스**(컨설팅·인프라)는 사람이 붙어서 하는 일이다. 한 목록에 섞으면 "컨설팅을
 * 몇 카피 사면 되나" 같은 물음이 생긴다.
 *
 * 클라우드 제품에만 사진을 붙인다 — 사람이 하는 일에 사진을 붙이면 그 사진이 결과물처럼 읽힌다.
 *
 * ## 어드민 연동
 * - 제품 ← `@winpilot/store` 의 `SOLUTIONS` (IR 어드민 홈페이지 > 솔루션)
 * - 서비스 ← 같은 store 의 `SITE_SERVICES` (홈페이지 > 서비스)
 */
export const metadata: Metadata = { title: `제품 — ${IR_COMPANY.name}` };

/** 제품이 아니라 **사람이 붙어서 하는 일**. 아래 서비스 묶음으로 내려간다. */
const SERVICE_IDS = ['consulting', 'infra'];

export default function ProductListPage() {
  const services = SITE_SERVICES.filter((one) => SERVICE_IDS.includes(one.id));

  return (
    <IrSiteShell>
      <IrPageTitle
        title="제품"
        description="현장에서 자재까지, 고객이 만나는 화면까지 — 하나의 데이터 위에서 돕니다."
      />

      <section className="flex flex-col gap-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-ink-faint">클라우드 제품</h2>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {publicSolutions().map((one) => (
            <li key={one.id}>
              <a
                href={one.href}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border transition-colors duration-150 hover:border-ink-faint"
              >
                {/*
                  사진을 카드 위쪽에 **가로로 눕혀** 둔다. 홈의 세로 카드와 같은 사진이지만
                  여기서는 넷이 나란히 서므로, 세로로 두면 목록이 화면 두 배로 길어진다.
                */}
                <span className="relative block aspect-[16/7] w-full overflow-hidden bg-night">
                  <img src={`/solutions/${one.id}.jpg`} alt="" className="size-full object-cover" />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,6,13,0.85)_0%,rgba(5,6,13,0.2)_60%,transparent_100%)]"
                  />
                  <span className="absolute bottom-4 left-5 text-base font-semibold tracking-tight text-white">
                    Cloud {one.name}
                  </span>
                </span>

                <span className="flex flex-1 flex-col gap-3 px-6 py-5">
                  <span className="text-base font-semibold">{one.tagline}</span>
                  <span className="text-sm leading-relaxed text-ink-muted">{one.approach}</span>

                  {/* 기능은 **이름 넷만.** 여기서 고르는 사람에게 필요한 것은 무엇을 하는 것인가까지다. */}
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    {one.features.map((feature) => (
                      <span key={feature.title} className="rounded-full bg-surface px-2.5 py-1 text-xs text-ink-muted">
                        {feature.title}
                      </span>
                    ))}
                  </span>

                  <span className="mt-auto flex items-center gap-1.5 pt-3 text-xs font-bold uppercase tracking-widest">
                    자세히 보기
                    <ArrowUpRight
                      aria-hidden
                      className="size-3.5 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-ink-faint">서비스</h2>

        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          {services.map((one) => (
            <li key={one.id} className="flex flex-col gap-3 bg-canvas px-6 py-6">
              <span className="flex items-baseline gap-3">
                <span className="font-mono text-xs tabular-nums text-ink-faint">{one.no}</span>
                <span className="text-base font-semibold">{one.name}</span>
              </span>
              {one.body.map((line) => (
                <p key={line} className="text-sm leading-relaxed text-ink-muted">
                  {line}
                </p>
              ))}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col items-start gap-5 rounded-2xl bg-night px-8 py-10 text-white lg:px-10 lg:py-12">
        <p className="text-xl font-bold tracking-tight lg:text-2xl">무엇부터 손대야 할지 모르시겠다면</p>
        <p className="max-w-2xl text-sm leading-loose text-white/60">
          제품을 고르기 전에 현장을 먼저 봅니다. 설비·공정·인력의 지금을 데이터로 확인하고, 효과가 큰
          순서대로 단계를 나눠 제안드립니다.
        </p>
        <a
          href={IR_ROUTES.contact}
          className="group mt-1 flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-night transition-opacity duration-150 hover:opacity-85"
        >
          진단 문의하기
          <ArrowUpRight
            aria-hidden
            className="size-4 shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      </section>
    </IrSiteShell>
  );
}
