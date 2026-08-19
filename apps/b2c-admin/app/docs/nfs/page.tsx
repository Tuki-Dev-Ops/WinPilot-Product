import type { Metadata } from 'next';
import { DocHeader } from '@winpilot/docs/ui';
import { SectionList } from '@winpilot/docs';

/** 비기능 명세서 (NFS) 목차. */
export const metadata: Metadata = { title: '비기능 명세서 (NFS)' };

export default function SectionIndexPage() {
  return (
    <>
      <DocHeader trail={['문서', '명세']} title="비기능 명세서 (NFS)" description="특정 화면에 매이지 않고 전체에 걸리는 정책입니다. 화면마다 되풀이해 적으면 한 곳만 고쳐졌을 때 어느 쪽이 맞는지 알 수 없게 됩니다." />
      <SectionList section="nfs" base="/docs/nfs" />
    </>
  );
}
