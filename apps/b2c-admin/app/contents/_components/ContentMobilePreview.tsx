'use client';

import { htmlIsEmpty } from '@/lib/validation/content-record';

export type ContentPreviewMeta = { label: string; value: string };

export type ContentMobilePreviewProps = {
  /** 미리보기 제목에 쓰이는 콘텐츠 종류 */
  kind: '공지사항' | '뉴스' | '포트폴리오';
  visible: boolean;
  title: string;
  /** 제목 위에 붙는 작은 배지 (예: 고정) */
  badge?: string;
  /** 제목 아래 한 줄로 이어 붙는 정보 (등록일 · 언론사 · 기간 등) */
  meta?: ContentPreviewMeta[];
  /** 대표 이미지 — 없으면 자리표시자를 보여준다 */
  imageUrl?: string;
  showImageSlot?: boolean;
  /** HTML 본문 */
  body?: string;
  /** 글자 요약 (뉴스) */
  summary?: string;
  /** 원문 링크 (뉴스) */
  linkUrl?: string;
};

/**
 * 고객 화면 미리보기 — **모바일 기준만** 제공한다.
 *
 * 데스크톱까지 흉내 내면 실제 고객 화면과 어긋날 위험이 커지고, 어드민 사이드 폭에서
 * 의미 있게 보여줄 수도 없다. 상품 미리보기(`ProductMobilePreview`)와 같은 기기 틀을 쓴다.
 */
export function ContentMobilePreview({
  kind,
  visible,
  title,
  badge,
  meta = [],
  imageUrl,
  showImageSlot = false,
  body,
  summary,
  linkUrl,
}: ContentMobilePreviewProps) {
  const metaLine = meta.filter((row) => row.value.trim()).map((row) => row.value.trim());
  const hasBody = Boolean(body) && !htmlIsEmpty(body ?? '');

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-canvas">
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
        <h2 className="text-base font-semibold tracking-tight">고객 화면 미리보기</h2>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2.5 py-1 text-xs text-ink-faint">
          모바일
        </span>
      </div>

      <div className="flex justify-center px-6 py-6">
        {/* 모바일 기기 틀 */}
        <div className="w-full max-w-64 overflow-hidden rounded-2xl border border-border-strong bg-surface-raised">
          <div className="flex items-center justify-center border-b border-border bg-surface py-2">
            <span className="h-1 w-12 rounded-full bg-border-strong" />
          </div>

          <div className="relative">
            {showImageSlot && (
              <div className="flex aspect-[4/3] items-center justify-center bg-surface">
                {imageUrl ? (
                  // 미리보기는 objectURL 이라 next/image 최적화 대상이 아니다.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="대표 이미지" className="size-full object-cover" />
                ) : (
                  <span className="text-xs text-ink-faint">대표 이미지</span>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 px-4 py-4">
              {badge && (
                <span className="w-fit shrink-0 whitespace-nowrap rounded-full bg-brand-50 px-2 py-0.5 text-3xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-200">
                  {badge}
                </span>
              )}

              <p className="text-sm font-semibold leading-snug">
                {title.trim() || `${kind} 제목이 여기에 표시됩니다`}
              </p>

              {metaLine.length > 0 && (
                <p className="text-xs text-ink-faint">{metaLine.join(' · ')}</p>
              )}

              {summary !== undefined && summary.trim() && (
                <p className="border-t border-border pt-3 text-xs leading-relaxed text-ink-muted">{summary}</p>
              )}

              {body !== undefined && (
                <div className="border-t border-border pt-3">
                  {hasBody ? (
                    /*
                      본문은 방금 이 브라우저에서 담당자가 입력한 HTML 이다.
                      바깥에서 받아 온 값이 아니므로 편집기에 넣은 것과 같은 신뢰 수준으로 그린다.
                    */
                    <div
                      className="text-xs leading-relaxed [&_a]:text-brand-700 [&_a]:underline [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border-strong [&_blockquote]:pl-2 [&_blockquote]:text-ink-muted [&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:text-xs [&_h3]:font-semibold [&_hr]:my-2 [&_hr]:border-border [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4"
                      dangerouslySetInnerHTML={{ __html: body }}
                    />
                  ) : (
                    <p className="text-xs text-ink-faint">본문이 여기에 표시됩니다.</p>
                  )}
                </div>
              )}

              {linkUrl !== undefined && (
                <button
                  type="button"
                  disabled
                  className={`mt-1 h-9 w-full shrink-0 whitespace-nowrap rounded-lg text-xs font-medium ${
                    linkUrl.trim() ? 'bg-brand-500 text-white' : 'bg-surface text-ink-faint'
                  }`}
                >
                  {linkUrl.trim() ? '원문 보기' : '원문 링크 없음'}
                </button>
              )}
            </div>

            {!visible && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/60 px-4">
                <p className="text-center text-xs leading-relaxed text-white">
                  숨김 상태입니다.
                  <br />
                  고객 화면에 노출되지 않습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
