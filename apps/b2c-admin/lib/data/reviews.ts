/**
 * 이 파일은 값을 갖지 않는다 — 저장된 값은 `@winpilot/store` 한 곳에만 있다.
 *
 * 고객 화면의 상품 상세 리뷰 탭이 같은 목록을 본다. 운영자가 숨긴 리뷰(`visible: false`)는
 * 계약 단계에서 걸러져 고객 화면까지 오지 않는다.
 */
export { REVIEWS, averageRating, reviewsOf, type ReviewRecord } from '@winpilot/store';
