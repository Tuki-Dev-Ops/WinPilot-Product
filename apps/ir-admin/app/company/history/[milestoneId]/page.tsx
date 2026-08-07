import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MILESTONES } from '@winpilot/store';
import { IrShell } from '@/app/_components/IrShell';
import { MilestoneForm } from '@/app/company/history/_components/MilestoneForm';

/**
 * Feature: `milestone.detail` · IR Admin · route `/company/history/{milestoneId}`
 */
export const metadata: Metadata = {
  title: '회사 | 연혁 | 수정 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 씨앗 값만 있으므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return MILESTONES.map((one) => ({ milestoneId: one.id }));
}

export default async function MilestoneDetailPage({
  params,
}: {
  params: Promise<{ milestoneId: string }>;
}) {
  const { milestoneId } = await params;
  const milestone = MILESTONES.find((one) => one.id === milestoneId);
  if (!milestone) notFound();

  return (
    <IrShell
      sectionId="company"
      trail={['회사', '연혁', '수정']}
      activeChildId="company-history"
      back={{ href: '/company/history', label: '연혁 목록' }}
    >
      <MilestoneForm mode="edit" code={milestone.id} initial={milestone} />
    </IrShell>
  );
}
