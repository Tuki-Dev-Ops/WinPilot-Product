'use client';

/**
 * 정해진 목록에서 **여럿 고르는 알약 줄** — 메뉴의 알레르기 · 표, 매장의 되는 것 셋이 쓴다.
 *
 * ## 왜 체크박스가 아닌가
 * 고른 것이 **한눈에 보여야** 한다. 열넷을 체크박스로 세우면 켜진 것을 찾느라 목록을 훑게 되고,
 * 이 자리에서 실제로 하는 일은 지금 몇을 켜 뒀는지 확인하는 것이다.
 *
 * ## 켜고 끄는 일까지 여기서 한다
 * 한때 화면마다 `toggle` 을 따로 갖고 있었다. 그 함수가 하는 일은 **넣거나 빼거나** 하나인데,
 * 두 벌이 되면 한쪽만 같은 값을 두 번 넣게 되는 날이 온다 — 그러면 사이트에 `우유` 가 두 번
 * 적힌다. 넣고 빼는 규칙은 알약 줄이 갖는다.
 *
 * ## 목록에 없는 것은 만들 수 없다
 * 새 이름을 화면에서 만들 수 있게 두면 같은 것이 `대두` 와 `콩` 두 이름으로 쌓이고, 그때부터
 * 목록 화면의 대조가 뜻을 잃는다. 늘려야 하면 코드의 목록을 늘린다.
 */
export function PickChips({
  options,
  picked,
  onChange,
}: {
  options: readonly string[];
  picked: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {options.map((one) => {
        const checked = picked.includes(one);

        return (
          <li key={one}>
            <button
              type="button"
              /*
                `aria-pressed` 로 켜짐을 알린다. 색만으로 두면 낭독기에는 이름만 읽히고, 지금
                켜진 것과 안 켜진 것이 **똑같이 들린다.**
              */
              aria-pressed={checked}
              onClick={() => onChange(checked ? picked.filter((each) => each !== one) : [...picked, one])}
              className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors duration-150 ${
                checked
                  ? 'border-ink bg-ink font-medium text-white'
                  : 'border-border-strong text-ink-muted hover:border-ink-faint'
              }`}
            >
              {one}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
