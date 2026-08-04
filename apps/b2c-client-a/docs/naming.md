# 명명규칙 정의서 — B2C 도메인

> SSOT: `packages/spec/src/features.ts` · `packages/spec/src/glossary.ts`
> 집행: `pnpm spec:check`(규칙) · `pnpm sync:check`(레지스트리 이름 = 파일 이름)

## 1. 배경

같은 것을 **도메인마다 다르게 부른다.**

| 무엇 | 커머스 | 유통·물류 | SaaS | 사내 시스템 |
|---|---|---|---|---|
| 파는 것 | Product | Item · SKU | Plan | 자산 |
| 파는 일 | Order | Sales · 출고 | Subscription | 신청 |
| 사는 사람 | User · Customer | 거래처 | Account · Tenant | 신청인 |
| 파는 곳 | Shop · Store | 센터 | Workspace | 부서 |

한 회사 안에서도 기획서는 '판매', 화면은 '주문', 코드는 `Sales`, 테스트는 `order` 를 쓰는 일이
흔하다. 그러면 **같은 기능을 이어 줄 공통 식별자가 하나도 없다.**

```
고객 화면:  /products/new        ProductCreatePage      data-testid="product-new"
어드민:     /item/register       AdminItemRegisterForm   data-testid="regBtn"
```

디자인 싱크 리포트가 차이를 찾아도 "이게 어느 기능의 어느 화면인지" 를 사람이 추측해야 하고,
기능 하나를 고칠 때 다른 화면을 빠뜨렸는지 기계가 알 수 없다.

## 2. 목적

**이름을 도메인마다 새로 정하지 않고 한 곳에서 관리한다.**

- 이름의 뿌리는 **Feature ID** 하나다. 라우트·컴포넌트명·i18n 키·테스트 ID·Figma 프레임명이
  전부 여기서 파생된다.
- 새 도메인이 생기면 **용어 사전(`glossary.ts`)만 갈아 끼운다.** 규칙과 검사기는 그대로 쓴다.
- 규칙은 문서로만 두지 않는다. `pnpm spec:check` 가 막지 못하는 규칙은 규칙이 아니다.

## 3. 지금 도메인 — B2C

**이 저장소의 현재 도메인은 B2C 커머스다.** 이 도메인의 표준 이름은 **어드민 화면이 부르는
이름을 기준으로 삼는다.**

왜 어드민 기준인가.

1. 자원을 **만들고 고치는 쪽**이 어드민이다. 이름은 자원이 태어나는 자리에서 정해지는 편이 흔들리지 않는다.
2. 고객 화면은 템플릿 A~F 로 여섯 벌이지만 어드민은 하나다. 여섯 쪽이 각자 이름을 정하면
   같은 값이 여섯 이름을 갖는다.
3. 운영자가 화면에서 쓰는 말과 개발자가 코드에서 쓰는 말이 같아야 장애 상황에서 서로 통한다.

단, **화면에 적히는 말과 엔티티 이름은 다를 수 있다.** 엔티티는 자원의 이름이고, 화면 문구는
그 화면의 사용자에게 맞춘 말이다. 둘이 다를 때는 아래 표에 적어 둔다 — 숨기지 않는다.

### 3.1 B2C 표준 이름표

