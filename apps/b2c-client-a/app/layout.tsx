import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'WinPilot',
  description: 'B2C 서비스의 고객 화면과 운영 어드민을 한 곳에서 관리합니다.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-canvas text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
