# 5. 컴포넌트 정의서

> 생성물: `artifacts/components.json` (L1 컴포넌트 레지스트리)
> 관련: `docs/architecture/design-sync-ssot.md` §L1

## 5.1 계층

| 계층 | 정의 | 위치 | 뷰 공유 |
|---|---|---|---|
| **Primitive** | 토큰만으로 구성. 도메인 지식 없음 | `@winpilot/ui` | 항상 공유 |
| **Composite** | Primitive 조합. 여전히 도메인 무관 | `@winpilot/ui` | 항상 공유 |
| **Domain** | 특정 엔티티를 안다 | `app/_components/` | 가능하면 공유 |
| **Section** | 페이지의 한 구획 | `app/**/_components/` | 뷰 전용 |
| **Page** | 라우트의 최상위 | `app/**/page.tsx` | 뷰 전용 |

예: `Button`(Primitive) → `Field`(Composite) → `MenuCard`(Domain) → `MenuBoard`(Section) → `MenuListPage`(Page)

**이 앱에는 `components/` 폴더가 없다.** 도메인을 모르는 원시 요소는 앱이 갖지 않고
`@winpilot/ui` 한 곳에 둔다 — 뷰 하나가 곧 레포 하나이므로 앱 안에 복사해 두면 레포를 나누는
순간 두 벌이 되어 어긋난다. 자원을 아는 조각(`MenuCard` · `SpicyMark` · `StoreFinder`)은
`app/_components/` 와 그 갈래의 `_components/` 에 나뉘어 있고, 가르는 기준은 **한 갈래 안에서만
도는가**다.

## 5.2 뷰 공유 판단 기준

두 뷰가 같은 컴포넌트를 쓸지 나눌지는 **취향이 아니라 규칙**으로 정한다.

```
공유한다  ← 시각적 차이가 토큰/variant 로 표현 가능하고, 도메인 규칙이 같다
나눈다    ← 데이터 형태가 다르거나, 권한에 따라 렌더 대상이 달라진다
```

| 상황 | 판단 |
|---|---|
| 콘솔에만 삭제 버튼이 보임 | **공유** — `canDelete` prop 으로 |
| 콘솔은 표, 사이트는 카드 | **분리** — `RecordTable` / `MenuCard` |
| 색·여백만 다름 | **공유** — variant 로 |
| 콘솔은 신청자 전화번호를 보고, 사이트는 신청 폼만 있음 | **분리** — 전화번호가 사이트 번들에 들어가면 안 됨 |

> 마지막 항목이 중요하다. 시각적으로 감추는 것(`hidden`)은 분리가 아니다.
> 손님이 보면 안 되는 데이터는 **컴포넌트와 데이터 요청 자체를 분리**한다.
> 창업 상담이 그 자리다 — 사이트는 `FranchiseApplyForm` 으로 **넣기만** 하고,
> 들어온 기록(이름 · 전화 · 예산 · 상담 상태)을 그리는 화면은 콘솔에만 있다.

**규칙으로도 답이 안 나오는 자리가 하나 있다.** `OctopusMark` 는 사이트와 콘솔이 같은 것을
쓰기로 정했는데, 특정 브랜드의 그림이라 도메인을 모르는 자리(`@winpilot/ui`)에 올릴 수 없다.
그래서 두 벌로 두고 **사라질 조건**을 주석에 적었다 — 로고 원본 파일을 받는 날 `mark` 를 넘기던
두 줄만 지우면 둘 다 없어진다.

## 5.3 명명

`docs/coding-conventions.md` §5·§7 을 따른다.

| 종류 | 규칙 | 예 |
|---|---|---|
| Page | `{Fnb?}{Entity}{Action}Page` | `MenuListPage` · `FnbMenuListPage` |
| Section | `{Entity}{역할}` | `MenuBoard` · `StoreFinder` · `FranchiseApplyForm` |
| Domain | `{Entity}{명사}` | `MenuCard` · `SpicyMark` |
| Primitive/Composite | 역할 명사 | `Button`, `Field` |

- Page 컴포넌트명은 `pnpm spec:check` 가 강제한다 (`COMPONENT_NAME`).
- 용어 사전 금지어는 모든 계층에서 차단된다 (`TERM_BANNED`) — `DishCard` 는 걸린다.
- 사이트에는 접두어가 없다. 붙는 것은 콘솔뿐이고, 그래서 `MenuListPage` 를 검색하면
  `FnbMenuListPage` 가 나란히 잡힌다.

## 5.4 props 규약

| 규칙 | 내용 |
|---|---|
| 불리언은 긍정형 | `disabled` (O) / `notEnabled` (X) |
| 이벤트는 `on<Event>` | `onSelect`, `onChange` |
| 렌더 위임은 `render<Slot>` 또는 children | |
| variant 는 문자열 유니온 | `tone?: 'primary' \| 'secondary' \| 'danger'` |
| 크기는 `size` | `size?: 'sm' \| 'md'` |
| `className` 통과 허용 | Primitive/Composite 만. Domain 이상은 금지 |
| 스타일 prop 금지 | `color`, `padding` 등 raw 스타일 prop 없음 — 토큰으로만 |

