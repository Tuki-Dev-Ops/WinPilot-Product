import type { Metadata } from 'next';
import { StatusScreen } from '@winpilot/ui';

/**
 * 404 — **없는 주소로 들어왔을 때**.
 *
 * 세 앱이 같은 컴포넌트(`StatusScreen`)를 쓴다. 화면마다 따로 만들면 앱이 셋이라 세 벌이 되고,
 * 그중 하나만 문구가 어긋나도 아무도 알아채지 못한다. 다른 것은 **어디로 보낼지** 뿐이다.
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
        '요청하신 페이지의 주소가 변경, 삭제되어 찾을 수 없습니다.',
      ]}
      actions={[
        { href: '/', label: '홈으로', primary: true },
        { href: '/products', label: '상품 보기' },
      ]}
    />
  );
}
