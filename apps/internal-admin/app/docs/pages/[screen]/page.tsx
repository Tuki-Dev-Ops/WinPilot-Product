import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocHeader } from '@winpilot/docs/ui';
import { ScreenShotView } from '@winpilot/docs';
import { pages } from '@/pages.manifest';

/**
 * 화면 하나의 사진 — 자르지 않고 통째로.
 *
 * 목록에서는 위쪽만 보인다. 여기로 들어오는 이유가 **잘린 아래를 보려는 것**이라 여기서는
 * 원래 크기 그대로 세운다.
 */
export function generateStaticParams() {
  return pages.map((one) => ({ screen: one.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ screen: string }>;
}): Promise<Metadata> {
  const { screen } = await params;
  const found = pages.find((one) => one.id === screen);
  return { title: found ? `${found.name} — Screens` : 'Screens' };
}

export default async function ScreenShotPage({ params }: { params: Promise<{ screen: string }> }) {
  const { screen } = await params;
  const found = pages.find((one) => one.id === screen);
  if (!found) notFound();

  return (
    <>
      <DocHeader trail={['문서', '명세', 'Screens']} title={found.name} description={found.route} />
      <ScreenShotView id={found.id} route={found.route} />
    </>
  );
}
