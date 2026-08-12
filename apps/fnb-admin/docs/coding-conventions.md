# 명명규칙 정의서 — F&B Admin

> SSOT: `packages/spec/src/features-fnb.ts` · `packages/spec/src/glossary-fnb.ts`
> 집행: `pnpm spec:check`(규칙) · `pnpm sync:check`(레지스트리 이름 = 파일 이름)

## 1. 표준 이름의 기준은 어드민이다

**이 도메인(외식 프랜차이즈)의 정규 이름은 콘솔이 부르는 이름으로 정한다.** 우리 쪽이 기준이
되는 까닭은 셋이다.

1. **자원을 만들고 고치는 쪽이 여기다.** 메뉴·가맹점·마케팅 글·배너·FAQ·공지는 전부 이 앱에서
   태어난다. 이름은 자원이 태어나는 자리에서 정해지는 편이 흔들리지 않는다.
2. **이 콘솔의 화면이 사이트에서 거꾸로 짜였다.** 손님이 보는 메뉴판·매장찾기·마케팅·배너,
   차리려는 사람이 보는 창업 문의와 FAQ — 사이트가 읽는 값 중 여기서 못 고치는 것이 거의 없다
   (`features-fnb.ts` 머리말). 두 쪽이 같은 값을 다르게 부르면 `docs/admin-mapping.md` 의
   대응표가 성립하지 않는다.
3. **운영자가 화면에서 쓰는 말과 개발자가 코드에서 쓰는 말이 같아야** 무언가 잘못됐을 때 서로 통한다.

단, **메뉴에 적히는 말과 엔티티 이름은 다를 수 있다.** 엔티티는 자원의 이름이고 메뉴 라벨은
운영자에게 익은 말이다. 둘이 다른 자리는 3장에 전부 적어 둔다 — 숨기면 다음 사람이 메뉴 이름으로
코드를 찾다가 못 찾는다.

## 2. `Fnb` 접두어

`packages/spec/src/types.ts` 가 이 뷰에 준 것은 **컴포넌트 접두어 `Fnb` 하나뿐**이다
(라우트 접두어는 비어 있다 — `docs/path.md` §1). 접두어를 붙이는 자리와 붙이지 않는 자리를 가른다.

| 대상 | 접두어 | 예 |
|---|---|---|
| 페이지 컴포넌트 (레지스트리 파생) | **붙인다** | `FnbMenuCreatePage` · `FnbStoreListPage` |
| 콘솔 전체가 쓰는 뼈대 — `app/_components/` | **붙인다** | `FnbShell` · `FnbRecordForm` · `FnbField` |
| 화면·섹션 전용 조각 — `app/<route>/_components/` | **붙이지 않는다** | `MenuForm` · `StoreListView` · `NoticeForm` |
| 도메인 조각 — `components/domain/<entity>/` | 붙이지 않는다 | *(이 앱에는 아직 없다 — §8)* |

**경계는 "이 조각이 뷰를 가로지르는가" 다.** 페이지 컴포넌트는 사이트에도 같은 기능의 짝이 있어
(`MenuListPage` ↔ `FnbMenuListPage`) 이름만으로 갈라야 하고, `app/_components/` 의 뼈대는
어느 화면에서나 불려 나오는 것이라 이름에 소속을 박아 둔다 — `FnbShell` 하나만 해도 서른세 장이
쓴다(매니페스트의 모든 화면). 반대로 `app/menus/[menuId]/_components/MenuForm` 은 폴더 경로가
이미 어느 화면의 것인지 말하고 있어서, 접두어를 더 붙이면 `FnbMenuForm` 처럼 같은 말을 두 번
하게 된다.

### 2.1 지금 어긋나 있는 자리

규칙을 적어 두는 김에, 실제 파일 중 규칙을 따르지 않는 셋을 적어 둔다.

