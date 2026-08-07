import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { ProductSettingsView } from './_components/ProductSettingsView';

/**
 * Feature: `product.settings` · IR Admin · route `/products/settings`
 *
 * 사이트의 PRODUCT 메뉴에 무엇이 어떤 차례로 서는지를 정한다.
 */
export const metadata: Metadata = {
  title: '제품 | 설정 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function ProductSettingsPage() {
  return (
    <IrShell sectionId="product" trail={['제품', '설정']} activeChildId="product-settings">
      <ProductSettingsView />
    </IrShell>
  );
}
