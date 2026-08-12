# 명명규칙 정의서 — F&B 도메인

> SSOT: `packages/spec/src/features-fnb.ts` · `packages/spec/src/glossary-fnb.ts`
> 집행: `pnpm spec:check`(규칙) · `pnpm sync:check`(레지스트리 이름 = 파일 이름)

## 1. 배경

같은 것을 **자리마다 다르게 부른다.**

| 무엇 | 기획서 | 사이트 | 콘솔 | 흔히 끼어드는 코드 이름 |
|---|---|---|---|---|
| 메뉴판에 오르는 한 품목 | 메뉴 | 메뉴판 | 메뉴 | `dish` · `food` · `recipe` · `lineup` |
| 문을 연 곳 하나 | 가맹점 | 매장안내 | 가맹점 | `shop` · `branch` · `outlet` |
| 상호·로고·연락처 한 벌 | 브랜드 | 푸터 | 브랜드 정보 | `identity` · `logo` |
| 본사가 채널에 올리는 글 | 마케팅 | 마케팅 | 마케팅 | `campaign` · `promotion` · `sns` |

한 회사 안에서도 기획서는 '메뉴', 화면은 '메뉴판', 코드는 `Dish`, 테스트는 `food` 를 쓰는 일이
흔하다. 그러면 **같은 기능을 이어 줄 공통 식별자가 하나도 없다.**

```
사이트:  /menu                MenuListPage         data-testid="menu-list"
콘솔:    /dish/register       FnbDishRegisterForm   data-testid="regBtn"
```

디자인 싱크 리포트가 차이를 찾아도 "이게 어느 기능의 어느 화면인지" 를 사람이 추측해야 하고,
기능 하나를 고칠 때 다른 화면을 빠뜨렸는지 기계가 알 수 없다.

## 2. 목적

**이름을 도메인마다 새로 정하지 않고 한 곳에서 관리한다.**

- 이름의 뿌리는 **Feature ID** 하나다. 라우트·컴포넌트명·i18n 키·테스트 ID·Figma 프레임명이
  전부 여기서 파생된다.
- 새 도메인이 생기면 **용어 사전만 갈아 끼운다.** 규칙과 검사기는 그대로 쓴다 — F&B 가 실제로
  그렇게 들어왔다. `glossary-fnb.ts` 와 `features-fnb.ts` 두 장을 더했을 뿐이다.
- 규칙은 문서로만 두지 않는다. `pnpm spec:check` 가 막지 못하는 규칙은 규칙이 아니다.

## 3. 지금 도메인 — F&B

**이 앱의 도메인은 외식 프랜차이즈다.** 이 도메인의 표준 이름은 **콘솔(F&B Admin)이 부르는
이름을 기준으로 삼는다.**

왜 콘솔 기준인가.

1. 자원을 **만들고 고치는 쪽**이 콘솔이다. 메뉴·가맹점·배너·FAQ 는 전부 거기서 태어난다.
   이름은 자원이 태어나는 자리에서 정해지는 편이 흔들리지 않는다.
2. **이 사이트가 읽는 값은 거의 다 거기서 온다.** 대응표가 `docs/admin-mapping.md` 에 그대로
   있고, 두 쪽이 같은 값을 다르게 부르면 그 표가 성립하지 않는다.
3. 운영자가 화면에서 쓰는 말과 개발자가 코드에서 쓰는 말이 같아야 장애 상황에서 서로 통한다.

단, **화면에 적히는 말과 엔티티 이름은 다를 수 있다.** 엔티티는 자원의 이름이고, 화면 문구는
그 화면의 사용자에게 맞춘 말이다. 둘이 다를 때는 아래 표에 적어 둔다 — 숨기지 않는다.

### 3.1 F&B 표준 이름표

