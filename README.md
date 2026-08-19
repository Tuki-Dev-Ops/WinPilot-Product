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
| `/` | Index | 무엇을 파는 곳인지와 지금 밀고 있는 것을 한 화면에서 보여 줍니다. |
| `/products` | Product List | 파는 것 전부를 한 자리에서 좁혀 가며 고릅니다. |
| `/products/[productId]` | Product Detail | 이 상품을 살지 결정하는 데 필요한 것만 모아 둡니다. |
| `/notices` | Notices | 운영자가 알리는 것을 최신 순으로 봅니다. |
| `/notices/[noticeId]` | Notice Detail | 공지 한 건을 읽습니다. |
| `/faqs` | FAQ | 자주 묻는 것을 분류와 함께 훑습니다. |
| `/faqs/[faqId]` | FAQ Detail | 문답 한 건을 읽는다. |
| `/news` | News | 회사 소식을 최신 순으로 본다. |
| `/news/[newsId]` | News Detail | 뉴스 한 건의 요약을 읽고 원문으로 간다. |
| `/portfolios` | Portfolios | 무엇을 만들어 왔는지 훑습니다. |
| `/cart` | Cart | 담아 둔 것을 확인하고 주문으로 넘깁니다. |
| `/alarms` | Alarms | 읽지 않은 소식을 먼저 봅니다. |
| `/orders` | Orders | 내 주문이 지금 어디까지 왔는지 봅니다. |
| `/orders/new` | Checkout | 무엇을·어디로·얼마에 세 가지를 한 화면에서 확정합니다. |
| `/orders/[orderId]` | Order Detail | 한 주문의 결제·배송·운송장을 확인합니다. |
| `/mypage` | My Page | 내 정보를 확인하고 필요할 때만 고칩니다. |
| `/mypage/inquiries` | My Page Inquiries | 내가 보낸 문의와 운영자의 답변을 한 자리에서 봅니다. |
| `/mypage/coupons` | My Page Coupons | 가진 쿠폰과 받을 수 있는 쿠폰을 나눠 봅니다. |
| `/login` | Login | 계정으로 들어옵니다. |
| `/signup` | Signup | 계정을 만듭니다. |
| `/company` | Company | 무엇을 하는 회사인지 읽습니다. |
| `/company/history` | Company History | 어떻게 커 왔는지 봅니다. |
| `/contact` | Contact | 문의를 보냅니다. |
| `/terms` | Terms | 이용약관을 읽는다. |
| `/privacy` | Privacy | 개인정보 처리방침을 읽는다. |
| `/result` | Result | 방금 한 일이 끝났는지 알립니다. |

### B2C 콘솔 — `apps/b2c-admin` · 화면 44개

