# 기능 명세서 — F&B Admin

> 원본: `apps/fnb-admin/lib/screen-specs.ts` · 생성: `pnpm docs:build`

화면 하나가 문서 하나다. 한 장에 모두 적으면 화면 하나를 고칠 때마다 긴 문서를 훑어야 하고,
어느 화면의 명세가 비어 있는지도 보이지 않는다.

## 화면

| 순번 | 화면 | 경로 | 명세 |
|---|---|---|---|
| 1 | Dashboard | `/` | [열기](/docs/fsd/dashboard) |
| 10 | Menus | `/menus` | [열기](/docs/fsd/menus) |
| 11 | Menu Detail | `/menus/[menuId]` | [열기](/docs/fsd/menus-detail) |
| 12 | Menu Create | `/menus/new` | [열기](/docs/fsd/menus-new) |
| 13 | Menu Categories | `/menus/categories` | [열기](/docs/fsd/menus-categories) |
| 15 | Marketing Posts | `/marketing` | [열기](/docs/fsd/marketing) |
| 16 | Marketing Post Detail | `/marketing/[postId]` | [열기](/docs/fsd/marketing-detail) |
| 17 | Marketing Post Create | `/marketing/new` | [열기](/docs/fsd/marketing-new) |
| 20 | Stores | `/stores` | [열기](/docs/fsd/stores) |
| 21 | Store Detail | `/stores/[storeId]` | [열기](/docs/fsd/stores-detail) |
| 22 | Store Create | `/stores/new` | [열기](/docs/fsd/stores-new) |
| 30 | Franchise Inquiries | `/inquiries` | [열기](/docs/fsd/inquiries) |
| 31 | Inquiry Detail | `/inquiries/[inquiryId]` | [열기](/docs/fsd/inquiries-detail) |
| 35 | Franchise FAQ | `/franchise/faqs` | [열기](/docs/fsd/franchise-faqs) |
| 36 | Franchise FAQ Detail | `/franchise/faqs/[faqId]` | [열기](/docs/fsd/franchise-faqs-detail) |
| 37 | Franchise FAQ Create | `/franchise/faqs/new` | [열기](/docs/fsd/franchise-faqs-new) |
| 38 | Franchise Cost | `/settings/franchise` | [열기](/docs/fsd/franchise-cost) |
| 50 | Support FAQ | `/support/faqs` | [열기](/docs/fsd/support-faqs) |
| 51 | Support FAQ Detail | `/support/faqs/[faqId]` | [열기](/docs/fsd/support-faqs-detail) |
| 52 | Support FAQ Create | `/support/faqs/new` | [열기](/docs/fsd/support-faqs-new) |
| 55 | Notices | `/support/notices` | [열기](/docs/fsd/support-notices) |
| 56 | Notice Detail | `/support/notices/[noticeId]` | [열기](/docs/fsd/support-notices-detail) |
| 57 | Notice Create | `/support/notices/new` | [열기](/docs/fsd/support-notices-new) |
| 70 | Main Visuals | `/banners/main` | [열기](/docs/fsd/banners-main) |
| 71 | Main Visual Detail | `/banners/main/[bannerId]` | [열기](/docs/fsd/banners-main-detail) |
| 72 | Main Visual Create | `/banners/main/new` | [열기](/docs/fsd/banners-main-new) |
| 75 | Popups | `/banners/popups` | [열기](/docs/fsd/banners-popups) |
| 76 | Popup Detail | `/banners/popups/[popupId]` | [열기](/docs/fsd/banners-popups-detail) |
| 77 | Popup Create | `/banners/popups/new` | [열기](/docs/fsd/banners-popups-new) |
| 90 | Brand Settings | `/settings/brand` | [열기](/docs/fsd/settings-brand) |
| 92 | Admins | `/settings/admins` | [열기](/docs/fsd/settings-admins) |
| 93 | Admin Detail | `/settings/admins/[adminId]` | [열기](/docs/fsd/settings-admins-detail) |
| 94 | Admin Create | `/settings/admins/new` | [열기](/docs/fsd/settings-admins-new) |

## 가정

- 이 문서는 **지금 이 앱에 실제로 있는 화면**만 적는다. 있을 법한 화면을 미리 적지 않는다 —
  적어 두면 그것을 보고 만드는 사람이 이미 있는 줄 안다.
- 매니페스트의 모든 화면에 명세가 있다.
- 서버·DB·권한·로그는 다루지 않는다. 이 프로젝트는 **프론트엔드 전용**이라 그런 것이 없다.
