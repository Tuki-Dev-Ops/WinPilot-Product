# 6. 디자인 시스템

> SSOT: `apps/web/app/globals.css` 의 `@theme static` 블록
> 생성물: `artifacts/tokens/tokens.json` (DTCG) — `pnpm ssot:tokens`
> 관련: [design-sync-ssot.md §L0](../architecture/design-sync-ssot.md)

## 6.1 원칙

1. **토큰이 아니면 쓸 수 없다.** raw hex·raw px 는 금지. Tailwind 유틸리티를 통해서만 접근한다.
2. **값의 진실은 브라우저에 있다.** 토큰 파일은 설정 파서가 아니라
   실행 중인 앱의 `getComputedStyle(:root)` 에서 추출된다.
3. **두 뷰는 같은 토큰을 쓴다.** Client 와 Admin 의 차이는 *토큰 값*이 아니라
   *어떤 토큰을 어디에 쓰는가* 로만 표현한다. Admin 전용 팔레트를 만들지 않는다.

## 6.2 색

### 시맨틱 토큰 (역할 기반 — 우선 사용)

| 토큰 | Light | Dark | 용도 |
|---|---|---|---|
| `canvas` | `#ffffff` | `#090a0d` | 페이지 바탕 |
| `surface` | `#f6f7f9` | `#0f1117` | 한 단계 안쪽 면 |
| `surface-raised` | `#ffffff` | `#151822` | 카드·리스트 행 |
| `border` | `#e3e5eb` | `#21252f` | 기본 구분선 |
| `border-strong` | `#cbcfd9` | `#333846` | 강조 테두리·점선 |
| `ink` | `#0c0e13` | `#f1f3f7` | 본문 |
| `ink-muted` | `#5b6271` | `#98a0af` | 보조 텍스트 |
| `ink-faint` | `#939aa8` | `#616877` | 메타·라벨 |

사용: `bg-canvas`, `text-ink-muted`, `border-border`

### 팔레트 토큰 (모드 무관)

| 토큰 | 값 | | 토큰 | 값 |
|---|---|---|---|---|
| `brand-50` | `#eef3ff` | | `brand-500` | `#3b5bfd` |
| `brand-100` | `#dbe5ff` | | `brand-600` | `#2439f2` |
| `brand-200` | `#bdcfff` | | `brand-700` | `#1c29d6` |
| `brand-300` | `#92aeff` | | `brand-800` | `#1c25ab` |
| `brand-400` | `#6084ff` | | `brand-900` | `#1d2687` |

| 토큰 | 값 | 용도 |
|---|---|---|
| `signal-ok` | `#17915c` | 완료·성공 |
| `signal-wait` | `#9a7b12` | 진행중·주의 |

**시맨틱이 있으면 시맨틱을 쓴다.** `bg-white` 대신 `bg-surface-raised` —
전자는 다크 모드에서 깨지고, 후자는 자동으로 따라간다.

### 브랜드 색의 모드 대응

`brand-*` 는 모드에 따라 값이 바뀌지 않는다. 다크 모드에서 대비가 부족하면
**값을 바꾸지 말고 단계를 바꾼다** (`text-brand-600` → `dark:text-brand-400`).
값을 모드별로 나누면 팔레트가 두 벌이 되어 Figma Variables 매핑이 복잡해진다.

## 6.3 타이포그래피

| 용도 | 패밀리 | 출처 · 라이선스 |
|---|---|---|
| 본문 | `Pretendard Variable` | npm `pretendard` · OFL 1.1 |
| 코드·수치 | `JetBrains Mono Variable` | `apps/web/public/fonts/` 에 직접 보유 · OFL 1.1 |
| 루트 크기 | 16px | |

**Figma 에 이 두 폰트가 설치되어 있어야 한다.** 없으면 플러그인이 생성 자체를 중단한다
(폰트 대체가 일어나면 전 페이지 검증이 무너지므로).

### 제네릭 패밀리 금지

`ui-monospace`, `system-ui`, `sans-serif` 같은 CSS 제네릭은 **폰트 스택 맨 끝의 최후 수단으로만** 둔다.
실행 환경마다 다른 폰트가 렌더되고, 그 이름은 Figma 에 존재하지도 않아 플러그인이 폰트를 찾지 못한다.
추출기는 스택에서 제네릭을 건너뛰고 `document.fonts.check()` 로 실제 사용 가능한 폰트를 고르며,
실물 폰트를 하나도 못 찾으면 경고를 남긴다.

