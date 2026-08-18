/**
 * 화면 머리 배너 — **머리띠 바로 아래, 화면 끝까지 닿는 띠**.
 *
 * ## 제목만 있던 자리다
 * 전에는 본문 맨 위에 글자 두 줄이 있었다(껍데기가 들고 있던 `IrPageTitle` — 이 띠로 다 옮겨
 * 간 뒤 지웠다). 그러면 머리띠와 본문 사이가 흰 여백 하나로만 갈리고, **여기가 어느 갈래인지**를
 * 말하는 것이 제목 한 줄뿐이었다.
 *
 * 띠를 두면 갈래 이름이 크게 서고, 본문이 어디서 시작하는지가 색으로 갈린다.
 *
 * ## 설명을 달지 않는다
 * 처음에는 제목 아래 한 문장을 함께 두었다. 뺐다 — 배너가 답할 것은 **여기가 어디인가** 하나이고,
 * 그 설명은 아래 본문이 이미 한다. 두 줄이 서면 눈이 배너에서 한 번 멈춰 읽고 내려가는데,
 * 하위 화면에 온 사람은 이미 무엇을 보러 왔는지 안다.
 *
 * 제목을 가운데 두는 것도 같은 까닭이다. 왼쪽에 붙이면 그 오른쪽이 비어 무언가 더 올 자리처럼
 * 보인다.
 *
 * ## 사진은 없어도 뜬다
 * 기본 배경은 **인라인 SVG 로 그린 빛줄기**이고, 사진은 `image` 를 넘길 때만 그 위에 깔린다.
 * 사진이 늦게 뜨거나 못 뜨면 SVG 가 그대로 남는다 — 첫 화면(`HomeHero`)이 영상을 다루는
 * 방식과 같다(`public/hero/README.md`).
 *
 * SVG 로 두는 또 하나의 까닭: 이미지 파일이면 추출기가 **그림 한 장**으로만 받아 Figma 에서
 * 벡터로 복원되지 않는다. 인라인 SVG 는 실제 DOM 노드라 선과 색이 그대로 남는다.
 *
 * ## 머리띠를 겹치지 않는다
 * `overlay` 를 주면 머리띠가 투명해져 배너 위에 얹히는데, 그러면 **맨 위에서 메뉴가 사진에
 * 묻힌다.** 겹치지 않게 두면 머리띠가 늘 검은 띠로 서고 그 아래에서 배너가 시작한다 —
 * 어두운 색 둘이 이어져 화면이 갈라지지도 않는다.
 *
 * ## 화면 높이를 다 쓰지 않는다
 * 첫 화면은 `min-h-dvh` 로 꽉 채우지만 여기는 **띠**다. 하위 화면에서 화면을 꽉 채우면 본문을
 * 보려고 매번 한 번씩 굴려야 한다.
 */
export function PageHero({ title, image }: { title: string; image?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-night text-white">
      <LightStreaks />

      {image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" aria-hidden className="absolute inset-0 -z-10 size-full object-cover" />
          {/*
            사진 위에 어두운 막을 깐다. 사진마다 밝기가 달라 막이 없으면 **어떤 사진에서는
            흰 글씨가 사라진다** — 사진을 바꿀 때마다 글자 색을 다시 고르게 둘 수 없다.
          */}
          <span
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(5,6,13,0.9)_0%,rgba(5,6,13,0.62)_55%,rgba(5,6,13,0.4)_100%)]"
          />
        </>
      )}

      <div className="mx-auto flex w-full max-w-320 items-center justify-center px-6 py-16 lg:py-20">
        <h1 className="text-center text-3xl font-bold tracking-tight lg:text-4xl">{title}</h1>
      </div>
    </section>
  );
}

/**
 * 배경 빛줄기.
 *
 * 첫 화면의 것보다 **얕게** 그린다 — 여기는 띠라서 세로가 짧고, 같은 세기로 그리면 줄이
 * 서로 붙어 무늬가 아니라 얼룩으로 보인다.
 */
function LightStreaks() {
  return (
    <svg
      viewBox="0 0 1440 240"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className="absolute inset-0 -z-10 size-full"
    >
      <defs>
        <linearGradient id="page-hero-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#101d33" />
          <stop offset="100%" stopColor="#05060d" />
        </linearGradient>
      </defs>
      <rect width="1440" height="240" fill="url(#page-hero-bg)" />
      <g transform="rotate(-18 720 120)">
        {[-160, 40, 240, 440, 640, 840, 1040, 1240, 1440].map((x, index) => (
          <line
            key={x}
            x1={x}
            y1="-200"
            x2={x}
            y2="440"
            stroke={index === 2 ? 'rgba(138,186,255,0.45)' : 'rgba(148,163,184,0.10)'}
            strokeWidth={index === 2 ? 2.5 : 1.5}
          />
        ))}
      </g>
    </svg>
  );
}
