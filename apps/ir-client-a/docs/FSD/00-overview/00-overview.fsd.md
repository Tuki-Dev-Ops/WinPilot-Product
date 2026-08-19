# 기능 명세서 — IR Client 템플릿 A

> 원본: `apps/ir-client-a/lib/screen-specs.ts` · 생성: `pnpm docs:build`

화면 하나가 문서 하나다. 한 장에 모두 적으면 화면 하나를 고칠 때마다 긴 문서를 훑어야 하고,
어느 화면의 명세가 비어 있는지도 보이지 않는다.

## 화면

| 순번 | 화면 | 경로 | 명세 |
|---|---|---|---|
| 1 | Home | `/` | [열기](/docs/fsd/home) |
| 2 | About | `/about` | [열기](/docs/fsd/about) |
| 3 | History | `/about/history` | [열기](/docs/fsd/about-history) |
| 4 | Certifications | `/about/certifications` | [열기](/docs/fsd/about-certifications) |
| 5 | Certification Detail | `/about/certifications/[credentialId]` | [열기](/docs/fsd/about-certifications-detail) |
| 6 | Smart Consulting | `/solutions/consulting` | [열기](/docs/fsd/solutions-consulting) |
| 7 | Infra Service | `/solutions/infra` | [열기](/docs/fsd/solutions-infra) |
| 8 | Cloud MES | `/solutions/mes` | [열기](/docs/fsd/solutions-mes) |
| 9 | Cloud ERP | `/solutions/erp` | [열기](/docs/fsd/solutions-erp) |
| 10 | Cloud CRM | `/solutions/crm` | [열기](/docs/fsd/solutions-crm) |
| 11 | Cloud DXP | `/solutions/dxp` | [열기](/docs/fsd/solutions-dxp) |
| 12 | Products | `/products` | [열기](/docs/fsd/products) |
| 60 | Contact | `/support/contact` | [열기](/docs/fsd/support-contact) |
| 61 | Notices | `/support/notices` | [열기](/docs/fsd/support-notices) |
| 62 | Support News | `/support/news` | [열기](/docs/fsd/support-news) |
| 63 | FAQ | `/support/faq` | [열기](/docs/fsd/support-faq) |
| 64 | Directions | `/support/directions` | [열기](/docs/fsd/support-directions) |
| 70 | Terms | `/terms` | [열기](/docs/fsd/terms) |
| 71 | Privacy | `/privacy` | [열기](/docs/fsd/privacy) |

## 가정

- 이 문서는 **지금 이 앱에 실제로 있는 화면**만 적는다. 있을 법한 화면을 미리 적지 않는다 —
  적어 두면 그것을 보고 만드는 사람이 이미 있는 줄 안다.
- 매니페스트의 모든 화면에 명세가 있다.
- 서버·DB·권한·로그는 다루지 않는다. 이 프로젝트는 **프론트엔드 전용**이라 그런 것이 없다.
