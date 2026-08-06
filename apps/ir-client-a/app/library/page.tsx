import type { Metadata } from 'next';
import { IR_COMPANY } from '@winpilot/store';
import { IR_DOCUMENTS } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { IrTable } from '@/app/_components/IrTable';

/**
 * Feature: `library.list` · IR Client (템플릿 A) · route `/library`
 *
 * ## 어드민 연동
 * - 값의 원본은 `@winpilot/store` 다. `ir-admin` 에서 올린 것이 그대로 여기 선다.
 */
export const metadata: Metadata = { title: `IR 자료실 — ${IR_COMPANY.name}` };

export default function IrLibraryListPage() {
  return (
    <IrSiteShell>
      <IrPageTitle title="IR 자료실" description="실적발표와 사업보고서를 내려받으실 수 있습니다." />

      <IrTable
        columns={[{ label: '자료' }, { label: '구분' }, { label: '올린 날' }, { label: '크기', align: 'right' }]}
        rows={IR_DOCUMENTS.map((one) => [
          <a key="t" href={one.fileUrl} className="text-brand-700 underline underline-offset-2 dark:text-brand-300">
            {one.title}
          </a>,
          one.kind,
          one.publishedAt,
          /* 크기를 함께 적는다 — 모바일에서 8MB 를 모르고 누르는 것과 알고 누르는 것은 다르다. */
          one.sizeLabel,
        ])}
        empty="등록된 자료가 없습니다."
      />
    </IrSiteShell>
  );
}
