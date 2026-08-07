'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { SOLUTIONS, type Solution } from '@winpilot/store';

/**
 * 카드의 세로 길이.
 *
 * 가로세로비(`aspect-3/4`)로 두었더니 **칸 너비가 다른 만큼 높이도 달라져**, 왼쪽 큰 카드와
 * 오른쪽 옆모습 카드의 아래 끝이 어긋났다. 높이를 값 하나로 못 박고 너비만 다르게 둔다 —
 * 나란히 선 것들에서 눈이 먼저 보는 것은 **아래 끝이 맞는가**다.
 */
const CARD_H = 'h-108';

/**
 * 서비스 그림 다음 — **솔루션 셋을 한 장씩** 소개한다.
 *
 * ## 위 칸과 무엇이 다른가
 * 바로 위(`HomeService`)는 넷이 **어떻게 이어지는가**를 그림 하나로 말한다. 여기는 그중 하나를
 * 골라 **무엇을 어떻게 푸는가**를 문장으로 말한다 — 그림에서 알아본 사람이 다음으로 묻는 것이
 * 그것이라서다.
 *
 * 셋을 한 화면에 나란히 펴지 않는 이유: 그러면 세 문단을 나란히 읽어야 하고, 그때 사람이 하는
 * 일은 셋 다 건너뛰는 것이다. 한 번에 하나만 크게 두고 나머지는 오른쪽에 옆모습으로 세워,
 * **더 있다는 것만** 알린다.
 *
 * ## 밝은 칸이다
 * 위의 두 칸이 거의 검정이라 여기서 한 번 밝아진다. 어두운 화면이 계속 이어지면 어디까지가
 * 첫 화면이고 어디부터 본문인지가 흐려진다.
 *
 * 색을 못 박지 않고 토큰(`bg-surface`)을 쓰는 이유: 이 칸은 **읽는 칸**이라 다크 모드에서도
 * 따라가야 한다. 위의 두 칸은 배경 영상과 이어지는 자리라 색을 못 박았다.
 *
 * ## 어드민 연동
 * - 솔루션 값 ← `lib/data/site.ts` 의 `SOLUTIONS` (아직 어드민에 올리는 화면이 없다)
 */
