# 명명규칙 정의서 — IR Admin

> SSOT: `packages/spec/src/features-ir.ts` · `packages/spec/src/glossary-ir.ts`
> 집행: `pnpm spec:check`(규칙) · `pnpm sync:check`(레지스트리 이름 = 파일 이름)

## 1. 표준 이름의 기준은 어드민이다

**이 도메인(상장사 IR)의 정규 이름은 이 콘솔이 부르는 이름으로 정한다.** 우리 쪽이 기준이 되는
까닭은 셋이다.

1. **자원을 만들고 고치는 쪽이 여기다.** 제품·서비스·공지·뉴스·FAQ·배너·연혁·특허는 전부 이
   앱에서 태어난다. 이름은 자원이 태어나는 자리에서 정해지는 편이 흔들리지 않는다.
2. **사이트는 여러 벌이 될 수 있지만 어드민은 하나다.** 앱 이름 `ir-client-a` 의 `-a` 가 그
   자리이고, 여러 벌이 각자 이름을 정하면 같은 값이 여러 이름을 갖는다. 한 벌뿐인 쪽이 기준이
   되어야 갈라질 자리가 없다.
3. **운영자가 화면에서 쓰는 말과 개발자가 코드에서 쓰는 말이 같아야** 무언가 잘못됐을 때 서로 통한다.

단, **이 콘솔이 모든 자원의 고향은 아니다.** 공시·재무·주주·자료는 사이트에만 화면이 있고 여기에
고칠 자리가 없다(`lib/navigation/ir-menu.ts` 머리말). 그 자원들의 이름은 사이트 화면이 부르는
말을 그대로 사전에 올려 두었다 — 콘솔에 화면이 없다고 이름까지 비워 두면, 되살리는 날 두 번째
이름이 생긴다.

그리고 **메뉴에 적히는 말과 엔티티 이름은 다를 수 있다.** 엔티티는 자원의 이름이고 메뉴 라벨은
운영자에게 익은 말이다. 둘이 다른 자리는 3장에 전부 적어 둔다 — 숨기면 다음 사람이 메뉴 이름으로
코드를 찾다가 못 찾는다.

## 2. `Ir` 접두어

`packages/spec/src/types.ts` 가 이 뷰에 준 것은 **컴포넌트 접두어 `Ir` 하나뿐**이다
(라우트 접두어는 비어 있다 — `docs/path.md` §1). 접두어를 붙이는 자리와 붙이지 않는 자리를 가른다.

| 대상 | 접두어 | 예 |
|---|---|---|
| 페이지 컴포넌트 (레지스트리 파생) | **붙인다** | `IrNoticeListPage` · `IrProductDetailPage` |
| 어드민 전체가 쓰는 뼈대 — `app/_components/` | **붙인다** | `IrShell` · `IrConfirmModal` · `IrRecordTable` |
| 화면·섹션 전용 조각 — `app/<route>/_components/` | **붙이지 않는다** | `NoticeForm` · `InquiryListView` · `SeoSettingsView` |
| 도메인 조각 — `components/domain/<entity>/` | 붙이지 않는다 | *(이 앱에는 그 폴더가 없다)* |

**경계는 "이 조각이 뷰를 가로지르는가" 다.** 페이지 컴포넌트는 사이트에도 같은 기능의 짝이 있어
(`NoticeListPage` ↔ `IrNoticeListPage`) 이름만으로 갈라야 하고, `app/_components/` 의 뼈대는
어느 화면에서나 불려 나오는 것이라 이름에 소속을 박아 둔다 — `IrShell` 하나만 해도 마흔네 장이
쓴다(문서 화면 `/docs/**` 를 뺀 전부). 반대로 `app/contents/notices/_components/NoticeForm` 은 폴더 경로가
이미 어느 화면의 것인지 말하고 있어서, 접두어를 더 붙이면 `IrNoticeForm` 처럼 같은 말을 두 번
하게 된다.

### 2.1 지금 어긋나 있는 자리

규칙을 적어 두는 김에, 실제 파일 중 규칙을 따르지 않는 넷을 적어 둔다.

