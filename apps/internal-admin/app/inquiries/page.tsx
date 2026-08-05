import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { InquiryListView } from './_components/InquiryListView';

/**
 * Feature: `tenant.inquiry.list` · Internal Admin · route `/inquiries`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 고객사가 **우리에게** 보낸 문의다. B2C Admin 의 문의는 고객이 고객사에게 보낸 것이라
 * 받는 쪽도 답하는 쪽도 다르다 — 그래서 자원을 나눴다.
 */
export const metadata: Metadata = {
  title: '문의 — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default function InternalInquiryListPage() {
  return (
    <InternalShell sectionId="inquiry" trail={['문의']}>
      <InquiryListView />
    </InternalShell>
  );
}
