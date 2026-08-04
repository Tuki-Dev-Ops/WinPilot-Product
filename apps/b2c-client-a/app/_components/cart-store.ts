'use client';

import { ACCOUNT, type CartLine } from '@winpilot/client-content';

/**
 * 장바구니 보관 — **브라우저 안에서만** 산다.
 *
 * 이 프로젝트는 프론트엔드 전용이라 서버에 담을 곳이 없다. 그렇다고 화면 안의 상태로만 두면
 * 상품 상세에서 담고 장바구니로 넘어가는 순간(전체 페이지 이동) 사라져, 담기가 동작하지 않는
 * 것처럼 보인다. 그래서 `localStorage` 에 둔다 — 서버가 생기면 이 파일만 바꾸면 된다.
 *
 * 첫 방문에는 `ACCOUNT.cart` 시드로 시작한다. 비어 있는 장바구니로 시작하면 담긴 줄의 배치와
 * 품절 표시를 볼 수 없다.
 *
 * ## 어드민 연동
 * - 담기는 값(상품명·옵션·가격·재고) ← `b2c-admin` 상품 목록·옵션 (store `PRODUCTS`·`PRODUCT_OPTIONS`)
 * - 여기서 주문으로 넘어가면 어드민 메뉴의 **'판매'**(`/products/sales`)에 나타난다 (엔티티 `order`)
 */
const KEY = 'winpilot.cart.v1';

/** 장바구니가 바뀌었음을 같은 화면의 다른 조각(헤더 뱃지 등)에 알린다. */
export const CART_EVENT = 'winpilot:cart';

export function readCart(): CartLine[] {
  if (typeof window === 'undefined') return ACCOUNT.cart;

  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return ACCOUNT.cart;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartLine[]) : ACCOUNT.cart;
  } catch {
    // 저장 공간이 막혀 있거나(사생활 보호 모드) 값이 깨졌으면 시드로 돌아간다.
    return ACCOUNT.cart;
  }
}

export function writeCart(lines: CartLine[]): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // 저장에 실패해도 화면은 계속 동작해야 한다 — 이번 화면 안에서는 상태가 유지된다.
  }
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

/**
 * 같은 상품·같은 옵션이면 **수량만 더한다.** 줄을 새로 만들면 장바구니에 같은 줄이 두 개 생겨
 * 어느 쪽을 지워야 하는지 알 수 없다. 재고를 넘는 만큼은 담기지 않고, 담긴 수량을 돌려준다.
 */
export function addToCart(line: CartLine): { added: number; quantity: number } {
  const lines = readCart();
  const found = lines.find(
    (item) => item.productId === line.productId && item.optionLabel === line.optionLabel,
  );

  if (!found) {
    const quantity = Math.min(line.quantity, line.stock);
    writeCart([...lines, { ...line, quantity }]);
    return { added: quantity, quantity };
  }

  const quantity = Math.min(found.quantity + line.quantity, line.stock);
  writeCart(
    lines.map((item) =>
      item.productId === line.productId && item.optionLabel === line.optionLabel
        ? { ...item, quantity, price: line.price, stock: line.stock }
        : item,
    ),
  );
  return { added: quantity - found.quantity, quantity };
}
