import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { SeoSettingsView } from './_components/SeoSettingsView';

/**
 * Feature: `settings.seo` · IR Admin · route `/settings/seo`
 *
 * 검색 결과와 링크를 붙였을 때 뜨는 카드에 적히는 값이다.
 */
export const metadata: Metadata = {
  title: '설정 | SEO 정보 — Spaceplanning IR Admin',
  robots: { index: false, follow: false },
};

export default function SeoSettingsPage() {
  return (
    <IrShell sectionId="settings" trail={['설정', 'SEO 정보']} activeChildId="settings-seo">
      <SeoSettingsView />
    </IrShell>
  );
}
