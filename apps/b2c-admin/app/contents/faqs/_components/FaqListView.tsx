'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import { AdminListToolbar } from '@/app/_components/AdminListToolbar';
import { useToast } from '@winpilot/ui';
import {
  FAQ_CATEGORIES,
  FAQS,
  nextContentId,
  type FaqCategoryRecord,
  type FaqRecord,
} from '@/lib/data/contents';
import { todayStamp } from '@/lib/data/product-tags';
import type { FaqFormInput } from '@/lib/validation/content-record';
import { FaqCategoryModal, type FaqCategoryInput } from './FaqCategoryModal';
import { FaqFormModal, type FaqFormMode } from './FaqFormModal';

const TAB_VISIBLE: Record<string, boolean | null> = { all: null, shown: true, hidden: false };
const TAB_LABEL: Record<string, string> = { all: '전체', shown: '노출', hidden: '숨김' };

// shrink-0 · whitespace-nowrap — 좁은 폭에서 flex 가 버튼을 눌러 글자가 접히는 것을 막는다.
const ACTION_BUTTON = 'h-8 shrink-0 whitespace-nowrap rounded-lg border px-3 text-sm transition-colors duration-150';
const NEUTRAL_ACTION = `${ACTION_BUTTON} border-border-strong text-ink-muted hover:border-ink-faint`;
const DANGER_ACTION = `${ACTION_BUTTON} border-border-strong text-signal-danger hover:border-signal-danger`;

/** 행 클릭이 선택/상세를 담당하므로, 행 안의 버튼은 자기 동작만 하도록 전파를 끊는다. */
const stopRowClick = (event: MouseEvent) => event.stopPropagation();

