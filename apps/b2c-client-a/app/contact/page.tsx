import type { Metadata } from 'next';
import { CONTENT, COPY } from '@winpilot/client-content';
import { SiteShell } from '@/app/_components/SiteShell';
import { InquiryForm } from './_components/InquiryForm';

/**
 * Feature: `inquiry.settings` · B2C Client (템플릿 A) · route `/contact`
 *
 * 폼 하나뿐인 화면이라 **가운데로 모은다.** 왼쪽에 붙여 두면 넓은 화면에서 입력란이 화면
 * 한쪽에 몰리고, 눈이 제목에서 입력란으로 갈 때마다 가로로 크게 움직이게 된다.
 *
 * ## 어드민 연동
 * - 문의 유형 · 입력 항목 · 필수 여부 · 안내 문구 · 첨부 규격 ← `b2c-admin` 문의 > 설정 (`/inquiries/settings`)
 * - 여기서 보낸 문의는 어드민 문의 > 목록(`/inquiries`)에 **Path `/contact`** 로 쌓인다
 */
export const metadata: Metadata = { title: `${COPY.inquiry.title} — ${CONTENT.seo.title}` };

export default function InquirySettingsPage() {
  return (
    <SiteShell>
      <div className="mx-auto flex w-full max-w-160 flex-col gap-8">
        <header className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">{COPY.inquiry.title}</h1>
          <p className="text-sm leading-relaxed text-ink-muted">{CONTENT.inquiryForm.guideText}</p>
        </header>

        <InquiryForm />
      </div>
    </SiteShell>
  );
}
