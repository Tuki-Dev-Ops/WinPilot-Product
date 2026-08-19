import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import type { Offering } from '@winpilot/store';
import { Reveal } from '@/app/_components/Reveal';
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
 * | 하는 일 | 그걸 어떻게 푸는가 |
 * | 붙는 자리 | 우리 설비·시스템과 **어디서 붙는가** |
 * | 절차 | 얼마나 걸리는가 |
 * | 문의 | 다음에 무엇을 하면 되는가 |
 *
 * ## 효과와 업종을 뺐다
 * `쓰기 시작하면`(도입 효과)과 `적용 업종`이 절차 다음에 한 칸으로 서 있었다. 뺀 자리다 —
 * 효과는 위의 **하는 일** 넷이 이미 문장마다 말하고 있었고(`실시간으로 이어져 … 지금 몇
 * 개인지를 봅니다`), 업종은 낱말 다섯을 늘어놓은 줄이라 **읽는 사람이 그것으로 무엇을
 * 판단하는지**를 답할 수 없었다.
 *
 * 값(`Offering.outcomes` · `Offering.industries`)은 그대로 둔다. 이 화면이 안 쓸 뿐이고,
 * 지우면 다시 필요해지는 날 어드민 쪽까지 손대야 한다.
 *
 * ## 어두운 판을 걷어냈다
 * 문제를 검은 판에 큰 글씨로 두었었다. 읽을지 말지를 정하는 칸이라 눈에 띄게 하려던 것인데,
 * 회사 소개 쪽이 **흰 바탕에 큰 글씨**로 정리되면서 여기만 검은 판이 남았다. 한 사이트에서
 * 같은 일(중요한 문장 하나 세우기)을 화면마다 다른 방법으로 하면, 그 방법이 뜻이 아니라
 * **그 화면의 버릇**으로 읽힌다.
 *
 * 지금은 흰 바탕에 큰 검은 문장, 그 아래 옅은 회색 한 단락이다. 어두운 칸은 맨 끝 문의 하나만
 * 남는다 — 화면이 어디서 끝나는지는 여전히 색으로 말해야 한다.
 *
 * ## 절을 **왼쪽 제목 · 오른쪽 목록**으로 둔다
 * 번호와 한글 제목을 가로로 세우고 그 아래에 카드를 격자로 깔았었다. 격자는 항목을 **한눈에
 * 훑는** 자리에 맞는데, 여기 항목들은 훑어서 고르는 것이 아니라 하나씩 읽는 것이다.
 *
 * 왼쪽에 제목을 세우고 오른쪽에 세로로 쌓으면, 오른쪽이 흐르는 동안 **지금 무슨 칸을 읽고
 * 있는지**가 왼쪽에 남는다(`sticky`). 가로 제목은 세 번째 항목쯤에서 화면 밖으로 나간다.
 *
 * ## 한눈에 보는 숫자 줄을 뺐다
 * 기능 수 · 층 수 · 단계 수 · 업종 수 넷을 맨 위에 세어 두었다. 지어낸 수가 아니라 아래 칸을
 * 센 값이라 틀리지는 않았는데, **읽는 사람이 그 수로 무엇을 판단하는지**를 답할 수 없었다 —
 * 기능이 넷인 것과 여섯인 것 중 어느 쪽이 나은지는 아무도 모른다. 세어 둘 수 있다는 이유만으로
 * 둔 값이었다.
 *
 * ## 숫자를 지어내지 않는다
 * 같은 업계 화면들은 대개 `가동률 20% 향상` 같은 숫자 띠를 갖는다. 여기에는 두지 않았다 —
 * 그 숫자는 **고객사마다 다른 값**이고, 우리 값(`Offering`)에는 그런 칸 자체가 없다. 자리를
 * 채우려고 지어낸 수는 계약 자리에서 근거를 물었을 때 답할 것이 없다.
 */
