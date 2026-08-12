import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ToastProvider } from '@winpilot/ui';
import { FNB_BRAND } from '@winpilot/store';
import './globals.css';

/**
 * 탭 제목의 **꼬리를 여기 한 줄로 둔다.**
 *
 * 화면마다 `제목 — 브랜드명` 을 손으로 적고 있었다(열세 곳). 이름이 바뀌는 날 열세 곳을 다
 * 고쳐야 하고, 무엇보다 **한 곳을 빠뜨려도 그 화면을 열기 전에는 드러나지 않는다** — 탭 제목은
 * 화면 안에 없는 글자다.
 *
 * `template` 은 Next 가 주는 자리다. 아래 화면들은 자기 제목만 적고, 꼬리는 여기서 붙는다.
 * 헬퍼 함수를 만들어 부르게 할 수도 있었지만, 그러면 부르는 것을 잊는 화면이 다시 생긴다 —
 * 틀을 얹어 두면 잊을 자리 자체가 없다.
 *
 * `default` 는 홈처럼 **자기 제목을 적지 않는 화면**이 쓴다. `template` 은 자식이 제목을 줄
 * 때만 도는 규칙이라, 이것이 없으면 홈의 탭이 비어 버린다.
 */
export const metadata: Metadata = {
  title: {
    default: `${FNB_BRAND.name} — ${FNB_BRAND.tagline}`,
    template: `%s — ${FNB_BRAND.name}`,
  },
  description: '통문어를 파는 외식 프랜차이즈 — 메뉴 · 매장 찾기 · 창업 안내.',
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
