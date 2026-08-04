import type { Metadata } from 'next';
import { ACCOUNT, CONTENT, COPY, formatMoney } from '@winpilot/client-content';
import { SiteShell } from '@/app/_components/SiteShell';
import { MyPageHeading, MyPageShell } from '@/app/_components/MyPageShell';
import { ProfileForm } from './_components/ProfileForm';

/**
 * Feature: `user.settings` · B2C Client (템플릿 A) · route `/mypage`
 *
 * 마이페이지의 첫 화면은 **내 정보 수정**이다. 요약만 보여주는 화면을 앞에 두면 한 번 더
 * 눌러야 무엇이든 할 수 있고, 그 요약은 결국 옆 갈래들이 이미 가진 숫자를 되풀이한다.
 *
 * ## 어드민 연동
 * - 이름·연락처·주소 ← `b2c-admin` 사용자 > 사용자 목록의 상세 (운영자는 남의 것을 고친다)
 * - 등급·적립금 ← 사용자 > 등급 (`/users/grades`) 에서 정한 기준으로 매겨진 값
 */
export const metadata: Metadata = { title: `${COPY.mypage.profile} — ${CONTENT.seo.title}` };

export default function UserSettingsPage() {
  return (
    <SiteShell>
      <MyPageShell>
        <MyPageHeading
          title={`${ACCOUNT.name}${COPY.mypage.greeting}`}
          meta={ACCOUNT.email}
          avatar
          badges={[
            `${COPY.mypage.grade} ${ACCOUNT.grade}`,
            `${COPY.mypage.reward} ${formatMoney(ACCOUNT.reward)}${COPY.product.priceUnit}`,
          ]}
        />
        <ProfileForm />
      </MyPageShell>
    </SiteShell>
  );
}
