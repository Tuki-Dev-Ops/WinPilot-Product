import { IsoBox, IsoCylinder, IsoDisc, IsoPane, IsoPolyline, isoPoint, type IsoTone } from './IsoMap';

/**
 * 판 위에 서는 **실제 장비들**.
 *
 * ## 글자를 얹지 않는다
 * 전에는 각 판에 `MES` · `ERP` 같은 글자를 세워 두었다. 그림이 무엇인지 모르겠으니 이름을
 * 적어 둔 것인데, **그림에 이름표를 붙여야 알아본다면 그림이 제 몫을 못한 것**이다. 이름은
 * 왼쪽 제목과 숫자 단추에 이미 있다.
 *
 * 그래서 장비를 알아볼 수 있을 만큼 그린다 — 가공기는 문과 창과 조작반이 있고, 로봇은 마디가
 * 여섯이고, 컨베이어에는 롤러가 있고, 랙에는 팔레트가 얹혀 있다.
 *
 * ## 그래도 사진은 아니다
 * 선 몇 개로 알아보게 하는 것이 목표다. 볼트와 케이블까지 그리면 스무 개 도형이 백 개가 되고,
 * 그 차이는 **모양이 아니라 스크롤이 걸리는 것**으로 먼저 나타난다. 장비마다 알아보는 데
 * 결정적인 특징 두세 개만 남긴다.
 *
 * | 장비 | 알아보게 하는 것 |
 * |---|---|
 * | 머시닝 센터 | 상자 몸통 · 앞면의 창 · 위의 신호등 |
 * | 다관절 로봇 | 원기둥 받침 · 꺾인 마디 셋 · 끝의 그리퍼 |
 * | 컨베이어 | 다리로 띄운 긴 판 · 가로 롤러 선 · 그 위의 상자 |
 * | 적재 랙 | 기둥 넷 · 층 셋 · 층마다 놓인 팔레트 |
 * | 서버 랙 | 세운 캐비닛 · 앞면의 가로 슬롯 |
 * | 상담 부스 | 나란한 데스크 둘 · 사이의 칸막이 · 뒤 벽의 상황판 |
 * | 서버실 | 나란한 랙 셋 · 앞의 스위치 · 랙으로 올라가는 배선 · 항온항습기 |
 * | 빌더 작업대 | 넓은 상판에 깔린 블록들 · 비어 있는 점선 자리 · 그 위에 뜬 블록 |
 */

/**
 * 켜진 면의 색 — 창 · 화면 · 표시등처럼 스스로 빛나는 자리.
 *
 * 알파를 쓰지 않는다. 화면이 반투명이면 그 **뒤의 기계와 무대 선이 비쳐** 유리판이 되고,
 * 켜진 화면으로 읽히지 않는다. 배경에 미리 섞은 불투명한 색을 쓴다.
 */
function glowOf(lit: boolean): string {
  return lit ? '#7ba7e8' : '#1d2531';
}

/** 선으로만 그리는 것의 색 — 팔의 마디, 난간. */
function lineOf(lit: boolean): string {
  return lit ? 'rgba(215,232,255,0.9)' : 'rgba(148,163,184,0.5)';
}

type Part = { cx: number; cy: number; tone: IsoTone; lit: boolean };

/* ── 스마트 컨설팅 — 회의 ───────────────────────────────────────── */

/**
 * 둥근 탁자를 넷이 둘러서고, 옆에 보드가 선다.
 *
 * 나머지 셋과 달리 여기에는 기계가 없다. 그것이 이 칸의 뜻이다 — 컨설팅에서 오가는 것은
 * 설비가 아니라 **말**이고, 그래서 말풍선이 이 칸에만 있다.
 *
 * ## 앉히지 않고 세운다
 * 의자에 앉히면 회의실 사진이 된다. 서서 탁자를 둘러싼 모습은 **현장에서 도면을 놓고 이야기하는
 * 자리**로 읽힌다 — 컨설턴트가 하는 일이 회의가 아니라 진단이라는 것을 자세 하나가 말한다.
 *
 * 작게 그릴 때도 서 있는 쪽이 낫다. 의자와 등받이는 이 크기에서 몸통에 붙은 혹처럼 보인다.
 *
 * ## 뒤쪽 둘은 탁자보다 먼저 그린다
 * 아이소메트릭에서 앞뒤는 그리는 차례가 전부다. 넷을 한꺼번에 그리면 **탁자 너머의 사람이
 * 탁자 위로 떠오른다** — 뒤에 설 둘을 탁자보다 먼저, 앞의 둘을 나중에 그린다.
 */
