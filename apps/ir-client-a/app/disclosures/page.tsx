import type { Metadata } from 'next';
import { Badge } from '@winpilot/ui';
import { IR_COMPANY, publicDisclosures } from '@winpilot/store';
import { IrPageTitle, IrSiteShell } from '@/app/_components/IrSiteShell';
import { IrSubNav } from '@/app/_components/IrSubNav';
import { IR_ROUTES } from '@/lib/navigation';

/**
 * Feature: `disclosure.list` · IR Client (템플릿 A) · route `/disclosures`
 *
 * ## 나간 것만 선다
 * 어드민의 원고(`작성 중`·`검토 요청`)는 여기 오지 않는다. 두 화면이 같은 함수
 * (`publicDisclosures`)로 거르므로, 어드민에서 본 것과 사이트가 갈리지 않는다.
 *
 * ## 어드민 연동
 * - 제목 · 본문 ← `ir-admin` 공시 관리에서 게시한 값
 * - 정정 공시는 무엇을 고쳤는지가 상세에 남는다
 */
export const metadata: Metadata = { title: `공시 정보 — ${IR_COMPANY.name}` };

export default function IrDisclosureListPage() {
  const rows = publicDisclosures();

  return (
    <IrSiteShell>
      <IrPageTitle
        title="공시 정보"
        description="공시 원문은 금융감독원 전자공시시스템(DART)에서도 확인하실 수 있습니다."
      />

      <IrSubNav current={IR_ROUTES.disclosures} />

      {rows.length === 0 ? (
        <p className="rounded-xl border border-border px-6 py-12 text-center text-sm text-ink-muted">
          등록된 공시가 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col rounded-xl border border-border">
          {rows.map((one) => (
            <li key={one.id} className="border-b border-border last:border-b-0">
              <a href={`${IR_ROUTES.disclosures}/${one.id}`} className="flex flex-wrap items-center gap-3 px-6 py-4">
                <span className="shrink-0 font-mono text-xs tabular-nums text-ink-faint">{one.disclosedAt}</span>
                <Badge tone="neutral">{one.kind}</Badge>
                <span className="min-w-0 flex-1 truncate text-sm">{one.title}</span>
                {one.state === '정정' && <Badge tone="brand">정정</Badge>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </IrSiteShell>
  );
}
