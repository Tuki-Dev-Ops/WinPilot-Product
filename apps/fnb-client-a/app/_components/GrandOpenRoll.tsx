import { newestStores, type Store } from '@winpilot/store';
import { Carousel } from './Carousel';
import { PhotoSlot } from './PhotoSlot';

/**
 * 홈에 세우는 매장 몇 곳.
 *
 * 여덟 곳 전부를 굴리면 2019년에 연 첫 매장까지 `GRAND OPEN` 옆에 서서, 그 말이 **새로 연 곳을
 * 가리키지 않게 된다.** 다섯이면 곧 여는 곳과 최근 두어 해에 연 곳까지다.
 *
 * 굴림판 한 줄이 넓은 화면에서 세 장이라, 다섯이면 두 장이 남아 **굴릴 것이 있다는 것이 보인다** —
 * 정확히 세 장이면 밑줄이 꽉 차서 흐르지 않는 판처럼 읽힌다.
 */
const SHOWN = 5;

/**
 * `GRAND OPEN` — **새로 여는 곳과 최근에 연 곳.**
 *
 * ## 왜 홈에 있나
 * 매장이 느는 것은 이 브랜드가 도는 중이라는 가장 짧은 증거다. 손님에게는 **우리 동네에 생겼나**
 * 이고, 차리려는 사람에게는 **지금도 열고 있구나**다 — 한 칸이 두 사람에게 다르게 읽힌다.
 *
 * ## 곧 여는 곳을 감추지 않는다
 * 준비중 매장이 맨 앞에 선다(`newestStores`). 문 연 곳만 세우면 개점 소식을 공지에서만 만나게
 * 되는데, 공지는 아래로 밀린다. 다만 **아직 못 간다**는 것이 딱지로 분명해야 한다 — 가서 닫힌
 * 문을 보는 것이 안 보여 주는 것보다 나쁘다.
 *
 * ## 굴리는 규칙은 `Carousel` 이 갖는다
 * 대표 메뉴와 같은 것을 쓴다. 홈에 굴림판이 둘이 되었는데, 둘이 다르게 움직이면 같은 화면에서
 * 손가락 쓰는 법을 두 번 배우게 된다.
 */
export function GrandOpenRoll() {
  const stores = newestStores().slice(0, SHOWN);

  return (
    <Carousel slides={stores.map((one) => ({ id: one.id, node: <StoreCard store={one} /> }))} />
  );
}

function StoreCard({ store }: { store: Store }) {
  const soon = store.state === '준비중';

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border">
      <span className="relative block">
        <PhotoSlot name={store.name} />

        {/*
          딱지가 사진 칸 왼쪽 위에 얹힌다 — 메뉴 카드의 `인기` 와 같은 자리다. 훑는 눈이 카드에
          닿는 첫 순간에 있어야 곧 여는 곳인지가 고르는 데 쓰인다.
        */}
        <span className="absolute left-3 top-3">
          <span
            className={`rounded-full px-2.5 py-1 font-mono text-xs font-bold tracking-wider ${
              soon ? 'bg-white text-octo-700 ring-1 ring-octo-200' : 'bg-octo-600 text-white'
            }`}
          >
            {soon ? 'OPENING SOON' : 'GRAND OPEN'}
          </span>
        </span>
      </span>

      <span className="flex flex-1 flex-col gap-2 px-5 py-4">
        <span className="text-base font-semibold">{store.name}</span>
        <span className="text-sm leading-relaxed text-ink-muted">{store.address}</span>

        {/*
          여는 때를 아래에 붙인다. 준비중이면 `개점 예정` 이라 적어야 한다 — 날짜만 두면 이미
          연 곳으로 읽히고, 그 오해는 손님이 문 앞에 가서야 풀린다.
        */}
        <span className="mt-auto pt-2 font-mono text-sm tabular-nums text-ink-faint">
          {store.openedOn} {soon ? '개점 예정' : '개점'}
        </span>
      </span>
    </div>
  );
}
