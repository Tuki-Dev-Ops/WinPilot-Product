# 8. 비기능 명세서

> 값이 있는 항목은 **예산**이다. 예산은 지키거나 고치는 것이지 참고하는 것이 아니다.
> 디자인 싱크 기준은 `packages/uir/src/tolerance.ts` 가 SSOT.

## 8.1 성능 예산

| 지표 | Client View | Admin View | 측정 |
|---|---|---|---|
| LCP | ≤ 2.5s | ≤ 3.0s | Lighthouse, 4G 스로틀 |
| INP | ≤ 200ms | ≤ 200ms | 실사용자 측정 |
| CLS | ≤ 0.1 | ≤ 0.1 | Lighthouse |
| TTFB | ≤ 600ms | ≤ 800ms | |
| 초기 JS (gzip) | ≤ 180KB | ≤ 300KB | 라우트별 |
| 이미지 | AVIF/WebP, 지연 로딩 | 동일 | `next/image` |

Client 가 더 엄격한 이유: 검색 유입 사용자는 이탈 임계가 낮고 회선을 고르지 못한다.
Admin 은 인증된 반복 사용자이므로 캐시 적중률이 높다.

**CLS 는 디자인 싱크와 직결된다.** 레이아웃이 늦게 흔들리면 추출 시점의 기하가 달라진다.
추출기는 `networkidle` + `document.fonts.ready` 까지 기다리지만, 그 이후 이동하는 요소는 잡지 못한다.
→ 이미지·폰트·비동기 콘텐츠에 **크기를 미리 예약**한다.

## 8.2 접근성 (WCAG 2.2 AA)

| 항목 | 기준 |
|---|---|
| 색 대비 | 본문 4.5:1, 큰 텍스트/UI 3:1 |
| 키보드 | 모든 인터랙션 도달·조작 가능, 포커스 트랩 없음 |
| 포커스 표시 | 항상 보임. `outline: none` 단독 사용 금지 |
| 폼 | 모든 입력에 연결된 `<label>`, 오류는 `aria-describedby` |
| 이미지 | 의미 있는 이미지에 `alt`, 장식은 `alt=""` |
| 랜드마크 | `header`/`nav`/`main`/`footer` 1회씩 |
| 제목 계층 | `h1` 1개, 건너뛰지 않음 |
| 모션 | `prefers-reduced-motion` 존중 |
| 라이브 영역 | 토스트·검증 결과는 `aria-live` |

- 시맨틱 토큰 조합의 대비는 [6. 디자인 시스템](06-design-system.md) 값으로 사전 검증한다.
  `ink-faint` on `surface` 처럼 경계에 있는 조합은 본문에 쓰지 않는다.
- Admin 은 반복 작업이 많아 **키보드 단축키**를 추가로 제공한다 (목록 이동, 저장).

## 8.3 반응형

캡처·검증 대상 너비는 **1440 / 768 / 375** 로 확정되어 있다 ([아키텍처 §L2](../architecture/design-sync-ssot.md)).

| 너비 | Client | Admin |
|---|---|---|
| 1440 | 기본 | 기본 (사이드바 펼침) |
| 768 | 2열 → 1열, 헤더 축약 | 사이드바 아이콘만 |
| 375 | 단일 열, 드로어 내비 | 드로어 내비, 테이블 → 카드 |

- 이 3개 너비에서 **가로 스크롤이 발생하면 안 된다.**
- 넓은 콘텐츠(테이블, 코드)는 자체 컨테이너 안에서 스크롤한다.
- 이 3개 외 너비는 검증 대상이 아니다 — 깨져도 CI 는 잡지 못하므로 중간 너비 전용 트릭을 쓰지 않는다.

## 8.4 브라우저 지원

| 브라우저 | 범위 |
|---|---|
| Chrome / Edge | 최신 2개 |
| Safari | 최신 2개 (iOS 포함) |
| Firefox | 최신 2개 |
| IE | 미지원 |

**기준 브라우저는 Chromium 이다.** baseline PNG 와 UIR 이 Chromium 에서 나오므로,
디자인 싱크 100% 는 Chromium 렌더 기준으로만 성립한다. 다른 브라우저는 기능 동등성만 보장한다.

## 8.5 보안

