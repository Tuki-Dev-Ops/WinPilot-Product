'use client';

import { useMemo, useState } from 'react';
import { Badge, useToast } from '@winpilot/ui';
import { InternalConfirmModal } from '@/app/_components/InternalConfirmModal';
import { IntegrationTenantList } from '@/app/integrations/_components/IntegrationTenantList';
import { findPgProvider } from '@/lib/data/pg-providers';
import { findTenant } from '@/lib/data/tenants';
import { PaymentSettingsModal, type PgDraft } from './PaymentSettingsModal';

/**
 * PG 정보 — 고객사의 결제 연동.
 *
 * ## 목록만 남고 설정은 창으로 갔다
 * 전에는 고객사 목록 밑에 폼이 이어져 있었다. 다른 고객사를 누르면 화면은 그대로인데 아래 값만
 * 바뀌어서, 지금 넣고 있는 키가 누구 것인지 제목을 다시 읽어야 했다. **결제 키는 잘못 들어가면
 * 남의 고객이 결제하지 못하는 값**이다.
 *
 * 지금 이 화면이 답하는 것은 **어느 고객사가 아직 테스트인가** 하나이고, 키를 넣는 일은
 * 창에서 한다(`PaymentSettingsModal`).
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function PaymentSettingsView({ initialTenantId }: { initialTenantId?: string }) {
  const toast = useToast();
  const [tenantId, setTenantId] = useState(initialTenantId ?? '');
  const tenant = useMemo(() => findTenant(tenantId), [tenantId]);

  /*
    고객사마다 저장한 값. 아직 손대지 않은 곳은 여기 없다 — 빈 값과 "아직 안 넣음" 을 같은
    것으로 두면 저장한 적 없는 고객사가 테스트 모드로 설정된 것처럼 보인다.
  */
  const [saved, setSaved] = useState<Record<string, PgDraft>>({});
  /*
    저장을 누른 뒤 실제로 저장하기 전에 한 번 더 세운다. 이 값은 **고객사의 결제창으로
    나가는 것**이라, 목록 하나 고치는 일과 같은 무게로 저장되면 안 된다.
  */
  const [pending, setPending] = useState<PgDraft | null>(null);

  const save = (draft: PgDraft) => {
    if (!tenant || !pending) return;

    setSaved((previous) => ({ ...previous, [tenant.id]: draft }));
    setPending(null);
    setTenantId('');
    toast.success({
      message: 'PG 정보를 저장했습니다.',
      detail: `${tenant.name} · ${findPgProvider(draft.provider).label} · ${draft.live ? '실결제' : '테스트'}`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/*
        고객사 목록이 곧 이 화면이다. 가장 급한 물음이 **어느 고객사가 아직 테스트인가**인데,
        선택기 하나로는 고객사를 하나씩 골라 봐야 알 수 있었다.
      */}
      <IntegrationTenantList
        value={tenantId}
        onChange={setTenantId}
        description="줄을 누르면 그 고객사의 결제 대행사 설정을 창에서 넣습니다."
        columns={[
          { label: '배포 도메인', span: 'lg:col-span-3' },
          { label: '대행사', span: 'lg:col-span-2' },
          { label: '운영 모드', span: 'lg:col-span-2' },
        ]}
        render={(one) => {
          const draft = saved[one.id];

          return [
            <span key="domain" className="min-w-0 truncate font-mono text-xs text-ink-muted">
              {one.deployments.find((deployment) => deployment.kind === 'B2C Client')?.domain ?? '배포 없음'}
            </span>,
            <span key="provider" className="min-w-0 truncate text-sm">
              {draft ? findPgProvider(draft.provider).label : <span className="text-ink-faint">아직 없음</span>}
            </span>,
            /*
              실결제인지 테스트인지가 이 화면에서 가장 급한 값이다 — 오픈했는데 테스트로 남아
              있으면 결제창은 뜨는데 승인이 일어나지 않는다.
            */
            draft ? (
              <Badge key="mode" tone={draft.live ? 'ok' : 'wait'}>
                {draft.live ? '실결제' : '테스트'}
              </Badge>
            ) : (
              <Badge key="mode" tone="neutral">
                미설정
              </Badge>
            ),
          ];
        }}
      />

      <PaymentSettingsModal
        open={tenant !== undefined}
        tenant={tenant}
        onClose={() => setTenantId('')}
        onSubmit={setPending}
      />

      <InternalConfirmModal
        open={pending !== null}
        title="이 값으로 저장할까요"
        message={
          pending?.live
            ? '실결제로 저장합니다. 이 순간부터 고객의 카드에서 실제로 금액이 빠져나갑니다.'
            : '고객사의 결제창이 이 설정으로 돕니다. 키가 틀리면 결제가 통째로 실패합니다.'
        }
        detail={
          pending && tenant
            ? `${tenant.name} · ${findPgProvider(pending.provider).label} · ${pending.live ? '실결제' : '테스트'} · ${pending.methods.join(', ')}`
            : undefined
        }
        confirmLabel={pending?.live ? '실결제로 저장' : '저장'}
        tone={pending?.live ? 'danger' : 'primary'}
        onConfirm={() => pending && save(pending)}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