| 파일 | 규칙대로면 | 비고 |
|---|---|---|
| `app/_components/FaqListView.tsx` · `FaqForm.tsx` | `FnbFaqListView` · `FnbFaqForm` | 창업·고객센터 두 갈래가 나눠 쓰느라 여기 있는데 접두어가 없다 |
| `app/_components/DashboardView.tsx` · `PickChips.tsx` · `OctopusMark.tsx` | `Fnb…` | 위와 같다 |
| `app/settings/admins/_components/AdminForm.tsx` · `AdminListView.tsx` | *(규칙대로다)* | 여기 `Admin` 은 뷰 접두어가 아니라 **메뉴 라벨 '관리자'** 다. 엔티티는 `staff` 이고(§3), 화면 전용이라 접두어를 붙이지 않는 것이 맞다 |
| `app/docs/**` 의 페이지들 | *(규칙 밖)* | `FsdIndexPage` 와, 다른 콘솔에서 문서 화면을 옮겨 오며 딸려 온 `AdminDocsOverviewPage` 류가 섞여 있다 |

`/docs` 아래는 레지스트리에 등록하지 않는 개발 도구라 `spec:check` 가 보지 않는다 —
**검사기가 막지 못하는 자리는 이렇게 손으로 적어 두는 수밖에 없다.**

## 3. 메뉴 이름과 엔티티 이름이 다른 자리

`lib/navigation/fnb-menu.ts` 의 라벨과 `packages/spec/src/glossary-fnb.ts` 의 정규 용어를 대조한
것이다. **코드·라우트·컴포넌트명에 쓰는 것은 언제나 오른쪽(엔티티)이다.**

| 메뉴 라벨 | 엔티티 | 경로 | 왜 다른가 |
|---|---|---|---|
| 대시보드 | `site` | `/` | 화면이 아니라 사이트 자체의 진입면이다 |
| 등록 > **가맹점** | `store` | `/stores` | `shop` · `branch` · `outlet` 은 `store` 의 금지어다 |
| 창업 > **문의 내역** | `inquiry` | `/inquiries` | 사이트의 '창업 상담 신청' 과 같은 기록이다 — 넣는 쪽과 받는 쪽의 이름만 다르다 |
| 창업 > **비용 · 절차** | `franchise` | `/settings/franchise` | 라벨은 항목 둘을 나열하지만 자원은 **가맹 조건 한 벌**이다. 인테리어 값도 이 표 안에 있다 |
| 창업 > FAQ / 고객센터 > FAQ | `faq` | `/franchise/faqs` · `/support/faqs` | **한 자원이 두 화면**이다. `audience` 로만 갈리고, 어느 쪽인지는 Feature ID 앞머리가 남긴다 |
| 배너 > **메인 비주얼** | `banner` | `/banners/main` | 라벨만 길다. 라우트의 `main` 은 §6 아래 참고 |
| 설정 > **브랜드 정보** | `brand` | `/settings/brand` | `identity` · `logo` 는 `brand` 의 금지어다 |
| 설정 > **관리자** | `staff` | `/settings/admins` | `admin` 은 뷰 접두어(`FnbXxxPage`)와 겹쳐 엔티티명으로 쓸 수 없다 |
| *(메뉴에 없음)* 메뉴 묶음 | `category` | `/menus/categories` | 메뉴 화면 안에서 들어간다 — 사이드바에 항목을 하나 더 두지 않았다 |

나머지(메뉴·마케팅·공지사항·팝업)는 라벨과 엔티티가 같다.

> **금지어 검사는 엔티티와 컴포넌트명만 본다.** 그래서 `/banners/main` 처럼 금지어(`main` 은
> `site` 의 금지어다)가 든 라우트가 그대로 남아 있다. 라우트는 운영자 눈에 거의 띄지 않고,
> 검사 범위를 넓히면 매니페스트와 캡처 주소까지 함께 옮겨야 해서 그대로 둔다 —
> **모르고 둔 것이 아니라 알고 둔 것**이다(`features-fnb.ts` 의 배너 절 주석).

## 4. Feature ID

