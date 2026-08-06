'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import { Dropdown, HintInput, ImageUploader, RichTextEditor, useToast, type UploadedImage } from '@winpilot/ui';
import { CATEGORIES, childCategories, rootCategories } from '@/lib/data/categories';
import { productTags, TAG_RULE_TEXT } from '@/lib/data/product-tags';
import {
  estimateReward,
  formatAmount,
  hasProductErrors,
  parseAmount,
  totalStock,
  validateProductForm,
  type ProductFormErrors,
  type ProductFormInput,
  type RegionSurcharge,
  type RewardKind,
  type ShippingPolicy,
} from '@/lib/validation/product-record';
import { ProductMobilePreview } from './ProductMobilePreview';
import { ProductOptionEditor } from './ProductOptionEditor';
import { ProductTagBadges } from './ProductTagBadges';
import { visibilityLabel } from '@/app/_components/AdminVisibilityBadge';

const SALE_STATES = ['판매중', '판매대기', '판매중지'];
const REWARD_KINDS: RewardKind[] = ['정률', '정액'];
const SHIPPING_POLICIES: ShippingPolicy[] = ['무료', '유료', '조건부 무료'];

export const EMPTY_PRODUCT: ProductFormInput = {
  name: '',
  categoryRootId: '',
  categoryChildId: '',
  saleState: '판매중',
  price: '',
  listPrice: '',
  stock: '',
  rewardKind: '정률',
  rewardValue: '1',
  shippingPolicy: '조건부 무료',
  shippingFee: '3000',
  freeThreshold: '50000',
  regions: [
    { key: 'r1', name: '제주', fee: '3000' },
    { key: 'r2', name: '도서산간', fee: '5000' },
  ],
  description: '',
  visible: true,
  colors: [],
  sizes: [],
  options: [],
};

export type ProductFormProps = {
  mode: 'create' | 'edit';
  /** 자동 생성된 상품 코드 (추가) 또는 기존 코드 (수정) */
  productCode: string;
  initial?: ProductFormInput;
  /** 기준일 `YYYY-MM-DD` — NEW 판정용. 서버에서 내려받아야 hydration 이 어긋나지 않는다. */
  today: string;
  /** 등록일 — 새 상품은 오늘이다 */
  createdAt?: string;
  /** 누적 판매량 — BEST 판정용. 새 상품은 0 이다. */
  salesCount?: number;
};

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-canvas">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-ink-muted">{description}</p>}
      </div>
      <div className="flex flex-col gap-5 px-6 py-6">{children}</div>
    </section>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-signal-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** 자동입력·수정 불가 항목. input 이 아니라 텍스트로 그린다 — input 의 value 는 추출되지 않는다. */
