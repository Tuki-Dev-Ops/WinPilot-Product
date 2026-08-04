import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { readDoc } from '@winpilot/docs';
import { Markdown } from '@winpilot/docs/ui';
import { DocHeader } from '../_components/DocHeader';

/** Design System — 원본은 `docs/design.md`. */
export const metadata: Metadata = { title: 'Design System' };

export default function DocPage() {
  const source = readDoc('design');
  if (!source) notFound();

  return (
    <>
      <DocHeader trail={['문서']} title="Design System" description="색·글자 크기·간격·모서리와 기본 요소. 값의 원본은 @winpilot/tokens 한 곳이고, 앱이 색을 직접 선언하면 그 순간 디자인 시스템이 두 벌이 된다." />
      <article className="min-w-0">
        <Markdown source={source} />
      </article>
    </>
  );
}
