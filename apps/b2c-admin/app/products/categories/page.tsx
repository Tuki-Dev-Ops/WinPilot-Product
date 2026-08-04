import type { Metadata } from 'next';
import { AdminShell } from '@/app/_components/AdminShell';
import { CategoryListView } from './_components/CategoryListView';

/**
 * Feature: `category.list` · B2C Admin · route `/products/categories`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '상품 | 카테고리 — WinPilot Admin',
  robots: { index: false, follow: false },
};

export default function AdminCategoryListPage() {
  return (
    <AdminShell sectionId="product" trail={['상품', '카테고리']} activeChildId="product-category">
      <CategoryListView />
    </AdminShell>
  );
}
