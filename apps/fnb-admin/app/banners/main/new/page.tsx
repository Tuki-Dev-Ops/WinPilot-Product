import type { Metadata } from 'next';
import { blankFnbBanner } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { BannerForm } from '@/app/banners/main/[bannerId]/_components/BannerForm';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `banner.main.create` · F&B Admin · route `/banners/main/new`
 *
 * 노출을 꺼 둔 채로 열린다. **등록하다 만 배너가 첫 화면에 바로 서는 것**이 이 종류의 콘솔에서
 * 가장 흔한 사고다.
 *
 * ## 상세 화면과 같은 폼이다
 * 칸도 검사도 같고, 갈리는 것은 셋뿐이다 — 단추에 적히는 말, 확인 창이 묻는 말, 저장 뒤
 * 토스트(`FnbRecordForm` 의 `mode`). 화면을 둘로 나누면 칸이 하나 늘 때 두 곳을 고쳐야 하고,
 * 그러다 **등록에만 없는 칸**이 생긴다.
 *
 * 빈 값은 `blankFnbBanner()` 가 준다. 화면이 객체를 손으로 적으면 새 칸이 늘 때 여기만 빠뜨린다.
 */
export const metadata: Metadata = {
  title: adminTitle('배너', '메인 비주얼', '새 배너'),
  robots: { index: false, follow: false },
};

export default function FnbBannerCreatePage() {
  return (
    <FnbShell
      sectionId="banner"
      trail={['배너', '메인 비주얼', '새 배너']}
      activeChildId="banner-main"
      back={{ href: '/banners/main', label: '메인 비주얼 목록' }}
    >
      <BannerForm banner={blankFnbBanner()} mode="create" />
    </FnbShell>
  );
}
