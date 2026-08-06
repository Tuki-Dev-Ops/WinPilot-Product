'use client';

import { useEffect } from 'react';
import { StatusScreen } from '@winpilot/ui';

/**
 * 오류 화면 — **처리 중에 무언가 잘못됐을 때**.
 *
 * 404 와 같은 컴포넌트를 쓰되 코드만 다르다. Next 의 오류 경계라 클라이언트 컴포넌트여야 하고,
 * `reset` 을 받지만 화면에는 **다시 시도**를 링크로 두지 않는다 — 같은 오류가 반복되면
 * 단추만 계속 누르게 되므로, 돌아갈 곳을 주는 편이 낫다.
 *
 * `digest` 는 서버가 남긴 오류 식별자다. 화면에 적어 두면 문의할 때 그대로 옮길 수 있다.
 */
export default function ErrorScreen({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // 서버가 없어 보낼 곳이 없다. 콘솔에는 남겨야 개발 중에 원인을 좇을 수 있다.
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      code="500 ERROR"
      title="처리 중 문제가 발생했습니다."
      description={[
        '잠시 후 다시 시도해 주세요.',
        '같은 문제가 계속되면 아래 오류 번호와 함께 문의해 주세요.',
      ]}
      tone="danger"
      actions={[{ href: '/', label: '홈으로', primary: true }]}
    >
      {error.digest && (
        <p className="w-fit rounded-lg bg-canvas px-4 py-2 font-mono text-xs tabular-nums text-ink-muted">
          오류 번호 {error.digest}
        </p>
      )}
    </StatusScreen>
  );
}
