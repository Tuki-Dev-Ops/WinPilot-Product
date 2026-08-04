# Path 정의서 — B2C Client 템플릿 A

> SSOT: `packages/spec/src/features.ts` · 등록: `pages.manifest.ts`
> 검사: `pnpm spec:check`(등록·명명) · `pnpm sync:check`(레지스트리 이름 = 파일 이름)

## 1. 뷰와 접두어

| 뷰 | 라우트 접두어 | 컴포넌트 접두어 | 앱 |
|---|---|---|---|
| B2C Client | *(없음)* | *(없음)* | `apps/b2c-client-a` |
| B2C Admin | *(없음)* | `Admin` | `apps/b2c-admin` |
| Internal Admin | *(없음)* | `Internal` | `apps/internal-admin` |

세 앱이 **각자의 도메인**에 올라가므로 라우트 접두어를 두지 않는다. 대신 컴포넌트 이름으로
어느 뷰의 화면인지 구분한다 — 접두어가 없으면 `ProductListPage` 가 세 앱에 다 있게 된다.

## 2. URL 문법

| 규칙 | 내용 | 위반 예 |
|---|---|---|
| 소문자 kebab-case | 정적 세그먼트는 `[a-z0-9]+(-[a-z0-9]+)*` | `/productDetail` |
| 컬렉션은 복수형 | 자원 집합은 복수, 단건은 그 하위 | `/product/123` |
| 동사 금지 | 동작은 경로 꼬리 규칙으로만 | `/products/register` |
| 동적 세그먼트 | `[<entity>Id]` — `Id` 접미 강제 | `[id]`, `[slug]` |
| 후행 슬래시·확장자 없음 | | `/products/`, `/products.html` |

## 3. 동작별 경로 꼬리

| action | 꼬리 | 이 템플릿의 예 |
|---|---|---|
| `list` | *(없음)* | `/products` · `/notices` |
| `detail` | `/[xId]` | `/products/[productId]` |
| `create` | `/new` | `/orders/new` (화면 이름은 '결제') |
| `edit` | `/[xId]/edit` | *(고객 화면에는 없음)* |
| `search` | `/search` | *(검색은 목록의 `?q=` 로 처리)* |
| `settings` | *(자유)* | `/terms` · `/privacy` · `/company` |
| `signup` | `/signup` | `/signup` |
| `auth` | *(자유)* | `/login` |
| `home` | *(자유)* | `/` |
| `result` | *(자유)* | `/result` |

`/orders/new` 를 `/checkout` 으로 두지 않은 이유: 그 화면이 만드는 것은 **주문**이고,
자원을 만드는 화면의 경로 규칙이 `/{자원}/new` 다. 화면에 적히는 말은 '결제' 이되 주소와
이름은 자원을 따른다.

## 4. 실제 경로 목록

| 순번 | 이름 | 경로 | 컴포넌트 |
|---|---|---|---|
| 0 | Home | `/` | `SiteHomePage` |
| 10 | Products | `/products` | `ProductListPage` |
| 11 | Product Detail | `/products/[productId]` | `ProductDetailPage` |
| 20 | Notices | `/notices` | `NoticeListPage` |
| 21 | Notice Detail | `/notices/[noticeId]` | `NoticeDetailPage` |
| 22 | FAQ | `/faqs` | `FaqListPage` |
| 23 | FAQ Detail | `/faqs/[faqId]` | `FaqDetailPage` |
| 24 | News | `/news` | `NewsListPage` |
| 25 | News Detail | `/news/[newsId]` | `NewsDetailPage` |
| 26 | Portfolios | `/portfolios` | `PortfolioListPage` |
| 30 | Cart | `/cart` | `CartListPage` |
| 31 | Alarms | `/alarms` | `AlarmListPage` |
| 32 | Orders | `/orders` | `OrderListPage` |
| 33 | Checkout | `/orders/new` | `OrderCreatePage` |
| 34 | Order Detail | `/orders/[orderId]` | `OrderDetailPage` |
| 35 | My Page | `/mypage` | `UserSettingsPage` |
| 36 | My Page Inquiries | `/mypage/inquiries` | `InquiryListPage` |
| 37 | My Page Coupons | `/mypage/coupons` | `CouponListPage` |
| 40 | Login | `/login` | `UserAuthPage` |
| 41 | Signup | `/signup` | `UserSignupPage` |
| 50 | Company | `/company` | `ProfileSettingsPage` |
| 52 | Company History | `/company/history` | `MilestoneListPage` |
| 54 | Contact | `/contact` | `InquirySettingsPage` |
| 60 | Terms | `/terms` | `TermsSettingsPage` |
| 61 | Privacy | `/privacy` | `PrivacySettingsPage` |
| 90 | Result | `/result` | `StatusResultPage` |

