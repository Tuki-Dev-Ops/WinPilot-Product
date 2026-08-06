'use client';

import { useMemo, useState } from 'react';
import {
  COPY,
  TODAY,
  couponAmountText,
  couponState,
  formatMoney,
  type CouponRecord,
} from '@winpilot/client-content';
import { useToast } from '@winpilot/ui';
import { ConfirmDialog } from '@/app/_components/ConfirmDialog';
import { SectionTabs } from '@/app/_components/SectionTabs';

/**
 * 쿠폰함 — **내 쿠폰**과 **쿠폰 받기**를 탭으로 나눈다.
 *
 * 한 목록에 섞으면 "이건 내가 가진 건가, 받아야 하는 건가" 를 매번 판단해야 한다.
 * 나눠 두면 탭 이름이 그 판단을 대신한다.
 *
 * 한 줄에 한 장씩 놓는다. 쿠폰은 조건(최소 금액·기간·최대 할인)을 읽어야 쓸 수 있는지 알 수 있는데,
 * 두 장씩 늘어놓으면 그 줄들이 접혀 조건이 잘린다.
 *
 * ## 어드민 연동
 * - 쿠폰 이름 · 할인 · 조건 · 기간 ← store `COUPONS` (어드민 쿠폰 화면이 생기면 그 화면이 이 값을 고친다)
 * - 사용 여부 ← 주문에서 쿠폰을 쓸 때 기록된다 (어드민 메뉴의 **'판매'** 상세)
 */
export function CouponListView({ mine, open }: { mine: CouponRecord[]; open: CouponRecord[] }) {
  const toast = useToast();
  const [tabId, setTabId] = useState('mine');
  const [claimed, setClaimed] = useState<string[]>([]);
  const [claiming, setClaiming] = useState<CouponRecord | null>(null);

  const myList = useMemo(
    () => [...mine, ...open.filter((coupon) => claimed.includes(coupon.id))],
    [mine, open, claimed],
  );
  const openList = useMemo(() => open.filter((coupon) => !claimed.includes(coupon.id)), [open, claimed]);

  const tabs = [
    { id: 'mine', label: COPY.mypage.couponMine, count: myList.length },
    { id: 'open', label: COPY.mypage.couponClaim, count: openList.length },
  ];

  const claim = () => {
    if (!claiming) return;
    setClaimed((previous) => [...previous, claiming.id]);
    setClaiming(null);
    toast.success({ message: '쿠폰을 받았습니다', detail: `${claiming.name} · 내 쿠폰에서 볼 수 있습니다` });
  };

  const list = tabId === 'mine' ? myList : openList;

  return (
    <>
      <SectionTabs tabs={tabs} activeId={tabId} onSelect={setTabId} label={COPY.mypage.coupons} />

      {list.length === 0 ? (
        <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">
          {tabId === 'mine' ? COPY.mypage.couponEmpty : COPY.mypage.couponClaimEmpty}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((coupon) => {
            const state = couponState(coupon, TODAY);
            const spent = tabId === 'mine' && state !== '사용 가능';

            return (
              <article
                key={coupon.id}
                className={`flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border px-6 py-5 transition-colors duration-150 ${
                  spent ? 'border-border bg-surface opacity-60' : 'border-border bg-canvas'
                }`}
              >
                {/* 할인 값이 가장 먼저 읽혀야 한다 — 쿠폰을 고르는 기준이 그것이다. */}
                <p className="w-28 shrink-0 text-2xl font-bold tabular-nums tracking-tight">
                  {couponAmountText(coupon)}
                </p>

                <div className="min-w-0 flex-1">
                  <p className="min-w-0 truncate text-sm font-medium">{coupon.name}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                    <span className="font-mono tabular-nums">
                      {coupon.startAt} ~ {coupon.endAt}
                    </span>
                    {coupon.minAmount > 0 && (
                      <span>
                        {COPY.mypage.couponMin} {formatMoney(coupon.minAmount)}
                        {COPY.product.priceUnit}
                      </span>
                    )}
                    {coupon.maxDiscount > 0 && (
                      <span>
                        {COPY.mypage.couponMax} {formatMoney(coupon.maxDiscount)}
                        {COPY.product.priceUnit}
                      </span>
                    )}
                  </p>
                </div>

                {tabId === 'mine' ? (
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                      spent
                        ? 'bg-border text-ink-muted'
                        : 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                    }`}
                  >
                    {state}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setClaiming(coupon)}
                    className="h-10 shrink-0 whitespace-nowrap rounded-lg bg-brand-500 px-5 text-sm font-medium text-white hover:bg-brand-600"
                  >
                    {COPY.mypage.couponClaim}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(claiming)}
        title="쿠폰을 받을까요?"
        description="받은 쿠폰은 내 쿠폰에서 볼 수 있고, 기간이 지나면 자동으로 사라집니다."
        confirmLabel={COPY.mypage.couponClaim}
        tone="brand"
        onConfirm={claim}
        onClose={() => setClaiming(null)}
        summary={
          claiming
            ? [
                { label: '쿠폰', value: claiming.name },
                { label: '할인', value: couponAmountText(claiming) },
                { label: COPY.mypage.couponPeriod, value: `${claiming.startAt} ~ ${claiming.endAt}` },
              ]
            : undefined
        }
      />
    </>
  );
}
