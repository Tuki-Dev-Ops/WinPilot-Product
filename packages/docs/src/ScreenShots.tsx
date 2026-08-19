/**
 * 화면 사진 — **앱의 모든 화면을 한 장씩 늘어놓는다.**
 *
 * ## `Page View` 와 무엇이 다른가
 * 그쪽은 한 화면을 **세 너비로** 찍고 설명을 붙인 문서다. 화면 하나를 깊게 보는 자리다.
 *
 * 여기는 **앱 전체를 한눈에** 훑는 자리다. "이 콘솔에 무슨 화면이 있더라" 를 물었을 때
 * 이 한 장으로 답이 되는 것이 목적이라, 화면 하나가 사진 한 장이고 설명이 없다.
 *
 * ## 사진이 `public/pages` 에 있다
 * `docs/pages` 폴더에 두면 웹에서 열 수 없다 — Next 는 `public/` 아래만 주소로 내보낸다.
 * 그래서 사진은 `public/pages/{화면}.jpg` 에 두고, `docs/pages/README.md` 가 그것을 상대
 * 경로로 가리키는 목록이 된다. 저장소에서 폴더를 열어 보는 사람과 브라우저로 보는 사람이
 * 같은 사진을 본다.
 *
 * ## `next/image` 를 쓰지 않는다
 * 이 패키지는 Next 를 의존하지 않는다(`BrandMark` 와 같은 까닭이다). 문서 화면이나 테스트처럼
 * Next 밖에서 그리는 자리에서 깨지기 때문이다.
 *
 * 대신 **지연 로딩**을 건다(`loading="lazy"`). 목록에 사진이 마흔 장 넘게 서는 앱이 있어,
 * 한 번에 다 받으면 문서를 여는 데 몇 초가 걸린다.
 *
 * ## 사진이 없으면 그 자리를 비워 두지 않는다
 * `pnpm pages:shoot` 을 아직 안 돌렸으면 사진이 없다. 그때 빈 상자만 두면 **화면이 없는 것**과
 * 구별되지 않으므로, 무엇을 하면 되는지 한 줄로 적는다.
 */
export type ScreenShot = { id: string; name: string; route: string };

export function ScreenShots({ items, base }: { items: readonly ScreenShot[]; base: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-muted">등록된 화면이 없습니다.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((one) => (
        <a
          key={one.id}
          href={`${base}/${one.id}`}
          className="group flex flex-col gap-3 rounded-xl border border-border p-3 transition-colors duration-150 hover:border-border-strong"
        >
          {/*
            사진을 위에서 잘라 보여 준다(`object-top`). 화면 전체를 찍은 세로로 긴 그림이라
            가운데를 보이면 **머리띠도 첫 칸도 없는 중간 토막**이 서고, 그것으로는 어느 화면인지
            알아볼 수 없다.
          */}
          <span className="block aspect-4/3 w-full overflow-hidden rounded-lg bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/pages/${one.id}.jpg`}
              alt=""
              loading="lazy"
              className="size-full object-cover object-top"
            />
          </span>

          <span className="flex min-w-0 flex-col gap-0.5 px-1 pb-1">
            <span className="min-w-0 truncate text-sm font-medium">{one.name}</span>
            <span className="min-w-0 truncate font-mono text-xs text-ink-faint">{one.route}</span>
          </span>
        </a>
      ))}
    </div>
  );
}

/**
 * 한 화면의 사진 — **자르지 않고 통째로**.
 *
 * 목록에서는 위쪽만 보여 주지만 여기서는 전부 보인다. 목록에서 눌러 들어오는 이유가
 * **잘린 아래를 보려는 것**이라서다.
 */
export function ScreenShotView({ id, route }: { id: string; route: string }) {
  return (
    <div className="flex flex-col gap-4">
      <a href={route} className="w-fit font-mono text-xs text-brand-700 underline underline-offset-2">
        {route}
      </a>

      <span className="block overflow-hidden rounded-xl border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/pages/${id}.jpg`} alt="" className="w-full" />
      </span>
    </div>
  );
}
