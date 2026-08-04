'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  ACCOUNT,
  COPY,
  ROUTES,
  TODAY,
  couponAmountText,
  couponState,
  findProduct,
  formatMoney,
  myCoupons,
  type CartLine,
} from '@winpilot/client-content';
import { Checkbox, useToast } from '@winpilot/ui';
import { ConfirmDialog } from '@/app/_components/ConfirmDialog';
import { ProductArt } from '@/app/_components/ProductArt';
import { readCart, writeCart } from '@/app/_components/cart-store';

/**
 * 결제 화면 — **무엇을 · 어디로 · 얼마에** 세 가지를 한 화면에서 확인하고 끝낸다.
 *
 * 단계를 나누지 않는다. 배송지·결제수단을 각각 다른 화면에 두면 마지막 금액을 보려고 앞뒤로
 * 오가게 되고, 그 사이에 쿠폰을 잘못 골라도 알아채기 어렵다. 오른쪽 합계는 왼쪽에서 무엇을
 * 바꾸든 **즉시** 따라 움직인다.
 *
 * 쿠폰은 **한 장만** 쓴다. 여러 장을 겹쳐 쓰는 규칙(중복 사용 가능 여부·적용 순서)은 운영이
 * 정할 일이라, 정해지기 전에 화면이 먼저 규칙을 만들어 버리면 나중에 되돌리기 어렵다.
 *
 * ## 어드민 연동
 * - 상품·가격·재고 ← `b2c-admin` 상품 > 상품 목록 (store `PRODUCTS`)
 * - 쿠폰 ← store `COUPONS` (어드민 쿠폰 화면이 생기면 그 화면이 원본이 된다)
 * - 배송지·연락처 ← 사용자 > 사용자 목록의 회원 정보 (고객은 마이페이지에서 고친다)
 * - 결제를 마치면 어드민 메뉴의 **'판매'** 목록(`/products/sales`)에 주문으로 나타난다
 *   — 고객 화면의 '주문' 과 같은 자원이다(엔티티 `order`)
 */
type Line = CartLine;

const PAY_METHODS = [
  { id: 'card', label: '신용·체크카드' },
  { id: 'transfer', label: '계좌이체' },
  { id: 'vbank', label: '가상계좌' },
  { id: 'easy', label: '간편결제' },
] as const;

/** 주문번호 — 서버가 매길 값이다. 화면에서는 결과 화면에 보여 줄 임시 번호만 만든다. */
function draftOrderId(seed: number): string {
  return `S-${24100 + (seed % 900)}`;
}

