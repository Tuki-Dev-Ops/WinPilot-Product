export const CATEGORY_MESSAGES = {
  nameRequired: '카테고리명을 입력해 주세요.',
  nameLength: '카테고리명은 1자 이상 30자 이하여야 합니다.',
} as const;

export type CategoryFormMode = 'create' | 'edit';

export type CategoryFormInput = {
  name: string;
  /** 상위 카테고리 id. 빈 문자열이면 최상위. */
  parentId: string;
  /** 고객 화면 노출 여부 */
  visible: boolean;
};

export type CategoryFormErrors = Partial<Record<keyof CategoryFormInput, string>>;

export function validateCategoryField(field: keyof CategoryFormInput, input: CategoryFormInput): string | null {
  if (field !== 'name') return null;
  const value = input.name.trim();
  if (!value) return CATEGORY_MESSAGES.nameRequired;
  return value.length <= 30 ? null : CATEGORY_MESSAGES.nameLength;
}

export function validateCategoryForm(input: CategoryFormInput): CategoryFormErrors {
  const errors: CategoryFormErrors = {};
  const message = validateCategoryField('name', input);
  if (message) errors.name = message;
  return errors;
}
