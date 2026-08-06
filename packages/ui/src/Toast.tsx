'use client';

import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

export type ToastTone = 'success' | 'error' | 'info';

export type Toast = {
  id: number;
  tone: ToastTone;
  message: string;
  /** 아래에 한 줄로 붙는 보조 설명 */
  detail?: string;
};

type ToastInput = { message: string; detail?: string };

type ToastApi = {
  success: (input: string | ToastInput) => void;
  error: (input: string | ToastInput) => void;
  info: (input: string | ToastInput) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const DURATION_MS = 3200;

/**
 * 아이콘은 인라인 SVG 로 둔다 — 아이콘 폰트나 이미지로 두면 Figma 추출에서
 * 글리프·비트맵이 되어 벡터로 복원되지 않는다 (docs/spec/05-component.md).
 * `stroke="currentColor"` 는 추출 시점에 실제 색으로 치환된다.
 */
function ToastIcon({ tone }: { tone: ToastTone }) {
  if (tone === 'success') {
    return (
      <CircleCheck aria-hidden className="size-[18px]" strokeWidth={1.6} />
    );
  }
  if (tone === 'error') {
    return (
      <CircleAlert aria-hidden className="size-[18px]" strokeWidth={1.6} />
    );
  }
  return (
    <Info aria-hidden className="size-[18px]" strokeWidth={1.6} />
  );
}

function CloseIcon() {
  return (
    <X aria-hidden className="size-3.5" strokeWidth={1.5} />
  );
}

const TONE_STYLE: Record<ToastTone, { icon: string; ring: string }> = {
  success: { icon: 'text-signal-ok', ring: 'border-signal-ok/30' },
  error: { icon: 'text-signal-danger', ring: 'border-signal-danger/30' },
  info: { icon: 'text-brand-500', ring: 'border-border-strong' },
};

/**
 * 화면 **아래 중앙**에 뜨는 토스트.
 *
 * 모달 위에도 보여야 하므로 body 로 포털한다. 성공/실패를 색만으로 구분하면
 * 색각 이상 사용자가 놓치므로 아이콘 모양도 함께 다르게 둔다.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const running = timers.current;
    return () => running.forEach((timer) => clearTimeout(timer));
  }, []);

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, input: string | ToastInput) => {
      const id = nextId.current++;
      const body = typeof input === 'string' ? { message: input } : input;
      setToasts((previous) => [...previous.slice(-2), { id, tone, ...body }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), DURATION_MS),
      );
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (input) => push('success', input),
      error: (input) => push('error', input),
      info: (input) => push('info', input),
    }),
    [push],
  );

  const layer = (
    <div
      // 실패 안내는 assertive 여야 스크린리더가 즉시 읽는다.
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-8 z-[60] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => {
        const style = TONE_STYLE[toast.tone];
        return (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            /*
              가운데 정렬 — 아이콘까지 한 덩어리로 가운데에 놓는다.
              닫기 버튼은 흐름에서 빼서(absolute) 그 폭만큼 글이 왼쪽으로 밀리지 않게 하고,
              대신 좌우 여백을 같게 주어 상자 자체도 대칭이 되도록 한다.
            */
            className={`pointer-events-auto relative flex max-w-100 animate-toast-in flex-col items-center gap-1 rounded-lg border bg-surface-raised px-10 py-3 text-center shadow-lg ${style.ring}`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className={`shrink-0 ${style.icon}`}>
                <ToastIcon tone={toast.tone} />
              </span>
              <p className="text-sm font-medium leading-snug">{toast.message}</p>
            </div>
            {toast.detail && <p className="text-xs leading-relaxed text-ink-muted">{toast.detail}</p>}

            <button
              type="button"
              aria-label="알림 닫기"
              onClick={() => dismiss(toast.id)}
              className="absolute right-2 top-2 rounded-lg p-1 text-ink-faint transition-colors duration-150 hover:text-ink"
            >
              <CloseIcon />
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted && createPortal(layer, document.body)}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast 는 ToastProvider 안에서만 쓸 수 있습니다.');
  return api;
}
