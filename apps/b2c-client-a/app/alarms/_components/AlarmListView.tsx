'use client';

import { useMemo, useState } from 'react';
import { COPY, SLOT, cid, type AlarmItem } from '@winpilot/client-content';

/**
 * 알람 목록 — **읽지 않음 / 읽음** 으로 나눠 본다.
 *
 * 한 줄에 섞어 두면 새로 온 것이 아래로 밀려 묻힌다. 기본은 '읽지 않음' 이다 —
 * 이 화면에 들어오는 이유가 대개 그것이기 때문이다.
 *
 * 읽음 여부는 색만이 아니라 **점**으로도 구분한다. 색만 쓰면 색각 이상 사용자가 놓친다.
 *
 * ## 어드민 연동
 * - 알람의 종류(주문·공지·혜택)는 어드민에서 그 자원을 바꿀 때 붙는다
 */
const TABS = [
  { id: 'unread', label: COPY.alarm.unread },
  { id: 'read', label: '읽음' },
  { id: 'all', label: '전체' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function AlarmListView({ alarms }: { alarms: AlarmItem[] }) {
  const [tabId, setTabId] = useState<TabId>('unread');

  const counts = useMemo(
    () => ({
      unread: alarms.filter((alarm) => !alarm.read).length,
      read: alarms.filter((alarm) => alarm.read).length,
      all: alarms.length,
    }),
    [alarms],
  );

  const visible = useMemo(() => {
    if (tabId === 'unread') return alarms.filter((alarm) => !alarm.read);
    if (tabId === 'read') return alarms.filter((alarm) => alarm.read);
    return alarms;
  }, [alarms, tabId]);

  return (
    <>
      <div role="tablist" aria-label={COPY.alarm.title} className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => {
          const active = tab.id === tabId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTabId(tab.id)}
              className={`flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm transition-colors duration-150 ${
                active
                  ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                  : 'bg-surface text-ink-muted'
              }`}
            >
              {tab.label}
              <span className="text-xs tabular-nums text-ink-faint">{counts[tab.id]}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-ink-muted">{COPY.alarm.empty}</p>
      ) : (
        <section
          id={SLOT.alarmList}
          data-ssot-cid={cid('alarm.list', 'SiteAlarmList')}
          className="flex flex-col overflow-hidden rounded-xl border border-border"
        >
          {visible.map((alarm) => (
            <a
              key={alarm.id}
              href={alarm.href}
              className={`flex items-start gap-3 border-b border-border px-5 py-4 last:border-b-0 hover:bg-surface ${
                alarm.read ? '' : 'bg-brand-50/40 dark:bg-brand-900/30'
              }`}
            >
              <span
                className={`mt-1.5 size-2 shrink-0 rounded-full ${alarm.read ? 'bg-border-strong' : 'bg-brand-500'}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 text-3xs text-ink-muted">
                    {alarm.kind}
                  </span>
                  <span className="min-w-0 truncate text-sm font-medium">{alarm.title}</span>
                </div>
                <p className="mt-1 min-w-0 truncate text-xs text-ink-muted">{alarm.body}</p>
              </div>
              <span className="shrink-0 whitespace-nowrap font-mono text-xs tabular-nums text-ink-faint">
                {alarm.createdAt.slice(5)}
              </span>
            </a>
          ))}
        </section>
      )}
    </>
  );
}
