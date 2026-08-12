/**
 * 화면 안 칸의 이름 — **브랜드색으로 작게.**
 *
 * 크게 두면 칸마다 제목이 화면 제목과 경쟁한다. 작되 색이 있으면 층은 낮은 채로 **여기서 칸이
 * 바뀐다**는 것만 말한다.
 *
 * 한때 흐린 회색이었다. 홈의 칸 머리와 화면 제목이 브랜드색 이름표를 갖게 되면서, 이 조각만
 * 회색으로 남아 **같은 자리에 서는 같은 것이 화면마다 다른 색**이 됐다.
 *
 * 인테리어 · 창업안내 두 화면이 이 한 벌을 쓴다. 화면마다 그리면 `tracking` 하나를 고칠 때
 * 두 곳을 같이 고쳐야 하는데, 두 화면을 나란히 열어 놓는 사람이 없어 어긋나면 어긋난 채로 남는다.
 */
export function SectionLabel({ children }: { children: string }) {
  return <p className="text-xs font-bold uppercase tracking-widest text-octo-700">{children}</p>;
}
