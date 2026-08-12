import type { Metadata } from 'next';
import { FnbShell } from '@/app/_components/FnbShell';
import { StoreListView } from './_components/StoreListView';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `store.list` · F&B Admin · route `/stores`
 *
 * 사이트의 매장 찾기(`/stores`)가 이 값을 읽는다.
 */
export const metadata: Metadata = {
  title: adminTitle('등록', '가맹점'),
  robots: { index: false, follow: false },
};

export default function FnbStoreListPage() {
  return (
    <FnbShell sectionId="register" trail={['등록', '가맹점']} activeChildId="register-store">
      <StoreListView />
    </FnbShell>
  );
}
