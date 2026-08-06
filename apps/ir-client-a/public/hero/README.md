# 첫 화면 배경 영상

## 지금 쓰는 것 — `factory.mp4`

| | |
|---|---|
| 무엇 | Industrial Robot Arm in High-Tech Factory |
| 출처 | [Pexels #32386532](https://www.pexels.com/video/industrial-robot-arm-in-high-tech-factory-32386532/) |
| 라이선스 | [Pexels License](https://www.pexels.com/license/) — 상업적 사용 가능, 출처 표기 의무 없음 |
| 파일 | 1280×720 · 2.4MB |

**4K(3840×2160, 18MB)가 아니라 720p 를 받았다.** 이 영상은 흐리게 눌러 배경으로 까는 것이라
화질이 올라가도 화면에서 달라지는 것이 없고, 첫 화면이 뜨는 시간만 여덟 배 늘어난다.

내려받는 주소는 `https://www.pexels.com/download/video/{id}/?w=1280` 이다 — 파라미터 없이
받으면 원본(4K)이 온다.

## 어떻게 붙어 있나

`HomeHero` 는 **영상 없이도 뜬다.** 기본 배경은 인라인 SVG 로 그린 빛줄기이고, 영상은
`videoSrc` 를 넘길 때만 그 위에 깔린다 — 영상이 늦게 뜨거나 못 뜨면 SVG 가 그대로 남는다.

```tsx
<HomeHero videoSrc="/hero/factory.mp4" />
```

영상은 **배경이지 내용이 아니다.** 그래서 소리를 끄고, `opacity-45` 로 눌러 두고,
`aria-hidden` 으로 낭독기에서 뺀다. 눌러 두는 이유는 공장 영상에 조명과 스파크처럼 밝은 점이
많아, 그대로 두면 그 위의 흰 글씨가 사라지기 때문이다.

## 왜 밖에서 받아 오지 않나

- 사이트가 **네트워크 없이도 떠야 한다.** 개발 서버를 띄우고 화면을 확인하는 일이 잦다.
- 남의 서버가 멈추면 첫 화면이 통째로 검게 남는다. 우리 잘못이 아닌 자리에서 우리 사이트가 멈춘다.
- 이 저장소는 화면을 그대로 Figma 로 뽑는다(`docs/spec/05-component.md`). **영상과 비트맵은
  벡터로 복원되지 않아** 도면에서 빈 상자가 된다 — 그래서 배경의 기본은 SVG 다.

파일을 이 폴더에 두고 주소만 넘기면, 도면에는 SVG 배경이 남고 화면에는 영상이 깔린다.

## 받을 수 있는 곳 — 스마트 제조 · 공장 자동화

셋 다 **상업적 사용이 되고 출처 표기 의무가 없다.** 다만 라이선스가 서로 달라, 받기 전에
그 페이지의 라이선스 문구를 한 번 더 확인한다.

| 어디 | 무엇이 있나 | 라이선스 |
|---|---|---|
| [Pixabay — 로봇 공장](https://pixabay.com/videos/search/robot%20factory/) · [산업용 로봇](https://pixabay.com/videos/search/industrial%20robot/) | 673+ / 1,403+ 클립 | [Pixabay Content License](https://pixabay.com/service/license-summary/) — 출처 표기 불필요, 상업적 사용 가능 |
| [Pexels — 로봇 팔](https://www.pexels.com/search/videos/robotic%20arm/) · [자동화](https://www.pexels.com/search/videos/automation/) | 6,883+ / 6,713+ 클립 | Pexels License — 출처 표기 불필요, 상업적 사용 가능 |
| [Coverr — 공장](https://coverr.co/stock-video-footage/factory) · [산업 기계](https://coverr.co/stock-video-footage/industrial-machinery) | 큐레이션된 산업 영상 | [Coverr License](https://coverr.co/license) — 출처 표기 불필요, 상업적 사용 가능 |

### 세 곳 모두 막는 것

**영상 자체를 되파는 일**이다. 스톡 사이트·테마 판매·사이트 빌더처럼 *영상을 제공하는 것이
곧 상품인* 서비스에 실어 넘기지 못한다. 우리처럼 자기 사이트의 배경으로 쓰는 것은 셋 다 된다.

Pixabay 는 한 가지가 더 있다 — **2019년 1월 9일 이전**에 올라온 것은 CC0(사실상 제약 없음)이고,
그 뒤의 것은 Content License 다. 받는 페이지에 어느 쪽인지 적혀 있다.

## 고를 때 볼 것

- **어두운 영상**을 고른다. 이 히어로는 흰 글씨가 얹히는 자리라, 밝은 영상 위에서는 문장이 읽히지 않는다.
- **움직임이 느린 것**이 낫다. 배경이 빠르게 움직이면 글을 읽는 동안 눈이 그쪽으로 끌린다.
- **10초 안팎**으로 자른다. 슬라이드 한 장이 7초 머무르므로 그보다 길 이유가 없고, 파일이 커지면
  첫 화면이 늦게 뜬다.
- 사람 얼굴이 또렷하게 나오는 것은 피한다. 초상권이 걸린 자리는 라이선스와 별개로 다투기 쉽다.
