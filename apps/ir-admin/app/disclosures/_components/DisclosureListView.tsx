'use client';

import { useMemo, useState } from 'react';
import { Badge, ListToolbar, PageHeading, type ListToolbarTab, useToast } from '@winpilot/ui';
import { DISCLOSURES, publicDisclosures, type Disclosure, type DisclosureState } from '@winpilot/store';
import { IrConfirmModal } from '@/app/_components/IrConfirmModal';
import { IrRecordTable } from '@/app/_components/IrRecordTable';
import { DisclosureDetailModal } from './DisclosureDetailModal';

const STATE_TONE = {
  '작성 중': 'neutral',
  '검토 요청': 'wait',
  공시됨: 'ok',
  정정: 'brand',
} as const;

const COLUMNS = [
  { label: '제목', span: 'lg:col-span-4' },
  { label: '구분', span: 'lg:col-span-1 lg:text-center' },
  { label: '공시일', span: 'lg:col-span-2' },
  { label: '상태', span: 'lg:col-span-2 lg:text-center' },
];

/**
 * 공시 관리.
 *
 * ## 원고와 공시를 한 목록에 둔다
 * 갈라 두면 **내보내지 않은 원고를 잊는다** — 공시는 기한이 있고 늦으면 제재를 받는 유일한
 * 갈래다. 대신 상태를 색과 글자로 갈라, 사이트에 서 있는 것과 아닌 것이 한눈에 보이게 한다.
 *
 * ## 게시는 되돌릴 수 없다
 * 나간 공시는 지우지 못하고 **정정 공시로만** 고친다. 그래서 게시 앞에 확인 창을 세운다 —
 * 확인 창의 값어치는 막는 데 있지 않고 무엇이 회사 이름으로 나가는지 읽게 하는 데 있다.
 *
 * **프론트엔드 전용** — 게시 결과는 이 화면에만 반영된다.
 */
export function DisclosureListView() {
  const toast = useToast();
  const [rows, setRows] = useState<Disclosure[]>(DISCLOSURES);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<Disclosure | null>(null);

  const tabs: ListToolbarTab[] = [
    { id: 'all', label: '전체', count: rows.length },
    { id: 'draft', label: '내보내기 전', count: rows.filter((one) => one.state === '작성 중' || one.state === '검토 요청').length },
    { id: '공시됨', label: '공시됨', count: rows.filter((one) => one.state === '공시됨').length },
    { id: '정정', label: '정정', count: rows.filter((one) => one.state === '정정').length },
  ];

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows
      .filter((one) => {
        if (tab === 'draft' && one.state !== '작성 중' && one.state !== '검토 요청') return false;
        if (tab !== 'all' && tab !== 'draft' && one.state !== tab) return false;
        if (!keyword) return true;
        return one.title.toLowerCase().includes(keyword) || one.id.toLowerCase().includes(keyword);
      })
      .sort((a, b) => b.id.localeCompare(a.id));
  }, [rows, search, tab]);

  const opening = rows.find((one) => one.id === openId) ?? null;

  const publish = () => {
    if (!publishing) return;

    setRows((previous) =>
      previous.map((one) => (one.id === publishing.id ? { ...one, state: '공시됨' as DisclosureState, disclosedAt: '2026-08-06' } : one)),
    );
    setPublishing(null);
    setOpenId(null);
    toast.success({ message: '공시를 게시했습니다.', detail: `${publishing.id} · ${publishing.title}` });
  };

  return (
    <>
      <PageHeading title="공시 관리" description="내보내지 않은 원고와 이미 나간 공시를 함께 확인하세요." />

      {/* 등록 단추가 없다 — 새 공시는 원고에서 시작하며, 그 자리는 아직 정하지 않았다. */}
      <ListToolbar
        tabs={tabs}
        activeTabId={tab}
        onTabChange={setTab}
        searchId="disclosure-search"
        searchLabel="공시 검색"
        searchHint="제목, 공시 번호로 검색"
        searchValue={search}
        onSearchChange={setSearch}
      />

      <IrRecordTable
        title="공시"
        description="상태가 공시됨·정정인 것만 투자자 화면에 섭니다. 원고는 여기에만 있습니다."
        columns={COLUMNS}
        rows={visible}
        labelOf={(one) => one.title}
        onOpen={(one) => setOpenId(one.id)}
        empty="조건에 맞는 공시가 없습니다."
        foot={
          <p>
            사이트에 서 있는 것 <span className="font-medium tabular-nums text-ink">{publicDisclosures(rows).length}</span>건
          </p>
        }
        render={(one) => [
          <span key="title" className="min-w-0">
            <span className="block min-w-0 truncate text-sm font-medium">{one.title}</span>
            <span className="block min-w-0 truncate font-mono text-xs text-ink-faint">{one.id}</span>
          </span>,
          <span key="kind" className="min-w-0 truncate text-xs text-ink-muted">
            {one.kind}
          </span>,
          <span key="at" className="min-w-0 truncate font-mono text-xs tabular-nums text-ink-muted">
            {one.disclosedAt || <span className="text-ink-faint">아직 안 나감</span>}
          </span>,
          <Badge key="state" tone={STATE_TONE[one.state]}>
            {one.state}
          </Badge>,
        ]}
      />

      <DisclosureDetailModal
        open={opening !== null}
        disclosure={opening}
        onClose={() => setOpenId(null)}
        onPublish={() => opening && setPublishing(opening)}
      />

      <IrConfirmModal
        open={publishing !== null}
        title="이 공시를 게시할까요"
        message="회사 이름으로 나갑니다. 나간 뒤에는 지우지 못하고 정정 공시로만 고칩니다."
        detail={publishing ? `${publishing.id} · ${publishing.kind} · ${publishing.title}` : undefined}
        confirmLabel="게시"
        tone="danger"
        onConfirm={publish}
        onCancel={() => setPublishing(null)}
      />
    </>
  );
}