export function ConsultingScene({ cx, cy, tone, lit }: Part) {
  const [bubbleX, bubbleY] = isoPoint(cx - 0.2, cy - 0.2, 104);
  const glow = glowOf(lit);

  return (
    <g>
      {/* 화이트보드 — 진단 결과를 세워 놓고 본다. */}
      <IsoBox x={cx - 1.85} y={cy - 1.5} w={0.09} d={0.09} h={12} tone={tone} />
      <IsoBox x={cx - 1.85} y={cy + 0.5} w={0.09} d={0.09} h={12} tone={tone} />
      <IsoPane x={cx - 1.8} y={cy - 1.5} len={2} h={34} base={12} axis="y" tone={tone} />
      {[0.32, 0.62, 0.92].map((t, index) => (
        <IsoPolyline
          key={t}
          points={[
            [cx - 1.79, cy - 1.35, 38 - index * 7],
            [cx - 1.79, cy - 1.35 + (index === 2 ? 0.8 : 1.5), 38 - index * 7],
          ]}
          color={glow}
          width={1.6}
        />
      ))}

      {/* 탁자 뒤에 서는 둘. */}
      {BEHIND.map(([dx, dy], index) => (
        <Attendee key={index} x={cx + dx} y={cy + dy} tone={tone} lit={lit} />
      ))}

      {/* 원형 탁자 — 외다리 받침 위의 상판. 가운데의 밝은 원은 펼쳐 놓은 도면이다. */}
      <IsoCylinder x={cx} y={cy} r={0.16} h={20} tone={tone} />
      <IsoDisc x={cx} y={cy} r={0.78} z={20} tone={tone} />
      <IsoDisc x={cx} y={cy} r={0.5} z={21} tone={tone} fill={glow} />

      {/* 탁자 앞에 서는 둘. */}
      {IN_FRONT.map(([dx, dy], index) => (
        <Attendee key={index} x={cx + dx} y={cy + dy} tone={tone} lit={lit} />
      ))}


      {/* 말풍선 — 이 칸을 나머지 셋과 가르는 것. */}
      <g>
        <rect
          x={bubbleX - 23}
          y={bubbleY - 16}
          width={46}
          height={27}
          rx={8}
          fill={lit ? '#1d3a68' : '#0e1621'}
          stroke={tone.line}
          strokeWidth={1}
        />
        <path
          d={`M ${bubbleX - 5} ${bubbleY + 10} L ${bubbleX + 1} ${bubbleY + 19} L ${bubbleX + 7} ${bubbleY + 10} Z`}
          fill={lit ? '#1d3a68' : '#0e1621'}
          stroke={tone.line}
          strokeWidth={1}
        />
        {[-10, 0, 10].map((dx) => (
          <circle key={dx} cx={bubbleX + dx} cy={bubbleY - 3} r={2.4} fill={lineOf(lit)} />
        ))}
      </g>
    </g>
  );
}

/** 탁자 **뒤**에 서는 자리. 마주 보게 둔다 — 한쪽으로 몰면 발표가 되고, 컨설팅은 대화다. */
const BEHIND: [number, number][] = [
  [0, -1.15],
  [-1.15, 0],
];

/** 탁자 **앞**에 서는 자리. */
const IN_FRONT: [number, number][] = [
  [1.15, 0],
  [0, 1.15],
];

/** 서 있는 사람 하나 — 몸통과 머리. */
function Attendee({ x, y, tone, lit }: { x: number; y: number; tone: IsoTone; lit: boolean }) {
  return (
    <g>
      {/*
        다리를 나누지 않는다. 이 크기(사람 키 40px 남짓)에서 다리 둘을 그리면 선 두 개가
        붙어 하나로 보이고, 그 자리에 생기는 것은 다리가 아니라 얼룩이다.
      */}
      <IsoCylinder x={x} y={y} r={0.14} h={30} tone={tone} />
      <circle {...screen(x, y, 37)} r={4.8} fill={tone.top} stroke={tone.line} strokeWidth={1} />
      {lit && <circle {...screen(x, y, 37)} r={4.8} fill="rgba(138,186,255,0.18)" />}
    </g>
  );
}

/* ── Cloud MES — 가공 라인 ──────────────────────────────────────── */

/**
 * 머시닝 센터 · 다관절 로봇 · 컨베이어 · 안전 펜스.
 *
 * 셋을 한 판에 세운 이유: MES 가 읽는 것이 **설비가 내보내는 신호**라, 신호를 내보내는 물건이
 * 보여야 한다. 기계 한 대만 두면 공장이 아니라 기계 한 대다.
 */
