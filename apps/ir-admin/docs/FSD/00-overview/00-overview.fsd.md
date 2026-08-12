# 기능 명세서 — IR Admin

> 원본: `apps/ir-admin/lib/screen-specs.ts` · 생성: `pnpm docs:build`

화면 하나가 문서 하나다. 한 장에 모두 적으면 화면 하나를 고칠 때마다 긴 문서를 훑어야 하고,
어느 화면의 명세가 비어 있는지도 보이지 않는다.

## 화면

| 순번 | 화면 | 경로 | 명세 |
|---|---|---|---|
| 1 | Dashboard | `/` | [열기](/docs/fsd/dashboard) |
| 10 | Inquiries | `/inquiries` | [열기](/docs/fsd/inquiries) |
| 11 | Inquiry Detail | `/inquiries/[inquiryId]` | [열기](/docs/fsd/inquiries-detail) |
| 12 | Inquiry Settings | `/inquiries/settings` | [열기](/docs/fsd/inquiries-settings) |
| 20 | Notices | `/contents/notices` | [열기](/docs/fsd/contents-notices) |
| 21 | Notice Create | `/contents/notices/new` | [열기](/docs/fsd/contents-notices-new) |
| 22 | Notice Detail | `/contents/notices/[noticeId]` | [열기](/docs/fsd/contents-notices-detail) |
| 23 | News | `/contents/news` | [열기](/docs/fsd/contents-news) |
| 24 | News Create | `/contents/news/new` | [열기](/docs/fsd/contents-news-new) |
| 25 | News Detail | `/contents/news/[newsId]` | [열기](/docs/fsd/contents-news-detail) |
| 26 | FAQ | `/contents/faqs` | [열기](/docs/fsd/contents-faqs) |
| 27 | FAQ Create | `/contents/faqs/new` | [열기](/docs/fsd/contents-faqs-new) |
| 28 | FAQ Detail | `/contents/faqs/[faqId]` | [열기](/docs/fsd/contents-faqs-detail) |
| 30 | Products | `/products` | [열기](/docs/fsd/products) |
| 31 | Product Detail | `/products/[productId]` | [열기](/docs/fsd/products-detail) |
| 32 | Product Settings | `/products/settings` | [열기](/docs/fsd/products-settings) |
| 40 | Problem & Approach | `/solutions` | [열기](/docs/fsd/solutions) |
| 41 | Problem & Approach Detail | `/solutions/[solutionId]` | [열기](/docs/fsd/solutions-detail) |
| 42 | Home Stage Order | `/solutions/settings` | [열기](/docs/fsd/solutions-settings) |
| 45 | Services | `/services` | [열기](/docs/fsd/services) |
| 46 | Service Detail | `/services/[serviceId]` | [열기](/docs/fsd/services-detail) |
| 47 | Service Settings | `/services/settings` | [열기](/docs/fsd/services-settings) |
| 50 | Company Profile | `/company/about` | [열기](/docs/fsd/company-about) |
| 51 | Milestones | `/company/history` | [열기](/docs/fsd/company-history) |
| 52 | Milestone Create | `/company/history/new` | [열기](/docs/fsd/company-history-new) |
| 53 | Milestone Detail | `/company/history/[milestoneId]` | [열기](/docs/fsd/company-history-detail) |
| 54 | Credentials | `/company/credentials` | [열기](/docs/fsd/company-credentials) |
| 55 | Credential Create | `/company/credentials/new` | [열기](/docs/fsd/company-credentials-new) |
| 56 | Credential Detail | `/company/credentials/[credentialId]` | [열기](/docs/fsd/company-credentials-detail) |
| 60 | Hero Banners | `/banners` | [열기](/docs/fsd/banners) |
| 61 | Banner Create | `/banners/new` | [열기](/docs/fsd/banners-new) |
| 62 | Banner Detail | `/banners/[bannerId]` | [열기](/docs/fsd/banners-detail) |
| 63 | Popups | `/banners/popups` | [열기](/docs/fsd/banners-popups) |
| 64 | Popup Create | `/banners/popups/new` | [열기](/docs/fsd/banners-popups-new) |
| 65 | Popup Detail | `/banners/popups/[popupId]` | [열기](/docs/fsd/banners-popups-detail) |
| 70 | Statistics | `/statistics` | [열기](/docs/fsd/statistics) |
| 71 | Period Analysis | `/statistics/period` | [열기](/docs/fsd/statistics-period) |
| 72 | Page Visits | `/statistics/pages` | [열기](/docs/fsd/statistics-pages) |
| 90 | Supplier Info | `/settings/supplier` | [열기](/docs/fsd/settings-supplier) |
| 91 | SEO | `/settings/seo` | [열기](/docs/fsd/settings-seo) |
| 92 | Terms | `/settings/terms` | [열기](/docs/fsd/settings-terms) |
| 93 | Privacy Policy | `/settings/privacy` | [열기](/docs/fsd/settings-privacy) |
| 94 | Locales | `/settings/locales` | [열기](/docs/fsd/settings-locales) |
| 99 | Result | `/result` | [열기](/docs/fsd/result) |

## 가정

- 이 문서는 **지금 이 앱에 실제로 있는 화면**만 적는다. 있을 법한 화면을 미리 적지 않는다 —
  적어 두면 그것을 보고 만드는 사람이 이미 있는 줄 안다.
- 매니페스트의 모든 화면에 명세가 있다.
- 서버·DB·권한·로그는 다루지 않는다. 이 프로젝트는 **프론트엔드 전용**이라 그런 것이 없다.
