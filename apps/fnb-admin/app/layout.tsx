import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ToastProvider } from '@winpilot/ui';
import { FNB_BRAND } from '@winpilot/store';
import './globals.css';

/**
 * 어드민은 검색에 걸리면 안 된다. 화면마다 `robots` 를 적되, 여기에도 한 번 둔다 —
 * 화면 하나가 그것을 빠뜨려도 최소한 이 값이 남는다.
 */
export const metadata: Metadata = {
  title: `${FNB_BRAND.name} F&B Admin`,
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-surface text-ink font-sans antialiased">
        {/* 토스트는 어느 화면에서든 떠야 하므로 최상위에 한 번만 둔다 */}
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