```
<entity>.<action>              menu.create
<domain>.<entity>.<action>     fnb.menu.create   (도메인 분리가 필요할 때만)
```

- 소문자 · 점 구분만 — `ID_FORMAT`
- 끝은 반드시 `action` 과 일치 — `ID_ACTION_MISMATCH`
- `entity` 가 ID 에 포함되어야 함 — `ID_ENTITY_MISMATCH`
- **`admin` 은 ID 에 들어가지 않는다.** `admin.menu.create` 는 금지 — 뷰가 ID 에 섞이면 같은
  기능이 두 개의 ID 를 갖게 되어 ID 의 존재 이유가 사라진다. 콘솔 화면인지는 `views['fnb-admin']`
  바인딩이 있는지로 안다.

**이 제품의 ID 는 전부 `fnb.` 로 시작한다.** 공지·FAQ·배너·팝업·관리자는 B2C 에도 같은 이름으로
있는데, Feature ID 는 전 제품을 가로지르는 유일한 식별자라 그대로 쓰면 부딪힌다. 그래서 도메인 한
마디를 앞에 붙여 **어느 제품의 공지인지**를 ID 에 남긴다(`fnb.notice.list`). 같은 자원을 제품마다
다른 엔티티 이름으로 부르는 것이 아니라 — 그건 사전이 막으려는 표류다 — **앞머리만** 붙인다.

### 표준 동작 어휘 (닫힌 집합)

`home · library · list · detail · create · edit · delete · search · import · export · settings ·
dashboard · auth · signup · result`

이 목록 밖은 쓸 수 없다 (`ACTION_UNKNOWN`). 콘솔 메뉴에 '등록' 이라 적혀 있어도 동작 이름은
`create` 다 — `create`/`add`/`new`/`register` 가 화면마다 다르게 쓰이는 것이 싱크가 깨지는 첫 번째
원인이라 어휘를 먼저 닫는다. 새 동작이 정말 필요하면 `packages/spec/src/types.ts` 의 `ACTIONS` 에 추가한다.

이 콘솔에서 실제로 쓰는 것은 여섯이다 — `dashboard` · `list` · `detail` · `create` · `settings`,
그리고 사이트 쪽의 `home`. `edit` 이 없는 것은 **상세가 곧 수정 화면**이기 때문이다.

## 5. 파생 규칙

Feature ID 하나에서 나오는 콘솔 쪽 이름들. `pnpm spec:matrix` 가 실제 값으로 출력한다.

| 대상 | 값 | 검사 |
|---|---|---|
| 라우트 | `/menus/new` | `ROUTE_PREFIX` · `ROUTE_SEGMENT` · `ROUTE_TAIL` |
| 페이지 컴포넌트 | `FnbMenuCreatePage` | `COMPONENT_NAME` |
| 파일 | `app/menus/new/page.tsx` | `sync:check` |
| Figma 페이지 | `pages.manifest.ts` 의 `order` · `name` | `MANIFEST_MISSING` |

**사이트와 다른 것은 접두어 한 마디뿐이다.** `MenuListPage` 를 검색하면 `FnbMenuListPage` 가
나란히 잡혀야 한다 — `FnbMenuRegisterForm` 처럼 구조를 바꾸면 그 연결이 끊어지고, 한쪽만 고쳐
두 화면이 어긋나도 아무도 모른다.

주소까지 같아야 하는 것은 아니다. 사이트는 복수형을 쓰지 않아 `/menu` 이고 콘솔은 `/menus` 다
(`docs/path.md` §4). **이름은 붙여 두고 주소는 각자의 규칙을 따르게 두는 것**이 이 규칙의 뜻이다.

## 6. 금지어

전체 목록은 `glossary.ts` 와 `glossary-fnb.ts` 다. 이 콘솔에서 특히 자주 끼어드는 넷만 적는다.

| 정규 용어 | 한글 | 금지어 |
|---|---|---|
| `menu` | 메뉴 | `dish` · `food` · `recipe` · `lineup` |
| `store` | 가맹점 | `shop` · `branch` · `outlet` |
| `brand` | 브랜드 | `identity` · `logo` |
| `marketing` | 마케팅 | `campaign` · `promotion` · `sns` |