| 항목 | Client View | Admin View |
|---|---|---|
| 인증 | 기능별 선택적 | `/admin/**` 전체 필수 |
| 세션 | HttpOnly · Secure · SameSite=Lax | SameSite=Strict |
| 권한 검사 | 서버에서 수행 | 서버에서 수행 |
| CSP | 기본 | 동일 + `frame-ancestors 'none'` |
| 민감 데이터 | 번들·응답에 포함 금지 | 권한 범위 내 |
| 감사 로그 | 주요 액션 | **모든 변경 액션** |

- **클라이언트 조건부 렌더는 보안이 아니다.** Client 가 보면 안 되는 값은
  API 응답 자체에 포함시키지 않는다 ([5.2](05-component.md#52-뷰-공유-판단-기준)).
- `data-ssot-cid` / `data-ssot-variant` 는 구조 정보만 담는다. 값·권한을 넣지 않는다.

## 8.6 국제화

- 기본 언어 한국어(`ko`), 확장 대비 구조만 갖춘다.
- 하드코딩 문자열 금지 — 키는 `feature.<featureId>.*` ([2.3](02-naming-convention.md#23-파생-규칙)).
- **i18n 은 디자인 싱크에 직접 영향을 준다.** 언어가 바뀌면 텍스트 길이가 바뀌고
  줄바꿈이 달라져 UIR 의 `lineBoxes` 가 통째로 변한다.
  → baseline 은 **`ko` 기준 하나만** 유지한다. 다국어 캡처는 별도 결정 사항이다.
- 숫자·날짜·통화는 `Intl` 로 포맷하고, 서버·클라이언트 타임존을 고정한다
  (포맷이 흔들리면 픽셀 diff 가 난다).

## 8.7 디자인 싱크 (요구사항 1.2)

| 기준 | 값 | SSOT |
|---|---|---|
| 수치 검증 허용오차 | `1e-4` | `tolerance.ts` `NUMERIC_EPSILON` |
| 텍스트 외 영역 diff | `0` px | `ALLOWED_NON_TEXT_DIFF_PIXELS` |
| 글리프 AA 허용 폭 | 잉크 경계 ±`1` px | `PIXEL_TOLERANCE.aaMaskDilationPx` |
| 잉크 무게중심 편차 | ≤ `0.35` px | `PIXEL_TOLERANCE.inkCentroidPx` |
| 잉크 커버리지 차 | ≤ `5` % | `PIXEL_TOLERANCE.inkCoverageRatio` |
| 폰트 대체 | `0` 건 | `ALLOWED_FONT_FALLBACKS` |

판정 절차는 [아키텍처 §9](../architecture/design-sync-ssot.md).
**이 표의 숫자를 문서에서 고치지 않는다** — `tolerance.ts` 를 고치고 문서를 맞춘다.

임계값은 추측이 아니라 `pnpm ssot:selftest` 의 측정 결과로 정한다. 실제 baseline 에
합성 변형(AA 노이즈 · 서브픽셀 이동 · 색 변화)을 가해 각 지표의 분리도를 재고, 그 근거를
`tolerance.ts` 주석에 남긴다. 임계를 바꾸려면 **먼저 자기검증을 돌려 근거를 갱신한다.**

부가 지표 (게이트 아님):
- 네이티브 커버리지 = 네이티브 노드 / 전체 노드 — 회귀 시 경고
- `line-split` 발생 문단 수 — 편집성 지표

## 8.8 관측성

| 항목 | 내용 |
|---|---|
| 에러 수집 | 클라이언트 예외 + 서버 5xx, Feature ID 태깅 |
| 성능 | Web Vitals 실사용자 수집, 라우트별 집계 |
| 감사 | Admin 변경 액션 전량 |
| 상관 키 | `featureId`, `view`, `route` — 로그·에러·성능이 같은 키로 묶인다 |

`featureId` 를 상관 키로 쓰는 것이 [2. 명명규칙](02-naming-convention.md) 의 부수 효과다.
이름 체계가 하나로 모이면 관측 데이터도 자동으로 짝지어진다.

## 8.9 CI 게이트

| 검사 | 명령 | 실패 조건 |
|---|---|---|
| 타입 | `pnpm typecheck` | 오류 1건 |
| 명명·경로 | `pnpm spec:check` | error 1건 |
| 토큰 | `pnpm ssot:tokens` | 해석 실패 1건 |
| 디자인 싱크 | `pnpm ssot:verify` | §8.7 기준 미달 |

> Figma 플러그인은 헤드리스 실행이 불가하므로 마지막 구간(플러그인 실행 → 프레임 익스포트)은
> 로컬 데스크톱에서 트리거한다. 완전 자동화는 Phase 5 이후 REST API 경로로 검토한다.