| 주소 | 화면 | 목적 |
|---|---|---|
| `/` | Dashboard | 오늘 봐야 할 것을 한 화면에 모읍니다. |
| `/login` | Login | 운영자만 들어오게 합니다. |
| `/users` | Users | 가입한 사람을 찾고 상태를 봅니다. |
| `/users/admins` | Users Staff | 운영자 계정을 만들고 거둡니다. |
| `/users/grades` | Users Grades | 등급과 혜택을 정합니다. |
| `/products/categories` | Product Categories | 상품을 담을 서랍을 만듭니다. |
| `/products` | Product List | 파는 것을 찾고 상태를 바꿉니다. |
| `/products/new` | Product Create | 팔 것을 새로 올립니다. |
| `/products/[productId]` | Product Detail | 올린 상품을 고칩니다. |
| `/products/sales` | Product Sales | 들어온 주문을 처리합니다. |
| `/products/sales/[orderId]` | Product Sale Detail | 주문 한 건을 자세히 봅니다. |
| `/inquiries` | Inquiries | 들어온 문의에 답합니다. |
| `/inquiries/settings` | Inquiry Settings | 문의 분류와 안내문을 정합니다. |
| `/contents/notices` | Content Notices | 공지사항을(를) 찾고 상태를 봅니다. |
| `/contents/notices/new` | Content Notice Create | 공지사항을(를) 새로 씁니다. |
| `/contents/notices/[noticeId]` | Content Notice Detail | 공지사항을(를) 고칩니다. |
| `/contents/faqs` | Content FAQ | FAQ을(를) 찾고 상태를 봅니다. |
| `/contents/news` | Content News | 뉴스을(를) 찾고 상태를 봅니다. |
| `/contents/news/new` | Content News Create | 뉴스을(를) 새로 씁니다. |
| `/contents/news/[newsId]` | Content News Detail | 뉴스을(를) 고칩니다. |
| `/contents/portfolios` | Content Portfolios | 포트폴리오을(를) 찾고 상태를 봅니다. |
| `/contents/portfolios/new` | Content Portfolio Create | 포트폴리오을(를) 새로 씁니다. |
| `/contents/portfolios/[portfolioId]` | Content Portfolio Detail | 포트폴리오을(를) 고칩니다. |
| `/banners` | Banners | 홈 맨 위에 무엇을 걸지 정합니다. |
| `/banners/new` | Banner Create | 배너를 새로 만듭니다. |
| `/banners/[bannerId]` | Banner Detail | 배너를 고칩니다. |
| `/banners/popups` | Banner Popups | 띄울 팝업을 정합니다. |
| `/banners/popups/new` | Banner Popup Create | 팝업을 새로 만듭니다. |
| `/banners/popups/[popupId]` | Banner Popup Detail | 팝업을 고칩니다. |
| `/company/about` | Company About | 회사 소개 글과 대표 이미지를 넣습니다. |
| `/company/history` | Company History | 연혁을 쌓습니다. |
| `/statistics` | Statistics Home | 오늘의 지표를 봅니다. |
| `/statistics/periods` | Statistics Periods | 기간별 흐름를 봅니다. |
| `/statistics/pages` | Statistics Pages | 많이 방문한 페이지를 봅니다. |
| `/statistics/revenue` | Statistics Revenue | 매출를 봅니다. |
| `/settings/supplier` | Settings Supplier | 공급자 정보를 정합니다. |
| `/settings/seo` | Settings SEO | SEO 정보를 정합니다. |
| `/settings/terms` | Settings Terms | 서비스 이용약관를 정합니다. |
| `/settings/privacy` | Settings Privacy | 개인정보 처리방침를 정합니다. |
| `/support` | Support | 이 콘솔에서 직접 바꿀 수 없는 것을 스페이스플래닝에 묻습니다. |
| `/products/reviews` | Product Reviews | 고객이 남긴 리뷰를 관리합니다. |
| `/products/coupons` | Product Coupons | 할인 쿠폰을 만들고 거둡니다. |
| `/ssot/components` | Components | 쓰고 있는 컴포넌트를 실제로 그려 봅니다. |
| `/result` | Result | 방금 한 일이 끝났음을 알립니다. |

### IR 회사 홈페이지 — `apps/ir-client-a` · 화면 19개

| 주소 | 화면 | 목적 |
|---|---|---|
| `/` | Home | 처음 방문하신 분께 어떤 회사이고 무엇을 파는지를 한 화면에서 답합니다. |
| `/about` | About | 어떤 곳을 바라보고 무슨 일을 하며 무엇을 파는 회사인지를 순서대로 말씀드립니다. |
| `/about/history` | History | 언제 어떤 일이 있었는지를 연도 단위로 훑어보실 수 있게 합니다. |
| `/about/certifications` | Certifications | 가지고 오신 등록번호가 실제로 이 회사의 것인지 확인하실 수 있게 합니다. |
| `/about/certifications/[credentialId]` | Certification Detail | 특허 한 건을 그대로 가리키는 주소를 드립니다. |
| `/solutions/consulting` | Smart Consulting | 사람이 직접 하는 일이라는 점을, 무엇을 해 드리는지부터 읽히게 합니다. |
| `/solutions/infra` | Infra Service | 인프라를 보러 오신 분을 제품 목록으로 돌려보내지 않고 그 자리에서 답합니다. |
| `/solutions/mes` | Cloud MES | 설비 신호를 하나의 규격으로 모으는 제품이 어떤 문제를 푸는지 보여 드립니다. |
| `/solutions/erp` | Cloud ERP | 수주에서 정산까지를 한 줄로 잇는 제품이 어떤 문제를 푸는지 보여 드립니다. |
| `/solutions/crm` | Cloud CRM | 공정의 끝에서 고객을 이어받는 제품이 어떤 문제를 푸는지 보여 드립니다. |
| `/solutions/dxp` | Cloud DXP | 고객이 만나는 화면을 만드는 제품이 어떤 문제를 푸는지 보여 드립니다. |
| `/products` | Products | 무엇을 파는지 한눈에 훑어보시고, 하나를 골라 상세로 들어가실 수 있습니다. |
| `/support/contact` | Contact | 도입 검토부터 주주 문의까지 한 자리에서 받습니다. |
| `/support/notices` | Notices | 휴무와 연락처, 약관 개정처럼 미리 알려 드려야 하는 내용을 확인하실 수 있게 합니다. |
| `/support/news` | Support News | 방송과 행사, 제품 소개로 남은 자료를 찾으러 오신 분께 전부 펼쳐 드립니다. |
| `/support/faq` | FAQ | 자주 받는 질문을 분류와 검색으로 찾아, 그 자리에서 펼쳐 읽으실 수 있게 합니다. |
| `/support/directions` | Directions | 본사 주소와 찾아오시는 방법을 그대로 가져가실 수 있게 합니다. |
| `/terms` | Terms | 약관 원고가 도착하기 전까지, 준비 중이라는 사실과 문의하실 곳을 안내합니다. |
| `/privacy` | Privacy | 처리방침 원고가 도착하기 전까지, 어디에 문의하시면 되는지를 안내합니다. |

