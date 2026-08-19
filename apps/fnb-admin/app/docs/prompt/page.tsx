import type { Metadata } from 'next';
import { DOCS_GENERATION_PROMPT } from '@winpilot/docs';
import { CodeBlock } from '@winpilot/docs/ui';
import { DocHeader } from '@winpilot/docs/ui';

/**
 * 생성 프롬프트 — 이 문서 묶음을 **다시 만들 때** 쓰는 지시문.
 *
 * 프롬프트를 저장소 밖(메모·채팅 기록)에 두면 다음 사람이 찾지 못하고 처음부터 다시 적는다.
 * 그러면 같은 프로젝트의 문서가 판마다 다른 규칙으로 만들어진다.
 *
 * ## 글은 여기 없다
 * 본문은 `@winpilot/docs` 가 갖는다. 한때 이 파일 안에 여든한 줄이 들어 있었고, **일곱 앱에
 * 글자 단위로 같은 것이 일곱 벌** 있었다. 그 사이에 문서 라우트가 셋 늘었는데 일곱 벌 중
 * 한 벌도 안 고쳐졌다 — 고칠 곳이 일곱이면 아무도 고치지 않는다.
 *
 * 복사 단추가 붙는 이유: 이 글은 읽으라고 있는 것이 아니라 **집어 가라고** 있는 것이다.
 *
 * ## 어드민 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
 */
export const metadata: Metadata = { title: '생성 프롬프트' };

export default function DocsPromptPage() {
  return (
    <>
      <DocHeader
        trail={['문서', '시스템']}
        title="생성 프롬프트"
        description="이 문서 묶음을 다시 만들 때 쓰는 지시문입니다. 저장소 밖에 두면 다음 담당자가 찾지 못해 처음부터 다시 적게 되고, 그러면 같은 프로젝트의 문서가 판마다 다른 규칙으로 만들어집니다."
      />
      <CodeBlock code={DOCS_GENERATION_PROMPT} label="docs-generation-prompt.md" />
    </>
  );
}
