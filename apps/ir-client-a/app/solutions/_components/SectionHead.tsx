/**
 * 절 제목 — **번호 · 한글 제목 · 한 줄**.
 *
 * 번호를 위에 세우는 이유: 절이 넷을 넘어가면 제목만으로는 어디까지 왔는지가 안 보인다.
 * 스크롤을 길게 내리는 화면에서 그 값이 크다.
 *
 * 한 줄 설명은 **그 칸이 무엇에 답하는지**를 적는다. 칸 이름만 두면 `시스템 구성` 이 무슨
 * 뜻인지를 표를 다 읽고 나서야 안다.
 *
 * 위에 선을 하나 긋는다. 칸과 칸 사이 여백만으로는 어디서 새 절이 시작하는지가 흐린데,
 * 절이 여럿이면 그 흐림이 여러 번 쌓인다.
 *
 * ## 왜 따로 파일을 갖나
 * 솔루션 상세 여섯(`OfferingDetail`)이 쓰던 것을 **솔루션 전체 화면(`/products`)이 함께
 * 쓴다.** 그 화면은 이제 헤더의 SOLUTION 을 눌렀을 때 닿는 첫 화면이라, 거기서 상세로
 * 넘어가는 동안 절 제목의 모양이 바뀌면 다른 사이트로 넘어간 것처럼 읽힌다.
 *
 * 상세 안에 두고 `export` 만 여는 방법도 있었다. 그러지 않은 이유: 그러면 화면 하나가
 * 다른 화면의 부품 창고가 되고, 다음 사람이 상세를 고칠 때 여기까지 딸려 오는지를 모른다.
 */
export function SectionHead({ no, title, lead }: { no: string; title: string; lead: string }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border pt-7">
      <span className="font-mono text-xs font-bold tabular-nums tracking-widest text-brand-700">{no}</span>
      <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">{title}</h2>
      <p className="max-w-2xl text-sm leading-relaxed text-ink-muted lg:text-base">{lead}</p>
    </div>
  );
}