`className` 을 Domain 이상에서 막는 이유: 외부에서 임의 클래스가 주입되면
그 컴포넌트의 렌더 결과가 호출 지점마다 달라지고, 컴포넌트 단위 Figma 매핑이 성립하지 않는다.

예외는 `currentColor` 로 그리는 마크들(`OctopusMark` · `SpicyMark`)이다. 색과 크기를 부르는
쪽이 정하도록 `className` 을 받는데, 값으로 박아 두면 **어두운 판과 밝은 판에 각각 한 벌씩**
필요해진다. 받는 것이 자리(색 · 크기)뿐이고 구조가 아니라 렌더 결과가 갈리지 않는다.

## 5.5 `data-ssot-cid` 주입

UIR 노드가 "어느 컴포넌트의 것인지" 알려면 DOM 에 표식이 필요하다.

| 계층 | 주입 대상 | 값 |
|---|---|---|
| Page | 최상위 요소 | `fnb-client/fnb.menu.list` (뷰/Feature ID) |
| Section | 최상위 요소 | `fnb-client/fnb.menu.list#MenuBoard` |
| Domain | 최상위 요소 | `MenuCard` |
| Primitive/Composite | 주입 안 함 | 노드 수 폭증 방지 |

- 값은 `packages/spec/src/naming.ts` 의 `cid(view, featureId)` 가 만든다. 손으로 조립하지 않는다.
- variant 는 `data-ssot-variant` 에 직렬화한다 (`{"tone":"primary","size":"md"}`).
- 주입은 SWC/Babel 플러그인이 빌드 시 수행한다 — 손으로 붙이지 않는다 (Phase 2).
- 이 속성은 **레이아웃에 영향이 없다**. 프로덕션 번들에서도 유지한다 (추출 대상이므로).

`cid` 가 있으면 픽셀 diff 리포트가 "어느 뷰의 어느 기능의 어느 섹션"까지 지목한다.

> **이 앱에는 아직 하나도 붙어 있지 않다.** 규칙을 먼저 적어 두는 이유는, 나중에 붙일 때
> 화면마다 다른 모양으로 붙는 것을 막기 위해서다 — 표식이 제각각이면 있으나 마나다.

## 5.6 컴포넌트 정의 항목

새 컴포넌트를 추가할 때 아래를 채운다. `artifacts/components.json` 이 이 형태로 생성된다.

```jsonc
{
  "name": "AsidePicker",
  "layer": "composite",
  "views": ["fnb-client"],
  "props": [
    { "name": "title", "type": "string", "required": false },
    { "name": "choices", "type": "readonly AsideChoice[]", "required": true },
    { "name": "picked", "type": "string", "required": true },
    { "name": "onPick", "type": "(id: string) => void", "required": true },
    { "name": "width", "type": "string", "required": false, "default": "lg:w-44" }
  ],
  "variants": { "layout": ["column", "wrap"] },
  "states": ["default", "picked"],
  "a11y": { "pressed": "aria-pressed" },
  "tokens": ["--color-ink", "--color-surface", "--radius-lg"]
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
`empty` / `error` 같은 상태는 Figma 에 존재하지 않는다.

이 사이트에는 그 차이가 실제로 드러나는 자리가 있다. 매장 찾기(`StoreFinder`)는 지역을 고르면
목록이 비는 상태가 있고, 끝없이 흐르는 줄(`Marquee`)은 **움직임을 끈 사람에게 멈춰 선다**
(`motion-reduce`). 둘 다 캡처에는 한 모습으로만 남는다.

Phase 6 확장에서 `pages.manifest.ts` 에 상태 시나리오를 추가해 대응한다.

```ts
{ order: 20, id: 'menu', name: 'Menu', route: '/menu',
  states: ['default', 'empty'] }   // → Figma 프레임 2개
```

그 전까지는 **정의서에 상태를 적되 싱크 대상이 아님을 인지**한다. 적어두지 않으면 나중에 빠진다.

## 5.8 금지 사항

- 인라인 `style` 속성 (추출은 되지만 토큰 추적이 끊긴다) — 예외는 화면이 애니메이션에 넘기는
  커스텀 프로퍼티 하나뿐이다(`Marquee` 의 `--roll`). 흐르는 시간이 항목 수에 따라 달라져
  클래스로 적을 수 없다
- raw hex / raw px — 토큰만 사용
- 동일 역할의 컴포넌트를 뷰별로 복제 (`Button` / `FnbButton`)
- 조건부 렌더로 감춘 민감 데이터 (§5.2)
