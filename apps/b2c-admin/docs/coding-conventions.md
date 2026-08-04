# 명명규칙 정의서 — B2C Admin

> SSOT: `packages/spec/src/features.ts` · `packages/spec/src/glossary.ts`
> 집행: `pnpm spec:check`(규칙) · `pnpm sync:check`(레지스트리 이름 = 파일 이름)

## 1. 표준 이름의 기준은 어드민이다

**이 도메인(B2C 커머스)의 정규 이름은 어드민이 부르는 이름으로 정한다.** 우리 쪽이 기준이 되는
까닭은 셋이다.

1. **자원을 만들고 고치는 쪽이 여기다.** 상품·배너·약관·연혁은 전부 이 앱에서 태어난다.
   이름은 자원이 태어나는 자리에서 정해지는 편이 흔들리지 않는다.
2. **고객 화면은 여섯 벌이지만 어드민은 하나다.** 템플릿 A~F 가 각자 이름을 정하면 같은 값이
   여섯 이름을 갖는다. 한 벌뿐인 쪽이 기준이 되어야 갈라질 자리가 없다.
3. **운영자가 화면에서 쓰는 말과 개발자가 코드에서 쓰는 말이 같아야** 무언가 잘못됐을 때 서로 통한다.

단, **메뉴에 적히는 말과 엔티티 이름은 다를 수 있다.** 엔티티는 자원의 이름이고 메뉴 라벨은
운영자에게 익은 말이다. 둘이 다른 자리는 3장에 전부 적어 둔다 — 숨기면 다음 사람이 메뉴 이름으로
코드를 찾다가 못 찾는다.

## 2. `Admin` 접두어

`packages/spec/src/types.ts` 가 이 뷰에 준 것은 **컴포넌트 접두어 `Admin` 하나뿐**이다
(라우트 접두어는 비어 있다 — `docs/path.md` §1). 접두어를 붙이는 자리와 붙이지 않는 자리를 가른다.

| 대상 | 접두어 | 예 |
|---|---|---|
| 페이지 컴포넌트 (레지스트리 파생) | **붙인다** | `AdminProductCreatePage` · `AdminOrderListPage` |
| 어드민 전체가 쓰는 뼈대 — `app/_components/` | **붙인다** | `AdminShell` · `AdminListToolbar` · `AdminModal` |
| 화면·섹션 전용 조각 — `app/<route>/_components/` | **붙이지 않는다** | `ProductForm` · `OrderListView` · `NoticeForm` |
| 도메인 조각 — `components/domain/<entity>/` | 붙이지 않는다 | `components/domain/user/AuthField.tsx` |

**경계는 "이 조각이 뷰를 가로지르는가" 다.** 페이지 컴포넌트는 고객 화면에도 같은 기능의 짝이 있어
(`ProductListPage` ↔ `AdminProductListPage`) 이름만으로 갈라야 하고, `app/_components/` 의 뼈대는
어느 화면에서나 불려 나오는 것이라 이름에 소속을 박아 둔다 — `AdminShell` 하나만 해도 마흔 장
넘는 파일이 쓴다(사이드바가 없는 로그인 화면만 빼고). 반대로 `app/products/_components/ProductForm`
은 폴더 경로가 이미 어느 화면의 것인지 말하고 있어서, 접두어를 더 붙이면 `AdminProductForm` 처럼
같은 말을 두 번 하게 된다.

### 2.1 지금 어긋나 있는 자리

규칙을 적어 두는 김에, 실제 파일 중 규칙을 따르지 않는 셋을 적어 둔다.

| 파일 | 규칙대로면 | 비고 |
|---|---|---|
| `app/_components/MemberFormModal.tsx` | `AdminMemberFormModal` | 앱 전체가 쓰는 자리인데 접두어가 없다 |
| `app/login/_components/AdminUserAuthForm.tsx` | `UserAuthForm` | 화면 전용인데 접두어가 붙어 있다 |
| `app/docs/**` 의 페이지들 | *(규칙 밖)* | `AdminDocsOverviewPage` 와 `FsdIndexPage` 가 섞여 있다 |

`/docs` 아래는 레지스트리에 등록하지 않는 개발 도구라 `spec:check` 가 보지 않는다 —
**검사기가 막지 못하는 자리는 이렇게 손으로 적어 두는 수밖에 없다.**

## 3. 메뉴 이름과 엔티티 이름이 다른 자리

