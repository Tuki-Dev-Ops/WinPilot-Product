# 기능 명세 — News Detail

> 화면: [`/news/[newsId]`](/news/[newsId]) · id `news-detail`
> 원본: `apps/b2c-client-a/lib/screen-specs.ts` · 생성: `pnpm docs:build`
> 이 파일은 **생성물**이다. 고칠 것은 원본이고, 여기서 고치면 다음 생성 때 지워진다.

## 목적

뉴스 한 건의 요약을 읽고 원문으로 간다.

## 할 수 있는 일

- 원문 보기(새 창)
- 목록으로 돌아가기

## 막는 것

- 없는 id 는 404 다.

## 어드민 연동

- 콘텐츠 > 뉴스 상세

전체 대응표는 [어드민 연동 명세](/admin-sync)에 있다.

## 관련 문서

- [비기능 명세](/non-functional/news-detail)
- [화면 캡처](/page-view/news-detail)
- [IA](/ia) · [Flow Chart](/flow)
