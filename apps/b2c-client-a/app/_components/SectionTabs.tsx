'use client';

/**
 * 목록 위 상태 탭 — **주문 내역 · 문의 내역 · 쿠폰함이 같은 것을 쓴다.**
 *
 * 세 화면 모두 '한 목록을 상태로 나눠 본다' 는 같은 일을 한다. 화면마다 다르게 그리면
 * 같은 조작을 매번 다시 익혀야 하고, 개수 표시가 있다 없다 하는 것도 그래서 생긴다.
 *
 * 개수는 **항상 함께 적는다.** 탭만 있으면 눌러 보기 전에는 그 안이 비었는지 알 수 없다.
 *
 * ## 어드민 연동
 * - 탭에 쓰는 상태 이름은 어드민 목록의 상태 값과 글자까지 같다 (문의: 접수·처리중·답변완료·보류 / 주문: 배송준비·배송중·배송완료)
 */
export type SectionTab = { id: string; label: string; count: number };

export function SectionTabs({
  tabs,
  activeId,
  onSelect,
  label,
}: {
  tabs: SectionTab[];
  activeId: string;
  onSelect: (id: string) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap items-center gap-x-6 border-b border-border">
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(tab.id)}
            className={`-mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 pb-3 pt-1 text-[15px] transition-colors duration-150 ${
              active ? 'border-ink font-bold text-ink' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {tab.label}
            <span className={`text-xs tabular-nums ${active ? 'text-ink-muted' : 'text-ink-faint'}`}>{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}
