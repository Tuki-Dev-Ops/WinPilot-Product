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
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-canvas text-ink font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
