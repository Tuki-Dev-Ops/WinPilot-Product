/**
 * 소셜 로그인 제공자와 **제공자마다 다른 연동 값**.
 *
 * ## 왜 제공자마다 필드를 따로 두는가
 * 전에는 넷 모두 `Client ID` + `Client Secret` 두 칸으로 받았다. 셋(카카오·네이버·구글)은
 * 그 모양이 맞지만 **애플만 완전히 다르다.**
 *
 * 애플은 비밀 키를 문자열로 주지 않는다. `.p8` 파일로 내려주는 **개인 키**와, 그 키가 누구
 * 것인지 말해 주는 **Team ID · Key ID**, 그리고 서비스를 가리키는 **Services ID** 넷을
 * 함께 써서 서버가 client_secret 을 **직접 만들어 낸다**(JWT 서명). 두 칸짜리 폼에는
 * Team ID 와 Key ID 를 넣을 자리가 없어, 애플 로그인을 이 화면으로는 끝낼 수 없었다.
 *
 * ## 카카오의 `Client ID` 는 REST API 키다
 * 카카오 콘솔에는 `Client ID` 라는 이름의 칸이 없다. `REST API 키` 가 그 자리이고,
 * 화면에 `Client ID` 라고만 적어 두면 콘솔에서 그 이름을 찾다가 못 찾는다. 그래서 라벨을
 * **콘솔에 적힌 말 그대로** 쓴다.
 *
 * ## 출처
 * - https://developers.kakao.com/docs/ko/kakaologin/prerequisite (카카오 — REST API 키 · 클라이언트 시크릿 · 리다이렉트 URI)
 * - https://developer.apple.com/documentation/signinwithapplerestapi (애플 — Services ID · Team ID · Key ID · 개인 키)
 * - https://developers.naver.com/ (네이버 — Client ID · Client Secret)
 * - https://developers.google.com/identity (구글 — 클라이언트 ID · 클라이언트 보안 비밀번호)
 */

export type OauthProviderId = 'kakao' | 'naver' | 'google' | 'apple';

export type OauthFieldSpec = {
  key: string;
  /** **제공자 콘솔에 적힌 말 그대로.** 우리 식으로 바꿔 적으면 콘솔에서 못 찾는다 */
  label: string;
  hint: string;
  required: boolean;
  secret?: boolean;
  /** 어디서 발급받는지 — 이것이 없으면 매번 묻는다 */
  note?: string;
  /** 여러 줄 값 (애플의 `.p8` 개인 키) */
  multiline?: boolean;
};

export type OauthProvider = {
  id: OauthProviderId;
  label: string;
  /** 콘솔 이름 — 어디로 가야 하는지 */
  console: string;
  fields: OauthFieldSpec[];
};

export const OAUTH_PROVIDERS: readonly OauthProvider[] = [
  {
    id: 'kakao',
    label: '카카오',
    console: 'Kakao Developers > 내 애플리케이션 > 앱 키',
    fields: [
      {
        key: 'clientId',
        label: 'REST API 키',
        hint: '앱 키 화면의 REST API 키',
        required: true,
        note: '카카오 콘솔에는 `Client ID` 라는 칸이 없습니다. REST API 키가 그 자리입니다.',
      },
      {
        key: 'clientSecret',
        label: '클라이언트 시크릿',
        hint: '보안 > Client Secret',
        required: true,
        secret: true,
        note: '보안 화면에서 활성화한 뒤 발급받습니다. 끄면 토큰 발급이 막힙니다.',
      },
    ],
  },
  {
    id: 'naver',
    label: '네이버',
    console: '네이버 개발자센터 > 내 애플리케이션 > 개요',
    fields: [
      {
        key: 'clientId',
        label: 'Client ID',
        hint: '애플리케이션 개요의 Client ID',
        required: true,
        note: '애플리케이션을 등록하면 바로 발급됩니다.',
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        hint: '애플리케이션 개요의 Client Secret',
        required: true,
        secret: true,
        note: '같은 화면에서 확인합니다. 재발급하면 이전 값은 즉시 막힙니다.',
      },
    ],
  },
  {
    id: 'google',
    label: '구글',
    console: 'Google Cloud Console > API 및 서비스 > 사용자 인증 정보',
    fields: [
      {
        key: 'clientId',
        label: '클라이언트 ID',
        hint: '...apps.googleusercontent.com 으로 끝나는 값',
        required: true,
        note: 'OAuth 2.0 클라이언트 ID 를 **웹 애플리케이션**으로 만들어야 합니다.',
      },
      {
        key: 'clientSecret',
        label: '클라이언트 보안 비밀번호',
        hint: 'GOCSPX- 로 시작하는 값',
        required: true,
        secret: true,
        note: '클라이언트를 만들 때 한 번 보여 줍니다. 놓치면 재발급해야 합니다.',
      },
    ],
  },
  {
    id: 'apple',
    label: '애플',
    console: 'Apple Developer > Certificates, Identifiers & Profiles',
    fields: [
      {
        key: 'clientId',
        label: 'Services ID',
        hint: '예: com.example.web',
        required: true,
        note: 'App ID 가 아니라 **Services ID** 입니다. 웹 로그인은 이쪽을 씁니다.',
      },
      {
        key: 'teamId',
        label: 'Team ID',
        hint: '10자리 영문·숫자',
        required: true,
        note: 'Membership 화면 오른쪽 위에 있습니다. 조직마다 하나입니다.',
      },
      {
        key: 'keyId',
        label: 'Key ID',
        hint: '10자리 영문·숫자',
        required: true,
        note: 'Sign in with Apple 용 키를 만들면 함께 나옵니다.',
      },
      {
        key: 'privateKey',
        label: '개인 키 (.p8)',
        hint: '-----BEGIN PRIVATE KEY----- 로 시작하는 여러 줄',
        required: true,
        secret: true,
        multiline: true,
        note: '키를 만들 때 **한 번만** 내려받을 수 있습니다. 이 값과 Team ID · Key ID 로 서버가 client_secret 을 직접 만듭니다.',
      },
    ],
  },
] as const;

export const OAUTH_LABELS: Record<OauthProviderId, string> = Object.fromEntries(
  OAUTH_PROVIDERS.map((provider) => [provider.id, provider.label]),
) as Record<OauthProviderId, string>;

export function findOauthProvider(id: OauthProviderId): OauthProvider {
  const found = OAUTH_PROVIDERS.find((provider) => provider.id === id);
  if (!found) throw new Error(`모르는 소셜 로그인 제공자: ${id}`);
  return found;
}

export type OauthSetting = {
  id: OauthProviderId;
  enabled: boolean;
  /** 키 → 값. 제공자마다 칸이 다르므로 한 벌로 든다 */
  credentials: Record<string, string>;
  redirectUri: string;
};

export function defaultOauth(domain: string): OauthSetting[] {
  return OAUTH_PROVIDERS.map((provider) => ({
    id: provider.id,
    // 국내 서비스는 거의 언제나 카카오·네이버부터 켠다.
    enabled: provider.id === 'kakao' || provider.id === 'naver',
    credentials:
      provider.id === 'kakao' || provider.id === 'naver'
        ? ({ clientId: `${provider.id}_live_0000000000`, clientSecret: '****************abcd' } as Record<
            string,
            string
          >)
        : {},
    redirectUri: `https://${domain}/auth/callback/${provider.id}`,
  }));
}
