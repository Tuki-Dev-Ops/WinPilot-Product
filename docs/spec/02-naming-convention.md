# 2. 명명규칙 정의서

> SSOT: `packages/spec/src/features.ts`, `packages/spec/src/glossary.ts` · 집행: `pnpm spec:check`

## 2.1 해결하려는 문제

Client View 와 Admin View 는 서로 다른 도메인이지만 **같은 기능**을 구현한다.
이때 각 뷰가 자기 편한 이름을 쓰기 시작하면 다음이 벌어진다.

```
Client:  /products/new        ProductCreatePage      t('product.new.title')     data-testid="product-new"
Admin:   /admin/item/register AdminItemRegisterForm  t('admin.item.register')   data-testid="regBtn"
```

같은 "상품 등록"인데 **두 구현을 이어 줄 공통 식별자가 하나도 없다.** 이 상태에서는
디자인 싱크 리포트가 diff 를 찾아도 "이게 어느 기능의 어느 뷰인지"를 사람이 추측해야 하고,
기능 하나를 바꿀 때 다른 뷰를 빠뜨렸는지 기계가 알 수 없다.

**해결: Feature ID 를 유일한 뿌리로 두고, 나머지 모든 이름을 거기서 파생시킨다.**

## 2.2 Feature ID

```
<entity>.<action>              product.create
<domain>.<entity>.<action>     catalog.product.create   (도메인 분리가 필요할 때만)
```

- 소문자 · 점 구분만 허용 — 검사 코드 `ID_FORMAT`
- 끝은 반드시 `action` 과 일치 — `ID_ACTION_MISMATCH`
- `entity` 가 ID 에 포함되어야 함 — `ID_ENTITY_MISMATCH`
- **뷰 이름은 Feature ID 에 들어가지 않는다.** `admin.product.create` 는 금지 —
  뷰가 ID 에 섞이면 같은 기능이 두 개의 ID 를 갖게 되어 존재 이유가 사라진다.

### 표준 동작 어휘 (닫힌 집합)

`list · detail · create · edit · delete · search · import · export · settings · dashboard · auth`

이 목록 밖은 쓸 수 없다 (`ACTION_UNKNOWN`). `create`/`add`/`new`/`register` 처럼
같은 뜻의 단어가 뷰마다 다르게 쓰이는 것이 싱크가 깨지는 첫 번째 원인이므로 어휘를 먼저 닫는다.
새 동작이 정말 필요하면 `packages/spec/src/types.ts` 의 `ACTIONS` 에 추가한다.

## 2.3 파생 규칙

Feature ID 하나에서 나오는 이름들. `pnpm spec:matrix` 가 이 표를 실제 값으로 출력한다.

| 대상 | Client View | Admin View | 검사 |
|---|---|---|---|
| 라우트 | `/products/new` | `/admin/products/new` | `ROUTE_PREFIX`, `ROUTE_TAIL` |
| 페이지 컴포넌트 | `ProductCreatePage` | `AdminProductCreatePage` | `COMPONENT_NAME` |
| 파일 | `app/products/new/page.tsx` | `app/admin/products/new/page.tsx` | — |
| `data-ssot-cid` | `client/product.create` | `admin/product.create` | — |
| i18n 키 | `feature.product.create` | `feature.product.create` *(공유)* | — |
| 테스트 ID | `client:product.create` | `admin:product.create` | — |
| Figma 프레임 | `Client View / Create product` | `Admin View / Create product` | — |

규칙은 단 하나 — **접두어만 다르다.**
`Admin` 접두어 하나만 붙이는 이유: 파일 검색 한 번(`ProductCreatePage`)으로 같은 기능의 두 구현이
나란히 잡혀야 한다. `AdminProductForm` 처럼 구조가 달라지면 그 연결이 끊어진다.

> i18n 키는 뷰를 구분하지 않는다. 같은 기능의 레이블은 같아야 하며,
> 뷰별로 문구가 달라야 한다면 `feature.product.create.admin.hint` 처럼 **하위 키**로 분기한다.
> 최상위에서 갈라놓으면 번역 누락을 기계가 못 잡는다.

## 2.4 용어 사전 (Ubiquitous Language)

싱크가 깨지는 원인은 레이아웃이 아니라 **단어**다. 정규 용어만 엔티티·컴포넌트·라우트에 쓸 수 있다.

*(아래는 시드 — 도메인 확정 시 `glossary.ts` 를 교체한다)*

