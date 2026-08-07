'use client';

import { CREDENTIALS, type Credential } from '@winpilot/store';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

/**
 * 특허 및 인증 — **왼쪽에 갈래, 위에 검색, 아래에 표**.
 *
 * ## 왜 갈래를 왼쪽에 세우는가
 * 특허·인증·수상은 성격이 다르다. 특허를 확인하러 온 사람에게 수상 이력은 지나가는 줄일 뿐이고,
 * 그 반대도 마찬가지다. 갈래를 위에 탭으로 두면 한 번에 하나만 볼 수 있지만, **왼쪽에 세워
 * 두면 각 갈래가 몇 개인지가 고르기 전에 보인다** — 그 숫자만 보고 돌아가는 사람도 있다.
 *
 * ## 검색이 번호까지 훑는 이유
 * 여기 오는 사람의 절반은 **번호를 들고 온다.** 계약서나 제안서에 적힌 등록번호가 실제로 이
 * 회사 것인지 확인하러 오는 경우다. 이름만 훑으면 그 사람은 눈으로 표를 훑어야 한다.
 *
 * ## 총 n개를 적는다
 * 거른 뒤에 몇 개가 남았는지 적지 않으면, 빈 표를 봤을 때 **거른 탓인지 원래 없는 탓인지**
 * 알 수 없다.
 */
export function CredentialListView() {
  const [kind, setKind] = useState<Credential['kind'] | '전체'>('전체');
  const [keyword, setKeyword] = useState('');

  /** 갈래마다 몇 개인지. 고르기 전에 보여야 하므로 **거르기 전 전체**를 센다. */
  const counts = useMemo(() => {
    const box: Record<string, number> = { 전체: CREDENTIALS.length };
    for (const one of CREDENTIALS) box[one.kind] = (box[one.kind] ?? 0) + 1;
    return box;
  }, []);

  const rows = useMemo(() => {
    const word = keyword.trim().toLowerCase();

    return CREDENTIALS.filter((one) => {
      if (kind !== '전체' && one.kind !== kind) return false;
      if (!word) return true;
      /* 이름·번호·발급처 셋을 함께 훑는다 — 어느 것을 들고 왔든 걸리게. */
      return [one.title, one.number, one.issuer].some((value) => value.toLowerCase().includes(word));
    });
  }, [kind, keyword]);

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
      {/* 왼쪽 — 갈래. 좁은 화면에서는 가로로 눕는다(세로로 두면 표가 화면 밖으로 밀린다). */}
      <aside className="shrink-0 lg:w-52">
        <p className="mb-3 text-xs font-medium text-ink-faint">구분</p>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          {KINDS.map((one) => (
            <button
              key={one}
              type="button"
              onClick={() => setKind(one)}
              aria-current={one === kind}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                one === kind ? 'bg-surface font-semibold text-ink' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {one}
              <span className="font-mono text-xs tabular-nums text-ink-faint">{counts[one] ?? 0}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {/* 위 — 검색과 남은 개수. 한 줄에 두어 **거른 결과가 몇 개인지**가 검색어 옆에서 보인다. */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border px-3 py-2 sm:max-w-80">
            <Search aria-hidden className="size-4 shrink-0 text-ink-faint" strokeWidth={1.8} />
            <input
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="이름 · 번호 · 발급처"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
            />
            <span className="sr-only">특허·인증 검색</span>
          </label>

          <p className="shrink-0 text-sm text-ink-muted">
            총 <span className="font-mono tabular-nums text-ink">{rows.length}</span>개
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-xl border border-border px-6 py-12 text-center text-sm text-ink-muted">
            조건에 맞는 특허·인증이 없습니다.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            {/*
              머리 줄은 넓은 화면에서만 보인다. 좁은 화면에서는 한 줄이 카드처럼 접히는데, 그때
              머리 줄만 남으면 **어느 값이 어느 칸인지가 오히려 어긋난다.**
            */}
            <div className="hidden bg-surface px-5 py-3 text-xs font-medium text-ink-muted lg:grid lg:grid-cols-12 lg:gap-4">
              <span className="lg:col-span-1">구분</span>
              <span className="lg:col-span-5">이름</span>
              <span className="lg:col-span-3">번호</span>
              <span className="lg:col-span-2">발급</span>
              <span className="lg:col-span-1 lg:text-right">취득일</span>
            </div>

            <ul>
              {rows.map((one) => (
                <li
                  key={one.id}
                  className="flex flex-col gap-1 border-t border-border px-5 py-4 lg:grid lg:grid-cols-12 lg:items-center lg:gap-4"
                >
                  <span className="text-xs text-ink-muted lg:col-span-1">{one.kind}</span>
                  <span className="text-sm font-medium lg:col-span-5">{one.title}</span>
                  {/* 번호는 고정폭으로 — 자릿수가 눈으로 맞아야 다른 번호와 견줄 수 있다. */}
                  <span className="font-mono text-xs tabular-nums text-ink-muted lg:col-span-3">{one.number}</span>
                  <span className="text-xs text-ink-muted lg:col-span-2">{one.issuer}</span>
                  <span className="font-mono text-xs tabular-nums text-ink-muted lg:col-span-1 lg:text-right">
                    {one.acquiredAt}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/** 왼쪽에 서는 갈래. `전체` 를 맨 앞에 두는 것은 **되돌아오는 길**이기 때문이다. */
const KINDS: (Credential['kind'] | '전체')[] = ['전체', '특허', '인증', '수상'];
