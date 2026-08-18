'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 카카오 지도 SDK 주소. `autoload=false` 로 두고 우리가 부를 때 시작한다 —
 * 기본값이면 스크립트가 내려오자마자 초기화하는데, 그때 지도를 담을 칸이 아직 없을 수 있다.
 */
const SDK_URL = (key: string) => `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;

/**
 * 지도 열쇠. `NEXT_PUBLIC_` 이라야 브라우저까지 내려간다 — 카카오의 **JavaScript 키**는
 * 도메인으로 묶는 값이라 공개돼도 되고, REST 키는 여기 두면 안 된다.
 */
const KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ?? '';

/** 건물 하나를 보여 주는 자리라 가깝게 연다. 카카오는 **작을수록 크게** 보인다. */
const LEVEL = 3;

/**
 * 본사 지도 — **점 하나**.
 *
 * ## F&B 매장 지도와 왜 따로 두나
 * `apps/fnb-client-a/.../KakaoMap.tsx` 는 표식 여럿을 들고 거르개와 맞물려 움직인다. 여기는
 * 바뀌지 않는 점 하나다. 한 조각으로 합치면 쓰지 않는 갈래(고름 · 거름 · 경계 맞추기)를
 * 안고 가게 되고, 그 갈래를 고칠 때마다 이 화면도 함께 확인해야 한다.
 *
 * **SDK 를 붙이는 스무 줄은 같다.** 셋째 화면이 지도를 쓰게 되는 날 그 부분만 올린다 —
 * 두 곳일 때 올리면 아직 무엇이 공통인지 모르는 채로 모양을 정하게 된다.
 *
 * ## 열쇠가 없으면 빈 상자를 두지 않는다
 * 회색 네모만 남기면 고장으로 보인다. 무엇이 없어서 안 뜨는지와 어디에 넣으면 되는지를 적고,
 * **지도 없이도 이 화면이 제 몫을 한다**는 것을 함께 알린다 — 주소와 오는 길은 옆에 그대로 있다.
 */
export function OfficeMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const holder = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  /* SDK 를 한 번만 내려받는다. 화면을 오갈 때마다 붙이면 같은 스크립트가 여러 벌 뜬다. */
  useEffect(() => {
    if (!KEY) return;

    const start = () => window.kakao.maps.load(() => setReady(true));
    const already = document.querySelector<HTMLScriptElement>('script[data-kakao-map]');
    if (already) {
      if (window.kakao?.maps) start();
      else already.addEventListener('load', start, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = SDK_URL(KEY);
    script.async = true;
    script.dataset.kakaoMap = 'true';
    script.addEventListener('load', start, { once: true });
    /* 도메인이 등록되지 않았거나 키가 틀리면 여기로 온다 — 조용히 빈 칸으로 두지 않는다. */
    script.addEventListener('error', () => setFailed(true), { once: true });
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!ready || !holder.current) return;
    const { kakao } = window;
    const point = new kakao.maps.LatLng(lat, lng);
    const map = new kakao.maps.Map(holder.current, { center: point, level: LEVEL });
    new kakao.maps.Marker({ position: point, title: label }).setMap(map);
  }, [ready, lat, lng, label]);

  if (!KEY || failed) {
    return (
      <div className="flex h-full min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-border px-8 py-16 text-center">
        <p className="text-sm font-semibold">지도를 불러오지 못했습니다</p>
        <p className="max-w-md text-sm leading-relaxed text-ink-muted">
          {KEY
            ? '카카오 개발자센터에 이 주소가 등록되어 있는지 확인해 주세요. 키는 있으나 도메인이 등록되지 않으면 지도가 뜨지 않습니다.'
            : '카카오 지도 JavaScript 키가 없습니다. 앱 폴더에 `.env.local` 을 만들고 `NEXT_PUBLIC_KAKAO_MAP_KEY` 를 넣어 주세요.'}
        </p>
        <p className="text-xs text-ink-faint">주소와 오시는 방법은 지도 없이도 그대로 보입니다.</p>
      </div>
    );
  }

  return (
    <div
      ref={holder}
      role="application"
      aria-label={`${label} 위치 지도`}
      className="h-full min-h-72 w-full overflow-hidden rounded-2xl border border-border"
    />
  );
}

/*
  카카오 SDK 의 타입 — **쓰는 것만** 적는다. 공식 타입 패키지가 없어 직접 적는데, 전부 옮겨
  적으면 SDK 가 올라갈 때마다 이 파일이 틀려진다.
*/
type KakaoLatLng = { __latlng: true };
type KakaoMarker = { setMap: (map: KakaoMap | null) => void };
type KakaoMap = { setLevel: (level: number) => void };

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (ready: () => void) => void;
        Map: new (holder: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap;
        Marker: new (options: { position: KakaoLatLng; title?: string }) => KakaoMarker;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
      };
    };
  }
}