`lib/navigation/admin-menu.ts` 의 라벨과 `packages/spec/src/glossary.ts` 의 정규 용어를 대조한 것이다.
**코드·라우트·컴포넌트명에 쓰는 것은 언제나 오른쪽(엔티티)이다.**

| 메뉴 라벨 | 엔티티 | 경로 | 왜 다른가 |
|---|---|---|---|
| 대시보드 | `site` | `/` | 화면이 아니라 사이트 자체의 진입면이다 |
| 사용자 > **관리자** | `staff` | `/users/admins` | `admin` 은 뷰 접두어(`AdminXxxPage`)와 겹쳐 엔티티명으로 쓸 수 없다 |
| 상품 > **등록** | `product` | `/products` | 라벨은 '등록' 이지만 실제로 여는 것은 목록이다. 등록은 목록에서 들어간다 |
| 상품 > **판매** | `order` | `/products/sales` | 같은 자원이다 — 고객이 '주문' 이라 부르는 것을 운영자가 '판매' 라 부를 뿐 |
| 배너 > **메인 비주얼** | `banner` | `/banners` | `main` 은 `site` 의 금지어라 라우트에도 쓰지 않는다 |
| 회사 > **소개** | `profile` | `/company/about` | `about` · `intro` 는 `profile` 의 금지어다 |
| 회사 > **연혁** | `milestone` | `/company/history` | `history` · `timeline` 은 `milestone` 의 금지어다 |
| **통계** | `analytics` | `/statistics` | `stat` · `stats` 는 `analytics` 의 금지어다 |
| 통계 > 많이 방문한 페이지 | `pageview` | `/statistics/pages` | `analytics` 의 상세가 아니라 다른 것의 목록이라 엔티티를 나눴다 |
| 통계 > 매출 | `revenue` | `/statistics/revenue` | 위와 같다 |
| 설정 > 서비스 이용약관 정보 | `terms` | `/settings/terms` | 라벨만 길다 |
| 설정 > 개인정보 처리방침 정보 | `privacy` | `/settings/privacy` | 라벨만 길다 |

나머지(사용자·등급·카테고리·리뷰·쿠폰·문의·공지사항·FAQ·뉴스·포트폴리오·팝업·공급자 정보·SEO)는
라벨과 엔티티가 같다.

> **금지어 검사는 엔티티와 컴포넌트명만 본다.** 그래서 `/company/history` · `/statistics` 처럼
> 금지어가 든 라우트가 그대로 남아 있다. 라우트는 운영자 눈에 거의 띄지 않고, 검사 범위를 넓히면
> 이미 배포된 주소를 바꿔야 해서 그대로 둔다 — **모르고 둔 것이 아니라 알고 둔 것**이다.

## 4. Feature ID

```
<entity>.<action>              product.create
<domain>.<entity>.<action>     catalog.product.create   (도메인 분리가 필요할 때만)
```

- 소문자 · 점 구분만 — `ID_FORMAT`
- 끝은 반드시 `action` 과 일치 — `ID_ACTION_MISMATCH`
- `entity` 가 ID 에 포함되어야 함 — `ID_ENTITY_MISMATCH`
- **`admin` 은 ID 에 들어가지 않는다.** `admin.product.create` 는 금지 — 뷰가 ID 에 섞이면 같은
  기능이 두 개의 ID 를 갖게 되어 ID 의 존재 이유가 사라진다. 어드민 화면인지는 `views['b2c-admin']`
  바인딩이 있는지로 안다.

### 표준 동작 어휘 (닫힌 집합)

`home · library · list · detail · create · edit · delete · search · import · export · settings ·
dashboard · auth · signup · result`

이 목록 밖은 쓸 수 없다 (`ACTION_UNKNOWN`). 어드민 메뉴에 '등록' 이라 적혀 있어도 동작 이름은
`create` 다 — `create`/`add`/`new`/`register` 가 화면마다 다르게 쓰이는 것이 싱크가 깨지는 첫 번째
원인이라 어휘를 먼저 닫는다. 새 동작이 정말 필요하면 `packages/spec/src/types.ts` 의 `ACTIONS` 에 추가한다.

## 5. 파생 규칙

Feature ID 하나에서 나오는 어드민 쪽 이름들. `pnpm spec:matrix` 가 실제 값으로 출력한다.

