# 명세 문서 체계

> 대상 뷰: **Client View** · **Admin View**
> 관련 아키텍처: [design-sync-ssot.md](../architecture/design-sync-ssot.md)

## 문서 목록

| # | 문서 | 다루는 것 | SSOT 위치 |
|---|------|-----------|-----------|
| 1 | [Path 정의서](01-path.md) | URL 문법, 뷰 네임스페이스, 동작별 경로 규칙 | `packages/spec/src/features.ts` |
| 2 | [명명규칙 정의서](02-naming-convention.md) | Feature ID, 파생 이름, 용어 사전 | `packages/spec/src/{features,glossary}.ts` |
| 3 | [Flow Chart](03-flow.md) | 표기법, 공통 플로우, 뷰별 분기 | 문서 |
| 4 | [IA](04-ia.md) | 사이트맵, 내비게이션 구조, 뎁스 규칙 | `features.ts` + 문서 |
| 5 | [컴포넌트 정의서](05-component.md) | 계층, props 규약, `cid` 주입 | `artifacts/components.json` (생성물) |
| 6 | [디자인 시스템](06-design-system.md) | 토큰, 타이포, 색, 모드 | `apps/web/app/globals.css` → `artifacts/tokens/tokens.json` |
| 7 | [기능 명세서](07-functional.md) | 기능별 동작 명세 템플릿 + 작성분 | 문서 |
| 8 | [비기능 명세서](08-non-functional.md) | 성능·접근성·보안·반응형 예산 | 문서 + `packages/uir/src/tolerance.ts` |

## 두 뷰를 한 문서에 담은 이유

Client View 와 Admin View 를 각각 8개씩 총 16개 문서로 나누지 않고, **문서 8개 안에 두 뷰를 나란히** 두었다.

문서를 뷰별로 쪼개면 "같은 기능이 두 뷰에서 어떻게 다른가"를 두 파일을 열어 비교해야 하고,
그 비교가 사람 눈에만 존재하는 순간 싱크는 반드시 깨진다. 요청하신 문제 —
*"하나의 상품 등록 기능을 각 뷰에서 다른 코드 명칭으로 작성했을 때"* — 가 정확히 그 상황이다.

두 뷰를 같은 표에 두면 차이가 시각적으로 드러나고, 더 중요하게는 **기계가 대조할 수 있다.**

## 문서와 코드의 관계

이 문서들은 규칙을 **설명**하고, 규칙의 **집행**은 코드가 한다.

```
pnpm spec:check     명명규칙·경로규칙·용어사전 위반 검사 (오류 시 종료코드 1)
pnpm spec:matrix    기능 ↔ 뷰 매핑 전체 출력 (Feature ID 에서 파생된 모든 이름)
pnpm ssot:tokens    디자인 토큰 재생성
```

> 문서에만 적힌 규칙은 반드시 어긋난다. 새 규칙을 추가할 때는
> **먼저 `packages/spec` 에 검사를 넣고**, 문서는 그 검사를 설명하는 순서로 쓴다.

## 현재 상태

- 기능 레지스트리는 `product.*` 4건이 **시드**로 들어 있다 (`status: 'planned'`).
  실제 도메인이 확정되면 교체한다.
- 용어 사전(`glossary.ts`)도 시드 3건이다.
- `pages.manifest.ts` 는 비어 있다 — 페이지를 만들 때마다 등록한다.
