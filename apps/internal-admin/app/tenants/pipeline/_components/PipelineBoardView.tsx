'use client';

import { useMemo, useState } from 'react';
import { ALL_VALUE, Badge, Dropdown, HintInput, ListToolbar, PageHeading, useToast, type ListFilterField, type ListToolbarTab } from '@winpilot/ui';
import { InternalField } from '@/app/_components/InternalForm';
import { InternalDetailModal } from '@/app/_components/InternalDetailModal';
import { InternalModal } from '@/app/_components/InternalModal';
import { DEALS, formatDealAmount, nextStage, PIPELINE_STAGES, previousStage, STAGE_MEANING, STAGE_TONE, type PipelineDeal, type PipelineStage } from '@/lib/data/pipeline';
import { STAFF } from '@/lib/data/settings';
import { TENANT_PLANS, todayStamp } from '@/lib/data/tenants';
import {
  DIGITS,
  POSITIVE,
  errorSummary,
  hasErrors,
  maxLength,
  validate,
  type FormErrors,
  type FormSpec,
} from '@/lib/validation/form';

const EMPTY_DRAFT = {
  name: '',
  plan: TENANT_PLANS[0] as string,
  amount: '',
  owner: STAFF[0]?.name ?? '',
  lastTouch: '',
};

type DealField = 'name' | 'amount' | 'lastTouch';

const DEAL_FORM: FormSpec<DealField> = {
  name: { label: '이름', required: true, hint: '아직 고객사가 아니어도 됩니다.', rules: [maxLength(40)] },
  amount: {
    label: '예상 금액',
    required: true,
    hint: '원 단위로 적습니다. 나중에 계약 금액으로 바뀝니다.',
    rules: [DIGITS, POSITIVE],
  },
  lastTouch: { label: '유입 경로', hint: '비우면 등록됨 으로 적습니다.', rules: [maxLength(60)] },
};

const MOVE_BUTTON = 'h-8 shrink-0 whitespace-nowrap rounded-lg border px-2.5 text-xs transition-colors duration-150';

/**
 * 도입 파이프라인 — 단계별 세로 칸.
 *
 * **끌어 옮기기를 만들지 않는다.** 끌기는 되돌리기가 없으면 실수했을 때 되돌릴 길이 없고,
 * 되돌리기를 붙이면 이 화면 하나 때문에 실행 취소라는 개념이 생긴다. 단계 바꾸기는 카드의
 * 단추로 하고, 앞으로 가는 길과 되돌아오는 길을 함께 둔다.
 *
 * `운영` 칸이 곧 고객 목록이다 — 그래서 그 칸의 카드에는 고객사 코드가 붙고, 눌러서 상세로
 * 들어간다. 두 화면이 같은 자료를 다르게 보는 것이지 다른 자료를 보는 것이 아니다.
 *
 * **프론트엔드 전용** — 단계 변경은 이 화면에만 반영된다.
 */
