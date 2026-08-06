import type { Metadata } from 'next';
import { IR_COMPANY } from '@winpilot/store';
import { OFFICERS, SHAREHOLDERS } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { IrTable } from '@/app/_components/IrTable';

/**
 * Feature: `governance.list` · IR Client (템플릿 A) · route `/governance`
 *
 * ## 어드민 연동
 * - 값의 원본은 `@winpilot/store` 다. `ir-admin` 에서 올린 것이 그대로 여기 선다.
 */
export const metadata: Metadata = { title: `지배구조 — ${IR_COMPANY.name}` };

export default function IrGovernanceListPage() {
  return (
    <IrSiteShell>
      <IrPageTitle title="지배구조" description="이사회 구성과 주주 현황입니다." />

      <IrTable
        columns={[{ label: '이름' }, { label: '직위' }, { label: '구분' }, { label: '주요 경력' }]}
        rows={OFFICERS.map((one) => [one.name, one.title, one.outside ? '사외' : '사내', one.career])}
        empty="등록된 임원이 없습니다."
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">주주 현황</h2>
        <IrTable
          columns={[{ label: '구분' }, { label: '주주' }, { label: '지분율', align: 'right' }]}
          rows={SHAREHOLDERS.map((one) => [one.kind, one.name, `${one.share}%`])}
          empty="등록된 주주 정보가 없습니다."
        />
      </section>
    </IrSiteShell>
  );
}
