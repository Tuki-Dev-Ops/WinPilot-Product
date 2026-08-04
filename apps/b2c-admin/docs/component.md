# 컴포넌트 정의서 — B2C Admin

> 대상: `app/_components/**` · `app/<route>/_components/**` · `components/domain/**` · `@winpilot/ui`
> 이름 규칙: `docs/coding-conventions.md` §2 (`Admin` 접두어를 붙이는 자리와 붙이지 않는 자리)

**여기 적힌 것은 지금 저장소에 실제로 있는 것뿐이다.** "쓰이는 화면" 은 `import` 를 되짚어
적었고, 쓰이는 곳이 없으면 없다고 적었다. 있을 법한 컴포넌트를 미리 적지 않는다 — 적어 두면
다음 사람이 찾다가 없는 것을 만들었다고 생각한다.

## 1. 층

| 층 | 뜻 | 두는 곳 | 접두어 |
|---|---|---|---|
| **껍데기** | 화면 바깥 틀 — 사이드바 · 헤더 · 보조 메뉴 | `app/_components/` | `Admin` |
| **목록** | 표 화면이 공통으로 쓰는 조각 — 툴바 · 페이저 · 선택 | `app/_components/` | `Admin` |
| **폼** | 입력 화면이 공통으로 쓰는 조각 — 모달 · 항목 뼈대 | `app/_components/` · `app/<route>/_components/` | 위치에 따라 |
| **알림** | 되돌리기 어려운 동작 앞의 확인 창 · 결과 통지 | `app/_components/` · `@winpilot/ui` | 위치에 따라 |

경계는 **"이 조각이 갈래를 가로지르는가"** 다. 어느 화면에서나 불려 나오는 것은
`app/_components/` 에 두고 이름에 `Admin` 을 박는다. 한 갈래 안에서만 도는 것은 그 갈래의
`_components/` 에 두고 접두어를 붙이지 않는다 — 폴더 경로가 이미 어느 화면의 것인지 말하고
있어서, 접두어를 더 붙이면 같은 말을 두 번 하게 된다.

## 2. `app/_components/` — 어드민 전체가 쓰는 뼈대

| 이름 | 층 | 하는 일 | 쓰이는 화면 |
|---|---|---|---|
| `AdminShell` | 껍데기 | 사이드바(최상위 메뉴) · 상단 헤더(현재 위치 · 로그아웃) · 본문 왼쪽 보조 메뉴를 그린다. `lg` 미만에서는 사이드바가 칩 내비게이션으로 접힌다 | **41장** — `/login` 을 뺀 매니페스트의 모든 화면 |
| `AdminListToolbar` | 목록 | 윗줄에 상태 탭과 주요 액션, 아랫줄에 검색과 필터. 필터는 조건이 걸려 있으면 펼친 채로 시작한다 | `/products` · `/products/categories` · `/products/sales` · `/users` · `/users/admins` · `/inquiries` · `/contents/faqs` · 그리고 `ContentListView` 를 통해 8장 더 (§4) |
| `AdminListPager` | 목록 | 표 아래 — 총 건수와 이전/다음. 쪽 번호를 늘어놓지 않는다 | `AdminListToolbar` 를 쓰는 화면 중 `/products/categories` · `/contents/faqs` 를 뺀 전부 + `/users/grades` |
| `AdminBulkBar` | 목록 | 선택된 항목이 있을 때만 표 위에 뜨는 줄 — 선택 해제 · 선택 삭제 | `/products` · `/users` · `/users/admins` · `/users/grades` · `/inquiries` · 그리고 `ContentListView` 를 통해 8장 |
| `AdminSelectionBar` | 목록 | 선택한 항목에 걸 동작을 **화면 아래 가운데**에 띄우는 막대. `body` 로 포털한다 | `/products/sales` 한 장 |
| `AdminModal` | 폼 | 모달의 바탕 — Esc 로 닫고, 열릴 때 본문 스크롤을 잠그고, 첫 입력 요소로 포커스를 옮긴다. 겹쳐 뜬 경우 **맨 위 모달만** Esc 에 반응한다 | 직접 부르지 않고 아래 열 개의 모달이 감싸 쓴다 (§4) |
| `AdminConfirmModal` | 알림 | 되돌리기 어렵거나 기록이 남는 동작 앞의 확인 창. `tone` 으로 삭제(danger)와 저장(brand)을 가르고, `summary` 로 무엇을 저장하는지 보여 준다 | **22장** — 목록의 삭제·상태 변경, 폼의 등록·저장 전부 |
| `MemberFormModal` | 폼 | 사용자·관리자 등록/수정 폼. 두 화면이 **같은 폼을 설정으로만 가른다**(라벨·상태 목록·역할이 자동인지 선택인지) | `/users` · `/users/admins` |
| `AdminPagePlaceholder` | 껍데기 | 배선은 끝났고 본문만 비어 있는 화면의 자리표시자 | **없다** — 지금 모든 화면에 본문이 들어가 있다 |

