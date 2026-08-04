'use client';

import { useState, type FormEvent } from 'react';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import {
  ContentField,
  ContentFormActions,
  ContentSection,
} from '@/app/contents/_components/ContentFormShell';
import { Dropdown, HintInput, ImageUploader, useToast, type ImageRules, type UploadedImage } from '@winpilot/ui';
import { INDUSTRY_SECTIONS, suggestionsFor } from '@/lib/data/industry';
import { hasErrors } from '@/lib/validation/content-record';
import {
  footerLine,
  validateSupplier,
  type SupplierFormErrors,
  type SupplierFormInput,
} from '@/lib/validation/supplier-record';

/**
 * 로고는 벡터(SVG)를 우선한다 — 푸터·영수증·모바일에서 크기가 제각각이라 비트맵은 어딘가에서 흐려진다.
 * 비율은 강제하지 않는다: 가로형 워드마크와 정사각 심볼 중 어느 쪽을 쓸지는 브랜드마다 다르다.
 */
const LOGO_RULES: ImageRules = {
  maxCount: 2,
  types: ['image/svg+xml', 'image/png', 'image/webp'],
  typeLabel: 'SVG · PNG · WEBP',
  minEdge: 40,
  maxBytes: 1024 * 1024,
};

const DEFAULT_SUPPLIER: SupplierFormInput = {
  companyName: '윈파일럿',
  ceo: '홍승범',
  businessNumber: '000-00-00000',
  mailOrderNumber: '제2026-서울성동-0000호',
  section: '정보통신업',
  industry: '소프트웨어 개발 및 공급업',
  postalCode: '04770',
  address: '서울특별시 성동구 왕십리로 000',
  addressDetail: '000호',
  phone: '02-0000-0000',
  fax: '',
  email: 'hello@example.com',
  privacyOfficer: '홍승범',
  hostingProvider: '자체 호스팅',
};

