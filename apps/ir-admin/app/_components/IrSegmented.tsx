'use client';

/**
 * 몇 안 되는 것 중 **지금 보고 있는 하나**를 고르는 줄.
 *
 * ## 왜 조각으로 뽑았나
 * 대시보드 한 화면에만 이런 줄이 둘이다 — 기간(일 · 주 · 월)과 잣대(전체 · 도입 · 대기). 각자
 * 만들어 두었더니 **하나는 브랜드색으로 차고 하나는 회색으로 차** 있어, 같은 종류의 조작인데
 * 다른 것으로 읽혔다. 여기 한 벌로 둔다.
 *
 * ## 고른 것을 색이 아니라 **떠오름**으로 알린다
 * 고른 칸만 바탕색을 바꾸고(`bg-canvas`) 그림자를 얕게 준다. 나머지는 파인 자리(`bg-surface`)에
 * 남는다 — 눌린 단추 하나가 튀어나온 모양이라, 색을 못 가리는 사람에게도 어느 것이 켜졌는지
 * 보인다. 글자 굵기까지 함께 바뀌므로 신호가 셋이다.
 *
 * 브랜드색으로 채우지 않는 이유: 이 줄은 **무엇을 보는지**를 고르는 자리이지 무언가를 실행하는
 * 자리가 아니다. 진한 브랜드색은 화면에서 저장 · 등록이 쓰는 색이고, 그 색이 여기까지 오면
 * 어느 것이 되돌릴 수 없는 일인지 흐려진다.
 *
 * ## 짧은 이름에는 뜻을 붙인다
 * `일` · `주` 한 글자만으로는 어디서 끊는지 알 수 없다. `note` 를 받아 마우스를 올렸을 때와
 * 낭독기가 읽을 때 **`주 · 최근 7일`** 로 들리게 한다 — 화면에는 짧게, 물어보면 길게.
 */
export function IrSegmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  /** 이 줄이 무엇을 고르는 것인지. 낭독기에만 들린다 */
  label: string;
  options: readonly { id: T; label: string; note?: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-surface p-1"
    >
      {options.map((one) => {
        const on = one.id === value;

        return (
          <button
            key={one.id}
            type="button"
            onClick={() => onChange(one.id)}
            aria-pressed={on}
            {...(one.note ? { title: one.note, 'aria-label': `${one.label} · ${one.note}` } : {})}
            className={`h-8 shrink-0 whitespace-nowrap rounded-md px-3.5 text-xs transition-colors duration-150 ${
              on
                ? 'bg-canvas font-semibold text-ink shadow-sm'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {one.label}
          </button>
        );
      })}
    </div>
  );
}
