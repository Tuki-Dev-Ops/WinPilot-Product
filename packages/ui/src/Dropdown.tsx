'use client';

import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

export type DropdownOption = {
  value: string;
  label: string;
  /** 오른쪽에 흐리게 붙는 보조 설명 (국가명 등) */
  hint?: string;
};

export type DropdownProps = {
  id?: string;
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  className?: string;
};

const MAX_LIST_HEIGHT = 240;
const GAP = 4;

function ChevronIcon() {
  return (
    <ChevronDown aria-hidden className="size-3" strokeWidth={1.5} />
  );
}

/**
 * 드롭다운.
 *
 * 네이티브 `<select>` 를 쓰지 않는다 — `<option>` 텍스트는 DOM 텍스트 노드가 아니라
 * 추출되지 않고 Figma 에서 사라진다 (docs/spec/05-component.md).
 *
 * 목록은 **body 로 포털**한다. 카드나 모달 본문에는 `overflow-hidden`/`overflow-auto` 가
 * 걸려 있어, 그 안에 두면 목록이 잘린다. 포털로 빼면 어느 컨테이너에도 갇히지 않는다.
 * 좌표는 트리거의 화면 좌표에서 계산하고, 아래 공간이 부족하면 위로 펼친다.
 */
export function Dropdown({ id, label, options, value, onChange, invalid = false, className = '' }: DropdownProps) {
  const generatedId = useId();
  const buttonId = id ?? generatedId;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0, width: 0, maxHeight: MAX_LIST_HEIGHT });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => setMounted(true), []);

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - GAP * 2;
    const above = rect.top - GAP * 2;
    const openUp = below < 160 && above > below;
    const maxHeight = Math.max(120, Math.min(MAX_LIST_HEIGHT, openUp ? above : below));

    setPosition({
      left: rect.left,
      top: openUp ? rect.top - GAP - maxHeight : rect.bottom + GAP,
      width: rect.width,
      maxHeight,
    });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    };
    // 스크롤·리사이즈로 트리거가 움직이면 목록도 따라가야 한다.
    const reposition = () => place();

    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, place]);

  /**
   * Esc 는 여기서 소비하고 **이벤트에 처리 표시를 남긴다.**
   *
   * 바깥 모달도 Esc 를 듣고 있는데, Next 는 이벤트를 document 에 위임하므로
   * `stopPropagation` 으로는 같은 노드의 다른 리스너를 막지 못한다.
   * DOM 검사도 안 된다 — React 가 discrete 이벤트를 자기 리스너 안에서 동기 flush 해버려,
   * 모달 차례에는 이미 목록이 사라진 뒤다. `preventDefault()` 표시는 확실하게 남는다.
   */
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || !open) return;
    event.preventDefault();
    event.stopPropagation();
    setOpen(false);
    triggerRef.current?.focus();
  };

  const selected = options.find((option) => option.value === value);

  const list = (
    <ul
      ref={listRef}
      role="listbox"
      aria-label={label}
      onKeyDown={handleKeyDown}
      style={{
        position: 'fixed',
        left: position.left,
        top: position.top,
        width: position.width,
        maxHeight: position.maxHeight,
      }}
      className="z-50 min-w-40 origin-top animate-dropdown-in overflow-auto rounded-lg border border-border bg-surface-raised py-1 shadow-lg"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <li key={option.value}>
            <button
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors duration-100 hover:bg-surface ${
                active ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200' : 'text-ink'
              }`}
            >
              <span className="min-w-0 truncate">{option.label}</span>
              {option.hint && <span className="shrink-0 text-xs text-ink-faint">{option.hint}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div onKeyDown={handleKeyDown} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        id={buttonId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((previous) => !previous)}
        className={`flex h-11 w-full items-center justify-between gap-2 rounded-lg border bg-surface px-3 text-sm transition-colors duration-150 ${
          invalid ? 'border-signal-danger' : open ? 'border-brand-500' : 'border-border-strong'
        } ${selected ? 'text-ink' : 'text-ink-faint'}`}
      >
        <span className="min-w-0 truncate">{selected ? selected.label : label}</span>
        <span
          className={`shrink-0 text-ink-faint transition-transform duration-150 ease-out ${open ? 'rotate-180' : ''}`}
        >
          <ChevronIcon />
        </span>
      </button>

      {open && mounted && createPortal(list, document.body)}
    </div>
  );
}
