'use client';

import { Image, Link } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent } from 'react';

export type RichTextEditorProps = {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  /** 비어 있을 때 보여줄 안내 문구 */
  hint?: string;
};

type Command = {
  label: string;
  title: string;
  run: () => void;
  /** 아이콘 대신 글자로 보여주는 버튼의 글자 모양 */
  face?: string;
};

const EDITOR_STYLE = [
  'min-h-64 w-full rounded-b-lg bg-surface px-4 py-3 text-sm leading-relaxed outline-none',
  '[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold',
  '[&_p]:my-2',
  '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5',
  '[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border-strong [&_blockquote]:pl-3 [&_blockquote]:text-ink-muted',
  '[&_hr]:my-4 [&_hr]:border-border',
  '[&_a]:text-brand-700 [&_a]:underline',
  '[&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg',
].join(' ');

function ImageIcon() {
  return (
    <Image aria-hidden className="size-4" strokeWidth={1.5} />
  );
}

function LinkIcon() {
  return (
    <Link aria-hidden className="size-4" strokeWidth={1.5} />
  );
}

/**
 * 상품 상세 설명용 HTML 에디터.
 *
 * `document.execCommand` 를 쓴다. 공식적으로는 폐기 예정이지만 모든 브라우저가 여전히 지원하고,
 * 대안(직접 만든 selection 조작)은 이 화면 하나를 위해 감당할 크기가 아니다.
 *
 * 안내 문구는 `::before` 가 아니라 **실제 요소**로 그린다 — 가상 요소는 Figma 추출에서
 * 폴백 래스터로 떨어진다 (docs/spec/05-component.md).
 *
 * **프론트엔드 전용** — 이미지는 서버로 보내지 않고 `URL.createObjectURL` 주소를 그대로 넣는다.
 * 그래서 새로고침하면 사라진다. 실제 저장은 이 화면의 책임이 아니다.
 */
export function RichTextEditor({ id, value, onChange, hint = '내용을 입력해 주세요' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const lastEmitted = useRef(value);

  const [empty, setEmpty] = useState(true);
  const [showSource, setShowSource] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // 바깥에서 들어온 값만 DOM 에 넣는다. 내가 방금 올려보낸 값을 되쓰면 커서가 맨 앞으로 튄다.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || value === lastEmitted.current) return;
    editor.innerHTML = value;
    setEmpty(editor.textContent?.trim() === '' && !editor.querySelector('img'));
  }, [value]);

  const emit = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const html = editor.innerHTML;
    lastEmitted.current = html;
    setEmpty(editor.textContent?.trim() === '' && !editor.querySelector('img'));
    onChange(html);
  };

  /** 파일 선택창이 뜨면 편집기가 포커스를 잃어 삽입 위치가 사라진다 — 미리 붙잡아 둔다. */
  const rememberSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
      savedRange.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const range = savedRange.current;
    if (!range) return;
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const exec = (command: string, argument?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    emit();
  };

  const insertImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('image/'));
    event.target.value = '';
    if (files.length === 0) return;

    restoreSelection();
    for (const file of files) {
      document.execCommand('insertImage', false, URL.createObjectURL(file));
    }
    emit();
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    setLinkOpen(false);
    setLinkUrl('');
    if (!url) return;
    restoreSelection();
    // 스킴이 없으면 브라우저가 상대 경로로 읽는다.
    document.execCommand('createLink', false, /^https?:\/\//i.test(url) ? url : `https://${url}`);
    emit();
  };

  // 붙여넣기는 글자만 받는다 — 다른 사이트의 HTML 이 그대로 들어오면 디자인이 무너진다.
  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
    emit();
  };

  const commands: Command[] = [
    { label: '제목', title: '제목', run: () => exec('formatBlock', 'h3') },
    { label: '본문', title: '본문', run: () => exec('formatBlock', 'p') },
    { label: 'B', title: '굵게', face: 'font-bold', run: () => exec('bold') },
    { label: 'I', title: '기울임', face: 'italic', run: () => exec('italic') },
    { label: 'U', title: '밑줄', face: 'underline', run: () => exec('underline') },
    { label: 'S', title: '취소선', face: 'line-through', run: () => exec('strikeThrough') },
    { label: '목록', title: '글머리 기호', run: () => exec('insertUnorderedList') },
    { label: '번호', title: '번호 매기기', run: () => exec('insertOrderedList') },
    { label: '인용', title: '인용', run: () => exec('formatBlock', 'blockquote') },
    { label: '구분선', title: '구분선', run: () => exec('insertHorizontalRule') },
  ];

  const buttonStyle =
    'h-8 rounded-lg px-2 text-xs text-ink-muted transition-colors duration-150 hover:bg-surface hover:text-ink';

  return (
    <div className="overflow-hidden rounded-lg border border-border-strong">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-canvas px-2 py-2">
        {commands.map((command) => (
          <button
            key={command.label}
            type="button"
            title={command.title}
            onMouseDown={(event) => event.preventDefault()}
            onClick={command.run}
            className={`${buttonStyle} ${command.face ?? ''}`}
          >
            {command.label}
          </button>
        ))}

        <span className="mx-1 h-4 w-px bg-border" />

        <button
          type="button"
          title="링크"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            rememberSelection();
            setLinkOpen((previous) => !previous);
          }}
          className={`${buttonStyle} flex items-center gap-1`}
        >
          <LinkIcon />
          링크
        </button>

        <button
          type="button"
          title="이미지 올리기"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            rememberSelection();
            fileRef.current?.click();
          }}
          className={`${buttonStyle} flex items-center gap-1`}
        >
          <ImageIcon />
          이미지
        </button>

        <button
          type="button"
          onClick={() => setShowSource((previous) => !previous)}
          className={`${buttonStyle} ml-auto ${showSource ? 'bg-surface text-ink' : ''}`}
        >
          {showSource ? '편집 화면' : 'HTML 보기'}
        </button>
      </div>

      {linkOpen && (
        <div className="flex items-center gap-2 border-b border-border bg-canvas px-3 py-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              applyLink();
            }}
            aria-label="링크 주소"
            className="h-9 flex-1 rounded-lg border border-border-strong bg-surface px-3 text-sm outline-none focus:border-brand-500"
          />
          <button
            type="button"
            onClick={applyLink}
            className="h-9 rounded-lg bg-brand-500 px-3 text-sm font-medium text-white hover:bg-brand-600"
          >
            적용
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" multiple onChange={insertImages} className="hidden" />

      {showSource ? (
        <textarea
          value={value}
          onChange={(event) => {
            lastEmitted.current = '';
            onChange(event.target.value);
          }}
          spellCheck={false}
          aria-label="HTML 원본"
          className="min-h-64 w-full resize-y bg-surface px-4 py-3 font-mono text-xs leading-relaxed outline-none"
        />
      ) : (
        <div className="relative">
          <div
            ref={editorRef}
            id={id}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            onInput={emit}
            onBlur={rememberSelection}
            onPaste={handlePaste}
            className={EDITOR_STYLE}
          />
          {empty && (
            <p className="pointer-events-none absolute left-4 top-3 text-sm text-ink-faint">{hint}</p>
          )}
        </div>
      )}
    </div>
  );
}
