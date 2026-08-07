import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { CompanyAboutView } from './_components/CompanyAboutView';

/**
 * Feature: `company.about` · IR Admin · route `/company/about`
 *
 * 사이트 첫 화면의 소개 문단과 회사 소개 화면이 이 값을 읽는다.
 */
export const metadata: Metadata = {
  title: '회사 | 소개 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function CompanyAboutPage() {
  return (
    <IrShell sectionId="company" trail={['회사', '소개']} activeChildId="company-about">
      <CompanyAboutView />
    </IrShell>
  );
}