export function MesScene({ cx, cy, tone, lit }: Part) {
  const glow = glowOf(lit);
  const line = lineOf(lit);

  return (
    <g>
      {/* 안전 펜스 — 뒤쪽 한 줄. 사람이 들어가지 않는 구역이라는 표시다. */}
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <IsoBox
          key={index}
          x={cx - 1.85 + index * 0.72}
          y={cy - 1.9}
          w={0.07}
          d={0.07}
          h={28}
          tone={tone}
        />
      ))}
      <IsoPolyline
        points={[
          [cx - 1.85, cy - 1.87, 28],
          [cx + 1.75, cy - 1.87, 28],
        ]}
        color={line}
        width={1.2}
      />

      {/* 머시닝 센터 — 몸통 · 앞창 · 조작반 · 신호등. */}
      <IsoBox x={cx - 1.75} y={cy - 1.55} w={1.5} d={1.35} h={46} tone={tone} />
      <IsoPane x={cx - 1.6} y={cy - 0.19} len={1.2} h={17} base={22} axis="x" tone={tone} />
      <IsoPolyline
        points={[
          [cx - 1.6, cy - 0.18, 39],
          [cx - 0.4, cy - 0.18, 39],
        ]}
        color={glow}
        width={2.4}
      />
      <IsoBox x={cx - 0.32} y={cy - 1.1} w={0.3} d={0.42} h={5} base={30} tone={tone} fill={glow} />
      <IsoCylinder x={cx - 1.35} y={cy - 1} r={0.09} h={13} base={46} tone={tone} fill={glow} />

      {/* 다관절 로봇 — 받침 · 몸통 · 마디 셋 · 그리퍼. */}
      <IsoCylinder x={cx + 0.55} y={cy - 1.1} r={0.34} h={7} tone={tone} />
      <IsoCylinder x={cx + 0.55} y={cy - 1.1} r={0.24} h={15} base={7} tone={tone} />
      <IsoPolyline
        points={[
          [cx + 0.55, cy - 1.1, 22],
          [cx + 0.55, cy - 1.1, 44],
          [cx + 1.25, cy - 0.95, 56],
          [cx + 1.72, cy - 0.5, 40],
        ]}
        color={line}
        width={3.2}
      />
      {ROBOT_JOINTS.map(([dx, dy, dz], index) => (
        <circle
          key={index}
          {...screen(cx + dx, cy + dy, dz)}
          r={index === 0 ? 3.4 : 2.8}
          fill={tone.top}
          stroke={line}
          strokeWidth={1.2}
        />
      ))}
      <IsoBox x={cx + 1.62} y={cy - 0.6} w={0.22} d={0.22} h={6} base={32} tone={tone} fill={glow} />

      {/* 컨베이어 — 다리로 띄운 판, 가로 롤러, 그 위의 상자 둘. */}
      {(
        [
          [cx - 1.75, cy + 0.75],
          [cx - 1.75, cy + 1.35],
          [cx + 1.45, cy + 0.75],
          [cx + 1.45, cy + 1.35],
        ] as [number, number][]
      ).map(([lx, ly], index) => (
        <IsoBox key={index} x={lx} y={ly} w={0.1} d={0.1} h={17} tone={tone} />
      ))}
      <IsoBox x={cx - 1.8} y={cy + 0.7} w={3.4} d={0.78} h={6} base={17} tone={tone} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
        <IsoPolyline
          key={index}
          points={[
            [cx - 1.7 + index * 0.42, cy + 0.72, 23],
            [cx - 1.7 + index * 0.42, cy + 1.46, 23],
          ]}
          color={line}
          width={0.9}
        />
      ))}
      <IsoBox x={cx - 1.1} y={cy + 0.88} w={0.44} d={0.44} h={15} base={23} tone={tone} />
      <IsoBox x={cx + 0.35} y={cy + 0.88} w={0.44} d={0.44} h={15} base={23} tone={tone} />
    </g>
  );
}

/** 팔의 마디가 꺾이는 자리 — 위 `IsoPolyline` 의 점들과 같은 곳이다. */
const ROBOT_JOINTS: [number, number, number][] = [
  [0.55, -1.1, 44],
  [1.25, -0.95, 56],
];

/* ── 인프라 서비스 — 서버실 ─────────────────────────────────────── */

/**
 * 랙 셋 · 네트워크 스위치 · 배선 · 무정전 전원 · 항온항습기.
 *
 * 앞 칸(컨설팅)에서 무엇을 할지 정하고 나면 그것을 **올려 둘 자리**가 필요하다. 이 칸이
 * 그것이다 — MES·ERP·CRM 이 도는 바탕이라 흐름에서 둘째에 선다.
 *
 * ## 배선을 그리는 이유
 * 랙만 세우면 서버가 아니라 캐비닛 셋이다. 스위치에서 랙으로 올라가는 선 몇 가닥이 그것을
 * **이어져 도는 것**으로 만든다. 실제 서버실에서 눈에 먼저 들어오는 것도 그 선이다.
 *
 * ## 항온항습기
 * 서버실을 사무실과 가르는 것이 이것이다. 큰 상자에 가로 살(루버) 몇 줄이면 알아본다.
 */
