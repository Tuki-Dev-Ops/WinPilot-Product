# WinPilot Product

세 업종의 웹 화면을 한 저장소에서 만듭니다. 고객이 보는 사이트 셋과 그 내용을 고치는 운영
콘솔 셋, 그리고 그 셋을 함께 들여다보는 사내 콘솔 하나입니다.

## 프로젝트 배경

같은 업종의 사이트를 새로 만들 때마다 화면을 처음부터 그리고, 색과 간격을 화면마다 다시
정하고, 명세를 따로 쓰는 일이 되풀이되었습니다. 그렇게 만든 결과물은 두어 달 뒤 같은 회색이
네 가지가 되고, 문서는 화면을 따라오지 못한 채 남습니다.

이 저장소는 그 되풀이를 줄이려고 시작했습니다. 업종마다 **템플릿 한 벌**을 갖추고, 색과
간격은 한 파일에서만 정하며, 명세는 화면 등록부에서 펼쳐 냅니다. 어긋남은 사람이 기억하지
않고 검사가 잡습니다.

## 프로젝트 목적

- 업종마다 **고객 화면과 운영 콘솔을 한 쌍**으로 갖춥니다. 사이트만 만들면 문구 한 줄을 고치는 데 개발자와 배포가 필요합니다.
- 콘솔과 사이트가 **같은 값 한 곳**을 읽습니다. 두 벌로 두면 "콘솔에서 본 값과 사이트에 뜬 값이 다르다" 가 되고, 그때부터 어느 쪽이 맞는지 아무도 답할 수 없습니다.
- 색과 글자, 간격의 **원본을 한 파일**에 둡니다. 앱에서 색을 직접 선언하는 순간 디자인 시스템이 두 벌이 됩니다.
- 명세를 **화면 등록부에서 생성**합니다. 생성된 문서를 고치면 다음 실행 때 지워지는데, 고칠 곳이 하나여야 두 문서가 서로 다른 말을 하지 않습니다.
- 어긋남의 **종류마다 검사를 따로** 둡니다. 하나가 나머지를 대신하지 못합니다.

목적과 배경을 더 자세히 적은 글이 앱 안에 있습니다 — 아무 앱이나 띄운 뒤 `/docs/purpose`.

## 업무 범위

앱 **7벌**, 화면 **203개**, 기능 **163가지**입니다.

| 앱 | 폴더 | 성격 | 포트 | 화면 | 기능 |
|---|---|---|---|---|---|
| B2C 쇼핑몰 | `apps/b2c-client-a` | 고객 화면 | 3310 | 26 | 28 |
| B2C 콘솔 | `apps/b2c-admin` | 운영 콘솔 | 3301 | 44 | 45 |
| IR 회사 홈페이지 | `apps/ir-client-a` | 고객 화면 | 3304 | 19 | 19 |
| IR 콘솔 | `apps/ir-admin` | 운영 콘솔 | 3303 | 44 | 44 |
| F&B 브랜드 사이트 | `apps/fnb-client-a` | 고객 화면 | 3305 | 14 | 14 |
| F&B 콘솔 | `apps/fnb-admin` | 운영 콘솔 | 3306 | 33 | 33 |
| 사내 콘솔 | `apps/internal-admin` | 사내 전용 | 3302 | 23 | 23 |

기능 수를 앱마다 따로 세는 데에는 이유가 있습니다. 하나의 기능이 고객 화면과 운영 콘솔
양쪽에 걸리면 실제로 만들어야 할 화면은 둘이기 때문입니다. 그래서 앱별 합계
(206)는 기능 가짓수(163)보다 큽니다.

### 하는 것

| 항목 | 내용 |
|---|---|
| 화면 | 위 표의 203개. 문서 화면(`/docs/**`)도 실제 라우트입니다 |
| 문서 | 목적과 배경 · 전체 범위 · IA · 흐름도 · 기능 명세 · 비기능 명세 · 화면 사진 |
| 디자인 | 색과 글자, 간격을 담은 토큰 한 벌(`packages/tokens`). 일곱 앱이 이것만 바라봅니다 |
| 검사 | 이름 · 문서 · 값의 출처 · 가로 넘침 · 화면 무게 |
| Figma 연동 | 화면을 다시 Figma 로 뽑는 추출기와 플러그인(`tools/extractor` · `figma-plugin`) |

### 하지 않는 것

| 항목 | 지금 상태 |
|---|---|
| 서버 · API | 두지 않았습니다. 값은 `packages/store` 한 곳에 있습니다 |
| 데이터베이스 | 같은 이유로 두지 않았습니다. 서버가 붙더라도 바뀌는 것은 store 가 값을 어디서 받아 오는가뿐입니다 |
| 로그인 · 권한 | 화면까지만 있습니다. 입력한 값은 어디로도 전송되지 않습니다 |
| 결제 | 화면까지만 있습니다. PG 연동은 사내 콘솔의 설정 화면으로만 존재합니다 |
| 메일 · 알림 발송 | 없습니다. 문의와 구독은 값을 받는 양식까지 만들었습니다 |
| 배포 · 운영 | 아직입니다. 지금은 개발 서버로 띄워 확인하는 단계입니다 |

