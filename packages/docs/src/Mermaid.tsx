'use client';

import { useCallback, useEffect, useId, useState, type ReactNode } from 'react';

/**
 * Mermaid 도면.
 *
 * **브라우저에서만 그린다.** mermaid 는 DOM 을 재서 글자 폭을 정하므로 서버에서 부르면 터진다.
 * 그래서 `useEffect` 안에서 동적 import 한다 — 이렇게 두면 문서 화면을 열지 않는 사람의
 * 첫 로딩에 mermaid 가 실려 오지도 않는다.
 *
 * 카드에는 **원본을 접어 둔다.** 도면은 결국 다른 곳(이슈·위키·작업 도구)에 옮겨 붙게 되는데,
 * 그림만 있으면 손으로 다시 그려야 한다.
 *
 * 도면을 누르면 **전체 화면으로 크게 본다.** 갈래가 열을 넘어가면 카드 폭에 맞춰 줄어든 그림은
 * 글자를 읽을 수 없다. 확대 창에서는 100% 가 곧 도면의 원래 크기이고, 작으면 한가운데,
 * 크면 잘리지 않고 스크롤된다.
 *
 * ## 어드민 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
 */
export type MermaidProps = {
  /** mermaid 원본 */
  code: string;
  /** 카드 머리에 붙는 이름 */
  title?: string;
};

type Natural = { width: number; height: number };

/** 그려진 SVG 에서 원래 크기를 읽는다 — 확대 창의 100% 가 이 값이다. */
function naturalSize(svg: string): Natural {
  const box = svg.match(/viewBox="([\d.\-\s]+)"/);
  if (!box?.[1]) return { width: 960, height: 540 };

  const parts = box[1].trim().split(/\s+/).map(Number);
  const width = parts[2];
  const height = parts[3];
  if (!width || !height) return { width: 960, height: 540 };

  return { width: Math.round(width), height: Math.round(height) };
}

const ZOOM_STEPS = [0.5, 0.75, 1, 1.5, 2, 3];

/**
 * 선을 **완전히 직각**으로 만든다.
 *
 * `curve: 'step'` 은 꺾이는 자리를 직각으로 계산하지만, mermaid 가 선에 `stroke-linecap: round`
 * 와 `stroke-linejoin: round` 를 걸어 두어 끝과 모서리가 둥글게 그려진다. 계산은 직각인데
 * 그림만 휘어 있는 상태라, 갈래가 많아지면 어느 선이 어디서 꺾였는지 눈으로 못 따라간다.
 *
 * 화살촉도 같은 이유로 각지게 둔다 — 선은 각지고 촉만 둥글면 따로 노는 것처럼 보인다.
 */
const SQUARE_EDGES = [
  '[&_.edgePath_path]:![stroke-linecap:butt]',
  '[&_.edgePath_path]:![stroke-linejoin:miter]',
  '[&_.flowchart-link]:![stroke-linecap:butt]',
  '[&_.flowchart-link]:![stroke-linejoin:miter]',
  '[&_path.path]:![stroke-linecap:butt]',
  '[&_path.path]:![stroke-linejoin:miter]',
  '[&_marker_path]:![stroke-linejoin:miter]',
].join(' ');