export function InfraScene({ cx, cy, tone, lit }: Part) {
  const glow = glowOf(lit);
  const line = lineOf(lit);

  /** 랙 세 대가 서는 자리. */
  const racks = [-1.75, -0.95, -0.15];

  return (
    <g>
      {/* 바닥 케이블 트레이 — 선이 어디로 지나는지. */}
      <IsoBox x={cx - 1.85} y={cy + 0.35} w={3.5} d={0.32} h={4} tone={tone} />
      {[0, 1, 2, 3, 4, 5, 6].map((index) => (
        <IsoPolyline
          key={index}
          points={[
            [cx - 1.7 + index * 0.48, cy + 0.37, 5],
            [cx - 1.7 + index * 0.48, cy + 0.65, 5],
          ]}
          color={line}
          width={0.9}
        />
      ))}

      {/* 랙 셋 — 앞면의 가로 슬롯이 캐비닛과 가른다. 가운데 한 대만 불이 들어와 있다. */}
      {racks.map((rx, index) => (
        <g key={rx}>
          <IsoBox x={cx + rx} y={cy - 1.7} w={0.72} d={0.9} h={56} tone={tone} />
          {[12, 22, 32, 42].map((z) => (
            <IsoPolyline
              key={z}
              points={[
                [cx + rx + 0.06, cy - 0.81, z],
                [cx + rx + 0.66, cy - 0.81, z],
              ]}
              color={index === 1 && z === 32 ? glow : line}
              width={index === 1 && z === 32 ? 2.2 : 1.1}
            />
          ))}
          <IsoBox x={cx + rx + 0.12} y={cy - 1.55} w={0.48} d={0.6} h={3} base={56} tone={tone} fill={glow} />
        </g>
      ))}

      {/* 항온항습기 — 서버실을 사무실과 가르는 것. */}
      <IsoBox x={cx + 0.95} y={cy - 1.75} w={0.8} d={1} h={64} tone={tone} />
      {[16, 26, 36, 46].map((z) => (
        <IsoPolyline
          key={z}
          points={[
            [cx + 1.02, cy - 0.76, z],
            [cx + 1.68, cy - 0.76, z],
          ]}
          color={line}
          width={1.6}
        />
      ))}

      {/* 네트워크 스위치 — 포트 여덟 개가 앞을 보고 있다. */}
      <IsoBox x={cx - 1.5} y={cy + 1.05} w={1.5} d={0.5} h={12} base={10} tone={tone} />
      <IsoBox x={cx - 1.42} y={cy + 1.1} w={0.12} d={0.12} h={10} tone={tone} />
      <IsoBox x={cx - 0.2} y={cy + 1.1} w={0.12} d={0.12} h={10} tone={tone} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
        <IsoPolyline
          key={index}
          points={[
            [cx - 1.42 + index * 0.18, cy + 1.56, 16],
            [cx - 1.42 + index * 0.18, cy + 1.56, 20],
          ]}
          color={index % 3 === 0 ? glow : line}
          width={2.4}
        />
      ))}

      {/* 배선 — 스위치에서 랙 위로. 이 몇 가닥이 캐비닛 셋을 서버실로 만든다. */}
      {racks.map((rx, index) => (
        <IsoPolyline
          key={rx}
          points={[
            [cx - 1.1 + index * 0.35, cy + 1.2, 22],
            [cx + rx + 0.36, cy + 0.5, 46 + index * 4],
            [cx + rx + 0.36, cy - 0.8, 50 + index * 4],
          ]}
          color={line}
          width={1.5}
          dashed
        />
      ))}

      {/* 무정전 전원 — 정전에도 꺼지지 않는다는 것. 표시등 하나로 족하다. */}
      <IsoBox x={cx + 1.1} y={cy + 0.75} w={0.6} d={0.6} h={26} tone={tone} />
      <IsoBox x={cx + 1.18} y={cy + 0.83} w={0.44} d={0.44} h={3} base={26} tone={tone} fill={glow} />
    </g>
  );
}

/* ── Cloud ERP — 자원 ──────────────────────────────────────────── */

/**
 * 적재 랙 둘 · 서버 랙 · 재고 단말 · 지게차 · 팔레트 더미 · 바닥 구획선.
 *
 * ERP 가 다루는 것이 **자원**이라, 자재가 놓인 자리(랙·팔레트)와 그것을 옮기는 것(지게차),
 * 그리고 그 전부를 세는 자리(서버·단말)를 함께 둔다. 서버만 그리면 소프트웨어 이야기가 되고,
 * 창고만 그리면 물류 이야기가 된다 — ERP 는 **그 둘이 같은 숫자를 보는 것**이다.
 *
 * ## 지게차를 넣은 이유
 * 랙과 팔레트만 두면 멈춰 있는 창고다. 움직이는 것이 하나 있어야 **자원이 흐른다**로 읽히고,
 * 창고에서 그 일을 하는 것이 지게차다.
 *
 * ## 바닥의 구획선
 * 실제 창고 바닥에는 적재 구역이 선으로 그어져 있다. 그 선 하나가 이 판을 **바닥**으로 만든다 —
 * 없으면 물건들이 회색 판 위에 얹혀 있는 것으로만 보인다.
 */
export function ErpScene({ cx, cy, tone, lit }: Part) {
  const glow = glowOf(lit);
  const line = lineOf(lit);

  return (
    <g>
      {/* 바닥 구획선 — 팔레트가 놓이는 자리. */}
      <IsoPolyline
        points={[
          [cx - 1.85, cy + 0.55, 1],
          [cx - 0.35, cy + 0.55, 1],
          [cx - 0.35, cy + 1.75, 1],
          [cx - 1.85, cy + 1.75, 1],
          [cx - 1.85, cy + 0.55, 1],
        ]}
        color={lit ? 'rgba(138,186,255,0.4)' : 'rgba(148,163,184,0.22)'}
        width={1.4}
        dashed
      />

      {/* 적재 랙 둘 — 뒤에 나란히. 하나만 두면 선반이고, 둘이 서면 창고다. */}
      <Rack x={cx - 1.85} y={cy - 1.8} tone={tone} />
      <Rack x={cx - 1.85} y={cy - 0.6} tone={tone} short />

      {/* 서버 랙 — 앞면의 가로 슬롯이 이것을 캐비닛이 아니라 랙으로 만든다. */}
      <IsoBox x={cx + 0.55} y={cy - 1.7} w={0.85} d={0.95} h={54} tone={tone} />
      {[10, 20, 30, 40].map((z) => (
        <IsoPolyline
          key={z}
          points={[
            [cx + 0.62, cy - 0.74, z],
            [cx + 1.33, cy - 0.74, z],
          ]}
          color={z === 30 ? glow : line}
          width={z === 30 ? 2.2 : 1.1}
        />
      ))}
      <IsoBox x={cx + 0.7} y={cy - 1.55} w={0.55} d={0.65} h={3} base={54} tone={tone} fill={glow} />

      {/* 재고 단말 — 현장에서 수량을 확인하고 적는 자리. 창고와 서버를 잇는 것이 이것이다. */}
      <IsoBox x={cx + 1.6} y={cy - 0.5} w={0.24} d={0.24} h={26} tone={tone} />
      <IsoPane x={cx + 1.5} y={cy - 0.48} len={0.5} h={16} base={26} axis="x" tone={tone} />
      <IsoPolyline
        points={[
          [cx + 1.56, cy - 0.47, 36],
          [cx + 1.94, cy - 0.47, 36],
        ]}
        color={glow}
        width={2.2}
      />

      {/* 팔레트 더미 — 랙에 다 들어가지 못한 것이 구획선 안에 남는다. */}
      <Pallet x={cx - 1.7} y={cy + 0.75} w={0.9} d={0.8} h={17} tone={tone} />
      <Pallet x={cx - 0.95} y={cy + 1.1} w={0.55} d={0.5} h={11} tone={tone} />

      {/* 지게차 — 팔레트 하나를 들어 올린 채. */}
      <Forklift x={cx + 0.1} y={cy + 0.7} tone={tone} lit={lit} />
    </g>
  );
}

