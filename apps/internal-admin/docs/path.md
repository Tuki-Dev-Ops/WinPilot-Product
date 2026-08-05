# Path 정의서 — Internal Admin

> SSOT: `packages/spec/src/features.ts` · 등록: `pages.manifest.ts`
> 검사: `pnpm spec:check`(등록·명명) · `pnpm sync:check`(레지스트리 이름 = 파일 이름)

## 1. 뷰와 접두어

| 뷰 | 라우트 접두어 | 컴포넌트 접두어 | 앱 |
|---|---|---|---|
| B2C Client | *(없음)* | *(없음)* | `apps/b2c-client-a` |
| B2C Admin | *(없음)* | `Admin` | `apps/b2c-admin` |
| **Internal Admin** | *(없음)* | **`Internal`** | `apps/internal-admin` |

**주소에 `/internal` 을 붙이지 않는다.** 세 앱이 각자 자기 레포·자기 도메인에 올라가므로 이
콘솔에게는 `/` 가 이미 자기 루트다. 여기에 한 마디를 더 두면 앱 안의 모든 경로가 쓸모없는
한 마디를 지고 다닌다. 경로 기반 배포가 필요해지면 Next 의 `basePath` 로 처리하고 라우트는
손대지 않는다 (`packages/spec/src/types.ts`).

대신 **컴포넌트 이름으로 뷰를 가른다.** 접두어가 없으면 `InvoiceListPage` 가 어느 앱의 화면인지
레지스트리 출력에서 알 수 없다. 이 앱의 페이지 컴포넌트는 전부 `Internal` 로 시작한다.

## 2. URL 문법

| 규칙 | 내용 | 위반 예 |
|---|---|---|
| 소문자 kebab-case | 정적 세그먼트는 `[a-z0-9]+(-[a-z0-9]+)*` | `/tenantDetail` |
| 컬렉션은 복수형 | 자원 집합은 복수, 단건은 그 하위 | `/tenant/T-101` |
| 동사 금지 | 동작은 경로 꼬리 규칙으로만 | `/tenants/register` |
| 동적 세그먼트 | `[<entity>Id]` — `Id` 접미 강제 | `[id]`, `[code]` |
| 후행 슬래시·확장자 없음 | | `/tenants/`, `/tenants.html` |

세그먼트 규칙은 `ROUTE_SEGMENT` 가 막는다. 이 콘솔은 사내 전용이라 주소를 손으로 고칠 일이
거의 없지만, 주소가 규칙을 벗어나면 세 앱을 같은 기준으로 검사할 수 없다.

## 3. 주소의 말과 코드의 말이 다른 자리

`/statistics` 의 엔티티가 `analytics` 인 것과 같은 결이다 — **사이드바에 적히는 말을 주소에
쓰고, 코드 이름은 정규 용어를 쓴다.** 두 말이 갈리는 자리는 아래 넷뿐이고, 모두
`packages/spec/src/features.ts` 에 그 이유가 주석으로 붙어 있다.

| 주소 | 엔티티 | 왜 갈리는가 |
|---|---|---|
| `/integrations/pg` | `payment` | `pg` 는 결제(payment)의 대체어라 용어 사전이 막는다 |
| `/statistics/revenue` · `/statistics/members` | `revenue` · `user` | `stat` 계열이 막힌다. `member` 도 `user` 의 대체어다 |
| `/billing/due` · `/billing/overdue` | `invoice` · `overdue` | `billing` 은 결제(payment)의 대체어다 |
| `/settings/notifications` | `alarm` | `notification` 은 공지(notice)의 대체어다 |

용어 사전은 **엔티티와 컴포넌트 이름**만 본다. 주소를 함께 막지 않는 이유는, 화면에 적히는
말과 자원의 이름이 늘 같지는 않기 때문이다 — 사람은 `PG` 라고 부르고 코드는 `payment` 로
적는 편이 양쪽 모두에게 자연스럽다.

## 4. 동작별 경로 꼬리

