import type { Metadata } from 'next';
import { DocHeader } from '@winpilot/docs/ui';
import { ScreenShots } from '@winpilot/docs';
import { pages } from '@/pages.manifest';

/**
 * 화면 사진 목차.
 *
 * 사진은 `pnpm pages:shoot` 이 찍어 `public/pages/` 에 넣는다. 목록의 차례와 이름은
 * **매니페스트를 그대로 읽는다** — 여기에 다시 적어 두면 화면이 하나 늘 때 두 곳을 고쳐야 하고,
 * 한쪽만 고친 날 목록과 사진이 어긋난다.
 */
export const metadata: Metadata = { title: 'Screens' };

export default function ScreenIndexPage() {
  return (
    <>
      <DocHeader
        trail={['문서', '명세']}
        title="Screens"
        description="앱의 모든 화면을 한 장씩 모았습니다. 어느 화면이 있는지 한눈에 훑어보시는 자리이고, 한 화면을 세 가지 너비로 뜯어보는 것은 Page View 가 맡습니다. 사진은 `pnpm pages:shoot` 으로 다시 찍습니다."
      />
      <ScreenShots items={pages} base="/docs/pages" />
    </>
  );
}
