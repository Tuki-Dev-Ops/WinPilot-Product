# WinPilot Design Sync — Figma 플러그인

프론트엔드 코드에서 추출한 UIR 을 Figma 페이지로 재구성한다.
설계: [design-sync-ssot.md](../docs/architecture/design-sync-ssot.md)

## 준비 — 한 번만

### 1. 폰트 설치

플러그인은 **필요한 폰트가 하나라도 없으면 생성을 시작하지 않는다.**
Figma 가 임의의 폰트로 대체하면 그 순간 전 페이지의 텍스트 기하가 어긋나기 때문이다.

Figma 데스크톱 앱이 실행 중인 컴퓨터에 아래 두 폰트를 설치한다.

| 폰트 | 받는 곳 |
|---|---|
| **Pretendard Variable** | https://github.com/orioncactus/pretendard/releases — `PretendardVariable.ttf` |
| **JetBrains Mono Variable** | `apps/web/public/fonts/jetbrains-mono-variable-latin.woff2` (리포지토리에 포함) 또는 https://www.jetbrains.com/lp/mono/ |

> Windows: 파일 우클릭 → **모든 사용자용으로 설치**. 설치 후 Figma 데스크톱 앱을 재시작한다.
> 브라우저판 Figma 는 로컬 폰트를 쓰려면 [Figma 폰트 헬퍼](https://www.figma.com/downloads/)가 필요하다 —
> 데스크톱 앱을 쓰는 편이 간단하다.

### 2. 플러그인 빌드

```bash
pnpm figma:build      # 1회
pnpm figma:watch      # 개발 중 (저장할 때마다 재빌드)
```

### 3. Figma 에 등록

Figma 데스크톱 앱 → 메뉴 → **Plugins → Development → Import plugin from manifest…**
→ `figma-plugin/manifest.json` 선택.

한 번 등록하면 이후에는 **Plugins → Development → WinPilot Design Sync** 로 실행된다.

## 사용

```bash
pnpm dev              # 개발 서버 (다른 터미널)
pnpm ssot:extract     # → artifacts/figma/bundle.json
```

1. Figma 에서 **전용 파일**을 새로 만든다 (기존 디자인 파일에 실행하지 말 것).
2. 플러그인 실행 → `artifacts/figma/bundle.json` 을 드롭 → **Figma 에 생성**.
3. 생성 직후 **A. 수치 검증** 결과가 리포트에 표시된다.

### 픽셀 검증까지 돌리려면

4. 플러그인에서 **PNG 내보내기** → 프레임별 PNG 가 다운로드된다 (`{pageId}@{bpId}.png`, 배율 1x 고정).
5. 받은 파일을 `artifacts/actual/` 로 옮긴다.
6. ```bash
   pnpm ssot:verify        # → artifacts/report/index.html
   ```

판정기 자체는 Figma 없이도 검증되어 있다 — `pnpm ssot:selftest` 가 실제 baseline 에
합성 변형(AA 노이즈 · 서브픽셀 이동 · 색 변화)을 가해 판정기가 옳게 반응하는지 확인한다.

## 무엇을 만드는가

- 매니페스트의 페이지마다 Figma 페이지를 만들고 이름을 `{순번}. {이름}` 으로 강제한다 (`1. Index`).
- 페이지를 `order` 오름차순으로 **물리 정렬**한다.
- 페이지 안에 브레이크포인트별 프레임을 가로로 배치한다 (`Desktop 1440` / `Tablet 768` / `Mobile 375`).
- 생성 직후 **A. 수치 검증** 을 돌려 좌표·크기·모서리·불투명도·타이포·줄 수를 UIR 과 대조한다.

## 재실행 규칙

- 페이지 매칭은 이름이 아니라 `pluginData` 로 한다 → **Figma 에서 페이지 이름을 바꿔도 중복 생성되지 않는다.**
- 관리 대상 페이지의 내용은 매번 지우고 다시 만든다. **Figma 에서 한 수정은 보존되지 않는다** (단방향 파이프라인).
- 매니페스트에 없는 페이지는 지우지 않고 `_archive/` 접두어를 붙여 뒤로 밀어낸다.

## 알려진 제한

| 항목 | 현재 | 해소 시점 |
|---|---|---|
| 그라디언트 | 폴백 래스터(이미지)로 대체 | Phase 5 — Figma 에서 `gradientTransform` 검증 후 네이티브 승격 |
| 회전·기울임 변환 | 폴백 래스터 | 동일 |
| `::before` / `::after` | 폴백 래스터 | 동일 |
| 줄바꿈 | 줄 수만 검산하고 보고 | Phase 5 — 적응형 줄 분리 |
| 픽셀 대조 | 미구현 | Phase 5 — `tools/verifier` |

폴백은 baseline PNG 에서 잘라낸 실제 렌더 픽셀이므로 **보이는 결과는 정확하다.**
다만 Figma 에서 편집할 수 없는 이미지이며, 그 비율이 '네이티브 커버리지' 지표로 보고된다.
