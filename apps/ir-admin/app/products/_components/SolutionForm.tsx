'use client';

import { useState } from 'react';
import { Badge } from '@winpilot/ui';
import type { Solution } from '@winpilot/store';
import { IrField } from '@/app/_components/IrForm';
import { IrPanel } from '@/app/_components/IrPanel';
import {
  IrReadonly,
  IrRecordForm,
  IrTextArea,
  IrTextInput,
  IrToggle,
} from '@/app/_components/IrRecordForm';

/**
 * 제품 · 솔루션 상세 — **말은 고치고, 구조는 못 고친다.**
 *
 * ## 왜 절반만 고칠 수 있나
 * 이 값 하나가 사이트의 세 자리에 나간다 — 홈의 카드, PRODUCT 메뉴, 그리고 제품 상세 화면.
 * 그중 **말(이름 · 한 줄 소개 · 무엇을 푸는가 · 어떻게 푸는가)** 은 영업하며 계속 다듬는
 * 것이라 여기서 고칠 수 있어야 한다.
 *
 * 반대로 **구조(기능 넷 · 구성 층 · 업종 · 도입 절차)** 는 화면이 그 개수를 전제로 그려져 있다 —
 * 기능은 2×2 격자, 구성은 아래에서 위로 쌓는 층, 절차는 기간이 붙은 단계다. 개수가 바뀌면
 * 격자가 무너지고 층이 뜬다. 여기서 늘리고 줄일 수 있게 두면 **화면이 깨진 것을 사이트에서
 * 발견하게 되므로**, 보여 주기만 하고 고치는 일은 화면을 함께 손볼 때 코드에서 한다.
 *
 * ## 두 메뉴가 같은 화면을 쓴다
 * 제품 목록과 솔루션 목록이 같은 값을 가리킨다. 돌아갈 목록만 `listHref` 로 받는다 —
 * 솔루션에서 들어와 제품 목록으로 튕겨 나가면 어디로 갔는지 모른다.
 *
 * **프론트엔드 전용** — 저장 결과는 이 화면에만 반영된다.
 */
