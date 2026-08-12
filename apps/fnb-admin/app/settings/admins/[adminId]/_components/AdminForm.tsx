'use client';

import { useState } from 'react';
import { Panel } from '@winpilot/ui';
import { ADMIN_ROLES, FNB_ADMINS, type FnbAdmin } from '@winpilot/store';
import {
  FnbField,
  FnbReadonly,
  FnbRecordForm,
  FnbSelect,
  FnbTextInput,
  FnbToggle,
} from '@/app/_components/FnbForm';

/** 값이 곧 보이는 이름이라 고르개에 그대로 넘긴다. */
const ROLE_OPTIONS = [...ADMIN_ROLES];

/** 권한마다 무엇을 할 수 있는지. 고르는 자리 바로 아래에 적는다 — 이름만으로는 안 갈린다. */
const ROLE_NOTE: Record<string, string> = {
  대표: '전부. 관리자를 늘리고 지울 수 있는 유일한 권한입니다.',
  운영: '메뉴 · 가맹점 · 배너 · 문의 — 매일 쓰는 것 전부. 관리자는 못 건드립니다.',
  조회: '보기만 합니다. 가맹점주나 외부 대행사에 주세요.',
};

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 관리자 상세.
 *
 * ## 대표를 혼자 남기지 않는다
 * 마지막 남은 `대표` 를 다른 권한으로 내리면 **관리자를 늘릴 수 있는 사람이 없어진다.** 그때는
 * 개발자가 값을 직접 고쳐야 풀린다. 그래서 이 경우만 저장을 막는다.
 *
 * 정지도 같다. 대표가 하나뿐인데 그 계정을 정지하면 아무도 못 들어온다.
 *
 * ## 이메일을 고칠 수 있게 둔다
 * 로그인 아이디가 될 값이라 잠글까 했는데, 실제로 바뀌는 일이 있다(회사 도메인 변경 · 담당자
 * 교체). 잠가 두면 그때 계정을 새로 만들고 옛 계정을 정지하게 되는데, 그러면 **한 사람이 두
 * 줄**로 남는다.
 *
 * ## 비밀번호가 여기 없다
 * 남의 비밀번호를 볼 수 있거나 정할 수 있는 자리를 만들지 않는다. 못 들어오는 사람에게는
 * 재설정 메일을 보내는 것이 맞고, 그 자리는 로그인 화면이 생길 때 함께 만든다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function AdminForm({ admin, mode = 'edit' }: { admin: FnbAdmin ; mode?: 'edit' | 'create' }) {
  const [name, setName] = useState(admin.name);
  const [email, setEmail] = useState(admin.email);
  const [role, setRole] = useState<string>(admin.role);
  const [active, setActive] = useState(admin.active);
  const [tried, setTried] = useState(false);

  /* 이 사람 말고 살아 있는 대표가 또 있는가. 없으면 권한을 내리거나 정지할 수 없다. */
  const otherOwner = FNB_ADMINS.some((one) => one.id !== admin.id && one.role === '대표' && one.active);
  const wasOwner = admin.role === '대표';
  const losesLastOwner = wasOwner && !otherOwner && (role !== '대표' || !active);

  const emailBroken = !EMAIL_SHAPE.test(email.trim());

  const broken = [
    ...(name.trim() ? [] : ['이름']),
    ...(emailBroken ? ['이메일'] : []),
    ...(losesLastOwner ? ['권한'] : []),
  ];

  return (
    <FnbRecordForm
      resource="관리자"
      mode={mode}
      detail={`${name.trim()} · ${role} · ${active ? '사용' : '정지'}`}
      confirmMessage="이 사람이 콘솔에서 무엇을 할 수 있는지가 바뀝니다. 권한을 한 번 더 읽어 주세요."
      validate={() => {
        setTried(true);
        return broken;
      }}
    >
      <Panel title="누구인가" description="이메일이 로그인 아이디가 됩니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          {mode === 'edit' ? (
            <FnbReadonly label="계정 번호" value={admin.id} note="수정 불가" />
          ) : (
            /* 번호는 저장할 때 매겨진다 — 미리 보여 주면 저장하지 않고 나간 번호가 생긴다. */
            <FnbReadonly label="계정 번호" value="저장할 때 매겨집니다" note="자동" />
          )}
          <FnbReadonly
            label="마지막 접속"
            value={admin.lastSeenOn || '접속 없음'}
            note={admin.lastSeenOn ? '' : '만들어 두고 한 번도 들어오지 않았습니다'}
          />

          <FnbField
            label="이름"
            htmlFor="admin-name"
            required
            {...(tried && !name.trim() ? { error: '이름을 적어 주세요.' } : {})}
          >
            <FnbTextInput id="admin-name" value={name} onChange={setName} invalid={tried && !name.trim()} />
          </FnbField>

          <FnbField
            label="이메일"
            htmlFor="admin-email"
            required
            hint="로그인 아이디입니다. 바꾸면 다음 로그인부터 새 주소로 들어옵니다."
            {...(tried && emailBroken ? { error: 'name@example.com 처럼 적어 주세요.' } : {})}
          >
            <FnbTextInput id="admin-email" value={email} onChange={setEmail} invalid={tried && emailBroken} />
          </FnbField>
        </div>
      </Panel>

      <Panel title="무엇을 할 수 있나" description="셋으로만 나눕니다 — 조합이 늘면 누가 무엇을 할 수 있는지 설명할 수 없게 됩니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <FnbField
            label="권한"
            htmlFor="admin-role"
            required
            hint={ROLE_NOTE[role] ?? ''}
            {...(tried && losesLastOwner ? { error: '마지막 대표입니다 — 다른 분을 대표로 올린 뒤에 바꿔 주세요.' } : {})}
          >
            <FnbSelect id="admin-role" value={role} onChange={setRole} options={ROLE_OPTIONS} />
          </FnbField>

          <FnbField
            label="상태"
            hint={
              losesLastOwner
                ? '마지막 대표라 정지할 수 없습니다.'
                : '정지하면 로그인만 막힙니다. 이 사람이 무엇을 고쳤는지는 그대로 남습니다.'
            }
          >
            <FnbToggle
              id="admin-active"
              checked={active}
              onChange={setActive}
              label="로그인 허용"
              description="끄면 이 계정으로 들어올 수 없습니다."
            />
          </FnbField>
        </div>
      </Panel>
    </FnbRecordForm>
  );
}
