'use client';

import { useState } from 'react';
import { ALL_VALUE, ContentListView, type ContentColumn } from '@/app/contents/_components/ContentListView';
import { useToast } from '@winpilot/ui';
import { REVIEWS, type ReviewRecord } from '@/lib/data/reviews';
import { findProduct } from '@/lib/data/products';

/**
 * 리뷰 목록 — 고객 화면의 **상품 상세 리뷰 탭**이 보는 그 목록이다.
 *
 * 리뷰는 운영자가 쓰는 것이 아니라 고객이 남긴 것이라, 여기서 하는 일은 **숨기는 것**뿐이다.
 * 지우지 않고 숨기는 이유: 지우면 왜 사라졌는지 아무 데도 남지 않고, 평균 별점만 조용히 바뀐다.
 *
 * 별점은 숫자와 함께 **별 모양**으로도 보여 준다 — 목록을 훑을 때 숫자만으로는 눈에 걸리지 않는다.
 */
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex shrink-0 items-center gap-0.5" aria-label={`별점 ${rating}점`}>
      {[1, 2, 3, 4, 5].map((step) => (
        <svg
          key={step}
          width="12"
          height="12"
          viewBox="0 0 20 20"
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

const COLUMNS: Array<ContentColumn<ReviewRecord>> = [
  {
    id: 'body',
    label: '리뷰',
    span: 5,
    render: (review) => (
      <div className="min-w-0">
        <p className="truncate text-sm">{review.body}</p>
        <p className="font-mono text-xs text-ink-faint">{review.id}</p>
      </div>
    ),
  },
  {
    id: 'product',
    label: '상품',
    span: 2,
    render: (review) => (
      <div className="min-w-0">
        <p className="truncate text-sm text-ink-muted">{findProduct(review.productId)?.name ?? review.productId}</p>
        {review.optionLabel && <p className="truncate text-xs text-ink-faint">{review.optionLabel}</p>}
      </div>
    ),
  },
  {
    id: 'rating',
    label: '별점',
    span: 2,
    render: (review) => (
      <span className="flex items-center gap-2">
        <Stars rating={review.rating} />
        <span className="text-xs tabular-nums text-ink-muted">{review.rating}</span>
      </span>
    ),
  },
  {
    id: 'author',
    label: '작성자',
    span: 1,
    render: (review) => (
      <div className="min-w-0">
        <p className="truncate text-sm text-ink-muted">{review.author}</p>
        <p className="font-mono text-xs tabular-nums text-ink-faint">{review.createdAt}</p>
      </div>
    ),
  },
  {
    id: 'visible',
    label: '노출',
    span: 1,
    align: 'center',
    render: (review) => (
      <span
        className={`inline-block shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
          review.visible ? 'bg-signal-ok/12 text-signal-ok' : 'bg-surface text-ink-muted'
        }`}
      >
        {review.visible ? '노출' : '숨김'}
      </span>
    ),
  },
];

export function ReviewListView() {
  const toast = useToast();
  const [reviews, setReviews] = useState<ReviewRecord[]>(REVIEWS);

  return (
    <ContentListView<ReviewRecord>
      entityLabel="리뷰"
      items={reviews}
      onItemsChange={setReviews}
      idOf={(item) => item.id}
      labelOf={(item) => item.body}
      visibleOf={(item) => item.visible}
      searchIn={(item) => `${item.body} ${item.author} ${item.id} ${findProduct(item.productId)?.name ?? ''}`}
      columns={COLUMNS}
      searchId="review-search"
      searchHint="내용, 작성자, 상품명으로 검색"
      // 리뷰는 운영자가 쓰지 않는다 — 등록 단추 자리에 고객 화면으로 가는 길을 둔다.
      actionLabel="고객 화면에서 보기"
      onAction={() => toast.info('상품 상세의 리뷰 탭에서 고객이 보는 모습을 확인할 수 있습니다.')}
      onOpen={(item) => toast.info(`${item.author} 님의 리뷰 — 상세 화면은 준비 중입니다.`)}
      filters={[
        {
          id: 'rating',
          label: '별점',
          options: [5, 4, 3, 2, 1].map((score) => ({ value: String(score), label: `${score}점` })),
        },
      ]}
      matchesFilters={(item, values) => {
        const rating = values.rating ?? ALL_VALUE;
        if (rating !== ALL_VALUE && String(item.rating) !== rating) return false;
        return true;
      }}
    />
  );
}
