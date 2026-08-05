import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { CodeListView } from './_components/CodeListView';

/**
 * Feature: `code.list` · Internal Admin · route `/settings/codes`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 플랜 이름·문의 분류처럼 **여러 화면이 함께 쓰는 목록**이다. 화면마다 박아 두면 이름 하나를
 * 고칠 때 여러 곳을 찾아다녀야 하고, 한 곳을 빠뜨리면 같은 값이 두 이름으로 보인다.
 */
export const metadata: Metadata = {
  title: '설정 | 기준 값 — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default function InternalCodeListPage() {
  return (
    <InternalShell sectionId="settings" trail={['설정', '기준 값']} activeChildId="settings-code">
      <CodeListView />
    </InternalShell>
  );
}
