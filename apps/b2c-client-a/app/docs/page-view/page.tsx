import type { Metadata } from 'next';
import { DocHeader } from '../_components/DocHeader';
import { SectionList } from '../_components/SectionList';

/** Page View 목차. */
export const metadata: Metadata = { title: 'Page View' };

export default function SectionIndexPage() {
  return (
    <>
      <DocHeader trail={['문서', '명세']} title="Page View" description="화면마다 세 너비의 캡처. 정상 화면과 예외 화면을 같은 방식으로 찍는다 — 성공 화면만 모아 두면 빈 목록·404·실패처럼 자주 보이는 상태가 아무 데도 남지 않는다." />
      <SectionList section="page-view" base="/docs/page-view" />
    </>
  );
}
