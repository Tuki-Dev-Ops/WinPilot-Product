import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SOLUTIONS, findSolution } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { SolutionForm } from '@/app/products/_components/SolutionForm';

/**
 * Feature: `product.detail` · IR Admin · route `/products/{productId}`
 *
 * 등록 화면이 없다. 제품 넷은 **각자 상세 화면이 코드로 짜여 있어**, 목록에 한 줄 더한다고
 * 사이트에 화면이 생기지 않는다 — 메뉴에는 있는데 눌러도 404 인 제품이 만들어진다.
 */
export const metadata: Metadata = {
  title: '제품 | 상세 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 제품 넷만 있으므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return SOLUTIONS.map((one) => ({ productId: one.id }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const solution = findSolution(productId);
  if (!solution) notFound();

  return (
    <IrShell
      sectionId="product"
      trail={['제품', '상세']}
      activeChildId="product-list"
      back={{ href: '/products', label: '제품 목록' }}
    >
      <SolutionForm solution={solution} listHref="/products" resource="제품" />
    </IrShell>
  );
}