export function CheckoutView({ initialLines }: { initialLines: Line[] }) {
  const toast = useToast();
  const router = useRouter();

  const [lines, setLines] = useState(initialLines);
  const [fromCart, setFromCart] = useState(false);

  const [address, setAddress] = useState(`${ACCOUNT.address} ${ACCOUNT.addressDetail}`.trim());
  const [request, setRequest] = useState('');
  const [couponId, setCouponId] = useState('');
  const [usePoint, setUsePoint] = useState(false);
  const [method, setMethod] = useState<string>(PAY_METHODS[0].id);
  const [agreed, setAgreed] = useState(false);
  const [confirming, setConfirming] = useState(false);

  /*
    장바구니에서 온 경우에는 브라우저에 담긴 것을 읽는다. 서버는 그 값을 알 수 없어 처음에는
    빈 목록으로 그리고, 올라온 뒤 채운다 — 처음부터 읽으면 서버가 그린 것과 어긋난다.
  */
  useEffect(() => {
    if (initialLines.length > 0) return;
    setFromCart(true);
    setLines(readCart().filter((line) => line.stock > 0));
  }, [initialLines.length]);

  const coupons = useMemo(() => myCoupons().filter((coupon) => couponState(coupon, TODAY) === '사용 가능'), []);

  const goods = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  // 배송비는 상품마다 다르지만, 한 번의 주문에는 한 번만 붙는다 — 가장 비싼 조건을 따른다.
  const shipping = goods === 0 || goods >= 50_000 ? 0 : 3_000;

  const coupon = coupons.find((item) => item.id === couponId);
  const couponCut = !coupon
    ? 0
    : coupon.kind === '정률'
      ? Math.min(Math.floor((goods * coupon.value) / 100), coupon.maxDiscount || Infinity)
      : coupon.value;

  const point = usePoint ? Math.min(ACCOUNT.reward, Math.max(goods - couponCut, 0)) : 0;
  const total = Math.max(goods - couponCut - point, 0) + shipping;

  const blocked = (): string => {
    if (lines.length === 0) return '주문할 상품이 없습니다.';
    if (!address.trim()) return '배송지를 입력해 주세요.';
    if (coupon && coupon.minAmount > goods) {
      return `${coupon.name}은(는) ${formatMoney(coupon.minAmount)}원 이상 주문에 쓸 수 있습니다.`;
    }
    if (!agreed) return '주문 내용 확인과 결제에 동의해 주세요.';
    return '';
  };

  const pay = () => {
    setConfirming(false);
    // 장바구니에서 왔다면 결제한 줄은 비운다 — 남겨 두면 같은 것을 두 번 주문하게 된다.
    if (fromCart) writeCart(readCart().filter((line) => line.stock === 0));

    toast.success({ message: '결제가 완료되었습니다', detail: `${formatMoney(total)}${COPY.product.priceUnit}` });
    router.push(`${ROUTES.resultDone('order')}&id=${draftOrderId(total)}`);
  };

  const submit = () => {
    const reason = blocked();
    if (reason) {
      toast.error({ message: '결제하지 못했습니다', detail: reason });
      return;
    }
    setConfirming(true);
  };

  const rows = [
    { label: '상품 금액', value: `${formatMoney(goods)}${COPY.product.priceUnit}` },
    { label: '배송비', value: shipping === 0 ? '무료' : `${formatMoney(shipping)}${COPY.product.priceUnit}` },
    ...(couponCut > 0 ? [{ label: '쿠폰 할인', value: `-${formatMoney(couponCut)}${COPY.product.priceUnit}` }] : []),
    ...(point > 0 ? [{ label: '적립금 사용', value: `-${formatMoney(point)}${COPY.product.priceUnit}` }] : []),
  ];

  return (
    <>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold tracking-tight">주문 상품</h2>

            {lines.length === 0 ? (
              <p className="rounded-xl bg-surface px-6 py-10 text-center text-sm text-ink-muted">{COPY.cart.empty}</p>
            ) : (
              <div className="flex flex-col overflow-hidden rounded-xl border border-border">
                {lines.map((line) => {
                  const art = findProduct(line.productId)?.art;
                  return (
                    <div
                      key={`${line.productId}-${line.optionLabel}`}
                      className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-b-0"
                    >
                      <span className="size-16 shrink-0 overflow-hidden rounded-lg bg-surface">
                        {art && (
                          <ProductArt kind={art.kind} from={art.from} to={art.to} ink={art.ink} className="size-full" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{line.productName}</p>
                        <p className="truncate text-xs text-ink-muted">
                          {line.optionLabel} · {line.quantity}개
                        </p>
                      </div>
                      <span className="shrink-0 whitespace-nowrap text-sm tabular-nums">
                        {formatMoney(line.price * line.quantity)}
                        {COPY.product.priceUnit}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold tracking-tight">배송지</h2>

            <div className="flex flex-col gap-3 rounded-xl border border-border px-5 py-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="font-medium">{ACCOUNT.name}</span>
                <span className="tabular-nums text-ink-muted">
                  {ACCOUNT.countryCode} {ACCOUNT.phone}
                </span>
                <a href={ROUTES.mypage} className="ml-auto shrink-0 text-xs text-brand-700 dark:text-brand-300">
                  내 정보 수정
                </a>
              </div>

              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                aria-label="배송지"
                className="h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm"
              />

              <div className="relative flex items-center">
                <input
                  value={request}
                  onChange={(event) => setRequest(event.target.value)}
                  aria-label="배송 요청사항"
                  placeholder=" "
                  className="peer h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm"
                />
                {/* placeholder 는 추출되지 않는다 — 겹쳐 둔 글자가 자리를 지킨다. */}
                <span className="pointer-events-none absolute left-3 text-sm text-ink-faint peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden">
                  배송 요청사항 (선택)
                </span>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold tracking-tight">할인</h2>

            <div className="flex flex-col gap-4 rounded-xl border border-border px-5 py-5">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">{COPY.mypage.coupons}</span>
                {coupons.length === 0 ? (
                  <p className="text-xs text-ink-muted">지금 쓸 수 있는 쿠폰이 없습니다.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {[{ id: '', name: '쓰지 않음' }, ...coupons].map((item) => {
                      const on = item.id === couponId;
                      const full = coupons.find((entry) => entry.id === item.id);
                      return (
                        <button
                          key={item.id || 'none'}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setCouponId(item.id)}
                          className={`flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg border px-3.5 text-sm transition-colors duration-150 ${
                            on ? 'border-ink bg-ink font-medium text-white' : 'border-border-strong text-ink-muted'
                          }`}
                        >
                          {item.name}
                          {full && <span className="ml-1.5 text-xs">{couponAmountText(full)}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2.5 border-t border-border pt-4">
                <Checkbox checked={usePoint} onChange={setUsePoint} label="적립금 사용" />
                <span className="text-sm">
                  적립금 전액 사용
                  <span className="ml-2 tabular-nums text-ink-muted">
                    보유 {formatMoney(ACCOUNT.reward)}
                    {COPY.product.priceUnit}
                  </span>
                </span>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold tracking-tight">결제 수단</h2>

            {/*
              네이티브 select 를 쓰지 않는다 — option 글자는 DOM 텍스트가 아니라 추출되지 않고
              Figma 에서 빈 상자가 된다 (docs/spec/05-component.md).
            */}
            <div className="flex flex-wrap gap-2">
              {PAY_METHODS.map((item) => {
                const on = item.id === method;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setMethod(item.id)}
                    className={`flex h-11 shrink-0 items-center whitespace-nowrap rounded-lg border px-4 text-sm transition-colors duration-150 ${
                      on ? 'border-ink bg-ink font-medium text-white' : 'border-border-strong text-ink-muted'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* 합계는 화면을 따라 붙어 있는다 — 아래로 내리는 사이에 금액이 시야에서 사라지면 안 된다. */}
        <aside className="flex w-full shrink-0 flex-col gap-4 rounded-xl border border-border px-6 py-5 lg:sticky lg:top-6 lg:w-88">
          <h2 className="text-base font-bold tracking-tight">결제 금액</h2>

          <dl className="flex flex-col gap-2">
            {rows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4">
                <dt className="shrink-0 text-sm text-ink-muted">{row.label}</dt>
                <dd className="text-sm tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex items-baseline justify-between gap-4 border-t border-border pt-4">
            <span className="shrink-0 text-sm font-medium">최종 결제 금액</span>
            <span className="text-xl font-bold tabular-nums">
              {formatMoney(total)}
              {COPY.product.priceUnit}
            </span>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg bg-surface px-4 py-3">
            <Checkbox checked={agreed} onChange={setAgreed} label="주문 내용 확인 및 결제 동의" />
            <span className="text-xs leading-relaxed text-ink-muted">
              주문 내용을 확인했으며 결제에 동의합니다.{' '}
              <a href={ROUTES.terms} className="text-brand-700 underline underline-offset-2 dark:text-brand-300">
                이용약관
              </a>
            </span>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={lines.length === 0}
            className="h-12 w-full shrink-0 whitespace-nowrap rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600 disabled:bg-surface disabled:text-ink-faint"
          >
            {formatMoney(total)}
            {COPY.product.priceUnit} 결제하기
          </button>
        </aside>
      </div>

      <ConfirmDialog
        open={confirming}
        title="결제할까요?"
        description="결제하면 주문이 접수되고, 배송 준비가 시작됩니다."
        confirmLabel="결제하기"
        tone="brand"
        onConfirm={pay}
        onClose={() => setConfirming(false)}
        summary={[
          { label: '주문 상품', value: `${lines.length}건` },
          { label: '결제 수단', value: PAY_METHODS.find((item) => item.id === method)?.label ?? '' },
          { label: '최종 결제 금액', value: `${formatMoney(total)}${COPY.product.priceUnit}` },
        ]}
      />
    </>
  );
}
