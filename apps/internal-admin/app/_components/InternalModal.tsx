'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * 사내 어드민 공통 모달.
 *
 * 등록 폼을 **목록 위 모달**에서 끝내는 이유: 이 콘솔의 자원은 한 줄에 들어가는 값이
 * 대여섯 개뿐이라, 화면을 따로 세우면 등급 하나 만드는 데 목록 → 등록 → 저장 → 목록으로
 * 네 번 오간다. 값이 많아지는 자원이 생기면 그때 화면을 나눈다 (`docs/path.md` §3.2).
 *
 * Esc 로 닫히고, 열릴 때 본문 스크롤을 잠그며, 첫 입력 요소로 포커스를 옮긴다.
 * **프론트엔드 전용** — 서버 통신 없이 로컬 상태로만 열고 닫는다.
 */
function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 4 L12 12 M12 4 L4 12" strokeLinecap="round" />
    </svg>
  );
}

export function InternalModal({
  open,
  title,
  description,
  onClose,
  onSubmit,
  submitLabel,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  /** 저장을 눌렀을 때. 막을 조건이 있으면 여기서 막고 토스트로 알린다 */
  onSubmit: () => void;
  submitLabel: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // 안쪽 레이어(드롭다운 등)가 이미 이 Esc 를 소비했으면 모달은 닫지 않는다.
      if (event.defaultPrevented) return;
      onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    panelRef.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 py-10">
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-ink/40" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-canvas"
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

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex flex-1 flex-col gap-5 overflow-auto px-6 py-6">{children}</div>

          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 shrink-0 whitespace-nowrap rounded-lg border border-border-strong px-4 text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint"
            >
              취소
            </button>
            <button
              type="submit"
              className="h-9 shrink-0 whitespace-nowrap rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-600"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
