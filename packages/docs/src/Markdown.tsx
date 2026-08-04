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
  // `코드` · **굵게** · _흐리게_ · ![그림](주소) · [링크](주소) 다섯 가지만 본다.
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(_[^_\n]+_)|(!\[[^\]]*\]\([^)]+\))|(\[[^\]]+\]\([^)]+\))/g;
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
    } else if (token.startsWith('_')) {
      /*
        `_해당 없음_` 같은 자리. 밑줄 표기를 다루지 않아 밑줄이 글자 그대로 찍히고 있었다 —
        "해당 없음" 을 알리려던 자리가 오히려 오타처럼 보인다.
      */
      nodes.push(
        <em key={key} className="not-italic text-ink-faint">
          {token.slice(1, -1)}
        </em>,
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

/**
 * 본문 여백 **한 벌**.
 *
 * 덩이마다 다른 값을 적으면 문단과 목록 사이, 목록과 표 사이가 제각각이 되어 글이 층으로 읽히지
 * 않는다. 여백은 세 자리뿐이다: 이어지는 글(`FLOW`) · 덩이가 큰 것(`WIDE`) · 새 마디를 여는 제목.
 *
 * 바깥을 `flex` 로 두지 않는 이유: flex 안에서는 위아래 여백이 겹치지 않고 **더해진다.** 문단
 * 아래 12px 와 다음 문단 위 12px 가 24px 이 되어, 값을 아무리 맞춰도 실제 간격은 두 배로 벌어진다.
 * 보통 블록으로 두면 큰 쪽 하나만 남아 여기 적은 값이 곧 화면의 값이 된다.
 */
const FLOW = 'my-3';
const WIDE = 'my-5';
const HEADING = 'mb-3 mt-8 first:mt-0';

/**
 * 숫자만 든 열을 찾는다.
 *
 * 숫자를 왼쪽에 붙여 두면 자릿수가 어긋나 크기를 눈으로 견줄 수 없다 — 표를 쓰는 이유의 절반이
 * 견주기인데 그 절반이 없어진다. 마크다운의 `---:` 로 일일이 적게 하지 않는 이유는, 문서가
 * 생성물이라 생성기마다 그 표시를 기억해야 하기 때문이다.
 */
function numericColumns(head: string[], body: string[][]): boolean[] {
  return head.map((_, index) => {
    const cells = body.map((row) => row[index] ?? '').filter((cell) => cell.length > 0 && cell !== '—');
    if (cells.length === 0) return false;
    return cells.every((cell) => /^[+-]?[\d,. ]+ ?(개|장|건|원|명|회|자|초|%|px|ms)?$/.test(cell));
  });
}

/** 문서가 직접 정한 정렬(`---:` · `:---:`)이 있으면 그것이 이긴다. */
function declaredAlign(row: string | undefined): Array<'left' | 'center' | 'right' | ''> {
  if (!row) return [];
  return row
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim())
    .map((cell) => {
      if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
      if (cell.endsWith(':')) return 'right';
      if (cell.startsWith(':')) return 'left';
      return '';
    });
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
      <ul key={key} className={`${FLOW} flex list-disc flex-col gap-1 pl-5`}>
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

    const align = declaredAlign(tableBuffer.find((row) => /^\s*\|[\s:|-]+\|\s*$/.test(row)));
    const rows = tableBuffer
      .filter((row) => !/^\s*\|[\s:|-]+\|\s*$/.test(row))
      .map((row) =>
        row
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((cell) => cell.trim()),
      );
    const [head = [], ...body] = rows;
    const numeric = numericColumns(head, body);

    /*
      셀 정렬은 열 단위로 한 번만 정하고 머리와 몸에 같이 건다. 머리는 왼쪽, 몸은 오른쪽이 되면
      어느 칸이 어느 이름의 값인지 눈으로 잇지 못한다.
    */
    const cellClass = (index: number): string => {
      const right = align[index] === 'right' || (!align[index] && numeric[index]);
      if (right) return 'text-right tabular-nums';
      if (align[index] === 'center') return 'text-center';
      return 'text-left';
    };

    blocks.push(
      // 표는 **자기 상자 안에서만** 가로로 스크롤한다. 페이지가 통째로 밀리면 본문을 읽던 자리를 잃는다.
      <div key={key} className={`${WIDE} min-w-0 overflow-x-auto`}>
        <table className="w-full min-w-160 border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              {head.map((cell, index) => (
                <th
                  key={index}
                  className={`px-3 py-2 align-top text-xs font-medium text-ink-faint ${cellClass(index)}`}
                >
                  {inline(cell, `${key}-h-${index}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`px-3 py-2 align-top leading-relaxed ${cellClass(cellIndex)}`}
                  >
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
        <p key={key} className={`${HEADING} font-bold tracking-tight ${size}`}>
          {inline(text, key)}
        </p>,
      );
      return;
    }

    if (line.startsWith('> ')) {
      blocks.push(
        <blockquote key={key} className={`${FLOW} border-l-2 border-border-strong pl-3 text-sm text-ink-muted`}>
          {inline(line.slice(2), key)}
        </blockquote>,
      );
      return;
    }

    if (line.trim() === '') return;

    blocks.push(
      <p key={key} className={`${FLOW} text-sm leading-relaxed`}>
        {inline(line, key)}
      </p>,
    );
  });

  flushList('tail-l');
  flushTable('tail-t');

  return <div className="min-w-0">{blocks}</div>;
}
