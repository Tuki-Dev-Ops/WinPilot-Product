import type { Metadata } from 'next';
import { FnbShell } from '@/app/_components/FnbShell';
import { MenuListView } from './_components/MenuListView';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `menu.list` · F&B Admin · route `/menus`
 *
 * 사이트의 메뉴판(`/menu`)이 이 값을 읽는다.
 *
 * ## 주소가 `/menus` 인 이유
 * 사이트는 `/menu`(단수)다. 어드민에서 단수로 두면 **한 메뉴를 여는 주소**(`/menus/{id}`)와
 * 목록이 같은 말로 시작해 눈으로 갈리지 않는다. 이 콘솔의 다른 목록도 전부 복수다.
 */
export const metadata: Metadata = {
  title: adminTitle('등록', '메뉴'),
  robots: { index: false, follow: false },
};

export default function FnbMenuListPage() {
  return (
    <FnbShell sectionId="register" trail={['등록', '메뉴']} activeChildId="register-menu">
      <MenuListView />
    </FnbShell>
  );
}
