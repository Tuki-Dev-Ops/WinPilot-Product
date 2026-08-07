import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { SiteRegion } from '@winpilot/store';
import topo from './skorea-provinces.topo.json';

/**
 * 대한민국 시 · 도 **실제 경계선**.
 *
 * ## 값의 출처
 * `southkorea/southkorea-maps` 의 `kostat/2018/skorea-provinces-2018-topo-simple.json` —
 * 통계청 SGIS 의 2018년 시 · 도 경계를 단순화한 것이다. 원본 GeoJSON 은 7MB 라 화면에 실을 수
 * 없고, 단순화본은 214KB 다. 우리가 좌표를 손보지 않은 이유는 분명하다 — **경계선은 우리가
 * 만들 수 있는 값이 아니다.** 눈대중으로 고친 선은 틀렸다는 것을 아무도 눈치채지 못한다.
 *
 * ## 왜 서버에서 계산하나
 * 이 파일은 `'use client'` 가 아니다. 214KB 의 좌표와 `d3-geo` · `topojson-client` 는 **브라우저로
 * 내려가지 않는다** — 여기서 경로 문자열 열일곱 개로 줄여 넘긴다. 브라우저가 받는 것은 3KB 남짓이다.
 *
 * 지도가 움직이지 않으니 이렇게 해도 된다. 확대 · 이동이 필요해지면 그때는 좌표가 브라우저에
 * 있어야 하고, 그 순간 이 파일의 자리가 바뀐다.
 *
 * ## 2018년 이름을 그대로 두지 않는다
 * 값의 이름은 `강원도` · `전라북도` 인데 지금은 `강원특별자치도` · `전북특별자치도` 다. 이름으로
 * 잇지 않고 **통계청 시 · 도 코드**(`code`)로 잇는 것도 그 때문이다 — 이름은 바뀌고 코드는
 * 남는다. 화면에 서는 이름은 `@winpilot/store` 의 `SITE_REGIONS` 쪽을 따른다.
 */

/** 그리는 판의 크기. 여기에 맞춰 지도를 앉힌다. */
export const KOREA_BOX = { width: 340, height: 440 } as const;

/**
 * 통계청 시 · 도 코드 → 우리가 쓰는 이름.
 *
 * 이 표가 곧 **어느 경계가 우리 값의 어느 지역인지**를 정한다. 여기 없는 코드는 그리지 않는다 —
 * 이름을 모르는 칠은 눌러도 표가 반응하지 않아, 고장 난 것으로 보인다.
 */
const BY_CODE: Record<string, SiteRegion> = {
  '11': '서울특별시',
  '21': '부산광역시',
  '22': '대구광역시',
  '23': '인천광역시',
  '24': '광주광역시',
  '25': '대전광역시',
  '26': '울산광역시',
  '29': '세종특별자치시',
  '31': '경기도',
  '32': '강원특별자치도',
  '33': '충청북도',
  '34': '충청남도',
  '35': '전북특별자치도',
  '36': '전라남도',
  '37': '경상북도',
  '38': '경상남도',
  '39': '제주특별자치도',
};

/*
  위상 자료의 타입을 패키지 이름으로 들여오지 않고 `feature()` 의 매개변수에서 꺼내 쓴다.
  그 타입은 `topojson-specification` 에 있는데, 이 저장소에서는 타입 전용 패키지를 하나 더
  얹는 값어치보다 이 두 줄이 싸다 — 게다가 `feature()` 가 받는 것과 언제나 같음이 보장된다.
*/
type Topo = Parameters<typeof feature>[0];
type Geom = Parameters<typeof feature>[1];

/**
 * 지도가 받는 것 — **셋뿐이다.**
 *
 * 전에는 이름이 설 자리(`lx` · `ly`)와 그리로 잇는 선의 시작점(`cx` · `cy`)도 함께 넘겼다.
 * 지도에 글자를 적지 않기로 하면서 그 넷이 죽었고, 죽은 값을 넘기는 것은 브라우저로 내려가는
 * 짐만 늘리는 일이라 지웠다. 이름은 옆의 표가 말한다.
 */
export type KoreaShape = {
  code: string;
  region: SiteRegion;
  /** `<path d>` 에 그대로 넣는 값 */
  d: string;
};