| 엔티티 | 어드민 메뉴 | 고객 화면 | 비고 |
|---|---|---|---|
| `product` | 상품 | 상품 | |
| `category` | 상품 > 카테고리 | 카테고리 | 1Depth·2Depth |
| `order` | **판매** | **주문** | 같은 자원. 주문번호가 양쪽에서 같다 |
| `cart` | *(없음)* | 장바구니 | 고객만 담는다 |
| `coupon` | *(화면 예정)* | 쿠폰함 | 값은 이미 store 에 있다 |
| `user` | 사용자 | 마이페이지 | 운영자는 남의 것을, 고객은 자기 것을 본다 |
| `grade` | 사용자 > 등급 | 등급 | 누적 결제금액으로 자동 산정 |
| `staff` | 관리자 | *(없음)* | 운영 전용 |
| `inquiry` | 문의 | 문의하기 · 문의 내역 | 같은 기록 |
| `notice` | 콘텐츠 > 공지사항 | 공지사항 | |
| `faq` | 콘텐츠 > FAQ | FAQ | |
| `news` | 콘텐츠 > 뉴스 | 뉴스 | 어드민은 요약·원문 링크만 관리 |
| `portfolio` | 콘텐츠 > 포트폴리오 | 포트폴리오 | |
| `banner` | 배너 > 메인 비주얼 | 히어로 | |
| `profile` | 회사 > 회사 소개 | 회사소개 | 단일 자원 |
| `milestone` | 회사 > 연혁 | 연혁 | |
| `supplier` | 설정 > 공급자 정보 | 푸터·회사 소개의 사업자 정보 | |
| `terms` · `privacy` | 설정 > 약관 정보 | 이용약관 · 개인정보 처리방침 | |
| `analytics` · `pageview` · `revenue` | 통계 | *(없음)* | 운영 전용 |
| `tenant` · `invoice` | *(사내 어드민)* | *(없음)* | 고객사·청구 |
| `status` | 처리 결과 | 완료 · 실패 | 세 앱이 한 컴포넌트 |

이 표가 곧 `packages/spec/src/glossary.ts` 다. 표를 고치면 사전을 고치고, 사전을 고치면
`pnpm spec:check` 가 어긋난 이름을 찾아 준다.

### 3.2 다른 도메인으로 갈 때

B2B·물류처럼 도메인이 바뀌면 **이 문서의 3장과 `glossary.ts` 만 새로 쓴다.**
Feature ID 문법(4장)·파생 규칙(5장)·검사 코드(8장)는 도메인과 무관하다.

## 4. Feature ID

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

## 5. 파생 규칙

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

## 6. 용어 사전 (Ubiquitous Language)

싱크가 깨지는 원인은 레이아웃이 아니라 **단어**다. 정규 용어만 엔티티·컴포넌트·라우트에 쓸 수 있다.
전체 목록은 3.1 의 표이고, 아래는 금지어가 특히 자주 끼어드는 셋이다.

| 정규 용어 | 한글 | 금지어 | 비고 |
|---|---|---|---|
| `product` | 상품 | `item`, `goods`, `merchandise`, `article`, `sku` | 어드민에서도 `product` |
| `user` | 사용자 | `member`, `client`, `customer`, `account` | `client` 는 뷰 이름과 부딪혀 엔티티명으로 못 쓴다 |
| `order` | 주문 | `sale`, `purchase`, `transaction`, `deal` | 어드민 메뉴는 '판매' 지만 엔티티는 `order` |

- 금지어가 Feature ID·엔티티·컴포넌트명에 나타나면 오류 (`TERM_BANNED`).
  검사기는 PascalCase/camelCase/kebab-case 를 단어 단위로 분해해 찾는다 —
  `AdminItemRegisterPage` 안의 `Item` 도 잡힌다.
- 사전에 없는 새 용어는 경고 (`TERM_UNREGISTERED`). 등록 후 사용한다.

## 7. 파일·폴더

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

## 7.1 디자인 토큰

| 대상 | 규칙 | 예 |
|---|---|---|
| 시맨틱 토큰 | 역할 기반 | `--color-canvas`, `--color-ink-muted` |
| 팔레트 토큰 | `<이름>-<단계>` | `--color-brand-500` |
| 컴포넌트 하드코딩 | **금지** — raw hex 사용 불가 | `#3b5bfd` (X) → `bg-brand-500` (O) |

자세한 내용은 [6. 디자인 시스템](06-design-system.md).

## 8. 검사 코드 목록

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

## 9. 새 기능 추가 절차

```
1. packages/spec/src/features.ts 에 FeatureSpec 등록  (status: 'planned')
2. pnpm spec:check                                    → 이름이 규칙에 맞는지 먼저 확인
3. pnpm spec:matrix                                   → 파생된 이름들을 그대로 복사해 구현
4. 구현 후 status: 'implemented' 로 변경
5. apps/web/pages.manifest.ts 에 { order, id, name, route } 등록
6. pnpm spec:check && pnpm ssot:extract && pnpm ssot:verify
```

**이름을 먼저 정하고 코드를 쓴다.** 순서가 반대가 되면 이미 쓴 이름을 지키려고 규칙이 휘어진다.
