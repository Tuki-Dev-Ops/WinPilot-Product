import type { ReactNode } from 'react';
import { Field } from '@winpilot/ui';

/**
 * 폼 화면의 뼈대 — 입력 묶음과 저장 줄.
 *
 * 폼 화면이 모두 같은 모양을 쓰게 하려고 여기 한 벌만 둔다. 화면마다 라벨과 저장 단추를
 * 따로 그리면 여백이 조금씩 어긋나고, 그 어긋남은 화면을 나란히 놓기 전에는 드러나지 않는다.
 */
/**
 * 입력 한 칸 — 이제 `@winpilot/ui` 의 `Field` 를 그대로 쓴다.
 *
 * 이 겹을 남겨 두는 이유는 화면 마흔한 곳의 import 를 바꾸지 않으려는 것이 아니라,
 * **이 콘솔의 폼이 앞으로 갈라질 수 있는 자리**를 하나로 유지하기 위해서다. 지금은 넘기는
 * 것을 그대로 넘긴다.
 *
 * `required` 가 새로 생겼다. 전에는 이 콘솔의 폼에 **필수 표시가 아예 없어서**, 무엇을 반드시
 * 넣어야 하는지는 저장을 눌러 토스트를 봐야 알 수 있었다.
 */
export function IrField({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  /** 라벨이 가리키는 입력의 id. 입력이 여럿인 묶음이면 비운다 — 그때는 라벨이 제목 노릇만 한다 */
  htmlFor?: string;
  /** 스키마가 정한 필수 여부. 손으로 별표를 붙이지 않는다 */
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <Field
      label={label}
      {...(htmlFor ? { htmlFor } : {})}
      {...(required ? { required } : {})}
      {...(hint ? { hint } : {})}
      {...(error ? { error } : {})}
    >
      {children}
    </Field>
  );
}

/**
 * 저장 줄 — 카드 맨 아래 오른쪽.
 *
 * 저장을 **화면 아래가 아니라 카드 아래**에 두는 이유: 카드가 여럿인 화면에서 어느 카드의
 * 값을 저장하는지가 자리로 드러나야 한다. 화면 하나에 저장이 하나뿐이면 카드도 하나다.
 */
export function IrSaveRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-2 border-t border-border px-6 py-4">{children}</div>;
}

/** 주된 동작 한 개. 한 줄에 두 개 이상 두지 않는다 — 무엇이 주된 것인지 흐려진다. */
export function IrPrimaryButton({
  type = 'submit',
  onClick,
  children,
}: {
  type?: 'submit' | 'button';
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="h-11 shrink-0 whitespace-nowrap rounded-lg bg-brand-500 px-6 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-600"
    >
      {children}
    </button>
  );
}

/** 곁들이는 동작 — 되돌리기·다시 확인처럼 주된 동작이 아닌 것. */
export function IrGhostButton({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-11 shrink-0 whitespace-nowrap rounded-lg border border-border-strong px-6 text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint"
    >
      {children}
    </button>
  );
}

/**
 * 목록 위의 **등록** 단추.
 *
 * 단추가 아니라 링크(`<a>`)다. 등록은 화면을 옮기는 일이라, 새 창으로 열거나 주소를 복사하는
 * 평범한 일이 되어야 한다 — `onClick` 으로 옮기면 그 둘이 다 막힌다.
 *
 * 자리는 카드 제목 오른쪽(`aside`)이다. 목록 아래에 두면 줄이 스무 개일 때 **끝까지 내려가야**
 * 보이고, 화면 위에 따로 띄우면 어느 목록에 더하는 것인지 자리로 드러나지 않는다.
 */
export function IrCreateLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="flex h-9 shrink-0 items-center whitespace-nowrap rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-600"
    >
      {children}
    </a>
  );
}
