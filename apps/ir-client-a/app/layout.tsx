import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ToastProvider } from '@winpilot/ui';
import './globals.css';
export const metadata: Metadata = {
  title: 'WinPilot IR',
  description: '회사 홈페이지 — 공시·재무·주주 정보를 투자자에게 알립니다.',
};
/**
 * ## 이 사이트는 밝기 모드를 따라가지 않는다
 * `daylight` 를 뿌리에 한 번 걸어 **모든 화면**을 밝은 팔레트로 고정한다.
 *
 * 토큰이 모드를 따라가게 두었더니, 다크 모드로 켜 둔 브라우저에서 회사 홈페이지가 통째로
 * 어두워졌다. 여기는 **투자자와 기자가 보는 자리**라 인쇄물·보도자료와 같은 낯이어야 하고,
 * 첫 화면의 검은 칸과 그 아래 밝은 칸이 만드는 리듬도 모드에 따라 사라지면 안 된다.
 *
 * 칸마다 두르지 않고 뿌리에 거는 이유: 화면을 새로 만드는 날 그 한 줄을 빠뜨리면 **그 화면만**
 * 어두워지고, 그 사실은 다크 모드로 켜 둔 사람만 본다.
 *
 * 값은 `packages/tokens/theme.css` 의 `.daylight` 한 곳에 있다.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  /*
    `scroll-smooth` — 연혁의 연도 닻처럼 **화면 안에서 뛰는 자리**가 있어서다. 뚝 끊겨 이동하면
    어디로 갔는지 몰라 위로 다시 훑게 된다. 모션을 줄여 달라고 해 둔 사람에게는
    `theme.css` 가 이 값을 되돌린다.
  */
  return (
    <html lang="ko" className="scroll-smooth">
      <body className="daylight bg-canvas text-ink font-sans antialiased">
        {/* 토스트는 어느 화면에서든 떠야 하므로 최상위에 한 번만 둔다 */}
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
