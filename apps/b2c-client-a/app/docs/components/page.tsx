import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { readDoc } from '@winpilot/docs';
import { Markdown } from '@winpilot/docs/ui';
import { DocHeader } from '../_components/DocHeader';

/** Components — 원본은 `docs/component.md`. */
export const metadata: Metadata = { title: 'Components' };

export default function DocPage() {
  const source = readDoc('component');
  if (!source) notFound();

  return (
    <>
      <DocHeader trail={['문서']} title="Components" description="다시 쓰는 컴포넌트 — 이름과 층, 어느 화면에 쓰이는지." />
      <article className="min-w-0">
        <Markdown source={source} />
      </article>
    </>
  );
}
