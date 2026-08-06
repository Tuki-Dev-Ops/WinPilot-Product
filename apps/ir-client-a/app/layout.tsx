import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ToastProvider } from '@winpilot/ui';
import './globals.css';
export const metadata: Metadata = {
  title: 'WinPilot IR',
  description: '회사 홈페이지 — 공시·재무·주주 정보를 투자자에게 알립니다.',
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-canvas text-ink font-sans antialiased">
        {/* 토스트는 어느 화면에서든 떠야 하므로 최상위에 한 번만 둔다 */}
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
