'use client';

import { useState, type KeyboardEvent } from 'react';
import { HintInput, useToast } from '@winpilot/ui';
import {
  buildOptions,
  formatAmount,
  parseAmount,
  type ProductOptionInput,
} from '@/lib/validation/product-record';

export type ProductOptionEditorProps = {
  colors: string[];
  sizes: string[];
  options: ProductOptionInput[];
  onChange: (next: { colors: string[]; sizes: string[]; options: ProductOptionInput[] }) => void;
  colorError?: string;
  optionErrors?: Record<string, string>;
};

function TokenList({
  items,
  onRemove,
  emptyText,
}: {
  items: string[];
  onRemove: (value: string) => void;
  emptyText: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-faint">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-surface py-1 pl-3 pr-1.5 text-sm"
        >
          {item}
          <button
            type="button"
            onClick={() => onRemove(item)}
            aria-label={`${item} 삭제`}
            className="shrink-0 rounded-full p-1 text-ink-faint transition-colors duration-150 hover:text-signal-danger"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2.5 2.5 L7.5 7.5 M7.5 2.5 L2.5 7.5" strokeLinecap="round" />
            </svg>
          </button>
        </span>
      ))}
    </div>
  );
}

/**
 * 상품 옵션 — 색상과 사이즈를 각각 등록하면 그 **조합**이 자동으로 만들어진다.
 *
 * 조합을 손으로 하나씩 넣게 하면 색상 3 × 사이즈 4 에서 12줄을 직접 적어야 하고,
 * 빠뜨린 조합이 생긴다. 색상·사이즈만 받고 곱하는 편이 빠뜨릴 수 없다.
 *
 * 사이즈를 하나도 넣지 않으면 색상만으로 단일 옵션이 만들어진다 —
 * 그런 상품은 교환으로 바꿀 사이즈가 없으므로 판매 화면에서 교환이 막힌다.
 */
