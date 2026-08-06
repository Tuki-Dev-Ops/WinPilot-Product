/**
 * 로고 그림 + 그 오른쪽의 회사 이름.
 *
 * ## 이름을 밖에서 받는 이유
 * 이 패키지의 것은 **자기가 무엇을 담는지 모른다**(`index.ts` 머리말). 여기서
 * `IR_COMPANY.name` 을 직접 읽으면 UI 조각이 IR 도메인을 알게 되고, 다른 회사 이름으로 쓸
 * 자리가 생기는 날 이 파일을 고쳐야 한다.
 *
 * ## 그림 파일을 쓴다 — 이 저장소에서는 예외다
 * 다른 자리에서는 아이콘을 전부 SVG 로 그린다(Figma 로 다시 뽑기 때문이다). 로고만 다르다.
 *
 * 로고는 **눈으로 보고 다시 그리면 다른 표장이 된다.** 곡률과 간격이 조금 달라도 그것은
 * 회사의 표장이 아니라 비슷한 그림이고, 그 그림이 홈페이지와 공시 자료에 나가면 나중에
 * 원본으로 되돌리는 일이 남는다. 그래서 받은 파일을 그대로 쓴다.
 *
 * 다만 지금 파일은 **118 × 64 짜리 PNG** 다. 지금 크기(32px 안팎)에서는 2배 화면까지 견디지만,
 * 큰 자리에 쓰려면 흐려진다 — SVG 나 AI 원본을 받으면 `public/brand/` 의 파일만 바꾸면 된다.
 *
 * ## 어두운 바닥에서는 하얗게 뒤집는다
 * 받은 로고는 짙은 남색 한 색이다. 검은 헤더 위에 그대로 얹으면 **보이지 않는다.**
 *
 * 흰색 파일을 하나 더 두는 대신 `brightness(0) invert(1)` 로 뒤집는다 — 먼저 전부 검게
 * 만들고(색을 지우고) 뒤집어 흰색으로 만드는 것이라, **어떤 색으로 온 로고든 흰 실루엣**이
 * 된다. 투명한 부분은 그대로 남는다.
 *
 * 파일을 두 벌 두지 않는 이유는 늘 같다 — 로고를 바꾸는 날 한쪽만 바꾸게 된다.
 *
 * 다크 모드도 같은 문제라 `dark:` 로 함께 처리한다. 밝은 바탕에서는 받은 색 그대로다.
 *
 * ## `next/image` 가 아니라 `img`
 * 이 패키지는 Next 를 의존하지 않는다. 여기서 `next/image` 를 들이면 UI 조각이 프레임워크를
 * 알게 되어, 문서 화면이나 테스트처럼 Next 밖에서 그리는 자리에서 깨진다. 로고는 1.4KB 라
 * 최적화로 얻을 것도 없다.
 */
export type BrandMarkProps = {
  /** 로고 오른쪽에 적히는 이름. 없으면 그림만 선다 */
  name?: string;
  /** 이름 아래 한 줄 — 종목 코드처럼 이름에 딸린 것 */
  note?: string;
  /** 로고 높이(px). 그림의 가로세로비는 그대로 둔다 */
  size?: number;
  /** 어두운 배경 위인지 — 이름 색이 갈린다 */
  tone?: 'ink' | 'light';
  href?: string;
  className?: string;
};

export function BrandMark({
  name,
  note,
  size = 28,
  tone = 'ink',
  href,
  className = '',
}: BrandMarkProps) {
  const body = (
    <>
      {/*
        `width` 를 두지 않고 높이만 정한다. 원본이 118 × 64 라 가로를 함께 못 박으면 비가
        틀어지고, 로고가 눌린 것은 다른 무엇보다 먼저 눈에 띈다.
      */}
      <img
        src="/brand/sp-logo.png"
        alt=""
        aria-hidden
        style={{ height: size }}
        className={`w-auto shrink-0 ${tone === 'light' ? 'brightness-0 invert' : 'dark:brightness-0 dark:invert'}`}
      />

      {name && (
        <span className="leading-tight">
          <span className="block text-base font-semibold tracking-tight">{name}</span>
          {note && (
            <span
              className={`block font-mono text-xs uppercase tracking-widest ${
                tone === 'light' ? 'text-white/60' : 'text-ink-faint'
              }`}
            >
              {note}
            </span>
          )}
        </span>
      )}
    </>
  );

  /*
    `alt` 를 비워 두고 이름을 글자로 두는 이유: 둘 다 채우면 링크를 소리로 읽을 때 회사
    이름이 두 번 나온다. 이름이 없는 자리(`name` 을 안 준 자리)에서는 쓰는 쪽이 링크에
    `aria-label` 을 준다.
  */
  /*
    위에 맞춘다(`items-start`). 가운데에 맞추면 이름 아래 한 줄(`note`)이 있을 때와 없을 때
    **로고가 위아래로 움직인다** — 헤더에는 그 줄이 없고 푸터에는 있는 식으로 자리마다 다르니,
    같은 로고가 화면마다 다른 높이에 서게 된다.
  */
  const shell = `flex shrink-0 items-start gap-3 ${className}`;

  if (href) {
    return (
      <a href={href} className={shell}>
        {body}
      </a>
    );
  }

  return <span className={shell}>{body}</span>;
}
