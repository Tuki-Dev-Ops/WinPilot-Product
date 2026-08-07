import type { Metadata } from 'next';
import { listSection } from '@winpilot/docs';
import { DocHeader } from './_components/DocHeader';
import { INTERNAL_MENU } from '@/lib/navigation/internal-menu';
import { pages } from '@/pages.manifest';

/**
 * 문서 개요 — 이 콘솔이 무엇을 다루는지와 화면 목록.
 *
 * 화면 목록은 `pages.manifest.ts` 에서 읽는다. 여기에 손으로 적으면 화면을 늘렸을 때
 * 목록만 옛것이 된다.
 *
 * ## 고객사 배포 연동
 * - **없다.** 저장소의 문서를 그대로 보여 주는 개발 도구다.
 */
export const metadata: Metadata = { title: 'Overview' };

const CARDS = [
  { href: '/docs/ia', label: 'IA', text: '사이드바가 곧 구조다. 전체 도면과 화면별로 드나드는 길.' },
  {
    href: '/docs/flow-chart',
    label: 'Flow Chart',
    text: '사내 담당자의 여정과 화면별 흐름. 실선은 정상, 점선은 예외, 마름모는 갈림길.',
  },
  {
    href: '/docs/fsd',
    label: '기능 명세서 (FSD)',
    text: '화면 하나가 문서 하나. 목적·구성·데이터 항목·기능·버튼·시나리오·예외·검증·상태·정책·인수 조건.',
  },
  {
    href: '/docs/nfs',
    label: '비기능 명세서 (NFS)',
    text: '화면을 가리지 않고 걸리는 정책. 접근성·반응형·검증·오류 문구·정렬·페이징 등.',
  },
  { href: '/docs/page-view', label: 'Page View', text: '화면마다 세 너비의 캡처.' },
  {
    href: '/docs/components',
    label: 'Components',
    text: '다시 쓰는 조각 — 이름·층·어느 화면에 쓰이는지. 쓰이는 곳이 없으면 없다고 적었다.',
  },
  {
    href: '/docs/design-system',
    label: 'Design System',
    text: '값의 원본은 @winpilot/tokens 한 곳이다. 표·폼 화면의 여백과 크기, 상태 뱃지 규칙.',
  },
  { href: '/docs/prompt', label: '생성 프롬프트', text: '이 문서 묶음을 다시 만들 때 쓰는 프롬프트.' },
];

export default function InternalDocsOverviewPage() {
  const counts = {
    fsd: listSection('fsd').length,
    nfs: listSection('nfs').length,
    pageView: listSection('page-view').length,
  };

  return (
    <>
      <DocHeader
        title="WinPilot Internal — 문서"
        description="이 콘솔은 고객사의 배포가 읽는 값의 원본이다. 이 문서는 앱 안의 진짜 라우트라 화면과 같은 레포에서 같이 바뀐다 — 문서를 고치지 않고 화면만 고치면 주소를 열었을 때 바로 드러난다."
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {CARDS.map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="flex flex-col gap-1.5 rounded-xl border border-border px-5 py-4 hover:border-border-strong"
          >
            <span className="text-sm font-medium">{card.label}</span>
            <span className="text-xs leading-relaxed text-ink-muted">{card.text}</span>
          </a>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold tracking-tight">숫자</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: '화면', value: `${pages.length}개` },
            { label: '사이드바 섹션', value: `${INTERNAL_MENU.length}개` },
            { label: '기능 명세', value: `${counts.fsd}장` },
            { label: '비기능 정책', value: `${counts.nfs}장` },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border px-5 py-4">
              <p className="text-xs uppercase tracking-widest text-ink-faint">{stat.label}</p>
              <p className="mt-1.5 text-lg font-semibold tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold tracking-tight">화면</h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-12 gap-4 border-b border-border bg-surface px-5 py-2.5 text-xs text-ink-faint">
            <span className="col-span-1">순번</span>
            <span className="col-span-4">이름</span>
            <span className="col-span-5">경로</span>
            <span className="col-span-2">문서</span>
          </div>
          {pages.map((page) => (
            <div
              key={page.id}
              className="group grid grid-cols-12 gap-4 border-b border-border px-5 py-3 text-sm last:border-b-0 hover:bg-surface"
            >
              <span className="col-span-1 font-mono text-xs tabular-nums text-ink-faint">{page.order}</span>
              <span className="col-span-4 min-w-0 truncate">{page.name}</span>
              <a
                className="col-span-5 min-w-0 truncate font-mono text-xs text-ink-muted hover:text-ink"
                href={page.sampleUrl ?? page.route}
              >
                {page.sampleUrl ?? page.route}
              </a>
              <a
                className="col-span-2 text-xs text-brand-700 underline underline-offset-2 dark:text-brand-300"
                href={`/docs/fsd/${page.id}`}
              >
                기능 명세
              </a>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
