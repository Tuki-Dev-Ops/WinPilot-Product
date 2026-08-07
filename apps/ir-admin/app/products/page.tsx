import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { ProductListView } from './_components/ProductListView';

/**
 * Feature: `product.list` · IR Admin · route `/products`
 *
 * 사이트의 PRODUCT 갈래와 제품 화면이 이 값을 읽는다.
 */
export const metadata: Metadata = {
  title: '제품 | 목록 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function ProductListPage() {
  return (
    <IrShell sectionId="product" trail={['제품', '목록']} activeChildId="product-list">
      <ProductListView />
    </IrShell>
  );
}
