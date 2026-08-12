'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { FnbPopup } from '@winpilot/store';

/** `하루 감추기` 를 누른 기록이 사는 곳. 팝업마다 한 칸씩. */
const HIDE_KEY = 'fnb-popup-hidden';

/**
 * 사이트에 뜨는 팝업.
 *
 * ## 어드민에 화면만 있고 이게 없었다
 * 배너 > 팝업에 목록 · 상세 · 등록 세 화면이 있는데 **사이트에 띄우는 코드가 한 줄도 없었다.**
 * 저장은 되는데 아무 일도 일어나지 않는 상태였고, 그것은 올린 사람이 자기가 뭘 잘못했는지
 * 찾게 만든다.
 *
 * ## 서버가 고르고 화면이 감춘다
 * 지금 걸린 팝업을 고르는 일(`bannerState`)은 서버에서 한다 — 날짜 계산이 클라이언트로 가면
 * 사람마다 다른 시계로 판정되고, 자정 근처에서 어제 팝업이 뜬다.
 *
 * 화면이 하는 일은 **감추는 것**뿐이다. `하루 감추기` 기록은 그 사람의 브라우저에만 있으므로
 * 서버가 알 수 없다.
 *
 * ## 처음 한 번은 아무것도 그리지 않는다
 * 저장된 기록은 브라우저에만 있어 서버가 모른다. 서버가 판단해 그려 두면 **감춰 둔 팝업이
 * 한 번 깜빡였다가 사라진다** — 그것은 감춘 것이 아니다. 그래서 `useEffect` 가 돈 뒤에 연다.
 *
 * ## 한 번에 하나만 띄운다
 * 기간이 겹치면 여럿이 동시에 걸릴 수 있다. 그때 셋을 한꺼번에 띄우면 손님이 셋을 닫고서야
 * 첫 화면에 닿는다 — 그 상태는 올린 사람 눈에 안 보인다. 목록에서 위에 있는 것 하나만 연다.
 *
 * 나머지가 사라지는 것이 아니다. 앞의 것을 닫으면 다음 것이 뜬다.
 *
 * ## 닫는 방법이 둘이다
 * `하루 감추기` 를 켠 팝업만 그 단추가 선다. 끈 팝업은 **닫기만** 있다 — 반드시 읽혀야 하는
 * 것이라 매번 뜬다는 뜻이고, 그 무게는 어드민이 정한다.
 *
 * ## 바깥을 눌러도 닫힌다
 * 다만 `하루 감추기` 로는 치지 않는다. 실수로 스친 것과 읽고 나서 오늘은 그만 보겠다고 정한
 * 것은 다르다.
 */
export function PopupLayer({ popups }: { popups: readonly FnbPopup[] }) {
  const [ready, setReady] = useState(false);
  const [closed, setClosed] = useState<string[]>([]);

  useEffect(() => {
    /*
      오늘 감춰 둔 것을 읽는다. 값은 `{id: 'YYYY-MM-DD'}` 라 날짜가 바뀌면 저절로 되살아난다 —
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`popup-${shown.id}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-night/50 px-4 backdrop-blur-[2px]"
      onClick={() => close(false)}
    >
      {/* 안쪽 누름이 바깥으로 새면 팝업을 읽으려고 누른 순간 닫힌다. */}
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-canvas shadow-lg"
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <p id={`popup-${shown.id}`} className="text-lg font-bold tracking-tight">
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

        <p className="px-6 py-4 text-sm leading-loose text-ink-muted">{shown.body}</p>

        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-3">
          {shown.dismissible ? (
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
