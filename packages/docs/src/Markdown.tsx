import type { ReactNode } from 'react';
import { CodeBlock } from './CodeBlock';
import { Mermaid } from './Mermaid';

/**
 * 마크다운 렌더러.
 *
 * 라이브러리를 쓰지 않는다 — 문서 화면 하나 때문에 의존성을 늘리면 앱마다 한 벌씩 들어간다.
 * 우리 문서가 쓰는 문법(제목·목록·표·코드·인용·굵게·링크·그림·체크박스)만 다룬다.
 *
 * **HTML 을 만들어 넣지 않고 React 요소로 만든다** — 문자열로 조립하면 문서 안의 `<` 가
 * 그대로 태그가 되고, 문서는 우리가 쓴 것이라도 그렇게 다룰 이유가 없다.
 *
 * ```mermaid 울타리는 **도면으로 그린다**. 원본만 보여 주면 갈래가 열을 넘어갈 때
 * 머릿속에서 도면을 그려야 하고, 그건 도면을 적어 둔 뜻이 없다.
 *
 * ## 어드민 연동
 * - **없다.** 저장소의 문서를 보여 주는 개발 도구라 어드민이 고치는 값이 없다.
 */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // `코드` · **굵게** · ![그림](주소) · [링크](주소) 네 가지만 본다.
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(!\[[^\]]*\]\([^)]+\))|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${index++}`;

    if (token.startsWith('`')) {
      nodes.push(
        <code key={key} className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.9em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('**')) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('![')) {
      // 캡처 그림. `public/` 아래에 있으므로 최적화 대상이 아니라 그대로 건다.
      const alt = token.slice(2, token.indexOf(']'));
      const src = token.slice(token.indexOf('(') + 1, -1);
      nodes.push(
        // eslint-disable-next-line @next/next/no-img-element
        <img key={key} src={src} alt={alt} className="my-3 w-full rounded-lg border border-border" />,
      );
    } else {
      const label = token.slice(1, token.indexOf(']'));
      const href = token.slice(token.indexOf('(') + 1, -1);
      nodes.push(
        <a key={key} href={href} className="text-brand-700 underline underline-offset-2 dark:text-brand-300">
          {label}
        </a>,
      );
    }
    last = match.index + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.split('\n');
  const blocks: ReactNode[] = [];

  let listBuffer: string[] = [];
  let codeBuffer: string[] = [];
  let tableBuffer: string[] = [];
  let inCode = false;
  /** ```mermaid 처럼 울타리 뒤에 붙은 말 */
  let codeLang = '';
  /** 도면 카드에 붙일 이름 — 바로 앞 제목을 쓴다. */
  let lastHeading = '';

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={key} className="my-3 flex list-disc flex-col gap-1 pl-5">
        {listBuffer.map((item, index) => (
          <li key={`${key}-${index}`} className="text-sm leading-relaxed">
            {inline(item, `${key}-${index}`)}
          </li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  const flushTable = (key: string) => {
    if (tableBuffer.length === 0) return;
    const rows = tableBuffer
      .filter((row) => !/^\s*\|[\s:|-]+\|\s*$/.test(row))
      .map((row) =>
        row
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((cell) => cell.trim()),
      );
    const [head, ...body] = rows;

    blocks.push(
      <div key={key} className="my-4 overflow-x-auto">
        <table className="w-full min-w-160 border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              {(head ?? []).map((cell, index) => (
                <th key={index} className="px-3 py-2 text-left text-xs font-medium text-ink-faint">
                  {inline(cell, `${key}-h-${index}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2 align-top leading-relaxed">
                    {inline(cell, `${key}-${rowIndex}-${cellIndex}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    tableBuffer = [];
  };

  lines.forEach((line, index) => {
    const key = `block-${index}`;

    if (line.startsWith('```')) {
      if (inCode) {
        const code = codeBuffer.join('\n');
        blocks.push(
          codeLang === 'mermaid' ? (
            <Mermaid key={key} code={code} title={lastHeading || undefined} />
          ) : (
            <CodeBlock key={key} code={code} label={codeLang || undefined} />
          ),
        );
        codeBuffer = [];
        codeLang = '';
      } else {
        codeLang = line.slice(3).trim();
      }
      inCode = !inCode;
      return;
    }
    if (inCode) {
      codeBuffer.push(line);
      return;
    }

    if (line.trim().startsWith('|')) {
      flushList(`${key}-l`);
      tableBuffer.push(line);
      return;
    }
    flushTable(`${key}-t`);

    if (/^\s*[-*]\s+/.test(line)) {
      listBuffer.push(line.replace(/^\s*[-*]\s+/, ''));
      return;
    }
    flushList(`${key}-l`);

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1]?.length ?? 1;
      const text = heading[2] ?? '';
      lastHeading = text;
      const size = level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : level === 3 ? 'text-base' : 'text-sm';
      blocks.push(
        <p key={key} className={`mb-2 mt-6 font-bold tracking-tight first:mt-0 ${size}`}>
          {inline(text, key)}
        </p>,
      );
      return;
    }

    if (line.startsWith('> ')) {
      blocks.push(
        <blockquote key={key} className="my-3 border-l-2 border-border-strong pl-3 text-sm text-ink-muted">
          {inline(line.slice(2), key)}
        </blockquote>,
      );
      return;
    }

    if (line.trim() === '') return;

    blocks.push(
      <p key={key} className="my-2 text-sm leading-relaxed">
        {inline(line, key)}
      </p>,
    );
  });

  flushList('tail-l');
  flushTable('tail-t');

  return <div className="flex flex-col">{blocks}</div>;
}