| action | 꼬리 | 이 앱의 예 |
|---|---|---|
| `list` | *(없음)* | `/tenants` · `/inquiries` · `/billing/due` |
| `detail` | `/[xId]` | `/tenants/[tenantId]` |
| `settings` | *(자유)* | `/integrations/pg` · `/settings/notifications` |
| `dashboard` | *(자유)* | `/` |
| `result` | *(자유)* | `/result` |

`create` · `edit` · `delete` · `search` · `auth` · `home` · `library` · `signup` 은 이 앱에
쓰이는 화면이 없다. 등록은 **목록 위 모달**에서 끝나고(§5), 검색은 목록 화면 안에서 하며,
로그인 화면은 아직 없다.

## 5. 등록 화면을 따로 두지 않는 이유

이 콘솔의 자원은 한 줄에 들어가는 값이 대여섯 개뿐이다. 화면을 세 장(목록 → 등록 → 목록)
만들면 담당자 하나 더하는 데 네 번 오간다. 그래서 등록은 전부 `InternalModal` 로 끝낸다.

| 자원 | 목록 | 등록하는 곳 |
|---|---|---|
| `tenant` | `/tenants` | 목록 위 모달 |
| `pipeline` | `/tenants/pipeline` | 목록 위 모달 |
| `activity` | `/tenants/activities` | 목록 위 모달 |
| `contact` | `/tenants/contacts` | 목록 위 모달 |
| `plan` · `role` | `/subscriptions/*` | 목록 위 모달 |
| `invoice` | `/billing/due` | 목록 위 모달 |
| `staff` · `code` | `/settings/*` | 목록 위 모달 |

값이 많아지는 자원이 생기면 그때 `/new` 를 만든다. 지금 없는 것을 미리 만들어 두면, 그것을
보고 만드는 사람이 이미 있는 줄 안다.

**등록 단추가 아예 없는 목록**도 있다: `/tenants/churned` · `/inquiries` · `/billing/overdue` ·
`/statistics/*`. 운영자가 만드는 자료가 아니라 **다른 일의 결과**로 생기는 자료라서다.
누를 수 없는 단추를 그려 두면 왜 안 되는지를 찾느라 시간을 쓴다.

## 6. 실제 경로 목록

`pages.manifest.ts` 의 22개다. 컴포넌트 이름은 `packages/spec/src/features.ts` 의
`internal-admin` 바인딩에서 가져왔다.

| 순번 | 이름 | 경로 | 컴포넌트 |
|---|---|---|---|
| 1 | Dashboard | `/` | `InternalTenantDashboardPage` |
| 10 | Tenants | `/tenants` | `InternalTenantListPage` |
| 11 | Pipeline | `/tenants/pipeline` | `InternalPipelineListPage` |
| 12 | Activities | `/tenants/activities` | `InternalActivityListPage` |
| 13 | Contacts | `/tenants/contacts` | `InternalContactListPage` |
| 14 | Churned Tenants | `/tenants/churned` | `InternalChurnListPage` |
| 15 | Tenant Detail | `/tenants/[tenantId]` | `InternalTenantDetailPage` |
| 20 | Plans | `/subscriptions/plans` | `InternalPlanListPage` |
| 21 | Roles | `/subscriptions/roles` | `InternalRoleListPage` |
| 30 | Inquiries | `/inquiries` | `InternalInquiryListPage` |
| 40 | Integration PG | `/integrations/pg` | `InternalPaymentSettingsPage` |
| 41 | Integration OAuth | `/integrations/oauth` | `InternalOauthSettingsPage` |
| 42 | Integration Plugin | `/integrations/plugin` | `InternalPluginSettingsPage` |
| 43 | Integration DNS | `/integrations/dns` | `InternalDnsSettingsPage` |
| 50 | Revenue | `/statistics/revenue` | `InternalRevenueListPage` |
| 51 | Members | `/statistics/members` | `InternalUserListPage` |
| 60 | Billing Due | `/billing/due` | `InternalInvoiceListPage` |
| 61 | Billing Overdue | `/billing/overdue` | `InternalOverdueListPage` |
| 70 | Staff | `/settings/staff` | `InternalStaffListPage` |
| 71 | Notifications | `/settings/notifications` | `InternalAlarmSettingsPage` |
| 72 | Codes | `/settings/codes` | `InternalCodeListPage` |
| 90 | Result | `/result` | `InternalStatusResultPage` |