| 엔티티 | 콘솔 메뉴 | 이 사이트 | 비고 |
|---|---|---|---|
| `brand` | 설정 > 브랜드 정보 | 브랜드 · 푸터 | 읽을거리가 아니라 **모든 화면이 읽는 설정**이다 |
| `menu` | 등록 > 메뉴 | 메뉴판 · 메뉴 상세 | `menuItem` 으로 쓸 수 없다 — §6 |
| `category` | *(메뉴 화면 안)* | 메뉴판의 탭 | 사이트에서는 목록이 아니라 탭으로만 보인다 |
| `store` | 등록 > 가맹점 | 매장안내 | 홈의 `지금 N곳` 이 세는 것 |
| `franchise` | 창업 > 비용 · 절차 | 창업안내 | 가맹점 하나가 아니라 **그것을 열기까지의 조건 한 벌** |
| `interior` | *(창업 비용 화면 안)* | 인테리어 | 창업 비용의 한 항목인데 사이트에서 화면을 통째로 쓴다 |
| `marketing` | 등록 > 마케팅 | 마케팅 | 손님이 아니라 **가맹점주에게** 보여 주는 본사의 활동 |
| `inquiry` | 창업 > 문의 내역 | 창업 상담 신청 | 같은 기록. **사이트가 넣고 콘솔이 받는다** |
| `faq` | 창업 > FAQ · 고객센터 > FAQ | 가맹점 개설문의 · 자주 묻는 질문 | 한 자원이 `audience` 로만 갈린다 |
| `notice` | 고객센터 > 공지사항 | 공지사항 | 홈의 공지 띠도 같은 목록을 읽는다 |
| `banner` | 배너 > 메인 비주얼 | 첫 화면 큰 글씨 | 사이트에는 목록이 없다 — 걸린 것 중 맨 위 하나만 나온다 |
| `popup` | 배너 > 팝업 | 모든 화면 위 | 걸린 것이 여럿이어도 하나만 뜬다 |
| `staff` | 설정 > 관리자 | *(없음)* | 콘솔에 들어오는 사람의 목록이다 |
| `terms` · `privacy` | *(아직 없음)* | 이용약관 · 개인정보 처리방침 | 원고가 들어오는 날 콘솔 쪽 화면을 붙인다 |
| `site` | 대시보드 | 홈 | 화면이 아니라 사이트 자체의 진입면 |
| `status` | 처리 결과 | 오류 · 404 | 일곱 앱이 한 컴포넌트를 쓴다 |

앞의 여섯(`brand` `menu` `store` `franchise` `interior` `marketing`)이 곧
`packages/spec/src/glossary-fnb.ts` 다. 나머지는 이미 `glossary.ts` 에 있던 것을 그대로 쓴다 —
**같은 자원을 제품마다 다른 이름으로 부르는 순간 이 사전이 막으려던 표류가 그대로 돌아온다.**

### 3.2 다른 도메인으로 갈 때

도메인이 바뀌면 **이 문서의 3장과 `glossary-<도메인>.ts` 만 새로 쓴다.**
Feature ID 문법(4장)·파생 규칙(5장)·검사 코드(8장)는 도메인과 무관하다.

F&B 가 그 증거다. 사전 여섯 줄과 기능 목록 한 장을 더했고, 검사기는 한 줄도 고치지 않았다.

## 4. Feature ID

```
<entity>.<action>              menu.list
<domain>.<entity>.<action>     fnb.menu.list   (도메인 분리가 필요할 때만)
```

- 소문자 · 점 구분만 허용 — 검사 코드 `ID_FORMAT`
- 끝은 반드시 `action` 과 일치 — `ID_ACTION_MISMATCH`
- `entity` 가 ID 에 포함되어야 함 — `ID_ENTITY_MISMATCH`
- **뷰 이름은 Feature ID 에 들어가지 않는다.** `admin.menu.list` 는 금지 —
  뷰가 ID 에 섞이면 같은 기능이 두 개의 ID 를 갖게 되어 존재 이유가 사라진다.

**이 제품의 ID 는 전부 `fnb.` 로 시작한다.** 공지·FAQ·배너·팝업·관리자는 다른 제품에도 같은
이름으로 있는데, Feature ID 는 전 제품을 가로지르는 유일한 식별자라 그대로 쓰면 부딪힌다.
엔티티 이름은 그대로 두고 **앞머리만** 붙여 어느 제품의 공지인지를 ID 에 남긴다.

같은 화면이 두 번 등록되는 자리도 그 앞머리로 갈린다 — `fnb.franchise.faq.list` 와
`fnb.support.faq.list` 는 **같은 자원을 `audience` 만 바꿔 그리는 것**이라 엔티티가 둘 다 `faq` 다.

### 표준 동작 어휘 (닫힌 집합)

