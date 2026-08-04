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
      <DocHeader
        trail={['문서', '시스템']}
        title="Components"
        description="다시 쓰는 조각 — 이름과 층, 어느 화면에 쓰이는지. 쓰이는 화면은 import 를 되짚어 적었고, 쓰이는 곳이 없으면 없다고 적었다."
      />
      <article className="min-w-0">
        <Markdown source={source} />
      </article>
    </>
  );
}
