# 기능 명세서 — B2C Client 템플릿 A

> 원본: `apps/b2c-client-a/lib/screen-specs.ts` · 생성: `pnpm docs:build`

화면 하나가 문서 하나다. 한 장에 모두 적으면 화면 하나를 고칠 때마다 긴 문서를 훑어야 하고,
어느 화면의 명세가 비어 있는지도 보이지 않는다.

## 화면

| 순번 | 화면 | 경로 | 명세 |
|---|---|---|---|
| 1 | Index | `/` | [열기](/docs/fsd/index) |
| 10 | Product List | `/products` | [열기](/docs/fsd/products) |
| 11 | Product Detail | `/products/[productId]` | [열기](/docs/fsd/products-detail) |
| 20 | Notices | `/notices` | [열기](/docs/fsd/notices) |
| 21 | Notice Detail | `/notices/[noticeId]` | [열기](/docs/fsd/notices-detail) |
| 22 | FAQ | `/faqs` | [열기](/docs/fsd/faqs) |
| 23 | FAQ Detail | `/faqs/[faqId]` | [열기](/docs/fsd/faqs-detail) |
| 24 | News | `/news` | [열기](/docs/fsd/news) |
| 25 | News Detail | `/news/[newsId]` | [열기](/docs/fsd/news-detail) |
| 26 | Portfolios | `/portfolios` | [열기](/docs/fsd/portfolios) |
| 30 | Cart | `/cart` | [열기](/docs/fsd/cart) |
| 31 | Alarms | `/alarms` | [열기](/docs/fsd/alarms) |
| 32 | Orders | `/orders` | [열기](/docs/fsd/orders) |
| 33 | Checkout | `/orders/new` | [열기](/docs/fsd/orders-new) |
| 34 | Order Detail | `/orders/[orderId]` | [열기](/docs/fsd/orders-detail) |
| 35 | My Page | `/mypage` | [열기](/docs/fsd/mypage) |
| 36 | My Page Inquiries | `/mypage/inquiries` | [열기](/docs/fsd/mypage-inquiries) |
| 37 | My Page Coupons | `/mypage/coupons` | [열기](/docs/fsd/mypage-coupons) |
| 40 | Login | `/login` | [열기](/docs/fsd/login) |
| 41 | Signup | `/signup` | [열기](/docs/fsd/signup) |
| 50 | Company | `/company` | [열기](/docs/fsd/company) |
| 52 | Company History | `/company/history` | [열기](/docs/fsd/company-history) |
| 51 | Contact | `/contact` | [열기](/docs/fsd/contact) |
| 60 | Terms | `/terms` | [열기](/docs/fsd/terms) |
| 61 | Privacy | `/privacy` | [열기](/docs/fsd/privacy) |
| 90 | Result | `/result` | [열기](/docs/fsd/result) |

## 가정

- 이 문서는 **지금 이 앱에 실제로 있는 화면**만 적는다. 있을 법한 화면을 미리 적지 않는다 —
  적어 두면 그것을 보고 만드는 사람이 이미 있는 줄 안다.
- 매니페스트의 모든 화면에 명세가 있다.
- 서버·DB·권한·로그는 다루지 않는다. 이 프로젝트는 **프론트엔드 전용**이라 그런 것이 없다.