- 금지어가 Feature ID·엔티티·컴포넌트명에 나타나면 오류 (`TERM_BANNED`). 검사기는
  PascalCase/camelCase/kebab-case 를 단어 단위로 분해해 찾는다 — `FnbDishListPage` 안의
  `Dish` 도 잡힌다.
- **`menuItem` 으로 쓸 수 없다.** 분해하면 `item` 이 나오고 그것은 `product` 의 금지어다.
  한 낱말 `menu` 로 쓴다.
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

`VIEW_PARTIAL` 이 이 한 쌍에서 가장 자주 뜬다. 짝이 한쪽뿐인 기능이 스물 남짓인데, 이유는 두
갈래다 — 콘솔에만 있는 것(등록·상세 폼, 배너·팝업처럼 사이트에서는 결과만 보이는 것)과,
사이트에만 있는 것(약관·인테리어처럼 아직 고칠 자리가 없는 것). 어느 쪽이든
`singleViewByDesign` 옆에 왜인지를 함께 적는다. **적어 두지 않으면 다음 사람이 경고를 지우려고
없는 화면을 만든다.**

## 8. 파일·폴더

콘솔에만 있는 모양이라 실제 파일 목록대로 적는다.

| 폴더 | 무엇 | 규칙 |
|---|---|---|
| `app/<route>/page.tsx` | 화면 하나 | Next 규약 고정. `export default` 이름이 레지스트리의 `component` 와 같아야 한다 |
| `app/<route>/_components/` | 그 화면(또는 그 갈래) 전용 조각 | PascalCase · 접두어 없음 |
| `app/_components/` | 콘솔 전체의 뼈대 | `Fnb` 접두어 |
| `lib/navigation/fnb-menu.ts` | 사이드바 | 라우트는 레지스트리를 옮겨 적은 것이다 |
| `lib/metadata.ts` | 탭 제목 | `adminTitle('등록', '메뉴', '새 메뉴')` — 꼬리를 화면마다 적지 않는다 |
| `lib/screen-specs.ts` | 화면별 명세 | `screen` 은 `pages.manifest.ts` 의 `id` |
| `lib/docs-nav.ts` · `flow-specs.ts` · `ia-groups.ts` | `/docs` 화면이 읽는 목록 | 레지스트리 밖 |

### 8.1 `lib/data/` 가 없다

다른 콘솔에는 시드 어댑터 폴더가 있는데 여기에는 없다. **화면이 `@winpilot/store` 를 바로
읽는다.**

```tsx
// app/menus/_components/MenuListView.tsx
import { MENU_CATEGORIES, MENU_ITEMS, formatPrice } from '@winpilot/store';
```

한 겹을 두지 않은 이유는 이 앱이 **재수출 말고 할 일이 없기 때문**이다. 값을 앱에서 손볼 자리가
생기면 그때 폴더를 만든다 — 지금 만들어 두면 열몇 장이 전부 한 줄짜리 파일이 되고, 그 한 줄은
읽는 사람에게 아무것도 알려 주지 않는다.

바뀌지 않는 것은 그 앞의 규칙이다. **콘솔과 사이트가 각자 시드를 들면 두 화면이 서로 다른 것을
보여 준다.** 콘솔에서 메뉴를 12가지 보는데 사이트에는 4가지인 순간, 어느 쪽이 맞는지 아무도
모른다. 그래서 값은 `packages/store/src/fnb.ts` 한 곳에만 둔다.

### 8.1.1 시드는 색을 모른다

상태 색 표(`*_TONE`)는 시드가 아니라 **그 상태를 그리는 목록 파일**에 있다 —
`STATE_TONE` 은 `app/banners/_components/BannerListView.tsx` · `app/stores/_components/StoreListView.tsx`,
`INQUIRY_TONE` 은 `app/inquiries/_components/InquiryListView.tsx`, `ROLE_TONE` 은
`app/settings/admins/_components/AdminListView.tsx` 에 있다.

