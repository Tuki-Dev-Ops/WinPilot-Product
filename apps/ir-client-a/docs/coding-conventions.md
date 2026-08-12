# 명명규칙 정의서 — IR 도메인

> SSOT: `packages/spec/src/features-ir.ts` · `packages/spec/src/glossary-ir.ts`
> 집행: `pnpm spec:check`(규칙) · `pnpm sync:check`(레지스트리 이름 = 파일 이름)

## 1. 배경

같은 것을 **도메인마다 다르게 부른다.**

| 무엇 | 상장사 IR | 커머스 | 외식 | 사내 시스템 |
|---|---|---|---|---|
| 파는 것 | Solution · Product | Product · SKU | Menu | 자산 |
| 알리는 글 | Disclosure · Notice | Notice | Notice | 공지 |
| 찾아오는 사람 | Investor · Shareholder | Customer | 손님 | 신청인 |
| 회사 자신 | Profile · Governance | Shop · Store | Brand | 부서 |

한 회사 안에서도 기획서는 '전자공시', 화면은 '공시', 코드는 `Filing`, 테스트는 `dart` 를 쓰는
일이 흔하다. 그러면 **같은 기능을 이어 줄 공통 식별자가 하나도 없다.**

```
사이트:  /disclosures         DisclosureListPage     data-testid="disclosure-list"
콘솔:    /filing/list         IrFilingListView       data-testid="listBtn"
```

디자인 싱크 리포트가 차이를 찾아도 "이게 어느 기능의 어느 화면인지" 를 사람이 추측해야 하고,
기능 하나를 고칠 때 다른 화면을 빠뜨렸는지 기계가 알 수 없다.

## 2. 목적

**이름을 도메인마다 새로 정하지 않고 한 곳에서 관리한다.**

- 이름의 뿌리는 **Feature ID** 하나다. 라우트·컴포넌트명·i18n 키·테스트 ID·Figma 프레임명이
  전부 여기서 파생된다.
- 제품이 하나 늘면 **용어 사전 한 장(`glossary-ir.ts`)을 더한다.** 규칙과 검사기는 그대로 쓴다.
  IR 이 방금 그렇게 들어왔다 — `features-ir.ts` 와 `glossary-ir.ts` 두 장뿐이고, 합치는 일은
  `features.ts` · `glossary.ts` 가 각각 한 줄로 한다.
- 규칙은 문서로만 두지 않는다. `pnpm spec:check` 가 막지 못하는 규칙은 규칙이 아니다.

## 3. 지금 도메인 — IR

**이 한 쌍의 도메인은 상장사의 회사 홈페이지와 그 운영 콘솔이다.** 이 도메인의 표준 이름은
**콘솔 화면이 부르는 이름을 기준으로 삼는다.**

왜 콘솔 기준인가.

1. 자원을 **만들고 고치는 쪽**이 콘솔이다. 이름은 자원이 태어나는 자리에서 정해지는 편이 흔들리지 않는다.
2. 사이트는 템플릿 변형이 늘어날 수 있고(앱 이름 `ir-client-a` 의 `-a` 가 그 자리다) 콘솔은
   하나다. 여러 벌이 각자 이름을 정하면 같은 값이 여러 이름을 갖는다.
3. 운영자가 화면에서 쓰는 말과 개발자가 코드에서 쓰는 말이 같아야 장애 상황에서 서로 통한다.

단, **화면에 적히는 말과 엔티티 이름은 다를 수 있다.** 엔티티는 자원의 이름이고, 화면 문구는
그 화면의 사용자에게 맞춘 말이다. 둘이 다를 때는 아래 표에 적어 둔다 — 숨기지 않는다.

### 3.1 IR 표준 이름표

