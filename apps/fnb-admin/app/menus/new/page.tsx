import type { Metadata } from 'next';
import { blankMenuItem } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { MenuForm } from '@/app/menus/[menuId]/_components/MenuForm';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `menu.create` · F&B Admin · route `/menus/new`
 *
 * 새 메뉴는 사진 · 원가 · 매장 교육이 함께 도는 일이라, 여기서 한 줄 더한다고 팔리지는 않는다.
 * 그래도 **먼저 적어 두는 자리**는 있어야 한다 — 값과 알레르기를 정하는 것이 그 일의 시작이고,
 * 공개를 꺼 둔 채로 등록해 두면 준비가 끝나는 날 켜기만 하면 된다.
 *
 * ## 상세 화면과 같은 폼이다
 * 칸도 검사도 같고, 갈리는 것은 셋뿐이다 — 단추에 적히는 말, 확인 창이 묻는 말, 저장 뒤
 * 토스트(`FnbRecordForm` 의 `mode`). 화면을 둘로 나누면 칸이 하나 늘 때 두 곳을 고쳐야 하고,
 * 그러다 **등록에만 없는 칸**이 생긴다.
 *
 * 빈 값은 `blankMenuItem()` 가 준다. 화면이 객체를 손으로 적으면 새 칸이 늘 때 여기만 빠뜨린다.
 */
export const metadata: Metadata = {
  title: adminTitle('등록', '메뉴', '새 메뉴'),
  robots: { index: false, follow: false },
};

export default function FnbMenuCreatePage() {
  return (
    <FnbShell
      sectionId="register"
      trail={['등록', '메뉴', '새 메뉴']}
      activeChildId="register-menu"
      back={{ href: '/menus', label: '메뉴 목록' }}
    >
      <MenuForm item={blankMenuItem()} mode="create" />
    </FnbShell>
  );
}
