'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SITE_SERVICES, type SiteService } from '@winpilot/store';
import { ConsultingScene, CrmScene, DxpScene, ErpScene, InfraScene, MesScene } from './IsoEquipment';
import { IsoPlatform, IsoWalls, type IsoTone } from './IsoMap';

/**
 * 첫 화면 → 회사 소개 다음 — **무엇을 파는가** 한 판.
 *
 * ## 넷을 한 그림에 두는 이유
 * 컨설팅 · Cloud MES · Cloud ERP · Cloud CRM 을 따로 소개하면 넷이 서로 무관한 상품으로
 * 읽힌다. 실제로는 **한 줄로 이어진 것**이다 — 컨설턴트가 현장을 진단하고, MES 가 설비
 * 신호를 규격으로 모으고, ERP 가 그 데이터를 수주에서 정산까지 잇고, CRM 이 그 끝에서 고객을
 * 이어받는다. 그림 하나에 놓고 길로 이으면 그 차례가 설명 없이 보인다.
 *
 * 그래서 그림이 왼쪽 위에서 오른쪽 아래로 흐른다. 격자에서 뒤 서비스일수록 `x` 가 크다.
 *
 * ## 저절로 넘어가지 않는다
 * 첫 화면이 이미 7초마다 넘어간다. 여기까지 저절로 움직이면 **읽는 중에 글이 바뀌고**, 그때
 * 사람이 하는 일은 읽기를 그만두는 것이다. 여기서는 숫자를 누르거나 칸에 마우스를 올린
 * 사람에게만 바뀐다.
 *
 * ## 그림 안에 글자가 없다
 * 판 위에 이름을 세워 두지 않는다. 이름은 왼쪽 제목과 위의 숫자 단추에 이미 있고, 같은 말을
 * 그림에도 적으면 **어느 쪽을 봐야 하는지**가 흐려진다. 그림은 모양으로만 말한다.
 *
 * SVG 전체에 `aria-hidden` 을 거는 것도 같은 이유다 — 아이소메트릭 도형을 소리로 옮기면
 * "사각형, 사각형, 사각형" 이 되고, 뜻은 이미 글자로 전해졌다.
 *
 * ## 어드민 연동
 * - 솔루션 상세 ← `/solutions/{erp,mes,crm}`. 인프라·DXP 는 아직 그 화면이 없어 `/products` 로 보낸다
 */

/**
 * 무대에 서는 서비스 하나.
 *
 * 값 자체는 `@winpilot/store` 의 `SITE_SERVICES` 가 갖는다 — IR 어드민의 홈페이지 > 서비스가
 * 같은 것을 고치기 때문이다. 여기 있는 것은 **그 값을 무대 위 어디에 세울지**뿐이다.
 */
type ServiceNode = SiteService;

const NODES: ServiceNode[] = SITE_SERVICES;

/**
 * 처음 켜져 있는 방.
 *
 * 목록의 첫째다. `SITE_SERVICES` 는 어드민이 고치는 값이라 **비어 있을 수 있고**, 그때
 * `NODES[0]` 은 `undefined` 다 — 화면 전체가 그것 하나로 무너지지 않게 여기서 한 번 막는다.
 */
const FIRST = NODES[0];

/** 방 하나의 반지름 — 격자 칸 수. */
const RADIUS = 2;

/**
 * 무대의 반지름(px).
 *
 * 넷일 때는 250 으로 넉넉했다. 방이 늘수록 이웃 사이가 좁아지는데, 특히 **눌린 원의 좌우
 * 끝**(0° · 180°) 가까이 선 둘이 가장 가깝다 — 그 언저리에서 원이 가팔라 같은 각도라도
 * 화면에서의 거리가 짧다.
 *
 * 여섯일 때 그 가장 가까운 두 방의 거리가 `0.661 × 반지름` 이고 방 하나의 너비가 256px 이므로,
 * 반지름은 388 을 넘어야 겹치지 않는다. 430 은 거기에 여유를 둔 값이다.
 */
const STAGE_R = 430;

