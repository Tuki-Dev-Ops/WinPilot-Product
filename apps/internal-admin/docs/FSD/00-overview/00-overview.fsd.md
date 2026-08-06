# 기능 명세서 — Internal Admin

> 원본: `apps/internal-admin/lib/screen-specs.ts` · 생성: `pnpm docs:build`

화면 하나가 문서 하나다. 한 장에 모두 적으면 화면 하나를 고칠 때마다 긴 문서를 훑어야 하고,
어느 화면의 명세가 비어 있는지도 보이지 않는다.

## 화면

| 순번 | 화면 | 경로 | 명세 |
|---|---|---|---|
| 1 | Dashboard | `/` | [열기](/docs/fsd/dashboard) |
| 10 | Tenants | `/tenants` | [열기](/docs/fsd/tenants) |
| 11 | Pipeline | `/tenants/pipeline` | [열기](/docs/fsd/tenants-pipeline) |
| 12 | Activities | `/tenants/activities` | [열기](/docs/fsd/tenants-activities) |
| 13 | Contacts | `/tenants/contacts` | [열기](/docs/fsd/tenants-contacts) |
| 14 | Churned Tenants | `/tenants/churned` | [열기](/docs/fsd/tenants-churned) |
| 15 | Tenant Detail | `/tenants/[tenantId]` | [열기](/docs/fsd/tenants-detail) |
| 20 | Plans | `/subscriptions/plans` | [열기](/docs/fsd/subscriptions-plans) |
| 21 | Roles | `/subscriptions/roles` | [열기](/docs/fsd/subscriptions-roles) |
| 22 | Role Detail | `/subscriptions/roles/[roleId]` | [열기](/docs/fsd/subscriptions-roles-detail) |
| 30 | Inquiries | `/inquiries` | [열기](/docs/fsd/inquiries) |
| 40 | Integration PG | `/integrations/pg` | [열기](/docs/fsd/integrations-pg) |
| 41 | Integration OAuth | `/integrations/oauth` | [열기](/docs/fsd/integrations-oauth) |
| 42 | Integration Plugin | `/integrations/plugin` | [열기](/docs/fsd/integrations-plugin) |
| 43 | Integration DNS / SSL | `/integrations/dns` | [열기](/docs/fsd/integrations-dns) |
| 50 | Revenue | `/statistics/revenue` | [열기](/docs/fsd/statistics-revenue) |
| 51 | Members | `/statistics/members` | [열기](/docs/fsd/statistics-members) |
| 60 | Billing Due | `/billing/due` | [열기](/docs/fsd/billing-due) |
| 61 | Billing Overdue | `/billing/overdue` | [열기](/docs/fsd/billing-overdue) |
| 70 | Staff | `/settings/staff` | [열기](/docs/fsd/settings-staff) |
| 71 | Notifications | `/settings/notifications` | [열기](/docs/fsd/settings-notifications) |
| 72 | Codes | `/settings/codes` | [열기](/docs/fsd/settings-codes) |
| 90 | Result | `/result` | [열기](/docs/fsd/result) |

## 가정

- 이 문서는 **지금 이 앱에 실제로 있는 화면**만 적는다. 있을 법한 화면을 미리 적지 않는다 —
  적어 두면 그것을 보고 만드는 사람이 이미 있는 줄 안다.
- 매니페스트의 모든 화면에 명세가 있다.
- 서버·DB·권한·로그는 다루지 않는다. 이 프로젝트는 **프론트엔드 전용**이라 그런 것이 없다.
