import type { Metadata } from 'next';
import { PROJECT_PURPOSE } from '@winpilot/docs';
import { DocHeader, Markdown } from '@winpilot/docs/ui';

/**
 * 프로젝트 목적과 배경.
 *
 * 글은 `@winpilot/docs` 한 곳에 있다 — 저장소 전체에 대한 글이라 앱마다 달라질 이유가 없고,
 * 일곱 벌로 두면 아무도 고치지 않는다.
 */
export const metadata: Metadata = { title: '목적과 배경' };

export default function PurposePage() {
  return (
    <>
      <DocHeader
        trail={['문서', '개요']}
        title="목적과 배경"
        description="이 저장소가 무엇을 만들고 있고 왜 이렇게 만들고 있는지 정리했습니다. 화면 하나하나의 목적과 배경은 기능 명세서(FSD) 1절에 있습니다."
      />
      <Markdown source={PROJECT_PURPOSE} />
    </>
  );
}
