<h1 align="center">WinPilot</h1>

<p align="center">
  실행 중인 화면을 원본으로 삼아 디자인과 코드를 어긋나지 않게 붙들어 두는 커머스 운영 플랫폼입니다.<br />
  고객 화면·운영 어드민·사내 콘솔이 하나의 용어 사전과 하나의 디자인 토큰을 공유합니다.
</p>

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm&logoColor=white" />
</p>

<p align="center">
  <strong>한국어</strong> ·
  <a href="./README.en.md">English</a> ·
  <a href="./README.zh.md">中文</a> ·
  <a href="./README.ja.md">日本語</a>
</p>

---

## 배경

디자인과 코드는 처음에는 같아 보이다가 조용히 갈라집니다. 갈라지는 지점은 대개 레이아웃이 아니라 **말**입니다. 고객 화면에서 `product`라 부르던 것을 어드민에서 `item`이라 부르기 시작하면, 두 구현을 기계적으로 짝지을 방법이 사라집니다. 그때부터는 "어느 쪽이 맞는가"를 사람이 매번 판단해야 합니다.

Figma 파일과 코드를 손으로 맞추는 방식도 같은 문제를 겪습니다. 정적 분석으로 코드에서 디자인을 뽑아내려면 `lab()` 색, `calc()` 줄높이, 글리프 단위 폰트 폴백, 공백 접힘까지 브라우저의 레이아웃 엔진을 다시 구현해야 합니다. 그렇게 만든 값은 결국 실제 화면과 다릅니다.

이 저장소는 반대 방향을 택했습니다. **실행 중인 화면이 원본입니다.** 브라우저가 계산한 값을 그대로 읽어 중간 표현(UIR)으로 만들고, 그것으로 Figma를 그립니다. 그리고 이름이 갈라지는 것은 사람의 주의가 아니라 검사기가 막습니다.

## 목적

- **이름을 하나로 붙들기** — 기능·엔티티·라우트·컴포넌트명·i18n 키·테스트 ID·Figma 프레임명이 전부 하나의 레지스트리에서 파생됩니다. 거치지 않은 이름은 `pnpm spec:check`가 잡습니다.
- **디자인을 하나로 붙들기** — 색·간격·폰트·모션이 `@winpilot/tokens` 한 곳에 있고 모든 앱이 그것을 가져다 씁니다. 앱이 자기 색을 선언하는 순간 디자인 시스템이 두 벌이 됩니다.
- **화면을 문서와 붙여 두기** — 설계 문서가 앱 안에 있고 주소로 열립니다(`/ia`, `/path`). 문서를 고치지 않고 화면만 고치면 바로 드러납니다.
- **템플릿을 여러 벌 두되 갈라지지 않게** — 고객 화면 템플릿은 배치만 다르고 값·문구·경로·슬롯 이름은 계약(`@winpilot/client-content`) 하나에서 옵니다.

## 사용 언어 및 라이브러리

| 구분 | 사용 | 비고 |
| --- | --- | --- |
| 언어 | TypeScript 5.7 | `strict`, 모든 패키지 공통 설정 |
| 프레임워크 | Next.js 16 (App Router) · React 19 | 서버 컴포넌트 기본 |
| 스타일 | Tailwind CSS 4 | CSS-first `@theme`, 토큰은 CSS 변수로 컴파일 |
| 폰트 | Pretendard · JetBrains Mono | 전부 셀프호스팅 — 제네릭 패밀리는 Figma에 존재하지 않음 |
| 패키지 | pnpm workspace | 앱·패키지·도구를 한 저장소에 |
| 검증 | Zod · Playwright · pngjs | 스키마·캡처·픽셀 비교 |
| 실행 | tsx · esbuild | 도구 스크립트·Figma 플러그인 번들 |

차트·마크다운·아이콘은 **라이브러리를 쓰지 않고 직접 그립니다.** 차트 라이브러리 대부분이 canvas로 그리는데, canvas는 픽셀 덩어리라 추출기가 이미지 한 장으로만 받습니다. SVG 요소는 실제 DOM 노드라 벡터로 복원되고 축 눈금·라벨도 텍스트로 남습니다.

## 디렉토리

```
WinPilot-Product/
├── apps/
│   ├── b2c-client-a/       고객 화면 · 템플릿 A (3310)
│   ├── b2c-admin/          운영 어드민 (3301)
│   └── internal-admin/     사내 고객사 관리 콘솔 (3302)
│
├── packages/
│   ├── spec/               기능 레지스트리 · 용어 사전 · 명명 검사기
│   ├── tokens/             디자인 토큰 (theme.css) — 모든 앱의 유일한 출처
│   ├── store/              저장된 값 — 어드민과 고객 화면이 함께 읽는 한 벌
│   ├── ui/                 앱들이 공유하는 UI 원시 요소
│   ├── client-content/     고객 화면 콘텐츠 계약 — 템플릿 A~F 공유
│   └── uir/                UI 중간 표현 스키마 · 허용 오차 정의
│
├── tools/
│   ├── extractor/          실행 중인 화면 → UIR (Playwright)
│   └── verifier/           수치 · 픽셀 2단 검증
│
├── figma-plugin/           UIR → Figma 노드
└── docs/
    ├── spec/               Path · 명명규칙 · Flow · IA · 컴포넌트 · 디자인 시스템 · 기능 · 비기능
    └── architecture/       파이프라인 설계
```

각 앱은 자기 `pages.manifest.ts`를 갖습니다. Figma 페이지의 순번과 이름은 그 파일 하나에서만 정해집니다.

데이터는 `packages/store` 한 곳에만 있습니다. 어드민의 `lib/data/*`는 그것을 다시 내보내기만 하고, 고객 화면은 `client-content`를 거쳐 같은 값을 읽습니다 — 시드를 두 벌 두면 어드민에서 본 것과 고객 화면이 달라지고, 그때부터 어느 쪽이 맞는지 알 수 없게 됩니다.

## 실행방법

### 준비

```bash
# Node 20 이상, pnpm 9 이상
pnpm install
```

### 개발 서버

```bash
pnpm dev:client      # 고객 화면 템플릿 A   http://localhost:3310
pnpm dev:admin       # 운영 어드민          http://localhost:3301
pnpm dev:internal    # 사내 콘솔            http://localhost:3302
```

### 검사

```bash
pnpm spec:check      # 명명 · 라우트 · 매니페스트 일치 검사 (오류가 있으면 종료 코드 1)
pnpm spec:matrix     # 기능 ↔ 뷰 매핑표 출력
pnpm typecheck       # 전체 워크스페이스 타입 검사
pnpm build           # 전체 빌드
```

### 디자인 동기화

```bash
pnpm ssot:tokens                    # 토큰을 UIR 형식으로 추출
pnpm ssot:extract --app b2c-admin   # 실행 중인 화면을 캡처해 UIR 생성
pnpm ssot:verify                    # 수치(ε=1e-4) · 픽셀 2단 검증
pnpm ssot:selftest                  # 검증기 자기 시험 (7개 시나리오)

pnpm figma:build                    # Figma 플러그인 번들
```

`ssot:extract`는 개발 서버가 떠 있어야 합니다. 생성물은 `artifacts/`에 떨어지며 커밋하지 않습니다.

### 문서 보기

개발 서버를 띄운 뒤 주소로 바로 엽니다.

```
http://localhost:3310/docs            문서 목록과 화면 목록
http://localhost:3310/ia              IA
http://localhost:3310/path            Path 정의서
http://localhost:3310/component       컴포넌트 정의서
```
