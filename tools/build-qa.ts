import { writeFileSync } from 'node:fs';
import type { Screen } from './lib/screens';
import type { DocProject } from './lib/doc-project';
import { PROJECTS } from './lib/projects';
import { condition, handlingOf, kindIn } from './lib/action-kind';
import { esc, rich } from './lib/html';
import { formal, formalAction } from './lib/polite';
import { shell } from './lib/page';

/**
 * **QA 시나리오** — 화면을 실제로 열어 놓고 한 줄씩 판정하는 문서.
 *
 * ## 다른 문서와 무엇이 다른가
 * 기능 명세서에도 검수 기준이 있다. 그러나 그것은 **읽는 문서**라, 검수하는 사람이 종이에
 * 표시하고 그 종이를 다시 옮겨 적어야 한다. 옮겨 적는 사이에 빠지는 것이 생긴다.
 *
 * 이 문서는 **브라우저에서 그대로 쓰는 문서**다 — 화면 주소를 눌러 실제 앱을 열고, 그 자리에서
 * PASS · FAIL 을 누르고 메모를 적는다. 적은 것은 브라우저에 남아 새로 고쳐도 지워지지 않으며,
 * 인쇄하면 표시한 결과가 그대로 찍힌 PDF 가 된다.
 *
 * ## 왜 주소를 문서에 박는가
 * 검수는 화면과 문서를 번갈아 보는 일이다. 화면 이름만 적혀 있으면 검수자가 주소를 직접
 * 찾아 들어가야 하고, 목록 화면과 상세 화면처럼 이름이 비슷한 자리에서 엉뚱한 화면을 보게
 * 된다. **주소를 눌러 여는 것**이 그 실수를 없앤다.
 *
 * 주소의 앞부분은 문서 머리에서 고칠 수 있게 둔다 — 개발 · 스테이징 · 운영이 다르기 때문이다.
 *
 * ## 판정 결과를 어디에 두는가
 * 서버가 없으므로 브라우저의 저장소에 둔다. 문서마다 열쇠를 달리해 F&B 검수와 IR 검수가
 * 서로를 덮지 않게 한다. **한 사람의 한 브라우저 안에서만 유지된다** — 여럿이 나눠 검수하면
 * 각자 인쇄해 합쳐야 하고, 그 사실을 문서 머리에 적어 둔다.
 *
 * ```
 * pnpm qa:build
 * ```
 */

/** 개발 서버 주소. 검수자가 문서 머리에서 고칠 수 있고, 고친 값은 브라우저에 남는다. */
const PORT: Record<string, { client: string; admin: string }> = {
  FnB: { client: 'http://localhost:3305', admin: 'http://localhost:3306' },
  IR: { client: 'http://localhost:3304', admin: 'http://localhost:3303' },
};

type Case = { kind: string; given: string; when: string; then: string; why: string };

/**
 * 검수자가 읽는 고정 문구. 문서 전체가 합쇼체인데 여기만 해라체로 두었더니, 한 줄 안에서
 * 전제는 `연다` 이고 결과는 `표시됩니다` 가 되어 두 사람이 쓴 글처럼 읽혔다.
 */
const STEP = {
  open: (name: string) => `${name} 화면을 엽니다.`,
  look: '화면을 확인합니다.',
  lookWhen: '해당 조건에서 화면을 확인합니다.',
  fill: '입력 양식에 값을 채웁니다.',
  submit: '저장 또는 전송을 실행합니다.',
};

/**
 * 조회 기능의 기대 결과.
 *
 * 유형에서 끌어낸 결과는 `사용자가 값을 확인한다` 인데, 이것은 **판정할 수 없는 문장**이다 —
 * 확인은 검수자가 하는 일이지 화면이 하는 일이 아니라, PASS 와 FAIL 을 가르는 기준이 서지
 * 않는다. 검수 문서에서만 화면이 하는 일로 바꿔 적는다. 기능 명세서 쪽은 건드리지 않는다.
 */
const SHOW_RESULT = '해당 값이 화면에 표시된다';

