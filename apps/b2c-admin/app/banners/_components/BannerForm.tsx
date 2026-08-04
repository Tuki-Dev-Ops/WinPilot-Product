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
import { ASPECT_16_9, ASPECT_21_9, HintInput, ImageUploader, useToast, type ImageRules, type UploadedImage } from '@winpilot/ui';
import { periodText, scheduleState } from '@/lib/data/banners';
import { hasErrors } from '@/lib/validation/content-record';
import { validateBanner, type BannerFormErrors, type BannerFormInput } from '@/lib/validation/banner-record';
import { BannerPreview } from './BannerPreview';

export const EMPTY_BANNER: BannerFormInput = {
  title: '',
  subtitle: '',
  badge: '',
  linkUrl: '',
  startAt: '',
  endAt: '',
  visible: true,
};

/** 메인 비주얼은 가로가 긴 자리에 들어간다 — 정사각형이나 세로 이미지는 잘려서 못 쓴다. */
const BANNER_IMAGE_RULES: ImageRules = {
  aspectRatios: [ASPECT_16_9, ASPECT_21_9],
};

export type BannerFormProps = {
  mode: 'create' | 'edit';
  bannerCode: string;
  createdAt: string;
  today: string;
  /** 자동 부여된 노출 순서 — 사람이 정하지 않는다 */
  order: number;
  initial?: BannerFormInput;
};

/**
 * 메인 비주얼 등록·수정.
 *
 * **프론트엔드 전용** — 이미지는 서버로 보내지 않고 브라우저 메모리에만 있다.
 */
export function BannerForm({ mode, bannerCode, createdAt, today, order, initial }: BannerFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState<BannerFormInput>(initial ?? EMPTY_BANNER);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [errors, setErrors] = useState<BannerFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const update = <K extends keyof BannerFormInput>(field: K, next: BannerFormInput[K]) => {
    const draft = { ...value, [field]: next };
    setValue(draft);
    if (submitted) setErrors(validateBanner(draft));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validateBanner(value);
    setErrors(found);

    if (hasErrors(found)) {
      const first = (['title', 'linkUrl', 'startAt', 'endAt'] as const).find((field) => found[field]);
      if (first) document.getElementById(`banner-${first}`)?.focus();
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
      message: `배너를 ${mode === 'create' ? '등록' : '저장'}했습니다.`,
      detail: `${bannerCode} · ${value.title.trim()}`,
    });
  };

  const goToList = () => {
    toast.info({ message: '배너 목록으로 이동합니다.', detail: '저장하지 않은 변경은 반영되지 않습니다.' });
    router.push('/banners');
  };

  const state = scheduleState(value, today);

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <ContentSection
          title="배너 이미지"
          description="첫 번째 이미지가 메인 비주얼에 쓰입니다. 16:9 또는 21:9 비율만 올릴 수 있습니다."
        >
          <ImageUploader images={images} onChange={setImages} rules={BANNER_IMAGE_RULES} />
        </ContentSection>

        <ContentSection title="기본 정보">
          <ContentReadonly label="배너 코드" value={bannerCode} note={mode === 'create' ? '자동생성' : '수정 불가'} />
          <ContentReadonly label="등록일" value={createdAt} note="자동입력" />

          <ContentField id="banner-title" label="제목" {...(errors.title ? { error: errors.title } : {})}>
            <HintInput
              id="banner-title"
              type="text"
              hint="배너 제목을 입력해 주세요"
              value={value.title}
              onChange={(event) => update('title', event.target.value)}
              invalid={Boolean(errors.title)}
            />
          </ContentField>

          <ContentField id="banner-subtitle" label="부제 (선택)">
            <HintInput
              id="banner-subtitle"
              type="text"
              hint="제목 아래 한 줄 · 예: 리빙 카테고리 전 품목 ~40%"
              value={value.subtitle}
              onChange={(event) => update('subtitle', event.target.value)}
            />
          </ContentField>

          <ContentField id="banner-badge" label="배지 (선택)">
            <HintInput
              id="banner-badge"
              type="text"
              hint="제목 위 작은 딱지 · 예: Promotion"
              value={value.badge}
              onChange={(event) => update('badge', event.target.value)}
            />
          </ContentField>

          <ContentField
            id="banner-linkUrl"
            label="링크 주소 (선택)"
            {...(errors.linkUrl ? { error: errors.linkUrl } : {})}
          >
            <HintInput
              id="banner-linkUrl"
              type="url"
              inputMode="url"
              hint="https://example.com/events/... · 비우면 링크 없는 이미지"
              value={value.linkUrl}
              onChange={(event) => update('linkUrl', event.target.value)}
              invalid={Boolean(errors.linkUrl)}
            />
          </ContentField>

          {/* 순서는 사람이 정하지 않는다 — 번호가 겹치거나 비면 고객 화면 순서가 흐트러진다. */}
          <ContentReadonly
            label="노출 순서"
            value={`${order}번째`}
            note={mode === 'create' ? '자동부여' : '수정 불가'}
          />
        </ContentSection>

        <ContentSection title="노출 기간" description="종료일을 비우면 종료 없이 계속 노출됩니다.">
          <ContentField id="banner-startAt" label="시작일" {...(errors.startAt ? { error: errors.startAt } : {})}>
            <HintInput
              id="banner-startAt"
              type="text"
              inputMode="numeric"
              hint="YYYY-MM-DD"
              value={value.startAt}
              onChange={(event) => update('startAt', event.target.value)}
              invalid={Boolean(errors.startAt)}
            />
          </ContentField>

          <ContentField
            id="banner-endAt"
            label="종료일 (선택)"
            {...(errors.endAt ? { error: errors.endAt } : {})}
          >
            <HintInput
              id="banner-endAt"
              type="text"
              inputMode="numeric"
              hint="YYYY-MM-DD · 비우면 상시 노출"
              value={value.endAt}
              onChange={(event) => update('endAt', event.target.value)}
              invalid={Boolean(errors.endAt)}
            />
          </ContentField>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface px-4 py-3">
            <p className="text-xs text-ink-muted">
              오늘({today}) 기준 <span className="font-medium text-ink">{state}</span>
            </p>
            <p className="text-xs tabular-nums text-ink-faint">{periodText(value)}</p>
          </div>
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

        <BannerPreview
          kind="banner"
          visible={value.visible}
          title={value.title}
          linkUrl={value.linkUrl}
          periodText={periodText(value)}
          scheduleLabel={state}
          {...(images[0]?.url ? { imageUrl: images[0].url } : {})}
        />
      </ContentFormActions>

      <AdminConfirmModal
        open={confirmOpen}
        tone="brand"
        title={mode === 'create' ? '배너 등록' : '배너 저장'}
        description={
          mode === 'create'
            ? '아래 내용으로 배너를 등록합니다. 노출 기간에 들어가면 고객 화면에 바로 보입니다.'
            : '아래 내용으로 배너를 저장합니다.'
        }
        confirmLabel={mode === 'create' ? '등록' : '저장'}
        summary={[
          { label: '배너 코드', value: bannerCode },
          { label: '제목', value: value.title.trim() },
          { label: '부제', value: value.subtitle.trim() || '없음' },
          { label: '배지', value: value.badge.trim() || '없음' },
          { label: '링크', value: value.linkUrl.trim() || '없음' },
          { label: '노출 순서', value: `${order}번째 (자동)` },
          { label: '노출 기간', value: periodText(value) },
          { label: '이미지', value: `${images.length}장` },
          { label: '오늘 기준 상태', value: state },
        ]}
        onConfirm={applySubmit}
        onClose={() => setConfirmOpen(false)}
      />
    </form>
  );
}
