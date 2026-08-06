'use client';

import { Star } from 'lucide-react';
import { Badge, Button, Modal } from '@winpilot/ui';
import { AdminVisibilityBadge } from '@/app/_components/AdminVisibilityBadge';
import type { ReviewRecord } from '@/lib/data/reviews';

export type ReviewDetailModalProps = {
  open: boolean;
  review: ReviewRecord | null;
  productName: string;
  onClose: () => void;
  /** 노출을 뒤집는다. 리뷰에서 운영자가 할 수 있는 일은 이것 하나뿐이다 */
  onToggleVisible: (review: ReviewRecord) => void;
};

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

/**
 * 리뷰 한 편을 읽고 노출을 정하는 창.
 *
 * ## 왜 화면이 아니라 모달인가
 * `docs/path.md` §3.2 가 리뷰를 **목록 한 장으로 끝나는 자원**으로 적어 두었다 — 운영자가
 * 여기서 하는 일은 **숨기는 것 하나**뿐이고, 고칠 값이 없는 자원에 화면을 세 장 만들면
 * 리뷰 하나 숨기는 데 목록 → 상세 → 저장 → 목록으로 네 번 오간다.
 *
 * 그런데도 여는 자리가 필요한 이유는 **본문이 목록에서 잘리기 때문**이다. 한 줄로 줄인 글만
 * 보고 숨길지 정할 수는 없다. 전에는 행을 눌러도 `상세 화면은 준비 중입니다` 라는 토스트만
 * 떴는데, 그 말은 없는 화면을 약속하는 것이라 §3.2 와도 어긋났다.
 *
 * ## 지우지 않고 숨기기만 하는 이유
 * 지우면 왜 사라졌는지 아무 데도 남지 않고 평균 별점만 조용히 바뀐다. 그래서 이 창에는
 * 삭제가 없다 — 목록의 일괄 삭제와 달리 여기서는 되돌릴 수 있는 일만 한다.
 */
export function ReviewDetailModal({
  open,
  review,
  productName,
  onClose,
  onToggleVisible,
}: ReviewDetailModalProps) {
  return (
    <Modal
      open={open && review !== null}
      title="리뷰"
      description="고객이 남긴 글이라 고칠 수 없습니다. 고객 화면에 보일지만 정합니다."
      onClose={onClose}
      footer={
        <>
          <Button tone="secondary" onClick={onClose}>
            닫기
          </Button>
          {review && (
            <Button
              tone={review.visible ? 'danger' : 'primary'}
              onClick={() => onToggleVisible(review)}
            >
              {review.visible ? '숨기기' : '노출하기'}
            </Button>
          )}
        </>
      }
    >
      {review && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Stars rating={review.rating} />
            <span className="text-sm tabular-nums text-ink-muted">{review.rating}점</span>
            <span className="ml-auto">
              <AdminVisibilityBadge visible={review.visible} />
            </span>
          </div>

          {/*
            본문은 `whitespace-pre-line` 으로 줄바꿈을 살린다. 고객이 문단을 나눠 썼는데
            한 덩어리로 붙여 보여 주면 무엇을 말하는 글인지 읽는 데 시간이 더 든다.
          */}
          <p className="whitespace-pre-line rounded-lg bg-surface px-4 py-3 text-sm leading-relaxed">
            {review.body}
          </p>

          <dl className="flex flex-col gap-2">
            {[
              { label: '상품', value: productName },
              { label: '구매 옵션', value: review.optionLabel || '옵션 없음' },
              { label: '작성자', value: review.author },
              { label: '작성일', value: review.createdAt },
              { label: '리뷰 코드', value: review.id },
            ].map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4">
                <dt className="shrink-0 text-xs text-ink-faint">{row.label}</dt>
                <dd className="min-w-0 truncate text-right text-sm">{row.value}</dd>
              </div>
            ))}
          </dl>

          {/* 숨긴 리뷰가 평균 별점에서 빠지는지 아닌지는 운영자가 알아야 하는 사실이다. */}
          <p className="text-xs leading-relaxed text-ink-muted">
            숨긴 리뷰는 상품 상세의 리뷰 탭에 나오지 않지만, 평균 별점 계산에는 그대로
            들어갑니다. <Badge tone="neutral">숨김</Badge> 상태에서도 고객이 남긴 별점은
            사라지지 않습니다.
          </p>
        </div>
      )}
    </Modal>
  );
}
