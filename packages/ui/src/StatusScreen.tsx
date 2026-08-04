import type { ReactNode } from 'react';

/**
 * 상태 화면 — **404 · 오류 · 완료 · 실패**가 한 컴포넌트를 쓴다.
 *
 * 네 화면은 하는 말이 다를 뿐 구조가 같다: 무슨 일이 있었는지(코드), 무엇인지(제목),
 * 왜 그런지(설명 몇 줄), 그래서 어디로 갈지(단추 한둘). 화면마다 따로 만들면 앱이 세 개라
 * 열두 벌이 되고, 그중 하나만 문구가 어긋나도 아무도 알아채지 못한다.
 *
 * **왼쪽에 글, 오른쪽에 큰 도형.** 도형은 뜻을 담지 않는다 — 빈 화면이 고장 난 것처럼 보이지
 * 않게 무게를 잡아 주는 역할이다. 그래서 `aria-hidden` 이고, 좁은 화면에서는 사라진다.
 *
 * 도형은 **SVG 로 그린다.** 이미지 파일이면 추출에서 한 덩어리 비트맵이 되어 Figma 에서
 * 벡터로 복원되지 않고, 바깥 CDN 을 물면 픽셀 비교가 네트워크에 좌우된다
 * (docs/spec/05-component.md).
 *
 * 세 앱이 같이 쓰므로 라우트를 알지 못한다 — 어디로 보낼지는 부르는 쪽이 `actions` 로 준다.
 */
export type StatusTone = 'neutral' | 'success' | 'danger';

export type StatusAction = { href: string; label: string; primary?: boolean };

/**
 * `hero`   — 404·오류. 화면 전체를 채우고 오른쪽에 큰 도형을 둔다. 헤더 밖에서도 홀로 선다.
 * `center` — 완료·실패. **헤더와 푸터 사이의 본문**이므로 도형 없이 아이콘·글·단추만
 *            가운데로 모은다. 방금 무엇을 했는지 알리는 자리라 화면을 통째로 덮을 이유가 없다.
 */
export type StatusLayout = 'hero' | 'center';

export type StatusScreenProps = {
  /** 큰 글씨로 앉는 코드 — `404 ERROR` 처럼. 완료·실패 화면에서는 비운다 */
  code?: string;
  title: string;
  /** 한 줄씩 끊어 넘긴다 — 한 문단으로 두면 어디서 줄이 바뀔지 화면 폭이 정한다 */
  description: string[];
  actions: StatusAction[];
  tone?: StatusTone;
  layout?: StatusLayout;
  /** 설명 아래에 붙는 요약(주문번호 등) */
  children?: ReactNode;
};

const CIRCLE_TONE: Record<StatusTone, { front: [string, string]; back: [string, string] }> = {
  neutral: { front: ['#ffd400', '#f5c400'], back: ['#cfe0ff', '#2f6fe0'] },
  success: { front: ['#8fe3b0', '#3fb972'], back: ['#cfe0ff', '#2f6fe0'] },
  danger: { front: ['#ffb3a8', '#e2503a'], back: ['#ffd9a8', '#e08a2f'] },
};

/**
 * 겹친 두 원. 앞의 원은 결에 따라 색이 달라지고, 뒤의 원은 화면 밖으로 걸쳐 잘린다 —
 * 잘려 있어야 화면이 오른쪽으로 이어지는 느낌이 나고, 원 두 개를 나란히 둔 것처럼 보이지 않는다.
 *
 * 자리는 **오른쪽 칸 안**이다. 예전에는 화면 기준으로 띄워 두었는데, 너비가 1024~1280 으로
 * 좁아지면 도형이 글 위를 덮었다 — 칸 안에 두면 글과 겹칠 자리가 애초에 없다.
 *
 * 대신 칸보다 **넓게**(130%) 그려 오른쪽으로 넘치게 둔다. 칸에 딱 맞추면 도형이 통째로 보여
 * 원 두 개를 나란히 둔 그림이 되고, 화면이 오른쪽으로 이어지는 느낌이 사라진다.
 */
