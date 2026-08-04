import type { Metadata } from 'next';
import { CONTENT, COPY, myInquiries } from '@winpilot/client-content';
import { SiteShell } from '@/app/_components/SiteShell';
import { MyPageHeading, MyPageShell } from '@/app/_components/MyPageShell';
import { InquiryListView } from './_components/InquiryListView';

/**
 * Feature: `inquiry.list` · B2C Client (템플릿 A) · route `/mypage/inquiries`
 *
 * ## 어드민 연동
 * - 어드민 문의 > 목록(`/inquiries`)과 **같은 기록**이다 — 운영자가 단 답변이 여기 그대로 나타난다
 * - 어드민은 모든 사람의 문의를, 여기서는 내 이메일로 들어온 것만 본다
 */
export const metadata: Metadata = { title: `${COPY.mypage.inquiries} — ${CONTENT.seo.title}` };

export default function InquiryListPage() {
  const inquiries = myInquiries();

  return (
    <SiteShell>
      <MyPageShell>
        <MyPageHeading title={COPY.mypage.inquiries} meta={`총 ${inquiries.length}건`} />
        <InquiryListView inquiries={inquiries} />
      </MyPageShell>
    </SiteShell>
  );
}