export function SolutionForm({
  solution,
  listHref,
  resource,
}: {
  solution: Solution;
  listHref: string;
  /** `제품` 인지 `솔루션` 인지 — 확인 창과 토스트의 말이 바뀐다 */
  resource: string;
}) {
  const [name, setName] = useState(solution.name);
  const [tagline, setTagline] = useState(solution.tagline);
  const [problem, setProblem] = useState(solution.problem);
  const [approach, setApproach] = useState(solution.approach);
  const [visible, setVisible] = useState(solution.visible);
  const [tried, setTried] = useState(false);

  /* 홈 카드가 이 값을 그대로 싣는다. 세 문장이면 석 줄이 되어 카드 높이가 다른 카드와 어긋난다. */
  const tooLong = approach.split(/[.!?]\s/).filter((one) => one.trim()).length > 2;

  const broken = [
    ...(name.trim() ? [] : ['이름']),
    ...(tagline.trim() ? [] : ['한 줄 소개']),
    ...(problem.trim() ? [] : ['무엇을 푸는가']),
    ...(approach.trim() ? [] : ['어떻게 푸는가']),
  ];

  return (
    <IrRecordForm
      mode="edit"
      resource={resource}
      listHref={listHref}
      detail={`${name.trim() || '(이름 없음)'} — ${tagline.trim()}`}
      validate={() => {
        setTried(true);
        return broken;
      }}
    >
      <IrPanel title="말" description="홈 카드 · 메뉴 · 상세 화면이 이 값을 함께 읽습니다.">
        <div className="flex flex-col gap-5 px-6 py-5">
          <IrReadonly label="코드" value={solution.id} note="수정 불가" />
          <IrReadonly label="상세 주소" value={solution.href} note="라우트가 정함" />
        

          <IrField
            label="이름"
            htmlFor="sol-name"
            required
            {...(tried && !name.trim() ? { error: '이름을 입력해 주세요.' } : {})}
          >
            <IrTextInput id="sol-name" value={name} onChange={setName} invalid={tried && !name.trim()} />
          </IrField>

          <IrField
            label="한 줄 소개"
            htmlFor="sol-tagline"
            required
            {...(tried && !tagline.trim()
              ? { error: '한 줄 소개를 입력해 주세요.' }
              : { hint: '메뉴와 카드 제목 아래에 섭니다.' })}
          >
            <IrTextInput
              id="sol-tagline"
              value={tagline}
              onChange={setTagline}
              invalid={tried && !tagline.trim()}
            />
          </IrField>

          <IrField
            label="무엇을 푸는가"
            htmlFor="sol-problem"
            required
            {...(tried && !problem.trim()
              ? { error: '내용을 입력해 주세요.' }
              : { hint: '기능이 아니라 문제를 적으세요 — 읽는 사람은 자기 문제가 여기 있는지를 봅니다.' })}
          >
            <IrTextArea
              id="sol-problem"
              rows={4}
              value={problem}
              onChange={setProblem}
              invalid={tried && !problem.trim()}
            />
          </IrField>

          <IrField
            label="어떻게 푸는가"
            htmlFor="sol-approach"
            required
            {...(tried && !approach.trim()
              ? { error: '내용을 입력해 주세요.' }
              : tooLong
                ? { hint: '두 문장까지 권합니다 — 홈 카드가 이 값을 그대로 싣는데 세 문장이면 석 줄이 됩니다.' }
                : { hint: '두 문장까지. 홈 카드가 이 값을 그대로 싣습니다.' })}
          >
            <IrTextArea
              id="sol-approach"
              rows={4}
              value={approach}
              onChange={setApproach}
              invalid={tried && !approach.trim()}
            />
          </IrField>

          <IrToggle
            id="sol-visible"
            label="사이트에 노출"
            description="끄면 머리 메뉴 · 홈 카드 · 제품 목록에서 함께 사라집니다. 상세 화면은 주소를 직접 치면 열립니다 — 아직 팔지 않는 제품을 미리 만들어 두고 링크만 감출 때 쓰는 자리입니다."
            checked={visible}
            onChange={setVisible}
          />
        </div>
      </IrPanel>

      <IrPanel
        title="구조"
        description="화면이 이 개수를 전제로 그려져 있어 여기서는 읽기만 합니다."
        aside={<Badge tone="neutral">읽기 전용</Badge>}
      >
        <div className="flex flex-col gap-6 px-6 py-5">
          <Group title="주요 기능" note="상세 화면의 2×2 격자">
            {solution.features.map((one) => (
              <li key={one.title} className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{one.title}</span>
                <span className="text-xs leading-relaxed text-ink-muted">{one.desc}</span>
              </li>
            ))}
          </Group>

          <Group title="시스템 구성" note="아래에서 위로 쌓이는 층">
            {solution.layers.map((one) => (
              <li key={one.name} className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{one.name}</span>
                <span className="text-xs leading-relaxed text-ink-muted">{one.desc}</span>
              </li>
            ))}
          </Group>

          <Group title="도입 절차" note="단계마다 걸리는 기간">
            {solution.steps.map((one) => (
              <li key={one.name} className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">
                  {one.name}
                  <span className="ml-2 font-mono text-xs font-normal text-ink-faint">{one.period}</span>
                </span>
                <span className="text-xs leading-relaxed text-ink-muted">{one.desc}</span>
              </li>
            ))}
          </Group>

          <div className="flex flex-col gap-2">
            <p className="text-xs text-ink-faint">적용 업종 · 자기 업종이 없으면 검토가 거기서 멈춥니다</p>
            <p className="flex flex-wrap gap-2">
              {solution.industries.map((one) => (
                <span key={one} className="rounded bg-surface px-2.5 py-1 text-xs text-ink-muted">
                  {one}
                </span>
              ))}
            </p>
          </div>
        </div>
      </IrPanel>
    </IrRecordForm>
  );
}

/** 읽기만 하는 묶음 한 덩이. */
function Group({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-ink-faint">
        {title} · {note}
      </p>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</ul>
    </div>
  );
}
