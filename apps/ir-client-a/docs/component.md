# 5. 컴포넌트 정의서

> 생성물: `artifacts/components.json` (L1 컴포넌트 레지스트리)
> 관련: `docs/architecture/design-sync-ssot.md` §L1

**여기 적힌 것은 지금 이 앱에 실제로 있는 것뿐이다.** 있을 법한 컴포넌트를 미리 적지 않는다 —
적어 두면 다음 사람이 찾다가, 없는 것을 누가 지웠다고 생각한다.

## 5.1 계층

| 계층 | 정의 | 위치 | 뷰 공유 |
|---|---|---|---|
| **Primitive** | 토큰만으로 구성. 도메인 지식 없음 | `@winpilot/ui` | 항상 공유 |
| **Composite** | Primitive 조합. 여전히 도메인 무관 | `@winpilot/ui` | 항상 공유 |
| **Domain** | 특정 엔티티를 안다 | `app/_components/` | 가능하면 공유 |
| **Section** | 페이지의 한 구획 | `app/**/_components/` | 뷰 전용 |
| **Page** | 라우트의 최상위 | `app/**/page.tsx` | 뷰 전용 |

예: `Button`(Primitive) → `Field`(Composite) → `SitePopup`(Domain) → `NoticeListView`(Section) → `NoticeListPage`(Page)

`components/ui/` · `components/domain/` 폴더는 **이 앱에 없다.** 도메인을 모르는 원시 요소는
앱이 갖지 않고 `@winpilot/ui` 한 곳에 두었고, 그 위는 전부 `app/**/_components/` 아래에 산다.
폴더 경로가 이미 어느 화면의 것인지 말하고 있어 층을 하나 더 만들 이유가 없었다.

지금 `app/_components/` 에 있는 것은 열둘이다.

| 이름 | 계층 | 하는 일 | 쓰는 화면 |
|---|---|---|---|
| `IrSiteShell` (`IrPageTitle` · `IrRichBody` 를 함께 내보낸다) | Domain | 회사 홈페이지 껍데기 — 가로 상단 내비 · 넓은 본문 · 공시 안내 푸터 | **29장** — `/docs/**` 를 뺀 전부 |
| `SiteHeader` | Domain | 상단 내비. 갈래 넷과, 그 아래로 화면 폭만큼 펼쳐지는 판 | `IrSiteShell` 하나 |
| `SitePopup` | Domain | 사이트 팝업. 걸린 것을 고르는 일은 `liveSitePopups()` 가 하고 여기는 감추기만 한다 | `IrSiteShell` 하나 |
| `IrSubNav` | Domain | IR 화면 아홉 사이를 오가는 가로 줄. 헤더 네 갈래 어디에도 IR 이 없어서 필요하다 | **9장** — 공시 · 재무 · 주가 · 배당 · 총회 · 지배구조 · 자료실 · 일정 · 알림 신청 |
| `IrTable` | Domain | 투자자 화면의 표. 체크박스도 관리 칸도 없다 — 읽는 곳이다 | **7장** — 회사소개 · 재무 · 주가 · 배당 · 지배구조 · 자료실 · 일정 |
| `HomeHero` · `HomeIntro` · `HomeService` · `HomeSolutions` · `HomeMedia` | Section | 첫 화면의 다섯 칸 | `/` 한 장 |
| `IsoMap` (`isoPoint` · `IsoPlatform` · `IsoBox` · `IsoCylinder` · `IsoDisc` · `IsoPolyline` · `IsoPane` · `IsoWalls`) | Primitive | 아이소메트릭 도형의 자와 컴퍼스. 2:1 로 눕힌 좌표계 | `HomeService` · `IsoEquipment` |
| `IsoEquipment` (`ConsultingScene` · `MesScene` · `InfraScene` · `ErpScene` · `DxpScene` · `CrmScene`) | Section | 그 판 위에 서는 장비 여섯. 글자를 얹지 않는다 | `HomeService` 하나 |

