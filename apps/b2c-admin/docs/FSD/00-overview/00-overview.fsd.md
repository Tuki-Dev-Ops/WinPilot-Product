# 기능 명세서 — B2C Admin

> 원본: `apps/b2c-admin/lib/screen-specs.ts` · 생성: `pnpm docs:build`

화면 하나가 문서 하나다. 한 장에 모두 적으면 화면 하나를 고칠 때마다 긴 문서를 훑어야 하고,
어느 화면의 명세가 비어 있는지도 보이지 않는다.

## 화면

| 순번 | 화면 | 경로 | 명세 |
|---|---|---|---|
| 1 | Dashboard | `/` | [열기](/docs/fsd/dashboard) |
| 2 | Login | `/login` | [열기](/docs/fsd/login) |
| 10 | Users | `/users` | [열기](/docs/fsd/users) |
| 11 | Users Staff | `/users/admins` | [열기](/docs/fsd/users-admins) |
| 12 | Users Grades | `/users/grades` | [열기](/docs/fsd/users-grades) |
| 20 | Product Categories | `/products/categories` | [열기](/docs/fsd/products-categories) |
| 21 | Product List | `/products` | [열기](/docs/fsd/products) |
| 22 | Product Create | `/products/new` | [열기](/docs/fsd/products-new) |
| 23 | Product Detail | `/products/[productId]` | [열기](/docs/fsd/products-detail) |
| 24 | Product Sales | `/products/sales` | [열기](/docs/fsd/products-sales) |
| 25 | Product Sale Detail | `/products/sales/[orderId]` | [열기](/docs/fsd/products-sales-detail) |
| 30 | Inquiries | `/inquiries` | [열기](/docs/fsd/inquiries) |
| 31 | Inquiry Settings | `/inquiries/settings` | [열기](/docs/fsd/inquiries-settings) |
| 40 | Content Notices | `/contents/notices` | [열기](/docs/fsd/contents-notices) |
| 41 | Content Notice Create | `/contents/notices/new` | [열기](/docs/fsd/contents-notices-new) |
| 42 | Content Notice Detail | `/contents/notices/[noticeId]` | [열기](/docs/fsd/contents-notices-detail) |
| 43 | Content FAQ | `/contents/faqs` | [열기](/docs/fsd/contents-faqs) |
| 44 | Content News | `/contents/news` | [열기](/docs/fsd/contents-news) |
| 45 | Content News Create | `/contents/news/new` | [열기](/docs/fsd/contents-news-new) |
| 46 | Content News Detail | `/contents/news/[newsId]` | [열기](/docs/fsd/contents-news-detail) |
| 47 | Content Portfolios | `/contents/portfolios` | [열기](/docs/fsd/contents-portfolios) |
| 48 | Content Portfolio Create | `/contents/portfolios/new` | [열기](/docs/fsd/contents-portfolios-new) |
| 49 | Content Portfolio Detail | `/contents/portfolios/[portfolioId]` | [열기](/docs/fsd/contents-portfolios-detail) |
| 50 | Banners | `/banners` | [열기](/docs/fsd/banners) |
| 51 | Banner Create | `/banners/new` | [열기](/docs/fsd/banners-new) |
| 52 | Banner Detail | `/banners/[bannerId]` | [열기](/docs/fsd/banners-detail) |
| 53 | Banner Popups | `/banners/popups` | [열기](/docs/fsd/banners-popups) |
| 54 | Banner Popup Create | `/banners/popups/new` | [열기](/docs/fsd/banners-popups-new) |
| 55 | Banner Popup Detail | `/banners/popups/[popupId]` | [열기](/docs/fsd/banners-popups-detail) |
| 60 | Company About | `/company/about` | [열기](/docs/fsd/company-about) |
| 61 | Company History | `/company/history` | [열기](/docs/fsd/company-history) |
| 65 | Statistics Home | `/statistics` | [열기](/docs/fsd/statistics) |
| 66 | Statistics Periods | `/statistics/periods` | [열기](/docs/fsd/statistics-periods) |
| 67 | Statistics Pages | `/statistics/pages` | [열기](/docs/fsd/statistics-pages) |
| 68 | Statistics Revenue | `/statistics/revenue` | [열기](/docs/fsd/statistics-revenue) |
| 70 | Settings Supplier | `/settings/supplier` | [열기](/docs/fsd/settings-supplier) |
| 71 | Settings SEO | `/settings/seo` | [열기](/docs/fsd/settings-seo) |
| 72 | Settings Terms | `/settings/terms` | [열기](/docs/fsd/settings-terms) |
| 73 | Settings Privacy | `/settings/privacy` | [열기](/docs/fsd/settings-privacy) |
| 80 | Support | `/support` | [열기](/docs/fsd/support) |
| 23 | Product Reviews | `/products/reviews` | [열기](/docs/fsd/products-reviews) |
| 24 | Product Coupons | `/products/coupons` | [열기](/docs/fsd/products-coupons) |
| 100 | Components | `/ssot/components` | [열기](/docs/fsd/components) |
| 90 | Result | `/result` | [열기](/docs/fsd/result) |

## 가정

- 이 문서는 **지금 이 앱에 실제로 있는 화면**만 적는다. 있을 법한 화면을 미리 적지 않는다 —
  적어 두면 그것을 보고 만드는 사람이 이미 있는 줄 안다.
- 매니페스트의 모든 화면에 명세가 있다.
- 서버·DB·권한·로그는 다루지 않는다. 이 프로젝트는 **프론트엔드 전용**이라 그런 것이 없다.
