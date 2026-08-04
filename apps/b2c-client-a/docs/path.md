# 1. Path 정의서

> SSOT: `packages/spec/src/features.ts` · 집행: `pnpm spec:check`

## 1.1 뷰 네임스페이스

| 뷰 | 라우트 접두어 | 컴포넌트 접두어 | 비고 |
|---|---|---|---|
| Client View | *(없음)* | *(없음)* | 최종 사용자 대상. SEO 대상. |
| Admin View | `/admin` | `Admin` | 운영자 대상. `noindex`, 인증 필수. |

접두어는 `packages/spec/src/types.ts` 의 `VIEW_META` 한 곳에서만 정의된다.
검사기는 각 뷰의 모든 라우트가 자기 접두어로 시작하는지 확인한다 (`ROUTE_PREFIX`).

## 1.2 URL 문법

| 규칙 | 내용 | 위반 예 |
|---|---|---|
| 소문자 kebab-case | 정적 세그먼트는 `[a-z0-9]+(-[a-z0-9]+)*` | `/productDetail`, `/Product_List` |
| 컬렉션은 복수형 | 자원 집합은 복수, 단건은 그 하위 | `/product/123` → `/products/123` |
| 동사 금지 | 동작은 경로 꼬리 규칙(§1.3)으로만 표현 | `/products/register`, `/getProducts` |
| 동적 세그먼트 | `[<entity>Id]` — **`Id` 접미 강제** | `[id]`, `[slug]`, `[product]` |
| 후행 슬래시 없음 | `/products` (O) · `/products/` (X) | |
| 확장자 없음 | | `/products.html` |

동적 세그먼트에 `Id` 를 강제하는 이유: `[id]` 만 있으면 중첩 라우트에서
`/orders/[id]/products/[id]` 처럼 무엇의 id 인지 코드에서 구분할 수 없다.

## 1.3 동작별 경로 꼬리 규칙

Feature 의 `action` 이 경로 꼬리를 결정한다. 검사 코드: `ROUTE_TAIL`.

| action | 경로 꼬리 | Client 예 | Admin 예 |
|---|---|---|---|
| `list` | *(없음)* | `/products` | `/admin/products` |
| `detail` | `/[xId]` | `/products/[productId]` | `/admin/products/[productId]` |
| `create` | `/new` | `/products/new` | `/admin/products/new` |
| `edit` | `/[xId]/edit` | `/products/[productId]/edit` | `/admin/products/[productId]/edit` |
| `search` | `/search` | `/products/search` | `/admin/products/search` |
| `settings` | `/settings` | `/settings` | `/admin/settings` |
| `delete` | *(경로 없음)* | 목록/상세 내 액션으로 처리 | 동일 |
| `dashboard` | *(자유)* | — | `/admin` |
| `auth` | *(자유)* | `/login`, `/signup` | `/admin/login` |

> `delete` 에 전용 경로를 두지 않는 이유: 삭제는 확인 모달을 동반하는 액션이지 페이지가 아니다.
> 별도 페이지를 만들면 뷰마다 `/delete`, `/remove`, `/confirm-delete` 로 갈라진다.

## 1.4 쿼리 파라미터

| 용도 | 파라미터 | 형식 |
|---|---|---|
| 페이지네이션 | `page`, `size` | 1-base 정수 |
| 정렬 | `sort` | `<field>:<asc\|desc>` (예: `createdAt:desc`) |
| 검색어 | `q` | 문자열 |
| 필터 | `filter[<field>]` | 반복 가능 |

- 쿼리는 **화면 상태**만 담는다. 권한·역할 등 신뢰가 필요한 값은 쿼리에 두지 않는다.
- 쿼리 차이는 Figma 페이지를 분리하지 않는다 (같은 라우트 = 같은 페이지).

## 1.5 경로 ↔ Figma 페이지

`pages.manifest.ts` 에 등록된 라우트만 Figma 페이지가 된다.

```
features.ts (route)  →  pages.manifest.ts (order, name)  →  Figma 페이지 '1. Index'
```

- 구현 완료(`status: 'implemented'`)인데 매니페스트에 없으면 검사 오류 (`MANIFEST_MISSING`).
- 매니페스트에 있는데 레지스트리에 없으면 경고 (`MANIFEST_ORPHAN`).
- 개발 전용 라우트는 `devOnlyRoutes` 로 예외 처리한다.

## 1.6 현재 경로 표 *(시드 — 도메인 확정 시 교체)*

| Feature ID | Client View | Admin View |
|---|---|---|
| `product.list` | `/products` | `/admin/products` |
| `product.detail` | `/products/[productId]` | `/admin/products/[productId]` |
| `product.create` | `/products/new` | `/admin/products/new` |
| `product.edit` | `/products/[productId]/edit` | `/admin/products/[productId]/edit` |

`pnpm spec:matrix` 로 현재 레지스트리의 전체 파생 이름을 출력할 수 있다.