| 엔티티 | 콘솔 메뉴 | 이 사이트의 화면 | 비고 |
|---|---|---|---|
| `site` | 대시보드 | 홈 | 주소는 양쪽 다 `/` 인데 다른 자원이다. 여기의 `/` 는 회사 소개다 |
| `profile` | 회사 > 소개 | 회사소개 | 단일 자원. 이 화면이 읽는 것은 `IR_COMPANY` 라 콘솔의 원고와 갈려 있다 |
| `milestone` | 회사 > 연혁 | 회사소개 · 연혁 | |
| `credential` | 회사 > 특허 및 인증 | 회사소개 · 특허 및 인증 | 특허와 인증을 두 자원으로 나누지 않는다 |
| `product` | **제품** | 제품 | 계약하면 그날부터 쓰는 클라우드 넷 |
| `service` | **서비스** | 솔루션 상세 둘 | 사람이 현장에 가서 하는 일. `product` 와 켜고 끌 수 있는지가 다르다 |
| `solution` | *(메뉴 밖)* | *(없음)* | `product` 와 **같은 값**을 본다. 언젠가 한쪽으로 합친다 |
| `mes` · `erp` · `crm` · `dxp` | 제품 > 목록의 한 줄 | 솔루션 상세 넷 | 이름 하나가 곧 화면 하나다 (`/solutions/mes`) |
| `consulting` · `infra` | 서비스 > 목록의 한 줄 | 솔루션 상세 둘 | 같은 이유 |
| `notice` | 콘텐츠 > 공지사항 | 고객지원 — 공지사항 | |
| `news` | 콘텐츠 > 뉴스 | 고객지원 — 뉴스 | 콘솔은 요약·원문 링크만 관리 |
| `faq` | 콘텐츠 > FAQ | 고객지원 — FAQ | |
| `inquiry` | 문의 · 문의 > 설정 | 고객지원 — 문의하기 | 방향이 반대다 — 여기가 넣고 콘솔이 받는다 |
| `direction` | *(없음)* | 고객지원 — 오시는 길 | 고칠 자리가 콘솔에 없다 |
| `banner` | 배너 > 메인 비주얼 | *(아직 안 이어져 있다)* | 첫 화면은 `HERO_SLIDES` 를 그린다 |
| `popup` | 배너 > 팝업 | 모든 화면 위의 팝업 | 걸린 것이 여럿이어도 한 번에 하나만 뜬다 |
| `disclosure` | *(화면을 지웠다)* | 공시 목록 · 공시 상세 | 나간 것만 선다. 상세는 주소로도 안 열린다 |
| `financial` · `stock` · `dividend` | *(화면을 지웠다)* | 재무정보 · 주가정보 · 배당정보 | |
| `meeting` · `vote` · `governance` | *(화면을 지웠다)* | 주주총회 · 전자투표 · 지배구조 | |
| `document` · `schedule` · `subscriber` | *(화면을 지웠다)* | 자료실 · IR 일정 · 알림 신청 | |
| `analytics` · `pageview` | 통계 | *(없음)* | 운영 전용 |
| `supplier` | 설정 > 공급자 정보 | *(안 나간다)* | 푸터는 `IR_COMPANY` 를 읽는다 |
| `seo` | 설정 > SEO 정보 | *(안 나간다)* | |
| `terms` · `privacy` | 설정 > 이용약관 · 개인정보 처리방침 | 이용약관 · 개인정보 처리방침 | **두 벌이다** — 이 화면이 제 글을 들고 있다 |
| `locale` | 설정 > 국문 · 영문 | *(없음)* | 이 사이트에 영문 화면이 없다 |
| `status` | 처리 결과 | *(없음)* | 여기는 저장·삭제가 없어 결과를 알릴 일이 없다 |

이 표의 IR 전용 낱말이 곧 `packages/spec/src/glossary-ir.ts` 다. `notice` · `banner` · `profile`
처럼 다른 제품과 같은 자원은 거기 다시 적지 않고 `glossary.ts` 의 공용 표를 그대로 쓴다 —
같은 자원을 IR 에서만 다른 이름으로 등록하면 이 사전이 막으려던 표류가 그대로 돌아온다.

*(화면을 지웠다)* 로 적힌 자원의 사연은 `apps/ir-admin/lib/navigation/ir-menu.ts` 머리말과
[어드민 연동](/docs/admin-mapping) §2 에 있다.

### 3.2 다른 도메인으로 갈 때

제품이 하나 더 늘면 **이 문서의 3장과 `glossary-<제품>.ts` 만 새로 쓴다.**
Feature ID 문법(4장)·파생 규칙(5장)·검사 코드(8장)는 도메인과 무관하다.

## 4. Feature ID

```
<entity>.<action>              notice.list
<domain>.<entity>.<action>     ir.notice.list           (IR 의 기능은 전부 이 꼴이다)
```

- 소문자 · 점 구분만 허용 — 검사 코드 `ID_FORMAT`
- 끝은 반드시 `action` 과 일치 — `ID_ACTION_MISMATCH`
- `entity` 가 ID 에 포함되어야 함 — `ID_ENTITY_MISMATCH`
- **뷰 이름은 Feature ID 에 들어가지 않는다.** `ir-admin.notice.list` 는 금지 —
  뷰가 ID 에 섞이면 같은 기능이 두 개의 ID 를 갖게 되어 존재 이유가 사라진다.

