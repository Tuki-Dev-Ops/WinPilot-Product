import type { Metadata } from 'next';
import { StatusScreen } from '@winpilot/ui';

/**
 * 404 — **없는 주소로 들어왔을 때**.
 *
 * 앱들이 같은 컴포넌트(`StatusScreen`)를 쓴다. 화면마다 따로 만들면 앱 수만큼 벌이 되고,
 * 그중 하나만 문구가 어긋나도 아무도 알아채지 못한다. 다른 것은 **어디로 보낼지** 뿐이다.
 *
 * 여기서 메뉴로 보내는 이유: 없는 주소로 들어오는 것의 대부분이 **없어진 메뉴의 옛 주소**다
 * (계절 메뉴가 내려가면 그 링크가 남는다). 홈보다 메뉴판이 그 사람에게 가깝다.
 *
 * 라우트가 아니라 Next 의 약속된 파일이라 `pages.manifest.ts` 에는 올리지 않는다 —
 * 매니페스트는 주소가 있는 화면의 목록이고, 이 화면은 어떤 주소로도 나타날 수 있다.
 */
export const metadata: Metadata = { title: '404 — 페이지를 찾을 수 없습니다' };

export default function NotFound() {
  return (
    <StatusScreen
      code="404 ERROR"
      title="죄송합니다. 페이지를 찾을 수 없습니다."
      description={[
        '존재하지 않는 주소를 입력하셨거나',
        '찾으시는 메뉴가 내려갔을 수 있습니다.',
      ]}
      actions={[
        { href: '/menu', label: '메뉴 보기', primary: true },
        { href: '/', label: '홈으로' },
      ]}
    />
  );
}