값은 Tailwind 클래스가 아니라 `BadgeTone`(`'ok'` · `'wait'` · `'neutral'` · …)이다. 클래스
문자열을 여기 담으면 두 가지가 깨진다 — 시드가 화면을 알게 되고(서버에서 값을 받는 날 그
문자열은 갈 곳이 없다), 타입이 `string` 이라 `dark:` 접두어를 빠뜨려도 컴파일이 통과한다.

### 8.2 검증은 폼 안에 둔다

`lib/validation/` 도 없다. 이 콘솔의 검사는 `FnbRecordForm` 의 `validate` 인자로 들어간다 —
폼마다 자기 칸의 규칙을 함수 하나로 넘기고, 저장을 막는 판단은 뼈대가 한 곳에서 한다.

- **같은 규칙을 두 번 적지 않는다.** 배너와 팝업의 기간 검사는 `app/banners/_components/PeriodFields.tsx`
  한 곳에 있다 — 두 번 적으면 한쪽만 고쳐지는 날이 온다.
- 검사를 화면 밖 파일로 내리는 것은 **두 화면 이상이 같은 규칙을 쓸 때**다. 지금은 기간 하나뿐이라
  폴더를 만들 근거가 없다.

### 8.3 `_components/` 안의 이름 관례

| 관례 | 무엇 | 개수 |
|---|---|---|
| `*ListView.tsx` | 목록 본체 — 툴바·표·거르개·빈 상태를 다 안는다 | 9 |
| `*Form.tsx` | 등록·수정 폼 한 벌 (등록 화면과 상세 화면이 같은 것을 쓴다) | 8 |
| `*View.tsx` | 목록이 아닌 화면의 본체 (`DashboardView` · `InquiryDetailView` · `BrandSettingsView`) | 3 |
| `*Fields.tsx` · `*Chips.tsx` | 폼 안에서 여러 화면이 나눠 쓰는 칸 묶음 (`PeriodFields` · `PickChips`) | 2 |
| `*FormModal.tsx` | — | **없다.** 이 콘솔의 모달은 저장·삭제 확인 하나뿐이다 (`ConfirmModal`) |

`page.tsx` 는 껍데기만 두고 본체를 `_components/` 로 내리는 이유: 목록 화면은 전부 클라이언트
상태(검색·거르개·정렬)를 들고 있어야 하는데, `page.tsx` 를 통째로 `'use client'` 로 만들면
메타데이터와 `generateStaticParams` 가 함께 딸려 내려간다.

## 9. 새 화면 추가 절차

```
1. packages/spec/src/features-fnb.ts 에 FeatureSpec 등록
   id 는 fnb. 로 시작한다 (§4)
   views: { 'fnb-admin': { route, component: 'FnbXxxYyyPage', status: 'planned' } }
   새 자원이면 packages/spec/src/glossary-fnb.ts 에 정규 용어를 먼저 넣는다
2. pnpm spec:check          → 이름·경로가 규칙에 맞는지 먼저 확인
3. pnpm spec:matrix         → 파생된 이름을 그대로 복사해 구현
4. app/<route>/page.tsx 작성. 화면 전용 조각은 같은 폴더의 _components/ 에 둔다
5. 값이 필요하면 packages/store/src/fnb.ts 에 넣는다 (§8.1)
6. status: 'implemented' 로 변경
7. apps/fnb-admin/pages.manifest.ts 에 { order, id, name, route } 등록 — 섹션 대역 안의 번호로
8. lib/navigation/fnb-menu.ts 에 메뉴 항목 추가
9. lib/screen-specs.ts 에 명세 추가 — missingSpecs() 가 빠진 화면을 알려 준다
10. pnpm spec:check && pnpm sync:check
```

**이름을 먼저 정하고 코드를 쓴다.** 순서가 반대가 되면 이미 쓴 이름을 지키려고 규칙이 휘어진다.
