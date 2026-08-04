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
