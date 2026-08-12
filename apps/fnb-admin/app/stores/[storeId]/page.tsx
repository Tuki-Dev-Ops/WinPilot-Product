import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { STORES, findStore } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { StoreForm } from './_components/StoreForm';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `store.detail` · F&B Admin · route `/stores/{storeId}`
 *
 * 등록 화면이 없다. 매장이 새로 생기는 일은 **계약 · 공사 · 교육이 끝난 뒤**에 벌어지고, 그때
 * 주소와 번호는 이미 정해져 있다. 지금은 코드에서 늘린다 — 목록에 빈 줄을 먼저 만들어 두면
 * 준비중으로도 영업중으로도 아닌 매장이 사이트에 선다.
 */
export const metadata: Metadata = {
  title: adminTitle('등록', '가맹점', '상세'),
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 매장이 아홉 곳이라 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return STORES.map((one) => ({ storeId: one.id }));
}

export default async function FnbStoreDetailPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const store = findStore(storeId);
  if (!store) notFound();

  return (
    <FnbShell
      sectionId="register"
      trail={['등록', '가맹점', '상세']}
      activeChildId="register-store"
      back={{ href: '/stores', label: '가맹점 목록' }}
    >
      <StoreForm store={store} />
    </FnbShell>
  );
}
