'use client';

export type AsideChoice = {
  id: string;
  label: string;
  /** 옆에 적을 개수. 없으면 안 적는다 — 셀 것이 없는 목록(마케팅 창구)이 있다 */
  count?: number;
};

/**
 * 본문 왼쪽에서 **목록을 거르는 기둥** — 메뉴 · 마케팅 · 창업 문의 셋이 쓴다.
 *
 * ## 왜 왼쪽인가
 * 세 화면 다 오른쪽이 **여러 줄짜리 목록이나 카드 격자**다. 고르는 줄을 위에 가로로 놓으면
 * 스크롤을 조금만 내려도 화면 밖으로 나가고, 그때부터 다른 갈래로 갈 길이 사라진다. 왼쪽에
 * 세우면 훑는 내내 같은 자리에 남는다.
 *
 * ## 개수를 옆에 적는다
 * 고르기 전에 몇 개인지 보이면 **빈 갈래를 눌러 보는 일**이 없다. 셋 중 둘(메뉴 · 창업 문의)이
 * 그렇고, 마케팅 창구는 셀 것이 글 수뿐이라 적지 않는다 — 그 숫자는 고르는 데 쓰이지 않는다.
 *
 * ## 고객센터 기둥과 갈린다
 * 저쪽(`SupportAside`)은 **화면을 바꾸는 링크**이고 여기는 목록만 거르는 단추다. 모양이 같은
 * 것은 일부러다 — 자리와 생김새가 같으면 하는 일이 다르다는 것을 눌러 보고 배운다기보다,
 * 둘 다 `이 화면 안에서 갈래를 고르는 자리`라는 한 가지로 읽힌다.
 *
 * 한 벌로 합치지 않은 이유는 태그가 다르기 때문이다. 링크를 단추로 만들면 새 창으로 열거나
 * 주소를 복사하는 것이 안 되고, 단추를 링크로 만들면 갈 곳 없는 `href` 를 지어내야 한다.
 *
 * ## 좁은 화면에서는 눕는다
 * `lg` 미만에서 세로로 두면 본문이 그만큼 아래로 밀려, 작은 화면의 첫 화면이 고르는 줄로
 * 채워진다. 가로로 접으면 한두 줄만 쓴다.
 */
export function AsidePicker({
  title,
  choices,
  picked,
  onPick,
  width = 'lg:w-44',
}: {
  /** 기둥 맨 위의 한 마디. 없으면 안 세운다 */
  title?: string;
  choices: readonly AsideChoice[];
  picked: string;
  onPick: (id: string) => void;
  /** 이름이 긴 갈래가 있는 화면만 넓힌다 */
  width?: string;
}) {
  return (
    <aside className={`w-full shrink-0 ${width}`}>
      {title && <p className="mb-3 text-xs font-medium text-ink-faint">{title}</p>}

      <div className="flex flex-wrap gap-1 lg:flex-col">
        {choices.map((one) => {
          const here = one.id === picked;

          return (
            <button
              key={one.id}
              type="button"
              onClick={() => onPick(one.id)}
              aria-pressed={here}
              className={`flex items-center justify-between gap-2 rounded-r-lg border-l-2 px-3 py-2 text-left text-sm transition-colors duration-150 ${
                here ? 'border-ink font-semibold text-ink' : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              <span className="min-w-0 truncate">{one.label}</span>
              {one.count !== undefined && (
                <span className="shrink-0 font-mono text-xs tabular-nums text-ink-faint">{one.count}</span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