### IR 콘솔 — `apps/ir-admin` · 화면 44개

| 주소 | 화면 | 목적 |
|---|---|---|
| `/` | Dashboard | 아침에 여는 사람이 묻는 둘에 답한다 — 얼마나 들어왔는가, 어디서 들어왔는가. |
| `/inquiries` | Inquiries | 사이트 양식으로 들어온 것 중 **아직 답하지 않은 것**을 찾습니다. |
| `/inquiries/[inquiryId]` | Inquiry Detail | 들어온 문의를 읽고 답을 적어 상태를 옮깁니다. |
| `/inquiries/settings` | Inquiry Settings | 사이트 문의 양식이 **무엇을 묻고 어디로 보내고 무엇을 안내할지**를 정합니다. |
| `/contents/notices` | Notices | 회사 홈페이지의 공지를 찾고 살핍니다. |
| `/contents/notices/new` | Notice Create | 사이트에 걸 공지를 새로 적습니다. |
| `/contents/notices/[noticeId]` | Notice Detail | 이미 걸린 공지의 말과 노출을 고칩니다. |
| `/contents/news` | News | 방송·행사·제품 소개로 남은 것들을 찾고 살핍니다. |
| `/contents/news/new` | News Create | 새 소식 한 건을 적어 사이트에 겁니다. |
| `/contents/news/[newsId]` | News Detail | 이미 걸린 소식의 제목과 무늬를 고칩니다. |
| `/contents/faqs` | FAQ | 자주 받는 물음과 답을 찾고 살핍니다. |
| `/contents/faqs/new` | FAQ Create | 되풀이되는 물음 하나를 옮겨 적어 문의를 줄입니다. |
| `/contents/faqs/[faqId]` | FAQ Detail | 이미 걸린 물음과 답을 고칩니다. |
| `/products` | Products | 계약하면 그날부터 쓰는 클라우드 제품 넷의 이름과 기능을 살핍니다. |
| `/products/[productId]` | Product Detail | 제품 하나를 소개하는 **말**을 고친다 — 구조는 못 고칩니다. |
| `/products/settings` | Product Settings | 사이트 PRODUCT 메뉴에 무엇이 어떤 차례로 서는지 정합니다. |
| `/solutions` | Problem & Approach | 제품 넷이 **어떤 문제를 어떻게 푸는지**가 채워졌는지 살핍니다. |
| `/solutions/[solutionId]` | Problem & Approach Detail | 문제와 해법의 **말**을 고친다 — 제품 상세와 같은 폼입니다. |
| `/solutions/settings` | Home Stage Order | 홈 화면 무대에 서는 여섯의 차례를 **확인한다**. |
| `/services` | Services | 사람이 현장에 가서 하는 일 둘의 상세가 채워졌는지 살핍니다. |
| `/services/[serviceId]` | Service Detail | 서비스 하나를 소개하는 말을 고친다 — 제품 상세와 같은 폼입니다. |
| `/services/settings` | Service Settings | 서비스 둘이 **사이트 어디에 어떤 말로 서는지**를 한자리에서 봅니다. |
| `/company/about` | Company Profile | 홈 소개 문단과 회사 정보가 지금 무엇으로 서 있는지 **확인한다**. |
| `/company/history` | Milestones | 사이트 연혁에 서는 줄들을 찾고 살핍니다. |
| `/company/history/new` | Milestone Create | 연혁 한 줄을 새로 적습니다. |
| `/company/history/[milestoneId]` | Milestone Detail | 이미 적힌 연혁 한 줄을 고칩니다. |
| `/company/credentials` | Credentials | 특허와 인증을 등록번호로 찾고 살핍니다. |
| `/company/credentials/new` | Credential Create | 받은 특허 · 인증을 사이트에 세웁니다. |
| `/company/credentials/[credentialId]` | Credential Detail | 이미 세운 특허 · 인증을 고칩니다. |
| `/banners` | Hero Banners | 첫 화면 위에 기간을 갖고 서는 배너를 찾고 살핍니다. |
| `/banners/new` | Banner Create | 첫 화면에 걸 배너를 새로 만듭니다. |
| `/banners/[bannerId]` | Banner Detail | 걸린 배너의 말과 기간을 고칩니다. |
| `/banners/popups` | Popups | 들어오자마자 뜨는 창을 찾고 살핍니다. |
| `/banners/popups/new` | Popup Create | 들어온 사람이 반드시 읽어야 하는 고지를 창으로 띄웁니다. |
| `/banners/popups/[popupId]` | Popup Detail | 뜨고 있는 창의 말과 기간을 고칩니다. |
| `/statistics` | Statistics | 사이트 방문과 문의를 한 화면에서 나란히 봅니다. |
| `/statistics/period` | Period Analysis | 달마다의 방문과 문의를 나란히 놓고 어느 달이 달랐는지 봅니다. |
| `/statistics/pages` | Page Visits | 어느 화면이 실제로 읽히는지 봅니다. |
| `/settings/supplier` | Supplier Info | 사이트 아래에 **법이 적으라고 정한** 사업자 표시를 정합니다. |
| `/settings/seo` | SEO | 검색 결과와 링크를 붙였을 때 뜨는 카드에 적히는 값을 정합니다. |
| `/settings/terms` | Terms | 사이트 아래의 서비스 이용약관 링크가 여는 글을 적고 겁니다. |
| `/settings/privacy` | Privacy Policy | 사이트 아래의 개인정보 처리방침 링크가 여는 글을 적고 겁니다. |
| `/settings/locales` | Locales | 사이트 문구를 국문 · 영문 **짝으로** 관리합니다. |
| `/result` | Result | 방금 한 일의 결말을 알리고 돌아갈 길을 줍니다. |

