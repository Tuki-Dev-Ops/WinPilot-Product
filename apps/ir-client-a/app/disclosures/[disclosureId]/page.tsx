import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge } from '@winpilot/ui';
import { IR_COMPANY, findDisclosure, publicDisclosures } from '@winpilot/store';
import { IrPageTitle, IrRichBody, IrSiteShell } from '@/app/_components/IrSiteShell';
import { IR_ROUTES } from '@/lib/navigation';

/**
 * Feature: `disclosure.detail` · IR Client (템플릿 A) · route `/disclosures/{disclosureId}`
 *
 * 나가지 않은 공시는 **주소로도 열리지 않는다.** 목록에서 거르는 것만으로는 부족하다 —
 * 번호를 짐작해 들어오면 원고가 그대로 보인다.
 */
export const metadata: Metadata = { title: `공시 — ${IR_COMPANY.name}` };

/** 프론트엔드 전용 — 시드 공시만 있으므로 경로를 미리 만들어 둔다. */
export function generateStaticParams() {
  return publicDisclosures().map((one) => ({ disclosureId: one.id }));
}

export default async function IrDisclosureDetailPage({
  params,
}: {
  params: Promise<{ disclosureId: string }>;
}) {
  const { disclosureId } = await params;
  const disclosure = findDisclosure(disclosureId);
  if (!disclosure || (disclosure.state !== '공시됨' && disclosure.state !== '정정')) notFound();

  return (
    <IrSiteShell back={{ href: IR_ROUTES.disclosures, label: '공시 정보' }}>
      <IrPageTitle title={disclosure.title} description={`${disclosure.disclosedAt} · ${disclosure.kind}`} />

      {disclosure.correctionOf && (
        <p className="flex flex-wrap items-center gap-2 rounded-lg bg-surface px-4 py-3 text-sm">
          <Badge tone="brand">정정</Badge>
          <span className="text-ink-muted">
            {disclosure.correctionOf} 공시를 정정한 것입니다.
          </span>
        </p>
      )}

      <article>
        <IrRichBody html={disclosure.body} />
      </article>

      {disclosure.dartUrl && (
        <a
          href={disclosure.dartUrl}
          target="_blank"
          rel="noreferrer"
          className="w-fit text-sm text-brand-700 underline underline-offset-2 dark:text-brand-300"
        >
          DART 원문 보기
        </a>
      )}
    </IrSiteShell>
  );
}
