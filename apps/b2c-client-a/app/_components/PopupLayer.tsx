'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { PopupItem } from '@winpilot/client-content';

/** `오늘 하루 보지 않기` 를 누른 기록이 사는 곳. 팝업마다 한 칸씩. */
const HIDE_KEY = 'b2c-popup-hidden';

/**
 * 어디에 서는가.
 *
 * 가운데 것만 바탕을 덮는다(`가운데` 는 읽기를 막는 자리). 모서리 둘은 **옆에 뜨는 알림**에
 * 가까워 바탕을 덮으면 무게가 어긋난다 — 앱 설치 안내 같은 것이 결제를 막으면 안 된다.
 */
const PLACE: Record<PopupItem['position'], string> = {
  '왼쪽 위': 'items-start justify-start',
  가운데: 'items-center justify-center',
  '오른쪽 아래': 'items-end justify-end',
};

/**
 * 사이트에 뜨는 팝업.
 *
 * ## 어드민에 세 화면이 있고 이게 없었다
 * 배너 > 팝업에 목록 · 등록 · 상세가 있는데 **고객 앱에 띄우는 코드가 한 줄도 없었다.**
 * 저장은 되는데 아무 일도 일어나지 않는 상태였고, 그것은 올린 사람이 자기가 뭘 잘못했는지
 * 찾게 만든다. F&B 에 먼저 만든 것과 같은 조각이다.
 *
 * ## 계약 단계가 고르고 화면이 감춘다
 * 지금 걸린 팝업을 고르는 일은 `@winpilot/client-content` 가 한다 — 기간이 지났거나 내려 둔
 * 것은 여기까지 오지 않는다. 화면이 다시 판단하면 그 판단이 두 벌이 된다.
 *
 * 화면이 하는 일은 **감추는 것**뿐이다. `오늘 하루 보지 않기` 기록은 그 사람의 브라우저에만
 * 있어 서버도 어드민도 알 수 없다.
 *
 * ## 처음 한 번은 아무것도 그리지 않는다
 * 저장된 기록은 브라우저에만 있어 서버가 모른다. 서버가 판단해 그려 두면 **감춰 둔 팝업이
 * 한 번 깜빡였다가 사라진다** — 그것은 감춘 것이 아니다. `useEffect` 가 돈 뒤에 연다.
 *
 * ## 한 번에 하나만 띄운다
 * 기간이 겹치면 여럿이 동시에 걸린다. 셋을 한꺼번에 띄우면 손님이 셋을 닫고서야 화면에 닿고,
 * 그 상태는 올린 사람 눈에 보이지 않는다. 앞의 것을 닫으면 다음 것이 뜬다.
 *
 * ## 자리에 따라 무게가 다르다
 * `가운데` 만 바탕을 덮고 바깥을 눌러 닫을 수 있다. 모서리 둘은 옆에 떠 있을 뿐이라 바탕을
 * 덮지 않는다 — 앱 설치 안내가 장바구니를 막으면 안 된다.
 *
 * ## 본문이 HTML 이다
 * 어드민 편집기가 만든 값이라 그대로 그린다. 이 저장소가 공지·약관에서 쓰는 방식과 같다.
 */
export function PopupLayer({ popups }: { popups: readonly PopupItem[] }) {
  const [ready, setReady] = useState(false);
  const [closed, setClosed] = useState<string[]>([]);

  useEffect(() => {
    /*
      오늘 감춰 둔 것을 읽는다. 값이 `{id: 'YYYY-MM-DD'}` 라 날짜가 바뀌면 저절로 되살아난다 —
      비우는 일을 따로 하지 않으려는 것이다.
    */
    const today = new Date().toISOString().slice(0, 10);
    let hidden: string[] = [];
    try {
      const saved = JSON.parse(window.localStorage.getItem(HIDE_KEY) ?? '{}') as Record<string, string>;
      hidden = Object.keys(saved).filter((id) => saved[id] === today);
    } catch {
      /* 값이 깨져 있으면 그냥 다 띄운다 — 안 띄우는 쪽으로 실패하면 알릴 것을 못 알린다. */
    }
    setClosed(hidden);
    setReady(true);
  }, []);

  const shown = popups.find((one) => !closed.includes(one.id));
  if (!ready || !shown) return null;

  const close = (forToday: boolean) => {
    if (forToday) {
      try {
        const saved = JSON.parse(window.localStorage.getItem(HIDE_KEY) ?? '{}') as Record<string, string>;
        saved[shown.id] = new Date().toISOString().slice(0, 10);
        window.localStorage.setItem(HIDE_KEY, JSON.stringify(saved));
      } catch {
        /* 저장이 막혀 있어도(사생활 보호 모드) 닫히기는 해야 한다. */
      }
    }
    setClosed((was) => [...was, shown.id]);
  };

  const centered = shown.position === '가운데';

  return (
    <div
      role="dialog"
      aria-modal={centered}
      aria-labelledby={`popup-${shown.id}`}
      className={`fixed inset-0 z-50 flex p-4 sm:p-8 ${PLACE[shown.position]} ${
        centered ? 'bg-night/50 backdrop-blur-[2px]' : 'pointer-events-none'
      }`}
      onClick={centered ? () => close(false) : undefined}
    >
      {/*
        모서리 팝업은 바깥이 눌리지 않아야 한다(`pointer-events-none`). 그러지 않으면 팝업
        옆의 빈 자리가 화면 전체를 덮어, 뒤에 있는 것이 하나도 안 눌린다.

        가운데 팝업은 안쪽 누름이 바깥으로 새면 읽으려고 누른 순간 닫힌다.
      */}
      <div
        onClick={(event) => event.stopPropagation()}
        style={{ width: shown.width }}
        className="pointer-events-auto flex max-w-full flex-col overflow-hidden rounded-2xl bg-canvas shadow-lg"
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <p id={`popup-${shown.id}`} className="text-base font-bold tracking-tight">
            {shown.title}
          </p>
          <button
            type="button"
            onClick={() => close(false)}
            aria-label="닫기"
            className="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 text-ink-faint transition-colors duration-150 hover:bg-surface hover:text-ink"
          >
            <X aria-hidden className="size-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* 본문은 어드민 편집기가 만든 HTML 이다 — 공지·약관과 같은 방식으로 그대로 그린다. */}
        <div
          className="px-5 py-4 text-sm leading-loose text-ink-muted [&_a]:underline [&_p+p]:mt-2"
          dangerouslySetInnerHTML={{ __html: shown.body }}
        />

        {shown.linkUrl && (
          <a
            href={shown.linkUrl}
            className="mx-5 mb-1 w-fit text-sm font-medium text-brand-700 underline underline-offset-2 dark:text-brand-300"
          >
            자세히 보기
          </a>
        )}

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border px-5 py-3">
          {shown.todayClose ? (
            <button
              type="button"
              onClick={() => close(true)}
              className="text-xs text-ink-faint transition-colors duration-150 hover:text-ink"
            >
              오늘 하루 보지 않기
            </button>
          ) : (
            /* 자리를 비워 두면 닫기 단추가 왼쪽으로 붙어 팝업마다 다른 모양이 된다. */
            <span />
          )}

          <button
            type="button"
            onClick={() => close(false)}
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-85"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
