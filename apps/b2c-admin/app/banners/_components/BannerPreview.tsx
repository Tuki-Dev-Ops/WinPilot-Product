'use client';

import { htmlIsEmpty } from '@/lib/validation/content-record';

export type BannerPreviewProps = {
  kind: 'banner' | 'popup';
  visible: boolean;
  title: string;
  linkUrl: string;
  periodText: string;
  scheduleLabel: string;
  /** 메인 비주얼 — 업로드한 대표 이미지 */
  imageUrl?: string;
  /** 팝업 — HTML 본문 */
  body?: string;
  position?: string;
  todayClose?: boolean;
};

const POSITION_CLASS: Record<string, string> = {
  '왼쪽 위': 'items-start justify-start',
  가운데: 'items-center justify-center',
  '오른쪽 아래': 'items-end justify-end',
};

/**
 * 배너·팝업 고객 화면 미리보기 — **모바일 기준만** 제공한다.
 *
 * 팝업은 "화면 위에 덮인다" 는 것이 핵심이라 뒤에 흐린 화면을 함께 그린다.
 * 위치·폭을 숫자로만 두면 실제로 어디에 얼마나 크게 뜨는지 알 수 없다.
 */
export function BannerPreview({
  kind,
  visible,
  title,
  linkUrl,
  periodText,
  scheduleLabel,
  imageUrl,
  body,
  position = '가운데',
  todayClose = false,
}: BannerPreviewProps) {
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
        <div className="w-full max-w-64 overflow-hidden rounded-2xl border border-border-strong bg-surface-raised">
          <div className="flex items-center justify-center border-b border-border bg-surface py-2">
            <span className="h-1 w-12 rounded-full bg-border-strong" />
          </div>

          {kind === 'banner' ? (
            <div className="relative">
              <div className="flex aspect-[16/9] items-center justify-center bg-surface">
                {imageUrl ? (
                  // 미리보기는 objectURL 이라 next/image 최적화 대상이 아니다.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="배너 이미지" className="size-full object-cover" />
                ) : (
                  <span className="text-xs text-ink-faint">배너 이미지</span>
                )}
              </div>

              <div className="flex flex-col gap-2 px-4 py-4">
                <p className="text-sm font-semibold leading-snug">
                  {title.trim() || '배너 제목이 여기에 표시됩니다'}
                </p>
                <p className="min-w-0 truncate text-xs text-ink-faint">
                  {linkUrl.trim() || '링크 없음 — 눌러도 이동하지 않습니다'}
                </p>
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
          ) : (
            /* 팝업 — 뒤에 흐린 화면을 깔고 그 위에 뜬다 */
            <div className={`relative flex min-h-64 bg-surface p-3 ${POSITION_CLASS[position] ?? POSITION_CLASS['가운데']}`}>
              <div className="pointer-events-none absolute inset-0 flex flex-col gap-2 p-3 opacity-40">
                <span className="h-3 w-2/3 rounded bg-border-strong" />
                <span className="h-2 w-full rounded bg-border" />
                <span className="h-2 w-5/6 rounded bg-border" />
                <span className="mt-2 h-16 w-full rounded bg-border" />
              </div>

              <div className="relative z-10 w-full max-w-full rounded-lg border border-border bg-surface-raised p-3 shadow-lg">
                <p className="text-xs font-semibold leading-snug">
                  {title.trim() || '팝업 제목이 여기에 표시됩니다'}
                </p>

                <div className="mt-2 border-t border-border pt-2">
                  {hasBody ? (
                    /*
                      본문은 방금 이 브라우저에서 담당자가 입력한 HTML 이다.
                      바깥에서 받아 온 값이 아니므로 편집기에 넣은 것과 같은 신뢰 수준으로 그린다.
                    */
                    <div
                      className="text-2xs leading-relaxed [&_a]:text-brand-700 [&_a]:underline [&_img]:my-1 [&_img]:max-w-full [&_img]:rounded [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-4"
                      dangerouslySetInnerHTML={{ __html: body ?? '' }}
                    />
                  ) : (
                    <p className="text-2xs text-ink-faint">본문이 여기에 표시됩니다.</p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2">
                  <span className="text-3xs text-ink-faint">
                    {todayClose ? '오늘 하루 보지 않기' : ''}
                  </span>
                  <span className="text-3xs text-ink-muted">닫기</span>
                </div>
              </div>

              {!visible && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-ink/60 px-4">
                  <p className="text-center text-xs leading-relaxed text-white">
                    숨김 상태입니다.
                    <br />
                    고객 화면에 노출되지 않습니다.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
            <span className="shrink-0 whitespace-nowrap text-3xs text-ink-faint">{scheduleLabel}</span>
            <span className="min-w-0 truncate text-right text-3xs text-ink-muted">{periodText}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