/**
 * 기대 결과에서 **판정 기준**과 **그렇게 정한 까닭**을 가른다.
 *
 * 화면 명세의 제약은 규칙을 먼저 적고 까닭을 뒤에 붙인다 — `준비중 매장은 번호 자리에 여는
 * 달을 적는다. 없는 번호를 적어 두면 그리로 전화가 간다.` 뒷문장은 읽을 값이지 누를 값이
 * 아니다. 한 칸에 같은 크기로 두면 검수자가 **무엇을 보고 PASS 를 눌러야 하는지**가 흐려진다.
 *
 * 그렇다고 버리지는 않는다. 뒷문장에는 `이미 열린 것을 다시 누르면 닫힌다` 처럼 실제로 확인할
 * 것이 섞여 있어, 지우면 검수 항목이 사라진다. 자리를 아래로 내리고 흐리게 둘 뿐이다.
 */
const reason = (then: string): { head: string; rest: string } => {
  const [head, ...rest] = then.split(/(?<=[.!?])\s+/).filter(Boolean);
  return { head: head ?? then, rest: rest.join(' ') };
};

/**
 * 화면 하나의 검수 항목.
 *
 * 셋에서 뽑는다 — **기능**(정상 흐름) · **제약**(조건이 붙은 예외) · **입력 검증**. 셋을 갈래로
 * 표시하는 것은 검수 순서가 다르기 때문이다. 정상 흐름을 먼저 확인하지 않고 예외부터 보면
 * 무엇이 잘못된 것인지 가릴 수 없다.
 */
const casesOf = (screen: Screen): Case[] => {
  const buttons = screen.spec.buttons ?? [];

  const normal = screen.spec.actions.map((action) => {
    const kind = kindIn(action, screen.route, screen.readOnly);
    const button = buttons.find((one) => action.includes(one.label));
    const result = handlingOf(kind);
    return {
      kind: '정상',
      given: STEP.open(screen.name),
      when: formalAction(action),
      then: formal(button?.onSuccess ?? (kind === '표시' ? SHOW_RESULT : result.result)),
      why: '',
    };
  });

  const split = (one: string, kind: string, given: string, when: string) => {
    const parted = condition(one);
    const { head, rest } = reason(parted.then);
    return {
      kind,
      given: parted.when ? formal(parted.when) : given,
      when: parted.when ? STEP.lookWhen : when,
      then: formal(head),
      why: rest ? formal(rest) : '',
    };
  };

  return [
    ...normal,
    ...screen.spec.guards.map((one) => split(one, '예외', STEP.open(screen.name), STEP.look)),
    ...(screen.spec.validations ?? []).map((one) => split(one, '검증', STEP.fill, STEP.submit)),
  ];
};

