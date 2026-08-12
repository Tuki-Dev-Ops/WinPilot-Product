import type { ReactNode } from 'react';

/**
 * 어드민 폼의 **입력 원시 조각** 한 벌.
 *
 * ## 왜 여기로 올라왔나
 * IR 어드민(`app/_components/IrRecordForm.tsx`)과 F&B 어드민(`app/_components/FnbForm.tsx`)이
 * 이 여섯을 **문자 단위로 같게** 들고 있었다 — 주석 문장까지 같았다. 그 상태가 위험한 이유는
 * 이 패키지 머리말이 이미 세어 두었다: 클래스 문자열은 `string` 이라 **타입이 어긋남을 막아
 * 주지 못한다.** `Badge` · `Button` · `Modal` 이 두 벌인 동안 조용히 갈라진 것과 같은 자리다.
 *
 * ## 폼 전체가 아니라 이 여섯만 올린다
 * `RecordForm`(저장 → 확인 창 → 목록으로 이동)은 앱에 남는다. **저장한 뒤 어디로 가는가**가
 * 콘솔마다 다르고 `next/navigation` 에 기대는데, 이 패키지는 `next` 를 의존하지 않는다.
 *
 * 여기 있는 여섯은 라우터도 콘솔도 모른다 — 값을 받아 그리기만 한다.
 *
 * ## `Select` 와 `Toggle` 은 옮겨만 왔다 — **다듬지 않았다**
 * 둘은 생 `<select>` 와 생 체크박스를 쓴다. 이 패키지에는 이미 `Dropdown` 과 `Checkbox` 가
 * 있고, 그쪽 머리말들이 왜 네이티브를 쓰지 않는지 적어 두었다(`<option>` 텍스트와 OS 기본
 * 체크 표시는 Figma 로 추출되지 않는다).
 *
 * 그럼에도 지금 바꾸지 않은 이유: 두 콘솔의 **스물세 자리**가 이미 이 모양으로 서 있고,
 * 갈아 끼우면 그 전부의 겉모습이 함께 바뀐다. 그것은 중복을 없애는 일이 아니라 화면을 고치는
 * 일이라 따로 해야 한다. **여기서는 두 벌을 한 벌로 만드는 데까지만 한다.**
 */

/**
 * 고칠 수 없는 값 — 코드 · 등록일처럼 화면이 정하는 것.
 *
 * 입력 칸처럼 보이게 두지 않는다. 눌러 봐야 안 되는 것을 아는 자리는 **누른 뒤**가 아니라
 * 그 전이어야 한다.
 */
export function Readonly({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <span className="flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-3">
        <span className="min-w-0 truncate font-mono text-sm text-ink-muted">{value}</span>
        {note && <span className="shrink-0 text-xs text-ink-faint">{note}</span>}
      </span>
    </div>
  );
}

/** 글 한 줄 입력. 어드민의 폼이 전부 같은 높이·같은 테두리를 쓰게 한다. */
export function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  invalid,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  type?: 'text' | 'date' | 'url' | 'number';
  invalid?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder ?? ''}
      aria-invalid={invalid ?? false}
      className={`h-11 w-full min-w-0 rounded-lg border bg-surface px-3 text-sm text-ink placeholder:text-ink-faint ${
        invalid ? 'border-signal-danger' : 'border-border-strong'
      }`}
    />
  );
}

/** 여러 줄 입력. 줄 수를 받는 이유는 본문과 한 문단짜리 설명이 필요한 높이가 다르기 때문이다. */
export function TextArea({
  id,
  value,
  onChange,
  rows = 6,
  placeholder,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  placeholder?: string;
  invalid?: boolean;
}) {
  return (
    <textarea
      id={id}
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder ?? ''}
      aria-invalid={invalid ?? false}
      className={`w-full min-w-0 resize-y rounded-lg border bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-faint ${
        invalid ? 'border-signal-danger' : 'border-border-strong'
      }`}
    />
  );
}

/** 몇 안 되는 것 중 하나 고르기. 갈래처럼 값이 코드로 정해진 칸에 쓴다. */
export function Select({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  options: readonly string[];
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full min-w-0 rounded-lg border border-border-strong bg-surface px-3 text-sm text-ink"
    >
      {options.map((one) => (
        <option key={one} value={one}>
          {one}
        </option>
      ))}
    </select>
  );
}

/**
 * 켜고 끄는 한 줄.
 *
 * 설명을 함께 받는다. `노출` 이라는 말만으로는 **끄면 어떻게 되는지**를 알 수 없고, 그것을
 * 모른 채 끈 것은 사이트에서 사라진 뒤에야 발견된다.
 */
export function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        /*
          `accent-brand` 였다. `--color-brand` 라는 토큰은 **없다** — 있는 것은 `brand-50` 부터
          `brand-900` 까지 단계뿐이라, Tailwind 가 그 클래스의 CSS 를 아예 만들지 않았다.
          그래서 일곱 앱의 체크박스가 전부 브라우저 기본색으로 그려지고 있었다. 눈으로는
          "원래 저런가 보다" 로 지나가는 종류의 고장이다.

          F&B 앱에서도 파랑이 된다는 것은 안다. 그래도 여기서 제품별로 가르지 않는 이유는
          앱의 `globals.css` 가 이미 적어 둔 판단 때문이다 — 색을 앱에서 풀기 시작하면
          `brand-500` 이 앱마다 다른 색이 되고, 이 파일이 어느 색으로 그려질지 아무도 모르게
          된다. 갈라야 한다면 토큰 파일에 시맨틱 한 겹을 두는 것이 먼저다.
        */
        className="mt-1 size-4 shrink-0 accent-brand-600"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs leading-relaxed text-ink-muted">{description}</span>
      </span>
    </label>
  );
}

/**
 * 저장 줄 — 카드 맨 아래 오른쪽.
 *
 * 저장을 **화면 아래가 아니라 카드 아래**에 두는 이유: 카드가 여럿인 화면에서 어느 카드의
 * 값을 저장하는지가 자리로 드러나야 한다. 화면 하나에 저장이 하나뿐이면 카드도 하나다.
 */
export function SaveRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-2 border-t border-border px-6 py-4">{children}</div>;
}
