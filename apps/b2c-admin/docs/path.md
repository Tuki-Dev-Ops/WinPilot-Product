# Path 정의서 — B2C Admin

> SSOT: `packages/spec/src/features.ts` · 등록: `pages.manifest.ts`
> 검사: `pnpm spec:check`(등록·명명) · `pnpm sync:check`(레지스트리 이름 = 파일 이름)

## 1. 뷰와 접두어

| 뷰 | 라우트 접두어 | 컴포넌트 접두어 | 앱 |
|---|---|---|---|
| B2C Client | *(없음)* | *(없음)* | `apps/b2c-client-a` |
| **B2C Admin** | *(없음)* | **`Admin`** | `apps/b2c-admin` |
| Internal Admin | *(없음)* | `Internal` | `apps/internal-admin` |

**어드민 주소에 `/admin` 을 붙이지 않는다.** 세 앱이 각자 자기 레포·자기 도메인에 올라가므로
어드민에게는 `/` 가 이미 자기 루트다. 여기에 `/admin` 을 한 마디 더 두면 앱 안의 모든 경로가
`/admin/products` 처럼 쓸모없는 한 마디를 지고 다니게 된다. 경로 기반 배포(`example.com/admin`)가
필요해지면 Next 의 `basePath` 로 처리하고 라우트는 손대지 않는다 (`packages/spec/src/types.ts`).

대신 **컴포넌트 이름으로 뷰를 가른다.** 접두어가 없으면 `ProductListPage` 가 세 앱에 다 있게 되고,
레지스트리 출력에서 어느 것이 어느 앱의 화면인지 알 수 없다. 어드민의 페이지 컴포넌트는 전부
`Admin` 으로 시작한다 — `AdminProductListPage`.

## 2. URL 문법

| 규칙 | 내용 | 위반 예 |
|---|---|---|
| 소문자 kebab-case | 정적 세그먼트는 `[a-z0-9]+(-[a-z0-9]+)*` | `/productDetail` |
| 컬렉션은 복수형 | 자원 집합은 복수, 단건은 그 하위 | `/product/P-1042` |
| 동사 금지 | 동작은 경로 꼬리 규칙으로만 | `/products/register` |
| 동적 세그먼트 | `[<entity>Id]` — `Id` 접미 강제 | `[id]`, `[code]` |
| 후행 슬래시·확장자 없음 | | `/products/`, `/products.html` |

세그먼트 규칙은 `ROUTE_SEGMENT` 가 막는다. 운영자가 주소를 손으로 고칠 일은 없지만,
주소가 규칙을 벗어나면 고객 화면과 짝을 맞출 기준이 사라진다 — 두 뷰를 같은 규칙으로 검사하는 것이
`spec:check` 가 하는 일의 전부다.

## 3. 동작별 경로 꼬리

| action | 꼬리 | 어드민의 예 |
|---|---|---|
| `list` | *(없음)* | `/products` · `/users` · `/banners` |
| `detail` | `/[xId]` | `/products/[productId]` · `/banners/popups/[popupId]` |
| `create` | `/new` | `/products/new` · `/contents/news/new` |
| `edit` | `/[xId]/edit` | *(화면 없음 — 4장 참고)* |
| `settings` | *(자유)* | `/settings/seo` · `/company/about` · `/inquiries/settings` |
| `dashboard` | *(자유)* | `/` |
| `auth` | *(자유)* | `/login` |
| `home` | *(자유)* | `/statistics` |
| `library` | *(자유)* | `/ssot/components` |
| `result` | *(자유)* | `/result` |

`search` · `import` · `export` · `delete` · `signup` 은 어드민에 쓰이는 화면이 없다.
검색은 목록 화면 안에서 하고, 삭제는 화면이 아니라 목록의 확인 창에서 한다.

### 3.1 등록과 상세가 다 있는 자원

**고객 화면과 크게 다른 점이다.** 고객 화면에는 `create` 가 결제(`/orders/new`) 하나뿐이지만,
어드민은 자원을 만드는 쪽이라 `/new` 와 `/[xId]` 가 나란히 있는 자원이 여섯이다.

| 자원 | 목록 | 등록 | 상세 |
|---|---|---|---|
| `product` | `/products` | `/products/new` | `/products/[productId]` |
| `notice` | `/contents/notices` | `/contents/notices/new` | `/contents/notices/[noticeId]` |
| `news` | `/contents/news` | `/contents/news/new` | `/contents/news/[newsId]` |
| `portfolio` | `/contents/portfolios` | `/contents/portfolios/new` | `/contents/portfolios/[portfolioId]` |
| `banner` | `/banners` | `/banners/new` | `/banners/[bannerId]` |
| `popup` | `/banners/popups` | `/banners/popups/new` | `/banners/popups/[popupId]` |

이 여섯은 한 화면에 담을 값이 많다 — 이미지·본문·기간·옵션까지 들어가서 모달 폭으로는 감당이 안 된다.

### 3.2 목록 한 장으로 끝나는 자원

