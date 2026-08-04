'use client';

import { useEffect, useState } from 'react';
import { COPY, ROUTES, unreadAlarms } from '@winpilot/client-content';
import { useToast } from '@winpilot/ui';
import { SESSION_EVENT, readSignedIn, setSignedIn } from './session-store';

/**
 * 헤더 오른쪽 — **로그인 상태에 따라 달라지는 부분**만 떼어 놓았다.
 *
 * 로그인 여부는 브라우저에만 있어(`session-store`) 서버가 미리 알 수 없다. 헤더 전체를
 * 클라이언트로 돌리는 대신 이 조각만 클라이언트로 두면, 로고·메뉴·검색은 서버가 그린 그대로
 * 남아 추출 결과가 흔들리지 않는다.
 *
 * 관심 상품과 알람은 **로그인한 사람에게만** 둔다. 비회원에게는 담을 곳도 받을 알람도 없어
 * 눌러도 빈 화면이 나오는데, 아이콘이 있으면 없는 기능을 있는 것처럼 보인다.
 * 장바구니는 비회원도 담을 수 있어 늘 둔다.
 *
 * 처음에는 서버가 그린 것과 같은 값(로그인)으로 그리고, 브라우저에 올라온 뒤 저장된 값으로
 * 맞춘다 — 처음부터 저장분을 읽으면 서버 결과와 어긋난다.
 *
 * ## 어드민 연동
 * - 계정은 `b2c-admin` 사용자 > 사용자 목록(`/users`)에서 운영자가 본다
 * - 알람 수는 어드민이 주문 상태를 바꾸거나 공지를 올릴 때 늘어난다
 */
function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M10 16.5 C10 16.5 3 12.4 3 7.9 A3.4 3.4 0 0 1 10 6.1 A3.4 3.4 0 0 1 17 7.9 C17 12.4 10 16.5 10 16.5 Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlarmIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5.5 8 a4.5 4.5 0 0 1 9 0 v3.5 l1.5 2 h-12 l1.5 -2 z" strokeLinejoin="round" />
      <path d="M8.25 16 a1.9 1.9 0 0 0 3.5 0" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2.5 3.5 h2 l2 8.5 h8 l2 -6.5 h-11" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.5" cy="16" r="1.2" />
      <circle cx="14" cy="16" r="1.2" />
    </svg>
  );
}

/** 아바타 — 회색 원판 **안에 표정만** 둔다. 윤곽선을 그리면 원판 테두리와 두 겹이 된다. */
function AvatarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M7 8v.05M13 8v.05" strokeLinecap="round" />
      <path d="M6.4 12a4.3 4.3 0 0 0 7.2 0" strokeLinecap="round" />
    </svg>
  );
}

const ICON_LINK = 'grid size-10 place-items-center rounded-lg text-ink hover:bg-surface';

export function HeaderAccount() {
  const toast = useToast();
  const [signedIn, setState] = useState(true);
  const unread = unreadAlarms();

  useEffect(() => {
    const sync = () => setState(readSignedIn());
    sync();
    window.addEventListener(SESSION_EVENT, sync);
    return () => window.removeEventListener(SESSION_EVENT, sync);
  }, []);

  const logout = () => {
    setSignedIn(false);
    toast.success({ message: '로그아웃했습니다', detail: '주문·쿠폰은 다시 로그인하면 그대로 있습니다.' });
  };

  return (
    <>
      {signedIn && (
        <>
          <a href={ROUTES.products} aria-label={COPY.header.wishlist} className={ICON_LINK}>
            <HeartIcon />
          </a>

          <a href={ROUTES.alarms} aria-label={COPY.header.alarm} className={`relative ${ICON_LINK}`}>
            <AlarmIcon />
            {/* 읽지 않은 알람 수 — 숫자를 보여야 '몇 개나 밀렸는지' 가 전달된다. */}
            {unread > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-signal-danger px-1 text-[10px] font-medium leading-none tabular-nums text-white">
                {unread}
              </span>
            )}
          </a>
        </>
      )}

      <a href={ROUTES.cart} aria-label={COPY.header.cart} className={ICON_LINK}>
        <CartIcon />
      </a>

      {signedIn ? (
        /*
          아바타 — 누르면 **마이페이지 · 로그아웃** 이 열린다. 나가는 길이 화면 어디에도 없으면
          마이페이지까지 들어가야 찾게 된다.

          메뉴는 주 메뉴와 같이 **CSS 만으로** 편다(`group-hover` · `group-focus-within`).
          자바스크립트로 열면 추출 시점의 DOM 에는 닫힌 상태만 남아 Figma 에 메뉴가 아예 없다.
        */
        <div className="group relative">
          <button
            type="button"
            aria-label={COPY.header.mypage}
            aria-haspopup="menu"
            className="grid size-10 place-items-center rounded-lg text-ink hover:bg-surface"
          >
            <span className="grid size-7 place-items-center rounded-full bg-border text-ink-muted">
              <AvatarIcon />
            </span>
          </button>

          <div
            role="menu"
            className="absolute right-0 top-full z-50 hidden min-w-36 rounded-lg border border-border bg-canvas py-2 shadow-lg group-focus-within:block group-hover:block"
          >
            <a
              href={ROUTES.mypage}
              role="menuitem"
              className="block whitespace-nowrap px-4 py-2 text-sm text-ink-muted hover:bg-surface hover:text-ink"
            >
              {COPY.header.mypage}
            </a>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="block w-full whitespace-nowrap px-4 py-2 text-left text-sm text-ink-muted hover:bg-surface hover:text-ink"
            >
              {COPY.mypage.logout}
            </button>
          </div>
        </div>
      ) : (
        /*
          비회원에게는 아바타 대신 **로그인 · 회원가입** 을 글자 그대로 둔다. 얼굴 그림은
          '내 계정' 을 뜻하는데 아직 계정이 없어 무엇을 누르는 자리인지 전해지지 않는다.
        */
        <div className="ml-1 flex shrink-0 items-center gap-2">
          <a
            href={ROUTES.login}
            className="flex h-9 shrink-0 items-center whitespace-nowrap rounded border border-border-strong px-3.5 text-sm text-ink"
          >
            {COPY.header.login}
          </a>
          <a
            href={ROUTES.signup}
            className="flex h-9 shrink-0 items-center whitespace-nowrap rounded bg-ink px-3.5 text-sm font-medium text-white"
          >
            {COPY.header.signup}
          </a>
        </div>
      )}
    </>
  );
}