export function PipelineBoardView() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [deals, setDeals] = useState<PipelineDeal[]>(DEALS);
  const [creating, setCreating] = useState(false);
  /** 카드를 눌러 연 건. 카드에 싣지 못한 메모를 읽는 자리다 */
  const [opened, setOpened] = useState<string | null>(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const owners = useMemo(() => [...new Set(DEALS.map((deal) => deal.owner))], []);

  const filters: ListFilterField[] = [
    { id: 'owner', label: '담당자', options: owners.map((name) => ({ value: name, label: name })) },
  ];

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const owner = filterValues.owner ?? ALL_VALUE;
    return deals.filter((deal) => {
      if (owner !== ALL_VALUE && deal.owner !== owner) return false;
      if (!keyword) return true;
      return (
        deal.name.toLowerCase().includes(keyword) ||
        deal.id.toLowerCase().includes(keyword) ||
        deal.plan.toLowerCase().includes(keyword)
      );
    });
  }, [deals, search, filterValues]);

  const running = visible.filter((deal) => deal.stage === '운영');
  const pending = visible.filter((deal) => deal.stage !== '운영');
  const expected = pending.reduce((sum, deal) => sum + deal.amount, 0);

  const move = (deal: PipelineDeal, to: PipelineStage | undefined) => {
    if (!to) return;
    setDeals((previous) => previous.map((item) => (item.id === deal.id ? { ...item, stage: to } : item)));
    toast.info({ message: `${deal.name} 을(를) ${to} 단계로 옮겼습니다.`, detail: `${deal.stage} → ${to}` });
  };

  const opening = deals.find((deal) => deal.id === opened) ?? null;

  const [errors, setErrors] = useState<FormErrors<DealField>>({});
  const [submitted, setSubmitted] = useState(false);

  const commit = (next: typeof draft) => {
    setDraft(next);
    if (submitted) setErrors(validate(DEAL_FORM, next));
  };

  const create = () => {
    setSubmitted(true);
    const found = validate(DEAL_FORM, draft);
    setErrors(found);
    if (hasErrors(found)) {
      toast.error({ message: '등록하지 못했습니다.', detail: errorSummary(found) });
      return;
    }

    // 새 건은 언제나 `문의` 에서 시작한다 — 중간부터 넣으면 어디서 들어왔는지가 남지 않는다.
    const record: PipelineDeal = {
      id: `D-${306 + deals.length}`,
      name: draft.name.trim(),
      stage: '문의',
      plan: draft.plan,
      amount: Number(draft.amount),
      owner: draft.owner,
      enteredAt: todayStamp(),
      lastTouch: draft.lastTouch.trim() || '등록됨',
      memo: '',
    };

    setDeals((previous) => [...previous, record]);
    setDraft(EMPTY_DRAFT);
    setCreating(false);
    toast.success({ message: '파이프라인에 건을 등록했습니다.', detail: `${record.name} · 문의 단계` });
  };

  return (
    <>
      <PageHeading title="파이프라인" description="도입 단계별로 진행 현황을 확인하세요." />

      {/*
        상태 탭을 두지 않는다. 단계는 이미 **칸으로 서 있어서** 탭으로 또 가르면 같은 것이 두
        벌이 되고, 탭을 고르는 순간 칸 하나만 남아 이 화면을 보는 이유(단계 사이의 흐름)가 사라진다.
        그래서 윗줄에는 등록 단추만 선다.
      */}
      <ListToolbar
        searchId="pipeline-search"
        searchLabel="파이프라인 검색"
        searchHint="이름, 건 번호, 플랜으로 검색"
        searchValue={search}
        onSearchChange={setSearch}
        actionLabel="파이프라인 건 등록"
        onAction={() => setCreating(true)}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(id, value) => setFilterValues((previous) => ({ ...previous, [id]: value }))}
        onFilterReset={() => setFilterValues({})}
      />

      {/*
        칸을 가로로 늘어놓고 좁은 화면에서는 그 줄만 가로로 스크롤한다 — 페이지 전체가 밀리지
        않게. 칸을 세로로 쌓지 않는 이유는 단계 사이의 흐름이 왼쪽에서 오른쪽으로 읽히기 때문이다.
      */}
      <div className="-mx-6 min-w-0 overflow-x-auto px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-max gap-4">
          {PIPELINE_STAGES.map((stage) => {
            const column = visible.filter((deal) => deal.stage === stage);
            const sum = column.reduce((total, deal) => total + deal.amount, 0);

            return (
              <section key={stage} className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-canvas">
                <div className="flex flex-col gap-1 border-b border-border px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone={STAGE_TONE[stage]}>
                      {stage}
                    </Badge>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-ink-faint">{column.length}건</span>
                  </div>
                  <p className="text-xs leading-relaxed text-ink-faint">{STAGE_MEANING[stage]}</p>
                  <p className="font-mono text-xs tabular-nums text-ink-muted">{formatDealAmount(sum)}원</p>
                </div>

                <div className="flex flex-col gap-3 px-4 py-4">
                  {column.length === 0 ? (
                    // 빈 칸을 지우지 않는다 — 사라진 칸은 단계가 없어진 것으로 읽힌다.
                    <p className="py-6 text-center text-xs text-ink-faint">이 단계에 있는 건이 없습니다.</p>
                  ) : (
                    column.map((deal) => (
                      /*
                        카드를 누르면 **읽기 창**이 열린다. 카드에 싣지 못한 것이 메모인데,
                        그것이 "지금 이 건이 왜 여기 멈춰 있는가" 를 답하는 값이다. 카드에 넣으면
                        건마다 높이가 달라져 단계별로 몇 건인지가 한눈에 안 읽힌다.
                      */
                      <article
                        key={deal.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setOpened(deal.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setOpened(deal.id);
                          }
                        }}
                        className="group flex cursor-pointer flex-col gap-2 rounded-lg border border-border px-3 py-3 text-left transition-colors duration-150 hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            {deal.tenantId ? (
                              <a
                                href={`/tenants/${deal.tenantId}`}
                                onClick={(event) => event.stopPropagation()}
                                className="min-w-0 truncate text-sm font-medium text-brand-700 underline underline-offset-2 dark:text-brand-300"
                              >
                                {deal.name}
                              </a>
                            ) : (
                              <p className="min-w-0 truncate text-sm font-medium">{deal.name}</p>
                            )}
                            <p className="min-w-0 truncate font-mono text-xs text-ink-faint">
                              {deal.tenantId ?? deal.id} · {deal.owner}
                            </p>
                          </div>
                          <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 text-3xs text-ink-muted">
                            {deal.plan}
                          </span>
                        </div>

                        <p className="text-sm tabular-nums">{formatDealAmount(deal.amount)}원</p>
                        <p className="text-xs leading-relaxed text-ink-muted">{deal.lastTouch}</p>
                        <p className="font-mono text-xs tabular-nums text-ink-faint">{deal.enteredAt} 진입</p>

                        {/*
                          앞으로 가는 길과 되돌아오는 길을 함께 둔다. 되돌릴 수 없는 이동은
                          실수했을 때 손댈 곳이 없다.
                        */}
                        <div className="flex flex-wrap gap-2 pt-1" onClick={(event) => event.stopPropagation()}>
                          <button
                            type="button"
                            disabled={!previousStage(deal.stage)}
                            onClick={() => move(deal, previousStage(deal.stage))}
                            className={`${MOVE_BUTTON} border-border-strong text-ink-muted hover:border-ink-faint disabled:opacity-40`}
                          >
                            ← {previousStage(deal.stage) ?? '처음'}
                          </button>
                          <button
                            type="button"
                            disabled={!nextStage(deal.stage)}
                            onClick={() => move(deal, nextStage(deal.stage))}
                            className={`${MOVE_BUTTON} border-brand-500 font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-40 dark:text-brand-300`}
                          >
                            {nextStage(deal.stage) ?? '마지막'} →
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>


      <InternalModal
        open={creating}
        title="파이프라인 건 등록"
        description="새 건은 언제나 문의 단계에서 시작합니다. 중간부터 넣으면 어디서 들어왔는지가 남지 않습니다."
        onClose={() => setCreating(false)}
        onSubmit={create}
        submitLabel="등록"
      >
        <InternalField
          label={DEAL_FORM.name.label}
          htmlFor="deal-new-name"
          required={DEAL_FORM.name.required}
          {...(errors.name ? { error: errors.name } : { hint: DEAL_FORM.name.hint })}
        >
          <HintInput
            id="deal-new-name"
            type="text"
            hint="예: 리프레시랩"
            value={draft.name}
            onChange={(event) => commit({ ...draft, name: event.target.value })}
            invalid={!draft.name.trim()}
          />
        </InternalField>

        <InternalField label="제안 플랜">
          <Dropdown
            id="deal-new-plan"
            label="플랜 선택"
            options={TENANT_PLANS.map((item) => ({ value: item, label: item }))}
            value={draft.plan}
            onChange={(next) => commit({ ...draft, plan: next })}
          />
        </InternalField>

        <InternalField
          label={DEAL_FORM.amount.label}
          htmlFor="deal-new-amount"
          required={DEAL_FORM.amount.required}
          {...(errors.amount ? { error: errors.amount } : { hint: DEAL_FORM.amount.hint })}
        >
          <HintInput
            id="deal-new-amount"
            type="text"
            hint="원 단위 숫자만"
            value={draft.amount}
            onChange={(event) =>
              commit({ ...draft, amount: event.target.value.replace(/[^0-9]/g, '') })
            }
            invalid={!draft.amount}
          />
        </InternalField>

        <InternalField label="담당자">
          <Dropdown
            id="deal-new-owner"
            label="담당자 선택"
            options={STAFF.map((staff) => ({ value: staff.name, label: staff.name, hint: staff.team }))}
            value={draft.owner}
            onChange={(next) => commit({ ...draft, owner: next })}
          />
        </InternalField>

        <InternalField
          label="유입 경로"
          htmlFor="deal-new-touch"
          hint="비우면 등록됨으로 적습니다. 나중에 활동에서 자세히 남깁니다."
        >
          <HintInput
            id="deal-new-touch"
            type="text"
            hint="예: 홈페이지 문의 폼으로 들어옴"
            value={draft.lastTouch}
            onChange={(event) => commit({ ...draft, lastTouch: event.target.value })}
          />
        </InternalField>
      </InternalModal>

      <InternalDetailModal
        open={opening !== null}
        title={opening?.name ?? ''}
        description={`${opening?.stage ?? ''} 단계 · ${opening?.tenantId ?? opening?.id ?? ''}`}
        rows={
          opening
            ? [
                { label: '단계', value: `${opening.stage} — ${STAGE_MEANING[opening.stage]}` },
                { label: '플랜', value: opening.plan },
                {
                  label: '예상 금액',
                  value: <span className="tabular-nums">{formatDealAmount(opening.amount)}원</span>,
                },
                { label: '담당', value: opening.owner },
                {
                  label: '진입일',
                  value: <span className="font-mono text-xs tabular-nums">{opening.enteredAt}</span>,
                },
                { label: '마지막 접촉', value: opening.lastTouch },
                { label: '메모', value: opening.memo || <span className="text-ink-faint">없음</span> },
              ]
            : []
        }
        note="단계를 옮기는 것은 카드의 화살표로 합니다 — 되돌아오는 길이 함께 있어야 실수를 고칠 수 있습니다."
        onClose={() => setOpened(null)}
      />
    </>
  );
}
