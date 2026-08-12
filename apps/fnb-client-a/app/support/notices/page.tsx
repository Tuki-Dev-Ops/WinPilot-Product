import type { Metadata } from 'next';
import { orderedFnbNotices } from '@winpilot/store';
import { Accent, FnbPageTitle, FnbSiteShell } from '@/app/_components/FnbSiteShell';
import { FoldList } from '@/app/_components/FoldList';
import { SupportAside } from '@/app/support/_components/SupportAside';

/**
 * Feature: `support.notices` · F&B Client (템플릿 A) · route `/support/notices`
 *
 * ## 제목만 세우고 그 자리에서 편다
 * 흔한 모양은 제목 목록에서 눌러 **상세 화면으로 넘어가는 것**이다. 그러면 넷을 다 읽으려고
 * 네 번 들어갔다 나와야 한다. 반대로 다 펼쳐 두면 맨 아래 글에 닿기까지 앞의 셋을 지나야 한다.
 *
 * 그 자리에서 펴면 둘 다 없다 — 차례는 제목만 보고 훑고, 읽을 것 하나만 편다. 어떻게 접히고
 * 왜 하나만 열리는지는 `FoldList` 머리말에 있다.
 *
 * 상세 화면이 없으므로 주소도 없다. 그래서 개별 공지를 링크로 공유할 수 없는데, 지금 공지의
 * 성격(가격 조정 · 개점 · 휴점)에서 그 일이 실제로 일어나지 않는다.
 *
 * ## 고정한 글이 위로
 * 가격 인상처럼 **묻기 전에 읽혀야 하는 것**이 있다. 날짜 순으로만 세우면 그 글이 한 달 만에
 * 아래로 밀린다.
 *
 * ## 어드민 연동
 * - 공지 ← `@winpilot/store` 의 `FNB_NOTICES` (F&B 어드민 콘텐츠 > 공지사항)
 */
export const metadata: Metadata = { title: '공지사항' };

export default function NoticeListPage() {
  /* 차례를 세우는 일은 store 가 한다 — 홈의 공지 띠가 같은 차례를 읽는다(그쪽 머리말). */
  const notices = orderedFnbNotices();

  return (
    <FnbSiteShell>
      <FnbPageTitle
        label="Support"
        title={
          <>
            먼저 <Accent>알려 드립니다</Accent>
          </>
        }
        description="오시기 전에 알아 두시면 좋은 것들을 여기에 모아 둡니다. 값이 바뀌거나 새 매장이 열리면 가장 먼저 올립니다."
      />
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <SupportAside />

        <div className="flex min-w-0 flex-1 flex-col">
          {notices.length === 0 ? (
            <p className="rounded-2xl border border-border px-6 py-16 text-center text-sm text-ink-muted">
              아직 올라온 공지가 없습니다.
            </p>
          ) : (
            /*
              맨 위 하나는 펴 둔다(`openFirst`). 그 자리는 붙여 둔 글이 오는 곳이라, 들어오자마자
              전부 접혀 있으면 붙여 둔 뜻이 사라진다.
            */
            <FoldList
              openFirst
              items={notices.map((one) => ({
                id: one.id,
                head: (
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    {one.pinned && (
                      <span className="rounded-full bg-night px-2.5 py-1 text-xs font-medium text-white">
                        먼저 읽어 주세요
                      </span>
                    )}
                    <span className="text-base font-semibold">{one.title}</span>
                    <span className="font-mono text-xs tabular-nums text-ink-faint">{one.postedOn}</span>
                  </span>
                ),
                body: <p className="max-w-4xl text-sm leading-loose text-ink-muted">{one.body}</p>,
              }))}
            />
          )}
        </div>
      </div>
    </FnbSiteShell>
  );
}