/** 적재 랙 하나 — 기둥 넷 · 층 셋(또는 둘) · 층마다 놓인 팔레트. */
function Rack({ x, y, tone, short = false }: { x: number; y: number; tone: IsoTone; short?: boolean }) {
  const shelves = short ? [2, 26] : [2, 26, 50];
  const posts = short ? 42 : 66;

  return (
    <g>
      {(
        [
          [x, y],
          [x + 1.45, y],
          [x, y + 1],
          [x + 1.45, y + 1],
        ] as [number, number][]
      ).map(([px, py], index) => (
        <IsoBox key={index} x={px} y={py} w={0.1} d={0.1} h={posts} tone={tone} />
      ))}
      {shelves.map((z) => (
        <IsoBox key={z} x={x} y={y} w={1.55} d={1.1} h={4} base={z} tone={tone} />
      ))}
      {/* 층이 비어 있으면 랙인지 사다리인지 알 수 없다. */}
      <IsoBox x={x + 0.2} y={y + 0.2} w={0.55} d={0.5} h={14} base={6} tone={tone} />
      <IsoBox x={x + 0.95} y={y + 0.2} w={0.45} d={0.5} h={11} base={6} tone={tone} />
      <IsoBox x={x + 0.2} y={y + 0.2} w={0.6} d={0.55} h={13} base={30} tone={tone} />
    </g>
  );
}

/** 팔레트 — 받침 널 위에 짐. 받침을 따로 그려야 상자 무더기와 갈린다. */
function Pallet({
  x,
  y,
  w,
  d,
  h,
  base = 0,
  tone,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  base?: number;
  tone: IsoTone;
}) {
  return (
    <g>
      <IsoBox x={x} y={y} w={w} d={d} h={5} base={base} tone={tone} />
      <IsoBox x={x + 0.08} y={y + 0.08} w={w - 0.16} d={d - 0.16} h={h} base={base + 5} tone={tone} />
    </g>
  );
}

/**
 * 지게차 — 몸통 · 운전석 지붕 · 마스트 · 포크 · 그 위의 팔레트.
 *
 * 마스트(앞쪽에 세운 기둥 둘)가 이것을 자동차와 가르는 자리다. 그것이 없으면 지붕 달린
 * 작은 차일 뿐이다.
 */
function Forklift({ x, y, tone, lit }: { x: number; y: number; tone: IsoTone; lit: boolean }) {
  const line = lineOf(lit);

  return (
    <g>
      {/* 바퀴 — 낮고 짙게. 몸통이 바닥에 붙어 있으면 미끄러지는 것으로 보인다. */}
      <IsoBox x={x + 0.05} y={y + 0.02} w={0.16} d={0.16} h={7} tone={tone} />
      <IsoBox x={x + 0.05} y={y + 0.62} w={0.16} d={0.16} h={7} tone={tone} />
      <IsoBox x={x + 0.62} y={y + 0.02} w={0.16} d={0.16} h={7} tone={tone} />
      <IsoBox x={x + 0.62} y={y + 0.62} w={0.16} d={0.16} h={7} tone={tone} />

      {/* 몸통과 운전석. */}
      <IsoBox x={x} y={y} w={0.85} d={0.8} h={17} base={7} tone={tone} />
      <IsoBox x={x + 0.05} y={y + 0.15} w={0.4} d={0.5} h={9} base={24} tone={tone} />
      <IsoBox x={x + 0.03} y={y + 0.05} w={0.07} d={0.07} h={22} base={24} tone={tone} />
      <IsoBox x={x + 0.03} y={y + 0.7} w={0.07} d={0.07} h={22} base={24} tone={tone} />
      <IsoBox x={x} y={y} w={0.55} d={0.85} h={3} base={46} tone={tone} />

      {/* 마스트 — 앞쪽에 세운 기둥 둘. */}
      <IsoBox x={x + 0.88} y={y + 0.06} w={0.07} d={0.07} h={52} tone={tone} />
      <IsoBox x={x + 0.88} y={y + 0.66} w={0.07} d={0.07} h={52} tone={tone} />
      <IsoPolyline
        points={[
          [x + 0.91, y + 0.09, 52],
          [x + 0.91, y + 0.69, 52],
        ]}
        color={line}
        width={1.4}
      />

      {/* 포크와 그 위에 든 팔레트. */}
      <IsoPolyline
        points={[
          [x + 0.91, y + 0.16, 15],
          [x + 1.42, y + 0.16, 15],
        ]}
        color={line}
        width={2.2}
      />
      <IsoPolyline
        points={[
          [x + 0.91, y + 0.62, 15],
          [x + 1.42, y + 0.62, 15],
        ]}
        color={line}
        width={2.2}
      />
      <Pallet x={x + 0.93} y={y + 0.1} w={0.5} d={0.58} h={12} base={16} tone={tone} />
    </g>
  );
}