앞의 `ir.` 은 뷰가 아니라 **제품**이다. `notice.list` · `product.list` 는 B2C 가 이미 쓰고 있고
Feature ID 는 전 제품에서 하나뿐이어야 하므로, 도메인 한 마디를 앞에 세워 어느 제품의 공지인지를
id 에 남긴다. 엔티티는 그대로 `notice` 다 — 자원의 이름까지 갈라 두면 사전이 두 벌이 된다.

### 표준 동작 어휘 (닫힌 집합)

`home · library · list · detail · create · edit · delete · search · import · export · settings ·
dashboard · auth · signup · result`

이 목록 밖은 쓸 수 없다 (`ACTION_UNKNOWN`). `create`/`add`/`new`/`register` 처럼
같은 뜻의 단어가 뷰마다 다르게 쓰이는 것이 싱크가 깨지는 첫 번째 원인이므로 어휘를 먼저 닫는다.
새 동작이 정말 필요하면 `packages/spec/src/types.ts` 의 `ACTIONS` 에 추가한다.

## 5. 파생 규칙

Feature ID 하나에서 나오는 이름들. `pnpm spec:matrix` 가 이 표를 실제 값으로 출력한다.
아래는 `ir.notice.list` 의 실제 값이다.

| 대상 | IR Client | IR Admin | 검사 |
|---|---|---|---|
| 라우트 | `/support/notices` | `/contents/notices` | `ROUTE_SEGMENT`, `ROUTE_TAIL` |
| 페이지 컴포넌트 | `NoticeListPage` | `IrNoticeListPage` | `COMPONENT_NAME` |
| 파일 | `app/support/notices/page.tsx` | `app/contents/notices/page.tsx` | — |
| `data-ssot-cid` | `ir-client/ir.notice.list` | `ir-admin/ir.notice.list` | — |
| i18n 키 | `feature.ir.notice.list` | `feature.ir.notice.list` *(공유)* | — |
| 테스트 ID | `ir-client:ir.notice.list` | `ir-admin:ir.notice.list` | — |
| Figma 프레임 | `IR Client / List notice` | `IR Admin / List notice` | — |

규칙은 단 하나 — **접두어만 다르다.**
`Ir` 접두어 하나만 붙이는 이유: 파일 검색 한 번(`NoticeListPage`)으로 같은 기능의 두 구현이
나란히 잡혀야 한다. `IrNoticeRegisterForm` 처럼 구조가 달라지면 그 연결이 끊어진다.

**라우트는 접두어로 가르지 않는다.** 두 앱이 각자의 도메인에 올라가므로 `routePrefix` 가 비어
있고(`packages/spec/src/types.ts`), 그래서 같은 자원이 사이트에서는 `/support/notices`,
콘솔에서는 `/contents/notices` 다 — 갈래를 나누는 기준이 서로 다르기 때문이다. 어느 뷰의 것인지는
컴포넌트 이름이 말한다.

> i18n 키는 뷰를 구분하지 않는다. 같은 기능의 레이블은 같아야 하며,
> 뷰별로 문구가 달라야 한다면 `feature.ir.notice.list.admin.hint` 처럼 **하위 키**로 분기한다.
> 최상위에서 갈라놓으면 번역 누락을 기계가 못 잡는다.

## 6. 용어 사전 (Ubiquitous Language)

싱크가 깨지는 원인은 레이아웃이 아니라 **단어**다. 정규 용어만 엔티티·컴포넌트·라우트에 쓸 수 있다.
전체 목록은 3.1 의 표이고, 아래는 금지어가 특히 자주 끼어드는 셋이다.

| 정규 용어 | 한글 | 금지어 | 비고 |
|---|---|---|---|
| `disclosure` | 공시 | `dart`, `filing` | `dart` 는 전자공시 시스템의 이름이지 우리 자원의 이름이 아니다 |
| `credential` | 특허 및 인증 | `certification`, `certificate`, `patent`, `award` | 화면에서 하는 일이 같아 한 자원으로 둔다 |
| `governance` | 지배구조 | `shareholder`, `board`, `officer` | 이사회 구성과 주주 현황을 한 화면에서 본다 |

- 금지어가 Feature ID·엔티티·컴포넌트명에 나타나면 오류 (`TERM_BANNED`).
  검사기는 PascalCase/camelCase/kebab-case 를 단어 단위로 분해해 찾는다 —
  `IrFilingListPage` 안의 `Filing` 도 잡힌다.
