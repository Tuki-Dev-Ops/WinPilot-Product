'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { SiteBanner } from '@winpilot/store';

/** `오늘 하루 보지 않기` 를 누른 기록이 사는 곳. 팝업마다 한 칸씩. */
const HIDE_KEY = 'ir-popup-hidden';

/**
 * 사이트에 뜨는 팝업.
 *
 * ## 어드민에 세 화면이 있고 이게 없었다
 * `ir-admin` 배너 > 팝업에 목록 · 등록 · 상세가 있는데 **투자자 화면에 띄우는 코드가 한 줄도
 * 없었다.** 저장은 되는데 아무 일도 일어나지 않는 상태였고, 그것은 올린 사람이 자기가 뭘
 * 잘못했는지 찾게 만든다. F&B · B2C 에 먼저 만든 것과 같은 조각이다.
 *
 * ## 기간은 store 가 재고 화면은 감추기만 한다
 * 지금 걸린 팝업을 고르는 일은 `liveSitePopups()` 가 한다 — 기간이 지났거나 내려 둔 것은
 * 여기까지 오지 않는다. 화면이 다시 판단하면 그 판단이 두 벌이 된다.
 *
 * ## 처음 한 번은 아무것도 그리지 않는다
 * 감춰 둔 기록은 브라우저에만 있어 서버가 모른다. 서버가 판단해 그려 두면 **감춰 둔 팝업이
 * 한 번 깜빡였다가 사라진다** — 그것은 감춘 것이 아니다. `useEffect` 가 돈 뒤에 연다.
 *
 * ## 한 번에 하나만 띄운다
 * 기간이 겹치면 여럿이 동시에 걸린다. 셋을 한꺼번에 띄우면 읽으러 온 사람이 셋을 닫고서야
 * 화면에 닿고, 그 상태는 올린 사람 눈에 보이지 않는다. 앞의 것을 닫으면 다음 것이 뜬다.
 *
 * ## 자리가 가운데 하나뿐이다
 * B2C 팝업은 세 자리(왼쪽 위 · 가운데 · 오른쪽 아래)를 갖는데 여기는 그 값이 없다. 그 까닭은
 * 이 사이트에 뜨는 팝업의 성격이다 — 휴무 · 처리방침 개정처럼 **읽히지 않으면 뜻이 없는 고지**
 * 뿐이라, 모서리에 조용히 서는 자리를 두면 그 자리에 놓인 팝업은 안 읽힌다. 자리 값을
 * 어드민에 만들지 않은 것도 같은 판단이다.
 */
export function SitePopup({ popups }: { popups: readonly SiteBanner[] }) {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`popup-${shown.id}`}
      onClick={() => close(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-night/50 p-4 backdrop-blur-[2px] sm:p-8"
    >
      {/* 안쪽 누름이 바깥으로 새면 읽으려고 누른 순간 닫힌다. */}
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-canvas shadow-lg"
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

        {shown.body && (
          <p className="px-5 py-4 text-sm leading-loose text-ink-muted">{shown.body}</p>
        )}

        {/*
          기간을 팝업 안에 적는다. 휴무 안내는 언제부터 언제까지인지가 본문의 절반인데, 그
          날짜를 본문에 손으로 또 적으면 기간을 하루 미루는 날 두 곳 중 한 곳만 고쳐진다.
        */}
        <p className="px-5 font-mono text-xs tabular-nums text-ink-faint">
          {shown.startAt} ~ {shown.endAt || '상시'}
        </p>

        {shown.linkUrl && (
          <a
            href={shown.linkUrl}
            className="mx-5 mt-3 w-fit text-sm font-medium text-brand-700 underline underline-offset-2"
          >
            자세히 보기
          </a>
        )}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={() => close(true)}
            className="text-xs text-ink-faint transition-colors duration-150 hover:text-ink"
          >
            오늘 하루 보지 않기
          </button>
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
