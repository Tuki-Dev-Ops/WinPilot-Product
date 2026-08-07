'use client';

import { useState } from 'react';
import type { MilestoneRecord } from '@winpilot/store';
import { IrField } from '@/app/_components/IrForm';
import { IrPanel } from '@/app/_components/IrPanel';
import {
  IrReadonly,
  IrRecordForm,
  IrSelect,
  IrTextArea,
  IrTextInput,
  IrToggle,
  type FormMode,
} from '@/app/_components/IrRecordForm';

const LIST = '/company/history';

/** 월은 고르는 값이다. 비워 두면 그 해의 일로만 선다 — 언제인지 기억나지 않는 옛일이 그렇다. */
const MONTHS = ['', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'] as const;

/**
 * 연혁 등록 · 수정.
 *
 * ## 월을 비울 수 있게 둔다
 * 창립 초기의 일은 **몇 월인지 아무도 기억하지 못한다.** 필수로 두면 그때 하는 일은 둘 중
 * 하나다 — 대충 `01` 로 적거나, 아예 안 적거나. 둘 다 연혁을 못 쓰게 만든다.
 *
 * ## 설명을 선택으로 둔다
 * 연혁 한 줄은 제목만으로 충분한 것이 많다(`법인 설립`). 설명을 필수로 두면 없는 말을 지어
 * 채우게 되고, 그런 줄이 섞이면 연혁 전체가 부풀려 읽힌다.
 *
 * ## B2C 어드민과 같은 값이다
 * 한 회사의 연혁이 두 벌이 되면 안 되므로 `@winpilot/store` 의 `MILESTONES` 를 함께 쓴다.
 * 여기서 고친 것은 쇼핑몰의 회사 소개에도 그대로 나간다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function MilestoneForm({
  mode,
  code,
  initial,
}: {
  mode: FormMode;
  code: string;
  initial?: MilestoneRecord;
}) {
  const [year, setYear] = useState(initial?.year ?? '');
  const [month, setMonth] = useState(initial?.month ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [visible, setVisible] = useState(initial?.visible ?? true);
  const [tried, setTried] = useState(false);

  const badYear = !/^\d{4}$/.test(year.trim());
  const broken = [...(badYear ? ['연도'] : []), ...(title.trim() ? [] : ['제목'])];

  return (
    <IrRecordForm
      mode={mode}
      resource="연혁"
      listHref={LIST}
      detail={`${year || '연도 없음'}${month ? `.${month}` : ''} · ${title.trim() || '(제목 없음)'}`}
      validate={() => {
        setTried(true);
        return broken;
      }}
    >
      <IrPanel title="때" description="사이트 연혁은 최신순으로 섭니다.">
        <div className="grid grid-cols-1 gap-5 px-6 py-5">
          <IrReadonly label="코드" value={code} note={mode === 'create' ? '자동 생성' : '수정 불가'} />

          <IrField
            label="연도"
            htmlFor="ms-year"
            required
            {...(tried && badYear ? { error: '네 자리 연도로 적어 주세요.' } : {})}
          >
            <IrTextInput id="ms-year" value={year} onChange={setYear} placeholder="2026" invalid={tried && badYear} />
          </IrField>

          <IrField label="월" htmlFor="ms-month" hint="기억나지 않으면 비워 두세요 — 그 해의 일로 섭니다.">
            <IrSelect id="ms-month" value={month} onChange={setMonth} options={MONTHS} />
          </IrField>
        </div>
      </IrPanel>

      <IrPanel title="한 일" description="제목만으로 뜻이 통하면 설명은 비워 두세요.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <IrField
            label="제목"
            htmlFor="ms-title"
            required
            {...(tried && !title.trim() ? { error: '제목을 입력해 주세요.' } : {})}
          >
            <IrTextInput
              id="ms-title"
              value={title}
              onChange={setTitle}
              placeholder="예: 스마트공장 구축 100호 달성"
              invalid={tried && !title.trim()}
            />
          </IrField>

          <IrField
            label="설명"
            htmlFor="ms-desc"
            hint="없는 말을 지어 채우지 마세요. 부풀려 읽히는 연혁은 신뢰를 깎습니다."
          >
            <IrTextArea id="ms-desc" rows={4} value={description} onChange={setDescription} />
          </IrField>

          <IrToggle
            id="ms-visible"
            label="사이트에 노출"
            description="끄면 사이트 연혁에서 사라집니다. 이 목록에는 남아 있어 다시 켤 수 있습니다."
            checked={visible}
            onChange={setVisible}
          />
        </div>
      </IrPanel>
    </IrRecordForm>
  );
}