function ReadonlyField({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{label}</span>
        {note && <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-ink-faint">{note}</span>}
      </div>
      <p className="flex h-11 items-center rounded-lg bg-surface px-3 font-mono text-sm text-ink-muted">{value}</p>
    </div>
  );
}

function ChoiceGroup({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="mt-1 flex w-full gap-2">
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option)}
              className={`h-11 flex-1 rounded-lg border px-4 text-sm transition-colors duration-150 ${
                active
                  ? 'border-brand-500 bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                  : 'border-border-strong text-ink-muted hover:border-ink-faint'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function AmountField({
  id,
  label,
  unit,
  hint,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  unit: string;
  hint: string;
  value: string;
  onChange: (next: string) => void;
  error?: string;
}) {
  return (
    <Field id={id} label={label} {...(error ? { error } : {})}>
      <div className="flex items-center gap-2">
        <HintInput
          id={id}
          type="text"
          inputMode="numeric"
          hint={hint}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          invalid={Boolean(error)}
          className="flex-1"
          {...(error ? { 'aria-describedby': `${id}-error` } : {})}
        />
        <span className="w-10 shrink-0 text-sm text-ink-muted">{unit}</span>
      </div>
    </Field>
  );
}

/**
 * 상품 등록·수정 폼. 목록에서 들어오는 상세 화면이다.
 *
 * **프론트엔드 전용** — 서버로 보내지 않고 제출 결과를 화면에만 반영한다.
 * 카테고리 목록은 `lib/data/categories` 를 카테고리 관리 화면과 공유한다.
 */
export function ProductForm({
  mode,
  productCode,
  initial,
  today,
  createdAt,
  salesCount = 0,
}: ProductFormProps) {
  const toast = useToast();
  const router = useRouter();
  const [value, setValue] = useState<ProductFormInput>(initial ?? EMPTY_PRODUCT);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const roots = useMemo(() => rootCategories(CATEGORIES), []);
  const children = useMemo(
    () => (value.categoryRootId ? childCategories(value.categoryRootId, CATEGORIES) : []),
    [value.categoryRootId],
  );

  const update = <K extends keyof ProductFormInput>(field: K, next: ProductFormInput[K]) => {
    setValue((previous) => {
      const draft = { ...previous, [field]: next };
      // 대분류를 바꾸면 세부 분류는 더 이상 유효하지 않다.
      if (field === 'categoryRootId') draft.categoryChildId = '';
      if (submitted) setErrors(validateProductForm(draft));
      return draft;
    });
  };

  const updateRegions = (regions: RegionSurcharge[]) => {
    const draft = { ...value, regions };
    setValue(draft);
    if (submitted) setErrors(validateProductForm(draft));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validateProductForm(value);
    setErrors(found);

    if (hasProductErrors(found)) {
      const fields = ['name', 'price', 'listPrice', 'stock', 'rewardValue', 'shippingFee', 'freeThreshold'] as const;
      const firstField = fields.find((field) => found[field]);
      if (firstField) document.getElementById(`product-${firstField}`)?.focus();

      const count = fields.filter((field) => found[field]).length
        + (found.categoryRootId ? 1 : 0)
        + (found.categoryChildId ? 1 : 0)
        + (found.colors ? 1 : 0)
        + Object.keys(found.regions ?? {}).length
        + Object.keys(found.options ?? {}).length;
      toast.error({
        message: `${mode === 'create' ? '등록' : '저장'}하지 못했습니다.`,
        detail: `확인이 필요한 항목이 ${count}개 있습니다.`,
      });
      return;
    }

    // 검증을 통과해도 바로 반영하지 않는다 — 마지막으로 무엇을 저장하는지 보여 준다.
    setConfirmOpen(true);
  };

  const applySubmit = () => {
    setConfirmOpen(false);
    toast.success({
      message: `상품을 ${mode === 'create' ? '등록' : '저장'}했습니다.`,
      detail: `${productCode} · ${value.name.trim()}`,
    });
  };

  const goToList = () => {
    toast.info({ message: '상품 목록으로 이동합니다.', detail: '저장하지 않은 변경은 반영되지 않습니다.' });
    router.push('/products');
  };

  const reward = estimateReward(value);
  const primaryImage = images[0]?.url;
  // 새 상품은 오늘 등록되므로 등록하는 순간 NEW 다.
  const tags = productTags({ createdAt: createdAt ?? today, salesCount }, today);

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <Section title="상품 이미지" description="첫 번째 이미지가 대표 이미지로 쓰입니다.">
          <ImageUploader images={images} onChange={setImages} />
        </Section>

        <Section title="기본 정보">
          <ReadonlyField label="상품 코드" value={productCode} note={mode === 'create' ? '자동생성' : '수정 불가'} />

          {/* 분류는 사람이 고르지 않는다 — 등록일과 판매량에서 계산된다 (lib/data/product-tags.ts) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">자동 분류</span>
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-ink-faint">자동</span>
            </div>
            <div className="flex h-11 items-center gap-2 rounded-lg bg-surface px-3">
              {tags.length > 0 ? (
                <ProductTagBadges tags={tags} />
              ) : (
                <span className="text-sm text-ink-faint">해당 없음</span>
              )}
              <span className="ml-auto min-w-0 truncate text-xs text-ink-faint">
                누적 판매 {formatAmount(salesCount)}건
              </span>
            </div>
            <p className="text-xs leading-relaxed text-ink-muted">{TAG_RULE_TEXT}</p>
          </div>

          <Field id="product-name" label="상품명" {...(errors.name ? { error: errors.name } : {})}>
            <HintInput
              id="product-name"
              type="text"
              hint="상품명을 입력해 주세요"
              value={value.name}
              onChange={(event) => update('name', event.target.value)}
              invalid={Boolean(errors.name)}
              {...(errors.name ? { 'aria-describedby': 'product-name-error' } : {})}
            />
          </Field>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">대분류</span>
            <Dropdown
              id="product-categoryRoot"
              label="대분류 선택"
              options={roots.map((item) => ({ value: item.id, label: item.name }))}
              value={value.categoryRootId}
              onChange={(next) => update('categoryRootId', next)}
              invalid={Boolean(errors.categoryRootId)}
            />
            {errors.categoryRootId && <p className="text-sm text-signal-danger">{errors.categoryRootId}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">세부 분류</span>
            {value.categoryRootId ? (
              <Dropdown
                id="product-categoryChild"
                label="세부 분류 선택"
                options={children.map((item) => ({ value: item.id, label: item.name }))}
                value={value.categoryChildId}
                onChange={(next) => update('categoryChildId', next)}
                invalid={Boolean(errors.categoryChildId)}
              />
            ) : (
              <p className="flex h-11 items-center rounded-lg bg-surface px-3 text-sm text-ink-faint">
                대분류를 먼저 선택하세요.
              </p>
            )}
            {errors.categoryChildId && <p className="text-sm text-signal-danger">{errors.categoryChildId}</p>}
          </div>

          <ChoiceGroup
            legend="판매 상태"
            options={SALE_STATES}
            value={value.saleState}
            onChange={(next) => update('saleState', next)}
          />
        </Section>

        <Section
          title="옵션"
          description="색상과 사이즈를 등록하면 조합이 자동으로 만들어집니다. 교환은 같은 색상의 다른 사이즈로만 가능합니다."
        >
          <ProductOptionEditor
            colors={value.colors}
            sizes={value.sizes}
            options={value.options}
            onChange={(next) => {
              const draft = { ...value, ...next };
              setValue(draft);
              if (submitted) setErrors(validateProductForm(draft));
            }}
            {...(errors.colors ? { colorError: errors.colors } : {})}
            {...(errors.options ? { optionErrors: errors.options } : {})}
          />
        </Section>

        <Section title="가격 · 재고">
          <AmountField
            id="product-price"
            label="판매가"
            unit="원"
            hint="숫자만 입력해 주세요"
            value={value.price}
            onChange={(next) => update('price', next)}
            {...(errors.price ? { error: errors.price } : {})}
          />
          <AmountField
            id="product-listPrice"
            label="정가 (선택)"
            unit="원"
            hint="할인 전 가격"
            value={value.listPrice}
            onChange={(next) => update('listPrice', next)}
            {...(errors.listPrice ? { error: errors.listPrice } : {})}
          />
          {/* 옵션이 있으면 재고는 옵션 합계다 — 따로 받으면 두 값이 어긋난다. */}
          {value.options.length > 0 ? (
            <ReadonlyField
              label="재고 수량"
              value={`${formatAmount(totalStock(value))}개`}
              note={`옵션 ${value.options.length}개 합계`}
            />
          ) : (
            <AmountField
              id="product-stock"
              label="재고 수량"
              unit="개"
              hint="숫자만 입력해 주세요"
              value={value.stock}
              onChange={(next) => update('stock', next)}
              {...(errors.stock ? { error: errors.stock } : {})}
            />
          )}
        </Section>

        <Section title="적립금" description="구매 확정 시 사용자에게 지급되는 적립금입니다.">
          <ChoiceGroup
            legend="적립 방식"
            options={REWARD_KINDS}
            value={value.rewardKind}
            onChange={(next) => update('rewardKind', next as RewardKind)}
          />
          <AmountField
            id="product-rewardValue"
            label={value.rewardKind === '정률' ? '적립률' : '적립액'}
            unit={value.rewardKind === '정률' ? '%' : '원'}
            hint={value.rewardKind === '정률' ? '0 ~ 100 사이 숫자' : '숫자만 입력해 주세요'}
            value={value.rewardValue}
            onChange={(next) => update('rewardValue', next)}
            {...(errors.rewardValue ? { error: errors.rewardValue } : {})}
          />
          <div className="rounded-lg bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">적립 예상</p>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              판매가 <span className="font-medium tabular-nums">{formatAmount(parseAmount(value.price))}</span>원 기준{' '}
              <span className="font-medium tabular-nums text-brand-700 dark:text-brand-300">
                {formatAmount(reward)}
              </span>
              원이 적립됩니다.
            </p>
          </div>
        </Section>

        <Section title="배송" description="기본 배송비와 지역별 추가 배송비를 설정합니다.">
          <ChoiceGroup
            legend="배송비 정책"
            options={SHIPPING_POLICIES}
            value={value.shippingPolicy}
            onChange={(next) => update('shippingPolicy', next as ShippingPolicy)}
          />

          {value.shippingPolicy !== '무료' && (
            <AmountField
              id="product-shippingFee"
              label="기본 배송비"
              unit="원"
              hint="숫자만 입력해 주세요"
              value={value.shippingFee}
              onChange={(next) => update('shippingFee', next)}
              {...(errors.shippingFee ? { error: errors.shippingFee } : {})}
            />
          )}

          {value.shippingPolicy === '조건부 무료' && (
            <AmountField
              id="product-freeThreshold"
              label="무료배송 기준금액"
              unit="원"
              hint="이 금액 이상 구매 시 무료"
              value={value.freeThreshold}
              onChange={(next) => update('freeThreshold', next)}
              {...(errors.freeThreshold ? { error: errors.freeThreshold } : {})}
            />
          )}

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">배송 지역별 추가비</span>
              <button
                type="button"
                onClick={() =>
                  updateRegions([...value.regions, { key: `r-${value.regions.length}-${Date.now()}`, name: '', fee: '' }])
                }
                className="h-8 rounded-lg border border-border-strong px-3 text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint"
              >
                지역 추가
              </button>
            </div>

            {value.regions.length === 0 ? (
              <p className="rounded-lg bg-surface px-4 py-6 text-center text-sm text-ink-muted">
                추가비가 붙는 지역이 없습니다. 전국 동일 배송비로 처리됩니다.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {value.regions.map((region) => (
                  <div key={region.key} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <HintInput
                        aria-label="지역명"
                        type="text"
                        hint="지역명 (예: 제주)"
                        value={region.name}
                        onChange={(event) =>
                          updateRegions(
                            value.regions.map((item) =>
                              item.key === region.key ? { ...item, name: event.target.value } : item,
                            ),
                          )
                        }
                        invalid={Boolean(errors.regions?.[region.key])}
                        className="flex-1"
                      />
                      <HintInput
                        aria-label="추가 배송비"
                        type="text"
                        inputMode="numeric"
                        hint="추가비"
                        value={region.fee}
                        onChange={(event) =>
                          updateRegions(
                            value.regions.map((item) =>
                              item.key === region.key ? { ...item, fee: event.target.value } : item,
                            ),
                          )
                        }
                        invalid={Boolean(errors.regions?.[region.key])}
                        className="w-32 shrink-0"
                      />
                      <span className="w-6 shrink-0 text-sm text-ink-muted">원</span>
                      <button
                        type="button"
                        onClick={() => updateRegions(value.regions.filter((item) => item.key !== region.key))}
                        aria-label={`${region.name || '지역'} 삭제`}
                        className="h-11 shrink-0 rounded-lg border border-border-strong px-3 text-sm text-signal-danger transition-colors duration-150 hover:border-signal-danger"
                      >
                        삭제
                      </button>
                    </div>
                    {errors.regions?.[region.key] && (
                      <p className="text-sm text-signal-danger">{errors.regions[region.key]}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        <Section title="상세 설명" description="글자 서식과 이미지를 넣을 수 있습니다. HTML 원본도 직접 고칠 수 있습니다.">
          <Field id="product-description" label="상세 설명 (선택)">
            <RichTextEditor
              id="product-description"
              hint="상품 상세 설명을 입력해 주세요"
              value={value.description}
              onChange={(html) => update('description', html)}
            />
          </Field>
        </Section>
      </div>

      {/* 오른쪽 열 — 노출 설정 · 미리보기 · 저장 동작 */}
      <aside className="flex w-full shrink-0 flex-col gap-6 xl:w-80">
        <Section title="노출 설정">
          <ChoiceGroup
            legend="고객 화면 노출"
            options={['노출', '숨김']}
            value={visibilityLabel(value.visible)}
            onChange={(next) => update('visible', next === '노출')}
          />
        </Section>

        <ProductMobilePreview value={value} tags={tags} {...(primaryImage ? { imageUrl: primaryImage } : {})} />

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-canvas px-6 py-6">
          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600"
          >
            {mode === 'create' ? '등록' : '저장'}
          </button>
          <button
            type="button"
            onClick={goToList}
            className="flex h-11 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-border-strong text-sm text-ink-muted transition-colors duration-150 hover:border-ink-faint"
          >
            목록으로
          </button>
        </div>
      </aside>

      <AdminConfirmModal
        open={confirmOpen}
        tone="brand"
        title={mode === 'create' ? '상품 등록' : '상품 저장'}
        description={
          mode === 'create'
            ? '아래 내용으로 상품을 등록합니다. 노출 상태에 따라 고객 화면에 바로 보일 수 있습니다.'
            : '아래 내용으로 상품 정보를 저장합니다.'
        }
        confirmLabel={mode === 'create' ? '등록' : '저장'}
        summary={[
          { label: '상품 코드', value: productCode },
          { label: '상품명', value: value.name.trim() },
          { label: '판매가', value: `${formatAmount(parseAmount(value.price))}원` },
          {
            label: '옵션',
            value:
              value.options.length > 0
                ? `${value.options.length}개 (색상 ${value.colors.length} · 사이즈 ${value.sizes.length || 0})`
                : '없음',
          },
          { label: '재고', value: `${formatAmount(totalStock(value))}개` },
          { label: '노출', value: visibilityLabel(value.visible) },
          { label: '이미지', value: `${images.length}장` },
          { label: '자동 분류', value: tags.length > 0 ? tags.join(' · ') : '해당 없음' },
        ]}
        onConfirm={applySubmit}
        onClose={() => setConfirmOpen(false)}
      />
    </form>
  );
}
