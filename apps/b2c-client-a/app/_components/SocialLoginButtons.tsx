'use client';

import { useToast } from '@winpilot/ui';
import { setSignedIn } from './session-store';

/**
 * 소셜 로그인 — **각 사업자의 브랜드 가이드라인을 그대로 따른다.**
 *
 * 색·문구·심볼은 우리가 정하는 것이 아니다. 심사에서 반려되는 항목이고, 사용자가 "이게 진짜
 * 카카오 로그인인가" 를 판단하는 근거이기도 하다. 아래 값은 각 사의 로그인 버튼 가이드에서 온다.
 *
 *   Google   : 흰 배경 · 테두리 #747775 · 글자 #1F1F1F · 문구 'Google 계정으로 로그인'
 *              4색 G 심볼은 절대 단색으로 바꾸지 않는다. 최소 높이 40px.
 *   Kakao    : 배경 #FEE500 · 글자 #000000 85% · 말풍선 심볼 검정 · 문구 '카카오 로그인'
 *   Naver    : 배경 #03C75A · 흰 N 심볼 · 흰 글자 · 문구 '네이버 로그인'
 *   Facebook : 배경 #1877F2 · 흰 f 심볼 · 흰 글자 · 문구 'Facebook으로 로그인'
 *   Apple    : 검정 배경 · 흰 사과 심볼 · 흰 글자 · 문구 'Apple로 로그인'
 *              웹에서 최소 높이 44px, 다른 소셜 버튼보다 작게 두지 않는다.
 *
 * 심볼은 전부 **인라인 SVG** 다. 이미지 파일로 두면 추출에서 비트맵 한 덩어리가 되어 Figma 에서
 * 벡터로 복원되지 않고, 바깥 CDN 을 물면 픽셀 비교가 네트워크에 좌우된다.
 *
 * ## 어드민 연동
 * - 어느 소셜을 켤지와 키(Client ID 등)는 **사내 어드민**의 OAuth 설정에서 정한다
 *   (`internal-admin` 통합 관리) — 고객사 어드민(`b2c-admin`)이 만지는 값이 아니다
 */
type Provider = {
  id: string;
  label: string;
  /** 버튼 배경·글자·테두리 — 각 사 가이드라인 값 */
  className: string;
  icon: React.ReactNode;
};

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/** 카카오톡 말풍선 — 가이드라인상 심볼은 검정(밝은 배경 위)으로 둔다. */
function KakaoMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#000000"
        d="M12 3C6.99 3 3 6.24 3 10.23c0 2.55 1.7 4.79 4.26 6.06-.19.68-.68 2.47-.78 2.85-.13.48.17.47.36.34.15-.1 2.4-1.63 3.37-2.3.58.08 1.18.13 1.79.13 5.01 0 9-3.24 9-7.08S17.01 3 12 3z"
      />
    </svg>
  );
}

/** 네이버 N — 초록 배경 위 흰 심볼. */
function NaverMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#ffffff" d="M14.13 12.4 9.56 5.5H5.5v13h4.37v-6.9l4.57 6.9h4.06v-13h-4.37z" />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#ffffff"
        d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.45-4.92 8.45-9.94z"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#ffffff"
        d="M16.36 12.78c.02 2.6 2.28 3.47 2.3 3.48-.02.06-.36 1.24-1.19 2.45-.72 1.05-1.47 2.1-2.65 2.12-1.16.02-1.53-.69-2.85-.69-1.32 0-1.73.67-2.83.71-1.14.04-2-1.13-2.73-2.18-1.49-2.15-2.63-6.08-1.1-8.73.76-1.32 2.12-2.15 3.59-2.17 1.12-.02 2.17.75 2.85.75.68 0 1.96-.93 3.3-.79.56.02 2.13.23 3.14 1.7-.08.05-1.87 1.09-1.85 3.26M14.2 5.4c.6-.73 1-1.74.89-2.75-.86.03-1.9.57-2.52 1.3-.55.64-1.04 1.67-.91 2.66.96.07 1.94-.49 2.54-1.21"
      />
    </svg>
  );
}

/*
  순서는 국내 이용률을 따른다 — 카카오·네이버가 위, 세계 공용인 구글이 그다음.
  Apple 은 가이드라인상 다른 버튼보다 작거나 덜 눈에 띄면 안 되므로 같은 크기로 둔다.
*/
const PROVIDERS: Provider[] = [
  {
    id: 'kakao',
    label: '카카오 로그인',
    className: 'bg-[#FEE500] text-black/85',
    icon: <KakaoMark />,
  },
  {
    id: 'naver',
    label: '네이버 로그인',
    className: 'bg-[#03C75A] text-white',
    icon: <NaverMark />,
  },
  {
    id: 'google',
    label: 'Google 계정으로 로그인',
    className: 'border border-[#747775] bg-white text-[#1F1F1F]',
    icon: <GoogleMark />,
  },
  {
    id: 'facebook',
    label: 'Facebook으로 로그인',
    className: 'bg-[#1877F2] text-white',
    icon: <FacebookMark />,
  },
  {
    id: 'apple',
    label: 'Apple로 로그인',
    className: 'bg-black text-white',
    icon: <AppleMark />,
  },
];

export function SocialLoginButtons({ label }: { label: string }) {
  const toast = useToast();

  return (
    <section className="flex w-full flex-col gap-3">
      {/* 구분선 위 문구 — 아래 단추들이 위 폼과 다른 길이라는 것을 알린다. */}
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="shrink-0 text-xs text-ink-faint">{label}</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-2">
        {PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => {
              // 실제 인증은 사내 어드민에 등록한 키로 이뤄진다 — 여기서는 화면 흐름만 보여 준다.
              setSignedIn(true);
              toast.success({ message: `${provider.label}으로 로그인했습니다`, detail: '연동 계정으로 접속했습니다.' });
            }}
            /* 높이 44px — Apple 가이드라인의 웹 최소치에 나머지도 맞춘다(버튼 크기가 들쭉날쭉하면 안 된다). */
            className={`flex h-11 w-full shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-lg text-sm font-medium ${provider.className}`}
          >
            {provider.icon}
            {provider.label}
          </button>
        ))}
      </div>
    </section>
  );
}
