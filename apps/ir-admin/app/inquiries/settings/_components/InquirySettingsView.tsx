'use client';

import { useState } from 'react';
import { Check, Minus } from 'lucide-react';
import { Badge, PageHeading, useToast } from '@winpilot/ui';
import { IR_COMPANY, SITE_INQUIRY_KINDS, SITE_REGIONS } from '@winpilot/store';
import { IrConfirmModal } from '@/app/_components/IrConfirmModal';
import { IrField, IrPrimaryButton, IrSaveRow } from '@/app/_components/IrForm';
import { IrPanel } from '@/app/_components/IrPanel';
import { IrTextArea, IrTextInput } from '@/app/_components/IrRecordForm';

/**
 * 사이트 양식이 묻는 칸.
 *
 * `why` 를 함께 적는다. 이 화면에 오는 사람이 실제로 묻는 것은 "무슨 칸이 있나" 가 아니라
 * **"이 칸이 왜 필수인가"** 이고, 그 답이 없으면 다음에 오는 사람이 아무렇지 않게 끈다.
 */
const FIELDS = [
  { id: 'company', label: '회사명', required: true, why: '기존 상담 이력을 회사 이름으로 찾습니다.' },
  { id: 'region', label: '지역', required: true, why: `시 · 도 ${SITE_REGIONS.length}곳. 첫 방문 일정이 여기서 갈립니다.` },
  { id: 'name', label: '담당자명', required: true, why: '답장에 이름을 부르기 위해서입니다.' },
  { id: 'phone', label: '휴대폰 번호', required: true, why: '메일이 스팸함으로 가면 문의가 그대로 유실됩니다.' },
  { id: 'email', label: '이메일', required: true, why: '답변이 나가는 곳입니다.' },
  { id: 'message', label: '문의 내용', required: true, why: '10자 이상만 받습니다 — 한 줄짜리는 되묻는 문의가 됩니다.' },
  { id: 'attachment', label: '첨부파일', required: false, why: '20MB 까지. 도면과 설비 목록이 주로 옵니다.' },
] as const;

/**
 * 문의 > 설정.
 *
 * ## 세 묶음으로 나눈다
 * **받는 곳** · **양식이 묻는 것** · **답장에 붙는 안내**. 한 카드에 다 넣으면 저장 단추가
 * 하나뿐이라 무엇이 저장되는지 흐려지고, 칸을 하나 더할 때마다 카드가 길어져 아래쪽은
 * 스크롤 밖으로 나간다. 카드마다 자기 저장 단추가 서면 **무엇을 고쳤는지가 자리로 드러난다.**
 *
 * ## 칸을 끄고 켜지 못하게 둔다
 * 목록만 보여 준다. 필수 칸을 끄면 **이미 그 값을 전제로 만든 답변 절차**가 어긋나기 때문이다 —
 * 회사명 없이 들어온 문의는 기존 상담 이력과 이어지지 않고, 지역 없이 들어온 문의는 어느 담당
 * 구역에도 들지 않는다. 게다가 수집 항목은 **개인정보 처리방침에 적힌 것과 같아야 한다.** 여기서
 * 한 칸 끄는 일은 그 글도 함께 고치는 일이라, 두 자리를 한 번에 손볼 수 있을 때 코드에서 한다.
 *
 * 그래서 칸마다 **왜 필수인지**를 적어 둔다. 끄는 자리를 없애는 것만으로는 부족하다 — 다음에
 * 오는 사람은 이유를 모르면 끄는 방법을 찾아 나선다.
 *
 * **프론트엔드 전용** — 저장은 이 화면에만 반영된다.
 */