| 대상 | 값 | 검사 |
|---|---|---|
| 라우트 | `/products/new` | `ROUTE_PREFIX` · `ROUTE_SEGMENT` · `ROUTE_TAIL` |
| 페이지 컴포넌트 | `AdminProductCreatePage` | `COMPONENT_NAME` |
| 파일 | `app/products/new/page.tsx` | `sync:check` |
| Figma 페이지 | `pages.manifest.ts` 의 `order` · `name` | `MANIFEST_MISSING` |

**고객 화면과 다른 것은 접두어 한 마디뿐이다.** `ProductCreatePage` 를 검색하면
`AdminProductCreatePage` 가 나란히 잡혀야 한다 — `AdminProductRegisterForm` 처럼 구조를 바꾸면
그 연결이 끊어지고, 한쪽만 고쳐 두 화면이 어긋나도 아무도 모른다.

## 6. 금지어

전체 목록은 `glossary.ts` 다. 어드민에서 특히 자주 끼어드는 넷만 적는다.

| 정규 용어 | 한글 | 금지어 |
|---|---|---|
| `product` | 상품 | `item` · `goods` · `merchandise` · `article` · `sku` |
| `order` | 주문 | `purchase` · `transaction` · `deal` |
| `staff` | 관리자 | `manager` · `operator` |
| `analytics` | 통계 | `stat` · `stats` · `metric` · `report` |

- 금지어가 Feature ID·엔티티·컴포넌트명에 나타나면 오류 (`TERM_BANNED`). 검사기는
  PascalCase/camelCase/kebab-case 를 단어 단위로 분해해 찾는다 — `AdminItemRegisterPage` 안의
  `Item` 도 잡힌다.
- 사전에 없는 새 용어는 경고 (`TERM_UNREGISTERED`). 등록한 다음에 쓴다.

## 7. 검사 코드 목록

`pnpm spec:check` 가 내는 코드다 (`packages/spec/src/validate.ts`). 오류 1건이라도 있으면 종료 코드 1.

| 코드 | 수준 | 의미 |
|---|---|---|
| `ID_FORMAT` | error | Feature ID 형식 위반 |
| `ID_DUPLICATE` | error | Feature ID 중복 |
| `ID_ACTION_MISMATCH` | error | ID 끝과 `action` 불일치 |
| `ID_ENTITY_MISMATCH` | error | ID 에 `entity` 없음 |
| `ACTION_UNKNOWN` | error | 표준 동작 어휘 밖 |
| `TERM_BANNED` | error | 금지 용어 사용 (엔티티 · 컴포넌트명) |
| `TERM_UNREGISTERED` | warn | 엔티티가 용어 사전에 없음 |
| `VIEW_EMPTY` | error | 뷰 바인딩이 하나도 없음 |
| `VIEW_PARTIAL` | warn | 짝을 이루는 뷰 한쪽에만 존재 — 설계상 맞으면 `singleViewByDesign: true` |
| `COMPONENT_NAME` | error | 컴포넌트명이 파생 규칙과 다름 |
| `ROUTE_PREFIX` | error | 뷰 네임스페이스 위반 |
| `ROUTE_SEGMENT` | error | 세그먼트 형식 위반 |
| `ROUTE_TAIL` | error | 동작별 경로 꼬리 위반 |
| `ROUTE_DUPLICATE` | error | 같은 뷰 안에서 라우트 중복 |
| `MANIFEST_MISSING` | error | 구현 완료인데 `pages.manifest.ts` 에 없음 |
| `MANIFEST_ORPHAN` | warn | 매니페스트에 있으나 레지스트리에 없음 |

## 8. 파일·폴더

어드민에만 있는 모양이라 실제 파일 목록대로 적는다.

| 폴더 | 무엇 | 규칙 |
|---|---|---|
| `app/<route>/page.tsx` | 화면 하나 | Next 규약 고정. `export default` 이름이 레지스트리의 `component` 와 같아야 한다 |
| `app/<route>/_components/` | 그 화면(또는 그 섹션) 전용 조각 | PascalCase · 접두어 없음 |
| `app/_components/` | 어드민 전체의 뼈대 | `Admin` 접두어 |
| `components/domain/<entity>/` | 뷰를 가로질러 쓰는 도메인 조각 | 접두어 없음 |
| `lib/data/*.ts` | 시드 어댑터 | 자원 이름의 복수형 (`products.ts` · `orders.ts`) |
| `lib/validation/*-record.ts` | 입력 검증 | `<자원 단수>-record.ts` |
| `lib/navigation/admin-menu.ts` | 사이드바 | 라우트는 레지스트리를 옮겨 적은 것이다 |
| `lib/screen-specs.ts` | 화면별 명세 | `screen` 은 `pages.manifest.ts` 의 `id` |

