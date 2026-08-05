import type { Metadata } from 'next';
import { InternalShell } from '@/app/_components/InternalShell';
import { PipelineBoardView } from './_components/PipelineBoardView';

/**
 * Feature: `pipeline.list` · Internal Admin · route `/tenants/pipeline`
 * 이름은 `@winpilot/spec` 의 features.ts 가 강제한다 (pnpm spec:check).
 *
 * 고객 목록은 **지금 상태**만 보여 준다. 어떻게 여기까지 왔는지가 없으면 계약이 끊길 때가
 * 되어서야 알게 되므로, 아직 고객사가 아닌 곳까지 한 줄에 세운다.
 *
 * `운영` 칸의 건이 곧 `/tenants` 의 목록이다 — 같은 자료를 표와 단계별 칸으로 다르게 본다.
 */
export const metadata: Metadata = {
  title: '고객사 | 파이프라인 — WinPilot Internal',
  robots: { index: false, follow: false },
};

export default function InternalPipelineListPage() {
  return (
    <InternalShell sectionId="tenant" trail={['고객사', '파이프라인']} activeChildId="tenant-pipeline">
      <PipelineBoardView />
    </InternalShell>
  );
}
