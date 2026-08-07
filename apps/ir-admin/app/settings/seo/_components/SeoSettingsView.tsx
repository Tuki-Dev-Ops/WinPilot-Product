'use client';

import { useState } from 'react';
import { Badge, PageHeading, useToast } from '@winpilot/ui';
import { SITE_SEO } from '@winpilot/store';
import { IrConfirmModal } from '@/app/_components/IrConfirmModal';
import { IrField, IrPrimaryButton, IrSaveRow } from '@/app/_components/IrForm';
import { IrPanel } from '@/app/_components/IrPanel';

/** 검색 결과에서 잘리는 길이. 넘으면 뒤가 `…` 로 사라진다. */
const LIMIT = { title: 60, description: 155 } as const;

/**
 * 설정 > SEO 정보.
 *
 * ## 글자 수를 세어 보여 준다
 * 제목과 설명은 검색 결과에서 **길면 잘린다**. 잘린 자리가 하필 문장 가운데면 무슨 회사인지
 * 읽히지 않는데, 그 사실은 검색 결과에 실제로 뜨기 전까지 아무도 모른다. 그래서 쓰는 동안
 * 남은 글자를 세어 준다 — 넘겨도 막지는 않는다. 잘려도 되는 문장이 있다.
 *
 * ## 공유 그림을 비워 두지 않는다
 * 비면 카카오톡·슬랙에 링크가 **글자만으로** 뜬다. 그러면 눌리지 않는다.
 *
 * **프론트엔드 전용** — 저장은 이 화면에만 반영된다.
 */
export function SeoSettingsView() {
  const [title, setTitle] = useState(SITE_SEO.title);
  const [description, setDescription] = useState(SITE_SEO.description);
  const [ogImage, setOgImage] = useState(SITE_SEO.ogImage);
  const [canonical, setCanonical] = useState(SITE_SEO.canonical);
  const [pending, setPending] = useState(false);
  const toast = useToast();

  return (
    <>
      <PageHeading title="SEO 정보" description="검색 결과와 공유 카드에 뜨는 값입니다." />

      <IrPanel title="검색 결과" description="구글·네이버 결과 한 줄에 그대로 나갑니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <IrField
            label="제목"
            htmlFor="seo-title"
            required
            hint={`${title.length} / ${LIMIT.title}자 — 넘으면 검색 결과에서 뒤가 잘립니다.`}
          >
            <input
              id="seo-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-11 w-full min-w-0 rounded-lg border border-border-strong bg-surface px-3 text-sm text-ink"
            />
          </IrField>

          <IrField
            label="설명"
            htmlFor="seo-description"
            required
            hint={`${description.length} / ${LIMIT.description}자`}
          >
            <textarea
              id="seo-description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full min-w-0 resize-y rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink"
            />
          </IrField>

          <IrField label="대표 주소" htmlFor="seo-canonical" hint="같은 화면이 여러 주소로 뜰 때 어느 것이 원본인지 알립니다.">
            <input
              id="seo-canonical"
              type="url"
              value={canonical}
              onChange={(event) => setCanonical(event.target.value)}
              className="h-11 w-full min-w-0 rounded-lg border border-border-strong bg-surface px-3 font-mono text-sm text-ink"
            />
          </IrField>
        </div>
      </IrPanel>

      <IrPanel title="공유 카드" description="메신저에 링크를 붙였을 때 뜨는 그림입니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <IrField label="그림 경로" htmlFor="seo-og" hint="비우면 링크가 글자만으로 뜹니다 — 그러면 눌리지 않습니다.">
            <input
              id="seo-og"
              type="text"
              value={ogImage}
              onChange={(event) => setOgImage(event.target.value)}
              className="h-11 w-full min-w-0 rounded-lg border border-border-strong bg-surface px-3 font-mono text-sm text-ink"
            />
          </IrField>

          <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3">
            <span className="text-xs text-ink-faint">이렇게 뜹니다</span>
            <span className="truncate text-sm font-medium text-ink">{title || '제목 없음'}</span>
            <span className="line-clamp-2 text-xs leading-relaxed text-ink-muted">
              {description || '설명 없음'}
            </span>
            <span className="truncate font-mono text-xs text-ink-faint">{canonical}</span>
          </div>

          <IrSaveRow>
            <IrPrimaryButton type="button" onClick={() => setPending(true)}>
              저장
            </IrPrimaryButton>
          </IrSaveRow>
        </div>
      </IrPanel>

      <p className="text-sm leading-relaxed text-ink-muted">
        <Badge tone="neutral">알아 둘 것</Badge> 검색 결과에 반영되는 데에는 며칠이 걸립니다. 저장한 뒤
        바로 검색해도 옛 문구가 뜹니다.
      </p>

      <IrConfirmModal
        open={pending}
        title="SEO 정보를 저장할까요"
        message="검색 결과와 공유 카드에 이 문구가 나갑니다. 반영에는 며칠이 걸립니다."
        detail={title}
        confirmLabel="저장"
        onConfirm={() => {
          setPending(false);
          toast.success({ message: 'SEO 정보를 저장했습니다.' });
        }}
        onCancel={() => setPending(false)}
      />
    </>
  );
}