### 8.1 `lib/data/` — 값을 갖지 않는 어댑터

열네 장 중 열한 장은 **`@winpilot/store` 를 재수출하는 한 줄**이다.

```ts
// lib/data/products.ts
export { PRODUCTS, findProduct, nextProductCode, type ProductRecord } from '@winpilot/store';
```

**어드민과 고객 화면이 각자 시드를 들면 두 화면이 서로 다른 것을 보여 준다.** 어드민에서 상품을
12개 보는데 고객 화면에는 4개인 순간, 어느 쪽이 맞는지 아무도 모른다. 그래서 값은 공유 패키지
한 곳에만 두고, 여기서는 화면이 부를 이름만 만든다.

값을 직접 들고 있는 셋은 `analytics.ts`(통계 시드) · `orders.ts`(판매 시드) ·
`industry.ts`(업태·업종 분류)다. 고객 화면이 쓰지 않는 값이라 공유 패키지에 올릴 이유가 없다.

### 8.2 `lib/validation/*-record.ts` — 검증은 화면 밖에 둔다

열두 장(`banner` · `category` · `company` · `content` · `grade` · `inquiry` · `member` · `policy` ·
`product` · `seo` · `supplier` · `user-auth`). 메시지 상수와 필드별 검사 함수만 들어 있고 React 를
쓰지 않는다.

- **같은 규칙을 두 번 적지 않는다.** `banner-record.ts` 는 링크·날짜 검사를 `content-record.ts`
  에서 가져다 쓴다 — 두 번 적으면 한쪽만 고쳐지는 날이 온다.
- `product-record.ts` 는 `@winpilot/store` 재수출이다 — 상품 검증은 고객 화면도 같은 것을 쓴다.
- `user-auth.ts` 만 이름에 `-record` 가 없다. 검증하는 것이 저장되는 자원이 아니라
  **로그인 입력**이라 그렇다. 어드민 안에만 있고 고객 화면과 공유하지 않는다.

### 8.3 `_components/` 안의 이름 관례

| 관례 | 무엇 | 개수 |
|---|---|---|
| `*ListView.tsx` | 목록 본체 — 툴바·표·선택·쪽 넘김·빈 상태를 다 안는다 | 17 |
| `*Form.tsx` | 별도 화면의 등록·수정 폼 | 7 |
| `*FormModal.tsx` | 목록 안에서 뜨는 등록·수정 창 | 5 |
| `*View.tsx` | 목록이 아닌 화면의 본체 (`SeoSettingsView` · `OrderDetailView`) | 6 |
| `*Modal.tsx` | 한 가지 일만 하는 창 (`TrackingModal` · `ExchangeModal`) | — |
| `*Preview.tsx` · `*MobilePreview.tsx` | 고객 화면에서 어떻게 보이는지 | — |

`page.tsx` 는 껍데기만 두고 본체를 `_components/` 로 내리는 이유: 목록 화면은 전부 클라이언트
상태(검색·필터·선택)를 들고 있어야 하는데, `page.tsx` 를 통째로 `'use client'` 로 만들면
메타데이터와 서버에서 읽는 값이 함께 딸려 내려간다.

## 9. 새 화면 추가 절차

```
1. packages/spec/src/features.ts 에 FeatureSpec 등록
   views: { 'b2c-admin': { route, component: 'AdminXxxYyyPage', status: 'planned' } }
2. pnpm spec:check          → 이름·경로가 규칙에 맞는지 먼저 확인
3. pnpm spec:matrix         → 파생된 이름을 그대로 복사해 구현
4. app/<route>/page.tsx 작성. 화면 전용 조각은 같은 폴더의 _components/ 에 둔다
5. 시드가 필요하면 packages/store 에 넣고 lib/data/ 에서 재수출한다 (§8.1)
6. status: 'implemented' 로 변경
7. apps/b2c-admin/pages.manifest.ts 에 { order, id, name, route } 등록 — 섹션 대역 안의 번호로
8. lib/navigation/admin-menu.ts 에 메뉴 항목 추가
9. lib/screen-specs.ts 에 명세 추가 — missingSpecs() 가 빠진 화면을 알려 준다
10. pnpm spec:check && pnpm sync:check
```

**이름을 먼저 정하고 코드를 쓴다.** 순서가 반대가 되면 이미 쓴 이름을 지키려고 규칙이 휘어진다.
