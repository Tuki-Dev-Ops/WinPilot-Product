'use client';

import { useState, type FormEvent } from 'react';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import {
  ContentField,
  ContentFormActions,
  ContentSection,
} from '@/app/contents/_components/ContentFormShell';
import { ContentMobilePreview } from '@/app/contents/_components/ContentMobilePreview';
import { HintInput, ImageUploader, RichTextEditor, useToast, type UploadedImage } from '@winpilot/ui';
import { COMPANY_PROFILE } from '@/lib/data/company';
import {
  validateCompanyProfile,
  type CompanyProfileErrors,
  type CompanyProfileInput,
} from '@/lib/validation/company-record';
import { hasErrors } from '@/lib/validation/content-record';

/**
 * 회사 소개 — **단일 자원**이라 목록도 등록도 없다. 편집만 있다.
 *
 * 그래서 상단 액션이 '등록' 이 아니라 '저장' 이고, 목록으로 돌아갈 곳도 없다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function CompanyProfileForm() {
  const toast = useToast();
  const [value, setValue] = useState<CompanyProfileInput>(COMPANY_PROFILE);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [errors, setErrors] = useState<CompanyProfileErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const update = <K extends keyof CompanyProfileInput>(field: K, next: CompanyProfileInput[K]) => {
    const draft = { ...value, [field]: next };
    setValue(draft);
    if (submitted) setErrors(validateCompanyProfile(draft));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validateCompanyProfile(value);
    setErrors(found);

    if (hasErrors(found)) {
      const first = (['name', 'ceo', 'foundedAt', 'businessNumber', 'address', 'phone', 'email'] as const).find(
        (field) => found[field],
      );
      if (first) document.getElementById(`company-${first}`)?.focus();
      toast.error({
        message: '저장하지 못했습니다.',
        detail: `확인이 필요한 항목이 ${Object.keys(found).length}개 있습니다.`,
      });
      return;
    }

    setConfirmOpen(true);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <ContentSection title="대표 이미지" description="회사 소개 화면 상단에 쓰입니다.">
          <ImageUploader images={images} onChange={setImages} rules={{ maxCount: 3 }} />
        </ContentSection>

        <ContentSection title="기본 정보">
          <ContentField id="company-name" label="회사명" {...(errors.name ? { error: errors.name } : {})}>
            <HintInput
              id="company-name"
              type="text"
              hint="회사명을 입력해 주세요"
              value={value.name}
              onChange={(event) => update('name', event.target.value)}
              invalid={Boolean(errors.name)}
            />
          </ContentField>

          <ContentField id="company-ceo" label="대표자" {...(errors.ceo ? { error: errors.ceo } : {})}>
            <HintInput
              id="company-ceo"
              type="text"
              hint="대표자명을 입력해 주세요"
              value={value.ceo}
              onChange={(event) => update('ceo', event.target.value)}
              invalid={Boolean(errors.ceo)}
            />
          </ContentField>

          <ContentField
            id="company-foundedAt"
            label="설립일"
            {...(errors.foundedAt ? { error: errors.foundedAt } : {})}
          >
            <HintInput
              id="company-foundedAt"
              type="text"
              inputMode="numeric"
              hint="YYYY-MM-DD"
              value={value.foundedAt}
              onChange={(event) => update('foundedAt', event.target.value)}
              invalid={Boolean(errors.foundedAt)}
            />
          </ContentField>

          <ContentField
            id="company-businessNumber"
            label="사업자등록번호"
            {...(errors.businessNumber ? { error: errors.businessNumber } : {})}
          >
            <HintInput
              id="company-businessNumber"
              type="text"
              inputMode="numeric"
              hint="000-00-00000"
              value={value.businessNumber}
              onChange={(event) => update('businessNumber', event.target.value)}
              invalid={Boolean(errors.businessNumber)}
            />
          </ContentField>
        </ContentSection>

        <ContentSection title="연락처">
          <ContentField id="company-address" label="주소" {...(errors.address ? { error: errors.address } : {})}>
            <HintInput
              id="company-address"
              type="text"
              hint="도로명 주소를 입력해 주세요"
              value={value.address}
              onChange={(event) => update('address', event.target.value)}
              invalid={Boolean(errors.address)}
            />
          </ContentField>

          <ContentField id="company-phone" label="대표 전화" {...(errors.phone ? { error: errors.phone } : {})}>
            <HintInput
              id="company-phone"
              type="text"
              inputMode="tel"
              hint="02-0000-0000"
              value={value.phone}
              onChange={(event) => update('phone', event.target.value)}
              invalid={Boolean(errors.phone)}
            />
          </ContentField>

          <ContentField id="company-email" label="대표 이메일" {...(errors.email ? { error: errors.email } : {})}>
            <HintInput
              id="company-email"
              type="email"
              inputMode="email"
              hint="hello@example.com"
              value={value.email}
              onChange={(event) => update('email', event.target.value)}
              invalid={Boolean(errors.email)}
            />
          </ContentField>
        </ContentSection>

        <ContentSection title="소개 내용" description="글자 서식과 이미지를 넣을 수 있습니다.">
          <ContentField id="company-intro" label="회사 소개" {...(errors.intro ? { error: errors.intro } : {})}>
            <RichTextEditor
              id="company-intro"
              hint="회사를 소개하는 내용을 입력해 주세요"
              value={value.intro}
              onChange={(html) => update('intro', html)}
            />
          </ContentField>
        </ContentSection>
      </div>

      {/* 단일 자원이라 '목록으로' 갈 곳이 없다 — 되돌리기로 둔다. */}
      <ContentFormActions
        mode="edit"
        onList={() => {
          setValue(COMPANY_PROFILE);
          setErrors({});
          setSubmitted(false);
          toast.info({ message: '입력을 되돌렸습니다.', detail: '마지막으로 저장된 내용으로 돌아갑니다.' });
        }}
      >
        <ContentMobilePreview
          kind="포트폴리오"
          visible
          title={value.name}
          meta={[
            { label: '대표', value: value.ceo && `대표 ${value.ceo}` },
            { label: '설립', value: value.foundedAt && `설립 ${value.foundedAt}` },
          ]}
          showImageSlot
          body={value.intro}
          {...(images[0]?.url ? { imageUrl: images[0].url } : {})}
        />
      </ContentFormActions>

      <AdminConfirmModal
        open={confirmOpen}
        tone="brand"
        title="회사 소개 저장"
        description="아래 내용으로 고객 화면의 회사 소개가 바뀝니다."
        confirmLabel="저장"
        summary={[
          { label: '회사명', value: value.name.trim() },
          { label: '대표자', value: value.ceo.trim() },
          { label: '설립일', value: value.foundedAt.trim() || '미입력' },
          { label: '주소', value: value.address.trim() },
          { label: '대표 이미지', value: `${images.length}장` },
        ]}
        onConfirm={() => {
          setConfirmOpen(false);
          toast.success({ message: '회사 소개를 저장했습니다.', detail: value.name.trim() });
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </form>
  );
}
