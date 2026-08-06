'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { ALL_VALUE, ContentListView, type ContentColumn } from '@/app/contents/_components/ContentListView';
import { Badge, useToast } from '@winpilot/ui';
import { REVIEWS, type ReviewRecord } from '@/lib/data/reviews';
import { findProduct } from '@/lib/data/products';
import { AdminVisibilityBadge } from '@/app/_components/AdminVisibilityBadge';
import { ReviewDetailModal } from './ReviewDetailModal';

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
        <Star
          key={step}
          aria-hidden
          className={`size-3 ${step <= rating ? 'fill-current text-signal-warn' : 'text-border-strong'}`}
          strokeWidth={1.4}
        />
      ))}
    </span>
  );
}

const COLUMNS: Array<ContentColumn<ReviewRecord>> = [
  {
    id: 'body',
    label: '리뷰',
    /*
      3칸이다. 전에는 5칸이었고 열 합이 11 로 **예산 9 를 넘겨** 관리 열이 다음 줄로
      밀려 표가 두 줄로 접혔다. 본문은 어차피 `truncate` 되므로 칸을 넓혀도 더 보이지
      않고, 전문은 행을 눌렀을 때 모달에서 읽는다.
    */
    span: 3,
    render: (review) => (
      <div className="min-w-0">
        <p className="min-w-0 truncate text-sm">{review.body}</p>
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
        <p className="min-w-0 truncate text-sm text-ink-muted">{findProduct(review.productId)?.name ?? review.productId}</p>
        {review.optionLabel && <p className="min-w-0 truncate text-xs text-ink-faint">{review.optionLabel}</p>}
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
        <p className="min-w-0 truncate text-sm text-ink-muted">{review.author}</p>
        <p className="font-mono text-xs tabular-nums text-ink-faint">{review.createdAt}</p>
      </div>
    ),
  },
  {
    id: 'visible',
    label: '상태',
    span: 1,
    align: 'center',
    render: (review) => (
      <AdminVisibilityBadge visible={review.visible} />
    ),
  },
];

export function ReviewListView() {
  const toast = useToast();
  const [reviews, setReviews] = useState<ReviewRecord[]>(REVIEWS);
  const [openId, setOpenId] = useState<string | null>(null);

  const opened = reviews.find((review) => review.id === openId) ?? null;

  const toggleVisible = (target: ReviewRecord) => {
    const next = !target.visible;
    setReviews((previous) =>
      previous.map((review) => (review.id === target.id ? { ...review, visible: next } : review)),
    );
    setOpenId(null);
    toast.success({
      message: next ? '리뷰를 노출했습니다.' : '리뷰를 숨겼습니다.',
      detail: `${target.author}님의 리뷰 · ${target.createdAt}`,
    });
  };

  return (
    <>
    <ContentListView<ReviewRecord>
      title="리뷰"
      description="고객이 남긴 리뷰를 확인하고 노출을 정하세요."
      entityLabel="리뷰"
      items={reviews}
      onItemsChange={setReviews}
      idOf={(item) => item.id}
      /*
        본문이 아니라 **누가 언제 쓴 리뷰인지**를 이름으로 준다.

        전에는 `item.body` 를 그대로 넘겨서, 낭독기가 삭제 단추에 닿을 때마다 리뷰 한 편을
        통째로 읽고 마지막에 '삭제' 라고 말했다 — 무엇을 지우는지 듣기 전에 문장이 끝나지
        않는다. 확인 창과 토스트에도 같은 문장이 그대로 실렸다.

        리뷰에는 제목이 없어서 다른 목록처럼 `title` 을 넘길 수 없다. 대신 작성자와 날짜를
        묶으면 짧으면서도 목록 안에서 한 줄을 특정할 수 있다.
      */
      labelOf={(item) => `${item.author}님의 리뷰 (${item.createdAt})`}
      visibleOf={(item) => item.visible}
      searchIn={(item) => `${item.body} ${item.author} ${item.id} ${findProduct(item.productId)?.name ?? ''}`}
      columns={COLUMNS}
      searchId="review-search"
      searchHint="내용, 작성자, 상품명으로 검색"
      // 리뷰는 운영자가 쓰지 않는다 — 등록 단추 자리에 고객 화면으로 가는 길을 둔다.
      actionLabel="고객 화면에서 보기"
      onAction={() => toast.info('상품 상세의 리뷰 탭에서 고객이 보는 모습을 확인할 수 있습니다.')}
      /*
        본문이 목록에서 잘리므로 전문을 읽을 자리가 필요하다. 화면을 따로 세우지 않는 이유는
        `docs/path.md` §3.2 — 여기서 하는 일이 숨기기 하나뿐이라 화면 세 장을 오갈 값이 없다.
      */
      onOpen={(item) => setOpenId(item.id)}
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

    <ReviewDetailModal
      open={opened !== null}
      review={opened}
      productName={opened ? findProduct(opened.productId)?.name ?? opened.productId : ''}
      onClose={() => setOpenId(null)}
      onToggleVisible={toggleVisible}
    />
    </>
  );
}
