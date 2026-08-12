import type { ReactNode } from 'react';

/**
 * 문서 머리 — 어디에 있는지(경로)와 무엇을 보는지(제목·한 줄 설명).
 *
 * 경로를 제목 위에 두는 이유: 문서가 갈래로 나뉘어 있어 제목만으로는 어느 갈래의 것인지
 * 알 수 없다. `기능 명세서 · 상품 목록` 처럼 읽혀야 옆 문서로 옮겨 갈 생각이 든다.
 */
export function DocHeader({
  trail,
  title,
  description,
  aside,
}: {
  trail?: string[];
  title: string;
  description?: string;
  aside?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-border pb-5">
      {trail && trail.length > 0 && (
        <p className="flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
          {trail.map((step, index) => (
            <span key={step} className="flex items-center gap-1.5">
              {index > 0 && <span aria-hidden="true">·</span>}
              {step}
            </span>
          ))}
        </p>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {aside}
      </div>

      {description && <p className="max-w-200 text-sm leading-relaxed text-ink-muted">{description}</p>}
    </header>
  );
}