| 파일 | 규칙대로면 | 비고 |
|---|---|---|
| `app/_components/DashboardView.tsx` | `IrDashboardView` | 앱 전체가 쓰는 자리인데 접두어가 없다. 실제로 부르는 것은 `/` 한 장뿐이다 |
| `app/_components/KoreaMap.tsx` | `IrKoreaMap` | 같다. `DashboardView` 안에서만 쓴다 |
| `app/_components/OfferingForm.tsx` | `IrOfferingForm` | 제품·서비스·해법 세 상세가 나눠 쓴다 — 여기 있는 것은 맞고 이름만 어긋났다 |
| `app/docs/**` 의 페이지 다섯 | *(규칙 밖)* | `AdminDocsOverviewPage` 등 **B2C 어드민에서 문서 체계를 옮겨 올 때의 이름이 그대로** 남았다 |

앞의 셋은 **한 화면 또는 한 조각만 쓰는 것이 `app/_components/` 에 올라와 있어서** 생긴 자리다.
옮기든 이름을 고치든 하나는 해야 하는데, 옮기면 대시보드 조각이 `app/_components/` 밖으로 나가
`/` 의 라우트 폴더가 생겨야 한다 — 아직 정하지 않았다.

`/docs` 아래는 레지스트리에 등록하지 않는 개발 도구라 `spec:check` 가 보지 않는다 —
**검사기가 막지 못하는 자리는 이렇게 손으로 적어 두는 수밖에 없다.** 다섯 장에 남은 옛 제품
이름이 그 증거다.

## 3. 메뉴 이름과 엔티티 이름이 다른 자리

`lib/navigation/ir-menu.ts` 의 라벨과 용어 사전(`glossary-ir.ts` · `glossary.ts`)의 정규 용어를
대조한 것이다. **코드·라우트·컴포넌트명에 쓰는 것은 언제나 오른쪽(엔티티)이다.**

| 메뉴 라벨 | 엔티티 | 경로 | 왜 다른가 |
|---|---|---|---|
| 대시보드 | `site` | `/` | 화면이 아니라 사이트 자체의 진입면이다 |
| **제품** | `product` | `/products` | 사전의 한글은 '상품' 이지만 이 회사가 파는 것은 클라우드 넷이라 메뉴는 '제품' 이다. 엔티티는 하나로 둔다 |
| *(메뉴 밖)* **문제 · 해법** | `solution` | `/solutions` | 제품 갈래와 **같은 값**을 보는데 이름만 다르다. 사전에 빚으로 올려 두었다 |
| 회사 > **소개** | `profile` | `/company/about` | `about` · `intro` 는 `profile` 의 금지어다 |
| 회사 > **연혁** | `milestone` | `/company/history` | `history` · `timeline` 은 `milestone` 의 금지어다 |
| 회사 > **특허 및 인증** | `credential` | `/company/credentials` | `certification` · `patent` · `award` 가 금지어다. 특허와 인증을 두 자원으로 나누지 않는다 |
| 배너 > **메인 비주얼** | `banner` | `/banners` | `main` 은 `site` 의 금지어라 라우트에도 쓰지 않는다 |
| **통계** | `analytics` | `/statistics` | `stat` · `stats` 는 `analytics` 의 금지어다 |
| 통계 > 기간별 분석 | `analytics` | `/statistics/period` | 같은 자원의 목록이라 엔티티가 같다 (`ir.analytics.list`) |
| 통계 > 많이 방문한 페이지 | `pageview` | `/statistics/pages` | `analytics` 의 상세가 아니라 다른 것의 목록이라 엔티티를 나눴다 |
| 설정 > 서비스 이용약관 | `terms` | `/settings/terms` | 라벨만 길다 |
| 설정 > 개인정보 처리방침 | `privacy` | `/settings/privacy` | 라벨만 길다 |
| 설정 > **국문 · 영문** | `locale` | `/settings/locales` | `language` · `i18n` · `translation` 이 금지어다 |

나머지(문의·공지사항·뉴스·FAQ·서비스·팝업·공급자 정보·SEO)는 라벨과 엔티티가 같다.

> **금지어 검사는 엔티티와 컴포넌트명만 본다.** 그래서 `/company/history` · `/statistics` 처럼
> 금지어가 든 라우트가 그대로 남아 있다. 라우트는 운영자 눈에 거의 띄지 않고, 검사 범위를 넓히면
> 이미 배포된 주소를 바꿔야 해서 그대로 둔다 — **모르고 둔 것이 아니라 알고 둔 것**이다.