### 한 구간에 한 폰트

브라우저는 폰트가 못 그리는 글자만 다른 폰트로 대체한다(글리프 단위 폴백).
**Figma 의 TextNode 는 한 구간에 하나의 폰트만 쓸 수 있으므로, 이 경우 반드시 어긋난다.**

→ 라틴 전용 폰트(JetBrains Mono)에 한글을 넣지 않는다. 코드·경로·수치 등 ASCII 에만 쓴다.
추출기가 런마다 `document.fonts.check(size, text)` 로 커버리지를 검사해 위반을 잡아낸다.
- `line-height` 는 항상 px 로 확정된다 — `%`/`normal` 금지.
- 자간이 필요하면 `tracking-*` 토큰만 사용.

숫자는 `tabular-nums` 를 쓴다. 특히 Admin 의 테이블은 자릿수가 흔들리면 읽을 수 없다.

## 6.4 간격·모서리

- 간격 기준값: `--spacing` (Tailwind 배수 체계). `p-4` = 16px.
- 모서리: `--radius-*` 토큰만 사용. 임의 `rounded-[7px]` 금지.
- **타원형 모서리(`border-radius: 50% / 20%`)는 사용 금지** — Figma 가 표현하지 못해
  해당 노드가 폴백 래스터로 강등되고 네이티브 커버리지가 떨어진다.

## 6.5 Figma 매핑 (Phase 3)

| 토큰 그룹 | Figma |
|---|---|
| `color` (모드 무관) | Variable — Color |
| `color` (`com.winpilot.modes` 있음) | Variable — Color, Light/Dark 두 모드 |
| `fontFamily` + `fontSize` + `lineHeight` | Text Style |
| `shadow` | Effect Style |
| `radius`, `spacing` | Variable — Number |

> **바인딩 규칙**: Variable 바인딩은 *해석된 값이 UIR 실측값과 정확히 일치할 때만* 적용한다.
> 어긋나면 raw 값을 쓰고 리포트에 `token-drift` 로 기록한다. 토큰 재사용성보다 픽셀 정확도가 우선이다.

## 6.6 `@theme static` 을 쓰는 이유

Tailwind v4 는 기본적으로 **사용된 토큰만** `:root` 에 남긴다(트리셰이킹).
그대로 두면 아직 어떤 페이지도 쓰지 않은 브랜드 색이 토큰 파일과 Figma Variables 에서 통째로 빠져,
**디자인 시스템이 페이지 구축 순서에 따라 흔들린다.**

페이지를 하나씩 늘려가는 이 프로젝트에서는 실제로 발생하는 문제이므로,
우리 네임스페이스만 `static` 으로 고정해 항상 전량 방출한다.
Tailwind 기본 팔레트(`red-*` 등)는 트리셰이킹된 채로 두고, 토큰 파일에서
`source: 'tailwind-default'` 로 구분 표기한다.

## 6.7 토큰 추가 절차

```
1. globals.css 의 @theme static 에 변수 추가
2. pnpm ssot:tokens        → artifacts/tokens/tokens.json 재생성, 분류 확인
3. 다크 모드 값이 필요하면 :root / @media (prefers-color-scheme: dark) 에 원본 변수 추가
4. Phase 3 이후: 플러그인으로 Figma Variables 갱신
```

`pnpm ssot:tokens` 출력에서 확인할 것:
- `해석 실패` 0건 — 실패가 있으면 그 토큰은 Figma 로 넘어가지 않는다
- `출처 project` 수가 기대와 일치 — 누락 시 `@theme static` 밖에 선언한 것

## 6.8 금지 사항

- raw hex / raw px / `rounded-[Npx]` 같은 임의값
- 뷰 전용 팔레트 (`--color-admin-*`)
- 인라인 `style` 로 색·간격 지정
- `oklch()` / `lab()` 직접 사용 — 토큰 경유 시 sRGB 로 정규화되지만, 직접 쓰면 추적이 끊긴다
