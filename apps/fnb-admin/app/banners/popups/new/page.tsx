import type { Metadata } from 'next';
import { blankFnbPopup } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { PopupForm } from '@/app/banners/popups/[popupId]/_components/PopupForm';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `banner.popup.create` · F&B Admin · route `/banners/popups/new`
 *
 * 하루 감추기를 켠 채로 열린다. 끄는 것은 무거운 결정이라(그쪽 머리말) 일부러 한 번 더 고르게 한다.
 *
 * ## 상세 화면과 같은 폼이다
 * 칸도 검사도 같고, 갈리는 것은 셋뿐이다 — 단추에 적히는 말, 확인 창이 묻는 말, 저장 뒤
 * 토스트(`FnbRecordForm` 의 `mode`). 화면을 둘로 나누면 칸이 하나 늘 때 두 곳을 고쳐야 하고,
 * 그러다 **등록에만 없는 칸**이 생긴다.
 *
 * 빈 값은 `blankFnbPopup()` 가 준다. 화면이 객체를 손으로 적으면 새 칸이 늘 때 여기만 빠뜨린다.
 */
export const metadata: Metadata = {
  title: adminTitle('배너', '팝업', '새 팝업'),
  robots: { index: false, follow: false },
};

export default function FnbPopupCreatePage() {
  return (
    <FnbShell
      sectionId="banner"
      trail={['배너', '팝업', '새 팝업']}
      activeChildId="banner-popup"
      back={{ href: '/banners/popups', label: '팝업 목록' }}
    >
      <PopupForm popup={blankFnbPopup()} mode="create" />
    </FnbShell>
  );
}
