import type { ReactNode } from 'react';

export type FieldProps = {
  label: string;
  /** 라벨이 가리키는 입력의 id. 입력이 여럿인 묶음이면 비운다 — 그때는 라벨이 제목 노릇만 한다 */
  htmlFor?: string;
  /**
   * 필수 항목인가. **손으로 붙이는 표시가 아니라 스키마에서 온 값**을 넘긴다 —
   * 화면과 검사가 같은 곳을 보게 하려는 것이다 (아래 머리말).
   */
  required?: boolean;
  /** 무엇을 넣는 자리인지. 오류가 아니라 **넣기 전에** 읽는 글이다 */
  hint?: string;
  /** 검사에 걸린 이유. 있으면 `hint` 대신 이것이 보인다 */
  error?: string;
  children: ReactNode;
};

/**
 * 필수를 알리는 별표.
 *
 * `aria-hidden` 을 붙이고 낭독기에는 `(필수)` 라는 **말**을 따로 준다. 별표 하나만 두면
 * 낭독기가 "별" 이라고 읽거나 아무 말도 하지 않아, 필수인지 아닌지가 눈으로 보는 사람에게만
 * 전달된다. 반대로 `*` 를 지우고 글자만 두면 훑어볼 때 눈에 걸리지 않는다 — **둘 다 둔다.**
 *
 * `sr-only` 대신 `absolute w-px h-px overflow-hidden` 를 직접 적지 않는 이유: Tailwind 의
 * `sr-only` 가 정확히 그 일을 하고, 이름이 뜻을 말해 준다.
 */
function RequiredMark() {
  return (
    <>
      <span aria-hidden className="ml-0.5 text-signal-danger">
        *
      </span>
      <span className="sr-only">(필수)</span>
    </>
  );
}

/**
 * 입력 한 칸의 뼈대 — 라벨 · 필수 표시 · 입력 · 안내/오류. **세 앱이 같은 것을 쓴다.**
 *
 * ## 필수 표시를 손으로 붙이지 않는 이유
 * 전에는 별표가 고객 화면 여섯 자리에 손으로 적혀 있었고, **두 어드민에는 아예 없었다.**
 * 어드민 폼은 저장을 눌러야 무엇이 필수인지 알 수 있었다는 뜻이다.
 *
 * 손으로 붙이면 반드시 어긋난다. 필수라는 사실이 **화면과 검사 두 곳**에 적히기 때문이다 —
 * 검사에서 필수를 뺐는데 별표는 남거나, 검사에 넣었는데 별표를 잊는다. 어느 쪽이든
 * 타입은 통과하고 화면을 하나씩 열어 보기 전에는 드러나지 않는다.
 *
 * 그래서 `required` 는 **스키마에서 온 값**을 그대로 흘려보낸다. 필수 여부를 한 곳에 적고,
 * 별표와 검사가 같은 곳을 읽는다.
 *
 * ## 안내와 오류가 같은 자리에 서는 이유
 * 오류가 뜰 때 안내가 함께 남으면 줄이 두 줄로 늘어 폼 전체가 밀린다. 그보다, 오류가 난
 * 순간 사람이 읽어야 하는 것은 **무엇이 잘못됐는지**이지 원래의 안내가 아니다.
 *
 * `aria-describedby` 로 잇는 것은 입력을 부르는 쪽의 몫이다 — 이 컴포넌트는 입력을
 * `children` 으로 받으므로 그 id 를 알지 못한다. `error` 의 id 는 `{htmlFor}-error` 로
 * 정해 두었으니 입력에서 그 이름을 그대로 쓰면 된다.
 */
export function Field({ label, htmlFor, required = false, hint, error, children }: FieldProps) {
  const describedBy = htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
          {required && <RequiredMark />}
        </label>
      ) : (
        <span className="text-sm font-medium">
          {label}
          {required && <RequiredMark />}
        </span>
      )}

      {children}

      {error ? (
        <p id={describedBy} role="alert" className="text-xs leading-relaxed text-signal-danger">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs leading-relaxed text-ink-faint">{hint}</p>
      )}
    </div>
  );
}

/**
 * 폼 맨 위의 필수 안내 한 줄.
 *
 * 별표가 무슨 뜻인지 아무 데도 적지 않으면, 처음 보는 사람은 별표를 각주 표시로 읽는다.
 * 폼마다 되풀이해 적지 않도록 여기 한 벌만 둔다.
 */
export function RequiredLegend() {
  return (
    <p className="text-xs text-ink-muted">
      <span aria-hidden className="text-signal-danger">
        *
      </span>{' '}
      표시는 반드시 입력해야 하는 항목입니다.
    </p>
  );
}