## 4. Feature ID

```
<entity>.<action>              notice.list
<domain>.<entity>.<action>     ir.notice.list           (이 제품의 기능은 전부 이 꼴이다)
```

- 소문자 · 점 구분만 — `ID_FORMAT`
- 끝은 반드시 `action` 과 일치 — `ID_ACTION_MISMATCH`
- `entity` 가 ID 에 포함되어야 함 — `ID_ENTITY_MISMATCH`
- **뷰는 ID 에 들어가지 않는다.** `ir-admin.notice.list` 는 금지 — 뷰가 ID 에 섞이면 같은
  기능이 두 개의 ID 를 갖게 되어 ID 의 존재 이유가 사라진다. 어드민 화면인지는 `views['ir-admin']`
  바인딩이 있는지로 안다.

앞의 `ir.` 은 뷰가 아니라 **제품**이다. `notice.list` · `product.list` 는 B2C 가 이미 쓰고 있고
Feature ID 는 전 제품에서 하나뿐이어야 하므로, 도메인 한 마디를 앞에 세워 어느 제품의 공지인지를
id 에 남긴다. 엔티티는 그대로 `notice` 다 — 자원의 이름까지 갈라 두면 사전이 두 벌이 된다.

### 표준 동작 어휘 (닫힌 집합)

`home · library · list · detail · create · edit · delete · search · import · export · settings ·
dashboard · auth · signup · result`

이 목록 밖은 쓸 수 없다 (`ACTION_UNKNOWN`). 목록 화면에서 등록 창을 여는 자원이라도 동작 이름은
`create` 다 — `create`/`add`/`new`/`register` 가 화면마다 다르게 쓰이는 것이 싱크가 깨지는 첫 번째
원인이라 어휘를 먼저 닫는다. 새 동작이 정말 필요하면 `packages/spec/src/types.ts` 의 `ACTIONS` 에 추가한다.

## 5. 파생 규칙

Feature ID 하나에서 나오는 어드민 쪽 이름들. `pnpm spec:matrix` 가 실제 값으로 출력한다.
아래는 `ir.notice.list` 의 값이다.

| 대상 | 값 | 검사 |
|---|---|---|
| 라우트 | `/contents/notices` | `ROUTE_PREFIX` · `ROUTE_SEGMENT` · `ROUTE_TAIL` |
| 페이지 컴포넌트 | `IrNoticeListPage` | `COMPONENT_NAME` |
| 파일 | `app/contents/notices/page.tsx` | `sync:check` |
| Figma 페이지 | `pages.manifest.ts` 의 `order` · `name` | `MANIFEST_MISSING` |

**사이트와 다른 것은 접두어 한 마디다.** `NoticeListPage` 를 검색하면 `IrNoticeListPage` 가
나란히 잡혀야 한다 — `IrNoticeRegisterForm` 처럼 구조를 바꾸면 그 연결이 끊어지고, 한쪽만 고쳐
두 화면이 어긋나도 아무도 모른다.

**라우트까지 같지는 않다.** 같은 공지가 사이트에서는 `/support/notices`, 여기서는
`/contents/notices` 다 — 갈래를 나누는 기준이 서로 다르기 때문이고(저쪽은 찾아오는 사람 기준,
여기는 운영자가 손대는 순서 기준), 그래서 두 구현을 잇는 것은 주소가 아니라 이름이다.

## 6. 금지어

전체 목록은 `glossary-ir.ts` 와 `glossary.ts` 다. 이 콘솔에서 특히 자주 끼어드는 넷만 적는다.

| 정규 용어 | 한글 | 금지어 |
|---|---|---|
| `product` | 상품 *(메뉴는 '제품')* | `item` · `goods` · `merchandise` · `article` · `sku` |
| `credential` | 특허 및 인증 | `certification` · `certificate` · `patent` · `award` |
| `analytics` | 통계 | `stat` · `stats` · `metric` · `report` |
| `locale` | 국문 · 영문 | `language` · `i18n` · `translation` |

