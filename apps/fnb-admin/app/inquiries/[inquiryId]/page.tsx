import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FRANCHISE_INQUIRIES, findFranchiseInquiry } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { InquiryDetailView } from './_components/InquiryDetailView';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `inquiry.detail` · F&B Admin · route `/inquiries/{inquiryId}`
 *
 * 등록 화면이 없다. 이 자원은 **밖에서만 생긴다** — 사이트의 창업 상담 신청이 유일한 입구다.
 * 어드민에서 만들 수 있게 두면 전화로 받은 것을 여기에 적게 되고, 그러면 신청자가 직접 남긴
 * 것과 우리가 옮겨 적은 것이 한 목록에 섞인다.
 */
export const metadata: Metadata = {
  title: adminTitle('창업', '문의 내역', '상세'),
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 문의가 몇 건 안 되므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return FRANCHISE_INQUIRIES.map((one) => ({ inquiryId: one.id }));
}

export default async function FnbInquiryDetailPage({ params }: { params: Promise<{ inquiryId: string }> }) {
  const { inquiryId } = await params;
  const inquiry = findFranchiseInquiry(inquiryId);
  if (!inquiry) notFound();

  return (
    <FnbShell
      sectionId="franchise"
      trail={['창업', '문의 내역', '상세']}
      activeChildId="franchise-inquiry"
      back={{ href: '/inquiries', label: '문의 내역' }}
    >
      <InquiryDetailView inquiry={inquiry} />
    </FnbShell>
  );
}
