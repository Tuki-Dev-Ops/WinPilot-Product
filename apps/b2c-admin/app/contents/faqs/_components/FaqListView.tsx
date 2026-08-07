'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { AdminConfirmModal } from '@/app/_components/AdminConfirmModal';
import { ChevronLeft } from 'lucide-react';
import { Badge, ListSelectionBar, ListToolbar, PageHeading, RowActionGroup, RowSelectCell, SelectAllCell, useToast } from '@winpilot/ui';
import { FAQ_CATEGORIES, FAQS, nextContentId, type FaqCategoryRecord, type FaqRecord } from '@/lib/data/contents';
import { todayStamp } from '@/lib/data/product-tags';
import type { FaqFormInput } from '@/lib/validation/content-record';
import { FaqCategoryModal, type FaqCategoryInput } from './FaqCategoryModal';
import { FaqFormModal, type FaqFormMode } from './FaqFormModal';
import { AdminVisibilityBadge } from '@/app/_components/AdminVisibilityBadge';

const TAB_VISIBLE: Record<string, boolean | null> = { all: null, shown: true, hidden: false };
const TAB_LABEL: Record<string, string> = { all: '전체', shown: '노출', hidden: '숨김' };




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
/*
  지울 것을 **배열로 든다.** 한 줄을 지우든 골라 지우든 같은 확인 창을 지나게 하려는 것이다 —
  둘을 따로 두면 한쪽에만 확인이 붙고, 빠진 것을 알아차리는 때는 이미 지워진 뒤다.
*/
/** 이름을 셋까지만 잇는다 — 스무 개를 늘어놓은 문장은 아무도 읽지 않는다. */
function names(list: string[]): string {
  return list.slice(0, 3).join(' · ') + (list.length > 3 ? ` 외 ${list.length - 3}건` : '');
}