범위를 이야기할 때 가장 자주 나오는 질문이라 함께 적었습니다. 적어 두지 않으면 있는 것으로
읽히기 때문입니다.

## 기능 명세서

화면 하나가 문서 한 장입니다. 목적과 배경, 구성, 데이터 항목, 기능, 버튼, 시나리오, 예외,
검증, 상태, 정책, 인수 조건까지 열네 절로 적혀 있고, 앱을 띄운 뒤 `/docs/fsd` 에서
보실 수 있습니다.

아래 표는 `apps/*/pages.manifest.ts` 와 `lib/screen-specs.ts` 에서 뽑은 것입니다. 화면을
더하면 그 두 곳만 고치면 되고, 문서는 `pnpm docs:build` 가 다시 펼칩니다.

### B2C 쇼핑몰 — `apps/b2c-client-a` · 화면 26개

| 주소 | 화면 | 목적 |
|---|---|---|
| `/` | Index | 주요 상품과 진행 중인 프로모션을 요약하여 제공하는 메인 페이지입니다. |
| `/products` | Product List | 전체 상품을 분류 · 검색 · 가격 조건으로 조회하는 상품 목록 페이지입니다. |
| `/products/[productId]` | Product Detail | 상품 구매 판단에 필요한 정보와 구매 기능을 제공하는 상품 상세 페이지입니다. |
| `/notices` | Notices | 운영 공지사항을 조회하는 공지사항 목록 페이지입니다. |
| `/notices/[noticeId]` | Notice Detail | 개별 공지의 본문을 제공하는 공지사항 상세 페이지입니다. |
| `/faqs` | FAQ | 자주 묻는 질문을 분류별로 조회하는 FAQ 목록 페이지입니다. |
| `/faqs/[faqId]` | FAQ Detail | 개별 질문과 답변을 제공하는 FAQ 상세 페이지입니다. |
| `/news` | News | 회사 소식을 조회하는 뉴스 목록 페이지입니다. |
| `/news/[newsId]` | News Detail | 개별 뉴스의 요약을 제공하고 원문으로 연결하는 뉴스 상세 페이지입니다. |
| `/portfolios` | Portfolios | 수행 프로젝트를 연도별로 조회하는 포트폴리오 페이지입니다. |
| `/cart` | Cart | 장바구니에 담은 상품을 확인하고 주문서로 이동하는 장바구니 페이지입니다. |
| `/alarms` | Alarms | 수신한 알림을 확인하는 알림 목록 페이지입니다. |
| `/orders` | Orders | 주문 내역과 배송 진행 상태를 조회하는 주문 목록 페이지입니다. |
| `/orders/new` | Checkout | 주문 상품 · 배송지 · 결제 금액을 확정하는 주문서 페이지입니다. |
| `/orders/[orderId]` | Order Detail | 개별 주문의 결제 · 배송 · 운송장 정보를 제공하는 주문 상세 페이지입니다. |
| `/mypage` | My Page | 회원 정보를 조회하고 수정하는 마이페이지입니다. |
| `/mypage/inquiries` | My Page Inquiries | 접수한 문의와 운영자 답변을 조회하는 문의 내역 페이지입니다. |
| `/mypage/coupons` | My Page Coupons | 보유 쿠폰과 발급 가능한 쿠폰을 조회하는 쿠폰함 페이지입니다. |
| `/login` | Login | 계정으로 로그인하는 페이지입니다. |
| `/signup` | Signup | 신규 계정을 등록하는 회원가입 페이지입니다. |
| `/company` | Company | 회사 소개 정보를 제공하는 회사 소개 페이지입니다. |
| `/company/history` | Company History | 회사 연혁을 연도별로 제공하는 연혁 페이지입니다. |
| `/contact` | Contact | 문의를 접수하는 문의하기 페이지입니다. |
| `/terms` | Terms | 이용약관을 제공하는 페이지입니다. |
| `/privacy` | Privacy | 개인정보 처리방침을 제공하는 페이지입니다. |
| `/result` | Result | 처리 결과를 안내하고 이동 경로를 제공하는 처리 결과 페이지입니다. |

### B2C 콘솔 — `apps/b2c-admin` · 화면 44개

