import type { Metadata } from 'next';
import { blankMarketingPost } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { MarketingForm } from '@/app/marketing/[postId]/_components/MarketingForm';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `marketing.create` · F&B Admin · route `/marketing/new`
 *
 * 실제 창구에 먼저 올린 다음 여기 옮겨 적는 순서다. 그래서 올린 날을 손으로 받는다 — 저장한
 * 시각을 박으면 사이트의 차례가 실제와 어긋난다.
 *
 * ## 상세 화면과 같은 폼이다
 * 칸도 검사도 같고, 갈리는 것은 셋뿐이다 — 단추에 적히는 말, 확인 창이 묻는 말, 저장 뒤
 * 토스트(`FnbRecordForm` 의 `mode`). 화면을 둘로 나누면 칸이 하나 늘 때 두 곳을 고쳐야 하고,
 * 그러다 **등록에만 없는 칸**이 생긴다.
 *
 * 빈 값은 `blankMarketingPost()` 가 준다. 화면이 객체를 손으로 적으면 새 칸이 늘 때 여기만 빠뜨린다.
 */
export const metadata: Metadata = {
  title: adminTitle('등록', '마케팅', '새 글'),
  robots: { index: false, follow: false },
};

export default function FnbMarketingCreatePage() {
  return (
    <FnbShell
      sectionId="register"
      trail={['등록', '마케팅', '새 글']}
      activeChildId="register-marketing"
      back={{ href: '/marketing', label: '마케팅 목록' }}
    >
      <MarketingForm post={blankMarketingPost()} mode="create" />
    </FnbShell>
  );
}
