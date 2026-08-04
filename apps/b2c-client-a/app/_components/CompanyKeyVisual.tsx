/**
 * 회사 소개 대표 이미지 — **어드민에서 등록한 사진이 놓이는 자리**.
 *
 * 값은 `b2c-admin` 회사 > 회사 소개의 **대표 이미지** 업로드에서 온다(store `heroImageUrl`).
 * 템플릿이 그림을 지어내지 않는 이유는, 그러면 운영자가 사진을 올리기 전까지 화면에 있는 것이
 * 무엇인지(회사가 정한 것인지 템플릿이 그린 것인지) 알 수 없기 때문이다.
 *
 * 등록 전에는 **자리표시자만** 둔다. 비워 두면 아래 소개 글이 위로 붙어 배치가 달라지고,
 * 사진을 올렸을 때 화면이 통째로 밀린다 — 자리는 늘 같은 크기로 잡아 둔다.
 *
 * 비율은 21:9 다. 배너와 같은 규격이라 운영자가 쓰던 원본을 그대로 쓸 수 있다.
 *
 * ## 어드민 연동
 * - 사진 ← `b2c-admin` 회사 > 회사 소개 (`/company/about`) 의 **대표 이미지** (한 장)
 */
export function CompanyKeyVisual({ imageUrl }: { imageUrl: string }) {
  if (!imageUrl) {
    return (
      <div
        className="flex aspect-[21/9] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface"
        role="img"
        aria-label="등록된 대표 이미지가 없습니다"
      >
        {/* 자리표시자 그림은 선으로만 — 색을 채우면 진짜 사진이 들어간 것처럼 보인다. */}
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-ink-faint">
          <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
          <circle cx="8.5" cy="10" r="1.4" />
          <path d="M4 16.5 9.5 12l3.5 3 2.5-2 4.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm text-ink-faint">등록된 대표 이미지가 없습니다</p>
      </div>
    );
  }

  return (
    <figure className="aspect-[21/9] w-full overflow-hidden rounded-xl bg-surface">
      {/* 어드민이 올린 사진은 objectURL 일 수 있어 next/image 최적화 대상이 아니다. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="" className="size-full object-cover" />
    </figure>
  );
}
