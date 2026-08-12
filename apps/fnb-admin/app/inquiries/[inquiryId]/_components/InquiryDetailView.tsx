'use client';

import { useState } from 'react';
import { Badge, Button, Panel, SaveRow, useToast } from '@winpilot/ui';
import type { FranchiseInquiry } from '@winpilot/store';
import { FnbField, FnbSelect, FnbTextArea } from '@/app/_components/FnbForm';

/*
  상태 목록과 톤 표는 **목록 화면이 갖는다.** 한때 두 화면이 각자 적어 두었는데, 상태가 하나
  늘면 두 곳을 고쳐야 하고 한쪽만 고치면 `TONE[state]` 가 `undefined` 를 뱉는다 — 그것도
  화면에서는 색만 빠진 배지로 보여 알아차리기 어렵다.
*/
import { INQUIRY_STATES, INQUIRY_TONE } from '@/app/inquiries/_components/InquiryListView';

/**
 * 창업 문의 상세 — **읽는 칸과 쓰는 칸이 갈려 있다.**
 *
 * ## 신청자가 남긴 것은 못 고친다
 * 성함 · 연락처 · 지역 · 예산 · 하고 싶은 말은 **밖에서 들어온 기록**이다. 고칠 수 있게 두면
 * 통화 중에 들은 것을 여기에 덮어쓰게 되고, 그 순간 원본이 사라진다 — 나중에 "그렇게 말한 적
 * 없다" 는 말이 나왔을 때 댈 것이 없어진다.
 *
 * 통화에서 알게 된 것은 **상담 메모**에 쌓는다. 그 칸이 따로 있어야 원본과 우리가 적은 것이
 * 갈린다.
 *
 * ## 상태와 메모가 한 카드에 있다
 * 상태를 바꾸는 일은 대개 메모를 적은 직후에 일어난다(통화했다 → 상담중). 카드를 나누면
 * 저장을 두 번 눌러야 하고, 그러다 한쪽만 저장한 채 화면을 떠난다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function InquiryDetailView({ inquiry }: { inquiry: FranchiseInquiry }) {
  const toast = useToast();
  const [state, setState] = useState<string>(inquiry.state);
  const [memo, setMemo] = useState('');

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="신청자가 남긴 것"
        description="밖에서 들어온 기록이라 고칠 수 없습니다."
        aside={<Badge tone={INQUIRY_TONE[inquiry.state]}>{inquiry.state}</Badge>}
      >
        <dl className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
          <Fact label="접수번호" value={inquiry.id} mono />
          <Fact label="받은 날" value={inquiry.receivedOn} mono />
          <Fact label="성함" value={inquiry.name} />
          <Fact label="연락처" value={inquiry.phone} mono />
          <Fact label="보고 계신 지역" value={inquiry.region} />
          <Fact label="예산" value={inquiry.budget} />
        </dl>

        <div className="flex flex-col gap-2 border-t border-border px-6 py-5">
          <p className="text-xs uppercase tracking-widest text-ink-faint">하고 싶은 말</p>
          <p className="text-sm leading-loose text-ink-muted">
            {inquiry.message.trim() ? inquiry.message : '남긴 말이 없습니다.'}
          </p>
        </div>
      </Panel>

      <Panel title="상담 기록" description="통화에서 알게 된 것은 여기에 쌓습니다. 위의 원본은 그대로 둡니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <FnbField
            label="상태"
            htmlFor="inquiry-state"
            hint="사이트에는 나가지 않습니다. 대시보드가 이 값으로 밀린 건을 셉니다."
          >
            <FnbSelect id="inquiry-state" value={state} onChange={setState} options={INQUIRY_STATES} />
          </FnbField>

          <FnbField
            label="상담 메모"
            htmlFor="inquiry-memo"
            hint="다음에 이 건을 여는 사람이 읽습니다 — 무엇을 약속했는지까지 적어 주세요."
          >
            <FnbTextArea
              id="inquiry-memo"
              rows={5}
              value={memo}
              onChange={setMemo}
              placeholder="예: 8/8 통화. 동탄 자리 도면 받기로 함. 다음 주 화요일 현장 방문 예정."
            />
          </FnbField>
        </div>

        <SaveRow>
          <Button
            type="button"
            onClick={() =>
              toast.success({
                message: '상담 기록을 저장했습니다.',
                detail: `${inquiry.name} (${inquiry.id}) · ${state}`,
              })
            }
          >
            저장
          </Button>
        </SaveRow>
      </Panel>
    </div>
  );
}

/** 고칠 수 없는 값 한 칸. */
function Fact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1 bg-canvas px-6 py-4">
      <dt className="text-xs uppercase tracking-widest text-ink-faint">{label}</dt>
      <dd className={`text-sm ${mono ? 'font-mono tabular-nums' : 'font-medium'}`}>{value}</dd>
    </div>
  );
}