export function Mermaid({ code, title }: MermaidProps) {
  const reactId = useId();
  // mermaid 는 id 로 임시 DOM 을 만든다. 콜론이 들어가면 선택자로 쓰일 때 깨진다.
  const domId = `mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;

  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState('');
  const [natural, setNatural] = useState<Natural>({ width: 960, height: 540 });
  const [zoomed, setZoomed] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let alive = true;

    void (async () => {
      try {
        const { default: mermaid } = await import('mermaid');
        mermaid.initialize({
          startOnLoad: false,
          // 원본의 init 지시자가 결을 정한다. 여기 값은 지시자가 없는 도면의 바탕이다.
          theme: 'neutral',
          securityLevel: 'strict',
          flowchart: { curve: 'step', nodeSpacing: 32, rankSpacing: 46, useMaxWidth: true },
        });

        const { svg: drawn } = await mermaid.render(domId, code);
        if (!alive) return;

        setSvg(drawn);
        setNatural(naturalSize(drawn));
      } catch (error) {
        if (!alive) return;
        // 조용히 비워 두면 도면이 빠진 것인지 원본이 틀린 것인지 알 수 없다.
        setFailed((error as Error).message.split('\n')[0] ?? '도면을 그리지 못했습니다.');
      }
    })();

    return () => {
      alive = false;
    };
  }, [code, domId]);

  const close = useCallback(() => {
    setZoomed(false);
    setZoom(1);
  }, []);

  // 확대 창이 열려 있는 동안 뒤 화면이 같이 움직이면 어디를 보고 있었는지 잃는다.
  useEffect(() => {
    if (!zoomed) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === '+' || event.key === '=') setZoom((z) => ZOOM_STEPS.find((step) => step > z) ?? z);
      if (event.key === '-') setZoom((z) => [...ZOOM_STEPS].reverse().find((step) => step < z) ?? z);
      if (event.key === '0') setZoom(1);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [zoomed, close]);

  return (
    <figure className="my-5 overflow-hidden rounded-xl border border-border">
      <figcaption className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2">
        <span className="truncate text-xs font-medium text-ink-muted">{title ?? '도면'}</span>
        <span className="shrink-0 font-mono text-2xs text-ink-faint">mermaid</span>
      </figcaption>

      {failed ? (
        <p className="px-4 py-6 text-sm text-signal-danger">도면을 그리지 못했습니다 — {failed}</p>
      ) : (
        /*
          바탕을 흰색으로 고정한다. mermaid 의 neutral 결은 밝은 바탕을 전제로 색을 정하는데,
          어두운 화면에서 그대로 두면 선과 글자가 바탕에 묻는다.
        */
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={`${title ?? '도면'} 크게 보기`}
          className="block max-h-136 w-full cursor-zoom-in overflow-auto bg-white px-4 py-5 text-left"
        >
          {svg ? (
            /*
              카드 폭에 맞춰 줄이지 않는다. 갈래가 일곱이면 도면이 카드보다 서너 배 넓어서
              맞춰 줄인 그림은 글자가 뭉개져 아무것도 읽히지 않는다 — 원래 크기로 두고
              카드 안에서 스크롤한다. 더 크게 볼 일은 눌러서 연다.

              mermaid 가 우리 원본으로 만든 SVG 다. 바깥에서 온 값이 아니다.
            */
            <div
              style={{ width: natural.width, height: natural.height }}
              className={`[&_svg]:!h-full [&_svg]:!w-full [&_svg]:!max-w-none ${SQUARE_EDGES}`}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <p className="py-10 text-center text-sm text-ink-faint">도면을 그리는 중…</p>
          )}
        </button>
      )}

      <details className="border-t border-border bg-surface">
        <summary className="cursor-pointer px-4 py-2 text-xs text-ink-muted">원본 보기</summary>
        <pre className="overflow-x-auto px-4 pb-4 font-mono text-2xs leading-relaxed text-ink-muted">{code}</pre>
      </details>

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title ?? '도면'} 크게 보기`}
          onClick={close}
          className="fixed inset-0 z-50 bg-ink/70 p-4 backdrop-blur-sm"
        >
          <div className="pointer-events-none absolute right-4 top-4 z-10 flex items-center gap-1">
            <div className="pointer-events-auto flex items-center gap-1 rounded-lg bg-canvas p-1 shadow-lg">
              <ZoomButton
                label="축소"
                onClick={() => setZoom((z) => [...ZOOM_STEPS].reverse().find((step) => step < z) ?? z)}
              >
                −
              </ZoomButton>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setZoom(1);
                }}
                className="h-8 min-w-14 rounded px-2 font-mono text-xs tabular-nums text-ink-muted hover:bg-surface"
              >
                {Math.round(zoom * 100)}%
              </button>
              <ZoomButton label="확대" onClick={() => setZoom((z) => ZOOM_STEPS.find((step) => step > z) ?? z)}>
                +
              </ZoomButton>
              <ZoomButton label="닫기" onClick={close}>
                ✕
              </ZoomButton>
            </div>
          </div>

          {/*
            작으면 한가운데, 크면 잘리지 않고 스크롤된다.
            격자 한 칸에 `margin:auto` 를 주면 두 경우가 규칙 하나로 풀린다 — 칸보다 작으면
            남는 자리를 위아래·좌우로 나눠 가운데에 서고, 크면 여백이 0 이 되어 그대로 넘친다.
          */}
          <div className="grid h-full w-full overflow-auto">
            <div
              onClick={(event) => event.stopPropagation()}
              style={{ width: natural.width * zoom, height: natural.height * zoom }}
              className={`m-auto rounded-lg bg-white p-4 [&_svg]:!h-full [&_svg]:!w-full [&_svg]:!max-w-none ${SQUARE_EDGES}`}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </div>
      )}
    </figure>
  );
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="grid size-8 place-items-center rounded text-sm text-ink-muted hover:bg-surface hover:text-ink"
    >
      {children}
    </button>
  );
}