| 주소 | 화면 | 목적 |
|---|---|---|
| `/` | Dashboard | 당일 처리 대상 항목을 요약하여 제공하는 운영 현황 페이지입니다. |
| `/login` | Login | 운영자 계정으로 로그인하는 페이지입니다. |
| `/users` | Users | 가입 회원을 조회하고 상태를 관리하는 회원 목록 페이지입니다. |
| `/users/admins` | Users Staff | 운영자 계정을 등록하고 관리하는 운영자 관리 페이지입니다. |
| `/users/grades` | Users Grades | 회원 등급과 등급별 혜택을 관리하는 등급 관리 페이지입니다. |
| `/products/categories` | Product Categories | 상품 분류를 관리하는 카테고리 관리 페이지입니다. |
| `/products` | Product List | 등록 상품을 조회하고 판매 상태를 관리하는 상품 목록 페이지입니다. |
| `/products/new` | Product Create | 신규 상품을 등록하는 상품 등록 페이지입니다. |
| `/products/[productId]` | Product Detail | 등록된 상품 정보를 수정하는 상품 상세 페이지입니다. |
| `/products/sales` | Product Sales | 접수된 주문을 조회하고 배송을 처리하는 주문 관리 페이지입니다. |
| `/products/sales/[orderId]` | Product Sale Detail | 개별 주문의 상세 정보를 제공하는 주문 상세 페이지입니다. |
| `/inquiries` | Inquiries | 고객이 접수한 문의에 답변하는 문의 관리 페이지입니다. |
| `/inquiries/settings` | Inquiry Settings | 문의 분류와 안내 문구를 관리하는 문의 설정 페이지입니다. |
| `/contents/notices` | Content Notices | 공지사항을 조회하고 관리하는 공지사항 목록 페이지입니다. |
| `/contents/notices/new` | Content Notice Create | 공지사항을 등록하는 페이지입니다. |
| `/contents/notices/[noticeId]` | Content Notice Detail | 등록된 공지사항을 수정하는 페이지입니다. |
| `/contents/faqs` | Content FAQ | 자주 묻는 질문을 조회하고 관리하는 FAQ 목록 페이지입니다. |
| `/contents/news` | Content News | 뉴스를 조회하고 관리하는 뉴스 목록 페이지입니다. |
| `/contents/news/new` | Content News Create | 뉴스를 등록하는 페이지입니다. |
| `/contents/news/[newsId]` | Content News Detail | 등록된 뉴스를 수정하는 페이지입니다. |
| `/contents/portfolios` | Content Portfolios | 포트폴리오를 조회하고 관리하는 포트폴리오 목록 페이지입니다. |
| `/contents/portfolios/new` | Content Portfolio Create | 포트폴리오를 등록하는 페이지입니다. |
| `/contents/portfolios/[portfolioId]` | Content Portfolio Detail | 등록된 포트폴리오를 수정하는 페이지입니다. |
| `/banners` | Banners | 메인 배너를 조회하고 관리하는 배너 목록 페이지입니다. |
| `/banners/new` | Banner Create | 메인 배너를 등록하는 페이지입니다. |
| `/banners/[bannerId]` | Banner Detail | 등록된 메인 배너를 수정하는 페이지입니다. |
| `/banners/popups` | Banner Popups | 팝업을 조회하고 관리하는 팝업 목록 페이지입니다. |
| `/banners/popups/new` | Banner Popup Create | 팝업을 등록하는 페이지입니다. |
| `/banners/popups/[popupId]` | Banner Popup Detail | 등록된 팝업을 수정하는 페이지입니다. |
| `/company/about` | Company About | 회사 소개 본문과 대표 이미지를 관리하는 회사 소개 설정 페이지입니다. |
| `/company/history` | Company History | 회사 연혁을 관리하는 연혁 관리 페이지입니다. |
| `/statistics` | Statistics Home | 주요 운영 지표를 조회하는 통계 페이지입니다. |
| `/statistics/periods` | Statistics Periods | 기간별 지표 추이를 조회하는 기간별 통계 페이지입니다. |
| `/statistics/pages` | Statistics Pages | 화면별 방문 현황을 조회하는 화면별 통계 페이지입니다. |
| `/statistics/revenue` | Statistics Revenue | 매출 현황을 조회하는 매출 통계 페이지입니다. |
| `/settings/supplier` | Settings Supplier | 고객 화면 하단에 표시되는 사업자 정보를 관리하는 설정 페이지입니다. |
| `/settings/seo` | Settings SEO | 검색 결과와 링크 공유 시 표시되는 정보를 관리하는 SEO 설정 페이지입니다. |
| `/settings/terms` | Settings Terms | 고객 화면에 게시하는 이용약관을 관리하는 설정 페이지입니다. |
| `/settings/privacy` | Settings Privacy | 고객 화면에 게시하는 개인정보 처리방침을 관리하는 설정 페이지입니다. |
| `/support` | Support | 본 콘솔에서 직접 처리할 수 없는 사항을 운영사에 문의하는 지원 요청 페이지입니다. |
| `/products/reviews` | Product Reviews | 고객이 등록한 상품 리뷰를 관리하는 리뷰 관리 페이지입니다. |
| `/products/coupons` | Product Coupons | 할인 쿠폰을 등록하고 관리하는 쿠폰 관리 페이지입니다. |
| `/ssot/components` | Components | 사용 중인 공통 컴포넌트를 확인하는 개발 지원 페이지입니다. |
| `/result` | Result | 처리 결과를 안내하고 이동 경로를 제공하는 처리 결과 페이지입니다. |

### IR 회사 홈페이지 — `apps/ir-client-a` · 화면 19개

