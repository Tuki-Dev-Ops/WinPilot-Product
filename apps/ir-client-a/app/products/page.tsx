import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import {
  IR_COMPANY,
  SERVICE_DETAILS,
  SITE_SERVICES,
  publicSolutions,
  siteServiceHref,
} from '@winpilot/store';
import { IrSiteShell } from '@/app/_components/IrSiteShell';
import { PageHero } from '@/app/_components/PageHero';
import { SectionHead } from '@/app/solutions/_components/SectionHead';
import { IR_ROUTES } from '@/lib/navigation';

/**
 * Feature: `product.list` · IR Client (템플릿 A) · route `/products`
 *
 * ## 헤더의 SOLUTION 이 여기로 온다
 * 한동안 이 화면은 **어느 메뉴에서도 닿지 않았다.** PRODUCT 갈래를 감추면서 길이 홈과 404
 * 화면에만 남았는데, 화면은 살아 있고 길은 없는 상태가 가장 나쁘다 — 고치는 사람이 이 화면이
 * 도는 줄 모른다. 지금은 갈래 이름(SOLUTION)을 누르면 여기로 온다.
 *
 * 그래서 절 제목이 솔루션 상세와 같은 모양이다(`SectionHead`). 여기서 상세로 넘어가는 동안
 * 제목의 생김새가 바뀌면 다른 사이트로 건너간 것처럼 읽힌다.
 *
 * ## `준비중` 한 장이었다
 * 전에는 이 화면에 "제품별 소개는 준비 중" 한 줄과 솔루션으로 보내는 단추만 있었다. 그런데
 * 헤더의 PRODUCT 갈래와 홈의 인프라·DXP 카드가 **전부 여기로 왔다** — 들어온 사람이 가장 많은
 * 화면이 가장 비어 있었던 셈이다. 지금은 여섯이 다 자기 화면을 가져 그 쏠림이 없어졌고,
 * 여기는 **무엇을 파는지 한눈에 훑는 자리**로 남았다.
 *
 * ## 배너 제목이 `제품 · 서비스` 다
 * 기능 이름은 `ir.product.list` 이고 사전의 자원도 `product` 다. 그런데 이 화면에는 **사람이
 * 하는 일 둘**이 함께 서 있어서, 배너에 `제품` 만 적으면 아래 절 둘 중 하나가 제목에서 빠진다.
 *
 * 그렇다고 자원 이름을 `솔루션` 으로 바꾸지 않는다 — 사전이 두 벌이 되고, 그때 어드민과 사이트가
 * 같은 것을 다른 이름으로 부른다. 바꾸는 것은 **사람이 읽는 제목 한 줄**뿐이다.
 *
 * ## 두 묶음으로 나눈다
 * 파는 것이 성격으로 갈린다. **클라우드 제품**(MES·ERP·CRM·DXP)은 계약하면 그날부터 쓰는
 * 것이고, **서비스**(컨설팅·인프라)는 사람이 붙어서 하는 일이다. 한 목록에 섞으면 "컨설팅을
 * 몇 카피 사면 되나" 같은 물음이 생긴다.
 *
 * 클라우드 제품에만 사진을 붙인다 — 사람이 하는 일에 사진을 붙이면 그 사진이 결과물처럼 읽힌다.
 *
 * ## 어드민 연동
 * - 제품 ← `@winpilot/store` 의 `SOLUTIONS` (IR 어드민 제품 · 문제 · 해법)
 * - 서비스 카드의 말 ← 같은 store 의 `SITE_SERVICES` (홈 무대 차례)
 * - 어느 것이 서비스인가 ← 같은 store 의 `SERVICE_DETAILS` (서비스 목록)
 */
export const metadata: Metadata = { title: `제품 — ${IR_COMPANY.name}` };

/**
 * 홈 카드 여섯 중 **사람이 붙어서 하는 일** 둘 — 아래 서비스 묶음으로 내려간다.
 *
 * 어느 것이 서비스인지를 여기에 이름으로 적어 두지 않는다. 한때 `['consulting', 'infra']` 를
 * 적어 두었는데, 그러면 서비스가 셋이 되는 날 **이 화면만 조용히 둘을 세운다** — 목록이 짧아진
 * 것은 빠뜨렸다는 표시가 아니라 그냥 짧은 목록으로 보인다. 무엇이 서비스인지는 store 가 안다.
 */
const SERVICE_CARDS = SITE_SERVICES.filter((card) =>
  SERVICE_DETAILS.some((one) => one.id === card.id),
);

export default function ProductListPage() {
  return (
    <IrSiteShell hero={<PageHero title="제품 · 서비스" image="/hero/products.jpg" />}>

      <section className="flex flex-col gap-8">
        <SectionHead
          no="01"
          title="클라우드 제품"
          lead="계약하면 그날부터 쓰는 것들입니다. 넷 다 같은 데이터를 나눠 보므로, 하나만 먼저 들이고 나중에 붙여도 됩니다."
        />

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
                  <Image
                    src={`/solutions/${one.id}.jpg`}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
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

      <section className="flex flex-col gap-8">
        <SectionHead
          no="02"
          title="서비스"
          lead="사람이 현장에 붙어서 하는 일입니다. 무엇을 도입할지 정하는 일과, 도입한 뒤에 계속 도는지 보는 일입니다."
        />

        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          {SERVICE_CARDS.map((one) => (
            <li key={one.id}>
              {/*
                둘 다 이제 자기 상세 화면을 갖는다. 전에는 글만 서 있었는데, 그때는 화면이
                없었기 때문이다 — 화면이 생긴 뒤로도 길을 내지 않으면 **여기까지 온 사람만**
                그 화면을 못 본다.
              */}
              <a
                href={siteServiceHref(one)}
                className="group flex h-full flex-col gap-3 bg-canvas px-6 py-6 transition-colors duration-150 hover:bg-surface"
              >
                <span className="flex items-baseline gap-3">
                  <span className="font-mono text-xs tabular-nums text-ink-faint">{one.no}</span>
                  <span className="text-base font-semibold">{one.name}</span>
                </span>
                {one.body.map((line) => (
                  <span key={line} className="block text-sm leading-relaxed text-ink-muted">
                    {line}
                  </span>
                ))}
                <span className="mt-auto flex items-center gap-1.5 pt-2 text-xs font-bold uppercase tracking-widest">
                  자세히 보기
                  <ArrowUpRight
                    aria-hidden
                    className="size-3.5 shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </a>
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