/**
 * 공급자 정보 — 고객 화면 하단에 표기되는 **사업자 정보**를 입력한다.
 *
 * 대부분이 전자상거래법상 표시 의무 항목이라 선택 항목을 최소로 두었다.
 * 입력란은 **한 줄에 하나씩** 둔다 — 사업자등록증을 옆에 놓고 그대로 옮겨 적는 화면이라,
 * 두 칸씩 배치하면 눈이 좌우로 튀며 빠뜨리는 항목이 생긴다.
 *
 * 업태는 한국표준산업분류 대분류에서 고르고, 업종은 **자유 입력**이다 —
 * 사업자등록증 문구가 기관마다 달라, 목록으로 강제하면 등록증과 다른 값을 넣게 된다
 * (자세한 사정은 `lib/data/industry.ts`).
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function SupplierSettingsView() {
  const toast = useToast();
  const [value, setValue] = useState<SupplierFormInput>(DEFAULT_SUPPLIER);
  const [logos, setLogos] = useState<UploadedImage[]>([]);
  const [errors, setErrors] = useState<SupplierFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const update = <K extends keyof SupplierFormInput>(field: K, next: SupplierFormInput[K]) => {
    const draft = { ...value, [field]: next };
    // 업태를 바꾸면 그 아래 제안이 달라진다 — 앞 업태의 업종이 남아 있으면 짝이 맞지 않는다.
    if (field === 'section') draft.industry = '';
    setValue(draft);
    if (submitted) setErrors(validateSupplier(draft));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validateSupplier(value);
    setErrors(found);

    if (hasErrors(found)) {
      const order = [
        'companyName',
        'ceo',
        'businessNumber',
        'mailOrderNumber',
        'industry',
        'postalCode',
        'address',
        'phone',
        'fax',
        'email',
        'privacyOfficer',
      ] as const;
      const first = order.find((field) => found[field]);
      if (first) document.getElementById(`supplier-${first}`)?.focus();
      toast.error({
        message: '저장하지 못했습니다.',
        detail: `확인이 필요한 항목이 ${Object.keys(found).length}개 있습니다.`,
      });
      return;
    }

    setConfirmOpen(true);
  };

  const suggestions = suggestionsFor(value.section);

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <ContentSection
          title="로고"
          description="고객 화면 헤더와 푸터에 쓰입니다. 첫 번째 이미지가 기본 로고이며, 두 번째를 올리면 어두운 배경용으로 씁니다."
        >
          <ImageUploader images={logos} onChange={setLogos} rules={LOGO_RULES} />
          <p className="text-xs leading-relaxed text-ink-faint">
            배경이 비치는 투명 이미지를 권장합니다. 흰 배경이 박힌 로고는 어두운 화면에서 네모가 그대로 보입니다.
          </p>
        </ContentSection>

        <ContentSection title="사업자 정보" description="사업자등록증에 적힌 대로 입력해 주세요.">
          <ContentField
            id="supplier-companyName"
            label="회사명 (상호)"
            {...(errors.companyName ? { error: errors.companyName } : {})}
          >
            <HintInput
              id="supplier-companyName"
              type="text"
              hint="사업자등록증의 상호"
              value={value.companyName}
              onChange={(event) => update('companyName', event.target.value)}
              invalid={Boolean(errors.companyName)}
            />
          </ContentField>

          <ContentField id="supplier-ceo" label="대표자명" {...(errors.ceo ? { error: errors.ceo } : {})}>
            <HintInput
              id="supplier-ceo"
              type="text"
              hint="대표자 성명"
              value={value.ceo}
              onChange={(event) => update('ceo', event.target.value)}
              invalid={Boolean(errors.ceo)}
            />
          </ContentField>

          <ContentField
            id="supplier-businessNumber"
            label="사업자등록번호"
            {...(errors.businessNumber ? { error: errors.businessNumber } : {})}
          >
            <HintInput
              id="supplier-businessNumber"
              type="text"
              inputMode="numeric"
              hint="000-00-00000"
              value={value.businessNumber}
              onChange={(event) => update('businessNumber', event.target.value)}
              invalid={Boolean(errors.businessNumber)}
            />
          </ContentField>

          <ContentField
            id="supplier-mailOrderNumber"
            label="통신판매업 신고번호"
            {...(errors.mailOrderNumber ? { error: errors.mailOrderNumber } : {})}
          >
            <HintInput
              id="supplier-mailOrderNumber"
              type="text"
              hint="제2026-서울성동-0000호"
              value={value.mailOrderNumber}
              onChange={(event) => update('mailOrderNumber', event.target.value)}
              invalid={Boolean(errors.mailOrderNumber)}
            />
          </ContentField>
        </ContentSection>

        <ContentSection
          title="업태 · 업종"
          description="업태는 한국표준산업분류 대분류에서 고르고, 업종은 사업자등록증 문구를 그대로 적습니다."
        >
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">업태</span>
            <Dropdown
              id="supplier-section"
              label="업태 선택"
              options={INDUSTRY_SECTIONS.map((item) => ({
                value: item.name,
                label: item.name,
                hint: item.code,
              }))}
              value={value.section}
              onChange={(next) => update('section', next)}
              invalid={Boolean(errors.section)}
            />
            {errors.section && <p className="text-sm text-signal-danger">{errors.section}</p>}
          </div>

          <ContentField
            id="supplier-industry"
            label="업종"
            {...(errors.industry ? { error: errors.industry } : {})}
          >
            <HintInput
              id="supplier-industry"
              type="text"
              hint="예: 전자상거래 소매업"
              value={value.industry}
              onChange={(event) => update('industry', event.target.value)}
              invalid={Boolean(errors.industry)}
            />

            {/* 제안일 뿐 강제하지 않는다 — 누르면 채워지고, 다르면 직접 고쳐 쓴다. */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="shrink-0 text-xs text-ink-faint">자주 쓰는 업종</span>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => update('industry', suggestion)}
                    className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs transition-colors duration-150 ${
                      value.industry === suggestion
                        ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                        : 'bg-surface text-ink-muted hover:text-ink'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </ContentField>
        </ContentSection>

        <ContentSection title="주소">
          <ContentField
            id="supplier-postalCode"
            label="우편번호"
            {...(errors.postalCode ? { error: errors.postalCode } : {})}
          >
            <HintInput
              id="supplier-postalCode"
              type="text"
              inputMode="numeric"
              hint="숫자 5자리"
              value={value.postalCode}
              onChange={(event) => update('postalCode', event.target.value)}
              invalid={Boolean(errors.postalCode)}
            />
          </ContentField>

          <ContentField id="supplier-address" label="주소" {...(errors.address ? { error: errors.address } : {})}>
            <HintInput
              id="supplier-address"
              type="text"
              hint="도로명 주소"
              value={value.address}
              onChange={(event) => update('address', event.target.value)}
              invalid={Boolean(errors.address)}
            />
          </ContentField>

          <ContentField id="supplier-addressDetail" label="상세주소 (선택)">
            <HintInput
              id="supplier-addressDetail"
              type="text"
              hint="동 · 호수"
              value={value.addressDetail}
              onChange={(event) => update('addressDetail', event.target.value)}
            />
          </ContentField>
        </ContentSection>

        <ContentSection title="연락처">
          <ContentField id="supplier-phone" label="대표 전화" {...(errors.phone ? { error: errors.phone } : {})}>
            <HintInput
              id="supplier-phone"
              type="text"
              inputMode="tel"
              hint="02-0000-0000"
              value={value.phone}
              onChange={(event) => update('phone', event.target.value)}
              invalid={Boolean(errors.phone)}
            />
          </ContentField>

          <ContentField id="supplier-fax" label="FAX (선택)" {...(errors.fax ? { error: errors.fax } : {})}>
            <HintInput
              id="supplier-fax"
              type="text"
              inputMode="tel"
              hint="02-0000-0000"
              value={value.fax}
              onChange={(event) => update('fax', event.target.value)}
              invalid={Boolean(errors.fax)}
            />
          </ContentField>

          <ContentField id="supplier-email" label="Email" {...(errors.email ? { error: errors.email } : {})}>
            <HintInput
              id="supplier-email"
              type="email"
              inputMode="email"
              hint="hello@example.com"
              value={value.email}
              onChange={(event) => update('email', event.target.value)}
              invalid={Boolean(errors.email)}
            />
          </ContentField>
        </ContentSection>

        <ContentSection title="책임자 · 호스팅">
          <ContentField
            id="supplier-privacyOfficer"
            label="개인정보보호책임자"
            {...(errors.privacyOfficer ? { error: errors.privacyOfficer } : {})}
          >
            <HintInput
              id="supplier-privacyOfficer"
              type="text"
              hint="성명"
              value={value.privacyOfficer}
              onChange={(event) => update('privacyOfficer', event.target.value)}
              invalid={Boolean(errors.privacyOfficer)}
            />
          </ContentField>

          <ContentField id="supplier-hostingProvider" label="호스팅 서비스 제공자 (선택)">
            <HintInput
              id="supplier-hostingProvider"
              type="text"
              hint="예: 자체 호스팅"
              value={value.hostingProvider}
              onChange={(event) => update('hostingProvider', event.target.value)}
            />
          </ContentField>
        </ContentSection>
      </div>

      <ContentFormActions
        mode="edit"
        onList={() => {
          setValue(DEFAULT_SUPPLIER);
          setErrors({});
          setSubmitted(false);
          toast.info({ message: '입력을 되돌렸습니다.', detail: '마지막으로 저장된 내용으로 돌아갑니다.' });
        }}
      >
        {/* 고객 화면 하단에 실제로 나가는 줄 — 입력하면서 어떻게 보이는지 확인한다. */}
        <ContentSection title="고객 화면 표기">
          <div className="flex h-12 items-center rounded-lg bg-surface px-4">
            {logos[0]?.url ? (
              // 미리보기는 objectURL 이라 next/image 최적화 대상이 아니다.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logos[0].url} alt="로고" className="max-h-8 w-auto" />
            ) : (
              <span className="text-xs text-ink-faint">로고를 올리면 여기에 표시됩니다</span>
            )}
          </div>
          <p className="rounded-lg bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted">
            {footerLine(value) || '입력한 내용이 여기에 한 줄로 표기됩니다.'}
          </p>
          <p className="text-xs leading-relaxed text-ink-faint">
            전자상거래법상 표시 의무 항목이라 비워 두면 고객 화면에서 빠집니다.
          </p>
        </ContentSection>
      </ContentFormActions>

      <AdminConfirmModal
        open={confirmOpen}
        tone="brand"
        title="공급자 정보 저장"
        description="고객 화면 하단의 사업자 정보가 바로 바뀝니다."
        confirmLabel="저장"
        summary={[
          { label: '로고', value: logos.length > 0 ? `${logos.length}장` : '없음' },
          { label: '회사명', value: value.companyName.trim() },
          { label: '대표자', value: value.ceo.trim() },
          { label: '사업자등록번호', value: value.businessNumber.trim() },
          { label: '업태 · 업종', value: `${value.section} · ${value.industry}` },
          { label: '대표 전화', value: value.phone.trim() },
          { label: 'FAX', value: value.fax.trim() || '없음' },
          { label: 'Email', value: value.email.trim() },
        ]}
        onConfirm={() => {
          setConfirmOpen(false);
          toast.success({ message: '공급자 정보를 저장했습니다.', detail: value.companyName.trim() });
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </form>
  );
}
