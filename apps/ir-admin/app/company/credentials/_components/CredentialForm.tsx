'use client';

import { useState } from 'react';
import type { Credential } from '@winpilot/store';
import { IrField } from '@/app/_components/IrForm';
import { IrPanel } from '@/app/_components/IrPanel';
import {
  IrReadonly,
  IrRecordForm,
  IrSelect,
  IrTextInput,
  IrToggle,
  type FormMode,
} from '@/app/_components/IrRecordForm';

const LIST = '/company/credentials';

const KINDS = ['특허', '인증', '수상'] as const;

/**
 * 특허 · 인증 등록 · 수정.
 *
 * ## 등록번호를 필수로 받는다
 * 특허와 인증은 **밖에서 조회할 수 있는 값**이다. 번호가 없으면 확인할 방법이 없어, 적어 둔
 * 것이 주장에 그친다 — 그리고 확인되지 않는 주장을 회사 홈페이지에 세우는 것은 그 자체로 위험한
 * 일이다. 그래서 이 칸만은 비운 채 저장할 수 없다.
 *
 * ## 번호를 고정폭으로 받는다
 * 여기 오는 사람의 절반은 **번호를 들고 와서** 맞는지 본다. 자릿수가 눈으로 맞아야 견줄 수 있어
 * 입력 칸도 목록과 같은 고정폭 글꼴을 쓴다.
 *
 * ## 취득일이 미래면 막는다
 * 아직 받지 않은 것을 미리 적어 두는 일이 실제로 생긴다(심사 중인 특허). 그런데 사이트는
 * 날짜를 따지지 않고 그대로 세우므로, **받지 않은 것이 받은 것으로** 실린다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function CredentialForm({
  mode,
  code,
  today,
  initial,
}: {
  mode: FormMode;
  code: string;
  /** 오늘 — 서버가 없으므로 화면 밖에서 받는다. 여기서 읽으면 서버와 브라우저 값이 어긋난다 */
  today: string;
  initial?: Credential;
}) {
  const [kind, setKind] = useState<string>(initial?.kind ?? KINDS[0]);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [number, setNumber] = useState(initial?.number ?? '');
  const [issuer, setIssuer] = useState(initial?.issuer ?? '');
  const [acquiredAt, setAcquiredAt] = useState(initial?.acquiredAt ?? '');
  const [visible, setVisible] = useState(initial?.visible ?? true);
  const [tried, setTried] = useState(false);

  const future = Boolean(acquiredAt) && acquiredAt > today;
  const broken = [
    ...(title.trim() ? [] : ['이름']),
    ...(number.trim() ? [] : ['등록번호']),
    ...(issuer.trim() ? [] : ['발급 기관']),
    ...(acquiredAt ? [] : ['취득일']),
    ...(future ? ['취득일'] : []),
  ];

  return (
    <IrRecordForm
      mode={mode}
      resource="특허 · 인증"
      listHref={LIST}
      detail={`${kind} · ${title.trim() || '(이름 없음)'} · ${number.trim() || '번호 없음'}`}
      validate={() => {
        setTried(true);
        return broken;
      }}
    >
      <IrPanel title="기본 정보" description="사이트의 특허 및 인증 화면에 이대로 섭니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <IrReadonly label="코드" value={code} note={mode === 'create' ? '자동 생성' : '수정 불가'} />

            <IrField label="구분" htmlFor="cred-kind" required hint="목록에서 갈래로 쓰입니다.">
              <IrSelect id="cred-kind" value={kind} onChange={setKind} options={KINDS} />
            </IrField>
          </div>

          <IrField
            label="이름"
            htmlFor="cred-title"
            required
            {...(tried && !title.trim()
              ? { error: '이름을 입력해 주세요.' }
              : { hint: '등록증에 적힌 이름 그대로 적으세요 — 줄여 적으면 조회되지 않습니다.' })}
          >
            <IrTextInput
              id="cred-title"
              value={title}
              onChange={setTitle}
              placeholder="예: 설비 신호의 표준 데이터 변환 방법"
              invalid={tried && !title.trim()}
            />
          </IrField>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <IrField
              label="등록번호"
              htmlFor="cred-number"
              required
              {...(tried && !number.trim()
                ? { error: '등록번호를 입력해 주세요.' }
                : { hint: '밖에서 조회할 수 있는 값입니다. 없으면 세울 수 없습니다.' })}
            >
              <input
                id="cred-number"
                type="text"
                value={number}
                onChange={(event) => setNumber(event.target.value)}
                placeholder="10-0000000"
                aria-invalid={tried && !number.trim()}
                className={`h-11 w-full min-w-0 rounded-lg border bg-surface px-3 font-mono text-sm tabular-nums text-ink placeholder:text-ink-faint ${
                  tried && !number.trim() ? 'border-signal-danger' : 'border-border-strong'
                }`}
              />
            </IrField>

            <IrField
              label="발급 기관"
              htmlFor="cred-issuer"
              required
              {...(tried && !issuer.trim() ? { error: '발급 기관을 입력해 주세요.' } : {})}
            >
              <IrTextInput
                id="cred-issuer"
                value={issuer}
                onChange={setIssuer}
                placeholder="예: 특허청"
                invalid={tried && !issuer.trim()}
              />
            </IrField>
          </div>

          <IrField
            label="취득일"
            htmlFor="cred-at"
            required
            {...(tried && !acquiredAt
              ? { error: '취득일을 골라 주세요.' }
              : future
                ? { error: `아직 오지 않은 날입니다 (오늘 ${today}). 받지 않은 것이 받은 것으로 실립니다.` }
                : { hint: '목록은 최근 취득한 것부터 섭니다.' })}
          >
            <IrTextInput
              id="cred-at"
              type="date"
              value={acquiredAt}
              onChange={setAcquiredAt}
              invalid={tried && (!acquiredAt || future)}
            />
          </IrField>

          <IrToggle
            id="cred-visible"
            label="사이트에 노출"
            description="끄면 사이트의 특허 및 인증 화면에서 사라집니다. 효력이 끝난 인증을 내릴 때 씁니다."
            checked={visible}
            onChange={setVisible}
          />
        </div>
      </IrPanel>
    </IrRecordForm>
  );
}
