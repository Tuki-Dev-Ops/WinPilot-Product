'use client';

import { useState } from 'react';
import { SITE_NOTICE_GROUPS, type SiteNotice } from '@winpilot/store';
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

const LIST = '/contents/notices';

/**
 * 공지사항 등록 · 수정.
 *
 * ## 본문을 한 칸에 받고 빈 줄로 문단을 나눈다
 * 값은 문단 배열(`body: string[]`)인데 입력은 글상자 하나다. 문단마다 칸을 두면 **문단을
 * 옮기고 지우는 단추**가 따라붙어야 하고, 서너 문단짜리 공지에 그만한 장치는 과하다. 빈 줄로
 * 나누는 규칙은 메일을 쓰는 것과 같아 따로 배울 것이 없다.
 *
 * ## 고정을 켤 때 무슨 일이 생기는지 적어 둔다
 * 고정은 눌러 보면 아무 일도 일어나지 않는 칸이다 — 결과는 **사이트 목록의 차례**에서만
 * 드러난다. 그래서 끄고 켜는 자리 옆에 그 사실을 적는다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function NoticeForm({
  mode,
  code,
  initial,
}: {
  mode: FormMode;
  code: string;
  initial?: SiteNotice;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [group, setGroup] = useState<string>(initial?.group ?? SITE_NOTICE_GROUPS[0]);
  const [body, setBody] = useState(initial?.body.join('\n\n') ?? '');
  const [postedAt, setPostedAt] = useState(initial?.postedAt ?? '');
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  const [visible, setVisible] = useState(initial?.visible ?? true);
  const [tried, setTried] = useState(false);

  const broken = [
    ...(title.trim() ? [] : ['제목']),
    ...(body.trim() ? [] : ['본문']),
    ...(postedAt ? [] : ['올린 날']),
  ];

  return (
    <IrRecordForm
      mode={mode}
      resource="공지사항"
      listHref={LIST}
      detail={`${code} · ${title.trim() || '(제목 없음)'}`}
      validate={() => {
        setTried(true);
        return broken;
      }}
    >
      <IrPanel title="기본 정보" description="사이트 공지사항 목록에 이대로 섭니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <IrReadonly label="공지 코드" value={code} note={mode === 'create' ? '자동 생성' : '수정 불가'} />

            <IrField label="갈래" htmlFor="notice-group" required hint="사이트 왼쪽 줄에서 고르는 이름입니다.">
              <IrSelect id="notice-group" value={group} onChange={setGroup} options={SITE_NOTICE_GROUPS} />
            </IrField>
          </div>

          <IrField
            label="제목"
            htmlFor="notice-title"
            required
            {...(tried && !title.trim() ? { error: '제목을 입력해 주세요.' } : {})}
          >
            <IrTextInput
              id="notice-title"
              value={title}
              onChange={setTitle}
              placeholder="예: 2026년 하계 휴무 안내"
              invalid={tried && !title.trim()}
            />
          </IrField>

          <IrField
            label="올린 날"
            htmlFor="notice-posted"
            required
            {...(tried && !postedAt ? { error: '올린 날을 골라 주세요.' } : { hint: '목록의 차례를 정하는 값입니다.' })}
          >
            <IrTextInput
              id="notice-posted"
              type="date"
              value={postedAt}
              onChange={setPostedAt}
              invalid={tried && !postedAt}
            />
          </IrField>
        </div>
      </IrPanel>

      <IrPanel title="본문" description="빈 줄로 문단을 나눕니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <IrField
            label="내용"
            htmlFor="notice-body"
            required
            {...(tried && !body.trim()
              ? { error: '내용을 입력해 주세요.' }
              : { hint: '한 줄 띄우면 사이트에서 문단이 나뉩니다.' })}
          >
            <IrTextArea
              id="notice-body"
              rows={12}
              value={body}
              onChange={setBody}
              placeholder={'2026년 8월 10일(월)부터 8월 14일(금)까지 하계 휴무입니다.\n\n휴무 기간에도 장애 접수는 평소와 같이 받습니다.'}
              invalid={tried && !body.trim()}
            />
          </IrField>

          <p className="text-xs text-ink-faint">
            문단 {body.split(/\n\s*\n/).filter((one) => one.trim()).length}개 ·{' '}
            {body.trim().length}자
          </p>
        </div>
      </IrPanel>

      <IrPanel title="노출" description="사이트에 어떻게 서는지를 정합니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <IrToggle
            id="notice-pinned"
            label="맨 위에 고정"
            description="날짜와 상관없이 목록 맨 위에 섭니다. 셋을 넘기면 고정의 뜻이 없어집니다."
            checked={pinned}
            onChange={setPinned}
          />
          <IrToggle
            id="notice-visible"
            label="사이트에 노출"
            description="끄면 사이트에서 사라집니다. 목록에는 남아 있어 다시 켤 수 있습니다."
            checked={visible}
            onChange={setVisible}
          />
        </div>
      </IrPanel>
    </IrRecordForm>
  );
}