function StatusArt({ tone }: { tone: StatusTone }) {
  const { front, back } = CIRCLE_TONE[tone];

  return (
    <svg
      viewBox="0 0 520 520"
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-1/2 w-[130%] max-w-none -translate-y-1/2"
    >
      <defs>
        <radialGradient id={`status-front-${tone}`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={front[0]} />
          <stop offset="100%" stopColor={front[1]} />
        </radialGradient>
        <radialGradient id={`status-back-${tone}`} cx="30%" cy="25%" r="85%">
          <stop offset="0%" stopColor={back[0]} />
          <stop offset="100%" stopColor={back[1]} />
        </radialGradient>
      </defs>

      <circle cx="360" cy="250" r="220" fill={`url(#status-back-${tone})`} opacity="0.9" />
      <circle cx="185" cy="270" r="185" fill={`url(#status-front-${tone})`} />
    </svg>
  );
}

/**
 * 결과 아이콘 — 성공은 체크, 실패는 느낌표.
 *
 * **모양으로 구분한다.** 색만 다르면 색각 이상 사용자에게는 같은 동그라미 두 개일 뿐이다.
 */
function ResultMark({ tone }: { tone: StatusTone }) {
  const ok = tone !== 'danger';

  return (
    <span
      className={`grid size-20 place-items-center rounded-full ${
        ok ? 'bg-signal-ok/12 text-signal-ok' : 'bg-signal-danger/12 text-signal-danger'
      }`}
    >
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.6">
        <circle cx="20" cy="20" r="15" opacity="0.35" />
        {ok ? (
          <path d="M13 20.5 L18 25.5 L27.5 15" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <path d="M20 12.5 V21" strokeLinecap="round" />
            <path d="M20 26.5 v.05" strokeLinecap="round" />
          </>
        )}
      </svg>
    </span>
  );
}

export function StatusScreen({
  code,
  title,
  description,
  actions,
  tone = 'neutral',
  layout = 'hero',
  children,
}: StatusScreenProps) {
  if (layout === 'center') {
    return (
      <section className="mx-auto flex w-full max-w-140 flex-col items-center gap-6 py-12 text-center sm:py-16">
        <ResultMark tone={tone} />

        <div className="flex flex-col items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          <div className="flex flex-col gap-1">
            {description.map((line) => (
              <p key={line} className="text-sm leading-relaxed text-ink-muted">
                {line}
              </p>
            ))}
          </div>
        </div>

        {children}

        {/* 단추는 가운데에 나란히 — 왼쪽에 붙이면 가운데로 모아 둔 글과 축이 어긋난다. */}
        <div className="mt-2 flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          {actions.map((action) => (
            <a
              key={action.href + action.label}
              href={action.href}
              className={`flex h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-8 text-sm font-medium ${
                action.primary
                  ? 'bg-ink text-white'
                  : 'border border-border-strong bg-canvas text-ink-muted hover:text-ink'
              }`}
            >
              {action.label}
            </a>
          ))}
        </div>
      </section>
    );
  }

  /*
    404·오류는 **화면을 통째로 쓴다**(`min-h-dvh`). 헤더도 푸터도 없이 홀로 서는 화면이라
    높이를 덜 쓰면 아래가 비어 무엇을 더 기다려야 하는 것처럼 보인다.

    `vh` 가 아니라 `dvh` 인 이유: 모바일 브라우저는 주소창이 접혔다 펴지며 높이가 바뀌는데,
    `vh` 는 펼쳐진 높이로 고정이라 첫 화면에서 단추가 주소창에 가려진다.
  */
  return (
    <section className="relative flex min-h-dvh w-full items-center overflow-hidden bg-surface">
      <div className="mx-auto grid w-full max-w-350 grid-cols-1 items-center gap-8 px-6 py-16 sm:px-8 md:grid-cols-2 lg:gap-10 lg:px-16">
        <div className="flex min-w-0 flex-col gap-4">
          {code && (
            <p className="text-[32px] font-bold leading-none tracking-tight sm:text-[40px] lg:text-[52px]">{code}</p>
          )}
          <h1 className={`font-bold tracking-tight ${code ? 'text-lg sm:text-xl' : 'text-2xl leading-tight sm:text-[32px]'}`}>
            {title}
          </h1>

          <div className="flex flex-col gap-1">
            {description.map((line) => (
              <p key={line} className="text-sm leading-relaxed text-ink-muted">
                {line}
              </p>
            ))}
          </div>

          {children}

          {/* 좁은 화면에서는 단추가 한 줄에 다 들어가지 않으므로 세로로 쌓고 너비를 채운다. */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {actions.map((action) => (
              <a
                key={action.href + action.label}
                href={action.href}
                className={`flex h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-8 text-sm font-medium sm:justify-start ${
                  action.primary
                    ? 'bg-ink text-white'
                    : 'border border-border-strong bg-canvas text-ink-muted hover:text-ink'
                }`}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>

        {/*
          도형은 뜻을 담지 않는 무게추라 한 칸으로 접히는 좁은 화면에서는 통째로 뺀다.
          두 칸이 되는 순간(md)부터 세운다 — 칸을 비워 두면 화면 절반이 이유 없이 빈다.
        */}
        <div aria-hidden="true" className="relative hidden h-full min-h-100 md:block">
          <StatusArt tone={tone} />
        </div>
      </div>
    </section>
  );
}