`home · library · list · detail · create · edit · delete · search · import · export · settings ·
dashboard · auth · signup · result`

이 목록 밖은 쓸 수 없다 (`ACTION_UNKNOWN`). `create`/`add`/`new`/`register` 처럼
같은 뜻의 단어가 뷰마다 다르게 쓰이는 것이 싱크가 깨지는 첫 번째 원인이므로 어휘를 먼저 닫는다.
새 동작이 정말 필요하면 `packages/spec/src/types.ts` 의 `ACTIONS` 에 추가한다.

창업 상담이 `create` 가 아니라 `list` 인 것이 이 규칙이 휘지 않은 자리다. 사이트는 신청 폼
(`/franchise/apply`)이고 콘솔은 문의 목록(`/inquiries`)인데, `create` 로 두면 경로 꼬리 규칙상
양쪽 다 `/new` 여야 한다. 자원이 하나이므로 기능도 하나로 두고, 두 바인딩을 살리려면 목록 쪽
규칙을 따를 수밖에 없다 — **어휘를 늘려 예외를 만드는 대신 그 사정을 주석에 적었다.**

## 5. 파생 규칙

Feature ID 하나에서 나오는 이름들. `pnpm spec:matrix` 가 이 표를 실제 값으로 출력한다.

| 대상 | F&B Client | F&B Admin | 검사 |
|---|---|---|---|
| 라우트 | `/menu` | `/menus` | `ROUTE_SEGMENT`, `ROUTE_TAIL` |
| 페이지 컴포넌트 | `MenuListPage` | `FnbMenuListPage` | `COMPONENT_NAME` |
| 파일 | `app/menu/page.tsx` | `app/menus/page.tsx` | `sync:check` |
| `data-ssot-cid` | `fnb-client/fnb.menu.list` | `fnb-admin/fnb.menu.list` | — |
| i18n 키 | `feature.fnb.menu.list` | `feature.fnb.menu.list` *(공유)* | — |
| 테스트 ID | `fnb-client:fnb.menu.list` | `fnb-admin:fnb.menu.list` | — |
| Figma 프레임 | `F&B Client / Menus` | `F&B Admin / Menus` | — |

규칙은 단 하나 — **컴포넌트 이름은 접두어만 다르다.**
`Fnb` 접두어 하나만 붙이는 이유: 파일 검색 한 번(`MenuListPage`)으로 같은 기능의 두 구현이
나란히 잡혀야 한다. `FnbMenuBoard` 처럼 구조가 달라지면 그 연결이 끊어진다.

**라우트 접두어는 없다.** 두 앱이 각자의 도메인에 올라가므로 `/admin/...` 같은 네임스페이스를
두지 않고, 대신 사이트는 단수(`/menu`)·콘솔은 복수(`/menus`)를 쓴다. 손님이 주소를 읽는 자리와
자원 집합을 다루는 자리의 사정이 다르기 때문이고, 그 규칙은 `docs/path.md` §4 에 있다.
`sukhoe-whole` 같은 id 는 양쪽이 같아서 두 화면을 나란히 열어 견줄 수 있다.

> i18n 키는 뷰를 구분하지 않는다. 같은 기능의 레이블은 같아야 하며,
> 뷰별로 문구가 달라야 한다면 `feature.fnb.menu.list.admin.hint` 처럼 **하위 키**로 분기한다.
> 최상위에서 갈라놓으면 번역 누락을 기계가 못 잡는다.

## 6. 용어 사전 (Ubiquitous Language)

싱크가 깨지는 원인은 레이아웃이 아니라 **단어**다. 정규 용어만 엔티티·컴포넌트·라우트에 쓸 수 있다.
전체 목록은 3.1 의 표이고, 아래는 금지어가 특히 자주 끼어드는 셋이다.

| 정규 용어 | 한글 | 금지어 | 비고 |
|---|---|---|---|
| `menu` | 메뉴 | `dish`, `food`, `recipe`, `lineup` | 사이드바의 '메뉴'(내비게이션)와 글자가 같지만 그쪽은 자원이 아니다 |
| `store` | 가맹점 | `shop`, `branch`, `outlet` | 본사(`brand`)와 나눈다 — 푸터의 상호는 `brand` 에서 온다 |
| `brand` | 브랜드 | `identity`, `logo` | 회사 소개(`profile`)와 나눈 이유는 **모든 화면이 읽는 설정**이어서다 |