| 주소 | 화면 | 목적 |
|---|---|---|
| `/` | Home | 회사 소개와 주요 제품 정보를 요약하여 제공하는 메인 페이지입니다. |
| `/about` | About | 회사의 비전, 핵심 메시지, 주요 사업 및 사업 영역을 소개하는 회사 소개 페이지입니다. |
| `/about/history` | History | 회사의 주요 연혁을 연도순으로 제공하는 연혁 페이지입니다. |
| `/about/certifications` | Certifications | 보유 특허 및 인증을 등록번호와 함께 조회할 수 있는 목록 페이지입니다. |
| `/about/certifications/[credentialId]` | Certification Detail | 개별 특허 · 인증의 상세 정보를 제공하는 상세 페이지입니다. |
| `/solutions/consulting` | Smart Consulting | 스마트 컨설팅 서비스의 도입 대상 과제와 제공 범위를 안내하는 서비스 상세 페이지입니다. |
| `/solutions/infra` | Infra Service | 인프라 서비스의 도입 대상 과제와 제공 범위를 안내하는 서비스 상세 페이지입니다. |
| `/solutions/mes` | Cloud MES | 설비 데이터를 표준 규격으로 수집하는 제품의 도입 대상 과제와 제공 범위를 안내하는 제품 상세 페이지입니다. |
| `/solutions/erp` | Cloud ERP | 수주부터 정산까지의 업무를 통합 관리하는 제품의 도입 대상 과제와 제공 범위를 안내하는 제품 상세 페이지입니다. |
| `/solutions/crm` | Cloud CRM | 고객 정보와 상담 이력을 관리하는 제품의 도입 대상 과제와 제공 범위를 안내하는 제품 상세 페이지입니다. |
| `/solutions/dxp` | Cloud DXP | 고객 접점 화면을 구성하는 제품의 도입 대상 과제와 제공 범위를 안내하는 제품 상세 페이지입니다. |
| `/products` | Products | 제공 제품과 서비스를 조회하고 개별 상세 페이지로 이동할 수 있는 제품 목록 페이지입니다. |
| `/support/contact` | Contact | 도입 검토부터 주주 문의까지 문의 유형별로 접수하는 문의하기 페이지입니다. |
| `/support/notices` | Notices | 휴무 · 연락처 변경 · 약관 개정 등 사전 안내 사항을 제공하는 공지사항 페이지입니다. |
| `/support/news` | Support News | 방송 · 행사 · 제품 소개 등 회사 관련 소식을 제공하는 뉴스 목록 페이지입니다. |
| `/support/faq` | FAQ | 반복적으로 제기되는 질문에 대한 답변을 제공하는 자주 묻는 질문 페이지입니다. |
| `/support/directions` | Directions | 본사 주소와 방문 경로를 안내하는 오시는 길 페이지입니다. |
| `/terms` | Terms | 이용약관 원문 확정 전까지 준비 중임을 안내하고 문의 경로를 제공합니다. |
| `/privacy` | Privacy | 개인정보 처리방침 원문 확정 전까지 문의 경로를 제공합니다. |

### IR 콘솔 — `apps/ir-admin` · 화면 44개

