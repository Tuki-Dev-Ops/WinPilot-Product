import type { Metadata } from 'next';
import { blankStore } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { StoreForm } from '@/app/stores/[storeId]/_components/StoreForm';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `store.create` · F&B Admin · route `/stores/new`
 *
 * 새 가맹점은 `준비중` 으로 열린다 — 등록하는 시점이 대개 공사 중이다. 사이트 매장 찾기에는
 * 준비중도 서지만 번호가 비어 있어, 없는 번호로 전화가 가는 일이 없다.
 *
 * ## 상세 화면과 같은 폼이다
 * 칸도 검사도 같고, 갈리는 것은 셋뿐이다 — 단추에 적히는 말, 확인 창이 묻는 말, 저장 뒤
 * 토스트(`FnbRecordForm` 의 `mode`). 화면을 둘로 나누면 칸이 하나 늘 때 두 곳을 고쳐야 하고,
 * 그러다 **등록에만 없는 칸**이 생긴다.
 *
 * 빈 값은 `blankStore()` 가 준다. 화면이 객체를 손으로 적으면 새 칸이 늘 때 여기만 빠뜨린다.
 */
export const metadata: Metadata = {
  title: adminTitle('등록', '가맹점', '새 가맹점'),
  robots: { index: false, follow: false },
};

export default function FnbStoreCreatePage() {
  return (
    <FnbShell
      sectionId="register"
      trail={['등록', '가맹점', '새 가맹점']}
      activeChildId="register-store"
      back={{ href: '/stores', label: '가맹점 목록' }}
    >
      <StoreForm store={blankStore()} mode="create" />
    </FnbShell>
  );
}
