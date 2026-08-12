/**
 * 상품 등록 폼 검증.
 *
 * 금액·수량은 문자열로 다루고 제출 시점에 숫자로 바꾼다 — 입력 중간 상태를 숫자로 강제하면
 * 지우는 순간 0 이 되어 사용자가 값을 되찾을 수 없다.
 */
export const PRODUCT_MESSAGES = {
  nameRequired: '상품명을 입력해 주세요.',
  nameLength: '상품명은 2자 이상 100자 이하여야 합니다.',
  categoryRequired: '대분류를 선택해 주세요.',
  subCategoryRequired: '세부 분류를 선택해 주세요.',
  priceRequired: '판매가를 입력해 주세요.',
  amountFormat: '0 이상의 숫자만 입력해 주세요.',
  listPriceTooLow: '정가는 판매가보다 크거나 같아야 합니다.',
  stockRequired: '재고 수량을 입력해 주세요.',
  rewardRequired: '적립값을 입력해 주세요.',
  rewardRateRange: '적립률은 0 이상 100 이하로 입력해 주세요.',
  shippingFeeRequired: '배송비를 입력해 주세요.',
  freeThresholdRequired: '무료배송 기준금액을 입력해 주세요.',
  regionNameRequired: '지역명을 입력해 주세요.',
  colorRequired: '색상을 1개 이상 등록해 주세요.',
  optionStockFormat: '재고는 0 이상의 숫자만 입력해 주세요.',
} as const;

export type RewardKind = '정률' | '정액';
export type ShippingPolicy = '무료' | '유료' | '조건부 무료';

export type RegionSurcharge = {
  key: string;
  name: string;
  /** 추가 배송비 (원) */
  fee: string;
};

/**
 * 옵션 한 칸 = 색상 × 사이즈 조합.
 *
 * 색상과 사이즈를 나눠 두는 이유는 교환 규칙 때문이다 — 교환은 **같은 색상에서
 * 사이즈만** 바꾸는 것이므로, 옵션을 한 덩어리 문자열로 두면 그 판정을 할 수 없다
 * (lib/data/product-options.ts).
 */
export type ProductOptionInput = {
  key: string;
  color: string;
  /** 사이즈가 없는 단일 옵션 상품은 빈 문자열 */
  size: string;
  stock: string;
};

export type ProductFormInput = {
  name: string;
  categoryRootId: string;
  categoryChildId: string;
  saleState: string;
  price: string;
  listPrice: string;
  stock: string;
  rewardKind: RewardKind;
  rewardValue: string;
  shippingPolicy: ShippingPolicy;
  shippingFee: string;
  freeThreshold: string;
  regions: RegionSurcharge[];
  description: string;
  visible: boolean;
  /** 색상 목록 (사용자가 직접 등록) */
  colors: string[];
  /** 사이즈 목록 — 비어 있으면 색상만으로 옵션이 만들어진다 */
  sizes: string[];
  /** 색상 × 사이즈 조합별 재고 */
  options: ProductOptionInput[];
};

export type ProductFormErrors = Partial<
  Record<Exclude<keyof ProductFormInput, 'regions' | 'colors' | 'sizes' | 'options'>, string>
> & {
  /** 지역별 추가배송비 오류 — key 기준 */
  regions?: Record<string, string>;
  /** 옵션 전체에 대한 오류 (색상 미등록 등) */
  colors?: string;
  /** 옵션별 재고 오류 — key 기준 */
  options?: Record<string, string>;
};

const digits = (value: string) => value.replace(/[\s,]/g, '');
const isAmount = (value: string) => /^\d+$/.test(digits(value));

export function parseAmount(value: string): number {
  return Number(digits(value) || 0);
}

export function formatAmount(value: number): string {
  return value.toLocaleString('ko-KR');
}

