import type { Metadata } from 'next';
import { DocHeader } from '@winpilot/docs/ui';
import { SectionList } from '@winpilot/docs';

/** Page View 목차. */
export const metadata: Metadata = { title: 'Page View' };

export default function SectionIndexPage() {
  return (
    <>
      <DocHeader trail={['문서', '명세']} title="Page View" description="화면마다 세 가지 너비로 찍은 캡처입니다. 정상 화면과 예외 화면을 같은 방식으로 담았습니다. 성공 화면만 모아 두면 빈 목록이나 404, 실패처럼 자주 마주치는 상태가 어디에도 남지 않기 때문입니다." />
      <SectionList section="page-view" base="/docs/page-view" />
    </>
  );
}