export function InquirySettingsView() {
  const toast = useToast();
  const [inbox, setInbox] = useState(IR_COMPANY.irEmail);
  const [reply, setReply] = useState('문의 주신 내용은 영업일 기준 1~2일 안에 답변드립니다.');
  const [asking, setAsking] = useState<'inbox' | 'reply' | null>(null);

  const badInbox = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inbox.trim());

  return (
    <>
      <PageHeading title="문의 설정" description="양식이 무엇을 묻고, 어디로 보내고, 무엇을 안내할지 정합니다." />

      <IrPanel title="받는 곳" description="사이트에서 보낸 문의가 이 주소로 갑니다.">
        <div className="flex flex-col gap-5 px-6 py-6">
          <IrField
            label="대표 수신 메일"
            htmlFor="inquiry-inbox"
            required
            {...(badInbox
              ? { error: '메일 주소 형식으로 적어 주세요.' }
              : { hint: '갈래별 담당자는 이 주소에서 다시 나눕니다.' })}
          >
            <IrTextInput id="inquiry-inbox" value={inbox} onChange={setInbox} invalid={badInbox} />
          </IrField>

          {/* 갈래를 여기 함께 보여 준다 — 받는 주소를 정하는 사람이 무엇이 들어오는지 알아야 한다. */}
          <div className="flex flex-col gap-2.5">
            <p className="text-xs text-ink-faint">이 주소로 들어오는 갈래</p>
            <ul className="flex flex-wrap gap-2">
              {SITE_INQUIRY_KINDS.map((one) => (
                <li key={one} className="rounded-lg bg-surface px-3 py-1.5 text-xs text-ink-muted">
                  {one}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <IrSaveRow>
          <IrPrimaryButton
            type="button"
            onClick={() => {
              if (badInbox) {
                toast.error({ message: '저장하지 못했습니다.', detail: '메일 주소 형식이 아닙니다.' });
                return;
              }
              setAsking('inbox');
            }}
          >
            받는 곳 저장
          </IrPrimaryButton>
        </IrSaveRow>
      </IrPanel>

      <IrPanel
        title="양식이 묻는 것"
        description="사이트 문의 양식에 이 차례로 섭니다."
        aside={<Badge tone="neutral">필수 {FIELDS.filter((one) => one.required).length} · 선택 1</Badge>}
      >
        <ul className="flex flex-col">
          {FIELDS.map((one, index) => (
            <li
              key={one.id}
              className="flex flex-wrap items-start gap-x-4 gap-y-2 border-b border-border px-6 py-4 last:border-b-0"
            >
              <span className="w-6 shrink-0 pt-0.5 font-mono text-xs tabular-nums text-ink-faint">
                {String(index + 1).padStart(2, '0')}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{one.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-muted">{one.why}</span>
                <span className="mt-1 block font-mono text-xs text-ink-faint">{one.id}</span>
              </span>

              {/*
                필수 여부를 배지가 아니라 아이콘 + 글자로 적는다. 배지를 일곱 줄 세우면 목록이
                배지 줄로 보이고, 정작 하나만 다른 `선택` 이 묻힌다.
              */}
              <span
                className={`flex shrink-0 items-center gap-1.5 pt-0.5 text-xs ${
                  one.required ? 'text-ink' : 'text-ink-faint'
                }`}
              >
                {one.required ? (
                  <Check aria-hidden className="size-3.5" strokeWidth={2.4} />
                ) : (
                  <Minus aria-hidden className="size-3.5" strokeWidth={2.4} />
                )}
                {one.required ? '필수' : '선택'}
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-border bg-surface px-6 py-4">
          <p className="text-xs leading-relaxed text-ink-muted">
            칸을 켜고 끄는 자리는 두지 않습니다. 필수 칸을 끄면 이미 그 값을 전제로 만든 답변 절차가
            어긋나고, 수집 항목은{' '}
            <a href="/settings/privacy" className="font-medium text-brand-700 underline dark:text-brand-300">
              개인정보 처리방침
            </a>
            에 적힌 것과 같아야 합니다 — 한 칸 끄는 일은 그 글도 함께 고치는 일입니다.
          </p>
        </div>
      </IrPanel>

      <IrPanel title="접수 안내" description="문의를 보낸 직후 화면과 자동 회신에 그대로 적힙니다.">
        <div className="flex flex-col gap-5 px-6 py-6">
          <IrField
            label="안내 문구"
            htmlFor="inquiry-reply"
            hint="언제까지 답하는지를 반드시 적으세요 — 기다리는 사람이 다시 문의를 넣는 이유가 그것입니다."
          >
            <IrTextArea id="inquiry-reply" rows={4} value={reply} onChange={setReply} />
          </IrField>

          <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-surface px-4 py-3.5">
            <span className="text-xs text-ink-faint">보낸 사람이 보는 화면</span>
            <span className="text-sm leading-relaxed text-ink">
              {reply.trim() || '문구가 비어 있습니다.'}
            </span>
          </div>
        </div>

        <IrSaveRow>
          <IrPrimaryButton type="button" onClick={() => setAsking('reply')}>
            안내 문구 저장
          </IrPrimaryButton>
        </IrSaveRow>
      </IrPanel>

      <IrConfirmModal
        open={asking === 'inbox'}
        title="이 주소로 저장할까요"
        message="사이트에서 보낸 문의가 이 주소로 갑니다. 주소가 틀리면 보낸 쪽에는 보냈다는 화면이 뜨고, 받는 쪽에는 아무것도 오지 않습니다."
        detail={inbox}
        confirmLabel="저장"
        onConfirm={() => {
          setAsking(null);
          toast.success({ message: '수신 주소를 저장했습니다.', detail: inbox });
        }}
        onCancel={() => setAsking(null)}
      />

      <IrConfirmModal
        open={asking === 'reply'}
        title="안내 문구를 저장할까요"
        message="문의를 보낸 사람이 바로 보게 됩니다. 적어 둔 기한은 지켜져야 합니다."
        detail={reply.trim()}
        confirmLabel="저장"
        onConfirm={() => {
          setAsking(null);
          toast.success({ message: '안내 문구를 저장했습니다.' });
        }}
        onCancel={() => setAsking(null)}
      />
    </>
  );
}