| 주소 | 화면 | 목적 |
|---|---|---|
| `/` | Dashboard | 기간별 문의 현황과 지역 분포를 확인하는 운영 현황 페이지입니다. |
| `/inquiries` | Inquiries | 고객 사이트 문의 폼으로 접수된 문의를 조회하고 처리 현황을 관리하는 목록 페이지입니다. |
| `/inquiries/[inquiryId]` | Inquiry Detail | 접수된 문의를 확인하고 답변을 작성하여 처리 상태를 변경하는 상세 페이지입니다. |
| `/inquiries/settings` | Inquiry Settings | 고객 사이트 문의 폼의 수집 항목과 수신 정보를 관리하는 설정 페이지입니다. |
| `/contents/notices` | Notices | 고객 사이트 공지사항을 조회하고 관리하는 목록 페이지입니다. |
| `/contents/notices/new` | Notice Create | 고객 사이트에 게시할 공지를 등록하는 페이지입니다. |
| `/contents/notices/[noticeId]` | Notice Detail | 등록된 공지의 내용과 노출 설정을 수정하는 상세 페이지입니다. |
| `/contents/news` | News | 고객 사이트 뉴스를 조회하고 관리하는 목록 페이지입니다. |
| `/contents/news/new` | News Create | 고객 사이트에 게시할 뉴스를 등록하는 페이지입니다. |
| `/contents/news/[newsId]` | News Detail | 등록된 뉴스의 제목과 미리보기 설정을 수정하는 상세 페이지입니다. |
| `/contents/faqs` | FAQ | 고객 사이트 자주 묻는 질문을 조회하고 관리하는 목록 페이지입니다. |
| `/contents/faqs/new` | FAQ Create | 반복 접수되는 질문에 대한 답변을 등록하는 FAQ 등록 페이지입니다. |
| `/contents/faqs/[faqId]` | FAQ Detail | 등록된 질문과 답변을 수정하는 FAQ 상세 페이지입니다. |
| `/products` | Products | 클라우드 제품 4종의 명칭과 노출 상태를 조회하는 제품 목록 페이지입니다. |
| `/products/[productId]` | Product Detail | 제품 소개 문구를 수정하는 제품 상세 페이지입니다. 구성 항목은 조회 전용입니다. |
| `/products/settings` | Product Settings | 고객 사이트 PRODUCT 메뉴의 구성과 노출 순서를 설정하는 페이지입니다. |
| `/solutions` | Problem & Approach | 제품별 해결 과제와 해결 방식의 등록 여부를 조회하는 문제 · 해법 목록 페이지입니다. |
| `/solutions/[solutionId]` | Problem & Approach Detail | 해결 과제와 해결 방식을 수정하는 상세 페이지입니다. 제품 상세와 동일한 폼을 사용합니다. |
| `/solutions/settings` | Home Stage Order | 메인 페이지 사업 구조 영역에 표시되는 6개 항목의 순서를 조회하는 페이지입니다. |
| `/services` | Services | 인력이 수행하는 서비스 2종의 상세 콘텐츠 등록 여부를 조회하는 서비스 목록 페이지입니다. |
| `/services/[serviceId]` | Service Detail | 서비스 소개 문구를 수정하는 상세 페이지입니다. 제품 상세와 동일한 폼을 사용합니다. |
| `/services/settings` | Service Settings | 서비스 2종이 고객 사이트에 노출되는 위치와 문구를 조회하는 페이지입니다. |
| `/company/about` | Company Profile | 메인 페이지 회사 소개 문구와 회사 기본 정보를 조회하는 페이지입니다. |
| `/company/history` | Milestones | 고객 사이트 연혁을 조회하고 관리하는 목록 페이지입니다. |
| `/company/history/new` | Milestone Create | 연혁 항목을 등록하는 페이지입니다. |
| `/company/history/[milestoneId]` | Milestone Detail | 등록된 연혁 항목을 수정하는 상세 페이지입니다. |
| `/company/credentials` | Credentials | 보유 특허 및 인증을 조회하고 관리하는 목록 페이지입니다. |
| `/company/credentials/new` | Credential Create | 취득한 특허 및 인증을 등록하는 페이지입니다. |
| `/company/credentials/[credentialId]` | Credential Detail | 등록된 특허 및 인증을 수정하는 상세 페이지입니다. |
| `/banners` | Hero Banners | 메인 페이지 배너를 조회하고 관리하는 목록 페이지입니다. |
| `/banners/new` | Banner Create | 메인 페이지 배너를 등록하는 페이지입니다. |
| `/banners/[bannerId]` | Banner Detail | 등록된 배너의 내용과 게시 기간을 수정하는 상세 페이지입니다. |
| `/banners/popups` | Popups | 고객 사이트 팝업을 조회하고 관리하는 목록 페이지입니다. |
| `/banners/popups/new` | Popup Create | 고객 사이트 진입 시 표시할 팝업을 등록하는 페이지입니다. |
| `/banners/popups/[popupId]` | Popup Detail | 등록된 팝업의 내용과 게시 기간을 수정하는 상세 페이지입니다. |
| `/statistics` | Statistics | 고객 사이트 방문 수와 문의 건수를 함께 조회하는 통계 페이지입니다. |
| `/statistics/period` | Period Analysis | 월별 방문 수와 문의 건수를 비교 조회하는 기간별 통계 페이지입니다. |
| `/statistics/pages` | Page Visits | 화면별 방문 수와 체류 시간을 조회하는 화면별 통계 페이지입니다. |
| `/settings/supplier` | Supplier Info | 고객 사이트 하단에 표시되는 사업자 정보를 관리하는 설정 페이지입니다. |
| `/settings/seo` | SEO | 검색 결과와 링크 공유 시 표시되는 정보를 관리하는 설정 페이지입니다. |
| `/settings/terms` | Terms | 고객 사이트 이용약관 본문을 관리하고 게시 여부를 설정하는 페이지입니다. |
| `/settings/privacy` | Privacy Policy | 고객 사이트 개인정보 처리방침 본문을 관리하고 게시 여부를 설정하는 페이지입니다. |
| `/settings/locales` | Locales | 고객 사이트 문구를 국문 · 영문 쌍으로 관리하는 다국어 설정 페이지입니다. |
| `/result` | Result | 처리 결과를 안내하고 이동 경로를 제공하는 처리 결과 페이지입니다. |

### F&B 브랜드 사이트 — `apps/fnb-client-a` · 화면 14개

