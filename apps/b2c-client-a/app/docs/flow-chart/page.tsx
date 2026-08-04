import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { readDoc } from '@winpilot/docs';
import { Markdown } from '@winpilot/docs/ui';
import { DocHeader } from '../_components/DocHeader';

/** Flow Chart — 원본은 `docs/flow.md`. */
export const metadata: Metadata = { title: 'Flow Chart' };

export default function DocPage() {
  const source = readDoc('flow');
  if (!source) notFound();

  return (
    <>
      <DocHeader trail={['문서']} title="Flow Chart" description="전체 여정과 화면별 흐름. 실선은 정상, 점선은 예외, 마름모는 갈림길이다." />
      <article className="min-w-0">
        <Markdown source={source} />
      </article>
    </>
  );
}
