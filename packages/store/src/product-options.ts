/**
 * 상품 옵션 — **프론트엔드 전용** 시드.
 *
 * 옵션을 `"베이지 / M"` 같은 문자열로 두면 교환 규칙을 강제할 수 없다.
 * 색상과 사이즈를 나눠 두어야 "같은 색상에서 사이즈만 바꾼다" 를 코드가 판정할 수 있다.
 */
export type ProductOption = {
  /** 옵션 코드 */
  id: string;
  productId: string;
  color: string;
  /** 사이즈가 없는 상품(단일 옵션)은 빈 문자열 */
  size: string;
  stock: number;
};

export const PRODUCT_OPTIONS: ProductOption[] = [
  // P-1042 리넨 오버셔츠
  { id: 'O-1042-BE-S', productId: 'P-1042', color: '베이지', size: 'S', stock: 12 },
  { id: 'O-1042-BE-M', productId: 'P-1042', color: '베이지', size: 'M', stock: 40 },
  { id: 'O-1042-BE-L', productId: 'P-1042', color: '베이지', size: 'L', stock: 0 },
  { id: 'O-1042-NV-S', productId: 'P-1042', color: '네이비', size: 'S', stock: 8 },
  { id: 'O-1042-NV-M', productId: 'P-1042', color: '네이비', size: 'M', stock: 21 },
  { id: 'O-1042-NV-L', productId: 'P-1042', color: '네이비', size: 'L', stock: 15 },

  // P-1040 워시드 코튼 침구 세트
  { id: 'O-1040-CH-Q', productId: 'P-1040', color: '차콜', size: 'Q', stock: 4 },
  { id: 'O-1040-CH-K', productId: 'P-1040', color: '차콜', size: 'K', stock: 6 },
  { id: 'O-1040-IV-Q', productId: 'P-1040', color: '아이보리', size: 'Q', stock: 3 },
  { id: 'O-1040-IV-K', productId: 'P-1040', color: '아이보리', size: 'K', stock: 0 },

  // 단일 옵션 상품 — 사이즈가 없으므로 교환으로 바꿀 것이 없다
  { id: 'O-1041-SV', productId: 'P-1041', color: '실버', size: '', stock: 32 },
  { id: 'O-1039-OL', productId: 'P-1039', color: '올리브', size: '', stock: 0 },
];

export function findOption(id: string): ProductOption | undefined {
  return PRODUCT_OPTIONS.find((option) => option.id === id);
}

/** 화면에 보여줄 옵션 이름 — 사이즈가 없으면 색상만 */
export function optionLabel(option: ProductOption | undefined): string {
  if (!option) return '옵션 없음';
  return option.size ? `${option.color} / ${option.size}` : option.color;
}

export function optionLabelOf(optionId: string): string {
  return optionLabel(findOption(optionId));
}

/**
 * 교환으로 고를 수 있는 옵션.
 *
 * 규칙 — **같은 상품 · 같은 색상 · 다른 사이즈**만 허용한다.
 * 다른 상품이나 다른 색상으로 바꾸는 것은 교환이 아니라 취소 후 재주문이고,
 * 금액·재고가 달라지므로 이 화면에서 처리할 일이 아니다.
 *
 * 재고가 없는 사이즈도 목록에는 남긴다 — 왜 못 고르는지 보여야 하기 때문이며,
 * 고를 수 없다는 사실은 `selectable` 로 표시한다.
 */
export function exchangeableOptions(
  currentId: string,
  options: readonly ProductOption[] = PRODUCT_OPTIONS,
): Array<ProductOption & { selectable: boolean }> {
  const current = options.find((option) => option.id === currentId);
  if (!current || !current.size) return [];

  return options
    .filter(
      (option) =>
        option.productId === current.productId &&
        option.color === current.color &&
        option.size !== '' &&
        option.id !== current.id,
    )
    .map((option) => ({ ...option, selectable: option.stock > 0 }));
}

/** 교환이 가능한 상태인지 — 고를 수 있는 사이즈가 하나라도 있어야 한다. */
export function canExchange(currentId: string, options: readonly ProductOption[] = PRODUCT_OPTIONS): boolean {
  return exchangeableOptions(currentId, options).some((option) => option.selectable);
}
