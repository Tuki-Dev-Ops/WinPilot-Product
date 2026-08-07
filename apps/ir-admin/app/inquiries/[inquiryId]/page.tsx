import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE_INQUIRIES, findSiteInquiry } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { InquiryDetailView } from '@/app/inquiries/_components/InquiryDetailView';

/**
 * Feature: `inquiry.detail` · IR Admin · route `/inquiries/{inquiryId}`
 *
 * 등록 화면이 없다. 문의는 **밖에서 들어오는 것**이라 콘솔에서 만들 일이 없다 — 만들 수 있게
 * 두면 우리가 적은 것과 고객이 보낸 것이 한 목록에 섞인다.
 */
export const metadata: Metadata = {
  title: '문의 | 상세 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 씨앗 값만 있으므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return SITE_INQUIRIES.map((one) => ({ inquiryId: one.id }));
}

export default async function InquiryDetailPage({ params }: { params: Promise<{ inquiryId: string }> }) {
  const { inquiryId } = await params;
  const inquiry = findSiteInquiry(inquiryId);
  if (!inquiry) notFound();

  return (
    <IrShell
      sectionId="inquiry"
      trail={['문의', '상세']}
      activeChildId="inquiry-list"
      back={{ href: '/inquiries', label: '문의 목록' }}
    >
      <InquiryDetailView inquiry={inquiry} />
    </IrShell>
  );
}
