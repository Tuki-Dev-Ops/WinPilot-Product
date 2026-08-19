import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { readDoc } from '@winpilot/docs';
import { Markdown } from '@winpilot/docs/ui';
import { DocHeader } from '@winpilot/docs/ui';

/**
 * 갈래가 없는 한 장짜리 문서 — `/docs/path` · `/docs/coding-conventions` · `/docs/admin-mapping`.
 *
 * 이 라우트는 마지막에 매칭된다: `/docs/fsd` 처럼 이름이 정해진 화면이 먼저 잡히고,
 * 남는 한 마디만 여기로 온다. 등록되지 않은 이름이면 404 다 — 저장소의 아무 파일이나
 * 주소로 열리게 두지 않는다.
 */
/*
  `group` 은 사이드바에서 그 문서가 어느 묶음에 서는지다. 빵부스러기가 `문서 · 시스템` 로
  못 박혀 있었는데, 나중에 들어온 `전체 범위` 는 **개요** 묶음이라 사이드바와 빵부스러기가
  서로 다른 자리를 가리켰다. 한 곳에서 함께 정한다.
*/
const SINGLE: Record<string, { title: string; description: string; group: string }> = {
  scope: {
    group: '개요',
    title: '전체 범위',
    description:
      '앱 일곱 벌과 화면 · 기능이 몇인지, 무엇을 만들지 않는지, 어긋남을 무엇으로 막는지. `pnpm docs:build` 가 매니페스트와 기능 레지스트리에서 세어 만든다.',
  },
  path: {
    group: '시스템',
    title: 'Path',
    description: '주소를 어떻게 짓는지. 목록의 상태를 전부 주소에 두는 이유는 새로고침·공유·뒤로가기에서 살아남아야 하기 때문이다.',
  },
  'coding-conventions': {
    group: '시스템',
    title: 'Coding Conventions',
    description: '한 자원에 이름은 하나다. 같은 것을 두 이름으로 부르면 그때부터 두 구현이 생긴다.',
  },
  'admin-mapping': {
    group: '시스템',
    title: 'Admin Mapping',
    description: '고객 화면의 어느 자리가 어드민의 어느 화면에서 오는지. 값을 템플릿에 박아 두면 고칠 때마다 배포해야 한다.',
  },
};

export function generateStaticParams() {
  return Object.keys(SINGLE).map((page) => ({ page }));
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page } = await params;
  return { title: SINGLE[page]?.title ?? '문서' };
}

export default async function SingleDocPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const meta = SINGLE[page];
  if (!meta) notFound();

  const source = readDoc(page);
  if (!source) notFound();

  return (
    <>
      <DocHeader trail={['문서', meta.group]} title={meta.title} description={meta.description} />
      <article className="min-w-0">
        <Markdown source={source} />
      </article>
    </>
  );
}