/* ── Cloud DXP — 로우코드 빌더 ──────────────────────────────────── */

/**
 * 작업대 위에 블록을 놓아 화면을 짜는 자리 — 부품 서랍 · 상판의 블록들 · 빈 자리 · 미리보기.
 *
 * ## 무엇으로 로우코드인지 알아보게 하는가
 * **떠 있는 블록 하나와 그 아래 점선 자리**다. 그 둘이 같이 있으면 "집어서 놓는 중" 이 되고,
 * 그것이 곧 코드를 쓰지 않고 화면을 만든다는 말이다. 블록만 늘어놓으면 그냥 쌓아 둔 상자다.
 *
 * ## 미리보기를 뒤에 세우는 이유
 * 만든 것이 어디에 나타나는지가 보여야 한다. 작업대의 블록 배치와 뒤 화면의 줄 배치를 닮게
 * 그려, 여기서 놓은 것이 저기에 뜬다는 것을 자리로 말한다.
 */
export function DxpScene({ cx, cy, tone, lit }: Part) {
  const glow = glowOf(lit);
  const line = lineOf(lit);

  return (
    <g>
      {/* 미리보기 — 뒤에 세운 큰 화면. 상판에 깔린 블록과 같은 짜임으로 줄을 긋는다. */}
      <IsoBox x={cx - 0.35} y={cy - 1.9} w={0.12} d={0.12} h={22} tone={tone} />
      <IsoPane x={cx - 1.2} y={cy - 1.88} len={2} h={44} base={22} axis="x" tone={tone} />
      <IsoPolyline
        points={[
          [cx - 1.12, cy - 1.87, 60],
          [cx + 0.72, cy - 1.87, 60],
        ]}
        color={glow}
        width={3}
      />
      {[50, 42, 34].map((z, index) => (
        <IsoPolyline
          key={z}
          points={[
            [cx - 1.12, cy - 1.87, z],
            [cx - 1.12 + [1.84, 1.2, 1.6][index]!, cy - 1.87, z],
          ]}
          color={line}
          width={2}
        />
      ))}

      {/* 부품 서랍 — 아직 쓰지 않은 블록들이 층층이 있다. */}
      <IsoBox x={cx + 1.15} y={cy - 1.5} w={0.6} d={0.9} h={4} tone={tone} />
      {[14, 26, 38].map((z) => (
        <g key={z}>
          <IsoBox x={cx + 1.15} y={cy - 1.5} w={0.6} d={0.9} h={3} base={z} tone={tone} />
          <IsoBox x={cx + 1.24} y={cy - 1.35} w={0.4} d={0.28} h={5} base={z + 3} tone={tone} />
        </g>
      ))}

      {/* 작업대 — 다리 넷 위의 넓은 상판. */}
      {(
        [
          [cx - 1.45, cy - 0.65],
          [cx + 0.95, cy - 0.65],
          [cx - 1.45, cy + 0.95],
          [cx + 0.95, cy + 0.95],
        ] as [number, number][]
      ).map(([lx, ly], index) => (
        <IsoBox key={index} x={lx} y={ly} w={0.12} d={0.12} h={24} tone={tone} />
      ))}
      <IsoBox x={cx - 1.55} y={cy - 0.75} w={2.7} d={1.9} h={5} base={24} tone={tone} />

      {/* 상판에 깔린 블록들 — 하나만 밝다. 지금 손대고 있는 것이라는 표시다. */}
      <IsoBox x={cx - 1.4} y={cy - 0.6} w={1.5} d={0.35} h={6} base={29} tone={tone} fill={glow} />
      <IsoBox x={cx - 1.4} y={cy - 0.1} w={0.65} d={0.55} h={6} base={29} tone={tone} />
      <IsoBox x={cx - 0.6} y={cy - 0.1} w={0.65} d={0.55} h={6} base={29} tone={tone} />
      <IsoBox x={cx - 1.4} y={cy + 0.6} w={1.5} d={0.35} h={6} base={29} tone={tone} />
      <IsoBox x={cx + 0.3} y={cy - 0.6} w={0.7} d={1.1} h={6} base={29} tone={tone} />

      {/* 비어 있는 자리 — 점선이라 아직 아무것도 놓이지 않았다는 뜻이다. */}
      <IsoPolyline
        points={[
          [cx + 0.3, cy + 0.6, 30],
          [cx + 1, cy + 0.6, 30],
          [cx + 1, cy + 0.95, 30],
          [cx + 0.3, cy + 0.95, 30],
          [cx + 0.3, cy + 0.6, 30],
        ]}
        color={lit ? 'rgba(138,186,255,0.8)' : 'rgba(148,163,184,0.45)'}
        width={1.4}
        dashed
      />

      {/* 그 위에 뜬 블록 — 집어서 내려놓는 중. 아래로 내려가는 점선이 어디에 놓일지 가리킨다. */}
      <IsoPolyline
        points={[
          [cx + 0.65, cy + 0.78, 30],
          [cx + 0.65, cy + 0.78, 56],
        ]}
        color={line}
        width={1.2}
        dashed
      />
      <IsoBox x={cx + 0.3} y={cy + 0.6} w={0.7} d={0.35} h={7} base={56} tone={tone} fill={glow} />
    </g>
  );
}

