/**
 * 둘째 칸 — **문장 하나만.**
 *
 * ## 이 칸에는 이름표도 사진도 없다
 * 앞뒤가 이름표와 사진, 카드로 빽빽한 칸이라 여기서 한 번 비운다. 회사 소개에서 이 자리는
 * **읽히려고 있는 것이 아니라 숨을 쉬려고** 있다 — 눈이 한 번 멈추고 나면 다음 칸의 사진이
 * 새로 시작하는 것으로 보인다.
 *
 * 채우면 어떻게 되는지는 이미 봤다. 사진 · 카드 · 격자가 흰 바탕 위로 끝없이 이어지면
 * 어디까지가 한 이야기인지가 사라진다.
 *
 * ## 줄을 배열로 받는다
 * 브라우저가 접게 두면 화면 너비마다 접히는 자리가 달라, 세 줄로 쓴 문장이 넓은 화면에서는
 * 두 줄이 되고 그때 **문장이 나뉜 뜻**이 사라진다. 여기서는 줄 나눔이 곧 뜻이다.
 */
export function Manifesto({ lines }: { lines: string[] }) {
  return (
    <section className="border-t border-border py-16 lg:py-28">
      <p className="flex flex-col gap-2 text-2xl font-bold leading-[1.45] tracking-tight lg:gap-3 lg:text-[2.25rem]">
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>
    </section>
  );
}