const EXTRA = `
  /* 검수자가 눌러 쓰는 문서라 화면에서 먼저 읽히고, 인쇄하면 표시한 결과가 그대로 찍힌다. */
  .bar {
    position: sticky;
    top: 0;
    z-index: 5;
    background: #fff;
    border: 1px solid var(--line);
    padding: 8px 10px;
    margin-bottom: 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    align-items: center;
    font-size: 9pt;
  }
  .bar label { color: var(--muted); }
  .bar input {
    font: inherit;
    border: 1px solid var(--line);
    border-radius: 3px;
    padding: 3px 6px;
    color: var(--ink);
  }
  .bar input.url { width: 180px; font-family: "Consolas", "D2Coding", ui-monospace, monospace; font-size: 8.5pt; }
  .bar .count { margin-left: auto; font-variant-numeric: tabular-nums; }
  .bar .count b { margin-left: 8px; }
  .bar button {
    font: inherit;
    border: 1px solid var(--line);
    background: var(--head);
    border-radius: 3px;
    padding: 4px 10px;
    cursor: pointer;
  }

  h3.screen {
    display: flex;
    align-items: baseline;
    gap: 10px;
    border-bottom: 1.6px solid var(--ink);
    color: var(--ink);
  }
  h3.screen .fid {
    background: var(--ink);
    color: #fff;
    font-family: "Consolas", "D2Coding", ui-monospace, monospace;
    font-size: 8.5pt;
    padding: 1px 6px;
    border-radius: 3px;
  }
  h3.screen a { font-size: 8.5pt; font-family: "Consolas", "D2Coding", ui-monospace, monospace; }
  h3.screen .add { margin-left: auto; font-size: 8.5pt; cursor: pointer; border: 1px solid var(--line); background: var(--head); border-radius: 3px; padding: 2px 8px; }

  table.qa td.tc { font-family: "Consolas", "D2Coding", ui-monospace, monospace; font-size: 8pt; color: var(--faint); white-space: nowrap; }
  table.qa td.kind { text-align: center; color: var(--muted); white-space: nowrap; }
  table.qa td.judge { text-align: center; white-space: nowrap; }
  /* 판정 기준 아래에 까닭. 흐리게 두어 무엇을 보고 누를지가 먼저 읽히게 한다. */
  table.qa .why { margin-top: 3px; color: var(--faint); font-size: 8pt; }

  /* 판정 단추 셋. 고른 것만 색이 차므로 인쇄해도 무엇을 골랐는지 남는다. */
  .j {
    font: inherit;
    font-size: 8pt;
    border: 1px solid var(--line);
    background: #fff;
    color: var(--muted);
    border-radius: 3px;
    padding: 2px 7px;
    margin: 0 1px;
    cursor: pointer;
  }
  .j[aria-pressed='true'][data-v='PASS'] { background: #1b5fc4; border-color: #1b5fc4; color: #fff; }
  .j[aria-pressed='true'][data-v='FAIL'] { background: #c4341b; border-color: #c4341b; color: #fff; }
  .j[aria-pressed='true'][data-v='N/A'] { background: #6b7280; border-color: #6b7280; color: #fff; }

  .memo-in {
    font: inherit;
    width: 100%;
    min-height: 20px;
    border: 1px dashed var(--line);
    border-radius: 3px;
    padding: 2px 4px;
    background: #fff;
  }
  .memo-in:empty::before { content: '기록'; color: var(--faint); }

  tr.added td { background: #fffdf5; }

  @media print {
    .bar { position: static; }
    .bar button, h3.screen .add { display: none; }
    .bar input { border: none; border-bottom: 1px solid var(--line); }
    /* 고르지 않은 단추는 인쇄하지 않는다 — 종이에서는 고른 것만 뜻이 있다. */
    .j { display: none; }
    .j[aria-pressed='true'] { display: inline-block; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .judge:not(:has(.j[aria-pressed='true']))::after { content: '☐ 미실행'; color: var(--faint); font-size: 8pt; }
    .memo-in { border: none; }
    .memo-in:empty::before { content: ''; }
  }
`;

/**
 * 브라우저에서 도는 부분.
 *
 * 서버가 없으므로 판정과 메모는 `localStorage` 에 둔다. 열쇠에 문서 이름을 넣어 F&B 검수와
 * IR 검수가 서로를 덮지 않게 한다.
 *
 * 주소 앞부분을 바꾸면 이미 그려진 링크를 전부 다시 쓴다 — 개발에서 확인하고 스테이징에서
 * 다시 확인하는 일이 실제로 잦고, 그때 문서를 새로 만들게 하면 표시한 결과가 사라진다.
 *
 * ## 손으로 더한 행도 남긴다
 * 처음에는 판정과 메모만 저장했다. 그러면 검수자가 `+ 항목 추가` 로 세운 행은 새로고침 한 번에
 * 사라진다 — **적어 둔 내용은 열쇠에 남아 있는데 그것을 담을 행이 없어서** 화면에서만 없어지는,
 * 가장 나쁜 모양의 유실이었다. 지금은 표별로 더한 행 수를 함께 두고, 문서를 열 때 그 수만큼
 * 다시 세운 뒤에 값을 채운다.
 */
