'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import { BannerPreview } from '@/app/banners/_components/BannerPreview';
import {
  ContentField,
  ContentFormActions,
  ContentReadonly,
  ContentSection,
  ContentToggle,
} from '@/app/contents/_components/ContentFormShell';
import { Dropdown, HintInput, RichTextEditor, useToast } from '@winpilot/ui';
import { periodText, POPUP_POSITIONS, scheduleState } from '@/lib/data/banners';
import { validatePopup, type PopupFormErrors, type PopupFormInput } from '@/lib/validation/banner-record';
import { hasErrors } from '@/lib/validation/content-record';

export const EMPTY_POPUP: PopupFormInput = {
  title: '',
  body: '',
  linkUrl: '',
  startAt: '',
  endAt: '',
  position: '가운데',
  width: '360',
  todayClose: true,
  visible: true,
};

export type PopupFormProps = {
  mode: 'create' | 'edit';
  popupCode: string;
  createdAt: string;
  today: string;
  initial?: PopupFormInput;
};

/**
 * 팝업 등록·수정.
 *
 * 팝업은 고객 화면을 가리는 요소라 **언제 · 어디에 · 얼마나 크게** 뜨는지가 본문만큼 중요하다.
 * 그래서 위치·폭·기간을 본문과 같은 무게로 받고, 미리보기에서 실제로 덮이는 모습을 보여준다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function PopupForm({ mode, popupCode, createdAt, today, initial }: PopupFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState<PopupFormInput>(initial ?? EMPTY_POPUP);
  const [errors, setErrors] = useState<PopupFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const update = <K extends keyof PopupFormInput>(field: K, next: PopupFormInput[K]) => {
    const draft = { ...value, [field]: next };
    setValue(draft);
    if (submitted) setErrors(validatePopup(draft));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validatePopup(value);
    setErrors(found);

    if (hasErrors(found)) {
      const first = (['title', 'linkUrl', 'startAt', 'endAt', 'width'] as const).find((field) => found[field]);
      if (first) document.getElementById(`popup-${first}`)?.focus();
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
      message: `팝업을 ${mode === 'create' ? '등록' : '저장'}했습니다.`,
      detail: `${popupCode} · ${value.title.trim()}`,
    });
  };

  const goToList = () => {
    toast.info({ message: '팝업 목록으로 이동합니다.', detail: '저장하지 않은 변경은 반영되지 않습니다.' });
    router.push('/banners/popups');
  };

  const state = scheduleState(value, today);

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <ContentSection title="기본 정보">
          <ContentReadonly label="팝업 코드" value={popupCode} note={mode === 'create' ? '자동생성' : '수정 불가'} />
          <ContentReadonly label="등록일" value={createdAt} note="자동입력" />

          <ContentField id="popup-title" label="제목" {...(errors.title ? { error: errors.title } : {})}>
            <HintInput
              id="popup-title"
              type="text"
              hint="팝업 제목을 입력해 주세요"
              value={value.title}
              onChange={(event) => update('title', event.target.value)}
              invalid={Boolean(errors.title)}
            />
          </ContentField>

          <ContentField
            id="popup-linkUrl"
            label="링크 주소 (선택)"
            {...(errors.linkUrl ? { error: errors.linkUrl } : {})}
          >
            <HintInput
              id="popup-linkUrl"
              type="url"
              inputMode="url"
              hint="https://example.com/... · 비우면 링크 없는 팝업"
              value={value.linkUrl}
              onChange={(event) => update('linkUrl', event.target.value)}
              invalid={Boolean(errors.linkUrl)}
            />
          </ContentField>
        </ContentSection>

        <ContentSection title="내용" description="글자 서식과 이미지를 넣을 수 있습니다.">
          <ContentField id="popup-body" label="본문" {...(errors.body ? { error: errors.body } : {})}>
            <RichTextEditor
              id="popup-body"
              hint="팝업에 보여줄 내용을 입력해 주세요"
              value={value.body}
              onChange={(html) => update('body', html)}
            />
          </ContentField>
        </ContentSection>

        <ContentSection title="표시 방식">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">위치</span>
            <Dropdown
              id="popup-position"
              label="위치 선택"
              options={POPUP_POSITIONS.map((position) => ({ value: position, label: position }))}
              value={value.position}
              onChange={(next) => update('position', next)}
            />
          </div>

          <ContentField id="popup-width" label="가로 폭" {...(errors.width ? { error: errors.width } : {})}>
            <div className="flex items-center gap-2">
              <HintInput
                id="popup-width"
                type="text"
                inputMode="numeric"
                hint="200 ~ 800 사이의 숫자"
                value={value.width}
                onChange={(event) => update('width', event.target.value)}
                invalid={Boolean(errors.width)}
                className="flex-1"
              />
              <span className="w-10 shrink-0 text-sm text-ink-muted">px</span>
            </div>
          </ContentField>

          <ContentToggle
            legend="오늘 하루 보지 않기"
            options={['제공', '제공 안 함']}
            value={value.todayClose}
            onChange={(next) => update('todayClose', next)}
          />
        </ContentSection>

        <ContentSection title="노출 기간" description="종료일을 비우면 종료 없이 계속 노출됩니다.">
          <ContentField id="popup-startAt" label="시작일" {...(errors.startAt ? { error: errors.startAt } : {})}>
            <HintInput
              id="popup-startAt"
              type="text"
              inputMode="numeric"
              hint="YYYY-MM-DD"
              value={value.startAt}
              onChange={(event) => update('startAt', event.target.value)}
              invalid={Boolean(errors.startAt)}
            />
          </ContentField>

          <ContentField id="popup-endAt" label="종료일 (선택)" {...(errors.endAt ? { error: errors.endAt } : {})}>
            <HintInput
              id="popup-endAt"
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
          kind="popup"
          visible={value.visible}
          title={value.title}
          linkUrl={value.linkUrl}
          periodText={periodText(value)}
          scheduleLabel={state}
          body={value.body}
          position={value.position}
          todayClose={value.todayClose}
        />
      </ContentFormActions>

      <AdminConfirmModal
        open={confirmOpen}
        tone="brand"
        title={mode === 'create' ? '팝업 등록' : '팝업 저장'}
        description={
          mode === 'create'
            ? '아래 내용으로 팝업을 등록합니다. 노출 기간에 들어가면 고객 화면을 덮고 바로 뜹니다.'
            : '아래 내용으로 팝업을 저장합니다.'
        }
        confirmLabel={mode === 'create' ? '등록' : '저장'}
        summary={[
          { label: '팝업 코드', value: popupCode },
          { label: '제목', value: value.title.trim() },
          { label: '위치 · 폭', value: `${value.position} · ${value.width}px` },
          { label: '링크', value: value.linkUrl.trim() || '없음' },
          { label: '노출 기간', value: periodText(value) },
          { label: '오늘 하루 보지 않기', value: value.todayClose ? '제공' : '제공 안 함' },
          { label: '오늘 기준 상태', value: state },
        ]}
        onConfirm={applySubmit}
        onClose={() => setConfirmOpen(false)}
      />
    </form>
  );
}