- 금지어가 Feature ID·엔티티·컴포넌트명에 나타나면 오류 (`TERM_BANNED`).
  검사기는 PascalCase/camelCase/kebab-case 를 단어 단위로 분해해 찾는다 —
  `FnbDishListPage` 안의 `Dish` 도 잡힌다.
- **`menuItem` 으로 쓸 수 없다.** 분해하면 `item` 이 나오고 그것은 `product` 의 금지어다.
  한 낱말 `menu` 로 쓴다.
- 사전에 없는 새 용어는 경고 (`TERM_UNREGISTERED`). 등록 후 사용한다.

## 7. 파일·폴더

| 대상 | 규칙 | 예 |
|---|---|---|
| 라우트 폴더 | 경로와 동일 (kebab-case, `[xxxId]`) | `app/menu/[itemId]/` |
| 페이지 파일 | Next.js 규약 고정 | `page.tsx`, `layout.tsx` |
| 컴포넌트 파일 | PascalCase, 컴포넌트명과 일치 | `MenuBoard.tsx` |
| 훅 | `use` + kebab-case 파일 | `lib/use-prefers-reduced-motion.ts` |
| 유틸 | camelCase 함수 · kebab-case 파일 | `lib/navigation.ts` 의 `SITE_NAV` |
| 사이트 전체가 쓰는 조각 | `app/_components/` · 접두어 없음 | `app/_components/Carousel.tsx` |
| 한 갈래 전용 조각 | 그 라우트 트리 안 | `app/stores/_components/StoreFinder.tsx` |

`app/menu/[itemId]` 의 동적 세그먼트가 엔티티와 어긋나 있다 — 콘솔은 `[menuId]` 다. 라우트는
용어 검사를 받지 않아 통과하지만 **알고 둔 어긋남**이고, 옮기는 날 레지스트리의 `route` 도 함께
고쳐야 한다(`features-fnb.ts` 의 `fnb.menu.detail` 주석).

## 7.1 디자인 토큰

| 대상 | 규칙 | 예 |
|---|---|---|
| 시맨틱 토큰 | 역할 기반 | `--color-canvas`, `--color-ink-muted` |
| 팔레트 토큰 | `<이름>-<단계>` | `--color-octo-500` |
| 컴포넌트 하드코딩 | **금지** — raw hex 사용 불가 | `#c03a68` (X) → `bg-octo-500` (O) |

이 제품의 브랜드 스케일은 `octo-*`(삶은 문어 껍질의 자주-붉은색)다. `brand-*`(파랑)는 IR
템플릿의 것이고, 한 토큰 파일 안에서 두 스케일이 나란히 산다. 자세한 내용은 `docs/design.md`.

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

`VIEW_PARTIAL` 은 이 한 쌍에서 자주 뜬다. 사이트에만 있는 것(약관·인테리어처럼 **아직 고칠
자리가 없는 값**)과 콘솔에만 있는 것(등록·상세 폼처럼 사이트에서는 결과만 보이는 것)이 갈리므로,
어느 쪽이든 `singleViewByDesign` 옆에 왜인지를 적는다. 적어 두지 않으면 다음 사람이 경고를
지우려고 없는 화면을 만든다.

## 9. 새 기능 추가 절차

```
1. 새 자원이면 packages/spec/src/glossary-fnb.ts 에 정규 용어와 금지어를 먼저 넣는다
2. packages/spec/src/features-fnb.ts 에 FeatureSpec 등록 (status: 'planned')
   id 는 fnb. 로 시작한다
3. pnpm spec:check                                    → 이름이 규칙에 맞는지 먼저 확인
4. pnpm spec:matrix                                   → 파생된 이름들을 그대로 복사해 구현
5. 구현 후 status: 'implemented' 로 변경
6. apps/fnb-client-a/pages.manifest.ts 에 { order, id, name, route } 등록 — 헤더 차례의 대역 안에서
7. 헤더에 세울 갈래면 lib/navigation.ts 에도 추가한다
8. pnpm spec:check && pnpm ssot:extract && pnpm ssot:verify
```

**이름을 먼저 정하고 코드를 쓴다.** 순서가 반대가 되면 이미 쓴 이름을 지키려고 규칙이 휘어진다.