const SCRIPT = (key: string, client: string, admin: string) => `
<script>
(() => {
  const KEY = ${JSON.stringify(`qa:${key}`)};
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { return {}; } };
  const state = load();
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));

  const bases = { client: state.__client ?? ${JSON.stringify(client)}, admin: state.__admin ?? ${JSON.stringify(admin)} };

  const paint = () => {
    for (const a of document.querySelectorAll('a[data-path]')) {
      a.href = bases[a.dataset.app] + a.dataset.path;
    }
  };

  /* 표별로 손으로 더한 행이 몇인지. 값과 달리 행은 스스로 서지 못해 수를 따로 둔다. */
  const added = state.__added ?? {};

  const grow = (feature, n) => {
    const body = document.querySelector('table[data-for="' + feature + '"] tbody');
    if (!body) return null;
    const tr = document.createElement('tr');
    tr.className = 'added';
    tr.dataset.tc = feature + '-X' + n;
    tr.innerHTML = '<td class="tc">' + tr.dataset.tc + '</td><td class="kind">추가</td>'
      + ['given', 'when', 'then'].map((f) => '<td><div class="memo-in" contenteditable data-f="' + f + '"></div></td>').join('')
      + '<td class="judge">' + ['PASS', 'FAIL', 'N/A'].map((v) => '<button class="j" data-v="' + v + '" aria-pressed="false">' + v + '</button>').join('') + '</td>'
      + '<td><div class="memo-in" contenteditable></div></td>';
    body.append(tr);
    return tr;
  };

  const count = () => {
    const rows = [...document.querySelectorAll('tr[data-tc]')];
    const of = (v) => rows.filter((r) => state[r.dataset.tc]?.v === v).length;
    const el = document.querySelector('#count');
    if (el) el.innerHTML = '전체 <b>' + rows.length + '</b> · PASS <b>' + of('PASS') + '</b> · FAIL <b>' + of('FAIL') + '</b> · N/A <b>' + of('N/A') + '</b> · 미실행 <b>' + (rows.length - of('PASS') - of('FAIL') - of('N/A')) + '</b>';
  };

  const restore = () => {
    for (const [feature, n] of Object.entries(added)) {
      for (let i = 1; i <= n; i += 1) grow(feature, i);
    }
    for (const row of document.querySelectorAll('tr[data-tc]')) {
      const kept = state[row.dataset.tc];
      if (!kept) continue;
      for (const b of row.querySelectorAll('.j')) b.setAttribute('aria-pressed', String(b.dataset.v === kept.v));
      for (const memo of row.querySelectorAll('.memo-in')) {
        const value = kept[memo.dataset.f ?? 'm'];
        if (value) memo.textContent = value;
      }
    }
    count();
  };

  document.addEventListener('click', (e) => {
    const b = e.target.closest('.j');
    if (b) {
      const row = b.closest('tr');
      const id = row.dataset.tc;
      const on = b.getAttribute('aria-pressed') === 'true';
      for (const each of row.querySelectorAll('.j')) each.setAttribute('aria-pressed', 'false');
      if (!on) b.setAttribute('aria-pressed', 'true');
      state[id] = { ...(state[id] ?? {}), v: on ? '' : b.dataset.v };
      save();
      count();
      return;
    }

    const add = e.target.closest('.add');
    if (add) {
      const feature = add.dataset.for;
      const n = (added[feature] ?? 0) + 1;
      added[feature] = n;
      state.__added = added;
      save();
      grow(feature, n);
      count();
      return;
    }

    if (e.target.closest('#print')) window.print();
    if (e.target.closest('#reset') && confirm('표시한 판정과 메모를 모두 지웁니다. 계속할까요?')) {
      localStorage.removeItem(KEY);
      location.reload();
    }
  });

  document.addEventListener('input', (e) => {
    const box = e.target.closest('.memo-in');
    if (box) {
      const row = box.closest('tr');
      const id = row.dataset.tc;
      const field = box.dataset.f ?? 'm';
      state[id] = { ...(state[id] ?? {}), [field]: box.textContent };
      save();
      return;
    }
    const url = e.target.closest('input.url');
    if (url) {
      bases[url.dataset.app] = url.value;
      state['__' + url.dataset.app] = url.value;
      save();
      paint();
      return;
    }
    const head = e.target.closest('.bar input:not(.url)');
    if (head) {
      state['__' + head.dataset.k] = head.value;
      save();
    }
  });

  for (const input of document.querySelectorAll('.bar input')) {
    const k = input.classList.contains('url') ? '__' + input.dataset.app : '__' + input.dataset.k;
    if (state[k]) input.value = state[k];
  }
  paint();
  restore();
})();
</script>
`;