export function HomeSolutions() {
  const [index, setIndex] = useState(0);
  const active = SOLUTIONS[index] ?? SOLUTIONS[0];
  if (!active) return null;

  /* 끝에서 다시 처음으로 돈다. 화살표를 눌렀는데 아무 일도 없으면 고장으로 읽힌다. */
  const step = (delta: number) => setIndex((before) => (before + delta + SOLUTIONS.length) % SOLUTIONS.length);

  return (
    <section className="overflow-hidden bg-surface py-20 text-ink lg:py-28">
      {/*
        왼쪽 두 칸은 다른 칸들과 같은 자리에서 시작하고, **오른쪽은 화면 끝까지 간다.**

        그래서 가운데 정렬(`mx-auto max-w-320`)을 쓰지 않는다. 그것으로 묶으면 오른쪽에도
        같은 여백이 생겨, 카드가 화면 끝에 닿지 못하고 안쪽에서 멈춘다.

        대신 왼쪽 안쪽 여백을 **가운데 정렬이 만들었을 값과 같게** 계산한다 —
        `(화면 너비 - 80rem) / 2 + 1.5rem`. `max()` 로 감싸는 것은 화면이 80rem 보다 좁을 때
        음수가 되지 않게 하려는 것이고, `100vw` 가 아니라 `100%` 인 것은 **세로 스크롤바 너비**
        때문이다 — `100vw` 는 스크롤바를 포함해, 위 칸들보다 8px 남짓 오른쪽으로 밀린다.
      */}
      <div className="grid grid-cols-1 items-center gap-x-14 gap-y-10 px-6 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)_minmax(0,38rem)] lg:pl-[max(1.5rem,calc((100%_-_80rem)/2_+_1.5rem))] lg:pr-0">
        {/*
          왼쪽 — 지금 고른 솔루션의 큰 카드.

          `key` 는 **바깥이 아니라 안쪽 한 겹에** 건다. 넘길 때마다 다시 태어나게 하려는 것은
          같은데, 자리는 바깥이 지키고 다시 태어나는 것은 안쪽만이다.

          바깥에 걸었더니 카드가 **갈리는 대신 쌓였다.** 이 격자의 자식 셋 중 둘에만 `key` 가
          있었기 때문이다 — 형제 중 일부만 `key` 를 가지면 React 가 자리로 맞출지 `key` 로
          맞출지 갈리고, 그 틈에서 옛 카드가 지워지지 않는다. **`key` 를 다는 것은 언제나
          제 부모의 유일한 자식이어야 한다.**
        */}
        <div className={`w-full overflow-hidden rounded-2xl ${CARD_H}`}>
          <div key={active.id} className="size-full animate-fade-up">
            <SolutionPhoto solution={active} />
          </div>
        </div>

        {/* 가운데 — 이름 · 한 줄 · 푸는 방법 · 넘기는 자리. */}
        <div className="flex flex-col gap-6">
          {/*
            바뀌는 것을 **한 덩어리로 묶어** `key` 를 하나만 주고, 그 덩어리를 **제 부모의 유일한
            자식**으로 둔다(감싼 `<div>` 하나가 그 일을 한다).

            처음에는 이름·제목·본문·성과에 각각 `key={active.id}` 를 주었다. 그러면 한 부모 안에
            같은 `key` 가 넷 생기고, React 는 옛 것을 지우지 못해 **글이 아래로 쌓였다.** 묶고
            나서도 옆에 `key` 없는 형제(넘기는 줄)가 있으면 같은 일이 다시 났다.

            넘기는 자리(막대·화살표)는 이 덩어리 밖에 둔다 — 바뀌는 값이 아니라서, 함께 다시
            그리면 누를 때마다 단추가 깜빡인다.
          */}
          <div>
            <div key={active.id} className="flex animate-fade-up flex-col gap-6">
              {/*
                머리글이 `Solution` 이었다. 그러면 넘겨도 이 줄만 그대로 남아, **무엇을 보고
                있는지**를 아래 한 줄에서 다시 찾아야 했다.
              */}
              <p className="text-2xl font-bold tracking-tight lg:text-3xl">Cloud {active.name}</p>

              <h2 className="text-3xl font-bold leading-[1.35] tracking-tight lg:text-4xl">{active.tagline}</h2>

              <p className="max-w-xl text-sm leading-loose text-ink-muted lg:text-base">{active.approach}</p>

              {/*
                바로가기는 **읽던 자리 바로 아래**에 둔다. 아래 넘기는 줄에 섞어 두었더니
                화살표·막대와 나란히 서서, 더 읽으러 가는 길이 넘기는 장치 중 하나로 보였다.
              */}
              <a
                href={active.href}
                className="group flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-canvas transition-opacity duration-150 hover:opacity-85"
              >
                Cloud {active.name} 자세히 보기
                <ArrowUpRight aria-hidden className="size-4 shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>

            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-4">
            {/*
              몇 장 중 몇 장째인지. 점 대신 막대인 이유: 점은 켜진 것과 꺼진 것의 차이가 색뿐이라
              밝은 바탕에서 잘 보이지 않는다. 막대는 **길이**가 달라 색을 못 봐도 읽힌다.
            */}
            <div className="flex items-center gap-2">
              {SOLUTIONS.map((one, position) => (
                  <button
                    key={one.id}
                    type="button"
                    onClick={() => setIndex(position)}
                    aria-current={position === index}
                    aria-label={`${one.name} 보기`}
                    className={`h-0.5 rounded-full transition-all duration-300 ${
                      position === index ? 'w-20 bg-ink' : 'w-10 bg-border'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <ArrowButton label="이전 솔루션" onClick={() => step(-1)} direction="prev" />
                <ArrowButton label="다음 솔루션" onClick={() => step(1)} direction="next" />
              </div>
            </div>
          </div>

          {/*
            오른쪽 — 지금 보고 있지 않은 솔루션들.

            ## 사라지는 카드를 **지우지 않는다**
            전에는 지금 보는 것 하나를 목록에서 빼고 나머지만 그렸다. 그러면 남은 카드가 한 칸씩
            밀리는데, 지워졌다 다시 그려지는 것이라 **자리를 옮기는 과정이 없다** — 눈 깜빡할
            사이에 다른 사진이 그 자리에 서 있다.

            그래서 넷을 늘 그려 두고, 지금 보는 것만 **너비를 0 으로 접는다.** `flex-grow` 와
            안쪽 여백이 함께 줄면 옆 카드들이 그 자리를 **밀고 들어오는 것이 보인다.** 자리가
            바뀌는 것이 아니라 자리가 넓어지는 것이라, 어느 카드가 어디로 갔는지 눈이 따라간다.

            ## 사이 간격을 `gap` 이 아니라 안쪽 여백으로 두는 이유
            `gap` 은 접힌 카드에도 그대로 남아, 너비가 0 이 되어도 **빈 16px 이 남는다.** 간격을
            카드 안쪽으로 옮기면 카드가 접힐 때 간격도 같이 접힌다. 바깥의 `-mx-2` 는 그 여백만큼
            줄 전체를 되돌려, 첫 카드가 왼쪽 끝에서 시작하게 한다.
          */}
          <div className="hidden lg:block">
            <div className={`-mx-2 flex ${CARD_H}`}>
              {SOLUTIONS.map((one, position) => {
                const folded = position === index;

                return (
                  <div
                    key={one.id}
                    className={`min-w-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      folded ? 'grow-0 basis-0 px-0 opacity-0' : 'grow basis-0 px-2 opacity-100'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setIndex(position)}
                      /*
                        접힌 카드는 눈에도 없고 **탭 순서에도 없어야** 한다 — 보이지 않는 단추에
                        초점이 가면 그 뒤로 화면이 사라진 것처럼 보인다.
                      */
                      tabIndex={folded ? -1 : undefined}
                      aria-hidden={folded}
                      className="size-full overflow-hidden rounded-2xl text-left transition-opacity duration-200 hover:opacity-80"
                    >
                      <SolutionPhoto solution={one} />
                      <span className="sr-only">{one.name} 보기</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
  );
}

/** 이전 · 다음. */
function ArrowButton({
  label,
  onClick,
  direction,
}: {
  label: string;
  onClick: () => void;
  direction: 'prev' | 'next';
}) {
  const Icon = direction === 'next' ? ArrowRight : ArrowLeft;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-9 place-items-center rounded-full text-ink transition-colors duration-150 hover:bg-canvas"
    >
      <Icon aria-hidden className="size-5" strokeWidth={1.6} />
    </button>
  );
}

/**
 * 카드 한 장의 사진.
 *
 * ## 도형이었다가 사진이 되었다
 * 처음에는 SVG 로 그렸다. 이 저장소의 화면을 Figma 로 다시 뽑기 때문에 비트맵을 피한 것인데,
 * **여기는 UI 가 아니라 홍보 그림**이다 — 첫 화면의 배경 영상과 같은 자리이고, 같은 이유로
 * 사진을 쓴다. 도형으로 그린 창고는 창고를 뜻할 뿐이지만, 사진은 그 규모를 보여 준다.
 *
 * 출처와 라이선스, 고를 때 무엇을 걸렀는지는 `public/solutions/README.md` 에 적어 두었다.
 *
 * ## `alt` 가 비어 있다
 * 사진이 말하는 것은 옆의 제목·본문에 이미 글자로 있다. 여기에 설명을 또 넣으면 낭독기가
 * 같은 말을 두 번 읽는다.
 *
 * ## 아래로 갈수록 어두워진다
 * 이름을 사진 위에 얹기 때문이다. 사진마다 밝기가 다르므로 글자색만으로는 어느 사진에서든
 * 읽히게 만들 수 없다 — 글자가 앉는 자리에 어둠을 깔아야 밝은 사진에서도 읽힌다.
 */
function SolutionPhoto({ solution }: { solution: Solution }) {
  return (
    <span className="relative block size-full">
      <img src={`/solutions/${solution.id}.jpg`} alt="" className="size-full object-cover" />
      <span
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,6,13,0.9)_0%,rgba(5,6,13,0.45)_35%,rgba(5,6,13,0.1)_70%,transparent_100%)]"
      />
      <span className="absolute bottom-5 left-5 text-sm font-semibold tracking-tight text-white">
        Cloud {solution.name}
      </span>
    </span>
  );
}
