import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ToastProvider } from '@winpilot/ui';
import './globals.css';

export const metadata: Metadata = {
  title: 'WinPilot',
  description: 'B2C 서비스의 고객 화면과 운영 어드민을 한 곳에서 관리합니다.',
};

/**
 * 토스트는 **화면 전체에 하나**다 — 페이지마다 따로 두면 이동 중에 안내가 사라지고,
 * 같은 안내가 두 겹으로 뜨는 일도 생긴다. 어드민과 같은 컴포넌트를 쓴다(하단 정중앙).
 *
 * ## 어드민 연동
 * - 토스트 컴포넌트는 어드민과 **같은 것**을 쓴다 (`@winpilot/ui`) — 성공·실패 안내가 두 앱에서 같게 보인다
 */
/*
  `daylight` — 밝기 모드를 따라가지 않게 뿌리에서 고정한다.

  토큰이 모드를 따라가게 두었더니 다크 모드로 켜 둔 브라우저에서 화면이 통째로 어두워졌다.
  이 저장소의 화면들은 밝은 바탕을 전제로 짜여 있어(표·폼의 경계, 사진 위 흰 글씨) 그때
  읽히지 않는 자리가 생긴다.

  칸마다 두르지 않고 여기 한 번 거는 이유: 화면을 새로 만드는 날 그 한 줄을 빠뜨리면
  **그 화면만** 어두워지고, 그 사실은 다크 모드로 켜 둔 사람만 본다.

  값은 `packages/tokens/theme.css` 의 `.daylight` 한 곳에 있다. 되돌리려면 이 클래스만 뗀다.
*/
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="daylight bg-canvas text-ink font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
