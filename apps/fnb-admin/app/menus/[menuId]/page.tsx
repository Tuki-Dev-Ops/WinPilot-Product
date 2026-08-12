import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MENU_ITEMS, findMenuItem } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { MenuForm } from './_components/MenuForm';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `menu.detail` · F&B Admin · route `/menus/{menuId}`
 *
 * 등록 화면이 없다. 메뉴를 새로 내는 일은 **사진 · 원가 · 매장 교육이 함께 도는 일**이라 목록에
 * 한 줄 더한다고 팔리지 않는다. 지금은 코드에서 늘리고, 어드민은 이미 파는 것을 고치는 자리다.
 */
export const metadata: Metadata = {
  title: adminTitle('등록', '메뉴', '상세'),
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 메뉴가 열몇 가지라 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return MENU_ITEMS.map((one) => ({ menuId: one.id }));
}

export default async function FnbMenuDetailPage({ params }: { params: Promise<{ menuId: string }> }) {
  const { menuId } = await params;
  const item = findMenuItem(menuId);
  if (!item) notFound();

  return (
    <FnbShell
      sectionId="register"
      trail={['등록', '메뉴', '상세']}
      activeChildId="register-menu"
      back={{ href: '/menus', label: '메뉴 목록' }}
    >
      <MenuForm item={item} />
    </FnbShell>
  );
}