첫 화면의 다섯만 자원이 아니라 **자리**로 이름 붙는다(`Home*`). 한 화면 안에서 순서가 곧 뜻이라,
`SolutionListSection` 같은 이름으로는 그것이 홈의 몇 번째 칸인지 알 수 없다.

## 5.2 뷰 공유 판단 기준

두 뷰가 같은 컴포넌트를 쓸지 나눌지는 **취향이 아니라 규칙**으로 정한다.

```
공유한다  ← 시각적 차이가 토큰/variant 로 표현 가능하고, 도메인 규칙이 같다
나눈다    ← 데이터 형태가 다르거나, 권한에 따라 렌더 대상이 달라진다
```

| 상황 | 판단 |
|---|---|
| 상태 뱃지 — 콘솔은 `공시됨`, 사이트는 `정정` | **공유** — `@winpilot/ui` 의 `Badge` 가 색이 아니라 뜻을 받는다 |
| 콘솔은 고르고 지우는 표, 사이트는 읽는 표 | **분리** — `IrRecordTable` / `IrTable`. 여기 표에는 체크박스도 관리 칸도 없다 |
| 색·여백만 다름 | **공유** — variant 로 |
| 콘솔은 나가지 않은 공시까지 보고, 사이트는 나간 것만 본다 | **분리** — 미공개 공시가 이 번들에 들어가면 안 됨 |

> 마지막 항목이 중요하다. 시각적으로 감추는 것(`hidden`)은 분리가 아니다.
> 투자자 화면이 보면 안 되는 것은 **컴포넌트와 데이터 요청 자체를 분리**한다 —
> 이 사이트가 읽는 것은 언제나 `publicDisclosures()` 이고, `작성 중` · `검토 요청` 은
> 그 함수를 넘어오지 못한다. 나가지 않은 공시가 주소로 읽히면 그것이 곧 미공개 정보 유출이다.

## 5.3 명명

`docs/coding-conventions.md` §7 을 따른다.

| 종류 | 규칙 | 예 |
|---|---|---|
| Page | `{Ir?}{Entity}{Action}Page` | `NoticeListPage` · 콘솔의 짝은 `IrNoticeListPage` |
| Section | `{Entity}{Action}{역할}` | `NoticeListView` · `CredentialListView` |
| Domain | `{Entity}{명사}` | `SitePopup` · `IrTable` |
| Primitive/Composite | 역할 명사 | `Button`, `Field` |

- Page 컴포넌트명은 `pnpm spec:check` 가 강제한다 (`COMPONENT_NAME`).
- 용어 사전 금지어는 모든 계층에서 차단된다 (`TERM_BANNED`).
- 이 앱의 조각에는 접두어를 붙이지 않는다. 예외는 **콘솔에도 같은 이름이 설 만한 둘** —
  껍데기(`IrSiteShell`)와 표(`IrTable`) — 뿐이다. `Table` 이라는 이름이 두 앱에 다 있으면
  파일을 열기 전에는 어느 쪽인지 알 수 없다.

## 5.4 props 규약

| 규칙 | 내용 |
|---|---|
| 불리언은 긍정형 | `disabled` (O) / `notEnabled` (X) |
| 이벤트는 `on<Event>` | `onSubmit`, `onSelect` |
| 렌더 위임은 `render<Slot>` 또는 children | |
| variant 는 문자열 유니온 | `tone?: 'primary' \| 'secondary' \| 'danger'` |
| 크기는 `size` | `size?: 'sm' \| 'md'` |
| `className` 통과 허용 | Primitive/Composite 만. Domain 이상은 금지 |
| 스타일 prop 금지 | `color`, `padding` 등 raw 스타일 prop 없음 — 토큰으로만 |

`className` 을 Domain 이상에서 막는 이유: 외부에서 임의 클래스가 주입되면
그 컴포넌트의 렌더 결과가 호출 지점마다 달라지고, 컴포넌트 단위 Figma 매핑이 성립하지 않는다.

