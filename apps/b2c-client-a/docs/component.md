# 5. 컴포넌트 정의서

> 생성물: `artifacts/components.json` (L1 컴포넌트 레지스트리)
> 관련: `docs/architecture/design-sync-ssot.md` §L1

## 5.1 계층

| 계층 | 정의 | 위치 | 뷰 공유 |
|---|---|---|---|
| **Primitive** | 토큰만으로 구성. 도메인 지식 없음 | `components/ui/` | 항상 공유 |
| **Composite** | Primitive 조합. 여전히 도메인 무관 | `components/ui/` | 항상 공유 |
| **Domain** | 특정 엔티티를 안다 | `components/domain/<entity>/` | 가능하면 공유 |
| **Section** | 페이지의 한 구획 | `app/**/_components/` | 뷰 전용 |
| **Page** | 라우트의 최상위 | `app/**/page.tsx` | 뷰 전용 |

예: `Button`(Primitive) → `FormField`(Composite) → `ProductPriceInput`(Domain) → `ProductCreateForm`(Section) → `ProductCreatePage`(Page)

## 5.2 뷰 공유 판단 기준

두 뷰가 같은 컴포넌트를 쓸지 나눌지는 **취향이 아니라 규칙**으로 정한다.

```
공유한다  ← 시각적 차이가 토큰/variant 로 표현 가능하고, 도메인 규칙이 같다
나눈다    ← 데이터 형태가 다르거나, 권한에 따라 렌더 대상이 달라진다
```

| 상황 | 판단 |
|---|---|
| Admin 만 삭제 버튼이 보임 | **공유** — `canDelete` prop 으로 |
| Admin 은 테이블, Client 는 카드 | **분리** — `ProductTable` / `ProductCardList` |
| 색·여백만 다름 | **공유** — variant 로 |
| Admin 은 원가 표시, Client 는 판매가만 | **분리** — 원가가 Client 번들에 들어가면 안 됨 |

> 마지막 항목이 중요하다. 시각적으로 감추는 것(`hidden`)은 분리가 아니다.
> Client 가 보면 안 되는 데이터는 **컴포넌트와 데이터 요청 자체를 분리**한다.

## 5.3 명명

`docs/coding-conventions.md` §7 을 따른다.

| 종류 | 규칙 | 예 |
|---|---|---|
| Page | `{Admin?}{Entity}{Action}Page` | `AdminProductCreatePage` |
| Section | `{Entity}{Action}{역할}` | `ProductCreateForm` |
| Domain | `{Entity}{명사}` | `ProductPriceInput` |
| Primitive/Composite | 역할 명사 | `Button`, `FormField` |

- Page 컴포넌트명은 `pnpm spec:check` 가 강제한다 (`COMPONENT_NAME`).
- 용어 사전 금지어는 모든 계층에서 차단된다 (`TERM_BANNED`).

## 5.4 props 규약

| 규칙 | 내용 |
|---|---|
| 불리언은 긍정형 | `disabled` (O) / `notEnabled` (X) |
| 이벤트는 `on<Event>` | `onSubmit`, `onSelect` |
| 렌더 위임은 `render<Slot>` 또는 children | |
| variant 는 문자열 유니온 | `variant?: 'primary' \| 'secondary' \| 'ghost'` |
| 크기는 `size` | `size?: 'sm' \| 'md' \| 'lg'` |
| `className` 통과 허용 | Primitive/Composite 만. Domain 이상은 금지 |
| 스타일 prop 금지 | `color`, `padding` 등 raw 스타일 prop 없음 — 토큰으로만 |

`className` 을 Domain 이상에서 막는 이유: 외부에서 임의 클래스가 주입되면
그 컴포넌트의 렌더 결과가 호출 지점마다 달라지고, 컴포넌트 단위 Figma 매핑이 성립하지 않는다.

## 5.5 `data-ssot-cid` 주입

UIR 노드가 "어느 컴포넌트의 것인지" 알려면 DOM 에 표식이 필요하다.

| 계층 | 주입 대상 | 값 |
|---|---|---|
| Page | 최상위 요소 | `client/product.create` (뷰/Feature ID) |
| Section | 최상위 요소 | `client/product.create#ProductCreateForm` |
| Domain | 최상위 요소 | `ProductPriceInput` |
| Primitive/Composite | 주입 안 함 | 노드 수 폭증 방지 |

- variant 는 `data-ssot-variant` 에 직렬화한다 (`{"variant":"primary","size":"md"}`).
- 주입은 SWC/Babel 플러그인이 빌드 시 수행한다 — 손으로 붙이지 않는다 (Phase 2).
- 이 속성은 **레이아웃에 영향이 없다**. 프로덕션 번들에서도 유지한다 (추출 대상이므로).

`cid` 가 있으면 픽셀 diff 리포트가 "어느 뷰의 어느 기능의 어느 섹션"까지 지목한다.

## 5.6 컴포넌트 정의 항목

새 컴포넌트를 추가할 때 아래를 채운다. `artifacts/components.json` 이 이 형태로 생성된다.

```jsonc
{
  "name": "ProductCreateForm",
  "layer": "section",
  "views": ["client", "admin"],
  "feature": "product.create",
  "props": [
    { "name": "mode", "type": "'create' | 'edit'", "required": true },
    { "name": "canPublish", "type": "boolean", "required": false, "default": false }
  ],
  "variants": { "density": ["comfortable", "compact"] },
  "states": ["default", "submitting", "error", "disabled"],
  "a11y": { "role": "form", "labelledBy": "product-create-title" },
  "tokens": ["--color-surface-raised", "--color-border", "--radius-lg"]
}
```

| 항목 | 필수 | 비고 |
|---|---|---|
| `name` | ✅ | §5.3 규칙 |
| `layer` | ✅ | §5.1 |
| `views` | ✅ | 공유 여부가 여기서 드러난다 |
| `feature` | Section/Page 만 | Feature ID |
| `props` | ✅ | 타입 문자열 그대로 |
| `variants` | | Figma ComponentSet 으로 매핑됨 |
| `states` | ✅ | **상태별 캡처 대상**이 된다 |
| `a11y` | ✅ | `docs/NFS/accessibility/` 참조 |
| `tokens` | | 사용 토큰 — 하드코딩 감시용 |

## 5.7 상태(states)와 디자인 싱크

`states` 는 장식이 아니라 **캡처 범위**다. 현재 추출기는 기본 상태만 캡처하므로,
`submitting` / `error` 같은 상태는 Figma 에 존재하지 않는다.

Phase 6 확장에서 `pages.manifest.ts` 에 상태 시나리오를 추가해 대응한다.

```ts
{ order: 3, id: 'product-create', name: 'Product Create', route: '/products/new',
  states: ['default', 'error'] }   // → Figma 프레임 2개
```

그 전까지는 **정의서에 상태를 적되 싱크 대상이 아님을 인지**한다. 적어두지 않으면 나중에 빠진다.

## 5.8 금지 사항

- 인라인 `style` 속성 (추출은 되지만 토큰 추적이 끊긴다)
- raw hex / raw px — 토큰만 사용
- 동일 역할의 컴포넌트를 뷰별로 복제 (`Button` / `AdminButton`)
- 조건부 렌더로 감춘 민감 데이터 (§5.2)