주소가 없는 화면(추출 대상 아님): `not-found.tsx`(404) · `error.tsx`(오류).
매니페스트는 **주소가 있는 화면**의 목록이고, 이 둘은 어떤 주소로도 나타날 수 있다.

## 5. 쿼리 파라미터

| 화면 | 파라미터 | 뜻 |
|---|---|---|
| `/products` | `tag=NEW\|BEST` | 자동 분류 태그 |
| | `category=<1Depth id>` · `sub=<2Depth id>` | 분류. `sub` 는 `category` 와 짝일 때만 유효 |
| | `q=<검색어>` | 상품명 부분 일치 |
| | `min` · `max` | 가격 범위(원) |
| `/orders/new` | `productId` · `optionId` · `qty` | 상품 상세에서 바로 구매. 없으면 장바구니를 결제 |
| `/result` | `state=done\|failed` | 완료·실패 |
| | `kind=order\|inquiry\|signup\|save` | 무엇이 끝났는지 |
| | `id` | 접수 번호 |

목록의 상태를 전부 주소에 두는 이유: 새로고침·공유·뒤로가기에서 살아남아야 하기 때문이다.

## 6. 문서 주소

문서는 `/docs` 아래의 **진짜 라우트**다. 위키에 두지 않는 이유: 화면과 문서가 **같은 레포에서
같이 바뀌어야** 어긋나지 않는다 — 문서를 고치지 않고 화면만 고치면 주소를 열었을 때 드러난다.

`docs/` 폴더의 이름이 곧 한 마디다(`docs/FSD/products/` → `/docs/fsd/products`). 폴더 이름을
한글로 두지 않는 이유는 §2 와 같다 — 주소는 소문자 영문·숫자·하이픈만 쓴다. 화면에 보이는
이름은 한글이다(`전체`·`상품 목록`·`장바구니`).

| 주소 | 문서 | 모양 |
|---|---|---|
| `/docs` | 문서·화면 목록 | 한 장 |
| `/docs/ia` · `/docs/ia/{화면}` | IA — 전체 도면과 화면별 자리 | 왼쪽 목록 |
| `/docs/flow-chart` · `/docs/flow-chart/{화면}` | 흐름 — 여정·공통 상호작용과 화면별 흐름 | 왼쪽 목록 |
| `/docs/fsd` · `/docs/fsd/{화면}` | 기능 명세서 | 왼쪽 목록 |
| `/docs/nfs` · `/docs/nfs/{정책}` | 비기능 명세서 | 왼쪽 목록 |
| `/docs/page-view` · `/docs/page-view/{화면}` | 화면 캡처 | 왼쪽 목록 |
| `/docs/components` · `/docs/design-system` | 컴포넌트·디자인 시스템 | 한 장 |
| `/docs/path` · `/docs/coding-conventions` · `/docs/admin-mapping` · `/docs/prompt` | 각 정의서 | 한 장 |

`/docs` 아래는 검색 로봇에게 감춘다(`robots: noindex`). 사내 문서라 공개 검색 결과에 뜰 이유가
없고, 뜨면 고객이 상품 대신 명세서를 먼저 보게 된다.