/**
 * 경로를 **화면에 필요한 만큼만** 남긴다.
 *
 * `d3-geo` 가 그대로 뱉는 경로는 열일곱 개를 합쳐 470KB 다 — 단순화한 원본(214KB)보다 크다.
 * 좌표가 소수점 아래 열 자리까지 적히고, 전남 하나에만 섬 수천 개가 들어 있기 때문이다.
 * 그 정밀도는 340px 짜리 그림에서 **한 픽셀 안에 수백 점**이 겹치는 것이고, 눈에는 아무
 * 차이가 없으면서 브라우저로는 그대로 내려간다.
 *
 * 세 가지를 한다:
 * 1. 좌표를 소수 한 자리로 자른다 — 340px 판에서 0.1px 아래는 보이지 않는다.
 * 2. 앞 점과 0.6px 안에 붙어 있는 점을 뺀다.
 * 3. 가로세로가 2.5px 도 안 되는 조각(작은 섬)을 뺀다.
 *
 * **본토 경계선은 건드리지 않는다.** 없애는 것은 눈에 그려지지 않는 점과, 그려도 점 하나로
 * 보이는 섬뿐이다. 이 지도가 답하는 물음은 "어느 시 · 도에서 오는가" 이고 그 답은 섬 하나에
 * 달려 있지 않다 — 섬이 속한 도는 그대로 칠해진다.
 */
function trim(d: string): string {
  return d
    .split('M')
    .filter((chunk) => chunk.length > 0)
    .map((chunk) => {
      const closed = chunk.endsWith('Z');
      const points = (closed ? chunk.slice(0, -1) : chunk)
        .split('L')
        .map((pair) => pair.split(',').map(Number))
        .filter((pair): pair is [number, number] => pair.length === 2 && pair.every(Number.isFinite))
        .map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10] as [number, number]);

      const kept: [number, number][] = [];
      for (const point of points) {
        const last = kept[kept.length - 1];
        if (!last || Math.abs(point[0] - last[0]) > 0.6 || Math.abs(point[1] - last[1]) > 0.6) {
          kept.push(point);
        }
      }

      /* 삼각형도 못 되는 것은 선 하나라 그려도 보이지 않는다. */
      if (kept.length < 3) return '';

      const xs = kept.map((one) => one[0]);
      const ys = kept.map((one) => one[1]);
      const width = Math.max(...xs) - Math.min(...xs);
      const height = Math.max(...ys) - Math.min(...ys);
      if (width < 2.5 && height < 2.5) return '';

      return 'M' + kept.map(([x, y]) => `${x},${y}`).join('L') + (closed ? 'Z' : '');
    })
    .join('');
}

/**
 * 경계선을 화면 좌표로 옮긴다.
 *
 * 모듈이 처음 불릴 때 한 번만 돈다. 요청마다 다시 계산하면 214KB 를 매번 훑는데, **경계선은
 * 요청에 따라 달라지지 않는다.**
 */
export const KOREA_SHAPES: KoreaShape[] = (() => {
  const topology = topo as unknown as Topo;
  const key = Object.keys(topology.objects)[0];
  if (!key) return [];

  /*
    `feature()` 는 넘긴 것이 하나면 Feature, 묶음이면 FeatureCollection 을 돌려준다. 타입만으로는
    어느 쪽인지 가릴 수 없어 `unknown` 을 거쳐 좁힌다 — 값이 무엇인지는 위에서 이미 봤다(열일곱 개).
  */
  const collection = feature(
    topology,
    topology.objects[key] as Geom,
  ) as unknown as GeoJSON.FeatureCollection;

  /*
    메르카토르로 놓는다. 위도 33~38도 사이의 좁은 띠라 이 투영에서 생기는 왜곡이 눈에 띄지
    않고, 무엇보다 **사람들이 지도라고 알아보는 모양**이 이것이다.
  */
  const projection = geoMercator().fitSize([KOREA_BOX.width, KOREA_BOX.height], collection);
  const draw = geoPath(projection);

  return collection.features
    .map((one) => {
      const code = String((one.properties as { code?: string } | null)?.code ?? '');
      const region = BY_CODE[code];
      const d = draw(one);
      if (!region || !d) return null;

      return { code, region, d: trim(d) };
    })
    .filter((one): one is KoreaShape => one !== null);
})();
