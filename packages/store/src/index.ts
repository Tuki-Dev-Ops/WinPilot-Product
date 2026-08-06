/**
 * 저장된 값 — **어드민이 저장한 것을 담아 두는 자리**.
 *
 * 서버가 없는 단계라 이 패키지가 데이터베이스 자리를 대신한다. 중요한 것은 위치가 아니라
 * **한 벌만 존재한다**는 사실이다. 어드민과 고객 화면이 각자 시드를 들고 있으면
 * "어드민에서 본 것과 고객 화면이 다르다" 가 되고, 그때부터 어느 쪽이 맞는지 아무도 모른다.
 *
 *   - B2C Admin  : `@/lib/data/*` 가 이 패키지를 그대로 다시 내보낸다.
 *   - B2C Client : `@winpilot/client-content` 가 이 값을 고객 화면 모양으로 옮겨 담는다.
 *
 * 계산 규칙(적립금·NEW/BEST·배송 문구)도 여기 둔다. 규칙이 두 벌이면 같은 상품이
 * 어드민에서는 490원 적립, 고객 화면에서는 500원 적립으로 보이는 일이 생긴다.
 */
export * from './categories';
export * from './product-options';
export * from './product-record';
export * from './product-tags';
export * from './products';
export * from './banners';
export * from './contents';
export * from './company';
export * from './policies';
export * from './inquiry-form';
export * from './inquiries';
export * from './coupons';
export * from './orders';
export * from './permissions';
export * from './support';
export * from './ir';
export * from './site';
export * from './product-art';
export * from './reviews';
export * from './nickname';