- 사전에 없는 새 용어는 경고 (`TERM_UNREGISTERED`). 등록 후 사용한다.

## 7. 파일·폴더

| 대상 | 규칙 | 예 |
|---|---|---|
| 라우트 폴더 | 경로와 동일 (kebab-case, `[xxxId]`) | `app/disclosures/[disclosureId]/` |
| 페이지 파일 | Next.js 규약 고정 | `page.tsx`, `layout.tsx` |
| 컴포넌트 파일 | PascalCase, 컴포넌트명과 일치 | `NoticeListView.tsx` |
| 유틸 | camelCase | `lib/palette.ts` 의 `glowOf` · `lineOf` |
| 타입 전용 | `*.types.ts` | *(아직 쓰는 곳이 없다)* |
| 사이트 전체가 쓰는 컴포넌트 | `app/_components/` | `SiteHeader.tsx` · `IrTable.tsx` |
| 화면 전용 컴포넌트 | 해당 라우트 트리 안 | `app/support/notices/_components/` |

`components/ui/` · `components/domain/` 폴더는 **이 앱에 없다.** 도메인을 모르는 원시 요소는
`@winpilot/ui` 한 곳에 두고, 그보다 위는 전부 `app/**/_components/` 아래에 산다 — 폴더 경로가
어느 화면의 것인지 이미 말하고 있어 층을 하나 더 만들 이유가 없었다.

이 앱의 `app/_components/` 는 **접두어를 붙이지 않는다.** 콘솔의 `Ir` 접두어는 두 구현을 갈라
읽으려고 붙이는 것이고(§5), 사이트 쪽은 짝이 없는 조각이 대부분이다. 다만 콘솔에도 같은 이름이
설 만한 것 — 껍데기(`IrSiteShell`)와 표(`IrTable`) — 에만 접두어를 남겨 두었다. `Table` 이라는
이름이 두 앱에 다 있게 되면 파일을 열기 전에는 어느 쪽인지 알 수 없다.

## 7.1 디자인 토큰

| 대상 | 규칙 | 예 |
|---|---|---|
| 시맨틱 토큰 | 역할 기반 | `--color-canvas`, `--color-ink-muted` |
| 팔레트 토큰 | `<이름>-<단계>` | `--color-brand-500` |
| 컴포넌트 하드코딩 | **금지** — raw hex 사용 불가 | `#3182f6` (X) → `bg-brand-500` (O) |

예외는 `lib/palette.ts` 하나다. SVG 의 `fill`·`stroke` 는 클래스가 아니라 속성으로 받고 값에
반투명이 섞여 유틸리티로 옮기기 어려워, **아이소메트릭 그림이 쓰는 색만** 그 파일에 모아 둔다.
자세한 내용은 `docs/design.md`.

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
| `VIEW_PARTIAL` | warn | 한쪽 뷰에만 존재 — 설계상 맞으면 `singleViewByDesign: true` |
| `MANIFEST_MISSING` | error | 구현 완료인데 Figma 페이지 미등록 |
| `MANIFEST_ORPHAN` | warn | 매니페스트에 있으나 레지스트리에 없음 |

`VIEW_PARTIAL` 이 이 한 쌍에서 특히 자주 뜬다. 사이트에만 있고 콘솔에 없는 화면이 많기
때문인데(공시 · 재무 · 주주 · 자료), 그것은 누락이 아니라 **고칠 자리가 없는 값**이라는 뜻이다.
그래서 `singleViewByDesign` 을 붙이되 `note` 에 왜인지를 반드시 적는다 — 붙이기만 하고 이유를
안 적으면 경고만 사라지고 사실은 묻힌다.

## 9. 새 기능 추가 절차

```
1. packages/spec/src/features-ir.ts 에 FeatureSpec 등록  (status: 'planned')
   id 는 ir. 으로 시작한다. 새 낱말이면 glossary-ir.ts 에 먼저 올린다
2. pnpm spec:check                                    → 이름이 규칙에 맞는지 먼저 확인
3. pnpm spec:matrix                                   → 파생된 이름들을 그대로 복사해 구현
4. 구현 후 status: 'implemented' 로 변경
5. apps/ir-client-a/pages.manifest.ts 에 { order, id, name, route } 등록
6. pnpm spec:check && pnpm ssot:extract && pnpm ssot:verify
```

**이름을 먼저 정하고 코드를 쓴다.** 순서가 반대가 되면 이미 쓴 이름을 지키려고 규칙이 휘어진다.
