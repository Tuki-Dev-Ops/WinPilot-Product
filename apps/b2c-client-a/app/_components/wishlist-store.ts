'use client';

/**
 * 관심 상품 보관 — **브라우저 안에서만** 산다.
 *
 * 장바구니와 같은 이유로 `localStorage` 를 쓴다(`cart-store.ts`): 이 프로젝트는 프론트엔드
 * 전용이라 담아 둘 서버가 없고, 화면 안의 상태로만 두면 상품을 눌러 상세로 넘어가는 순간
 * 표시가 풀려 기능이 없는 것처럼 보인다. 서버가 생기면 이 파일만 바꾸면 된다.
 *
 * ## 어드민 연동
 * - 담기는 것은 상품 아이디뿐이다 — 이름·가격은 `b2c-admin` 상품 목록에서 그때그때 읽는다
 * - 어드민에 '관심 상품' 화면은 아직 없다. 생기면 상품별 담은 수를 여기서 집계한다
 */
const KEY = 'winpilot.wishlist.v1';

/** 관심 목록이 바뀌었음을 같은 화면의 다른 하트들에게 알린다. */
export const WISHLIST_EVENT = 'winpilot:wishlist';

export function readWishlist(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    // 저장 공간이 막혀 있거나(사생활 보호 모드) 값이 깨졌으면 빈 목록으로 본다.
    return [];
  }
}

/** 눌린 상태를 뒤집고 **뒤집힌 결과**를 돌려준다 — 부르는 쪽이 안내 문구를 그것으로 고른다. */
export function toggleWishlist(productId: string): boolean {
  const list = readWishlist();
  const has = list.includes(productId);
  const next = has ? list.filter((id) => id !== productId) : [...list, productId];

  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // 저장에 실패해도 이번 화면 안에서는 표시가 유지되어야 한다.
  }
  window.dispatchEvent(new CustomEvent(WISHLIST_EVENT));

  return !has;
}