| 주소 | 화면 | 목적 |
|---|---|---|
| `/` | Home | 브랜드의 주요 정보를 한 페이지에 요약하여 제공하고, 일반 고객과 창업 검토자를 각각의 경로로 안내합니다. |
| `/brand` | Brand | 브랜드가 지향하는 운영 원칙을 소개합니다. |
| `/menu` | Menu | 판매 중인 메뉴를 카테고리 기준으로 조회할 수 있는 메뉴 목록 페이지입니다. |
| `/menu/[itemId]` | Menu Detail | 개별 메뉴의 알레르기 유발 재료와 열량 정보를 제공하는 메뉴 상세 페이지입니다. |
| `/interior` | Interior | 평형별 인테리어 비용과 좌석 수, 공사 기간을 안내하는 인테리어 정보 페이지입니다. |
| `/marketing` | Marketing | 본사가 운영하는 마케팅 채널의 게시물을 채널별로 제공합니다. |
| `/stores` | Store Finder | 가맹점 위치와 영업 정보를 지도 및 목록으로 조회할 수 있는 매장 찾기 페이지입니다. |
| `/franchise` | Franchise | 가맹 창업에 필요한 비용 구조와 개설 절차를 안내하는 창업 안내 페이지입니다. |
| `/franchise/apply` | Franchise Apply | 가맹 창업 상담을 신청받는 페이지입니다. 최초 상담 연결에 필요한 최소 항목만 수집합니다. |
| `/franchise/faq` | Franchise FAQ | 창업 검토 단계에서 반복적으로 제기되는 질문에 대한 답변을 제공합니다. |
| `/support/notices` | Notices | 가격 변경 · 매장 개점 및 휴점 등 고객 문의로 이어질 수 있는 사항을 사전에 안내합니다. |
| `/support/faq` | FAQ | 매장 이용 고객이 반복적으로 제기하는 질문에 대한 답변을 제공합니다. |
| `/terms` | Terms | 이용약관 원문 확정 전까지 준비 중임을 안내하고 문의 경로를 제공합니다. |
| `/privacy` | Privacy | 가맹 상담 신청에서 수집하는 개인정보의 항목 · 이용 목적 · 보유 기간을 안내합니다. |

### F&B 콘솔 — `apps/fnb-admin` · 화면 33개

| 주소 | 화면 | 목적 |
|---|---|---|
| `/` | Dashboard | 당일 처리해야 할 항목을 우선 확인할 수 있는 운영 현황 페이지입니다. |
| `/menus` | Menus | 고객 사이트에 노출되는 메뉴와 가격 · 알레르기 정보를 조회하는 메뉴 목록 페이지입니다. |
| `/menus/[menuId]` | Menu Detail | 등록된 메뉴의 정보와 가격을 수정하는 메뉴 상세 페이지입니다. |
| `/menus/new` | Menu Create | 신규 메뉴를 등록하는 메뉴 등록 페이지입니다. |
| `/menus/categories` | Menu Categories | 메뉴 카테고리 구성과 카테고리별 등록 건수를 조회하는 페이지입니다. |
| `/marketing` | Marketing Posts | 채널별 마케팅 게시물과 노출 상태를 조회하는 마케팅 게시물 목록 페이지입니다. |
| `/marketing/[postId]` | Marketing Post Detail | 등록된 마케팅 게시물의 채널과 내용을 수정하는 상세 페이지입니다. |
| `/marketing/new` | Marketing Post Create | 채널에 게시한 마케팅 게시물을 등록하는 페이지입니다. |
| `/stores` | Stores | 고객 사이트 매장 찾기에 노출되는 가맹점과 영업 정보를 조회하는 가맹점 목록 페이지입니다. |
| `/stores/[storeId]` | Store Detail | 등록된 가맹점의 주소 · 전화번호 · 영업시간을 수정하는 가맹점 상세 페이지입니다. |
| `/stores/new` | Store Create | 신규 개점 예정 가맹점을 등록하는 가맹점 등록 페이지입니다. |
| `/inquiries` | Franchise Inquiries | 고객 사이트에서 접수된 가맹 창업 상담 신청을 조회하고 처리 현황을 관리하는 목록 페이지입니다. |
| `/inquiries/[inquiryId]` | Inquiry Detail | 접수된 창업 상담 문의를 확인하고 상담 이력을 기록하는 상세 페이지입니다. |
| `/franchise/faqs` | Franchise FAQ | 창업 검토자를 대상으로 하는 자주 묻는 질문을 관리하는 목록 페이지입니다. |
| `/franchise/faqs/[faqId]` | Franchise FAQ Detail | 등록된 창업 관련 질문과 답변을 수정하는 상세 페이지입니다. |
| `/franchise/faqs/new` | Franchise FAQ Create | 창업 검토자를 대상으로 하는 자주 묻는 질문을 등록하는 페이지입니다. |
| `/settings/franchise` | Franchise Cost | 고객 사이트 창업 안내에 게시된 비용 항목과 개설 절차를 조회하는 페이지입니다. |
| `/support/faqs` | Support FAQ | 매장 이용 고객을 대상으로 하는 자주 묻는 질문을 관리하는 목록 페이지입니다. |
| `/support/faqs/[faqId]` | Support FAQ Detail | 등록된 고객 문의 질문과 답변을 수정하는 상세 페이지입니다. |
| `/support/faqs/new` | Support FAQ Create | 매장 이용 고객을 대상으로 하는 자주 묻는 질문을 등록하는 페이지입니다. |
| `/support/notices` | Notices | 고객 사이트에 게시하는 공지사항을 관리하는 목록 페이지입니다. |
| `/support/notices/[noticeId]` | Notice Detail | 게시된 공지의 내용과 노출 설정을 수정하는 공지사항 상세 페이지입니다. |
| `/support/notices/new` | Notice Create | 신규 공지사항을 등록하는 페이지입니다. |
| `/banners/main` | Main Visuals | 고객 사이트 메인 배너를 관리하는 목록 페이지입니다. |
| `/banners/main/[bannerId]` | Main Visual Detail | 등록된 메인 배너의 내용과 게시 기간을 수정하는 상세 페이지입니다. |
| `/banners/main/new` | Main Visual Create | 고객 사이트 메인 배너를 등록하는 페이지입니다. |
| `/banners/popups` | Popups | 고객 사이트 팝업을 관리하는 목록 페이지입니다. |
| `/banners/popups/[popupId]` | Popup Detail | 등록된 팝업의 내용과 노출 방식을 수정하는 상세 페이지입니다. |
| `/banners/popups/new` | Popup Create | 고객 사이트 팝업을 등록하는 페이지입니다. |
| `/settings/brand` | Brand Settings | 고객 사이트가 조회하는 브랜드 기본 정보를 관리하는 설정 페이지입니다. |
| `/settings/admins` | Admins | 관리자 콘솔 접속 계정을 조회하는 관리자 목록 페이지입니다. |
| `/settings/admins/[adminId]` | Admin Detail | 관리자 계정의 권한 등급과 상태를 수정하는 상세 페이지입니다. |
| `/settings/admins/new` | Admin Create | 관리자 콘솔 접속 계정을 등록하는 페이지입니다. |