type DeleteTarget =
  | { kind: 'category'; records: FaqCategoryRecord[] }
  | { kind: 'faq'; records: FaqRecord[] };

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
  /**
   * 지금 펼친 카테고리. **처음에는 아무것도 고르지 않았다.**
   *
   * 전에는 첫 카테고리를 미리 골라 두고 오른쪽 판을 늘 띄웠다. 그러면 들어오자마자 판 둘이 서고
   * 그중 하나는 **내가 고른 적 없는 것**의 목록이다 — 무엇을 보고 있는지 알려면 왼쪽에서 어느
   * 줄이 켜져 있는지 먼저 찾아야 했다.
   */
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

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
  /*
    고르는 칸. 하나라도 고르면 머리글 위에 **선택 줄**이 열린다(`ListSelectionBar`) — 지우는 일은
    줄마다의 휴지통이 이미 맡고 있고, 카테고리를 여럿 한꺼번에 지우면 그 아래 FAQ 가 어디로 가는지
    물어볼 자리가 없다. 그래도 칸은 둔다: 표마다 맨 왼쪽이 같은 자리여야 눈이 헤매지 않는다.
  */
  const [pickedCategories, setPickedCategories] = useState<string[]>([]);
  const [pickedFaqs, setPickedFaqs] = useState<string[]>([]);

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
      const targets = pendingDelete.records;
      const ids = targets.map((one) => one.id);
      const removedFaqs = targets.reduce((sum, one) => sum + faqsOf(one.id).length, 0);
      // 카테고리를 지우면 그 안의 FAQ 도 함께 사라진다 — 주인 없는 항목이 남으면 목록이 깨진다.
      setCategories((previous) => previous.filter((category) => !ids.includes(category.id)));
      setFaqs((previous) => previous.filter((faq) => !ids.includes(faq.categoryId)));
      setPickedCategories((previous) => previous.filter((id) => !ids.includes(id)));
      setPendingDelete(null);
      toast.success({
        message: `FAQ 카테고리 ${targets.length}건을 삭제했습니다.`,
        detail:
          removedFaqs > 0
            ? `${names(targets.map((one) => one.name))} · FAQ ${removedFaqs}건도 함께 삭제되었습니다.`
            : names(targets.map((one) => one.name)),
      });
      return;
    }

    const targets = pendingDelete.records;
    const ids = targets.map((one) => one.id);
    setFaqs((previous) => previous.filter((faq) => !ids.includes(faq.id)));
    setPickedFaqs((previous) => previous.filter((id) => !ids.includes(id)));
    setPendingDelete(null);
    toast.success({
      message: `FAQ ${targets.length}건을 삭제했습니다.`,
      detail: names(targets.map((one) => one.question)),
    });
  };

  return (
    <>
      <PageHeading title="FAQ" description="자주 묻는 질문과 분류를 관리하세요." />

      <ListToolbar
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

      {/*
        판 **하나만** 선다. 카테고리를 고르기 전에는 카테고리 목록, 고르고 나면 그 안의 FAQ 다.

        카테고리 화면과 같은 짜임이다 — 같은 일(묶음을 고르고 그 안을 본다)을 하는 두 화면이
        서로 다르게 움직이면 읽는 법을 두 번 배워야 한다.
      */}
      <div className="flex flex-col gap-6">
        {!selectedCategory && (
        <section className="w-full overflow-hidden rounded-xl border border-border bg-canvas">
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
              <ListSelectionBar
                count={pickedCategories.length}
                onClear={() => setPickedCategories([])}
                onDelete={() =>
                  setPendingDelete({
                    kind: 'category',
                    records: visibleCategories.filter((one) => pickedCategories.includes(one.id)),
                  })
                }
              />

              {/* 머리 줄에는 전체 선택과 이름만 — 오른쪽에 서는 값은 그 자체가 무엇인지 말한다. */}
              <div className="flex items-center gap-3 border-b border-border px-5 py-3 text-xs text-ink-faint">
                <SelectAllCell
                  checked={visibleCategories.length > 0 && pickedCategories.length === visibleCategories.length}
                  indeterminate={pickedCategories.length > 0}
                  onChange={(checked) =>
                    setPickedCategories(checked ? visibleCategories.map((one) => one.id) : [])
                  }
                />
                <span>카테고리명</span>
              </div>

              <div className="flex flex-col">
                {visibleCategories.map((category, index) => {
                  const active = category.id === selectedCategoryId;
                  return (
                    <div
                      key={category.id}
                      onClick={() => setSelectedCategoryId(category.id)}
                      className={`group flex cursor-pointer items-center gap-3 border-b border-border px-5 py-3.5 transition-colors duration-100 last:border-b-0 ${
                        active ? 'bg-brand-50 dark:bg-brand-900' : 'hover:bg-surface'
                      }`}
                    >
                      <RowSelectCell
                        checked={pickedCategories.includes(category.id)}
                        onChange={(checked) =>
                          setPickedCategories((previous) =>
                            checked ? [...previous, category.id] : previous.filter((one) => one !== category.id),
                          )
                        }
                        label={`${category.name} 선택`}
                        index={index}
                      />

                      {/* 이름이 먼저, 코드와 개수가 그 아래 한 줄. 둘은 같은 것에 딸린 값이라 붙여 둔다. */}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-medium ${active ? 'text-brand-700 dark:text-brand-200' : ''}`}
                        >
                          {category.name}
                        </p>
                        <p className="truncate font-mono text-xs text-ink-faint">
                          {category.id} · FAQ {faqsOf(category.id).length}
                        </p>
                      </div>

                      <AdminVisibilityBadge visible={category.visible} />

                      <RowActionGroup
                        label={`${category.name} 상세`}
                        onView={() => setCategoryForm({ mode: 'edit', record: category })}
                        onEdit={() => setCategoryForm({ mode: 'edit', record: category })}
                        onDelete={() => setPendingDelete({ kind: 'category', records: [category] })}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
        )}

        {/* 고른 카테고리의 FAQ — 이때는 카테고리 목록이 사라지고 이 판이 화면을 다 쓴다. */}
        {selectedCategory && (
        <section className="w-full min-w-0 overflow-hidden rounded-xl border border-border bg-canvas">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
            {/*
              돌아가는 길을 **제목 자리에** 둔다. 오른쪽 위 `등록` 옆에 두면 만드는 단추와 나가는
              단추가 나란히 서서, 급할 때 둘을 헷갈린다.
            */}
            <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-ink-muted transition-colors duration-150 hover:bg-surface hover:text-ink"
              >
                <ChevronLeft aria-hidden className="size-4" strokeWidth={1.6} />
                카테고리
              </button>
              <span className="shrink-0 text-ink-faint">/</span>
              <span className="min-w-0 truncate">{selectedCategory.name}</span>
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

          {visibleFaqs.length === 0 ? (
            <p className="px-5 py-16 text-center text-sm text-ink-muted">
              {selectedCategory.name} 카테고리에 FAQ가 없습니다. 오른쪽 위 등록을 눌러 만드세요.
            </p>
          ) : (
            <>
              <ListSelectionBar
                count={pickedFaqs.length}
                onClear={() => setPickedFaqs([])}
                onDelete={() =>
                  setPendingDelete({
                    kind: 'faq',
                    records: visibleFaqs.filter((one) => pickedFaqs.includes(one.id)),
                  })
                }
              />

              <div className="hidden gap-4 border-b border-border px-5 py-3 text-xs text-ink-faint lg:grid lg:grid-cols-12 lg:items-center">
                <SelectAllCell
                  checked={visibleFaqs.length > 0 && pickedFaqs.length === visibleFaqs.length}
                  indeterminate={pickedFaqs.length > 0}
                  onChange={(checked) => setPickedFaqs(checked ? visibleFaqs.map((one) => one.id) : [])}
                />
                <span className="lg:col-span-4">질문</span>
                <span className="lg:col-span-2">등록일</span>
                <span className="lg:col-span-2 lg:text-center">상태</span>
                <span className="lg:col-span-3 lg:text-center">관리</span>
              </div>

              <div className="flex flex-col">
                {visibleFaqs.map((faq, index) => (
                  <div
                    key={faq.id}
                    onClick={() => setFaqForm({ mode: 'edit', record: faq })}
                    className="group grid cursor-pointer grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-5 py-4 transition-colors duration-100 last:border-b-0 hover:bg-surface lg:grid-cols-12 lg:items-center lg:gap-y-0"
                  >
                    <RowSelectCell
                      checked={pickedFaqs.includes(faq.id)}
                      onChange={(checked) =>
                        setPickedFaqs((previous) =>
                          checked ? [...previous, faq.id] : previous.filter((one) => one !== faq.id),
                        )
                      }
                      label={`${faq.question} 선택`}
                      index={index}
                    />

                    <div className="min-w-0 lg:col-span-4">
                      <p className="min-w-0 truncate text-sm font-medium">{faq.question}</p>
                      <p className="min-w-0 truncate text-xs text-ink-faint">{plainText(faq.answer)}</p>
                    </div>

                    <div className="flex items-baseline gap-2 lg:col-span-2">
                      <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">등록일</span>
                      <span className="font-mono text-xs tabular-nums text-ink-muted">{faq.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-2 lg:col-span-2 lg:justify-center">
                      <span className="w-16 shrink-0 text-xs text-ink-faint lg:hidden">상태</span>
                      <AdminVisibilityBadge visible={faq.visible} />
                    </div>

                    <div className="lg:col-span-3">
                      <RowActionGroup
                        label={`${faq.question} 상세`}
                        onView={() => setFaqForm({ mode: 'edit', record: faq })}
                        onEdit={() => setFaqForm({ mode: 'edit', record: faq })}
                        onDelete={() => setPendingDelete({ kind: 'faq', records: [faq] })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
        )}
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
            ? `${names(pendingDelete.records.map((one) => one.name))} 을(를) 삭제합니다. 이 카테고리의 FAQ도 함께 삭제됩니다.`
            : `${names(pendingDelete?.records.map((one) => one.question) ?? [])} 을(를) 삭제합니다. 되돌릴 수 없습니다.`
        }
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