- 금지어가 Feature ID·엔티티·컴포넌트명에 나타나면 오류 (`TERM_BANNED`). 검사기는
  PascalCase/camelCase/kebab-case 를 단어 단위로 분해해 찾는다 — `IrCertificationListPage` 안의
  `Certification` 도 잡힌다.
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

`VIEW_PARTIAL` 이 이 한 쌍에서 유난히 많다. 사이트에만 있고 여기에 없는 기능이 열넷이 넘는데,
그것은 누락이 아니라 **고칠 자리가 없는 값**이라는 뜻이다. `singleViewByDesign` 을 붙이되 `note` 에
왜인지를 반드시 적는다 — 붙이기만 하고 이유를 안 적으면 경고만 사라지고 사실은 묻힌다.

## 8. 파일·폴더

어드민에만 있는 모양이라 실제 파일 목록대로 적는다.

| 폴더 | 무엇 | 규칙 |
|---|---|---|
| `app/<route>/page.tsx` | 화면 하나 | Next 규약 고정. `export default` 이름이 레지스트리의 `component` 와 같아야 한다 |
| `app/<route>/_components/` | 그 화면(또는 그 섹션) 전용 조각 | PascalCase · 접두어 없음 |
| `app/_components/` | 어드민 전체의 뼈대 | `Ir` 접두어 (§2.1 의 셋만 어긋나 있다) |
| `lib/navigation/ir-menu.ts` | 사이드바 | 라우트는 레지스트리를 옮겨 적은 것이다 |
| `lib/validation/form.ts` | 입력 검증 | 폼마다 필드 표를 두고 그 표가 별표와 검사를 함께 만든다 |
| `lib/screen-specs.ts` | 화면별 명세 | `screen` 은 `pages.manifest.ts` 의 `id` |
| `lib/today.ts` | 기준 날짜 한 줄 | 화면이 `new Date()` 를 읽지 않는다 |
| `lib/docs-nav.ts` · `lib/flow-specs.ts` · `lib/ia-groups.ts` · `lib/*-diagram.ts` | 문서 화면이 읽는 값 | 레지스트리 밖 — 개발 도구다 |

`components/` 폴더는 없다. 도메인을 모르는 원시 요소는 `@winpilot/ui` 가 갖고, 그 위는 전부
`app/**/_components/` 아래에 산다.

### 8.1 `@winpilot/store` 를 바로 읽는다 — 어댑터 층이 없다

이 콘솔에는 `lib/data/` 가 **없다.** 화면과 조각 쉰두 장이 `@winpilot/store` 를 직접 import 한다.

```ts
// app/contents/notices/_components/NoticeListView.tsx
import { SITE_NOTICES, SITE_NOTICE_GROUPS } from '@winpilot/store';
```

**어드민과 사이트가 각자 시드를 들면 두 화면이 서로 다른 것을 보여 준다.** 콘솔에서 공지를 열두
개 보는데 사이트에는 넷인 순간, 어느 쪽이 맞는지 아무도 모른다. 그래서 값은 공유 패키지 한 곳에만
둔다 — 여기까지는 B2C 어드민과 같은 판단이다.

다른 것은 **이름을 다시 지어 주는 층을 두지 않았다**는 점이다. 저쪽은 `lib/data/*.ts` 열네 장이
재수출만 하는데, 그 층의 값어치는 서버가 붙는 날 고칠 자리가 한 곳이 된다는 데 있다. 여기서는
그 층 없이 쉰두 장이 패키지 이름을 직접 알고 있으므로, **서버가 붙으면 쉰두 장을 고친다.**
지금 층을 만들지 않은 것은 알고 둔 것이고, 이 문단이 그 값을 적어 두는 자리다.

### 8.1.1 시드는 색을 모른다

상태에 색을 붙일 때 화면은 Tailwind 클래스가 아니라 **`BadgeTone`**(`'ok'` · `'neutral'` · …)을
적는다. 클래스 문자열을 값 쪽에 담으면 두 가지가 깨진다 — 시드가 화면을 알게 되고(서버에서 값을
받는 날 그 문자열은 갈 곳이 없다), 타입이 `string` 이라 `dark:` 접두어를 빠뜨려도 컴파일이
통과한다.

