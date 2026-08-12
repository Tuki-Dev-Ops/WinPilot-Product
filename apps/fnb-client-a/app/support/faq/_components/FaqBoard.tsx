import { publicFnbFaqs } from '@winpilot/store';
import { FoldList } from '@/app/_components/FoldList';

/**
 * 고객센터의 자주 묻는 것 — **드시러 오시는 분 것만.**
 *
 * ## 누구인지를 고르게 하지 않는다
 * 한때 위에 `드시러 오신 분` · `차리려는 분` 둘을 놓고 고르게 했다. 뺐다 — 차리려는 분의 물음은
 * **창업 안내 아래에 자기 화면**(`/franchise/faq`)이 따로 있고, 거기에는 분류까지 서 있다.
 * 같은 것을 두 곳에서 다르게 보여 주면 어느 쪽이 다 있는 목록인지 알 수 없다.
 *
 * 고객센터는 이제 **드시러 오시는 분의 자리**다. 고르는 줄이 없어지면서 들어오자마자 물음이
 * 바로 선다 — 열에 아홉이 그쪽 사람이었으니 한 번의 고름을 없앤 셈이다.
 *
 * ## 접어 둔다
 * 왜 접고 왜 하나만 열리는지는 `FoldList` 머리말에 있다. 창업 문의 화면과 같은 것을 쓴다 —
 * 두 곳이 같은 동작을 해야 한 번 배운 사람이 다시 배우지 않는다.
 */
export function FaqBoard() {
  const faqs = publicFnbFaqs().filter((one) => one.audience === '손님');

  if (faqs.length === 0) {
    return (
      <p className="rounded-2xl border border-border px-6 py-16 text-center text-sm text-ink-muted">
        아직 올라온 질문이 없습니다.
      </p>
    );
  }

  return (
    <FoldList
      items={faqs.map((one) => ({
        id: one.id,
        head: <span className="text-sm font-medium">{one.question}</span>,
        body: <p className="text-sm leading-loose text-ink-muted">{one.answer}</p>,
      }))}
    />
  );
}