/**
 * 불빛이 가운데에서 방까지 가는 데 걸리는 시간(ms).
 *
 * 토큰의 `--animate-iso-surge` 와 같은 값이어야 한다. 두 곳에 적히는 것이 마음에 걸리지만,
 * 한쪽은 CSS 가 그리는 시간이고 한쪽은 **불이 켜지는 시각**이라 서로 다른 것을 정한다 —
 * 값이 갈리면 불빛이 도착하기 전에 방이 켜지거나, 도착하고 한참 뒤에 켜진다.
 */
const SURGE_MS = 420;

const DIM: IsoTone = {
  top: '#0e1621',
  right: '#0a111a',
  left: '#070c13',
  line: 'rgba(148,163,184,0.24)',
};

/*
  살아 있는 칸은 브랜드 파랑이다. 참고한 화면은 청록이지만 그 색은 이 저장소에 없다 —
  여기 한 곳에만 새 색을 들이면 그 값이 토큰 밖에서 자라기 시작한다.

  ## 반투명으로 두지 않는다
  전에는 `rgba(49,130,246,0.22)` 처럼 알파를 준 색이었다. 그러니 켜진 방의 벽과 기계 **너머로
  무대 바닥의 선과 뒤쪽 방이 그대로 비쳤다** — 유리로 지은 공장처럼 보였다. 배경(`#05060d`)에
  그 파랑을 미리 섞은 **불투명한 색**으로 바꾼다. 눈에 보이는 색은 같고, 뒤엣것만 가려진다.
*/
const LIT: IsoTone = {
  top: '#14294d',
  right: '#0e1c36',
  left: '#0a1324',
  line: 'rgba(138,186,255,0.9)',
};

