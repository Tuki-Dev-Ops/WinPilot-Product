import type { Metadata } from 'next';
import { listSection } from '@winpilot/docs';
import { DocHeader } from '@winpilot/docs/ui';
import { IA_GROUPS } from '@/lib/ia-groups';
import { pages } from '@/pages.manifest';

/**
 * 문서 개요 — 이 문서 묶음이 무엇을 담고 있는지와 화면 목록.
 *
 * 화면 목록은 `pages.manifest.ts` 에서 읽는다. 템플릿 A~F 가 같은 매니페스트를 쓰므로
 * 이 표가 곧 "6개 템플릿이 같아야 하는 화면 목록" 이다.
 *
 * ## 어드민 연동
 * - **없다.** 저장소의 문서를 그대로 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
 */
export const metadata: Metadata = { title: 'Overview' };

const CARDS = [
  {
    href: '/docs/purpose',
    label: '목적과 배경',
    text: '이 저장소가 무엇을 만들고 있고 왜 이렇게 만들고 있는지 정리했습니다. 일곱 앱이 같은 글을 봅니다.',
  },
  {
    href: '/docs/scope',
    label: '전체 범위',
    text: '앱과 화면, 기능이 몇인지와 무엇을 만들지 않는지를 담았습니다. 매니페스트에서 세어 만듭니다.',
  },
  {
    href: '/docs/ia',
    label: 'IA',
    text: '전체 사이트맵 한 장과 영역별 도면입니다. 화면이 어디에 놓이고 값이 어디서 오는지 보실 수 있습니다.',
  },
  {
    href: '/docs/flow-chart',
    label: 'Flow Chart',
    text: '전체 여정과 화면마다의 흐름입니다. 실선은 정상, 점선은 예외, 마름모는 갈림길을 뜻합니다.',
  },
  {
    href: '/docs/fsd',
    label: '기능 명세서 (FSD)',
    text: '화면 하나가 문서 한 장입니다. 목적과 구성, 데이터 항목, 기능, 버튼, 시나리오, 예외, 검증, 상태, 정책, 인수 조건까지 담았습니다.',
  },
  {
    href: '/docs/nfs',
    label: '비기능 명세서 (NFS)',
    text: '특정 화면에 매이지 않고 전체에 걸리는 정책입니다. 접근성과 반응형, 검증, 오류 문구, 정렬, 페이징 등을 다룹니다.',
  },
  {
    href: '/docs/page-view',
    label: 'Page View',
    text: '화면마다 세 가지 너비로 찍은 캡처입니다. 정상 화면과 예외 화면을 같은 방식으로 담았습니다.',
  },
  {
    href: '/docs/components',
    label: 'Components',
    text: '다시 쓰는 컴포넌트를 실제로 그려 보여 드립니다. 이름과 층, 어느 화면에 쓰이는지를 함께 적었습니다.',
  },
  {
    href: '/docs/design-system',
    label: 'Design System',
    text: '색과 글자 크기, 간격, 모서리와 기본 요소입니다. 값의 원본은 @winpilot/tokens 한 곳입니다.',
  },
  {
    href: '/docs/pages',
    label: 'Screens',
    text: '앱의 모든 화면을 한 장씩 모았습니다. 어느 화면이 있는지 한눈에 훑어보실 수 있습니다.',
  },
  {
    href: '/docs/prompt',
    label: '생성 프롬프트',
    text: '이 문서 묶음을 다시 만들 때 쓰는 프롬프트입니다. 그대로 복사해 가시면 됩니다.',
  },
];

export default function DocsOverviewPage() {
  const counts = {
    fsd: listSection('fsd').length,
    nfs: listSection('nfs').length,
    pageView: listSection('page-view').length,
  };

  return (
    <>
      {/* 제목이 `WinPilot B2C Client 템플릿 A` 였다 — 이식할 때 따라온 글자다(어드민판도 같았다). */}
      <DocHeader
        title="WinPilot F&B Client 템플릿 A — 문서"
        description="이 문서는 애플리케이션 안의 실제 주소입니다. 따로 배포하거나 위키에 두지 않는 것은, 화면과 문서가 같은 저장소에서 함께 바뀌어야 서로 어긋나지 않기 때문입니다. 문서를 고치지 않은 채 화면만 손대면 주소를 열어 보는 순간 드러납니다."
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
            { label: 'IA 갈래', value: `${IA_GROUPS.length}개` },
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
        <p className="text-sm leading-relaxed text-ink-muted">
          템플릿 A~F 가 공유하는 화면 목록입니다. 경로와 이름이 같고 배치만 다릅니다.
        </p>
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-12 gap-4 border-b border-border bg-surface px-5 py-2.5 text-xs text-ink-faint">
            <span className="col-span-1">순번</span>
            <span className="col-span-4">이름</span>
            <span className="col-span-4">경로</span>
            <span className="col-span-3">문서</span>
          </div>
          {pages.map((page) => (
            <div
              key={page.id}
              className="grid grid-cols-12 gap-4 border-b border-border px-5 py-3 text-sm last:border-b-0 hover:bg-surface"
            >
              <span className="col-span-1 font-mono text-xs tabular-nums text-ink-faint">{page.order}</span>
              <span className="col-span-4 min-w-0 truncate">{page.name}</span>
              <a
                className="col-span-4 min-w-0 truncate font-mono text-xs text-ink-muted hover:text-ink"
                href={page.sampleUrl ?? page.route}
              >
                {page.sampleUrl ?? page.route}
              </a>
              <span className="col-span-3 flex flex-wrap gap-x-2 text-xs">
 <a className="text-brand-700 underline underline-offset-2" href={`/docs/fsd/${page.id}`}>
                  기능
                </a>
 <a className="text-brand-700 underline underline-offset-2" href={`/docs/page-view/${page.id}`}>
                  캡처
                </a>
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