export function ProductOptionEditor({
  colors,
  sizes,
  options,
  onChange,
  colorError,
  optionErrors = {},
}: ProductOptionEditorProps) {
  const toast = useToast();
  const [colorDraft, setColorDraft] = useState('');
  const [sizeDraft, setSizeDraft] = useState('');

  const apply = (nextColors: string[], nextSizes: string[]) => {
    onChange({
      colors: nextColors,
      sizes: nextSizes,
      options: buildOptions(nextColors, nextSizes, options),
    });
  };

  const addToken = (kind: 'color' | 'size') => {
    const draft = (kind === 'color' ? colorDraft : sizeDraft).trim();
    const list = kind === 'color' ? colors : sizes;
    const label = kind === 'color' ? '색상' : '사이즈';

    if (!draft) return;
    if (list.includes(draft)) {
      toast.error({ message: `이미 등록한 ${label}입니다.`, detail: draft });
      return;
    }

    if (kind === 'color') {
      apply([...colors, draft], sizes);
      setColorDraft('');
    } else {
      apply(colors, [...sizes, draft]);
      setSizeDraft('');
    }
  };

  const removeToken = (kind: 'color' | 'size', value: string) => {
    if (kind === 'color') apply(colors.filter((item) => item !== value), sizes);
    else apply(colors, sizes.filter((item) => item !== value));
  };

  const onDraftKeyDown = (kind: 'color' | 'size') => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    // 폼 안의 Enter 는 기본적으로 제출이다 — 여기서는 항목 추가로 쓴다.
    event.preventDefault();
    addToken(kind);
  };

  const setStock = (key: string, stock: string) => {
    onChange({
      colors,
      sizes,
      options: options.map((option) => (option.key === key ? { ...option, stock } : option)),
    });
  };

  const total = options.reduce((sum, option) => sum + parseAmount(option.stock), 0);
  const soldOut = options.filter((option) => parseAmount(option.stock) === 0).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="option-color" className="text-sm font-medium">
          색상
        </label>
        <div className="flex items-center gap-2">
          <HintInput
            id="option-color"
            type="text"
            hint="예: 베이지"
            value={colorDraft}
            onChange={(event) => setColorDraft(event.target.value)}
            onKeyDown={onDraftKeyDown('color')}
            invalid={Boolean(colorError)}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => addToken('color')}
            className="h-11 shrink-0 whitespace-nowrap rounded-lg border border-border-strong px-4 text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint"
          >
            추가
          </button>
        </div>
        <TokenList
          items={colors}
          onRemove={(value) => removeToken('color', value)}
          emptyText="등록한 색상이 없습니다."
        />
        {colorError && <p className="text-sm text-signal-danger">{colorError}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="option-size" className="text-sm font-medium">
          사이즈 (선택)
        </label>
        <div className="flex items-center gap-2">
          <HintInput
            id="option-size"
            type="text"
            hint="예: M · 넣지 않으면 단일 옵션"
            value={sizeDraft}
            onChange={(event) => setSizeDraft(event.target.value)}
            onKeyDown={onDraftKeyDown('size')}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => addToken('size')}
            className="h-11 shrink-0 whitespace-nowrap rounded-lg border border-border-strong px-4 text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint"
          >
            추가
          </button>
        </div>
        <TokenList
          items={sizes}
          onRemove={(value) => removeToken('size', value)}
          emptyText="사이즈를 넣지 않으면 색상만으로 옵션이 만들어집니다."
        />
      </div>

      {options.length === 0 ? (
        <p className="rounded-lg bg-surface px-4 py-6 text-center text-sm text-ink-muted">
          색상을 등록하면 조합이 여기에 만들어집니다.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="hidden gap-4 border-b border-border bg-surface px-4 py-2.5 text-xs text-ink-faint sm:grid sm:grid-cols-12 sm:items-center">
            <span className="sm:col-span-1 sm:text-center">순번</span>
            <span className="sm:col-span-4">색상</span>
            <span className="sm:col-span-3">사이즈</span>
            <span className="sm:col-span-4 sm:text-right">재고</span>
          </div>

          <div className="flex flex-col">
            {options.map((option, index) => (
              <div
                key={option.key}
                className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-4 py-3 last:border-b-0 sm:grid-cols-12 sm:items-center sm:gap-y-0"
              >
                <span className="font-mono text-sm tabular-nums text-ink-faint sm:col-span-1 sm:text-center">
                  {index + 1}
                </span>

                <span className="min-w-0 truncate text-sm sm:col-span-4">{option.color}</span>

                <span className="min-w-0 truncate text-sm text-ink-muted sm:col-span-3">
                  {option.size || '단일'}
                </span>

                <div className="flex items-center gap-2 sm:col-span-4 sm:justify-end">
                  <span className="w-16 shrink-0 text-xs text-ink-faint sm:hidden">재고</span>
                  <HintInput
                    aria-label={`${option.color} ${option.size || '단일'} 재고`}
                    type="text"
                    inputMode="numeric"
                    hint="0"
                    value={option.stock}
                    onChange={(event) => setStock(option.key, event.target.value)}
                    invalid={Boolean(optionErrors[option.key])}
                    className="w-full sm:w-28"
                  />
                  <span className="w-4 shrink-0 text-sm text-ink-muted">개</span>
                </div>

                {optionErrors[option.key] && (
                  <p className="text-sm text-signal-danger sm:col-span-12 sm:text-right">
                    {optionErrors[option.key]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface px-4 py-3">
            <p className="text-xs text-ink-muted">
              조합 <span className="tabular-nums">{options.length}</span>개
              {soldOut > 0 && <span className="ml-2 text-signal-danger">품절 {soldOut}개</span>}
            </p>
            <p className="text-xs text-ink-muted">
              재고 합계 <span className="font-medium tabular-nums text-ink">{formatAmount(total)}</span>개
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