| 자원 | 경로 | 등록·수정을 어디서 하나 |
|---|---|---|
| `user` | `/users` | 목록 안 모달 (`MemberFormModal`) |
| `staff` | `/users/admins` | 목록 안 모달 |
| `grade` | `/users/grades` | 목록 안 모달 (`GradeFormModal`) |
| `category` | `/products/categories` | 목록 안 모달 (`CategoryFormModal`) |
| `faq` | `/contents/faqs` | 목록 안 모달 (`FaqFormModal` · `FaqCategoryModal`) |
| `milestone` | `/company/history` | 목록 안 모달 (`MilestoneFormModal`) |
| `inquiry` | `/inquiries` | 목록 안 모달에서 답변만 쓴다 (`InquiryDetailModal`) |
| `review` | `/products/reviews` | 목록에서 숨기기만 한다 |
| `coupon` | `/products/coupons` | 목록 한 장 |

한 줄에 들어가는 값이 대여섯 개뿐인 자원에 화면을 세 장 만들면, 등급 하나 고치는 데
목록 → 상세 → 저장 → 목록으로 네 번 오간다. **화면을 나누는 기준은 자원의 크기다.**

### 3.3 `edit` 을 따로 두지 않는다

레지스트리에 `product.edit`(`/products/[productId]/edit`) 이 있으나 `status: 'planned'` 이고,
`pages.manifest.ts` 에도 `app/**` 에도 그 화면은 없다. **상세 화면이 곧 수정 화면이다** —
`AdminProductDetailPage` · `AdminNoticeDetailPage` · `AdminBannerDetailPage` 가 전부 값을 채운
입력 폼으로 열린다(`features.ts` 의 `note: '수정도 이 화면에서 한다'`).

조회 전용 상세를 따로 둘 이유가 없기 때문이다. 운영자가 상세를 여는 까닭은 거의 언제나 고치기
위해서이고, 읽기 화면과 쓰기 화면을 나누면 같은 항목표를 두 벌 관리하게 된다.

예외는 주문이다. `/products/sales/[orderId]` 는 금액·상품을 고치지 않고 운송장 등록과 상태 변경만
한다 — 결제된 값을 화면에서 바꾸면 두 값이 갈린다.

## 4. 실제 경로 목록

`pages.manifest.ts` 의 43개다. 컴포넌트 이름은 `packages/spec/src/features.ts` 의 `b2c-admin`
바인딩에서 가져왔고, 레지스트리에 없는 화면은 실제 `page.tsx` 의 `export default` 이름을 적었다.

| 순번 | 이름 | 경로 | 컴포넌트 |
|---|---|---|---|
| 1 | Dashboard | `/` | `AdminSiteDashboardPage` |
| 2 | Login | `/login` | `AdminUserAuthPage` |
| 10 | Users | `/users` | `AdminUserListPage` |
| 11 | Users Staff | `/users/admins` | `AdminStaffListPage` |
| 12 | Users Grades | `/users/grades` | `AdminGradeListPage` |
| 20 | Product Categories | `/products/categories` | `AdminCategoryListPage` |
| 21 | Product List | `/products` | `AdminProductListPage` |
| 22 | Product Create | `/products/new` | `AdminProductCreatePage` |
| 23 | Product Detail | `/products/[productId]` | `AdminProductDetailPage` |
| 24 | Product Sales | `/products/sales` | `AdminOrderListPage` |
| 25 | Product Sale Detail | `/products/sales/[orderId]` | `AdminOrderDetailPage` |
| 30 | Inquiries | `/inquiries` | `AdminInquiryListPage` |
| 31 | Inquiry Settings | `/inquiries/settings` | `AdminInquirySettingsPage` |
| 40 | Content Notices | `/contents/notices` | `AdminNoticeListPage` |
| 41 | Content Notice Create | `/contents/notices/new` | `AdminNoticeCreatePage` |
| 42 | Content Notice Detail | `/contents/notices/[noticeId]` | `AdminNoticeDetailPage` |
| 43 | Content FAQ | `/contents/faqs` | `AdminFaqListPage` |
| 44 | Content News | `/contents/news` | `AdminNewsListPage` |
| 45 | Content News Create | `/contents/news/new` | `AdminNewsCreatePage` |
| 46 | Content News Detail | `/contents/news/[newsId]` | `AdminNewsDetailPage` |
| 47 | Content Portfolios | `/contents/portfolios` | `AdminPortfolioListPage` |
| 48 | Content Portfolio Create | `/contents/portfolios/new` | `AdminPortfolioCreatePage` |
| 49 | Content Portfolio Detail | `/contents/portfolios/[portfolioId]` | `AdminPortfolioDetailPage` |
| 50 | Banners | `/banners` | `AdminBannerListPage` |
| 51 | Banner Create | `/banners/new` | `AdminBannerCreatePage` |
| 52 | Banner Detail | `/banners/[bannerId]` | `AdminBannerDetailPage` |
| 53 | Banner Popups | `/banners/popups` | `AdminPopupListPage` |
| 54 | Banner Popup Create | `/banners/popups/new` | `AdminPopupCreatePage` |
| 55 | Banner Popup Detail | `/banners/popups/[popupId]` | `AdminPopupDetailPage` |
| 60 | Company About | `/company/about` | `AdminProfileSettingsPage` |
| 61 | Company History | `/company/history` | `AdminMilestoneListPage` |
| 65 | Statistics Home | `/statistics` | `AdminAnalyticsHomePage` |
| 66 | Statistics Periods | `/statistics/periods` | `AdminAnalyticsListPage` |
| 67 | Statistics Pages | `/statistics/pages` | `AdminPageviewListPage` |
| 68 | Statistics Revenue | `/statistics/revenue` | `AdminRevenueListPage` |
| 70 | Settings Supplier | `/settings/supplier` | `AdminSupplierSettingsPage` |
| 71 | Settings SEO | `/settings/seo` | `AdminSeoSettingsPage` |
| 72 | Settings Terms | `/settings/terms` | `AdminTermsSettingsPage` |
| 73 | Settings Privacy | `/settings/privacy` | `AdminPrivacySettingsPage` |
| 23 | Product Reviews | `/products/reviews` | `AdminReviewListPage` |
| 24 | Product Coupons | `/products/coupons` | `AdminCouponListPage` |
| 100 | Components | `/ssot/components` | `AdminSiteLibraryPage` |
| 90 | Result | `/result` | `AdminStatusResultPage` |

