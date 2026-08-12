import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MARKETING_POSTS, findMarketingPost } from '@winpilot/store';
import { FnbShell } from '@/app/_components/FnbShell';
import { MarketingForm } from './_components/MarketingForm';
import { adminTitle } from '@/lib/metadata';

/**
 * Feature: `marketing.detail` · F&B Admin · route `/marketing/{postId}`
 *
 * 등록 화면이 따로 없다. 새 글은 목록에서 만드는 것이 아니라 **실제 창구에 먼저 올린 다음**
 * 여기 옮겨 적는 순서라, 빈 폼을 여는 것과 이미 있는 줄을 고치는 것이 같은 화면이어도 된다.
 * 새로 만드는 흐름이 필요해지면 `/marketing/new` 가 이 폼을 빈 값으로 연다.
 */
export const metadata: Metadata = {
  title: adminTitle('등록', '마케팅', '상세'),
  robots: { index: false, follow: false },
};

/** 프론트엔드 전용 — 글이 여섯이라 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return MARKETING_POSTS.map((one) => ({ postId: one.id }));
}

export default async function FnbMarketingDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const post = findMarketingPost(postId);
  if (!post) notFound();

  return (
    <FnbShell
      sectionId="register"
      trail={['등록', '마케팅', '상세']}
      activeChildId="register-marketing"
      back={{ href: '/marketing', label: '마케팅 목록' }}
    >
      <MarketingForm post={post} />
    </FnbShell>
  );
}
