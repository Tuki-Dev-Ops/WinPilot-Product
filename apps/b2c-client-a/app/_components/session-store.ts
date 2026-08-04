'use client';

import { ACCOUNT } from '@winpilot/client-content';

/**
 * 로그인 상태 보관 — **브라우저 안에서만** 산다.
 *
 * 장바구니·관심 상품과 같은 이유다(`cart-store.ts`): 서버가 없으므로 세션을 둘 곳이 없고,
 * 화면 안의 상태로만 두면 페이지를 옮기는 순간 다시 로그인 상태로 돌아가 로그아웃이 동작하지
 * 않는 것처럼 보인다. 서버가 생기면 이 파일만 바꾸면 된다.
 *
 * 기본값은 `ACCOUNT.signedIn`(로그인) 이다 — 처음 열었을 때 주문·쿠폰이 있는 화면을 볼 수
 * 있어야 만들어야 할 것이 드러나기 때문이다.
 *
 * ## 어드민 연동
 * - 계정 자체는 `b2c-admin` 사용자 > 사용자 목록(`/users`)에서 운영자가 본다
 * - 로그인 검증 규칙은 어드민 로그인과 한 쌍으로 묶여 있다 (기능 `user.auth`)
 */
const KEY = 'winpilot.session.v1';

/** 로그인 상태가 바뀌었음을 같은 화면의 다른 조각(헤더 등)에 알린다. */
export const SESSION_EVENT = 'winpilot:session';

export function readSignedIn(): boolean {
  if (typeof window === 'undefined') return ACCOUNT.signedIn;

  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === null) return ACCOUNT.signedIn;
    return raw === 'true';
  } catch {
    // 저장 공간이 막혀 있으면(사생활 보호 모드) 기본값으로 본다.
    return ACCOUNT.signedIn;
  }
}

export function setSignedIn(value: boolean): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(KEY, String(value));
  } catch {
    // 저장에 실패해도 이번 화면 안에서는 상태가 유지된다.
  }
  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}