export const buildQa = (p: DocProject): string => {
  const base = PORT[p.slug] ?? { client: 'http://localhost:3000', admin: 'http://localhost:3001' };
  let total = 0;

  const blocks = p.screens
    .map((screen) => {
      const list = casesOf(screen);
      total += list.length;

      const rows = list
        .map((one, index) => {
          const id = `${screen.featureId}-${String(index + 1).padStart(2, '0')}`;
          const judge = ['PASS', 'FAIL', 'N/A']
            .map((v) => `<button class="j" data-v="${v}" aria-pressed="false">${v}</button>`)
            .join('');
          return `<tr data-tc="${esc(id)}">
  <td class="tc">${esc(id)}</td>
  <td class="kind">${esc(one.kind)}</td>
  <td>${rich(one.given)}</td>
  <td>${rich(one.when)}</td>
  <td>${rich(one.then)}${one.why ? `<div class="why">${rich(one.why)}</div>` : ''}</td>
  <td class="judge">${judge}</td>
  <td><div class="memo-in" contenteditable></div></td>
</tr>`;
        })
        .join('');

      /* 동적 자리가 있는 주소는 그대로 열리지 않는다. 검수자가 목록에서 한 건을 골라 들어가야 한다. */
      const dynamic = screen.route.includes('[');
      const link = dynamic
        ? `<span class="none">${esc(screen.route)} — 목록에서 한 건을 선택해 진입</span>`
        : `<a data-app="${screen.app}" data-path="${esc(screen.route)}" target="_blank" rel="noreferrer">${esc(screen.route)}</a>`;

      return `<h3 class="screen"><span class="fid">${esc(screen.featureId)}</span> ${esc(screen.name)} ${link}
  <button class="add" data-for="${esc(screen.featureId)}">+ 항목 추가</button></h3>
<table class="qa" data-for="${esc(screen.featureId)}">
  <thead><tr>
    <th style="width:86px">TC ID</th>
    <th style="width:50px">구분</th>
    <th style="width:210px">전제 조건</th>
    <th style="width:210px">수행 절차</th>
    <th>기대 결과</th>
    <th style="width:126px">판정</th>
    <th style="width:150px">비고 · 결함</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>`;
    })
    .join('');

  const body = `
<div class="bar">
  <label>검수자 <input data-k="tester" size="8"></label>
  <label>검수일 <input data-k="date" size="10" placeholder="YYYY-MM-DD"></label>
  <label>${esc(p.clientLabel)} <input class="url" data-app="client" value="${esc(base.client)}"></label>
  <label>${esc(p.adminLabel)} <input class="url" data-app="admin" value="${esc(base.admin)}"></label>
  <button id="print">PDF 로 인쇄</button>
  <button id="reset">판정 지우기</button>
  <span class="count" id="count"></span>
</div>

<p class="lead">
  화면 주소를 누르면 실제 앱이 새 탭에서 열린다. 그 화면을 보며 <strong>PASS · FAIL · N/A</strong> 를
  고르고 결함은 비고에 적는다. 표시한 값은 <strong>이 브라우저에만</strong> 남으므로, 여럿이 나눠
  검수하면 각자 인쇄해 합친다. 주소 앞부분은 위에서 바꿀 수 있다 — 개발 · 스테이징 · 운영이 다르다.
</p>

${blocks}
${SCRIPT(p.slug, base.client, base.admin)}
`;

  const file = `${p.slug}-QA시나리오.html`;
  writeFileSync(
    file,
    shell({ title: 'QA 시나리오', kind: '검수 · 판정', brand: p.brand, body, extra: EXTRA }),
    'utf8',
  );
  return `${file} — 화면 ${p.screens.length} · 검수 항목 ${total}`;
};

if (process.argv[1]?.endsWith('build-qa.ts')) {
  for (const project of PROJECTS) console.log(buildQa(project));
}