export function validateProductForm(input: ProductFormInput): ProductFormErrors {
  const errors: ProductFormErrors = {};

  const name = input.name.trim();
  if (!name) errors.name = PRODUCT_MESSAGES.nameRequired;
  else if (name.length < 2 || name.length > 100) errors.name = PRODUCT_MESSAGES.nameLength;

  if (!input.categoryRootId) errors.categoryRootId = PRODUCT_MESSAGES.categoryRequired;
  if (!input.categoryChildId) errors.categoryChildId = PRODUCT_MESSAGES.subCategoryRequired;

  if (!digits(input.price)) errors.price = PRODUCT_MESSAGES.priceRequired;
  else if (!isAmount(input.price)) errors.price = PRODUCT_MESSAGES.amountFormat;

  if (digits(input.listPrice)) {
    if (!isAmount(input.listPrice)) errors.listPrice = PRODUCT_MESSAGES.amountFormat;
    else if (parseAmount(input.listPrice) < parseAmount(input.price)) {
      errors.listPrice = PRODUCT_MESSAGES.listPriceTooLow;
    }
  }

  // 옵션이 있으면 재고는 옵션 합계로 정해진다 — 따로 받으면 두 값이 어긋난다.
  if (input.options.length === 0) {
    if (!digits(input.stock)) errors.stock = PRODUCT_MESSAGES.stockRequired;
    else if (!isAmount(input.stock)) errors.stock = PRODUCT_MESSAGES.amountFormat;
  }

  if (input.colors.length === 0) errors.colors = PRODUCT_MESSAGES.colorRequired;

  const optionErrors: Record<string, string> = {};
  for (const option of input.options) {
    if (!isAmount(option.stock || '0')) optionErrors[option.key] = PRODUCT_MESSAGES.optionStockFormat;
  }
  if (Object.keys(optionErrors).length > 0) errors.options = optionErrors;

  if (!digits(input.rewardValue)) errors.rewardValue = PRODUCT_MESSAGES.rewardRequired;
  else if (!isAmount(input.rewardValue)) errors.rewardValue = PRODUCT_MESSAGES.amountFormat;
  else if (input.rewardKind === '정률' && parseAmount(input.rewardValue) > 100) {
    errors.rewardValue = PRODUCT_MESSAGES.rewardRateRange;
  }

  if (input.shippingPolicy !== '무료') {
    if (!digits(input.shippingFee)) errors.shippingFee = PRODUCT_MESSAGES.shippingFeeRequired;
    else if (!isAmount(input.shippingFee)) errors.shippingFee = PRODUCT_MESSAGES.amountFormat;
  }
  if (input.shippingPolicy === '조건부 무료') {
    if (!digits(input.freeThreshold)) errors.freeThreshold = PRODUCT_MESSAGES.freeThresholdRequired;
    else if (!isAmount(input.freeThreshold)) errors.freeThreshold = PRODUCT_MESSAGES.amountFormat;
  }

  const regionErrors: Record<string, string> = {};
  for (const region of input.regions) {
    if (!region.name.trim()) regionErrors[region.key] = PRODUCT_MESSAGES.regionNameRequired;
    else if (!isAmount(region.fee || '0')) regionErrors[region.key] = PRODUCT_MESSAGES.amountFormat;
  }
  if (Object.keys(regionErrors).length > 0) errors.regions = regionErrors;

  return errors;
}