`tone` 은 **무엇으로 보일지가 아니라 무엇을 하는지**로 고른다. `Button` 의 셋이 그렇다 —
`primary` 는 이 화면에서 하려던 일, `secondary` 는 그 옆에서 되돌리는 일, `danger` 는 되돌릴
수 없는 일이다. 색 이름(`blue`·`red`)으로 받으면 색을 바꾸는 날 prop 이름이 거짓말이 된다.

## 5.5 `data-ssot-cid` 주입

UIR 노드가 "어느 컴포넌트의 것인지" 알려면 DOM 에 표식이 필요하다.

| 계층 | 주입 대상 | 값 |
|---|---|---|
| Page | 최상위 요소 | `ir-client/ir.notice.list` (뷰/Feature ID) |
| Section | 최상위 요소 | `ir-client/ir.notice.list#NoticeListView` |
| Domain | 최상위 요소 | `IrTable` |
| Primitive/Composite | 주입 안 함 | 노드 수 폭증 방지 |

- variant 는 `data-ssot-variant` 에 직렬화한다 (`{"tone":"primary","size":"md"}`).
- 주입은 SWC/Babel 플러그인이 빌드 시 수행한다 — 손으로 붙이지 않는다 (Phase 2).
- 이 속성은 **레이아웃에 영향이 없다**. 프로덕션 번들에서도 유지한다 (추출 대상이므로).

**이 앱에는 아직 한 자리도 붙어 있지 않다.** 저장소를 통틀어 손으로 적은 것은 콘솔 껍데기의
두 자리(`ir-admin/shell#IrShellSidebar` · `#IrShellSubNav`)뿐이다 — 사이드바와 보조 메뉴가 한
화면에 두 번 나와 자동 주입만으로는 갈리지 않는 자리라 예외로 적어 둔 것이고, 나머지는
플러그인이 붙일 몫이다.

`cid` 가 있으면 픽셀 diff 리포트가 "어느 뷰의 어느 기능의 어느 섹션"까지 지목한다.

## 5.6 컴포넌트 정의 항목

새 컴포넌트를 추가할 때 아래를 채운다. `artifacts/components.json` 이 이 형태로 생성된다.

```jsonc
{
  "name": "SupportBrowser",
  "layer": "section",
  "views": ["ir-client"],
  "feature": "ir.notice.list",
  "props": [
    { "name": "groups", "type": "readonly string[]", "required": true },
    { "name": "searchable", "type": "boolean", "required": false, "default": false }
  ],
  "variants": { "density": ["comfortable", "compact"] },
  "states": ["default", "empty", "filtered"],
  "a11y": { "role": "region", "labelledBy": "support-notices-title" },
  "tokens": ["--color-surface", "--color-border", "--radius-xl"]
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
`empty` / `filtered` 같은 상태는 Figma 에 존재하지 않는다.

Phase 6 확장에서 `pages.manifest.ts` 에 상태 시나리오를 추가해 대응한다.

```ts
{ order: 61, id: 'support-notices', name: 'Notices', route: '/support/notices',
  states: ['default', 'empty'] }   // → Figma 프레임 2개
```

그 전까지는 **정의서에 상태를 적되 싱크 대상이 아님을 인지**한다. 적어두지 않으면 나중에 빠진다.

이 사이트에서 특히 아쉬운 것은 **첫 화면**이다. `HomeHero` 는 장이 셋이고 배경 영상이 장마다
다른데, 캡처는 언제나 첫 장이다 — 나머지 둘은 Figma 에 없다.

## 5.8 금지 사항

- 인라인 `style` 속성 (추출은 되지만 토큰 추적이 끊긴다)
- raw hex / raw px — 토큰만 사용. 예외는 `lib/palette.ts` 하나이고 그 까닭은 `docs/design.md` §6.2 에 있다
- 동일 역할의 컴포넌트를 뷰별로 복제 (`Button` / `IrButton`)
- 조건부 렌더로 감춘 미공개 정보 (§5.2)
