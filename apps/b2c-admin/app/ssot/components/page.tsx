import type { Metadata } from 'next';
import { AuthField } from '@/components/domain/user/AuthField';
import { AUTH_MESSAGES } from '@/lib/validation/user-auth';

/**
 * Feature: `site.library` · route `/ssot/components`
 *
 * 컴포넌트 갤러리 — 한 화면은 한 상태만 렌더하므로, 변형을 Figma ComponentSet 으로
 * 넘기려면 모든 상태를 나란히 그려두는 면이 반드시 필요하다.
 *
 * 여기서만 `figmaComponent` 를 켠다. 제품 화면에서 켜면 같은 컴포넌트가 화면 수만큼
 * 중복 생성되고 같은 variant 조합이 여러 개가 되어 결합이 깨진다.
 */
export const metadata: Metadata = {
  title: '컴포넌트 갤러리 — WinPilot',
  robots: { index: false, follow: false },
};

const AUTH_FIELD_VARIANTS = [
  {
    key: 'default',
    caption: 'State=Default',
    id: 'lib-email-default',
    label: '이메일',
    hint: '이메일을 입력해 주세요',
    type: 'email',
  },
  {
    key: 'error',
    caption: 'State=Error',
    id: 'lib-email-error',
    label: '이메일',
    hint: '이메일을 입력해 주세요',
    type: 'email',
    error: AUTH_MESSAGES.emailFormat,
  },
];

const PROPERTIES = [
  { name: 'State', type: 'VARIANT', values: 'Default / Error', source: '오류 유무' },
  { name: 'Label', type: 'TEXT', values: '라벨 문구', source: 'label prop' },
  { name: 'Message', type: 'TEXT', values: '오류 문구', source: 'error prop' },
  { name: 'ShowMessage', type: 'BOOLEAN', values: 'true / false', source: '오류 표시 여부' },
];

export default function AdminSiteLibraryPage() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <div className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-8">
        <header className="border-b border-border pb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Component Library</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">컴포넌트 갤러리</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
            각 컴포넌트의 모든 변형을 한 화면에 그립니다. 추출기가 이 화면을 읽어 Figma
            ComponentSet 과 속성을 만듭니다.
          </p>
        </header>

        <section className="mt-12">
          <h2 className="text-lg font-semibold tracking-tight">AuthField</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
            인증 폼의 입력 필드. 검증 결과가 변형과 속성으로 표현됩니다.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {AUTH_FIELD_VARIANTS.map((variant) => (
              <div key={variant.key} className="rounded-xl border border-border bg-canvas p-6">
                <p className="font-mono text-xs text-ink-faint">{variant.caption}</p>
                <div className="mt-4">
                  <AuthField
                    figmaComponent
                    id={variant.id}
                    label={variant.label}
                    hint={variant.hint}
                    type={variant.type}
                    {...(variant.error ? { error: variant.error } : {})}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-canvas">
            <div className="border-b border-border px-5 py-3">
              <h3 className="text-sm font-semibold">Figma 컴포넌트 속성</h3>
            </div>
            {PROPERTIES.map((property) => (
              <div
                key={property.name}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-5 py-3 last:border-b-0"
              >
                <span className="font-mono text-sm font-medium">{property.name}</span>
                <span className="font-mono text-xs text-brand-700 dark:text-brand-300">{property.type}</span>
                <span className="min-w-0 flex-1 text-sm text-ink-muted">{property.values}</span>
                <span className="text-xs text-ink-faint">{property.source}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
