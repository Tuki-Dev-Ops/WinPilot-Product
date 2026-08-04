import type { Metadata } from 'next';
import { CONTENT, COPY } from '@winpilot/client-content';
import { AuthShell } from '@/app/_components/AuthShell';
import { SiteShell } from '@/app/_components/SiteShell';
import { SocialLoginButtons } from '@/app/_components/SocialLoginButtons';
import { SignupForm } from './_components/SignupForm';

/**
 * Feature: `user.signup` · B2C Client (템플릿 A) · route `/signup`
 *
 * 로그인과 **같은 뼈대**를 쓴다(`AuthShell`) — 탭으로 오가는 두 화면이라 배치가 달라지면
 * 탭을 눌렀는데 다른 서비스로 온 것처럼 보인다.
 *
 * ## 어드민 연동
 * - 어드민의 **사용자 추가**(사용자 목록 안 모달)와 같은 자원이다 — 수집 항목이 어긋나면
 *   고객이 넣은 값과 운영자가 보는 값이 달라진다
 * - 등급은 여기서 고르지 않는다 — 누적 결제금액으로 자동 산정된다 (사용자 > 등급)
 * - 소셜 가입의 키는 **사내 어드민**의 OAuth 설정에서 정한다
 */
export const metadata: Metadata = { title: `${COPY.auth.signupTitle} — ${CONTENT.seo.title}` };

export default function UserSignupPage() {
  return (
    <SiteShell>
      <AuthShell active="signup" title={COPY.auth.signupTitle} description={COPY.auth.signupLead}>
        <SignupForm />
        <SocialLoginButtons label={COPY.auth.socialLabel} />
      </AuthShell>
    </SiteShell>
  );
}
