'use client';

import { useState } from 'react';
import { ChevronDown, Pin } from 'lucide-react';
import { SITE_NOTICE_GROUPS, type SiteNotice } from '@winpilot/store';
import { SupportBrowser } from '@/app/support/_components/SupportBrowser';

/**
 * 공지사항 — **갈래 · 검색 · 접히는 목록**.
 *
 * 뉴스 · FAQ 와 같은 틀이다(`SupportBrowser`) — 왼쪽에 갈래, 오른쪽에 검색과 결과. CS CENTER
 * 안을 오가는 사람이 화면마다 다른 배치를 다시 익히지 않아도 된다.
 *
 * ## 상세 화면으로 보내지 않는다
 * 공지는 대개 서너 문단이다. 그것 때문에 화면을 옮기면 읽고 나서 목록으로 **돌아와야** 하고,
 * 셋을 읽으려면 여섯 번 오간다. 제자리에서 펼치면 방금 읽은 것 아래에 다음 것이 그대로 있다.
 *
 * 대신 주소로 특정 공지를 가리킬 수는 없다. 공지를 링크로 보내는 일은 드물고, 그럴 때는
 * 목록 주소로 보내도 맨 위 고정 공지가 눈에 들어온다 — 그 거래를 택했다.
 *
 * ## 고정을 위로 올리되 표시를 함께 둔다
 * 고정한 공지가 날짜 차례 안에 섞여 있으면 고정한 뜻이 없다. 다만 표시 없이 순서만 바꾸면
 * 오래된 글이 맨 위에 있는 것으로 읽혀, 목록이 관리되지 않는다는 인상을 준다.
 *
 * ## 첫 줄을 열어 둔다
 * 전부 접어 두면 화면이 제목만 늘어선 줄이 되고, 처음 온 사람은 **펼칠 수 있다는 것조차**
 * 모른 채 지나간다. 맨 위 하나만 열어 두면 나머지도 같은 것임을 알아본다.
 */
export function NoticeListView({ notices }: { notices: SiteNotice[] }) {
  /** 고정을 먼저, 그 안에서 최신순. 값의 차례에 기대지 않는다 — 어드민에서 순서가 바뀐다. */
  const rows = [...notices].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.postedAt.localeCompare(a.postedAt);
  });

  const [opened, setOpened] = useState<string | null>(rows[0]?.id ?? null);

  return (
    <SupportBrowser
      items={rows}
      facets={SITE_NOTICE_GROUPS}
      facetOf={(one) => one.group}
      searchLabel="공지사항 검색"
      searchPlaceholder="제목 · 내용"
      searchIn={(one) => [one.title, ...one.body]}
      empty="조건에 맞는 공지가 없습니다."
    >
      {(shown) => (
        <ul className="border-t border-border-strong">
          {shown.map((one) => {
            const open = one.id === opened;

            return (
              <li key={one.id} className="border-b border-border">
                <h2>
                  <button
                    type="button"
                    onClick={() => setOpened(open ? null : one.id)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-4 px-1 py-5 text-left transition-colors duration-150 hover:text-brand"
                  >
                    {one.pinned && (
                      <span className="flex shrink-0 items-center gap-1 rounded bg-brand/10 px-2 py-1 text-xs font-medium text-brand">
                        <Pin aria-hidden className="size-3" strokeWidth={2} />
                        고정
                      </span>
                    )}

                    <span className="shrink-0 text-xs text-ink-faint">{one.group}</span>

                    <span className="min-w-0 flex-1 text-base font-medium leading-relaxed">
                      {one.title}
                    </span>

                    <time
                      dateTime={one.postedAt}
                      className="shrink-0 font-mono text-xs tabular-nums text-ink-faint"
                    >
                      {one.postedAt}
                    </time>

                    <ChevronDown
                      aria-hidden
                      strokeWidth={1.8}
                      className={`size-4 shrink-0 text-ink-faint transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </h2>

                {open && (
                  <div className="flex flex-col gap-4 px-1 pb-7 pt-1">
                    {one.body.map((paragraph, index) => (
                      <p key={index} className="text-sm leading-relaxed text-ink-muted">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </SupportBrowser>
  );
}
