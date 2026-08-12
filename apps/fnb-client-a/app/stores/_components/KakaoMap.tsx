'use client';

import { useEffect, useRef, useState } from 'react';
import type { Store } from '@winpilot/store';

/**
 * 카카오 지도 SDK 를 부르는 주소.
 *
 * `autoload=false` 를 주는 이유: 기본값으로 두면 스크립트가 **내려오자마자 스스로 초기화**하는데,
 * 그 시점에 지도를 담을 칸이 아직 없을 수 있다. 끄고 `kakao.maps.load()` 로 우리가 부를 때
 * 시작하게 한다.
 *
 * `libraries` 를 붙이지 않는다 — 주소를 좌표로 바꾸는 일(`services`)을 하지 않기 때문이다.
 * 좌표는 매장 값이 들고 있다(store 쪽 머리말).
 */
const SDK_URL = (key: string) =>
  `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;

/**
 * 지도 열쇠.
 *
 * `NEXT_PUBLIC_` 로 시작해야 브라우저까지 내려간다. 카카오의 **JavaScript 키**는 도메인으로
 * 묶는 값이라 공개돼도 되는 값이고, 그래서 이렇게 둔다 — REST 키를 여기 두면 안 된다.
 */
const KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ?? '';

/** 매장 하나를 골랐을 때의 확대 단계. 카카오는 **작을수록 크게** 보인다(1이 가장 가깝다). */
const STORE_LEVEL = 4;

/**
 * 카카오 지도 — **매장 표식과 고른 매장으로의 이동.**
 *
 * ## 왜 손으로 그린 지도를 버렸나
 * 앞서 통계청 경계선(`@winpilot/geo`)으로 시 · 도 → 시 · 군 · 구 → 읍 · 면 · 동 세 층을 그렸다.
 * 그것으로도 동네까지 당겨 볼 수는 있었지만, **길과 건물이 없다.** 매장 찾기에 온 사람이 결국
 * 하는 일은 "여기서 어떻게 가지" 이고 그 답은 행정 경계가 아니라 길에 있다.
 *
 * 지도를 직접 그리는 값어치는 **지도가 답이 아닐 때**에 있다(어느 도에서 문의가 많이 오는가 —
 * IR 어드민이 그렇다). 여기서는 지도가 곧 답이라 만들어진 것을 쓴다.
 *
 * ## 열쇠가 없으면 **빈 상자를 두지 않는다**
 * 키가 없으면 지도가 그려지지 않는데, 그때 회색 네모만 남기면 고장 난 것으로 보인다. 무엇이
 * 없어서 안 뜨는지와 어디에 넣으면 되는지를 적는다 — 이 화면을 처음 띄우는 사람이 가장 먼저
 * 만나는 것이 그 상자다.
 *
 * ## 표식을 다시 만들지 않는다
 * 매장 목록이 걸러질 때마다 표식을 지웠다 새로 만들면 지도가 한 번 깜빡인다. 만들어 둔 것을
 * 들고 있다가 **보일지 말지만** 바꾼다.
 */
export function KakaoMap({
  stores,
  picked,
  onPick,
}: {
  /** 지금 목록에 서 있는 매장. 이 밖의 표식은 감춘다 */
  stores: Store[];
  picked: string;
  onPick: (id: string) => void;
}) {
  const holder = useRef<HTMLDivElement | null>(null);
  const map = useRef<KakaoMap | null>(null);
  /** 매장 id → 표식. 걸러질 때마다 새로 만들지 않으려고 들고 있는다. */
  const markers = useRef<Map<string, KakaoMarker>>(new Map());
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  /* SDK 를 한 번만 내려받는다. 화면을 오갈 때마다 다시 붙이면 같은 스크립트가 여러 벌 뜬다. */
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

  /* 지도를 한 번 세우고, 매장마다 표식을 만든다. */
  useEffect(() => {
    if (!ready || !holder.current || map.current) return;

    const { kakao } = window;
    const first = stores[0];
    map.current = new kakao.maps.Map(holder.current, {
      center: new kakao.maps.LatLng(first?.lat ?? 36.5, first?.lng ?? 127.8),
      level: 12,
    });

    for (const store of stores) {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(store.lat, store.lng),
        title: `${store.name} · ${store.address}`,
      });
      kakao.maps.event.addListener(marker, 'click', () => onPick(store.id));
      markers.current.set(store.id, marker);
    }
  }, [ready, stores, onPick]);

  /*
    보일 표식과 볼 자리를 맞춘다.

    고른 매장이 있으면 그리로 당기고, 없으면 **지금 목록에 선 매장 전부가 담기게** 맞춘다 —
    거르개를 걸면 지도도 함께 좁혀져야 목록과 지도가 같은 것을 말한다.
  */
  useEffect(() => {
    if (!ready || !map.current) return;
    const { kakao } = window;
    const shown = new Set(stores.map((one) => one.id));

    for (const [id, marker] of markers.current) {
      marker.setMap(shown.has(id) ? map.current : null);
    }

    const target = stores.find((one) => one.id === picked);
    if (target) {
      map.current.setLevel(STORE_LEVEL);
      map.current.panTo(new kakao.maps.LatLng(target.lat, target.lng));
      return;
    }

    if (stores.length === 0) return;
    const bounds = new kakao.maps.LatLngBounds();
    for (const one of stores) bounds.extend(new kakao.maps.LatLng(one.lat, one.lng));
    map.current.setBounds(bounds);
  }, [ready, stores, picked]);

  if (!KEY || failed) {
    return (
      <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 px-8 py-16 text-center">
        <p className="text-sm font-semibold">지도를 불러오지 못했습니다</p>
        <p className="max-w-md text-sm leading-relaxed text-ink-muted">
          {KEY
            ? '카카오 개발자센터에 이 주소가 등록되어 있는지 확인해 주세요. 키는 있으나 도메인이 등록되지 않으면 지도가 뜨지 않습니다.'
            : '카카오 지도 JavaScript 키가 없습니다. 앱 폴더에 `.env.local` 을 만들고 `NEXT_PUBLIC_KAKAO_MAP_KEY` 를 넣어 주세요.'}
        </p>
        <p className="text-xs text-ink-faint">
          매장 목록과 검색은 지도 없이도 그대로 씁니다.
        </p>
      </div>
    );
  }

  return <div ref={holder} className="h-full min-h-80 w-full" aria-label="매장 지도" role="application" />;
}

/*
  카카오 SDK 의 타입 — **쓰는 것만** 적는다.

  공식 타입 패키지가 없어 직접 적는데, 전부 옮겨 적으면 SDK 가 올라갈 때마다 이 파일이 틀려진다.
  여기 있는 것은 위에서 실제로 부르는 것뿐이고, 새로 부르는 것이 생기면 그때 한 줄 늘린다.
*/
type KakaoLatLng = { __latlng: true };
type KakaoBounds = { extend: (point: KakaoLatLng) => void };
type KakaoMarker = { setMap: (map: KakaoMap | null) => void };
type KakaoMap = {
  setLevel: (level: number) => void;
  panTo: (point: KakaoLatLng) => void;
  setBounds: (bounds: KakaoBounds) => void;
};

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (ready: () => void) => void;
        Map: new (holder: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap;
        Marker: new (options: { position: KakaoLatLng; title?: string }) => KakaoMarker;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        LatLngBounds: new () => KakaoBounds;
        event: { addListener: (target: unknown, type: string, handler: () => void) => void };
      };
    };
  }
}
