import type { Metadata } from 'next';
import { IrShell } from '@/app/_components/IrShell';
import { LibraryListView } from './_components/LibraryListView';

/**
 * Feature: `library.list` · IR Admin · route `/library`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 */
export const metadata: Metadata = {
  title: '자료 | IR 자료실 — WinPilot IR Admin',
  robots: { index: false, follow: false },
};

export default function IrLibraryListPage() {
  return (
    <IrShell sectionId="ir" trail={['IR', 'IR 자료실']} activeChildId="ir-library">
      <LibraryListView />
    </IrShell>
  );
}