지금 이 콘솔의 톤 표는 문의 상태 하나뿐인데, **그것이 두 파일에 똑같이 적혀 있다** —
`inquiries/_components/InquiryListView.tsx` 와 `InquiryDetailView.tsx` 다. 목록과 상세가 같은
자원을 다르게 칠하게 되는 자리이므로, 셋째 화면이 생기기 전에 한곳으로 모으는 편이 낫다.

### 8.2 `lib/validation/form.ts` — 검증은 화면 밖에 둔다

한 장뿐이다. 자원별 파일로 나누지 않은 이유는 여기 든 것이 **자원 규칙이 아니라 모양 규칙**이기
때문이다 — `EMAIL` · `DATE` · `DIGITS` · `PHONE` · `POSITIVE` · `minLength` · `maxLength` ·
`notIn`. 무엇이 필수인지는 자원마다 다르고, 그 판단은 각 폼의 **필드 표**(`FormSpec`)가 갖는다.

- **끝까지 돈다.** `validate()` 는 처음 걸린 칸에서 멈추지 않는다. 멈추면 칸이 여섯인 폼에서
  여섯 번 눌러야 다 고친다.
- **필수라는 사실이 화면에 남는다.** 별표는 손으로 붙이지 않고 필드 표의 `required` 에서 나온다.
  전에는 그 사실이 코드 안에만 있어 저장을 눌러야 알 수 있었다.
- 한 칸 안에서는 처음 걸린 규칙 하나만 알린다 — 오류 세 줄이 붙으면 무엇부터 고칠지 알 수 없다.

### 8.3 `_components/` 안의 이름 관례

라우트 아래 조각은 서른한 장이다(`app/docs/**` 의 다섯은 개발 도구라 뺀다).

| 관례 | 무엇 | 개수 |
|---|---|---|
| `*ListView.tsx` | 목록 본체 — 툴바·표·선택·삭제·빈 상태를 다 안는다 | 12 |
| `*SettingsView.tsx` | 설정 화면 한 장의 본체 | 9 |
| `*Form.tsx` | 별도 화면의 등록·수정 폼 | 6 |
| `*View.tsx` *(그 밖)* | 목록도 설정도 아닌 화면의 본체 — `CompanyAboutView` · `InquiryDetailView` · `StatisticsHomeView` · `PeriodStatsView` | 4 |

`page.tsx` 는 껍데기만 두고 본체를 `_components/` 로 내리는 이유: 목록 화면은 전부 클라이언트
상태(검색·필터·선택)를 들고 있어야 하는데, `page.tsx` 를 통째로 `'use client'` 로 만들면
메타데이터와 서버에서 읽는 값이 함께 딸려 내려간다.

## 9. 새 화면 추가 절차

```
1. packages/spec/src/features-ir.ts 에 FeatureSpec 등록
   id 는 ir. 으로 시작한다. 새 낱말이면 packages/spec/src/glossary-ir.ts 에 먼저 올린다
   views: { 'ir-admin': { route, component: 'IrXxxYyyPage', status: 'planned' } }
2. pnpm spec:check          → 이름·경로가 규칙에 맞는지 먼저 확인
3. pnpm spec:matrix         → 파생된 이름을 그대로 복사해 구현
4. app/<route>/page.tsx 작성. 화면 전용 조각은 같은 폴더의 _components/ 에 둔다
5. 시드가 필요하면 packages/store 에 넣는다 — 화면이 그것을 직접 읽는다 (§8.1)
6. status: 'implemented' 로 변경
7. apps/ir-admin/pages.manifest.ts 에 { order, id, name, route } 등록 — 섹션 대역 안의 번호로
8. lib/navigation/ir-menu.ts 에 메뉴 항목 추가 (최상위에도 `ready` 를 반드시 적는다)
9. lib/screen-specs.ts 에 명세 추가 — missingSpecs() 가 빠진 화면을 알려 준다
10. pnpm spec:check && pnpm sync:check
```

매니페스트의 **80번대는 비워 둔다.** 지운 열 화면(공시·재무·주주·자료)이 있던 자리이고, 번호를
당기지 않는 이유는 `docs/path.md` §5 에 있다.

**이름을 먼저 정하고 코드를 쓴다.** 순서가 반대가 되면 이미 쓴 이름을 지키려고 규칙이 휘어진다.
