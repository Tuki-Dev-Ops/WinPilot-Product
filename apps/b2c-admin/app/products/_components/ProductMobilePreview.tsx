'use client';

import { CATEGORIES } from '@/lib/data/categories';
import type { ProductTag } from '@/lib/data/product-tags';
import { estimateReward, formatAmount, parseAmount, type ProductFormInput } from '@/lib/validation/product-record';
import { ProductTagBadges } from './ProductTagBadges';

export type ProductMobilePreviewProps = {
  value: ProductFormInput;
  /** 대표 이미지 미리보기 URL (없으면 자리표시자) */
  imageUrl?: string;
  /** 자동 분류 뱃지 — 고객 화면에도 그대로 나간다 */
  tags?: readonly ProductTag[];
};

/**
 * 고객 화면 미리보기 — **모바일 기준만** 제공한다.
 *
 * 데스크톱까지 흉내 내면 실제 고객 화면과 어긋날 위험이 커지고, 어드민 사이드 폭에서
 * 의미 있게 보여줄 수도 없다. 구매 결정에 필요한 것(가격·적립·배송)만 모바일 폭으로 보여준다.
 */
export function ProductMobilePreview({ value, imageUrl, tags = [] }: ProductMobilePreviewProps) {
  const price = parseAmount(value.price);
  const listPrice = parseAmount(value.listPrice);
  const hasDiscount = listPrice > price && price > 0;
  const discountRate = hasDiscount ? Math.round(((listPrice - price) / listPrice) * 100) : 0;
  const reward = estimateReward(value);

  const rootName = CATEGORIES.find((item) => item.id === value.categoryRootId)?.name;
  const childName = CATEGORIES.find((item) => item.id === value.categoryChildId)?.name;
  const path = [rootName, childName].filter(Boolean).join(' · ');

  const surcharges = value.regions.filter((region) => region.name.trim());
  const first = surcharges[0];
  const surchargeSummary = first
    ? `${first.name} +${formatAmount(parseAmount(first.fee))}원${surcharges.length > 1 ? ` 외 ${surcharges.length - 1}곳` : ''}`
    : '';

  const shipping =
    value.shippingPolicy === '무료'
      ? '무료배송'
      : value.shippingPolicy === '조건부 무료'
        ? `${formatAmount(parseAmount(value.freeThreshold))}원 이상 무료배송`
        : `배송비 ${formatAmount(parseAmount(value.shippingFee))}원`;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-canvas">
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
        <h2 className="text-base font-semibold tracking-tight">고객 화면 미리보기</h2>
        <span className="rounded-full bg-surface px-2.5 py-1 text-xs text-ink-faint">모바일</span>
      </div>

      <div className="flex justify-center px-6 py-6">
        {/* 모바일 기기 틀 */}
        <div className="w-full max-w-64 overflow-hidden rounded-2xl border border-border-strong bg-surface-raised">
          <div className="flex items-center justify-center border-b border-border bg-surface py-2">
            <span className="h-1 w-12 rounded-full bg-border-strong" />
          </div>

          <div className="relative">
            <div className="flex aspect-square items-center justify-center bg-surface">
              {imageUrl ? (
                // 미리보기는 objectURL 이라 next/image 최적화 대상이 아니다.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="대표 이미지" className="size-full object-cover" />
              ) : (
                <span className="text-xs text-ink-faint">상품 이미지</span>
              )}
            </div>

            {!value.visible && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/60 px-4">
                <p className="text-center text-xs leading-relaxed text-white">
                  숨김 상태입니다.
                  <br />
                  고객 화면에 노출되지 않습니다.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 px-4 py-4">
            {path && <p className="text-xs text-ink-faint">{path}</p>}

            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <ProductTagBadges tags={tags} size="sm" />
              </div>
            )}

            <p className="text-sm font-semibold leading-snug">{value.name.trim() || '상품명이 여기에 표시됩니다'}</p>

            <div className="flex flex-col gap-1">
              {hasDiscount && (
                <span className="text-xs text-ink-faint line-through">{formatAmount(listPrice)}원</span>
              )}
              <div className="flex items-baseline gap-2">
                {hasDiscount && (
                  <span className="text-sm font-bold tabular-nums text-signal-danger">{discountRate}%</span>
                )}
                <span className="text-base font-bold tabular-nums">{formatAmount(price)}원</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 border-t border-border pt-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-ink-faint">적립</span>
                <span className="text-xs tabular-nums text-brand-700 dark:text-brand-300">
                  {formatAmount(reward)}원
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-ink-faint">배송</span>
                <span className="text-xs text-ink-muted">{shipping}</span>
              </div>
              {surcharges.length > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <span className="shrink-0 text-xs text-ink-faint">추가비</span>

                  {/*
                    좁은 미리보기 폭에서 지역이 늘어나면 줄바꿈으로 카드가 늘어난다.
                    한 줄로 줄여 보여주고, 전체 목록은 hover/focus 툴팁으로 편다.
                  */}
                  <span className="group relative min-w-0">
                    <span
                      tabIndex={0}
                      className="block cursor-default min-w-0 truncate text-right text-xs text-ink-muted underline decoration-dotted underline-offset-2"
                    >
                      {surchargeSummary}
                    </span>

                    <span className="pointer-events-none absolute bottom-full right-0 z-10 mb-1 hidden w-max max-w-48 flex-col gap-1 rounded-lg border border-border bg-surface-raised px-3 py-2 shadow-lg group-hover:flex group-focus-within:flex">
                      {surcharges.map((region) => (
                        <span key={region.key} className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-ink-muted">{region.name}</span>
                          <span className="tabular-nums text-ink">+{formatAmount(parseAmount(region.fee))}원</span>
                        </span>
                      ))}
                    </span>
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled
              className={`mt-1 h-9 w-full rounded-lg text-xs font-medium ${
                value.saleState === '판매중'
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface text-ink-faint'
              }`}
            >
              {value.saleState === '판매중' ? '구매하기' : value.saleState}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