export function OfferingDetail({ offering }: { offering: Offering }) {
  return (
    <div className="flex flex-col">
      {/*
        첫 칸 — 큰 검은 문장 하나와 그 아래 옅은 한 단락. 문제를 크게, 푸는 방법을 작게 둔다.
        둘을 같은 크기로 두면 읽는 사람이 **자기 이야기인지**를 판단하기 전에 방법부터 읽는다.
      */}
      <section className="py-16 lg:py-28">
        <Reveal className="flex flex-col gap-8 lg:gap-12">
          <p className="max-w-4xl text-balance text-2xl font-bold leading-[1.5] tracking-tight lg:text-[2rem] lg:leading-[1.5]">
            {offering.problem}
          </p>
          <p className="max-w-2xl text-sm leading-loose text-ink-muted lg:text-base">{offering.approach}</p>
        </Reveal>
      </section>

      <Chapter title={['현장에서', '하는 일']}>
        {offering.features.map((one, index) => (
          <Entry key={one.title} name={one.title} body={one.desc} kind="grid" seed={index} />
        ))}
      </Chapter>

      {/*
        층은 **아래에서 위로** 쌓인다. 값의 차례는 설비가 먼저이므로 그대로 두고, 읽는 차례만
        뒤집어 화면 아래로 갈수록 설비에 가까워지게 한다 — 그림 없이 층을 말할 때 눈이 기대하는
        방향이 그쪽이다.
      */}
      <Chapter title={['설비에서', '화면까지']}>
        {[...offering.layers].reverse().map((one, index) => (
          <Entry key={one.name} name={one.name} body={one.desc} kind="layers" seed={index} />
        ))}
      </Chapter>

      <Chapter title={['도입까지의', '절차']}>
        {offering.steps.map((one, index) => (
          <Entry key={one.name} name={one.name} body={one.desc} aside={one.period} kind="steps" seed={index} />
        ))}
      </Chapter>

      <section className="flex flex-col items-start gap-6 rounded-2xl bg-night px-8 py-12 text-white lg:px-14 lg:py-16">
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

/**
 * 절 하나 — **왼쪽에 제목, 오른쪽에 항목들**.
 *
 * 제목을 줄 배열로 받는다. 브라우저가 접게 두면 화면 너비마다 접히는 자리가 달라, 두 줄로
 * 세우려던 제목이 넓은 화면에서 한 줄이 된다. 이 자리에서 줄 나눔은 **글자를 조각처럼 세우는
 * 장치**라 화면이 정한다.
 *
 * 왼쪽 제목은 따라 붙는다(`sticky`). 오른쪽이 길게 흐르는 동안 지금 무슨 칸인지가 남아야 한다.
 * 좁은 화면에서는 붙지 않는다 — 한 열로 접히면 제목이 목록 바로 위에 서는데, 거기서 붙어
 * 있으면 스크롤 내내 화면 위를 제목이 차지한다.
 */
function Chapter({ title, children }: { title: string[]; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-8 border-t border-border py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16 lg:py-24">
      <h2 className="flex flex-col text-2xl font-bold leading-[1.35] tracking-tight lg:sticky lg:top-28 lg:h-fit lg:text-3xl">
        {title.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h2>

      <div className="flex flex-col gap-14 lg:gap-20">{children}</div>
    </section>
  );
}

/**
 * 항목 하나 — **큰 얇은 이름과 그 아래 한 단락**.
 *
 * 이름을 굵게 두지 않는다. 굵으면 아래 본문과 같은 무게가 되어 둘이 한 덩어리로 읽히는데,
 * 얇고 크면 **크기로만** 제목이 되어 본문과 층이 갈린다. 카드로 감싸지 않는 것도 같은 뜻이다 —
 * 테두리를 두르면 항목들이 나란히 놓인 별개의 상자가 되고, 여기서는 하나씩 읽어 내려가야 한다.
 *
 * `aside` 는 절차의 걸리는 시간처럼 **이름 옆에 붙는 짧은 값**이다. 없으면 아무것도 서지 않는다.
 */
function Entry({
  name,
  body,
  aside,
  kind,
  seed,
}: {
  name: string;
  body: string;
  aside?: string;
  kind: PlateKind;
  seed: number;
}) {
  return (
    <Reveal className="flex flex-col gap-6">
      {/*
        `fill` 은 자리를 잡아 주는 부모가 있어야 한다. 16:9 비율을 그 부모가 들고 사진은
        그 안을 채운다 — 사진에 비율을 직접 걸면 `fill` 이 무시된다.

        `sizes` 는 이 칸이 실제로 차지하는 폭이다. 넓은 화면에서 오른쪽 칸이 화면의 55%
        남짓이라 그렇게 적는다. 적지 않으면 Next 가 가장 큰 폭을 내려보낸다.
      */}
      <span className="relative block aspect-16/9 w-full overflow-hidden rounded-sm">
        <Image
          src={PLATES[kind][seed % PLATES[kind].length] as string}
          alt=""
          aria-hidden
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover"
        />
      </span>

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
          <p className="text-2xl font-light leading-tight tracking-tight lg:text-4xl">{name}</p>
          {aside && <span className="font-mono text-xs tabular-nums text-ink-faint">{aside}</span>}
        </div>
        <p className="max-w-2xl text-sm leading-loose text-ink-muted lg:text-base">{body}</p>
      </div>
    </Reveal>
  );
}

/**
 * 절마다 쓰는 사진 넉 장.
 *
 * ## 그렸다가 사진으로 바꿨다
 * 한동안 이 자리에 **SVG 로 그린 판**을 두었다. 가진 사진이 제품 넉 장뿐이라 한 화면의 항목
 * 열둘을 채우려면 같은 사진이 세 번씩 나와야 했고, 그것보다는 그리는 편이 낫다고 봤다.
 *
 * 지금은 이 자리에 쓸 사진을 따로 구했다. 점과 네모로 그린 판은 **무엇을 뜻하는지 설명이
 * 필요했고**, 설명이 필요한 그림은 옆의 글이 이미 하는 일을 한 번 더 하는 것이었다.
 *
 * ## 절마다 다른 넉 장
 * 열두 장이 다 다르다. 같은 사진이 한 화면에 두 번 나오면 **아무 사진이나 깔았다**로 읽힌다.
 * 화면 여섯(제품 넷 · 서비스 둘)이 같은 열두 장을 나눠 쓰는 것은 괜찮다 — 한 번에 한 화면만
 * 보기 때문이다.
 *
 * 출처와 라이선스, 고를 때 무엇을 걸렀는지는 `public/plates/README.md` 에 적어 두었다.
 *
 * ## 항목이 넷을 넘으면
 * `% PLATES[kind].length` 로 돈다. 값(`Offering`)은 기능을 다섯 개 가질 수도 있는데, 그때
 * 배열이 짧아 `undefined` 가 되면 사진 자리가 빈 칸으로 남는다 — 빈 칸은 사진이 없는 것이
 * 아니라 **깨진 것**으로 보인다.
 */
const PLATES: Record<PlateKind, string[]> = {
  grid: ['/plates/work-1.jpg', '/plates/work-2.jpg', '/plates/work-3.jpg', '/plates/work-4.jpg'],
  layers: ['/plates/layer-1.jpg', '/plates/layer-2.jpg', '/plates/layer-3.jpg', '/plates/layer-4.jpg'],
  steps: ['/plates/step-1.jpg', '/plates/step-2.jpg', '/plates/step-3.jpg', '/plates/step-4.jpg'],
};

/**
 * 그림의 갈래 — 절마다 다르다.
 *
 * | 갈래 | 절 | 무엇이 찍혔나 |
 * |---|---|---|
 * | `grid` | 하는 일 | 현장에서 실제로 도는 것 — 컨베이어 · 설비 · 가공 · 사람 |
 * | `layers` | 붙는 자리 | 아래에서 위로 — 계측기 · 제어기 · 배선 · 조작 화면 |
 * | `steps` | 절차 | 현장을 보고 · 연동을 맞추고 · 올리고 · 운영으로 |
 */
type PlateKind = 'grid' | 'layers' | 'steps';
