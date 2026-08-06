import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/app/_components/AdminShell';
import { ProductForm } from '@/app/products/_components/ProductForm';
import { todayStamp } from '@/lib/data/product-tags';
import { findProduct, PRODUCTS } from '@/lib/data/products';

/**
 * Feature: `product.detail` · B2C Admin · route `/products/{productId}`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '상품 | 등록 | 상세페이지 (수정) — WinPilot Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 시드 상품만 존재하므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ productId: product.id }));
}

export default async function AdminProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const product = findProduct(productId);
  if (!product) notFound();

  const { id, createdAt, salesCount, ...input } = product;

  return (
    <AdminShell sectionId="product" trail={['상품', '등록', '상세페이지 (수정)']} activeChildId="product-create" back={{ href: '/products', label: '상품 목록' }}>
      {/* 기준일은 서버에서 정한다 — 화면이 스스로 읽으면 서버·브라우저 값이 어긋난다. */}
      <ProductForm
        mode="edit"
        productCode={id}
        initial={input}
        today={todayStamp()}
        createdAt={createdAt}
        salesCount={salesCount}
      />
    </AdminShell>
  );
}
