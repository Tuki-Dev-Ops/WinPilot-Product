import type { Metadata } from 'next';
import { blankFnbAdmin } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { AdminForm } from '@/app/settings/admins/[adminId]/_components/AdminForm';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `settings.admin.create` · F&B Admin · route `/settings/admins/new`
 *
 * 가장 좁은 권한(`조회`)으로 열린다. 넓히는 것은 한 번 더 고르는 일이어야 한다 — 새 계정이
 * 처음부터 전부를 할 수 있으면, 급할 때 만든 계정이 그대로 남는다.
 *
 * ## 상세 화면과 같은 폼이다
 * 칸도 검사도 같고, 갈리는 것은 셋뿐이다 — 단추에 적히는 말, 확인 창이 묻는 말, 저장 뒤
 * 토스트(`FnbRecordForm` 의 `mode`). 화면을 둘로 나누면 칸이 하나 늘 때 두 곳을 고쳐야 하고,
 * 그러다 **등록에만 없는 칸**이 생긴다.
 *
 * 빈 값은 `blankFnbAdmin()` 가 준다. 화면이 객체를 손으로 적으면 새 칸이 늘 때 여기만 빠뜨린다.
 */
export const metadata: Metadata = {
  title: adminTitle('설정', '관리자', '새 계정'),
  robots: { index: false, follow: false },
};

export default function FnbStaffCreatePage() {
  return (
    <FnbShell
      sectionId="settings"
      trail={['설정', '관리자', '새 계정']}
      activeChildId="settings-admin"
      back={{ href: '/settings/admins', label: '관리자 목록' }}
    >
      <AdminForm admin={blankFnbAdmin()} mode="create" />
    </FnbShell>
  );
}
