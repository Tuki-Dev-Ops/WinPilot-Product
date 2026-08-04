import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /** @winpilot/uir 은 빌드된 산출물이 아니라 TS 소스를 그대로 공유한다. */
  transpilePackages: ['@winpilot/uir', '@winpilot/ui', '@winpilot/client-content', '@winpilot/store', '@winpilot/docs'],
  reactStrictMode: true,

  /**
   * 개발 인디케이터는 DOM 에 실제 요소로 삽입되므로 추출기가 이를 페이지의 일부로 인식한다.
   * 결정론적 캡처를 위해 끈다.
   */
  devIndicators: false,
};

export default nextConfig;
