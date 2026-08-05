import type { ReactNode } from 'react';

/**
 * 폼 화면의 뼈대 — 입력 묶음과 저장 줄.
 *
 * 폼 화면이 모두 같은 모양을 쓰게 하려고 여기 한 벌만 둔다. 화면마다 라벨과 저장 단추를
 * 따로 그리면 여백이 조금씩 어긋나고, 그 어긋남은 화면을 나란히 놓기 전에는 드러나지 않는다.
 */
export function InternalField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  /** 라벨이 가리키는 입력의 id. 입력이 여럿인 묶음이면 비운다 — 그때는 라벨이 제목 노릇만 한다 */
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
        </label>
      ) : (
        <span className="text-sm font-medium">{label}</span>
      )}
      {children}
      {hint && <p className="text-xs leading-relaxed text-ink-faint">{hint}</p>}
    </div>
  );
}

/**
 * 저장 줄 — 카드 맨 아래 오른쪽.
 *
 * 저장을 **화면 아래가 아니라 카드 아래**에 두는 이유: 카드가 여럿인 화면에서 어느 카드의
 * 값을 저장하는지가 자리로 드러나야 한다. 화면 하나에 저장이 하나뿐이면 카드도 하나다.
 */
export function InternalSaveRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-2 border-t border-border px-6 py-4">{children}</div>;
}

/** 주된 동작 한 개. 한 줄에 두 개 이상 두지 않는다 — 무엇이 주된 것인지 흐려진다. */
export function InternalPrimaryButton({
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
export function InternalGhostButton({
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
