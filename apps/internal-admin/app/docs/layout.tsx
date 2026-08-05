import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { listSection } from '@winpilot/docs';
import { docsNav } from '@/lib/docs-nav';
import { DocsSidebar } from './_components/DocsSidebar';

/**
 * 문서 껍데기 — `/docs` 아래 모든 화면이 이 뼈대를 쓴다.
 *
 * 사이드바를 layout 에 두는 이유: 문서 사이를 옮길 때 목록이 다시 그려지지 않아야 지금 어디에
 * 있는지 잃지 않는다. 화면마다 목록을 그리면 스크롤 자리도 매번 처음으로 돌아간다.
 *
 * **검색 로봇에게는 감춘다.** 사내 문서라 공개 검색 결과에 뜰 이유가 없고, 뜨면 고객이
 * 상품 대신 명세서를 먼저 보게 된다.
 */
export const metadata: Metadata = {
  title: { default: '문서', template: '%s — WinPilot 문서' },
  robots: { index: false, follow: false, nocache: true },
};

export default function DocsLayout({ children }: { children: ReactNode }) {
  // 사이드바의 장수는 실제 파일 수다 — 손으로 적으면 문서를 더했을 때 숫자만 남는다.
  const counts = {
    fsd: listSection('fsd').length,
    nfs: listSection('nfs').length,
    pageView: listSection('page-view').length,
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex w-full max-w-400 flex-col gap-8 px-5 py-6 lg:flex-row lg:items-start lg:gap-10 lg:px-8 lg:py-10">
        <DocsSidebar groups={docsNav(counts)} />

        <main className="flex min-w-0 flex-1 flex-col gap-6 pb-20">{children}</main>
      </div>
    </div>
  );
}
