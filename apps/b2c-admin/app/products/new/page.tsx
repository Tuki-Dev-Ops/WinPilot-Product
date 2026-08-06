import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { ProductForm } from '@/app/products/_components/ProductForm';
import { todayStamp } from '@/lib/data/product-tags';
import { nextProductCode } from '@/lib/data/products';

/**
 * Feature: `product.create` · B2C Admin · route `/products/new`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '상품 | 등록 | 상세페이지 (등록) — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminProductCreatePage() {
  return (
    <AdminShell sectionId="product" trail={['상품', '등록', '상세페이지 (등록)']} activeChildId="product-create" back={{ href: '/products', label: '상품 목록' }}>
      {/* 기준일은 서버에서 정한다 — 화면이 스스로 읽으면 서버·브라우저 값이 어긋난다. */}
      <ProductForm mode="create" productCode={nextProductCode()} today={todayStamp()} />
    </AdminShell>
  );
}