function VisibilityBadge({ visible }: { visible: boolean }) {
  return (
    <span
      className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
        visible ? 'bg-signal-ok/12 text-signal-ok' : 'bg-surface text-ink-muted'
      }`}
    >
      {visible ? '노출' : '숨김'}
    </span>
  );
}

/** HTML 답변에서 목록에 보여줄 한 줄을 뽑는다. */
function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

type CategoryTarget = { mode: 'create' | 'edit'; record: FaqCategoryRecord | null };
type FaqTarget = { mode: FaqFormMode; record: FaqRecord | null };
type DeleteTarget = { kind: 'category'; record: FaqCategoryRecord } | { kind: 'faq'; record: FaqRecord };

/**
 * FAQ 관리 — 왼쪽에서 **카테고리**를 고르고 오른쪽에서 그 카테고리의 **항목**을 다룬다.
 *
 * 카테고리와 항목을 한 표에 섞으면 "어느 카테고리에 넣는 중인지" 가 사라진다.
 * 카테고리를 지우면 그 안의 FAQ 도 함께 사라진다 — 주인 없는 항목이 남으면 목록이 깨진다.
 *
 * **프론트엔드 전용** — 서버 없이 이 화면의 상태가 목록의 원본이다.
 */
export function FaqListView() {
  const toast = useToast();
  const [categories, setCategories] = useState<FaqCategoryRecord[]>(FAQ_CATEGORIES);
  const [faqs, setFaqs] = useState<FaqRecord[]>(FAQS);
  const [activeTabId, setActiveTabId] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(FAQ_CATEGORIES[0]?.id ?? '');

  const [categoryForm, setCategoryForm] = useState<CategoryTarget | null>(null);
  const [faqForm, setFaqForm] = useState<FaqTarget | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null);

  const faqsOf = (categoryId: string) => faqs.filter((faq) => faq.categoryId === categoryId);

  const matchesTab = (visible: boolean) => {
    const wanted = TAB_VISIBLE[activeTabId];
    return wanted === null || wanted === undefined || visible === wanted;
  };

  const keyword = search.trim().toLowerCase();

  const matchesFaq = (faq: FaqRecord) => {
    if (!matchesTab(faq.visible)) return false;
    if (!keyword) return true;
    return faq.question.toLowerCase().includes(keyword) || plainText(faq.answer).toLowerCase().includes(keyword);
  };

  // 카테고리는 자기 자신이 걸리거나 그 안의 FAQ 가 걸리면 남긴다 — 항목을 찾을 때 상위가 사라지면 못 찾는다.
  const visibleCategories = useMemo(
    () =>
      categories.filter((category) => {
        const selfMatch = matchesTab(category.visible) && (!keyword || category.name.toLowerCase().includes(keyword));
        return selfMatch || faqsOf(category.id).some(matchesFaq);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, faqs, activeTabId, search],
  );

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

  const visibleFaqs = useMemo(
    () => (selectedCategory ? faqsOf(selectedCategory.id).filter((faq) => matchesFaq(faq) || matchesTab(selectedCategory.visible)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [faqs, selectedCategoryId, activeTabId, search],
  );

  // 필터 때문에 선택한 카테고리가 목록에서 사라지면 첫 번째로 옮긴다.
  useEffect(() => {
    if (visibleCategories.length === 0) return;
    if (!visibleCategories.some((category) => category.id === selectedCategoryId)) {
      setSelectedCategoryId(visibleCategories[0]?.id ?? '');
    }
  }, [visibleCategories, selectedCategoryId]);

  const tabs = useMemo(
    () =>
      Object.keys(TAB_VISIBLE).map((id) => {
        const wanted = TAB_VISIBLE[id];
        return {
          id,
          label: TAB_LABEL[id] ?? id,
          count:
            wanted === null || wanted === undefined
              ? faqs.length
              : faqs.filter((faq) => faq.visible === wanted).length,
        };
      }),
    [faqs],
  );

  const submitCategory = (input: FaqCategoryInput) => {
    if (!categoryForm) return;

    const duplicate = categories.some(
      (category) => category.name === input.name && category.id !== (categoryForm.record?.id ?? ''),
    );
    if (duplicate) {
      toast.error({ message: '이미 있는 카테고리 이름입니다.', detail: input.name });
      return;
    }

    if (categoryForm.mode === 'create') {
      const id = nextContentId('FC', categories.map((category) => category.id));
      setCategories((previous) => [...previous, { id, ...input }]);
      setSelectedCategoryId(id);
      toast.success({ message: 'FAQ 카테고리를 추가했습니다.', detail: `${input.name} · ${id}` });
    } else if (categoryForm.record) {
      const targetId = categoryForm.record.id;
      setCategories((previous) =>
        previous.map((category) => (category.id === targetId ? { ...category, ...input } : category)),
      );
      toast.success({ message: 'FAQ 카테고리를 저장했습니다.', detail: `${input.name} · ${targetId}` });
    }
    setCategoryForm(null);
  };

  const submitFaq = (input: FaqFormInput) => {
    if (!faqForm || !selectedCategory) return;

    if (faqForm.mode === 'create') {
      const id = nextContentId('FQ', faqs.map((faq) => faq.id));
      setFaqs((previous) => [
        ...previous,
        {
          id,
          categoryId: selectedCategory.id,
          question: input.question.trim(),
          answer: input.answer,
          visible: input.visible,
          createdAt: todayStamp(),
        },
      ]);
      toast.success({ message: 'FAQ를 등록했습니다.', detail: `${selectedCategory.name} · ${input.question.trim()}` });
    } else if (faqForm.record) {
      const targetId = faqForm.record.id;
      setFaqs((previous) =>
        previous.map((faq) =>
          faq.id === targetId
            ? { ...faq, question: input.question.trim(), answer: input.answer, visible: input.visible }
            : faq,
        ),
      );
      toast.success({ message: 'FAQ를 저장했습니다.', detail: `${selectedCategory.name} · ${input.question.trim()}` });
    }
    setFaqForm(null);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;

    if (pendingDelete.kind === 'category') {
      const target = pendingDelete.record;
      const removedFaqs = faqsOf(target.id).length;
      // 카테고리를 지우면 그 안의 FAQ 도 함께 사라진다 — 주인 없는 항목이 남으면 목록이 깨진다.
      setCategories((previous) => previous.filter((category) => category.id !== target.id));
      setFaqs((previous) => previous.filter((faq) => faq.categoryId !== target.id));
      setPendingDelete(null);
      toast.success({
        message: 'FAQ 카테고리를 삭제했습니다.',
        detail: removedFaqs > 0 ? `${target.name} · FAQ ${removedFaqs}건도 함께 삭제되었습니다.` : target.name,
      });
      return;
    }

    const target = pendingDelete.record;
    setFaqs((previous) => previous.filter((faq) => faq.id !== target.id));
    setPendingDelete(null);
    toast.success({ message: 'FAQ를 삭제했습니다.', detail: target.question });
  };

  return (
    <>
      <AdminListToolbar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        searchId="faq-search"
        searchLabel="FAQ 검색"
        searchHint="질문, 답변, 카테고리명으로 검색"
        searchValue={search}
        onSearchChange={setSearch}
        actionLabel="카테고리 추가"
        onAction={() => setCategoryForm({ mode: 'create', record: null })}
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* 카테고리 — 고르면 오른쪽에 그 안의 FAQ 가 펼쳐진다 */}
        <section className="w-full shrink-0 overflow-hidden rounded-xl border border-border bg-canvas lg:w-112 xl:w-128">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold">카테고리</h2>
            <button
              type="button"
              onClick={() => setCategoryForm({ mode: 'create', record: null })}
              className="h-8 shrink-0 whitespace-nowrap rounded-lg bg-brand-500 px-3 text-sm font-medium text-white hover:bg-brand-600"
            >
              추가
            </button>
          </div>

          {visibleCategories.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-ink-muted">조건에 맞는 카테고리가 없습니다.</p>
          ) : (
            <>
              <div className="hidden gap-4 border-b border-border px-5 py-3 text-xs text-ink-faint lg:grid lg:grid-cols-12 lg:items-center">
                <span className="lg:col-span-1 lg:text-center">순번</span>
                <span className="lg:col-span-4">카테고리명</span>
                <span className="lg:col-span-2">FAQ</span>
                <span className="lg:col-span-2 lg:text-center">노출</span>
                <span className="lg:col-span-3 lg:text-right">관리</span>
              </div>

              <div className="flex flex-col">
                {visibleCategories.map((category, index) => {
                  const active = category.id === selectedCategoryId;
                  return (
                    <div
                      key={category.id}
                      onClick={() => setSelectedCategoryId(category.id)}
                      className={`grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 transition-colors duration-100 last:border-b-0 lg:grid-cols-12 lg:items-center lg:gap-y-0 ${
                        active ? 'bg-brand-50 dark:bg-brand-900' : 'hover:bg-surface'
                      }`}
                    >
                      <span className="font-mono text-sm tabular-nums text-ink-faint lg:col-span-1 lg:text-center">
                        {index + 1}
                      </span>

                      <div className="min-w-0 lg:col-span-4">
                        <p
                          className={`truncate text-sm font-medium ${active ? 'text-brand-700 dark:text-brand-200' : ''}`}
                        >
                          {category.name}
                        </p>
                        <p className="font-mono text-xs text-ink-faint">{category.id}</p>
                      </div>

                      <div className="flex items-baseline gap-2 lg:col-span-2">
                        <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">FAQ</span>
                        <span className="text-sm tabular-nums text-ink-muted">{faqsOf(category.id).length}</span>
                      </div>

                      <div className="flex items-center gap-2 lg:col-span-2 lg:justify-center">
                        <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">노출</span>
                        <VisibilityBadge visible={category.visible} />
                      </div>

                      <div className="flex items-center gap-2 lg:col-span-3 lg:justify-end" onClick={stopRowClick}>
                        <button
                          type="button"
                          onClick={() => setCategoryForm({ mode: 'edit', record: category })}
                          className={NEUTRAL_ACTION}
                        >
                          조회
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete({ kind: 'category', record: category })}
                          className={DANGER_ACTION}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* 선택한 카테고리의 FAQ */}
        <section className="min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-canvas">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
            <h2 className="min-w-0 truncate text-sm font-semibold">
              FAQ
              {selectedCategory && <span className="ml-2 font-normal text-ink-muted">{selectedCategory.name}</span>}
            </h2>
            <button
              type="button"
              disabled={!selectedCategory}
              onClick={() => selectedCategory && setFaqForm({ mode: 'create', record: null })}
              className="h-8 shrink-0 whitespace-nowrap rounded-lg bg-brand-500 px-3 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              등록
            </button>
          </div>

          {!selectedCategory ? (
            <p className="px-5 py-16 text-center text-sm text-ink-muted">왼쪽에서 카테고리를 선택하세요.</p>
          ) : visibleFaqs.length === 0 ? (
            <p className="px-5 py-16 text-center text-sm text-ink-muted">
              {selectedCategory.name} 카테고리에 FAQ가 없습니다. 오른쪽 위 등록을 눌러 만드세요.
            </p>
          ) : (
            <>
              <div className="hidden gap-4 border-b border-border px-5 py-3 text-xs text-ink-faint lg:grid lg:grid-cols-12 lg:items-center">
                <span className="lg:col-span-1 lg:text-center">순번</span>
                <span className="lg:col-span-4">질문</span>
                <span className="lg:col-span-2">등록일</span>
                <span className="lg:col-span-2 lg:text-center">노출</span>
                <span className="lg:col-span-3 lg:text-right">관리</span>
              </div>

              <div className="flex flex-col">
                {visibleFaqs.map((faq, index) => (
                  <div
                    key={faq.id}
                    onClick={() => setFaqForm({ mode: 'edit', record: faq })}
                    className="grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 transition-colors duration-100 last:border-b-0 hover:bg-surface lg:grid-cols-12 lg:items-center lg:gap-y-0"
                  >
                    <span className="font-mono text-sm tabular-nums text-ink-faint lg:col-span-1 lg:text-center">
                      {index + 1}
                    </span>

                    <div className="min-w-0 lg:col-span-4">
                      <p className="truncate text-sm font-medium">{faq.question}</p>
                      <p className="truncate text-xs text-ink-faint">{plainText(faq.answer)}</p>
                    </div>

                    <div className="flex items-baseline gap-2 lg:col-span-2">
                      <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">등록일</span>
                      <span className="font-mono text-xs tabular-nums text-ink-muted">{faq.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-2 lg:col-span-2 lg:justify-center">
                      <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">노출</span>
                      <VisibilityBadge visible={faq.visible} />
                    </div>

                    <div className="flex items-center gap-2 lg:col-span-3 lg:justify-end" onClick={stopRowClick}>
                      <button
                        type="button"
                        onClick={() => setFaqForm({ mode: 'edit', record: faq })}
                        className={NEUTRAL_ACTION}
                      >
                        조회
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete({ kind: 'faq', record: faq })}
                        className={DANGER_ACTION}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <FaqCategoryModal
        open={categoryForm !== null}
        mode={categoryForm?.mode ?? 'create'}
        {...(categoryForm?.record
          ? { initial: { name: categoryForm.record.name, visible: categoryForm.record.visible } }
          : {})}
        onClose={() => setCategoryForm(null)}
        onSubmit={submitCategory}
      />

      <FaqFormModal
        open={faqForm !== null}
        mode={faqForm?.mode ?? 'create'}
        categoryName={selectedCategory?.name ?? ''}
        categoryId={selectedCategory?.id ?? ''}
        {...(faqForm?.record
          ? {
              initial: {
                categoryId: faqForm.record.categoryId,
                question: faqForm.record.question,
                answer: faqForm.record.answer,
                visible: faqForm.record.visible,
              },
            }
          : {})}
        onClose={() => setFaqForm(null)}
        onSubmit={submitFaq}
      />

      <AdminConfirmModal
        open={pendingDelete !== null}
        title={pendingDelete?.kind === 'category' ? 'FAQ 카테고리 삭제' : 'FAQ 삭제'}
        description={
          pendingDelete?.kind === 'category'
            ? `'${pendingDelete.record.name}' 을 삭제합니다. 이 카테고리의 FAQ도 함께 삭제됩니다.`
            : 'FAQ를 삭제합니다. 되돌릴 수 없습니다.'
        }
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
