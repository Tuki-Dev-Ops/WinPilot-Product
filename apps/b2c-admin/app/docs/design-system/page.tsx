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
      <DocHeader
        trail={['문서', '시스템']}
        title="Design System"
        description="값의 원본은 @winpilot/tokens 한 곳이고 어드민은 색을 직접 선언하지 않는다. 고객 화면과 다른 것은 값이 아니라 운용이다 — 표와 폼이 화면을 가득 채우는 곳이라 여백·글자 크기·컨트롤 높이를 다르게 쓴다."
      />
      <article className="min-w-0">
        <Markdown source={source} />
      </article>
    </>
  );
}
