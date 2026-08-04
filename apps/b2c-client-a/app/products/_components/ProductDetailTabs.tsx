'use client';

import { useState } from 'react';
import { COPY, type ReviewRecord } from '@winpilot/client-content';
import { RichBody } from '@/app/_components/SiteShell';
import { SectionTabs } from '@/app/_components/SectionTabs';

/**
 * 상품 상세 아래 탭 — **상품 설명 · 상품 리뷰**.
 *
 * 둘을 세로로 이어 놓으면 리뷰를 보러 온 사람이 설명 전체를 지나쳐야 한다. 설명은 길이가
 * 제각각이라(이미지가 여러 장 들어가기도 한다) 스크롤 거리가 상품마다 달라진다.
 *
 * 리뷰 수는 탭에 함께 적는다 — 눌러 보기 전에 리뷰가 있는지 알 수 있어야 한다.
 *
 * ## 어드민 연동
 * - 상세 설명 ← `b2c-admin` 상품 등록의 **상세 설명** 에디터 내용 그대로 (이미지 포함)
 * - 리뷰 ← store `REVIEWS` — 어드민 리뷰 관리 화면이 생기면 그 화면이 원본이 된다
 * - 운영자가 숨긴 리뷰(`visible: false`)는 계약 단계에서 걸러져 여기까지 오지 않는다
 */
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex shrink-0 items-center gap-0.5" aria-label={`별점 ${rating}점`}>
      {[1, 2, 3, 4, 5].map((step) => (
        <svg
          key={step}
          width="14"
          height="14"
          viewBox="0 0 20 20"
          /* 채운 별과 빈 별을 모양으로 구분한다 — 색만 다르면 색각 이상 사용자가 셀 수 없다. */
          fill={step <= rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
          className={step <= rating ? 'text-signal-warn' : 'text-border-strong'}
        >
          <path d="M10 2.8 L12.2 7.6 L17.4 8.2 L13.6 11.8 L14.6 17 L10 14.5 L5.4 17 L6.4 11.8 L2.6 8.2 L7.8 7.6 Z" />
        </svg>
      ))}
    </span>
  );
}

export function ProductDetailTabs({
  description,
  reviews,
  average,
}: {
  description: string;
  reviews: ReviewRecord[];
  average: number;
}) {
  const [tabId, setTabId] = useState('description');

  const tabs = [
    { id: 'description', label: COPY.product.descriptionTab, count: 0 },
    { id: 'review', label: COPY.product.reviewTab, count: reviews.length },
  ];

  return (
    <section className="flex flex-col gap-6">
      <SectionTabs tabs={tabs} activeId={tabId} onSelect={setTabId} label={COPY.product.detail} />

      {tabId === 'description' ? (
        description ? (
          <RichBody html={description} />
        ) : (
          <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">
            {COPY.product.detailEmpty}
          </p>
        )
      ) : reviews.length === 0 ? (
        <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">
          {COPY.product.reviewEmpty}
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {/* 평균을 먼저 둔다 — 개별 리뷰를 다 읽기 전에 전체 인상이 잡혀야 한다. */}
          <div className="flex items-center gap-3 rounded-xl bg-surface px-5 py-4">
            <Stars rating={Math.round(average)} />
            <p className="text-sm">
              <span className="font-bold tabular-nums">{average}</span>
              <span className="ml-1.5 text-ink-muted">/ 5</span>
              <span className="ml-3 text-ink-faint">리뷰 {reviews.length}건</span>
            </p>
          </div>

          <div className="flex flex-col overflow-hidden rounded-xl border border-border">
            {reviews.map((review) => (
              <article key={review.id} className="flex flex-col gap-2 border-b border-border px-5 py-4 last:border-b-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stars rating={review.rating} />
                  <span className="shrink-0 text-sm font-medium">{review.author}</span>
                  {review.optionLabel && (
                    <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2.5 py-0.5 text-xs text-ink-muted">
                      {review.optionLabel}
                    </span>
                  )}
                  <span className="ml-auto shrink-0 whitespace-nowrap font-mono text-xs tabular-nums text-ink-faint">
                    {review.createdAt}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-ink-muted">{review.body}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