`AdminPagePlaceholder` 를 지우지 않고 두는 이유는 화면을 새로 배선할 때 다시 쓰기 때문이다.
쓰는 곳이 없다는 것은 지금 비어 있는 화면이 없다는 뜻이므로, 그 자체가 읽을 값이 있는 정보다.

### 2.1 확인 창을 삭제에만 세우지 않는 이유

`AdminConfirmModal` 은 삭제뿐 아니라 등록·저장 앞에도 선다. 목록이 소리 없이 바뀌면 운영자가
무엇을 했는지 알 수 없기 때문이다. 대신 **결과는 확인 창이 아니라 토스트로** 알린다
(`@winpilot/ui` 의 `useToast`) — 확인 창이 두 번 뜨면 두 번째는 읽지 않고 닫는다.

## 3. `components/domain/` — 자원을 아는 조각

| 이름 | 층 | 하는 일 | 쓰이는 화면 |
|---|---|---|---|
| `AuthField` | 폼 | 로그인 입력 한 칸 — 라벨 · 안내 문구 · 오류 문구를 함께 그린다 | `/login` · `/ssot/components`(갤러리) |

`components/ui/` 폴더는 **비어 있다.** 도메인을 모르는 원시 요소는 앱이 갖지 않고
`@winpilot/ui` 한 곳에 둔다 (§5).

## 4. `app/<route>/_components/` — 갈래 안에서 나눠 쓰는 뼈대

화면 하나만 쓰는 조각은 여기 적지 않는다. **두 화면 이상이 나눠 쓰는 것만** 적는다.

| 이름 | 층 | 하는 일 | 쓰이는 화면 |
|---|---|---|---|
| `contents/_components/ContentListView` | 목록 | 열만 받아서 목록 한 장을 통째로 그린다 — 탭 · 검색 · 필터 · 선택 · 삭제 · 페이저. 열 합이 9칸을 넘으면 개발 모드에서 경고한다 | `/contents/notices` · `/contents/news` · `/contents/portfolios` · `/banners` · `/banners/popups` · `/company/history` · `/products/reviews` · `/products/coupons` |
| `contents/_components/ContentFormShell` | 폼 | 폼 화면의 항목 뼈대 묶음 — `ContentSection`(카드) · `ContentField`(라벨+오류) · `ContentReadonly`(자동 입력) · `ContentToggle`(둘 중 하나) · `ContentFormActions`(오른쪽 저장/목록) | `/contents/notices/*` · `/contents/news/*` · `/contents/portfolios/*` · `/banners/*` · `/banners/popups/*` · `/company/about` · `/inquiries/settings` · `/settings/seo` · `/settings/supplier` · `/settings/terms` · `/settings/privacy` |
| `contents/_components/ContentMobilePreview` | 폼 | 입력한 값이 고객 화면에서 어떻게 보이는지 폼 옆에 모바일 폭으로 그린다 | `/contents/notices/*` · `/contents/news/*` · `/contents/portfolios/*` · `/company/about` |
| `settings/_components/PolicyEditorView` | 폼 | 약관·개인정보 편집 화면 한 장. 두 화면이 문서만 다르다 | `/settings/terms` · `/settings/privacy` |
| `products/_components/ProductForm` | 폼 | 상품 등록·수정 폼 한 벌 | `/products/new` · `/products/[productId]` |
| `products/_components/ProductMobilePreview` | 폼 | 상품 폼 옆의 고객 화면 미리보기 | `/products/new` · `/products/[productId]` |
| `products/_components/ProductTagBadges` | 목록 | NEW·BEST 뱃지. 목록·폼·고객 미리보기가 같은 모양을 써야 규칙이 같아 보인다 | `/products` · `/products/new` · `/products/[productId]` |
| `contents/news/_components/NewsForm` | 폼 | 뉴스 등록·수정 폼 한 벌 | `/contents/news/new` · `/contents/news/[newsId]` |
| `contents/notices/_components/NoticeForm` | 폼 | 공지 등록·수정 폼 한 벌 | `/contents/notices/new` · `/contents/notices/[noticeId]` |
| `contents/portfolios/_components/PortfolioForm` | 폼 | 포트폴리오 등록·수정 폼 한 벌 | `/contents/portfolios/new` · `/contents/portfolios/[portfolioId]` |
| `banners/_components/BannerForm` | 폼 | 배너 등록·수정 폼 한 벌 | `/banners/new` · `/banners/[bannerId]` |
| `banners/_components/BannerPreview` | 폼 | 배너·팝업이 고객 화면 어디에 어떻게 놓이는지 | `/banners/*` · `/banners/popups/*` |
| `banners/popups/_components/PopupForm` | 폼 | 팝업 등록·수정 폼 한 벌 | `/banners/popups/new` · `/banners/popups/[popupId]` |
| `statistics/_components/StatCard` | 목록 | 숫자 한 칸 — 라벨 · 값 · 증감 | `/` · `/statistics` · `/statistics/pages` · `/statistics/periods` · `/statistics/revenue` |

