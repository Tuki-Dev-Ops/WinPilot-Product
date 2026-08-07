import type { Metadata } from 'next';
import { IR_COMPANY } from '@winpilot/store';
import { DIVIDENDS } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { IR_ROUTES } from '@/lib/navigation';
import { IrSubNav } from '@/app/_components/IrSubNav';
import { IrTable } from '@/app/_components/IrTable';

/**
 * Feature: `dividend.list` · IR Client (템플릿 A) · route `/dividends`
 *
 * ## 어드민 연동
 * - 값의 원본은 `@winpilot/store` 다. `ir-admin` 에서 올린 것이 그대로 여기 선다.
 */
export const metadata: Metadata = { title: `배당 정보 — ${IR_COMPANY.name}` };

export default function IrDividendListPage() {
  return (
    <IrSiteShell>
      <IrPageTitle title="배당 정보" description="기준일까지 보유하신 주주에게 지급됩니다." />

      <IrSubNav current={IR_ROUTES.dividends} />

      <IrTable
        columns={[{ label: '사업연도' }, { label: '주당 배당금', align: 'right' }, { label: '배당성향', align: 'right' }, { label: '시가배당률', align: 'right' }, { label: '기준일' }, { label: '지급일' }]}
        rows={DIVIDENDS.map((one) => [
          one.year,
          `${one.perShare.toLocaleString('ko-KR')}원`,
          `${one.payoutRatio}%`,
          `${one.yieldRate}%`,
          one.recordDate,
          one.payDate,
        ])}
        empty="등록된 배당 정보가 없습니다."
      />
    </IrSiteShell>
  );
}
