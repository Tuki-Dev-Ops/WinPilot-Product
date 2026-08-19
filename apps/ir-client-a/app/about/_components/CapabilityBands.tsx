import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Reveal } from '@/app/_components/Reveal';

/**
 * 셋째 칸 — **사진 왼쪽 절반, 글 오른쪽 절반**을 넷 이어 붙인다.
 *
 * ## 카드 격자를 밴드로 바꿨다
 * 같은 넷이 한때 작은 카드 넷이었다(`WhatWeDo`). 한 줄에 나란히 서니 **아이콘 넷과 세 줄짜리
 * 설명 넷**이 되어, 훑는 눈에는 넷 다 같은 것으로 보였다. 회사가 하는 일을 말하는 자리인데
 * 사양표처럼 읽혔다.
 *
 * 하나씩 화면 절반을 쓰게 하면 **하나를 볼 때 다른 셋이 눈에 없다.** 사진이 절반을 차지하니
 * 넷이 서로 다른 것이라는 것도 사진으로 먼저 전해진다.
 *
 * ## 사진이 화면 끝까지 닿는다
 * 좌우 여백 안에 두면 사진이 가운데 상자로 남아 카드가 커진 것에 그친다. 왼쪽 끝까지 닿아야
 * **화면을 반으로 나눈 것**이 되고, 그때 오른쪽 글이 사진의 설명이 아니라 나란한 짝이 된다.
 *
 * 그래서 이 칸은 껍데기의 `after` 슬롯에 선다 — 본문(`main`)은 너비가 묶여 있어, 그 안에서는
 * 음수 여백으로도 `max-w-320` 을 벗어나지 못한다.
 *
 * ## 넷 다 사진 왼쪽이다
 * 지그재그로 엇갈리게 두는 방법도 있다. 그러지 않은 이유: 엇갈리면 **글이 시작하는 자리가
 * 번갈아 바뀌어** 읽는 눈이 매번 다시 찾는다. 사진이 늘 왼쪽이면 글은 늘 같은 자리에서 시작한다.
 *
 * ## 사진이 정사각이다
 * 세로로 긴 사진을 쓰면 오른쪽 글이 그 높이를 따라가느라 가운데에 떠 있고, 위아래로 흰 여백이
 * 길게 남는다. 정사각이면 **왼쪽 절반과 오른쪽 절반이 같은 크기**가 되어 둘이 나란한 짝으로
 * 읽힌다 — 사진이 배경이 아니라 절반이라는 것이 크기로 전해진다.
 *
 * ## 한 밴드가 화면 하나를 쓴다
 * 넷을 이어 붙이면 스크롤 한 번에 두 개가 반씩 보이는 자리가 생긴다. 그때 눈은 **위 밴드의
 * 글과 아래 밴드의 사진**을 같은 화면에서 보게 되어 둘이 한 짝처럼 읽힌다.
 *
 * 화면 높이를 꽉 채우면 스크롤이 멈추는 자리마다 밴드 하나가 통째로 선다. 넷을 나눠 놓은
 * 뜻이 그때 지켜진다.
 *
 * 좁은 화면에서는 채우지 않는다 — 세로로 접히면서 사진과 글이 위아래로 서는데, 거기서
 * 높이까지 채우면 사진 한 장을 보려고 한 번, 글을 보려고 또 한 번 굴려야 한다.
 *
 * ## 닿았을 때 나타난다
 * 글이 처음부터 서 있으면 사진만 바뀌는 것으로 보인다. 스크롤해서 닿았을 때 아래에서 올라오면
 * **새 칸이 시작됐다**는 것이 움직임으로 전해진다.
 *
 * 사진에는 걸지 않는다. 사진까지 함께 나타나면 화면이 통째로 깜빡이는 것으로 보이고, 그때는
 * 페이지가 늦게 그려진 것과 구별되지 않는다.
 *
 * ## 큰 영문 한 낱말
 * 국문 제목을 크게 두면 그 아래 국문 설명과 같은 글자로 두 덩어리가 서서 어느 쪽이 제목인지가
 * 흐려진다. 영문 한 낱말은 글자 모양부터 달라 **크기를 재지 않아도** 제목으로 읽힌다.
 */
export type Capability = { name: string; body: string; image: string; href: string; more: string };

export function CapabilityBands({ items }: { items: Capability[] }) {
  return (
    <div className="flex flex-col border-t border-border">
      {items.map((one) => (
        <section key={one.name} className="grid grid-cols-1 border-b border-border lg:min-h-dvh lg:grid-cols-2">
          {/*
            `fill` 은 자리를 잡아 주는 부모가 있어야 한다. 정사각 비율을 그 부모가 들고,
            사진은 그 안을 채운다 — 사진에 비율을 직접 걸면 `fill` 이 무시된다.
          */}
          <span className="relative block aspect-square w-full overflow-hidden lg:aspect-auto lg:h-full">
            <Image
              src={one.image}
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </span>

          <div className="flex flex-col justify-center px-6 py-14 lg:px-16 lg:py-20 xl:px-24">
            <Reveal className="flex flex-col gap-7">
              <p className="max-w-md text-5xl font-light leading-[1.1] tracking-tight lg:text-6xl">{one.name}</p>
              <p className="max-w-lg text-sm leading-loose text-ink-muted lg:text-base">{one.body}</p>

              {/*
                `VIEW MORE` 는 글자와 동그란 화살표 둘로 이뤄진다. 화살표만 두면 눌러야 하는
                것인지가 그림에만 남고, 글자만 두면 본문 링크와 구별되지 않는다.
              */}
              <a href={one.href} className="group mt-2 flex w-fit items-center gap-3 text-xs font-bold tracking-widest">
                {one.more}
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-canvas transition-transform duration-150 group-hover:translate-x-0.5">
                  <ArrowRight aria-hidden className="size-3.5" strokeWidth={2.2} />
                </span>
              </a>
            </Reveal>
          </div>
        </section>
      ))}
    </div>
  );
}