/* ── Cloud CRM — 상담 센터 ──────────────────────────────────────── */

/**
 * 상황판 · 상담석 둘 · 칸막이 · 서류 캐비닛 · 대기 구역.
 *
 * 앞의 셋에서 공정을 자동으로 돌려 놓고, 그 끝에서 고객을 받는 자리다. 받는 것도 **AI 다** —
 * 사람 모형을 세우면 여기서만 자동화가 끊긴 것으로 읽힌다(`AiRobot` 머리말).
 *
 * ## 상담석을 둘 둔 이유
 * 하나만 두면 책상이고, 둘이 나란히 서고 사이에 칸막이가 있으면 **상담 센터**가 된다. 한 대
 * 늘리는 것으로 장면의 뜻이 바뀌는 자리라 여기서만 그렇게 한다.
 *
 * ## 뒤 벽의 상황판
 * 대기 건수와 응답 시간을 벽에 띄워 두는 것이 상담 센터의 모습이다. 막대 넷으로 줄여 그렸다 —
 * 숫자를 적으면 읽으려 들고, 이 그림에서 읽을 것은 글이 아니다.
 */
export function CrmScene({ cx, cy, tone, lit }: Part) {
  const glow = glowOf(lit);
  const line = lineOf(lit);

  return (
    <g>
      {/* 뒤 벽의 상황판 — 틀과 막대 넷. */}
      <IsoPane x={cx - 1.55} y={cy - 1.92} len={2.4} h={30} base={34} axis="x" tone={tone} />
      {[0, 1, 2, 3].map((index) => (
        <IsoPolyline
          key={index}
          points={[
            [cx - 1.3 + index * 0.58, cy - 1.91, 40],
            [cx - 1.3 + index * 0.58, cy - 1.91, 40 + [12, 20, 8, 16][index]!],
          ]}
          color={index === 1 ? glow : line}
          width={index === 1 ? 4 : 3}
        />
      ))}

      {/* 서류 캐비닛 — 남는 기록이 어디에 쌓이는지. */}
      <IsoBox x={cx - 1.85} y={cy - 1.2} w={0.6} d={0.75} h={38} tone={tone} />
      {[10, 21, 32].map((z) => (
        <IsoPolyline
          key={z}
          points={[
            [cx - 1.25, cy - 1.12, z],
            [cx - 1.25, cy - 0.52, z],
          ]}
          color={line}
          width={1.1}
        />
      ))}

      {/* 상담석 둘과 그 사이의 칸막이. */}
      <Booth x={cx - 1.15} y={cy - 0.8} tone={tone} lit={lit} facing="left" />
      <IsoPane x={cx + 0.05} y={cy - 1} len={1.5} h={26} base={0} axis="y" tone={tone} />
      <Booth x={cx + 0.35} y={cy - 0.8} tone={tone} lit={lit} facing="right" />

      {/* 대기 구역 — 긴 의자와 낮은 탁자. */}
      <IsoBox x={cx - 1.5} y={cy + 1.05} w={1.5} d={0.45} h={9} tone={tone} />
      <IsoPane x={cx - 1.5} y={cy + 1.05} len={1.5} h={14} base={9} axis="x" tone={tone} />
      <IsoBox x={cx + 0.35} y={cy + 1.15} w={0.6} d={0.5} h={11} tone={tone} />
    </g>
  );
}

/**
 * 상담석 하나 — 데스크 · 모니터 · 전화기 · 그 자리를 지키는 AI 로봇.
 *
 * `facing` 은 모니터를 어느 쪽으로 트는가다. 둘을 똑같이 두면 복사해 붙인 것으로 보이고,
 * 실제 상담 센터에서도 마주 보게 앉히지 않는다.
 *
 * ## 로봇이 데스크 **뒤**에 선다
 * 아이소메트릭에서 보이는 옆면은 둘뿐이다(`+x` 쪽과 `+y` 쪽). 그래서 무엇이든 그 두 방향으로만
 * 얼굴을 돌릴 수 있고, 반대로 돌리면 뒤통수만 남는다.
 *
 * 로봇을 데스크 앞(`+y`)에 두면 모니터를 보려고 `-y` 로 돌아서야 해서 **눈이 사라진다.**
 * 뒤(`-y`)에 세우면 모니터가 로봇의 `+y` 쪽에 놓여, 얼굴을 그대로 둔 채 모니터를 마주한다 —
 * 창구 너머에서 직원을 보는 그 각도다.
 *
 * 모니터를 낮춘 것도 그래서다. 원래 높이로 두면 화면이 로봇의 머리를 통째로 가린다.
 */
