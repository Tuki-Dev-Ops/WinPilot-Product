'use client';

import { useCallback, useMemo, useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { Badge, Dropdown } from '@winpilot/ui';
import { STORE_REGIONS, publicStores, type Store } from '@winpilot/store';
import { KakaoMap } from './KakaoMap';

const STATE_TONE = { 영업중: 'ok', 준비중: 'wait', 휴점: 'neutral' } as const;

/**
 * 손님에게 보이는 매장 — **모듈이 처음 불릴 때 한 번만** 추린다.
 *
 * `publicStores()` 는 부를 때마다 `STORES` 를 훑어 새 배열을 만든다. 렌더 안에서 부르면 글자
 * 한 자마다 그 일이 되풀이되는데, **이 목록은 요청에 따라 달라지지 않는다.**
 */
const STORES = publicStores();

/**
 * 권역마다 몇 곳인지 — 고르개에 함께 적는다. 고르기 전에 몇 곳인지 알면 헛걸음이 준다.
 *
 * 이 숫자도 변하지 않으므로 고르개 목록째로 미리 만들어 둔다. 렌더 안에서 세면 권역 다섯을
 * 돌면서 매번 매장 전체를 훑게 되고, 그것이 **글자 한 자마다** 다시 돈다.
 */
const REGION_OPTIONS = [
  { value: '', label: '지역 전체' },
  ...STORE_REGIONS.map((name) => ({
    value: name,
    label: name,
    hint: `${STORES.filter((one) => one.region === name).length}곳`,
  })),
];

/**
 * 매장 찾기 — **지도가 판을 채우고, 찾는 자리가 그 위에 뜬다.**
 *
 * ## 왜 지도를 배경으로 깔았나
 * 목록과 지도를 좌우로 반씩 나눠 놓으면 둘 다 좁아진다. 지도는 작아서 어디가 어딘지 안 보이고,
 * 목록은 좁아서 주소가 잘린다. 실제로 하는 일은 **훑다가 하나를 고르는 것**이라 둘이 같은 크기로
 * 마주 볼 이유가 없다.
 *
 * 지도를 판 전체에 깔고 찾는 자리를 그 위에 띄우면, 지도는 넓게 쓰고 목록은 필요한 만큼만
 * 가린다. 좁은 화면에서는 겹칠 자리가 없으니 위아래로 눕는다.
 *
 * ## 표식이 매장 자리에 선다
 * 앞서 손으로 그린 지도에서는 위도 · 경도가 없어 **권역에 몇 곳인지**만 방울로 알렸다. 매장에
 * 좌표를 넣으면서 그 자리에 그대로 찍을 수 있게 되었다 — 찾아가는 사람이 묻는 것은 권역이
 * 아니라 어느 골목이다.
 *
 * ## 거르개가 지도와 이어져 있다
 * 목록이 좁혀지면 지도도 함께 좁혀진다(보이는 표식이 다 담기게 맞춘다). 둘이 따로 놀면 지도에
 * 있는 표식을 목록에서 못 찾는 일이 생긴다.
 */

export function StoreFinder() {
  const [keyword, setKeyword] = useState('');
  const [region, setRegion] = useState('');
  /** 지금 골라 둔 매장. 지도를 그 권역으로 당기고, 줄에 표를 남긴다 */
  const [picked, setPicked] = useState('');

  /*
    걸러 낸 목록을 **기억해 둔다.**

    이 배열은 지도로 그대로 내려가고(`KakaoMap` 의 `stores`), 그쪽 이펙트의 의존성이 된다.
    렌더마다 새로 만들면 **결과가 똑같아도** 참조가 달라져 지도가 통째로 다시 맞춰진다 —
    검색창에 다섯 글자를 치면 지도 맞춤이 다섯 번 일어난다.

    같은 이유로 고른 손잡이(`pick`)도 고정한다.
  */
  const shown = useMemo(() => {
    const word = keyword.trim().toLowerCase();
    return STORES.filter((one) => {
      if (region && one.region !== region) return false;
      if (!word) return true;
      return [one.name, one.address, one.region].some((value) => value.toLowerCase().includes(word));
    });
  }, [keyword, region]);

  const pick = useCallback((id: string) => setPicked((was) => (was === id ? '' : id)), []);

  return (
    <div className="relative flex flex-col gap-6 lg:block lg:min-h-[38rem]">
      {/*
        ── 지도 ── 판을 채운다. 좁은 화면에서는 위에 눕는다.

        카카오 지도는 담는 칸의 **높이를 물려받는다**. `lg` 아래에서 자리를 띄우지 않으므로
        그때는 높이를 직접 준다 — 안 주면 0px 짜리 칸에 지도가 들어가 아무것도 안 보인다.
      */}
      <div className="h-96 overflow-hidden rounded-2xl border border-border bg-surface lg:absolute lg:inset-0 lg:h-auto">
        <KakaoMap stores={shown} picked={picked} onPick={pick} />
      </div>

      {/*
        ── 찾는 자리 ── 지도 위 왼쪽에 뜬다.

        `lg` 아래에서는 띄우지 않고 지도 아래에 눕는다 — 좁은 화면에서 겹치면 지도가 통째로
        가려져, 배경에 지도를 깐 뜻이 사라진다.
      */}
      <aside className="flex flex-col gap-4 rounded-2xl border border-border bg-canvas p-5 shadow-sm lg:absolute lg:inset-y-6 lg:left-6 lg:w-88">
        <div className="flex flex-col gap-3">
          <label htmlFor="store-search" className="text-xs font-bold uppercase tracking-widest text-ink-faint">
            매장 찾기
          </label>

          <span className="relative block">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
              strokeWidth={1.8}
            />
            <input
              id="store-search"
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="매장명 · 주소"
              className="h-11 w-full min-w-0 rounded-lg border border-border-strong bg-canvas pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint"
            />
          </span>

          {/*
            생 `<select>` 를 쓰지 않는다. 운영체제가 그리는 화살표는 자리도 모양도 우리가 정할 수
            없어 오른쪽에 바짝 붙고, 무엇보다 **다른 화면의 고르개와 생김새가 갈린다.**
            `@winpilot/ui` 의 `Dropdown` 이 이미 그 문제를 풀어 둔 것을 쓴다.

            매장 수를 `hint` 로 함께 보인다 — 고르기 전에 몇 곳인지 알면 헛걸음이 준다.
          */}
          <Dropdown
            label="지역"
            value={region}
            onChange={(next) => {
              setRegion(next);
              setPicked('');
            }}
            options={REGION_OPTIONS}
            /*
              고르개 바탕을 흰색으로. 공유 조각은 어드민 폼(회색 판 위)을 기준으로 `bg-surface` 를
              쓰는데, 여기는 **흰 카드 위**라 같은 회색이 얹히면 칸이 파인 것처럼 보인다.
              컴포넌트를 고치지 않고 부르는 쪽에서 덮는다 — 어드민의 수십 칸이 함께 바뀌면 안 된다.
            */
            className="[&>button]:bg-canvas"
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-sm text-ink-muted">
            {region || keyword.trim() ? '찾은 매장' : '전체 매장'}{' '}
            <span className="font-medium tabular-nums text-ink">{shown.length}</span>곳
          </p>

          {/* 건 조건이 있을 때만 뜬다 — 늘 서 있으면 지울 것이 없는데도 누르게 된다. */}
          {(region || keyword.trim()) && (
            <button
              type="button"
              onClick={() => {
                setRegion('');
                setKeyword('');
                setPicked('');
              }}
              className="flex items-center gap-1 text-xs text-ink-muted transition-colors duration-150 hover:text-ink"
            >
              <X aria-hidden className="size-3.5" strokeWidth={2} />
              조건 지우기
            </button>
          )}
        </div>

        {/*
          결과는 안에서 굴린다. 목록 길이만큼 판이 늘어나게 두면 매장이 스물이 되는 날 이 카드가
          지도를 아래로 밀어낸다.
        */}
        <ul className="-mr-2 flex max-h-96 flex-col gap-3 overflow-y-auto pr-2 lg:max-h-none lg:flex-1">
          {shown.length === 0 ? (
            <li className="rounded-xl bg-surface px-4 py-10 text-center text-sm leading-relaxed text-ink-muted">
              찾으시는 조건에 맞는 매장이 없습니다.
              <br />새로 여는 매장은 공지사항에 먼저 올립니다.
            </li>
          ) : (
            shown.map((one) => (
              <StoreRow
                key={one.id}
                store={one}
                picked={one.id === picked}
                /* 누른 것을 다시 누르면 놓는다 — 당겨 본 뒤 전체로 돌아가는 길이 그것뿐이다. */
                onPick={() => pick(one.id)}
              />
            ))
          )}
        </ul>
      </aside>
    </div>
  );
}

/**
 * 결과 한 줄 — **누르면 지도가 그 권역으로 당겨진다.**
 *
 * ## 줄 전체가 단추다
 * 안쪽에 `자세히 보기` 같은 작은 단추를 두지 않는다. 매장 상세 화면이 따로 없어 누를 곳이
 * 하나뿐이고, 그럴 때 작은 표적을 만들면 **손가락으로 누르는 사람만** 어려워진다.
 *
 * `aria-pressed` 로 눌린 상태를 알린다 — 지도가 움직인 것은 낭독기에 전해지지 않는다.
 *
 * ## 준비중 매장에는 번호가 없다
 * 자리를 비워 두지 않고 **여는 달**을 대신 적는다 — 빈 자리는 값을 빠뜨린 것으로 보이고,
 * 그때 사람은 매장에 전화해 확인하려 든다(할 수 없는 일이다).
 */
function StoreRow({ store, picked, onPick }: { store: Store; picked: boolean; onPick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onPick}
        aria-pressed={picked}
        className={`flex w-full flex-col gap-2 rounded-xl border px-4 py-3.5 text-left transition-colors duration-150 ${
          picked ? 'border-ink bg-surface' : 'border-border hover:border-ink-faint'
        }`}
      >
        {/*
          안쪽을 전부 `<span>` 으로 둔다. `<button>` 이 품을 수 있는 것은 **문구 요소**뿐이라
          `<p>` 나 `<div>` 를 넣으면 브라우저가 단추를 그 자리에서 끊어 버린다 — 화면은 그려지는데
          아래 절반이 단추 밖으로 나가 눌리지 않는, 눈으로는 원인이 안 잡히는 고장이다.
        */}
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <MapPin aria-hidden className="size-3.5 shrink-0 text-ink-faint" strokeWidth={1.8} />
            {store.name}
          </span>
          <Badge tone={STATE_TONE[store.state]} size="sm">
            {store.state}
          </Badge>
        </span>

        <span className="block text-xs leading-relaxed text-ink-muted">{store.address}</span>

        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
          <span className="font-mono tabular-nums">{store.hours}</span>
          {store.phone ? (
            <span className="font-mono tabular-nums">{store.phone}</span>
          ) : (
            <span>{store.openedOn.replace('-', '년 ')}월 개점 예정</span>
          )}
        </span>

        {store.features.length > 0 && (
          <span className="flex flex-wrap gap-1.5">
            {store.features.map((one) => (
              <span key={one} className="rounded-full bg-surface px-2 py-0.5 text-xs text-ink-muted">
                {one}
              </span>
            ))}
          </span>
        )}
      </button>
    </li>
  );
}
