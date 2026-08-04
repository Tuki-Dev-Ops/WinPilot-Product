/**
 * 문서 사이드바.
 *
 * 문서는 앱 안의 **진짜 라우트**다. 따로 배포하거나 위키에 올리지 않는 이유는 화면과 문서가
 * 같은 레포에서 같이 바뀌어야 어긋나지 않기 때문이다 — 문서를 고치지 않고 화면만 고치면
 * 주소를 열었을 때 바로 드러난다.
 *
 * 묶음 순서는 읽는 순서다: 무엇이 있는지(구조) → 화면 하나하나(명세) → 지켜야 할 것(정책) →
 * 무엇으로 만들었는지(시스템).
 *
 * ## 어드민 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
 */
export type NavLink = { href: string; label: string; hint?: string };
export type NavGroup = { title: string; items: NavLink[] };

export const DOCS_ROOT = '/docs';

export function docsNav(counts: { fsd: number; nfs: number; pageView: number }): NavGroup[] {
  return [
    {
      title: '개요',
      items: [
        { href: '/docs', label: 'Overview' },
        { href: '/docs/ia', label: 'IA' },
        { href: '/docs/flow-chart', label: 'Flow Chart' },
      ],
    },
    {
      title: '명세',
      items: [
        { href: '/docs/fsd', label: '기능 명세서 (FSD)', hint: `${counts.fsd}장` },
        { href: '/docs/nfs', label: '비기능 명세서 (NFS)', hint: `${counts.nfs}장` },
        { href: '/docs/page-view', label: 'Page View', hint: `${counts.pageView}개` },
      ],
    },
    {
      title: '시스템',
      items: [
        { href: '/docs/components', label: 'Components' },
        { href: '/docs/design-system', label: 'Design System' },
        { href: '/docs/prompt', label: '생성 프롬프트' },
      ],
    },
  ];
}
