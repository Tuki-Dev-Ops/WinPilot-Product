# Path 정의서 — IR Client 템플릿 A

> SSOT: `packages/spec/src/features.ts` · 등록: `pages.manifest.ts`
> 검사: `pnpm spec:check`(등록·명명) · `pnpm docs:check`(문서 ↔ 화면)

## 1. 뷰와 접두어

| 뷰 | 라우트 접두어 | 컴포넌트 접두어 | 앱 |
|---|---|---|---|
| IR Client | *(없음)* | *(없음)* | `apps/ir-client-a` |
| IR Admin | *(없음)* | `Ir` | `apps/ir-admin` |

두 앱이 **각자의 도메인**에 올라가므로 라우트 접두어를 두지 않는다. 대신 컴포넌트 이름으로
어느 뷰의 것인지 구분한다 — 접두어가 없으면 `DisclosureListView` 가 두 앱에 다 있게 된다.

## 2. URL 문법

| 규칙 | 내용 | 위반 예 |
|---|---|---|
| 소문자 kebab-case | 정적 세그먼트는 `[a-z0-9]+(-[a-z0-9]+)*` | `/aboutHistory` |
| 컬렉션은 복수형 | 자원 집합은 복수, 단건은 그 하위 | `/disclosure` |
| 동사 금지 | 동작은 경로 꼬리 규칙으로만 | `/disclosures/view` |
| 동적 세그먼트 | `[<entity>Id]` — `Id` 접미 강제 | `[id]`, `[slug]` |
| 후행 슬래시·확장자 없음 | | `/disclosures/`, `/disclosures.html` |

## 3. 이 사이트는 복수형을 쓴다 — F&B 사이트와 반대다

F&B 사이트는 `/menu` · `/stores` 처럼 손님이 읽기 좋은 말을 골랐다. 여기는 그러지 않는다.

읽는 사람이 다르기 때문이다. 여기 오는 사람은 **자료를 찾으러** 온다 — 공시 하나, 총회
하나가 아니라 **목록**을 보러 오고, 그 목록에서 하나를 연다. `/disclosures` 는 그 구조를
주소가 그대로 말한다.

`/financials` · `/meetings` · `/solutions` 도 같다. 예외는 `/stock` · `/library` ·
`/governance` 셋인데, 그 셋은 **셀 수 있는 것이 아니라 한 덩어리**라 단수다.

## 4. 갈래별 경로

| 갈래 | 경로 |
|---|---|
| 회사소개 | `/about` · `/about/history` · `/about/certifications` |
| 제품 | `/products` · `/solutions/{consulting,infra,mes,erp,crm,dxp}` |
| 공시 | `/disclosures` · `/disclosures/[disclosureId]` |
| 재무 | `/financials` · `/stock` · `/dividends` |
| 주주 | `/meetings` · `/meetings/voting` · `/governance` |
| 자료 | `/library` · `/schedules` · `/subscribe` |
| 고객지원 | `/support/{contact,notices,news,faq,directions}` |
| 법적 고지 | `/terms` · `/privacy` |

**`/support` 만 아래에 다섯을 갖는다.** 나머지 갈래는 최상위에 편다 — 두 단계를 만들면
`/disclosures/disclosures` 같은 자리가 생긴다.

법적 고지 둘이 `/legal/` 아래가 아니라 최상위인 이유: 어느 화면에서든 푸터 맨 윗줄에 있는
고지라, 한 단계 더 들어가는 주소는 그 무게와 맞지 않는다.

## 5. 상세 화면은 하나뿐이다

`/disclosures/[disclosureId]` 가 유일한 동적 경로다. 재무 · 배당 · 총회 · 지배구조 · 자료실은
**줄 하나가 다 말해서** 더 볼 것이 남지 않는다.

이 화면만 **주소로 열어도 막힌다.** 나가지 않은 공시(`작성 중` · `검토 요청`)는
`publicDisclosures()` 에 없고, 없으면 404 다 — 미공개 정보가 주소로 읽히면 그것이 곧 유출이다.

## 6. 숨긴 메뉴

`/products` 는 살아 있지만 **헤더에 뜨지 않는다**(`SITE_NAV` 의 `hidden: true`). 푸터에는
남는다. 지우지 않은 이유: 솔루션 상세 여섯이 이 화면을 거쳐 들어오는 길을 갖고 있고, 주소를
지우면 그 여섯이 어디에서도 안 닿는다.

## 7. 문서 라우트

`/docs/**` 는 개발 도구다. `devOnlyRoutes` 로 추출 대상에서 뺀다 — 고객사에 노출되지 않는다.
