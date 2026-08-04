# 화면 캡처 — Result

> 화면: `/result` · id `result`
> 생성: `pnpm docs:capture` (개발 서버가 떠 있어야 한다)
> 이 파일은 **생성물**이다. 캡처를 다시 뜨면 덮어쓴다.

## Result

정상 화면

`/result?state=done`

**Desktop 1440px**

![Result Desktop](/page-view/result/result-desktop.jpg)

**Tablet 768px**

![Result Tablet](/page-view/result/result-tablet.jpg)

**Mobile 375px**

![Result Mobile](/page-view/result/result-mobile.jpg)

## 완료

흐름이 끝난 뒤. 성공은 체크 모양으로 알린다.

`/result?state=done&kind=order&id=S-24801`

**Desktop 1440px**

![완료 Desktop](/page-view/result/result--done-desktop.jpg)

**Tablet 768px**

![완료 Tablet](/page-view/result/result--done-tablet.jpg)

**Mobile 375px**

![완료 Mobile](/page-view/result/result--done-mobile.jpg)

## 실패

같은 화면이 문구와 아이콘만 바꾼다.

`/result?state=failed&kind=order`

**Desktop 1440px**

![실패 Desktop](/page-view/result/result--failed-desktop.jpg)

**Tablet 768px**

![실패 Tablet](/page-view/result/result--failed-tablet.jpg)

**Mobile 375px**

![실패 Mobile](/page-view/result/result--failed-mobile.jpg)

## 가입 완료

무엇이 끝났는지에 따라 돌아갈 곳이 달라진다.

`/result?state=done&kind=signup`

**Desktop 1440px**

![가입 완료 Desktop](/page-view/result/result--signup-desktop.jpg)

**Tablet 768px**

![가입 완료 Tablet](/page-view/result/result--signup-tablet.jpg)

**Mobile 375px**

![가입 완료 Mobile](/page-view/result/result--signup-mobile.jpg)

## 관련 문서

- [기능 명세](/docs/fsd/result)
- [비기능 명세](/docs/nfs)
