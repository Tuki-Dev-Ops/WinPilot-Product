import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Markdown } from '@winpilot/docs/ui';
import { listSection, readSectionDoc } from '@winpilot/docs';
import { SectionNav } from '../../_components/SectionNav';

export async function generateMetadata({ params }: { params: Promise<{ screen: string }> }): Promise<Metadata> {
  const { screen } = await params;
  const entry = listSection('page-view').find((item) => item.slug === screen);
  return { title: entry?.title ?? 'Page View' };
}

export function generateStaticParams() {
  return listSection('page-view').map((entry) => ({ screen: entry.slug }));
}

export default async function SectionDocPage({ params }: { params: Promise<{ screen: string }> }) {
  const { screen } = await params;
  const source = readSectionDoc('page-view', screen);
  if (!source) notFound();

  return (
    <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <SectionNav section="page-view" base="/docs/page-view" active={screen} />
      <article className="min-w-0 flex-1">
        <Markdown source={source} />
      </article>
    </div>
  );
}
