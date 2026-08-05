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
        description="값의 원본은 @winpilot/tokens 한 곳이고 이 콘솔은 색을 직접 선언하지 않는다. B2C Admin 과 다른 것은 값이 아니라 구분 표시뿐이다 — 로고 칩이 먹색이고 워드마크가 Internal 이며 사이드바에 사내 전용이라는 한 줄이 붙는다."
      />
      <article className="min-w-0">
        <Markdown source={source} />
      </article>
    </>
  );
}
