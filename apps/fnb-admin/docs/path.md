# Path 정의서 — F&B Admin

> SSOT: `packages/spec/src/features.ts` · 등록: `pages.manifest.ts`
> 검사: `pnpm spec:check`(등록·명명) · `pnpm docs:check`(문서 ↔ 화면)

## 1. 뷰와 접두어

| 뷰 | 라우트 접두어 | 컴포넌트 접두어 | 앱 |
|---|---|---|---|
| F&B Client | *(없음)* | *(없음)* | `apps/fnb-client-a` |
| F&B Admin | *(없음)* | `Fnb` | `apps/fnb-admin` |

두 앱이 **각자의 도메인**에 올라가므로 라우트 접두어를 두지 않는다. 대신 컴포넌트 이름으로
어느 뷰의 것인지 구분한다 — 접두어가 없으면 `MenuListView` 가 두 앱에 다 있게 된다.

## 2. URL 문법

| 규칙 | 내용 | 위반 예 |
|---|---|---|
| 소문자 kebab-case | 정적 세그먼트는 `[a-z0-9]+(-[a-z0-9]+)*` | `/menuDetail` |
| 컬렉션은 복수형 | 자원 집합은 복수, 단건은 그 하위 | `/menu/123` (어드민 기준) |
| 동사 금지 | 동작은 경로 꼬리 규칙으로만 | `/menus/register` |
| 동적 세그먼트 | `[<entity>Id]` — `Id` 접미 강제 | `[id]`, `[slug]` |
| 후행 슬래시·확장자 없음 | | `/menus/`, `/menus.html` |

## 3. 동작별 경로 꼬리

| 동작 | 꼬리 | 이 템플릿의 예 |
|---|---|---|
| 목록 | *(없음)* | `/menus` · `/stores` · `/banners/main` |
| 등록 | `/new` | `/menus/new` · `/support/notices/new` |
| 상세·수정 | `/[id]` | `/menus/[menuId]` · `/settings/admins/[adminId]` |
| 설정 | 자원 아래 이름 | `/menus/categories` · `/settings/brand` |

## 4. 사이트만의 규칙

고객 사이트는 **복수형을 쓰지 않는다.** 손님이 주소를 읽는 자리이고, `/menu` 가 `/menus` 보다
짧고 자연스럽다. 어드민은 자원 집합을 다루므로 복수형이다 — 같은 자원인데 주소가 다른 것은
그래서다(`/menu` ↔ `/menus`).

`/menu/[itemId]` 는 메뉴 하나를 가리킨다. 어드민의 `/menus/[menuId]` 와 **id 가 같다** —
`sukhoe-whole` 같은 사람이 읽는 값이라, 두 화면을 나란히 열어 견줄 수 있다.

## 5. 문서 라우트

`/docs/**` 는 개발 도구다. `devOnlyRoutes` 로 추출 대상에서 뺀다 — 고객사에 노출되지 않는다.