| 정규 용어 | 한글 | 금지어 | 비고 |
|---|---|---|---|
| `product` | 상품 | `item`, `goods`, `merchandise`, `article`, `sku` | Admin 에서도 동일하게 `product` |
| `user` | 사용자 | `member`, `client`, `customer`, `account` | `client` 는 뷰 이름과 충돌하므로 엔티티명 불가 |
| `order` | 주문 | `purchase`, `transaction`, `deal` | |

- 금지어가 Feature ID·엔티티·컴포넌트명에 나타나면 오류 (`TERM_BANNED`).
  검사기는 PascalCase/camelCase/kebab-case 를 단어 단위로 분해해 찾는다 —
  `AdminItemRegisterPage` 안의 `Item` 도 잡힌다.
- 사전에 없는 새 용어는 경고 (`TERM_UNREGISTERED`). 등록 후 사용한다.

## 2.5 파일·폴더

| 대상 | 규칙 | 예 |
|---|---|---|
| 라우트 폴더 | 경로와 동일 (kebab-case, `[xxxId]`) | `app/products/[productId]/edit/` |
| 페이지 파일 | Next.js 규약 고정 | `page.tsx`, `layout.tsx` |
| 컴포넌트 파일 | PascalCase, 컴포넌트명과 일치 | `ProductCreateForm.tsx` |
| 훅 | `use` + PascalCase | `useProductDraft.ts` |
| 유틸 | camelCase | `formatPrice.ts` |
| 타입 전용 | `*.types.ts` | `product.types.ts` |
| 뷰 공용 컴포넌트 | `components/` 아래, 접두어 없음 | `components/Button.tsx` |
| 뷰 전용 컴포넌트 | 해당 라우트 트리 안 | `app/admin/products/_components/` |

## 2.6 디자인 토큰

| 대상 | 규칙 | 예 |
|---|---|---|
| 시맨틱 토큰 | 역할 기반 | `--color-canvas`, `--color-ink-muted` |
| 팔레트 토큰 | `<이름>-<단계>` | `--color-brand-500` |
| 컴포넌트 하드코딩 | **금지** — raw hex 사용 불가 | `#3b5bfd` (X) → `bg-brand-500` (O) |

자세한 내용은 [6. 디자인 시스템](06-design-system.md).

## 2.7 검사 코드 목록

`pnpm spec:check` 가 내는 코드다. 오류 1건이라도 있으면 종료 코드 1.

| 코드 | 수준 | 의미 |
|---|---|---|
| `ID_FORMAT` | error | Feature ID 형식 위반 |
| `ID_DUPLICATE` | error | Feature ID 중복 |
| `ID_ACTION_MISMATCH` | error | ID 끝과 `action` 불일치 |
| `ID_ENTITY_MISMATCH` | error | ID 에 `entity` 없음 |
| `ACTION_UNKNOWN` | error | 표준 동작 어휘 밖 |
| `TERM_BANNED` | error | 금지 용어 사용 |
| `TERM_UNREGISTERED` | warn | 용어 사전 미등록 |
| `COMPONENT_NAME` | error | 컴포넌트명이 파생 규칙과 다름 |
| `ROUTE_PREFIX` | error | 뷰 네임스페이스 위반 |
| `ROUTE_SEGMENT` | error | 세그먼트 형식 위반 |
| `ROUTE_TAIL` | error | 동작별 경로 꼬리 위반 |
| `ROUTE_DUPLICATE` | error | 라우트 중복 |
| `VIEW_EMPTY` | error | 뷰 바인딩 없음 |
| `VIEW_PARTIAL` | warn | 한쪽 뷰에만 존재 |
| `MANIFEST_MISSING` | error | 구현 완료인데 Figma 페이지 미등록 |
| `MANIFEST_ORPHAN` | warn | 매니페스트에 있으나 레지스트리에 없음 |

## 2.8 새 기능 추가 절차

```
1. packages/spec/src/features.ts 에 FeatureSpec 등록  (status: 'planned')
2. pnpm spec:check                                    → 이름이 규칙에 맞는지 먼저 확인
3. pnpm spec:matrix                                   → 파생된 이름들을 그대로 복사해 구현
4. 구현 후 status: 'implemented' 로 변경
5. apps/web/pages.manifest.ts 에 { order, id, name, route } 등록
6. pnpm spec:check && pnpm ssot:extract && pnpm ssot:verify
```

**이름을 먼저 정하고 코드를 쓴다.** 순서가 반대가 되면 이미 쓴 이름을 지키려고 규칙이 휘어진다.
