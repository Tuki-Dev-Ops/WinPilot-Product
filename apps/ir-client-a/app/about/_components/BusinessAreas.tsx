import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

/**
 * 마지막 칸 — **사업 영역**. 왼쪽 위에 제목이 서고, 오른쪽에 하나씩 세로로 쌓인다.
 *
 * ## 앞 칸과 무엇이 다른가
 * 바로 위(`CapabilityBands`)는 **어떤 일을 하는가**를 넷으로 말한다. 여기는 **무엇을 파는가**다.
 * 앞의 넷은 제품이 하나 늘어도 그대로지만, 여기는 제품이 늘면 함께 는다 — 그래서 값의 출처도
 * 다르다. 앞은 화면이 들고 있고 여기는 `store` 를 읽는다.
 *
 * ## 격자가 아니라 **한 줄에 하나**다
 * 처음에는 2열 격자에 넷을 담았다. 그러면 카드가 작아져 사진이 섬네일이 되고, 넷이 한 화면에
 * 다 보여 **훑고 지나가는 목록**이 된다. 여기까지 내려온 사람에게 필요한 것은 목록이 아니라
 * 하나씩 보는 것이다.
 *
 * 한 줄에 하나씩 두면 사진이 커지고, 스크롤하는 동안 **하나를 볼 때 다른 셋이 눈에 없다.**
 *
 * ## 제목이 왼쪽에 남는다
 * 오른쪽이 길게 흐르는 동안 왼쪽 제목은 따라 붙는다(`sticky`). 제목을 목록 위에 가로로 두면
 * 세 번째 제품쯤에서 **여기가 무슨 목록이었는지**가 화면 밖으로 나간다.
 *
 * 좁은 화면에서는 따라 붙지 않는다 — 한 열로 접히면서 제목이 목록 바로 위에 서고, 그때 붙어
 * 있으면 스크롤하는 내내 화면 위쪽을 제목이 차지한다.
 *
 * ## 제품 화면과 목록이 겹친다
 * `/products` 가 같은 넷을 늘어놓는다. 겹치는 것을 알고 둔다 — 회사 소개를 처음부터 끝까지
 * 읽는 사람은 **이 회사가 무엇을 파는지 모른 채** 끝까지 갈 수 없어야 하고, 그 답을 다른
 * 화면으로 미루면 절반은 안 누른다.
 *
 * 대신 여기서는 **넷만** 세운다. 서비스 둘(컨설팅 · 인프라)은 빼고 제품 화면이 갖는다 — 여섯을
 * 다 옮기면 여기가 제품 화면의 복사본이 된다.
 *
 * ## 이름을 사진 위에 얹는다
 * 사진 밖에 두면 사진과 이름 사이에 줄이 하나 더 생겨, 카드 하나가 세 층(사진 · 이름 · 설명)이
 * 된다. 이름을 사진 안으로 넣으면 두 층이 되고, 사진이 곧 그 제품의 얼굴이 된다.
 *
 * 아래로 갈수록 어두워지는 막을 깐다. 사진마다 밝기가 달라 막이 없으면 어떤 사진에서는
 * 흰 글씨가 사라진다.
 */
export type BusinessArea = { name: string; body: string; image: string; href: string };

export function BusinessAreas({
  headline,
  lead,
  more,
  areas,
}: {
  headline: string;
  lead: string;
  more: string;
  areas: BusinessArea[];
}) {
  return (
    <section className="border-b border-border py-16 lg:py-28">
      <div className="mx-auto grid w-full max-w-320 grid-cols-1 gap-x-16 gap-y-12 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="flex flex-col gap-5 lg:sticky lg:top-28 lg:h-fit">
          <h2 className="max-w-md text-balance text-2xl font-bold leading-[1.45] tracking-tight lg:text-[2rem]">
            {headline}
          </h2>
          <p className="max-w-md text-sm leading-loose text-ink-muted lg:text-base">{lead}</p>
        </div>

        <ul className="flex flex-col gap-16 lg:gap-24">
          {areas.map((one) => (
            <li key={one.name}>
              <a href={one.href} className="group flex flex-col gap-6">
                <span className="relative block aspect-4/3 w-full overflow-hidden">
                  <Image
                    src={one.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,6,13,0.8)_0%,rgba(5,6,13,0.15)_55%,transparent_100%)]"
                  />
                  <span className="absolute bottom-7 left-8 text-3xl font-light tracking-tight text-white lg:text-4xl">
                    {one.name}
                  </span>
                </span>

                <span className="text-sm leading-loose text-ink-muted lg:text-base">{one.body}</span>

                <span className="flex w-fit items-center gap-3 text-xs font-bold tracking-widest">
                  {more}
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-canvas transition-transform duration-150 group-hover:translate-x-0.5">
                    <ArrowRight aria-hidden className="size-3.5" strokeWidth={2.2} />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
