# 브라우저 지원

> B2C Client 템플릿 A · 생성: `pnpm docs:build` · 원본: `tools/docs/nfs.ts`

## 목적

어디까지 맞출지 정해 두지 않으면 옛 브라우저 하나 때문에 새 기능을 전부 포기하게 된다.

## 적용 범위

모든 화면.

## 정책

- 최신 두 판(Chrome·Edge·Safari·Firefox)과 iOS Safari·Android Chrome 최신 두 판을 맞춘다.
- Internet Explorer 는 맞추지 않는다.
- 기능이 없는 브라우저에서 **화면이 깨지지 않게** 한다 — 덜 예쁘게 보이는 것은 괜찮고, 못 쓰게 되는 것은 안 된다.

## 세부 기준

| 대상 | 지원 |
|---|---|
| Chrome · Edge | 최신 2판 |
| Safari (macOS · iOS) | 최신 2판 |
| Firefox | 최신 2판 |
| Android Chrome | 최신 2판 |
| Internet Explorer | 미지원 |

## 예외

- 문서 화면(`/docs`)은 사내용이라 Chrome 계열만 맞춘다.

## 점검 항목

- [ ] 지원 대상 브라우저에서 주요 흐름이 끝까지 돈다
- [ ] 지원하지 않는 브라우저에서도 읽기는 된다
