import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Markdown } from '@winpilot/docs/ui';
import { readSectionDoc } from '@winpilot/docs';
import { DocHeader } from '../_components/DocHeader';
import { SectionList } from '../_components/SectionList';

/**
 * 기능 명세서 목차 — 어느 화면의 명세가 있고 어디가 비었는지.
 *
 * 목차도 생성물(`00-overview.md`)을 읽는다. 화면 목록을 여기서 따로 그리면 문서와 목차가
 * 갈라져, 명세가 빠진 화면이 목차에서는 있는 것처럼 보인다.
 */
export const metadata: Metadata = { title: '기능 명세서' };

export default function FsdIndexPage() {
  const source = readSectionDoc('fsd', '00-overview');
  if (!source) notFound();

  return (
    <>
      <DocHeader
        trail={['문서', '명세']}
        title="기능 명세서 (FSD)"
        description="화면 하나가 문서 하나다. 목적·구성·데이터 항목·기능·버튼·시나리오·예외·검증·상태·정책·인수 조건을 여덟 절로 펼친다."
      />
      <SectionList section="fsd" base="/docs/fsd" hide={['00-overview']} />
      <article className="min-w-0 border-t border-border pt-6">
        <Markdown source={source} />
      </article>
    </>
  );
}