function Booth({
  x,
  y,
  tone,
  lit,
  facing,
}: {
  x: number;
  y: number;
  tone: IsoTone;
  lit: boolean;
  facing: 'left' | 'right';
}) {
  const glow = glowOf(lit);
  const tilt = facing === 'left' ? -0.06 : 0.06;

  return (
    <g>
      {/*
        로봇이 **먼저** 그려진다. 데스크 뒤에 서기 때문이다 — 아이소메트릭에서 앞뒤는 그리는
        차례가 전부라, 뒤에 세울 것을 나중에 그리면 데스크 위에 올라선 것이 된다.
      */}
      <AiRobot x={x + 0.5} y={y - 0.5} tone={tone} lit={lit} />

      {/* 데스크 — 다리 둘 위의 상판. */}
      <IsoBox x={x + 0.05} y={y + 0.05} w={0.1} d={0.1} h={24} tone={tone} />
      <IsoBox x={x + 0.85} y={y + 0.05} w={0.1} d={0.1} h={24} tone={tone} />
      <IsoBox x={x} y={y} w={1.05} d={0.7} h={5} base={24} tone={tone} />

      {/* 모니터 — 받침 · 목 · 화면. 화면 가운데의 밝은 줄이 켜져 있다는 표시다. */}
      <IsoBox x={x + 0.3} y={y + 0.18} w={0.28} d={0.14} h={3} base={29} tone={tone} />
      <IsoBox x={x + 0.42} y={y + 0.22} w={0.05} d={0.05} h={4} base={32} tone={tone} />
      <IsoPane x={x + 0.22 + tilt} y={y + 0.2} len={0.66} h={16} base={32} axis="x" tone={tone} />
      <IsoPolyline
        points={[
          [x + 0.28 + tilt, y + 0.21, 44],
          [x + 0.82 + tilt, y + 0.21, 44],
        ]}
        color={glow}
        width={2.6}
      />

      {/* 전화기 — 상담석을 사무 책상과 가르는 것. */}
      <IsoBox x={x + 0.72} y={y + 0.42} w={0.22} d={0.18} h={4} base={29} tone={tone} fill={glow} />

    </g>
  );
}

/**
 * 상담을 받는 **AI 로봇**.
 *
 * ## 사람 모형을 쓰지 않는다
 * 사람을 그리면 "사람이 많이 필요한 일" 로 읽힌다. 이 회사가 파는 것은 그 반대다 — 앞의 세
 * 칸에서 공정을 자동으로 돌려 놓고 마지막 칸만 사람으로 메우면 이야기가 거기서 끊긴다.
 *
 * ## 로봇으로 보이게 하는 것
 * 다리가 없다(바퀴 받침). 눈이 둘이고 빛난다. 머리 위에 안테나가 있다. 셋 중 하나만 빠져도
 * 사람 모형과 구별되지 않는다 — 특히 **다리**다. 서 있는 원기둥에 머리를 얹으면 그것은
 * 사람이다.
 *
 * ## 팔도 헤드셋도 없다
 * 둘 다 그렸다가 뺐다. 이 크기(높이 50px 남짓)에서 팔은 몸통에서 삐져나온 선 두 개가 되고,
 * 헤드셋 띠는 머리 위의 안테나와 붙어 **무엇이 무엇인지 알 수 없는 덩어리**가 된다. 작게
 * 그리는 그림에서는 못 알아볼 것을 넣지 않는 편이 알아볼 것을 늘린다.
 *
 * 상담 자리라는 것은 로봇이 아니라 **주변이 말한다** — 데스크와 모니터, 전화기, 뒤 벽의
 * 상황판, 칸막이. 로봇에까지 그 표시를 얹을 까닭이 없다.
 */
function AiRobot({ x, y, tone, lit }: { x: number; y: number; tone: IsoTone; lit: boolean }) {
  const glow = glowOf(lit);
  const line = lineOf(lit);
  const eye = lit ? '#cfe4ff' : 'rgba(148,163,184,0.6)';

  return (
    <g>
      {/* 바퀴 받침 — 다리 대신. 상담 로봇은 서 있지 않고 자리를 옮겨 다닌다. */}
      <IsoCylinder x={x} y={y} r={0.26} h={5} tone={tone} />
      <IsoCylinder x={x} y={y} r={0.19} h={4} base={5} tone={tone} fill={glow} />

      {/* 몸통 — 가슴에 작은 표시창. */}
      <IsoCylinder x={x} y={y} r={0.21} h={28} base={9} tone={tone} />
      <IsoPolyline
        points={[
          [x - 0.12, y + 0.19, 30],
          [x + 0.12, y + 0.19, 30],
        ]}
        color={glow}
        width={3.4}
      />

      {/* 머리 — 둥근 상자에 눈 둘. 눈은 모니터가 있는 `+y` 쪽 면에 둔다(`Booth` 머리말). */}
      <IsoBox x={x - 0.16} y={y - 0.16} w={0.32} d={0.32} h={12} base={37} tone={tone} />
      <circle {...screen(x - 0.03, y + 0.16, 44)} r={2.1} fill={eye} />
      <circle {...screen(x + 0.13, y + 0.16, 44)} r={2.1} fill={eye} />

      {/* 안테나 — 끝의 점이 켜져 있으면 응답 중이다. */}
      <IsoPolyline
        points={[
          [x, y, 49],
          [x, y, 59],
        ]}
        color={line}
        width={1.4}
      />
      <circle {...screen(x, y, 61)} r={2.4} fill={lit ? '#cfe4ff' : line} />
    </g>
  );
}

/* ── 거드는 것들 ───────────────────────────────────────────────── */

/** 격자 좌표를 `<circle>` 이 받는 모양(`cx`/`cy`)으로. */
function screen(x: number, y: number, z: number): { cx: number; cy: number } {
  const [sx, sy] = isoPoint(x, y, z);
  return { cx: sx, cy: sy };
}
