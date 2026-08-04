'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export type AdminModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  /** 다른 모달 위에 겹쳐 띄우는 확인 창인지 */
  elevated?: boolean;
};

/**
 * 열려 있는 모달 스택. Esc 는 **맨 위 모달만** 닫아야 한다.
 *
 * 리스너는 모두 document 에 달리고 등록 순서대로 호출되므로, 아래에 있던 모달이 먼저
 * 반응해 사라진다 — 확인 창을 띄운 채 Esc 를 누르면 뒤의 입력 폼까지 함께 닫히는 셈이다.
 */
const modalStack: symbol[] = [];

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4 L12 12 M12 4 L4 12" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 어드민 공통 모달.
 *
 * 프론트엔드 전용 — 서버 통신 없이 로컬 상태로만 열고 닫는다.
 * Esc 로 닫히고, 열릴 때 본문 스크롤을 잠그며, 첫 입력 요소로 포커스를 옮긴다.
 */
export function AdminModal({ open, title, description, onClose, children, footer, elevated = false }: AdminModalProps) {
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
          <div>
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