### F&B 브랜드 사이트 — `apps/fnb-client-a` · 화면 14개

| 주소 | 화면 | 목적 |
|---|---|---|
| `/` | Home | 무엇을 파는 집인지 한 화면에서 답하고, 손님 길과 점주 길을 갈라 보냅니다. |
| `/brand` | Brand | 무엇을 지키는 집인지 읽습니다. |
| `/menu` | Menu | 파는 것을 묶음별로 훑고 한 가지를 고릅니다. |
| `/menu/[itemId]` | Menu Detail | 메뉴 한 가지의 알레르기와 열량을 확인합니다. |
| `/interior` | Interior | 평형별로 얼마 들고 몇 석이 나오는지 보입니다. |
| `/marketing` | Marketing | 본사가 밖에서 무엇을 하고 있는지를 올린 것으로 보입니다. |
| `/stores` | Store Finder | 가까운 매장을 찾고 거기까지 어떻게 가는지 봅니다. |
| `/franchise` | Franchise | 얼마 드는지와 문 여는 날까지 얼마 걸리는지를 먼저 적습니다. |
| `/franchise/apply` | Franchise Apply | 첫 통화를 걸기 위한 최소만 받는다 — 성함 · 연락처 · 지역 · 예산. |
| `/franchise/faq` | Franchise FAQ | 글로 답이 안 나온 사람에게 물을 곳을 먼저 주고, 그다음 물음을 분류와 함께 폅니다. |
| `/support/notices` | Notices | 값이 바뀌거나 매장이 열고 닫히는 일을 묻기 전에 읽힙니다. |
| `/support/faq` | FAQ | 드시러 오시는 분이 자주 묻는 것을 한 자리에 모읍니다. |
| `/terms` | Terms | 약관 원고가 오기 전까지 준비 중이라는 사실과 물어볼 곳을 적습니다. |
| `/privacy` | Privacy | 창업 상담 신청에서 무엇을 받아 어디에 쓰고 얼마나 갖고 있는지를 적습니다. |

