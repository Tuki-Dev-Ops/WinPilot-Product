# 기능 명세서 — F&B Client 템플릿 A

> 원본: `apps/fnb-client-a/lib/screen-specs.ts` · 생성: `pnpm docs:build`

화면 하나가 문서 하나다. 한 장에 모두 적으면 화면 하나를 고칠 때마다 긴 문서를 훑어야 하고,
어느 화면의 명세가 비어 있는지도 보이지 않는다.

## 화면

| 순번 | 화면 | 경로 | 명세 |
|---|---|---|---|
| 1 | Home | `/` | [열기](/docs/fsd/home) |
| 10 | Brand | `/brand` | [열기](/docs/fsd/brand) |
| 20 | Menu | `/menu` | [열기](/docs/fsd/menu) |
| 21 | Menu Detail | `/menu/[itemId]` | [열기](/docs/fsd/menu-detail) |
| 25 | Interior | `/interior` | [열기](/docs/fsd/interior) |
| 26 | Marketing | `/marketing` | [열기](/docs/fsd/marketing) |
| 30 | Store Finder | `/stores` | [열기](/docs/fsd/stores) |
| 40 | Franchise | `/franchise` | [열기](/docs/fsd/franchise) |
| 41 | Franchise Apply | `/franchise/apply` | [열기](/docs/fsd/franchise-apply) |
| 42 | Franchise FAQ | `/franchise/faq` | [열기](/docs/fsd/franchise-faq) |
| 50 | Notices | `/support/notices` | [열기](/docs/fsd/support-notices) |
| 51 | FAQ | `/support/faq` | [열기](/docs/fsd/support-faq) |
| 60 | Terms | `/terms` | [열기](/docs/fsd/terms) |
| 61 | Privacy | `/privacy` | [열기](/docs/fsd/privacy) |

## 가정

- 이 문서는 **지금 이 앱에 실제로 있는 화면**만 적는다. 있을 법한 화면을 미리 적지 않는다 —
  적어 두면 그것을 보고 만드는 사람이 이미 있는 줄 안다.
- 매니페스트의 모든 화면에 명세가 있다.
- 서버·DB·권한·로그는 다루지 않는다. 이 프로젝트는 **프론트엔드 전용**이라 그런 것이 없다.
