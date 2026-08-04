import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { todayStamp } from '@/lib/data/product-tags';
import { ProductListView } from './_components/ProductListView';

/**
 * Feature: `product.list` · B2C Admin · route `/products`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '상품 | 등록 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminProductListPage() {
  return (
    <AdminShell sectionId="product" trail={['상품', '등록']} activeChildId="product-create">
      {/* 기준일은 서버에서 정한다 — 화면이 스스로 읽으면 서버·브라우저 값이 어긋난다. */}
      <ProductListView today={todayStamp()} />
    </AdminShell>
  );
}
