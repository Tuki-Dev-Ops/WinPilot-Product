'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import {
  ContentField,
  ContentFormActions,
  ContentReadonly,
  ContentSection,
  ContentToggle,
} from '@/app/contents/_components/ContentFormShell';
import { ContentMobilePreview } from '@/app/contents/_components/ContentMobilePreview';
import { HintInput, ImageUploader, RichTextEditor, useToast, type UploadedImage } from '@winpilot/ui';
import {
  hasErrors,
  validatePortfolio,
  type PortfolioFormErrors,
  type PortfolioFormInput,
} from '@/lib/validation/content-record';

export const EMPTY_PORTFOLIO: PortfolioFormInput = {
  title: '',
  client: '',
  period: '',
  body: '',
  visible: true,
};

export type PortfolioFormProps = {
  mode: 'create' | 'edit';
  portfolioCode: string;
  createdAt: string;
  initial?: PortfolioFormInput;
};

/**
 * 포트폴리오 등록·수정 — **이미지 + HTML 본문**이 핵심이다.
 *
 * 대표 이미지는 목록·고객 화면 카드에 쓰이고, 본문 안의 이미지는 상세에만 나온다.
 * 둘의 쓰임이 달라 입력을 나눠 둔다.
 *
 * **프론트엔드 전용** — 이미지는 서버로 보내지 않고 브라우저 메모리에만 있다.
 */
export function PortfolioForm({ mode, portfolioCode, createdAt, initial }: PortfolioFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState<PortfolioFormInput>(initial ?? EMPTY_PORTFOLIO);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [errors, setErrors] = useState<PortfolioFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const update = <K extends keyof PortfolioFormInput>(field: K, next: PortfolioFormInput[K]) => {
    const draft = { ...value, [field]: next };
    setValue(draft);
    if (submitted) setErrors(validatePortfolio(draft));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validatePortfolio(value);
    setErrors(found);

    if (hasErrors(found)) {
      const first = (['title', 'client'] as const).find((field) => found[field]);
      if (first) document.getElementById(`portfolio-${first}`)?.focus();
      toast.error({
        message: `${mode === 'create' ? '등록' : '저장'}하지 못했습니다.`,
        detail: `확인이 필요한 항목이 ${Object.keys(found).length}개 있습니다.`,
      });
      return;
    }

    setConfirmOpen(true);
  };

  const applySubmit = () => {
    setConfirmOpen(false);
    toast.success({
      message: `포트폴리오를 ${mode === 'create' ? '등록' : '저장'}했습니다.`,
      detail: `${portfolioCode} · ${value.title.trim()}`,
    });
  };

  const goToList = () => {
    toast.info({ message: '포트폴리오 목록으로 이동합니다.', detail: '저장하지 않은 변경은 반영되지 않습니다.' });
    router.push('/contents/portfolios');
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <ContentSection title="대표 이미지" description="첫 번째 이미지가 목록과 고객 화면 카드에 쓰입니다.">
          <ImageUploader images={images} onChange={setImages} />
        </ContentSection>

        <ContentSection title="기본 정보">
          <ContentReadonly
            label="포트폴리오 코드"
            value={portfolioCode}
            note={mode === 'create' ? '자동생성' : '수정 불가'}
          />
          <ContentReadonly label="등록일" value={createdAt} note="자동입력" />

          <ContentField id="portfolio-title" label="제목" {...(errors.title ? { error: errors.title } : {})}>
            <HintInput
              id="portfolio-title"
              type="text"
              hint="프로젝트 제목을 입력해 주세요"
              value={value.title}
              onChange={(event) => update('title', event.target.value)}
              invalid={Boolean(errors.title)}
            />
          </ContentField>

          <ContentField id="portfolio-client" label="고객사" {...(errors.client ? { error: errors.client } : {})}>
            <HintInput
              id="portfolio-client"
              type="text"
              hint="예: 무드하우스"
              value={value.client}
              onChange={(event) => update('client', event.target.value)}
              invalid={Boolean(errors.client)}
            />
          </ContentField>

          <ContentField id="portfolio-period" label="기간 (선택)">
            <HintInput
              id="portfolio-period"
              type="text"
              hint="예: 2026.03 ~ 2026.07"
              value={value.period}
              onChange={(event) => update('period', event.target.value)}
            />
          </ContentField>
        </ContentSection>

        <ContentSection title="본문" description="글자 서식과 이미지를 넣을 수 있습니다. HTML 원본도 직접 고칠 수 있습니다.">
          <ContentField id="portfolio-body" label="상세 내용" {...(errors.body ? { error: errors.body } : {})}>
            <RichTextEditor
              id="portfolio-body"
              hint="과제 · 진행 · 결과를 적어 주세요"
              value={value.body}
              onChange={(html) => update('body', html)}
            />
          </ContentField>
        </ContentSection>
      </div>

      <ContentFormActions mode={mode} onList={goToList}>
        <ContentSection title="노출 설정">
          <ContentToggle
            legend="고객 화면 노출"
            options={['노출', '숨김']}
            value={value.visible}
            onChange={(next) => update('visible', next)}
          />
        </ContentSection>

        <ContentMobilePreview
          kind="포트폴리오"
          visible={value.visible}
          title={value.title}
          meta={[
            { label: '고객사', value: value.client },
            { label: '기간', value: value.period },
          ]}
          showImageSlot
          body={value.body}
          {...(images[0]?.url ? { imageUrl: images[0].url } : {})}
        />
      </ContentFormActions>

      <AdminConfirmModal
        open={confirmOpen}
        tone="brand"
        title={mode === 'create' ? '포트폴리오 등록' : '포트폴리오 저장'}
        description={
          mode === 'create'
            ? '아래 내용으로 포트폴리오를 등록합니다. 노출 상태에 따라 고객 화면에 바로 보일 수 있습니다.'
            : '아래 내용으로 포트폴리오를 저장합니다.'
        }
        confirmLabel={mode === 'create' ? '등록' : '저장'}
        summary={[
          { label: '코드', value: portfolioCode },
          { label: '제목', value: value.title.trim() },
          { label: '고객사', value: value.client.trim() },
          { label: '기간', value: value.period.trim() || '미입력' },
          { label: '대표 이미지', value: `${images.length}장` },
          { label: '노출', value: value.visible ? '노출' : '숨김' },
        ]}
        onConfirm={applySubmit}
        onClose={() => setConfirmOpen(false)}
      />
    </form>
  );
}