### 사내 콘솔 — `apps/internal-admin` · 화면 23개

| 주소 | 화면 | 목적 |
|---|---|---|
| `/` | Dashboard | 처리가 필요한 항목을 한 화면에 요약하여 제공하는 운영 현황 페이지입니다. |
| `/tenants` | Tenants | 계약 중인 고객사를 조회하고 계약 상태를 관리하는 고객사 목록 페이지입니다. |
| `/tenants/pipeline` | Pipeline | 계약 이전 단계를 포함한 도입 진행 현황을 관리하는 파이프라인 페이지입니다. |
| `/tenants/activities` | Activities | 고객사 응대 이력을 기록하고 조회하는 활동 이력 페이지입니다. |
| `/tenants/contacts` | Contacts | 고객사 담당자를 역할별로 관리하는 담당자 목록 페이지입니다. |
| `/tenants/churned` | Churned Tenants | 계약이 종료된 고객사와 종료 사유를 조회하는 이탈 고객사 페이지입니다. |
| `/tenants/[tenantId]` | Tenant Detail | 개별 고객사의 계약 · 배포 · 청구 정보를 제공하는 고객사 상세 페이지입니다. |
| `/subscriptions/plans` | Plans | 도메인별 구독 등급과 제공 기능을 관리하는 플랜 관리 페이지입니다. |
| `/subscriptions/roles` | Roles | 고객사 콘솔의 역할 구성과 담당 범위를 조회하는 권한 목록 페이지입니다. |
| `/subscriptions/roles/[roleId]` | Role Detail | 역할별 자원 권한을 설정하는 권한 상세 페이지입니다. |
| `/inquiries` | Inquiries | 고객사가 접수한 문의를 조회하고 답변하는 문의 관리 페이지입니다. |
| `/integrations/pg` | Integration PG | 고객사의 결제 연동 정보를 설정하는 PG 연동 관리 페이지입니다. |
| `/integrations/oauth` | Integration OAuth | 고객사의 소셜 로그인 연동 정보를 설정하는 OAuth 연동 관리 페이지입니다. |
| `/integrations/plugin` | Integration Plugin | 고객사 배포에 적용할 외부 서비스를 설정하는 플러그인 관리 페이지입니다. |
| `/integrations/dns` | Integration DNS / SSL | 고객사 도메인의 DNS 레코드와 SSL 인증서를 관리하는 도메인 연동 페이지입니다. |
| `/statistics/revenue` | Revenue | 고객사 대상 매출 현황을 조회하는 매출 통계 페이지입니다. |
| `/statistics/members` | Members | 고객사 사이트의 회원 규모를 조회하는 회원 통계 페이지입니다. |
| `/billing/due` | Billing Due | 예정 청구를 등록하고 납부 기한을 관리하는 청구 예정 페이지입니다. |
| `/billing/overdue` | Billing Overdue | 납부 기한이 경과한 청구를 경과 기간별로 조회하는 연체 관리 페이지입니다. |
| `/settings/staff` | Staff | 관리자 콘솔 접속 계정을 관리하는 관리자 계정 페이지입니다. |
| `/settings/notifications` | Notifications | 통계와 결제에서 발생하는 알림의 발송 조건을 설정하는 알림 설정 페이지입니다. |
| `/settings/codes` | Codes | 여러 화면이 공통으로 사용하는 기준 값을 관리하는 기준 값 관리 페이지입니다. |
| `/result` | Result | 처리 결과를 안내하고 이동 경로를 제공하는 처리 결과 페이지입니다. |

## 디렉토리