### F&B 콘솔 — `apps/fnb-admin` · 화면 33개

| 주소 | 화면 | 목적 |
|---|---|---|
| `/` | Dashboard | 오늘 손대야 할 것 하나를 먼저 보여 줍니다. |
| `/menus` | Menus | 메뉴판에 서는 것과 값·알레르기를 찾고 살핍니다. |
| `/menus/[menuId]` | Menu Detail | 이미 파는 메뉴의 말과 값을 고칩니다. |
| `/menus/new` | Menu Create | 팔기로 한 것을 먼저 적어 둡니다. |
| `/menus/categories` | Menu Categories | 묶음마다 몇 가지가 서 있는지 봅니다. |
| `/marketing` | Marketing Posts | 창구마다 무엇을 올렸는지 찾고 상태를 봅니다. |
| `/marketing/[postId]` | Marketing Post Detail | 이미 올린 글의 창구와 말을 고칩니다. |
| `/marketing/new` | Marketing Post Create | 창구에 올린 글을 옮겨 적습니다. |
| `/stores` | Stores | 사이트 매장 찾기에 서는 것과 영업 정보를 찾고 살핍니다. |
| `/stores/[storeId]` | Store Detail | 문 연 매장의 주소·번호·시간을 고칩니다. |
| `/stores/new` | Store Create | 새로 낼 매장을 미리 세워 둡니다. |
| `/inquiries` | Franchise Inquiries | 차리려는 사람이 남긴 것을 받아 밀리지 않게 봅니다. |
| `/inquiries/[inquiryId]` | Inquiry Detail | 문의 한 건을 읽고 통화에서 알게 된 것을 쌓습니다. |
| `/franchise/faqs` | Franchise FAQ | 차리려는 사람이 묻는 것을 모아 둡니다. |
| `/franchise/faqs/[faqId]` | Franchise FAQ Detail | 창업 물음 하나의 말과 답을 고칩니다. |
| `/franchise/faqs/new` | Franchise FAQ Create | 되풀이되는 창업 물음을 새로 적습니다. |
| `/settings/franchise` | Franchise Cost | 사이트 창업 안내에 지금 무엇이 적혀 있는지 한자리에서 봅니다. |
| `/support/faqs` | Support FAQ | 드시러 오시는 분이 묻는 것을 모아 둡니다. |
| `/support/faqs/[faqId]` | Support FAQ Detail | 손님 물음 하나의 말과 답을 고칩니다. |
| `/support/faqs/new` | Support FAQ Create | 되풀이되는 손님 물음을 새로 적습니다. |
| `/support/notices` | Notices | 손님이 사이트에서 읽는 글을 찾고 상태를 봅니다. |
| `/support/notices/[noticeId]` | Notice Detail | 이미 걸린 공지의 말과 자리를 고칩니다. |
| `/support/notices/new` | Notice Create | 알릴 것을 새로 적습니다. |
| `/banners/main` | Main Visuals | 사이트 첫 화면에 걸리는 것을 세우고 내립니다. |
| `/banners/main/[bannerId]` | Main Visual Detail | 이미 건 배너의 말과 기간을 고칩니다. |
| `/banners/main/new` | Main Visual Create | 첫 화면에 걸 것을 새로 만듭니다. |
| `/banners/popups` | Popups | 화면을 막고 뜨는 것을 세우고 내립니다. |
| `/banners/popups/[popupId]` | Popup Detail | 이미 띄운 팝업의 말과 닫는 방법을 고칩니다. |
| `/banners/popups/new` | Popup Create | 꼭 읽혀야 하는 것을 새로 띄웁니다. |
| `/settings/brand` | Brand Settings | 사이트가 읽는 브랜드 값 한 벌을 고칩니다. |
| `/settings/admins` | Admins | 이 콘솔에 들어오는 사람을 봅니다. |
| `/settings/admins/[adminId]` | Admin Detail | 들어오는 사람의 권한과 상태를 고칩니다. |
| `/settings/admins/new` | Admin Create | 들어올 사람을 새로 들입니다. |