순번은 사이드바 메뉴 순서를 따라 대역을 띄운다 — 대시보드 · 고객사(10) · 구독(20) · 문의(30) ·
연동(40) · 통계(50) · 결제(60) · 설정(70). 대역을 띄우는 이유는 중간에 화면을 하나 끼울 때
전체 번호를 다시 매기지 않기 위해서다.

주소가 없는 화면(추출 대상 아님): `not-found.tsx`(404) · `error.tsx`(오류).
매니페스트는 **주소가 있는 화면**의 목록이고, 이 둘은 어떤 주소로도 나타날 수 있다.

**로그인 화면이 없다.** 다른 두 앱과 다른 점이라 여기 적어 둔다 — 없는 길을 문서에도
그리지 않기 위해서다.

## 7. 쿼리 파라미터

| 화면 | 파라미터 | 뜻 |
|---|---|---|
| `/integrations/*` | `tenant` | 어느 고객사의 값을 열지 — 고객사 목록·상세에서 걸어 준다 |
| `/result` | `state=done\|failed` | 완료·실패 |
| | `kind=save\|invoice` | 무엇이 끝났는지 — 돌아갈 곳이 이 값으로 갈린다 |
| | `id` | 처리한 것의 번호 |

**목록의 검색·필터는 아직 주소에 남지 않는다.** 전부 `useState` 로 들고 있고, `searchParams`
를 읽는 화면은 연동 넷과 `/result` 뿐이다. 비기능 명세에는 "목록의 검색·필터·쪽은 주소에
남는다" 가 적혀 있으니 **아직 지키지 못한 자리**로 알아 둔다 — 문서가 앞서고 구현이 따라오는
중이라, 있는 것처럼 적으면 다음 사람이 찾다가 헤맨다.

## 8. 문서 주소

`docs/` 아래의 파일 경로가 곧 주소다 — `docs/path.md` → `/docs/path`.
문서를 위키에 두지 않는 이유: 화면과 문서가 **같은 레포에서 같이 바뀌어야** 어긋나지 않는다.

| 주소 | 문서 |
|---|---|
| `/docs` | 문서·화면 목록 |
| `/docs/ia` · `/docs/ia/{화면}` | IA — 사이드바 전체 도면과 화면별 자리 |
| `/docs/flow-chart` · `/docs/flow-chart/{화면}` | 흐름 — 여정·공통 상호작용과 화면별 흐름 |
| `/docs/fsd` · `/docs/fsd/{화면}` | 기능 명세서 |
| `/docs/nfs` · `/docs/nfs/{정책}` | 비기능 명세서 |
| `/docs/page-view` · `/docs/page-view/{화면}` | 화면 캡처 |
| `/docs/components` | 컴포넌트 정의서 (`docs/component.md`) |
| `/docs/design-system` | 디자인 시스템 (`docs/design.md`) |
| `/docs/path` | 이 문서 |
| `/docs/coding-conventions` | 명명규칙 정의서 |
| `/docs/deployment-mapping` | Deployment Mapping |
| `/docs/prompt` | 생성 프롬프트 |

`/docs/path` · `/docs/coding-conventions` · `/docs/deployment-mapping` 세 장은 한 라우트
(`app/docs/[page]/page.tsx`)가 함께 받는다. **등록되지 않은 이름은 404 다** — 저장소의 아무
파일이나 주소로 열리게 두지 않는다.

`/docs/components` · `/docs/design-system` 두 장만 자기 라우트를 갖는다. `[page]` 라우트는
주소 한 마디를 그대로 파일 이름으로 읽는데(`readDoc(page)`), 이 둘은 파일 이름(`component.md` ·
`design.md`)과 주소가 다르기 때문이다. 주소는 세 앱이 같은 말을 써야 문서를 나란히 열어 볼
수 있고, 파일 이름은 이미 그 이름으로 자리를 잡았다.

`/docs/page-view` 는 **지금 비어 있다.** 캡처를 아직 뜨지 않았고, 없는 그림을 걸어 두지
않는다 — `pnpm docs:capture` 를 돌리면 채워진다.
