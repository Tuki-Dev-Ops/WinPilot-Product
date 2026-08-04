'use client';

import { useState } from 'react';

/**
 * 문서 안의 코드 덩이 — **복사 단추가 붙는다.**
 *
 * mermaid 로 그린 도면은 그대로 옮겨 붙여야 쓸모가 있다(작업 도구·위키·이슈). 손으로 긁으면
 * 들여쓰기가 깨지고 마지막 줄을 빠뜨리기 쉬워서, 덩이째 집어 가는 길을 둔다.
 *
 * 복사 결과는 **글자로 알린다.** 아이콘만 바꾸면 눌렸는지 아닌지 알기 어렵고, 실패했을 때
 * (권한이 막힌 브라우저) 아무 일도 없는 것처럼 보인다.
 *
 * ## 어드민 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
 */
export function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setState('done');
    } catch {
      // 클립보드가 막힌 브라우저에서도 화면은 조용하지 않아야 한다.
      setState('failed');
    }
    window.setTimeout(() => setState('idle'), 1600);
  };

  return (
    <div className="group relative my-4">
      <div className="flex items-center justify-between gap-3 rounded-t-lg border border-border bg-surface px-4 py-2">
        <span className="truncate font-mono text-xs text-ink-faint">{label ?? 'code'}</span>
        <button
          type="button"
          onClick={copy}
          className="flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded border border-border-strong bg-canvas px-2.5 text-xs text-ink-muted hover:text-ink"
        >
          <CopyIcon />
          {state === 'done' ? '복사함' : state === 'failed' ? '복사 실패' : '복사'}
        </button>
      </div>

      <pre className="overflow-x-auto rounded-b-lg border border-t-0 border-border bg-surface px-4 py-3 font-mono text-xs leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" />
    </svg>
  );
}
