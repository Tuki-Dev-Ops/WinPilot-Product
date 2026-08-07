'use client';

import { useState } from 'react';
import { Badge, HintInput, PageHeading, useToast } from '@winpilot/ui';
import { LOCALE_PAIRS, missingEnglish, type LocalePair } from '@winpilot/store';
import { IrConfirmModal } from '@/app/_components/IrConfirmModal';
import { IrModal } from '@/app/_components/IrModal';
import { IrField } from '@/app/_components/IrForm';
import { IrRecordTable } from '@/app/_components/IrRecordTable';

const COLUMNS = [
  { label: '자리', span: 'lg:col-span-3' },
  { label: '국문', span: 'lg:col-span-4' },
  { label: '영문', span: 'lg:col-span-3' },
  { label: '상태', span: 'lg:col-span-1 lg:text-center' },
];

/**
 * 국문 · 영문.
 *
 * ## 짝으로 관리한다
 * 영문만 빠진 자리가 생기면 해외 투자자에게는 **그 자리가 없는 것**과 같다. 한 줄에 두 언어를
 * 나란히 두면 무엇이 아직 안 됐는지가 목록에서 바로 보인다 — 언어마다 화면을 나누면 그
 * 비교를 사람이 눈으로 해야 한다.
 *
 * ## 국문을 지우지 못하게 한다
 * 국문이 비면 사이트의 그 자리가 통째로 사라진다. 영문은 없으면 원문(국문)으로 대신하지만,
 * 국문에는 대신할 것이 없다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function LocaleSettingsView() {
  const toast = useToast();
  const [rows, setRows] = useState<LocalePair[]>(LOCALE_PAIRS);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ ko: '', en: '' });
  const [submitted, setSubmitted] = useState(false);
  /** 저장을 누른 뒤 확인을 기다리는 중인가. */
  const [pending, setPending] = useState(false);

  const target = rows.find((one) => one.key === editing) ?? null;
  const koError = draft.ko.trim() ? undefined : '국문은 비울 수 없습니다. 비우면 사이트의 그 자리가 사라집니다.';

  const open = (pair: LocalePair) => {
    setEditing(pair.key);
    setDraft({ ko: pair.ko, en: pair.en });
    setSubmitted(false);
  };

  /**
   * 저장을 누르면 **바로 고치지 않고 한 번 더 묻는다.**
   *
   * 여기서 고치는 것은 사이트의 메뉴 이름이다 — 한 자리를 바꾸면 그 말이 화면 여러 곳에서
   * 동시에 바뀌고, 무엇이 바뀌었는지는 사이트를 열어 봐야 안다. 확인 창이 **어느 자리를 어떤
   * 말로** 바꾸는지 한 번 더 보여 주는 자리다.
   *
   * 틀린 값(국문 비어 있음)은 확인 창까지 가지 않는다 — 물어봐야 할 것이 없다.
   */
  const askSave = () => {
    setSubmitted(true);
    if (!target || koError) {
      toast.error({ message: '저장하지 못했습니다.', detail: koError });
      return;
    }
    setPending(true);
  };

  const save = () => {
    if (!target) return;

    setRows((previous) =>
      previous.map((one) => (one.key === target.key ? { ...one, ko: draft.ko.trim(), en: draft.en.trim() } : one)),
    );
    setPending(false);
    setEditing(null);
    toast.success({
      message: '문구를 저장했습니다.',
      detail: `${target.label} · ${draft.en.trim() ? '국문 · 영문' : '영문 아직 없음'}`,
    });
  };

  return (
    <>
      <PageHeading title="국문 · 영문" description="두 언어의 문구를 짝으로 관리하세요." />

      <IrRecordTable
        title="문구"
        description="한 줄이 한 자리입니다. 영문이 비면 사이트는 국문으로 대신 보여 줍니다."
        columns={COLUMNS}
        rows={rows.map((one) => ({ ...one, id: one.key }))}
        labelOf={(one) => one.label}
        onOpen={open}
        openLabel="수정"
        empty="등록된 문구가 없습니다."
        foot={
          <p className={missingEnglish(rows).length > 0 ? 'text-signal-danger' : ''}>
            영문이 빠진 자리 <span className="font-medium tabular-nums">{missingEnglish(rows).length}</span>개
          </p>
        }
        render={(one) => [
          <span key="key" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.label}</span>
            <span className="block min-w-0 truncate font-mono text-xs text-ink-faint">{one.key}</span>
          </span>,
          <span key="ko" className="min-w-0 truncate text-sm">
            {one.ko}
          </span>,
          <span key="en" className="min-w-0 truncate text-sm text-ink-muted">
            {one.en || <span className="text-ink-faint">아직 없음</span>}
          </span>,
          <Badge key="state" tone={one.en ? 'ok' : 'wait'}>
            {one.en ? '짝 맞음' : '영문 없음'}
          </Badge>,
        ]}
      />

      <IrModal
        open={target !== null}
        title={target ? `${target.label} 문구` : ''}
        description="영문을 비우면 사이트는 국문을 대신 보여 줍니다. 국문은 비울 수 없습니다."
        onClose={() => setEditing(null)}
        onSubmit={askSave}
        submitLabel="저장"
      >
        <IrField
          label="국문"
          htmlFor="locale-ko"
          required
          {...(submitted && koError ? { error: koError } : { hint: '사이트에 그대로 나가는 말입니다.' })}
        >
          <HintInput
            id="locale-ko"
            type="text"
            hint="예: 공시 정보"
            value={draft.ko}
            onChange={(event) => setDraft({ ...draft, ko: event.target.value })}
            invalid={submitted && Boolean(koError)}
          />
        </IrField>

        <IrField label="영문" htmlFor="locale-en" hint="비워 두면 국문으로 대신 보여 줍니다.">
          <HintInput
            id="locale-en"
            type="text"
            hint="예: Disclosures"
            value={draft.en}
            onChange={(event) => setDraft({ ...draft, en: event.target.value })}
          />
        </IrField>
      </IrModal>

      {/* 확인 창은 언제나 다른 창 위에서 열린다 — 그 층은 `IrConfirmModal` 이 스스로 갖는다. */}
      <IrConfirmModal
        open={pending}
        title="이 문구로 저장할까요"
        message="사이트의 이 자리 말이 바뀝니다. 같은 자리를 쓰는 화면이 여럿이면 전부 함께 바뀝니다."
        detail={target ? `${target.label} · ${draft.ko.trim()}${draft.en.trim() ? ` / ${draft.en.trim()}` : ' (영문 없음)'}` : ''}
        confirmLabel="저장"
        onConfirm={save}
        onCancel={() => setPending(false)}
      />
    </>
  );
}