등록 화면과 상세 화면이 같은 `*Form` 을 쓰는 것은 **상세가 곧 수정 화면**이기 때문이다.
그 이유는 `docs/path.md` §3.3 에 적혀 있다.

### 4.1 `AdminModal` 을 감싸 쓰는 모달

| 이름 | 여는 화면 |
|---|---|
| `AdminConfirmModal` | (§2 참고 — 22장) |
| `MemberFormModal` | `/users` · `/users/admins` |
| `products/categories/_components/CategoryFormModal` | `/products/categories` |
| `users/grades/_components/GradeFormModal` | `/users/grades` |
| `company/history/_components/MilestoneFormModal` | `/company/history` |
| `contents/faqs/_components/FaqFormModal` · `FaqCategoryModal` | `/contents/faqs` |
| `inquiries/_components/InquiryDetailModal` | `/inquiries` |
| `products/sales/_components/TrackingModal` · `ExchangeModal` | `/products/sales` |

목록 한 장으로 끝나는 자원이 모달을 쓰고, 한 화면에 담을 값이 많은 자원은 화면을 따로
가진다. 그 경계는 `docs/path.md` §3.1·§3.2 에 있다.

## 5. `@winpilot/ui` — 세 앱이 나눠 쓰는 원시 요소

여기 들어가는 것은 **도메인을 모르는 것만**이다. 목록 툴바나 어드민 셸처럼 화면 구조를 아는
것은 앱이 갖는다 — 앱마다 구조가 다르기 때문이다. 뷰 하나가 곧 레포 하나이므로, 앱 안에
복사해 두면 레포를 나누는 순간 두 벌이 되어 어긋난다.

| 이름 | 층 | 하는 일 | 어드민에서 쓰는 파일 수 |
|---|---|---|---|
| `Checkbox` | 목록 | 표의 행 선택. 네이티브 렌더는 OS 마다 달라 `appearance-none` 으로 직접 그린다 | 8 |
| `Dropdown` | 폼 | 네이티브 `<select>` 대신. 목록을 `body` 로 포털해 카드·모달의 `overflow` 에 잘리지 않는다 | 7 |
| `HintInput` | 폼 | 안내 문구가 있는 한 줄 입력란 | 19 |
| `HintTextarea` | 폼 | 안내 문구가 있는 여러 줄 입력란 | 5 |
| `ImageUploader` | 폼 | 이미지 올리기 — 서버로 보내지 않고 `URL.createObjectURL` 로 미리보기만 만든다 | 6 |
| `RichTextEditor` | 폼 | 본문 편집기 | 8 |
| `StatusScreen` | 알림 | 404 · 오류 · 완료 · 실패가 한 컴포넌트를 쓴다 | `app/not-found.tsx` · `app/error.tsx` · `/result` |
| `ToastProvider` · `useToast` | 알림 | 동작 결과 통지. 공급자는 `app/layout.tsx` 에 한 번만 둔다 | 31 |

### 5.1 `placeholder` 를 쓰지 않는다

`HintInput` · `HintTextarea` · `AdminListToolbar` 의 검색이 모두 안내 문구를 **실제 텍스트
노드**로 겹쳐 두고 CSS 로만 숨긴다. `placeholder` 속성은 DOM 텍스트 노드가 아니라 추출되지
않고 Figma 에서 빈 상자로 나온다 (`docs/spec/05-component.md`).

같은 이유로 아이콘은 전부 인라인 SVG 다. 아이콘 폰트나 이미지로 두면 글리프·비트맵이 되어
벡터로 복원되지 않는다.

## 6. 금지 사항

- 같은 역할의 컴포넌트를 화면마다 복제하기 — 세 벌이 되면 한 벌만 고쳐진다
- 도메인을 모르는 원시 요소를 앱 안에 두기 (`@winpilot/ui` 로 간다)
- 화면 구조를 아는 조각을 `@winpilot/ui` 에 넣기 (앱마다 구조가 다르다)
- `app/<route>/_components/` 의 조각에 `Admin` 접두어 붙이기
- 인라인 `style` 속성 · raw hex · raw px (`docs/design.md` §9)

## 7. 아직 없는 것

- **`components/ui/`** — 폴더만 있고 비어 있다. 앱 전용 원시 요소가 필요해진 적이 아직 없다.
- **컴포넌트 갤러리의 범위** — `/ssot/components` 에 실려 있는 것은 `AuthField` 하나뿐이다.
  나머지 컴포넌트의 상태 변형은 아직 한자리에 그려 두지 않았다.
- **날짜 입력** — 기간을 받는 화면(배너·팝업·포트폴리오)이 `HintInput` 에 글자로 받는다.
  `type="date"` 도 날짜 선택 컴포넌트도 쓰는 곳이 없다.
- **표 컴포넌트** — 표는 `ContentListView` 처럼 화면 단위로 짜고, `Table` 같은 일반 컴포넌트는
  두지 않았다. 열 구성이 화면마다 달라 일반화하면 props 가 화면 수만큼 늘어난다.
