import type { Metadata } from 'next';
import { FnbShell } from '@/app/_components/FnbShell';
import { MarketingListView } from './_components/MarketingListView';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `marketing.list` · F&B Admin · route `/marketing`
 *
 * 사이트의 마케팅 화면(`/marketing`)이 이 목록을 창구별로 나눠 건다.
 */
export const metadata: Metadata = {
  title: adminTitle('등록', '마케팅'),
  robots: { index: false, follow: false },
};

export default function FnbMarketingListPage() {
  return (
    <FnbShell sectionId="register" trail={['등록', '마케팅']} activeChildId="register-marketing">
      <MarketingListView />
    </FnbShell>
  );
}
