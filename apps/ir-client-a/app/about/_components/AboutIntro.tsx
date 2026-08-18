/**
 * 회사 소개의 첫 칸 — **사진 왼쪽, 글 오른쪽**.
 *
 * ## 왜 사진을 두나
 * 이 화면은 표로 시작했다. 표는 확인하러 온 사람에게는 맞지만 **처음 온 사람에게는 읽을 것이
 * 없다** — 대표 이름과 사업자등록번호를 보러 오는 사람은 드물다. 사진 한 장과 문장 하나가
 * 먼저 서면 "무엇을 하는 회사인가" 에 답이 되고, 확인은 그 아래에서 한다.
 *
 * ## 사진이 왼쪽인 까닭
 * 글이 왼쪽이면 눈이 글을 읽다가 오른쪽 사진으로 갔다가 다시 왼쪽으로 돌아온다. 사진을 먼저
 * 두면 한 번 보고 오른쪽으로 넘어가 **한 방향으로만** 읽힌다.
 *
 * 좁은 화면에서는 사진이 위다 — 격자의 차례가 곧 세로 차례다.
 *
 * ## 오른쪽이 비어 있었다
 * 제목 한 줄과 본문 두 줄뿐이라, 사진은 4:3 으로 서 있는데 **글 쪽 절반이 아래로 텅 비었다.**
 * 가운데 정렬(`items-center`)로 가려 두었지만 넓은 화면에서는 여백이 사진 높이만큼 남는다.
 *
 * 그래서 아래에 **짧은 줄 셋**을 둔다. 회사 소개에서 이 자리에 흔히 서는 것은 숫자(설립 n년 ·
 * 고객사 n개)인데, **없는 숫자를 지어내지 않는다** — 대신 이름표와 한 마디로 같은 자리를
 * 채운다. 값이 사실이 아니면 그 칸은 회사 소개가 아니라 광고가 된다.
 *
 * ## 큰 문장은 값이 아니라 화면이 든다
 * `IR_COMPANY.intro` 는 **무엇을 하는 회사인가**를 적은 값이고, 여기 큰 글씨는 그것을 한 마디로
 * 줄인 표제다. 표제까지 값으로 두면 어드민에서 고칠 수 있게 되고, 그러면 계절 행사 문구가
 * 이 자리에 서는 날이 온다. 아래 줄 셋도 같은 이유로 화면이 든다.
 */
export type IntroPoint = { label: string; value: string };

export function AboutIntro({
  headline,
  body,
  image,
  points,
}: {
  headline: string;
  body: string;
  image: string;
  points: IntroPoint[];
}) {
  return (
    <section className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" aria-hidden className="aspect-4/3 w-full rounded-2xl object-cover" />

      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold leading-[1.35] tracking-tight lg:text-3xl">{headline}</h2>
        <p className="text-sm leading-loose text-ink-muted lg:text-base">{body}</p>

        {/*
          줄마다 위에 선을 긋는다. 칸으로 나눠 카드를 만들면 아래 `하는 일` 넷과 같은 모양이
          되어, 같은 층의 목록 둘이 잇달아 서는 것으로 읽힌다. 여기는 목록이 아니라 **문장의
          꼬리표**다.
        */}
        <dl className="mt-2 flex flex-col">
          {points.map((one) => (
            <div key={one.label} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-border py-4">
              <dt className="w-24 shrink-0 text-xs font-semibold tracking-wide text-ink-faint">{one.label}</dt>
              <dd className="text-sm font-semibold tracking-tight">{one.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