### 사내 콘솔 — `apps/internal-admin` · 화면 23개

| 주소 | 화면 | 목적 |
|---|---|---|
| `/` | Dashboard | 오늘 손대야 할 것을 한 화면에 모읍니다. |
| `/tenants` | Tenants | 지금 맡고 있는 고객사를 찾고 상태를 봅니다. |
| `/tenants/pipeline` | Pipeline | 아직 고객사가 아닌 곳까지 한 줄에 세워 도입 단계를 봅니다. |
| `/tenants/activities` | Activities | 언제 누구와 무엇을 했는지를 남깁니다. |
| `/tenants/contacts` | Contacts | 고객사 쪽 사람을 역할별로 나눠 둡니다. |
| `/tenants/churned` | Churned Tenants | 떠난 고객사와 그 이유를 남깁니다. |
| `/tenants/[tenantId]` | Tenant Detail | 고객사 하나의 계약·배포·청구를 한 화면에서 봅니다. |
| `/subscriptions/plans` | Plans | 도메인마다 등급 셋이 무엇을 여는지 정합니다. |
| `/subscriptions/roles` | Roles | 고객사 콘솔의 역할이 도메인마다 몇 개이고 누가 무엇을 맡는지 봅니다. |
| `/subscriptions/roles/[roleId]` | Role Detail | 역할 하나가 자원마다 어디까지 하는지를 켜고 끕니다. |
| `/inquiries` | Inquiries | 고객사가 우리에게 보낸 문의를 받아 답합니다. |
| `/integrations/pg` | Integration PG | 고객사의 결제 연동을 우리가 대신 잡습니다. |
| `/integrations/oauth` | Integration OAuth | 고객사의 소셜 로그인 연동을 우리가 대신 잡습니다. |
| `/integrations/plugin` | Integration Plugin | 고객사 배포에 얹는 조각을 켜고 끕니다. |
| `/integrations/dns` | Integration DNS / SSL | 고객사 도메인이 우리 배포를 가리키게 하고, 그 도메인의 SSL 인증서를 대신 받아 갱신합니다. |
| `/statistics/revenue` | Revenue | 우리가 고객사에게 받는 돈의 흐름을 읽습니다. |
| `/statistics/members` | Members | 고객사 사이트에 가입한 사람의 규모를 읽습니다. |
| `/billing/due` | Billing Due | 앞으로 받을 청구를 만들고 기한을 지킵니다. |
| `/billing/overdue` | Billing Overdue | 기한이 지난 청구를 구간별로 봅니다. |
| `/settings/staff` | Staff | 이 콘솔에 들어오는 우리 직원을 관리합니다. |
| `/settings/notifications` | Notifications | 통계·결제가 만들어 내는 신호를 어디로 보낼지 정합니다. |
| `/settings/codes` | Codes | 여러 화면이 함께 쓰는 목록을 한 곳에서 정합니다. |
| `/result` | Result | 방금 한 일의 결말을 알리고 돌아갈 길을 줍니다. |

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

이 README 는 **생성물**입니다. 화면 목록과 숫자를 손으로 옮겨 적으면 화면이 하나 늘 때
고칠 곳이 둘이 되고, 실제로는 한쪽만 고칩니다.

## 떼어 낸 저장소

IR 한 쌍은 별도 저장소로도 나가 있습니다.

| 저장소 | 담긴 것 |
|---|---|
| `spaceplanning-ai/spaceplanning-client` | `apps/ir-client-a` + 그 앱이 쓰는 패키지 5 |
| `spaceplanning-ai/spaceplanning-admin` | `apps/ir-admin` + 그 앱이 쓰는 패키지 7 |

공유 패키지가 세 저장소에 같은 사본으로 들어 있습니다. 특히 `@winpilot/store` 는 사이트와
콘솔이 **같은 값을 읽는다는 전제**로 만든 패키지라, 어느 쪽을 원본으로 볼지 먼저 정해야
합니다. 양쪽에서 따로 고치면 이 저장소가 처음부터 막으려던 문제가 그대로 생깁니다.
