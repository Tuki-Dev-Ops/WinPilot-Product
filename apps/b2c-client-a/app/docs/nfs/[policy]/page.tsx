import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Markdown } from '@winpilot/docs/ui';
import { listSection, readSectionDoc } from '@winpilot/docs';
import { SectionNav } from '../../_components/SectionNav';

export async function generateMetadata({ params }: { params: Promise<{ policy: string }> }): Promise<Metadata> {
  const { policy } = await params;
  const entry = listSection('nfs').find((item) => item.slug === policy);
  return { title: entry?.title ?? '비기능 명세서 (NFS)' };
}

export function generateStaticParams() {
  return listSection('nfs').map((entry) => ({ policy: entry.slug }));
}

export default async function SectionDocPage({ params }: { params: Promise<{ policy: string }> }) {
  const { policy } = await params;
  const source = readSectionDoc('nfs', policy);
  if (!source) notFound();

  return (
    <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <SectionNav section="nfs" base="/docs/nfs" active={policy} />
      <article className="min-w-0 flex-1">
        <Markdown source={source} />
      </article>
    </div>
  );
}
