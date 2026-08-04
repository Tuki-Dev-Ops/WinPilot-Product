/**
 * 상품 리뷰 — **저장된 값은 여기 한 곳에만 있다.**
 *
 * 아직 어드민에 리뷰 관리 화면이 없다. 그래도 시드를 store 에 두는 이유는 쿠폰과 같다
 * (`coupons.ts`): 화면이 생겼을 때 옮길 것이 없어야 한다. 고객 화면이 자기 시드를 들고 있으면
 * 어드민 화면을 만드는 순간 값이 두 벌이 되고, 그때는 어느 쪽이 맞는지 알 수 없다.
 *
 * `optionLabel` 은 **그 사람이 실제로 산 옵션**이다. 사이즈 평이 어느 사이즈를 두고 하는
 * 말인지 알아야 다음 사람이 고를 수 있다.
 */
export type ReviewRecord = {
  id: string;
  productId: string;
  /** 가린 이름 — 고객 화면에는 전체 이름을 내보이지 않는다 */
  author: string;
  /** 1~5 */
  rating: number;
  optionLabel: string;
  body: string;
  createdAt: string;
  /** 운영자가 숨긴 리뷰는 고객 화면에 나오지 않는다 */
  visible: boolean;
};

export const REVIEWS: ReviewRecord[] = [
  {
    id: 'R-7101',
    productId: 'P-1042',
    author: '김*연',
    rating: 5,
    optionLabel: '베이지 / M',
    body: '통기성이 좋아서 한여름에도 덥지 않습니다. 어깨가 넓은 편인데 M 도 여유가 있었어요.',
    createdAt: '2026-08-01',
    visible: true,
  },
  {
    id: 'R-7102',
    productId: 'P-1042',
    author: '박*훈',
    rating: 4,
    optionLabel: '네이비 / L',
    body: '색은 사진 그대로입니다. 세탁 후 살짝 줄어드는 느낌이라 한 치수 크게 사는 것을 권합니다.',
    createdAt: '2026-07-28',
    visible: true,
  },
  {
    id: 'R-7103',
    productId: 'P-1039',
    author: '이*늘',
    rating: 5,
    optionLabel: '올리브',
    body: '접었을 때 부피가 작아 트렁크에 넣기 좋습니다. 조립도 따로 필요 없어요.',
    createdAt: '2026-07-22',
    visible: true,
  },
  {
    id: 'R-7104',
    productId: 'P-1041',
    author: '정*우',
    rating: 3,
    optionLabel: '',
    body: '기능은 좋은데 생각보다 무겁습니다. 들고 다닐 용도라면 한 번 더 생각해 보세요.',
    createdAt: '2026-07-19',
    visible: true,
  },
];

/** 한 상품의 리뷰 — 최근 것이 위로 온다. 숨긴 것은 빠진다. */
export function reviewsOf(productId: string): ReviewRecord[] {
  return REVIEWS.filter((review) => review.productId === productId && review.visible).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

/** 평균 별점 — 소수 한 자리. 리뷰가 없으면 0 이다. */
export function averageRating(productId: string): number {
  const list = reviewsOf(productId);
  if (list.length === 0) return 0;
  return Math.round((list.reduce((sum, review) => sum + review.rating, 0) / list.length) * 10) / 10;
}