순번은 사이드바 메뉴 순서를 따라 대역을 띄운다 — 대시보드 · 사용자(10) · 상품(20) · 문의(30) ·
콘텐츠(40) · 배너(50) · 회사(60) · 통계(65) · 설정(70). 대역을 띄우는 이유는 중간에 화면을 하나
끼울 때 전체 번호를 다시 매기지 않기 위해서다. 리뷰·쿠폰은 나중에 붙어 순번 23·24 가
상품 상세·판매와 겹쳐 있다 — 매니페스트에 적힌 그대로 옮겼다.

주소가 없는 화면(추출 대상 아님): `not-found.tsx`(404) · `error.tsx`(오류).
매니페스트는 **주소가 있는 화면**의 목록이고, 이 둘은 어떤 주소로도 나타날 수 있다.
`/ssot` 는 파이프라인 상태판이라 `devOnlyRoutes` 로 빼 둔다.

## 5. 쿼리 파라미터

지금 주소에 남는 값은 하나뿐이다.

| 화면 | 파라미터 | 뜻 |
|---|---|---|
| `/result` | `state=done\|failed` | 완료·실패 |
| | `kind=save\|upload\|order` | 무엇이 끝났는지 — 돌아갈 곳이 이 값으로 갈린다 |
| | `id` | 처리한 것의 번호 |

**목록의 검색·필터·탭·쪽은 아직 주소에 남지 않는다.** `app/**/_components/*ListView.tsx` 열일곱 장이
전부 `useState` 로 들고 있고, `searchParams` 를 읽는 화면은 `/result` 하나다. 비기능 명세에는
"목록의 검색·필터·쪽은 주소에 남는다" 가 적혀 있으니 **아직 지키지 못한 자리**로 알아 둔다 —
문서가 앞서고 구현이 따라오는 중이라, 있는 것처럼 적으면 다음 사람이 찾다가 헤맨다.

## 6. 문서 주소

`docs/` 아래의 파일 경로가 곧 주소다 — `docs/path.md` → `/docs/path`.
문서를 위키에 두지 않는 이유: 화면과 문서가 **같은 레포에서 같이 바뀌어야** 어긋나지 않는다.
어드민의 문서는 고객 화면과 달리 `/docs` 아래에 모여 있다. 운영자에게 보일 화면이 아니라
개발 도구이므로 제품 주소와 섞지 않는다.

| 주소 | 문서 |
|---|---|
| `/docs` | 문서·화면 목록 |
| `/docs/ia` · `/docs/ia/{화면}` | IA — 사이드바 전체 도면과 화면별 자리 |
| `/docs/flow-chart` · `/docs/flow-chart/{화면}` | 흐름 — 운영자 여정·공통 상호작용과 화면별 흐름 |
| `/docs/fsd` · `/docs/fsd/{화면}` | 기능 명세서 |
| `/docs/nfs` · `/docs/nfs/{정책}` | 비기능 명세서 |
| `/docs/page-view` · `/docs/page-view/{화면}` | 화면 캡처 |
| `/docs/path` | 이 문서 |
| `/docs/coding-conventions` | 명명규칙 정의서 |
| `/docs/admin-mapping` | Admin Mapping |
| `/docs/prompt` | 생성 프롬프트 |

`/docs/path` · `/docs/coding-conventions` · `/docs/admin-mapping` 세 장은 한 라우트
(`app/docs/[page]/page.tsx`)가 함께 받는다. **등록되지 않은 이름은 404 다** — 저장소의 아무 파일이나
주소로 열리게 두지 않는다.
