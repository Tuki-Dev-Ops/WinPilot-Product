'use client';

import { usePathname } from 'next/navigation';
import { DocsSidebarView, type NavGroup } from '@winpilot/docs/ui';

/**
 * 문서 사이드바 — **지금 주소를 읽어 넘기는 겹.**
 *
 * 그리는 일은 `@winpilot/docs` 가 한다. 여기 남는 이유는 하나뿐이다: `usePathname()` 이
 * `next` 에 묶여 있고, 이 저장소의 공유 패키지는 `next` 를 의존하지 않는다.
 *
 * layout 은 화면이 바뀌어도 다시 그려지지 않으므로 이 겹은 반드시 client 여야 한다 —
 * 서버에서 주소를 넘기면 사이드바만 옛 자리에 남는다.
 */
export function DocsSidebar({ groups }: { groups: NavGroup[] }) {
  return <DocsSidebarView groups={groups} pathname={usePathname() ?? '/docs'} />;
}
