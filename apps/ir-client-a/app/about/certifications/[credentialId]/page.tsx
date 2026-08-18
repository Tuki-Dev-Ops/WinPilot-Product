import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CREDENTIALS, IR_COMPANY, findCredential, publicCredentials } from '@winpilot/store';
import { IrSiteShell } from '@/app/_components/IrSiteShell';
import { PageHero } from '@/app/_components/PageHero';

/**
 * Feature: `ir.credential.detail` · IR Client (템플릿 A) · route `/about/certifications/[credentialId]`
 *
 * ## 목록에 다 적혀 있는데 왜 상세가 있나
 * 목록의 한 줄이 이름 · 번호 · 발급처 · 취득일을 이미 다 말한다. 그럼에도 이 화면을 두는 까닭은
 * **주소가 필요해서**다 — 특허 하나를 제안서나 메일에 걸어 보낼 자리가 없었다. 목록만 있으면
 * "저희 홈페이지 특허 목록에서 세 번째 줄" 이라고 적게 된다.
 *
 * ## 값을 표로 세운다
 * 문단으로 풀면 번호가 문장 안에 묻힌다. 여기 오는 사람이 하는 일은 **번호를 옮겨 적거나
 * 대조하는 것**이라, 이름표와 값이 나란한 표가 맞다.
 *
 * ## 숨긴 것은 주소로도 안 열린다
 * `publicCredentials()` 에 없으면 404 다. 내려 둔 것이 주소로 읽히면 내린 뜻이 없다 —
 * 공시(`/disclosures/[disclosureId]`)와 같은 규칙이다.
 *
 * 미리 만들어 두는 경로도 공개된 것만이다. 내려 둔 것까지 만들면 그 화면이 검색에 걸린다.
 *
 * ## 어드민 연동
 * - 값의 원본은 `@winpilot/store` 의 `CREDENTIALS` 다. **IR Admin 의 회사 > 특허 및 인증**이
 *   그 값을 고친다.
 */
export function generateStaticParams() {
  return publicCredentials().map((one) => ({ credentialId: one.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ credentialId: string }>;
}): Promise<Metadata> {
  const { credentialId } = await params;
  const one = findCredential(credentialId);
  return { title: one ? `${one.title} — ${IR_COMPANY.name}` : `특허 및 인증 — ${IR_COMPANY.name}` };
}

export default async function CredentialDetailPage({
  params,
}: {
  params: Promise<{ credentialId: string }>;
}) {
  const { credentialId } = await params;
  const one = findCredential(credentialId);
  if (!one || !one.visible) notFound();

  /*
    같은 갈래의 이웃을 아래에 둔다. 특허 하나를 보러 온 사람은 대개 **그 회사가 이 분야에
    무엇을 더 갖고 있는지**를 이어서 본다 — 목록으로 돌아갔다가 다시 고르게 두면 그 흐름이 끊긴다.
  */
  const siblings = publicCredentials()
    .filter((row) => row.kind === one.kind && row.id !== one.id)
    .slice(0, 4);

  return (
    <IrSiteShell back={{ href: '/about/certifications', label: '특허 및 인증' }} hero={<PageHero title={one.title} />}>

      <dl className="grid grid-cols-1 overflow-hidden rounded-xl border border-border sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)]">
        {[
          { label: '구분', value: one.kind },
          { label: '이름', value: one.title },
          { label: '등록번호', value: one.number, mono: true },
          { label: '발급처', value: one.issuer },
          { label: '취득일', value: one.acquiredAt, mono: true },
        ].map((row) => (
          <div key={row.label} className="contents">
            <dt className="border-t border-border bg-surface px-5 py-3 text-xs font-medium text-ink-muted first:border-t-0 sm:border-t">
              {row.label}
            </dt>
            <dd
              className={`border-t border-border px-5 py-3 text-sm ${
                row.mono ? 'font-mono tabular-nums' : ''
              }`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {siblings.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold tracking-tight">같은 갈래의 {one.kind}</h2>
          <ul className="overflow-hidden rounded-xl border border-border">
            {siblings.map((row) => (
              <li key={row.id} className="border-t border-border first:border-t-0">
                <a
                  href={`/about/certifications/${row.id}`}
                  className="flex flex-col gap-1 px-5 py-4 transition-colors duration-150 hover:bg-surface sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <span className="min-w-0 text-sm font-medium">{row.title}</span>
                  <span className="shrink-0 font-mono text-xs tabular-nums text-ink-faint">{row.number}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 전체가 몇 건인지. 이 화면에서 목록으로 돌아갈 까닭을 숫자가 만든다. */}
      <p className="text-sm text-ink-muted">
        등록된 특허 · 인증은 모두{' '}
        <span className="font-mono tabular-nums text-ink">{CREDENTIALS.filter((row) => row.visible).length}</span>건입니다.
      </p>
    </IrSiteShell>
  );
}
