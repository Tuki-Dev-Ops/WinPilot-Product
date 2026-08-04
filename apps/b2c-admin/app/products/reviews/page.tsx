import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { ReviewListView } from './_components/ReviewListView';

/**
 * Feature: `review.list` · B2C Admin · route `/products/reviews`
 *
 * 고객이 상품 상세에 남긴 리뷰를 운영자가 보는 자리다. 고객 화면에는 목록 라우트가 없다 —
 * 리뷰는 상품 상세의 탭 안에서만 읽힌다.
 */
export const metadata: Metadata = {
  title: '상품 | 리뷰 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminReviewListPage() {
  return (
    <AdminShell sectionId="product" trail={['상품', '리뷰']} activeChildId="product-review">
      <ReviewListView />
    </AdminShell>
  );
}
