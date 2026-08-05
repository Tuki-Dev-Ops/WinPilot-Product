import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { readDoc } from '@winpilot/docs';
import { Markdown } from '@winpilot/docs/ui';
import { DocHeader } from '../_components/DocHeader';

/**
 * 갈래가 없는 한 장짜리 문서 — `/docs/path` · `/docs/coding-conventions` · `/docs/deployment-mapping`.
 *
 * 이 라우트는 마지막에 매칭된다: `/docs/fsd` 처럼 이름이 정해진 화면이 먼저 잡히고,
 * 남는 한 마디만 여기로 온다. 등록되지 않은 이름이면 404 다 — 저장소의 아무 파일이나
 * 주소로 열리게 두지 않는다.
 */
const SINGLE: Record<string, { title: string; description: string }> = {
  path: {
    title: 'Path',
    description: '주소를 어떻게 짓는지. 목록의 상태를 전부 주소에 두는 이유는 새로고침·공유·뒤로가기에서 살아남아야 하기 때문이다.',
  },
  'coding-conventions': {
    title: 'Coding Conventions',
    description: '한 자원에 이름은 하나다. 같은 것을 두 이름으로 부르면 그때부터 두 구현이 생긴다.',
  },
  'deployment-mapping': {
    title: 'Deployment Mapping',
    description: '이 콘솔이 정하는 값이 고객사의 배포 어느 자리에 반영되는지. 키 하나가 틀리면 로그인·결제·사이트가 통째로 멈춘다.',
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
      <DocHeader trail={['문서', '시스템']} title={meta.title} description={meta.description} />
      <article className="min-w-0">
        <Markdown source={source} />
      </article>
    </>
  );
}
