import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Markdown } from '@winpilot/docs/ui';
import { listSection, readSectionDoc } from '@winpilot/docs';
import { SectionNav } from '../../_components/SectionNav';

/** 화면 하나의 기능 명세. 왼쪽에 같은 갈래의 다른 화면을 세워 옆 화면으로 바로 넘어가게 한다. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ screen: string }>;
}): Promise<Metadata> {
  const { screen } = await params;
  const entry = listSection('fsd').find((item) => item.slug === screen);
  return { title: entry?.title ?? '기능 명세' };
}

export function generateStaticParams() {
  return listSection('fsd')
    .filter((entry) => entry.slug !== '00-overview')
    .map((entry) => ({ screen: entry.slug }));
}

export default async function FsdScreenPage({ params }: { params: Promise<{ screen: string }> }) {
  const { screen } = await params;
  const source = readSectionDoc('fsd', screen);
  if (!source) notFound();

  return (
    <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <SectionNav section="fsd" base="/docs/fsd" active={screen} hide={['00-overview']} />
      <article className="min-w-0 flex-1">
        <Markdown source={source} />
      </article>
    </div>
  );
}
