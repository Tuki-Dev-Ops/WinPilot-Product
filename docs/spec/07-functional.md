# 7. 기능 명세서

> 단위: **Feature ID**. 명세 하나가 Feature 하나에 대응하고, 그 안에서 Client / Admin 을 나란히 기술한다.
> 레지스트리: `packages/spec/src/features.ts`

## 7.1 작성 규칙

1. **기능 단위로 쓰고 뷰 단위로 쪼개지 않는다.** 뷰별로 문서를 나누면
   "Client 만 고치고 Admin 을 빠뜨린" 상태를 아무도 발견하지 못한다.
2. 모든 항목은 **판정 가능한 문장**으로 쓴다. "적절히", "자연스럽게", "빠르게" 는 명세가 아니다.
3. 두 뷰가 같으면 *"동일"* 이라고 명시한다. 비워두면 미정의인지 동일인지 구분되지 않는다.
4. 예외·실패 경로를 반드시 채운다. 성공 경로만 있는 명세는 구현자가 나머지를 발명하게 만든다.

## 7.2 템플릿

```markdown
### <Feature ID> — <한글명> / <English name>

| | Client View | Admin View |
|---|---|---|
| 라우트 | | |
| 컴포넌트 | | |
| 구현 상태 | planned / implemented | |

**목적**  (사용자가 무엇을 달성하는가 — 화면 설명이 아니라 목적)

**액터 · 권한**
| 뷰 | 액터 | 필요 권한 | 미충족 시 |
|---|---|---|---|

**사전 조건**
- (진입 시점에 참이어야 하는 것)

**주 흐름**
1. …
   → Flow Chart: [3. Flow](03-flow.md#…)

**대안 · 예외**
| 조건 | 처리 | 뷰 차이 |
|---|---|---|

**입력 · 검증 규칙**
| 필드 | 타입 | 필수 | 규칙 | 위반 메시지 키 |
|---|---|---|---|---|

**후행 조건**
- (완료 후 참이 되는 것 — 상태 변화, 이동, 알림)

**수용 기준**
- [ ] Given … When … Then …

**뷰 간 차이 요약**
| 항목 | Client | Admin | 차이 이유 |
|---|---|---|---|
```

**검증 규칙은 두 뷰가 공유한다.** Client 에서 통과한 값이 Admin 에서 거부되면 모순이다.
차이가 필요하다면 그것은 검증이 아니라 **권한**이므로 액터 표에 쓴다.

## 7.3 작성 예 *(시드 — 도메인 확정 시 교체)*

### `product.create` — 상품 등록 / Create product

| | Client View | Admin View |
|---|---|---|
| 라우트 | `/products/new` | `/admin/products/new` |
| 컴포넌트 | `ProductCreatePage` | `AdminProductCreatePage` |
| 구현 상태 | planned | planned |

**목적**
판매할 상품의 정보를 등록해 노출 대기 상태로 만든다.

**액터 · 권한**

| 뷰 | 액터 | 필요 권한 | 미충족 시 |
|---|---|---|---|
| Client | 판매자 | `product:create` | 권한 안내 화면 + 신청 유도 |
| Admin | 운영자 | `admin.product:create` | 403 화면 |

**사전 조건**
- 인증된 세션이 존재한다.
- (Client) 판매자 온보딩이 완료되어 있다.

**주 흐름**
1. 폼 진입 — 빈 양식, 첫 필드 포커스
2. 정보 입력 — (Client) 30초 간격 임시저장 / (Admin) 임시저장 없음
3. 제출 — 클라이언트 검증 → 서버 검증
4. 등록 완료 — (Client) 상태 `심사대기` / (Admin) 상태 `판매중`
5. 이동 — (Client) 내 상품 목록 / (Admin) 상품 상세

→ Flow Chart: [3.4 상품 등록 대조](03-flow.md#34-상품-등록--client-vs-admin-대조)

**대안 · 예외**

| 조건 | 처리 | 뷰 차이 |
|---|---|---|
| 검증 실패 | 필드 인라인 에러 + 첫 오류 필드로 포커스 | 동일 |
| 세션 만료 | 로그인으로 이동, `returnTo` 보존, 임시저장 복구 | Admin 은 임시저장 없어 입력 유실 경고 |
| 서버 5xx | 재시도 배너, **입력값 보존** | 동일 |
| 중복 상품명 | 경고 후 진행 허용 | Admin 은 강제 차단 |

**입력 · 검증 규칙**

| 필드 | 타입 | 필수 | 규칙 | 메시지 키 |
|---|---|---|---|---|
| `name` | string | ✅ | 2–100자 | `feature.product.create.error.name` |
| `price` | integer | ✅ | 0 이상, 통화 단위 정수 | `feature.product.create.error.price` |
| `description` | string | | 최대 5000자 | `feature.product.create.error.description` |
| `images` | file[] | ✅ | 1–10장, 장당 5MB, jpg/png/webp | `feature.product.create.error.images` |

**후행 조건**
- 상품 레코드가 생성되고 고유 `productId` 가 부여된다.
- (Client) 심사 큐에 등록되어 Admin 목록에 나타난다.
- 감사 로그에 `product.create` 이벤트가 기록된다.

**수용 기준**
- [ ] Given 판매자 권한이 없는 사용자, When `/products/new` 진입, Then 권한 안내 화면이 표시된다
- [ ] Given 유효한 입력, When 제출, Then 상태 `심사대기` 로 생성되고 내 상품 목록으로 이동한다
- [ ] Given 서버 5xx, When 제출, Then 입력값이 보존되고 재시도 버튼이 표시된다
- [ ] Given Admin 운영자, When 제출, Then 상태 `판매중` 으로 즉시 생성된다

**뷰 간 차이 요약**

| 항목 | Client | Admin | 차이 이유 |
|---|---|---|---|
| 임시저장 | 있음 | 없음 | Client 는 세션이 길고 이탈 위험이 큼 |
| 등록 직후 상태 | 심사대기 | 판매중 | 운영자 입력은 이미 검수된 것으로 간주 |
| 중복 상품명 | 경고 | 차단 | 운영 데이터 품질 기준이 더 높음 |
| 원가 필드 | 없음 | 있음 | Client 번들에 원가가 포함되면 안 됨 |

## 7.4 명세 ↔ 코드 대응

| 명세 항목 | 코드 위치 |
|---|---|
| 라우트 · 컴포넌트 | `packages/spec/src/features.ts` (검사 대상) |
| 검증 규칙 | 뷰 공유 스키마 (zod) — 두 뷰가 같은 모듈을 import |
| 메시지 키 | i18n 리소스 — 키는 `feature.<id>.*` |
| 수용 기준 | E2E 테스트 이름에 그대로 사용 |

검증 스키마를 **한 모듈에서 공유**하는 것이 §7.2 규칙 4의 실질적 집행 수단이다.

## 7.5 미작성 항목

현재 도메인이 확정되지 않아 `product.*` 시드 외의 기능 명세는 비어 있다.
도메인 확정 후 다음 순서로 채운다.

```
1. features.ts 에 Feature 전량 등록 (status: 'planned')
2. pnpm spec:check  → 이름 규칙 통과 확인
3. 이 문서에 Feature 별 명세 작성 (§7.2 템플릿)
4. IA(4) · Flow(3) 갱신
5. 구현 → status: 'implemented' → pages.manifest 등록
```