```
WinPilot-Product/
├─ apps/                     앱 7벌
│  └─ <앱>/
│     ├─ app/                화면 (Next App Router)
│     │  └─ docs/            문서 화면 — 목적 · 범위 · IA · 명세 · 화면 사진
│     ├─ lib/                화면 명세 · IA · 흐름 · 내비게이션
│     ├─ docs/               생성된 명세와 화면 사진 목록
│     ├─ public/             사진과 영상
│     └─ pages.manifest.ts   화면 등록부 — 여기 없는 화면은 검사에 잡히지 않습니다
├─ packages/                 앱들이 나눠 쓰는 조각
├─ tools/                    검사기와 문서 생성기
├─ figma-plugin/             화면을 Figma 로 옮기는 플러그인
└─ docs/                     저장소 전체에 걸리는 규칙과 정책
```

| 패키지 | 무엇 |
|---|---|
| `@winpilot/store` | 화면에 나오는 값. 서버가 없어 이 패키지가 그 자리를 대신합니다 |
| `@winpilot/ui` | 버튼 · 입력 · 표처럼 화면을 가리지 않고 쓰는 조각 |
| `@winpilot/tokens` | 색 · 글자 · 간격. 값의 원본이 이 한 곳입니다 |
| `@winpilot/docs` | 문서 화면을 그리는 조각과 공통 문서 |
| `@winpilot/spec` | 기능 레지스트리 — 이름과 주소의 규칙 |
| `@winpilot/uir` | IR · F&B 계열에서 쓰는 조각 |
| `@winpilot/geo` | 행정구역 경계 데이터 |
| `@winpilot/client-content` | 고객 화면이 읽는 모양으로 값을 옮겨 담는 층 |

## 시작하기

```bash
pnpm install

pnpm dev:client       # 쇼핑몰        http://localhost:3310
pnpm dev:admin        # B2C 콘솔      http://localhost:3301
pnpm dev:ir           # IR 홈페이지    http://localhost:3304
pnpm dev:ir-admin     # IR 콘솔       http://localhost:3303
pnpm dev:fnb          # F&B 사이트     http://localhost:3305
pnpm dev:fnb-admin    # F&B 콘솔      http://localhost:3306
pnpm dev:internal     # 사내 콘솔      http://localhost:3302
```

`pnpm -r dev` 로 한 번에 띄우지 않습니다 — 하나가 죽으면 나머지가 함께 내려가고, 어느 것이
먼저 죽었는지 로그에 남지 않습니다.

## 검사

```bash
pnpm spec:check      # 이름과 주소, 매니페스트가 레지스트리와 맞는지
pnpm sync:check      # 레지스트리에 적힌 컴포넌트 이름이 실제 파일에도 그대로인지
pnpm docs:check      # 화면은 있는데 문서가 비어 있는 자리가 있는지
pnpm bind:check      # 화면이 적어 둔 값의 출처가 아직 남아 있는지
pnpm overflow:check  # 네 가지 너비에서 가로로 넘치는 곳이 있는지 (개발 서버 필요)
pnpm weight:check    # 화면 하나가 실제로 몇 바이트를 내려받는지 (빌드 후 next start 기준)
pnpm typecheck       # 전체 워크스페이스 타입 검사
pnpm build           # 전체 빌드
```

검사를 여럿 두는 것은 하나가 나머지를 대신하지 못하기 때문입니다. 실제로 운영 콘솔에서 화면
열 개를 지웠을 때 고객 화면 열일곱 곳이 이미 없어진 메뉴를 계속 가리키고 있었는데, 그 시점에
나머지 검사는 모두 통과 상태였습니다. `bind:check` 는 그 일을 겪고 나서 만들었습니다.

## 문서 만들기

```bash
pnpm docs:build      # 화면 등록부에서 기능 · 비기능 명세와 전체 범위를 펼칩니다
pnpm pages:shoot     # 앱마다 화면 사진을 한 장씩 찍습니다 (개발 서버 필요)
pnpm readme:build    # 이 파일을 다시 만듭니다
```

본 README 는 **생성 문서**입니다. 화면 목록과 집계 수치를 직접 작성하면 화면 추가 시 수정
대상이 두 곳이 되며, 일부만 갱신되는 문제가 발생합니다.

## 분리 배포 저장소

IR 한 쌍은 별도 저장소로도 배포합니다.

| 저장소 | 포함 범위 |
|---|---|
| `spaceplanning-ai/spaceplanning-client` | `apps/ir-client-a` 와 해당 앱이 사용하는 패키지 5개 |
| `spaceplanning-ai/spaceplanning-admin` | `apps/ir-admin` 과 해당 앱이 사용하는 패키지 7개 |

공유 패키지가 3개 저장소에 동일한 사본으로 포함됩니다. `@winpilot/store` 는 사이트와 콘솔이
**동일한 데이터를 조회하는 것을 전제**로 설계한 패키지이므로 원본 저장소를 먼저 확정해야
합니다. 양쪽에서 개별 수정하면 본 저장소가 방지하려는 데이터 불일치가 발생합니다.