export function hasProductErrors(errors: ProductFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** 옵션 재고 합계. 옵션이 없으면 직접 입력한 재고를 쓴다. */
export function totalStock(input: ProductFormInput): number {
  if (input.options.length === 0) return parseAmount(input.stock);
  return input.options.reduce((sum, option) => sum + parseAmount(option.stock), 0);
}

/**
 * 색상·사이즈 목록으로 조합을 다시 만든다.
 * 이미 있던 조합의 재고는 살린다 — 사이즈를 하나 추가했다고 입력한 재고가 날아가면 안 된다.
 */
export function buildOptions(
  colors: readonly string[],
  sizes: readonly string[],
  previous: readonly ProductOptionInput[],
): ProductOptionInput[] {
  const kept = new Map(previous.map((option) => [`${option.color}|${option.size}`, option.stock]));
  const sizeList = sizes.length > 0 ? sizes : [''];

  return colors.flatMap((color) =>
    sizeList.map((size) => ({
      key: `${color}|${size}`,
      color,
      size,
      stock: kept.get(`${color}|${size}`) ?? '0',
    })),
  );
}

/** 적립 예상액 — 정률이면 판매가 기준으로 계산한다. */
export function estimateReward(input: ProductFormInput): number {
  const value = parseAmount(input.rewardValue);
  if (input.rewardKind === '정액') return value;
  return Math.floor((parseAmount(input.price) * value) / 100);
}

/**
 * 한 주문의 배송비 — **상품마다 다른 정책을 한 값으로 모은다.**
 *
 * ## 왜 store 가 계산하나
 * 한때 결제 화면이 `5만원 이상 무료, 미만 3,000원` 을 **글자로 박아** 두고 있었다. 그런데
 * 어드민은 상품마다 배송 정책을 따로 받고 있었고, 상품 상세는 그 값으로 문구를 그렸다
 * (`3만원 이상 무료배송`). 그래서 **상세에서 본 조건과 결제에서 걸리는 조건이 달랐다.**
 *
 * 규칙이 두 벌이면 어느 쪽이 맞는지 코드를 열어야 안다. 적립금 계산을 여기 둔 것과 같은
 * 판단이다(`estimateReward`).
 *
 * ## 한 주문에 한 번만 붙인다
 * 상품마다 배송비를 더하면 세 벌을 산 사람이 배송비를 세 번 낸다. 실제로는 한 상자로 가므로
 * **가장 비싼 조건 하나**를 따른다 — 무료 상품과 유료 상품을 함께 담으면 유료 쪽이 이긴다.
 *
 * ## 조건부 무료는 **주문 전체 금액**으로 판단한다
 * 그 상품 하나의 값이 아니다. `3만원 이상 무료` 인 상품을 만 원짜리로 세 개 담으면 무료여야
 * 한다 — 장바구니에서 합계를 보고 담는 사람의 셈이 그렇다.
 *
 * ## 지역 추가비는 여기서 더하지 않는다
 * 배송지를 받기 전에는 어느 지역인지 모른다. 주소를 다 적기 전에 금액이 바뀌면 그 변화가
 * 무엇 때문인지 읽히지 않는다. 지역 추가비를 붙일 자리가 생기면 이 함수에 인자가 하나 는다.
 *
 * ## 상품 전체가 아니라 **배송에 관한 세 칸만** 받는다
 * `ProductRecord` 를 받으면 이 모듈이 `products.ts` 를 알아야 하는데, 그쪽이 이미 이 모듈을
 * 읽고 있어 서로 물게 된다. 계산에 실제로 쓰는 것은 세 칸뿐이다.
 */
export type ShippingTerms = Pick<ProductFormInput, 'shippingPolicy' | 'shippingFee' | 'freeThreshold'>;

export function orderShippingFee(products: ShippingTerms[], goodsTotal: number): number {
  if (products.length === 0 || goodsTotal === 0) return 0;

  return products.reduce((worst, product) => {
    if (product.shippingPolicy === '무료') return worst;

    if (product.shippingPolicy === '조건부 무료') {
      const threshold = parseAmount(product.freeThreshold);
      /* 문턱이 안 적혀 있으면 조건이 없는 것이라 무료로 본다 — 값이 빈 것을 0 으로 읽으면 늘 무료가 된다. */
      if (threshold === 0 || goodsTotal >= threshold) return worst;
    }

    return Math.max(worst, parseAmount(product.shippingFee));
  }, 0);
}

/**
 * 회원 등급이 깎아 주는 금액.
 *
 * ## 왜 여기 있나
 * 어드민의 등급 화면이 `VIP 7%` 를 정하고 그 자리에 **"이 조건에 해당하는 사용자에게 곧바로
 * 적용됩니다"** 라고 적혀 있었는데, 결제 계산에는 등급 항목이 아예 없었다. 적어 둔 것이
 * 지켜지지 않는 상태였다.
 *
 * ## 쿠폰보다 먼저 깎는다
 * 등급은 **그 사람에게 늘 걸리는 것**이고 쿠폰은 이번 주문에만 쓰는 것이다. 늘 걸리는 것을
 * 먼저 적용해야 쿠폰의 최대 할인 한도가 `등급 할인 뒤 금액` 을 기준으로 잡힌다 — 반대로 두면
 * 같은 쿠폰이 등급에 따라 다르게 깎인다.
 *
 * 내림으로 계산한다. 원 단위 아래를 올리면 합계가 한 원씩 어긋난다.
 */
export function gradeDiscount(goodsTotal: number, ratePercent: number): number {
  if (ratePercent <= 0) return 0;
  return Math.floor((goodsTotal * ratePercent) / 100);
}
