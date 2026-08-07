import type { Metadata } from 'next';
import { IR_COMPANY } from '@winpilot/store';
import { FINANCIALS } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { IR_ROUTES } from '@/lib/navigation';
import { IrSubNav } from '@/app/_components/IrSubNav';
import { IrTable } from '@/app/_components/IrTable';

/**
 * Feature: `financial.list` · IR Client (템플릿 A) · route `/financials`
 *
 * ## 어드민 연동
 * - 값의 원본은 `@winpilot/store` 다. `ir-admin` 에서 올린 것이 그대로 여기 선다.
 */
export const metadata: Metadata = { title: `재무 정보 — ${IR_COMPANY.name}` };

export default function IrFinancialListPage() {
  return (
    <IrSiteShell>
      <IrPageTitle title="재무 정보" description="단위는 백만 원입니다. 감사 전 수치가 포함될 수 있습니다." />

      <IrSubNav current={IR_ROUTES.financials} />

      <IrTable
        columns={[{ label: '기간' }, { label: '매출', align: 'right' }, { label: '영업이익', align: 'right' }, { label: '당기순이익', align: 'right' }, { label: '자산', align: 'right' }, { label: '부채', align: 'right' }]}
        rows={FINANCIALS.map((one) => [
          one.period,
          one.revenue.toLocaleString('ko-KR'),
          one.operatingProfit.toLocaleString('ko-KR'),
          one.netProfit.toLocaleString('ko-KR'),
          one.assets.toLocaleString('ko-KR'),
          one.liabilities.toLocaleString('ko-KR'),
        ])}
        empty="등록된 재무 정보가 없습니다."
      />
    </IrSiteShell>
  );
}