export function HomeService() {
  /**
   * 불빛이 **향하는** 곳. 마우스를 올리는 순간 여기가 바뀌고, 전원선의 불빛이 그리로 출발한다.
   */
  const [target, setTarget] = useState<ServiceNode>(FIRST as ServiceNode);
  /**
   * 불이 **켜진** 곳. 불빛이 닿은 뒤에 바뀐다.
   *
   * 둘을 나눈 이유가 이 화면의 전부다. 하나로 두면 마우스를 올리는 순간 방이 켜지고, 그러면
   * 전원선을 타고 가는 불빛은 이미 끝난 일을 뒤늦게 따라가는 장식이 된다. 나눠 두면 **불빛이
   * 가서 켜는 것**이 되고, 그 사이의 400ms 가 인과로 읽힌다.
   */
  const [active, setActive] = useState<ServiceNode>(FIRST as ServiceNode);
  /* 불빛이 닿을 때 불을 켠다. 가는 중에 다른 곳을 가리키면 앞의 것은 취소된다 — 마우스를 빠르게
     지나가며 훑을 때 지나온 방이 뒤늦게 하나씩 켜지는 것을 막는다. */
  useEffect(() => {
    if (target.id === active.id) return;
    const timer = setTimeout(() => setActive(target), SURGE_MS);
    return () => clearTimeout(timer);
  }, [target, active]);

  /**
   * 그쪽으로 **불빛을 보낸다.** 무대도 방도 자리를 옮기지 않는다.
   *
   * 자리가 움직이지 않는 것이 중요하다 — 고를 때마다 넷이 자리를 바꾸면, 방금 본 방을 다시
   * 보려는 사람이 **아까 있던 자리를 먼저 본다.** 자리가 고정되면 켜지는 것만 달라진다.
   */
  function pointAt(node: ServiceNode) {
    setTarget(node);
  }

  /*
    서비스가 하나도 없으면 이 칸을 통째로 두지 않는다 — 빈 무대만 도는 것보다 낫다.

    **훅을 전부 부른 뒤에** 판단한다. 위에서 먼저 돌려보내면 렌더마다 부르는 훅의 수가
    달라져, React 가 상태를 엉뚱한 훅에 물린다.
  */
  if (!FIRST) return null;

  return (
    <section className="overflow-hidden bg-[#05060d] pb-20 pt-4 text-white lg:pb-28">
      <div className="flex flex-col gap-10">
        <div className="mx-auto flex w-full max-w-320 flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6">
          <p className="text-2xl font-bold tracking-tight lg:text-3xl">SOLUTION</p>

          <div className="flex items-center gap-3">
            <a href="/" className="text-xs font-bold tracking-widest text-white/80 hover:text-white">
              HOME
            </a>
            {NODES.map((node) => (
              <button
                key={node.id}
                type="button"
                aria-pressed={node.id === active.id}
                onClick={() => pointAt(node)}
                onMouseEnter={() => pointAt(node)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs tabular-nums transition-colors duration-150 ${
                  node.id === active.id
                    ? 'bg-white/10 text-white ring-1 ring-white/25'
                    : 'text-white/45 hover:text-white/80'
                }`}
              >
                {node.no}
                {/* 이름은 지금 칸에만 붙인다 — 넷을 다 펴면 줄이 넘쳐 숫자가 흩어진다. */}
                {node.id === active.id && <span className="font-sans text-xs font-semibold">{node.name}</span>}
              </button>
            ))}
          </div>
        </div>

        {/*
          머리글 줄과 달리 이 줄은 **오른쪽으로 화면 끝까지** 간다.

          가운데 정렬로 묶으면 오른쪽에도 같은 여백이 생겨, 그림이 안쪽에서 멈추고 그 바깥은
          빈 채로 남는다. 무대는 넓을수록 방 넷이 서로 겹치지 않으므로 남는 자리를 그림에 준다.

          왼쪽 여백만 가운데 정렬이 만들었을 값과 같게 계산한다 — 자세한 셈은 `HomeSolutions`
          의 같은 자리에 적어 두었다.
        */}
        <div className="grid grid-cols-1 items-start gap-x-12 gap-y-10 px-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:pl-[max(1.5rem,calc((100%_-_80rem)/2_+_1.5rem))] lg:pr-0">
          <div className="flex flex-col gap-5">
            {/* 제목은 이제 링크가 아니다. 더 읽으러 가는 길은 아래 단추 하나로 모았다. */}
            <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">{active.name}</h2>

            {/*
              두 줄을 따로 감싼다. 바깥의 `gap-5` 는 **제목과 본문 사이**의 간격이고, 두 줄
              사이는 그보다 좁아야 한 문단으로 읽힌다 — 같은 간격이면 서로 다른 이야기 둘로
              보인다.
            */}
            <div className="flex flex-col gap-1.5">
              {active.body.map((line) => (
                <p key={line} className="text-sm leading-loose text-white/65">
                  {line}
                </p>
              ))}
            </div>

            {/* 바로가기 — 읽던 자리 바로 아래(`HomeSolutions` 와 같은 자리·같은 모양). */}
            <a
              href={active.href}
              className="group mt-1 flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#05060d] transition-opacity duration-150 hover:opacity-85"
            >
              {active.name} 자세히 보기
              <ArrowUpRight
                aria-hidden
                className="size-4 shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </div>

          <IsoScene active={active} target={target} onHover={pointAt} />
        </div>
      </div>
    </section>
  );
}

/**
 * 방이 서는 각도(°). 0° 가 오른쪽, 90° 가 앞(아래)이고, 커질수록 시계 방향이다.
 *
 * 맨 뒤(`-90°`)에서 시작해 목록 차례대로 같은 각도씩 돌려 놓는다. 공정의 차례가 곧 무대를
 * **시계 방향으로 한 바퀴 도는 것**이 되어, 그림만 보고도 어느 쪽이 먼저인지 읽힌다.
 *
 * 손으로 적어 두지 않고 셈으로 구하는 이유: 넷일 때는 `-90 · 0 · 90 · 180` 을 적어 두면
 * 됐지만, 하나가 늘면 **다섯 값을 전부 다시 적어야** 한다. 그때 하나를 빠뜨리면 방 둘이
 * 같은 자리에 겹쳐 선다.
 */
function angleOf(node: ServiceNode): number {
  return START_ANGLE + NODES.indexOf(node) * (360 / NODES.length);
}

/**
 * 첫 방이 서는 각도(°).
 *
 * 맨 뒤(`-90°`)에서 시작하는 것이 곧아 보이지만, 여섯일 때는 그러면 안 된다 — `-90` 에서
 * 60° 씩 가면 `-30` 과 `30`, `150` 과 `210` 이 각각 **눌린 원의 좌우 끝을 사이에 두고 마주
 * 서서**, 화면에서 같은 가로 자리에 위아래로 겹친다. 뒤엣것이 앞엣것에 통째로 가린다.
 *
 * 30° 를 비켜 두면 좌우 끝에는 방이 **하나씩만** 선다.
 */
const START_ANGLE = -60;

/**
 * 회전 무대 한 판.
 *
 * ## 눕힌 원 위에 방 넷
 * 방들이 흩어져 떠 있는 대신 **하나의 무대 위**에 선다. 무대는 `scale(1, 0.5)` 로 눌린 원이라
 * 아이소메트릭 바닥으로 보이고, 그 위의 원을 따라 방이 네 칸 놓인다.
 *
 * ## 자리는 움직이지 않는다
 * 무대는 **돌지 않는다.** 방 넷은 늘 같은 자리에 서 있고, 고르는 것으로 달라지는 것은
 * 어느 방에 불이 켜졌는가 하나다.
 *
 * ## 눌린 원 위에 세우는 방법
 * 방을 `rotate(φ) translate(R, 0)` 로 원 위에 올리고, 그 자리에서 각도를 **되돌려 준다**
 * (`rotate(-φ) scale(1, 2)`). 곱해 보면 방에 남는 변형이 없다 — 자리만 원을 따라 잡히고
 * **건물은 서 있는 그대로**다. 되돌리지 않으면 바깥의 `scale(1, 0.5)` 와 `rotate(φ)` 가
 * 건물까지 눕혀, 공장이 통째로 기울어 눌린다.
 *
 * ## 전원선 — 가운데에서 방으로
 * 가운데 축에서 방 넷으로 선이 하나씩 뻗는다. 고른 방의 선에는 불빛 한 조각이 **가운데에서
 * 바깥으로 흘러가고**, 그것이 닿은 뒤에 그 방에 불이 켜진다.
 *
 * 선을 방과 방 사이(고리)로 두지 않은 이유: 01 에서 04 로 건너뛸 때 불빛이 지나야 할 호가
 * 매번 달라져, 짧은 길과 긴 길이 같은 시간에 도착하거나 반대로 돈다. 가운데에서 뻗으면
 * **어디를 고르든 길이가 같다.**
 */
function IsoScene({
  active,
  target,
  onHover,
}: {
  active: ServiceNode;
  /** 불빛이 지금 향하는 곳 — 아직 켜지지 않았을 수 있다 */
  target: ServiceNode;
  onHover: (node: ServiceNode) => void;
}) {
  /* 앞에 있는 방이 나중에 그려져야 앞을 가린다. `sin` 이 클수록 화면 아래 — 곧 앞이다. */
  const drawn = [...NODES].sort((a, b) => frontness(a) - frontness(b));

  return (
    <svg viewBox="-620 -380 1240 700" aria-hidden className="h-auto w-full">
      <defs>
        {/*
          살아 있는 칸에만 씌우는 빛. 배경이 거의 검정이라 색만 밝혀서는 차이가 안 보이고,
          선 굵기만 키우면 굵어졌다는 것만 보인다 — 번짐이 있어야 켜졌다고 읽힌다.
        */}
        <filter id="iso-lit" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#3182f6" floodOpacity="0.55" />
        </filter>
      </defs>

      <g transform="scale(1, 0.5)">
        {/* 무대 바닥 — 테두리 · 방들이 도는 길. */}
        <circle r={STAGE_R + 130} fill="rgba(148,163,184,0.03)" stroke="rgba(148,163,184,0.16)" strokeWidth={1.5} />
        <circle r={STAGE_R} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth={1.2} strokeDasharray="10 12" />

        {/* 방과 방 사이의 결. 전원선과 겹치지 않게 **두 방의 한가운데**(30° 씩 비킨 자리)에 둔다. */}
        {[-30, 30, 90, 150, 210, 270].map((angle) => (
          <line
            key={angle}
            x1={0}
            y1={0}
            {...endOf(angle, STAGE_R + 130)}
            stroke="rgba(148,163,184,0.09)"
            strokeWidth={1}
          />
        ))}

        {/* 전원선 — 방마다 하나씩. 꺼져 있어도 선은 늘 보인다(불빛이 어디로 갈지 미리 보인다). */}
        {NODES.map((node) => (
          <line
            key={node.id}
            x1={0}
            y1={0}
            {...endOf(angleOf(node), STAGE_R)}
            stroke={node.id === active.id ? 'rgba(138,186,255,0.5)' : 'rgba(148,163,184,0.16)'}
            strokeWidth={node.id === active.id ? 1.6 : 1}
            style={{ transition: 'stroke 300ms ease-out, stroke-width 300ms ease-out' }}
          />
        ))}

        {/*
          흘러가는 불빛 한 조각.

          `key` 에 향하는 곳을 넣어 **가리키는 곳이 바뀔 때마다 다시 태어나게** 한다 — 같은
          요소를 두면 CSS 애니메이션이 한 번 끝난 뒤 다시 돌지 않아, 두 번째부터는 아무 일도
          일어나지 않는다.
        */}
        <line
          key={target.id}
          x1={0}
          y1={0}
          {...endOf(angleOf(target), STAGE_R)}
          pathLength={100}
          strokeDasharray="20 100"
          stroke="#cfe4ff"
          strokeWidth={2.6}
          strokeLinecap="round"
          className="animate-iso-surge"
        />

        {/* 가운데 축 — 선 넷이 한 점에서 나온다는 것을 보이게 한다. */}
        <circle r={16} fill="#05060d" stroke="rgba(148,186,255,0.4)" strokeWidth={1.2} />
        <circle r={5} fill="rgba(138,186,255,0.75)" />

        {drawn.map((node) => {
          const lit = node.id === active.id;
          const tone = lit ? LIT : DIM;
          const phi = angleOf(node);

          return (
            <g
              key={node.id}
              /* 자리로 옮긴 뒤(`rotate φ · translate R`) 눕힘과 회전을 그대로 되돌린다. */
              transform={`rotate(${phi}) translate(${STAGE_R}, 0) rotate(${-phi}) scale(1, 2)`}
              onMouseEnter={() => onHover(node)}
              filter={lit ? 'url(#iso-lit)' : undefined}
              className="cursor-pointer"
            >
              <IsoPlatform cx={0} cy={0} r={RADIUS} tone={tone} active={lit} />
              <IsoWalls cx={0} cy={0} r={RADIUS} h={26} tone={tone} />
              <NodeShape node={node} tone={tone} lit={lit} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** 가운데에서 각도 `angle` 로 `r` 만큼 나간 자리 — `<line>` 이 받는 모양으로. */
function endOf(angle: number, r: number): { x2: number; y2: number } {
  const rad = (angle * Math.PI) / 180;
  return { x2: r * Math.cos(rad), y2: r * Math.sin(rad) };
}

/** 얼마나 앞에 있는가. 클수록 앞. */
function frontness(node: ServiceNode): number {
  return Math.sin((angleOf(node) * Math.PI) / 180);
}

/**
 * 판 위에 서는 것 — 서비스마다 다르다.
 *
 * 여기서는 어느 장면을 고를지만 정한다. 장면 자체는 `IsoEquipment` 에 있다 — 장비를 그리는
 * 일과 어느 칸이 켜졌는지 아는 일은 함께 바뀌지 않는다.
 */
function NodeShape({ node, tone, lit }: { node: ServiceNode; tone: IsoTone; lit: boolean }) {
  /* 장면은 늘 원점 둘레에 그려진다. 어디에 놓일지는 무대가 정한다(`IsoScene` 머리말). */
  const part = { cx: 0, cy: 0, tone, lit };

  if (node.id === 'consulting') return <ConsultingScene {...part} />;
  if (node.id === 'infra') return <InfraScene {...part} />;
  if (node.id === 'mes') return <MesScene {...part} />;
  if (node.id === 'erp') return <ErpScene {...part} />;
  if (node.id === 'crm') return <CrmScene {...part} />;
  return <DxpScene {...part} />;
}
