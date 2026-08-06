'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

export type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  /** 아래 줄에 설 단추들. 오른쪽 맞춤으로 선다 */
  footer: ReactNode;
  /** 다른 모달 위에 겹쳐 띄우는 확인 창인지 */
  elevated?: boolean;
};

/**
 * 열려 있는 모달 스택. Esc 는 **맨 위 모달만** 닫아야 한다.
 *
 * 리스너는 모두 document 에 달리고 등록 순서대로 호출되므로, 아래에 있던 모달이 먼저
 * 반응해 사라진다 — 확인 창을 띄운 채 Esc 를 누르면 뒤의 입력 폼까지 함께 닫히는 셈이다.
 *
 * 이 배열이 **모듈 하나에만** 있어야 뜻이 있다. 앱마다 모달을 복사해 두면 스택도 두 벌이 되어
 * 서로의 존재를 모른다.
 */
const modalStack: symbol[] = [];

function CloseIcon() {
  return (
    <X aria-hidden className="size-4" strokeWidth={1.5} />
  );
}

/**
 * 모달 — **두 어드민이 같은 것을 쓴다.**
 *
 * Esc 로 닫히고, 열릴 때 본문 스크롤을 잠그며, 첫 입력 요소로 포커스를 옮긴다.
 * 프론트엔드 전용 — 서버 통신 없이 로컬 상태로만 열고 닫는다.
 *
 * ## 여기 올라온 이유 — 두 벌이 이미 어긋나 있었다
 * `AdminModal` 과 `InternalModal` 은 백여 줄 중 여든 줄이 같은 파일이었는데, **같지 않은
 * 스무 줄이 전부 한쪽에만 있는 것**이었다.
 *
 * | 사내 어드민에 없던 것 | 그래서 생긴 일 |
 * |---|---|
 * | 모달 스택 | 확인 창을 띄운 채 Esc 를 누르면 뒤의 입력 폼까지 함께 닫혔다 |
 * | `animate-overlay-in` · `animate-panel-in` | 같은 동작인데 한쪽만 스르륵 열렸다 |
 * | `elevated` | 확인 창을 겹쳐 띄울 방법이 없었다 |
 * | `bg-surface-raised` (`bg-canvas` 를 썼다) | 다크 모드에서 뒤 배경과 같은 색으로 붙어 보였다 |
 *
 * 넷 다 나중에 고친 것이 한쪽에만 반영된 자리다. 복사한 날에는 같았고, 고친 날부터 갈라졌다 —
 * 두 벌로 두는 한 계속 이렇게 된다.
 *
 * ## 폼 처리를 이 컴포넌트가 하지 않는 이유
 * 사내 어드민 쪽에는 `<form onSubmit>` 과 `취소`/`저장` 두 단추가 **박혀** 있었다. 등록 창만
 * 있을 때는 편했지만, 단추가 셋인 창이나 저장이 없는 창은 이 컴포넌트로 만들 수 없다.
 * 그래서 아래 줄은 `footer` 슬롯으로 비워 두고, 폼이 필요한 쪽은 `children` 안에 자기
 * `<form>` 을 둔다 (`InternalFormModal` 이 그 얇은 겹이다).
 */
export function Modal({ open, title, description, onClose, children, footer, elevated = false }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const token = Symbol('modal');
    modalStack.push(token);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // 안쪽 레이어(드롭다운 등)가 이미 이 Esc 를 소비했으면 모달은 닫지 않는다.
      // 그쪽이 preventDefault 로 표시를 남긴다 — Next 가 document 에 이벤트를 위임하는 탓에
      // stopPropagation 이나 DOM 검사로는 판별할 수 없다.
      if (event.defaultPrevented) return;
      // 내 위에 다른 모달이 떠 있으면 양보한다.
      if (modalStack[modalStack.length - 1] !== token) return;
      onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    panelRef.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const index = modalStack.indexOf(token);
      if (index >= 0) modalStack.splice(index, 1);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center px-6 py-10 ${elevated ? 'z-55' : 'z-50'}`}>
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 animate-overlay-in bg-ink/40"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-full w-full max-w-md animate-panel-in flex-col overflow-hidden rounded-lg border border-border bg-surface-raised"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {description && <p className="mt-1 text-sm leading-relaxed text-ink-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="-mr-2 -mt-1 shrink-0 rounded-lg p-2 text-ink-muted"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-6">{children}</div>

        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">{footer}</div>
      </div>
    </div>
  );
}
